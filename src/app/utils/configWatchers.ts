// @arcgis/core/core
import Handles from "@arcgis/core/core/Handles";
import { watch, on } from "@arcgis/core/core/reactiveUtils";

// @arcgis/core/geometry
import Extent from "@arcgis/core/geometry/Extent";
import { fromJSON } from "@arcgis/core/geometry/support/jsonUtils";

// @arcgis/core/portal
import PortalItem from "@arcgis/core/portal/PortalItem";

// @arcgis/core/views
import MapView from "@arcgis/core/views/MapView";

// @arcgis/core/widgets
import Search from "@arcgis/core/widgets/Search";

// templates-common-library
import { ApplicationConfig, esriWidgetProps } from "templates-common-library/interfaces/applicationBase";
import ApplicationBase from "templates-common-library/baseClasses/ApplicationBase";
import { getItemTitle } from "templates-common-library/baseClasses/support/itemUtils";
import { setPageTitle } from "templates-common-library/baseClasses/support/domHelper";

// ConfigurationSettings
import ConfigurationSettings from "../ConfigurationSettings/ConfigurationSettings";

// Components
import PhotoCentric from "../Components/PhotoCentric";
import MapCentric from "../Components/MapCentric";
import LayerSwitcher from "../Components/LayerSwitcher";
import MobileExpand from "../Components/MobileExpand";
import OnboardingContent from "../Components/OnboardingContent";

// utils
import { handleAppFontStyles } from "./font";
import {
  addSearch,
  addHome,
  addZoom,
  addLegend,
  addFullScreen,
  addLocateWidget,
  addSketch,
  addLayerList,
  toggleAppMode
} from "./widgetUtils";

// interfaces
import { IBranchingConditionalOutput } from "../interfaces/interfaces";

// T9N
import Common_t9n from "../../t9n/Common/common.json";

export function getAppModeWatchers(
  configurationSettings: ConfigurationSettings,
  widgetProps: esriWidgetProps,
  appProps,
  base: ApplicationBase,
  selectedLayerId: string,
  searchWidget: Search,
  layerSwitcher: LayerSwitcher,
  app
): __esri.WatchHandle[] {
  return [
    watch(
      () => configurationSettings?.appLayout,
      () => {
        handleAppLayout(configurationSettings);
        widgetProps.propertyName = "appLayout";
        updateApp(
          widgetProps,
          base.config.photoCentricMobileMapExpanded,
          selectedLayerId,
          configurationSettings,
          appProps,
          searchWidget,
          app
        );
      },
      { initial: true }
    ),
    watch(
      () => configurationSettings?.order,
      () => {
        widgetProps.propertyName = "order";
        updateApp(
          widgetProps,
          base.config.photoCentricMobileMapExpanded,
          selectedLayerId,
          configurationSettings,
          appProps,
          searchWidget,
          app
        );
      },
      { initial: true }
    ),
    watch(
      () => configurationSettings?.attachmentLayers,
      () => {
        widgetProps.propertyName = "attachmentLayers";
        updateApp(
          widgetProps,
          base.config.photoCentricMobileMapExpanded,
          selectedLayerId,
          configurationSettings,
          appProps,
          searchWidget,
          app
        );
      },
      { initial: true }
    ),
    watch(
      () => configurationSettings?.onlyDisplayFeaturesWithAttachments,
      () => {
        widgetProps.propertyName = "onlyDisplayFeaturesWithAttachments";
        updateApp(
          widgetProps,
          base.config.photoCentricMobileMapExpanded,
          selectedLayerId,
          configurationSettings,
          appProps,
          searchWidget,
          app
        );
      },
      { initial: true }
    )
  ];
}

export function getConfigWatchers(
  configurationSetings: ConfigurationSettings,
  widgetProps: esriWidgetProps,
  commonMessages: typeof Common_t9n,
  appProps: any,
  currentApp: PhotoCentric | MapCentric,
  searchWidget: Search,
  base: ApplicationBase,
  view: MapView,
  sketchHandles: Handles,
  onboardingContent: OnboardingContent,
  layerSwitcher: LayerSwitcher,
  initialExtent: Extent
): __esri.WatchHandle[] {
  return [
    watch(
      () => configurationSetings?.search,
      async () => {
        widgetProps.propertyName = "search";
        const search = await addSearch(widgetProps, commonMessages);
        if (search) {
          // searchWidget = search; // TODO
          if (currentApp) {
            currentApp.searchWidget = search;
          }
        }
      },
      { initial: true }
    ),
    watch(
      () => configurationSetings?.searchConfiguration,
      async () => {
        widgetProps.propertyName = "searchConfiguration";
        const search = await addSearch(widgetProps, commonMessages);
        if (search) {
          searchWidget = search;
          if (currentApp) {
            currentApp.searchWidget = search;
          }
        }
      },
      { initial: true }
    ),
    watch(
      () => configurationSetings?.searchOpenAtStart,
      async () => {
        widgetProps.propertyName = "searchOpenAtStart";
        const search = await addSearch(widgetProps, commonMessages);
        if (search) {
          searchWidget = search;
          if (currentApp) {
            currentApp.searchWidget = search;
          }
        }
      },
      { initial: true }
    ),
    watch(
      () => configurationSetings?.mapToolsExpanded,
      () => {
        widgetProps.propertyName = "mapToolsExpanded";
        const mobileExpand = view.ui.find("mobileExpand") as MobileExpand;
        if (mobileExpand) {
          mobileExpand.expanded = configurationSetings.mapToolsExpanded;
        }
      },
      { initial: true }
    ),
    watch(
      () => configurationSetings?.home,
      () => {
        widgetProps.propertyName = "home";
        addHome(widgetProps);
      },
      { initial: true }
    ),
    watch(
      () => configurationSetings?.mapZoom,
      () => {
        widgetProps.propertyName = "mapZoom";
        addZoom(widgetProps);
      },
      { initial: true }
    ),
    watch(
      () => configurationSetings?.legend,
      () => {
        widgetProps.propertyName = "legend";
        addLegend(widgetProps, commonMessages);
      },
      { initial: true }
    ),
    watch(
      () => configurationSetings?.layerList,
      async () => {
        const layerListWatcher = "layer-list-watcher";
        if (sketchHandles.has(layerListWatcher)) {
          sketchHandles.remove(layerListWatcher);
        }
        widgetProps.propertyName = "layerList";
        const layerList = await addLayerList(widgetProps, commonMessages);

        if (layerList) {
          sketchHandles.add(
            on(
              () => layerList?.operationalItems,
              "change",
              () => {
                const sketchGraphicsLayer = layerList.operationalItems.find(
                  (operationalItem) => operationalItem.layer.id === "av-sketchGraphicsLayer"
                );
                if (sketchGraphicsLayer) layerList.operationalItems.remove(sketchGraphicsLayer);
              }
            ),
            layerListWatcher
          );
        }
      },
      { initial: true }
    ),
    watch(
      () => configurationSetings?.fullScreen,
      () => {
        widgetProps.propertyName = "fullScreen";
        addFullScreen(widgetProps);
      },
      { initial: true }
    ),
    watch(
      () => configurationSetings?.locateWidget,
      () => {
        widgetProps.propertyName = "locateWidget";
        addLocateWidget(widgetProps);
      },
      { initial: true }
    ),
    watch(
      () => configurationSetings?.selectFeatures,
      async () => {
        widgetProps.propertyName = "selectFeatures";
        const sketch = await addSketch(widgetProps, commonMessages);
        if (configurationSetings.selectFeatures) {
          appProps.selectFeaturesEnabled = configurationSetings.selectFeatures;
          appProps.sketchWidget = sketch;
          appProps.graphicsLayer = sketch.layer;
          currentApp.selectFeaturesEnabled = configurationSetings.selectFeatures;
          currentApp.graphicsLayer = sketch.layer;
          currentApp.sketchWidget = sketch;
        } else {
          if (appProps.graphicsLayer) {
            appProps.graphicsLayer.graphics.removeAll();
          }
          appProps.selectFeaturesEnabled = configurationSetings.selectFeatures;
          appProps?.sketchWidget?.cancel();
          appProps.sketchWidget = null;
          appProps.graphicsLayer = null;
          currentApp.selectFeaturesEnabled = configurationSetings.selectFeatures;
          currentApp.graphicsLayer = null;
          currentApp?.sketchWidget?.cancel();
          currentApp.sketchWidget = null;
          view.layerViews.forEach((layerView) => {
            if (layerView.layer.type === "feature") {
              const featureLayerView = layerView as __esri.FeatureLayerView;
              featureLayerView.featureEffect = null as any;
            }
          });
        }
      },
      { initial: true }
    ),
    watch(
      () => configurationSetings?.share,
      () => {
        widgetProps.propertyName = "share";
        appProps.socialSharingEnabled = configurationSetings.share;
        currentApp.socialSharingEnabled = configurationSetings.share;
      },
      { initial: true }
    ),
    watch(
      () => configurationSetings?.address,
      () => {
        widgetProps.propertyName = "address";
        appProps.addressEnabled = configurationSetings.address;
        currentApp.addressEnabled = configurationSetings.address;
      },
      { initial: true }
    ),
    watch(
      () => configurationSetings?.mapA11yDesc,
      () => {
        widgetProps.propertyName = "mapA11yDesc";
        appProps.mapA11yDesc = configurationSetings.mapA11yDesc;
        currentApp.mapA11yDesc = configurationSetings.mapA11yDesc;
      },
      { initial: true }
    ),
    watch(
      () => configurationSetings?.download,
      () => {
        widgetProps.propertyName = "download";
        appProps.downloadEnabled = configurationSetings.download;
        currentApp.downloadEnabled = configurationSetings.download;
      },
      { initial: true }
    ),
    watch(
      () => configurationSetings?.onboarding,
      () => {
        widgetProps.propertyName = "onboarding";
        appProps.onboardingIsEnabled = configurationSetings.onboarding;
        currentApp.onboardingIsEnabled = configurationSetings.onboarding;
      },
      { initial: true }
    ),
    watch(
      () => configurationSetings?.imageDirection,
      () => {
        widgetProps.propertyName = "imageDirection";
        appProps.imageDirectionEnabled = configurationSetings.imageDirection;
        currentApp.imageDirectionEnabled = configurationSetings.imageDirection;
      },
      { initial: true }
    ),
    watch(
      () => configurationSetings?.customOnboarding,
      () => {
        widgetProps.propertyName = "customOnboarding";
        appProps.customOnboarding = configurationSetings.customOnboarding;
        appProps.customOnboardingHTML = configurationSetings.customOnboardingHTML;
        onboardingContent.config.customOnboarding = configurationSetings.customOnboarding;
        onboardingContent.config.customOnboardingHTML = configurationSetings.customOnboardingHTML;
      },
      { initial: true }
    ),
    watch(
      () => configurationSetings?.customOnboardingHTML,
      () => {
        widgetProps.propertyName = "customOnboardingHTML";
        appProps.customOnboarding = configurationSetings.customOnboarding;
        appProps.customOnboardingHTML = configurationSetings.customOnboardingHTML;
        onboardingContent.config.customOnboarding = configurationSetings.customOnboarding;
        onboardingContent.config.customOnboardingHTML = configurationSetings.customOnboardingHTML;
      },
      { initial: true }
    ),
    watch(
      () => configurationSetings?.customCSS,
      () => {
        widgetProps.propertyName = "customCSS";
        appProps.customCSS = configurationSetings.customCSS;
        handleCustomCSS(configurationSetings);
      },
      { initial: true }
    ),
    watch(
      () => configurationSetings?.onboardingButtonText,
      () => {
        widgetProps.propertyName = "onboardingButtonText";
        appProps.onboardingButtonText = configurationSetings.onboardingButtonText;
        currentApp.onboardingButtonText = configurationSetings.onboardingButtonText;
      },
      { initial: true }
    ),
    watch(
      () => configurationSetings?.zoomLevel,
      () => {
        widgetProps.propertyName = "zoomLevel";
        appProps.zoomLevel = configurationSetings.zoomLevel;
        currentApp.zoomLevel = configurationSetings.zoomLevel;
      },
      {
        initial: true
      }
    ),
    watch(
      () => configurationSetings?.onboardingImage,
      () => {
        widgetProps.propertyName = "onboardingImage";
        appProps.onboardingImage = configurationSetings.onboardingImage;
        const photoCentricApp = currentApp as PhotoCentric;
        photoCentricApp.onboardingImage = configurationSetings.onboardingImage;
      },
      { initial: true }
    ),
    watch(
      () => configurationSetings?.mapCentricTooltip,
      () => {
        widgetProps.propertyName = "mapCentricTooltip";
        appProps.mapCentricTooltipEnabled = configurationSetings.mapCentricTooltip;
        const mapCentricApp = currentApp as MapCentric;
        mapCentricApp.mapCentricTooltipEnabled = configurationSetings.mapCentricTooltip;
      },
      {
        initial: true
      }
    ),
    watch(
      () => configurationSetings?.showOnboardingOnStart,
      () => {
        widgetProps.propertyName = "showOnboardingOnStart";
        appProps.showOnboardingOnStart = configurationSetings.showOnboardingOnStart;
        currentApp.showOnboardingOnStart = configurationSetings.showOnboardingOnStart;
      },
      {
        initial: true
      }
    ),
    watch(
      () => configurationSetings?.imagePanZoom,
      () => {
        const isIE11 = navigator.userAgent.indexOf("MSIE") !== -1 || navigator.appVersion.indexOf("Trident/") > -1;

        const imagePanZoomEnabledValue = isIE11 ? false : configurationSetings.imagePanZoom;

        widgetProps.propertyName = "imagePanZoom";
        appProps.imagePanZoomEnabled = imagePanZoomEnabledValue;
        currentApp.imagePanZoomEnabled = imagePanZoomEnabledValue;
      },
      {
        initial: true
      }
    ),
    watch(
      () => configurationSetings?.applySharedTheme,
      () => {
        widgetProps.propertyName = "applySharedTheme";
        appProps.applySharedTheme = configurationSetings.applySharedTheme;
        currentApp.applySharedTheme = configurationSetings.applySharedTheme;
      },
      {
        initial: true
      }
    ),
    watch(
      () => configurationSetings?.title,
      () => {
        if (!configurationSetings.title) {
          configurationSetings.title = getItemTitle(base?.results?.applicationItem?.value as PortalItem);
        }
        widgetProps.propertyName = "title";
        appProps.title = configurationSetings.title;
        currentApp.title = configurationSetings.title;
      },
      {
        initial: true
      }
    ),
    watch(
      () => configurationSetings?.thumbnailFormat,
      () => {
        widgetProps.propertyName = "thumbnailFormat";
        if (configurationSetings.appLayout === "map-centric") {
          (currentApp as MapCentric).thumbnailFormat = configurationSetings.thumbnailFormat;
        }
      },
      {
        initial: true
      }
    ),
    watch(
      () => configurationSetings?.thumbnailHeight,
      () => {
        widgetProps.propertyName = "thumbnailHeight";
        appProps.thumbnailHeight = configurationSetings.thumbnailHeight;
        if (configurationSetings.appLayout === "map-centric") {
          (currentApp as MapCentric).thumbnailHeight = configurationSetings.thumbnailHeight;
        }
      },
      {
        initial: true
      }
    ),
    watch(
      () => configurationSetings?.extentSelector,
      extentSelectorCallback(configurationSetings, view, searchWidget, initialExtent),
      { initial: true }
    ),
    watch(
      () => configurationSetings?.extentSelectorConfig,
      extentSelectorCallback(configurationSetings, view, searchWidget, initialExtent),
      { initial: true }
    ),
    watch(
      () => configurationSetings?.theme,
      () => {
        const appContainer = document.getElementById("app-container");
        const darkThemeClass = "esri-attachment-viewer--dark";

        const style = document.getElementById("esri-stylesheet") as any;
        style.href =
          style.href.indexOf("light") !== -1
            ? style.href.replace(/light/g, configurationSetings.theme)
            : style.href.replace(/dark/g, configurationSetings.theme);
        appProps.theme = configurationSetings.theme;
        currentApp.theme = configurationSetings.theme;
        if (configurationSetings.theme === "dark") {
          document.body.classList.remove("calcite-mode-light");
          document.body.classList.add("calcite-mode-dark");
          appContainer?.classList.add(darkThemeClass);
        } else {
          document.body.classList.remove("calcite-mode-dark");
          document.body.classList.add("calcite-mode-light");
          appContainer?.classList.remove(darkThemeClass);
        }
      },
      { initial: true }
    ),
    watch(
      () => configurationSetings?.customTheme,
      () => {
        const { customTheme } = configurationSetings;
        handleAppFontStyles(customTheme);
        appProps.customTheme = customTheme;
        currentApp.customTheme = customTheme;
        layerSwitcher.customTheme = customTheme;
      },
      { initial: true }
    ),
    watch(
      () => configurationSetings?.applyEffectToNonActiveLayers,
      () => {
        widgetProps.propertyName = "applyEffectToNonActiveLayers";
        appProps.applyEffectToNonActiveLayers = configurationSetings.applyEffectToNonActiveLayers;
        currentApp.applyEffectToNonActiveLayers = configurationSetings.applyEffectToNonActiveLayers;
      },
      { initial: true }
    ),
    watch(
      () => configurationSetings?.nonActiveLayerEffects,
      () => {
        widgetProps.propertyName = "nonActiveLayerEffects";
        appProps.nonActiveLayerEffects = configurationSetings.nonActiveLayerEffects;
        currentApp.nonActiveLayerEffects = configurationSetings.nonActiveLayerEffects;
      },
      { initial: true }
    ),
    watch(
      () => configurationSetings?.attributeEditing,
      () => {
        widgetProps.propertyName = "attributeEditing";
        appProps.attributeEditing = configurationSetings.attributeEditing;
        currentApp.attributeEditing = configurationSetings.attributeEditing;
      },
      {
        initial: true
      }
    ),
    watch(
      () => configurationSetings?.enableHeaderBackground,
      () => {
        const { enableHeaderBackground, headerBackground, enableHeaderColor, headerColor } = configurationSetings;
        currentApp.enableHeaderBackground = enableHeaderBackground;
        currentApp.headerBackground = headerBackground;
        currentApp.enableHeaderColor = enableHeaderColor;
        currentApp.headerColor = headerColor;
      },
      {
        initial: true
      }
    ),
    watch(
      () => configurationSetings?.enableHeaderColor,
      () => {
        const { enableHeaderBackground, headerBackground, enableHeaderColor, headerColor } = configurationSetings;
        currentApp.enableHeaderBackground = enableHeaderBackground;
        currentApp.headerBackground = headerBackground;
        currentApp.enableHeaderColor = enableHeaderColor;
        currentApp.headerColor = headerColor;
      },
      { initial: true }
    ),
    watch(
      () => configurationSetings?.headerBackground,
      () => {
        const { enableHeaderBackground, headerBackground, enableHeaderColor, headerColor } = configurationSetings;
        currentApp.enableHeaderBackground = enableHeaderBackground;
        currentApp.headerBackground = headerBackground;
        currentApp.enableHeaderColor = enableHeaderColor;
        currentApp.headerColor = headerColor;
      },
      { initial: true }
    ),
    watch(
      () => configurationSetings?.headerColor,
      () => {
        const { enableHeaderBackground, headerBackground, enableHeaderColor, headerColor } = configurationSetings;
        currentApp.enableHeaderBackground = enableHeaderBackground;
        currentApp.headerBackground = headerBackground;
        currentApp.enableHeaderColor = enableHeaderColor;
        currentApp.headerColor = headerColor;
      },
      { initial: true }
    ),
    watch(
      () => configurationSetings?.hideAttributePanel,
      () => {
        currentApp.hideAttributePanel = configurationSetings.hideAttributePanel;
      }
    )
  ];
}

function handleCustomCSS(configurationSettings: ConfigurationSettings): void {
  const customCSSStyleSheet = document.getElementById("customCSS");

  if (customCSSStyleSheet) {
    customCSSStyleSheet.remove();
  }

  const styles = document.createElement("style");
  styles.id = "customCSS";
  styles.type = "text/css";
  const styleTextNode = document.createTextNode(configurationSettings.customCSS);
  styles.appendChild(styleTextNode);
  document.head.appendChild(styles);
}

function extentSelectorCallback(
  configurationSettings: ConfigurationSettings,
  view: MapView,
  searchWidget: Search,
  initialExtent: Extent
): () => void {
  return () => {
    if (configurationSettings?.extentSelector && configurationSettings.extentSelectorConfig) {
      const constraints = configurationSettings?.extentSelectorConfig?.constraints || null;
      const geometry = constraints?.geometry;
      if (geometry) {
        const extent = fromJSON(geometry);
        if (extent && (extent?.type === "extent" || extent?.type === "polygon")) {
          constraints.geometry = extent;

          if (searchWidget) {
            searchWidget.allSources.forEach((source) => {
              source.filter = {
                geometry: extent
              };
            });
          }

          const url = new URL(window.location.href);
          const params = new URLSearchParams(url.search);
          const center = params.get("center");
          const level = params.get("level");

          if (!configurationSettings.withinConfigurationExperience && center && level) {
            return;
          }
          view.goTo(extent, { animate: false }).catch(() => {});
        } else {
          if (searchWidget) {
            searchWidget.allSources.forEach((source) => {
              source.filter = null as any;
            });
          }

          constraints.geometry = null as any;
        }
      }
      constraints.minScale = constraints.minScale && !isNaN(constraints.minScale) ? +constraints.minScale : undefined;
      constraints.maxScale = constraints.maxScale && !isNaN(constraints.maxScale) ? +constraints.maxScale : undefined;
      view.constraints = constraints;
      setMapViewRotation(view, configurationSettings);
    } else {
      const constraints = view.constraints as any;
      view.rotation = 0;
      constraints.geometry = null;
      constraints.minZoom = -1;
      constraints.maxZoom = -1;
      constraints.minScale = 0;
      constraints.maxScale = 0;

      if (searchWidget) {
        searchWidget.allSources.forEach((source) => {
          source.filter = null as any;
        });
      }

      const url = new URL(window.location.href);
      const params = new URLSearchParams(url.search);
      const center = params.get("center");
      const level = params.get("level");

      if (!configurationSettings.withinConfigurationExperience && center && level) {
        return;
      }

      if (initialExtent) {
        view.goTo(initialExtent, { animate: false });
      }
    }
  };
}

function setMapViewRotation(view: MapView, configurationSettings: ConfigurationSettings): void {
  const mapRotation = configurationSettings?.extentSelectorConfig?.mapRotation;
  if (view && view.constraints && !view.constraints.rotationEnabled) {
    // if rotation is disabled
    view.constraints.rotationEnabled = true; // set rotation to enabled
    if (mapRotation || mapRotation === 0) {
      view.rotation = mapRotation;
    }
    view.constraints.rotationEnabled = false; // set rotation back to disabled
  } else {
    if (mapRotation || mapRotation === 0) {
      view.rotation = mapRotation;
    }
  }
}

export async function updateApp(
  widgetProps: esriWidgetProps,
  photoCentricMobileMapExpanded: boolean,
  selectedLayerId: string | null,
  configurationSettings: ConfigurationSettings,
  appProps: any,
  searchWidget: Search,
  appClass
) {
  const { propertyName } = widgetProps;
  document.body.removeChild(document.getElementById("app-container") as HTMLDivElement);
  const appContainer = document.createElement("div");
  appContainer.id = "app-container";

  const theme = configurationSettings.theme;
  if (theme === "dark") {
    appContainer?.classList.add("esri-attachment-viewer--dark");
  }

  document.body.appendChild(appContainer);
  appProps.container = appContainer;
  const mappedPropName = mapPropName(propertyName as string);
  appProps[mappedPropName as string] = configurationSettings[propertyName as string];
  if (appClass?.currentApp?.hasOwnProperty(propertyName as string)) {
    appClass.currentApp[propertyName as string] = configurationSettings[propertyName as string];
  }
  handleHighlightedFeatures(appProps);
  const app = await toggleAppMode(widgetProps, appProps, photoCentricMobileMapExpanded);
  appClass.currentApp?.destroy();
  appClass.currentApp = app;
  const container = appClass?.currentApp?.container as HTMLElement;
  if (document.body.contains(container)) {
    container.remove();
  }
  document.body.appendChild(appClass?.currentApp?.container as HTMLElement);
  if (searchWidget) {
    searchWidget.clear();
    if (appClass?.currentApp) {
      appClass.currentApp.searchWidget = searchWidget;
    }
  }
  appClass.layerSwitcher = handleLayerSwitcher(
    appProps,
    selectedLayerId as string,
    appClass.currentApp,
    configurationSettings
  );
  const { layerSwitcher } = appClass;
  layerSwitcher.appMode = configurationSettings.appLayout;
  appClass.currentApp.layerSwitcher = layerSwitcher;

  const portalItem = (widgetProps.view?.map as __esri.WebMap)?.portalItem;

  if (!configurationSettings.mapA11yDesc && portalItem && portalItem.loaded) {
    const mapA11yDesc = portalItem?.snippet || portalItem?.description;
    appProps.mapA11yDesc = mapA11yDesc;
    appClass.currentApp.mapA11yDesc = mapA11yDesc;
  }
  return app;
}

export function handleAppLayout(configurationSettings): void {
  const appLayoutOutput = configurationSettings.appLayout as unknown;
  let appLayoutVal;
  if (appLayoutOutput?.hasOwnProperty("branchValue")) {
    appLayoutVal = (appLayoutOutput as IBranchingConditionalOutput).branchValue;
  } else {
    appLayoutVal = configurationSettings.appLayout;
  }
  configurationSettings.appLayout = appLayoutVal;
}

function mapPropName(propName: string): string | undefined {
  switch (propName) {
    case "appLayout":
      return "appMode";
    case "order":
      return "order";
    case "attachmentLayers":
      return "attachmentLayers";
    case "onlyDisplayFeaturesWithAttachments":
      return "onlyDisplayFeaturesWithAttachments";
    default:
      return;
  }
}

function handleHighlightedFeatures(appProps: any): void {
  if (appProps.highlightedFeature) {
    appProps.highlightedFeature.remove();
  }
  appProps.highlightedFeature = null;
}

function handleLayerSwitcher(
  appConfig: ApplicationConfig,
  selectedLayerId: string,
  currentApp: PhotoCentric | MapCentric,
  configurationSettings: ConfigurationSettings
): LayerSwitcher {
  const { socialSharingEnabled, view, applySharedTheme } = appConfig;
  const layerId = socialSharingEnabled ? selectedLayerId : null;
  return new LayerSwitcher({
    container: document.createElement("div"),
    view,
    appMode: currentApp.appMode,
    selectedLayerId: layerId,
    applySharedTheme,
    sharedTheme: appConfig.sharedTheme,
    customTheme: configurationSettings.customTheme,
    mapCentricViewModel: currentApp.appMode === "map-centric" ? currentApp.viewModel : null
  });
}

export function getTitleWatcher(configurationSettings: ConfigurationSettings): __esri.WatchHandle {
  return watch(
    () => configurationSettings?.title,
    () => setPageTitle(configurationSettings?.title),
    { initial: true }
  );
}

export function getThemeWatcher(
  configurationSettings: ConfigurationSettings,
  mobileExpand: MobileExpand
): __esri.WatchHandle {
  return watch(
    () => configurationSettings?.theme,
    () => {
      mobileExpand.theme = configurationSettings.theme;
    }
  );
}
