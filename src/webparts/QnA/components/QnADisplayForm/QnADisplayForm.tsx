import * as React from "react";
import styles from "../QnAForm/QnAForm.module.scss";
import { IQnADisplayFormProps, IQnADisplayFormState } from "./IQnADisplayFormProps";
import { LoadingSpinner } from "../../../common/components/LoadingSpinner";
import { ViewType } from "../../../common/enum";
import ReactTable from "react-table";
import "react-table/react-table.css";
import { Pagination } from "../Pagination/Pagination";
import { DefaultButton } from "office-ui-fabric-react/lib/Button";
import {
  Dropdown,
  IDropdownOption
} from "office-ui-fabric-react/lib/Dropdown";
import Moment from "react-moment";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import * as _ from "lodash";
import ReactHtmlParser, { processNodes, convertNodeToElement, htmlparser2 } from 'react-html-parser';

export class QnADisplayForm extends React.Component<IQnADisplayFormProps, IQnADisplayFormState> {
  constructor(props) {
    super(props);
    console.log(props);
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
      searchQnA: ""
    };

    this.changeToEdit = this.changeToEdit.bind(this);
    this.changeToPublish = this.changeToPublish.bind(this);
  }

  public componentWillReceiveProps(newProps): void {
    console.log(newProps);
    if (
      newProps.masterItems.length !== 0 //&&
      //newProps.newQuestions.length !== 0
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
    this.setState({
      newQuestions: await this.props.actionHandler.getNewQuestions(
        this.props.properties.endpointUrl, 
        division
      ),
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
        if (
          this.state.listTrackingItem.LockedBy.EMail !== currentUserEmail &&
          this.state.listTrackingItem.LockedBy.EMail
        ) {
          toast.info("Item is locked by: " + this.state.listTrackingItem.LockedBy.EMail);
          this.setState({
            isLoading: false
          });
        } else {
          //get qna action history, if it has laman add to current state
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
      });
  }

  public changeToPublish(): void {
    this.setState({isLoading: true});

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
        if (
          // this.state.listTrackingItem.LockedBy !== undefined &&
           this.state.listTrackingItem.LockedBy.EMail !== currentUserEmail &&
          this.state.listTrackingItem.LockedBy.EMail
        ) {
          toast.info("Item is locked by: " + this.state.listTrackingItem.LockedBy.EMail);
          this.setState({
            isLoading: false
          });
        }
        //COMMENT OUT MUNA 
      //   else if () {
      //     //TO DO: CHECK THE UPDATED STATUS OF THE DIVISION
      //  } 
         else {
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
    console.log(cellInfo.original.Answer);
    let html = cellInfo.original.Answer;
    return (
      <div> {ReactHtmlParser(html)}</div>
    )
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
          format={"MMMM Do YYYY, h:mm:ss a"}
          date={cellInfo.original.PostedDate}
        />
      </div>
    );
  }

  public render() {
    const { selectedDivision } = this.state;
    let newQuestions = this.state.newQuestions; 
    let QnACpy = this.state.qnaItems;


      if (this.state.searchQnA) {
        QnACpy = QnACpy.filter(row => {
          return row.Answer.includes(this.state.searchQnA) || 
          row.Questions.includes(this.state.searchQnA) || 
          row.Classification.includes(this.state.searchQnA);
        });
      }

      if (this.state.searchNewq) {
        newQuestions = newQuestions.filter(row => {
          return row.Question.includes(this.state.searchNewq) || 
          row.PostedBy.includes(this.state.searchNewq) || 
          String(row.PostedDate).includes(this.state.searchNewq);
        });
      }
        return (
          <div>
            {/* <ToastContainer /> */}
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
                />
                <DefaultButton
                  text="Publish"
                  primary={true}
                  href="#"
                  onClick={this.changeToPublish}
                />

              </div>
              
            </div>
            
            <div className={styles.tableCont}>
              <div>New Questions </div>
              <div className={styles.searchCont}> 
                <span>Search: </span>
                <input 
                    value={this.state.searchNewq}
                    onChange={e => this.setState({searchNewq: e.target.value})}
                />
              </div>
              <ReactTable
                PaginationComponent={Pagination}
                data={newQuestions} //this.state.newQuestions
                columns={[
                  {
                    columns: [
                      {
                        Header: "Question",
                        accessor: "Question"
                      },
                      {
                        Header: "Posted Date",
                        accessor: "PostedDate",
                        Cell: this.renderDateField
                      },
                      {
                        Header: "Posted By",
                        accessor: "PostedBy"
                      }
                    ]
                  }
                ]}
                defaultPageSize={10}
                className="-striped -highlight"
              />
            </div>
            <br />
            <div className={styles.tableCont}>
              <div> QnA </div>
              <div className={styles.searchCont}> 
                <span>Search: </span>
                <input 
									value={this.state.searchQnA}
									onChange={e => this.setState({searchQnA: e.target.value})}
								/>
              </div>
              <ReactTable
                data={QnACpy} //this.state.qnaItems
                PaginationComponent={Pagination}
                columns={[
                  {
                    columns: [
                      {
                        Header: "Questions",
                        accessor: "Questions",
                        Cell: this.renderQuestionsDisplay
                      },
                      {
                        Header: "Answer",
                        accessor: "Answer",
                        Cell: this.renderAnswerDisplay
                      },
                      {
                        Header: "Classification",
                        accessor: "Classification"
                      }
                    ]
                  }
                ]}
                defaultPageSize={10}
                className="-striped -highlight"
              />
           </div>
          </div>
        );
    }
}