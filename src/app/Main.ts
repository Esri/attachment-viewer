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

import AttachmentViewer = require("./Components/AttachmentViewer");

import Search = require("esri/widgets/Search");

import Expand = require("esri/widgets/Expand");

import MobileExpand = require("./Components/MobileExpand/MobileExpand");

import Legend = require("esri/widgets/Legend");

import LayerList = require("esri/widgets/LayerList");

import Home = require("esri/widgets/Home");

import FeatureLayer = require("esri/layers/FeatureLayer");

import OnboardingContent = require("./Components/Onboarding/OnboardingContent");

import * as i18n from "dojo/i18n!./nls/common";

import FullScreen = require("esri/widgets/Fullscreen");

import Collection = require("esri/core/Collection");

import Zoom = require("esri/widgets/Zoom");

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
  base: ApplicationBase = null;
  searchWidget: Search = null;
  searchWidgetMobile: Search = null;
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
      find,
      marker,
      appMode,
      title,
      attachmentLayer,
      order,
      downloadEnabled,
      homeEnabled,
      zoomEnabled,
      legendEnabled,
      layerListEnabled,
      searchConfig,
      searchEnabled,
      zoomLevel,
      addressEnabled,
      fullScreenEnabled,
      socialSharingEnabled,
      onboardingImage,
      onboardingButtonText,
      mapToolsExpanded,
      searchExpanded
    } = config;
    const { webMapItems } = results;

    const validWebMapItems = webMapItems.map(response => {
      return response.value;
    });

    const firstItem = validWebMapItems[0];

    if (!firstItem) {
      console.error("Could not load an item to display");
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

            if (document.body.clientWidth > 813) {
              this.view.padding.bottom = 380;
            }

            const appTitle = title
              ? title
              : (view.map.get("portalItem") as __esri.PortalItem).title
              ? (view.map.get("portalItem") as __esri.PortalItem).title
              : "Feature Browser";

            this.view.ui.remove("zoom");

            this._handleSearchWidget(
              searchConfig,
              searchEnabled,
              searchExpanded
            );

            this._handleZoomControls(zoomEnabled);

            this._handleHomeWidget(homeEnabled);

            this._handleLegendWidget(legendEnabled);

            this._handleLayerListWidget(layerListEnabled);

            this._handleFullScreenWidget(fullScreenEnabled);

            this._addWidgetsToUI(mapToolsExpanded);

            const defaultObjectIdParam = parseInt(
              this._getURLParameter("defaultObjectId")
            );
            const defaultObjectId = isNaN(defaultObjectIdParam)
              ? null
              : defaultObjectIdParam;
            const featureAttachmentIndexParam = parseInt(
              this._getURLParameter("attachmentIndex")
            );

            const attachmentIndex = isNaN(featureAttachmentIndexParam)
              ? null
              : featureAttachmentIndexParam;
            const container = document.createElement("div");
            const onboardingContent = new OnboardingContent({
              container,
              config
            });

            const scale = isNaN(zoomLevel) ? parseInt(zoomLevel) : zoomLevel;

            const docDirection = document
              .querySelector("html")
              .getAttribute("dir");
            new AttachmentViewer({
              view,
              container: document.getElementById("app-container"),
              appMode,
              title: appTitle,
              searchWidget: this.searchWidget,
              defaultObjectId,
              attachmentIndex,
              attachmentLayer,
              order,
              downloadEnabled,
              socialSharingEnabled,
              onboardingContent,
              zoomLevel: scale,
              docDirection,
              addressEnabled,
              onboardingImage,
              onboardingButtonText
            });
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
    searchExpanded: boolean
  ): void {
    if (!searchEnabled) {
      return;
    }
    const searchProperties: any = {
      view: this.view
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

    this.view.ui.add(expand, "top-right");
  }

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
          group: "top-left",
          expandTooltip: legend.label
        })
      );
    }
  }

  // _handleLayerListWidget
  private _handleLayerListWidget(layerListEnabled: boolean): void {
    if (layerListEnabled) {
      const layerList = new LayerList({
        view: this.view
      });

      this.widgets.add(
        new Expand({
          view: this.view,
          content: layerList,
          mode: "floating",
          group: "top-left",
          expandTooltip: layerList.label
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
      this.view.ui.add(mobileExpand, "top-left");
    } else if (this.widgets.length === 1) {
      this.view.ui.add(this.widgets.getItemAt(0), "top-left");
    }
    // this.view.ui.add(this.searchWidget);
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
  private _handleCustomCSS(config: ApplicationConfig): void {
    const styles = document.createElement("style");
    styles.type = "text/css";
    styles.appendChild(document.createTextNode(config.customCSS));
    document.head.appendChild(styles);
  }

  // _applySharedTheme
  private _applySharedTheme(config: ApplicationConfig): void {
    const styles = [];
    styles.push(
      config.headerBackground
        ? `.esri-photo-centric__header{background:${config.headerBackground};}`
        : null
    );
    styles.push(
      config.headerColor
        ? `.esri-photo-centric__header{color:${config.headerColor};}`
        : null
    );

    const style = document.createElement("style");
    style.appendChild(document.createTextNode(styles.join("")));
    document.getElementsByTagName("head")[0].appendChild(style);
  }
}

export = AttachmentViewerApp;
