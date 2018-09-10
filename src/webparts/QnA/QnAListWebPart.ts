import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import {
  BaseClientSideWebPart,
  IPropertyPaneConfiguration,
  PropertyPaneTextField,
  PropertyPaneDropdown,
  PropertyPaneSlider
} from '@microsoft/sp-webpart-base';

import { Environment, EnvironmentType } from '@microsoft/sp-core-library';
import * as AuthenticationContext from 'adal-angular';
import * as strings from 'QnAListWebPartStrings';
import { MenuItemType, ViewType } from '../common/enum';
import { IQnAContainerProps } from './components/QnAContainer/IQnAContainerProps';
import { QnAContainer } from './components/QnAContainer/QnAContainer';
import { IQnAService, QnAService } from './services';
import * as MockQnAServiceImport from './services/MockQnAService';
let MockQnAService: typeof MockQnAServiceImport;
if (DEBUG) {
  MockQnAService = require('./services/MockQnAService');
}
export interface IQnAListWebPartProps {
  description: string;
  title: string;
    numberOfItems: number;
    clientId: string;
    tenant: string;
    redirectUrl: string;
    endpoints: {
      
      masterListEndpointUrl: string;
      newQuestionsEndpointUrl: string;
      qnATrackingEndpointUrl: string;
      qnAEndpointUrl: string;
    }
    
}

export default class QnAListWebPart extends BaseClientSideWebPart<IQnAListWebPartProps> {

  private service: IQnAService;
  private readonly userMenuItems = [
      { type: MenuItemType.ChangeView, text: "Add", view: ViewType.New },
      { type: MenuItemType.ChangeView, text: "Advance Add", view: ViewType.AdvanceAdd },
      { type: MenuItemType.ChangeView, text: "Edit", view: ViewType.Edit },
  ];

  protected onInit(): Promise<void> {
    console.log("here", Environment.type);
    if (Environment.type === EnvironmentType.Local) {
      console.log("environment is local");
      this.service = new MockQnAService.MockQnAService(null);
    } else {
      this.service = new QnAService(this.properties.endpoints, this.context);
    }
      return super.onInit();
  }

  public render(): void {
    const element: React.ReactElement<IQnAContainerProps > = React.createElement(
      QnAContainer,
      {
        description: this.properties.description,
        service: this.service
      }
    );

    ReactDom.render(element, this.domElement);
  }

  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: {
            description: strings.PropertyPaneDescription
          },
          groups: [
            {
              groupName: strings.BasicGroupName,
              groupFields: [
                PropertyPaneTextField('title', {
                  label: strings.TitleFieldLabel,
              }),
              PropertyPaneSlider('numberOfItems', {
                  label: strings.NumberOfItemsFieldLabel,
                  min: 1,
                  max: 10,
                  showValue: true,
                  step: 1
              }),
              PropertyPaneTextField('apiServiceEndpoint', {
                  label: strings.ApiServiceEndpointFieldLabel,
              }),
              PropertyPaneTextField('clientId', {
                label: strings.ClientIdFieldLabel,
            }),
            PropertyPaneTextField('tenant', {
                label: strings.TenantFieldLabel,
            }),
            PropertyPaneTextField('redirectUrl', {
                label: strings.RedirectUrlFieldLabel,
            }),
            PropertyPaneTextField('masterListEndpointUrl', {
                label: strings.MasterListEndpointUrlFieldLabel,
            }),
            PropertyPaneTextField('qnAEndpointUrl', {
              label: strings.QnAEndpointUrlFieldLabel,
            }),
            PropertyPaneTextField('qnATrackingEndpointUrl', {
              label: strings.QnATrackingEndpointUrlFieldLabel,
            }),
            PropertyPaneTextField('newQuestionsEndpointUrl', {
              label: strings.NewQuestionsEndpointUrlFieldLabel,
            }),
              ]
            }
          ]
        }
      ]
    };
  }

  protected onPropertyPaneFieldChanged(propertyPath: string, oldValue: any, newValue: any): void {
    this.service.updateWebpartProps(propertyPath, newValue);
}

  private getAuthContextOptions(): AuthenticationContext.Options {
    return this.needsConfiguration() ? {
        clientId: this.properties.clientId,
        redirectUri: this.properties.redirectUrl,
        tenant: this.properties.tenant,
        popUp: false,
        extraQueryParameter: `login_hint=${this.context.pageContext.legacyPageContext.userLoginName}`,
        cacheLocation: "localStorage",
        endpoints: { 
            masterListEndpointUrl: this.properties.endpoints.masterListEndpointUrl,
            newQuestionsEndpointUrl: this.properties.endpoints.newQuestionsEndpointUrl,
            qnAEndpointUrl: this.properties.endpoints.qnAEndpointUrl,
            qnATrackingEndpointUrl: this.properties.endpoints.qnATrackingEndpointUrl 
        },
        loadFrameTimeout: 30000
    } : null;
}

private needsConfiguration(): boolean {
    return (!!this.properties.title &&
        !!this.properties.clientId &&
        !!this.properties.tenant &&
        !!this.properties.redirectUrl &&
        !!this.properties.endpoints.masterListEndpointUrl &&
        !!this.properties.endpoints.newQuestionsEndpointUrl &&
        !!this.properties.endpoints.qnAEndpointUrl &&
        !!this.properties.endpoints.qnATrackingEndpointUrl);
}

}
