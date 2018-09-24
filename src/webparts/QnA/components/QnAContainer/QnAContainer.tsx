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

    // if (this.props.authContextOptions) {
    //   if ((window as any)._adalInstance) {
    //       this.authContext = (window as any)._adalInstance;
    //       console.log("adal");
    //   } else {
    //       this.authContext = new AuthenticationContext(this.props.authContextOptions);
    //       console.log(this.authContext, "auth context!");

    //   }
    //}

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
    this.loadNewQuestions();
  }

  private async loadNewQuestions(): Promise<void>{
      this.setState({
        newQuestions: await this.actionHandler.getNewQuestions(this.props.endpointUrl)
      }); //this.props.tenant,this.props.clientId,
  }

  private async loadMasterList(currentUser: any): Promise<void> {


    this.setState({
      masterItems: await this.actionHandler.getMasterListItems(currentUser, this.props.webUrl,this.props.masterListName ),
      isDataLoaded: true,
    });
  }
  private changeView(view: ViewType): void {
    this.setState({ view });
  }

  public render() {
     return <QnADisplayForm newQuestions={this.state.newQuestions} masterItems={this.state.masterItems}
  changeView={this.changeView} actionHandler={this.actionHandler} properties={this.props}/> ;
    // return( <div> TESTING this i the container</div> );
  }
}
