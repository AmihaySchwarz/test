import * as React from 'react';
import styles from '../QnAForm/QnAForm.module.scss';
import * as _ from "lodash";
import 'react-tippy/dist/tippy.css'
import {
  Tooltip,
} from 'react-tippy';
import { QnAPreviewPanel }  from '../QnAPreviewPanel/QnAPreviewPanel';
  
  export default class ReactToolTip extends React.Component<any,any> {
    public state = {
      inputValue: '',
       value: [],
    };

    public render() {

      return (
        <div> 
          <Tooltip
              trigger="click"
              interactive
              html={(
                <div>
                  <p><QnAPreviewPanel qnaItem={this.props.row} /></p>
                </div>
              )}
            >
              Preview
            </Tooltip>
        </div>
       
      );
    }
  }