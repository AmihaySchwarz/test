import * as React from "react";
import styles from "../QnAForm/QnAForm.module.scss";
import { IQnADisplayFormProps, IQnADisplayFormState } from "./IQnADisplayFormProps";
import { LoadingSpinner } from "../../../common/components/LoadingSpinner";
import { ViewType } from "../../../common/enum";
import ReactTable from "react-table";
import "react-table/react-table.css";
import { Pagination } from "../Pagination/Pagination";
import { DefaultButton, IconButton, IButtonProps } from "office-ui-fabric-react/lib/Button";
import {
  Dropdown,
  IDropdownOption
} from "office-ui-fabric-react/lib/Dropdown";
import Moment from "react-moment";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import * as _ from "lodash";
import ReactHtmlParser, { processNodes, convertNodeToElement, htmlparser2 } from 'react-html-parser';
import * as moment from 'moment'; 
import 'moment-timezone';


export class QnADisplayForm extends React.Component<IQnADisplayFormProps, IQnADisplayFormState> {
  constructor(props) {
    super(props);
    //console.log(props);
    this.state = {
      division: [],
      selectedDivision: undefined,
      selectedDivisionText: "",
      selectedDivisionListName: "",
      qnaItems: [],
      isLoading: false,
      formView: ViewType.Display,
      newQuestions: [],
      listTrackingItem: undefined,
      currentUser: props.currentUser,
      qnaActionHistory: [],
      qnaOriginalCopy: [],
      searchNewq: "",
      searchQnA: "",
      resolvedQuestions: [],
      showResolvedQuestions: false,
      searchedQnA: [],
      searchedNewq: []
    };

    this.changeToEdit = this.changeToEdit.bind(this);
    this.changeToPublish = this.changeToPublish.bind(this);
    this.showResolvedQuestions = this.showResolvedQuestions.bind(this);
    this.hideResolveQuestions = this.hideResolveQuestions.bind(this);
    this.searchQnAValues = this.searchQnAValues.bind(this);
    this.searchQnAValuesKeyPress = this.searchQnAValuesKeyPress.bind(this);
    this.searchNewqValues = this.searchNewqValues.bind(this);
    this.searchNewqValuesKeyPress = this.searchNewqValuesKeyPress.bind(this);
  }

  public componentWillReceiveProps(newProps): void {
    if (
      newProps.masterItems.length !== 0 
    ) {
      this.setState({
        qnaItems: newProps.qnaItems,
        newQuestions: newProps.newQuestions,
        currentUser: newProps.currentUser,
        division: newProps.masterItems,
        selectedDivision: newProps.defaultDivision,
        selectedDivisionText: newProps.defaultDivision.text,
        selectedDivisionListName: newProps.defaultDivision.key,
        qnaOriginalCopy: newProps.qnaOriginalCopy
      });

      this.loadQnAListData(newProps.defaultDivision.key);
    }
  }

  public componentDidMount(): void {
    console.log(this.props, "did mount");
    if (
        this.props.masterItems.length !== 0
      ) {
        this.setState({
          newQuestions: this.props.newQuestions,
          currentUser: this.props.currentUser,
          division: this.props.masterItems,
          selectedDivision: this.props.defaultDivision,
          selectedDivisionText: this.props.defaultDivision.text,
          selectedDivisionListName: this.props.defaultDivision.key,
          //qnaActionHistory: this.props.qnaActionHistory,
          qnaOriginalCopy: this.props.qnaOriginalCopy
        });
  
        this.loadQnAListData(this.props.defaultDivision.key);
        this.loadNewQuestionsData(this.props.defaultDivision.text);
      }
  }

  public async loadQnAListData(divisionListName: string): Promise<void> {
    this.setState({
      qnaItems: await this.props.actionHandler.getQnAItems(
        divisionListName,
        this.props.properties.webUrl
      ),
      isLoading: false
    });
  }

  public async loadNewQuestionsData(division: string): Promise<void> {
    let newQuestionItems = await this.props.actionHandler.getNewQuestions(
      this.props.properties.endpointUrl, 
      division
    );
    //console.log(newQuestionItems);
    this.setState({
      newQuestions: newQuestionItems.filter(nq => nq.Status !== "Resolved"),
      resolvedQuestions: newQuestionItems.filter(nq => nq.Status === "Resolved"),
      isLoading: false
    });
  }
  public setDivisionDD = (item: IDropdownOption): void => {
    this.setState({
      isLoading: true,
      selectedDivision: item,
      selectedDivisionText: item.text,
      selectedDivisionListName: item.key.toString()
    });
    this.loadQnAListData(item.key.toString());
    this.loadNewQuestionsData(item.text.toString());
    this.props.onDivisionSet(item);
  }

  public async changeToEdit(): Promise<void> {
    //CREATE A COPY OF QNAITEMS ORIGINAL
    
    this.setState(oldstate => ({
      qnaOriginalCopy: [...oldstate.qnaItems],
      isLoading: true
    }));

    this.props.actionHandler
      .checkLockStatus(
        this.state.currentUser,
        this.state.selectedDivisionText,
        this.props.properties.qnATrackingListName
      )
      .then(items => {
        this.setState({
          listTrackingItem: items[0],
        });

        let currentUserEmail = this.state.currentUser.Email;
        let currentUserTitle = this.state.currentUser.Title;
        console.log(items[0], "list tracking");
        console.log(this.state.currentUser);
        //check if current is less than 15 min from release time
        //if yes , is lockedby empty? yes = can edit ; no = cannot edit
        //if no, (current time is greater than 15 min)
        //check if lockedby empty? yes = can edit; no = remove the lockedby then lock to current user
      //  let testDate = items[0].LockedReleaseTime.toLocaleDateString();
        let dateTimeToday = moment(moment().local().format());
        let lockReleaseTime = moment(items[0].LockedReleaseTime).local().format();
        let minDiffDuration = moment.duration(dateTimeToday.diff(lockReleaseTime));
        let minutes = minDiffDuration.asMinutes();

        console.log(minutes, "DIFFERENCE");

        if (minutes < parseInt(this.props.properties.lockTiming, 10) ) {
          if(items[0].LockedBy == undefined) {
            // user can edit it. call lockList()
            this.lockList();
          } else {
            // user cannot edit; toaster to say that it is still locked.
            if (
              this.state.listTrackingItem.LockedBy.Title !== currentUserTitle &&
              this.state.listTrackingItem.LockedBy.Title
            ) {
              toast.info("Item is locked by: " + this.state.listTrackingItem.LockedBy.Title);
              this.setState({
                isLoading: false
              });
            } else {
              this.lockList();
            }
          }
        } else {
          if(items[0].LockedBy == undefined) {
            // user can edit it. call lockList()
            this.lockList();
          } else {
            // remove the lockedBy from sp list then call lockList();
            //commented out since its redundant
            // this.props.actionHandler
            // .removeLockedBy(
            //   this.state.currentUser,
            //   this.state.selectedDivisionText,
            //   this.props.properties.qnATrackingListName
            // ).then(() => {
              this.lockList();
            //});
          }
        }

        // if(items[0].LockedBy == undefined) {
        //   this.lockList();
        // } else {
        //   if (
        //     this.state.listTrackingItem.LockedBy.EMail !== currentUserEmail &&
        //     this.state.listTrackingItem.LockedBy.EMail
        //   ) {
        //     toast.info("Item is locked by: " + this.state.listTrackingItem.LockedBy.EMail);
        //     this.setState({
        //       isLoading: false
        //     });
        //   } else {
        //     //item is not locked
        //     //get qna action history, if it has laman add to current state
        //     this.lockList();
        //   }
        // }
      });
  }

  public lockList() {
    if((this.state.listTrackingItem.qnaPublishString != undefined) ||
    (this.state.listTrackingItem.qnaPublishString != null)) {
      this.setState({
        qnaActionHistory: JSON.parse(this.state.listTrackingItem.qnaPublishString)
      });
    } else {
      this.setState({
        qnaActionHistory: []
      });
    }

    this.props.actionHandler
      .lockList(
        this.state.currentUser,
        this.state.selectedDivisionText,
        this.props.properties.qnATrackingListName
      )
      .then(res => {
        //console.log(res);
        if (res.data == undefined) {
          //alert user if lock fail then refresh data
          //console.log("failed to lock the item");
          toast.error("Failed to lock item");
          this.setState({
            isLoading: false
          });
        } else {
          // console.log(this.state.selectedDivision);
          this.setState({
            formView: ViewType.Edit,
            isLoading: false
          });
          //pass state of newQuestions, qnaItems, selected Division
          this.props.onEditClick(this.state.selectedDivision, 
            this.state.qnaItems, 
            this.state.newQuestions, 
            this.state.qnaOriginalCopy, 
            this.state.qnaActionHistory);
        }
      });
  }

  public lockListPublish() {
    this.props.actionHandler
            .lockList(
              this.state.currentUser,
              this.state.selectedDivisionText,
              this.props.properties.qnATrackingListName
            )
            .then(res => {
              //console.log(res);
              if (res.data == undefined) {
                //alert user if lock fail then refresh data
                toast.error("Failed to lock item");
                this.setState({
                  isLoading: false
                });
              } else {
                this.setState({
                  formView: ViewType.Publish,
                  selectedDivision: this.state.selectedDivision,
                  isLoading: false
                });
                //pass state of selectedDiv, qnaHsitory
                this.props.onPublishClick(this.state.selectedDivision, 
                  this.state.qnaActionHistory, 
                  this.state.qnaOriginalCopy);
              }
            });
  }

  public changeToPublish(): void {
    this.setState({isLoading: true});

    // this.props.actionHandler
    //   .checkLockStatus(
    //     this.state.currentUser,
    //     this.state.selectedDivisionText,
    //     this.props.properties.qnATrackingListName
    //   )
    //   .then(items => {
    //     this.setState({
    //       listTrackingItem: items[0],
    //       qnaActionHistory: JSON.parse(items[0].qnaPublishString),
    //       qnaOriginalCopy: JSON.parse(items[0].qnaOriginalCopy)
    //     });
    //     let currentUserEmail = this.state.currentUser.Email;

    //     if(items[0].LockedBy == undefined) {
    //       this.lockListPublish();
    //     } else {
    //       if (
    //         this.state.listTrackingItem.LockedBy.EMail !== currentUserEmail &&
    //         this.state.listTrackingItem.LockedBy.EMail
    //       ) {
    //         toast.info("Item is locked by: " + this.state.listTrackingItem.LockedBy.EMail);
    //         this.setState({
    //           isLoading: false
    //         });
    //       } else {
    //         //item is not locked
    //         //get qna action history, if it has laman add to current state
    //         this.lockListPublish();
    //       }
    //     }
    //   });

    this.props.actionHandler
    .checkLockStatus(
      this.state.currentUser,
      this.state.selectedDivisionText,
      this.props.properties.qnATrackingListName
    )
    .then(items => {
      this.setState({
        listTrackingItem: items[0],
        qnaActionHistory: JSON.parse(items[0].qnaPublishString),
        qnaOriginalCopy: JSON.parse(items[0].qnaOriginalCopy)
      });

      let currentUserEmail = this.state.currentUser.Email;
      let currentUserTitle = this.state.currentUser.Title;
      console.log(items[0], "list tracking");
      //check if current is less than 15 min from release time
      //if yes , is lockedby empty? yes = can edit ; no = cannot edit
      //if no, (current time is greater than 15 min)
      //check if lockedby empty? yes = can edit; no = remove the lockedby then lock to current user
    //  let testDate = items[0].LockedReleaseTime.toLocaleDateString();
      let dateTimeToday = moment(moment().local().format());
      let lockReleaseTime = moment(items[0].LockedReleaseTime).local().format();
      let minDiffDuration = moment.duration(dateTimeToday.diff(lockReleaseTime));
      let minutes = minDiffDuration.asMinutes();

      console.log(minutes, "DIFFERENCE");

      if (minutes <  parseInt(this.props.properties.lockTiming, 10) ) {
        if(items[0].LockedBy == undefined) {
          // user can edit it. call lockList()
          this.lockListPublish();
        } else {
          // user cannot edit; toaster to say that it is still locked.
          // toast.info("Item is locked by: " + this.state.listTrackingItem.LockedBy.EMail);
          // this.setState({
          //   isLoading: false
          // });

          if (
            this.state.listTrackingItem.LockedBy.Title !== currentUserTitle &&
            this.state.listTrackingItem.LockedBy.Title
          ) {
            toast.info("Item is locked by: " + this.state.listTrackingItem.LockedBy.Title);
            this.setState({
              isLoading: false
            });
          } else {
            this.lockListPublish();
          }

        }
      } else {
        if(items[0].LockedBy == undefined) {
          // user can edit it. call lockList()
          this.lockListPublish();
        } else {
          // remove the lockedBy from sp list then call lockList();
          //commented out since its redundant
          //this.props.actionHandler
          // .removeLockedBy(
          //   this.state.currentUser,
          //   this.state.selectedDivisionText,
          //   this.props.properties.qnATrackingListName
          // ).then(() => {
            this.lockListPublish();
          //});
        }
      }

      // if(items[0].LockedBy == undefined) {
      //   this.lockListPublish();
      // } else {
      //   if (
      //     this.state.listTrackingItem.LockedBy.EMail !== currentUserEmail &&
      //     this.state.listTrackingItem.LockedBy.EMail
      //   ) {
      //     toast.info("Item is locked by: " + this.state.listTrackingItem.LockedBy.EMail);
      //     this.setState({
      //       isLoading: false
      //     });
      //   } else {
      //     //item is not locked
      //     //get qna action history, if it has laman add to current state
      //     this.lockListPublish();
      //   }
      // }
    });

  }
  public renderQuestionsDisplay(cellInfo) {
    let parsedQ = JSON.parse(cellInfo.original.Questions);
    return parsedQ.map(question => {
      return (
        <div>
          <span style={{ border: "#000" }}> {question.label} </span>
        </div>
      );
    });
  }

  public renderAnswerDisplay(cellInfo) {
    //console.log(cellInfo.original.Answer);
    let html = cellInfo.original.Answer;
    return (
      <div className={styles.answerDisplay}> {ReactHtmlParser(html)}</div>
    );
  }

  // public renderQuestionsPublish(cellInfo) {
  //   //console.log(cellInfo.original.qnaItem.Questions);
  //   let parsedQ = JSON.parse(cellInfo.original.qnaItem.Questions);
  //   return parsedQ.map(question => {
  //     return (
  //       <div>
  //         <span style={{ border: "#000" }}> {question.label} </span>
  //       </div>
  //     );
  //   });
  // }

  public renderDateField(cellInfo) {
    return (
      <div>
        <Moment
          //format={"MMMM Do YYYY, h:mm:ss a"}
          format={"DD/MM/YYYY h:mm A"}
          date={cellInfo.original.PostedDate}
        />
      </div>
    );
  }

  public renderResolvedDateField(cellInfo) {
    return (
      <div>
        <Moment
          //format={"MMMM Do YYYY, h:mm:ss a"}
          format={"DD/MM/YYYY h:mm A"}
          date={cellInfo.original.ResolvedDate}
        />
      </div>
    );
  }

  public showResolvedQuestions(){
    //set state that show ResolvedQuestions
    this.setState({showResolvedQuestions: true});
  } 

  public hideResolveQuestions(){
    this.setState({showResolvedQuestions: false});
  }

  public searchQnAValues(){
    var searchVal = this.state.qnaItems.filter(row => {
          return row.Answer.toLowerCase().includes(this.state.searchQnA.toLowerCase()) || 
          row.Questions.toLowerCase().includes(this.state.searchQnA.toLowerCase()) || 
          row.Classification.toLowerCase() == this.state.searchQnA.toLowerCase(); //||
         // row.Remarks.toLowerCase().includes(this.state.searchQnA.toLowerCase());
        });
    this.setState({
      searchedQnA: searchVal,
    });
  }

  public searchQnAValuesKeyPress(e){
    if (e.key === 'Enter') {
      var searchVal = this.state.qnaItems.filter(row => {
        return row.Answer.toLowerCase().includes(this.state.searchQnA.toLowerCase()) || 
        row.Questions.toLowerCase().includes(this.state.searchQnA.toLowerCase()) || 
        row.Classification.toLowerCase() == this.state.searchQnA.toLowerCase(); 
      });
      this.setState({
        searchedQnA: searchVal,
      });
    }
  }

  public searchNewqValues(){
    let newQuestions = this.state.newQuestions.filter(row => {
      return row.Question.toLowerCase().includes(this.state.searchNewq.toLowerCase()) || 
      row.PostedBy.toLowerCase().includes(this.state.searchNewq.toLowerCase()) || 
      String(row.PostedDate).toLowerCase().includes(this.state.searchNewq.toLowerCase());
    });
    this.setState({
      searchedNewq: newQuestions,
    });
  }

  public searchNewqValuesKeyPress(e){
    if (e.key === 'Enter') {
      let newQuestions = this.state.newQuestions.filter(row => {
        return row.Question.toLowerCase().includes(this.state.searchNewq.toLowerCase()) || 
        row.PostedBy.toLowerCase().includes(this.state.searchNewq.toLowerCase()) || 
        String(row.PostedDate).toLowerCase().includes(this.state.searchNewq.toLowerCase());
      });
      this.setState({
        searchedNewq: newQuestions,
      });
    }
  }


  public render() {
    const { selectedDivision } = this.state;
    let resolvedQuestions = this.state.resolvedQuestions;

    let QnACpy;
    let QnACpyLength;
    let pgSize;
    if(this.state.searchedQnA.length == 0){
      QnACpy  = this.state.qnaItems;
      QnACpyLength = (QnACpy) ? QnACpy.length : 0; 
      pgSize = (QnACpyLength > 10) ? 5 : QnACpyLength;
    } else {
      QnACpy  = this.state.searchedQnA;
      QnACpyLength = (QnACpy) ? QnACpy.length : 0; 
      pgSize = (QnACpyLength > 10) ? 5 : QnACpyLength;
    }

    let newQuestions;
    let NewQLength;
    let newQPgSize;
    if(this.state.searchedNewq.length == 0){
      newQuestions  = this.state.newQuestions;
      NewQLength = (newQuestions) ? newQuestions.length : 0;
      newQPgSize = (NewQLength > 10) ? 5 : NewQLength;
    } else {
      newQuestions  = this.state.searchedNewq;
      NewQLength = (newQuestions) ? newQuestions.length : 0;
      newQPgSize = (NewQLength > 10) ? 5 : NewQLength;
    }

    if((this.state.searchQnA == "") || (this.state.searchQnA == null)){
      QnACpy = this.state.qnaItems;
      QnACpyLength = (QnACpy) ? QnACpy.length : 0; 
      pgSize = (QnACpyLength > 10) ? 5 : QnACpyLength;
    } 

    if((this.state.searchNewq == "") || (this.state.searchNewq == null)){
      newQuestions = this.state.newQuestions;
      NewQLength = (newQuestions) ? newQuestions.length : 0;
      newQPgSize = (NewQLength > 10) ? 5 : NewQLength;
    } 

     

    let ResQLength = (resolvedQuestions) ? resolvedQuestions.length : 0;
    let resQPgSize = (ResQLength > 10) ? 5 : ResQLength;

        return (
          <div>
            {this.state.isLoading && <LoadingSpinner />}
            <div className={styles.controlMenu}>
              <span className={styles.divisionLabel}> Division: </span>

              <div className={styles.dropdownCont}>
                <Dropdown
                  placeHolder="Select Division"
                  id="division"
                  options={this.state.division}
                  selectedKey={
                    selectedDivision ? selectedDivision.key : undefined
                  }
                  onChanged={this.setDivisionDD}
                />
               </div>
              
              <div className={styles.actionButtons}>
                <DefaultButton
                  text="Edit"
                  primary={true}
                  onClick={this.changeToEdit}
                  disabled={this.state.showResolvedQuestions}
                />
                <DefaultButton
                  text="Preview Changes"
                  primary={true}
                  href="#"
                  onClick={this.changeToPublish}
                  disabled={this.state.showResolvedQuestions}
                />

              </div>
            </div>
          
      
            <div className={styles.tableCont}>
              {this.state.showResolvedQuestions ? (

                <div>
               <div className={styles.tableLabels}>Resolved Questions </div>              
                <div className={styles.controlMenu}>               
                  <div className={styles.actionButtons}>
                    <DefaultButton
                      text="Back"
                      href="#"
                      onClick={this.hideResolveQuestions}
                    />
                  </div>
                </div>

                {this.state.resolvedQuestions.length > 0 ? ( 
                  <ReactTable
                    PaginationComponent={Pagination}
                    data={resolvedQuestions} //this.state.newQuestions
                    columns={[
                      {
                        columns: [
                          {
                            Header: "Question",
                            accessor: "Question",
                            style: { 'overflow': 'visible !important', 
                                    'overflow-wrap': 'break-word !important',
                                    'word-wrap': 'break-word !important',
                                    'white-space': 'normal !important' },
                            sortable: false 
                          },
                          {
                            Header: "Posted Date",
                            accessor: "PostedDate",
                            Cell: this.renderDateField,
                            sortable: false 
                          },
                          {
                            Header: "Posted By",
                            accessor: "PostedBy"
                          },
                          {
                            Header: "Remarks",
                            accessor: "Remarks"
                          },
                          {
                            Header: "Resolved By",
                            accessor: "ResolvedBy"
                          },
                          {
                            Header: "Resolved Date",
                            accessor: "ResolvedDate",
                            Cell: this.renderResolvedDateField
                          }
                        ]
                      }
                    ]}
                    pageSize={resQPgSize}
                    className="-striped -highlight"
                  />
                ) : (
                  <div>
                  <span className={styles.notificationText}> There are no Resolved Questions from the Database </span>
                  </div> 
                )}
                
                </div>
                  
              ):(
                <div> 
                  
                  {this.state.newQuestions.length > 0 ? ( 
                            <div>    
                              <div className={styles.tableLabels}>New Questions </div>
                              <div className={styles.controlMenu}>               
                                <div className={styles.searchCont}> 
                                  {/* <input className={styles.searchtxtBox}
                                      value={this.state.searchNewq}
                                      onChange={e => this.setState({searchNewq: e.target.value})}
                                      placeholder="Search"
                                  /> */}
                                  <input className={styles.searchtxtBox}
                                        value={this.state.searchNewq}
                                        onChange={e => this.setState({
                                          searchNewq: e.target.value,
                                          searchedNewq: []
                                        })}
                                        placeholder="Search"
                                        onKeyPress={this.searchNewqValuesKeyPress}
                                  />
                                  <IconButton iconProps={{ iconName: 'Search' }} 
                                        onClick={this.searchNewqValues}
                                        title="Search" 
                                        ariaLabel="Search" />
                                </div>
                                <div className={styles.actionButtons}>
                                  <DefaultButton text="Resolved Questions" 
                                      onClick={this.showResolvedQuestions}/>
                                </div>
                              </div>
                              <ReactTable
                                PaginationComponent={Pagination}
                                data={newQuestions} //this.state.newQuestions
                                columns={[
                                  {
                                    columns: [
                                      {
                                        Header: "Question",
                                        accessor: "Question",
                                        style: { 'overflow': 'visible !important', 
                                                'overflow-wrap': 'break-word !important',
                                                'word-wrap': 'break-word !important',
                                                'white-space': 'normal !important' },
                                        sortable: false 
                                      },
                                      {
                                        Header: "Posted Date",
                                        accessor: "PostedDate",
                                        Cell: this.renderDateField,
                                        sortable: false 
                                      },
                                      {
                                        Header: "Posted By",
                                        accessor: "PostedBy"
                                      }
                                    ]
                                  }
                                ]}
                                //defaultPageSize={5}
                                pageSize={newQPgSize}
                                className="-striped -highlight"
                              />

                            </div>
                          ): (
                            <div>
                              {ResQLength > 0 ? (
                                <div>
                                  <div className={styles.tableLabels}>New Questions </div>
                                  <span className={styles.notificationText}> There are no New Questions from the Database </span>
                                   
                                    <div className={styles.actionButtons}>
                                      <DefaultButton text="Resolved Questions" 
                                          onClick={this.showResolvedQuestions}/>
                                    </div>
                                </div>
                               ) : (
                                 <div>
                                  <div className={styles.tableLabels}>New Questions </div>
                                  <span className={styles.notificationText}> There are no New Questions from the Database </span>
                                  <div className={styles.actionButtons}>
                                    <DefaultButton text="Resolved Questions" 
                                        onClick={this.showResolvedQuestions}/>
                                  </div>
                                </div>
                              )}
                            </div>                           
                          )}

                        <br />
                        <div className={styles.tableCont}>
                          <div className={styles.tableLabels}> QnA </div>

                              {(QnACpyLength > 0) ? ( 
                                <div>
                                        <div className={styles.searchCont}> 
                                                  
                                          <input className={styles.searchtxtBox}
                                            value={this.state.searchQnA}
                                            onChange={e => this.setState({
                                              searchQnA: e.target.value,
                                              searchedQnA: []
                                            })}
                                            placeholder="Search"
                                            onKeyPress={this.searchQnAValuesKeyPress}
                                          />
                                             <IconButton iconProps={{ iconName: 'Search' }} 
                                              onClick={this.searchQnAValues}
                                              title="Search" 
                                              ariaLabel="Search" />
                                        </div>
                                        <ReactTable
                                          data={QnACpy}
                                          PaginationComponent={Pagination}
                                          columns={[
                                            {
                                              columns: [
                                                {
                                                  Header: "Questions",
                                                  accessor: "Questions",
                                                  Cell: this.renderQuestionsDisplay,
                                                  filterable: false,
                                                  style: { 'overflow': 'visible !important', 
                                                              'overflow-wrap': 'break-word !important',
                                                              'word-wrap': 'break-word !important',
                                                              'white-space': 'normal !important' },
                                                  sortable: false ,
                                                  width: 230  
                                                },
                                                {
                                                  Header: "Answer",
                                                  accessor: "Answer",
                                                  Cell: this.renderAnswerDisplay,
                                                  filterable: false,
                                                  style: { 'overflow': 'visible !important', 
                                                              'overflow-wrap': 'break-word !important',
                                                              'word-wrap': 'break-word !important',
                                                              'white-space': 'normal !important' },
                                                  sortable: false,
                                                  width: 275 
                                                },
                                                {
                                                  Header: "Classification",
                                                  accessor: "Classification",
                                                  sortable: true,
                                                },
                                                {
                                                  Header: "Remarks",
                                                  accessor: "Remarks",
                                                  filterable: false,
                                                  style: { 'overflow': 'visible !important', 
                                                              'overflow-wrap': 'break-word !important',
                                                              'word-wrap': 'break-word !important',
                                                              'white-space': 'normal !important' },
                                                  sortable: false 
                                                },
                                                {
                                                  Header:"Rating",
                                                  accessor: "Rating",
                                                  filterable: false,
                                                  sortable: true,
                                                  className: styles.rating,
                                                  style: { 
                                                      'justify-content': 'center !important',
                                                      'display': 'flex'
                                                  },
                                                }
                                              ]
                                            }
                                          ]}
                                          //defaultPageSize={pgSize}
                                          pageSize={pgSize}
                                          className="-striped -highlight"
                                        />
                            </div>
                          ): (
                            <div>
                              <span className={styles.notificationText}> There are no QnA Items. Edit to add QnA Pairs </span>
                            </div> 
                          
                          )}
                      </div>
                </div>  
              )}
            </div>
          </div>
        );
    }
}