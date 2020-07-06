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
define(["require", "exports", "tslib", "esri/core/accessorSupport/decorators", "esri/core/Handles", "esri/core/Collection", "esri/core/watchUtils", "esri/widgets/Feature", "esri/tasks/support/Query", "esri/tasks/support/AttachmentQuery", "esri/views/layers/support/FeatureEffect", "../AttachmentViewer/AttachmentViewerViewModel", "../AttachmentViewer/AttachmentViewerLayerData", "./MapCentricData", "../AttachmentViewer/SelectedFeatureAttachments"], function (require, exports, tslib_1, decorators_1, Handles, Collection, watchUtils, Feature, Query, AttachmentQuery, FeatureEffect, AttachmentViewerViewModel, AttachmentViewerLayerData, MapCentricData, SelectedFeatureAttachments) {
    "use strict";
    var MapCentricViewModel = /** @class */ (function (_super) {
        tslib_1.__extends(MapCentricViewModel, _super);
        function MapCentricViewModel() {
            // ----------------------------------
            //
            //  Variables
            //
            // ----------------------------------
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this._mapCentricHandles = new Handles();
            _this._performingHitTestMapCentric = null;
            _this._layerViewPromises = [];
            _this._objectIdPromises = [];
            _this._attachmentDataPromises = [];
            _this._queriedAttachmentsPromises = [];
            _this._settingUpAttachments = false;
            _this._openToolTipPromise = null;
            _this._galleryItemPromise = null;
            // ----------------------------------
            //
            // Properties
            //
            // ----------------------------------
            // attachmentLayer
            _this.attachmentLayer = null;
            // attachmentLayers
            _this.attachmentLayers = null;
            // attachmentIndex
            _this.attachmentIndex = null;
            // currentImageUrl
            _this.currentImageUrl = null;
            // defaultObjectId
            _this.defaultObjectId = null;
            // featureContentPanelIsOpen
            _this.featureContentPanelIsOpen = false;
            // mapSketchQueryExtent
            _this.mapCentricSketchQueryExtent = null;
            // mapCentricTooltipEnabled
            _this.mapCentricTooltipEnabled = null;
            // order
            _this.order = null;
            // selectedLayerId
            _this.selectedLayerId = null;
            // highlightedFeature
            _this.highlightedFeature = null;
            return _this;
        }
        Object.defineProperty(MapCentricViewModel.prototype, "mapCentricState", {
            // ----------------------------------
            //
            //  state - readOnly
            //
            // ----------------------------------
            get: function () {
                var ready = this.get("view.ready");
                return ready
                    ? this._settingUpAttachments ||
                        this._galleryItemPromise ||
                        this._performingHitTestMapCentric
                        ? "querying"
                        : this.get("featureWidget.viewModel.waitingForContent")
                            ? "waitingForContent"
                            : "ready"
                    : this.view
                        ? "loading"
                        : "disabled";
            },
            enumerable: false,
            configurable: true
        });
        // ----------------------------------
        //
        //  Lifecycle Methods
        //
        // ----------------------------------
        MapCentricViewModel.prototype.initialize = function () {
            var _this = this;
            var _a, _b;
            (_a = this._mapCentricHandles) === null || _a === void 0 ? void 0 : _a.add([
                watchUtils.watch(this, "appMode", function () {
                    _this._removeFeatureHighlight();
                }),
                watchUtils.watch(this, "selectFeaturesEnabled", function () {
                    _this._initSketchWatchers();
                }),
                watchUtils.whenFalse(this, "selectFeaturesEnabled", function () {
                    _this._queryAllLayerData();
                })
            ]);
            this._initLayers();
            this._initSocialShare();
            (_b = this._mapCentricHandles) === null || _b === void 0 ? void 0 : _b.add([
                this._initQueryFeaturesOnStationaryWatcher(),
                this._initFeatureContentCloseWatcher(),
                this._initLayerSwitchWatcher(),
                this._watchSelectedSearchResult()
            ]);
        };
        MapCentricViewModel.prototype.destroy = function () {
            var _a, _b;
            (_a = this._mapCentricHandles) === null || _a === void 0 ? void 0 : _a.removeAll();
            (_b = this._mapCentricHandles) === null || _b === void 0 ? void 0 : _b.destroy();
            this._mapCentricHandles = null;
        };
        // ----------------------------------
        //
        //  Private Methods
        //
        // ----------------------------------
        // _initLayers
        MapCentricViewModel.prototype._initLayers = function () {
            var _a;
            var layerInitKey = "layer-init-key";
            (_a = this._mapCentricHandles) === null || _a === void 0 ? void 0 : _a.add(this._handleLayerInitialization(layerInitKey), layerInitKey);
        };
        // _handleLayerInitialization
        MapCentricViewModel.prototype._handleLayerInitialization = function (layerInitKey) {
            var _this = this;
            return watchUtils.whenOnce(this, "view.ready", function () {
                var _a, _b;
                _this.view.padding.bottom = 0;
                (_a = _this._mapCentricHandles) === null || _a === void 0 ? void 0 : _a.remove(layerInitKey);
                _this._handleFeatureClickEvent();
                var featureLayerCollection = "feature-layer-collection";
                (_b = _this._mapCentricHandles) === null || _b === void 0 ? void 0 : _b.add(_this._watchFeatureLayerCollection(featureLayerCollection), featureLayerCollection);
            });
        };
        MapCentricViewModel.prototype._watchFeatureLayerCollection = function (featureLayerCollection) {
            var _this = this;
            return watchUtils.whenOnce(this, "layerSwitcher.featureLayerCollection.length", function () {
                var _a;
                (_a = _this._mapCentricHandles) === null || _a === void 0 ? void 0 : _a.remove(featureLayerCollection);
                _this.layerSwitcher.featureLayerCollection.forEach(function (featureLayer) {
                    return _this._handleLayerFromCollection(featureLayer);
                });
                _this._handleLayerLoadPromises();
            });
        };
        // _handleLayerFromCollection
        MapCentricViewModel.prototype._handleLayerFromCollection = function (featureLayer) {
            if (!featureLayer) {
                return;
            }
            if (!this.mapCentricTooltipEnabled) {
                featureLayer.popupEnabled = false;
            }
            if (!featureLayer.capabilities.data.supportsAttachment) {
                return;
            }
            var attachmentQuery = new AttachmentQuery({
                where: "1=1",
                returnMetadata: true
            });
            this._queriedAttachmentsPromises.push(featureLayer
                .queryAttachments(attachmentQuery)
                .catch(function (err) {
                console.error("ATTACHMENT QUERY ERROR: ", err);
            })
                .then(function (attachments) {
                return {
                    featureLayer: featureLayer,
                    attachments: attachments
                };
            }));
        };
        // _handleFeatureClickEvent
        MapCentricViewModel.prototype._handleFeatureClickEvent = function () {
            var _this = this;
            var popup = this.get("view.popup");
            if (this.mapCentricTooltipEnabled && popup) {
                this.set("view.popup.autoOpenEnabled", false);
            }
            return this.view.on("click", function (event) {
                if (_this.appMode === "photo-centric") {
                    return;
                }
                if (_this.state !== "ready") {
                    return;
                }
                var view = _this.view;
                _this._performingHitTestMapCentric = view.hitTest(event);
                _this.notifyChange("mapCentricState");
                _this._performingHitTestMapCentric.then(function (hitTestRes) {
                    var mapPoint = event && event.mapPoint;
                    _this._handleHitTestRes(hitTestRes, mapPoint);
                });
            });
        };
        // _handleHitTestRes
        MapCentricViewModel.prototype._handleHitTestRes = function (hitTestRes, mapPoint) {
            var _this = this;
            var results = hitTestRes && hitTestRes.results;
            var layerIds = this.attachmentViewerDataCollection
                .slice()
                .map(function (attachmentViewerData) {
                return attachmentViewerData.selectedLayerId;
            });
            var filteredResults = results &&
                results.filter(function (result) {
                    var id = result.graphic.layer.id;
                    return (layerIds.indexOf(id) !== -1 ||
                        (_this.graphicsLayer && _this.graphicsLayer.id === id));
                });
            if (!filteredResults || (filteredResults && filteredResults.length === 0)) {
                this._resetHitTest();
                return;
            }
            var result = filteredResults[0];
            var selectedFeature = this.get("selectedAttachmentViewerData.selectedFeature");
            if (result && selectedFeature) {
                var layerIdFromGraphic = result.graphic && result.graphic.layer && result.graphic.layer.id;
                var resultAttributes = result.graphic && result.graphic.attributes;
                var selectedFeatureAttributes = selectedFeature && selectedFeature.attributes;
                var selectedAttachmentViewerDataLayerId = this.get("selectedAttachmentViewerData.layerData.featureLayer.id");
                var objectIdField = this.getObjectIdField();
                if (layerIdFromGraphic === selectedAttachmentViewerDataLayerId &&
                    resultAttributes &&
                    selectedFeatureAttributes &&
                    resultAttributes[objectIdField] ===
                        selectedFeature.attributes[objectIdField]) {
                    this._resetHitTest();
                    return;
                }
            }
            if (this.mapCentricSketchQueryExtent) {
                var containsPoint = this._getMapPointContains(result);
                if (!containsPoint) {
                    this._performingHitTestMapCentric = null;
                    this.notifyChange("mapCentricState");
                    return;
                }
                var sketchWidgetViewModel = this.sketchWidget.viewModel;
                if (result.graphic.layer === this.sketchWidget.viewModel.layer) {
                    sketchWidgetViewModel.update([result.graphic], { tool: "transform" });
                }
            }
            var resultLayerFromGraphic = result.graphic.layer;
            var resultFeatureLayerId = resultLayerFromGraphic.id;
            var resultAttachmentViewerData = this._getResultAttachmentViewerData(resultFeatureLayerId);
            if (!resultAttachmentViewerData) {
                this._performingHitTestMapCentric = null;
                this.notifyChange("mapCentricState");
                return;
            }
            var selectedAttachmentViewerDataId = this.get("selectedAttachmentViewerData.layerData.featureLayer.id");
            this._setLayerFromHitTestResult(resultFeatureLayerId, selectedAttachmentViewerDataId, resultLayerFromGraphic);
            this._setClickedFeature(hitTestRes, resultAttachmentViewerData, mapPoint);
            this._performingHitTestMapCentric = null;
            this.notifyChange("mapCentricState");
        };
        // _resetHitTest
        MapCentricViewModel.prototype._resetHitTest = function () {
            this._performingHitTestMapCentric = null;
            this.notifyChange("mapCentricState");
        };
        // _getMapPointContains
        MapCentricViewModel.prototype._getMapPointContains = function (result) {
            var mapPoint = result.mapPoint;
            return this.mapCentricSketchQueryExtent.contains(mapPoint);
        };
        // _getResultAttachmentViewerData
        MapCentricViewModel.prototype._getResultAttachmentViewerData = function (resultFeatureLayerId) {
            return this.attachmentViewerDataCollection.find(function (attachmentViewerData) {
                var id = attachmentViewerData.layerData.featureLayer.id;
                return resultFeatureLayerId === id;
            });
        };
        // _setLayerFromHitTestResult
        MapCentricViewModel.prototype._setLayerFromHitTestResult = function (resultFeatureLayerId, selectedAttachmentViewerDataId, resultLayerFromGraphic) {
            if (resultFeatureLayerId !== selectedAttachmentViewerDataId) {
                this.set("layerSwitcher.selectedLayer", resultLayerFromGraphic);
            }
        };
        // _setClickedFeature
        MapCentricViewModel.prototype._setClickedFeature = function (hitTestRes, attachmentViewerData, mapPoint) {
            var _a = attachmentViewerData.layerData, featureLayer = _a.featureLayer, layerView = _a.layerView;
            var graphic = hitTestRes.results.filter(function (result) {
                var layer = result.graphic.layer;
                return layer.id === featureLayer.id;
            })[0].graphic;
            this._processSelectedFeatureIndicator(layerView, graphic, null, mapPoint);
            attachmentViewerData.set("selectedFeature", graphic);
            if (this.socialSharingEnabled) {
                this.setUpdateShareIndexes();
            }
            this._setFeatureMapCentric(graphic);
            this._updateAddress(graphic);
        };
        // _updateAddress
        MapCentricViewModel.prototype._updateAddress = function (graphic) {
            if (graphic && graphic.geometry) {
                this.set("selectedAttachmentViewerData.selectedFeatureAddress", null);
                this.getAddress(graphic.geometry);
            }
        };
        // _handleLayerLoadPromises
        MapCentricViewModel.prototype._handleLayerLoadPromises = function () {
            var _this = this;
            Promise.all(this._queriedAttachmentsPromises).then(function (promiseResults) {
                promiseResults.forEach(function (promiseResult) {
                    var featureLayer = promiseResult.featureLayer, attachments = promiseResult.attachments;
                    if (featureLayer.type !== "feature" ||
                        !featureLayer.get("capabilities.data.supportsAttachment")) {
                        return;
                    }
                    _this._layerViewPromises.push(_this.view
                        .whenLayerView(featureLayer)
                        .catch(function (err) {
                        console.error("ERROR: ", err);
                    })
                        .then(function (layerView) {
                        return {
                            attachments: attachments,
                            layerView: layerView
                        };
                    }));
                });
                _this._handleLayerViewLoadPromises();
            });
        };
        // _handleLayerViewLoadPromises
        MapCentricViewModel.prototype._handleLayerViewLoadPromises = function () {
            var _this = this;
            Promise.all(this._layerViewPromises).then(function (layerViewPromiseResults) {
                layerViewPromiseResults.forEach(function (layerViewPromiseResult) {
                    _this._handleLayerViewLoad(layerViewPromiseResult);
                });
                if (_this.onlyDisplayFeaturesWithAttachmentsIsEnabled) {
                    _this._handleOnlyDisplayFeaturesWithAttachmentsExpression();
                }
                _this._queryAllLayerData();
            });
        };
        // _handleOnlyDisplayFeaturesWithAttachmentsExpression
        MapCentricViewModel.prototype._handleOnlyDisplayFeaturesWithAttachmentsExpression = function () {
            var _this = this;
            this.attachmentViewerDataCollection.forEach(function (attachmentViewerData) {
                var attachments = attachmentViewerData.attachments;
                var featureLayer = attachmentViewerData.layerData.featureLayer;
                featureLayer
                    .queryObjectIds({
                    where: "1=1"
                })
                    .then(function (objectIds) {
                    var objectIdsLength = objectIds.length;
                    var attacmentsLength = Object.keys(attachments).map(function (objectId) {
                        return parseInt(objectId);
                    }).length;
                    if (objectIdsLength !== attacmentsLength) {
                        var definitionExpressionForLayer = _this._createUpdatedDefinitionExpressionForLayer(attachmentViewerData);
                        featureLayer.set("definitionExpression", definitionExpressionForLayer);
                    }
                });
            });
        };
        MapCentricViewModel.prototype._createUpdatedDefinitionExpressionForLayer = function (attachmentViewerData) {
            var attachments = attachmentViewerData.attachments;
            var featureLayer = attachmentViewerData.layerData.featureLayer;
            var definitionExpression = featureLayer.definitionExpression, objectIdField = featureLayer.objectIdField;
            var attachmentObjectIdArr = this._createAttachmentObjectIdArr(attachments);
            var attachmentObjectIdsExpression = attachmentObjectIdArr && attachmentObjectIdArr.join(",");
            return attachmentObjectIdArr && attachmentObjectIdArr.length
                ? definitionExpression
                    ? definitionExpression + " AND " + objectIdField + " IN (" + attachmentObjectIdsExpression + ")"
                    : objectIdField + " IN (" + attachmentObjectIdsExpression + ")"
                : "1=0";
        };
        // _createAttachmentObjectIdArr
        MapCentricViewModel.prototype._createAttachmentObjectIdArr = function (attachmentsRes) {
            return Object.keys(attachmentsRes).map(function (objectId) {
                return "'" + objectId + "'";
            });
        };
        // _handleLayerViewLoad
        MapCentricViewModel.prototype._handleLayerViewLoad = function (layerViewPromiseResult) {
            var attachments = layerViewPromiseResult.attachments, layerView = layerViewPromiseResult.layerView;
            var layer = layerView.layer;
            var attachmentViewerData = this._createAttachmentViewerData(layer, layerView, attachments);
            this._storeFeatureSortFields(layer, attachmentViewerData);
            this.attachmentViewerDataCollection.add(attachmentViewerData);
        };
        // _createAttachmentViewerData
        MapCentricViewModel.prototype._createAttachmentViewerData = function (featureLayer, layerView, attachments) {
            var layerData = new AttachmentViewerLayerData({
                featureLayer: featureLayer,
                layerView: layerView
            });
            return new MapCentricData({
                defaultLayerExpression: featureLayer.definitionExpression,
                layerData: layerData,
                selectedLayerId: featureLayer.id,
                attachments: attachments
            });
        };
        // _storeFeatureSortFields
        MapCentricViewModel.prototype._storeFeatureSortFields = function (featureLayer, attachmentViewerData) {
            var attachmentLayers = this.attachmentLayers;
            var layers = attachmentLayers === null || attachmentLayers === void 0 ? void 0 : attachmentLayers.layers;
            if (layers && layers.length > 0) {
                layers.forEach(function (currentAttachmentLayer) {
                    var sortField = currentAttachmentLayer.fields &&
                        currentAttachmentLayer.fields.length > 0 &&
                        currentAttachmentLayer.fields[0];
                    if (currentAttachmentLayer.id === featureLayer.id && sortField) {
                        attachmentViewerData.sortField = sortField;
                    }
                    else {
                        attachmentViewerData.sortField =
                            attachmentViewerData.layerData.featureLayer.objectIdField;
                    }
                });
            }
            else {
                attachmentViewerData.sortField =
                    attachmentViewerData.layerData.featureLayer.objectIdField;
            }
        };
        // _initSocialShare
        MapCentricViewModel.prototype._initSocialShare = function () {
            var _this = this;
            var _a;
            var setupSocialShare = "setup-social-share";
            (_a = this._mapCentricHandles) === null || _a === void 0 ? void 0 : _a.add(watchUtils.whenOnce(this, "selectedAttachmentViewerData", function () {
                var _a;
                (_a = _this._mapCentricHandles) === null || _a === void 0 ? void 0 : _a.remove(setupSocialShare);
                // if (this.socialSharingEnabled) {
                _this._setupSocialSharing();
                // }
                if (_this.mapCentricTooltipEnabled) {
                    var popup = _this.view.popup;
                    popup.defaultPopupTemplateEnabled = true;
                    popup.dockOptions.buttonEnabled = false;
                    popup.visibleElements.featureNavigation = false;
                    popup.collapseEnabled = false;
                    popup.highlightEnabled = true;
                    popup.actions.removeAll();
                }
            }), setupSocialShare);
        };
        // Feature selection methods
        // _initSketchWatchers
        MapCentricViewModel.prototype._initSketchWatchers = function () {
            var _this = this;
            var _a;
            var sketchWidgetInitKey = "sketch-widget-init";
            (_a = this._mapCentricHandles) === null || _a === void 0 ? void 0 : _a.add(watchUtils.when(this, "sketchWidget", function () {
                _this._handleSketchWidgetLoad(sketchWidgetInitKey);
            }), sketchWidgetInitKey);
        };
        // _handleSketchWidgetLoad
        MapCentricViewModel.prototype._handleSketchWidgetLoad = function (sketchWidgetInitKey) {
            var _a;
            (_a = this._mapCentricHandles) === null || _a === void 0 ? void 0 : _a.remove(sketchWidgetInitKey);
            this._watchSketchCreateAndUpdate(this.sketchWidget, this.graphicsLayer);
            this._watchSketchDelete(this.sketchWidget);
        };
        // _watchSketchCreateAndUpdate
        MapCentricViewModel.prototype._watchSketchCreateAndUpdate = function (sketchWidget, graphicsLayer) {
            var _this = this;
            var _a, _b;
            var createUpdateKey = "create-update-key";
            (_a = this._mapCentricHandles) === null || _a === void 0 ? void 0 : _a.remove(createUpdateKey);
            (_b = this._mapCentricHandles) === null || _b === void 0 ? void 0 : _b.add([
                sketchWidget.on("create", function (sketchEvent) {
                    if (_this.appMode === "photo-centric") {
                        return;
                    }
                    _this._handleSketchEvent(sketchEvent, graphicsLayer);
                }),
                sketchWidget.on("update", function (sketchEvent) {
                    if (_this.appMode === "photo-centric") {
                        return;
                    }
                    _this._handleSketchEvent(sketchEvent, graphicsLayer);
                })
            ], createUpdateKey);
        };
        // _watchSketchDelete
        MapCentricViewModel.prototype._watchSketchDelete = function (sketchWidget) {
            var _this = this;
            var _a;
            (_a = this._mapCentricHandles) === null || _a === void 0 ? void 0 : _a.add(sketchWidget.on("delete", function () {
                if (_this.appMode === "photo-centric") {
                    return;
                }
                _this.set("mapCentricSketchQueryExtent", null);
                _this._queryAllLayerData();
                _this.attachmentViewerDataCollection.forEach(function (attachmentViewerData) {
                    attachmentViewerData.layerData.layerView.effect = null;
                });
            }));
        };
        // _handleSketchEvent
        MapCentricViewModel.prototype._handleSketchEvent = function (sketchEvent, graphicsLayer) {
            var type = sketchEvent.type, state = sketchEvent.state;
            if (type === "create" && (state === "active" || state === "start")) {
                graphicsLayer.graphics.removeAt(0);
            }
            if (state === "complete") {
                var geometry = null;
                if (sketchEvent.type === "update") {
                    var event_1 = sketchEvent;
                    geometry = event_1.graphics[0].geometry;
                }
                else {
                    var event_2 = sketchEvent;
                    geometry = event_2.graphic.geometry;
                }
                this.set("mapCentricSketchQueryExtent", geometry);
                this._queryAllLayerData(geometry);
            }
        };
        // _handleSketchFeatureEffect
        MapCentricViewModel.prototype._handleSketchFeatureEffect = function (geometry, attachmentViewerData) {
            var layerView = attachmentViewerData.get("layerData.layerView");
            var featureEffect = new FeatureEffect({
                filter: {
                    geometry: geometry
                },
                excludedEffect: "grayscale(100%) opacity(50%)"
            });
            layerView.effect = featureEffect;
        };
        // End of feature selection methods
        // _initQueryFeaturesOnStationaryWatcher
        MapCentricViewModel.prototype._initQueryFeaturesOnStationaryWatcher = function () {
            var _this = this;
            return watchUtils.whenFalse(this, "view.stationary", function () {
                _this._queryOnStationary();
            });
        };
        // _queryOnStationary
        MapCentricViewModel.prototype._queryOnStationary = function () {
            var _this = this;
            var _a, _b, _c, _d;
            if (!this.selectedAttachmentViewerData) {
                return;
            }
            if ((this.sketchWidget && this.get("graphicsLayer.graphics.length")) ||
                this.featureContentPanelIsOpen) {
                return;
            }
            if (this.view && !this.view.stationary) {
                var mapCentricStationaryWhenTrue = "map-centric-stationary-when-true";
                if (this._mapCentricHandles.has(mapCentricStationaryWhenTrue)) {
                    (_a = this._mapCentricHandles) === null || _a === void 0 ? void 0 : _a.remove(mapCentricStationaryWhenTrue);
                }
                (_b = this._mapCentricHandles) === null || _b === void 0 ? void 0 : _b.add(watchUtils.whenTrueOnce(this.view, "stationary", function () {
                    _this._queryAllLayerData();
                }), mapCentricStationaryWhenTrue);
            }
            else {
                var mapCentricStationaryWhenFalse = "map-centric-stationary-when-false";
                if (this._mapCentricHandles.has(mapCentricStationaryWhenFalse)) {
                    (_c = this._mapCentricHandles) === null || _c === void 0 ? void 0 : _c.remove(mapCentricStationaryWhenFalse);
                }
                (_d = this._mapCentricHandles) === null || _d === void 0 ? void 0 : _d.add(watchUtils.whenFalseOnce(this.view, "interacting", function () {
                    _this._queryAllLayerData();
                }), mapCentricStationaryWhenFalse);
            }
        };
        // _queryAllLayerData
        MapCentricViewModel.prototype._queryAllLayerData = function (sketchGeometry) {
            var geometry = sketchGeometry
                ? sketchGeometry
                : this.get("view.extent");
            var outSpatialReference = this.get("view.spatialReference");
            this._objectIdPromises = [];
            this._attachmentDataPromises = [];
            var isSketch = sketchGeometry ? true : false;
            this._queryObjectIdsMapCentric(geometry, outSpatialReference, isSketch);
        };
        // _queryObjectIdsMapCentric
        MapCentricViewModel.prototype._queryObjectIdsMapCentric = function (geometry, outSpatialReference, isSketch) {
            var _this = this;
            this.attachmentViewerDataCollection.forEach(function (attachmentViewerData) {
                attachmentViewerData.layerData.start = null;
                var objectIdField = attachmentViewerData.get("layerData.featureLayer.objectIdField");
                if (isSketch) {
                    _this._handleSketchFeatureEffect(geometry, attachmentViewerData);
                }
                var sortField = attachmentViewerData.sortField;
                var order = _this.order ? _this.order : "ASC";
                var sortFieldValue = sortField
                    ? [sortField + " " + order]
                    : [objectIdField + " " + order];
                var featureLayer = attachmentViewerData.get("layerData.featureLayer");
                var attachmentObjectIds = attachmentViewerData && attachmentViewerData.attachments
                    ? Object.keys(attachmentViewerData.attachments).map(function (objectId) {
                        return parseInt(objectId);
                    })
                    : [];
                var queryConfig = {
                    geometry: geometry,
                    outSpatialReference: outSpatialReference,
                    orderByFields: sortFieldValue
                };
                var query = _this.onlyDisplayFeaturesWithAttachmentsIsEnabled
                    ? new Query(tslib_1.__assign(tslib_1.__assign({}, queryConfig), { objectIds: tslib_1.__spreadArrays(attachmentObjectIds) }))
                    : new Query(queryConfig);
                var objectIdPromise = featureLayer
                    .queryObjectIds(query)
                    .then(function (objectIds) {
                    return {
                        objectIds: objectIds,
                        attachmentViewerData: attachmentViewerData
                    };
                });
                _this._objectIdPromises.push(objectIdPromise);
            });
            this._handleQueryObjectIDPromises();
        };
        // _handleQueryObjectIDPromises
        MapCentricViewModel.prototype._handleQueryObjectIDPromises = function () {
            var _this = this;
            Promise.all(this._objectIdPromises).then(function (objectIdResults) {
                objectIdResults.forEach(function (objectIdResult) {
                    _this._handleQueryFeaturesMapCentric(objectIdResult);
                });
                _this._settingUpAttachments = false;
                _this.notifyChange("mapCentricState");
                _this._handleAttachmentDataPromises();
            });
        };
        // _handleQueryFeaturesMapCentric
        MapCentricViewModel.prototype._handleQueryFeaturesMapCentric = function (objectIdResult) {
            var featureObjectIds = objectIdResult.attachmentViewerData.get("featureObjectIds");
            var stringifyObjectIds = JSON.stringify(featureObjectIds.slice().sort());
            var stringifyQueriedObjectIds = JSON.stringify(objectIdResult.objectIds.slice().sort());
            if (stringifyObjectIds === stringifyQueriedObjectIds) {
                return;
            }
            this._settingUpAttachments = true;
            this.notifyChange("mapCentricState");
            this._handleQueryFeaturesLogic(featureObjectIds, objectIdResult);
        };
        // _handleQueryFeaturesLogic
        MapCentricViewModel.prototype._handleQueryFeaturesLogic = function (featureObjectIds, objectIdResult) {
            featureObjectIds.removeAll();
            featureObjectIds.addMany(tslib_1.__spreadArrays(objectIdResult.objectIds));
            var featureObjectIdArr = featureObjectIds.slice();
            var attachmentsArr = featureObjectIdArr.map(function (objectId) {
                var attachments = objectIdResult &&
                    objectIdResult.attachmentViewerData &&
                    objectIdResult.attachmentViewerData.attachments &&
                    objectIdResult.attachmentViewerData.attachments["" + objectId];
                return attachments
                    ? {
                        objectId: objectId,
                        attachments: attachments
                    }
                    : {
                        objectId: objectId,
                        attachments: []
                    };
            });
            var _a = objectIdResult.attachmentViewerData, layerData = _a.layerData, attachmentDataCollection = _a.attachmentDataCollection;
            layerData.start = 0;
            var subsetFeatures = attachmentsArr
                .toArray()
                .slice(layerData.start, layerData.start + 24);
            attachmentDataCollection.removeAll();
            attachmentDataCollection.addMany(tslib_1.__spreadArrays(subsetFeatures));
        };
        // _handleAttachmentDataPromises
        MapCentricViewModel.prototype._handleAttachmentDataPromises = function () {
            var _this = this;
            Promise.all(this._attachmentDataPromises).then(function (attachmentDataPromiseResults) {
                attachmentDataPromiseResults.forEach(function (attachmentDataPromiseResult) {
                    var features = attachmentDataPromiseResult.features, attachmentViewerData = attachmentDataPromiseResult.attachmentViewerData;
                    var mapCentricData = attachmentViewerData;
                    _this._handleAttachmentDataRes(features, mapCentricData);
                });
                var attachmentViewerData = null;
                if (_this.selectedLayerId) {
                    attachmentViewerData = _this.attachmentViewerDataCollection.find(function (currentAttachmentViewerData) {
                        return (currentAttachmentViewerData.layerData.featureLayer.id ===
                            _this.selectedLayerId);
                    });
                }
                else {
                    attachmentViewerData = _this.attachmentViewerDataCollection.getItemAt(0);
                }
                _this.set("selectedAttachmentViewerData", attachmentViewerData);
                _this._handleFeatureUpdate();
            });
        };
        // _handleFeatureUpdate
        MapCentricViewModel.prototype._handleFeatureUpdate = function () {
            if (this.defaultObjectId) {
                this._handleDefaultObjectId();
            }
        };
        // _handleSelectedSearchResult
        MapCentricViewModel.prototype._handleSelectedSearchResult = function () {
            var selectedResult = this.get("searchWidget.selectedResult");
            if (!selectedResult) {
                return;
            }
            if (selectedResult &&
                selectedResult.feature &&
                selectedResult.feature.layer &&
                selectedResult.feature.layer.id) {
                this._removeFeatureHighlight();
                this._updateAttachmentViewerDataOnSearch(selectedResult);
                this.set("selectedAttachmentViewerData.attachmentIndex", 0);
                this._setFeatureMapCentric(selectedResult.feature);
                if (selectedResult &&
                    selectedResult.feature &&
                    selectedResult.feature.geometry) {
                    this._updateAddress(selectedResult.feature);
                }
            }
        };
        MapCentricViewModel.prototype._updateAttachmentViewerDataOnSearch = function (selectedResult) {
            var selectedResultLayerId = selectedResult.feature.layer.id;
            var selectedAttachmentViewerDataLayerId = this.get("selectedAttachmentViewerData.layerData.featureLayer.id");
            if (selectedResultLayerId !== selectedAttachmentViewerDataLayerId) {
                var updatedAttachmentViewerData = this.attachmentViewerDataCollection.find(function (attachmentViewerData) {
                    return (selectedResultLayerId ===
                        attachmentViewerData.layerData.featureLayer.id);
                });
                if (!updatedAttachmentViewerData) {
                    return;
                }
                this.set("layerSwitcher.selectedLayer", updatedAttachmentViewerData.layerData.featureLayer);
                updatedAttachmentViewerData.set("selectedFeature", selectedResult.feature);
            }
        };
        // _handleDefaultObjectId
        MapCentricViewModel.prototype._handleDefaultObjectId = function () {
            var _this = this;
            var _a;
            var handleDefaultObjectIdKey = "handle-default-object-id-key";
            (_a = this._mapCentricHandles) === null || _a === void 0 ? void 0 : _a.add(watchUtils.when(this, "selectedAttachmentViewerData.layerData.featureLayer", function () {
                var _a;
                (_a = _this._mapCentricHandles) === null || _a === void 0 ? void 0 : _a.remove(handleDefaultObjectIdKey);
                if (!_this.defaultObjectId) {
                    return;
                }
                var featureLayer = _this.get("selectedAttachmentViewerData.layerData.featureLayer");
                var queryFeatures = featureLayer.queryFeatures({
                    outFields: ["*"],
                    objectIds: [_this.defaultObjectId],
                    returnGeometry: true,
                    outSpatialReference: _this.view.spatialReference
                });
                queryFeatures
                    .catch(function (err) {
                    console.error("ERROR: ", err);
                })
                    .then(function (featureSet) {
                    _this.defaultObjectId = null;
                    if (featureSet &&
                        featureSet.features &&
                        !featureSet.features.length) {
                        return;
                    }
                    _this.set("selectedAttachmentViewerData.attachmentIndex", _this.attachmentIndex);
                    var feature = featureSet && featureSet.features[0];
                    if (_this.mapCentricTooltipEnabled) {
                        _this.view.popup.open({
                            features: [feature],
                            featureMenuOpen: false,
                            collapsed: true
                        });
                    }
                    else {
                        var layerView = _this.get("selectedAttachmentViewerData.layerData.layerView");
                        if (_this.highlightedFeature.feature) {
                            _this.highlightedFeature.feature.remove();
                            _this.highlightedFeature.feature = null;
                        }
                        _this.highlightedFeature.feature = layerView.highlight(feature);
                    }
                    if (!feature) {
                        return;
                    }
                    _this._setFeatureMapCentric(feature);
                    _this._updateAddress(feature);
                });
            }), handleDefaultObjectIdKey);
        };
        // _handleAttachmentDataRes
        MapCentricViewModel.prototype._handleAttachmentDataRes = function (featureSet, attachmentViewerData) {
            var _this = this;
            var attachmentDataCollection = attachmentViewerData.get("attachmentDataCollection");
            attachmentDataCollection.removeAll();
            if (!featureSet) {
                return;
            }
            var graphics = featureSet.get("features");
            var features = [];
            graphics.forEach(function (graphic) {
                var featureWidget = _this._createFeatureWidget(graphic);
                features.push(featureWidget);
            });
            if (graphics.length === 0) {
                attachmentDataCollection.removeAll();
            }
            else {
                attachmentDataCollection.addMany(features);
            }
        };
        // _initFeatureContentCloseWatcher
        MapCentricViewModel.prototype._initFeatureContentCloseWatcher = function () {
            var _this = this;
            return watchUtils.whenFalse(this, "featureContentPanelIsOpen", function () {
                var _a = _this, attachmentIndex = _a.attachmentIndex, defaultObjectId = _a.defaultObjectId, sketchWidget = _a.sketchWidget;
                if (attachmentIndex !== null) {
                    _this.set("attachmentIndex", null);
                }
                if (defaultObjectId !== null) {
                    _this.set("defaultObjectId", null);
                }
                var graphicsLength = _this.get("graphicsLayer.graphics.length");
                if (sketchWidget && graphicsLength > 0) {
                    return;
                }
                _this.set("selectedAttachmentViewerData.objectIdIndex", null);
                _this.set("selectedAttachmentViewerData.defaultObjectId", null);
                _this.set("selectedAttachmentViewerData.attachmentIndex", 0);
                _this.set("selectedAttachmentViewerData.selectedFeatureAttachments.currentIndex", 0);
                _this.set("selectedAttachmentViewerData.selectedFeature", null);
                _this.set("selectedAttachmentViewerData.featureWidget.graphic", null);
                if (_this.get("searchWidget.selectedResult")) {
                    _this.searchWidget.clear();
                }
                _this._queryAllLayerData();
            });
        };
        // _initLayerSwitchWatcher
        MapCentricViewModel.prototype._initLayerSwitchWatcher = function () {
            var _this = this;
            return watchUtils.whenOnce(this, "selectedAttachmentViewerData", function () {
                _this._handleLayerSwitch();
            });
        };
        // _watchSelectedSearchResult
        MapCentricViewModel.prototype._watchSelectedSearchResult = function () {
            var _this = this;
            return watchUtils.watch(this, "searchWidget.selectedResult", function () {
                _this._handleSelectedSearchResult();
            });
        };
        // _handleLayerSwitch
        MapCentricViewModel.prototype._handleLayerSwitch = function () {
            var _this = this;
            var _a;
            (_a = this._mapCentricHandles) === null || _a === void 0 ? void 0 : _a.add(watchUtils.watch(this, "selectedAttachmentViewerData", function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
                return tslib_1.__generator(this, function (_a) {
                    if (this.socialSharingEnabled) {
                        this.updateSharePropIndexes();
                    }
                    this._resetViewExtentOnDataChange();
                    return [2 /*return*/];
                });
            }); }));
        };
        // _resetViewExtentOnDataChange
        MapCentricViewModel.prototype._resetViewExtentOnDataChange = function () {
            var attachmentDataCollectionLength = this.get("selectedAttachmentViewerData.attachmentDataCollection.length");
            var target = this.get("selectedAttachmentViewerData.layerData.featureLayer.fullExtent");
            if (attachmentDataCollectionLength === 0) {
                this.view.goTo({
                    target: target
                });
            }
        };
        // SET FEATURE METHODS
        // _setFeatureMapCentric
        MapCentricViewModel.prototype._setFeatureMapCentric = function (feature) {
            if (!feature) {
                return;
            }
            this.imageIsLoaded = false;
            this.set("selectedAttachmentViewerData.selectedFeature", feature);
            this._handleFeatureWidget();
        };
        // _updateSelectedAttachmentViewerData
        MapCentricViewModel.prototype._updateSelectedAttachmentViewerData = function (feature) {
            var objectIdField = this.getObjectIdField();
            var objectId = feature.attributes[objectIdField];
            var featureObjectIds = this.get("selectedAttachmentViewerData.featureObjectIds");
            var objectIdIndex = featureObjectIds && featureObjectIds.indexOf(objectId);
            this.set("selectedAttachmentViewerData.defaultObjectId", objectId);
            this.set("selectedAttachmentViewerData.objectIdIndex", objectIdIndex);
            this.set("selectedAttachmentViewerData.selectedLayerId", this.selectedAttachmentViewerData.layerData.featureLayer.id);
            var attachmentExists = this._checkExistingAttachment();
            var attachmentIndex = this.attachmentIndex && attachmentExists ? this.attachmentIndex : 0;
            this.set("selectedAttachmentViewerData.attachmentIndex", attachmentIndex);
        };
        // _checkExistingAttachment
        MapCentricViewModel.prototype._checkExistingAttachment = function () {
            var _a = this.selectedAttachmentViewerData, attachments = _a.attachments, layerData = _a.layerData, selectedFeature = _a.selectedFeature;
            var attributes = selectedFeature.attributes;
            var objectIdField = layerData.featureLayer.objectIdField;
            var objectId = attributes[objectIdField];
            var featureAttachments = attachments === null || attachments === void 0 ? void 0 : attachments[objectId];
            var currentAttachment = featureAttachments && featureAttachments[this.attachmentIndex];
            return !!currentAttachment;
        };
        // _handleFeatureWidget
        MapCentricViewModel.prototype._handleFeatureWidget = function () {
            var _this = this;
            var _a;
            var graphic = this.get("selectedAttachmentViewerData.selectedFeature");
            if (!this.featureWidget) {
                this.featureWidget = this._createFeatureWidget(graphic);
            }
            else {
                this.featureWidget.graphic = graphic;
            }
            this.featureWidget.set("visibleElements.title", false);
            var featureWidgetKey = "feature-widget";
            (_a = this._mapCentricHandles) === null || _a === void 0 ? void 0 : _a.add(watchUtils.when(this, "featureWidget", function () {
                if (_this.socialSharingEnabled) {
                    _this.updateSharePropIndexes();
                }
                _this._watchForFeatureContentLoad(featureWidgetKey);
            }), featureWidgetKey);
        };
        // _createFeatureWidget
        MapCentricViewModel.prototype._createFeatureWidget = function (graphic) {
            var spatialReference = this.get("view.spatialReference");
            return new Feature({
                view: this.view,
                graphic: graphic,
                spatialReference: spatialReference
            });
        };
        // _watchForFeatureContentLoad
        MapCentricViewModel.prototype._watchForFeatureContentLoad = function (featureWidgetKey) {
            var _this = this;
            var _mapCentricHandles = this._mapCentricHandles;
            _mapCentricHandles.remove(featureWidgetKey);
            var featureWidgetContentKey = "feature-widget-content";
            _mapCentricHandles.add(watchUtils.whenFalse(this, "featureWidget.viewModel.waitingForContent", function () {
                if (_this.featureWidget && _this.featureWidget.graphic) {
                    _this._updateSelectedAttachmentViewerData(_this.featureWidget.graphic);
                }
                _this._handleFeatureWidgetContent(featureWidgetContentKey);
            }), featureWidgetContentKey);
        };
        // _handleFeatureWidgetContent
        MapCentricViewModel.prototype._handleFeatureWidgetContent = function (featureWidgetContentKey) {
            var _a;
            (_a = this._mapCentricHandles) === null || _a === void 0 ? void 0 : _a.remove(featureWidgetContentKey);
            this.setFeatureInfo(this.featureWidget);
            this._setFeatureAttachments();
        };
        // _setFeatureAttachments
        MapCentricViewModel.prototype._setFeatureAttachments = function () {
            var attachmentContentInfos = this._getAttachmentContentInfos();
            var attachmentIndex = this.get("selectedAttachmentViewerData.attachmentIndex");
            var currentIndex = attachmentIndex !== null ? attachmentIndex : 0;
            var attachmentsArr = attachmentContentInfos && attachmentContentInfos.length > 0
                ? attachmentContentInfos
                : [];
            var sortedAttachments = this._sortFeatureAttachments(attachmentsArr);
            var attachments = new Collection(tslib_1.__spreadArrays(sortedAttachments));
            var selectedFeatureAttachments = new SelectedFeatureAttachments({
                attachments: attachments,
                currentIndex: currentIndex
            });
            this.set("selectedAttachmentViewerData.selectedFeatureAttachments", selectedFeatureAttachments);
            this.imageIsLoaded = true;
            this.set("featureContentPanelIsOpen", true);
        };
        // _getAttachmentContentInfos
        MapCentricViewModel.prototype._getAttachmentContentInfos = function () {
            var selectedAttachmentViewerData = this
                .selectedAttachmentViewerData;
            if (selectedAttachmentViewerData &&
                selectedAttachmentViewerData.attachments) {
                var selectedFeature = this.get("selectedAttachmentViewerData.selectedFeature");
                var objectIdField = this.getObjectIdField();
                var objectId = selectedFeature && selectedFeature.attributes[objectIdField];
                var attachments = selectedAttachmentViewerData.attachments["" + objectId];
                return attachments;
            }
        };
        // _sortFeatureAttachments
        MapCentricViewModel.prototype._sortFeatureAttachments = function (layerAttachments) {
            var _this = this;
            var featureAttachments = [];
            this.set("selectedAttachmentViewerData.unsupportedAttachmentTypes", []);
            if (layerAttachments) {
                layerAttachments &&
                    layerAttachments.forEach(function (attachmentInfo) {
                        var contentType = attachmentInfo.contentType;
                        if (_this.supportedAttachmentTypes.indexOf(contentType) !== -1) {
                            featureAttachments.push(attachmentInfo);
                        }
                        else {
                            var unsupportedAttachmentTypes = _this.get("selectedAttachmentViewerData.unsupportedAttachmentTypes");
                            unsupportedAttachmentTypes.push(attachmentInfo);
                        }
                    });
            }
            return featureAttachments;
        };
        // _setupSocialSharing
        MapCentricViewModel.prototype._setupSocialSharing = function () {
            this.setupShare();
        };
        MapCentricViewModel.prototype._removeFeatureHighlight = function () {
            if (this.highlightedFeature.feature) {
                this.highlightedFeature.feature.remove();
                this.highlightedFeature.feature = null;
            }
        };
        // ----------------------------------
        //
        //  End of Private Methods
        //
        // ----------------------------------
        // ----------------------------------
        //
        //  Public Methods
        //
        // ----------------------------------
        // updateSelectedFeatureMapCentric
        MapCentricViewModel.prototype.updateSelectedFeatureMapCentric = function (graphic) {
            this.set("selectedAttachmentViewerData.selectedFeature", graphic);
            if (this.socialSharingEnabled) {
                this.setUpdateShareIndexes();
            }
            this._setFeatureMapCentric(graphic);
            this._updateAddress(graphic);
        };
        // handleGalleryItem
        MapCentricViewModel.prototype.handleGalleryItem = function (objectId) {
            var _this = this;
            var selectedFeatureLayer = this.get("selectedAttachmentViewerData.layerData.featureLayer");
            var objectIdField = selectedFeatureLayer.get("objectIdField");
            var query = selectedFeatureLayer.createQuery();
            query.where = objectIdField + " = " + objectId;
            query.outSpatialReference = this.view.spatialReference;
            this._galleryItemPromise = selectedFeatureLayer
                .queryFeatures(query)
                .catch(function (err) {
                console.error("ERROR: ", err);
            })
                .then(function (featureSet) {
                if (!featureSet) {
                    return;
                }
                _this._galleryItemPromise = null;
                _this.notifyChange("mapCentricState");
                var graphic = featureSet.features[0];
                _this.updateSelectedFeatureMapCentric(graphic);
            });
            this.notifyChange("mapCentricState");
        };
        // updateAttachmentDataMapCentric
        MapCentricViewModel.prototype.updateAttachmentDataMapCentric = function () {
            var selectedAttachmentViewerData = this
                .selectedAttachmentViewerData;
            if (!selectedAttachmentViewerData || this.mapCentricState === "querying") {
                return;
            }
            var layerData = selectedAttachmentViewerData.get("layerData");
            var featureObjectIdsLength = selectedAttachmentViewerData.featureObjectIds.length;
            var attachmentDataCollectionLength = selectedAttachmentViewerData.attachmentDataCollection.length;
            if (featureObjectIdsLength < 24) {
                return;
            }
            if (attachmentDataCollectionLength < featureObjectIdsLength) {
                var featureObjectIdArr = selectedAttachmentViewerData.featureObjectIds.slice();
                var attachmentsArr = featureObjectIdArr.map(function (objectId) {
                    var attachments = selectedAttachmentViewerData &&
                        selectedAttachmentViewerData.attachments &&
                        selectedAttachmentViewerData.attachments["" + objectId];
                    return attachments
                        ? {
                            attachments: attachments,
                            objectId: objectId
                        }
                        : {
                            attachments: [],
                            objectId: objectId
                        };
                });
                var end = null;
                if (layerData.start === 0) {
                    layerData.start = 24;
                }
                else {
                    layerData.start = layerData.start + 24;
                }
                if (layerData.start > featureObjectIdsLength) {
                    end = featureObjectIdsLength;
                }
                else {
                    end = layerData.start + 24;
                }
                if (layerData.start < end) {
                    var attachmentDataSubset = attachmentsArr
                        .toArray()
                        .slice(layerData.start, end);
                    selectedAttachmentViewerData.attachmentDataCollection.addMany(tslib_1.__spreadArrays(attachmentDataSubset));
                }
            }
        };
        // // openTooltipPopup
        MapCentricViewModel.prototype.openTooltipPopup = function (event) {
            var _this = this;
            var node = event && event.currentTarget;
            var objectId = node && node["data-object-id"];
            var layerView = this.get("selectedAttachmentViewerData.layerData.layerView");
            var outSpatialReference = this.get("view.spatialReference");
            var geometry = this.get("view.extent");
            var queryPromise = layerView
                .queryFeatures({
                objectIds: [parseInt(objectId)],
                returnGeometry: true,
                outSpatialReference: outSpatialReference,
                geometry: geometry
            })
                .catch(function (err) {
                console.error("POPUP ERROR: ", err);
            });
            queryPromise.then(function (featureSet) {
                if (queryPromise === _this._openToolTipPromise) {
                    _this._openToolTipPromise = null;
                    _this.notifyChange("mapCentricState");
                    var features = featureSet.features;
                    var graphic = features[0];
                    if (!graphic) {
                        return;
                    }
                    _this._processSelectedFeatureIndicator(layerView, graphic, queryPromise);
                }
            });
            this._openToolTipPromise = queryPromise;
            this.notifyChange("mapCentricState");
        };
        // closeTooltipPopup
        MapCentricViewModel.prototype.closeTooltipPopup = function () {
            if (!this.featureContentPanelIsOpen) {
                if (this.mapCentricTooltipEnabled) {
                    if (this.view && this.view.popup) {
                        this.view.popup.clear();
                        this.view.popup.close();
                    }
                }
                else {
                    this._removeFeatureHighlight();
                }
            }
        };
        // _processSelectedFeatureIndicator
        MapCentricViewModel.prototype._processSelectedFeatureIndicator = function (layerView, graphic, queryPromise, mapPoint) {
            if (this.mapCentricTooltipEnabled) {
                var config = mapPoint
                    ? {
                        location: mapPoint,
                        features: [graphic],
                        featureMenuOpen: false,
                        collapsed: true
                    }
                    : {
                        features: [graphic],
                        featureMenuOpen: false,
                        collapsed: true
                    };
                var popupConfigToOpen = queryPromise
                    ? tslib_1.__assign(tslib_1.__assign({}, config), { promises: [queryPromise] }) : config;
                this.view.popup.open(popupConfigToOpen);
            }
            else {
                this._removeFeatureHighlight();
                this.highlightedFeature.feature = layerView.highlight(graphic);
            }
        };
        // getCurrentAttachment
        MapCentricViewModel.prototype.getCurrentAttachment = function () {
            var attachments = this.get("selectedAttachmentViewerData.selectedFeatureAttachments.attachments");
            var attachmentIndex = this.get("selectedAttachmentViewerData.attachmentIndex");
            return attachments && attachments.length > 0
                ? attachments.getItemAt(attachmentIndex)
                    ? attachments.getItemAt(attachmentIndex)
                    : null
                : null;
        };
        // getHyperLink
        MapCentricViewModel.prototype.getHyperLink = function (contentInfo) {
            var expression = /(http|ftp|https)(:\/\/)([\w_-]+(?:(?:\.[\w_-]+)+))([\w.,@?^=%&:/~+#-]*[\w@?^=%&/~+#-])?/;
            var regex = new RegExp(expression);
            var content = contentInfo && contentInfo.content;
            return content &&
                content.match &&
                content.match(regex) &&
                content.match(regex).length > 0
                ? content.match(regex)[0]
                : null;
        };
        // getAttachentLoadState
        MapCentricViewModel.prototype.getAttachentLoadState = function () {
            var attachments = this.get("selectedAttachmentViewerData.selectedFeatureAttachments.attachments");
            var attachment = this.getCurrentAttachment();
            return (attachment &&
                attachment.contentType &&
                attachment.contentType.indexOf("pdf") === -1 &&
                attachment.contentType.indexOf("video") === -1 &&
                attachments);
        };
        // updateAttachmentUrlToHTTPS
        MapCentricViewModel.prototype.updateAttachmentUrlToHTTPS = function (attachmentUrl) {
            if (!attachmentUrl) {
                return;
            }
            var featureLayer = this.selectedAttachmentViewerData.get("layerData.featureLayer");
            var parentPortalUrl = featureLayer &&
                featureLayer.get("parent.portalItem.portal.url");
            var portalUrl = featureLayer && featureLayer.get("portalItem.portal.url");
            var portalIsHTTPS = (portalUrl && portalUrl.indexOf("https") !== -1) ||
                (parentPortalUrl && parentPortalUrl.indexOf("https") !== -1);
            if (portalIsHTTPS &&
                attachmentUrl &&
                attachmentUrl.indexOf("https") === -1) {
                return attachmentUrl.replace(/^http:\/\//i, "https://");
            }
            return attachmentUrl;
        };
        // zoomToMapCentric
        MapCentricViewModel.prototype.zoomToMapCentric = function () {
            var _this = this;
            var scale = this.zoomLevel ? parseInt(this.zoomLevel) : 32000;
            var target = this.get("selectedAttachmentViewerData.selectedFeature");
            this.view
                .goTo({
                target: target,
                scale: scale
            })
                .then(function () {
                _this._queryAllLayerData();
            });
        };
        // getObjectIdField
        MapCentricViewModel.prototype.getObjectIdField = function () {
            return this.get("selectedAttachmentViewerData.layerData.featureLayer.objectIdField");
        };
        // getAttachments
        MapCentricViewModel.prototype.getAttachments = function () {
            return this.get("selectedAttachmentViewerData.selectedFeatureAttachments.attachments");
        };
        tslib_1.__decorate([
            decorators_1.property({
                dependsOn: ["view.ready", "featureWidget.viewModel.waitingForContent"],
                readOnly: true
            })
        ], MapCentricViewModel.prototype, "mapCentricState", null);
        tslib_1.__decorate([
            decorators_1.property()
        ], MapCentricViewModel.prototype, "attachmentLayer", void 0);
        tslib_1.__decorate([
            decorators_1.property()
        ], MapCentricViewModel.prototype, "attachmentLayers", void 0);
        tslib_1.__decorate([
            decorators_1.property()
        ], MapCentricViewModel.prototype, "attachmentIndex", void 0);
        tslib_1.__decorate([
            decorators_1.property()
        ], MapCentricViewModel.prototype, "currentImageUrl", void 0);
        tslib_1.__decorate([
            decorators_1.property()
        ], MapCentricViewModel.prototype, "defaultObjectId", void 0);
        tslib_1.__decorate([
            decorators_1.property()
        ], MapCentricViewModel.prototype, "featureContentPanelIsOpen", void 0);
        tslib_1.__decorate([
            decorators_1.property()
        ], MapCentricViewModel.prototype, "mapCentricSketchQueryExtent", void 0);
        tslib_1.__decorate([
            decorators_1.property()
        ], MapCentricViewModel.prototype, "mapCentricTooltipEnabled", void 0);
        tslib_1.__decorate([
            decorators_1.property()
        ], MapCentricViewModel.prototype, "order", void 0);
        tslib_1.__decorate([
            decorators_1.property()
        ], MapCentricViewModel.prototype, "selectedLayerId", void 0);
        tslib_1.__decorate([
            decorators_1.property()
        ], MapCentricViewModel.prototype, "highlightedFeature", void 0);
        MapCentricViewModel = tslib_1.__decorate([
            decorators_1.subclass("MapCentricViewModel")
        ], MapCentricViewModel);
        return MapCentricViewModel;
    }(AttachmentViewerViewModel));
    return MapCentricViewModel;
});
//# sourceMappingURL=MapCentricViewModel.js.map