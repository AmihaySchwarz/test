import { QnAContainer } from "./QnAContainer";
import { ViewType } from '../../../common/enum';
import { sortBy } from "@microsoft/sp-lodash-subset";
import { IQnAService } from '../../services';

export class QnAActionHandler {
    constructor(private container: QnAContainer, private service: IQnAService) {
        this.changeView = this.changeView.bind(this);
    }
    public async getQnAItems(divisionListName: string, url : string): Promise<any[]> { //accesstoken: string
       let items =  await this.service.getQnAItems(divisionListName, url);
       console.log(items);
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

}
