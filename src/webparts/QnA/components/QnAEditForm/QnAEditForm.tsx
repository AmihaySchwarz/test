import * as React from "react";
import styles from "../QnAForm/QnAForm.module.scss";
import { IQnAEditFormProps, IQnAEditFormState } from "./IQnAEditFormProps";
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
import { TextField } from "office-ui-fabric-react/lib/TextField";
import { QnAPreviewPanel } from "../QnAPreviewPanel/QnAPreviewPanel";
import ReactTooltip from "react-tooltip";
import QuestionInput from "../QnAQuestionInput/QuestionInput";
import QnAClassificationInput from "../QnAClassificationInput/QnAClassificationInput";
import Moment from "react-moment";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import * as _ from "lodash";
import Modal from "react-responsive-modal";
import RemarksPanel  from "../RemarksPanel/RemarksPanel";

export class QnAEditForm extends React.Component<IQnAEditFormProps, IQnAEditFormState> {
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
      filtered: [],
      filterAll: "",
      formView: ViewType.Edit,
      newQuestions: [],
      inputValue: "",
      listTrackingItem: undefined,
      currentUser: props.currentUser,
      qnaActionHistory: [],
      qnaOriginalCopy: [],
      searchNewq: "",
      searchQnA: "",
      openModal: false
    };

    this.onSaveClick = this.onSaveClick.bind(this);
    this.addNewQuestionToQnAList = this.addNewQuestionToQnAList.bind(this);
    this.saveAndChangeToPublish = this.saveAndChangeToPublish.bind(this);
    this.addNewQnaToTable = this.addNewQnaToTable.bind(this);
  }

  public componentWillReceiveProps(newProps): void {
      console.log(newProps, "will receive props");
    if (
      newProps.newQuestions.length !== 0
    ) {
      this.setState({
        qnaItems: newProps.qnaItems,
        newQuestions: newProps.newQuestions,
        currentUser: newProps.currentUser,
        division: newProps.masterItems,
        selectedDivision: newProps.defaultDivision,
        selectedDivisionText: newProps.defaultDivision.text,
        selectedDivisionListName: newProps.defaultDivision.key,
        qnaOriginalCopy: newProps.qnaOriginalCopy,
        qnaActionHistory: newProps.qnaActionHistory
      });

      this.loadQnAListData(newProps.defaultDivision.key);
      this.loadNewQuestionsData(newProps.defaultDivision.text);
    }
  }

  public componentDidMount(): void {
    console.log(this.props, "did mount");
    if (
        this.props.newQuestions.length !== 0
      ) {
        this.setState({
          qnaItems: this.props.qnaItems,
          newQuestions: this.props.newQuestions,
          currentUser: this.props.currentUser,
          division: this.props.masterItems,
          selectedDivision: this.props.defaultDivision,
          selectedDivisionText: this.props.defaultDivision.text,
          selectedDivisionListName: this.props.defaultDivision.key,
          qnaOriginalCopy: this.props.qnaOriginalCopy,
          qnaActionHistory: this.props.qnaActionHistory
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


  public saveAndChangeToPublish(): void {
    this.setState({isLoading: true });
    console.log(this.state.qnaActionHistory, "modified items");

    try {
      const addItems = this.state.qnaActionHistory.filter(items => items.action === "add").map( qna => qna.qnaItem);
      const modifyItems = this.state.qnaActionHistory.filter(items => items.action === "update").map( qna => qna.qnaItem);
      const deleteItems = this.state.qnaActionHistory.filter(items => items.action === "delete").map( qna => qna.qnaItem);

      console.log(addItems, modifyItems, deleteItems);

      const newItem = addItems.find(a => a.newQnA);
      let isClassificationNull = addItems.some(c => c.Classification == "") || modifyItems.some(c => c.Classification == "");
      let isAnswerNull = addItems.some(a => a.Answer == "") || modifyItems.some(a => a.Answer == "");
      let isQuestionNull = addItems.some(q =>  q.Questions == "[]"); 


      if((newItem !== undefined ) || isQuestionNull || isAnswerNull || isClassificationNull){
        toast.error("One or more items have empty value");
        this.setState({
          isLoading: false
        });
      } else {
        // const updatetoList = 
        // const deletefromlist = 
        let promises = [
          this.props.actionHandler.updateItemInQnAList(this.state.selectedDivisionListName,modifyItems),
          this.props.actionHandler.deleteFromQnAList(this.state.selectedDivisionListName,deleteItems)
        ];

        addItems.forEach(additem => {
          promises.push(
            this.props.actionHandler.addtoQnaList(this.state.selectedDivisionListName,additem)
            .then(result => { 
                console.log(result.data.Id);
                const historyIndex = this.state.qnaActionHistory.findIndex(data => data.qnaItem.identifier == additem.identifier);
                let qnaActionHistory = [...this.state.qnaActionHistory];
                let item = {
                  ...qnaActionHistory[historyIndex],
                  qnaItem:{
                  ...qnaActionHistory[historyIndex].qnaItem,
                  Id: result.data.Id
                  } 
                };
                qnaActionHistory[historyIndex] = item;
                this.setState({ qnaActionHistory });
            }));
        });

        Promise.all(promises).then(res => {
          this.props.actionHandler.updateQnAListTracking(
            this.props.properties.qnATrackingListName, 
            this.state.selectedDivisionText, 
            this.state.qnaActionHistory,
            this.state.qnaOriginalCopy,
            "save")
              .then(resp => { 
                toast.success("QnA Items Saved!");
                this.setState({
                    selectedDivision: this.state.selectedDivision,
                    isLoading: false
                  });
                  this.props.onSavePublishClick(this.state.selectedDivision, this.state.qnaActionHistory, this.state.qnaOriginalCopy);
              });
        });
      }
    }catch (error) {
      toast.error("Error in Saving Items");
      this.setState({isLoading: false});
      this.props.onSavePublishClick(this.state.selectedDivision, this.state.qnaActionHistory, this.state.qnaOriginalCopy);
    }
    
  }

  private onSaveClick(): void {
    this.setState({isLoading: true});
    console.log(this.state.qnaActionHistory, "modified items");

    try {
      //check if question, answer, and classifications are null, notify user
      const addItems = this.state.qnaActionHistory.filter(items => items.action === "add").map( qna => qna.qnaItem);
      const modifyItems = this.state.qnaActionHistory.filter(items => items.action === "update").map( qna => qna.qnaItem);
      const deleteItems = this.state.qnaActionHistory.filter(items => items.action === "delete").map( qna => qna.qnaItem);
      const newItem = addItems.find(a => a.newQnA);
      let isClassificationNull = addItems.some(c => c.Classification == "") || modifyItems.some(c => c.Classification == "");
      let isAnswerNull = addItems.some(a => a.Answer == "") || modifyItems.some(a => a.Answer == "");
      let isQuestionNull = addItems.some(q =>  q.Questions == "[]"); 


      if((newItem !== undefined ) || isQuestionNull || isAnswerNull || isClassificationNull){
        toast.error("One or more items have empty value");
        this.setState({
          isLoading: false
        });
      } else {


        let promises = [
          this.props.actionHandler.updateItemInQnAList(this.state.selectedDivisionListName,modifyItems),
          this.props.actionHandler.deleteFromQnAList(this.state.selectedDivisionListName,deleteItems)
        ];

        addItems.forEach(additem => {
          promises.push(
            this.props.actionHandler.addtoQnaList(this.state.selectedDivisionListName,additem)
            .then(result => { 
                console.log(result.data.Id);
                const historyIndex = this.state.qnaActionHistory.findIndex(data => data.qnaItem.identifier == additem.identifier);
                let qnaActionHistory = [...this.state.qnaActionHistory];
                let item = {
                  ...qnaActionHistory[historyIndex],
                  qnaItem:{
                  ...qnaActionHistory[historyIndex].qnaItem,
                  Id: result.data.Id
                  } 
                };
                qnaActionHistory[historyIndex] = item;
                this.setState({ qnaActionHistory });
            }));
        });

        Promise.all(promises).then(() => {
          this.props.actionHandler.updateQnAListTracking(
            this.props.properties.qnATrackingListName, 
            this.state.selectedDivisionText, 
            this.state.qnaActionHistory,
            this.state.qnaOriginalCopy,
            "save")
              .then(() => {
                toast.success("QnA Items Saved");
                this.setState({
                    selectedDivision: this.state.selectedDivision,
                    isLoading: false
                  });
                  this.props.onSaveClick(this.state.selectedDivision, 
                    this.state.qnaActionHistory, 
                    this.state.qnaOriginalCopy);
              });
        });
      }
    } catch (err) {
      toast.error("Error in Saving Items");
      this.setState({isLoading: false});
      this.props.onSaveClick(this.state.selectedDivision, 
        this.state.qnaActionHistory, 
        this.state.qnaOriginalCopy);
    }
  }

  public addNewQuestionToQnAList(item: any): void {
    this.setState({isLoading: true});
    // this.props.actionHandler.addQuestionToQnAList(
    //   this.props.properties.webUrl,
    //   this.state.selectedDivisionListName,
    //   item.row
    // ).then(res => {
    //   console.log(res);
    //   this.setState(prevState => {
    //     return {
    //         qnaItems: [...prevState.qnaItems, res.data],
    //         isLoading: false
    //     };
    //   });
    // });


    let newQnA = null;
    let itemAddActionHistory = null;

    this.setState(oldstate => {
      //create identifier for new question row for history
      itemAddActionHistory = {
        qnaItem: { newQnA, identifier: oldstate.qnaItems.length },
        action: "add"
      };
      //return new qnaitems with new question
      // return {
      //   qnaItems: [...oldstate.qnaItems, newQnA],
      //   isLoading: false
      // };
       newQnA = {
        Questions: '[ {"label": "'+ item.row.Question +'", "value": "'+ item.row.Question +'" }]',
        Answer: "",
        Classification: "",
        QnAID: 0,
        Id: null,
        identifier: oldstate.qnaItems.length
      };
    });

    this.setState(oldstate => ({
      qnaActionHistory: [...oldstate.qnaActionHistory, itemAddActionHistory],
      qnaItems: [...oldstate.qnaItems, newQnA],
      isLoading: false
    }));
  }

  public deleteNewQuestion(item: any): void {
    this.props.actionHandler.deleteFromNewQuestion(
      this.props.properties.endpointUrl,
      item.row._original
    );
  }

  // public onOpenModal = () => {
  //   this.setState({ openModal: true });
  // }

  public onCloseModal = () => {
    this.setState({ openModal: false });
  }

  public updateRemarks(data:any): void {
    //save the remarks in qnaitems 
  }

  public markAsResolved(item: any): void {
    //todo create modal to show the remArks
    // this.setState({isLoading: true});
    this.setState({ openModal: true });

    // try {
    //   this.props.actionHandler.resolveQuestion(
    //     this.props.properties.endpointUrl,
    //     item.row._original
    //   ).then(res => {
    //     toast.info(res);
    //     this.setState({isLoading: false});
    //   });
    // }catch (error) {
    //   toast.error("an error has occured");
    //   this.setState({isLoading: false});
    // }
    
    //save the question to sp list as well as the remark in sp list
  }

  public addNewQnaToTable(): void {
    console.log("add inline form");

    let newQnA = null;
    let itemAddActionHistory = null;

    this.setState(oldstate => {
      //create identifier for new question row for history
      itemAddActionHistory = {
        qnaItem: { newQnA, identifier: oldstate.qnaItems.length },
        action: "add"
      };
      //return new qnaitems with new question
      // return {
      //   qnaItems: [...oldstate.qnaItems, newQnA]
      // };
      newQnA = {
        Questions: '[]',
        Answer: "",
        Classification: "",
        QnAID: 0,
        Id: null,
        identifier: oldstate.qnaItems.length
      };

    });

    this.setState(oldstate => ({
      qnaActionHistory: [...oldstate.qnaActionHistory, itemAddActionHistory],
      qnaItems: [...oldstate.qnaItems, newQnA]
    }));
  }

  

  public deleteQnA(item: any): void {
    if (item.row._original.Id !== null){
      let itemDeleteActionHistory = {
        qnaItem: item.row._original,
        action: "delete"
      };

      console.log(this.state.qnaActionHistory);
      const historyIndex = this.state.qnaActionHistory.findIndex(data => data.qnaItem.Id == item.row._original.Id);


      if (historyIndex >= 0) {
        //item exist in history
        this.setState(oldState => {
              let history = [...oldState.qnaActionHistory];
              history[historyIndex] = itemDeleteActionHistory; 
              return {
                qnaActionHistory: history
              };
            });
      } else {
        this.setState(oldstate => ({
          qnaActionHistory: [...oldstate.qnaActionHistory, itemDeleteActionHistory]
        }));
      }
      //remove from qnaState array
      let array = [...this.state.qnaItems];
      let index = array.findIndex(d => d.Id == item.row._original.Id);
      array.splice(index, 1);
      this.setState({ qnaItems: array });

    } else {
      //item is new so we also need to delete the item from qnaActionHistory state
      let historyArray = [...this.state.qnaActionHistory];
      let histIndex = historyArray.findIndex(d => d.identifier == item.row._original.identifier);
      historyArray.splice(histIndex, 1);
      this.setState({ qnaActionHistory: historyArray });

      //remove from qnaState array
      let array = [...this.state.qnaItems];
      let index = array.findIndex(d => d.identifier == item.row._original.identifier);
      array.splice(index, 1);
      this.setState({ qnaItems: array });
    }
  }

  public updateActionHistory = (item, index) => {
    let historyItem;
    let historyIndex;

    const itemId = item.Id;
    if((itemId == null)){
      //item does not have id, so add
      historyItem = {
        qnaItem: { ...item, identifier: index },
        action: "add"
      };

      console.log(this.state.qnaActionHistory, "actionhistory");
      //check if item exist in action history
     historyIndex = this.state.qnaActionHistory.findIndex( data => data.qnaItem.identifier == index);

    } else  {
      //item has id so edit
      historyItem = {
        qnaItem: { ...item },
        action: "update"
      };
     
      //check if item exist in action history
      historyIndex = this.state.qnaActionHistory.findIndex( data => data.qnaItem.Id == item.Id);

    }

    if (historyIndex >= 0) {
      //item exist in history
      this.setState(oldState => {
            let history = [...oldState.qnaActionHistory];
            history[historyIndex] = historyItem ;
            return {
              qnaActionHistory: history
            };
          });
    } else {
      //create new index
      this.setState(oldstate => ({
        qnaActionHistory: [...oldstate.qnaActionHistory, historyItem]
      }));
    }
  }

  public updateQnAAnswer = (data, cellInfo) => {
    //console.log(data)

    let qnaItems = [...this.state.qnaItems];
    let index;
    if(cellInfo.original.Id != null){
      index = qnaItems.findIndex(d => d.Id == cellInfo.original.Id);
    } else {
       index = qnaItems.findIndex(d => d.identifier == cellInfo.original.identifier);
    }

    let item = {
      ...qnaItems[index],
      Answer: data, 
    };
    qnaItems[index] = item;
    this.setState({ qnaItems });

    this.updateActionHistory(item,index);
  }

  public updateQuestions = (data, cellInfo) => {
    //console.log(data, cellInfo, "update question");

    let array = [...this.state.qnaItems];
    let index;
    if(cellInfo.original.Id != null){
      index = array.findIndex(d => d.Id == cellInfo.original.Id);
    } else {
       index = array.findIndex(d => d.identifier == cellInfo.original.identifier);
    }
   
    let qnaItems = [...this.state.qnaItems];
    let item = {
      ...qnaItems[index],
      Questions: JSON.stringify(data)
    };
 
    qnaItems[index] = item;
    this.setState({ qnaItems });

    this.updateActionHistory(item,index);
  }

  public updateClassification = (data, cellInfo) => {
    let qnaItems = [...this.state.qnaItems];
    console.log("NEW CLASS", data);

    let index;
    if(cellInfo.original.Id != null){
      index = qnaItems.findIndex(d => d.Id == cellInfo.original.Id);
    } else {
       index = qnaItems.findIndex(d => d.identifier == cellInfo.original.identifier);
    }

    let item = {
      ...qnaItems[index],
      Classification: data //JSON.stringify(data)
    };
    qnaItems[index] = item;
    this.setState({ qnaItems });

    this.updateActionHistory(item,index);
  }

  public renderQuestionsEdit = cellInfo => {
    // console.log(cellInfo.original);
    let parsedQ = JSON.parse(cellInfo.original.Questions);
    // console.log(parsedQ)
    return (
      <QuestionInput
        value={parsedQ}
        onChange={data => this.updateQuestions(data, cellInfo)}
      />
    );
  }

  public renderEditableAnswer = (cellInfo) => {
    return (
      <TextField
        value={cellInfo.original.Answer}
        multiline
        rows={4}
        required={true}
        resizable={true}
        onChanged={data => this.updateQnAAnswer(data, cellInfo)}
      />
    );
  }

  public renderEditableDropdown = cellInfo => {

    let selectedItemOption = {"text": cellInfo.original.Classification , 
    "key": cellInfo.original.Classification};

    return (
      <QnAClassificationInput
        value={selectedItemOption}
        onChange={data => this.updateClassification(data, cellInfo)}
      />
    );
  }

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
    
    let newQuestions = this.state.newQuestions; 
    let QnACpy = this.state.qnaItems;
      
      if (this.state.searchQnA) {
        QnACpy = QnACpy.filter(row => {
          return row.Answer.includes(this.state.searchQnA) || 
          row.Questions.includes(this.state.searchQnA) || 
          row.Classification == this.state.searchQnA;
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
            
            {this.state.isLoading && <LoadingSpinner />}
            {/* <ToastContainer /> */}
            <div className={styles.controlMenu}>
              <div className={styles.dropdownCont}>
                <span className={styles.divisionLabel}> Division: {this.state.selectedDivisionText} </span>
              </div>
              <div className={styles.actionButtons}>
                <DefaultButton 
                  text="Save"
                  primary={true}
                  onClick={this.onSaveClick}
                />
                <DefaultButton
                  text="Save and Publish"
                  primary={true}
                  href="#"
                  onClick={this.saveAndChangeToPublish}
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
                defaultPageSize={10}
                className="-striped -highlight"
                // filtered={this.state.filtered}
                // onFilteredChange={this.onFilteredChange.bind(this)}
                // filterable
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
                      },
                      {
                        Header: "Actions",
                        accessor: "newQuestionsActions",
                        Cell: ({ row }) => (
                          <div>
                            <button
                              onClick={() =>
                                this.addNewQuestionToQnAList({ row })
                              }
                            >
                              Add to QnA List
                            </button>{" "}
                            <br />
                            {/* <button onClick={()=>this.deleteNewQuestion({row})}>Delete Question</button><br /> */}
                            <button onClick={() => this.markAsResolved({ row })}>
                              Mark as Resolved
                            </button>
                            <Modal open={this.state.openModal} onClose={this.onCloseModal} center>
                              <RemarksPanel onSubmitRemarks={data => this.updateRemarks(data)} />
                            </Modal>
                          </div>
                        ) //onClick={this.addToQnAList({row})}
                      }
                    ]
                  }
                ]}
                
              />
            </div>
            <br />
            <div className={styles.addbtnCont}> 
            <DefaultButton
              className={styles.addQnABtn}
              text="Add QnA Pair"
              primary={true}
              href="#"
              onClick={this.addNewQnaToTable}
            />
            </div>
            
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
                        Cell: this.renderQuestionsEdit
                      },
                      {
                        Header: "Answer",
                        accessor: "Answer",
                        Cell: this.renderEditableAnswer
                      },
                      {
                        Header: "Classification",
                        accessor: "Classification",
                        Cell: this.renderEditableDropdown
                      },
                      {
                        Header: "Actions",
                        accessor: "Actions",
                        Cell: ({ row, index }) => (
                          <div>
                            <button onClick={() => 
                            this.deleteQnA({ row })
                          }>
                              Delete Question
                            </button>
                            <button data-tip data-for={index.toString()} data-event='click focus'>
                              Preview
                            </button>
                            <ReactTooltip
                              id={index.toString()}
                              globalEventOff="click"
                              aria-haspopup="true"
                              place="bottom"
                              type="light"
                              effect="solid"
                            >
                              <QnAPreviewPanel qnaItem={row} />
                            </ReactTooltip>
                          </div>
                        )
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