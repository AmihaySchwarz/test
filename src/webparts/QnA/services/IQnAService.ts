//import IMyTasks from "../components/Model/IMyTasks";
//import IItemResult from "../../common/models/IItemResult";

export interface IQnAService {
    getQnAItems: (division: string) => Promise<any>;
    getMasterListItems: () => Promise<any>
    updateWebpartProps(propertyPath: string, newValue: any): void;
}
