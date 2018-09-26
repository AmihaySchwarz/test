import { IQnAListItem } from "../../models/IQnAListItem";
import { INewQuestions } from "../../models/INewQuestions";



export interface IQnAPreviewPanelFormProps {
    newQuestions?: INewQuestions[];
    qnaItem: IQnAListItem;
    
}

export interface IQnAPreviewPanelFormState{
    qnaItem: IQnAListItem;
    questions: string;
    answer: string;
}

