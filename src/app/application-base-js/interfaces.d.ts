/*
  Copyright 2019 Esri
  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at
    http://www.apache.org/licenses/LICENSE-2.0
  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.​
*/

import Portal = require("esri/portal/Portal");
import PortalItem = require("esri/portal/PortalItem");
import PortalQueryResult = require("esri/portal/PortalQueryResult");
import PortalQueryParams = require("esri/portal/PortalQueryParams");

import WebMap = require("esri/WebMap");
import WebScene = require("esri/WebScene");

export type Direction = "ltr" | "rtl";

export interface ApplicationBaseItemPromises {
  webMap?: IPromise<any>;
  webScene?: IPromise<any>;
  groupInfo?: IPromise<any>;
  groupItems?: IPromise<any>;
}

export interface ApplicationConfigs {
  application?: ApplicationConfig;
  config: ApplicationConfig;
  local?: ApplicationConfig;
  url?: ApplicationConfig;
}

export interface ApplicationConfig {
  appid?: string;
  center?: string;
  components?: string;
  embed?: boolean;
  extent?: string;
  find?: string;
  group?: string | string[];
  helperServices?: any;
  level?: string;
  marker?: string;
  oauthappid?: string;
  portalUrl?: string;
  proxyUrl?: string;
  title?: string;
  viewpoint?: string;
  webmap?: string | string[];
  webscene?: string | string[];
  [propName: string]: any;
}

export interface ApplicationBaseSettings {
  environment: {
    isEsri?: boolean;
    webTierSecurity?: boolean;
  };
  localStorage?: {
    fetch?: boolean;
  };
  group?: {
    default?: string;
    itemParams?: PortalQueryParams;
    fetchItems?: boolean;
    fetchInfo?: boolean;
    fetchMultiple?: boolean;
  };
  portal?: {
    fetch?: boolean;
  };
  rightToLeftLocales?: string[];
  urlParams?: string[];
  webMap?: {
    default?: string;
    fetch?: boolean;
    fetchMultiple?: boolean;
  };
  webScene?: {
    default?: string;
    fetch?: boolean;
    fetchMultiple?: boolean;
  };
}

export interface ApplicationBaseResult {
  error?: Error;
  value: any;
  promise: IPromise<any>;
}

export interface ApplicationBasePortalItemResult extends ApplicationBaseResult {
  value: PortalItem;
  promise: IPromise<PortalItem>;
}

export interface ApplicationBasePortalQueryResult
  extends ApplicationBaseResult {
  value: PortalQueryResult;
  promise: IPromise<PortalQueryResult>;
}

export interface ApplicationBaseResults {
  applicationItem?: ApplicationBasePortalItemResult;
  applicationData?: ApplicationBaseResult;
  groupInfos?: ApplicationBasePortalQueryResult;
  groupItems?: ApplicationBasePortalQueryResult;
  localStorage?: ApplicationConfig;
  portal?: Portal;
  urlParams?: ApplicationConfig;
  webMapItems?: ApplicationBasePortalItemResult[];
  webSceneItems?: ApplicationBasePortalItemResult[];
}

export interface ApplicationProxy {
  sourceUrl: string;
  proxyUrl: string;
  proxyId: string;
}

export interface ApplicationBaseConstructorOptions {
  config: ApplicationConfig | string;
  settings: ApplicationBaseSettings | string;
}

export interface CreateMapFromItemOptions {
  item: PortalItem;
  appProxies?: ApplicationProxy[];
}
