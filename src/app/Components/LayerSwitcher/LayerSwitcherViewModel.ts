/// <amd-dependency path="esri/core/tsSupport/declareExtendsHelper" name="__extends" />
/// <amd-dependency path="esri/core/tsSupport/decorateHelper" name="__decorate" />

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

// esri.core
import Accessor = require("esri/core/Accessor");

// esri.core.accessorSupport
import {
  subclass,
  declared,
  property
} from "esri/core/accessorSupport/decorators";

import watchUtils = require("esri/core/watchUtils");
import Collection = require("esri/core/Collection");
import Handles = require("esri/core/Handles");
import MapCentricViewModel = require("../MapCentric/MapCentricViewModel");

//----------------------------------
//
//  State
//
//----------------------------------
type State = "ready" | "loading" | "disabled";

@subclass("LayerSwitcherViewModel")
class LayerSwitcherViewModel extends declared(Accessor) {
  //----------------------------------
  //
  //  Private Variables
  //
  //----------------------------------
  private _handles: Handles = new Handles();

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
  view: __esri.MapView = null;

  @property()
  selectedLayer: __esri.FeatureLayer = null;

  @property()
  selectedLayerId: string = null;

  @property()
  featureLayerCollection: __esri.Collection<
    __esri.FeatureLayer
  > = new Collection();

  // mapCentricViewModel
  @property()
  mapCentricViewModel: MapCentricViewModel = null;

  initialize() {
    const viewReady = "view-ready";
    this._handles.add(
      watchUtils.when(this, "view.ready", () => {
        this._handles.remove(viewReady);
        const layerPromises = [];
        this.view.map.layers.forEach((layer: __esri.Layer) => {
          layerPromises.push(
            layer.load().then(loadedLayer => {
              if (
                loadedLayer.type === "feature" &&
                loadedLayer.get("capabilities.data.supportsAttachment") &&
                loadedLayer.visible
              ) {
                return loadedLayer;
              } else {
                loadedLayer.popupEnabled = false;
              }
            })
          );
        });
        Promise.all(layerPromises).then(layerPromiseResults => {
          const layerResults = layerPromiseResults.filter(
            layerResult => layerResult
          );
          this.featureLayerCollection.addMany([...layerResults]);
          if (
            this.featureLayerCollection &&
            this.featureLayerCollection.length > 0
          ) {
            this._sortFeatureLayerCollection();
          }
        });
      }),
      viewReady
    );

    watchUtils.on(this, "featureLayerCollection", "after-add", () => {
      if (this.selectedLayerId) {
        const selectedLayer = this.featureLayerCollection.find(featureLayer => {
          return featureLayer.id === this.selectedLayerId;
        });
        const featureLayer = selectedLayer
          ? selectedLayer
          : this.featureLayerCollection.getItemAt(0);
        this.setLayer(featureLayer);
      } else {
        this.setLayer(this.featureLayerCollection.getItemAt(0));
      }
    });
  }

  destroy() {
    this._handles.removeAll();
    this._handles.destroy();
    this._handles = null;
  }

  // setLayer
  setLayer(featureLayer: __esri.FeatureLayer): void {
    this.set("selectedLayer", featureLayer);
  }

  // _sortFeatureLayerCollection
  private _sortFeatureLayerCollection(): void {
    const { featureLayerCollection } = this;
    const layers = this.get("view.map.layers") as __esri.Collection<
      __esri.Layer
    >;
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
}

export = LayerSwitcherViewModel;
