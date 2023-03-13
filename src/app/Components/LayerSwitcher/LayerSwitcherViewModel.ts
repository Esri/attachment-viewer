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

// esri.core
import Accessor from "@arcgis/core/core/Accessor";

// esri.core.accessorSupport
import { subclass, property } from "@arcgis/core/core/accessorSupport/decorators";

import { when, watch, on } from "@arcgis/core/core/reactiveUtils";
import Collection from "@arcgis/core/core/Collection";
import Handles from "@arcgis/core/core/Handles";
import MapCentricViewModel from "../MapCentric/MapCentricViewModel";

import { checkCustomTheme } from "templates-common-library/functionality/configUtils";

//----------------------------------
//
//  State
//
//----------------------------------
type State = "ready" | "loading" | "disabled";

@subclass("LayerSwitcherViewModel")
class LayerSwitcherViewModel extends Accessor {
  //----------------------------------
  //
  //  Private Variables
  //
  //----------------------------------
  private _handles: Handles | null = new Handles();

  //----------------------------------
  //
  //  state - readOnly
  //
  //----------------------------------
  @property({
    dependsOn: ["view.ready"],
    readOnly: true
  })
  get state(): State {
    const ready = this.get("view.ready");
    return ready ? "ready" : this.view ? "loading" : "disabled";
  }

  @property()
  applySharedTheme: boolean;

  @property()
  sharedTheme: any;

  @property()
  view: __esri.MapView | null = null;

  @property()
  selectedLayer: __esri.FeatureLayer | null = null;

  @property()
  selectedLayerId: string | null = null;

  @property()
  featureLayerCollection: __esri.Collection<__esri.FeatureLayer> = new Collection();

  @property()
  groupLayerData: __esri.Collection<{
    id: string;
    title: string;
  }> = new Collection();

  // mapCentricViewModel
  @property()
  mapCentricViewModel: MapCentricViewModel | null = null;

  @property()
  customTheme: any;

  initialize() {
    const viewReady = "view-ready";
    this._handles?.add(
      when(
        () => this.view?.ready,
        () => {
          this._handles?.remove(viewReady);
          const layerPromises: Promise<any>[] = [];
          this.view?.map?.allLayers?.forEach((layer: __esri.Layer) => {
            if (layer.type === "group") {
              const groupLayerDataItem = this.groupLayerData.find(
                (groupLayerDataItemToFind) => groupLayerDataItemToFind.id === layer.id
              );
              if (!groupLayerDataItem) {
                this.groupLayerData.add({ id: layer.id, title: layer.title });
              }
            }
            layerPromises.push(
              layer.load().then((loadedLayer) => {
                // DISABLE CLUSTERING
                if (loadedLayer && loadedLayer.get("featureReduction")) {
                  loadedLayer.set("featureReduction", null);
                }

                if (loadedLayer.type === "feature" && loadedLayer.get("capabilities.data.supportsAttachment")) {
                  return loadedLayer;
                }
              })
            );
          });
          this.view?.map?.allTables?.forEach((layer: __esri.Layer) => {
            if (layer.type === "group") {
              const groupLayerDataItem = this.groupLayerData.find(
                (groupLayerDataItemToFind) => groupLayerDataItemToFind.id === layer.id
              );
              if (!groupLayerDataItem) {
                this.groupLayerData.add({ id: layer.id, title: layer.title });
              }
            }
            layerPromises.push(
              layer.load().then((loadedLayer) => {
                // DISABLE CLUSTERING
                if (loadedLayer && loadedLayer.get("featureReduction")) {
                  loadedLayer.set("featureReduction", null);
                }

                if (loadedLayer.type === "feature" && loadedLayer.get("capabilities.data.supportsAttachment")) {
                  return loadedLayer;
                }
              })
            );
          });
          Promise.all(layerPromises).then((layerPromiseResults) => {
            const layerResults = layerPromiseResults.filter((layerResult) => layerResult);
            this.featureLayerCollection.addMany([...layerResults]);
            if (this.featureLayerCollection && this.featureLayerCollection.length > 0) {
              this._sortFeatureLayerCollection();
            }

            if (this._handles?.has("layer-visible-watcher")) {
              return;
            }

            const layerVisibleWatcher: __esri.WatchHandle[] = [];

            this.view?.map?.allLayers?.forEach((layer) => {
              layerVisibleWatcher.push(
                watch(
                  () => layer?.visible,
                  () => {
                    const visibleLayers = this.featureLayerCollection.filter((layer) => layer.visible);
                    const atLeastOneVisible = visibleLayers.length > 0;
                    if (this.selectedLayer === null && atLeastOneVisible) {
                      const layer = visibleLayers.getItemAt(0);
                      this.setLayer(layer);
                    }
                  }
                )
              );
            });

            this._handles?.add([...layerVisibleWatcher], "layer-visible-watcher");
          });
        },
        { initial: true }
      ),
      viewReady
    );

    on(
      () => this.featureLayerCollection,
      "after-add",
      () => {
        if (this.selectedLayerId) {
          const selectedLayer = this.featureLayerCollection.find((featureLayer) => {
            return featureLayer.id === this.selectedLayerId;
          });
          const featureLayer = selectedLayer ? selectedLayer : this.featureLayerCollection.getItemAt(0);
          this.setLayer(featureLayer);
        } else {
          this.setLayer(this.featureLayerCollection.getItemAt(0));
        }
      }
    );

    this._handles?.add([
      watch(
        () => this.selectedLayer?.visible,
        () => {
          const visibleLayers = this.featureLayerCollection.filter((layer) => layer.visible);
          const firstItem = visibleLayers.getItemAt(0);
          if (!this?.selectedLayer?.visible) {
            const layerToUse = firstItem ? firstItem : null;
            this.setLayer(layerToUse as __esri.FeatureLayer);
          }
        }
      )
    ]);
  }

  destroy() {
    this._handles?.removeAll();
    this._handles?.destroy();
    this._handles = null;
  }

  // setLayer
  async setLayer(featureLayer: __esri.FeatureLayer): Promise<void> {
    this.set("selectedLayer", featureLayer);
  }

  // _sortFeatureLayerCollection
  private _sortFeatureLayerCollection(): void {
    const { featureLayerCollection } = this;
    const layers = this.get("view.map.layers") as __esri.Collection<__esri.Layer>;
    if (!layers) {
      return;
    }
    featureLayerCollection.sort((a, b) => {
      const aIndex = layers.indexOf(a);
      const bIndex = layers.indexOf(b);
      if (aIndex > bIndex) {
        return -1;
      }

      if (aIndex < bIndex) {
        return 1;
      }

      return 0;
    });
  }

  getThemeButtonColor(
    backgroundType: "primary" | "secondary" | "accent",
    colorType: "primary" | "secondary" | "accent"
  ) {
    const { customTheme, applySharedTheme, sharedTheme } = this;
    const useCustomTheme = checkCustomTheme(false, customTheme);

    const noStyles = {
      backgroundColor: "",
      color: "",
      border: ""
    };

    if ((applySharedTheme && !customTheme) || customTheme?.preset === "shared") {
      return {
        backgroundColor: sharedTheme?.themes?.[backgroundType]?.background,
        color: sharedTheme?.themes?.[colorType]?.text,
        border: `1px solid ${customTheme?.themes?.[colorType]?.text}`
      };
    } else if (useCustomTheme) {
      return (applySharedTheme && !customTheme) || customTheme?.preset === "shared"
        ? noStyles
        : {
            backgroundColor: customTheme?.themes?.[backgroundType]?.background,
            color: customTheme?.themes?.[colorType].text,
            border: `1px solid ${customTheme?.themes?.[colorType]?.text}`
          };
    } else {
      return noStyles;
    }
  }

  getTheme(backgroundType: "primary" | "secondary" | "accent", colorType: "primary" | "secondary" | "accent") {
    const { customTheme, applySharedTheme, sharedTheme } = this;
    const useCustomTheme = checkCustomTheme(false, customTheme);
    const noStyles = {
      backgroundColor: "",
      color: ""
    };
    if ((applySharedTheme && !customTheme) || customTheme?.preset === "shared") {
      return {
        backgroundColor: sharedTheme?.themes?.[backgroundType]?.background,
        color: sharedTheme?.themes?.[colorType]?.text,
        border: `1px solid ${customTheme?.themes?.[colorType]?.text}`
      };
    } else if (useCustomTheme) {
      return (applySharedTheme && !customTheme) || customTheme?.preset === "shared"
        ? noStyles
        : {
            backgroundColor: customTheme?.themes?.[backgroundType]?.background,
            color: customTheme?.themes[colorType]?.text
          };
    } else {
      return noStyles;
    }
  }
}

export default LayerSwitcherViewModel;
