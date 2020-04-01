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
import Collection = require("esri/core/Collection");
import Handles = require("esri/core/Handles");
import watchUtils = require("esri/core/watchUtils");

// esri.core.accessorSupport
import {
  subclass,
  declared,
  property
} from "esri/core/accessorSupport/decorators";

// esri.views
import MapView = require("esri/views/MapView");
import SceneView = require("esri/views/SceneView");

//esri.geometry
import Point = require("esri/geometry/Point");
import projection = require("esri/geometry/projection");
import SpatialReference = require("esri/geometry/SpatialReference");

// esri.request
import esriRequest = require("esri/request");

// Share Item
import ShareItem = require("./ShareItem");

// Share Feature
import ShareFeatures = require("./ShareFeatures");

//----------------------------------
//
//  Share Item Collection
//
//----------------------------------
const ShareItemCollection = Collection.ofType<ShareItem>(ShareItem);

//----------------------------------
//
//  Default Share Items
//
//----------------------------------
const FACEBOOK_ITEM = new ShareItem({
  id: "facebook",
  name: "Facebook",
  urlTemplate: "https://www.facebook.com/sharer/sharer.php?s=100&u={url}"
});
const TWITTER_ITEM = new ShareItem({
  id: "twitter",
  name: "Twitter",
  urlTemplate: "https://twitter.com/intent/tweet?text={summary}&url={url}"
});

//----------------------------------
//
//  Shorten URL API
//
//----------------------------------
const SHORTEN_API = "https://arcg.is/prod/shorten";

//----------------------------------
//
//  State
//
//----------------------------------
type State = "ready" | "loading" | "shortening" | "projecting" | "disabled";

@subclass("ShareViewModel")
class ShareViewModel extends declared(Accessor) {
  private _handles: Handles = new Handles();

  //----------------------------------
  //
  //  Lifecycle
  //
  //----------------------------------

  destroy() {
    this.shareItems.removeAll();
    this.view = null;
  }

  //----------------------------------
  //
  //  Private Variables
  //
  //----------------------------------

  // Promises for widget state
  private _shortening = false;
  private _projecting = false;

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
    return ready
      ? this._projecting
        ? "projecting"
        : this._shortening
        ? "shortening"
        : "ready"
      : this.view
      ? "loading"
      : "disabled";
  }

  //----------------------------------
  //
  //  embedCode - readOnly
  //
  //----------------------------------
  @property({
    dependsOn: ["shareUrl"],
    readOnly: true
  })
  get embedCode(): string {
    return `<iframe src="${this.shareUrl}" width="600" height="450" frameborder="0" style="border:0" allowfullscreen></iframe>`;
  }

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
  @property() view: MapView | SceneView = null;

  //----------------------------------
  //
  // shareModalOpened
  //
  //----------------------------------
  @property() shareModalOpened: boolean = null;

  //----------------------------------
  //
  // defaultObjectId
  //
  //----------------------------------
  @property() defaultObjectId: number = null;

  //----------------------------------
  //
  // attachmentIndex
  //
  //----------------------------------
  @property() attachmentIndex: number = null;

  //----------------------------------
  //
  // selectedLayerId
  //
  //----------------------------------
  @property() selectedLayerId: string = null;

  //----------------------------------
  //
  // isDefault
  //
  //----------------------------------
  @property() isDefault: boolean = null;

  //----------------------------------
  //
  //  shareItems
  //
  //----------------------------------
  @property({
    type: ShareItemCollection
  })
  shareItems: Collection<ShareItem> = new ShareItemCollection([
    FACEBOOK_ITEM,
    TWITTER_ITEM
  ]);

  //----------------------------------
  //
  //  shareFeatures
  //
  //----------------------------------
  @property({
    type: ShareFeatures
  })
  shareFeatures = new ShareFeatures();

  //----------------------------------
  //
  //  shareUrl - readOnly
  //
  //----------------------------------
  @property({ readOnly: true })
  shareUrl: string = null;

  initialize() {
    this._handles.add([
      watchUtils.watch(
        this,
        ["defaultObjectId", "attachmentIndex", "selectedLayerId"],
        () => {
          if (!this.isDefault) {
            this.generateUrl();
          }
        }
      )
    ]);
  }

  //----------------------------------
  //
  //  Public Methods
  //
  //----------------------------------
  async generateUrl(): Promise<string> {
    if (!this.isDefault) {
      const url = await this._generateShareUrl();
      const { shortenLink } = this.shareFeatures;

      if (shortenLink) {
        const shortenedUrl = await this._shorten(url);
        this._set("shareUrl", shortenedUrl);
        return shortenedUrl;
      }
      this._set("shareUrl", url);
      return url;
    } else {
      const { shortenLink } = this.shareFeatures;
      const { href } = window.location;
      if (shortenLink) {
        const shortenedUrl = await this._shorten(href);
        this._set("shareUrl", shortenedUrl);
        return shortenedUrl;
      }
      this._set("shareUrl", href);
      return href;
    }
  }

  //----------------------------------
  //
  //  Private Methods
  //
  //----------------------------------
  private async _generateShareUrl(): Promise<string> {
    const { href } = window.location;
    // If view is not ready
    if (!this.get("view.ready")) {
      return href;
    }
    // Use x/y values and the spatial reference of the view to instantiate a geometry point
    const { x, y } = this.view.center;
    const { spatialReference } = this.view;
    const centerPoint = new Point({
      x,
      y,
      spatialReference
    });

    // Use pointToConvert to project point. Once projected, pass point to generate the share URL parameters
    const point = await this._processPoint(centerPoint);
    return this._generateShareUrlParams(point);
  }

  private async _processPoint(point: Point): Promise<Point> {
    const { isWGS84, isWebMercator } = point.spatialReference;

    // If spatial reference is WGS84 or Web Mercator, use longitude/latitude values to generate the share URL parameters
    if (isWGS84 || isWebMercator) {
      return point;
    }
    this._projecting = true;
    this.notifyChange("state");
    await projection.load();
    // Check if client side projection is not supported
    if (!projection.isSupported()) {
      const point = new Point({
        x: null,
        y: null
      });
      this._projecting = false;
      this.notifyChange("state");
      return point;
    }
    const outputSpatialReference = new SpatialReference({
      wkid: 4326
    });
    const projectedPoint = projection.project(
      point,
      outputSpatialReference
    ) as Point;
    this._projecting = false;
    this.notifyChange("state");
    return projectedPoint;
  }

  private _generateShareUrlParams(point: Point): string {
    const { href } = window.location;
    const { longitude, latitude } = point;
    if (longitude === undefined || latitude === undefined) {
      return href;
    }
    const roundedLon = this._roundValue(longitude);
    const roundedLat = this._roundValue(latitude);
    const { zoom } = this.view;
    const roundedZoom = this._roundValue(zoom);
    const path = href.split("center")[0];
    // If no "?", then append "?". Otherwise, check for "?" and "="
    const sep =
      path.indexOf("?") === -1
        ? "?"
        : path.indexOf("?") !== -1 && path.indexOf("=") !== -1
        ? path.indexOf("&") === -1
          ? "&"
          : ""
        : "";

    const defaultObjectId =
      this.defaultObjectId !== null && this.defaultObjectId !== undefined
        ? `&defaultObjectId=${this.defaultObjectId}`
        : "";

    const attachmentIndex =
      this.attachmentIndex !== null && this.attachmentIndex !== undefined
        ? `&attachmentIndex=${this.attachmentIndex}`
        : "";
    const selectedLayerId =
      this.selectedLayerId !== null && this.selectedLayerId !== undefined
        ? `&selectedLayerId=${this.selectedLayerId}`
        : "";

    const shareParams = `${path}${sep}center=${roundedLon},${roundedLat}&level=${roundedZoom}${defaultObjectId}${attachmentIndex}${selectedLayerId}`;

    let isSupported = false;

    const userAgent = window.navigator.userAgent;
    const msie = userAgent.indexOf("MSIE ");
    const edge = userAgent.indexOf("Edge");

    if (
      msie > 0 ||
      !!navigator.userAgent.match(/Trident.*rv\:11\./) ||
      edge > 0
    ) {
      isSupported = true;
    }

    if (!isSupported) {
      const url = new URL(window.location.href);
      const params = new URLSearchParams(url.search);
      params.set("center", `${roundedLon},${roundedLat}`);
      params.set("level", `${roundedZoom}`);
      if (this.defaultObjectId || this.defaultObjectId === 0) {
        params.set("defaultObjectId", `${this.defaultObjectId}`);
      } else {
        params.delete("defaultObjectId");
      }

      if (this.attachmentIndex !== null) {
        params.set("attachmentIndex", `${this.attachmentIndex}`);
      }

      if (this.selectedLayerId !== null) {
        params.set("selectedLayerId", `${this.selectedLayerId}`);
      }

      window.history.replaceState({}, "", `${location.pathname}?${params}`);
    }

    // Otherwise, just return original url parameters for 2D
    return shareParams;
  }

  private async _shorten(url: string): Promise<string> {
    const requestOptions = {
      callbackParamName: "callback",
      query: {
        longUrl: url,
        f: "json"
      }
    } as any;
    this._shortening = true;
    this.notifyChange("state");
    const request = await esriRequest(SHORTEN_API, requestOptions);
    this._shortening = false;
    this.notifyChange("state");
    const shortUrl = request.data && request.data.data && request.data.data.url;
    if (shortUrl) {
      return shortUrl;
    }
  }

  private _roundValue(val: number): number {
    return parseFloat(val.toFixed(4));
  }
}

export = ShareViewModel;
