import { BaseService } from '../BaseService';
import { IListService } from './IListService';

export class MockListService extends BaseService implements IListService {

    private readonly mockDataList = {
        value: [
            {
                Id: "59422de3-b8a6-4ad8-a0d5-954929c5a7b2",
                Title: "List 1"
            },
            {
                Id: "8fed858b-308d-4257-a673-063752283cdc",
                Title: "List 2"
            },
            {
                Id: "9ac59375-ba04-467c-9ecb-c9afd53dafed",
                Title: "List 3"
            }
        ]
    };

    private readonly mockDataView = [
        {
            listTitle: "List 1",
            value: [
                {
                    Id: "df5673ec-7cd0-4b3a-affe-e4d399b53ede",
                    Title: "View 1A"
                },
                {
                    Id: "df5673ec-7cd0-4b3a-affe-e4d399b53ede",
                    Title: "View 1B"
                },
                {
                    Id: "df5673ec-7cd0-4b3a-affe-e4d399b53ede",
                    Title: "View 1C"
                }
            ]
        },
        {
            listTitle: "List 2",
            value: [
                {
                    Id: "df5673ec-7cd0-4b3a-affe-e4d399b53ede",
                    Title: "View 2A"
                },
                {
                    Id: "df5673ec-7cd0-4b3a-affe-e4d399b53ede",
                    Title: "View 2B"
                },
                {
                    Id: "df5673ec-7cd0-4b3a-affe-e4d399b53ede",
                    Title: "View 2C"
                }
            ]
        },
        {
            listTitle: "List 3",
            value: [
                {
                    Id: "df5673ec-7cd0-4b3a-affe-e4d399b53ede",
                    Title: "View 3A"
                },
                {
                    Id: "df5673ec-7cd0-4b3a-affe-e4d399b53ede",
                    Title: "View 3B"
                },
                {
                    Id: "df5673ec-7cd0-4b3a-affe-e4d399b53ede",
                    Title: "View 3C"
                }
            ]
        }
    ];

    public getAllLists(webUrl: string): Promise<any[]> {
        if (!!webUrl) {
            return new Promise<any[]>((resolve) => {
                setTimeout(() => resolve(
                    this.mockDataList.value
                ), 300);
            });
        }
        return new Promise<any[]>((resolve) => resolve([]));
    }

    public getAllViews(webUrl: string, listTitle: string): Promise<any[]> {
        if (!!webUrl && !!listTitle) {
            return new Promise<any[]>((resolve) => {
                setTimeout(() => resolve(
                    this.mockDataView.filter((item) => item.listTitle === listTitle)[0].value
                ), 300);
            });
        }
        return new Promise<any[]>((resolve) => resolve([]));
    }
}
