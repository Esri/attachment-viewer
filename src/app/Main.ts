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
import * as i18n from "dojo/i18n!./nls/common";
import * as i18nMapCentric from "dojo/i18n!./Components/MapCentric/nls/resources";

// esri.widgets
import Expand = require("esri/widgets/Expand");
import FullScreen = require("esri/widgets/Fullscreen");
import Home = require("esri/widgets/Home");
import LayerList = require("esri/widgets/LayerList");
import Legend = require("esri/widgets/Legend");
import Sketch = require("esri/widgets/Sketch");
import Search = require("esri/widgets/Search");
import Zoom = require("esri/widgets/Zoom");

// esri.core
import Collection = require("esri/core/Collection");
import Handles = require("esri/core/Handles");
import watchUtils = require("esri/core/watchUtils");

// esri.layers
import FeatureLayer = require("esri/layers/FeatureLayer");
import GraphicsLayer = require("esri/layers/GraphicsLayer");

// Components
import LayerSwitcher = require("./Components/LayerSwitcher");
import MapCentric = require("./Components/MapCentric");
import MobileExpand = require("./Components/MobileExpand");
import OnboardingContent = require("./Components/OnboardingContent");
import PhotoCentric = require("./Components/PhotoCentric");

import {
  ApplicationConfig,
  ApplicationBaseSettings
} from "ApplicationBase/interfaces";

class AttachmentViewerApp {
  //--------------------------------------------------------------------------
  //
  //  Properties
  //
  //--------------------------------------------------------------------------

  //----------------------------------
  //  ApplicationBase
  //----------------------------------
  app: PhotoCentric | MapCentric = null;
  base: ApplicationBase = null;
  graphicsLayer: __esri.GraphicsLayer = null;
  handles: Handles = new Handles();
  layerList: __esri.LayerList = null;
  layerSwitcher: LayerSwitcher = null;
  searchWidget: Search = null;
  sketchWidget: __esri.Sketch = null;
  view: __esri.MapView = null;
  widgets: Collection<__esri.Widget> = new Collection();

  //--------------------------------------------------------------------------
  //
  //  Public Methods
  //
  //--------------------------------------------------------------------------

  public init(base: ApplicationBase): void {
    if (!base) {
      console.error("ApplicationBase is not defined");
      return;
    }
    const { config, results, settings } = base;

    this._applySharedTheme(config);

    setPageLocale(base.locale);
    setPageDirection(base.direction);

    this.base = base;

    const {
      addressEnabled,
      appMode,
      attachmentLayer,
      attachmentLayers,
      showOnboardingOnStart,
      downloadEnabled,
      find,
      fullScreenEnabled,
      homeEnabled,
      imageDirectionEnabled,
      imagePanZoomEnabled,
      layerListEnabled,
      legendEnabled,
      mapCentricTooltipEnabled,
      mapToolsExpanded,
      marker,
      onboardingIsEnabled,
      onboardingButtonText,
      onboardingImage,
      onlyDisplayFeaturesWithAttachmentsIsEnabled,
      order,
      searchConfig,
      searchEnabled,
      searchExpanded,
      selectFeaturesEnabled,
      socialSharingEnabled,
      title,
      zoomEnabled,
      zoomLevel
    } = config;

    const { webMapItems } = results;

    const validWebMapItems = webMapItems.map(response => {
      return response.value;
    });

    const firstItem = validWebMapItems[0];
    if (!firstItem) {
      const error = "Could not load an item to display";
      document.body.classList.remove("configurable-application--loading");
      document.body.classList.add("app-error");
      document.getElementById("app-container").innerHTML = `<h1>${error}</h1>`;
      console.error(error);
      return;
    }

    config.title = !config.title ? getItemTitle(firstItem) : "";
    setPageTitle(config.title);

    const portalItem: __esri.PortalItem = this.base.results.applicationItem
      .value;
    const appProxies =
      portalItem && portalItem.applicationProxies
        ? portalItem.applicationProxies
        : null;

    const defaultViewProperties = getConfigViewProperties(config);

    validWebMapItems.forEach(item => {
      const viewNode = document.createElement("div");

      const container = {
        container: viewNode
      };

      const viewProperties = {
        ...defaultViewProperties,
        ...container
      };

      createMapFromItem({ item, appProxies }).then(map =>
        createView({
          ...viewProperties,
          map
        }).then(view =>
          findQuery(find, view).then(() => {
            this.view = view as __esri.MapView;

            const selectedLayerId = this._getURLParameter("selectedLayerId");

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
                window.history.replaceState({}, "", `${location.pathname}`);
                location.reload();
                return;
              }
            }

            if (
              document.body.clientWidth > 813 &&
              appMode === "photo-centric"
            ) {
              view.padding.bottom = 380;
            }

            const appTitle = this._handleDocTitle(title);

            this.view.ui.remove("zoom");

            this._handleSearchWidget(
              searchConfig,
              searchEnabled,
              searchExpanded,
              mapCentricTooltipEnabled
            );
            this._handleZoomControls(zoomEnabled);
            this._handleHomeWidget(homeEnabled);
            this._handleLegendWidget(legendEnabled);
            this._handleLayerListWidget(layerListEnabled);
            this._handleFullScreenWidget(fullScreenEnabled);
            this._handleSketchWidget(selectFeaturesEnabled);
            this._removeGraphicsLayerFromLayerList();
            this._addWidgetsToUI(mapToolsExpanded);

            const defaultObjectIdParam = parseInt(
              this._getURLParameter("defaultObjectId")
            );
            const defaultObjectId = socialSharingEnabled
              ? isNaN(defaultObjectIdParam)
                ? null
                : defaultObjectIdParam
              : null;
            const featureAttachmentIndexParam = parseInt(
              this._getURLParameter("attachmentIndex")
            );

            const attachmentIndex = socialSharingEnabled
              ? isNaN(featureAttachmentIndexParam)
                ? null
                : featureAttachmentIndexParam
              : null;

            this._handleLayerSwitcher(
              appMode,
              selectedLayerId,
              socialSharingEnabled
            );

            const container = document.createElement("div");
            const onboardingContent = new OnboardingContent({
              container,
              config,
              appMode
            });

            const scale = isNaN(zoomLevel) ? parseInt(zoomLevel) : zoomLevel;

            const docDirection = document
              .querySelector("html")
              .getAttribute("dir");

            const isIE11 =
              navigator.userAgent.indexOf("MSIE") !== -1 ||
              navigator.appVersion.indexOf("Trident/") > -1;

            const imagePanZoomValue = isIE11 ? false : imagePanZoomEnabled;
            const appConfig = {
              addressEnabled,
              attachmentLayer,
              attachmentLayers,
              appMode,
              attachmentIndex,
              container: document.getElementById("app-container"),
              defaultObjectId,
              showOnboardingOnStart,
              downloadEnabled,
              docDirection,
              graphicsLayer: this.graphicsLayer,
              imageDirectionEnabled,
              imagePanZoomEnabled: imagePanZoomValue,
              layerSwitcher: this.layerSwitcher,
              mapCentricTooltipEnabled,
              onboardingButtonText,
              onboardingContent,
              onboardingImage,
              onboardingIsEnabled,
              onlyDisplayFeaturesWithAttachmentsIsEnabled,
              order,
              searchWidget: this.searchWidget,
              selectFeaturesEnabled,
              sketchWidget: this.sketchWidget,
              selectedLayerId,
              socialSharingEnabled,
              title: appTitle,
              view,
              zoomLevel: scale
            };

            if (appMode === "photo-centric") {
              this.app = new PhotoCentric(appConfig);
              document.body.classList.add("photo-centric-body");
            } else if (appMode === "map-centric") {
              this.app = new MapCentric(appConfig);
              if (this.layerSwitcher) {
                this.layerSwitcher.mapCentricViewModel = this.app.viewModel;
              }
              document.body.classList.add("map-centric-body");
            }
            goToMarker(marker, view);

            if (config.customCSS) {
              this._handleCustomCSS(config);
            }
            document.body.classList.remove(CSS.loading);
          })
        )
      );
    });
  }

  // _handleDocTitle
  private _handleDocTitle(title: string): string {
    const portalItemTitle = this.view.get("map.portalItem.title") as string;
    const appTitle = title
      ? title
      : portalItemTitle
      ? portalItemTitle
      : "Attachment Viewer";
    const titleElement = document.createElement("title");
    titleElement.appendChild(document.createTextNode(appTitle));
    document.getElementsByTagName("head")[0].appendChild(titleElement);
    return appTitle;
  }

  // _handleZoomControls
  private _handleZoomControls(zoomEnabled: boolean): void {
    if (zoomEnabled) {
      const zoom = new Zoom({
        view: this.view
      });
      this.widgets.add(zoom);
    }
  }

  // _handleHomeWidget
  private _handleHomeWidget(homeEnabled: boolean): void {
    if (homeEnabled) {
      const home = new Home({
        view: this.view
      });

      this.widgets.add(home);
    }
  }

  // _handleSearchWidget
  private _handleSearchWidget(
    searchConfig: any,
    searchEnabled: boolean,
    searchExpanded: boolean,
    mapCentricTooltipEnabled: boolean
  ): void {
    if (!searchEnabled) {
      return;
    }
    const popupEnabled = mapCentricTooltipEnabled ? true : false;
    const searchProperties: any = {
      view: this.view,
      popupEnabled
    };
    if (searchConfig) {
      if (searchConfig.sources) {
        const sources = searchConfig.sources;

        searchProperties.sources = sources.filter(source => {
          if (source.flayerId && source.url) {
            const layer = this.view.map.findLayerById(source.flayerId);
            source.layer = layer ? layer : new FeatureLayer(source.url);
          }
          if (source.hasOwnProperty("enableSuggestions")) {
            source.suggestionsEnabled = source.enableSuggestions;
          }
          if (source.hasOwnProperty("searchWithinMap")) {
            source.withinViewEnabled = source.searchWithinMap;
          }

          return source;
        });
      }
      if (
        searchProperties.sources &&
        searchProperties.sources.length &&
        searchProperties.sources.length > 0
      ) {
        searchProperties.includeDefaultSources = false;
      }
      searchProperties.searchAllEnabled = searchConfig.enableSearchingAll
        ? true
        : false;
      if (
        searchConfig.activeSourceIndex &&
        searchProperties.sources &&
        searchProperties.sources.length >= searchConfig.activeSourceIndex
      ) {
        searchProperties.activeSourceIndex = searchConfig.activeSourceIndex;
      }
    }

    this.searchWidget = new Search({
      container: document.createElement("div"),
      ...searchProperties
    });

    const expand = new Expand({
      view: this.view,
      content: this.searchWidget,
      mode: "floating",
      expanded: searchExpanded,
      expandTooltip: i18n.search
    });

    this.view.ui.add(expand, "top-left");
  }

  // _handleLegendWidget
  private _handleLegendWidget(legendEnabled: boolean): void {
    if (legendEnabled) {
      const legend = new Legend({
        view: this.view
      });

      this.widgets.add(
        new Expand({
          view: this.view,
          content: legend,
          mode: "floating",
          group: "top-right",
          expandTooltip: legend.label
        })
      );
    }
  }

  //  _handleSketchWidget
  private _handleSketchWidget(selectFeaturesEnabled: boolean): any {
    if (selectFeaturesEnabled) {
      this.graphicsLayer = new GraphicsLayer();

      this.view.map.layers.unshift(this.graphicsLayer);
      const sketch = new Sketch({
        layer: this.graphicsLayer,
        view: this.view,
        availableCreateTools: ["rectangle"],
        defaultUpdateOptions: {
          toggleToolOnClick: false,
          enableRotation: false
        },
        iconClass: "custom-sketch"
      });
      this.sketchWidget = sketch;
      this.sketchWidget.viewModel.updateOnGraphicClick = false;
      this.widgets.add(
        new Expand({
          view: this.view,
          content: sketch,
          mode: "floating",
          group: "top-right",
          expandTooltip: i18nMapCentric.drawToSelectFeatures
        })
      );
    }
  }

  // _removeGrahpicsLayerFromLayerList
  private _removeGraphicsLayerFromLayerList(): void {
    if (this.layerList && this.sketchWidget) {
      const operationalItems = this.layerList.get(
        "operationalItems"
      ) as __esri.Collection<__esri.ListItem>;
      watchUtils.when(this.layerList, "operationalItems.length", () => {
        const graphicsLayer =
          operationalItems &&
          operationalItems.find(operationalItem => {
            const { layer } = operationalItem;
            return layer.id === this.graphicsLayer.id;
          });
        this.layerList.operationalItems.remove(graphicsLayer);
      });
    }
  }

  // _handleLayerListWidget
  private _handleLayerListWidget(layerListEnabled: boolean): void {
    if (layerListEnabled) {
      this.layerList = new LayerList({
        view: this.view
      });

      this.widgets.add(
        new Expand({
          view: this.view,
          content: this.layerList,
          mode: "floating",
          group: "top-right",
          expandTooltip: this.layerList.label
        })
      );
    }
  }

  // _handleFullScreenWidget
  private _handleFullScreenWidget(fullScreenEnabled: boolean): void {
    if (fullScreenEnabled) {
      const fullscreen = new FullScreen({
        view: this.view
      });
      this.widgets.add(fullscreen);
    }
  }

  // _handleLayerSwitcher
  private _handleLayerSwitcher(
    appMode: string,
    selectedLayerId: string,
    socialSharingEnabled: boolean
  ): void {
    const layerId = socialSharingEnabled ? selectedLayerId : null;
    const layerSwitcher = new LayerSwitcher({
      container: document.createElement("div"),
      view: this.view,
      appMode,
      selectedLayerId: layerId
    });

    this.layerSwitcher = layerSwitcher;

    watchUtils.watch(layerSwitcher, "selectedLayer", () => {
      watchUtils.when(this.app, "selectedAttachmentViewerData", () => {
        if (!layerSwitcher.selectedLayer) {
          return;
        }
        const selectedLayer = layerSwitcher.get(
          "selectedLayer"
        ) as __esri.FeatureLayer;
        const featureLayerId = selectedLayer.get("id") as string;
        const attachmentViewerDataCollection = this.app.get(
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
        this.app.selectedAttachmentViewerData = selectedLayerData;
      });
    });
  }

  // _addWidgetsToUI
  private _addWidgetsToUI(mapToolsExpanded: boolean): void {
    if (this.widgets.length > 1) {
      const content = [];
      this.widgets.forEach(widget => {
        content.push(widget);
      });
      const mobileExpand = new MobileExpand({
        content,
        mode: "floating",
        expandIconClass: "icon-ui-down-arrow icon-ui-flush",
        collapseIconClass: "icon-ui-up-arrow icon-ui-flush",
        expandTooltip: i18n.moreTools,
        expanded: mapToolsExpanded
      });
      this.view.ui.add(mobileExpand, "top-right");
    } else if (this.widgets.length === 1) {
      this.view.ui.add(this.widgets.getItemAt(0), "top-right");
    }
  }

  // _getURLParameter
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
  private _handleCustomCSS(config: ApplicationConfig): void {
    const styles = document.createElement("style");
    styles.type = "text/css";
    styles.appendChild(document.createTextNode(config.customCSS));
    document.head.appendChild(styles);
  }

  // _applySharedTheme
  private _applySharedTheme(config: ApplicationConfig): void {
    const styles = [];
    const headerBackground =
      config.headerBackground &&
      !isNaN(config.headerBackground.r) &&
      !isNaN(config.headerBackground.g) &&
      !isNaN(config.headerBackground.b) &&
      !isNaN(config.headerBackground.a)
        ? `rgba(${config.headerBackground.r}, ${config.headerBackground.g}, ${config.headerBackground.b}, ${config.headerBackground.a})`
        : config.headerBackground === "no-color"
        ? "transparent"
        : config.headerBackground;
    const headerColor =
      config.headerColor &&
      !isNaN(config.headerColor.r) &&
      !isNaN(config.headerColor.g) &&
      !isNaN(config.headerColor.b) &&
      !isNaN(config.headerColor.a)
        ? `rgba(${config.headerColor.r}, ${config.headerColor.g}, ${config.headerColor.b}, ${config.headerColor.a})`
        : config.headerColor === "no-color"
        ? "transparent"
        : config.headerColor;

    if (config.appMode === "photo-centric") {
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
    } else {
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
    }

    const style = document.createElement("style");
    style.appendChild(document.createTextNode(styles.join("")));
    document.getElementsByTagName("head")[0].appendChild(style);
  }
}

export = AttachmentViewerApp;
