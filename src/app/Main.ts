// Copyright 2019 Esri
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//   http://www.apache.org/licenses/LICENSE-2.0
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.​

import ApplicationBase = require("ApplicationBase/ApplicationBase");

import ConfigurationSettings = require("./ConfigurationSettings/ConfigurationSettings");

const CSS = {
  loading: "configurable-application--loading"
};

import {
  createMapFromItem,
  createView,
  getConfigViewProperties,
  getItemTitle,
  findQuery,
  goToMarker
} from "ApplicationBase/support/itemUtils";

import {
  setPageLocale,
  setPageDirection,
  setPageTitle
} from "ApplicationBase/support/domHelper";

// i18n
import i18n from "dojo/i18n!./nls/common";

// esri.core
import Handles = require("esri/core/Handles");
import Collection = require("esri/core/Collection");
import { init, when, watch } from "esri/core/watchUtils";

// Components
import LayerSwitcher = require("./Components/LayerSwitcher");
import PhotoCentric = require("./Components/PhotoCentric");
import MapCentric = require("./Components/MapCentric");
import MapCentricViewModel = require("./Components/MapCentric/MapCentricViewModel");
import MobileExpand = require("./Components/MobileExpand");
import OnboardingContent = require("./Components/OnboardingContent");

import { ApplicationConfig } from "ApplicationBase/interfaces";

import {
  toggleAppMode,
  addHome,
  addZoom,
  addLegend,
  addSearch,
  addLayerList,
  addFullScreen,
  addSketch
} from "./utils/widgetUtils";
import { esriWidgetProps } from "./interfaces/interfaces";

class AttachmentViewerApp {
  private _configurationSettings: ConfigurationSettings = null;
  appProps = null;
  currentApp: PhotoCentric | MapCentric = null;
  base: ApplicationBase = null;
  graphicsLayer: __esri.GraphicsLayer = null;
  handles: Handles = new Handles();
  sketchHandles: Handles = new Handles();
  layerList: __esri.LayerList = null;
  layerSwitcher: LayerSwitcher = null;
  onboardingContent: OnboardingContent = null;
  searchWidget: __esri.Search = null;
  sketchWidget: __esri.Sketch = null;
  view: __esri.MapView = null;
  item: __esri.PortalItem;

  public init(base: ApplicationBase): void {
    if (!base) {
      console.error("ApplicationBase is not defined");
      return;
    }

    setPageLocale(base.locale);
    setPageDirection(base.direction);

    this.base = base;
    this._createApp();
    document.body.classList.remove(CSS.loading);
  }

  private _createApp(): void {
    const { config, results } = this.base;

    const {
      find,
      photoCentricMobileMapExpanded,
      mapToolsExpanded,
      marker,
      share
    } = config;

    this._configurationSettings = new ConfigurationSettings(config);

    const { webMapItems } = results;

    this.item = null;

    webMapItems.forEach(response => {
      if (response?.value?.id === this._configurationSettings?.webmap) {
        this.item = response.value;
      } else if (this._configurationSettings?.webmap === "default") {
        this.item = response.value;
      }
    });

    if (this.item) {
      const title =
        this._configurationSettings.title &&
        this._configurationSettings.title !== ""
          ? this._configurationSettings.title
          : getItemTitle(this.item);
      this.handles.add(
        init(this._configurationSettings, "title", setPageTitle),
        "configuration"
      );
      this._configurationSettings.title = title;
    }

    if (!this.item) {
      const error = "Could not load an item to display";
      document.body.classList.remove("configurable-application--loading");
      document.body.classList.add("app-error");
      document.getElementById("app-container").innerHTML = `<h1>${error}</h1>`;
      console.error(error);
      return;
    }

    const portalItem: __esri.PortalItem = this.base.results.applicationItem
      .value;
    const appProxies =
      portalItem && portalItem.applicationProxies
        ? portalItem.applicationProxies
        : null;

    const defaultViewProperties = getConfigViewProperties(config);

    const viewNode = document.createElement("div");

    const container = {
      container: viewNode
    };

    const viewProperties = {
      ...defaultViewProperties,
      ...container
    };

    createMapFromItem({ item: this.item, appProxies }).then(map =>
      createView({
        ...viewProperties,
        map
      }).then((view: __esri.MapView) =>
        findQuery(find, view).then(async () => {
          this.view = view;

          const selectedLayerId = this._getURLParameter("selectedLayerId");
          if (!this._configurationSettings.withinConfigurationExperience) {
            if (selectedLayerId) {
              const layer = view.map.allLayers.find(layer => {
                return layer.id === selectedLayerId;
              }) as __esri.Layer;

              if (!layer || (layer && !layer.visible)) {
                const url = new URL(window.location.href);
                const params = new URLSearchParams(url.search);
                params.delete("center");
                params.delete("level");
                params.delete("attachmentIndex");
                params.delete("selectedLayerId");
                params.delete("defaultObjectId");
                const appid = params.get("appid");
                window.history.replaceState(
                  null,
                  "",
                  `${location.pathname}?appid=${appid}`
                );
                location.reload();
                return;
              }
            }
          }

          const docDirection = this.base.direction;

          this.view.ui.remove("zoom");

          const defaultObjectIdParam = parseInt(
            this._getURLParameter("defaultObjectId")
          );

          const defaultObjectId = share
            ? isNaN(defaultObjectIdParam)
              ? null
              : defaultObjectIdParam
            : null;
          const featureAttachmentIndexParam = parseInt(
            this._getURLParameter("attachmentIndex")
          );

          const attachmentIndex = share
            ? isNaN(featureAttachmentIndexParam)
              ? null
              : featureAttachmentIndexParam
            : null;

          const container = document.createElement("div");

          this.onboardingContent = new OnboardingContent({
            container,
            config: this._configurationSettings,
            appMode: this._configurationSettings.appLayout,
            withinConfigurationExperience: this._configurationSettings
              .withinConfigurationExperience
          });

          const sharedTheme = this._createSharedTheme();

          this.appProps = {
            addressEnabled: this._configurationSettings.address,
            appMode: this._configurationSettings.appLayout,
            downloadEnabled: this._configurationSettings.download,
            imagePanZoomEnabled: this._configurationSettings.imagePanZoom,
            selectFeaturesEnabled: this._configurationSettings.selectFeatures,
            onboardingIsEnabled: this._configurationSettings.onboarding,
            socialSharingEnabled: this._configurationSettings.share,
            customOnboardingContentEnabled: this._configurationSettings
              .customOnboarding,
            customOnboardingHTML: this._configurationSettings
              .customOnboardingHTML,
            imageDirectionEnabled: this._configurationSettings.imageDirection,
            graphicsLayer: this.graphicsLayer,
            headerBackground: this._configurationSettings.headerBackground,
            headerColor: this._configurationSettings.headerColor,
            showOnboardingOnStart: this._configurationSettings
              .showOnboardingOnStart,
            onlyDisplayFeaturesWithAttachmentsIsEnabled: this
              ._configurationSettings.onlyDisplayFeaturesWithAttachments,
            applySharedTheme: this._configurationSettings.applySharedTheme,
            sharedTheme,
            attachmentLayers: this._configurationSettings.attachmentLayers,
            attachmentIndex,
            container: document.getElementById("app-container"),
            defaultObjectId,
            docDirection,
            layerSwitcher: this.layerSwitcher,
            mapCentricTooltipEnabled: this._configurationSettings
              .mapCentricTooltip,
            onboardingButtonText: this._configurationSettings
              .onboardingButtonText,
            onboardingContent: this.onboardingContent,
            onboarding: this._configurationSettings.onboarding,
            order: this._configurationSettings.order,
            searchWidget: this.searchWidget,
            sketchWidget: this.sketchWidget,
            selectedLayerId,
            title: this._configurationSettings.title,
            view,
            zoomLevel: this._configurationSettings.zoomLevel,
            highlightedFeature: {
              feature: null
            },
            withinConfigurationExperience: this._configurationSettings
              .withinConfigurationExperience
          };

          const widgetProps: esriWidgetProps = {
            view,
            config: this._configurationSettings,
            portal: this.base.portal
          };

          this._initAppModeWatcher(
            widgetProps,
            selectedLayerId,
            photoCentricMobileMapExpanded
          );
          await view.when();
          this._addWidgetsToUI(mapToolsExpanded, docDirection);
          this._initPropWatchers(widgetProps);
          goToMarker(marker, view);
          this._cleanUpHandles();
        })
      )
    );
  }

  // _addWidgetsToUI
  private _addWidgetsToUI(
    mapToolsExpanded: boolean,
    docDirection: string
  ): void {
    const widgetPos = docDirection === "rtl" ? "top-left" : "top-right";
    const content = new Collection();
    const mobileExpand = new MobileExpand({
      content,
      id: "mobileExpand",
      mode: "floating",
      expandIconClass: "icon-ui-down-arrow icon-ui-flush",
      collapseIconClass: "icon-ui-up-arrow icon-ui-flush",
      expandTooltip: i18n.moreTools,
      expanded: mapToolsExpanded
    });
    this.view.ui.add(mobileExpand, widgetPos);
  }

  private _initAppModeWatcher(
    widgetProps: esriWidgetProps,
    selectedLayerId: string,
    photoCentricMobileMapExpanded: boolean
  ): void {
    this.handles.add([
      init(
        this._configurationSettings,
        "appLayout",
        async (newValue, oldValue, propertyName) => {
          widgetProps.propertyName = propertyName;
          this._updateApp(
            widgetProps,
            photoCentricMobileMapExpanded,
            selectedLayerId
          );
        }
      ),
      init(
        this._configurationSettings,
        "order",
        async (newValue, oldValue, propertyName) => {
          widgetProps.propertyName = propertyName;
          this._updateApp(
            widgetProps,
            photoCentricMobileMapExpanded,
            selectedLayerId
          );
        }
      ),
      init(
        this._configurationSettings,
        "attachmentLayers",
        async (newValue, oldValue, propertyName) => {
          widgetProps.propertyName = propertyName;
          this._updateApp(
            widgetProps,
            photoCentricMobileMapExpanded,
            selectedLayerId
          );
        }
      ),
      init(
        this._configurationSettings,
        "onlyDisplayFeaturesWithAttachments",
        async (newValue, oldValue, propertyName) => {
          widgetProps.propertyName = propertyName;
          this._updateApp(
            widgetProps,
            photoCentricMobileMapExpanded,
            selectedLayerId
          );
        }
      )
    ]);
  }

  private _mapPropName(propName: string): string {
    switch (propName) {
      case "onlyDisplayFeaturesWithAttachments":
        return "onlyDisplayFeaturesWithAttachmentsIsEnabled";
      case "appLayout":
        return "appMode";
      case "order":
        return "order";
      case "attachmentLayers":
        return "attachmentLayers";
    }
  }

  private async _updateApp(
    widgetProps: esriWidgetProps,
    photoCentricMobileMapExpanded: boolean,
    selectedLayerId: string
  ) {
    const { propertyName } = widgetProps;
    document.body.removeChild(document.getElementById("app-container"));
    const appContainer = document.createElement("div");
    appContainer.id = "app-container";
    document.body.appendChild(appContainer);
    this.appProps.container = appContainer;
    const mappedPropName = this._mapPropName(propertyName);
    this.appProps[mappedPropName] = this._configurationSettings[propertyName];
    if (this.currentApp?.hasOwnProperty(propertyName)) {
      this.currentApp[propertyName] = this._configurationSettings[propertyName];
    }
    this._handleHighlightedFeatures();
    const app = await toggleAppMode(
      widgetProps,
      this.appProps,
      photoCentricMobileMapExpanded
    );
    this.currentApp?.destroy();
    this.currentApp = app;
    this._handleLayerSwitcher(this.appProps, selectedLayerId);
    this.layerSwitcher.appMode = this._configurationSettings.appLayout;
    this.currentApp.layerSwitcher = this.layerSwitcher;
  }

  private _handleHighlightedFeatures(): void {
    if (this.appProps.highlightedFeature.feature) {
      this.appProps.highlightedFeature.feature.remove();
    }
    this.appProps.highlightedFeature.feature = null;
  }

  private _handleLayerSwitcher(
    appConfig: ApplicationConfig,
    selectedLayerId: string
  ): void {
    const { share, view } = appConfig;
    const layerId = share ? selectedLayerId : null;
    this.layerSwitcher = new LayerSwitcher({
      container: document.createElement("div"),
      view,
      appMode: this.currentApp.appMode,
      selectedLayerId: layerId
    });

    watch(this.layerSwitcher, "selectedLayer", () => {
      when(this.currentApp, "selectedAttachmentViewerData", () => {
        if (!this.layerSwitcher.selectedLayer) {
          return;
        }
        const selectedLayer = this.layerSwitcher.get(
          "selectedLayer"
        ) as __esri.FeatureLayer;
        const featureLayerId = selectedLayer.get("id") as string;
        const attachmentViewerDataCollection = this.currentApp.get(
          "attachmentViewerDataCollection"
        ) as __esri.Collection<any>;
        const selectedLayerData = attachmentViewerDataCollection.find(
          attachmentViewerData => {
            return (
              attachmentViewerData.get("layerData.featureLayer.id") ===
              featureLayerId
            );
          }
        );
        this.currentApp.selectedAttachmentViewerData = selectedLayerData;
        if (this.currentApp.appMode === "map-centric") {
          this.layerSwitcher.mapCentricViewModel = this.currentApp
            .viewModel as MapCentricViewModel;
        }
      });
    });
  }

  private _initPropWatchers(widgetProps: esriWidgetProps): void {
    this.handles.add([
      init(
        this._configurationSettings,
        "search, searchConfiguration, searchOpenAtStart",
        (newValue, oldValue, propertyName) => {
          widgetProps.propertyName = propertyName;
          addSearch(widgetProps);
        }
      ),
      init(
        this._configurationSettings,
        "mapToolsExpanded",
        (newValue, oldValue, propertyName) => {
          widgetProps.propertyName = propertyName;
          const mobileExpand = this.view.ui.find(
            "mobileExpand"
          ) as MobileExpand;
          if (mobileExpand) {
            mobileExpand.expanded = this._configurationSettings.mapToolsExpanded;
          }
        }
      ),
      init(
        this._configurationSettings,
        "home",
        (newValue, oldValue, propertyName) => {
          widgetProps.propertyName = propertyName;
          addHome(widgetProps);
        }
      ),
      init(
        this._configurationSettings,
        "mapZoom",
        (newValue, oldValue, propertyName) => {
          widgetProps.propertyName = propertyName;
          addZoom(widgetProps);
        }
      ),
      init(
        this._configurationSettings,
        "legend",
        (newValue, oldValue, propertyName) => {
          widgetProps.propertyName = propertyName;
          addLegend(widgetProps);
        }
      ),
      init(
        this._configurationSettings,
        "layerList",
        async (newValue, oldValue, propertyName) => {
          const layerListWatcher = "layer-list-watcher";
          if (this.sketchHandles.has(layerListWatcher)) {
            this.sketchHandles.remove(layerListWatcher);
          }
          widgetProps.propertyName = propertyName;
          const layerList = await addLayerList(widgetProps);

          if (layerList) {
            this.sketchHandles.add(
              when(layerList, "operationalItems.length", () => {
                const sketchGraphicsLayer = layerList.operationalItems.find(
                  operationalItem =>
                    operationalItem.layer.id === "av-sketchGraphicsLayer"
                );
                if (sketchGraphicsLayer) {
                  layerList.operationalItems.remove(sketchGraphicsLayer);
                }
              }),
              layerListWatcher
            );
          }
        }
      ),
      init(
        this._configurationSettings,
        "fullScreen",
        (newValue, oldValue, propertyName) => {
          widgetProps.propertyName = propertyName;
          addFullScreen(widgetProps);
        }
      ),
      init(
        this._configurationSettings,
        "selectFeatures",
        async (newValue, oldValue, propertyName) => {
          widgetProps.propertyName = propertyName;
          const sketch = await addSketch(widgetProps);
          if (this._configurationSettings.selectFeatures) {
            this.appProps.selectFeaturesEnabled = this._configurationSettings.selectFeatures;
            this.appProps.sketchWidget = sketch;
            this.appProps.graphicsLayer = sketch.layer;
            this.currentApp.selectFeaturesEnabled = this._configurationSettings.selectFeatures;
            this.currentApp.graphicsLayer = sketch.layer;
            this.currentApp.sketchWidget = sketch;
          } else {
            if (this.appProps.graphicsLayer) {
              this.appProps.graphicsLayer.graphics.removeAll();
            }
            this.appProps.selectFeaturesEnabled = this._configurationSettings.selectFeatures;
            this.appProps?.sketchWidget?.cancel();
            this.appProps.sketchWidget = null;
            this.appProps.graphicsLayer = null;
            this.currentApp.selectFeaturesEnabled = this._configurationSettings.selectFeatures;
            this.currentApp.graphicsLayer = null;
            this.currentApp?.sketchWidget?.cancel();
            this.currentApp.sketchWidget = null;
            this.view.layerViews.forEach(layerView => {
              if (layerView.layer.type === "feature") {
                const featureLayerView = layerView as __esri.FeatureLayerView;
                featureLayerView.effect = null;
              }
            });
          }
        }
      ),
      init(
        this._configurationSettings,
        "share",
        (newValue, oldValue, propertyName) => {
          widgetProps.propertyName = propertyName;
          this.appProps.socialSharingEnabled = this._configurationSettings.share;
          this.currentApp.socialSharingEnabled = this._configurationSettings.share;
        }
      ),
      init(
        this._configurationSettings,
        "address",
        (newValue, oldValue, propertyName) => {
          widgetProps.propertyName = propertyName;
          this.appProps.addressEnabled = this._configurationSettings.address;
          this.currentApp.addressEnabled = this._configurationSettings.address;
        }
      ),
      init(
        this._configurationSettings,
        "download",
        (newValue, oldValue, propertyName) => {
          widgetProps.propertyName = propertyName;
          this.appProps.downloadEnabled = this._configurationSettings.download;
          this.currentApp.downloadEnabled = this._configurationSettings.download;
        }
      ),
      init(
        this._configurationSettings,
        "onboarding",
        (newValue, oldValue, propertyName) => {
          widgetProps.propertyName = propertyName;
          this.appProps.onboardingIsEnabled = this._configurationSettings.onboarding;
          this.currentApp.onboardingIsEnabled = this._configurationSettings.onboarding;
        }
      ),
      init(
        this._configurationSettings,
        "imageDirection",
        (newValue, oldValue, propertyName) => {
          widgetProps.propertyName = propertyName;
          this.appProps.imageDirectionEnabled = this._configurationSettings.imageDirection;
          this.currentApp.imageDirectionEnabled = this._configurationSettings.imageDirection;
        }
      ),
      init(
        this._configurationSettings,
        "customOnboarding, customOnboardingHTML",
        (newValue, oldValue, propertyName) => {
          widgetProps.propertyName = propertyName;
          this.appProps.customOnboarding = this._configurationSettings.customOnboarding;
          this.appProps.customOnboardingHTML = this._configurationSettings.customOnboardingHTML;
          this.onboardingContent.config.customOnboarding = this._configurationSettings.customOnboarding;
          this.onboardingContent.config.customOnboardingHTML = this._configurationSettings.customOnboardingHTML;
        }
      ),
      init(
        this._configurationSettings,
        "customCSS",
        (newValue, oldValue, propertyName) => {
          widgetProps.propertyName = propertyName;
          this.appProps.customCSS = this._configurationSettings.customCSS;
          this._handleCustomCSS();
        }
      ),
      init(
        this._configurationSettings,
        "onboardingButtonText",
        (newValue, oldValue, propertyName) => {
          widgetProps.propertyName = propertyName;
          this.appProps.onboardingButtonText = this._configurationSettings.onboardingButtonText;
          this.currentApp.onboardingButtonText = this._configurationSettings.onboardingButtonText;
        }
      ),
      init(
        this._configurationSettings,
        "zoomLevel",
        (newValue, oldValue, propertyName) => {
          widgetProps.propertyName = propertyName;
          this.appProps.zoomLevel = this._configurationSettings.zoomLevel;
          this.currentApp.zoomLevel = this._configurationSettings.zoomLevel;
        }
      ),
      init(
        this._configurationSettings,
        "headerColor, headerBackground",
        (newValue, oldValue, propertyName) => {
          widgetProps.propertyName = propertyName;
          this.appProps.headerBackground = this._configurationSettings.headerBackground;
          this.appProps.headerColor = this._configurationSettings.headerColor;
          this._applyHeaderColors();
        }
      ),
      init(
        this._configurationSettings,
        "onboardingImage",
        (newValue, oldValue, propertyName) => {
          widgetProps.propertyName = propertyName;
          this.appProps.onboardingImage = this._configurationSettings.onboardingImage;
          const photoCentricApp = this.currentApp as PhotoCentric;
          photoCentricApp.onboardingImage = this._configurationSettings.onboardingImage;
        }
      ),
      init(
        this._configurationSettings,
        "mapCentricTooltip",
        (newValue, oldValue, propertyName) => {
          widgetProps.propertyName = propertyName;
          this.appProps.mapCentricTooltipEnabled = this._configurationSettings.mapCentricTooltip;
          const mapCentricApp = this.currentApp as MapCentric;
          mapCentricApp.mapCentricTooltipEnabled = this._configurationSettings.mapCentricTooltip;
        }
      ),
      init(
        this._configurationSettings,
        "showOnboardingOnStart",
        (newValue, oldValue, propertyName) => {
          widgetProps.propertyName = propertyName;
          this.appProps.showOnboardingOnStart = this._configurationSettings.showOnboardingOnStart;
          this.currentApp.showOnboardingOnStart = this._configurationSettings.showOnboardingOnStart;
        }
      ),
      init(
        this._configurationSettings,
        "imagePanZoom",
        (newValue, oldValue, propertyName) => {
          const isIE11 =
            navigator.userAgent.indexOf("MSIE") !== -1 ||
            navigator.appVersion.indexOf("Trident/") > -1;

          const imagePanZoomEnabledValue = isIE11
            ? false
            : this._configurationSettings.imagePanZoom;

          widgetProps.propertyName = propertyName;
          this.appProps.imagePanZoomEnabled = imagePanZoomEnabledValue;
          this.currentApp.imagePanZoomEnabled = imagePanZoomEnabledValue;
        }
      ),
      init(
        this._configurationSettings,
        "applySharedTheme",
        (newValue, oldValue, propertyName) => {
          widgetProps.propertyName = propertyName;
          this.appProps.applySharedTheme = this._configurationSettings.applySharedTheme;
          this.currentApp.applySharedTheme = this._configurationSettings.applySharedTheme;
        }
      ),
      init(
        this._configurationSettings,
        "title",
        (newValue, oldValue, propertyName) => {
          if (!this._configurationSettings.title) {
            this._configurationSettings.title = getItemTitle(this.item);
          }
          widgetProps.propertyName = propertyName;
          this.appProps.title = this._configurationSettings.title;
          this.currentApp.title = this._configurationSettings.title;
        }
      )
    ]);
  }

  private _getURLParameter(name: string): string {
    return (
      decodeURIComponent(
        (new RegExp("[?|&]" + name + "=" + "([^&;]+?)(&|#|;|$)").exec(
          location.search
        ) || [null, ""])[1].replace(/\+/g, "%20")
      ) || null
    );
  }

  // _handleCustomCSS
  private _handleCustomCSS(): void {
    const customCSSStyleSheet = document.getElementById("customCSS");

    if (customCSSStyleSheet) {
      customCSSStyleSheet.remove();
    }

    const styles = document.createElement("style");
    styles.id = "customCSS";
    styles.type = "text/css";
    const styleTextNode = document.createTextNode(
      this._configurationSettings.customCSS
    );
    styles.appendChild(styleTextNode);
    document.head.appendChild(styles);
  }

  // _applyHeaderColors
  private _applyHeaderColors(): void {
    const headerStyles = document.getElementById("headerStyles");
    if (headerStyles) {
      headerStyles.remove();
    }
    const config = this._configurationSettings;
    const headerColorConfig = this._configurationSettings.headerColor
      ? typeof this._configurationSettings.headerColor === "string"
        ? this._configurationSettings.headerColor
        : JSON.parse(this._configurationSettings.headerColor)
      : null;
    const headerBackgroundConfig = this._configurationSettings.headerBackground
      ? typeof this._configurationSettings.headerBackground === "string"
        ? this._configurationSettings.headerBackground
        : JSON.parse(this._configurationSettings.headerBackground)
      : null;
    const styles = [];
    const headerBackground =
      config.headerBackground &&
      !isNaN(headerBackgroundConfig.r) &&
      !isNaN(headerBackgroundConfig.g) &&
      !isNaN(headerBackgroundConfig.b) &&
      !isNaN(headerBackgroundConfig.a)
        ? `rgba(${headerBackgroundConfig.r}, ${headerBackgroundConfig.g}, ${headerBackgroundConfig.b}, ${headerBackgroundConfig.a})`
        : config.headerBackground === "no-color"
        ? "transparent"
        : config.headerBackground;
    const headerColor =
      config.headerColor &&
      !isNaN(headerColorConfig.r) &&
      !isNaN(headerColorConfig.g) &&
      !isNaN(headerColorConfig.b) &&
      !isNaN(headerColorConfig.a)
        ? `rgba(${headerColorConfig.r}, ${headerColorConfig.g}, ${headerColorConfig.b}, ${headerColorConfig.a})`
        : config.headerColor === "no-color"
        ? "transparent"
        : config.headerColor;
    styles.push(
      config.headerBackground
        ? `.esri-photo-centric__header{background:${headerBackground};}`
        : null
    );
    styles.push(
      config.headerColor
        ? `.esri-photo-centric__header{color:${headerColor};}`
        : null
    );
    styles.push(
      config.headerBackground
        ? `.esri-map-centric__header{background:${headerBackground};}`
        : null
    );
    styles.push(
      config.headerColor
        ? `.esri-map-centric__header{color:${headerColor};}`
        : null
    );
    const style = document.createElement("style");
    style.id = "headerStyles";
    style.appendChild(document.createTextNode(styles.join("")));
    document.getElementsByTagName("head")[0].appendChild(style);
  }

  private _createSharedTheme(): void {
    const portal = this.base?.portal;
    let sharedTheme: any = null;
    if (portal?.portalProperties) {
      const theme = portal?.portalProperties?.sharedTheme;
      sharedTheme = {
        background: theme?.header?.background,
        text: theme?.header?.text,
        logo: theme?.logo?.small,
        logoLink: theme?.logo?.link
      };
    }

    return sharedTheme;
  }

  private _cleanUpHandles(): void {
    if (!this._configurationSettings.withinConfigurationExperience) {
      this.handles.removeAll();
      this.handles = null;
    }
  }
}

export = AttachmentViewerApp;
