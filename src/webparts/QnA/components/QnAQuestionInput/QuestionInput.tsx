import * as React from 'react';
import CreatableSelect from 'react-select/lib/Creatable';

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
      //console.log(inputValue);
    }
    public handleKeyDown = (event) => {
      const { inputValue } = this.state;
      const { value } = this.props;
      //console.log(inputValue);
      if (!inputValue) {
        //console.log(inputValue);
        return;
      } 
      switch (event.key) {
        case 'Enter':
          this.setState({
            inputValue: '',
            //value: [...value, createOption(inputValue)]
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
      }
    }
    public render() {
      const { inputValue  } = this.state;
      const { value } =this.props;
      //console.log(inputValue);
      return (
        <CreatableSelect
          components={components}
          inputValue={inputValue}
          isClearable
          isMulti
          menuIsOpen={false}
          onChange={this.handleChange}
          onInputChange={this.handleInputChange}
          onKeyDown={this.handleKeyDown}
          placeholder="Enter Questions"
          value={value}
        />
      );
    }
  }