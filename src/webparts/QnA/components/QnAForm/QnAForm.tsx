import * as React from "react";
import styles from "./QnAForm.module.scss";
import { IQnAFormProps, IQnAFormState } from "./IQnAFormProps";
import { LoadingSpinner } from "../../../common/components/LoadingSpinner";
import { ViewType } from "../../../common/enum";
import ReactTable from "react-table";
import "react-table/react-table.css";
import { Pagination } from "./Pagination";
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

export class QnAForm extends React.Component<IQnAFormProps, IQnAFormState> {
  constructor(props) {
    super(props);
    console.log(props);
    this.state = {
      division: [],
      selectedDivision: undefined,
      selectedDivisionText: "",
      selectedDivisionListName: "",
      qnaItems: [],
      isDataLoaded: false,
      filtered: [],
      filterAll: "",
      formView: ViewType.Display,
      newQuestions: [],
      inputValue: "",
      listTrackingItem: undefined,
      currentUser: props.currentUser,
      qnaActionHistory: [],
      qnaOriginalCopy: []
    };

    this.filterAll = this.filterAll.bind(this);
    this.changeToEdit = this.changeToEdit.bind(this);
    this.onSaveClick = this.onSaveClick.bind(this);
    this.addNewQuestionToQnAList = this.addNewQuestionToQnAList.bind(this);
    this.saveAndChangeToPublish = this.saveAndChangeToPublish.bind(this);
    this.publishQnA = this.publishQnA.bind(this);
    this.addNewQnaToTable = this.addNewQnaToTable.bind(this);
    this.changeToPublish = this.changeToPublish.bind(this);
  }

  public componentWillReceiveProps(newProps): void {
    if (
      newProps.masterItems.length !== 0 &&
      newProps.newQuestions.length !== 0
    ) {
      this.setState({
        qnaItems: newProps.qnaItems,
        newQuestions: newProps.newQuestions,
        currentUser: newProps.currentUser,
        division: newProps.masterItems,
        selectedDivision: newProps.defaultDivision,
        selectedDivisionText: newProps.defaultDivision.text,
        selectedDivisionListName: newProps.defaultDivision.key
      });

      this.loadQnAListData(newProps.defaultDivision.key);
    }
  }

  onFilteredChange(filtered) {
    if (filtered.length > 1 && this.state.filterAll.length) {
      const filterAll = '';
      this.setState({ filtered: filtered.filter((item) => item.id != 'all'), filterAll })
    }
    else
      this.setState({ filtered });
  }

  public filterAll(e) {
    const { value } = e.target;
    const filterAll = value;
    const filtered = [{ id: 'all', value: filterAll }];
    // NOTE: this completely clears any COLUMN filters
    this.setState({ filterAll, filtered });
  }
  
  public async loadQnAListData(divisionListName: string): Promise<void> {
    this.setState({
      qnaItems: await this.props.actionHandler.getQnAItems(
        divisionListName,
        this.props.properties.webUrl
      ),
      isDataLoaded: true
    });
  }

  public async loadNewQuestionsData(division: string): Promise<void> {
    this.setState({
      newQuestions: await this.props.actionHandler.getNewQuestions(
        this.props.properties.endpointUrl, 
        division
      ),
      isDataLoaded: true
    });
  }
  public setDivisionDD = (item: IDropdownOption): void => {
    this.setState({
      selectedDivision: item,
      selectedDivisionText: item.text,
      selectedDivisionListName: item.key.toString()
    });
    this.loadQnAListData(item.key.toString());
    this.loadNewQuestionsData(item.text.toString());
  };

  public async changeToEdit(): Promise<void> {
    //CREATE A COPY OF QNAITEMS ORIGINAL
    this.setState(oldstate => ({
      qnaOriginalCopy: [...oldstate.qnaItems]
    }));
    
    this.props.actionHandler
      .checkLockStatus(
        this.state.currentUser,
        this.state.selectedDivisionText,
        this.props.properties.qnATrackingListName
      )
      .then(items => {
        this.setState({
          listTrackingItem: items[0]
        });
        let currentUserEmail = this.state.currentUser.Email;
        if (
          this.state.listTrackingItem.LockedBy !== undefined &&
          this.state.listTrackingItem.LockedBy.EMail !== currentUserEmail
        ) {
          //show notification and refresh data
          // console.log("item is locked by: " +this.state.listTrackingItem.LockedBy.EMail);
          toast.info("Item is locked by: " + this.state.listTrackingItem.LockedBy.EMail);
        } else {
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
              } else {
                // console.log(this.state.selectedDivision);
                this.setState({
                  formView: ViewType.Edit
                });
              }
            });
        }
      });
  }

  public saveAndChangeToPublish(): void {
    
    console.log(this.state.qnaActionHistory, "modified items");
    const addItems = this.state.qnaActionHistory.filter(items => items.action === "add").map( qna => qna.qnaItem);
    const modifyItems = this.state.qnaActionHistory.filter(items => items.action === "update").map( qna => qna.qnaItem);
    const deleteItems = this.state.qnaActionHistory.filter(items => items.action === "delete").map( qna => qna.qnaItem);

    console.log(addItems, modifyItems, deleteItems);

    const updatetoList = this.props.actionHandler.updateItemInQnAList(this.state.selectedDivisionListName,modifyItems);
    const deletefromlist = this.props.actionHandler.deleteFromQnAList(this.state.selectedDivisionListName,deleteItems);
    
    addItems.forEach(additem => {
      this.props.actionHandler.addtoQnaList(this.state.selectedDivisionListName,additem).then(result => {
          
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
          console.log(item);
          qnaActionHistory[historyIndex] = item;
          this.setState({ qnaActionHistory });
      });
    })
    

    Promise.all([updatetoList, deletefromlist]).then(res => {
      this.props.actionHandler.updateQnAListTracking(
        this.props.properties.qnATrackingListName, 
        this.state.selectedDivisionText, "save")
          .then(res => {
         
            this.setState({
                formView: ViewType.Publish,
                selectedDivision: this.state.selectedDivision
              });
          })
    });
  }

  public changeToPublish(): void {
    //LOCK LIST , check lock stat, lock , check last updated, 
    this.props.actionHandler
      .checkLockStatus(
        this.state.currentUser,
        this.state.selectedDivisionText,
        this.props.properties.qnATrackingListName
      )
      .then(items => {
        this.setState({
          listTrackingItem: items[0]
        });
        // console.log(this.state.listTrackingItem);
        let currentUserEmail = this.state.currentUser.Email;
        if (
          this.state.listTrackingItem.LockedBy !== undefined &&
          this.state.listTrackingItem.LockedBy.EMail !== currentUserEmail
        ) {
          //show notification and refresh data
          // console.log("item is locked by: " +this.state.listTrackingItem.LockedBy.EMail);
          toast.info("Item is locked by: " + this.state.listTrackingItem.LockedBy.EMail);
        } else {
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
              } else {
                this.setState({
                  formView: ViewType.Publish,
                  selectedDivision: this.state.selectedDivision
                });
              }
            });
        }
      });


    
  }

  public publishQnA(): void {
    let formatItem;
    this.setState({isDataLoaded: false });
    const updateKBArray = this.state.qnaActionHistory.reduce((newObject,currentItem)=>{
      console.log(currentItem);
      switch(currentItem.action){
        case "add":
          if(!newObject.add){
            newObject["add"] = {
              "qnaList" : []
            }
          }
          formatItem = {
            id : currentItem.qnaItem.QnAID,
            answer: currentItem.qnaItem.Answer,
            source: "Editorial", //placeholder where should we get this
            questions: JSON.parse(currentItem.qnaItem.Questions).map(m => m.label),
            metadata: [
              {
                "name": "classification",
                "value": currentItem.qnaItem.Classification
              },
              {
                "name": "SPID",
                "value": currentItem.qnaItem.Id
              },
              {
                "name": "Division",
                "value": this.state.selectedDivisionText
              }
            ]
          };
          newObject.add.qnaList.push(formatItem);
          console.log(newObject);
          return newObject;
        
        case "update":
           //find data in qnaOriginalCopy
           let itemInOrig = this.state.qnaOriginalCopy.find(d => d.Id === currentItem.qnaItem.Id);
           let origQuestions = JSON.parse(itemInOrig.Questions);
           let updatedQuestions = JSON.parse(currentItem.qnaItem.Questions)
           //Find values that are in result1 but not in result2
          let deletedQuestions = origQuestions.filter(function(obj) {
            return !updatedQuestions.some(function(obj2) {
                return obj.value == obj2.value;
            });
          });
          console.log(deletedQuestions);
          //Find values that are in result2 but not in result1
          let addedQuestions = updatedQuestions.filter(function(obj) {
            return !origQuestions.some(function(obj2) {
                return obj.value == obj2.value;
            });
          });
          console.log(addedQuestions);
          if(!newObject.update){
            newObject["update"] = {
              "qnaList" : []
            }
          }
          formatItem = {
            id : currentItem.qnaItem.QnAID,
            answer: currentItem.qnaItem.Answer,
            source: "Editorial", //placeholder where should we get this
            questions: {},
            
          }

          if(addedQuestions.length > 0){
            formatItem.questions["add"] = addedQuestions.map(m => m.label);
          }
          if(deletedQuestions.length > 0) {
            formatItem.questions["delete"] = addedQuestions.map(m => m.label);
          }
          if(itemInOrig.Classification !== currentItem.qnaItem.Classification) {
            // "dalete" : original
            // add: currentItem
            formatItem["metadata"] = {};
            formatItem.metadata["add"] = { 
              "name" : "Classification", 
              "value": currentItem.qnaItem.Classification };
            formatItem.metadata["delete"] = { 
              "name" : "Classification", 
              "value": itemInOrig.Classification }; 
          } 
          newObject.update.qnaList.push(formatItem);
          console.log(newObject);
          return newObject;
        case "delete":
          if(!newObject.delete){
            newObject["delete"] = {
              "ids" : []
            }
          }
          newObject.delete.ids.push(currentItem.qnaItem.QnAID);
          return newObject; 
        default:
          return null;
      }
      
    },{});

    console.log(updateKBArray); //add the newObject in etoban :) 
    let publishQnAJSOn = JSON.stringify(updateKBArray);
    console.log(publishQnAJSOn);

    this.props.actionHandler.updateQnAMakerKB(
      this.props.properties.endpointUrl,
      this.props.properties.qnAMakerKnowledgeBaseId,
      publishQnAJSOn)
    .then( res => { 
        console.log(res);
        this.props.actionHandler.getQnAMakerItems(
          this.props.properties.endpointUrl,
          this.props.properties.qnAMakerKnowledgeBaseId,
          "test")
        .then(res => {
          let kbItems = JSON.parse(res);
          console.log(kbItems);
          let addedItems = this.state.qnaActionHistory.filter(d => d.action == "add");
          console.log(addedItems );   

          const qnaWithKBID = addedItems.map(addedItem => {
            console.log(addedItem.qnaItem.Id);
            let matchKb = kbItems.qnaDocuments.filter(doc => doc.metadata.length > 0).find(kb => { 
               return kb.metadata[1].value === addedItem.qnaItem.Id.toString() 
            });
           console.log(matchKb);
          addedItem.qnaItem.QnAID = matchKb.id 
           return addedItem
          })

          console.log(qnaWithKBID);
          const qnaWithIds =  qnaWithKBID.filter(items => items.action === "add").map( qna => qna.qnaItem);

          this.props.actionHandler.updateItemInQnAList(this.state.selectedDivisionListName,qnaWithIds);
          this.props.actionHandler.publishQnAMakerItem(this.props.properties.endpointUrl,this.props.properties.qnAMakerKnowledgeBaseId)
          .then(res => {
                this.props.actionHandler.updateQnAListTracking(this.props.properties.qnATrackingListName, this.state.selectedDivisionText,"publish")
              .then(res => {
                this.setState({
                  formView: ViewType.Display,
                  isDataLoaded: false 
                });
              })
          })
         

        }) 
        
    })

  }

  public addNewQuestionToQnAList(item: any): void {
    this.props.actionHandler.addQuestionToQnAList(
      this.props.properties.webUrl,
      this.state.selectedDivisionListName,
      item.row
    );
  }

  public deleteNewQuestion(item: any): void {
    this.props.actionHandler.deleteFromNewQuestion(
      this.props.properties.endpointUrl,
      item.row._original
    );
  }

  public markAsResolved(item: any): void {
    
    this.props.actionHandler.resolveQuestion(
      this.props.properties.endpointUrl,
      item.row._original
    );

    //save the question to sp list as well as the remark in sp list
  }

  public addNewQnaToTable(): void {
    console.log("add inline form");

    let newQnA = {
      //Questions: '[{"label":"","value":""}]',
      Questions: '[]',
      Answer: "",
      Classification: "",
      QnAID: 0,
      Id: null
    };
    let itemAddActionHistory = null;

    this.setState(oldstate => {
      //create identifier for new question row for history
      itemAddActionHistory = {
        qnaItem: { newQnA, identifier: oldstate.qnaItems.length },
        action: "add"
      };
      //return new qnaitems with new question
      return {
        qnaItems: [...oldstate.qnaItems, newQnA]
      };
    });

    this.setState(oldstate => ({
      qnaActionHistory: [...oldstate.qnaActionHistory, itemAddActionHistory]
    }));
  }

  private onSaveClick(): void {

    console.log(this.state.qnaActionHistory, "modified items");

    //check if question, answer, and classifications are null, notify user





    const addItems = this.state.qnaActionHistory.filter(items => items.action === "add").map( qna => qna.qnaItem);
    const modifyItems = this.state.qnaActionHistory.filter(items => items.action === "update").map( qna => qna.qnaItem);
    const deleteItems = this.state.qnaActionHistory.filter(items => items.action === "delete").map( qna => qna.qnaItem);

    console.log(addItems, modifyItems, deleteItems);



    const updatetoList = this.props.actionHandler.updateItemInQnAList(this.state.selectedDivisionListName,modifyItems);
    const deletefromlist = this.props.actionHandler.deleteFromQnAList(this.state.selectedDivisionListName,deleteItems);
    
    addItems.forEach(additem => {
      this.props.actionHandler.addtoQnaList(this.state.selectedDivisionListName,additem).then(result => {
          //update id in qnaHistory
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
          console.log(item);
          qnaActionHistory[historyIndex] = item;
          this.setState({ qnaActionHistory });
      });
    })
    

    Promise.all([updatetoList, deletefromlist]).then(res => {
      this.props.actionHandler.updateQnAListTracking(
        this.props.properties.qnATrackingListName, 
        this.state.selectedDivisionText, "save")
          .then(res => {
            this.setState({
                formView: ViewType.Display,
                selectedDivision: this.state.selectedDivision
              });
              toast.success("QnA Items Saved");
          })
    });
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
              }
            });
      } else {
        this.setState(oldstate => ({
          qnaActionHistory: [...oldstate.qnaActionHistory, itemDeleteActionHistory]
        }));
      }
    } else {
      //item is new so we also need to delete the item from qnaActionHistory state
      let historyArray = [...this.state.qnaActionHistory];
      let index = historyArray.findIndex(d => d.Id == item.row._original.Id);
      historyArray.splice(index, 1);
      this.setState({ qnaActionHistory: historyArray });
    }
   
    //remove from qnaState array
    let array = [...this.state.qnaItems];
    let index = array.findIndex(d => d.Id == item.row._original.Id);
    array.splice(index, 1);
    this.setState({ qnaItems: array });
  }

  public renderEditable = (cellInfo) => {
    return (
      <TextField
        value={cellInfo.original.Answer}
        multiline
        rows={4}
        required={true}
        resizable={true}
        onChanged={data => this.updateQnAAnswer(data, cellInfo.index)}
      />
    );
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
      }

     // console.log(this.state.qnaActionHistory, "actionhistory");
      //check if item exist in action history
     historyIndex = this.state.qnaActionHistory.findIndex( data => data.qnaItem.identifier == index);

    } else  {
      //item has id so edit
      historyItem = {
        qnaItem: { ...item },
        action: "update"
      }
      //console.log(this.state.qnaActionHistory, "actionhistory");
      //check if item exist in action history
      historyIndex = this.state.qnaActionHistory.findIndex( data => data.qnaItem.Id == item.Id);

    }

    if (historyIndex >= 0) {
      //item exist in history
      this.setState(oldState => {
            let history = [...oldState.qnaActionHistory]
            history[historyIndex] = historyItem 
            return {
              qnaActionHistory: history
            }
          });
    } else {
      //create new index
      this.setState(oldstate => ({
        qnaActionHistory: [...oldstate.qnaActionHistory, historyItem]
      }));
    }
  }

  public updateQnAAnswer = (data, index) => {
    //console.log(data)
    let qnaItems = [...this.state.qnaItems];
    let item = {
      ...qnaItems[index],
      Answer: data, 
    };
    qnaItems[index] = item;
    this.setState({ qnaItems });

    this.updateActionHistory(item,index);
  }

  public updateQuestions = (data, index) => {
    //console.log(data, index, "update question");

    let qnaItems = [...this.state.qnaItems];
    let item = {
      ...qnaItems[index],
      Questions: JSON.stringify(data)
    };
    qnaItems[index] = item;
    this.setState({ qnaItems });

    this.updateActionHistory(item,index);
  }

  public updateClassification = (data, index) => {
    let qnaItems = [...this.state.qnaItems];
    let item = {
      ...qnaItems[index],
      Classification: data //JSON.stringify(data)
    };
    qnaItems[index] = item;
    this.setState({ qnaItems });

    this.updateActionHistory(item,index);
  }

  renderQuestionsEdit = cellInfo => {
    // console.log(cellInfo.original);
    let parsedQ = JSON.parse(cellInfo.original.Questions);
    // console.log(parsedQ)
    return (
      <QuestionInput
        value={parsedQ}
        onChange={data => this.updateQuestions(data, cellInfo.index)}
      />
    );
  }

  renderQuestionsDisplay(cellInfo) {
    let parsedQ = JSON.parse(cellInfo.original.Questions);
    return parsedQ.map(question => {
      return (
        <div>
          <span style={{ border: "#000" }}> {question.label} </span>
        </div>
      );
    });
  }

  renderQuestionsPublish(cellInfo) {
    //console.log(cellInfo.original.qnaItem.Questions);
    let parsedQ = JSON.parse(cellInfo.original.qnaItem.Questions);
    return parsedQ.map(question => {
      return (
        <div>
          <span style={{ border: "#000" }}> {question.label} </span>
        </div>
      );
    });
  }

  renderEditableDropdown = cellInfo => {

    let selectedItemOption = {"text": cellInfo.original.Classification , "key": cellInfo.original.Classification};

    return (
      <QnAClassificationInput
        value={selectedItemOption}
        onChange={data => this.updateClassification(data, cellInfo.index)}
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
    const { selectedDivision } = this.state;

    // console.log("new row added", this.state.qnaItems);
    // console.log("aciton history", this.state.qnaActionHistory);
    switch (this.state.formView) {
      case ViewType.Edit:
        return (
          <div>
            <ToastContainer />
            <div className={styles.controlMenu}>
              <span> Division: {this.state.selectedDivisionText} </span>

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
            <div>New Questions </div>
            <span> Filter New Questions: </span>
            <input value={this.state.filterAll} onChange={this.filterAll} />
            <ReactTable
              PaginationComponent={Pagination}
              data={this.state.newQuestions}
              //filtered={this.state.filtered}
              defaultPageSize={10}
              className="-striped -highlight"
              //onFilteredChange={this.onFilteredChange.bind(this)}
              //filterable
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
                        </div>
                      ) //onClick={this.addToQnAList({row})}
                    }
                  ]
                }
              ]}
              
            />
            <br />
            <DefaultButton
              text="Add QnA Pair"
              primary={true}
              href="#"
              onClick={this.addNewQnaToTable}
            />
            <div> QnA </div>
            Filter QnA:
            <input value={this.state.filterAll} onChange={this.filterAll} />
            <ReactTable
              data={this.state.qnaItems}
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
                      Cell: this.renderEditable
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
                           {/* <div>{row.row._original.Id}</div> */}
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
            <br />
          </div>
        );
      case ViewType.Display:
        return (
          <div>
            <ToastContainer />
            <div className={styles.controlMenu}>
              <span> Division: </span>

              <Dropdown
                placeHolder="Select Division"
                id="division"
                options={this.state.division}
                selectedKey={
                  selectedDivision ? selectedDivision.key : undefined
                }
                onChanged={this.setDivisionDD}
              />
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
            <div>New Questions </div>
            Filter New Questions:{" "}
            <input value={this.state.filterAll} onChange={this.filterAll} />
            <ReactTable
              PaginationComponent={Pagination}
              data={this.state.newQuestions}
              //resolveData={this.state.newQuestions => this.state.newQuestions.map(row => row)}
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
            <br />
            <div> QnA </div>
            Filter QnA:{" "}
            <input value={this.state.filterAll} onChange={this.filterAll} />
            <ReactTable
              data={this.state.qnaItems}
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
                      accessor: "Answer"
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
            <br />
          </div>
        );
      case ViewType.Publish:
     
        return ( 
          <div>
            <ToastContainer />
            {this.state.isLoading && <div className={styles.loading}>Processing...</div>}
            <div className={styles.controlMenu}>
              <span> Division: {this.state.selectedDivisionText} </span>

              <DefaultButton
                text="Publish"
                primary={true}
                href="#"
                onClick={this.publishQnA}
              />
            </div>
            <div>{/*updatedQnA*/}
              <ReactTable 
                data={this.state.qnaActionHistory } 
                PaginationComponent={Pagination}
                columns={[
                  {
                    columns: [
                      {
                        Header: "Questions",
                        accessor: "qnaItem.Questions",
                        Cell: this.renderQuestionsPublish
                      },
                      {
                        Header: "Answer",
                        accessor: "qnaItem.Answer"
                      },
                      {
                        Header: "Classification",
                        accessor: "qnaItem.Classification"
                      },
                      {
                        Header: "Change Type",
                        accessor: "action"
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
      default:
        return null;
    }
  }
}
