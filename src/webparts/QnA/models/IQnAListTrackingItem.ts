
import { IPerson } from './IPerson';

export interface IQnAListTrackingItem {
    Id: number;
    Division: string;
    LastUpdated: Date;
    LastPublished: Date;
    LockedBy: IPerson;
    LockedReleaseTime: Date;
}

