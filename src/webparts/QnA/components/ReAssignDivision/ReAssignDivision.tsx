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
      divisionList: []
    }; 

    
    public componentDidMount(){
    //console.log(this.props, "reassign division");
        this.setState({
            selectedDivision: this.props.defaultDivision,
            divisionList: this.props.divisionList
        });
    }
   
    public componentWillReceiveProps(newProps): void {
       // console.log(newProps, "reassing division will receive props");
        this.setState({
            selectedDivision: newProps.defaultDivision,
            divisionList: newProps.divisionList
        });
    }

    public handleInputChange(value) {
     // console.log(value);
      this.setState({
        division: value
      });
    }


    public setDivisionDD = (item: IDropdownOption): void => {
        this.setState({
            division: item.text
          });
    }

    public render() {
     // const { remarks } = this.state;
    // console.log(this.props.item);
    const { selectedDivision } = this.state;
      return (
     <div>

       { this.props.item != undefined && 
       <div>
        <span> Reassign to New Division: </span>
        <div> Question: {this.props.item.Question} </div>
        <div className={styles.dropdownCont}>
        <Dropdown
            placeHolder="Select Division"
            id="division"
            options={this.state.divisionList}
            selectedKey={
            selectedDivision ? selectedDivision.key : undefined
            }
            onChanged={this.setDivisionDD}
        />
        </div>
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