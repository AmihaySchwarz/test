import { WebPartContext } from '@microsoft/sp-webpart-base';
import { IQnAService } from './IQnAService';
import { BaseService } from '../../common/services/BaseService';
import { HttpClientResponse, HttpClient } from '@microsoft/sp-http';
//import IMyTasks from '../components/Model/IMyTasks';
//import IItemResult from '../../common/models/IItemResult';
//import * as moment from 'moment-mini';

export class QnAService extends BaseService implements IQnAService {
    private endpointUrl: Object;
    private context: WebPartContext;
    public webPartContext: WebPartContext;

    constructor(endpoints: Object, webPartContext: WebPartContext) {
        super(webPartContext);
        //get endpoints
       this.endpointUrl = endpoints;
       this.context = webPartContext;
    }

    public getQnAItems(): Promise<any> {
        return this.webPartContext.httpClient.get(`${this.endpointUrl}/api/v2.0/me/tasks?&$select=*&$top=1000&Status!=Completed&$filter=Status ne 'Completed'&$orderby=DueDateTime/DateTime asc`, HttpClient.configurations.v1, {
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

    public updateWebpartProps(propertyPath: string, newValue: any): void {
        switch (propertyPath) {
            case "endpointUrl":
                this.endpointUrl = newValue;
                break;
            default:
                break;
        }
    }
   
}
