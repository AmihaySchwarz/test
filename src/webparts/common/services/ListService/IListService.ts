export interface IListService {
    getAllLists(webUrl: string): Promise<any[]>;
    getAllViews(webUrl: string, listTitle: string): Promise<any[]>;
}
