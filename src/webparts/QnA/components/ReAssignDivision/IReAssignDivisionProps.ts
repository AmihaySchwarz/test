
import { INewQuestions } from "../../models/INewQuestions";

export interface IReAssignDivisionProps {
    item: INewQuestions;
    onSubmitReAssign: Function;
    defaultDivision: any;
    divisionList: any[];
}

export interface IReAssignDivisionState {
    division: string;
    newQuestions: any;
    selectedDivision:any;
    selectedDivisionText: string;
    divisionList: any[];
}
