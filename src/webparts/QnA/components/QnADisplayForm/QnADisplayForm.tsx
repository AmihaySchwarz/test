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
import { TextField } from "office-ui-fabric-react/lib/TextField";
import { QnAPreviewPanel } from "../QnAPreviewPanel/QnAPreviewPanel";
import ReactTooltip from "react-tooltip";
import QuestionInput from "../QnAQuestionInput/QuestionInput";
import QnAClassificationInput from "../QnAClassificationInput/QnAClassificationInput";
import Moment from "react-moment";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import * as _ from "lodash";

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
    this.publishQnA = this.publishQnA.bind(this);
    this.changeToPublish = this.changeToPublish.bind(this);
  }

  public componentWillReceiveProps(newProps): void {
    console.log(newProps)
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
                //pass state of newQuestions, qnaItems, selected Division
                this.props.onEditClick(this.state.selectedDivision, this.state.qnaItems, this.state.qnaItems);
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
                  selectedDivision: this.state.selectedDivision,
                  isLoading: false
                });
                //pass state of selectedDiv, qnaHsitory
                this.props.onPublishClick(this.state.selectedDivision, this.state.qnaActionHistory);
              }
            });
        }
      });


    
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

  public renderQuestionsPublish(cellInfo) {
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
          return row.Answer.includes(this.state.searchQnA) || row.Questions.includes(this.state.searchQnA) || row.Classification.includes(this.state.searchQnA)
        })
      }

      if (this.state.searchNewq) {
        newQuestions = newQuestions.filter(row => {
          return row.Question.includes(this.state.searchNewq) || row.PostedBy.includes(this.state.searchNewq) || String(row.PostedDate).includes(this.state.searchNewq)
        })
      }
        return (
          <div>
            <ToastContainer />
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
           </div>
          </div>
        );
    }
}
