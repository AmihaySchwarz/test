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
      qnaItems: [],
      isDataLoaded: false,
      filtered: "",
      filterAll: ""
    };
    this.filterAll = this.filterAll.bind(this);
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
    this.props.changeView(ViewType.Display);
  }

  public changeState = (item: IDropdownOption): void => {
    console.log('here is the things updating...' + item.key + ' ' + item.text + ' ' + item.selected);
    this.setState({ selectedDivision: item });
    //get the qna list item!
    this.loadQnAListData(item.key.toString());
  };

  public render() {


   console.log(this.state.selectedDivision, "selected division");
   console.log(this.state.qnaItems, "qna items");
   const { selectedDivision } = this.state;
  
    const qna  =  [
      {
          Items: [
              {
                  Id: "1",
                  Question: "Question Number 1",
                  Answer: "Answer 1",
                  Classification: "Class 1",
                  QnAId: "cqna1"
              },
              {
                  Id: "2",
                  Question: "Question Number 2",
                  Answer: "Answer 2",
                  Classification: "Class 2",
                  QnAId: "cqna2"
              },
              { 
                  Id: "3",
                  Question: "Question Number 3",
                  Answer: "Answer 3",
                  Classification: "Class 3",
                  QnAId: "cqna3"
              }
          ]
      }];
    
    return (
      <div>
      {this.state.isLoading && <LoadingSpinner />}

        <div> 
          <span> Division: </span>
          <Dropdown
            
            placeHolder="Select Division"
            id="division"
            options={this.state.division}
            selectedKey={selectedDivision ? selectedDivision.key : undefined}
            onChanged={this.changeState}
          /> 
          <DefaultButton
            text='Edit'
            primary={ true }
            href='#'
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
    );
  }
}
