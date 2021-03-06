import { IQnAListItem } from "../models/IQnAListItem";
import { IQnAListTrackingItem } from "../models/IQnAListTrackingItem";
import { INewQuestions } from "../models/INewQuestions";

export interface IQnAService {
    getQnAItems: (divisionListName: string, url : string) => Promise<any>;
    getMasterListItems: (currentUser: any[],url: string,  masterListName: string) => Promise<any>;
    getNewQuestions: (endpoint: string, division: string) => Promise<any>; //tenant: string, clientId: string, 
    deleteFromNewQuestion:(endpoint: string, item: INewQuestions) =>Promise<any>; //tenant: string, clientId: string, 
    resolveQuestion:(endpoint: string, item: INewQuestions, remarks: string, currentUser: any) => Promise<any>;
    sendReassignEmail:(division: string, oldDivision: any) => Promise<any>;
    reassignQuestion:(endpoint: string, item: INewQuestions, division: string) => Promise<any>;
    checkLockStatus:(currentUser: any, division: string, qnaListTrackingListName: string) => Promise<any>;
    createLockItem:(currentUser: any, division: string, qnaListTrackingListName: string) => Promise<any>;
    removeLockedBy:(currentUser: any, division: string, qnaListTrackingListName: string) => Promise<any>;
    removeLockedByPublish:(currentUser: any, division: string, qnaListTrackingListName: string) => Promise<any>;
    lockList:(currentUser: any, division: string, qnaListTrackingListName: string) => Promise<any>;
    updateLockReleaseTime:(currentUser: any, division: string, qnaListTrackingListName: string) => Promise<any>;
    updateQnAIDinSPlist:(qnaListName: string, qnaListItem: IQnAListItem, qnaid: string) =>  Promise<any>;
    updateItemInQnAList:(qnaListName:string, qnaListItems: IQnAListItem[]) => Promise<any>;
    addQuestionToQnAList:(url: string, qnaListName:string, qnaListItem: INewQuestions) => Promise<any>;
    deleteFromQnAList:(qnaListName:string, qnaListItem: IQnAListItem[])=> Promise<any>;
    addToQnAList:(qnaListName:string,qnaListItem: IQnAListItem ) => Promise<any>;
    updateQnAListTracking:(qnaListTrackingListName: string, division: string, qnaActionHistory: any [],qnaOriginalCopy: IQnAListItem[], action: string ) => Promise<any>;
    updateQnAMakerKB:(endpoint: string,kbid: string,  qnamakerItem: string) => Promise<any>;
    publishQnAMakerItem:(endpoint: string, kbid: string) => Promise<any>;
    getQnAMakerItems:(endpoint: string, kbid: string, env: string) => Promise<any> ;
    getCurrentUser:() => Promise<any>;  
    getAllDivision:() => Promise<any>;
    //updateWebpartProps(propertyPath: string, newValue: any): void;
}
