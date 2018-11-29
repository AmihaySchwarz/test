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
    public state = {
      inputValue: '',
       value: [],
    };

    public handleChange = (value: any, actionMeta: any) => {
      // console.log(value,actionMeta);
      // console.group('Value Changed');
      // console.log(value);
      console.log(`action: ${actionMeta.action}`);
      //console.groupEnd();
      //console.log(value);
      this.setState({ value });
      this.props.onChange([...value]);
    }
    public handleInputChange = (inputValue: string) => {
      this.setState({ inputValue : inputValue});
    //  console.log(inputValue);
    }

    public handleBlur = (event) => {
      const { inputValue } = this.state;
      const { value } = this.props;

      if (!_.isEmpty(inputValue)) {
        this.setState({
          inputValue: ''
        });
        this.props.onChange([...value,createOption(inputValue)]);
        event.preventDefault();
      }
    }

    public onValueClick = (value : string) => {
      console.log("this is the value clicked", value);
    }

    public handleKeyDown = (event) => {
      const { inputValue } = this.state;
      const { value } = this.props;
     // console.log(inputValue);
      if (!inputValue) {
        //console.log(inputValue);
        return;
      } 

      switch (event.key) {
        case 'Enter':
          this.setState({
            inputValue: ''
          });
          this.props.onChange([...value,createOption(inputValue)]);
          event.preventDefault();
          break;
        case 'Tab':
          //console.group('Value Added');
          //console.log(value);
          //console.groupEnd();
          this.setState({
            inputValue: '',
            //value: [...value, createOption(inputValue)]
          });
          this.props.onChange([...value,createOption(inputValue)]);
          event.preventDefault();
          break;
        default:
            return null;
      }
    }


    public render() {
      const { inputValue  } = this.state;
      const { value } =this.props;
      //console.log(value);

      const style = _.isEmpty(value) ? {}  : {display: 'none'};


      //console.log(inputValue);
      return ( //className={styles.inputContainer}              // isClearable
        <div> 
          <div>
            {/* <span className={styles.requiredLabel}>*</span> */}
            <CreatableSelect
               styles={{
                multiValueLabel: (provided, state) => ({
                  ...provided,
                  whiteSpace: "normal"
                })
              }}
              cropWithEllipsis={false}
              components={components}
              inputValue={inputValue}
              isClearable={false} 
              isMulti
              menuIsOpen={false}
              onChange={this.handleChange}
              onInputChange={this.handleInputChange}
              onBlur={this.handleBlur}
              onKeyDown={this.handleKeyDown}
              value={value}
              className={styles.questionInput}
              onValueClick={this.onValueClick}
             
            />

            {/* <TagEditor onChange={this.handleChange} delimiters={[]} /> */}

          </div>          
          <span className={styles.requiredLabel} style={style}>* required </span> 
        </div>
       
      );
    }
  }