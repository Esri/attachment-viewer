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
define(["require", "exports", "esri/core/tsSupport/declareExtendsHelper", "esri/core/tsSupport/decorateHelper", "esri/core/Accessor", "esri/core/accessorSupport/decorators", "esri/core/watchUtils", "esri/core/Handles", "esri/core/Collection", "esri/tasks/Locator", "esri/geometry/Point", "../Share", "../Share/ShareFeatures"], function (require, exports, __extends, __decorate, Accessor, decorators_1, watchUtils, Handles, Collection, Locator, Point, Share, ShareFeatures) {
    "use strict";
    var AttachmentViewerViewModel = /** @class */ (function (_super) {
        __extends(AttachmentViewerViewModel, _super);
        function AttachmentViewerViewModel() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this._handles = new Handles();
            _this._preparingDownload = null;
            _this._queryingForFeatures = null;
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
            // shareLocationWidget
            _this.shareLocationWidget = null;
            // sketchWidget
            _this.sketchWidget = null;
            // graphicsLayer
            _this.graphicsLayer = null;
            // imageIsLoaded
            _this.imageIsLoaded = null;
            // appMode
            _this.appMode = null;
            // title
            _this.title = null;
            // onlyDisplayFeaturesWithAttachmentsIsEnabled
            _this.onlyDisplayFeaturesWithAttachmentsIsEnabled = null;
            // socialSharingEnabled
            _this.socialSharingEnabled = null;
            // socialSharingEnabled
            _this.selectFeaturesEnabled = null;
            // zoomLevel
            _this.zoomLevel = null;
            // downloadEnabled
            _this.downloadEnabled = null;
            // addressEnabled
            _this.addressEnabled = null;
            // order
            _this.order = null;
            // order
            _this.attachmentLayer = null;
            // attachmentViewerDataCollection
            _this.attachmentViewerDataCollection = new Collection();
            // selectedAttachmentViewerData
            _this.selectedAttachmentViewerData = null;
            // featureWidget
            _this.featureWidget = null;
            // layerSwitcher
            _this.layerSwitcher = null;
            _this.supportedAttachmentTypes = [
                "image/jpeg",
                "image/jpg",
                "image/png",
                "image/gif",
                "video/mp4",
                "video/mov",
                "video/quicktime",
                "application/pdf"
            ];
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
                        : this._queryingForFeatures
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
        AttachmentViewerViewModel.prototype.destroy = function () {
            this._handles.removeAll();
            this._handles = null;
        };
        // _setupShare
        AttachmentViewerViewModel.prototype.setupShare = function () {
            var shareFeatures = new ShareFeatures({
                copyToClipboard: true,
                embedMap: false
            });
            var share = new Share({
                view: this.view,
                shareFeatures: shareFeatures,
                container: document.createElement("div"),
                isDefault: true
            });
            this.set("shareLocationWidget", share);
            this.sharePropIndexesWatcher();
        };
        // sharePropIndexesWatcher
        AttachmentViewerViewModel.prototype.sharePropIndexesWatcher = function () {
            var _this = this;
            return watchUtils.watch(this, [
                "selectedAttachmentViewerData.objectIdIndex",
                "selectedAttachmentViewerData.attachmentIndex",
                "selectedAttachmentViewerData.defaultObjectId",
                "selectedAttachmentViewerData.selectedLayerId",
                "selectedAttachmentViewerData.layerFeatureIndex",
                "selectedAttachmentViewerData.selectedLayerId"
            ], function () {
                _this.updateSharePropIndexes();
            });
        };
        // updateSharePropIndexes
        AttachmentViewerViewModel.prototype.updateSharePropIndexes = function () {
            if (!this.selectedAttachmentViewerData) {
                return;
            }
            if (this.shareLocationWidget && this.shareLocationWidget.isDefault) {
                this.shareLocationWidget.isDefault = false;
            }
            var _a = this
                .selectedAttachmentViewerData, attachmentIndex = _a.attachmentIndex, objectIdIndex = _a.objectIdIndex, layerFeatureIndex = _a.layerFeatureIndex;
            var featureObjectIds = this.get("selectedAttachmentViewerData.featureObjectIds");
            var objectId = featureObjectIds.getItemAt(objectIdIndex);
            this.set("shareLocationWidget.defaultObjectId", objectId);
            this.set("shareLocationWidget.attachmentIndex", attachmentIndex);
            this.set("shareLocationWidget.selectedLayerId", this.selectedAttachmentViewerData.layerData.featureLayer.id);
            this.set("shareLocationWidget.layerFeatureIndex", layerFeatureIndex);
        };
        // _setUpdateShareIndexes
        AttachmentViewerViewModel.prototype.setUpdateShareIndexes = function () {
            if (this._updateShareIndexes === null) {
                this._updateShareIndexes = true;
            }
        };
        // setFeatureInfo
        AttachmentViewerViewModel.prototype.setFeatureInfo = function (featureWidget) {
            var _this = this;
            var featureTitleKey = "feature-title";
            this._handles.add(watchUtils.when(featureWidget, "title", function () {
                _this._handles.remove(featureTitleKey);
                _this.set("selectedAttachmentViewerData.featureLayerTitle", featureWidget.title);
            }), featureTitleKey);
            var featureContentKey = "feature-content";
            this._handles.add(watchUtils.when(featureWidget, "viewModel.formattedAttributes.global", function () {
                _this._handles.remove(featureContentKey);
                var selectedFeatureContent = [];
                var fieldContents = featureWidget.get("viewModel.content");
                var attributes = featureWidget.get("viewModel.formattedAttributes.global");
                fieldContents &&
                    fieldContents.forEach(function (content) {
                        if (content.type === "fields") {
                            content.fieldInfos.forEach(function (fieldInfo, fieldInfoIndex) {
                                if (fieldInfo.fieldName !==
                                    _this.selectedAttachmentViewerData.layerData.featureLayer
                                        .objectIdField) {
                                    selectedFeatureContent[fieldInfoIndex] = {
                                        attribute: fieldInfo.label,
                                        content: attributes[fieldInfo.fieldName]
                                    };
                                }
                            });
                        }
                    });
                _this.set("selectedAttachmentViewerData.selectedFeatureInfo", selectedFeatureContent);
            }), featureContentKey);
        };
        // zoomTo
        AttachmentViewerViewModel.prototype.zoomTo = function () {
            var scale = this.zoomLevel ? parseInt(this.zoomLevel) : 32000;
            var target = this.get("selectedAttachmentViewerData.selectedFeature");
            this.view.goTo({
                target: target,
                scale: scale
            });
        };
        // getTotalNumberOfAttachments
        AttachmentViewerViewModel.prototype.getTotalNumberOfAttachments = function () {
            if (!this.selectedAttachmentViewerData) {
                return;
            }
            var selectedFeatureAttachments = this.get("selectedAttachmentViewerData.selectedFeatureAttachments");
            if (selectedFeatureAttachments) {
                var attachments = selectedFeatureAttachments &&
                    selectedFeatureAttachments.get("attachments");
                return attachments && attachments.get("length");
            }
        };
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
        // previousImage
        AttachmentViewerViewModel.prototype.previousImage = function () {
            var selectedFeatureAttachments = this.get("selectedAttachmentViewerData.selectedFeatureAttachments");
            var attachments = selectedFeatureAttachments &&
                selectedFeatureAttachments.get("attachments");
            var currentIndex = selectedFeatureAttachments &&
                selectedFeatureAttachments.get("currentIndex");
            // When a user is scrolling before first image, set displayed image to the last image
            if (currentIndex === 0) {
                selectedFeatureAttachments &&
                    selectedFeatureAttachments.set("currentIndex", attachments && attachments.length - 1);
            }
            // Go back one image
            else {
                var updatedCurrentIndex = currentIndex - 1;
                selectedFeatureAttachments &&
                    selectedFeatureAttachments.set("currentIndex", updatedCurrentIndex);
            }
            this.set("selectedAttachmentViewerData.attachmentIndex", selectedFeatureAttachments &&
                selectedFeatureAttachments.get("currentIndex"));
        };
        // nextImage
        AttachmentViewerViewModel.prototype.nextImage = function () {
            var selectedFeatureAttachments = this.get("selectedAttachmentViewerData.selectedFeatureAttachments");
            var attachments = selectedFeatureAttachments &&
                selectedFeatureAttachments.get("attachments");
            var currentIndex = selectedFeatureAttachments &&
                selectedFeatureAttachments.get("currentIndex");
            // When a user is scrolling after last image, set displayed image to the first image
            if (currentIndex < attachments.length - 1) {
                var updatedCurrentIndex = currentIndex + 1;
                selectedFeatureAttachments &&
                    selectedFeatureAttachments.set("currentIndex", updatedCurrentIndex);
            }
            // Go forward one image
            else {
                selectedFeatureAttachments &&
                    selectedFeatureAttachments.set("currentIndex", 0);
            }
            this.set("selectedAttachmentViewerData.attachmentIndex", selectedFeatureAttachments &&
                selectedFeatureAttachments.get("currentIndex"));
        };
        // getGPSInformation
        AttachmentViewerViewModel.prototype.getGPSInformation = function (attachment) {
            var exifInfo = attachment && attachment.get("exifInfo");
            var GPS = exifInfo &&
                exifInfo.filter(function (exifInfoItem) {
                    return exifInfoItem.name === "GPS";
                })[0];
            var gpsImageDirection = GPS &&
                GPS.tags.filter(function (tagItem) {
                    return tagItem.name === "GPS Img Direction";
                })[0];
            var gpsImageDirectionVal = gpsImageDirection && gpsImageDirection.value;
            var twoDecimalPlaces = parseFloat(gpsImageDirectionVal && gpsImageDirectionVal.toFixed(2));
            return isNaN(twoDecimalPlaces) ? null : twoDecimalPlaces;
        };
        // getAddress
        AttachmentViewerViewModel.prototype.getAddress = function (geometry) {
            var _this = this;
            if (!geometry) {
                return;
            }
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
                console.error("LOCATION TO ADDRESS ERROR: ", err);
                _this.set("selectedAttachmentViewerData.selectedFeatureAddress", null);
            })
                .then(function (addressCandidate) {
                if (!addressCandidate) {
                    return;
                }
                _this.set("selectedAttachmentViewerData.selectedFeatureAddress", addressCandidate.address);
            });
        };
        // getAttachmentInfos
        AttachmentViewerViewModel.prototype.getAttachmentInfos = function (feature) {
            if (!feature) {
                return;
            }
            var featureContentItems = feature.get("viewModel.content");
            if (!featureContentItems) {
                return;
            }
            var attachmentContent = featureContentItems.filter(function (featureContent) {
                return featureContent.type === "attachments";
            })[0];
            return (attachmentContent &&
                attachmentContent.get("attachmentInfos"));
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
        ], AttachmentViewerViewModel.prototype, "shareLocationWidget", void 0);
        __decorate([
            decorators_1.property()
        ], AttachmentViewerViewModel.prototype, "sketchWidget", void 0);
        __decorate([
            decorators_1.property()
        ], AttachmentViewerViewModel.prototype, "graphicsLayer", void 0);
        __decorate([
            decorators_1.property()
        ], AttachmentViewerViewModel.prototype, "imageIsLoaded", void 0);
        __decorate([
            decorators_1.property()
        ], AttachmentViewerViewModel.prototype, "appMode", void 0);
        __decorate([
            decorators_1.property()
        ], AttachmentViewerViewModel.prototype, "title", void 0);
        __decorate([
            decorators_1.property()
        ], AttachmentViewerViewModel.prototype, "onlyDisplayFeaturesWithAttachmentsIsEnabled", void 0);
        __decorate([
            decorators_1.property()
        ], AttachmentViewerViewModel.prototype, "socialSharingEnabled", void 0);
        __decorate([
            decorators_1.property()
        ], AttachmentViewerViewModel.prototype, "selectFeaturesEnabled", void 0);
        __decorate([
            decorators_1.property()
        ], AttachmentViewerViewModel.prototype, "zoomLevel", void 0);
        __decorate([
            decorators_1.property()
        ], AttachmentViewerViewModel.prototype, "downloadEnabled", void 0);
        __decorate([
            decorators_1.property()
        ], AttachmentViewerViewModel.prototype, "addressEnabled", void 0);
        __decorate([
            decorators_1.property()
        ], AttachmentViewerViewModel.prototype, "order", void 0);
        __decorate([
            decorators_1.property()
        ], AttachmentViewerViewModel.prototype, "attachmentLayer", void 0);
        __decorate([
            decorators_1.property()
        ], AttachmentViewerViewModel.prototype, "attachmentViewerDataCollection", void 0);
        __decorate([
            decorators_1.property()
        ], AttachmentViewerViewModel.prototype, "selectedAttachmentViewerData", void 0);
        __decorate([
            decorators_1.property()
        ], AttachmentViewerViewModel.prototype, "featureWidget", void 0);
        __decorate([
            decorators_1.property()
        ], AttachmentViewerViewModel.prototype, "layerSwitcher", void 0);
        __decorate([
            decorators_1.property({
                readOnly: true
            })
        ], AttachmentViewerViewModel.prototype, "supportedAttachmentTypes", void 0);
        AttachmentViewerViewModel = __decorate([
            decorators_1.subclass("AttachmentViewerViewModel")
        ], AttachmentViewerViewModel);
        return AttachmentViewerViewModel;
    }(decorators_1.declared(Accessor)));
    return AttachmentViewerViewModel;
});
//# sourceMappingURL=AttachmentViewerViewModel.js.map