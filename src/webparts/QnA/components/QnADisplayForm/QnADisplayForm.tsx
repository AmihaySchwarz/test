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

export class QnADisplayForm extends React.Component<IQnADisplayFormProps, any> {
  constructor(props) {
    super(props);
    console.log(props);
    this.state = {
      qnaItems: props.qnaItems
    };
  }

  public componentWillReceiveProps(newProps): void {
    console.log("in recevied props");
    console.log(newProps)
    this.setState({ qnaItems: newProps.qnaItems });
    console.log(this.state.qnaItems);
  }

  private onSaveClick(): void {
    // TODO: Save Items
    this.props.changeView(ViewType.Display);
  }

  public render() {
    const test = [{answer:"wee",classification:"wee"},{answer:"wee",classification:"wee"}]
    const qna  = this.state.qnaItems.Items? this.state.qnaItems.Items : [] ;
    console.log(qna);
    return (
      <div>
      {this.state.isLoading && <LoadingSpinner />}
      {/* <DialogHeader title='Edit' showSaveButton={false} previousView={ViewType.Display}
          changeView={this.props.changeView} onSaveClick={this.onSaveClick} /> */}
        

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
          data={qna}
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
