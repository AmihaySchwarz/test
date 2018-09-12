import { WebPartContext } from '@microsoft/sp-webpart-base';
import { IQnAService } from './IQnAService';
import { BaseService } from '../../common/services/BaseService';
import { HttpClientResponse, HttpClient } from '@microsoft/sp-http';
//import IMyTasks from '../components/Model/IMyTasks';
//import IItemResult from '../../common/models/IItemResult';
//import * as moment from 'moment-mini';

export class QnAService extends BaseService implements IQnAService {
   
    public qnaTenantUrl: Object;
    private context: WebPartContext;
    public webPartContext: WebPartContext;

    constructor(webPartContext: WebPartContext) {
        super(webPartContext);
        //get endpoints
        //console.log(endpoints);
       //this.qnaTenantUrl = endpoints;
       this.context = webPartContext;
    }

    public getQnAItems(masterListItems: any[], url : string): Promise<any> {
        console.log(masterListItems, "master list items");
        return this.webPartContext.httpClient.get(`${url}/_api/lists/getbytitle('${masterListItems}')/items`, HttpClient.configurations.v1, {
            headers: {
                'Prefer': 'outlook.timezone="Singapore Standard Time"',
                //'Authorization': "Bearer " + accesstoken,
                'Cache-Control': 'no-cache',
                'pragma': 'no-cache'
            }
        })
            .then((response: HttpClientResponse) => {
                if (!response.ok) {
                    throw Error(response.statusText);
                }
                return response.json();
            })
            .then((json) => {
                return json.value;
            })
            .catch((e) => {
                this.Error(e);
            });
    }
    private Error(e) {
        console.log(e);
    }

    public getMasterListItems(currentUser: string, url : string, masterListName: string): Promise<any>{

        return this.webPartContext.httpClient.get(`${url}/_api/web/lists/GetByTitle('${masterListName}')/Items?$expand=Editors`, HttpClient.configurations.v1)  
        .then((response: HttpClientResponse) => {   
          //debugger;  
          return response.json();  
        });  
    };

    public getNewQuestions: () => Promise<any>;

    public updateWebpartProps(propertyPath: string, newValue: any): void {
        switch (propertyPath) {
            case "tenantUrl":
                this.qnaTenantUrl = newValue;
                break;
            default:
                break;
        }
    }
   
}
