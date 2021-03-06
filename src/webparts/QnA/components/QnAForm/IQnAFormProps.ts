import { QnAActionHandler } from '../QnAContainer/QnAActionHandler';
import { IQnAService } from '../../services';
import { IQnAListItem } from "../../models/IQnAListItem";
import { IQnAListTrackingItem } from "../../models/IQnAListTrackingItem";
import { INewQuestions } from "../../models/INewQuestions";
import { ViewType } from '../../../common/enum';


export interface IQnAFormProps {
    //service: IQnAService;
    //endpoints?: any;
    actionHandler?: QnAActionHandler;
    newQuestions?: INewQuestions[];
    masterItems?: any[];
    //editItemIndex?: string;
    editItem?: any;
    properties: any;
    currentUser: any;
    defaultDivision: any;
    qnaItems?: IQnAListItem[];
}

export interface IQnAFormState {
    qnaItems: IQnAListItem[];
    // question: string[];
    // answers: string;
    // classification: string;
    division: any[];
    selectedDivision:any;
    selectedDivisionText: string;
    isLoading?: boolean;
    isDataLoaded?: boolean;
    filtered: any;
    filterAll: any;
    //isEdit?: boolean;
    selectedDivisionListName: string;
    //isPublish?: boolean;
    formView: ViewType;
    newQuestions: INewQuestions[];
    //updatedQnA: any[];
    //newQuestion: INewQuestions;
    inputValue: string;
    listTrackingItem: IQnAListTrackingItem;
    currentUser: any;
    qnaActionHistory: any[];
    qnaOriginalCopy: IQnAListItem[];
    searchNewq: string;
    searchQnA: string;
    originModule: string;
    //warningTime: number;
    //signoutTime: number;
   // warnTimeout: number;
    //logoutTimeout: number;
}

export interface INewQuestionsFormState {
    Questions: string [];
    PostedDate: Date;
    PostedBy: string;   
}
