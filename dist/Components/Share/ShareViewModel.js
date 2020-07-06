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
define(["require", "exports", "tslib", "esri/core/Accessor", "esri/core/Collection", "esri/core/Handles", "esri/core/watchUtils", "esri/core/accessorSupport/decorators", "esri/geometry/Point", "esri/geometry/projection", "esri/geometry/SpatialReference", "esri/request", "./ShareItem", "./ShareFeatures"], function (require, exports, tslib_1, Accessor, Collection, Handles, watchUtils, decorators_1, Point, projection, SpatialReference, esriRequest, ShareItem, ShareFeatures) {
    "use strict";
    //----------------------------------
    //
    //  Share Item Collection
    //
    //----------------------------------
    var ShareItemCollection = Collection.ofType(ShareItem);
    //----------------------------------
    //
    //  Default Share Items
    //
    //----------------------------------
    var FACEBOOK_ITEM = new ShareItem({
        id: "facebook",
        name: "Facebook",
        urlTemplate: "https://www.facebook.com/sharer/sharer.php?s=100&u={url}"
    });
    var TWITTER_ITEM = new ShareItem({
        id: "twitter",
        name: "Twitter",
        urlTemplate: "https://twitter.com/intent/tweet?text={summary}&url={url}"
    });
    //----------------------------------
    //
    //  Shorten URL API
    //
    //----------------------------------
    var SHORTEN_API = "https://arcg.is/prod/shorten";
    var ShareViewModel = /** @class */ (function (_super) {
        tslib_1.__extends(ShareViewModel, _super);
        function ShareViewModel() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this._handles = new Handles();
            //----------------------------------
            //
            //  Private Variables
            //
            //----------------------------------
            // Promises for widget state
            _this._shortening = false;
            _this._projecting = false;
            //----------------------------------
            //
            //  Properties
            //
            //----------------------------------
            //----------------------------------
            //
            //  view
            //
            //----------------------------------
            _this.view = null;
            //----------------------------------
            //
            // shareModalOpened
            //
            //----------------------------------
            _this.shareModalOpened = null;
            //----------------------------------
            //
            // defaultObjectId
            //
            //----------------------------------
            _this.defaultObjectId = null;
            //----------------------------------
            //
            // attachmentIndex
            //
            //----------------------------------
            _this.attachmentIndex = null;
            //----------------------------------
            //
            // selectedLayerId
            //
            //----------------------------------
            _this.selectedLayerId = null;
            //----------------------------------
            //
            // isDefault
            //
            //----------------------------------
            _this.isDefault = null;
            //----------------------------------
            //
            //  shareItems
            //
            //----------------------------------
            _this.shareItems = new ShareItemCollection([
                FACEBOOK_ITEM,
                TWITTER_ITEM
            ]);
            //----------------------------------
            //
            //  shareFeatures
            //
            //----------------------------------
            _this.shareFeatures = new ShareFeatures();
            //----------------------------------
            //
            //  shareUrl - readOnly
            //
            //----------------------------------
            _this.shareUrl = null;
            return _this;
        }
        //----------------------------------
        //
        //  Lifecycle
        //
        //----------------------------------
        ShareViewModel.prototype.destroy = function () {
            this.shareItems.removeAll();
            this.view = null;
        };
        Object.defineProperty(ShareViewModel.prototype, "state", {
            //----------------------------------
            //
            //  state - readOnly
            //
            //----------------------------------
            get: function () {
                var ready = this.get("view.ready");
                return ready
                    ? this._projecting
                        ? "projecting"
                        : this._shortening
                            ? "shortening"
                            : "ready"
                    : this.view
                        ? "loading"
                        : "disabled";
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(ShareViewModel.prototype, "embedCode", {
            //----------------------------------
            //
            //  embedCode - readOnly
            //
            //----------------------------------
            get: function () {
                return "<iframe src=\"" + this.shareUrl + "\" width=\"600\" height=\"450\" frameborder=\"0\" style=\"border:0\" allowfullscreen></iframe>";
            },
            enumerable: false,
            configurable: true
        });
        ShareViewModel.prototype.initialize = function () {
            var _this = this;
            this._handles.add([
                watchUtils.watch(this, ["defaultObjectId", "attachmentIndex", "selectedLayerId"], function () {
                    if (!_this.isDefault) {
                        _this.generateUrl();
                    }
                })
            ]);
        };
        //----------------------------------
        //
        //  Public Methods
        //
        //----------------------------------
        ShareViewModel.prototype.generateUrl = function () {
            return tslib_1.__awaiter(this, void 0, void 0, function () {
                var url, shortenLink, shortenedUrl, shortenLink, href, shortenedUrl;
                return tslib_1.__generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (!!this.isDefault) return [3 /*break*/, 4];
                            return [4 /*yield*/, this._generateShareUrl()];
                        case 1:
                            url = _a.sent();
                            shortenLink = this.shareFeatures.shortenLink;
                            if (!shortenLink) return [3 /*break*/, 3];
                            return [4 /*yield*/, this._shorten(url)];
                        case 2:
                            shortenedUrl = _a.sent();
                            this._set("shareUrl", shortenedUrl);
                            return [2 /*return*/, shortenedUrl];
                        case 3:
                            this._set("shareUrl", url);
                            return [2 /*return*/, url];
                        case 4:
                            shortenLink = this.shareFeatures.shortenLink;
                            href = window.location.href;
                            if (!shortenLink) return [3 /*break*/, 6];
                            return [4 /*yield*/, this._shorten(href)];
                        case 5:
                            shortenedUrl = _a.sent();
                            this._set("shareUrl", shortenedUrl);
                            return [2 /*return*/, shortenedUrl];
                        case 6:
                            this._set("shareUrl", href);
                            return [2 /*return*/, href];
                    }
                });
            });
        };
        //----------------------------------
        //
        //  Private Methods
        //
        //----------------------------------
        ShareViewModel.prototype._generateShareUrl = function () {
            return tslib_1.__awaiter(this, void 0, void 0, function () {
                var href, _a, x, y, spatialReference, centerPoint, point;
                return tslib_1.__generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            href = window.location.href;
                            // If view is not ready
                            if (!this.get("view.ready")) {
                                return [2 /*return*/, href];
                            }
                            _a = this.view.center, x = _a.x, y = _a.y;
                            spatialReference = this.view.spatialReference;
                            centerPoint = new Point({
                                x: x,
                                y: y,
                                spatialReference: spatialReference
                            });
                            return [4 /*yield*/, this._processPoint(centerPoint)];
                        case 1:
                            point = _b.sent();
                            return [2 /*return*/, this._generateShareUrlParams(point)];
                    }
                });
            });
        };
        ShareViewModel.prototype._processPoint = function (point) {
            return tslib_1.__awaiter(this, void 0, void 0, function () {
                var _a, isWGS84, isWebMercator, point_1, outputSpatialReference, projectedPoint;
                return tslib_1.__generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            _a = point.spatialReference, isWGS84 = _a.isWGS84, isWebMercator = _a.isWebMercator;
                            // If spatial reference is WGS84 or Web Mercator, use longitude/latitude values to generate the share URL parameters
                            if (isWGS84 || isWebMercator) {
                                return [2 /*return*/, point];
                            }
                            this._projecting = true;
                            this.notifyChange("state");
                            return [4 /*yield*/, projection.load()];
                        case 1:
                            _b.sent();
                            // Check if client side projection is not supported
                            if (!projection.isSupported()) {
                                point_1 = new Point({
                                    x: null,
                                    y: null
                                });
                                this._projecting = false;
                                this.notifyChange("state");
                                return [2 /*return*/, point_1];
                            }
                            outputSpatialReference = new SpatialReference({
                                wkid: 4326
                            });
                            projectedPoint = projection.project(point, outputSpatialReference);
                            this._projecting = false;
                            this.notifyChange("state");
                            return [2 /*return*/, projectedPoint];
                    }
                });
            });
        };
        ShareViewModel.prototype._generateShareUrlParams = function (point) {
            var href = window.location.href;
            var longitude = point.longitude, latitude = point.latitude;
            if (longitude === undefined || latitude === undefined) {
                return href;
            }
            var roundedLon = this._roundValue(longitude);
            var roundedLat = this._roundValue(latitude);
            var zoom = this.view.zoom;
            var roundedZoom = this._roundValue(zoom);
            var path = href.split("center")[0];
            // If no "?", then append "?". Otherwise, check for "?" and "="
            var sep = path.indexOf("?") === -1
                ? "?"
                : path.indexOf("?") !== -1 && path.indexOf("=") !== -1
                    ? path.indexOf("&") === -1
                        ? "&"
                        : ""
                    : "";
            var defaultObjectId = this.defaultObjectId !== null && this.defaultObjectId !== undefined
                ? "&defaultObjectId=" + this.defaultObjectId
                : "";
            var attachmentIndex = this.attachmentIndex !== null && this.attachmentIndex !== undefined
                ? "&attachmentIndex=" + this.attachmentIndex
                : "";
            var selectedLayerId = this.selectedLayerId !== null && this.selectedLayerId !== undefined
                ? "&selectedLayerId=" + this.selectedLayerId
                : "";
            var shareParams = "" + path + sep + "center=" + roundedLon + "," + roundedLat + "&level=" + roundedZoom + defaultObjectId + attachmentIndex + selectedLayerId;
            var isSupported = false;
            var userAgent = window.navigator.userAgent;
            var msie = userAgent.indexOf("MSIE ");
            var edge = userAgent.indexOf("Edge");
            if (msie > 0 ||
                !!navigator.userAgent.match(/Trident.*rv\:11\./) ||
                edge > 0) {
                isSupported = true;
            }
            if (!isSupported) {
                var url = new URL(window.location.href);
                var params = new URLSearchParams(url.search);
                params.set("center", roundedLon + "," + roundedLat);
                params.set("level", "" + roundedZoom);
                if (this.defaultObjectId || this.defaultObjectId === 0) {
                    params.set("defaultObjectId", "" + this.defaultObjectId);
                }
                else {
                    params.delete("defaultObjectId");
                }
                if (this.attachmentIndex !== null) {
                    params.set("attachmentIndex", "" + this.attachmentIndex);
                }
                if (this.selectedLayerId !== null) {
                    params.set("selectedLayerId", "" + this.selectedLayerId);
                }
                window.history.replaceState({}, "", location.pathname + "?" + params);
            }
            // Otherwise, just return original url parameters for 2D
            return shareParams;
        };
        ShareViewModel.prototype._shorten = function (url) {
            return tslib_1.__awaiter(this, void 0, void 0, function () {
                var requestOptions, request, shortUrl;
                return tslib_1.__generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            requestOptions = {
                                callbackParamName: "callback",
                                query: {
                                    longUrl: url,
                                    f: "json"
                                }
                            };
                            this._shortening = true;
                            this.notifyChange("state");
                            return [4 /*yield*/, esriRequest(SHORTEN_API, requestOptions)];
                        case 1:
                            request = _a.sent();
                            this._shortening = false;
                            this.notifyChange("state");
                            shortUrl = request.data && request.data.data && request.data.data.url;
                            if (shortUrl) {
                                return [2 /*return*/, shortUrl];
                            }
                            return [2 /*return*/];
                    }
                });
            });
        };
        ShareViewModel.prototype._roundValue = function (val) {
            return parseFloat(val.toFixed(4));
        };
        tslib_1.__decorate([
            decorators_1.property({
                dependsOn: ["view.ready"],
                readOnly: true
            })
        ], ShareViewModel.prototype, "state", null);
        tslib_1.__decorate([
            decorators_1.property({
                dependsOn: ["shareUrl"],
                readOnly: true
            })
        ], ShareViewModel.prototype, "embedCode", null);
        tslib_1.__decorate([
            decorators_1.property()
        ], ShareViewModel.prototype, "view", void 0);
        tslib_1.__decorate([
            decorators_1.property()
        ], ShareViewModel.prototype, "shareModalOpened", void 0);
        tslib_1.__decorate([
            decorators_1.property()
        ], ShareViewModel.prototype, "defaultObjectId", void 0);
        tslib_1.__decorate([
            decorators_1.property()
        ], ShareViewModel.prototype, "attachmentIndex", void 0);
        tslib_1.__decorate([
            decorators_1.property()
        ], ShareViewModel.prototype, "selectedLayerId", void 0);
        tslib_1.__decorate([
            decorators_1.property()
        ], ShareViewModel.prototype, "isDefault", void 0);
        tslib_1.__decorate([
            decorators_1.property({
                type: ShareItemCollection
            })
        ], ShareViewModel.prototype, "shareItems", void 0);
        tslib_1.__decorate([
            decorators_1.property({
                type: ShareFeatures
            })
        ], ShareViewModel.prototype, "shareFeatures", void 0);
        tslib_1.__decorate([
            decorators_1.property({ readOnly: true })
        ], ShareViewModel.prototype, "shareUrl", void 0);
        ShareViewModel = tslib_1.__decorate([
            decorators_1.subclass("ShareViewModel")
        ], ShareViewModel);
        return ShareViewModel;
    }(Accessor));
    return ShareViewModel;
});
//# sourceMappingURL=ShareViewModel.js.map