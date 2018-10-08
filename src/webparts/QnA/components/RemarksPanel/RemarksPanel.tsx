import * as React from 'react';
import { TextField } from "office-ui-fabric-react/lib/TextField";
import { DefaultButton } from "office-ui-fabric-react/lib/Button";

  export default class RemarksPanel extends React.Component<any,any> {
    public state = {
      remarks: ""
    }; 


    public render() {
      const { remarks } = this.state;

      return (
     <div>
        <TextField
          value={remarks}
          multiline
          rows={4}
          required={true}
          resizable={true}
        />
        <DefaultButton
          text="Publish"
          primary={true}
          href="#"
          onClick={this.props.onSubmitRemarks(remarks)}
        />
      </div>
      );
    }
  }