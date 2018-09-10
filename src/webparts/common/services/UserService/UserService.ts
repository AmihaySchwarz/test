import { WebPartContext } from '@microsoft/sp-webpart-base';
import { BaseService } from '../BaseService';
import { IUserService } from './IUserService';

export class UserService extends BaseService implements IUserService {

    constructor(webPartContext: WebPartContext) {
        super(webPartContext);
    }

    public getUserGroups(): Promise<any> {
        return this.getData(`${this.webPartContext.pageContext.site.absoluteUrl}/_api/web/currentUser/groups?$select=Id,Title`);
    }

    public getUserSettings(): Promise<any> {
        return new Promise<any>((resolve) => {
            setTimeout(() => resolve(
                ""
            ), 300);
        });
    }

    public setUserSettings(): void {
        return;
    }
}
