import "@pnp/polyfill-ie11";
//require('core-js');
import 'es6-promise';
//import "es6-promise/auto"; 
//import "babel-polyfill";
import 'core-js/es6/array';
import 'core-js/es6/number';
//import 'es6-map/implement';
//require('es6-promise/auto');
import 'whatwg-fetch';
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
import { ViewType } from '../common/enum';
import { IQnAContainerProps } from './components/QnAContainer/IQnAContainerProps';
import { QnAContainer } from './components/QnAContainer/QnAContainer';
import { IQnAService, QnAService } from './services';
import * as MockQnAServiceImport from './services/MockQnAService';
import { sp } from '@pnp/sp';
import { taxonomy } from "@pnp/sp-taxonomy";

let MockQnAService: typeof MockQnAServiceImport;
if (DEBUG) {
  MockQnAService = require('./services/MockQnAService');
}
export interface IQnAListWebPartProps {
  description: string;
  title: string;
  numberOfItems: number;
  clientId: string;
  redirectUrl: string;
  masterListName: string;
  endpointUrl: string;
  qnATrackingListName: string;
  qnAEndpointUrl: string;
  webUrl: string;
  tenant: string;
  QnAMakerKnowledgeBaseId: string;
  lockTiming: number;
}

export default class QnAListWebPart extends BaseClientSideWebPart<IQnAListWebPartProps> {

  private service: IQnAService;


  protected onInit(): Promise<void> {
    console.log("here", Environment.type);
    //if (Environment.type === EnvironmentType.Local) {
    //  console.log("environment is local");
    //  this.service = new MockQnAService.MockQnAService(null);
    //} else {
      this.service = new QnAService(this.context);
    //}
      return super.onInit().then(_ => {
        sp.setup({
          spfxContext: this.context,
          sp: {
            headers: {
              Accept: 'application/json; odata=verbose' //; odata=verbose
            }
          }
        });
        taxonomy.setup({
          spfxContext: this.context
        });
      });
  }

  public render(): void {
    const element: React.ReactElement<IQnAContainerProps > = React.createElement(
      QnAContainer,
      {
        service: this.service,
        //tenant: this.properties.tenant,
        //clientId: this.properties.clientId,
        //endpoints: [{
          masterListName: this.properties.masterListName,
          endpointUrl: this.properties.endpointUrl,
          qnATrackingListName: this.properties.qnATrackingListName, 
          webUrl: this.properties.webUrl,
          qnAMakerKnowledgeBaseId: this.properties.QnAMakerKnowledgeBaseId,
          isConfigured: this.needsConfiguration(),
          lockTiming: this.properties.lockTiming
          //edirectUrl: this.properties.redirectUrl
        //}],
        //authContextOptions: this.getAuthContextOptions(),

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
                // PropertyPaneTextField('title', {
                //   label: strings.TitleFieldLabel,
                // }),
              // PropertyPaneTextField('apiServiceEndpoint', {
              //     label: strings.ApiServiceEndpointFieldLabel,
              // }),
          //    PropertyPaneTextField('clientId', {
          //      label: strings.ClientIdFieldLabel,
          //   }),
            // PropertyPaneTextField('webUrl', {
            //     label: strings.WebUrlFieldLabel,
            // }),
          //   PropertyPaneTextField('tenant', {
          //     label: strings.TenantFieldLabel,
          // }),
            // PropertyPaneTextField('redirectUrl', {
            //    label: strings.RedirectUrlFieldLabel,
            // }),
            PropertyPaneTextField('masterListName', {
                label: strings.MasterListNameFieldLabel,
            }),
            // PropertyPaneTextField('sharepointEndpointUrl', {
            //   label: strings.QnAEndpointUrlFieldLabel,
            // }),
            PropertyPaneTextField('qnATrackingListName', {
              label: strings.QnATrackingListNameFieldLabel,
            }),
            PropertyPaneTextField('endpointUrl', {
              label: strings.EndpointUrlFieldLabel,
              
            }),
            PropertyPaneTextField('QnAMakerKnowledgeBaseId', {
              label: strings.QnAMakerKnowledgeBaseIdFieldLabel,
              
            }),
            PropertyPaneTextField('lockTiming', {
              label: strings.LockTimingFieldLabel,
              
            }),
              ]
            }
          ]
        }
      ]
    };
  }  
  
  private getAuthContextOptions(): AuthenticationContext.Options {
    return this.needsConfiguration() ? {
        clientId: this.properties.clientId,
        redirectUri: this.properties.redirectUrl,
        tenant: this.properties.tenant,
        popUp: false,
        extraQueryParameter: `login_hint=${this.context.pageContext.legacyPageContext.userLoginName}`,
        cacheLocation: "localStorage",
        endpoints: { endpoint: this.properties.endpointUrl },
        loadFrameTimeout: 30000
    } : null;
  }

  private needsConfiguration(): boolean {
    console.log("needsconfig");
    let config =  !!this.properties.qnATrackingListName &&
        //!!this.properties.webUrl &&
        !!this.properties.masterListName &&
        !!this.properties.QnAMakerKnowledgeBaseId &&
        !!this.properties.endpointUrl;
    // let config = false;
         return config;

  }

//  protected onPropertyPaneFieldChanged(propertyPath: string, oldValue: any, newValue: any): void {
//     this.service.updateWebpartProps(propertyPath, newValue);
// }

//   private getAuthContextOptions(): AuthenticationContext.Options {
//     return this.needsConfiguration() ? {
//         clientId: this.properties.clientId,
//         redirectUri: this.properties.redirectUrl,
//         tenant: this.properties.tenantQnAUrl,
//         popUp: false,
//         extraQueryParameter: `login_hint=${this.context.pageContext.legacyPageContext.userLoginName}`,
//         cacheLocation: "localStorage",
//         endpoints: { 
//             masterListEndpointUrl: this.properties.masterListName,
//             newQuestionsEndpointUrl: this.properties.newQuestionsEndpointUrl,
//             qnAEndpointUrl: this.properties.qnAEndpointUrl,
//             qnATrackingEndpointUrl: this.properties.qnATrackingListName 
//         },
//         loadFrameTimeout: 30000
//     } : null;
// }



}
