import * as React from 'react';
import styles from './QnAQuestionInput.module.scss';

export default class QuestionComp extends React.Component<any,any> {
  constructor(props) {
    super(props);

    this.state = {
      //value: [],
      val: "",
      isEdit: false
    };

    this.handleBlurItem = this.handleBlurItem.bind(this);
    this.handleEditItem = this.handleEditItem.bind(this);
    this.handleRemoveItem = this.handleRemoveItem.bind(this);
    this.itemChange = this.itemChange.bind(this);
  }

  public render() {
  

    const { item } = this.props;
    const { index } = this.props;

    return (
      <div className={styles.listitem}>
        <div key={index} className={styles.items}>
          {this.state.isEdit ? (
            <textarea className={styles.editItemInput}
              value={item}
              onBlur={event => this.handleBlurItem(index, event)}
              onChange={event => this.itemChange(index, event)}
            />
          ) : (
            <div className={styles.qContainer}>
              <span className={styles.indivQuestions} onClick={() => this.handleEditItem(index)}>{item} </span>
                <span className={styles.xButton} onClick={() => this.handleRemoveItem(index)}> x </span>
            </div>
          )}
        </div>
      </div>
    );
  }
  public handleBlurItem(item, evt) {
    this.setState({
      value: item,
      isEdit: false
    });
    console.log(evt.target.value, "blur inside indiv");
    this.props.updateItem(this.props.index,evt.target.value);
    this.props.onBlur(this.props.index,evt.target.value);
  }

  public handleRemoveItem(index) {
    this.props.onRemoveItem(this.props.index);
  }

  public handleEditItem(i) {
    this.setState({
      isEdit: true
    });
  }

  public itemChange(i, evt) {
    this.props.updateItem(this.props.index, evt.target.value);
  }
}
