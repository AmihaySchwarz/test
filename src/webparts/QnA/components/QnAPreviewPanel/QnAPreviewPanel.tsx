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
        qnaItem: undefined
    };


  }
  public async componentWillReceiveProps(newProps): Promise<void>
  {
    this.setState({
        qnaItem: this.props.qnaItem
    })
  }

  public async componentDidMount() : Promise<void>
  {
    console.log("componentdsd did mount");
    this.setState({
        qnaItem: this.props.qnaItem
    })

  }


  public render() {
    return( <div> 
      
      <div className={styles.chatOutput} id="chat-output">
        <div className={styles.userMessage}>
          <div className={styles.message}>TEST QUESTION</div>
        </div>
      </div>

      <div className={styles.botMessage}>
        <div className={styles.message}>TEST ANSWER</div>
      </div>

      



    </div> );
  }
}
