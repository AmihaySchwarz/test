import * as React from 'react'
import CreatableSelect from 'react-select/lib/Creatable';

const components = {
    DropdownIndicator: null,
  };
  
  const createOption = (label: string) => ({
    label,
    value: label,
  });
  
  export default class QuestionInput extends React.Component<any,any> {
    state = {
      inputValue: '',
       value: [],
    };

    handleChange = (value: any, actionMeta: any) => {
      console.log(value,actionMeta)
      console.group('Value Changed');
      console.log(value);
      console.log(`action: ${actionMeta.action}`);
      console.groupEnd();
      this.setState({ value });
      this.props.onChange([...value])
    };
    handleInputChange = (inputValue: string) => {
      console.log(inputValue)

      this.setState({ inputValue });
    };
    handleKeyDown = (event) => {
      const { inputValue } = this.state;
      const { value } = this.props
      console.log(inputValue)
      if (!inputValue) return;
      switch (event.key) {
        case 'Enter':
        case 'Tab':
          console.group('Value Added');
          console.log(value);
          console.groupEnd();
          this.setState({
            inputValue: '',
            //value: [...value, createOption(inputValue)]
          })
          this.props.onChange([...value,createOption(inputValue)])
          event.preventDefault();
      }
    };
    render() {
      const { inputValue  } = this.state;
      const { value } =this.props
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
          placeholder="Type something and press enter..."
          value={value}
        />
      );
    }
  }