import { IQnAListItem } from "../models/IQnAListItem";
import { IQnAListTrackingItem } from "../models/IQnAListTrackingItem";
import { IQnAMakerItem } from "../models/IQnAMakerItem";

export interface IQnAService {
    getQnAItems: (divisionListName: string, url : string) => Promise<any>;
    getMasterListItems: (currentUser: any[],url: string,  masterListName: string) => Promise<any>;
    getNewQuestions: (url:string) => Promise<any>;
    deleteFromNewQuestion:() =>Promise<any>;
    checkLockStatus:(url:string, division: string, qnaListTrackingListName: string) => Promise<any>;
    lockList:(currentUser: any, division: string, qnaListTrackingListName: string) => Promise<any>;
    updateItemInQnAList:(url: string, qnaListName:string, id:number, qnaListItems: IQnAListItem[]) => Promise<any>;
    addToQnAList:(url:string,qnaListName:string,qnaListItem: IQnAListItem ) => Promise<any>;
    updateQnAListTracking:(url: string, qnaListTrackingListName: string, qnaListTrackingItem: IQnAListTrackingItem ) => Promise<any>;
    updateQnAMakerKB:(url: string, qnamakerItem: IQnAMakerItem ) => Promise<any>;
    publishQnAMakerItem:(url: string, qnamakerItem: IQnAMakerItem ) => Promise<any>;
    getCurrentUser:() => Promise<any>;
    //markQuestionAsResolved... ????
    //updateWebpartProps(propertyPath: string, newValue: any): void;
}
