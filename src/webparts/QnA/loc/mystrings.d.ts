declare interface IQnAListWebPartStrings {
  PropertyPaneDescription: string;
  BasicGroupName: string;
  DescriptionFieldLabel: string;
  ApiServiceEndpointFieldLabel: string;
  TitleFieldLabel: string;
  NumberOfItemsFieldLabel: string;
  EndpointUrlFieldLabel: strings;
  RedirectUrlFieldLabel: string;
  WebUrlFieldLabel: string;
  ClientIdFieldLabel: string;
  NewQuestionsEndpointUrlFieldLabel: string;
  QnATrackingListNameFieldLabel: string;
  QnAEndpointUrlFieldLabel: string;
  MasterListNameFieldLabel: string;
}

declare module 'QnAListWebPartStrings' {
  const strings: IQnAListWebPartStrings;
  export = strings;
}
