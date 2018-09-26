import * as React from 'react';
import styles from './QnAForm.module.scss';
import { IQnAFormProps,IQnAFormState } from './IQnAFormProps';
import { DialogHeader } from '../../../common/components/DialogHeader';
import { LoadingSpinner } from '../../../common/components/LoadingSpinner';
import { ViewType } from '../../../common/enum';
import { escape } from '@microsoft/sp-lodash-subset';
import ReactTable from 'react-table';
import 'react-table/react-table.css'
 import { Pagination } from './Pagination';
 import { Fabric } from 'office-ui-fabric-react/lib/Fabric';
 import { DefaultButton } from 'office-ui-fabric-react/lib/Button';
 import { Dropdown, IDropdown, DropdownMenuItemType, IDropdownOption } from 'office-ui-fabric-react/lib/Dropdown';
 import { TextField } from 'office-ui-fabric-react/lib/TextField';
 import { QnAActionHandler } from '../QnAContainer/QnAActionHandler';
import { INewQuestions } from '../../models/INewQuestions';
import { ThemeSettingName } from '@uifabric/styling/lib';
import CreatableSelect from 'react-select/lib/Creatable';
import { QnAPreviewPanel } from '../QnAPreviewPanel/QnAPreviewPanel';
import ReactTooltip from 'react-tooltip';
import QuestionInput from '../QnAQuestionInput/QuestionInput';
import QnAClassificationInput from '../QnAClassificationInput/QnAClassificationInput';
import Moment from 'react-moment';


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
      updatedQna: [],
      newQuestion: undefined,
      inputValue: '',
      listTrackingItem: undefined,
      currentUser: props.currentUser
    };
  
    this.filterAll = this.filterAll.bind(this);
    this.changeToEdit = this.changeToEdit.bind(this);
    this.onSaveClick = this.onSaveClick.bind(this);
    this.renderEditable = this.renderEditable.bind(this);
    this.addToQnAList = this.addToQnAList.bind(this);
    this.changeToPublish = this.changeToPublish.bind(this);
    this.publishQnA = this.publishQnA.bind(this);
    this.addNewQnaToTable = this.addNewQnaToTable.bind(this);
}


public componentDidMount() {
  console.log("component did mount in form!");
}
public componentWillReceiveProps(newProps): void {
    console.log(newProps, "in recevied props");
    
    if((newProps.masterItems.length !== 0) && (newProps.newQuestions.length !== 0)) {
      console.log(newProps.defaultDivision)
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
      qnaItems: await this.props.actionHandler.getQnAItems(divisionListName,this.props.properties.webUrl),
      isDataLoaded: true,
    });
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
    console.log(filtered, "filtered");
    this.setState({ filterAll, filtered });
  }

  public setDivisionDD = (item: IDropdownOption): void => {
    console.log('here is the things updating...' + item.key + ' ' + item.text + ' ' + item.selected);
    this.setState({ 
      selectedDivision: item ,
      selectedDivisionText: item.text,
      selectedDivisionListName: item.key.toString()
    });

    this.loadQnAListData(item.key.toString());
  };

  public async changeToEdit(): Promise<void> {
    console.log("edit is clicked");
    // a.	Get QnA List Tracking item
    // b.	Check Lock status
    // o	If locked, notify user & refresh the data
    // c.	Lock the list
    // o	If failed to lock the list, notify user & refresh the data
    this.props.actionHandler.checkLockStatus(this.state.currentUser, this.state.selectedDivisionText,this.props.properties.qnATrackingListName)
    .then((items) => {
      this.setState({
        listTrackingItem: items[0], 
      })
      console.log(this.state.listTrackingItem); 
      let currentUserEmail = this.state.currentUser.Email;
      if((this.state.listTrackingItem.LockedBy !== undefined) && (this.state.listTrackingItem.LockedBy.EMail !== currentUserEmail)){
        //show notification and refresh data
        console.log("item is locked by: " +this.state.listTrackingItem.LockedBy.EMail);
      } else {
        this.props.actionHandler.lockList(this.state.currentUser,this.state.selectedDivisionText, this.props.properties.qnATrackingListName).then(res => {
          console.log(res);
          if (res.data == undefined){
            //alert user if lock fail then refresh data
            console.log("failed to lock the item");
          } else {
            console.log(this.state.selectedDivision);
            this.setState({
              formView: ViewType.Edit
            });
          }
        }); 
      }
    });
  }

  public changeToPublish(): void {
    console.log("save to SP then go to publish form");
    this.setState({
      formView: ViewType.Publish
    });
  }


  public addNewQnaToTable(): void {
    console.log("add inline form");
    //add new editable row to table
  }

  public addToQnAList(item: any): void {
    console.log("add to QNA List", item);
    this.props.actionHandler.addQuestionToQnAList(this.props.properties.webUrl,this.state.selectedDivisionListName, item.row);
  }

  public deleteNewQuestion(item : any): void {
    console.log("delete new question", item.row._original);
    this.props.actionHandler.deleteFromNewQuestion(this.props.properties.endpointUrl,item.row._original); 
  }

  private onSaveClick(): void {
    // TODO: Save Items
    //•	Once clicked, the following flow shall be performed
    // a.	Validate all QnA pairs
    // b.	Save changes to SharePoint
    // c.	Update QnA List Tracking item (Lock Status, Last Updated)
    // d.	Change to Display Form

    console.log("SAVE ITEMS", this.state.qnaItems);
    this.props.actionHandler.updateItemInQnAList(this.state.selectedDivisionListName, this.state.qnaItems).then(res => {

    });


    this.setState({
      formView: ViewType.Display, 
      selectedDivision: this.state.selectedDivision
    });


  }

  public markAsResolved(item: any): void {
    console.log("mark as resolved");
    this.props.actionHandler.resolveQuestion(this.props.properties.endpointUrl,item);
  }

  public deleteQnA(item: any): void {
    console.log("delete QnA");
    this.props.actionHandler.deleteFromQnAList(this.state.selectedDivisionListName, item.row._original); 
  }

  public previewQnA(item: any) {
    console.log("preview QnA");
    //TODO: display a panel and chatbox type simulation
  }

  public publishQnA(): void {
    //this.props.actionHandler.publishQnAMakerItem(this.props.properties.endpointUrl, )

    console.log("published qna");
    this.setState({
      formView: ViewType.Display
    });
  }

  renderEditable(cellInfo) {
    return (
      // <div
      //   style={{ backgroundColor: "#fafafa" }}
      //   contentEditable
      //   suppressContentEditableWarning
      //   onBlur={e => {
      //     const qnaItems = [...this.state.qnaItems];
      //     qnaItems[cellInfo.index][cellInfo.column.id] = e.currentTarget.innerHTML;
      //     this.setState({ qnaItems });
      //   }}
      //   dangerouslySetInnerHTML={{
      //     __html: this.state.qnaItems[cellInfo.index][cellInfo.column.id]
      //   }}
      // />
      <TextField defaultValue={cellInfo.original.Answer} multiline rows={4} required={true} resizable={true} onChange={(data) => this.updateQnAAnswer(data, cellInfo.index)} />
    );
  }

public updateQnAAnswer = (data, index) => {
  console.log(data, index);
  let qnaItems = [...this.state.qnaItems];
    let item = {
      ...qnaItems[index],
      Answer: data
    }   
    qnaItems[index] = item;
    this.setState({qnaItems});
}

public updateQuestions=(data,index)=> {
    console.log(data, index);

    let qnaItems = [...this.state.qnaItems];
    let item = {
      ...qnaItems[index],
      Questions: JSON.stringify(data)
    }   
    qnaItems[index] = item;
    this.setState({qnaItems});
  }

  renderQuestionsEdit = cellInfo => {
    console.log(cellInfo.original);
    let parsedQ = JSON.parse(cellInfo.original.Questions);
    console.log(parsedQ)
    return (
      <QuestionInput value={parsedQ} onChange={(data) => this.updateQuestions(data, cellInfo.index)}/>
    );
  }

  renderQuestionsDisplay(cellInfo){
    let parsedQ = JSON.parse(cellInfo.original.Questions);
    return parsedQ.map(question => {
      return (
        <div>
          <span style={{ border: "#000" }}> {question.label} </span>
        </div>
      )
    })
  }

  renderEditableDropdown = cellInfo => {
    return (
      <QnAClassificationInput value={cellInfo.original.Classification} onChange={(data) => this.updateClassification(data,cellInfo.index)} />
    );
  }

  public updateClassification = (data, index) => {
    let qnaItems = [...this.state.qnaItems];
    let item = {
      ...qnaItems[index],
      Classification: data.value//JSON.stringify(data)
    }   
    qnaItems[index] = item;
    this.setState({qnaItems});
    console.log(this.state.qnaItems[index]);
  }

  public renderDateField(cellInfo) {
    return (
      <div>
        <Moment format={"MMMM Do YYYY, h:mm:ss a"} date={cellInfo.original.PostedDate} />
      </div>
    )
  }

  public render() {
   const { selectedDivision } = this.state;    
    

    switch(this.state.formView){
      case ViewType.Edit:
          return <div>
          <div className={styles.controlMenu}> 
            <span> Division: { this.state.selectedDivisionText} </span>

            <DefaultButton
              text='Save'
              primary={ true }
              onClick={this.onSaveClick}
            />
            <DefaultButton
              text='Save and Publish'
              primary={ true }
              href='#'
              onClick={this.changeToPublish}
            />
          </div>

        <div>New Questions </div>
        <span> Filter New Questions:  </span><input value={this.state.filterAll} onChange={this.filterAll} />  
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
                  Cell: ({row}) => (<div><button onClick={()=>this.addToQnAList({row})}>Add to QnA List</button> <br /> 
                    {/* <button onClick={()=>this.deleteNewQuestion({row})}>Delete Question</button><br /> */}
                    <button onClick={()=>this.markAsResolved({row})}>Mark as Resolved</button></div>) //onClick={this.addToQnAList({row})}
                }
              ]
            }
          ]}
          defaultPageSize={10}
          className="-striped -highlight"
        />
        <br />

          <DefaultButton
              text='Add QnA Pair'
              primary={ true }
              href='#'
              onClick={this.addNewQnaToTable}
            />

        <div> QnA </div> 
        Filter QnA: <input value={this.state.filterAll} onChange={this.filterAll} />  
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
                  Cell: ({row}) => (<div>
                    <button onClick={()=>this.deleteQnA({row})}>Delete Question</button>
                    <button data-tip data-event='click focus'> Preview</button>
                    <ReactTooltip globalEventOff='click' aria-haspopup='true' place="bottom" type="light" effect="solid">
                        <QnAPreviewPanel qnaItem={row}/>
                    </ReactTooltip>
                   </div> )
                }
              ]
            }
          ]}
          defaultPageSize={10}
          className="-striped -highlight"
        />
        <br />
          

        </div>;
    case ViewType.Display:
    return <div>
        <div className={styles.controlMenu}> 
          <span> Division: </span>

          <Dropdown
            
            placeHolder="Select Division"
            id="division"
            options={this.state.division}
            selectedKey={selectedDivision ? selectedDivision.key : undefined}
            onChanged={this.setDivisionDD}
            
          /> 
          <DefaultButton
            text='Edit'
            primary={ true }
            onClick={this.changeToEdit}
          />
          <DefaultButton
            text='Publish'
            primary={ true }
            href='#'
            onClick={this.changeToPublish}
          />
      </div>

      <div>New Questions </div>
      Filter New Questions: <input value={this.state.filterAll} onChange={this.filterAll} />  
      <ReactTable
        PaginationComponent={Pagination}
        data={this.state.newQuestions}
        //resolveData={this.state.newQuestions => this.state.newQuestions.map(row => row)}
        columns={[
          {
            columns: [
              {
                Header: "Question",
                accessor: "Question",
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
      Filter QnA: <input value={this.state.filterAll} onChange={this.filterAll} />  
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
    </div>;
    case ViewType.Publish:
      return <div>
          <div className={styles.controlMenu}> 

              <DefaultButton
                    text='Publish'
                    primary={ true }
                    href='#'
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
      </div>;
    default: 
        return null;
    }

  }
}
