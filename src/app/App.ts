// Copyright 2023 Esri
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//   http://www.apache.org/licenses/LICENSE-2.0
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.​

import ApplicationBase from "templates-common-library/baseClasses/ApplicationBase";

import ConfigurationSettings from "./ConfigurationSettings/ConfigurationSettings";

const CSS = {
  loading: "configurable-application--loading"
};

import {
  createMapFromItem,
  createView,
  getConfigViewProperties,
  findQuery,
  goToMarker
} from "templates-common-library/baseClasses/support/itemUtils";

import { setPageLocale, setPageDirection, setPageTitle } from "templates-common-library/baseClasses/support/domHelper";

// esri.core
import Handles from "@arcgis/core/core/Handles";
import Collection from "@arcgis/core/core/Collection";
import { when } from "@arcgis/core/core/reactiveUtils";

// Components
import LayerSwitcher from "./Components/LayerSwitcher";
import PhotoCentric from "./Components/PhotoCentric";
import MapCentric from "./Components/MapCentric";
import MobileExpand from "./Components/MobileExpand";
import OnboardingContent from "./Components/OnboardingContent";

import Extent from "@arcgis/core/geometry/Extent";
import Search from "@arcgis/core/widgets/Search";

import { handleT9N } from "templates-common-library/structuralFunctionality/t9nUtils";

import { esriWidgetProps } from "./interfaces/interfaces";

import Telemetry from "templates-common-library/structuralFunctionality/telemetry/telemetry";
import {
  getConfigWatchers,
  getAppModeWatchers,
  getThemeWatcher,
  getTitleWatcher,
  handleAppLayout
} from "./utils/configWatchers";

class AttachmentViewerApp {
  private _configurationSettings: ConfigurationSettings;
  private _telemetry;
  appProps: any = null;
  currentApp: PhotoCentric | MapCentric;
  base: ApplicationBase;
  graphicsLayer: __esri.GraphicsLayer;
  handles: Handles | null = new Handles();
  initialExtent: Extent;
  analyticsHandles: Handles = new Handles();
  sketchHandles: Handles = new Handles();
  layerList: __esri.LayerList;
  layerSwitcher: LayerSwitcher;
  onboardingContent: OnboardingContent;
  searchWidget: Search;
  sketchWidget: __esri.Sketch;
  view: __esri.MapView;
  item: __esri.PortalItem | null = null;
  commonMessages: any = null;

  public async init(base: ApplicationBase): Promise<void> {
    if (!base) {
      console.error("ApplicationBase is not defined");
      return;
    }

    this.commonMessages = await handleT9N(
      `${import.meta.env.BASE_URL}`,
      `${import.meta.env.BASE_URL}`,
      `${import.meta.env.BASE_URL}assets/t9n/Common/common`
    );

    setPageLocale(base.locale);
    setPageDirection(base.direction);

    this.base = base;
    this._createApp();
    document.body.classList.remove(CSS.loading);
    this.createTelemetry();
  }

  private _createApp(): void {
    const { config, results } = this.base;

    const { find, mapToolsExpanded, marker, share } = config;

    this._configurationSettings = new ConfigurationSettings(config);

    const { webMapItems } = results;

    webMapItems?.forEach((response) => {
      if (response?.value?.id === this._configurationSettings?.webmap) {
        this.item = response.value;
      } else if (this._configurationSettings?.webmap === "default") {
        this.item = response.value;
      }
    });

    const appItemTitle = results?.applicationItem?.value?.title;

    const title = this._configurationSettings?.title
      ? this._configurationSettings.title
      : appItemTitle
      ? appItemTitle
      : this.item?.title
      ? this.item.title
      : "Attachment Viewer";
    setPageTitle(title);
    config.title = title;

    this.handles?.add(getTitleWatcher(this._configurationSettings), "configuration");
    this._configurationSettings.title = title;

    if (!this.item) {
      document.location.href = `../../shared/unavailable/index.html?appid=${config?.appid || null}`;
      return;
    }

    const portalItem: __esri.PortalItem | undefined = this.base?.results?.applicationItem?.value;
    const appProxies: any = portalItem && portalItem.applicationProxies ? portalItem.applicationProxies : null;

    const defaultViewProperties = getConfigViewProperties(config);

    const viewNode = document.createElement("div");

    const container = {
      container: viewNode
    };

    const viewProperties = {
      ...defaultViewProperties,
      ...container
    };

    createMapFromItem({ item: this.item, appProxies }).then((map) =>
      createView({
        ...viewProperties,
        map
      }).then((view: __esri.MapView | __esri.SceneView) =>
        findQuery(find as string, view).then(async () => {
          this.view = view as __esri.MapView;

          const selectedLayerId = this._getURLParameter("selectedLayerId");
          if (!this._configurationSettings.withinConfigurationExperience) {
            if (selectedLayerId) {
              const layer = view.map.allLayers.find((layer) => {
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
                window.history.replaceState(null, "", `${location.pathname}?appid=${appid}`);
                location.reload();
                return;
              }
            }
          }

          const docDirection = this.base.direction;

          this.view.ui.remove("zoom");

          const defaultObjectIdParam = parseInt(this._getURLParameter("defaultObjectId") as string);

          const defaultObjectId = share ? (isNaN(defaultObjectIdParam) ? null : defaultObjectIdParam) : null;
          const featureAttachmentIndexParam = parseInt(this._getURLParameter("attachmentIndex") as string);

          const hiddenLayersParam = new URL(window.location.href).searchParams;
          const hiddenLayers = hiddenLayersParam.get("hiddenLayers");
          if (hiddenLayers) {
            const hiddenLayersArr = hiddenLayers.split(";");
            this.view.map.allLayers.forEach((layer) => {
              if (hiddenLayersArr.indexOf(layer.id) !== -1) {
                layer.visible = false;
              }
            });
          }

          const attachmentIndex = share
            ? isNaN(featureAttachmentIndexParam)
              ? null
              : featureAttachmentIndexParam
            : null;

          const container = document.createElement("div");

          handleAppLayout(this._configurationSettings);

          this.onboardingContent = new OnboardingContent({
            container,
            config: this._configurationSettings,
            appMode: this._configurationSettings.appLayout,
            withinConfigurationExperience: this._configurationSettings.withinConfigurationExperience
          });

          const sharedTheme = this._createSharedTheme();

          this.appProps = {
            applicationItem: this.item,
            addressEnabled: this._configurationSettings.address,
            appMode: this._configurationSettings.appLayout,
            downloadEnabled: this._configurationSettings.download,
            imagePanZoomEnabled: this._configurationSettings.imagePanZoom,
            selectFeaturesEnabled: this._configurationSettings.selectFeatures,
            onboardingIsEnabled: this._configurationSettings.onboarding,
            socialSharingEnabled: this._configurationSettings.share,
            customOnboardingContentEnabled: this._configurationSettings.customOnboarding,
            customOnboardingHTML: this._configurationSettings.customOnboardingHTML,
            imageDirectionEnabled: this._configurationSettings.imageDirection,
            graphicsLayer: this.graphicsLayer,
            showOnboardingOnStart: this._configurationSettings.showOnboardingOnStart,
            applySharedTheme: this._configurationSettings.applySharedTheme,
            sharedTheme,
            attachmentLayers: this._configurationSettings.attachmentLayers,
            attachmentIndex,
            container: document.getElementById("app-container"),
            defaultObjectId,
            docDirection,
            layerSwitcher: this.layerSwitcher,
            mapCentricTooltipEnabled: this._configurationSettings.mapCentricTooltip,
            onboardingButtonText: this._configurationSettings.onboardingButtonText,
            onboardingContent: this.onboardingContent,
            onboarding: this._configurationSettings.onboarding,
            order: this._configurationSettings.order,
            searchWidget: this.searchWidget,
            sketchWidget: this.sketchWidget,
            selectedLayerId,
            title: this._configurationSettings.title,
            view,
            zoomLevel: this._configurationSettings.zoomLevel,
            highlightedFeature: null,
            applyEffectToNonActiveLayers: this._configurationSettings.applyEffectToNonActiveLayers,
            nonActiveLayerEffects: this._configurationSettings.nonActiveLayerEffects,
            attributeEditing: this._configurationSettings.attributeEditing,
            withinConfigurationExperience: this._configurationSettings.withinConfigurationExperience,
            thumbnailFormat: this._configurationSettings.thumbnailFormat,
            thumbnailHeight: this._configurationSettings.thumbnailHeight,
            theme: this._configurationSettings.theme,
            hideAttributePanel: this._configurationSettings.hideAttributePanel
          };

          const widgetProps: esriWidgetProps = {
            view: view as __esri.MapView,
            config: this._configurationSettings,
            portal: this.base.portal
          };

          this._initAppModeWatcher(widgetProps, selectedLayerId);
          await view.when();
          this.initialExtent = view.extent.clone();
          this._addWidgetsToUI(mapToolsExpanded, docDirection);
          this._initPropWatchers(widgetProps);
          goToMarker(marker as string, view);
          this._cleanUpHandles();
        })
      )
    );
  }

  // _addWidgetsToUI
  private _addWidgetsToUI(mapToolsExpanded: boolean, docDirection: string): void {
    const widgetPos = docDirection === "rtl" ? "top-left" : "top-right";
    const content = new Collection();
    const mobileExpand = new MobileExpand({
      content,
      id: "mobileExpand",
      mode: "floating",
      expandIconClass: "icon-ui-down-arrow icon-ui-flush",
      collapseIconClass: "icon-ui-up-arrow icon-ui-flush",
      expandTooltip: this.commonMessages?.moreTools,
      expanded: mapToolsExpanded,
      theme: this._configurationSettings.theme
    });

    this.handles?.add(getThemeWatcher(this._configurationSettings, mobileExpand), "configuration");

    this.view.ui.add(mobileExpand, widgetPos);
  }

  private async _initAppModeWatcher(widgetProps: esriWidgetProps, selectedLayerId: string | null): Promise<void> {
    this.handles?.add([
      ...getAppModeWatchers(
        this._configurationSettings,
        widgetProps,
        this.appProps,
        this.base,
        selectedLayerId as string,
        this.searchWidget,
        this.layerSwitcher,
        this
      )
    ]);
  }

  private _initPropWatchers(widgetProps: esriWidgetProps): void {
    this.handles?.add([
      ...getConfigWatchers(
        this._configurationSettings,
        widgetProps,
        this.commonMessages,
        this.appProps,
        this.currentApp,
        this.searchWidget,
        this.base,
        this.view,
        this.sketchHandles,
        this.onboardingContent,
        this.layerSwitcher,
        this.initialExtent
      )
    ]);
  }

  private _getURLParameter(name: string): string | null {
    const regexp = (new RegExp("[?|&]" + name + "=" + "([^&;]+?)(&|#|;|$)").exec(location.search) || [null, ""])[1];
    return decodeURIComponent((regexp as string).replace(/\+/g, "%20")) || null;
  }

  private _createSharedTheme(): void {
    const portal = this.base?.portal;
    let sharedTheme: any = null;
    if (portal?.portalProperties) {
      const theme = portal?.portalProperties?.sharedTheme;
      sharedTheme = {
        themes: {
          primary: {
            type: "primary",
            ...theme?.header
          },
          secondary: {
            type: "secondary",
            ...theme?.body
          },
          accent: {
            type: "accent",
            ...theme?.button
          }
        },
        logo: theme?.logo?.small,
        logoLink: theme?.logo?.link
      };
    }
    return sharedTheme;
  }

  private _cleanUpHandles(): void {
    if (!this._configurationSettings.withinConfigurationExperience) {
      this.handles?.removeAll();
      this.handles = null;
    }
  }

  async createTelemetry() {
    // add alert to container
    const { portal } = this.base;
    const appName = this.base.config?.telemetry?.name;
    const telemTS = new Telemetry({
      portal,
      config: this._configurationSettings,
      appName
    });
    when(
      () => telemTS?.instance,
      (telemInstance) => {
        if (telemInstance != null) {
          this._telemetry = telemInstance;
          this._telemetry?.logPageView(`${window.location.pathname}${window.location.search}`);
        }
      },
      { initial: true, once: true }
    );
  }
}

export default AttachmentViewerApp;
