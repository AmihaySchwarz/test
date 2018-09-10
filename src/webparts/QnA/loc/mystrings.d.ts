declare interface IQnAListWebPartStrings {
  PropertyPaneDescription: string;
  BasicGroupName: string;
  DescriptionFieldLabel: string;
  ApiServiceEndpointFieldLabel: string;
  TitleFieldLabel: string;
  NumberOfItemsFieldLabel: string;
  EndpointUrlFieldLabel: strings;
  RedirectUrlFieldLabel: string;
  TenantFieldLabel: string;
  ClientIdFieldLabel: string;
  NewQuestionsEndpointUrlFieldLabel: string;
  QnATrackingEndpointUrlFieldLabel: string;
  QnAEndpointUrlFieldLabel: string;
  MasterListEndpointUrlFieldLabel: string;
}

declare module 'QnAListWebPartStrings' {
  const strings: IQnAListWebPartStrings;
  export = strings;
}
