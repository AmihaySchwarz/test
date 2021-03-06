import { QnAActionHandler } from '../QnAContainer/QnAActionHandler';
import { IQnAService } from '../../services';
import { IQnAListItem } from "../../models/IQnAListItem";
import { IQnAListTrackingItem } from "../../models/IQnAListTrackingItem";
import { INewQuestions } from "../../models/INewQuestions";
import { ViewType } from '../../../common/enum';


export interface IQnADisplayFormProps {
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
    qnaActionHistory: any[];
    onEditClick: Function;
    onPublishClick : Function;
    qnaOriginalCopy;
    onDivisionSet: Function;
}

export interface IQnADisplayFormState {
    qnaItems: IQnAListItem[];
    division: any[];
    selectedDivision:any;
    selectedDivisionText: string;
    isLoading?: boolean;
    selectedDivisionListName: string;
    formView: ViewType;
    newQuestions: INewQuestions[];
    resolvedQuestions: INewQuestions[];
    listTrackingItem: IQnAListTrackingItem;
    currentUser: any;
    qnaActionHistory: any[];
    qnaOriginalCopy: IQnAListItem[];
    searchNewq: string;
    searchQnA: string;
    showResolvedQuestions: boolean;
    searchedQnA: any[];
    searchedNewq: INewQuestions[];
}

export interface INewQuestionsFormState {
    Questions: string [];
    PostedDate: Date;
    PostedBy: string;
    
}
