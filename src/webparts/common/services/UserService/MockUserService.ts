import { BaseService } from '../BaseService';
import { IUserService } from './IUserService';

export class MockUserService extends BaseService implements IUserService {

    private readonly mockDataGroup = {
        value: [
            { Id: 13, Title: "News Editors" },
            { Id: 11, Title: "All Users" },
            { Id: 12, Title: "Visits Editors" },
        ]
    };

    private readonly mockDataSetting = {
        value: [
            { Id: 13, Title: "News Editors" },
            { Id: 11, Title: "All Users" },
            { Id: 12, Title: "Visits Editors" },
        ]
    };

    public getUserGroups(): Promise<any[]> {
        return new Promise<any[]>((resolve) => {
            setTimeout(() => resolve(
                this.mockDataGroup.value
            ), 300);
        });
    }

    public getUserSettings(): Promise<any> {
        return new Promise<any>((resolve) => {
            setTimeout(() => resolve(
                this.mockDataSetting.value
            ), 300);
        });
    }

    public setUserSettings(): void {
        return;
    }
}
