import * as React from 'react';
import CreatableSelect from 'react-select/lib/Creatable';
import styles from '../QnAForm/QnAForm.module.scss';
import * as _ from "lodash";
import RichTextEditor from 'react-rte';
import Draft, { htmlToDraft, draftToHtml, EmptyState, } from 'react-wysiwyg-typescript';



export default class QnAAnswerInput extends React.Component<any,any> {


  constructor(props) {
    super(props);
    this.state = {
      editorState: htmlToDraft(this.props.value) // or use an EmptyState
    }
  
  }

  public onEditorStateChange: Function = (editorState) => {
    console.log(editorState);
    this.setState({
      editorState,
    });
    this.props.onChange(editorState);
  }


  public render() {
    console.log(this.props.value);
    const { editorState } = this.props.value;
    console.log(this.state.editorState);
    //const { value } = this.props.value;

    return(
      <div>
           <Draft
            editorState={this.state.editorState}
            // onEditorStateChange={(editorState) => { this.setState({ editorState }) }}
            onEditorStateChange={(editorState) => this.onEditorStateChange({ editorState })}
          />
      </div>
    );

  }
}


//  // The toolbarConfig object allows you to specify custom buttons, reorder buttons and to add custom css classes.
//   // Supported inline styles: https://github.com/facebook/draft-js/blob/master/docs/Advanced-Topics-Inline-Styles.md
//   // Supported block types: https://github.com/facebook/draft-js/blob/master/docs/Advanced-Topics-Custom-Block-Render.md#draft-default-block-render-map
//   const toolbarConfig = {
//     // Optionally specify the groups to display (displayed in the order listed).
//     display: ['INLINE_STYLE_BUTTONS', 'BLOCK_TYPE_BUTTONS', 'LINK_BUTTONS', 'BLOCK_TYPE_DROPDOWN', 'HISTORY_BUTTONS'],
//     INLINE_STYLE_BUTTONS: [
//       {label: 'Bold', style: 'BOLD', className: 'custom-css-class'},
//       {label: 'Italic', style: 'ITALIC'},
//       {label: 'Underline', style: 'UNDERLINE'}
//     ],
//     BLOCK_TYPE_DROPDOWN: [
//       {label: 'Normal', style: 'unstyled'},
//       {label: 'Heading Large', style: 'header-one'},
//       {label: 'Heading Medium', style: 'header-two'},
//       {label: 'Heading Small', style: 'header-three'}
//     ],
//     BLOCK_TYPE_BUTTONS: [
//       {label: 'UL', style: 'unordered-list-item'},
//       {label: 'OL', style: 'ordered-list-item'}
//     ]
//   };

//   const style = _.isEmpty(value) ? {}  : {display: 'none'};
//     return ( 
//     <div> 
//         <RichTextEditor
//             toolbarConfig={toolbarConfig}
//             value={value}
//             onChanged={this.onChange}
//         />
//          <span className={styles.requiredLabel} style={style}>* required </span> 
//     </div>
    
//     );