import { QnAContainer } from "./QnAContainer";
import { ViewType } from '../../../common/enum';
import { IQnAService } from '../../services';
import { IQnAListItem } from "../../models/IQnAListItem";
import { IQnAListTrackingItem } from "../../models/IQnAListTrackingItem"; 
import { INewQuestions } from "../../models/INewQuestions";


export class QnAActionHandler {
    constructor(private container: QnAContainer, private service: IQnAService) {
        this.changeView = this.changeView.bind(this);
    }
    public async getQnAItems(divisionListName: string, url : string): Promise<any[]> { //accesstoken: string
       let items =  await this.service.getQnAItems(divisionListName, url);
       return items;
    }
    public async getMasterListItems(currentUser:any, url: string, listname: string): Promise<any[]> {
        let items =  await this.service.getMasterListItems(currentUser,url, listname);
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

    public async updateQnAIDinSPlist (qnaListName: string, qnaListItem: IQnAListItem, qnaid: string): Promise<any>{
        let items = await this.service.updateQnAIDinSPlist(qnaListName,qnaListItem, qnaid);
        return items;
    }

    public async updateItemInQnAList(qnaListName:string, qnaListItems: IQnAListItem[]): Promise<any>{
        let items = await this.service.updateItemInQnAList(qnaListName,qnaListItems);
        return items;
    }
    public async addQuestionToQnAList(url: string, qnaListName:string, qnaListItem: INewQuestions): Promise<any>{
        let items = await this.service.addQuestionToQnAList(url, qnaListName, qnaListItem);
        return items; 
    }

    public async addtoQnaList(qnaListName:string, qnaListItem: IQnAListItem): Promise<any>{
        let items = await this.service.addToQnAList(qnaListName, qnaListItem);
        return items;
    }

    public async deleteFromQnAList(qnaListName:string, qnaListItems: IQnAListItem[]): Promise<any>{
        let res = await this.service.deleteFromQnAList(qnaListName, qnaListItems);
        return res;
    }

    public async updateQnAListTracking(qnaListTrackingListName: string, division: string, action: string): Promise<any> {
        let response =  await this.service.updateQnAListTracking(qnaListTrackingListName, division, action);
        return response;
    }
    public async checkLockStatus(currentUser: any, division: string, qnaListTrackingListName: string): Promise<any>{
        let res = await this.service.checkLockStatus(currentUser, division,qnaListTrackingListName);
        return res;
    }

    public async createLockItem (currentUser: any, division: string, qnaListTrackingListName: string): Promise<any> {
        let res = await this.service.createLockItem(currentUser, division, qnaListTrackingListName);
        return res;
    }

    public async lockList (currentUser: any, division: string, qnaListTrackingListName: string): Promise<any> {
        
        let response = await this.service.lockList(currentUser, division, qnaListTrackingListName);
        return response;
    }

    public async getNewQuestions(endpoint: string, division: string): Promise<any>{//tenant: string, clientId: string, 
        let res = await this.service.getNewQuestions(endpoint, division);
        return res;
    }

    public async deleteFromNewQuestion(endpoint: string, item: INewQuestions): Promise<any>{ //tenant: string, clientId: string, 
        let res = await this.service.deleteFromNewQuestion(endpoint,item);
        return res;
    }

    public async resolveQuestion(endpoint: string, item: INewQuestions): Promise<any>{
        let res = await this.service.resolveQuestion(endpoint,item);
        return res;
    }

    public async updateQnAMakerKB(endpoint: string, kbid: string, item: string): Promise<any>{
        let res = await this.service.updateQnAMakerKB(endpoint,kbid, item );
        return res;
    }

    public async publishQnAMakerItem(endpoint: string, kbid: string): Promise<any>{
        let res = await this.service.publishQnAMakerItem(endpoint, kbid);
        return res;
    }

    public async getQnAMakerItems(endpoint: string, kbid: string, env: string): Promise<any>{
        let res = await this.service.getQnAMakerItems(endpoint,kbid, env);
        return res;
    }

}
