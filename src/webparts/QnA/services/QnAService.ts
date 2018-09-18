import { WebPartContext } from '@microsoft/sp-webpart-base';
import { IQnAService } from './IQnAService';
import { BaseService } from '../../common/services/BaseService';
import { HttpClientResponse, HttpClient } from '@microsoft/sp-http';
import { sp } from '@pnp/sp';
import { IQnAListItem } from "../models/IQnAListItem";
import { IQnAListTrackingItem } from "../models/IQnAListTrackingItem";
import { IQnAMakerItem } from "../models/IQnAMakerItem";
//import * as moment from 'moment-mini';

export class QnAService extends BaseService implements IQnAService {
   
    
    public endpoints: Object;
    private context: WebPartContext;
    public webPartContext: WebPartContext;

    constructor(webPartContext: WebPartContext) {
        super(webPartContext);
        //get endpoints
       // console.log(endpoints);
       //this.endpoints = endpoints;
       this.context = webPartContext;
    }

    public getCurrentUser(): Promise<any> {
        return sp.web.currentUser.get().then((user) => {
            console.log(user);
            return user;
        });
    }
    public getMasterListItems(currentUser: any[], url: string, masterListName: string): Promise<any>{
        return this.webPartContext.httpClient.get(`${url}/_api/web/lists/GetByTitle('${masterListName}')/Items?$expand=Editors`, HttpClient.configurations.v1)  
        .then((response: HttpClientResponse) => {   
          //debugger;  
          return response.json();  
        });  
    };

    public getQnAItems(masterListItem: any[]): Promise<any> {
        console.log(masterListItem, "master list item");
        return sp.web.lists.getByTitle(masterListItem[0].Title).items.select("ID", "Questions", "Answer", "Classification", "QnAID").getAll().then((items: any[]) => {
            console.log(items);
            return items;
        });
    }

    public checkLockStatus(division: any, divisionQnAListName: string): Promise<any>{
        return null;
    }

    private Error(e) {
        console.log(e);
    }
    
    public getNewQuestions: () => Promise<any>;
    deleteFromNewQuestion: () => Promise<any>;
    lockList: () => Promise<any>;
    updateItemInQnAList: (url: string, qnaListItem: IQnAListItem) => Promise<any>;
    addToQnAList:(url: string, qnaListItem: IQnAListItem) => Promise<any>;
    updateQnAListTracking: (url: string, qnaListTrackingItem: IQnAListTrackingItem) => Promise<any>;
    updateQnAMakerKB: (url: string, qnamakerItem: IQnAMakerItem) => Promise<any>;
    publishQnAMakerItem: (url: string, qnamakerItem: IQnAMakerItem) => Promise<any>;
   
}
