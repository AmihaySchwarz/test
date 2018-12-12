import * as React from "react"
import styles from "../QnAForm/QnAForm.module.scss"
import * as _ from "lodash"
import ReactQuill, { Quill } from "react-quill"
import "react-quill/dist/quill.snow.css"

export default class QnAAnswerInput extends React.Component<any, any> {
  constructor(props) {
    super(props)
    this.handleChange = this.handleChange.bind(this)
    this.setProps = this.setProps.bind(this)
  }

  public setProps() {
    if (this.props.value === "<p><br></p>") {
      this.props.onChange("")
    } else {
      this.props.onChange(this.props.value)
    }
  }

  public handleChange(value) {
    this.props.onChange(value)
  }

  public CustomToolbar = () => (
    <div id="toolbar">
      <button className="ql-bold" />
      <button className="ql-italic" />
    </div>
  )

  public modules = {
    clipboard: {
      matchVisual: false
    },
    toolbar: [
      ["bold", "italic"],
      [
        { list: "ordered" },
        { list: "bullet" },
        { indent: "-1" },
        { indent: "+1" }
      ],
      ["link"]
    ]
  }

  public formats = ["bold", "italic", "list", "bullet", "indent", "link"]

  public render() {
    const style =
      _.isEmpty(this.props.value) || this.props.value === "<p><br></p>"
        ? {}
        : { display: "none" }

    return (
      <div>
        <div className="text-editor" onBlur={this.setProps}>
          <ReactQuill
            value={this.props.value}
            onChange={this.handleChange}
            onBlur={this.setProps}
            modules={this.modules}
            formats={this.formats}
          />
        </div>
        <span className={styles.requiredLabel} style={style}>
          * required{" "}
        </span>
      </div>
    )
  }
}