import * as React from 'react';
import styles from '../QnAForm/QnAForm.module.scss';
import * as _ from "lodash";
import { convertToRaw, EditorState, ContentState } from 'draft-js';
import draftToHtml from 'draftjs-to-html';
import htmlToDraft from 'html-to-draftjs';
import { Editor } from 'react-draft-wysiwyg';
import ReactQuill, {Quill} from 'react-quill';
import 'react-quill/dist/quill.snow.css'; 


export default class QnAAnswerInput extends React.Component<any,any> {

  constructor(props) {
    super(props);
    this.state = { text: props.value };
    this.handleChange = this.handleChange.bind(this);
  }

  public handleChange(value) {
    this.setState({ text: value });
    this.props.onChange(value);
  }

  public modules = {
    toolbar: [
      [{ 'header': [1, 2, false] }],
      ['bold', 'italic', 'underline','strike', 'blockquote'],
      [{'list': 'ordered'}, {'list': 'bullet'}, {'indent': '-1'}, {'indent': '+1'}],
      ['link', 'image'],
      ['clean']
    ],
  };

  public formats = [
    'header',
    'bold', 'italic', 'underline', 'strike', 'blockquote',
    'list', 'bullet', 'indent',
    'link', 'image'
  ];

  public render() {
    return (
      <div className="text-editor">
        <ReactQuill value={this.state.text}
                  onChange={this.handleChange} />
      </div>
    );
  }
}
