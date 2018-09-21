import * as React from 'react';
import styles from './QnADisplayForm.module.scss';
import { IQnADisplayFormProps,IQnAFormState } from './IQnADisplayFormProps';
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

export class QnADisplayForm extends React.Component<IQnADisplayFormProps, IQnAFormState> {

  private isEdit: boolean;
  private actionHandler: QnAActionHandler;

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
      isEdit: false
    };
    this.filterAll = this.filterAll.bind(this);
    this.changeToEdit = this.changeToEdit.bind(this);
    this.onSaveClick = this.onSaveClick.bind(this);
    this.renderEditable = this.renderEditable.bind(this);
}
public componentDidMount() {
  console.log("component did mount in form!");
}
public componentWillReceiveProps(newProps): void {
    console.log(newProps, "in recevied props");

   this.setState({ qnaItems: newProps.qnaItems });
    this.setState({
      division: newProps.masterItems.map(divisionItem => ({
        key: divisionItem.QnAListName,
        text: divisionItem.Division.Label
      }))
    })

    console.log(this.state.division, "division")
  }

  public async loadQnAListData(divisionListName: string): Promise<void> {
    this.setState({
      qnaItems: await this.props.actionHandler.getQnAItems(divisionListName,this.props.endpoints[0].webUrl),
      isDataLoaded: true,
    });
    console.log(this.state.qnaItems, "qna items!");
  }

  onFilteredChange(filtered) {
    // console.log('filtered:',filtered);
    // const { sortedData } = this.reactTable.getResolvedState();
    // console.log('sortedData:', sortedData);

    // extra check for the "filterAll"
    if (filtered.length > 1 && this.state.filterAll.length) {
      // NOTE: this removes any FILTER ALL filter
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


  private onSaveClick(): void {
    // TODO: Save Items
    this.setState({
      isEdit: false
    });
  }

  public setDivisionDD = (item: IDropdownOption): void => {
    console.log('here is the things updating...' + item.key + ' ' + item.text + ' ' + item.selected);
    this.setState({ 
      selectedDivision: item.text ,
      selectedDivisionListName: item.key.toString()
    });

    this.loadQnAListData(item.key.toString());
  };

  public changeToEdit(): void {
    console.log("edit is clicked");
    //this.props.changeView(ViewType.Edit);
    this.setState({
      isEdit: true
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

  public render() {


   console.log(this.state.selectedDivision, "selected division");
   console.log(this.state.qnaItems, "qna items");
   console.log(this.state.isEdit);
   const { selectedDivision } = this.state;    
    
    let mockNewQuestions = [{
      Items :[
        {
          question: "question 1, question 2",
          postedDate: "4/11/2018 09:00 AM",
          postedBy: "Page Tangalin"
        },
        {
          question: "question 3, question 4",
          postedDate: "9/20/2018 09:00 AM",
          postedBy: "Page Tangalin"
        }
      ]
    } 
    ]

   return (

      <div>
      {this.state.isLoading && <LoadingSpinner />}
        {this.state.isEdit ?  
        <div>
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
            />
        </div>
    
        <div>New Questions </div>
        <span> Filter New Questions:  </span><input value={this.state.filterAll} onChange={this.filterAll} />  
        <ReactTable
          PaginationComponent={Pagination}
          data={mockNewQuestions[0].Items}
          columns={[
            {
              columns: [
                {
                  Header: "Question",
                  accessor: "question"
                },
                {
                  Header: "Posted Date",
                  accessor: "postedDate"
                },
                {
                  Header: "Posted By",
                  accessor: "postedBy"
                },
                {
                  Header: "Actions",
                  accessor: "newQuestionsActions",
                  Cell: ({row}) => (<div><button>Add to QnA List</button> <br />
                    <button>Delete Question</button><br />
                    <button>Mark as Resolved</button></div>) // onClick={this.editRow({value})}
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
                  Cell: this.renderEditable
                },
                {
                  Header: "Actions",
                  accessor: "Actions",
                  Cell: ({value}) => (<div>
                    <button>Delete Question</button>
                    <button>Preview</button></div>)
                }
              ]
            }
          ]}
          defaultPageSize={10}
          className="-striped -highlight"
        />
        <br />
          

        </div> : 
        <div>
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
            />
        </div>
    
        <div>New Questions </div>
        Filter New Questions: <input value={this.state.filterAll} onChange={this.filterAll} />  
        <ReactTable
          PaginationComponent={Pagination}
          columns={[
            {
              columns: [
                {
                  Header: "Question",
                  accessor: "question"
                },
                {
                  Header: "Posted Date",
                  id: "postedDate"
                },
                {
                  Header: "Posted By",
                  id: "postedBy"
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
                  accessor: "Questions"
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
      }
      </div>
    );
  }
}
