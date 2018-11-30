import * as React from 'react';
import CreatableSelect from 'react-select/lib/Creatable';
import styles from '../QnAForm/QnAForm.module.scss';
import * as _ from "lodash";
import TagEditor from "react-tageditor";

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
      this.handleEditItem = this.handleEditItem.bind(this);
      this.handleBlur = this.handleBlur.bind(this);
    }

    // public componentDidMount(){
    //   //console.log(this.props);
    //    this.setState({
    //     value: this.props.value
    //    });
    //  }
  
     public componentWillReceiveProps(newProps): void {
       //console.log(newProps, "new props");
       this.setState({
        value: newProps.value
       });
     }

    public handleBlur(evt) {
      const { value } = evt.target;
  
      if (value !== "") {
        this.setState(state => ({
          value: [...state.value, createOption(value)],
          inputValue: ""
        }));
        //this.props.onChange(this.state.value);
        this.props.onChange([...this.state.value, createOption(value)]);
        //evt.preventDefault();
      }
      console.log(this.state.value);
    }
  
    public handleInputChange(evt) {
      this.setState({ inputValue: evt.target.value });
      
     // this.props.onChange([...this.state.value, createOption(evt.target.value)]);
    }
  
    public handleInputKeyDown(evt) {
      if (evt.keyCode === 13) {
        const { value } = evt.target;
  
        if (value !== "") {
          console.log("enter pressed", value);
          this.setState(state => ({
            value: [...state.value, createOption(value)],
            inputValue: ""
          }));
          this.props.onChange([...this.state.value, createOption(value)]);
         // evt.preventDefault();
        }
      }
  
      if (evt.keyCode === 9) {
        const { value } = evt.target;
  
        if (value !== "") {
          console.log("tab pressed");
          this.setState(state => ({
            value: [...state.value, createOption(value)],
            inputValue: ""
          }));
          this.props.onChange([...this.state.value, createOption(value)]);
         // evt.preventDefault();
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
      }
  
      //console.log(this.state.value, "in handle input");
    }
  
    public handleEditItem(index) {
      return () => {
        let it = this.state.value.filter((item, i) => i === index);
        console.log(it);
        this.setState(state => ({
          value: state.value.filter((item, i) => i !== index),
          inputValue: it[0].label
        }));
      };
    }

    public render() {
      const questionStyles = {
        container: {
          border: "1px solid #ddd",
          padding: "5px",
          borderRadius: "5px"
        },
  
        items: {
          display: "inline-block",
          padding: "2px",
          border: "1px solid black",
          fontFamily: "Helvetica, sans-serif",
          borderRadius: "5px",
          marginRight: "5px",
          margin: "5px",
          cursor: "pointer",
          width: "100%"
        },
  
        input: {
          outline: "none",
          border: "none",
          fontSize: "14px",
          fontFamily: "Helvetica, sans-serif",
          backgroundColor: "inherit",
          width: "100%"
        }
      };
      return (
        <label>
          <ul style={questionStyles.container}>
            {this.state.value.map((item, i) => (
              <li key={i} style={questionStyles.items} onClick={this.handleEditItem(i)}>
                {item.label}
              </li>
            ))}
            <input
              style={questionStyles.input}
              value={this.state.inputValue}
              onChange={this.handleInputChange}
              onKeyDown={this.handleInputKeyDown}
              onBlur={this.handleBlur}
            />
          </ul>
        </label>
      );
    }
  }