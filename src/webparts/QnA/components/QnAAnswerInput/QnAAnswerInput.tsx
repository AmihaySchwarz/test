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
    this.state = { 
      text: ''

    };
    this.handleChange = this.handleChange.bind(this);
    this.setProps = this.setProps.bind(this);
  }

  public componentDidMount(){
    console.log(this.props);
     this.setState({
       text: this.props.value
     });
   }

   public componentWillReceiveProps(newProps): void {
    // console.log(newProps, "new props");
     this.setState({
       text: newProps.value
     });
   }
 
   public setProps() {
     console.log("set props", this.state.text);
      this.props.onChange(this.state.text);
   }

  public handleChange(value) {
    this.setState({ text: value });
    //this.props.onChange(value);
  }



  /*
 * Custom toolbar component including insertStar button and dropdowns
 */
public CustomToolbar = () => (
  <div id="toolbar">
    <button className="ql-bold"></button>
    <button className="ql-italic"></button>
  </div>
)



  public modules = {
    toolbar: [
      ['bold', 'italic', 'blockquote'],
      [{'list': 'ordered'}, {'list': 'bullet'}, {'indent': '-1'}, {'indent': '+1'}],
      ['link']
    ],
  };

  public formats = [
    'bold', 'italic', 'blockquote',
    'list', 'bullet', 'indent',
    'link'
  ];

  public render() {
    //console.log(this.props.value);
    const { val } = this.state;
    //this.state.text
    return (
      <div className="text-editor">
        <ReactQuill value={this.state.text} 
                  onChange={this.handleChange} 
                  onBlur= {this.setProps} modules={this.modules} formats={this.formats}/>
      </div>
    );
  }
}
