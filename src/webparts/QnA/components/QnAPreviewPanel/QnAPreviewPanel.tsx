import * as React from 'react';
import * as AuthenticationContext from 'adal-angular';
import styles from './QnAPreviewPanel.module.scss';
import { IQnAPreviewPanelFormProps, IQnAPreviewPanelFormState } from './IQnAPreviewPanelProps';
import { QnAActionHandler } from '../QnAContainer/QnAActionHandler';
import ReactHtmlParser, { processNodes, convertNodeToElement, htmlparser2 } from 'react-html-parser';


export class QnAPreviewPanel extends React.Component<IQnAPreviewPanelFormProps, IQnAPreviewPanelFormState> {

  private actionHandler: QnAActionHandler;
  public authContext: AuthenticationContext;
 

  constructor(props: IQnAPreviewPanelFormProps, state: IQnAPreviewPanelFormState) {
    super(props);
  }
  public render() {
   // console.log(this.props.qnaItem);
    let questions = JSON.parse(this.props.qnaItem.Questions);
    return( 
      
    <div className={styles.chatPanel}> 

    { questions.length > 0 && 
            <div>
              <div className={styles.chatOutput} id="chat-output">
                <div className={styles.userMessage}>
                  <div className={styles.message}>{questions[0].label}</div>  
                </div>
              </div>  
          

              <div className={styles.botMessage}>
                <div className={styles.message}> {ReactHtmlParser(this.props.qnaItem.Answer)} </div>
              </div>
        </div> 
    }
    </div> );
  }
}
