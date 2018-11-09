
import "@pnp/polyfill-ie11";
require('core-js');
import 'es6-promise';
require('es6-promise/auto');
import 'whatwg-fetch';
import { WebPartContext } from '@microsoft/sp-webpart-base';
import { IQnAService } from './IQnAService';
import { BaseService } from '../../common/services/BaseService';
import { HttpClientResponse, HttpClient, AadHttpClient } from '@microsoft/sp-http';
import { sp , RenderListDataParameters, RenderListDataOptions, ItemAddResult, Web } from '@pnp/sp';
import { IQnAListItem } from "../models/IQnAListItem";
import { IQnAListTrackingItem } from "../models/IQnAListTrackingItem";
import { INewQuestions } from "../models/INewQuestions";
//import * as moment from 'moment-mini';
import * as storage from "azure-storage";
//const storage = require('azure-storage');

//API Service endpoint : https://sitqnaapiservice20180920061357.azurewebsites.net
//kbid: 3fd5349a-7f39-4599-bbb2-6f3e041703b4

export class QnAService extends BaseService implements IQnAService {

    //private webServiceEnpoint: string;
    private context: WebPartContext;
    //private webUrl: string;
    //private web: Web;

    constructor(webPartContext: WebPartContext) {
        super(webPartContext);
       this.context = webPartContext;
      // this.webUrl = webUrl;
      // this.web = new Web(webUrl);
    }

    public getCurrentUser(): Promise<any> {
        return sp.web.currentUser.get().then((user) => {
            console.log(user);
            return user;
        });
    }
    public getMasterListItems(currentUser: any, url: string, masterListName: string): Promise<any>{
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
            //console.log(userDivision.Row);
            return userDivision.Row;
        });
    }

    public getQnAItems(divisionListName: string): Promise<any> {
       // console.log(divisionListName, "master list item");
        return sp.web.lists.getByTitle(divisionListName).items.select("ID", "Questions", "Answer", "Classification", "QnAID").getAll().then((items: any[]) => {
           // console.log(items);
            return items;
        });
    }

    public updateQnAIDinSPlist(qnaListName: string, qnaListItem: IQnAListItem, qnaid: string): Promise<any> {
        return null;
    }

    public updateItemInQnAList(qnaListName:string, qnaListItems: IQnAListItem[]): Promise<any>{
        //return null;
        let res; 
        qnaListItems.forEach(item => {    
            sp.web.lists.getByTitle(qnaListName).items.getById(item.Id).update({
                Questions: item.Questions,
                Answer: item.Answer,
                Classification: item.Classification,
                QnAID: item.QnAID
            }).then(i => {
               // console.log(i);
                res = i;
            }).catch(error => {
               // console.log(error);
               res = error;
            });         
        });

        return res;
    }

    public addToQnAList(qnaListName:string, qnaListItem: IQnAListItem): Promise<any>{
        // add an item to the list
       // let res; 
        //qnaListItems.forEach(qnaListItem => {   

        return sp.web.lists.getByTitle(qnaListName).items.add({
            Questions: qnaListItem.Questions,
            Answer: qnaListItem.Answer,
            Classification: qnaListItem.Classification,
            QnAID: qnaListItem.QnAID
        }).then((result: ItemAddResult) => {
           // console.log(result);
            return result;
        }).catch(error => {
           // console.log(error);
            return error;
        });
        //});
        //return res;
    }


    public deleteFromQnAList(qnaListName:string, qnaListItems: IQnAListItem[]): Promise<any> {
        //return null;
        let res; 
        qnaListItems.forEach(qnaListItem => {   
             sp.web.lists.getByTitle(qnaListName).items.getById(qnaListItem.Id)
                .delete().then(resp => {
                  //  console.log(resp);
                    res =  resp;
                }).catch(error => {
                  //  console.log(error);
                    res = error;
                });
        });
        return res;
    }
    
    public updateQnAListTracking(qnaListTrackingListName: string,division: string, 
        qnaActionHistory: any [], qnaOriginalCopy: IQnAListItem[], action: string): Promise<any>{
        //let res; 
        //PENDIONG SAVE THE ACTION HISTORY ON SAVE (SAVE)
        //SAVE NULL TO THE QNA PUBLISH STRING AFTER PUBLISHING (PUBLICH)
        let d = new Date();

        return sp.web.lists.getByTitle(qnaListTrackingListName).items.top(1).filter("Division eq '" + division+"'").get().then((items: any[]) => {
            if (items.length > 0) {
                if(action === "save") {
                    return sp.web.lists.getByTitle(qnaListTrackingListName).items.getById(items[0].Id).update({
                        Title: "Updated Title",
                        LockedById: null,
                        LockedReleaseTime: d.toLocaleTimeString(),
                        LastUpdated: d.toLocaleTimeString(),
                        qnaPublishString: JSON.stringify(qnaActionHistory),
                        qnaOriginalCopy: JSON.stringify(qnaOriginalCopy)
                    }).then(result => {
                      //  console.log(result);
                        return result;
                    });
                } else if (action === "publish"){
                    return sp.web.lists.getByTitle(qnaListTrackingListName).items.getById(items[0].Id).update({
                        Title: "Updated Title",
                        LockedById: null,
                        LockedReleaseTime: d.toLocaleTimeString(),
                        LastUpdated: d.toLocaleTimeString(),
                        LastPublished: d.toLocaleTimeString(),
                        qnaPublishString: null,
                        qnaOriginalCopy: null
                    }).then(result => {
                      //  console.log(result);
                        return result;
                    });
                }
            }
        });
        //return res;
    }

    public checkLockStatus(currentUser: any, division: string, qnaListTrackingListName: string): Promise<any>{
        return sp.web.lists.getByTitle(qnaListTrackingListName).items.select("ID", "Division",
        "LastUpdated","LastPublished", "LockedBy/Id", "LockedBy/EMail", 
        "LockedReleaseTime", "qnaPublishString", "qnaOriginalCopy")
            .filter("Division eq '" +division+"'")
            .expand("LockedBy")
            .get()
            .then((items: any[]) => {
                if(items.length == 0) {
                    console.log(items, "item does not exist. creating now");
                    return this.createLockItem(currentUser, division, qnaListTrackingListName).then(res => {
                       return res;
                   });
                } else {
                    console.log(items, "item exists. returning");
                    return items;
                }            
        }).catch((error) => {
            console.log(error);
            return error;
        });
    }

    public createLockItem(currentUser: any, division: string, qnaListTrackingListName: string): Promise<any> {
        let d = new Date();
        return sp.web.lists.getByTitle(qnaListTrackingListName).items.add({
            Division: division,
            LastUpdated: d.toLocaleDateString(),
            //LastPublished: null,
            LockedById: currentUser.Id,
            //LockedReleaseTime: d.toLocaleTimeString()
        }).then((result: ItemAddResult) => {
            //console.log(result.item);
           //return result.item;
           return sp.web.lists.getByTitle(qnaListTrackingListName).items
            .filter("LockedById eq '" + result.data.LockedById + "'")
            .select("ID", "Division","LastUpdated", "LastPublished", "LockedBy/Id", "LockedBy/EMail", "LockedReleaseTime")
            .expand('LockedBy').get().then(res => {return res;});
        });
       // return res;
    }

    public lockList (currentUser: any, division: string, qnaListTrackingListName: string) : Promise<any>{
        //let res; 
        let d = new Date();
        return sp.web.lists.getByTitle(qnaListTrackingListName).items.top(1).filter("Division eq '" + division + "'").get().then((items: any[]) => {
            // see if we got something
            if (items.length > 0) {
                return  sp.web.lists.getByTitle(qnaListTrackingListName).items.getById(items[0].Id).update({
                    LockedById: currentUser.Id,
                    LastUpdated: d.toLocaleDateString()
                }).then(result => {
                    console.log(result);
                    return result;
                }).catch(error => {
                    console.log();
                    return error;
                });
            }
        });
       // return res;
    }

    public addQuestionToQnAList(url: string, qnaListName:string, newQuestionItem: INewQuestions): Promise<any>{

        let jsonQuestion = '[ {"label": "'+ newQuestionItem.Question+'", "value": "'+ newQuestionItem.Question+'" }]';

        return sp.web.lists.getByTitle(qnaListName).items.add({
            Questions: jsonQuestion,
            Answer: null,
            Classification: undefined,
            QnAID: 0
        }).then((result: ItemAddResult) => {
           // console.log(result);
            return result;
        });
    }

    public getNewQuestions(endpoint: string, division: string):Promise<any>{ //tenant: string, clientId: string, 
        //https://sitqnaapiservice20180920061357.azurewebsites.net/api/newquestions
        //GET
        let getQuestionsEndpoint = endpoint + "/api/newquestions/allquestions/"+division;
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
           // console.log(json);
            return json;
        },
            (error: any) => {
          //      console.error(error);
            }
        );
      
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
        //https://sitqnaapiservice20180920061357.azurewebsites.net/api/newquestions/question
        //DELETE
        let deleteQuestionEndpoint = endpoint + "/api/newquestions/question";
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
    }

    public resolveQuestion(endpoint: string, item: INewQuestions): Promise<any>{
        //https://sitqnaapiservice20180920061357.azurewebsites.net/api/newquestions/question
        //PATCH
        let resolveQuestionEndpoint = endpoint + "/api/newquestions/question";
        return this.context.httpClient.fetch(resolveQuestionEndpoint, HttpClient.configurations.v1, {
            //credentials: 'include',
             headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
             }, 
             method: 'PATCH',
            body: JSON.stringify(item)
        }).then((response: HttpClientResponse) => {
            if (response.ok) {
                return response.json();
            } else {
                console.log(response, "error resolving");
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

    public updateQnAMakerKB(endpoint: string, kbid: string, publishJSON: string): Promise<any> {
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
            body: publishJSON //the string of the update format below
        }).then((response: HttpClientResponse) => {
            if (response.ok) {
                return response.json();
                
                
            } else {
                console.log(response, "error");
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

    public publishQnAMakerItem(endpoint: string, kbid: string): Promise<any> {
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
                console.log(response, "error");
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

    public getQnAMakerItems(endpoint: string, kbid: string, env: string): Promise<any> {

        //https://sitqnaapiservice20180920061357.azurewebsites.net/api/qnamaker/qna/3fd5349a-7f39-4599-bbb2-6f3e041703b4/test
        let updateQnAEndpoint = endpoint + "/api/qnamaker/qna/"+kbid +"/"+env;
        return this.context.httpClient.get(updateQnAEndpoint, HttpClient.configurations.v1, {
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
                console.log(response, "error");
                console.error(response.statusText);
            }
        }).then((json: any): any[] => {
            //console.log(json);
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
