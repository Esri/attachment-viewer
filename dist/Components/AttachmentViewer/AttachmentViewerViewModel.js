/// <amd-dependency path="esri/core/tsSupport/declareExtendsHelper" name="__extends" />
/// <amd-dependency path="esri/core/tsSupport/decorateHelper" name="__decorate" />
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
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
define(["require", "exports", "esri/core/tsSupport/declareExtendsHelper", "esri/core/tsSupport/decorateHelper", "esri/core/Accessor", "esri/core/accessorSupport/decorators", "esri/core/watchUtils", "esri/core/Handles", "esri/core/Collection", "esri/tasks/support/Query", "esri/tasks/Locator", "esri/widgets/Feature", "../Share/Share", "../Share/Share/ShareFeatures", "esri/geometry/Point"], function (require, exports, __extends, __decorate, Accessor, decorators_1, watchUtils, Handles, Collection, Query, Locator, Feature, Share, ShareFeatures, Point) {
    "use strict";
    var AttachmentViewerViewModel = /** @class */ (function (_super) {
        __extends(AttachmentViewerViewModel, _super);
        function AttachmentViewerViewModel() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this._handles = new Handles();
            _this._highlightedFeature = null;
            _this._preparingDownload = null;
            _this._selectedLayerSupportsAttachments = null;
            _this._queryRange = [0, 10];
            _this._sortField = null;
            _this._queryingForFeatures = null;
            _this._queryingForObjectIDs = null;
            _this._performingHitTest = null;
            _this._updateShareIndexes = null;
            //----------------------------------
            //
            //  Properties
            //
            //----------------------------------
            // view
            _this.view = null;
            // searchWidget
            _this.searchWidget = null;
            // title
            _this.title = null;
            // selectedFeatureInfo
            _this.selectedFeatureInfo = null;
            // selectedFeatureAttachments
            _this.selectedFeatureAttachments = null;
            // featureLayerTitle
            _this.featureLayerTitle = null;
            // layerFeatures
            _this.layerFeatures = new Collection();
            // selectedFeature
            _this.selectedFeature = null;
            // layerFeatureIndex
            _this.layerFeatureIndex = null;
            // attachmentIndex
            _this.attachmentIndex = null;
            // layerView
            _this.layerView = null;
            // featureLayer
            _this.featureLayer = null;
            // imageIsLoaded
            _this.imageIsLoaded = null;
            // socialSharingEnabled
            _this.socialSharingEnabled = null;
            // shareLocationWidget
            _this.shareLocationWidget = null;
            // selectedFeatureAddress
            _this.selectedFeatureAddress = null;
            // attachmentLayer
            _this.attachmentLayer = null;
            // order
            _this.order = null;
            // defaultObjectId
            _this.defaultObjectId = null;
            // featureObjectIds
            _this.featureObjectIds = new Collection();
            // featureTotal
            _this.featureTotal = null;
            // objectIdIndex
            _this.objectIdIndex = 0;
            // downloadEnabled
            _this.downloadEnabled = null;
            // featureWidget
            _this.featureWidget = null;
            // zoomLevel
            _this.zoomLevel = null;
            // addressEnabled
            _this.addressEnabled = null;
            // unsupportedAttachmentTypes
            _this.unsupportedAttachmentTypes = [];
            // tempLayers
            _this.tempLayers = new Collection();
            return _this;
        }
        Object.defineProperty(AttachmentViewerViewModel.prototype, "state", {
            //----------------------------------
            //
            //  Private Variables
            //
            //----------------------------------
            //----------------------------------
            //
            //  state - readOnly
            //
            //----------------------------------
            get: function () {
                var ready = this.get("view.ready");
                return ready
                    ? this._performingHitTest
                        ? "performingHitTest"
                        : this._queryingForFeatures || this._queryingForObjectIDs
                            ? "querying"
                            : this._preparingDownload
                                ? "downloading"
                                : !this.imageIsLoaded
                                    ? "imageLoading"
                                    : "ready"
                    : this.view
                        ? "loading"
                        : "disabled";
            },
            enumerable: true,
            configurable: true
        });
        //----------------------------------
        //
        //  Lifecycle
        //
        //----------------------------------
        AttachmentViewerViewModel.prototype.initialize = function () {
            var _this = this;
            this._initializeLayer();
            this._initializeData();
            this._initializeFirstFeature();
            var socialsharing = "social-sharing";
            this._handles.add(watchUtils.when(this, "socialSharingEnabled", function () {
                _this._handles.remove(socialsharing);
                _this._setupShare();
            }));
            this._setupDataWatchers();
        };
        AttachmentViewerViewModel.prototype.destroy = function () {
            this._handles.removeAll();
            this._handles = null;
        };
        //----------------------------------
        //
        //  INITIAL SET UP
        //
        //----------------------------------
        // _initializeLayer
        AttachmentViewerViewModel.prototype._initializeLayer = function () {
            var _this = this;
            var setupLayerKey = "setup-layer-key";
            this._handles.add(watchUtils.whenOnce(this, "view.ready", function () {
                _this._layerLoadCheck();
                _this._setupLayer();
                _this._handles.remove(setupLayerKey);
            }), setupLayerKey);
        };
        // _layerLoadCheck
        AttachmentViewerViewModel.prototype._layerLoadCheck = function () {
            var _this = this;
            var layers = this.view.map.layers;
            var tempLayers = "temp-layers";
            this._handles.add(watchUtils.on(this, "tempLayers", "change", function () {
                if (_this.tempLayers.length === layers.length) {
                    _this._handles.remove(tempLayers);
                    // Find layer that supports attachments
                    var supportsAttachment = layers.filter(function (layer) {
                        return layer.get("capabilities.data.supportsAttachment");
                    });
                    // If none support attachments, set the first visible layer to still view feature content
                    if (supportsAttachment.length === 0) {
                        var visibleLayer = layers.find(function (layer) {
                            return layer.visible;
                        });
                        _this.set("featureLayer", visibleLayer);
                        layers.forEach(function (layer) {
                            layer.set("popupEnabled", false);
                        });
                        _this.imageIsLoaded = true;
                    }
                    // Otherwise, get first feature layer that supports feature attachments
                    else {
                        layers.forEach(function (layer) {
                            if (layer.get("capabilities.data.supportsAttachment") &&
                                !_this.featureLayer) {
                                _this._selectedLayerSupportsAttachments = layer.get("capabilities.data.supportsAttachment");
                                _this.set("featureLayer", layer);
                            }
                            layer.set("popupEnabled", false);
                        });
                    }
                    _this._handles.remove(tempLayers);
                }
            }), tempLayers);
        };
        // _setupLayer
        AttachmentViewerViewModel.prototype._setupLayer = function () {
            var _this = this;
            var layers = this.view.map.layers;
            var attachmentLayer = this.attachmentLayer;
            if (attachmentLayer && attachmentLayer.id) {
                var selectedLayer = layers.find(function (layer) {
                    return layer.id === attachmentLayer.id;
                });
                if (selectedLayer) {
                    selectedLayer.when(function (layer) {
                        _this._selectedLayerSupportsAttachments = layer.get("capabilities.data.supportsAttachment");
                        _this.set("featureLayer", layer);
                        layers.forEach(function (layer) {
                            layer.set("popupEnabled", false);
                        });
                    });
                }
                else {
                    this._initializeDefaultLayer();
                }
            }
            else {
                this._initializeDefaultLayer();
            }
        };
        AttachmentViewerViewModel.prototype._initializeDefaultLayer = function () {
            var _this = this;
            var layers = this.view.map.layers;
            layers.forEach(function (layer) {
                layer.when(function () {
                    _this.tempLayers.add(layer);
                });
            });
        };
        // _initializeData
        AttachmentViewerViewModel.prototype._initializeData = function () {
            var _this = this;
            var initialSetupKey = "initial-setup-key";
            this._handles.add(watchUtils.whenOnce(this, "featureLayer", function () {
                if (_this.attachmentLayer) {
                    _this._sortField =
                        _this.attachmentLayer.fields[0] &&
                            _this.featureLayer.getField(_this.attachmentLayer.fields[0].fields[0])
                            ? _this.attachmentLayer.fields[0].fields[0]
                            : _this.featureLayer.objectIdField;
                }
                _this._initialSetup();
                _this._handles.remove(initialSetupKey);
            }), initialSetupKey);
        };
        // _initialSetup
        AttachmentViewerViewModel.prototype._initialSetup = function () {
            var _this = this;
            this.view
                .whenLayerView(this.featureLayer)
                .then(function (layerView) {
                _this.set("layerView", layerView);
                _this._detectFeatureClick();
                _this._queryObjectIds();
            });
        };
        // _setupShare
        AttachmentViewerViewModel.prototype._setupShare = function () {
            var _this = this;
            var setupShare = "setup-share";
            this._handles.add(watchUtils.whenOnce(this, "view", function () {
                var shareFeatures = new ShareFeatures({
                    copyToClipboard: true,
                    embedMap: false
                });
                _this.shareLocationWidget = new Share({
                    view: _this.view,
                    shareFeatures: shareFeatures,
                    container: document.createElement("div")
                });
                _this._handles.remove(setupShare);
            }), setupShare);
        };
        //----------------------------------
        //
        //  SCROLL IMAGES
        //
        //----------------------------------
        // previousImage
        AttachmentViewerViewModel.prototype.previousImage = function () {
            var selectedFeatureAttachments = this.selectedFeatureAttachments;
            // When a user is scrolling before first image, set displayed image to the last image
            if (selectedFeatureAttachments.currentIndex === 0) {
                selectedFeatureAttachments.currentIndex =
                    selectedFeatureAttachments.attachments.length - 1;
            }
            // Go back one image
            else {
                selectedFeatureAttachments.currentIndex -= 1;
            }
            this.set("attachmentIndex", selectedFeatureAttachments.currentIndex);
        };
        // nextImage
        AttachmentViewerViewModel.prototype.nextImage = function () {
            var selectedFeatureAttachments = this.selectedFeatureAttachments;
            var currentIndex = selectedFeatureAttachments.currentIndex, attachments = selectedFeatureAttachments.attachments;
            // When a user is scrolling after last image, set displayed image to the first image
            if (currentIndex < attachments.length - 1) {
                selectedFeatureAttachments.currentIndex += 1;
            }
            // Go forward one image
            else {
                selectedFeatureAttachments.currentIndex = 0;
            }
            this.set("attachmentIndex", selectedFeatureAttachments.currentIndex);
        };
        //----------------------------------
        //
        //  SCROLL FEATURES
        //
        //----------------------------------
        // previousFeature
        AttachmentViewerViewModel.prototype.previousFeature = function () {
            // When user scrolls before first queried feature, update the query feature list
            if (this.layerFeatureIndex - 1 === -1) {
                this._updateFeatureData("updatingPrevious");
            }
            // Go back one featutre
            else {
                this.layerFeatureIndex -= 1;
                this.objectIdIndex -= 1;
            }
            this._highlightFeature(this.layerFeatureIndex);
            this._setUpdateShareIndexes();
        };
        // nextFeature
        AttachmentViewerViewModel.prototype.nextFeature = function () {
            // When user scrolls after last queried feature, update the query feature list
            if (this.layerFeatureIndex === this.layerFeatures.length - 1) {
                this._updateFeatureData("updatingNext");
            }
            // Go forward one featutre
            else {
                this.layerFeatureIndex += 1;
                this.objectIdIndex += 1;
            }
            this._highlightFeature(this.layerFeatureIndex);
            this._setUpdateShareIndexes();
        };
        // getTotalNumberOfAttachments
        AttachmentViewerViewModel.prototype.getTotalNumberOfAttachments = function () {
            var selectedFeatureAttachments = this.selectedFeatureAttachments;
            if (selectedFeatureAttachments) {
                var attachments = selectedFeatureAttachments.attachments;
                return attachments && attachments.hasOwnProperty("length")
                    ? attachments.length
                    : null;
            }
        };
        // Get Address for selected feature -- ONLY WORKS ON POINTS
        AttachmentViewerViewModel.prototype._getAddress = function (geometry) {
            var _this = this;
            if (geometry.type !== "point") {
                return;
            }
            var point = new Point(geometry);
            var locator = new Locator({
                url: "https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer"
            });
            locator
                .locationToAddress({ location: point })
                .catch(function (err) {
                console.error("ERROR: ", err);
                _this.set("selectedFeatureAddress", null);
            })
                .then(function (addressCandidate) {
                _this.set("selectedFeatureAddress", addressCandidate.address);
            });
        };
        // _detectFeatureClick
        AttachmentViewerViewModel.prototype._detectFeatureClick = function () {
            var _this = this;
            return this.view.on("click", function (event) {
                if (_this.state !== "ready") {
                    return;
                }
                var _a = _this, featureLayer = _a.featureLayer, view = _a.view;
                if (featureLayer) {
                    _this._performingHitTest = view.hitTest(event);
                    _this.notifyChange("state");
                    _this._performingHitTest.then(function (hitTestRes) {
                        if (_this._highlightedFeature) {
                            _this._highlightedFeature.remove();
                            _this._highlightedFeature = null;
                        }
                        _this._performingHitTest = null;
                        _this.notifyChange("state");
                        if (hitTestRes.results.length) {
                            _this._setClickedFeature(hitTestRes);
                        }
                    });
                }
            });
        };
        // _setClickedFeature
        AttachmentViewerViewModel.prototype._setClickedFeature = function (hitTestRes) {
            var featureLayer = this.featureLayer;
            var isNotFromLayer = hitTestRes.results.every(function (result) {
                return result.graphic.layer.id !== featureLayer.id;
            });
            // If the feature does not exist in the photo presentation layer, do not set.
            if (isNotFromLayer) {
                return;
            }
            var detectedFeature = hitTestRes.results.filter(function (result) {
                var layer = result.graphic.layer;
                return layer.id === featureLayer.id;
            })[0].graphic;
            this._updateSelectedFeature(detectedFeature);
        };
        // updateFeature
        AttachmentViewerViewModel.prototype._updateSelectedFeature = function (feature) {
            var _a = this, featureLayer = _a.featureLayer, featureObjectIds = _a.featureObjectIds;
            var objectIdField = featureLayer.objectIdField;
            // Prevent same feature to be re-set
            if (this.selectedFeature.attributes[objectIdField] ===
                feature.attributes[objectIdField]) {
                return;
            }
            var layerFeature = this.layerFeatures.find(function (layerFeature) {
                return (layerFeature.attributes[objectIdField] ===
                    feature.attributes[objectIdField]);
            });
            var layerFeatureIndex = this.layerFeatures.indexOf(layerFeature);
            var objectId = featureObjectIds.find(function (objectId) {
                return feature.attributes[objectIdField] === objectId;
            });
            // If layer feature exists in current queried feature list, do not update query range or re-query features
            if (layerFeatureIndex !== -1) {
                this.set("layerFeatureIndex", layerFeatureIndex);
                this.objectIdIndex = this.featureObjectIds.indexOf(objectId);
                this._setFeature();
                this._highlightFeature(this.layerFeatureIndex);
                this._setUpdateShareIndexes();
                return;
            }
            var objectIdIndex = featureObjectIds.indexOf(objectId);
            this._updateQueryRange("updatingClick", objectIdIndex);
            this._queryFeatures("updatingClick", objectId);
            this._setUpdateShareIndexes();
        };
        //----------------------------------
        //
        //  UPDATE
        //
        //----------------------------------
        AttachmentViewerViewModel.prototype._updateFeatureData = function (updatingType) {
            // When user has reached the last feature
            if (this.featureTotal === this.objectIdIndex + 1) {
                this._queryRange = [0, 10];
                this._queryFeatures("restartNext");
                return;
            }
            // When user scrolls before first feature
            if (this.objectIdIndex - 1 === -1) {
                var low = Math.floor(this.featureTotal / 10) * 10 - 10;
                this._queryRange = [low, this.featureTotal];
                this._queryFeatures("restartPrevious");
                return;
            }
            // When user has reached then end of 10 features
            if (updatingType === "updatingNext") {
                this._updateQueryRange("updatingNext");
                this._queryFeatures("updatingNext");
            }
            // When user has reached then end of 10 features
            else if (updatingType === "updatingPrevious") {
                this._updateQueryRange("updatingPrevious");
                this._queryFeatures("updatingPrevious");
            }
        };
        // If feature does not exist in current queried layer features, the query range will be updated
        AttachmentViewerViewModel.prototype._updateQueryRange = function (updatingType, objectIdIndex) {
            var floor = Math.floor(objectIdIndex / 10) * 10;
            var ceil = Math.ceil(objectIdIndex / 10) * 10;
            // Update query range to query for next 10 features
            if (updatingType === "updatingNext") {
                var currentLow = this._queryRange[0];
                var updatedLow = this._queryRange[0] === 0 ? 10 : Math.round(currentLow / 10) * 10 + 10;
                var updatedHigh = updatedLow + 10;
                this._queryRange[0] = updatedLow;
                this._queryRange[1] = updatedHigh;
            }
            // Update query range to query for previous 10 features
            else if (updatingType === "updatingPrevious") {
                var currentLow = this._queryRange[0];
                var updatedHigh = currentLow;
                var updatedLow = Math.floor(currentLow / 10) * 10 - 10;
                this._queryRange[0] = updatedLow;
                this._queryRange[1] = updatedHigh;
            }
            // Update query range to query for 10 features relative to feature that was clicked
            else if (updatingType === "updatingClick" &&
                (objectIdIndex || objectIdIndex === 0)) {
                var updatedLow = floor;
                var updatedHigh = objectIdIndex % 10 === 0 ? ceil + 10 : ceil;
                this._queryRange[0] = updatedLow;
                this._queryRange[1] = updatedHigh;
            }
            // Update query range based on defaultObjectId from share widget
            else if (updatingType === "share" && this.defaultObjectId) {
                var objectIdIndex_1 = this.featureObjectIds.indexOf(this.defaultObjectId);
                var shareFloor = Math.floor(objectIdIndex_1 / 10) * 10;
                var shareCeil = Math.ceil(objectIdIndex_1 / 10) * 10;
                var updatedLow = shareFloor;
                var updatedHigh = objectIdIndex_1 % 10 === 0 ? shareCeil + 10 : shareCeil;
                this._queryRange[0] = updatedLow;
                this._queryRange[1] = updatedHigh;
            }
        };
        //----------------------------------
        //
        //  QUERY
        //
        //----------------------------------
        // Query for all object IDs to user to query features/attachments
        AttachmentViewerViewModel.prototype._queryObjectIds = function () {
            var _this = this;
            var _a = this, featureLayer = _a.featureLayer, _sortField = _a._sortField, order = _a.order;
            var objectIdField = featureLayer.objectIdField;
            var sortField = _sortField ? _sortField : objectIdField;
            var fieldOrder = order ? order : "ASC";
            var orderByFields = [sortField + " " + fieldOrder];
            var definitionExpression = this.get("featureLayer.definitionExpression");
            var where = definitionExpression ? definitionExpression : "1=1";
            var featureQuery = new Query({
                outFields: ["*"],
                orderByFields: orderByFields,
                where: where,
                returnGeometry: true
            });
            this._queryingForObjectIDs = this.featureLayer.queryObjectIds(featureQuery);
            this.notifyChange("state");
            this._queryingForObjectIDs
                .catch(function (err) {
                _this._queryingForObjectIDs = null;
                _this.notifyChange("state");
                console.error("ERROR: ", err);
            })
                .then(function (objectIds) {
                _this._queryingForObjectIDs = null;
                _this.notifyChange("state");
                _this.featureObjectIds.removeAll();
                _this.featureObjectIds.addMany(objectIds.slice());
                if (_this.defaultObjectId !== null) {
                    _this._updateQueryRange("share");
                    _this._queryFeatures("share");
                }
                else {
                    _this._queryFeatures();
                }
            });
        };
        // _queryFeatures
        AttachmentViewerViewModel.prototype._queryFeatures = function (queryType, objectIdIndex) {
            var _this = this;
            var _a = this, featureLayer = _a.featureLayer, layerFeatures = _a.layerFeatures;
            this.featureTotal = this.featureObjectIds.length;
            var featureQuery = this._setupFeatureQuery();
            this._queryingForFeatures = featureLayer.queryFeatures(featureQuery);
            this.notifyChange("state");
            this._queryingForFeatures
                .catch(function (err) {
                _this._queryingForFeatures = null;
                _this.notifyChange("state");
                console.error("ERROR: ", err);
            })
                .then(function (queriedFeatures) {
                // Reset features
                layerFeatures.removeAll();
                var _a = _this._queryRange, low = _a[0], high = _a[1];
                var currentSet = _this.featureObjectIds.slice(low, high);
                // Sort features
                var features = _this._sortFeatures(queriedFeatures, currentSet);
                // Add features to layerFeatures prop
                layerFeatures.addMany(features);
                _this.layerFeatureIndex =
                    _this.layerFeatureIndex !== null ? _this.layerFeatureIndex : 0;
                _this._updateIndexData(queryType, objectIdIndex);
                _this._queryingForFeatures = null;
                _this.notifyChange("state");
            });
        };
        // _setupFeatureQuery
        AttachmentViewerViewModel.prototype._setupFeatureQuery = function () {
            var _a = this, featureLayer = _a.featureLayer, _sortField = _a._sortField, order = _a.order;
            // Query for features only within the set query range
            var _b = this._queryRange, low = _b[0], high = _b[1];
            var currentSet = this.featureObjectIds.slice(low, high);
            var objectIdField = featureLayer.objectIdField;
            var query = featureLayer.capabilities.query;
            var supportsOrderBy = query.supportsOrderBy;
            var sortField = _sortField ? _sortField : objectIdField;
            var fieldOrder = order ? order : "ASC";
            var orderByFieldsValue = supportsOrderBy
                ? [sortField + " " + fieldOrder]
                : null;
            var outSpatialReference = this.view && this.view.spatialReference
                ? this.view.spatialReference
                : null;
            var definitionExpression = this.get("featureLayer.definitionExpression");
            var where = definitionExpression ? definitionExpression : "1=1";
            return new Query({
                objectIds: currentSet.toArray(),
                outFields: ["*"],
                orderByFields: orderByFieldsValue,
                where: where,
                returnGeometry: true,
                outSpatialReference: outSpatialReference
            });
        };
        // _sortFeatures
        AttachmentViewerViewModel.prototype._sortFeatures = function (queriedFeatures, currentSet) {
            var features = [];
            var objectIdField = this.featureLayer.objectIdField;
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
        // _updateIndexData
        AttachmentViewerViewModel.prototype._updateIndexData = function (queryType, objectId) {
            var _a = this, layerFeatures = _a.layerFeatures, featureTotal = _a.featureTotal;
            if (queryType === "updatingNext") {
                this.layerFeatureIndex = 0;
                this.objectIdIndex += 1;
            }
            else if (queryType === "updatingPrevious") {
                this.layerFeatureIndex = layerFeatures.length - 1;
                this.objectIdIndex -= 1;
            }
            else if (queryType === "restartNext") {
                this.layerFeatureIndex = 0;
                this.objectIdIndex = 0;
            }
            else if (queryType === "restartPrevious") {
                this.layerFeatureIndex = layerFeatures.length - 1;
                this.objectIdIndex = featureTotal - 1;
            }
            else if (queryType === "updatingClick") {
                this._updateFeatureClick(objectId);
            }
            else if (queryType === "share") {
                this._updateFeatureFromShare();
            }
            this._highlightFeature(this.layerFeatureIndex);
            var attachmentIndex = this.attachmentIndex ? this.attachmentIndex : 0;
            this.set("attachmentIndex", attachmentIndex);
        };
        // _updateFeatureClick
        AttachmentViewerViewModel.prototype._updateFeatureClick = function (objectId) {
            var _a = this, layerFeatures = _a.layerFeatures, featureLayer = _a.featureLayer;
            this.layerFeatureIndex = layerFeatures.indexOf(layerFeatures.find(function (layerFeature) {
                return layerFeature.attributes[featureLayer.objectIdField] === objectId;
            }));
            this.objectIdIndex = this.featureObjectIds.indexOf(objectId);
            if (featureLayer.get("capabilities.data.supportsAttachment")) {
                this.imageIsLoaded = false;
            }
        };
        // _updateFeatureFromShare
        AttachmentViewerViewModel.prototype._updateFeatureFromShare = function () {
            var _a = this, featureLayer = _a.featureLayer, defaultObjectId = _a.defaultObjectId;
            var objectIdField = featureLayer.objectIdField;
            this.layerFeatureIndex = this.layerFeatures.indexOf(this.layerFeatures.find(function (layerFeature) {
                return layerFeature.attributes[objectIdField] === defaultObjectId;
            }));
            this.objectIdIndex = this.featureObjectIds.indexOf(defaultObjectId);
        };
        //----------------------------------
        //
        //  Initialize first feature
        //
        //----------------------------------
        // _initializeFirstFeature
        AttachmentViewerViewModel.prototype._initializeFirstFeature = function () {
            var _this = this;
            var initFirstFeature = "attachments-not-supported";
            this._handles.add(watchUtils.whenOnce(this, "layerFeatures.length", function () {
                _this._setFeature();
                _this._handles.remove(initFirstFeature);
            }), initFirstFeature);
        };
        //----------------------------------
        //
        //  Set feature
        //
        //----------------------------------
        // _setFeature
        AttachmentViewerViewModel.prototype._setFeature = function () {
            var _this = this;
            this.selectedFeature = this.layerFeatures.getItemAt(this.layerFeatureIndex);
            this.featureWidget = new Feature({
                graphic: this.selectedFeature,
                map: this.view.map,
                spatialReference: this.view.spatialReference
            });
            if (this.selectedFeature) {
                this.view.goTo({
                    target: this.selectedFeature
                });
            }
            this.featureWidget.set("visibleElements.title", false);
            var featureWidgetKey = "feature-widget";
            this._handles.add(watchUtils.when(this, "featureWidget", function () {
                _this._handles.remove(featureWidgetKey);
                var featureWidgetContent = "feature-widget-content";
                _this._handles.add(watchUtils.when(_this, "featureWidget.viewModel.content", function () {
                    _this._handles.remove(featureWidgetContent);
                    _this._setFeatureInfo(_this.featureWidget);
                    if (_this._selectedLayerSupportsAttachments) {
                        var layerAttachments_1 = null;
                        var featureWidgetContent_1 = _this.featureWidget.viewModel
                            .content;
                        featureWidgetContent_1 &&
                            featureWidgetContent_1.forEach(function (content) {
                                if (content.type === "attachments") {
                                    layerAttachments_1 = content;
                                }
                            });
                        if (!layerAttachments_1) {
                            return;
                        }
                        var currentIndex = _this.attachmentIndex !== null ? _this.attachmentIndex : 0;
                        var featureAttachments_1 = [];
                        _this.unsupportedAttachmentTypes = [];
                        layerAttachments_1.get("attachmentInfos") &&
                            layerAttachments_1.attachmentInfos.forEach(function (attachmentInfo) {
                                var contentType = attachmentInfo.contentType;
                                if (contentType === "image/jpeg" ||
                                    contentType === "image/jpg" ||
                                    contentType === "image/png" ||
                                    contentType === "image/gif" ||
                                    contentType === "video/mp4" ||
                                    contentType === "video/mov" ||
                                    contentType === "video/quicktime") {
                                    featureAttachments_1.push(attachmentInfo);
                                }
                                else {
                                    _this.unsupportedAttachmentTypes.push(attachmentInfo);
                                }
                            });
                        var attachments = featureAttachments_1 && featureAttachments_1.length > 0
                            ? featureAttachments_1
                            : [];
                        var selectedFeatureAttachments = {
                            attachments: attachments,
                            currentIndex: currentIndex
                        };
                        if (!attachments || attachments.length === 0) {
                            _this.imageIsLoaded = true;
                        }
                        _this.set("selectedFeatureAttachments", null);
                        _this.set("selectedFeatureAttachments", selectedFeatureAttachments);
                        _this.notifyChange("state");
                    }
                }), featureWidgetContent);
            }), featureWidgetKey);
        };
        // _setFeatureInfo
        AttachmentViewerViewModel.prototype._setFeatureInfo = function (featureWidget) {
            var _this = this;
            var featureTitleKey = "feature-title";
            this._handles.add(watchUtils.when(featureWidget, "title", function () {
                _this._handles.remove(featureTitleKey);
                _this.set("featureLayerTitle", featureWidget.title);
            }), featureTitleKey);
            var featureContentKey = "feature-content";
            this._handles.add(watchUtils.when(featureWidget, "viewModel.formattedAttributes.global", function () {
                _this._handles.remove(featureContentKey);
                var selectedFeatureContent = [];
                var fieldContents = featureWidget.get("viewModel.content");
                var attributes = featureWidget.get("viewModel.formattedAttributes.global");
                fieldContents.forEach(function (content) {
                    if (content.type === "fields") {
                        content.fieldInfos.forEach(function (fieldInfo, fieldInfoIndex) {
                            if (fieldInfo.fieldName !== _this.featureLayer.objectIdField) {
                                selectedFeatureContent[fieldInfoIndex] = {
                                    attribute: fieldInfo.label,
                                    content: attributes[fieldInfo.fieldName]
                                };
                            }
                        });
                    }
                });
                if (_this.selectedFeature && _this.addressEnabled) {
                    var geometry = _this.selectedFeature.geometry;
                    _this._getAddress(geometry);
                }
                _this.set("selectedFeatureInfo", selectedFeatureContent);
            }), featureContentKey);
        };
        //----------------------------------
        //
        //  Highlight
        //
        //----------------------------------
        // _highlightFeature
        AttachmentViewerViewModel.prototype._highlightFeature = function (layerFeatureIndex) {
            if (this._highlightedFeature) {
                this._highlightedFeature.remove();
                this._highlightedFeature = null;
            }
            var feature = layerFeatureIndex || layerFeatureIndex === 0
                ? this.layerFeatures.getItemAt(layerFeatureIndex)
                : this.selectedFeature;
            this._highlightedFeature = this.layerView.highlight(feature);
        };
        //----------------------------------
        //
        //  Download
        //
        //----------------------------------
        // downloadImage
        AttachmentViewerViewModel.prototype.downloadImage = function (event) {
            var _this = this;
            var node = event.currentTarget;
            var url = node.getAttribute("data-image-url");
            var fileName = node.getAttribute("data-image-name");
            if (!url) {
                return;
            }
            var image = this._generateImgElement(url);
            this._preparingDownload = true;
            this.notifyChange("state");
            image.then(function (img) {
                var canvas = _this._generateCanvasElement(img);
                _this._processDownload(canvas, fileName);
            });
        };
        // _generateImgElement
        AttachmentViewerViewModel.prototype._generateImgElement = function (url) {
            return new Promise(function (resolve) {
                var img = new Image();
                img.crossOrigin = "*";
                img.onload = function () {
                    resolve(img);
                };
                img.src = url;
            });
        };
        // _generateCanvasElement
        AttachmentViewerViewModel.prototype._generateCanvasElement = function (img) {
            var canvas = document.createElement("canvas");
            var width = img.width, height = img.height;
            canvas.width = width;
            canvas.height = height;
            var context = canvas.getContext("2d");
            context.drawImage(img, 0, 0);
            return canvas;
        };
        // _processDownload
        AttachmentViewerViewModel.prototype._processDownload = function (canvas, fileName) {
            if (!window.navigator.msSaveOrOpenBlob) {
                canvas.toBlob(function (blob) {
                    var dataUrl = URL.createObjectURL(blob);
                    var imgURL = document.createElement("a");
                    imgURL.setAttribute("href", dataUrl);
                    imgURL.setAttribute("download", fileName);
                    imgURL.style.display = "none";
                    document.body.appendChild(imgURL);
                    imgURL.click();
                    document.body.removeChild(imgURL);
                });
            }
            else {
                var dataUrl = canvas.toDataURL();
                var mimeString = dataUrl
                    .split(",")[0]
                    .split(":")[1]
                    .split(";")[0];
                canvas.toBlob(function (blob) {
                    window.navigator.msSaveOrOpenBlob(blob, fileName);
                }, mimeString);
            }
            this._preparingDownload = false;
            this.notifyChange("state");
        };
        //----------------------------------
        //
        //  Zoom to
        //
        //----------------------------------
        // zoomTo
        AttachmentViewerViewModel.prototype.zoomTo = function () {
            var feature = this.layerFeatures.getItemAt(this.layerFeatureIndex);
            var zoom = this.zoomLevel ? parseInt(this.zoomLevel) : 32000;
            if (!feature) {
                return;
            }
            this.view.goTo({
                target: feature,
                scale: zoom
            });
        };
        //----------------------------------
        //
        //  DATA WATCHERS
        //
        //----------------------------------
        // _setupDataWatchers
        AttachmentViewerViewModel.prototype._setupDataWatchers = function () {
            var _this = this;
            this._handles.add([
                this._objectIdIndexSetFeatureUpdate(),
                this._handleSearchWidgets()
            ]);
            var updateShareProps = "share-props";
            this._handles.add(watchUtils.when(this, "socialSharingEnabled", function () {
                _this._updateSharePropIndexes();
                _this._handles.remove(updateShareProps);
            }));
        };
        // _objectIdIndexSetFeatureUpdate
        AttachmentViewerViewModel.prototype._objectIdIndexSetFeatureUpdate = function () {
            var _this = this;
            return watchUtils.watch(this, ["objectIdIndex"], function () {
                _this._setFeature();
            });
        };
        // _updateSharePropIndexes
        AttachmentViewerViewModel.prototype._updateSharePropIndexes = function () {
            var _this = this;
            return watchUtils.watch(this, ["objectIdIndex", "attachmentIndex"], function () {
                if (_this._updateShareIndexes) {
                    var _a = _this, attachmentIndex = _a.attachmentIndex, objectIdIndex = _a.objectIdIndex;
                    var objectId = _this.featureObjectIds.getItemAt(objectIdIndex);
                    _this.shareLocationWidget.defaultObjectId = objectId;
                    _this.shareLocationWidget.attachmentIndex = attachmentIndex;
                }
            });
        };
        // _handleSearchWidgets
        AttachmentViewerViewModel.prototype._handleSearchWidgets = function () {
            var _this = this;
            return watchUtils.whenOnce(this, ["searchWidget"], function () {
                _this._handles.add(_this._watchSelectedSearchResults());
            });
        };
        // _watchSelectedSearchResults
        AttachmentViewerViewModel.prototype._watchSelectedSearchResults = function () {
            var _this = this;
            return watchUtils.watch(this, ["searchWidget.viewModel.selectedResult"], function () {
                var searchWidget = _this.searchWidget;
                if (searchWidget) {
                    var selectedFeatureResult = searchWidget.get("viewModel.selectedResult.feature");
                    if (selectedFeatureResult &&
                        selectedFeatureResult.layer &&
                        selectedFeatureResult.layer.id === _this.featureLayer.id) {
                        _this._updateSelectedFeature(selectedFeatureResult);
                    }
                }
            });
        };
        // _setUpdateShareIndexes
        AttachmentViewerViewModel.prototype._setUpdateShareIndexes = function () {
            if (this._updateShareIndexes == null) {
                this._updateShareIndexes = true;
            }
        };
        __decorate([
            decorators_1.property({
                dependsOn: ["view.ready", "imageIsLoaded"],
                readOnly: true
            })
        ], AttachmentViewerViewModel.prototype, "state", null);
        __decorate([
            decorators_1.property()
        ], AttachmentViewerViewModel.prototype, "view", void 0);
        __decorate([
            decorators_1.property()
        ], AttachmentViewerViewModel.prototype, "searchWidget", void 0);
        __decorate([
            decorators_1.property()
        ], AttachmentViewerViewModel.prototype, "title", void 0);
        __decorate([
            decorators_1.property()
        ], AttachmentViewerViewModel.prototype, "selectedFeatureInfo", void 0);
        __decorate([
            decorators_1.property()
        ], AttachmentViewerViewModel.prototype, "selectedFeatureAttachments", void 0);
        __decorate([
            decorators_1.property()
        ], AttachmentViewerViewModel.prototype, "featureLayerTitle", void 0);
        __decorate([
            decorators_1.property()
        ], AttachmentViewerViewModel.prototype, "layerFeatures", void 0);
        __decorate([
            decorators_1.property()
        ], AttachmentViewerViewModel.prototype, "selectedFeature", void 0);
        __decorate([
            decorators_1.property()
        ], AttachmentViewerViewModel.prototype, "layerFeatureIndex", void 0);
        __decorate([
            decorators_1.property()
        ], AttachmentViewerViewModel.prototype, "attachmentIndex", void 0);
        __decorate([
            decorators_1.property()
        ], AttachmentViewerViewModel.prototype, "layerView", void 0);
        __decorate([
            decorators_1.property()
        ], AttachmentViewerViewModel.prototype, "featureLayer", void 0);
        __decorate([
            decorators_1.property()
        ], AttachmentViewerViewModel.prototype, "imageIsLoaded", void 0);
        __decorate([
            decorators_1.property()
        ], AttachmentViewerViewModel.prototype, "socialSharingEnabled", void 0);
        __decorate([
            decorators_1.property()
        ], AttachmentViewerViewModel.prototype, "shareLocationWidget", void 0);
        __decorate([
            decorators_1.property()
        ], AttachmentViewerViewModel.prototype, "selectedFeatureAddress", void 0);
        __decorate([
            decorators_1.property()
        ], AttachmentViewerViewModel.prototype, "attachmentLayer", void 0);
        __decorate([
            decorators_1.property()
        ], AttachmentViewerViewModel.prototype, "order", void 0);
        __decorate([
            decorators_1.property()
        ], AttachmentViewerViewModel.prototype, "defaultObjectId", void 0);
        __decorate([
            decorators_1.property()
        ], AttachmentViewerViewModel.prototype, "featureObjectIds", void 0);
        __decorate([
            decorators_1.property()
        ], AttachmentViewerViewModel.prototype, "featureTotal", void 0);
        __decorate([
            decorators_1.property()
        ], AttachmentViewerViewModel.prototype, "objectIdIndex", void 0);
        __decorate([
            decorators_1.property()
        ], AttachmentViewerViewModel.prototype, "downloadEnabled", void 0);
        __decorate([
            decorators_1.property()
        ], AttachmentViewerViewModel.prototype, "featureWidget", void 0);
        __decorate([
            decorators_1.property()
        ], AttachmentViewerViewModel.prototype, "zoomLevel", void 0);
        __decorate([
            decorators_1.property()
        ], AttachmentViewerViewModel.prototype, "addressEnabled", void 0);
        __decorate([
            decorators_1.property()
        ], AttachmentViewerViewModel.prototype, "unsupportedAttachmentTypes", void 0);
        __decorate([
            decorators_1.property()
        ], AttachmentViewerViewModel.prototype, "tempLayers", void 0);
        AttachmentViewerViewModel = __decorate([
            decorators_1.subclass("AttachmentViewerViewModel")
        ], AttachmentViewerViewModel);
        return AttachmentViewerViewModel;
    }(decorators_1.declared(Accessor)));
    return AttachmentViewerViewModel;
});
//# sourceMappingURL=AttachmentViewerViewModel.js.map