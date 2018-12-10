import * as React from 'react';
import styles from '../QnAForm/QnAForm.module.scss';
import * as _ from "lodash";
// import { convertToRaw, EditorState, ContentState } from 'draft-js';
// import draftToHtml from 'draftjs-to-html';
// import htmlToDraft from 'html-to-draftjs';
// import { Editor } from 'react-draft-wysiwyg';
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
    //this.handleKeyDown = this.handleKeyDown.bind(this);
  }

  public componentDidMount(){
    //console.log(this.props);
     this.setState({
       text: this.props.value
     });
   }

   public componentWillReceiveProps(newProps): void {
     //console.log(newProps, "new props");
     this.setState({
       text: newProps.value
     });
   }
 
   public setProps() {
     //console.log("set props", this.state.text);
     if(this.state.text === "<p><br></p>"){
      this.props.onChange("");
     } else {
      this.props.onChange(this.state.text);
     }
      
   }

  public handleChange(value) {
    this.setState({ text: value });
    //console.log("update props of parent", value);
    //this.props.onChange(value);
  }

  // public handleKeyDown(value){
  //   this.setState({ text: value });
  //   if(this.state.text === "<p><br></p>"){
  //     this.props.onChange("");
  //    } else {
  //     this.props.onChange(value);
  //    }
  // }


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
    clipboard: {
      matchVisual: false
    },
    toolbar: [
      ['bold', 'italic'],
      [{'list': 'ordered'}, {'list': 'bullet'}, {'indent': '-1'}, {'indent': '+1'}],
      ['link']
    ]
  };

  public formats = [
    'bold', 'italic',
    'list', 'bullet', 'indent',
    'link'
  ];

  public render() {
    //console.log(this.props.value);
    const { val } = this.state;
    const style = ((_.isEmpty(this.state.text)) || (this.state.text === "<p><br></p>")) ? {}  : {display: 'none'};

    return (
      <div>
        <div className="text-editor" onBlur= {this.setProps}>
          <ReactQuill value={this.state.text} 
                    onChange={this.handleChange} 
                   // onKeyDown={this.handleKeyDown}
                    onBlur= {this.setProps} 
                    modules={this.modules} 
                    formats={this.formats}/>
        </div>
        <span className={styles.requiredLabel} style={style}>* required </span> 
      </div>
    );
  }
}
