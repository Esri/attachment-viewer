import { eachAlways } from "@arcgis/core/core/promiseUtils";
import { esriWidgetProps, IBranchingConditionalOutput } from "../interfaces/interfaces";
import MobileExpand from "../Components/MobileExpand";
import { ApplicationConfig } from "templates-common-library/interfaces/applicationBase";
import { createSearch } from "templates-common-library/functionality/search";
import PhotoCentric from "../Components/PhotoCentric";
import MapCentric from "../Components/MapCentric";

export async function addSearch(props: esriWidgetProps, messageBundle): Promise<any> {
  const { view, portal, config, propertyName } = props;
  const { search, searchConfiguration, searchOpenAtStart } = config;
  const modules = await eachAlways([
    import("@arcgis/core/widgets/Search"),
    import("@arcgis/core/layers/FeatureLayer"),
    import("@arcgis/core/widgets/Expand")
  ]);
  const [Search, FeatureLayer, Expand] = modules.map((module) => module.value);
  const node = view?.ui.find("searchExpand") as __esri.Expand;
  if (!Search || !FeatureLayer || !Expand) {
    return;
  }
  if (!search) {
    if (node) {
      view?.ui.remove(node);
    }
    return;
  }
  if (propertyName === "searchOpenAtStart" && node) {
    node.expanded = searchOpenAtStart;
  } else if (propertyName === "search" || (propertyName === "searchConfiguration" && node)) {
    if (node) {
      view?.ui.remove(node);
    }

    const content = view && portal ? createSearch(view, portal, searchConfiguration) : null;

    const constraints = view?.constraints as any;

    const geometry = constraints?.geometry;
    if (geometry) {
      content?.sources.forEach((source) => {
        source.filter = {
          geometry
        };
      });
    } else {
      content?.sources.forEach((source) => {
        source.filter;
      });
    }

    const searchExpand = new Expand.default({
      expanded: searchOpenAtStart,
      id: "searchExpand",
      content,
      mode: "floating",
      view,
      expandTooltip: messageBundle.expandLabels.search,
      collapseTooltip: messageBundle.expandLabels.search
    });
    view?.ui.add({
      component: searchExpand,
      position: "top-left",
      index: 0
    });

    return content;
  }
}

export async function addZoom(props: esriWidgetProps) {
  const { view, portal, config } = props;
  const { mapZoom } = config;

  const modules = await eachAlways([import("@arcgis/core/widgets/Zoom")]);

  const [Zoom] = modules.map((module) => module.value);

  const node = view?.ui.find("mobileExpand") as MobileExpand;
  const content = node.get("content") as __esri.Collection<__esri.Expand>;

  const zoomNode = content.find((contentItem) => {
    return contentItem.id === "zoomWidget";
  });

  if (!mapZoom) {
    if (zoomNode) {
      content.remove(zoomNode);
    }
  }

  if (mapZoom) {
    const zoomWidget = new Zoom.default({
      id: "zoomWidget",
      view,
      portal
    });
    node.content.splice(0, 0, zoomWidget);
  }
}

export async function addHome(props: esriWidgetProps) {
  const { view, portal, config } = props;
  const { home } = config;

  const modules = await eachAlways([import("@arcgis/core/widgets/Home")]);

  const [Home] = modules.map((module) => module.value);

  const node = view?.ui.find("mobileExpand") as MobileExpand;
  const content = node.get("content") as __esri.Collection<__esri.Expand>;
  const homeNode = content.find((contentItem) => {
    return contentItem.id === "homeWidget";
  });
  if (!home) {
    if (homeNode) {
      content.remove(homeNode);
    }
  }

  if (home) {
    const homeWidget = new Home.default({
      id: "homeWidget",
      view,
      portal
    });
    node.content.splice(1, 0, homeWidget);
  }
}

export async function addLegend(props: esriWidgetProps, messageBundle) {
  const { view, config } = props;
  const { legend } = config;

  const modules = await eachAlways([import("@arcgis/core/widgets/Legend"), import("@arcgis/core/widgets/Expand")]);

  const [Legend, Expand] = modules.map((module) => module.value);

  const node = view?.ui.find("mobileExpand") as MobileExpand;
  const content = node.get("content") as __esri.Collection<__esri.Expand>;
  const legendNode = content.find((contentItem) => {
    return contentItem.id === "legendWidget";
  });
  if (!legend) {
    if (legendNode) {
      content.remove(legendNode);
    }
  }

  if (legend) {
    const legendWidget = new Legend.default({
      view
    });

    const legendExpand = new Expand.default({
      view,
      content: legendWidget,
      mode: "floating",
      id: "legendWidget",
      group: "top-right",
      expandTooltip: messageBundle.expandLabels.legend,
      collapseTooltip: messageBundle.expandLabels.legend
    });

    node.content.splice(2, 0, legendExpand);
  }
}

export async function addLayerList(props: esriWidgetProps, messageBundle): Promise<any> {
  const { view, config } = props;
  const { layerList } = config;

  const modules = await eachAlways([import("@arcgis/core/widgets/LayerList"), import("@arcgis/core/widgets/Expand")]);

  const [LayerList, Expand] = modules.map((module) => module.value);

  const node = view?.ui.find("mobileExpand") as MobileExpand;
  const content = node.get("content") as __esri.Collection<__esri.Expand>;
  const layerListNode = content.find((contentItem) => {
    return contentItem.id === "layerlistWidget";
  });
  if (!layerList) {
    if (layerListNode) {
      content.remove(layerListNode);
    }
  }

  if (layerList) {
    const layerList = new LayerList.default({
      view
    }) as __esri.LayerList;

    const layerListExpand = new Expand.default({
      view,
      content: layerList,
      mode: "floating",
      id: "layerlistWidget",
      group: "top-right",
      expandTooltip: messageBundle.expandLabels.layerList,
      collapseTooltip: messageBundle.expandLabels.layerList
    });
    node.content.splice(3, 0, layerListExpand);
    return layerList;
  }
}

export async function addFullScreen(props: esriWidgetProps) {
  const { view, config } = props;
  const { fullScreen } = config;

  const modules = await eachAlways([import("@arcgis/core/widgets/Fullscreen")]);

  const [FullScreen] = modules.map((module) => module.value);

  const node = view?.ui.find("mobileExpand") as MobileExpand;
  const content = node.get("content") as __esri.Collection<__esri.Expand>;
  const fullScreenNode = content.find((contentItem) => {
    return contentItem.id === "fullScreenWidget";
  });
  if (!fullScreen) {
    if (fullScreenNode) {
      content.remove(fullScreenNode);
    }
  }

  if (fullScreen) {
    const fullScreen = new FullScreen.default({
      view,
      id: "fullScreenWidget"
    });

    node.content.splice(4, 0, fullScreen);
  }
}

export async function addLocateWidget(props: esriWidgetProps) {
  const { view, config } = props;
  const { locateWidget } = config;

  const modules = await eachAlways([import("@arcgis/core/widgets/Locate")]);

  const [Locate] = modules.map((module) => module.value);

  const node = view?.ui.find("mobileExpand") as MobileExpand;
  const content = node.get("content") as __esri.Collection<__esri.Expand>;
  const locateWidgetNode = content.find((contentItem) => {
    return contentItem.id === "locateWidget";
  });
  if (!locateWidget) {
    if (locateWidgetNode) {
      content.remove(locateWidgetNode);
    }
  }

  if (locateWidget) {
    const locateWidget = new Locate.default({
      view,
      id: "locateWidget"
    });

    node.content.splice(5, 0, locateWidget);
  }
}

export async function addSketch(props: esriWidgetProps, messageBundle) {
  const { view, config } = props;
  const { selectFeatures } = config;

  const modules = await eachAlways([
    import("@arcgis/core/widgets/Sketch"),
    import("@arcgis/core/widgets/Expand"),
    import("@arcgis/core/layers/GraphicsLayer")
  ]);

  const [Sketch, Expand, GraphicsLayer] = modules.map((module) => module.value);

  const node = view?.ui.find("mobileExpand") as MobileExpand;
  const content = node.get("content") as __esri.Collection<__esri.Expand>;
  const sketchWidget = content.find((contentItem) => {
    return contentItem.id === "sketchWidget";
  });
  if (!selectFeatures) {
    if (sketchWidget) {
      content.remove(sketchWidget);
    }
  }
  if (selectFeatures) {
    const existingGraphicsLayer = view?.map.findLayerById("av-sketchGraphicsLayer");

    let graphicsLayer;

    if (!existingGraphicsLayer) {
      graphicsLayer = new GraphicsLayer.default({
        id: "av-sketchGraphicsLayer"
      });

      view?.map.layers.unshift(graphicsLayer);
    } else {
      graphicsLayer = existingGraphicsLayer;
    }

    const sketch = new Sketch.default({
      layer: graphicsLayer,
      view: view,
      availableCreateTools: ["rectangle"],
      visibleElements: {
        settingsMenu: false,
        undoRedoMenu: false,
        selectionTools: {
          ["lasso-selection"]: false
        }
      },
      iconClass: "custom-sketch",
      creationMode: "update"
    });

    sketch.viewModel.updateOnGraphicClick = false;

    const sketchExpand = new Expand.default({
      view,
      content: sketch,
      mode: "floating",
      id: "sketchWidget",
      group: "top-right",
      expandTooltip: messageBundle.expandLabels.sketch,
      collapseTooltip: messageBundle.expandLabels.sketch
    });

    node.content.splice(5, 0, sketchExpand);
    return sketch;
  }
}

export async function toggleAppMode(
  props: esriWidgetProps,
  appProps: ApplicationConfig,
  photoCentricMobileMapExpanded: boolean
) {
  if (props.propertyName === "appLayout") {
    const appMode = appProps.appMode;
    if (appMode === "photo-centric") {
      (document.getElementById("app-container") as HTMLDivElement).classList.remove("esri-map-centric");
    } else {
      (document.getElementById("app-container") as HTMLDivElement).classList.remove("esri-photo-centric");
    }
  }

  const { config } = props;
  const { appLayout } = config;

  if (appLayout === "photo-centric") {
    if (document.body.clientWidth > 830) {
      appProps.view.padding = {
        top: 0,
        bottom: 380,
        left: 0,
        right: 0
      };
    }
    appProps.view.popup.close();
    return new PhotoCentric({
      ...appProps,
      photoCentricMobileMapExpanded
    });
  } else {
    appProps.view.padding = {
      top: 0,
      bottom: 0,
      left: 0,
      right: 0
    };
    return new MapCentric({
      ...appProps
    });
  }
}
