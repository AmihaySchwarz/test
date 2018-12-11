import * as React from "react";
import { IQnAFormProps, IQnAFormState } from "./IQnAFormProps";
import { LoadingSpinner } from "../../../common/components/LoadingSpinner";
import { ViewType } from "../../../common/enum";
import "react-table/react-table.css";
import { Dropdown, IDropdownOption } from "office-ui-fabric-react/lib/Dropdown";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import * as _ from "lodash";
import { QnAEditForm } from "../QnAEditForm/QnAEditForm";
import { QnADisplayForm } from "../QnADisplayForm/QnADisplayForm";
import { QnAPublishForm } from "../QnAPublishForm/QnAPublishForm";
import { IQnAListItem } from "../../models/IQnAListItem";
import { INewQuestions } from "../../models/INewQuestions";
import { QnAActionHandler } from '../QnAContainer/QnAActionHandler';


export class QnAForm extends React.Component<IQnAFormProps, IQnAFormState> {
  constructor(props) {
    super(props);
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
      searchQnA: "",
      originModule: "",
    };

    this.onEditClick = this.onEditClick.bind(this);
    this.onpublishClick = this.onpublishClick.bind(this);
    this.onSaveClick = this.onSaveClick.bind(this);
    this.onBackClick = this.onBackClick.bind(this);
    this.onPublishBackClick = this.onPublishBackClick.bind(this);
    this.onSavePublishClick = this.onSavePublishClick.bind(this);
    this.onPublishedClick = this.onPublishedClick.bind(this);
    
    this.onDivisionSet = this.onDivisionSet.bind(this);
  }

  public async componentWillReceiveProps(newProps): Promise<void> {
    //console.log(newProps);
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
        selectedDivisionListName: newProps.defaultDivision.key
      });
    
    }
  }

  public async componentDidMount(): Promise<void> {
    //console.log("component did mount", this.props);
    if (
      this.props.masterItems.length !== 0// &&
      //this.props.newQuestions.length !== 0
    ) {
      this.setState({
        qnaItems: this.props.qnaItems,
        newQuestions: this.props.newQuestions,
        currentUser: this.props.currentUser,
        division: this.props.masterItems,
        selectedDivision: this.props.defaultDivision,
        selectedDivisionText: this.props.defaultDivision.text,
        selectedDivisionListName: this.props.defaultDivision.key
      });
      //setInterval(this.updateLockReleaseTimeIncrementally, 60 * 1000); //15 * 60 * 1000
    }
  }

  public onEditClick(
    selectedDivision: any[],
    qnaItems: IQnAListItem[],
    newQuestions: INewQuestions[],
    qnaOriginalCopy: IQnAListItem[],
    qnaActionHistory: any[]
  ) {
    //go to edit form
    this.setState({
      formView: ViewType.Edit,
      qnaItems: qnaItems,
      newQuestions: newQuestions,
      selectedDivision: selectedDivision,
      qnaOriginalCopy: qnaOriginalCopy,
      qnaActionHistory: qnaActionHistory
    });
  }

  public onpublishClick(
    selectedDivision: any[],
    qnaActionHistory: any[],
    qnaOriginalCopy: IQnAListItem[]
  ) {
    //go to publish form
    console.log(qnaActionHistory);
    this.setState({
      originModule: "Display",
      formView: ViewType.Publish,
      selectedDivision: selectedDivision,
      qnaActionHistory: qnaActionHistory,
      qnaOriginalCopy: qnaOriginalCopy
    });
  }

  public onBackClick(){
    this.setState({
      formView: ViewType.Display
    });
  }
  
  public onPublishBackClick(
    qnaActionHistory: any[],
    selectedDivision: any[],
    originModule: string
  ) {
    if (originModule === "Edit"){
      this.setState({
        formView: ViewType.Edit,
        selectedDivision: selectedDivision,
        qnaActionHistory: qnaActionHistory
      });
    } else {
      this.setState({
        formView: ViewType.Display,
        selectedDivision: selectedDivision,
        qnaActionHistory: qnaActionHistory
      });
    }
  }

  public onSaveClick(
    selectedDivision: any[],
    qnaActionHistory: any[],
    qnaOriginalCopy: IQnAListItem[]
  ) {
    this.setState({
      formView: ViewType.Display,
      selectedDivision: selectedDivision,
      qnaActionHistory: qnaActionHistory,
      qnaOriginalCopy: qnaOriginalCopy
    });
  }

  public onSavePublishClick(
    selectedDivision: any[],
    qnaActionHistory: any[],
    qnaOriginalCopy: IQnAListItem[]
  ) {
    this.setState({
      formView: ViewType.Publish,
      selectedDivision: selectedDivision,
      qnaActionHistory: qnaActionHistory,
      qnaOriginalCopy: qnaOriginalCopy,
      originModule: "Edit"
    });
  }

  public onPublishedClick(selectedDivision: any[], response: string) {
    this.setState({
      formView: ViewType.Display,
      selectedDivision: selectedDivision
    });
  }

  public onDivisionSet(division: any){
    this.setState({
        selectedDivision: division,
        selectedDivisionText: division.text,
        selectedDivisionListName: division.key
    });
   
  }

  public render() {
    //console.log("set division", this.state.selectedDivision);
    //console.log(this.state);
    const { isLoading, formView } = this.state;
    return (
      <div> 
        {isLoading && <LoadingSpinner />}
        {formView == ViewType.Edit && (
          <QnAEditForm
            newQuestions={this.state.newQuestions}
            masterItems={this.props.masterItems}
            qnaItems={this.state.qnaItems}
            actionHandler={this.props.actionHandler}
            properties={this.props.properties}
            currentUser={this.props.currentUser}
            defaultDivision={this.state.selectedDivision}
            onSaveClick={this.onSaveClick}
            onBackClick={this.onBackClick}
            onSavePublishClick={this.onSavePublishClick}
            qnaOriginalCopy={this.state.qnaOriginalCopy}
            qnaActionHistory={this.state.qnaActionHistory}
          />
        )}
        {formView == ViewType.Display && (
          <QnADisplayForm
            newQuestions={this.state.newQuestions}
            masterItems={this.props.masterItems}
            actionHandler={this.props.actionHandler}
            properties={this.props.properties}
            currentUser={this.props.currentUser}
            defaultDivision={this.state.selectedDivision}
            onEditClick={this.onEditClick}
            onPublishClick={this.onpublishClick}
            qnaActionHistory={this.state.qnaActionHistory}
            qnaOriginalCopy={this.state.qnaOriginalCopy}
            onDivisionSet={this.onDivisionSet}
          />
        )}
        {formView == ViewType.Publish && (
          <QnAPublishForm
            newQuestions={this.state.newQuestions}
            masterItems={this.props.masterItems}
            actionHandler={this.props.actionHandler}
            properties={this.props.properties}
            currentUser={this.props.currentUser}
            defaultDivision={this.state.selectedDivision}
            qnaActionHistory={this.state.qnaActionHistory}
            onPublishBackClick={this.onPublishBackClick}
            onPublishedClick={this.onPublishedClick}
            qnaOriginalCopy={this.state.qnaOriginalCopy}
            originModule={this.state.originModule}
          />
        )}
        <ToastContainer />
      </div>
    );
  }
}
