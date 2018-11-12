import * as React from 'react';
import { Dropdown, IDropdown, DropdownMenuItemType, IDropdownOption } from 'office-ui-fabric-react/lib/Dropdown';
import { ToastContainer, toast } from 'react-toastify';
import styles from '../QnAForm/QnAForm.module.scss';
import * as _ from "lodash";
//Placeholder where will we get this data?

const classificationDropDownOption = [  
  //{key: ' ', text: ' '},
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
     console.log(this.props, "CLASSIFICATION INPUT");
      this.setState({
        selectedItem: this.props.value
      });
    }

    public componentWillReceiveProps(newProps): void {
      console.log(newProps, "will receive props");
      this.setState({
        selectedItem: newProps.value
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
      let style;

      if (selectedItem !== undefined) {
        style = _.isEmpty(selectedItem.key) ? {}  : {display: 'none'};
      }

      return (
     <div>
       { selectedItem && 
            <Dropdown 
            placeHolder="Select"
            id="Classification"
            required={true}
            ariaLabel="Select"
            options={classificationDropDownOption}
            selectedKey={selectedItem ? selectedItem.key : undefined}
            onChanged={this.changeState}
          />
        }
        <span className={styles.requiredLabel} style={style}>* required </span> 
      </div>
      );
    }
  }