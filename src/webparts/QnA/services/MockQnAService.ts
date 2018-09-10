
import { BaseService } from '../../common/services/BaseService';
import { IQnAService } from './IQnAService';

export class MockQnAService extends BaseService {

    private readonly mockQnAData = [
        {
            Items: [
                {
                    Id: "1",
                    Question: "Question Number 1",
                    Answer: "Answer 1",
                    Classification: "Class 1"
                },
                {
                    Id: "2",
                    Question: "Question Number 2",
                    Answer: "Answer 2",
                    Classification: "Class 2"
                },
                { 
                    Id: "3",
                    Question: "Question Number 3",
                    Answer: "Answer 3",
                    Classification: "Class 3"
                }
            ]
        }

    ];

    public getQnAItems(): Promise<any[]> {
        return new Promise<any[]>((resolve) => {
            setTimeout(() => resolve(this.mockQnAData), 300);
        });
    }

    public updateWebpartProps(propertyPath: string, newValue: any): void {
    
    }
}
