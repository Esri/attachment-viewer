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
define(["require", "exports", "tslib", "esri/core/Accessor", "esri/core/accessorSupport/decorators", "esri/core/watchUtils", "esri/core/Collection", "esri/core/Handles"], function (require, exports, tslib_1, Accessor, decorators_1, watchUtils, Collection, Handles) {
    "use strict";
    var LayerSwitcherViewModel = /** @class */ (function (_super) {
        tslib_1.__extends(LayerSwitcherViewModel, _super);
        function LayerSwitcherViewModel() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            //----------------------------------
            //
            //  Private Variables
            //
            //----------------------------------
            _this._handles = new Handles();
            _this.view = null;
            _this.selectedLayer = null;
            _this.selectedLayerId = null;
            _this.featureLayerCollection = new Collection();
            // mapCentricViewModel
            _this.mapCentricViewModel = null;
            return _this;
        }
        Object.defineProperty(LayerSwitcherViewModel.prototype, "state", {
            //----------------------------------
            //
            //  state - readOnly
            //
            //----------------------------------
            get: function () {
                var ready = this.get("view.ready");
                return ready ? "ready" : this.view ? "loading" : "disabled";
            },
            enumerable: false,
            configurable: true
        });
        LayerSwitcherViewModel.prototype.initialize = function () {
            var _this = this;
            var viewReady = "view-ready";
            this._handles.add(watchUtils.when(this, "view.ready", function () {
                _this._handles.remove(viewReady);
                var layerPromises = [];
                _this.view.map.layers.forEach(function (layer) {
                    layerPromises.push(layer.load().then(function (loadedLayer) {
                        // DISABLE CLUSTERING
                        if (loadedLayer && loadedLayer.get("featureReduction")) {
                            loadedLayer.set("featureReduction", null);
                        }
                        if (loadedLayer.type === "feature" &&
                            loadedLayer.get("capabilities.data.supportsAttachment") &&
                            loadedLayer.visible) {
                            return loadedLayer;
                        }
                        else {
                            loadedLayer.popupEnabled = false;
                        }
                    }));
                });
                Promise.all(layerPromises).then(function (layerPromiseResults) {
                    var layerResults = layerPromiseResults.filter(function (layerResult) { return layerResult; });
                    _this.featureLayerCollection.addMany(tslib_1.__spreadArrays(layerResults));
                    if (_this.featureLayerCollection &&
                        _this.featureLayerCollection.length > 0) {
                        _this._sortFeatureLayerCollection();
                    }
                });
            }), viewReady);
            watchUtils.on(this, "featureLayerCollection", "after-add", function () {
                if (_this.selectedLayerId) {
                    var selectedLayer = _this.featureLayerCollection.find(function (featureLayer) {
                        return featureLayer.id === _this.selectedLayerId;
                    });
                    var featureLayer = selectedLayer
                        ? selectedLayer
                        : _this.featureLayerCollection.getItemAt(0);
                    _this.setLayer(featureLayer);
                }
                else {
                    _this.setLayer(_this.featureLayerCollection.getItemAt(0));
                }
            });
        };
        LayerSwitcherViewModel.prototype.destroy = function () {
            this._handles.removeAll();
            this._handles.destroy();
            this._handles = null;
        };
        // setLayer
        LayerSwitcherViewModel.prototype.setLayer = function (featureLayer) {
            this.set("selectedLayer", featureLayer);
        };
        // _sortFeatureLayerCollection
        LayerSwitcherViewModel.prototype._sortFeatureLayerCollection = function () {
            var featureLayerCollection = this.featureLayerCollection;
            var layers = this.get("view.map.layers");
            if (!layers) {
                return;
            }
            featureLayerCollection.sort(function (a, b) {
                var aIndex = layers.indexOf(a);
                var bIndex = layers.indexOf(b);
                if (aIndex > bIndex) {
                    return -1;
                }
                if (aIndex < bIndex) {
                    return 1;
                }
                return 0;
            });
        };
        tslib_1.__decorate([
            decorators_1.property({
                dependsOn: ["view.ready"],
                readOnly: true
            })
        ], LayerSwitcherViewModel.prototype, "state", null);
        tslib_1.__decorate([
            decorators_1.property()
        ], LayerSwitcherViewModel.prototype, "view", void 0);
        tslib_1.__decorate([
            decorators_1.property()
        ], LayerSwitcherViewModel.prototype, "selectedLayer", void 0);
        tslib_1.__decorate([
            decorators_1.property()
        ], LayerSwitcherViewModel.prototype, "selectedLayerId", void 0);
        tslib_1.__decorate([
            decorators_1.property()
        ], LayerSwitcherViewModel.prototype, "featureLayerCollection", void 0);
        tslib_1.__decorate([
            decorators_1.property()
        ], LayerSwitcherViewModel.prototype, "mapCentricViewModel", void 0);
        LayerSwitcherViewModel = tslib_1.__decorate([
            decorators_1.subclass("LayerSwitcherViewModel")
        ], LayerSwitcherViewModel);
        return LayerSwitcherViewModel;
    }(Accessor));
    return LayerSwitcherViewModel;
});
//# sourceMappingURL=LayerSwitcherViewModel.js.map