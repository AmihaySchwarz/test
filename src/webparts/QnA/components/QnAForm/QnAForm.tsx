import * as React from "react";
import styles from "./QnAForm.module.scss";
import { IQnAFormProps, IQnAFormState } from "./IQnAFormProps";
import { DialogHeader } from "../../../common/components/DialogHeader";
import { LoadingSpinner } from "../../../common/components/LoadingSpinner";
import { ViewType } from "../../../common/enum";
import { escape } from "@microsoft/sp-lodash-subset";
import ReactTable from "react-table";
import "react-table/react-table.css";
import { Pagination } from "./Pagination";
import { Fabric } from "office-ui-fabric-react/lib/Fabric";
import { DefaultButton } from "office-ui-fabric-react/lib/Button";
import {
  Dropdown,
  IDropdown,
  DropdownMenuItemType,
  IDropdownOption
} from "office-ui-fabric-react/lib/Dropdown";
import { TextField } from "office-ui-fabric-react/lib/TextField";
import { QnAActionHandler } from "../QnAContainer/QnAActionHandler";
import { INewQuestions } from "../../models/INewQuestions";
import { ThemeSettingName } from "@uifabric/styling/lib";
import CreatableSelect from "react-select/lib/Creatable";
import { QnAPreviewPanel } from "../QnAPreviewPanel/QnAPreviewPanel";
import ReactTooltip from "react-tooltip";
import QuestionInput from "../QnAQuestionInput/QuestionInput";
import QnAClassificationInput from "../QnAClassificationInput/QnAClassificationInput";
import Moment from "react-moment";

export class QnAForm extends React.Component<IQnAFormProps, IQnAFormState> {
  constructor(props) {
    super(props);
    console.log(props);
    this.state = {
      question: [],
      answers: "",
      classification: "",
      division: [],
      selectedDivision: undefined,
      selectedDivisionText: "",
      selectedDivisionListName: "",
      qnaItems: [],
      isDataLoaded: false,
      filtered: "",
      filterAll: "",
      isEdit: false,
      isPublish: false,
      formView: ViewType.Display,
      newQuestions: props.newQuestions,
      //updatedQna: undefined,
      newQuestion: undefined,
      inputValue: "",
      listTrackingItem: undefined,
      currentUser: props.currentUser,
      qnaActionHistory: []
    };

    this.filterAll = this.filterAll.bind(this);
    this.changeToEdit = this.changeToEdit.bind(this);
    this.onSaveClick = this.onSaveClick.bind(this);
    // this.renderEditable = this.renderEditable.bind(this);
    this.addNewQuestionToQnAList = this.addNewQuestionToQnAList.bind(this);
    this.changeToPublish = this.changeToPublish.bind(this);
    this.publishQnA = this.publishQnA.bind(this);
    this.addNewQnaToTable = this.addNewQnaToTable.bind(this);
  }

  public componentDidMount() {
    // console.log("component did mount in form!");
  }
  public componentWillReceiveProps(newProps): void {
    // console.log(newProps, "in recevied props");

    if (
      newProps.masterItems.length !== 0 &&
      newProps.newQuestions.length !== 0
    ) {
      // console.log(newProps.defaultDivision)
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
      isDataLoaded: true
    });
  }

  onFilteredChange(filtered) {
    if (filtered.length > 1 && this.state.filterAll.length) {
      const filterAll = "";
      this.setState({
        filtered: filtered.filter(item => item.id != "all"),
        filterAll
      });
    } else this.setState({ filtered });
  }

  public filterAll(e) {
    const { value } = e.target;
    const filterAll = value;
    const filtered = [{ id: "all", value: filterAll }];
    // console.log(filtered, "filtered");
    this.setState({ filterAll, filtered });
  }

  public setDivisionDD = (item: IDropdownOption): void => {
    // console.log('here is the things updating...' + item.key + ' ' + item.text + ' ' + item.selected);
    this.setState({
      selectedDivision: item,
      selectedDivisionText: item.text,
      selectedDivisionListName: item.key.toString()
    });
    this.loadQnAListData(item.key.toString());
  };

  public async changeToEdit(): Promise<void> {
    // console.log("edit is clicked");
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

  public changeToPublish(): void {
    //console.log("save to SP then go to publish form", this.state.qnaItems);
    //create qnamakeritem from state qnaitems

    //COMMENT OUT FOR A WHILE
    // this.props.actionHandler
    //   .updateItemInQnAList(
    //     this.state.selectedDivisionListName,
    //     this.state.qnaItems
    //   )
    //   .then(res => {
    //     this.props.actionHandler
    //       .updateQnAListTracking(
    //         this.props.properties.qnATrackingListName,
    //         this.state.selectedDivisionText,
    //         "save"
    //       )
    //       .then(res => {
    //         this.setState({
    //           formView: ViewType.Publish
    //         });
    //       });
    //   });
  }

  public addNewQuestionToQnAList(item: any): void {
    //console.log("add to QNA List", item);
    this.props.actionHandler.addQuestionToQnAList(
      this.props.properties.webUrl,
      this.state.selectedDivisionListName,
      item.row
    );
  }

  public deleteNewQuestion(item: any): void {
    //console.log("delete new question", item.row._original);
    this.props.actionHandler.deleteFromNewQuestion(
      this.props.properties.endpointUrl,
      item.row._original
    );
  }

  public markAsResolved(item: any): void {
    // console.log("mark as resolved");
    this.props.actionHandler.resolveQuestion(
      this.props.properties.endpointUrl,
      item.row._original
    );
  }

  public addNewQnaToTable(): void {
    console.log("add inline form");

    let newQnA = {
      Questions: '[{"label":"","value":""}]',
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
    // console.log("SAVE ITEMS", this.state.qnaItems);
    //process all changes and save to SP list
    console.log(this.state.qnaActionHistory, "modified items");
    const addItems = this.state.qnaActionHistory.filter(items => items.action === "add").map( qna => qna.qnaItem);
    const modifyItems = this.state.qnaActionHistory.filter(items => items.action === "update").map( qna => qna.qnaItem);
    const deleteItems = this.state.qnaActionHistory.filter(items => items.action === "delete").map( qna => qna.qnaItem);

    console.log(addItems, modifyItems, deleteItems);

    const addtoList = this.props.actionHandler.addtoQnaList(this.state.selectedDivisionListName,addItems);
    const updatetoList = this.props.actionHandler.updateItemInQnAList(this.state.selectedDivisionListName,modifyItems);
    const deletefromlist = this.props.actionHandler.deleteFromQnAList(this.state.selectedDivisionListName,deleteItems);
    
    Promise.all([addtoList, updatetoList, deletefromlist]).then(res => {
      this.props.actionHandler.updateQnAListTracking(this.props.properties.qnATrackingListName, this.state.selectedDivisionText, "save")
          .then(res => {
            this.setState({
                formView: ViewType.Display,
                selectedDivision: this.state.selectedDivision
              });
          })
    });

    //COMMENTED OUT FOR A WHILE
    //foreach sa items then igroup yung mga actions if add call add, edit or delete
     // this.props.actionHandler.deleteFromQnAList(this.state.selectedDivisionListName, item.row._original)
    // .then(res => {
    //     // console.log(res);
    //   //  console.log(this.state.qnaActionHistory);
    // })

    // this.props.actionHandler.updateItemInQnAList(this.state.selectedDivisionListName, this.state.qnaItems).then(res => {
    //     this.props.actionHandler.updateQnAListTracking(this.props.properties.qnATrackingListName, this.state.selectedDivisionText, "save")
    //     .then(res => {
    //      this.setState({
    //         formView: ViewType.Display,
    //         selectedDivision: this.state.selectedDivision
    //       });

    //     })
    // });
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
              let history = [...oldState.qnaActionHistory]
              history[historyIndex] = itemDeleteActionHistory 
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
      let index = historyArray.findIndex(d => d.Id == item.row._original.Id)
      historyArray.splice(index, 1);
      this.setState({ qnaActionHistory: historyArray });
    }
   
    //remove from qnaState array
    let array = [...this.state.qnaItems];
    let index = array.findIndex(d => d.Id == item.row._original.Id)
    array.splice(index, 1);
    this.setState({ qnaItems: array });
  }

  public publishQnA(): void {
    // console.log("published qna", this.state.updatedQna);
    //contruct json data to be passed to backend
    let publishQnAJSON = "";

    // this.props.actionHandler.publishQnAMakerItem(this.props.properties.endpointUrl,this.props.properties.qnAMakerKnowledgeBaseId,[]).then(res => {
    //   this.props.actionHandler.updateQnAListTracking(this.props.properties.qnATrackingListName, this.state.selectedDivisionText,"publish")
    //   .then(res => {
    //     this.setState({
    //       formView: ViewType.Display
    //     });
    //   })
    // })

    this.setState({
      formView: ViewType.Display
    });
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

      console.log(this.state.qnaActionHistory, "actionhistory");
      //check if item exist in action history
     historyIndex = this.state.qnaActionHistory.findIndex( data => data.qnaItem.identifier == index);

    } else  {
      //item has id so edit
      historyItem = {
        qnaItem: { ...item },
        action: "update"
      }
      console.log(this.state.qnaActionHistory, "actionhistory");
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
    console.log(data)
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
    console.log(data, index, "update question");

    let qnaItems = [...this.state.qnaItems];
    let item = {
      ...qnaItems[index],
      Questions: JSON.stringify(data)
    };
    qnaItems[index] = item;
    this.setState({ qnaItems });

    this.updateActionHistory(item,index);
  };

  public updateClassification = (data, index) => {
    let qnaItems = [...this.state.qnaItems];
    let item = {
      ...qnaItems[index],
      Classification: data.value //JSON.stringify(data)
    };
    qnaItems[index] = item;
    this.setState({ qnaItems });

    this.updateActionHistory(item,index);
  };

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
  };

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

  renderEditableDropdown = cellInfo => {

    let selectedItemOption = {"text": cellInfo.original.Classification , "key": cellInfo.original.Classification};

    return (
      <QnAClassificationInput
        value={selectedItemOption}
        onChange={data => this.updateClassification(data, cellInfo.index)}
      />
    );
  };

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

    console.log("new row added", this.state.qnaItems);
    console.log("aciton history", this.state.qnaActionHistory);
    switch (this.state.formView) {
      case ViewType.Edit:
        return (
          <div>
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
                onClick={this.changeToPublish}
              />
            </div>
            <div>New Questions </div>
            <span> Filter New Questions: </span>
            <input value={this.state.filterAll} onChange={this.filterAll} />
            <ReactTable
              PaginationComponent={Pagination}
              data={this.state.newQuestions}
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
              defaultPageSize={10}
              className="-striped -highlight"
            />
            <br />
            <DefaultButton
              text="Add QnA Pair"
              primary={true}
              href="#"
              onClick={this.addNewQnaToTable}
            />
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
                      Cell: ({ row }) => (
                        <div>
                          <button onClick={() => this.deleteQnA({ row })}>
                            Delete Question
                          </button>
                          <button data-tip data-event="click focus">
                            {" "}
                            Preview
                          </button>
                          <ReactTooltip
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
            <br />
          </div>
        );
      case ViewType.Display:
        return (
          <div>
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
            <div className={styles.controlMenu}>
              <DefaultButton
                text="Publish"
                primary={true}
                href="#"
                onClick={this.publishQnA}
              />
            </div>
            <div>
              <ReactTable
                data={this.state.qnaItems}
                PaginationComponent={Pagination}
                columns={[
                  {
                    columns: [
                      {
                        Header: "Questions",
                        accessor: "Questions"
                      },
                      {
                        Header: "Answer",
                        accessor: "Answer"
                      },
                      {
                        Header: "Classification",
                        accessor: "Classification"
                      },
                      {
                        Header: "Change Type",
                        accessor: "ChangeType"
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
