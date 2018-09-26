import * as React from 'react';
import { Dropdown, IDropdown, DropdownMenuItemType, IDropdownOption } from 'office-ui-fabric-react/lib/Dropdown';

const classificationDropDownOption = [  
  {key: 'class1', text: 'class1'},
  {key: 'class2', text: 'class2'}
];
  

  export default class QnAClassificationInput extends React.Component<any,any> {

    public componentDidMount(){
      console.log(this.props, "CLASSIFICATION INPUT")
    }

    state = {
      selectedItem: this.props,
      selectedItems: []
    }; 

    public changeState = (item: IDropdownOption): void => {
      console.log('here is the things updating...' + item.key + ' ' + item.text + ' ' + item.selected);
      this.setState({ selectedItem: item.text });
      this.props.onChange(this.state.selectedItem);
    };
  

    render() {
      const { selectedItems } = this.state;
      const { selectedItem } =this.props
      return (
      <div>
        <Dropdown 
          placeHolder="classification"
          id="Classification"
          ariaLabel="Select Classification"
          options={classificationDropDownOption}
          selectedKey={selectedItem ? selectedItem.key : undefined}
          onChanged={this.changeState}
          defaultSelectedKey={selectedItem}
        />

      </div>
      );
    }
  }