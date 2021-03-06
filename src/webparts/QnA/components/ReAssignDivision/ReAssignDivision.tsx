import * as React from 'react';
import { TextField } from "office-ui-fabric-react/lib/TextField";
import { PrimaryButton } from "office-ui-fabric-react/lib/Button";
import { IReAssignDivisionProps , IReAssignDivisionState } from "./IReAssignDivisionProps";
import styles from "../QnAForm/QnAForm.module.scss";
import {
    Dropdown,
    IDropdownOption
  } from "office-ui-fabric-react/lib/Dropdown";
 

  export default class ReAssignDivision extends React.Component<IReAssignDivisionProps,IReAssignDivisionState> {
    public state = {
      division: "",
      newQuestions: null,
      selectedDivision: null,
      selectedDivisionText: "",
      divisionList: [],
      origDivision: null
    }; 

    
    public componentDidMount(){
      //console.log(this.props, "reassign division");
        this.setState({
            selectedDivision: this.props.defaultDivision,
            divisionList: this.props.divisionList,
            origDivision: this.props.defaultDivision
        });
    }    
   
    public componentWillReceiveProps(newProps): void {
        console.log(newProps, "reassing division will receive props");
        this.setState({
            selectedDivision: newProps.defaultDivision,
            divisionList: newProps.divisionList,
            origDivision: this.props.defaultDivision
        });
    }

    public handleInputChange(value) {
 
      this.setState({
        division: value,
        selectedDivision: value.text
      });
    }


    public setDivisionDD = (item: IDropdownOption): void => {
      
        this.setState({
            division: item.text,
            selectedDivision: item.text
          });
    }

    public render() {
     // const { remarks } = this.state;
    // console.log(this.props.item);
    const { selectedDivision } = this.state;
      return (
     <div>

       { this.props.item != undefined && 
       <div className={styles.reassignModalContent}>
        <span className={styles.notificationText}> Reassign Division </span>
        <br />
        <br />
        <div className={styles.dropdownCont}>
          <Dropdown
              placeHolder="Select Division"
              id="division"
              options={this.state.divisionList}
              selectedKey={
              selectedDivision ? selectedDivision : undefined
              }
              onChanged={this.setDivisionDD}
          />
        </div>
        <br />
          <PrimaryButton
            text="Save"
            primary={true}
            href="#"
            onClick={() => this.props.onSubmitReAssign(this.state.division)}
          />
        </div>
       }
      </div>
      );
    }
  }