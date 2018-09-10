import { ViewType } from '../../../common/enum';
import { IQnAService } from '../../services';
//import IMyTasks from '../Model/IMyTasks';
import * as AuthenticationContext from 'adal-angular';

export interface IQnAContainerProps {
  description: string;
  service: IQnAService;
}

export interface IQnAContainerState {
    qnaItems: any[];
    newQuestions: any[];
    isDataLoaded: boolean;
    view: ViewType;
    error: string;
    //editItem: IMyTasks;
    setLoading: boolean;
}
