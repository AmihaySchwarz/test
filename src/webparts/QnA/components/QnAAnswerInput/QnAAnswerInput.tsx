import * as React from 'react';
import styles from '../QnAForm/QnAForm.module.scss';
import * as _ from "lodash";
import { convertToRaw, EditorState, ContentState } from 'draft-js';
import draftToHtml from 'draftjs-to-html';
import htmlToDraft from 'html-to-draftjs';
import { Editor } from 'react-draft-wysiwyg';


export default class QnAAnswerInput extends React.Component<any,any> {


  constructor(props) {
    super(props);
    const html = props.value;
    const contentBlock = htmlToDraft(html);
    if (contentBlock) {
      const contentState = ContentState.createFromBlockArray(contentBlock.contentBlocks);
      const editorState = EditorState.createWithContent(contentState);
      this.state = {
        editorState,
      };
    }
    // const blocksFromHTML = convertFromHTML(html);
    // const state = ContentState.createFromBlockArray(
    //   blocksFromHTML.contentBlocks,
    //   blocksFromHTML.entityMap
    // );
    // this.state = {
    //   editorState: EditorState.createWithContent(state)
    // };
  }

  public onChange = (editorState) => {
    this.setState({editorState})
    console.log(editorState);
    //const html = draftToHtml(convertToRaw(editorState));
    //console.log(html);
    //this.props.onChange(html);
  }

  public render() {
    //console.log(this.props.value);
    const { editorState } = this.state;
    
    //const { value } = this.props.value;

    return(
      <div>
           <Editor editorState={editorState} onEditorStateChange={this.onChange} />
      </div>
    );

  }
}
