import { IQnAListItem } from "../../models/IQnAListItem";
import { INewQuestions } from "../../models/INewQuestions";



export interface IQnAPreviewPanelFormProps {
    qnaItem: IQnAListItem;
    
}

export interface IQnAPreviewPanelFormState{
    qnaItem: IQnAListItem;
    questions: string;
    answer: string;
}

