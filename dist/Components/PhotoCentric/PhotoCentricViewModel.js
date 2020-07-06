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
define(["require", "exports", "tslib", "esri/core/accessorSupport/decorators", "esri/core/Collection", "esri/core/Handles", "esri/core/watchUtils", "esri/widgets/Feature", "esri/tasks/support/Query", "esri/views/layers/support/FeatureEffect", "../AttachmentViewer/AttachmentViewerLayerData", "../AttachmentViewer/AttachmentViewerViewModel", "./PhotoCentricData", "../AttachmentViewer/SelectedFeatureAttachments"], function (require, exports, tslib_1, decorators_1, Collection, Handles, watchUtils, Feature, Query, FeatureEffect, AttachmentViewerLayerData, AttachmentViewerViewModel, PhotoCentricData, SelectedFeatureAttachments) {
    "use strict";
    var PhotoCentricViewModel = /** @class */ (function (_super) {
        tslib_1.__extends(PhotoCentricViewModel, _super);
        function PhotoCentricViewModel() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this._photoCentricHandles = new Handles();
            _this._queryingForFeaturesPhotoCentric = null;
            _this._performingHitTestPhotoCentric = null;
            _this._currentSketchExtentPhotoCentric = null;
            _this._queryingForObjectIds = null;
            _this._layerViewLoadPromises = [];
            _this._queryObjectIdPromises = [];
            _this._queryFeaturesPromises = [];
            _this._queryAttachmentsPromises = [];
            _this._queryingFeatures = null;
            // currentImageUrl
            _this.currentImageUrl = null;
            // attachmentLayers
            _this.attachmentLayers = null;
            // imagePanZoomEnabled
            _this.imagePanZoomEnabled = null;
            // order
            _this.order = null;
            // defaultObjectId
            _this.defaultObjectId = null;
            // attachmentIndex
            _this.attachmentIndex = null;
            // selectedLayerId
            _this.selectedLayerId = null;
            _this.highlightedFeature = null;
            return _this;
        }
        Object.defineProperty(PhotoCentricViewModel.prototype, "queryingState", {
            // ----------------------------------
            //
            //  state - readOnly
            //
            // ----------------------------------
            get: function () {
                var ready = this.get("view.ready");
                return ready
                    ? this._queryingForFeaturesPhotoCentric ||
                        this._queryingForObjectIds ||
                        this._queryingFeatures
                        ? "querying"
                        : "ready"
                    : this.view
                        ? "loading"
                        : "disabled";
            },
            enumerable: false,
            configurable: true
        });
        PhotoCentricViewModel.prototype.initialize = function () {
            var _this = this;
            var _a, _b;
            (_a = this._photoCentricHandles) === null || _a === void 0 ? void 0 : _a.add(watchUtils.watch(this, "appMode", function () {
                _this._removeFeatureHighlight();
            }));
            this._initAppOnViewReady();
            (_b = this._photoCentricHandles) === null || _b === void 0 ? void 0 : _b.add([
                watchUtils.whenTrue(this, "selectFeaturesEnabled", function () {
                    _this._initializeSketch();
                }),
                ,
                watchUtils.whenFalse(this, "selectFeaturesEnabled", function () {
                    var _a;
                    if ((_a = _this.layerSwitcher) === null || _a === void 0 ? void 0 : _a.featureLayerCollection) {
                        _this._layerViewLoadPromises = [];
                        _this._initLayerViewLoadPromises(_this.layerSwitcher.featureLayerCollection);
                    }
                })
            ]);
            this._initSelectedAttachmentViewerDataWatcher();
        };
        // _initAppOnViewReady
        PhotoCentricViewModel.prototype._initAppOnViewReady = function () {
            var _this = this;
            var _a;
            var photoCentricInit = "photo-centric-init";
            (_a = this._photoCentricHandles) === null || _a === void 0 ? void 0 : _a.add(watchUtils.whenOnce(this, "view.ready", function () {
                var _a;
                (_a = _this._photoCentricHandles) === null || _a === void 0 ? void 0 : _a.remove(photoCentricInit);
                _this._initializeAppData();
                _this._detectFeatureClick();
            }), photoCentricInit);
        };
        // _initSelectedAttachmentViewerDataWatcher
        PhotoCentricViewModel.prototype._initSelectedAttachmentViewerDataWatcher = function () {
            var _this = this;
            var _a;
            (_a = this._photoCentricHandles) === null || _a === void 0 ? void 0 : _a.add([
                watchUtils.watch(this, "selectedAttachmentViewerData", function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
                    var _a, socialSharingEnabled, defaultObjectId, selectedLayerId;
                    return tslib_1.__generator(this, function (_b) {
                        _a = this, socialSharingEnabled = _a.socialSharingEnabled, defaultObjectId = _a.defaultObjectId, selectedLayerId = _a.selectedLayerId;
                        if (socialSharingEnabled &&
                            defaultObjectId !== null &&
                            selectedLayerId) {
                            this._handleSharedFeature();
                        }
                        else {
                            this._setFeaturePhotoCentric();
                        }
                        if (socialSharingEnabled) {
                            this.updateSharePropIndexes();
                        }
                        this._removeFeatureHighlight();
                        this._highlightFeature();
                        return [2 /*return*/];
                    });
                }); })
            ]);
        };
        // _handleShareFeature
        PhotoCentricViewModel.prototype._handleSharedFeature = function () {
            var _this = this;
            var defaultObjectId = this.defaultObjectId;
            var featureLayer = this.selectedAttachmentViewerData.layerData.featureLayer;
            featureLayer
                .queryFeatures({
                outFields: ["*"],
                objectIds: [defaultObjectId],
                returnGeometry: true
            })
                .then(function (featureSet) {
                var graphic = featureSet && featureSet.features[0];
                if (!graphic) {
                    return;
                }
                _this.set("selectedAttachmentViewerData.selectedFeature", graphic);
                _this.updateSelectedFeatureFromClickOrSearch(graphic);
            });
            this.set("defaultObjectId", null);
            this.set("selectedLayerId", null);
        };
        // _initializeAppData
        PhotoCentricViewModel.prototype._initializeAppData = function () {
            var _this = this;
            watchUtils.when(this, "layerSwitcher.featureLayerCollection.length", function () {
                _this._layerViewLoadPromises = [];
                _this._initLayerViewLoadPromises(_this.layerSwitcher.featureLayerCollection);
            });
        };
        // _initLayerViewLoadPromises
        PhotoCentricViewModel.prototype._initLayerViewLoadPromises = function (featureLayersRes) {
            var _this = this;
            featureLayersRes.forEach(function (featureLayerRes) {
                featureLayerRes.popupEnabled = false;
                _this._layerViewLoadPromises.push(_this.view
                    .whenLayerView(featureLayerRes)
                    .then(function (layerView) {
                    return layerView;
                }));
            });
            Promise.all(this._layerViewLoadPromises).then(function (layerViewPromiseResults) {
                _this._handleLayerViewPromises(layerViewPromiseResults);
            });
        };
        // _handleLayerViewPromises
        PhotoCentricViewModel.prototype._handleLayerViewPromises = function (layerViewPromiseResults) {
            var _this = this;
            this._handleLayerViewPromiseResults(layerViewPromiseResults);
            this._initQueryAttachmentsPromise();
            Promise.all(this._queryAttachmentsPromises).then(function () {
                _this._queryObjectIdPromises = [];
                _this._initQueryObjectIdPromises();
            });
        };
        // _initQueryAttachmentsPromise
        PhotoCentricViewModel.prototype._initQueryAttachmentsPromise = function () {
            var _this = this;
            this.attachmentViewerDataCollection.forEach(function (attachmentViewerData) {
                _this._queryAttachmentsPromises.push(_this._handleQueryAttachments(attachmentViewerData));
            });
        };
        // _handleQueryAttachments
        PhotoCentricViewModel.prototype._handleQueryAttachments = function (attachmentViewerData) {
            var _this = this;
            var featureLayer = attachmentViewerData.layerData.featureLayer;
            return featureLayer
                .queryAttachments({
                where: "1=1",
                returnMetadata: true
            })
                .catch(function (err) {
                console.error("ATTACHMENT QUERY ERROR: ", err);
                _this._handleOnlyDisplayFeaturesWithAttachmentsExpression(attachmentViewerData, null);
                attachmentViewerData.set("attachments", null);
            })
                .then(function (attachmentsRes) {
                // console.log(attachmentsRes);
                _this._handleOnlyDisplayFeaturesWithAttachmentsExpression(attachmentViewerData, attachmentsRes);
                attachmentViewerData.set("attachments", attachmentsRes);
            });
        };
        // _handleOnlyDisplayFeaturesWithAttachmentsExpression
        PhotoCentricViewModel.prototype._handleOnlyDisplayFeaturesWithAttachmentsExpression = function (attachmentViewerData, attachments) {
            var _this = this;
            var featureLayer = attachmentViewerData.layerData.featureLayer;
            if (this.onlyDisplayFeaturesWithAttachmentsIsEnabled) {
                featureLayer
                    .queryObjectIds({
                    where: "1=1"
                })
                    .then(function (objectIds) {
                    var objectIdsLength = objectIds.length;
                    var attacmentsLength = attachments
                        ? Object.keys(attachments).map(function (objectId) {
                            return parseInt(objectId);
                        }).length
                        : 0;
                    var supportsQueryAttachments = featureLayer.get("capabilities.operations.supportsQueryAttachments");
                    if (objectIdsLength !== attacmentsLength &&
                        supportsQueryAttachments) {
                        var definitionExpressionForLayer = _this._createUpdatedDefinitionExpressionForLayer(attachmentViewerData);
                        featureLayer.set("definitionExpression", definitionExpressionForLayer);
                    }
                });
            }
        };
        // _createUpdatedDefinitionExpressionForLayer
        PhotoCentricViewModel.prototype._createUpdatedDefinitionExpressionForLayer = function (attachmentViewerData) {
            var attachments = attachmentViewerData.attachments;
            var featureLayer = attachmentViewerData.layerData.featureLayer;
            var definitionExpression = featureLayer.definitionExpression, objectIdField = featureLayer.objectIdField;
            var attachmentObjectIds = this._createAttachmentObjectIdArr(attachments);
            var attachmentObjectIdsExpression = attachmentObjectIds && attachmentObjectIds.join(",");
            return attachmentObjectIds && attachmentObjectIds.length
                ? definitionExpression
                    ? definitionExpression + " AND " + objectIdField + " IN (" + attachmentObjectIdsExpression + ")"
                    : objectIdField + " IN (" + attachmentObjectIdsExpression + ")"
                : "1=0";
        };
        // _createAttachmentObjectIdArr
        PhotoCentricViewModel.prototype._createAttachmentObjectIdArr = function (attachmentsRes) {
            return attachmentsRes
                ? Object.keys(attachmentsRes).map(function (objectId) {
                    return "'" + objectId + "'";
                })
                : [];
        };
        // _handleLayerViewPromiseResults
        PhotoCentricViewModel.prototype._handleLayerViewPromiseResults = function (layerViewPromiseResults) {
            var _this = this;
            layerViewPromiseResults.forEach(function (layerViewPromiseResult) {
                var attachmentViewerData = _this._addAttachmentViewerDataToCollection(layerViewPromiseResult);
                _this._handleAttachmentViewerDataSortField(attachmentViewerData);
            });
        };
        // _addAttachmentViewerDataToCollection
        PhotoCentricViewModel.prototype._addAttachmentViewerDataToCollection = function (layerViewPromiseResult) {
            var layer = layerViewPromiseResult.layer;
            var layerData = new AttachmentViewerLayerData({
                featureLayer: layer,
                layerView: layerViewPromiseResult
            });
            var attachmentViewerData = new PhotoCentricData({
                defaultLayerExpression: layer.definitionExpression,
                layerData: layerData,
                selectedLayerId: layer.id
            });
            this.attachmentViewerDataCollection.add(attachmentViewerData);
            return attachmentViewerData;
        };
        // _handleAttachmentViewerDataSortField
        PhotoCentricViewModel.prototype._handleAttachmentViewerDataSortField = function (attachmentViewerData) {
            var featureLayer = attachmentViewerData.layerData.featureLayer;
            var attachmentLayers = this.attachmentLayers;
            var layers = attachmentLayers === null || attachmentLayers === void 0 ? void 0 : attachmentLayers.layers;
            if (layers && layers.length > 0) {
                this._handleAttachmentLayers(layers, attachmentViewerData, featureLayer);
            }
            else {
                this._handleAttachmentLayer(attachmentViewerData, featureLayer);
            }
        };
        // _handleAttachmentLayers
        PhotoCentricViewModel.prototype._handleAttachmentLayers = function (attachmentLayers, attachmentViewerData, featureLayer) {
            attachmentLayers.forEach(function (attachmentLayer) {
                var fields = attachmentLayer.fields, id = attachmentLayer.id;
                var sortField = fields && fields.length > 0 && fields[0];
                if (id === featureLayer.id && sortField) {
                    attachmentViewerData.sortField = sortField;
                }
            });
        };
        // _handleAttachmentLayer
        PhotoCentricViewModel.prototype._handleAttachmentLayer = function (attachmentViewerData, featureLayer) {
            var attachmentLayer = this.attachmentLayer;
            if (!attachmentLayer) {
                return;
            }
            var fields = attachmentLayer.fields;
            if (attachmentLayer &&
                attachmentLayer.id === featureLayer.id &&
                attachmentLayer &&
                fields &&
                fields.length > 0 &&
                fields[0] &&
                fields[0].fields &&
                fields[0].fields.length > 0 &&
                fields[0].fields[0]) {
                attachmentViewerData.sortField = this.attachmentLayer.fields[0].fields[0];
            }
        };
        // _initQueryObjectIdPromises
        PhotoCentricViewModel.prototype._initQueryObjectIdPromises = function (sketchGeometry, isSketchDelete) {
            var _this = this;
            this.attachmentViewerDataCollection.forEach(function (attachmentViewerData) {
                var sketchQuery = sketchGeometry
                    ? _this._generateSketchQuery(sketchGeometry, attachmentViewerData)
                    : null;
                _this._setupQueryObjectIdPromises(attachmentViewerData, sketchQuery);
            });
            Promise.all(this._queryObjectIdPromises).then(function (objectIdPromiseResults) {
                _this._handleQueryObjectIdPromisesResults(objectIdPromiseResults, isSketchDelete);
            });
        };
        // _handleQueryObjectIdPromises
        PhotoCentricViewModel.prototype._setupQueryObjectIdPromises = function (attachmentViewerData, sketchQuery) {
            this._resetQueryRange(attachmentViewerData);
            var featureQuery = null;
            if (sketchQuery) {
                var where = this._createUpdatedDefinitionExpression(attachmentViewerData);
                var updatedSketchQuery = where
                    ? tslib_1.__assign(tslib_1.__assign({}, sketchQuery), { where: where }) : sketchQuery;
                featureQuery = updatedSketchQuery;
            }
            else {
                featureQuery = this._createFeatureQuery(attachmentViewerData);
            }
            this._handleObjectIdPromise(attachmentViewerData, featureQuery);
        };
        // _resetQueryRange
        PhotoCentricViewModel.prototype._resetQueryRange = function (attachmentViewerData) {
            var queryRange = attachmentViewerData.queryRange;
            queryRange[0] = 0;
            queryRange[1] = 10;
        };
        // _createFeatureQuery
        PhotoCentricViewModel.prototype._createFeatureQuery = function (attachmentViewerData) {
            var orderByFields = this._createOrderByFields(attachmentViewerData);
            var where = this._createUpdatedDefinitionExpression(attachmentViewerData);
            var attachmentObjectIds = this._getAttachmentObjectIds(attachmentViewerData);
            var queryConfig = {
                outFields: ["*"],
                orderByFields: orderByFields,
                where: where,
                returnGeometry: true
            };
            return this.onlyDisplayFeaturesWithAttachmentsIsEnabled &&
                attachmentObjectIds &&
                attachmentObjectIds.length > 0
                ? new Query(tslib_1.__assign(tslib_1.__assign({}, queryConfig), { objectIds: attachmentObjectIds }))
                : new Query(queryConfig);
        };
        // _createUpdatedDefinitionExpression
        PhotoCentricViewModel.prototype._createUpdatedDefinitionExpression = function (attachmentViewerData) {
            var attachmentObjectIds = attachmentViewerData && attachmentViewerData.attachments
                ? Object.keys(attachmentViewerData.attachments).map(function (objectId) {
                    return parseInt(objectId);
                })
                : [];
            return this.onlyDisplayFeaturesWithAttachmentsIsEnabled
                ? attachmentObjectIds && attachmentObjectIds.length
                    ? attachmentViewerData.defaultLayerExpression
                        ? attachmentViewerData.defaultLayerExpression
                        : "1=1"
                    : "1=0"
                : attachmentViewerData.defaultLayerExpression
                    ? attachmentViewerData.defaultLayerExpression
                    : "1=1";
        };
        // _createOrderByFields
        PhotoCentricViewModel.prototype._createOrderByFields = function (attachmentViewerData) {
            var featureLayer = attachmentViewerData.layerData.featureLayer;
            var objectIdField = featureLayer.objectIdField;
            var order = this.order;
            var sortField = attachmentViewerData.get("sortField");
            var sortFieldValue = sortField ? sortField : objectIdField;
            var fieldOrder = order ? order : "ASC";
            return [sortFieldValue + " " + fieldOrder];
        };
        // _getAttachmentObjectIds
        PhotoCentricViewModel.prototype._getAttachmentObjectIds = function (attachmentViewerData) {
            var attachments = attachmentViewerData.attachments;
            return attachments
                ? Object.keys(attachments).map(function (objectId) {
                    return parseInt(objectId);
                })
                : null;
        };
        // _handleObjectIdPromise
        PhotoCentricViewModel.prototype._handleObjectIdPromise = function (attachmentViewerData, featureQuery) {
            var _this = this;
            var featureLayer = attachmentViewerData.layerData.featureLayer;
            this._queryObjectIdPromises.push(featureLayer
                .queryObjectIds(featureQuery)
                .catch(function (err) {
                _this._queryingForObjectIds = null;
                _this.notifyChange("state");
                console.error("ERROR: ", err);
            })
                .then(function (objectIds) {
                return {
                    attachmentViewerData: attachmentViewerData,
                    objectIds: objectIds
                };
            }));
        };
        // _handleQueryObjectIdPromisesResults
        PhotoCentricViewModel.prototype._handleQueryObjectIdPromisesResults = function (objectIdPromiseResults, isSketchDelete) {
            var _this = this;
            this._queryFeaturesPromises = [];
            this._initQueryFeaturesPromises(objectIdPromiseResults);
            Promise.all(this._queryFeaturesPromises).then(function (queriedFeaturesPromisesResults) {
                _this._handleQueryFeaturesPromisesResults(queriedFeaturesPromisesResults, isSketchDelete);
            });
        };
        // _initQueryFeaturesPromises
        PhotoCentricViewModel.prototype._initQueryFeaturesPromises = function (objectIdPromiseResults) {
            var _this = this;
            objectIdPromiseResults.forEach(function (objectIdPromiseResult) {
                var attachmentViewerData = objectIdPromiseResult.attachmentViewerData, objectIds = objectIdPromiseResult.objectIds;
                var featureObjectIds = attachmentViewerData.featureObjectIds;
                if (!objectIds) {
                    return;
                }
                featureObjectIds.removeAll();
                featureObjectIds.addMany(tslib_1.__spreadArrays(objectIds));
                var featureQuery = _this._setupFeatureQuery(attachmentViewerData);
                _this._queryFeaturesPromises.push(attachmentViewerData.layerData.featureLayer
                    .queryFeatures(featureQuery)
                    .catch(function (err) {
                    _this._queryingForFeaturesPhotoCentric = null;
                    _this.notifyChange("state");
                    console.error("ERROR: ", err);
                })
                    .then(function (queriedFeatures) {
                    return { attachmentViewerData: attachmentViewerData, queriedFeatures: queriedFeatures };
                }));
            });
        };
        // _handleQueryFeaturesPromisesResults
        PhotoCentricViewModel.prototype._handleQueryFeaturesPromisesResults = function (queriedFeaturesPromisesResults, isSketchDelete) {
            var _this = this;
            queriedFeaturesPromisesResults.forEach(function (queriedFeaturesPromisesResult) {
                _this._addLayerFeaturesToAttachmentViewerData(queriedFeaturesPromisesResult);
            });
            this._setupPhotoCentricLayout(isSketchDelete);
        };
        // _addLayerFeaturesToAttachmentViewerData
        PhotoCentricViewModel.prototype._addLayerFeaturesToAttachmentViewerData = function (queriedFeaturesPromisesResult) {
            var attachmentViewerData = queriedFeaturesPromisesResult.attachmentViewerData, queriedFeatures = queriedFeaturesPromisesResult.queriedFeatures;
            var layerFeatures = attachmentViewerData.layerFeatures, layerFeatureIndex = attachmentViewerData.layerFeatureIndex;
            layerFeatures.removeAll();
            var currentSet = this._getCurrentSetOfFeatures(attachmentViewerData);
            var features = this._sortFeatures(queriedFeatures, currentSet, attachmentViewerData);
            layerFeatures.addMany(features);
            attachmentViewerData.set("layerFeatureIndex", layerFeatureIndex !== null ? layerFeatureIndex : 0);
        };
        // _getCurrentSetOfFeatures
        PhotoCentricViewModel.prototype._getCurrentSetOfFeatures = function (attachmentViewerData) {
            var queryRange = attachmentViewerData.queryRange, featureObjectIds = attachmentViewerData.featureObjectIds;
            var low = queryRange[0], high = queryRange[1];
            return featureObjectIds.slice(low, high);
        };
        // _setupPhotoCentricLayout
        PhotoCentricViewModel.prototype._setupPhotoCentricLayout = function (isSketchDelete) {
            if (this._currentSketchExtentPhotoCentric || isSketchDelete) {
                this.attachmentViewerDataCollection.forEach(function (attachmentViewerData) {
                    attachmentViewerData.set("attachmentIndex", 0);
                    attachmentViewerData.set("objectIdIndex", 0);
                    attachmentViewerData.set("layerFeatureIndex", 0);
                });
                this._setFeaturePhotoCentric();
            }
            else {
                this._setAttachmentViewerData();
                this._setupDataWatchers();
                this._setupSocialSharing();
            }
        };
        // _sortFeatures
        PhotoCentricViewModel.prototype._sortFeatures = function (queriedFeatures, currentSet, attachmentViewerData) {
            var features = [];
            var objectIdField = attachmentViewerData.get("layerData.featureLayer.objectIdField");
            if (!queriedFeatures) {
                return;
            }
            queriedFeatures.features.forEach(function (feature) {
                var objectIdFromQuery = feature.attributes[objectIdField];
                currentSet.forEach(function (objectId, objectIdIndex) {
                    if (objectId === objectIdFromQuery &&
                        features.indexOf(features[objectIdIndex]) === -1) {
                        features[objectIdIndex] = feature;
                    }
                });
            });
            return features;
        };
        // _initializeSketch
        PhotoCentricViewModel.prototype._initializeSketch = function () {
            var _this = this;
            var _photoCentricHandles = this._photoCentricHandles;
            var selectFeaturesEnabled = "select-features-enabled";
            _photoCentricHandles.add(watchUtils.when(this, "selectFeaturesEnabled", function () {
                _photoCentricHandles.remove(selectFeaturesEnabled);
                var sketchWidgetInit = "sketch-widget-init";
                _photoCentricHandles.add(watchUtils.whenOnce(_this, "sketchWidget", function () {
                    _photoCentricHandles.remove(sketchWidgetInit);
                    _this._handleSketch();
                }), sketchWidgetInit);
            }), selectFeaturesEnabled);
        };
        // _handlesketch
        PhotoCentricViewModel.prototype._handleSketch = function () {
            var _this = this;
            var _a;
            var sketchWidgetKey = "sketch-widget";
            (_a = this._photoCentricHandles) === null || _a === void 0 ? void 0 : _a.add(watchUtils.when(this, "selectedAttachmentViewerData.layerData.featureLayer", function () {
                var _a;
                var _b = _this, sketchWidget = _b.sketchWidget, graphicsLayer = _b.graphicsLayer;
                _this._watchSketchCreateAndUpdate(sketchWidget, graphicsLayer);
                _this._watchSketchDelete(sketchWidget);
                (_a = _this._photoCentricHandles) === null || _a === void 0 ? void 0 : _a.remove(sketchWidgetKey);
            }), sketchWidgetKey);
        };
        // _watchSketchCreateAndUpdate
        PhotoCentricViewModel.prototype._watchSketchCreateAndUpdate = function (sketchWidget, graphicsLayer) {
            var _this = this;
            var _a;
            (_a = this._photoCentricHandles) === null || _a === void 0 ? void 0 : _a.add([
                sketchWidget.on("create", function (sketchEvent) {
                    if (_this.appMode === "map-centric") {
                        return;
                    }
                    _this._handleSketchEvent(sketchEvent, graphicsLayer);
                }),
                sketchWidget.on("update", function (sketchEvent) {
                    if (_this.appMode === "map-centric") {
                        return;
                    }
                    _this._handleSketchEvent(sketchEvent, graphicsLayer);
                })
            ]);
        };
        // _handleSketchEvent
        PhotoCentricViewModel.prototype._handleSketchEvent = function (sketchEvent, graphicsLayer) {
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
                this._currentSketchExtentPhotoCentric = geometry;
                this._queryFeaturesWithinSketchExtent(geometry);
                this._handleSketchFeatureEffect(geometry);
            }
        };
        // _watchSketchDelete
        PhotoCentricViewModel.prototype._watchSketchDelete = function (sketchWidget) {
            var _this = this;
            var _a;
            (_a = this._photoCentricHandles) === null || _a === void 0 ? void 0 : _a.add(sketchWidget.on("delete", function () {
                if (_this.appMode === "map-centric") {
                    return;
                }
                _this.attachmentViewerDataCollection.forEach(function (attachmentViewerData) {
                    attachmentViewerData.set("layerData.layerView.effect", null);
                });
                _this._currentSketchExtentPhotoCentric = null;
                _this.notifyChange("state");
                _this._initQueryObjectIdPromises(null, true);
            }));
        };
        // _generateSketchQuery
        PhotoCentricViewModel.prototype._generateSketchQuery = function (geometry, photoCentricData) {
            var attachmentObjectIds = this._getAttachmentObjectIds(photoCentricData);
            var where = this._createUpdatedDefinitionExpression(photoCentricData);
            var queryConfig = {
                outFields: ["*"],
                geometry: geometry,
                outSpatialReference: this.view.get("spatialReference"),
                where: where,
                returnGeometry: true
            };
            return attachmentObjectIds &&
                attachmentObjectIds.length > 0 &&
                this.onlyDisplayFeaturesWithAttachmentsIsEnabled
                ? tslib_1.__assign(tslib_1.__assign({}, queryConfig), { objectIds: tslib_1.__spreadArrays(attachmentObjectIds) }) : queryConfig;
        };
        // _handleSketchFeatureEffect
        PhotoCentricViewModel.prototype._handleSketchFeatureEffect = function (geometry) {
            this.attachmentViewerDataCollection.forEach(function (attachmentViewerData) {
                var layerView = attachmentViewerData.get("layerData.layerView");
                var featureEffect = new FeatureEffect({
                    filter: {
                        geometry: geometry
                    },
                    excludedEffect: "grayscale(100%) opacity(50%)"
                });
                layerView.set("effect", featureEffect);
            });
        };
        // _queryFeaturesWithinSketchExtent
        PhotoCentricViewModel.prototype._queryFeaturesWithinSketchExtent = function (sketchGeometry) {
            this._queryObjectIdPromises = [];
            this._initQueryObjectIdPromises(sketchGeometry);
        };
        // _detectFeatureClick
        PhotoCentricViewModel.prototype._detectFeatureClick = function () {
            var _this = this;
            return this.view.on("click", function (event) {
                if (_this.appMode === "map-centric") {
                    return;
                }
                if (_this.queryingState !== "ready") {
                    return;
                }
                if (!_this.imagePanZoomEnabled) {
                    if (_this.state !== "ready" || _this._performingHitTestPhotoCentric) {
                        return;
                    }
                }
                var view = _this.view;
                _this._performingHitTestPhotoCentric = view.hitTest(event);
                _this.notifyChange("state");
                _this._performingHitTestPhotoCentric.then(function (hitTestRes) {
                    _this._handleHitTestRes(hitTestRes);
                });
            });
        };
        // _handleHitTestRes
        PhotoCentricViewModel.prototype._handleHitTestRes = function (hitTestRes) {
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
                this._resetHitTestState();
                return;
            }
            var result = filteredResults[0];
            if (this._currentSketchExtentPhotoCentric) {
                var mapPoint = result && result.mapPoint;
                var containsPoint = this._currentSketchExtentPhotoCentric.contains(mapPoint);
                if (!containsPoint) {
                    this._resetHitTestState();
                    return;
                }
                var viewModel = this.sketchWidget.viewModel;
                if (result.graphic.layer === viewModel.layer) {
                    viewModel.update([result.graphic], {
                        tool: "transform"
                    });
                }
            }
            this._removeFeatureHighlight();
            this._resetHitTestState();
            var attachmentViewerData = this._getHitTestAttachmentViewerData(result);
            if (!attachmentViewerData) {
                return;
            }
            this.set("imageIsLoaded", false);
            var objectIdField = attachmentViewerData.layerData.featureLayer.objectIdField;
            var objectId = this._getHitTestGraphicObjectId(result, objectIdField);
            if (attachmentViewerData.featureObjectIds.indexOf(objectId) === -1) {
                this.set("imageIsLoaded", true);
                return;
            }
            if (hitTestRes.results.length) {
                this._setClickedFeature(hitTestRes, attachmentViewerData);
            }
            else {
                this.set("imageIsLoaded", true);
            }
        };
        // _resetHitTestState
        PhotoCentricViewModel.prototype._resetHitTestState = function () {
            this._performingHitTestPhotoCentric = null;
            this.notifyChange("state");
        };
        // _removeFeatureHighlight
        PhotoCentricViewModel.prototype._removeFeatureHighlight = function () {
            if (this.highlightedFeature.feature) {
                this.highlightedFeature.feature.remove();
                this.highlightedFeature.feature = null;
            }
        };
        // _getHitTestAttachmentViewerData
        PhotoCentricViewModel.prototype._getHitTestAttachmentViewerData = function (result) {
            return this.attachmentViewerDataCollection.find(function (attachmentViewerData) {
                return (attachmentViewerData.layerData.featureLayer.id ===
                    result.graphic.layer.id);
            });
        };
        // _getHitTestGraphicObjectId
        PhotoCentricViewModel.prototype._getHitTestGraphicObjectId = function (result, objectIdField) {
            return (result &&
                result.graphic &&
                result.graphic.attributes &&
                result.graphic.attributes[objectIdField]);
        };
        // _setClickedFeature
        PhotoCentricViewModel.prototype._setClickedFeature = function (hitTestRes, attachmentViewerData) {
            var featureLayer = attachmentViewerData.layerData.featureLayer;
            var detectedFeature = hitTestRes.results.filter(function (result) {
                var layer = result.graphic.layer;
                return layer.id === featureLayer.id;
            })[0].graphic;
            attachmentViewerData.set("selectedFeature", detectedFeature);
            if (featureLayer.id !== this.layerSwitcher.selectedLayer.id) {
                this.set("layerSwitcher.selectedLayer", featureLayer);
                this.set("layerSwitcher.selectedLayerId", featureLayer.id);
                this.set("selectedAttachmentViewerData", attachmentViewerData);
            }
            this.updateSelectedFeatureFromClickOrSearch(detectedFeature);
        };
        // _setSelectedFeature
        PhotoCentricViewModel.prototype._setSelectedFeature = function (selectedAttachmentViewerData) {
            var layerFeatures = selectedAttachmentViewerData.get("layerFeatures");
            var layerFeatureIndex = selectedAttachmentViewerData.get("layerFeatureIndex");
            var selectedFeature = layerFeatures.getItemAt(layerFeatureIndex);
            selectedAttachmentViewerData.set("selectedFeature", selectedFeature);
            return selectedFeature;
        };
        // _setFeatureWidget
        PhotoCentricViewModel.prototype._setFeatureWidget = function () {
            var _a;
            var featureWidget = new Feature({
                graphic: this.selectedAttachmentViewerData.selectedFeature,
                map: this.view.map,
                spatialReference: this.view.spatialReference
            });
            this.set("featureWidget", featureWidget);
            this.featureWidget.set("visibleElements.title", false);
            var featureWidgetKey = "feature-widget";
            (_a = this._photoCentricHandles) === null || _a === void 0 ? void 0 : _a.add(this._watchFeatureWidgetLoad(featureWidgetKey), featureWidgetKey);
        };
        // _watchFeatureWidgetLoad
        PhotoCentricViewModel.prototype._watchFeatureWidgetLoad = function (featureWidgetKey) {
            var _this = this;
            return watchUtils.whenOnce(this, "featureWidget.viewModel.content", function () {
                var _a;
                (_a = _this._photoCentricHandles) === null || _a === void 0 ? void 0 : _a.remove(featureWidgetKey);
                _this._setupFeatureWidgetContent();
            });
        };
        // _setupFeatureWidgetContent
        PhotoCentricViewModel.prototype._setupFeatureWidgetContent = function () {
            this.setFeatureInfo(this.featureWidget);
            var layerAttachments = this._extractLayerAttachments();
            if (!layerAttachments) {
                return;
            }
            this._setupFeatureAttachments(layerAttachments);
        };
        // _setupFeatureAttachments
        PhotoCentricViewModel.prototype._setupFeatureAttachments = function (layerAttachments) {
            var currentIndex = null;
            var attachmentExists = this._checkExistingAttachment();
            if (this.socialSharingEnabled &&
                this.attachmentIndex !== null &&
                attachmentExists) {
                this.set("selectedAttachmentViewerData.attachmentIndex", this.attachmentIndex);
                currentIndex = this.attachmentIndex;
                this.set("attachmentIndex", null);
            }
            else {
                this.set("selectedAttachmentViewerData.attachmentIndex", 0);
                currentIndex = 0;
            }
            var featureAttachments = this._sortFeatureAttachments(layerAttachments);
            var attachmentsArr = featureAttachments && featureAttachments.length > 0
                ? featureAttachments
                : [];
            var attachments = new Collection(tslib_1.__spreadArrays(attachmentsArr));
            var selectedFeatureAttachments = new SelectedFeatureAttachments({
                attachments: attachments,
                currentIndex: currentIndex
            });
            if (attachments.length === 0) {
                this.set("imageIsLoaded", true);
            }
            this.set("selectedAttachmentViewerData.selectedFeatureAttachments", selectedFeatureAttachments);
        };
        // _checkExistingAttachment
        PhotoCentricViewModel.prototype._checkExistingAttachment = function () {
            var _a = this.selectedAttachmentViewerData, attachments = _a.attachments, layerData = _a.layerData, selectedFeature = _a.selectedFeature;
            var attributes = selectedFeature.attributes;
            var objectIdField = layerData.featureLayer.objectIdField;
            var objectId = attributes[objectIdField];
            var featureAttachments = attachments === null || attachments === void 0 ? void 0 : attachments[objectId];
            var currentAttachment = featureAttachments && featureAttachments[this.attachmentIndex];
            return !!currentAttachment;
        };
        // _extractLayerAttachments
        PhotoCentricViewModel.prototype._extractLayerAttachments = function () {
            var attributes = this.get("featureWidget.graphic.attributes");
            var objectIdField = this.get("selectedAttachmentViewerData.layerData.featureLayer.objectIdField");
            var objectId = attributes && attributes[objectIdField];
            var attachments = this.get("selectedAttachmentViewerData.attachments");
            var layerAttachments = attachments && attachments[objectId];
            return layerAttachments ? layerAttachments : [];
        };
        // _sortFeatureAttachments
        PhotoCentricViewModel.prototype._sortFeatureAttachments = function (layerAttachments) {
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
        // _goToSelectedFeature
        PhotoCentricViewModel.prototype._goToSelectedFeature = function () {
            var selectedFeature = this.selectedAttachmentViewerData.selectedFeature;
            if (selectedFeature) {
                this.view.goTo({
                    target: selectedFeature
                });
            }
        };
        // _handleSearchWidgets
        PhotoCentricViewModel.prototype._handleSearchWidgets = function () {
            var _this = this;
            return watchUtils.whenOnce(this, ["searchWidget"], function () {
                var _a;
                _this.searchWidget.popupEnabled = false;
                (_a = _this._photoCentricHandles) === null || _a === void 0 ? void 0 : _a.add(_this._watchSelectedSearchResults());
            });
        };
        // _watchSelectedSearchResults
        PhotoCentricViewModel.prototype._watchSelectedSearchResults = function () {
            var _this = this;
            return watchUtils.watch(this, ["searchWidget.viewModel.selectedResult"], function () {
                var searchWidget = _this.searchWidget;
                if (searchWidget) {
                    var selectedFeatureResult = searchWidget.get("viewModel.selectedResult.feature");
                    if (!selectedFeatureResult) {
                        return;
                    }
                    var selectedFeatureResultId_1 = selectedFeatureResult &&
                        selectedFeatureResult.get("layer.id");
                    var selectedLayerId = _this.get("selectedAttachmentViewerData.layerData.featureLayer.id");
                    if (selectedFeatureResultId_1 !== selectedLayerId) {
                        var updatedAttachmentViewerData = _this.attachmentViewerDataCollection.find(function (attachmentViewerData) {
                            return (attachmentViewerData.layerData.featureLayer.id ===
                                selectedFeatureResultId_1);
                        });
                        if (!updatedAttachmentViewerData) {
                            return;
                        }
                        var updatedLayer = updatedAttachmentViewerData.get("layerData.featureLayer");
                        _this.set("layerSwitcher.selectedLayer", updatedLayer);
                        _this.set("layerSwitcher.selectedLayerId", updatedLayer.id);
                        _this.set("selectedAttachmentViewerData", updatedAttachmentViewerData);
                        updatedAttachmentViewerData.set("selectedFeature", selectedFeatureResult);
                    }
                    _this.updateSelectedFeatureFromClickOrSearch(selectedFeatureResult);
                }
            });
        };
        // _setupSocialSharing
        PhotoCentricViewModel.prototype._setupSocialSharing = function () {
            var _this = this;
            var _a;
            var socialsharing = "social-sharing";
            (_a = this._photoCentricHandles) === null || _a === void 0 ? void 0 : _a.add(watchUtils.when(this, "socialSharingEnabled", function () {
                var _a;
                (_a = _this._photoCentricHandles) === null || _a === void 0 ? void 0 : _a.remove(socialsharing);
                _this.setupShare();
            }), socialsharing);
        };
        // _setAttachmentViewerData
        PhotoCentricViewModel.prototype._setAttachmentViewerData = function () {
            var _a = this, selectedLayerId = _a.selectedLayerId, socialSharingEnabled = _a.socialSharingEnabled;
            var photoCentricDataCollection = this
                .attachmentViewerDataCollection;
            var attachmentViewerData = this._getAttachmentViewerData(selectedLayerId, socialSharingEnabled, photoCentricDataCollection);
            if (!attachmentViewerData) {
                return;
            }
            var featureLayer = attachmentViewerData.layerData.featureLayer;
            if ((selectedLayerId && socialSharingEnabled) ||
                !this._currentSketchExtentPhotoCentric) {
                this.set("layerSwitcher.selectedLayer", featureLayer);
            }
            this.set("layerSwitcher.selectedLayerId", featureLayer.id);
            this.set("selectedAttachmentViewerData", attachmentViewerData);
        };
        // _getAttachmentViewerData
        PhotoCentricViewModel.prototype._getAttachmentViewerData = function (selectedLayerId, socialSharingEnabled, attachmentViewerDataCollection) {
            var dataThatSupportsAttachments = attachmentViewerDataCollection.find(function (attachmentViewerData) {
                return attachmentViewerData.layerData.featureLayer.capabilities.data
                    .supportsAttachment;
            });
            return selectedLayerId && socialSharingEnabled
                ? attachmentViewerDataCollection.find(function (attachmentViewerData) {
                    var id = attachmentViewerData.layerData.featureLayer.id;
                    return id === selectedLayerId;
                })
                : dataThatSupportsAttachments
                    ? dataThatSupportsAttachments
                    : attachmentViewerDataCollection.getItemAt(0);
        };
        // _setupDataWatchers
        PhotoCentricViewModel.prototype._setupDataWatchers = function () {
            var _this = this;
            var _photoCentricHandles = this._photoCentricHandles;
            var setupDataWatchers = "setup-data-watchers";
            if (_photoCentricHandles.has(setupDataWatchers)) {
                _photoCentricHandles.remove(setupDataWatchers);
            }
            _photoCentricHandles.add([
                this._handleSearchWidgets(),
                watchUtils.watch(this, "selectedAttachmentViewerData.selectedFeature", function () {
                    _this._goToSelectedFeature();
                })
            ], setupDataWatchers);
        };
        // _updateIndexData
        PhotoCentricViewModel.prototype._updateIndexData = function (queryType, objectId) {
            var selectedAttachmentViewerData = this
                .selectedAttachmentViewerData;
            this._updateLayerFeatureAndObjectIdIndexes(selectedAttachmentViewerData, queryType, objectId);
            this._highlightFeature(selectedAttachmentViewerData.layerFeatureIndex);
            var selectedAttachmentViewerDataIndex = this.get("selectedAttachmentViewerData.attachmentIndex");
            var attachmentIndex = selectedAttachmentViewerDataIndex
                ? selectedAttachmentViewerDataIndex
                : 0;
            this.set("selectedAttachmentViewerData.attachmentIndex", attachmentIndex);
        };
        // _updateLayerFeatureAndObjectIdIndexes
        PhotoCentricViewModel.prototype._updateLayerFeatureAndObjectIdIndexes = function (selectedAttachmentViewerData, queryType, objectId) {
            if (!selectedAttachmentViewerData) {
                return;
            }
            var layerFeatures = selectedAttachmentViewerData.layerFeatures, featureObjectIds = selectedAttachmentViewerData.featureObjectIds;
            if (queryType === "updatingNext") {
                selectedAttachmentViewerData.layerFeatureIndex = 0;
                selectedAttachmentViewerData.objectIdIndex += 1;
            }
            else if (queryType === "updatingPrevious") {
                selectedAttachmentViewerData.layerFeatureIndex = layerFeatures.length - 1;
                selectedAttachmentViewerData.objectIdIndex -= 1;
            }
            else if (queryType === "restartNext") {
                selectedAttachmentViewerData.layerFeatureIndex = 0;
                selectedAttachmentViewerData.objectIdIndex = 0;
            }
            else if (queryType === "restartPrevious") {
                selectedAttachmentViewerData.layerFeatureIndex = layerFeatures.length - 1;
                selectedAttachmentViewerData.objectIdIndex = featureObjectIds.length - 1;
            }
            else if (queryType === "updatingClick") {
                this._updateFeatureClick(objectId);
            }
            else if (queryType === "share") {
                this._updateFeatureFromShare();
            }
        };
        // _setFeaturePhotoCentric
        PhotoCentricViewModel.prototype._setFeaturePhotoCentric = function () {
            var selectedAttachmentViewerData = this.get("selectedAttachmentViewerData");
            if (!selectedAttachmentViewerData) {
                return;
            }
            var selectedFeature = this._setSelectedFeature(selectedAttachmentViewerData);
            if (selectedFeature) {
                this.getAddress(selectedFeature.geometry);
            }
            this._setSelectedFeatureHighlight(selectedAttachmentViewerData, selectedFeature);
            this._setFeatureWidget();
        };
        // _setSelectedFeatureHighlight
        PhotoCentricViewModel.prototype._setSelectedFeatureHighlight = function (selectedAttachmentViewerData, selectedFeature) {
            this._removeFeatureHighlight();
            var layerView = selectedAttachmentViewerData.layerData.layerView;
            this.highlightedFeature.feature = layerView.highlight(selectedFeature);
        };
        // ----------------------------------
        //
        //  SCROLL FEATURES
        //
        // ----------------------------------
        // previousFeature
        PhotoCentricViewModel.prototype.previousFeature = function () {
            var selectedAttachmentViewerData = this
                .selectedAttachmentViewerData;
            if (selectedAttachmentViewerData.layerFeatureIndex - 1 === -1) {
                this._updateFeatureData("updatingPrevious");
            }
            else {
                selectedAttachmentViewerData.layerFeatureIndex -= 1;
                selectedAttachmentViewerData.objectIdIndex -= 1;
                this._setFeaturePhotoCentric();
            }
            this.set("selectedAttachmentViewerData.selectedFeatureAttachments", null);
            this._highlightFeature(selectedAttachmentViewerData.layerFeatureIndex);
            this.setUpdateShareIndexes();
        };
        // nextFeature
        PhotoCentricViewModel.prototype.nextFeature = function () {
            var selectedAttachmentViewerData = this
                .selectedAttachmentViewerData;
            if (selectedAttachmentViewerData.layerFeatureIndex ===
                selectedAttachmentViewerData.layerFeatures.length - 1) {
                this._updateFeatureData("updatingNext");
            }
            else {
                selectedAttachmentViewerData.layerFeatureIndex += 1;
                selectedAttachmentViewerData.objectIdIndex += 1;
                this._setFeaturePhotoCentric();
            }
            this.set("selectedAttachmentViewerData.selectedFeatureAttachments", null);
            this._highlightFeature(selectedAttachmentViewerData.layerFeatureIndex);
            this.setUpdateShareIndexes();
        };
        // _updateFeatureData
        PhotoCentricViewModel.prototype._updateFeatureData = function (updatingType) {
            var selectedAttachmentViewerData = this
                .selectedAttachmentViewerData;
            var featureTotal = selectedAttachmentViewerData.get("featureObjectIds.length");
            if (featureTotal === selectedAttachmentViewerData.objectIdIndex + 1) {
                selectedAttachmentViewerData.queryRange = [0, 10];
                this._queryFeaturesForSelectedAttachmentViewerData("restartNext");
                return;
            }
            if (selectedAttachmentViewerData.objectIdIndex - 1 === -1) {
                var low = Math.floor(featureTotal / 10) * 10 - 10;
                selectedAttachmentViewerData.queryRange = [low, featureTotal];
                this._queryFeaturesForSelectedAttachmentViewerData("restartPrevious");
                return;
            }
            if (updatingType === "updatingNext") {
                this._updateQueryRange("updatingNext");
                this._queryFeaturesForSelectedAttachmentViewerData("updatingNext");
            }
            else if (updatingType === "updatingPrevious") {
                this._updateQueryRange("updatingPrevious");
                this._queryFeaturesForSelectedAttachmentViewerData("updatingPrevious");
            }
        };
        // If feature does not exist in current queried layer features, the query range will be updated
        // _updateQueryRange
        PhotoCentricViewModel.prototype._updateQueryRange = function (updatingType, objectIdIndex) {
            var floor = Math.floor(objectIdIndex / 10) * 10;
            var ceil = Math.ceil(objectIdIndex / 10) * 10;
            var queryRange = this.selectedAttachmentViewerData.get("queryRange");
            // Update query range to query for next 10 features
            if (updatingType === "updatingNext") {
                var currentLow = queryRange[0];
                var updatedLow = queryRange[0] === 0 ? 10 : Math.round(currentLow / 10) * 10 + 10;
                var updatedHigh = updatedLow + 10;
                queryRange[0] = updatedLow;
                queryRange[1] = updatedHigh;
            }
            // Update query range to query for previous 10 features
            else if (updatingType === "updatingPrevious") {
                var currentLow = queryRange[0];
                var updatedHigh = currentLow;
                var updatedLow = Math.floor(currentLow / 10) * 10 - 10;
                queryRange[0] = updatedLow;
                queryRange[1] = updatedHigh;
            }
            // Update query range to query for 10 features relative to feature that was clicked
            else if (updatingType === "updatingClick" &&
                (objectIdIndex || objectIdIndex === 0)) {
                var updatedLow = floor;
                var updatedHigh = objectIdIndex % 10 === 0 ? ceil + 10 : ceil;
                queryRange[0] = updatedLow;
                queryRange[1] = updatedHigh;
            }
            // Update query range based on defaultObjectId from share widget
            else if (updatingType === "share" && this.defaultObjectId) {
                var defaultObjectIdIndex = this.selectedAttachmentViewerData.featureObjectIds.indexOf(this.defaultObjectId);
                var objectIdIndex_1 = defaultObjectIdIndex !== -1 ? defaultObjectIdIndex : 0;
                var shareFloor = Math.floor(objectIdIndex_1 / 10) * 10;
                var shareCeil = Math.ceil(objectIdIndex_1 / 10) * 10;
                var updatedLow = shareFloor;
                var updatedHigh = objectIdIndex_1 % 10 === 0 ? shareCeil + 10 : shareCeil;
                queryRange[0] = updatedLow;
                queryRange[1] = updatedHigh;
            }
        };
        // _setupFeatureQuery
        PhotoCentricViewModel.prototype._setupFeatureQuery = function (attachmentViewerData) {
            var order = this.order;
            var featureLayer = attachmentViewerData.layerData.featureLayer;
            // Query for features only within the set query range
            var _a = attachmentViewerData.queryRange, low = _a[0], high = _a[1];
            var updatedLow = low < 0 ? 0 : low;
            var currentSet = attachmentViewerData.featureObjectIds.slice(updatedLow, high);
            var objectIdField = featureLayer.objectIdField;
            var fieldOrder = order ? order : "ASC";
            var orderByFieldsValue = attachmentViewerData.get("sortField")
                ? [attachmentViewerData.get("sortField") + " " + fieldOrder]
                : [objectIdField + " " + fieldOrder];
            var outSpatialReference = this.view && this.view.spatialReference
                ? this.view.spatialReference
                : null;
            var definitionExpression = attachmentViewerData.get("defaultLayerExpression");
            var where = definitionExpression ? definitionExpression : "1=1";
            var queryConfig = {
                objectIds: currentSet.toArray(),
                outFields: ["*"],
                orderByFields: orderByFieldsValue,
                where: where,
                returnGeometry: true,
                outSpatialReference: outSpatialReference
            };
            return new Query(queryConfig);
        };
        // _updateFeatureFromShare
        PhotoCentricViewModel.prototype._updateFeatureFromShare = function () {
            var selectedAttachmentViewerData = this
                .selectedAttachmentViewerData;
            var defaultObjectId = this.defaultObjectId;
            var featureLayer = this.selectedAttachmentViewerData.layerData.featureLayer;
            var objectIdField = featureLayer.objectIdField;
            var layerFeatureIndex = selectedAttachmentViewerData.layerFeatures.indexOf(selectedAttachmentViewerData.layerFeatures.find(function (layerFeature) {
                return layerFeature &&
                    layerFeature.attributes[objectIdField] === defaultObjectId;
            }));
            var objectIdIndex = this.selectedAttachmentViewerData.featureObjectIds.indexOf(defaultObjectId);
            selectedAttachmentViewerData.layerFeatureIndex =
                layerFeatureIndex !== -1 ? layerFeatureIndex : 0;
            selectedAttachmentViewerData.objectIdIndex =
                objectIdIndex !== -1 ? objectIdIndex : 0;
        };
        // ----------------------------------
        //
        //  Highlight
        //
        // ----------------------------------
        // _highlightFeature
        PhotoCentricViewModel.prototype._highlightFeature = function (layerFeatureIndex) {
            this._removeFeatureHighlight();
            var layerFeatures = this.selectedAttachmentViewerData.get("layerFeatures");
            var selectedFeature = this.selectedAttachmentViewerData.get("selectedFeature");
            var feature = layerFeatureIndex || layerFeatureIndex === 0
                ? layerFeatures.getItemAt(layerFeatureIndex)
                : selectedFeature;
            var layerView = this.selectedAttachmentViewerData.get("layerData.layerView");
            this.highlightedFeature.feature =
                layerView && feature && layerView.highlight(feature);
        };
        // updateSelectedFeatureFromClickOrSearch
        PhotoCentricViewModel.prototype.updateSelectedFeatureFromClickOrSearch = function (feature) {
            var _a = this
                .selectedAttachmentViewerData, featureObjectIds = _a.featureObjectIds, selectedFeature = _a.selectedFeature, layerFeatures = _a.layerFeatures;
            var featureLayer = this.selectedAttachmentViewerData.layerData.featureLayer;
            var objectIdField = featureLayer.objectIdField;
            if (!selectedFeature) {
                return;
            }
            var layerFeature = layerFeatures.find(function (layerFeature) {
                return (layerFeature.attributes[objectIdField] ===
                    feature.attributes[objectIdField]);
            });
            var layerFeatureIndex = layerFeatures.indexOf(layerFeature);
            var objectId = featureObjectIds.find(function (objectId) {
                return feature.attributes[objectIdField] === objectId;
            });
            this.set("currentImageUrl", null);
            // If layer feature exists in current queried feature list, do not update query range or re-query features
            if (layerFeatureIndex !== -1) {
                this.set("selectedAttachmentViewerData.layerFeatureIndex", layerFeatureIndex);
                this.set("selectedAttachmentViewerData.objectIdIndex", this.selectedAttachmentViewerData.featureObjectIds.indexOf(objectId));
                this._setFeaturePhotoCentric();
                this._highlightFeature(this.selectedAttachmentViewerData
                    .layerFeatureIndex);
                this.setUpdateShareIndexes();
                return;
            }
            var objectIdIndex = featureObjectIds.indexOf(objectId);
            this._updateQueryRange("updatingClick", objectIdIndex);
            this._queryFeaturesForSelectedAttachmentViewerData("updatingClick", objectId);
        };
        // _queryFeaturesForSelectedAttachmentViewerData
        PhotoCentricViewModel.prototype._queryFeaturesForSelectedAttachmentViewerData = function (queryType, objectIdIndex) {
            var _this = this;
            var selectedAttachmentViewerData = this
                .selectedAttachmentViewerData;
            this.set("layerSwitcher.selectedLayer", selectedAttachmentViewerData.layerData.featureLayer);
            var layerFeatures = selectedAttachmentViewerData.get("layerFeatures");
            var featureLayer = this.selectedAttachmentViewerData.layerData.featureLayer;
            var featureQuery = this._setupFeatureQuery(selectedAttachmentViewerData);
            this._queryingFeatures = featureLayer.queryFeatures(featureQuery);
            this._queryingFeatures
                .catch(function (err) {
                console.error("ERROR: ", err);
            })
                .then(function (queriedFeatures) {
                _this._queryingFeatures = null;
                _this.notifyChange("queryingState");
                // Reset features
                layerFeatures.removeAll();
                var _a = selectedAttachmentViewerData.queryRange, low = _a[0], high = _a[1];
                var featureObjectIds = selectedAttachmentViewerData.get("featureObjectIds");
                var currentSet = featureObjectIds.slice(low, high);
                // Sort features
                var features = _this._sortFeatures(queriedFeatures, currentSet, selectedAttachmentViewerData);
                // Add features to layerFeatures prop
                layerFeatures.addMany(features);
                var layerFeatureIndex = selectedAttachmentViewerData.get("layerFeatureIndex");
                selectedAttachmentViewerData.set("layerFeatureIndex", layerFeatureIndex !== null ? layerFeatureIndex : 0);
                _this._updateIndexData(queryType, objectIdIndex);
                _this.setUpdateShareIndexes();
                _this._setFeaturePhotoCentric();
            });
            this.notifyChange("queryingState");
        };
        // _updateFeatureClick
        PhotoCentricViewModel.prototype._updateFeatureClick = function (objectId) {
            var selectedAttachmentViewerData = this
                .selectedAttachmentViewerData;
            var layerFeatures = this
                .selectedAttachmentViewerData.layerFeatures;
            var featureLayer = this.selectedAttachmentViewerData.layerData.featureLayer;
            selectedAttachmentViewerData.layerFeatureIndex = layerFeatures.indexOf(layerFeatures.find(function (layerFeature) {
                return layerFeature.attributes[featureLayer.objectIdField] === objectId;
            }));
            selectedAttachmentViewerData.objectIdIndex = this.selectedAttachmentViewerData.featureObjectIds.indexOf(objectId);
            if (featureLayer.get("capabilities.data.supportsAttachment")) {
                this.set("imageIsLoaded", false);
            }
        };
        tslib_1.__decorate([
            decorators_1.property({
                dependsOn: ["view.ready", "imageIsLoaded"],
                readOnly: true
            })
        ], PhotoCentricViewModel.prototype, "queryingState", null);
        tslib_1.__decorate([
            decorators_1.property()
        ], PhotoCentricViewModel.prototype, "currentImageUrl", void 0);
        tslib_1.__decorate([
            decorators_1.property()
        ], PhotoCentricViewModel.prototype, "attachmentLayers", void 0);
        tslib_1.__decorate([
            decorators_1.property()
        ], PhotoCentricViewModel.prototype, "imagePanZoomEnabled", void 0);
        tslib_1.__decorate([
            decorators_1.property()
        ], PhotoCentricViewModel.prototype, "order", void 0);
        tslib_1.__decorate([
            decorators_1.property()
        ], PhotoCentricViewModel.prototype, "defaultObjectId", void 0);
        tslib_1.__decorate([
            decorators_1.property()
        ], PhotoCentricViewModel.prototype, "attachmentIndex", void 0);
        tslib_1.__decorate([
            decorators_1.property()
        ], PhotoCentricViewModel.prototype, "selectedLayerId", void 0);
        tslib_1.__decorate([
            decorators_1.property()
        ], PhotoCentricViewModel.prototype, "highlightedFeature", void 0);
        PhotoCentricViewModel = tslib_1.__decorate([
            decorators_1.subclass("PhotoCentricViewModel")
        ], PhotoCentricViewModel);
        return PhotoCentricViewModel;
    }(AttachmentViewerViewModel));
    return PhotoCentricViewModel;
});
//# sourceMappingURL=PhotoCentricViewModel.js.map