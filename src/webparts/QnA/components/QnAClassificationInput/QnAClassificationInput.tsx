import * as React from 'react';
import { Dropdown, IDropdown, DropdownMenuItemType, IDropdownOption } from 'office-ui-fabric-react/lib/Dropdown';

//Placeholder where will we get this data?

const classificationDropDownOption = [  
  {key: 'Staff', text: 'Staff'},
  {key: 'Public', text: 'Public'},
  {key: 'Student', text: 'Student'}
];
  
  export default class QnAClassificationInput extends React.Component<any,any> {

    public state = {
      selectedItemText: "",
      selectedItems: [],
      selectedItem: undefined
    }; 


    public componentDidMount(){
    // console.log(this.props, "CLASSIFICATION INPUT")
      this.setState({
        selectedItem: this.props.value
      });
    }


    public changeState = (item: IDropdownOption): void => {
      console.log('here is the things updating...' + item.key + ' ' + item.text + ' ' + item);
      this.setState({ 
        selectedItem: item,
        selectedItemText: item.key
      });
      this.props.onChange(item.key);
    }
  
    public render() {
      const { selectedItem } = this.state;

      return (
     <div>
       { selectedItem && 
            <Dropdown 
            placeHolder="classification"
            id="Classification"
            required={true}
            ariaLabel="Select Classification"
            options={classificationDropDownOption}
           selectedKey={selectedItem ? selectedItem.key : undefined}
            onChanged={this.changeState}
          />
        }
      </div>
      );
    }
  }