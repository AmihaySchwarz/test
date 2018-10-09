
import { INewQuestions } from "../../models/INewQuestions";

export interface IRemarksProps {
    item: INewQuestions,
    onSubmitRemarks: Function;
}

export interface IRemarksState {
    remarks: string;
    newQuestions: any;
}
