import { WebPartContext } from '@microsoft/sp-webpart-base';
import { BaseService } from '../BaseService';
import { IListService } from './IListService';

export class ListService extends BaseService implements IListService {

    constructor(webPartContext: WebPartContext) {
        super(webPartContext);
    }

    public getAllLists(webUrl: string): Promise<any[]> {
        if (!!webUrl) {
            return this.getData(`${webUrl}/_api/web/lists?$select=Id,Title&$orderby=Title&$filter=Hidden eq false and BaseType eq 0 and BaseTemplate eq 100`);
        }
        return new Promise<any[]>((resolve) => resolve([]));
    }

    public getAllViews(webUrl: string, listTitle: string): Promise<any[]> {
        if (!!webUrl && !!listTitle) {
            return this.getData(`${webUrl}/_api/web/lists/getbytitle('${listTitle}')/views?$select=Id,Title&$orderby=Title`);
        }
        return new Promise<any[]>((resolve) => resolve([]));
    }
}
