/// <amd-dependency path="esri/core/tsSupport/declareExtendsHelper" name="__extends" />
/// <amd-dependency path="esri/core/tsSupport/decorateHelper" name="__decorate" />
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
define(["require", "exports", "esri/core/tsSupport/declareExtendsHelper", "esri/core/tsSupport/decorateHelper", "esri/core/Accessor", "esri/core/accessorSupport/decorators", "esri/core/watchUtils", "esri/core/Collection", "esri/core/Handles"], function (require, exports, __extends, __decorate, Accessor, decorators_1, watchUtils, Collection, Handles) {
    "use strict";
    var LayerSwitcherViewModel = /** @class */ (function (_super) {
        __extends(LayerSwitcherViewModel, _super);
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
            enumerable: true,
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
                    _this.featureLayerCollection.addMany(layerResults.slice());
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
        __decorate([
            decorators_1.property({
                dependsOn: ["view.ready"],
                readOnly: true
            })
        ], LayerSwitcherViewModel.prototype, "state", null);
        __decorate([
            decorators_1.property()
        ], LayerSwitcherViewModel.prototype, "view", void 0);
        __decorate([
            decorators_1.property()
        ], LayerSwitcherViewModel.prototype, "selectedLayer", void 0);
        __decorate([
            decorators_1.property()
        ], LayerSwitcherViewModel.prototype, "selectedLayerId", void 0);
        __decorate([
            decorators_1.property()
        ], LayerSwitcherViewModel.prototype, "featureLayerCollection", void 0);
        __decorate([
            decorators_1.property()
        ], LayerSwitcherViewModel.prototype, "mapCentricViewModel", void 0);
        LayerSwitcherViewModel = __decorate([
            decorators_1.subclass("LayerSwitcherViewModel")
        ], LayerSwitcherViewModel);
        return LayerSwitcherViewModel;
    }(decorators_1.declared(Accessor)));
    return LayerSwitcherViewModel;
});
//# sourceMappingURL=LayerSwitcherViewModel.js.map