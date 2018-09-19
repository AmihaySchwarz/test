import { IQnAListItem } from "../models/IQnAListItem";
import { IQnAListTrackingItem } from "../models/IQnAListTrackingItem";
import { IQnAMakerItem } from "../models/IQnAMakerItem";

export interface IQnAService {
    getQnAItems: (divisionListName: string, url : string) => Promise<any>;
    getMasterListItems: (currentUser: any[],url: string,  masterListName: string) => Promise<any>;
    getNewQuestions: (url:string) => Promise<any>;
    deleteFromNewQuestion:() =>Promise<any>;
    checkLockStatus:(url:string, division: any, divisionQnAListName: string) => Promise<any>;
    lockList:() => Promise<any>;
    updateItemInQnAList:(url: string, qnaListItem: IQnAListItem) => Promise<any>;
    addToQnAList:(url:string,qnaListItem: IQnAListItem ) => Promise<any>;
    updateQnAListTracking:(url: string,qnaListTrackingItem: IQnAListTrackingItem ) => Promise<any>;
    updateQnAMakerKB:(url: string, qnamakerItem: IQnAMakerItem ) => Promise<any>;
    publishQnAMakerItem:(url: string, qnamakerItem: IQnAMakerItem ) => Promise<any>;
    getCurrentUser:() => Promise<any>;
    //markQuestionAsResolved... ????
    //updateWebpartProps(propertyPath: string, newValue: any): void;
}
