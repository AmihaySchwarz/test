
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
                    Editors: ["admin-ptangalin@cupdev.onmicrosoft.com", "page@gamil.com"  ]
                },
                {
                    Id: "2",
                    Division: "Registrars Office",
                    QnAListName: "RegistrarsQnA",
                    Editors: ["admin-ptangalin@cupdev.onmicrosoft.com", "page@gamil.com"  ]
                }, {
                    Id: "3",
                    Division: "Finance",
                    QnAListName: "FinanceQnA",
                    Editors: [ "page@gamil.com"  ]
                }, {
                    Id: "4",
                    Division: "CIT",
                    QnAListName: "CITQnA",
                    Editors: ["page@gamil.com"  ]
                },
            ]
        }
    ];

    private mockNewQuestionsData = [
        {
            Items: [
                {
                    Id: "1",
                    Question: "Question Number 1",
                    PostedDate: "09-08-2018",
                    PostedBy: "Page Tangalin"
                },    
                {
                    Id: "2",
                    Question: "Question Number 2",
                    PostedDate: "09-08-2018",
                    PostedBy: "Page"
                },
                {
                    Id: "3",
                    Question: "Question Number 3",
                    PostedDate: "09-08-2018",
                    PostedBy: "PT"
                },
                {
                    Id: "4",
                    Question: "Question Number 4",
                    PostedDate: "09-08-2018",
                    PostedBy: "Page T"
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
    
    public getMasterListItems(currentUser: string, url : string, masterListName: string): Promise<any[]> {
        const masterItems = this.masterListData[0].Items;
        console.log(masterItems, "mast items", currentUser)
        return new Promise<any[]>((resolve) => {
        //     setTimeout(() => masterItems.forEach((data) => {data.Editors.filter((item) => {
        //        if(item.toString() == currentUser.toString()){
        //            console.log(data);
        //            return data;
        //        }
        //     })
        //  }) ,300 )
           setTimeout(() => resolve(this.masterListData[0].Items) ,300 )
        });
    }

    public getNewQuestions(): Promise<any[]> {
        //get 
        return new Promise<any[]>((resolve) => {
            setTimeout(() => resolve(this.mockNewQuestionsData) ,300 )
        });
    }

    public getQnAItems(masterItems: any[], url : string): Promise<any[]> {
        console.log(masterItems);
        return new Promise<any[]>((resolve) => {
            if(masterItems[0].division === Division.Admission ) {
                setTimeout(() => resolve(this.mockAdmissionQnAData), 300);
            } else if (masterItems[0].division === Division.CIT) {
                setTimeout(() => resolve(this.mockCITQnAData), 300);
            } else if (masterItems[0].division === Division.Finance) {
                setTimeout(() => resolve(this.mockFinanceQnAData), 300);
            }else if (masterItems[0].division === Division.Registrars) {
                setTimeout(() => resolve(this.mockRegistrarsQnAData), 300);
            }
        });
    }

  
}
