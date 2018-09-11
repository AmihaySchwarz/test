
import { BaseService } from '../../common/services/BaseService';
import { IQnAService } from './IQnAService';
import { Division } from '../../common/enum/Division';

export class MockQnAService extends BaseService {

    private readonly masterListData = [
        {
            Items: [
                {
                    Id: "1",
                    Division: "Admission",
                    QnAListName: "AdmissionQnA",
                    Editors: "pageflourin@gmail.com" 
                },
                {
                    Id: "1",
                    Division: "Registrars Office",
                    QnAListName: "RegistrarsQnA",
                    Editors: "pageflourin@gmail.com" 
                }, {
                    Id: "1",
                    Division: "Finance",
                    QnAListName: "FinanceQnA",
                    Editors: "pageflourin@gmail.com" 
                }, {
                    Id: "1",
                    Division: "CIT",
                    QnAListName: "CITQnA",
                    Editors: "pageflourin@gmail.com" 
                },
            ]
        }

    ];

    private readonly mockAdmissionQnAData = [
        {
            Items: [
                {
                    Id: "1",
                    Question: "Question Number 1",
                    Answer: "Answer 1",
                    Classification: "Class 1",
                    QnAId: "qna1"
                },
                {
                    Id: "2",
                    Question: "Question Number 2",
                    Answer: "Answer 2",
                    Classification: "Class 2",
                    QnAId: "qna2"
                },
                { 
                    Id: "3",
                    Question: "Question Number 3",
                    Answer: "Answer 3",
                    Classification: "Class 3",
                    QnAId: "qna3"
                }
            ]
        }
    ];
    private readonly mockFinanceQnAData = [
        {
            Items: [
                {
                    Id: "1",
                    Question: "Question Number 1",
                    Answer: "Answer 1",
                    Classification: "Class 1",
                    QnAId: "fqna1"
                },
                {
                    Id: "2",
                    Question: "Question Number 2",
                    Answer: "Answer 2",
                    Classification: "Class 2",
                    QnAId: "fqna2"
                },
                { 
                    Id: "3",
                    Question: "Question Number 3",
                    Answer: "Answer 3",
                    Classification: "Class 3",
                    QnAId: "fqna3"
                }
            ]
        }
    ];
    private readonly mockRegistrarsQnAData = [
        {
            Items: [
                {
                    Id: "1",
                    Question: "Question Number 1",
                    Answer: "Answer 1",
                    Classification: "Class 1",
                    QnAId: "rqna1"
                },
                {
                    Id: "2",
                    Question: "Question Number 2",
                    Answer: "Answer 2",
                    Classification: "Class 2",
                    QnAId: "rqna2"
                },
                { 
                    Id: "3",
                    Question: "Question Number 3",
                    Answer: "Answer 3",
                    Classification: "Class 3",
                    QnAId: "rqna3"
                }
            ]
        }
    ];
    private readonly mockCITQnAData = [
        {
            Items: [
                {
                    Id: "1",
                    Question: "Question Number 1",
                    Answer: "Answer 1",
                    Classification: "Class 1",
                    QnAId: "cqna1"
                },
                {
                    Id: "2",
                    Question: "Question Number 2",
                    Answer: "Answer 2",
                    Classification: "Class 2",
                    QnAId: "cqna2"
                },
                { 
                    Id: "3",
                    Question: "Question Number 3",
                    Answer: "Answer 3",
                    Classification: "Class 3",
                    QnAId: "cqna3"
                }
            ]
        }
    ];
    
    public getMasterListItems(): Promise<any[]> {
        return new Promise<any[]>((resolve) => {
            setTimeout(() => resolve(this.masterListData), 300);
        });
    }


    public getQnAItems(division: string): Promise<any[]> {
        return new Promise<any[]>((resolve) => {
            if(division === Division.Admission ) {
                setTimeout(() => resolve(this.mockAdmissionQnAData), 300);
            } else if (division === Division.CIT) {
                setTimeout(() => resolve(this.mockCITQnAData), 300);
            } else if (division === Division.Finance) {
                setTimeout(() => resolve(this.mockFinanceQnAData), 300);
            }else if (division === Division.Registrars) {
                setTimeout(() => resolve(this.mockRegistrarsQnAData), 300);
            }
           
        });
    }

    public updateWebpartProps(propertyPath: string, newValue: any): void {
    
    }
}
