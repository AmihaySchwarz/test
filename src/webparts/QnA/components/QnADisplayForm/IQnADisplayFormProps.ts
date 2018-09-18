import { QnAActionHandler } from '../QnAContainer/QnAActionHandler';
import { IQnAService } from '../../services';
import { IQnAListItem } from "../../models/IQnAListItem";
import { IQnAListTrackingItem } from "../../models/IQnAListTrackingItem";
import { IQnAMakerItem } from "../../models/IQnAMakerItem";
import { INewQuestions } from "../../models/INewQuestions";


export interface IQnADisplayFormProps {
    //service: IQnAService;
    endpoints: any;
    actionHandler: QnAActionHandler;
    newQuestions: INewQuestions[];
    changeView: Function;
    masterItems: any[];
    //editItemIndex?: string;
    editItem?: any;
}

export interface IQnAFormState {
    qnaItems: IQnAListItem[];
    question: string[];
    answers: string;
    classification: string;
    division: string;
    selectedItem:any;
    isLoading?: boolean;
    isDataLoaded?: boolean;
    filtered: any;
    filterAll: any;
}

export interface INewQuestionsFormState {
    Questions: string [];
    PostedDate: Date;
    PostedBy: string;
}
