import { QnAContainer } from "./QnAContainer";
import { ViewType } from '../../../common/enum';
import { sortBy } from "@microsoft/sp-lodash-subset";
import { IQnAService } from '../../services';

export class QnAActionHandler {
    constructor(private container: QnAContainer, private service: IQnAService) {
        this.changeView = this.changeView.bind(this);
    }
    public async getQnAItems(): Promise<any[]> { //accesstoken: string
       let items =  await this.service.getQnAItems();
       console.log(items[0]);
       return items[0];
    }
    public changeView(view: ViewType): void {
        this.container.setState({ view });
    }
}
