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
 import { QnAActionHandler } from '../QnAContainer/QnAActionHandler';
import { INewQuestions } from '../../models/INewQuestions';
import { ThemeSettingName } from '@uifabric/styling/lib';
import CreatableSelect from 'react-select/lib/Creatable';
import { QnAPreviewPanel } from '../QnAPreviewPanel/QnAPreviewPanel';
import ReactTooltip from 'react-tooltip'
import Testing from './Testing'

const components = {
  DropdownIndicator: null,
};

const createOption = (label: string) => ({
  label,
  value: label,
});




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
    this.saveNewQnA = this.saveNewQnA.bind(this);
    this.changeToAdd = this.changeToAdd.bind(this);
}


public componentDidMount() {
  console.log("component did mount in form!");
}
public componentWillReceiveProps(newProps): void {
    console.log(newProps, "in recevied props");
    this.setState({
      qnaItems: newProps.qnaItems, 
      newQuestions: newProps.newQuestions,
      currentUser: newProps.currentUser,
      // division : newProps.masterItems.map(divisionItem => ({
      //   key: divisionItem.QnAListName,
      //   text: divisionItem.Division.Label
      // }))
      division: newProps.masterItems
    })
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
      selectedDivision: item.text ,
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
  
    this.setState({
      isEdit: true,
      formView: ViewType.Edit
    });


    // this.props.actionHandler.checkLockStatus(this.state.currentUser, this.state.selectedDivision,this.props.properties.qnATrackingListName)
    // .then((items) => {
    //   this.setState({
    //     listTrackingItem: items[0], 
    //   })
    //   console.log(this.state.listTrackingItem); 
    //   if(this.state.listTrackingItem.LockedBy !== undefined){
    //     //show notification and refresh data
    //     console.log("item is locked by: " +this.state.listTrackingItem.LockedBy.EMail);
    //   } else {
    //     let lockStatus = this.props.actionHandler.lockList(this.state.currentUser,this.state.selectedDivision, this.props.properties.qnATrackingListName).then(res => {
    //       if (res == "fail"){
    //         //alert user if lock fail then refresh data
    //         console.log("failed to lock the item");
    //       } else {
    //         this.setState({
    //           isEdit: true,
    //           formView: ViewType.Edit
    //         });
    //       }
    //     }); 
    //   }
    // });
  }

  public changeToPublish(): void {
    console.log("publish form");
    this.setState({
      formView: ViewType.Publish
    });
  }


  public changeToAdd(): void {
    console.log("add inline form");
    this.setState({
      formView: ViewType.Add
    });
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

    this.setState({
      formView: ViewType.Display, 
      selectedDivision: this.state.selectedDivision
    });


  }

  private saveNewQnA(): void {
    //TOD: save new items from inline editor
    this.setState({
      formView: ViewType.Display,
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
      <div
        style={{ backgroundColor: "#fafafa" }}
        contentEditable
        suppressContentEditableWarning
        onBlur={e => {
          const qnaItems = [...this.state.qnaItems];
          qnaItems[cellInfo.index][cellInfo.column.id] = e.currentTarget.innerHTML;
          this.setState({ qnaItems });
        }}
        dangerouslySetInnerHTML={{
          __html: this.state.qnaItems[cellInfo.index][cellInfo.column.id]
        }}
      />
    );
  }

 public updateQuestions=(data,index)=> {
    console.log(data, index);

    let qnaItems = [...this.state.qnaItems];
    let item = {
      ...qnaItems[index],
      Questions: data
    }   
    qnaItems[index] = item;
    this.setState({qnaItems});
  }

  renderQuestionsEdit = cellInfo => {
    console.log(cellInfo.original);
    let parsedQ = JSON.parse(cellInfo.original.Questions);
    console.log(parsedQ)
    return (
      <Testing value={parsedQ} onChange={(data) => this.updateQuestions(data, cellInfo.index)}/>
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

  public render() {
   const { selectedDivision } = this.state;    
    

    switch(this.state.formView){
      case ViewType.Edit:
          return <div>
          <div className={styles.controlMenu}> 
            <span> Division: { this.state.selectedDivision} </span>

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
                  accessor: "PostedDate"
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
              onClick={this.changeToAdd}
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
                  //Cell: this.renderEditableDropdown
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
            selectedKey={selectedDivision ? selectedDivision.key : this.state.selectedDivision}
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
        columns={[
          {
            columns: [
              {
                Header: "Question",
                accessor: "Question",
              },
              {
                Header: "Posted Date",
                accessor: "PostedDate"
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
    case ViewType.Add:
    return <div>
          <div className={styles.controlMenu}> 

            <DefaultButton
                  text='Save'
                  primary={ true }
                  href='#'
                  onClick={this.saveNewQnA}
                /> 
          </div>

          <div>
              <ReactTable
              data={[]}

              PaginationComponent={Pagination}
              columns={[
                {
                  columns: [
                    {
                      Header: "Questions",
                      accessor: "Questions",
                      Cell: this.renderEditable
                    },
                    {
                      Header: "Answer",
                      accessor: "Answer",
                      Cell: this.renderEditable
                    },
                    {
                      Header: "Classification",
                      accessor: "Classification",
                     // Cell: this.renderEditableDropDown
                    },
                    {
                      Header: "Actions",
                      accessor: "Actions",
                      Cell: ({row}) => (<div>
                        <button onClick={()=>this.deleteQnA({row})}>Delete Question</button>
                        <button onClick={()=>this.previewQnA({row})}>Preview</button></div>)
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
