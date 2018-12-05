import * as React from 'react';
import CreatableSelect from 'react-select/lib/Creatable';
import styles from './QnAQuestionInput.module.scss';
import Formstyles from '../QnAForm/QnAForm.module.scss';
import * as _ from "lodash";
import TagEditor from "react-tageditor";
import QuestionComp from './QuestionComp';

const components = {
    DropdownIndicator: null
  };
  
  const createOption = (label: string) => ({
    label,
    value: label,
  });

  
  export default class QuestionInput extends React.Component<any,any> {
    constructor(props) {
      super(props);
  
      this.state = {
        value: props.value,
        focused: false,
        inputValue: ""
      };
  
      this.handleInputChange = this.handleInputChange.bind(this);
      this.handleInputKeyDown = this.handleInputKeyDown.bind(this);
      //this.handleEditItem = this.handleEditItem.bind(this);
      this.handleBlur = this.handleBlur.bind(this);
      this.handleRemoveItem = this.handleRemoveItem.bind(this);
      this.updateQItem = this.updateQItem.bind(this);
      //this.onClick = this.onClick.bind(this);
    }

  
     public componentWillReceiveProps(newProps): void {
       this.setState({
        value: newProps.value
       });
     }

     public updateQItem(index, item) {
      if (item !== "") {
        const newValue = this.state.value.map((x, i) => {
          if (i === index) {
            return createOption(item);
          } else {
            return x;
          }
        });
        this.setState(state => ({
          value: newValue,
          inputValue: ""
        }));
      }
      console.log(this.state.value);
    }
  
    public handleRemoveItem(index) {
      console.log(
        index,
        "tesr",
        this.state.value.filter((item, i) => i !== index)
      );
      this.setState(state => ({
        value: state.value.filter((item, i) => i !== index)
      }));
      this.props.onChange(this.state.value.filter((item, i) => i !== index));
    }
  
    public handleBlur(evt) {
      const { value } = evt.target;
  
      console.log(value);
      if (value !== "") {
        this.setState(state => ({
            value: [...state.value, createOption(value)],
            inputValue: ""
          }));  
          //this.props.onChange(this.state.value);
          this.props.onChange([...this.state.value, createOption(value)]);  
      }
      console.log(this.state.value, "blur", value);
    }
  
    public handleInputChange(evt) {
      this.setState({ inputValue: evt.target.value });
    }
  
    public handleInputKeyDown(evt) {
      if (evt.keyCode === 13) {
        const { value } = evt.target;
  
        if (value !== "") {
          this.setState(state => ({
            value: [...state.value, createOption(value)],
            inputValue: ""
          }));
          this.props.onChange([...this.state.value, createOption(value)]);  
        }
        console.log(value);
      }
  
      if (evt.keyCode === 9) {
        const { value } = evt.target;
  
        if (value !== "") {
          this.setState(state => ({
            value: [...state.value, createOption(value)],
            inputValue: ""
          }));
          this.props.onChange([...this.state.value, createOption(value)]);  
        }
        
      }
  
      if (
        this.state.value.length &&
        evt.keyCode === 8 &&
        !this.state.inputValue.length
      ) {
        this.setState(state => ({
          value: state.value.slice(0, state.value.length - 1)
        }));  
        this.props.onChange(this.state.value.slice(0, this.state.value.length - 1));
      }
  
      //console.log(this.state.value);
    }

    // public onClick(evt) {
    //   const { value } = evt.target;
    //   if (value !== "") {
    //     this.setState(state => ({
    //       value: [...state.value, createOption(value)],
    //       inputValue: ""
    //     }));
    //   }
    //   console.log("on click", this.state.value);
    // }

    public render() {
      const style = ((this.state.value.length == 0) || (_.isEmpty(this.state.value))) ? {}  : {display: 'none'};
      return (
        <label>
          <ul className={styles.container}>
            {this.state.value.map((item, i) => (

              <QuestionComp
                item={item.label}
                index={i}
                key={i}
                onRemoveItem={this.handleRemoveItem}
                updateItem={this.updateQItem}
              />
            ))}
            <input
              className={styles.input}
              value={this.state.inputValue}
              onChange={this.handleInputChange}
              onKeyDown={this.handleInputKeyDown}
              onBlur={this.handleBlur}
              //onClick={this.onClick}
            />
          </ul>
          <span className={Formstyles.requiredLabel} style={style}>* required </span> 
        </label>
      );
    }
  }