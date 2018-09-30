import { ViewType } from '../../../common/enum';
import { IQnAService } from '../../services';
//import IMyTasks from '../Model/IMyTasks';
import * as AuthenticationContext from 'adal-angular';

export interface IQnAContainerProps {
  //description: string;
  service: IQnAService;
  //endpoints: any;
  masterListName: string;
  endpointUrl: string;
  qnATrackingListName:string;
  webUrl: string;
  qnAMakerKnowledgeBaseId: string;
  isConfigured: boolean;
  //clientId: any;
  //tenant: any;
  //authContextOptions: AuthenticationContext.Options;
}

export interface IQnAContainerState {
    qnaItems: any[];
    newQuestions: any[];
    masterItems: any[];
    isLoading: boolean;
    view: ViewType;
    error: string;
    //editItem: IMyTasks;
    setLoading: boolean;
    currentUser: any;
}
