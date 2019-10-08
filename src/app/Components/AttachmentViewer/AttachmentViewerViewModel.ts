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

// esri.core.Accessor
import Accessor = require("esri/core/Accessor");

// esri.core.accessorSupport
import {
  subclass,
  declared,
  property
} from "esri/core/accessorSupport/decorators";

// esri.core.watchUtils
import watchUtils = require("esri/core/watchUtils");

// esri.core.Handles
import Handles = require("esri/core/Handles");

// esri.core.Collection
import Collection = require("esri/core/Collection");

// esri.tasks.support.Query
import Query = require("esri/tasks/support/Query");

// esri.tasks.Locator
import Locator = require("esri/tasks/Locator");

// esri.widgets.Feature
import Feature = require("esri/widgets/Feature");

// esri.geometry.Point
import Point = require("esri/geometry/Point");

import Search = require("esri/widgets/Search");

// AttachmentViewerData
import AttachmentViewerData = require("./AttachmentViewerData");

// PhotoCentricData
import PhotoCentricData = require("../PhotoCentric/PhotoCentricData");

// MapCentricData
import MapCentricData = require("../MapCentric/MapCentricData");

// esri.core.promiseUtils
import promiseUtils = require("esri/core/promiseUtils");

// Share
import Share = require("../Share");

// ShareFeatures
import ShareFeatures = require("../Share/ShareFeatures");

// LayerSwitcher
import LayerSwitcher = require("../LayerSwitcher");

// SelectedFeatureAttachments
import SelectedFeatureAttachments = require("./SelectedFeatureAttachments");

//----------------------------------
//
//  State
//
//----------------------------------
type State =
  | "ready"
  | "loading"
  | "disabled"
  | "downloading"
  | "querying"
  | "imageLoading"
  | "performingHitTest";

@subclass("AttachmentViewerViewModel")
class AttachmentViewerViewModel extends declared(Accessor) {
  private _handles: Handles = new Handles();
  private _preparingDownload: boolean = null;
  private _queryingForFeatures: IPromise<any> = null;
  private _performingHitTest: IPromise<any> = null;
  private _updateShareIndexes: boolean = null;

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
  @property({
    dependsOn: ["view.ready", "imageIsLoaded"],
    readOnly: true
  })
  get state(): State {
    const ready = this.get("view.ready");
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
  }

  //----------------------------------
  //
  //  Properties
  //
  //----------------------------------

  // view
  @property()
  view: __esri.MapView = null;

  // searchWidget
  @property()
  searchWidget: Search = null;

  // shareLocationWidget
  @property()
  shareLocationWidget: Share = null;

  // sketchWidget
  @property()
  sketchWidget: __esri.Sketch = null;

  // graphicsLayer
  @property()
  graphicsLayer: __esri.GraphicsLayer = null;

  // imageIsLoaded
  @property()
  imageIsLoaded: boolean = null;

  // appMode
  @property()
  appMode: string = null;

  // title
  @property()
  title: string = null;

  // onlyDisplayFeaturesWithAttachmentsIsEnabled
  @property()
  onlyDisplayFeaturesWithAttachmentsIsEnabled: boolean = null;

  // socialSharingEnabled
  @property()
  socialSharingEnabled: boolean = null;

  // socialSharingEnabled
  @property()
  selectFeaturesEnabled: boolean = null;

  // zoomLevel
  @property()
  zoomLevel: string = null;

  // downloadEnabled
  @property()
  downloadEnabled: boolean = null;

  // addressEnabled
  @property()
  addressEnabled: boolean = null;

  // order
  @property()
  order: string = null;

  // order
  @property()
  attachmentLayer: any = null;

  // attachmentViewerDataCollection
  @property()
  attachmentViewerDataCollection: Collection<
    AttachmentViewerData
  > = new Collection();

  // selectedAttachmentViewerData
  @property()
  selectedAttachmentViewerData: PhotoCentricData | MapCentricData = null;

  // featureWidget
  @property()
  featureWidget: Feature = null;

  // layerSwitcher
  @property()
  layerSwitcher: LayerSwitcher = null;

  @property({
    readOnly: true
  })
  supportedAttachmentTypes: string[] = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "video/mp4",
    "video/mov",
    "video/quicktime",
    "application/pdf"
  ];

  //----------------------------------
  //
  //  Lifecycle
  //
  //----------------------------------

  destroy() {
    this._handles.removeAll();
    this._handles = null;
  }

  // _setupShare
  setupShare(): void {
    const shareFeatures = new ShareFeatures({
      copyToClipboard: true,
      embedMap: false
    });
    const share = new Share({
      view: this.view,
      shareFeatures,
      container: document.createElement("div")
    });
    this.set("shareLocationWidget", share);
    this.sharePropIndexesWatcher();
  }

  // _updateSharePropIndexes
  sharePropIndexesWatcher(): __esri.WatchHandle {
    return watchUtils.watch(
      this,
      [
        "selectedAttachmentViewerData.objectIdIndex",
        "selectedAttachmentViewerData.attachmentIndex",
        "selectedAttachmentViewerData.defaultObjectId",
        "selectedAttachmentViewerData.selectedLayerId",
        "selectedAttachmentViewerData.layerFeatureIndex",
        "selectedAttachmentViewerData.selectedLayerId"
      ],
      () => {
        this.updateSharePropIndexes();
      }
    );
  }

  // _updateSharePropIndexes
  updateSharePropIndexes(): void {
    if (!this.selectedAttachmentViewerData) {
      return;
    }
    const { attachmentIndex, objectIdIndex, layerFeatureIndex } = this
      .selectedAttachmentViewerData as AttachmentViewerData;
    const featureObjectIds = this.get(
      "selectedAttachmentViewerData.featureObjectIds"
    ) as __esri.Collection<number>;
    const objectId = featureObjectIds.getItemAt(objectIdIndex) as number;
    this.set("shareLocationWidget.defaultObjectId", objectId);
    this.set("shareLocationWidget.attachmentIndex", attachmentIndex);
    this.set(
      "shareLocationWidget.selectedLayerId",
      this.selectedAttachmentViewerData.layerData.featureLayer.id
    );
    this.set("shareLocationWidget.layerFeatureIndex", layerFeatureIndex);
  }

  // _setUpdateShareIndexes
  setUpdateShareIndexes(): void {
    if (this._updateShareIndexes === null) {
      this._updateShareIndexes = true;
    }
  }

  // setFeatureInfo
  setFeatureInfo(featureWidget: Feature): void {
    const featureTitleKey = "feature-title";
    this._handles.add(
      watchUtils.when(featureWidget, "title", () => {
        this._handles.remove(featureTitleKey);
        this.set(
          "selectedAttachmentViewerData.featureLayerTitle",
          featureWidget.title
        );
      }),
      featureTitleKey
    );

    const featureContentKey = "feature-content";

    this._handles.add(
      watchUtils.when(
        featureWidget,
        "viewModel.formattedAttributes.global",
        () => {
          this._handles.remove(featureContentKey);
          const selectedFeatureContent = [];
          const fieldContents = featureWidget.get("viewModel.content") as any[];
          const attributes = featureWidget.get(
            "viewModel.formattedAttributes.global"
          );
          fieldContents &&
            fieldContents.forEach(content => {
              if (content.type === "fields") {
                content.fieldInfos.forEach(
                  (fieldInfo: __esri.FieldInfo, fieldInfoIndex: number) => {
                    if (
                      fieldInfo.fieldName !==
                      this.selectedAttachmentViewerData.layerData.featureLayer
                        .objectIdField
                    ) {
                      selectedFeatureContent[fieldInfoIndex] = {
                        attribute: fieldInfo.label,
                        content: attributes[fieldInfo.fieldName]
                      };
                    }
                  }
                );
              }
            });

          this.set(
            "selectedAttachmentViewerData.selectedFeatureInfo",
            selectedFeatureContent
          );
        }
      ),
      featureContentKey
    );
  }

  // zoomTo
  zoomTo(): void {
    const scale = this.zoomLevel ? parseInt(this.zoomLevel) : (32000 as number);
    const target = this.get(
      "selectedAttachmentViewerData.selectedFeature"
    ) as __esri.Graphic;
    this.view.goTo({
      target,
      scale
    });
  }

  // getTotalNumberOfAttachments
  getTotalNumberOfAttachments(): number {
    if (!this.selectedAttachmentViewerData) {
      return;
    }
    const selectedFeatureAttachments = this.get(
      "selectedAttachmentViewerData.selectedFeatureAttachments"
    ) as SelectedFeatureAttachments;
    if (selectedFeatureAttachments) {
      const attachments =
        selectedFeatureAttachments &&
        (selectedFeatureAttachments.get("attachments") as __esri.Collection<
          __esri.AttachmentInfo
        >);
      return attachments && attachments.get("length");
    }
  }

  // downloadImage
  downloadImage(event: Event): void {
    const node = event.currentTarget as HTMLImageElement;
    const url = node.getAttribute("data-image-url") as string;
    const fileName = node.getAttribute("data-image-name") as string;
    if (!url) {
      return;
    }
    const image = this._generateImgElement(url);
    this._preparingDownload = true;
    this.notifyChange("state");
    image.then((img: HTMLImageElement) => {
      const canvas = this._generateCanvasElement(img);
      this._processDownload(canvas, fileName);
    });
  }

  // _generateImgElement
  private _generateImgElement(url: string): Promise<HTMLImageElement> {
    return new Promise(resolve => {
      const img = new Image();
      img.crossOrigin = "*";
      img.onload = () => {
        resolve(img);
      };
      img.src = url;
    });
  }

  // _generateCanvasElement
  private _generateCanvasElement(img: HTMLImageElement): HTMLCanvasElement {
    const canvas = document.createElement("canvas");
    const { width, height } = img;
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext("2d");
    context.drawImage(img, 0, 0);
    return canvas;
  }

  // _processDownload
  private _processDownload(canvas: HTMLCanvasElement, fileName: string): void {
    if (!window.navigator.msSaveOrOpenBlob) {
      canvas.toBlob((blob: Blob) => {
        const dataUrl = URL.createObjectURL(blob);
        const imgURL = document.createElement("a") as HTMLAnchorElement;
        imgURL.setAttribute("href", dataUrl);
        imgURL.setAttribute("download", fileName);
        imgURL.style.display = "none";
        document.body.appendChild(imgURL);
        imgURL.click();
        document.body.removeChild(imgURL);
      });
    } else {
      const dataUrl = canvas.toDataURL();
      const mimeString = dataUrl
        .split(",")[0]
        .split(":")[1]
        .split(";")[0];

      canvas.toBlob(blob => {
        window.navigator.msSaveOrOpenBlob(blob, fileName);
      }, mimeString);
    }
    this._preparingDownload = false;
    this.notifyChange("state");
  }

  // previousImage
  previousImage(): void {
    const selectedFeatureAttachments = this.get(
      "selectedAttachmentViewerData.selectedFeatureAttachments"
    ) as Collection<__esri.AttachmentInfo>;
    const attachments =
      selectedFeatureAttachments &&
      (selectedFeatureAttachments.get("attachments") as __esri.Collection<
        __esri.AttachmentInfo
      >);

    const currentIndex =
      selectedFeatureAttachments &&
      (selectedFeatureAttachments.get("currentIndex") as number);
    // When a user is scrolling before first image, set displayed image to the last image
    if (currentIndex === 0) {
      selectedFeatureAttachments &&
        selectedFeatureAttachments.set(
          "currentIndex",
          attachments && attachments.length - 1
        );
    }
    // Go back one image
    else {
      const updatedCurrentIndex = currentIndex - 1;
      selectedFeatureAttachments &&
        selectedFeatureAttachments.set("currentIndex", updatedCurrentIndex);
    }

    this.set(
      "selectedAttachmentViewerData.attachmentIndex",
      selectedFeatureAttachments &&
        (selectedFeatureAttachments.get("currentIndex") as number)
    );
  }

  // nextImage
  nextImage(): void {
    const selectedFeatureAttachments = this.get(
      "selectedAttachmentViewerData.selectedFeatureAttachments"
    ) as any;
    const attachments =
      selectedFeatureAttachments &&
      (selectedFeatureAttachments.get("attachments") as __esri.Collection<
        __esri.AttachmentInfo
      >);

    const currentIndex =
      selectedFeatureAttachments &&
      (selectedFeatureAttachments.get("currentIndex") as number);
    // When a user is scrolling after last image, set displayed image to the first image
    if (currentIndex < attachments.length - 1) {
      const updatedCurrentIndex = currentIndex + 1;
      selectedFeatureAttachments &&
        selectedFeatureAttachments.set("currentIndex", updatedCurrentIndex);
    }
    // Go forward one image
    else {
      selectedFeatureAttachments &&
        selectedFeatureAttachments.set("currentIndex", 0);
    }
    this.set(
      "selectedAttachmentViewerData.attachmentIndex",
      selectedFeatureAttachments &&
        selectedFeatureAttachments.get("currentIndex")
    );
  }

  // getGPSInformation
  getGPSInformation(attachment: __esri.AttachmentInfo): number {
    const exifInfo =
      attachment && (attachment.get("exifInfo") as __esri.ExifInfo[]);

    const GPS =
      exifInfo &&
      exifInfo.filter(exifInfoItem => {
        return exifInfoItem.name === "GPS";
      })[0];

    const gpsImageDirection =
      GPS &&
      GPS.tags.filter(tagItem => {
        return tagItem.name === "GPS Img Direction";
      })[0];

    const gpsImageDirectionVal = gpsImageDirection && gpsImageDirection.value;
    const twoDecimalPlaces = parseFloat(
      gpsImageDirectionVal && gpsImageDirectionVal.toFixed(2)
    );

    return isNaN(twoDecimalPlaces) ? null : twoDecimalPlaces;
  }

  // getAddress
  getAddress(geometry: __esri.Geometry): void {
    if (!geometry) {
      return;
    }
    if (geometry.type !== "point") {
      return;
    }

    const point = new Point(geometry);

    const locator = new Locator({
      url: "https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer"
    });

    locator
      .locationToAddress({ location: point })
      .catch((err: Error) => {
        console.error("LOCATION TO ADDRESS ERROR: ", err);
        this.set("selectedAttachmentViewerData.selectedFeatureAddress", null);
      })
      .then((addressCandidate: __esri.AddressCandidate): void => {
        if (!addressCandidate) {
          return;
        }
        this.set(
          "selectedAttachmentViewerData.selectedFeatureAddress",
          addressCandidate.address
        );
      });
  }

  // getAttachmentInfos
  getAttachmentInfos(feature: __esri.Feature): __esri.AttachmentInfo[] {
    if (!feature) {
      return;
    }
    const featureContentItems = feature.get("viewModel.content") as any[];
    if (!featureContentItems) {
      return;
    }
    const attachmentContent = featureContentItems.filter(featureContent => {
      return featureContent.type === "attachments";
    })[0];
    return (
      attachmentContent &&
      (attachmentContent.get("attachmentInfos") as __esri.AttachmentInfo[])
    );
  }
}

export = AttachmentViewerViewModel;
