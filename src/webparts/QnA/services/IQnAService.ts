//import IMyTasks from "../components/Model/IMyTasks";
//import IItemResult from "../../common/models/IItemResult";

export interface IQnAService {
    getQnAItems: (masterItems: any[], url : string) => Promise<any>;
    getMasterListItems: (currentUser: string, url : string, masterListName: string) => Promise<any>;
    getNewQuestions: () => Promise<any>;
    updateWebpartProps(propertyPath: string, newValue: any): void;
}
