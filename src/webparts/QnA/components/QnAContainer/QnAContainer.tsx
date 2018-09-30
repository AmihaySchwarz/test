import * as React from 'react';
import * as AuthenticationContext from 'adal-angular';
import styles from './QnAContainer.module.scss';
import { IQnAContainerProps, IQnAContainerState } from './IQnAContainerProps';
import { escape } from '@microsoft/sp-lodash-subset';
import { ViewType } from '../../../common/enum';
import { QnAForm } from '../QnAForm';
import { QnAActionHandler } from '../QnAContainer/QnAActionHandler';
import { Division } from '../../../common/enum/Division';
import { LoadingSpinner } from '../../../common/components/LoadingSpinner/LoadingSpinner';


export class QnAContainer extends React.Component<IQnAContainerProps, IQnAContainerState> {

  private actionHandler: QnAActionHandler;
  public authContext: AuthenticationContext;
 

  constructor(props: IQnAContainerProps, state: IQnAContainerState) {
    super(props);
    this.state = {
        qnaItems: [],
        isLoading: false,
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

  private setLoading(status: boolean): void {
    this.setState({ isLoading: status });
}

  private async loadData(): Promise<void>{
    console.log("in load data");
    this.setLoading(true);
    this.setState({
      currentUser: await this.actionHandler.getCurrentUser()
    });
    this.loadMasterList(this.state.currentUser);
    //this.loadNewQuestions();
  }

  // private async loadNewQuestions(division: string): Promise<void>{
  //     this.setState({
  //       newQuestions: await this.actionHandler.getNewQuestions(this.props.endpointUrl, division)
  //     }); 
  // }

  private async loadMasterList(currentUser: any): Promise<void> {
    let masterListItems = await this.actionHandler.getMasterListItems(currentUser, this.props.webUrl,this.props.masterListName );
    let divisionList = masterListItems.map(divisionItem => ({
      key: divisionItem.QnAListName,
      text: divisionItem.Division.Label
    }));

    this.setState({
      masterItems: divisionList,
      newQuestions: await this.actionHandler.getNewQuestions(this.props.endpointUrl, divisionList[0].text),
      isLoading: false,
    });
  }
  private changeView(view: ViewType): void {
    this.setState({ view });
  }

  public render() {
    {this.state.isLoading && <LoadingSpinner />}
     return <QnAForm newQuestions={this.state.newQuestions} masterItems={this.state.masterItems}
  changeView={this.changeView} actionHandler={this.actionHandler} properties={this.props} currentUser={this.state.currentUser} defaultDivision={this.state.masterItems[0]}/> ;
  }
}
