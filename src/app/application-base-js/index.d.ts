declare module 'ApplicationBase/interfaces' {
	import Portal = require('esri/portal/Portal');
	import PortalItem = require('esri/portal/PortalItem');
	import PortalQueryResult = require('esri/portal/PortalQueryResult');
	import PortalQueryParams = require('esri/portal/PortalQueryParams');

	import WebMap = require('esri/WebMap');
	import WebScene = require('esri/WebScene');

	export type Direction = "ltr" | "rtl";

	export interface ApplicationBaseItemPromises {
	  webMap?: Promise<any>;
	  webScene?: Promise<any>;
	  groupInfo?: Promise<any>;
	  groupItems?: Promise<any>;
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
	  }
	}

	export interface ApplicationBaseResult {
	  error?: Error;
	  value: any;
	  promise: Promise<any>;
	}

	export interface ApplicationBasePortalItemResult extends ApplicationBaseResult {
	  value: PortalItem;
	  promise: Promise<PortalItem>;
	}

	export interface ApplicationBasePortalQueryResult extends ApplicationBaseResult {
	  value: PortalQueryResult;
	  promise: Promise<PortalQueryResult>;
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


}
declare module 'ApplicationBase/ApplicationBase' {
	/// <reference types="arcgis-js-api" />
	import { ApplicationBaseConstructorOptions, ApplicationBaseResults, ApplicationBaseSettings, ApplicationConfig, Direction } from 'ApplicationBase/interfaces';
	import Portal from 'esri/portal/Portal';
	import PortalQueryParams from 'esri/portal/PortalQueryParams'; class ApplicationBase {
	    constructor(options: ApplicationBaseConstructorOptions);
	    settings: ApplicationBaseSettings;
	    config: ApplicationConfig;
	    results: ApplicationBaseResults;
	    portal: Portal;
	    direction: Direction;
	    locale: string;
	    isIE: boolean;
	    units: string;
	    queryGroupItems(groupId: string, itemParams: PortalQueryParams, portal?: Portal): Promise<__esri.PortalQueryResult>;
	    load(): Promise<ApplicationBase>;
	    private _mixinSettingsDefaults;
	    private _limitItemSize;
	    private _getPropertyArray;
	    private _getEsriEnvironmentPortalUrl;
	    private _getEsriEnvironmentProxyUrl;
	    private _getUnits;
	    private _detectIE;
	    private _queryGroupInfo;
	    private _loadItem;
	    private _overwriteItemsExtent;
	    private _overwriteItemExtent;
	    private _getDefaultId;
	    private _mixinAllConfigs;
	    private _setGeometryService;
	    private _setPortalUrl;
	    private _setProxyUrl;
	    private _registerOauthInfos;
	    private _getUrlParamValues;
	    private _urlToObject;
	    private _formatUrlParamValue;
	    private _stripStringTags;
	}
	export = ApplicationBase;

}
declare module 'ApplicationBase/support/domHelper' {
	export function setPageLocale(locale: string): void;
	export function setPageDirection(direction: string): void;
	export function setPageTitle(title: string): void;

}
declare module 'ApplicationBase/support/urlUtils' {
	/// <reference types="arcgis-js-api" />
	import Camera from 'esri/Camera';
	import Extent from 'esri/geometry/Extent';
	import Point from 'esri/geometry/Point';
	import esri = __esri;
	export function parseViewComponents(components: string): string[];
	export function parseViewpoint(viewpoint: string): Camera;
	export function parseCenter(center: string): Point;
	export function parseLevel(level: string): number;
	export function parseExtent(extent: string): Extent;
	export function parseMarker(marker: string): Promise<esri.Graphic | {}>;

}
declare module 'ApplicationBase/support/itemUtils' {
	/// <reference types="arcgis-js-api" />
	import PortalItem from 'esri/portal/PortalItem';
	import { CreateMapFromItemOptions, ApplicationConfig } from 'ApplicationBase/interfaces';
	import esri = __esri;
	export function getConfigViewProperties(config: ApplicationConfig): any;
	export function createView(properties: any): Promise<esri.MapView | esri.SceneView>;
	export function createMapFromItem(options: CreateMapFromItemOptions): Promise<esri.WebMap | esri.WebScene>;
	export function createWebMapFromItem(options: CreateMapFromItemOptions): Promise<esri.WebMap>;
	export function createWebSceneFromItem(options: CreateMapFromItemOptions): Promise<esri.WebScene>;
	export function getItemTitle(item: PortalItem): string;
	export function goToMarker(marker: string, view: esri.MapView | esri.SceneView): Promise<any>;
	export function findQuery(query: string, view: esri.MapView | esri.SceneView): Promise<any>;

}
