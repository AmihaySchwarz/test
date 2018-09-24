import { WebPartContext } from '@microsoft/sp-webpart-base';
import { IQnAService } from './IQnAService';
import { BaseService } from '../../common/services/BaseService';
import { HttpClientResponse, HttpClient, AadHttpClient } from '@microsoft/sp-http';
import { sp , RenderListDataParameters, RenderListDataOptions, ItemAddResult } from '@pnp/sp';
import { IQnAListItem } from "../models/IQnAListItem";
import { IQnAListTrackingItem } from "../models/IQnAListTrackingItem";
import { IQnAMakerItem } from "../models/IQnAMakerItem";
import { INewQuestions } from "../models/INewQuestions";
//import * as moment from 'moment-mini';
import * as storage from "azure-storage";
//const storage = require('azure-storage');

//API Service endpoint : https://sitqnaapiservice20180920061357.azurewebsites.net

export class QnAService extends BaseService implements IQnAService {
   
    
    public endpoints: Object;
    private context: WebPartContext;
    public webPartContext: WebPartContext;
   
    constructor(webPartContext: WebPartContext) {
        super(webPartContext);
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
    }

    public addQuestionToQnAList(url: string, qnaListName:string, newQuestionItem: INewQuestions): Promise<any>{

        let jsonQuestion = '[ {"question": "'+ newQuestionItem.RowKey.trim()+'"}]';

        return sp.web.lists.getByTitle(qnaListName).items.add({
            Questions: jsonQuestion,
            Answer: null,
            Classification: undefined,
            QnAID: 0
        }).then((result: ItemAddResult) => {
            console.log(result);
            return result;
        });
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
    }


    public deleteFromQnAList(qnaListName:string, qnaListItem: IQnAListItem): Promise<any> {
        //return null;
        return sp.web.lists.getByTitle(qnaListName).items.getById(qnaListItem.Id)
            .delete().then(res => {
                console.log(res);
                return res;
            });
    }
    
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
    }

    public checkLockStatus(division: string, qnaListTrackingListName: string): Promise<any>{
        console.log(qnaListTrackingListName, "qna tracking list");
        return sp.web.lists.getByTitle(qnaListTrackingListName).items.select("ID", "Division","LastUpdated", "LastPublished", "LockedBy/Id", "LockedBy/EMail", "LockedReleaseTime")
        .filter("Division eq " +division)
        .expand("LockedBy")
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
    }

    public getNewQuestions(endpoint: string):Promise<any>{ //tenant: string, clientId: string, 
        //https://sitqnaapiservice20180920061357.azurewebsites.net/api/newquestions
        //GET
        let getQuestionsEndpoint = endpoint + "/api/newQuestions";
        return this.context.httpClient.get(getQuestionsEndpoint, HttpClient.configurations.v1, {
            //credentials: 'include'
             headers: {
                 'Content-Type': 'application/json'
             }
        }).then((response: HttpClientResponse) => {
            if (response.ok) {
                return response.json();
            } else {
                console.error(response.statusText);
            }
        }).then((json: any): any[] => {
            console.log(json);
            return json;
        },
            (error: any) => {
                console.error(error);
            }
        );
        //connect to the api service endpoint created 
        // return this.context.aadHttpClientFactory
        // .getClient(clientId)
        // .then((client: AadHttpClient): void => {
        // client
        //     .get(endpoint+'/api/NewQuestions/test', AadHttpClient.configurations.v1)
        //     .then((response: HttpClientResponse): Promise<any> => {
        //     return response.json();
        //     })
        //     .then((testRes: string): void => {
        //         console.log(testRes, "TEST RESULT");
        //        // return testRes;
        //     });
        // });
    }

    public deleteFromNewQuestion(endpoint: string, item: INewQuestions): Promise<any>{ //tenant: string, clientId: string, 
        //https://sitqnaapiservice20180920061357.azurewebsites.net/api/newquestions/deleterecord
        //DELETE
        let deleteQuestionEndpoint = endpoint + "/api/newquestions/deleterecord";
        return this.context.httpClient.fetch(deleteQuestionEndpoint, HttpClient.configurations.v1, {
            //credentials: 'include',
             headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
             }, 
             method: 'DELETE',
            body: JSON.stringify(item)
        }).then((response: HttpClientResponse) => {
            if (response.ok) {
                return response.json();
            } else {
                console.log(response, "error deleting");
                console.error(response.statusText);
            }
        }).then((json: any): any[] => {
            console.log(json);
            return json;
        },
            (error: any) => {
                console.error(error);
            }
        );
    };
    public updateQnAMakerKB(endpoint: string, kbid: string, qnamakerItem: IQnAMakerItem): Promise<any> {
        //https://sitqnaapiservice20180920061357.azurewebsites.net/api/qnamaker/qna/3fd5349a-7f39-4599-bbb2-6f3e041703b4
        //PATCH
        let updateQnAEndpoint = endpoint + "/api/qnamaker/qna/"+kbid;
        return this.context.httpClient.fetch(updateQnAEndpoint, HttpClient.configurations.v1, {
            //credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }, 
            method: 'PATCH',
            body: JSON.stringify({
                new_kb : ""//the string of the update format below
            })
            
        }).then((response: HttpClientResponse) => {
            if (response.ok) {
                return response.json();
            } else {
                console.log(response, "error deleting");
                console.error(response.statusText);
            }
        }).then((json: any): any[] => {
            console.log(json);
            return json;
        },
            (error: any) => {
                console.error(error);
            }
        );
    };
    public publishQnAMakerItem(endpoint: string, kbid: string, qnamakerItem: IQnAMakerItem ): Promise<any> {
        //NEED TO GET THE kbid, important parameter
        // foreach?
        
        //https://sitqnaapiservice20180920061357.azurewebsites.net/api/qnamaker/qna/3fd5349a-7f39-4599-bbb2-6f3e041703b4
        let updateQnAEndpoint = endpoint + "/api/qnamaker/qna/"+kbid;
        return this.context.httpClient.post(updateQnAEndpoint, HttpClient.configurations.v1, {
            //credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            }
            // body: JSON.stringify({
            //     new_kb : ""//the string of the update format below
            // })
            
        }).then((response: HttpClientResponse) => {
            if (response.ok) {
                return response.json();
            } else {
                console.log(response, "error deleting");
                console.error(response.statusText);
            }
        }).then((json: any): any[] => {
            console.log(json);
            return json;
        },
            (error: any) => {
                console.error(error);
            }
        );

    }
    
    
    private Error(e) {
        console.log(e);
    }
       
}
