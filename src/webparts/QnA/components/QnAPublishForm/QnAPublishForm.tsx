import * as React from "react";
import styles from "../QnAForm/QnAForm.module.scss";
import { IQnAPublishFormProps, IQnAPublishFormState } from "./IQnAPublishFormProps";
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

export class QnAPublishForm extends React.Component<IQnAPublishFormProps, IQnAPublishFormState> {
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
      formView: ViewType.Display,
      newQuestions: [],
      inputValue: "",
      listTrackingItem: undefined,
      currentUser: props.currentUser,
      qnaActionHistory: [],
      qnaOriginalCopy: [],
      searchNewq: "",
      searchQnA: ""
    };

    this.publishQnA = this.publishQnA.bind(this);
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
    }
  }

  public publishQnA(): void {
    let formatItem;
    this.setState({isLoading: true });
    const updateKBArray = this.state.qnaActionHistory.reduce((newObject,currentItem)=>{
      console.log(currentItem);
      switch(currentItem.action){
        case "add":
          if(!newObject.add){
            newObject["add"] = {
              "qnaList" : []
            };
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
           let updatedQuestions = JSON.parse(currentItem.qnaItem.Questions);
           //Find values that are in result1 but not in result2           
          // let deletedQuestions = origQuestions.filter(function(obj) {
          //   return !updatedQuestions.some(function(obj2) {
          //       return obj.value == obj2.value;
          //   });
          // });

          let deletedQuestions = origQuestions.filter( 
            obj => !updatedQuestions.some(obj2 => obj.value == obj2.value));
          console.log(deletedQuestions);
          //Find values that are in result2 but not in result1
          // let addedQuestions = updatedQuestions.filter(function(obj) {
          //   return !origQuestions.some(function(obj2) {
          //       return obj.value == obj2.value;
          //   });
          // });
          let addedQuestions = updatedQuestions.filter(
            obj => !origQuestions.some(obj2 => obj.vale == obj2.value));

          console.log(addedQuestions);
          if(!newObject.update){
            newObject["update"] = {
              "qnaList" : []
            };
          }
          formatItem = {
            id : currentItem.qnaItem.QnAID,
            answer: currentItem.qnaItem.Answer,
            source: "Editorial", //placeholder where should we get this
            questions: {},
          };

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
            };
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
    .then( result => { 
        console.log(result);
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
               return kb.metadata[1].value === addedItem.qnaItem.Id.toString(); 
            });
           console.log(matchKb);
          addedItem.qnaItem.QnAID = matchKb.id; 
           return addedItem;
          });

          console.log(qnaWithKBID);
          const qnaWithIds =  qnaWithKBID.filter(items => items.action === "add").map( qna => qna.qnaItem);

          this.props.actionHandler.updateItemInQnAList(this.state.selectedDivisionListName,qnaWithIds);

          this.props.actionHandler.publishQnAMakerItem(
            this.props.properties.endpointUrl,
            this.props.properties.qnAMakerKnowledgeBaseId)
          .then(r => {
                this.props.actionHandler.updateQnAListTracking(this.props.properties.qnATrackingListName, this.state.selectedDivisionText,"publish")
              .then(resp => {
                toast.success("KB Successfully published");
                this.setState({
                  formView: ViewType.Display,
                  isLoading: false,
                  qnaActionHistory: []
                });
              });
          });
        }); 
    });
  }


  public renderQuestionsPublish(cellInfo) {
    let parsedQ = JSON.parse(cellInfo.original.qnaItem.Questions);
    return parsedQ.map(question => {
      return (
        <div>
          <span style={{ border: "#000" }}> {question.label} </span>
        </div>
      );
    });
  }


  public render() {
    const { selectedDivision } = this.state;
    let newQuestions = this.state.newQuestions; 
    let QnACpy = this.state.qnaItems;

        return ( 
          <div>
            <ToastContainer />
            {this.state.isLoading && <LoadingSpinner />}
            <div className={styles.controlMenu}>
              <div className={styles.dropdownCont}>
                <span className={styles.divisionLabel}> Division: {this.state.selectedDivisionText} </span>
              </div>
              <div className={styles.actionButtons}>
                <DefaultButton
                  text="Publish"
                  primary={true}
                  href="#"
                  onClick={this.publishQnA}
                />
              </div>
            </div>
            <div className={styles.tableCont}>{/*updatedQnA*/}
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
  }
}
