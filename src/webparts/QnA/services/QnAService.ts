import { WebPartContext } from '@microsoft/sp-webpart-base';
import { IQnAService } from './IQnAService';
import { BaseService } from '../../common/services/BaseService';
import { HttpClientResponse, HttpClient } from '@microsoft/sp-http';
import { sp , RenderListDataParameters, RenderListDataOptions, ItemAddResult } from '@pnp/sp';
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
    public getMasterListItems(currentUser: any, url: string, masterListName: string): Promise<any>{
        // return this.webPartContext.httpClient.get(`${url}/_api/web/lists/GetByTitle('${masterListName}')/Items?$expand=Editors`, HttpClient.configurations.v1)  
        // .then((response: HttpClientResponse) => {   
        //   //debugger;  
        //   return response.json();  
        // });  

        return sp.web.lists.getByTitle(masterListName).renderListDataAsStream({
            RenderOptions: RenderListDataOptions.ListData,
            ViewXml :  `<View>
                            <ViewFields>
                                <FieldRef Name="Division"/>
                                <FieldRef Name="QnAListName"/>
                                <FieldRef Name="Id"/>
                                <FieldRef Name="Editors"/>
                            </ViewFields>      
                            <Query>
                                <Where>
                                  <Eq>
                                      <FieldRef Name="Editors" LookupId="TRUE" />
                                      <Value Type="Lookup">${currentUser.Id}</Value>
                                  </Eq>
                                </Where>
                            </Query>
                        </View>`
        }).then((userDivision) => {
            console.log(userDivision.Row);
            return userDivision.Row;
        });
    }

    public getQnAItems(divisionListName: string): Promise<any> {
        console.log(divisionListName, "master list item");
        return sp.web.lists.getByTitle(divisionListName).items.select("ID", "Questions", "Answer", "Classification", "QnAID").getAll().then((items: any[]) => {
            console.log(items);
            return items;
        });
    }
    public updateItemInQnAList(url: string,qnaListName:string, id:number, qnaListItems: IQnAListItem[]): Promise<any>{
        //return null;
        let res; 
        qnaListItems.forEach(item => {
             sp.web.lists.getByTitle(qnaListName).items.getById(item.Id).update({
                Questions: item.Questions,
                Answer: item.Answer,
                Classification: item.Classification,
                QnAID: item.QnAID
            }).then(i => {
                console.log(i);
                res = i;
            });
        });

        return res;

        // return sp.web.lists.getByTitle(qnaListName).items.getById(id).update({
        //     Questions: qnaListItem.Questions,
        //     Answer: qnaListItem.Answer,
        //     Classification: qnaListItem.Classification,
        //     QnAID: qnaListItem.QnAID
        // }).then(i => {
        //     console.log(i);
        //     return i
        // });
    };
    public addToQnAList(url: string, qnaListName:string, qnaListItem: IQnAListItem): Promise<any>{
        // add an item to the list
        return sp.web.lists.getByTitle(qnaListName).items.add({
            Questions: qnaListItem.Questions,
            Answer: qnaListItem.Answer,
            Classification: qnaListItem.Classification,
            QnAID: qnaListItem.QnAID
        }).then((result: ItemAddResult) => {
            console.log(result);
            return result;
        });
    };
    
    public updateQnAListTracking(url: string, qnaListTrackingListName: string, qnaListTrackingItem: IQnAListTrackingItem): Promise<any>{
        let res; 
        sp.web.lists.getByTitle(qnaListTrackingListName).items.top(1).filter("Division eq " + qnaListTrackingItem.Division).get().then((items: any[]) => {
            // see if we got something
            if (items.length > 0) {
                return sp.web.lists.getByTitle(qnaListTrackingListName).items.getById(items[0].Id).update({
                    Title: "Updated Title",
                }).then(result => {
                    console.log(JSON.stringify(result));
                    res = result;
                });
            }
        });
        return res;
    };

    public checkLockStatus(url: string, division: string, qnaListTrackingListName: string): Promise<any>{
        console.log(qnaListTrackingListName, "qna tracking list");
        return sp.web.lists.getByTitle(qnaListTrackingListName).items.select("ID", "Division","LastUpdated", "LastPublished", "LockedBy/Id", "LockedBy/EMail", "LockedReleaseTime")
        .filter("Division eq " +division)
        .expand("LockedBY")
        .get().then((items: any[]) => {
            console.log(items);
            return items;
        });
    }

    public lockList (currentUser: any, division: string, qnaListTrackingListName: string) : Promise<any>{
        let res; 
        sp.web.lists.getByTitle(qnaListTrackingListName).items.top(1).filter("Division eq " + division).get().then((items: any[]) => {
            // see if we got something
            if (items.length > 0) {
                return sp.web.lists.getByTitle(qnaListTrackingListName).items.getById(items[0].Id).update({
                    LockedBY: currentUser.Id,
                }).then(result => {
                    console.log(JSON.stringify(result));
                    res = result;
                });
            }
        });
        return res;
    };

    public getNewQuestions: () => Promise<any>;
    public deleteFromNewQuestion: () => Promise<any>;
    public updateQnAMakerKB: (url: string, qnamakerItem: IQnAMakerItem) => Promise<any>;
    public publishQnAMakerItem: (url: string, qnamakerItem: IQnAMakerItem) => Promise<any>;
    
    
    private Error(e) {
        console.log(e);
    }
       
}
