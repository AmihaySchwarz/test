import { IQnAListItem } from "../models/IQnAListItem";
import { IQnAListTrackingItem } from "../models/IQnAListTrackingItem";
import { IQnAMakerItem } from "../models/IQnAMakerItem";
import { INewQuestions } from "../models/INewQuestions";

export interface IQnAService {
    getQnAItems: (divisionListName: string, url : string) => Promise<any>;
    getMasterListItems: (currentUser: any[],url: string,  masterListName: string) => Promise<any>;
    getNewQuestions: (endpoint: string) => Promise<any>; //tenant: string, clientId: string, 
    deleteFromNewQuestion:(endpoint: string, item: INewQuestions) =>Promise<any>; //tenant: string, clientId: string, 
    resolveQuestion:(endpoint: string, item: INewQuestions) => Promise<any>;
    checkLockStatus:(currentUser: any, division: string, qnaListTrackingListName: string) => Promise<any>;
    createLockItem:(currentUser: any, division: string, qnaListTrackingListName: string) => Promise<any>;
    lockList:(currentUser: any, division: string, qnaListTrackingListName: string) => Promise<any>;
    updateItemInQnAList:(qnaListName:string, qnaListItems: IQnAListItem[]) => Promise<any>;
    addQuestionToQnAList:(url: string, qnaListName:string, qnaListItem: INewQuestions) => Promise<any>;
    deleteFromQnAList:(qnaListName:string, qnaListItem: IQnAListItem)=> Promise<any>;
    //addToQnAList:(url:string,qnaListName:string,qnaListItem: IQnAListItem ) => Promise<any>;
    updateQnAListTracking:(qnaListTrackingListName: string, division: string, action: string ) => Promise<any>;
    updateQnAMakerKB:(endpoint: string,kbid: string,  qnamakerItem: IQnAMakerItem) => Promise<any>;
    publishQnAMakerItem:(endpoint: string, kbid: string, qnamakerItem: IQnAMakerItem ) => Promise<any>;
    getCurrentUser:() => Promise<any>;  
    //markQuestionAsResolved... ????
    //updateWebpartProps(propertyPath: string, newValue: any): void;
}
