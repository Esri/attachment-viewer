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

/// <amd-dependency path="esri/core/tsSupport/declareExtendsHelper" name="__extends" />
/// <amd-dependency path="esri/core/tsSupport/decorateHelper" name="__decorate" />
var __extends = (this && this.__extends) || (function () {
  var extendStatics = Object.setPrototypeOf ||
    ({
        __proto__: []
      }
      instanceof Array && function (d, b) {
        d.__proto__ = b;
      }) ||
    function (d, b) {
      for (var p in b)
        if (b.hasOwnProperty(p)) d[p] = b[p];
    };
  return function (d, b) {
    extendStatics(d, b);

    function __() {
      this.constructor = d;
    }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
  };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
  var c = arguments.length,
    r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
    d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
  else
    for (var i = decorators.length - 1; i >= 0; i--)
      if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
};
define(["require", "exports", "esri/core/tsSupport/declareExtendsHelper", "esri/core/tsSupport/decorateHelper", "esri/core/Accessor", "esri/core/Collection", "esri/core/requireUtils", "esri/core/promiseUtils", "esri/core/accessorSupport/decorators", "esri/geometry/Point", "esri/request", "require", "./ShareItem", "./ShareFeatures", "esri/core/watchUtils", "esri/core/Handles"], function (require, exports, __extends, __decorate, Accessor, Collection, requireUtils, promiseUtils, decorators_1, Point, esriRequest, moduleRequire, ShareItem, ShareFeatures, watchUtils, Handles) {
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
    urlTemplate: "https://www.facebook.com/sharer/sharer.php?s=100&p[url]={url}"
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
    __extends(ShareViewModel, _super);

    function ShareViewModel() {
      var _this = _super !== null && _super.apply(this, arguments) || this;
      _this._handles = new Handles();
      //----------------------------------
      //
      //  Private Variables
      //
      //----------------------------------
      // Promises for widget state
      _this._shortenPromise = null;
      _this._projectionPromise = null;
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
        return ready ?
          this._projectionPromise ?
          "projecting" :
          this._shortenPromise ?
          "shortening" :
          "ready" :
          this.view ?
          "loading" :
          "disabled";
      },
      enumerable: true,
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
      enumerable: true,
      configurable: true
    });
    ShareViewModel.prototype.initialize = function () {
      var _this = this;
      this._handles.add([
        watchUtils.watch(this, ["defaultObjectId", "attachmentIndex"], function () {
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
      var _this = this;
      if (!this.isDefault) {
        return this._generateShareUrl().then(function (url) {
          var shortenLink = _this.shareFeatures.shortenLink;
          if (shortenLink) {
            return _this._shorten(url).then(function (shortenedUrl) {
              _this._shortenPromise = null;
              _this.notifyChange("state");
              _this._set("shareUrl", shortenedUrl);
              return promiseUtils.resolve(shortenedUrl);
            });
          }
          _this._set("shareUrl", url);
          return promiseUtils.resolve(url);
        });
      }
      else {
        var shortenLink = this.shareFeatures.shortenLink;
        if (shortenLink) {
          var href = window.location.href;
          return this._shorten(href).then(function (shortenedUrl) {
            _this._shortenPromise = null;
            _this.notifyChange("state");
            _this._set("shareUrl", shortenedUrl);
            return promiseUtils.resolve(shortenedUrl);
          });
        }
      }
    };
    //----------------------------------
    //
    //  Private Methods
    //
    //----------------------------------
    ShareViewModel.prototype._generateShareUrl = function () {
      var _this = this;
      var href = window.location.href;
      // If view is not ready
      if (!this.get("view.ready")) {
        return promiseUtils.resolve(href);
      }
      // Use x/y values and the spatial reference of the view to instantiate a geometry point
      var _a = this.view.center,
        x = _a.x,
        y = _a.y;
      var spatialReference = this.view.spatialReference;
      var centerPoint = new Point({
        x: x,
        y: y,
        spatialReference: spatialReference
      });
      // Use pointToConvert to project point. Once projected, pass point to generate the share URL parameters
      return this._processPoint(centerPoint).then(function (point) {
        _this._projectionPromise = null;
        _this.notifyChange("state");
        return _this._generateShareUrlParams(point);
      });
    };
    ShareViewModel.prototype._processPoint = function (point) {
      var _a = point.spatialReference,
        isWGS84 = _a.isWGS84,
        isWebMercator = _a.isWebMercator;
      // If spatial reference is WGS84 or Web Mercator, use longitude/latitude values to generate the share URL parameters
      if (isWGS84 || isWebMercator) {
        return promiseUtils.resolve(point);
      }
      this._projectionPromise = requireUtils.when(moduleRequire, [
        "esri/geometry/projection",
        "esri/geometry/SpatialReference"
      ]);
      this.notifyChange("state");
      return this._projectionPromise.then(function (_a) {
        var projection = _a[0],
          SpatialReference = _a[1];
        var outputSpatialReference = new SpatialReference({
          wkid: 4326
        });
        return projection.load().then(function () {
          // Check if client side projection is not supported
          if (!projection.isSupported()) {
            var point_1 = new Point({
              x: null,
              y: null
            });
            return promiseUtils.resolve(point_1);
          }
          var projectedPoint = projection.project(point, outputSpatialReference);
          return promiseUtils.resolve(projectedPoint);
        });
      });
    };
    ShareViewModel.prototype._generateShareUrlParams = function (point) {
      var href = window.location.href;
      var longitude = point.longitude,
        latitude = point.latitude;
      if (longitude === undefined || latitude === undefined) {
        return href;
      }
      var roundedLon = this._roundValue(longitude);
      var roundedLat = this._roundValue(latitude);
      var zoom = this.view.zoom;
      var roundedZoom = this._roundValue(zoom);
      var path = href.split("center")[0];
      // If no "?", then append "?". Otherwise, check for "?" and "="
      var sep = path.indexOf("?") === -1 ?
        "?" :
        path.indexOf("?") !== -1 && path.indexOf("=") !== -1 ?
        path.indexOf("&") === -1 ?
        "&" :
        "" :
        "";
      var defaultObjectId = this.defaultObjectId !== null ?
        "&defaultObjectId=" + this.defaultObjectId :
        "";
      var attachmentIndex = this.attachmentIndex !== null ?
        "&attachmentIndex=" + this.attachmentIndex :
        "";
      var shareParams = "" + path + sep + "center=" + roundedLon + "," + roundedLat + "&level=" + roundedZoom + defaultObjectId + attachmentIndex;
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
        if (this.defaultObjectId !== null) {
          params.set("defaultObjectId", "" + this.defaultObjectId);
        }
        if (this.attachmentIndex !== null) {
          params.set("attachmentIndex", "" + this.attachmentIndex);
        }
        window.history.replaceState({}, "", location.pathname + "?" + params);
      }
      // Otherwise, just return original url parameters for 2D
      return shareParams;
    };
    ShareViewModel.prototype._shorten = function (url) {
      var requestOptions = {
        callbackParamName: "callback",
        query: {
          longUrl: url,
          f: "json"
        }
      };
      this._shortenPromise = esriRequest(SHORTEN_API, requestOptions);
      this.notifyChange("state");
      return this._shortenPromise
        .catch(function (res) {
          return res;
        })
        .then(function (res) {
          var shortUrl = res.data && res.data.data && res.data.data.url;
          if (shortUrl) {
            return shortUrl;
          }
        });
    };
    ShareViewModel.prototype._roundValue = function (val) {
      return parseFloat(val.toFixed(4));
    };
    __decorate([
      decorators_1.property({
        dependsOn: ["view.ready"],
        readOnly: true
      })
    ], ShareViewModel.prototype, "state", null);
    __decorate([
      decorators_1.property({
        dependsOn: ["shareUrl"],
        readOnly: true
      })
    ], ShareViewModel.prototype, "embedCode", null);
    __decorate([
      decorators_1.property()
    ], ShareViewModel.prototype, "view", void 0);
    __decorate([
      decorators_1.property()
    ], ShareViewModel.prototype, "shareModalOpened", void 0);
    __decorate([
      decorators_1.property()
    ], ShareViewModel.prototype, "defaultObjectId", void 0);
    __decorate([
      decorators_1.property()
    ], ShareViewModel.prototype, "attachmentIndex", void 0);
    __decorate([
      decorators_1.property()
    ], ShareViewModel.prototype, "isDefault", void 0);
    __decorate([
      decorators_1.property({
        type: ShareItemCollection
      })
    ], ShareViewModel.prototype, "shareItems", void 0);
    __decorate([
      decorators_1.property({
        type: ShareFeatures
      })
    ], ShareViewModel.prototype, "shareFeatures", void 0);
    __decorate([
      decorators_1.property({
        readOnly: true
      })
    ], ShareViewModel.prototype, "shareUrl", void 0);
    ShareViewModel = __decorate([
      decorators_1.subclass("ShareViewModel")
    ], ShareViewModel);
    return ShareViewModel;
  }(decorators_1.declared(Accessor)));
  return ShareViewModel;
});
//# sourceMappingURL=ShareViewModel.js.map
