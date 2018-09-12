import { QnAActionHandler } from '../QnAContainer/QnAActionHandler';
//import IQnA from '../Model/IQnA';
import { IQnAService } from '../../services';

export interface IQnADisplayFormProps {
    //service: IQnAService;
    //qnaItems: any[];
    newQuestions: any[];
    actionHandler: QnAActionHandler;
    changeView: Function;
    masterItems: any[];
    //editItemIndex?: string;
    //editItem?: IQnA;
}

export interface IQnAFormState {
    Question: string[];
    Answers: string;
    Classification: string;
    Division: string;
}

export interface INewQuestionsFormState {
    Questions: string [];
    PostedDate: Date;
    PostedBy: string;
}
