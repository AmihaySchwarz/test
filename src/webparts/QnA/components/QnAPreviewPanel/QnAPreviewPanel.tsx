import * as React from 'react';
import * as AuthenticationContext from 'adal-angular';
import styles from './QnAPreviewPanel.module.scss';
import { IQnAPreviewPanelFormProps, IQnAPreviewPanelFormState } from './IQnAPreviewPanelProps';
import { QnAActionHandler } from '../QnAContainer/QnAActionHandler';



export class QnAPreviewPanel extends React.Component<IQnAPreviewPanelFormProps, IQnAPreviewPanelFormState> {

  private actionHandler: QnAActionHandler;
  public authContext: AuthenticationContext;
 

  constructor(props: IQnAPreviewPanelFormProps, state: IQnAPreviewPanelFormState) {
    super(props);
    this.state = {
        qnaItems: []
    };


  }
  public async componentWillReceiveProps(newProps): Promise<void>
  {
    this.setState({
        qnaItems: this.props.qnaItems
    })
  }

  public async componentDidMount() : Promise<void>
  {
    console.log("componentdsd did mount");
    this.setState({
        qnaItems: this.props.qnaItems
    })

  }


  public render() {
    return( <div> TESTING this i the preview panel for QnA</div> );
  }
}
