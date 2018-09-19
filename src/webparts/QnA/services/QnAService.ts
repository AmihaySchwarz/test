import { WebPartContext } from '@microsoft/sp-webpart-base';
import { IQnAService } from './IQnAService';
import { BaseService } from '../../common/services/BaseService';
import { HttpClientResponse, HttpClient } from '@microsoft/sp-http';
import { sp , RenderListDataParameters, RenderListDataOptions } from '@pnp/sp';
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

    };

    public getQnAItems(divisionListName: string): Promise<any> {
        console.log(divisionListName, "master list item");
        return sp.web.lists.getByTitle(divisionListName).items.select("ID", "Questions", "Answer", "Classification", "QnAID").getAll().then((items: any[]) => {
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
    public deleteFromNewQuestion: () => Promise<any>;
    public lockList: () => Promise<any>;
    public updateItemInQnAList: (url: string, qnaListItem: IQnAListItem) => Promise<any>;
    public addToQnAList:(url: string, qnaListItem: IQnAListItem) => Promise<any>;
    public updateQnAListTracking: (url: string, qnaListTrackingItem: IQnAListTrackingItem) => Promise<any>;
    public updateQnAMakerKB: (url: string, qnamakerItem: IQnAMakerItem) => Promise<any>;
    public publishQnAMakerItem: (url: string, qnamakerItem: IQnAMakerItem) => Promise<any>;
   
}
