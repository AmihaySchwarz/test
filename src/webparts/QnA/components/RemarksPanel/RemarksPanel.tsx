import * as React from 'react';
import { TextField } from "office-ui-fabric-react/lib/TextField";
import { PrimaryButton } from "office-ui-fabric-react/lib/Button";
import { IRemarksProps , IRemarksState } from "./IRemarksProps";
import styles from "../QnAForm/QnAForm.module.scss";

  export default class RemarksPanel extends React.Component<IRemarksProps,IRemarksState> {
    public state = {
      remarks: "",
      newQuestions: null
    }; 

    public handleInputChange(value) {
     // console.log(value);
      this.setState({
        remarks: value
      });
    }

    public render() {
     // const { remarks } = this.state;
    // console.log(this.props.item);
      return (
     <div>

       { this.props.item != undefined && 
       <div className={styles.reassignModalContent}>
        <span className={styles.notificationText}> Remarks </span>
        <div> Question: {this.props.item.Question} </div>
          <TextField
            value={this.state.remarks}
            multiline
            rows={4}
            required={true}
            resizable={true} 
            onChanged={(value) => this.handleInputChange(value)}
          />
          <PrimaryButton
            text="Save"
            primary={true}
            href="#"
            onClick={() => this.props.onSubmitRemarks(this.state.remarks)}
          />
        </div>
       }
      </div>
      );
    }
  }