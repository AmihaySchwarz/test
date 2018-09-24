import { QnAContainer } from "./QnAContainer";
import { ViewType } from '../../../common/enum';
import { sortBy } from "@microsoft/sp-lodash-subset";
import { IQnAService } from '../../services';
import { IQnAListItem } from "../../models/IQnAListItem";
import { IQnAListTrackingItem } from "../../models/IQnAListTrackingItem"; 
import { INewQuestions } from "../../models/INewQuestions";
import { IQnAMakerItem } from "../../models/IQnAMakerItem";
import { Item } from "@pnp/sp";

export class QnAActionHandler {
    constructor(private container: QnAContainer, private service: IQnAService) {
        this.changeView = this.changeView.bind(this);
    }
    public async getQnAItems(divisionListName: string, url : string): Promise<any[]> { //accesstoken: string
       let items =  await this.service.getQnAItems(divisionListName, url);
       console.log(items);
    //    const x = JSON.parse(JSON.stringify(items));
    //     console.log(x);
       return items;
    }
    public async getMasterListItems(currentUser:any, url: string, listname: string): Promise<any[]> {
        let items =  await this.service.getMasterListItems(currentUser,url, listname);
        console.log(items);
        return items;
    }

    public changeView(view: ViewType): void {
        this.container.setState({ view });
    }

    public async getCurrentUser(): Promise<any> {
        let user =  await this.service.getCurrentUser();
       console.log(user, "current user");
       return user;
    }

    public async updateItemInQnAList(url: string,qnaListName:string, id:number, qnaListItems: IQnAListItem[]): Promise<any>{
        let items = await this.service.updateItemInQnAList(url,qnaListName,id,qnaListItems);
        return items;
    }
    public async addQuestionToQnAList(url: string, qnaListName:string, qnaListItem: INewQuestions): Promise<any>{
        let items = await this.service.addQuestionToQnAList(url, qnaListName, qnaListItem);
        return items; 
    }

    public async addtoQnaList(url: string, qnaListName:string, qnaListItem: IQnAListItem): Promise<any>{
        let items = await this.service.addToQnAList(url, qnaListName, qnaListItem);
        return items;
    }

    public async updateQnAListTracking(url: string, qnaListTrackingListName: string, qnaListTrackingItem: IQnAListTrackingItem): Promise<any> {
        let response =  await this.service.updateQnAListTracking(url, qnaListTrackingListName, qnaListTrackingItem);
        return response;
    }
    public async checkLockStatus(url: string, division: string, qnaListTrackingListName: string): Promise<any>{
        let res = await this.service.checkLockStatus(url,division,qnaListTrackingListName);
        return res;
    }

    public async getNewQuestions(endpoint: string): Promise<any>{//tenant: string, clientId: string, 
        let res = await this.service.getNewQuestions(endpoint);
        return res;
    }

    public async deleteFromNewQuestion(endpoint: string, item: INewQuestions): Promise<any>{ //tenant: string, clientId: string, 
        let res = await this.service.deleteFromNewQuestion(endpoint,item);
        return res;
    }

    public async updateQnAMakerKB(endpoint: string, kbid: string, item: IQnAMakerItem): Promise<any>{
        let res = await this.service.updateQnAMakerKB(endpoint,kbid, item );
        return res;
    }

    public async publishQnAMakerItem(endpoint: string, kbid: string, qnamakerItem: IQnAMakerItem ): Promise<any>{
        let res = await this.service.publishQnAMakerItem(endpoint, kbid, qnamakerItem);

    }

}
