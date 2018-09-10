export interface IUserService {
    getUserGroups(): Promise<any[]>;
    getUserSettings(): Promise<any>;
    setUserSettings(): void;
}
