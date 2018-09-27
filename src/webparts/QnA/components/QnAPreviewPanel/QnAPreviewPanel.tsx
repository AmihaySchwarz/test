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
        qnaItem: undefined,
        questions: "",
        answer: ""
    };


  }
  public async componentWillReceiveProps(newProps): Promise<void>
  {
    this.setState({
        qnaItem: this.props.qnaItem,
        questions: this.props.qnaItem.Questions,
        answer: this.props.qnaItem.Answer
    })
  }

  public async componentDidMount() : Promise<void>
  {
    //console.log("componentdsd did mount", this.props.qnaItem);
    this.setState({
        qnaItem: this.props.qnaItem,
        answer: this.props.qnaItem.Answer
    })

    let arrayQ = JSON.parse(this.props.qnaItem.Questions);
    this.setState({
      questions: arrayQ[0].value
    })
  }


  public render() {
    
    return( 
    <div className={styles.chatPanel}> 
       {this.state.qnaItem  && 
            <div>
              <div className={styles.chatOutput} id="chat-output">
                <div className={styles.userMessage}>
                  <div className={styles.message}>{this.state.questions}</div>  
                </div>
              </div>  
          

              <div className={styles.botMessage}>
                <div className={styles.message}> {this.state.answer} </div>
              </div>
        </div> 
        }
    </div> );
  }
}
