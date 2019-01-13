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
  EndpointUrlFieldLabel: string;
  QnATrackingListNameFieldLabel: string;
  QnAEndpointUrlFieldLabel: string;
  MasterListNameFieldLabel: string;
  TenantFieldLabel: string;
  QnAMakerKnowledgeBaseIdFieldLabel: string;
  LockTimingFieldLabel: string;
}

declare module 'QnAListWebPartStrings' {
  const strings: IQnAListWebPartStrings;
  export = strings;
}
