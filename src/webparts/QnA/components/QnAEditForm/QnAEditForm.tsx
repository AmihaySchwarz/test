import * as React from "react";
import styles from "../QnAForm/QnAForm.module.scss";
import { IQnAEditFormProps, IQnAEditFormState } from "./IQnAEditFormProps";
import { LoadingSpinner } from "../../../common/components/LoadingSpinner";
import { ViewType } from "../../../common/enum";
import ReactTable from "react-table";
import "react-table/react-table.css";
import { Pagination } from "../Pagination/Pagination";
import { DefaultButton } from "office-ui-fabric-react/lib/Button";
import { TextField } from "office-ui-fabric-react/lib/TextField";
import { QnAPreviewPanel } from "../QnAPreviewPanel/QnAPreviewPanel";
import QuestionInput from "../QnAQuestionInput/QuestionInput";
import QnAAnswerInput from "../QnAAnswerInput/QnAAnswerInput";
import QnAClassificationInput from "../QnAClassificationInput/QnAClassificationInput";
import ReAssignDivision from "../ReAssignDivision/ReAssignDivision";
import Moment from "react-moment";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import * as _ from "lodash";
//import * as _ from "underscore";
import Modal from "react-responsive-modal";
import {
  Tooltip,
} from 'react-tippy';
import Floater from 'react-floater';
import RemarksPanel  from "../RemarksPanel/RemarksPanel";


const modalStyle = {
  content: {
    width: '40%',
    maxWidth: '40rem'
  }
};

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
      newQuestions: [],
      currentUser: props.currentUser, 
      qnaActionHistory: [],
      qnaOriginalCopy: [],
      searchNewq: "",
      searchQnA: "",
      openModal: false,
      nqForRemarks: undefined,
      reassignModal: false,
      nqNewDivision: undefined
    };

    this.onSaveClick = this.onSaveClick.bind(this);
    this.onBackClick = this.onBackClick.bind(this);
    this.addNewQuestionToQnAList = this.addNewQuestionToQnAList.bind(this);
    this.saveAndChangeToPublish = this.saveAndChangeToPublish.bind(this);
    this.addNewQnaToTable = this.addNewQnaToTable.bind(this);
    this.updateLockReleaseTimeIncrementally = this.updateLockReleaseTimeIncrementally.bind(this);
    this.updateActionHistory = this.updateActionHistory.bind(this);
    this.deleteQnA = this.deleteQnA.bind(this);
    this.lockList = this.lockList.bind(this);
  }

  public componentWillReceiveProps(newProps): void {
      console.log(newProps, "will receive props");
    if (
      newProps.defaultDivision
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
      setInterval(this.updateLockReleaseTimeIncrementally, 15 * 60 * 1000); //15 * 60 * 1000
    }
  }

  public componentDidMount(): void {
    console.log(this.props, "did mount");
    if (
        this.props.defaultDivision
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
        setInterval(this.updateLockReleaseTimeIncrementally, 15 *  60 * 1000); //15 * 60 * 1000
      }

  }


  public updateLockReleaseTimeIncrementally(){
    //update the lockrelease time every 15 min
    console.log("updating the lock release time");
    this.props.actionHandler.updateLockReleaseTime(this.state.currentUser,this.state.selectedDivisionText,this.props.properties.qnATrackingListName);
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
    this.setState({
      newQuestions: newQuestionItems.filter(nq => nq.Status !== "Resolved"),
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
      let isQuestionNull = addItems.some(q =>  q.Questions == "[]") || modifyItems.some(q => q.Questions == "[]"); 

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

          //if an item already has an ID do not save again instead change action to update
          if(additem.Id == null ) {
            promises.push(
              this.props.actionHandler.addtoQnaList(this.state.selectedDivisionListName,additem)
              .then(result => { 
                  console.log(result.data.Id);
                  //const historyIndex = this.state.qnaActionHistory.findIndex(data => data.qnaItem.identifier == additem.identifier);
                  const historyIndex = _.findIndex(this.state.qnaActionHistory,data => data.qnaItem.identifier == additem.identifier);
  
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
          } 
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
                  this.lockList();
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

  public lockList() {
    this.props.actionHandler
      .lockList(
        this.state.currentUser,
        this.state.selectedDivisionText,
        this.props.properties.qnATrackingListName
      )
      .then();
  }

  private onBackClick() : void {
    //call cervice to remove locked by
    this.props.actionHandler.removeLockedBy(this.state.currentUser,
      this.state.selectedDivisionText,
      this.props.properties.qnATrackingListName);
    this.props.onBackClick();
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
      let isClassificationNull = addItems.some(c => c.Classification == "") || 
                                  addItems.some(c => _.isEmpty(c.Classification)) ||  
                                  modifyItems.some(c => c.Classification == "") ||
                                  modifyItems.some(c => _.isEmpty(c.Classification));
      let isAnswerNull = addItems.some(a => a.Answer == "") || modifyItems.some(a => a.Answer == "");
      let isQuestionNull = addItems.some(q =>  q.Questions == "[]") || modifyItems.some(q => q.Questions == "[]"); 


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


          //if an item already has an ID do not save again instead change action to update
          if(additem.Id == null) {
            promises.push(
              this.props.actionHandler.addtoQnaList(this.state.selectedDivisionListName,additem)
              .then(result => { 
                  console.log(result.data.Id);
                  //const historyIndex = this.state.qnaActionHistory.findIndex(data => data.qnaItem.identifier == additem.identifier);
                  const historyIndex = _.findIndex(this.state.qnaActionHistory,data => data.qnaItem.identifier == additem.identifier);
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
          }
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
    //let newQnA = null;
    let itemAddActionHistory = null;
    let identifierNum = parseInt(Math.random().toString().slice(2,11));
    //this.setState(oldstate => {
     
      //return new qnaitems with new question
      // return {
      //   qnaItems: [...oldstate.qnaItems, newQnA],
      //   isLoading: false
      // };
      let newQnA = {
        Questions: '[ {"label": "'+ item.row.Question +'", "value": "'+ item.row.Question +'" }]',
        Answer: "",
        Classification: "",
        QnAID: 0,
        Id: null,
        Remarks: "",
        identifier: identifierNum
      };
       //create identifier for new question row for history
       itemAddActionHistory = {
        qnaItem: { newQnA, identifier: identifierNum}, //oldstate.qnaItems.length 
        action: "add"
      };
    //});


    const insert = (arr, index, newItem) => [
      // part of the array before the specified index
      ...arr.slice(0, index),
      // inserted item
      newItem,
      // part of the array after the specified index
      ...arr.slice(index)
    ];

    this.setState(oldstate => ({
      qnaActionHistory: [...oldstate.qnaActionHistory, itemAddActionHistory],
      //qnaItems: [...oldstate.qnaItems, newQnA],
      qnaItems: insert(oldstate.qnaItems, 0, newQnA),
      isLoading: false
    }));
  }

  public deleteNewQuestion(item: any): void {
    this.props.actionHandler.deleteFromNewQuestion(
      this.props.properties.endpointUrl,
      item.row._original
    );
  }

  public onCloseModal = () => {
    this.setState({ openModal: false });
  }

  public onCloseReassignModal = () => {
    this.setState({ reassignModal: false });
  }

  public updateRemarks(data:any, newQ: any): void {
    console.log("remarks", data,newQ);

    if (_.isEmpty(data)){
      toast.error("Remarks is empty");
    } else {
       try {
        this.setState({isLoading: true});
        this.props.actionHandler.resolveQuestion(
          this.props.properties.endpointUrl,
          newQ._original,
          data,
          this.state.currentUser
        ).then(res => {
          this.loadNewQuestionsData(this.props.defaultDivision.text);
          toast.info(res);
          this.setState({isLoading: false});
        });
    }catch (error) {
      console.log(error);      
      toast.error("an error has occured");
      this.setState({isLoading: false});
    }
      this.setState({ openModal: false });
    }
  }

  public markAsResolved(item: any): void {
     this.setState({ openModal: true, nqForRemarks: item.row}); 
  }

  public updateNewQuestionDivision(data:any, newQ: any): void {
    console.log("new division", data, newQ);
    try {
      this.setState({isLoading: true});
      this.props.actionHandler.reassignQuestion(
        this.props.properties.endpointUrl,
        newQ._original,
        data
      ).then(res => {
        this.loadNewQuestionsData(this.props.defaultDivision.text);
        toast.info(res);
        this.setState({isLoading: false});
        this.setState({ reassignModal: false });
      });
    }catch (error) {
      console.log(error);      
      toast.error("an error has occured");
      this.setState({isLoading: false});
    }
      
  }

  public reassignQuestion(item: any): void {
    console.log(item);
    this.setState({ reassignModal: true, nqNewDivision: item.row}); 
  }


  public addNewQnaToTable(): void {
    console.log("add inline form");

   // let newQnA = null;
    let itemAddActionHistory = null;
    let identifierNum = parseInt(Math.random().toString().slice(2,11));
    //this.setState(oldstate => {

      //return new qnaitems with new question
      // return {
      //   qnaItems: [...oldstate.qnaItems, newQnA]
      // };
      let newQnA = {
        Questions: '[]',
        Answer: "",
        Classification: "",
        QnAID: 0,
        Id: null,
        Remarks: "",
        identifier: identifierNum
      };
      
      //create identifier for new question row for history
      itemAddActionHistory = {
        qnaItem: { newQnA, identifier: identifierNum},
        action: "add"
      };
    //});

    const insert = (arr, index, newItem) => [
      // part of the array before the specified index
      ...arr.slice(0, index),
      // inserted item
      newItem,
      // part of the array after the specified index
      ...arr.slice(index)
    ];
    
    console.log(newQnA);
    this.setState(oldstate => ({
      qnaActionHistory: [...oldstate.qnaActionHistory, itemAddActionHistory],
     // qnaItems: [...oldstate.qnaItems, newQnA]
     qnaItems: insert(oldstate.qnaItems, 0, newQnA)
    }));
  }

  

  public deleteQnA(item: any): void {
    if (item.row._original.Id !== null){
      let itemDeleteActionHistory = {
        qnaItem: item.row._original,
        action: "delete"
      };

      console.log(this.state.qnaActionHistory);
      //const historyIndex = this.state.qnaActionHistory.findIndex(data => data.qnaItem.Id == item.row._original.Id);
      const historyIndex = _.findIndex(this.state.qnaActionHistory,data => data.qnaItem.Id == item.row._original.Id);


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
      //let index = array.findIndex(d => d.Id == item.row._original.Id);
      let index = _.findIndex(array,d => d.Id == item.row._original.Id);

      array.splice(index, 1);
      this.setState({ qnaItems: array });

    } else {
      //item is new so we also need to delete the item from qnaActionHistory state
      let historyArray = [...this.state.qnaActionHistory];
      //let histIndex = historyArray.findIndex(d => d.qnaItem.identifier == item.row._original.identifier);
      let histIndex = _.findIndex(historyArray,d => d.qnaItem.identifier == item.row._original.identifier);

      historyArray.splice(histIndex, 1);
      this.setState({ qnaActionHistory: historyArray });

      //remove from qnaState array
      let array = [...this.state.qnaItems];
      //let index = array.findIndex(d => d.identifier == item.row._original.identifier);
      let index = _.findIndex(array,d => d.identifier == item.row._original.identifier);
      array.splice(index, 1);
      this.setState({ qnaItems: array });
    }
  }

  public updateActionHistory(item, index) {
    let historyItem;
    let historyIndex;

    //console.log(item);
    const itemId = item.Id;
    if((itemId == null)){
      //item does not have id, so add
      historyItem = {
        qnaItem: { ...item, identifier: item.identifier }, //index
        action: "add"
      };

     // console.log(this.state.qnaActionHistory, "actionhistory");
      //check if item exist in action history
     //historyIndex = this.state.qnaActionHistory.findIndex( data => data.qnaItem.identifier == item.identifier); //index
     historyIndex = _.findIndex(this.state.qnaActionHistory, data => data.qnaItem.identifier == item.identifier); //index

    } else  {
      //console.log(this.state.qnaActionHistory, "actionhistory");
      //item has id so edit
      historyItem = {
        qnaItem: { ...item },
        action: "update"
      };
     
      //check if item exist in action history
      //historyIndex = this.state.qnaActionHistory.findIndex( data => data.qnaItem.Id == item.Id);
      historyIndex = _.findIndex(this.state.qnaActionHistory,data => data.qnaItem.Id == item.Id);

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

  public getText = (html) => {
    var tmp = document.createElement('div');
    tmp.innerHTML = html;
    
    return tmp.textContent || tmp.innerText;
}


  public updateQnAAnswer = (data, cellInfo) => {
    //console.log(data)

    let qnaItems = [...this.state.qnaItems];
    let index;
    if(cellInfo.original.Id != null){
      //index = qnaItems.findIndex(d => d.Id == cellInfo.original.Id);
      index = _.findIndex(qnaItems,d => d.Id == cellInfo.original.Id);
    } else {
       //index = qnaItems.findIndex(d => d.identifier == cellInfo.original.identifier);
       index = _.findIndex(qnaItems,d => d.identifier == cellInfo.original.identifier);
    }

    if(this.getText(data) !== this.getText(cellInfo.original.Answer)){
     // console.log(this.getText(data), "====", this.getText(cellInfo.original.Answer));
      let item = {
        ...qnaItems[index],
        Answer: data, 
      };
      qnaItems[index] = item;
      this.setState({ qnaItems });
  
      this.updateActionHistory(item,index);
    }

   
  }

  public updateQnARemarks = (data, cellInfo) => {
    //console.log(data)

    let qnaItems = [...this.state.qnaItems];
    let index;
    if(cellInfo.original.Id != null){
      //index = qnaItems.findIndex(d => d.Id == cellInfo.original.Id);
      index = _.findIndex(qnaItems,d => d.Id == cellInfo.original.Id);
    } else {
       //index = qnaItems.findIndex(d => d.identifier == cellInfo.original.identifier);
       index = _.findIndex(qnaItems,d => d.identifier == cellInfo.original.identifier);
    }

    let item = {
      ...qnaItems[index],
      Remarks: data, 
    };
    qnaItems[index] = item;
    this.setState({ qnaItems });

    this.updateActionHistory(item,index);
  }

  public updateQuestions = (data, cellInfo) => {
    console.log(data, cellInfo, "update question");

    let array = [...this.state.qnaItems];
    let index;
    if(cellInfo.original.Id != null){
      //index = array.findIndex(d => d.Id == cellInfo.original.Id);
      index = _.findIndex(array,d => d.Id == cellInfo.original.Id);
    } else {
       //index = array.findIndex(d => d.identifier == cellInfo.original.identifier);
       index = _.findIndex(array,d => d.identifier == cellInfo.original.identifier);
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
      //index = qnaItems.findIndex(d => d.Id == cellInfo.original.Id);
      index = _.findIndex(qnaItems,d => d.Id == cellInfo.original.Id);
    } else {
       //index = qnaItems.findIndex(d => d.identifier == cellInfo.original.identifier);
       index = _.findIndex(qnaItems,d => d.identifier == cellInfo.original.identifier);
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

    const style = _.isEmpty(cellInfo.original.Answer) ? {}  : {display: 'none'};
    //console.log(cellInfo.original.Answer);
    
    return (
      <div>
        <QnAAnswerInput 
            value={cellInfo.original.Answer} 
            onChange={data => this.updateQnAAnswer(data, cellInfo)}
        />
      </div>
    );

    // return (
    //   <div>
    //     <TextField
    //       value={cellInfo.original.Answer}
    //       multiline
    //       rows={4}
    //       //required={true}
    //       resizable={true}
    //       onChanged={data => this.updateQnAAnswer(data, cellInfo)}
    //     />
    //     <span className={styles.requiredLabel} style={style}>* required </span> 
    //   </div>
    // );
  }

  public renderEditableRemarks = (cellInfo) => {

    return (
      <div>
        <TextField
          value={cellInfo.original.Remarks}
          //multiline
          //rows={4}
          //required={true}
          //resizable={true}
          onChanged={data => this.updateQnARemarks(data, cellInfo)}
        />
        
      </div>
     
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

    let QnACpyLength = (QnACpy) ? QnACpy.length : 0; 

    let NewQLength = (newQuestions) ? newQuestions.length : 0;
    let newQPgSize = (NewQLength > 10) ? 5 : NewQLength;


    //console.log(this.state.qnaItems, "origi", QnACpy);
    
      // if (this.state.searchQnA) {
      //   QnACpy = QnACpy.filter(row => {
      //     return row.Answer.includes(this.state.searchQnA) || 
      //     row.Questions.includes(this.state.searchQnA) || 
      //     row.Classification == this.state.searchQnA;
      //   });
      // }

      if (this.state.searchQnA) {
        QnACpy = QnACpy.filter(row => {
          return row.Answer.toLowerCase().includes(this.state.searchQnA.toLowerCase()) || 
          row.Questions.toLowerCase().includes(this.state.searchQnA.toLowerCase()) || 
          row.Classification.toLowerCase() == this.state.searchQnA.toLowerCase(); //||
         // row.Remarks.toLowerCase().includes(this.state.searchQnA.toLowerCase());
        });
      }


        // if (this.state.searchNewq) {
        //   newQuestions = newQuestions.filter(row => {
        //     return row.Question.includes(this.state.searchNewq) || 
        //     row.PostedBy.includes(this.state.searchNewq) || 
        //     String(row.PostedDate).includes(this.state.searchNewq);
        //   });
        // }

        if (this.state.searchNewq) {
          newQuestions = newQuestions.filter(row => {
            return row.Question.toLowerCase().includes(this.state.searchNewq.toLowerCase()) || 
            row.PostedBy.toLowerCase().includes(this.state.searchNewq.toLowerCase()) || 
            String(row.PostedDate).toLowerCase().includes(this.state.searchNewq.toLowerCase());
          });
        }

        return (
          <div>
            
            {this.state.isLoading && <LoadingSpinner />}
            {/* <ToastContainer /> */}
            {/* <Link activeClass="active" className="test1" to="test1" spy={true} smooth={true} duration={500} >Test Scroll</Link> */}
            <div className={styles.controlMenu}>
              <div className={styles.dropdownCont}>
                <span className={styles.divisionLabel}> Division: {this.state.selectedDivisionText} </span>
              </div>
              <div className={styles.actionButtons}>
                <DefaultButton 
                  text="Back"
                  primary={true}
                  onClick={this.onBackClick}
                />
                <DefaultButton 
                  text="Save"
                  primary={true}
                  onClick={this.onSaveClick}
                  disabled={this.state.qnaActionHistory.length === 0}
                />
                <DefaultButton
                  text="Save and Preview Changes"
                  primary={true}
                  href="#"
                  onClick={this.saveAndChangeToPublish}
                  disabled={this.state.qnaActionHistory.length === 0}
                />
              </div>
            </div>
            
            <div className={styles.tableCont}>
              <div className={styles.tableLabels}>New Questions </div>
              {this.state.newQuestions.length > 0 ? ( 
                <div> 
                  <div className={styles.searchCont}> 
                    <span>Search: </span>
                    <input className={styles.searchtxtBox}
                      value={this.state.searchNewq}
                      onChange={e => this.setState({searchNewq: e.target.value})}
                    />
                  </div>
                  <ReactTable
                    PaginationComponent={Pagination}
                    data={newQuestions} //this.state.newQuestions
                    defaultPageSize={newQPgSize}
                    //pageSize={this.state.newQuestions.length}
                    className="-striped -highlight"
                    // filtered={this.state.filtered}
                    // onFilteredChange={this.onFilteredChange.bind(this)}
                    // filterable
                    columns={[
                      {
                        columns: [
                          {
                            Header: "Question",
                            accessor: "Question",
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
                            accessor: "PostedBy",
                            sortable: false 
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
                                </button>
                                <br />
                                {/* <button onClick={()=>this.deleteNewQuestion({row})}>Delete Question</button><br /> */}
                                <button onClick={() => this.markAsResolved({ row })}>
                                  Mark as Resolved
                                </button>
                                <div className={styles.modalWindow}>
                                  <Modal styles={{width:'50%'}} open={this.state.openModal} onClose={this.onCloseModal} center>
                                    <RemarksPanel item={this.state.nqForRemarks} onSubmitRemarks={data => this.updateRemarks(data,this.state.nqForRemarks)} />
                                  </Modal>
                                </div>
                               
                                <button onClick={() => this.reassignQuestion({row})}>
                                  Reassign to Other Division
                                </button>
         
                                <Modal styles={modalStyle} open={this.state.reassignModal} onClose={this.onCloseReassignModal} center>
                                  <div className={styles.dialogContent} ref='content'>
                                    <ReAssignDivision defaultDivision={this.state.selectedDivisionText} item={this.state.nqNewDivision} 
                                    divisionList={this.state.division} onSubmitReAssign={data => this.updateNewQuestionDivision(data,this.state.nqNewDivision)} />  
                                  </div>
                                  
                                </Modal>


                              </div>
                            ) 
                          }
                        ]
                      }
                    ]}
                    
                  />
                </div>
              ):(
                <div>
                  <span className={styles.notificationText}> There are no New Questions from the Database </span>
                </div> 
              )}
              
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
              <div className={styles.tableLabels}> QnA </div>
              <div className={styles.searchCont}> 
                <span>Search: </span>
                <input className={styles.searchtxtBox}
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
                        Cell: this.renderQuestionsEdit,
                        filterable: false,
                        sortable: false,
                        width: 200
                      },
                      {
                        Header: "Answer",
                        accessor: "Answer",
                        Cell: this.renderEditableAnswer,
                        filterable: false,
                        sortable: false ,
                        width: 200
                      },
                      {
                        Header: "Classification",
                        accessor: "Classification",
                        Cell: this.renderEditableDropdown,
                        sortable: false
                      },
                      {
                        Header: "Remarks",
                        accessor: "Remarks",
                        Cell: this.renderEditableRemarks,
                        filterable: false,
                        sortable: false
                      },
                      {
                        Header: "Actions",
                        accessor: "Actions",
                        filterable: false,
                        sortable: false, 
                        Cell: ({ row, index }) => (
                          <div>
                            <button onClick={() => 
                            this.deleteQnA({ row })
                          }>
                              Delete Question
                            </button> <br />

                             <Tooltip 
                                popperOptions={{
                                  modifiers: {
                                    preventOverflow: {
                                      priority: ['bottom', 'top'],
                                      boundariesElement: "scrollParent"
                                    }
                                  }
                                }}
                                position="left-end"                              
                                trigger="click" 
                                //interactive
                                arrow      
                                offset={0}     
                                sticky={true}
                                stickyDuration={0}             
                                html= {<div><QnAPreviewPanel qnaItem={row} /></div>}
                            >
                              <button>Preview</button>
                            </Tooltip>

                            {/* <Floater
                              
                              content={
                                <div>
                                  <QnAPreviewPanel qnaItem={row} />
                                </div>
                              }
                             // open={this.state.openTooltip}
                              placement="left-end"
                              offset={0}
                              styles={{
                                tooltip: {
                                  filter: "none"
                                },
                                container: {
                                  backgroundColor: "#FFF",
                                  width: "272px",
                                  height: "377px",
                                  padding: "0px"
                                }
                              }}
                            >
                              <button>Preview</button>
                            </Floater> */}
                          </div>
                        )
                      }
                    ]
                  }
                ]}
                defaultPageSize={10}
                //pageSize={QnACpyLength}
                className="-striped -highlight"
              />

            </div>
          </div>
        );
    }
}