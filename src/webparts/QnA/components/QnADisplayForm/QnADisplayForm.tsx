import * as React from 'react';
import styles from './QnADisplayForm.module.scss';
import { IQnADisplayFormProps } from './IQnADisplayFormProps';
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

export class QnADisplayForm extends React.Component<IQnADisplayFormProps, any> {
  constructor(props) {
    super(props);
    console.log(props);
    this.state = {
      qnaItems: props.qnaItems,
      newQuestions: props.newQuestions,
      masterListItems: props.masterItems,
      qnaListItems: [],
      division:[],
      selectedItem: undefined
    };
  }

  public componentWillReceiveProps(newProps): void {
    console.log(newProps, "in recevied props");

   // this.setState({ qnaItems: newProps.qnaItems });
    //load qna division list data based from the division in the dropdown
    this.setState({
      division: newProps.masterItems.map(divisionItem => ({
        key: divisionItem.QnAListName,
        text: divisionItem.Division
      }))
    })
  }

  public loadQnAListData(divisionList: string): void {
    
  }

  private onSaveClick(): void {
    // TODO: Save Items
    this.props.changeView(ViewType.Display);
  }

  public changeState = (event: React.FormEvent<HTMLDivElement>, item: IDropdownOption): void => {
    console.log('here is the things updating...' + item.key + ' ' + item.text + ' ' + item.selected);
    this.setState({ selectedItem: item });
  };

  public render() {
   console.log(this.state.division, "division");
   const { selectedItem, selectedItems } = this.state;

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
    console.log(qna);
    return (
      <div>
      {this.state.isLoading && <LoadingSpinner />}

        <div> 
          <span> Division: </span>
          <Dropdown
            
            placeHolder="Select Division"
            id="division"
            options={this.state.division}
            selectedKey={selectedItem ? selectedItem.key : undefined}
            //onChange={this.changeState}
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
          data={qna[0].Items}
          
          PaginationComponent={Pagination}
          columns={[
            {
              columns: [
                {
                  Header: "Question",
                  accessor: "Question"
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
