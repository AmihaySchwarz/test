import { QnAContainer } from "./QnAContainer";
import { ViewType } from '../../../common/enum';
import { sortBy } from "@microsoft/sp-lodash-subset";
import { IQnAService } from '../../services';

export class QnAActionHandler {
    constructor(private container: QnAContainer, private service: IQnAService) {
        this.changeView = this.changeView.bind(this);
    }
    public async getQnAItems(masterItems: any[], url : string): Promise<any[]> { //accesstoken: string
       let items =  await this.service.getQnAItems(masterItems, url);
       console.log(items[0]);
       return items[0];
    }
    public async getMasterListItems(currentUser:string, url : string, listname: string): Promise<any[]> {
        let items =  await this.service.getMasterListItems(currentUser,url, listname);
        console.log(items);
        return items;
    }

    public changeView(view: ViewType): void {
        this.container.setState({ view });
    }
}
