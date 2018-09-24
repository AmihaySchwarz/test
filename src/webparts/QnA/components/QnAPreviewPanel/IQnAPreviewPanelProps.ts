import { IQnAListItem } from "../../models/IQnAListItem";
import { INewQuestions } from "../../models/INewQuestions";



export interface IQnAPreviewPanelFormProps {
    newQuestions?: INewQuestions[];
    qnaItems: IQnAListItem[];
}

export interface IQnAPreviewPanelFormState{
    qnaItems: IQnAListItem[];
}

