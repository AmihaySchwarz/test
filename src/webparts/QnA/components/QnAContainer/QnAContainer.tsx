import * as React from 'react';
import * as AuthenticationContext from 'adal-angular';
import styles from './QnAContainer.module.scss';
import { IQnAContainerProps, IQnAContainerState } from './IQnAContainerProps';
import { escape } from '@microsoft/sp-lodash-subset';
import { ViewType } from '../../../common/enum';
import { QnADisplayForm } from '../QnADisplayForm';
import { QnAActionHandler } from '../QnAContainer/QnAActionHandler';
import { Division } from '../../../common/enum/Division';


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
        setLoading: true,
        newQuestions: [],
        masterItems: [],
        currentUser: undefined
    };
    this.changeView = this.changeView.bind(this);
    this.actionHandler = new QnAActionHandler(this, this.props.service);
    this.loadData = this.loadData.bind(this);
  }
  public async componentWillReceiveProps(newProps): Promise<void>
  {
    this.loadData();
  }

  public async componentDidMount() : Promise<void>
  {
    console.log("componentdsd did mount")
   this.loadData();
  }

  private async loadData(): Promise<void>{
    console.log("in load data");
    this.setState({
      currentUser: await this.actionHandler.getCurrentUser()
    });
    this.loadMasterList(this.state.currentUser);
  }

  private async loadMasterList(currentUser: any): Promise<void> {
    console.log(this.props.endpoints[0].tenantQnAUrl, "ENDPOINTS");

    this.setState({
      masterItems: await this.actionHandler.getMasterListItems(currentUser, this.props.endpoints[0].weburl,this.props.endpoints[0].masterListName ),
      isDataLoaded: true,
    });
    console.log(this.state.masterItems, "master items!");
    
  }
  private changeView(view: ViewType): void {
    this.setState({ view });
  }

  public render() {
    console.log(this.state.masterItems,"lasudlkasdj")
    
     return <QnADisplayForm newQuestions={this.state.newQuestions} masterItems={this.state.masterItems}
             changeView={this.changeView} actionHandler={this.actionHandler} endpoints={this.props.endpoints} /> ;
    // return( <div> TESTING this i the container</div> );
  }
}
