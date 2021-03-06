import "@pnp/polyfill-ie11";
//require('core-js');
import 'es6-promise';
//require('es6-promise/auto');
import 'whatwg-fetch';
import { WebPartContext } from '@microsoft/sp-webpart-base';
import { IQnAService } from './IQnAService';
import { BaseService } from '../../common/services/BaseService';
import { HttpClientResponse, HttpClient, AadHttpClient } from '@microsoft/sp-http';
import { sp , RenderListDataParameters, RenderListDataOptions, ItemAddResult, Web , EmailProperties} from '@pnp/sp';
import { IQnAListItem } from "../models/IQnAListItem";
import { IQnAListTrackingItem } from "../models/IQnAListTrackingItem";
import { INewQuestions } from "../models/INewQuestions";
import * as moment from 'moment'; 
import 'moment-timezone';
import { taxonomy, ITermStore, ITermGroupData, ITermGroup } from "@pnp/sp-taxonomy";
import ReactHtmlParser from 'react-html-parser';

//API Service endpoint : https://sitqnaapp.azurewebsites.net 
//kbid: da570262-16d1-4b75-85be-ed753244532d

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
        return sp.web.lists.getByTitle(divisionListName).items.orderBy('Created', true).select("ID", "Questions", "Answer", "Classification", "QnAID", "Remarks", "Rating").getAll().then((items: any[]) => {
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
                QnAID: item.QnAID,
                Remarks: item.Remarks
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
            QnAID: qnaListItem.QnAID,
            Remarks: qnaListItem.Remarks
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
 
        //let d = new Date();
        let d = moment.utc().local().format("MM/DD/YYYY HH:mm");
            console.log(d, "in updated time stamps");
        return sp.web.lists.getByTitle(qnaListTrackingListName).items.top(1).filter("Division eq '" + division+"'").get().then((items: any[]) => {
            if (items.length > 0) {
                if(action === "save") {
                    return sp.web.lists.getByTitle(qnaListTrackingListName).items.getById(items[0].Id).update({
                        Title: "Updated Title",
                        LockedById: null,
                        LockedReleaseTime: d, //d.toLocaleTimeString(),
                        LastUpdated: d, //d.toLocaleTimeString(),
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
                        LockedReleaseTime: d, // d.toLocaleTimeString(),
                        LastUpdated: d, //d.toLocaleTimeString(),
                        LastPublished: d, //d.toLocaleTimeString(),
                        qnaPublishString: JSON.stringify(qnaActionHistory),
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
        "LastUpdated","LastPublished", "LockedBy/Id", "LockedBy/EMail", "LockedBy/Title", 
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
        //let d = new Date();
        let d = moment.utc().local().format("MM/DD/YYYY HH:mm");
        return sp.web.lists.getByTitle(qnaListTrackingListName).items.add({
            Division: division,
            //LastUpdated: d, // d.toLocaleDateString(),
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

    public removeLockedBy(currentUser: any, division: string, qnaListTrackingListName: string): Promise<any> {
        let d = moment.utc().local().format("MM/DD/YYYY HH:mm");
        return sp.web.lists.getByTitle(qnaListTrackingListName).items.top(1).filter("Division eq '" + division + "'").get().then((items: any[]) => {
            // see if we got something
            if (items.length > 0) {
                return  sp.web.lists.getByTitle(qnaListTrackingListName).items.getById(items[0].Id).update({
                    LockedById: null,
                    LockedReleaseTime: d
                   // qnaOriginalCopy: null,
                   // qnaPublishString: null
                }).then(result => {
                    console.log(result);
                    return result;
                }).catch(error => {
                    console.log(error);
                    return error;
                });
            }
        });
    }

    public removeLockedByPublish(currentUser: any, division: string, qnaListTrackingListName: string): Promise<any> {
        let d = moment.utc().local().format("MM/DD/YYYY HH:mm");
        return sp.web.lists.getByTitle(qnaListTrackingListName).items.top(1).filter("Division eq '" + division + "'").get().then((items: any[]) => {
            // see if we got something
            if (items.length > 0) {
                return  sp.web.lists.getByTitle(qnaListTrackingListName).items.getById(items[0].Id).update({
                    LockedById: null
                }).then(result => {
                    console.log(result);
                    return result;
                }).catch(error => {
                    console.log(error);
                    return error;
                });
            }
        });
    }

    public lockList (currentUser: any, division: string, qnaListTrackingListName: string) : Promise<any>{
        //let res; 
        //let d = new Date();
        //let d = moment().tz("Asia/Singapore").format();
        let d = moment.utc().local().format("MM/DD/YYYY HH:mm");
        return sp.web.lists.getByTitle(qnaListTrackingListName).items.top(1).filter("Division eq '" + division + "'").get().then((items: any[]) => {
            // see if we got something
            if (items.length > 0) {
                return  sp.web.lists.getByTitle(qnaListTrackingListName).items.getById(items[0].Id).update({
                    LockedById: currentUser.Id,
                    LockedReleaseTime: d //d.toLocaleDateString()
                }).then(result => {
                    console.log("List Locked: " , result);
                    return result;
                }).catch(error => {
                    console.log(error);
                    return error;
                });
            }
        });
       // return res;
    }


    public updateLockReleaseTime (currentUser: any, division: string, qnaListTrackingListName: string): Promise<any> {
        let d = moment.utc().local().format("MM/DD/YYYY HH:mm");
        return sp.web.lists.getByTitle(qnaListTrackingListName).items.top(1).filter("Division eq '" + division + "'").get().then((items: any[]) => {
            // see if we got something
            if (items.length > 0) {
                return  sp.web.lists.getByTitle(qnaListTrackingListName).items.getById(items[0].Id).update({
                    LockedReleaseTime: d
                }).then(result => {
                    console.log(result);
                    return result;
                }).catch(error => {
                    console.log(error);
                    return error;
                });
            }
        });
    }

    //NOT USED
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

    public async getAllDivision(): Promise<any> {
        //const store: ITermStore = await taxonomy.termStores.getById("0d9a3c16-5838-4abd-8235-6db9593d0738");
        // get a single term by id 6c285b4d-49f9-4666-981d-2b7be6872978
    
       // const store: any = await taxonomy.termStores.getByName("Taxonomy_9D1X5aueEcT7a3LKqetQKw==");

        //const store: ITermStore = 
        //const store: ITermStore = await taxonomy.termStores.getByName("Taxonomy_9D1X5aueEcT7a3LKqetQKw==").get();
        //const set: ITermSet = store.getTermSetById("6c285b4d-49f9-4666-981d-2b7be6872978");
        
        
        const store: ITermStore = await taxonomy.termStores.getByName("Taxonomy_9D1X5aueEcT7a3LKqetQKw==");
        const setWithData = await store.getTermSetById("6c285b4d-49f9-4666-981d-2b7be6872978");
        const termSetGroup = await setWithData.group.get();

        const terms = await setWithData.terms.get();
        let termNames = terms.map(term => ({
            key: term.Name,
            text: term.Name
        }));
        
        //console.log(termSetGroup.Name);
        //console.log(termNames);
        //console.log(setWithData);
        return termNames;
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

    public resolveQuestion(endpoint: string, item: INewQuestions, remarks: string, currentUser: any): Promise<any>{
        //https://sitqnaapiservice20180920061357.azurewebsites.net/api/newquestions/question
        //PATCH
        let d = moment.utc().local().format("MM/DD/YYYY HH:mm");
        let newqitem = {
            ...item, Remarks: remarks, ResolvedBy: currentUser.Title, ResolvedDate: d
          };
          console.log(newqitem);
        let resolveQuestionEndpoint = endpoint + "/api/newquestions/question";
        return this.context.httpClient.fetch(resolveQuestionEndpoint, HttpClient.configurations.v1, {
            //credentials: 'include',
             headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
             }, 
             method: 'PATCH',
            body: JSON.stringify(newqitem)
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


    private async getEmailTo(division: string): Promise<any> {
     
        return sp.web.lists.getByTitle("Email Configuration").items.select("ID", "Title","Topic", "EmailTo")
                            .filter("Title eq '" + division +"'").get().then((items: any[]) => {
            
            let reassignItems = items.filter(i => i.Topic === null);
            return reassignItems;
         });
    }

    private async getEmailDet(): Promise<any> {
       let title = "SIT_Reassignment";
        return sp.web.lists.getByTitle("EmailTemplates").items.select("ID", "Title","Subject", "Body")
                            .filter("Title eq '" + title +"'").get().then((items: any[]) => {            
            return items;
         });
    }

    public async sendReassignEmail(division: string, oldDivision: any): Promise<any> {
        let emailProps: EmailProperties;
        let res;

        this.getEmailTo(division).then(emailRecpients => {
            console.log(emailRecpients);
            let recipients = emailRecpients[0].EmailTo.split(",");
            
            this.getEmailDet().then(emailDet => {
                let emailBody = ReactHtmlParser(emailDet[0].Body).toString().replace("{question}", oldDivision.Question)
                                .replace("{newDivision}", division)
                                .replace("{oldDivision}", oldDivision.Division)
                                .replace("{link}", 
                                    "<a href='https://pleodata.sharepoint.com/sites/sit-faqchatbot-dev/SitePages/QnA-List-Management.aspx'> here </a>");
                emailProps = {
                    To: recipients,
                    Subject: emailDet[0].Subject,
                    Body: emailBody
                };
                sp.utility.sendEmail(emailProps).then((result) => {
                    console.log("Email Sent", result);
                    res = result;
                },
                   (error: any) => {
                    console.error(error);
                    res = error;
                });
            });
        });

         return res;
     }

    public reassignQuestion(endpoint: string, item: INewQuestions, division: string): Promise<any>{
        //https://sitqnaapiservice20180920061357.azurewebsites.net/api/newquestions/reassignquestion
        //PATCH
        let newqitem = {
            ...item, Division: division
          };
        console.log(newqitem);
        let reassignQuestionEndpoint = endpoint + "/api/newquestions/reassignquestion";
        return this.context.httpClient.fetch(reassignQuestionEndpoint, HttpClient.configurations.v1, {
            //credentials: 'include',
             headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
             }, 
             method: 'PATCH',
            body: JSON.stringify(newqitem)
        }).then((response: HttpClientResponse) => {
            if (response.ok) {
                return response.json();
            } else {
                console.log(response, "error reassigning");
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
