import * as React from 'react';
import styles from './QnAPublishForm.module.scss';
import { IQnAPublishFormProps,IQnAFormState } from './IQnAPublishFormProps';
import { DialogHeader } from '../../../common/components/DialogHeader';
import { LoadingSpinner } from '../../../common/components/LoadingSpinner';
import { ViewType } from '../../../common/enum';
import { escape } from '@microsoft/sp-lodash-subset';
import ReactTable from 'react-table';
import 'react-table/react-table.css'
 import { Fabric } from 'office-ui-fabric-react/lib/Fabric';
 import { DefaultButton } from 'office-ui-fabric-react/lib/Button';
 import { Dropdown, IDropdown, DropdownMenuItemType, IDropdownOption } from 'office-ui-fabric-react/lib/Dropdown';
 import { QnAActionHandler } from '../QnAContainer/QnAActionHandler';
import { INewQuestions } from '../../models/INewQuestions';

export class QnAPublishForm extends React.Component<IQnAPublishFormProps, IQnAFormState> {

  private actionHandler: QnAActionHandler;

  constructor(props) {
    super(props);
    console.log(props);

}


  public render() {

return (
    <div>
        <span> TEST PUBLISH FORM</span>
    </div>
)
        
  }
}
