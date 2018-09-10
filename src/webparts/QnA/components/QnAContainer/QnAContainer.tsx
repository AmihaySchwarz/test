import * as React from 'react';
import * as AuthenticationContext from 'adal-angular';
import styles from './QnAContainer.module.scss';
import { IQnAContainerProps, IQnAContainerState } from './IQnAContainerProps';
import { escape } from '@microsoft/sp-lodash-subset';
import { ViewType } from '../../../common/enum';
import { QnADisplayForm } from '../QnADisplayForm';
import { QnAActionHandler } from '../QnAContainer/QnAActionHandler';

export class QnAContainer extends React.Component<IQnAContainerProps, IQnAContainerState> {

  private actionHandler: QnAActionHandler;
  public authContext: AuthenticationContext;

  constructor(props: IQnAContainerProps, state: IQnAContainerState) {
    super(props);
    this.state = {
        qnaItems: [],
        isDataLoaded: false,
        view: ViewType.Display,
        error: "",
        //editItem: undefined,
        setLoading: true,
        newQuestions: [],
    };
    this.changeView = this.changeView.bind(this);
    this.actionHandler = new QnAActionHandler(this, this.props.service);
  }
  public componentWillReceiveProps(newProps): void {
    console.log("in recevied props");
    this.loadData(newProps);
  }

  public componentDidMount() {
    console.log("in did mount");
    //check data in master list if current user has access to the divisions
      this.loadData(this.props);
  }

  private changeView(view: ViewType): void {
    this.setState({ view });
  }

  private async loadData(props): Promise<void> {
    console.log("load Data");
    this.setState({
      qnaItems: await this.actionHandler.getQnAItems(),
      isDataLoaded: true,
    });
  }

  public render(): React.ReactElement<IQnAContainerProps> {
    console.log(this.state.qnaItems,"lasudlkasdj")
    return <QnADisplayForm newQuestions={this.state.newQuestions} 
    changeView={this.changeView} qnaItems={this.state.qnaItems} actionHandler={this.actionHandler} />;
    //return( <div> TESTING this i the container</div> );
  }
}
