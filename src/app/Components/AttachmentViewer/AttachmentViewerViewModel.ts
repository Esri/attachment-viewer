// Copyright 2023 Esri
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
import Accessor from "@arcgis/core/core/Accessor";

// esri.core.accessorSupport
import { subclass, property } from "@arcgis/core/core/accessorSupport/decorators";

// esri.core.reactiveUtils
import { when, watch } from "@arcgis/core/core/reactiveUtils";

// esri.core.Handles
import Handles from "@arcgis/core/core/Handles";

// esri.core.Collection
import Collection from "@arcgis/core/core/Collection";

// esri.rest.locator
import { locationToAddress } from "@arcgis/core/rest/locator";

// esri.widgets.Feature
import Feature from "@arcgis/core/widgets/Feature";

// esri.geometry.Point
import Point from "@arcgis/core/geometry/Point";

import Search from "@arcgis/core/widgets/Search";

// AttachmentViewerData
import AttachmentViewerData from "./AttachmentViewerData";

// PhotoCentricData
import PhotoCentricData from "../PhotoCentric/PhotoCentricData";

// MapCentricData
import MapCentricData from "../MapCentric/MapCentricData";

// LayerSwitcher
import LayerSwitcher from "../LayerSwitcher";

// RelatedFeatures
import RelatedFeatures from "../RelatedFeatures/RelatedFeatures";

// SelectedFeatureAttachments
import SelectedFeatureAttachments from "./SelectedFeatureAttachments";

import FeatureEffect from "@arcgis/core/layers/support/FeatureEffect";
import FeatureFilter from "@arcgis/core/layers/support/FeatureFilter";

import FeatureForm from "@arcgis/core/widgets/FeatureForm";
import Graphic from "@arcgis/core/Graphic";

import { checkCustomTheme } from "templates-common-library/functionality/configUtils";

const LOCATOR_SERVICE_URL = "https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer";

// ----------------------------------
//
//  State
//
// ----------------------------------
type State =
  | "ready"
  | "loading"
  | "disabled"
  | "downloading"
  | "querying"
  | "imageLoading"
  | "performingHitTest"
  | "editing";

@subclass("AttachmentViewerViewModel")
class AttachmentViewerViewModel extends Accessor {
  private _handles: Handles | null = new Handles();
  private _preparingDownload: boolean | null = null;
  private _queryingForFeatures: Promise<any> | null = null;
  private _performingHitTest: Promise<any> | null = null;
  private _updateShareIndexes: boolean | null = null;
  private _editingFeature: boolean = false;

  // ----------------------------------
  //
  //  Private Variables
  //
  // ----------------------------------

  // ----------------------------------
  //
  //  state - readOnly
  //
  // ----------------------------------
  @property({
    dependsOn: ["view.ready"],
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
        : this._editingFeature
        ? "editing"
        : "ready"
      : this.view
      ? "loading"
      : "disabled";
  }

  // ----------------------------------
  //
  //  Properties
  //
  // ----------------------------------

  @property()
  customTheme: any = null;

  @property()
  featureFormWidget: __esri.FeatureForm | null = null;

  @property()
  errorMessage = null;

  // view
  @property()
  view: __esri.MapView | null = null;

  // searchWidget
  @property()
  searchWidget: Search | null = null;

  // sketchWidget
  @property()
  sketchWidget: __esri.Sketch | null = null;

  // graphicsLayer
  @property()
  graphicsLayer: __esri.GraphicsLayer | null = null;

  // appMode
  @property()
  appMode: string | null = null;

  // title
  @property()
  title: string | null = null;

  // socialSharingEnabled
  @property()
  socialSharingEnabled: boolean | null = null;

  // socialSharingEnabled
  @property()
  selectFeaturesEnabled: boolean | null = null;

  // zoomLevel
  @property()
  zoomLevel: string | null = null;

  // downloadEnabled
  @property()
  downloadEnabled: boolean | null = null;

  // addressEnabled
  @property()
  addressEnabled: boolean | null = null;

  // order
  @property()
  order: string | null = null;

  // order
  @property()
  attachmentLayer: any = null;

  // attachmentViewerDataCollection
  @property()
  attachmentViewerDataCollection: Collection<AttachmentViewerData> = new Collection();

  // selectedAttachmentViewerData
  @property()
  selectedAttachmentViewerData: PhotoCentricData | MapCentricData | null = null;

  // featureWidget
  @property()
  featureWidget: Feature | null = null;

  @property()
  applyEffectToNonActiveLayers = null;

  @property()
  nonActiveLayerEffects: any = null;

  // layerSwitcher
  @property()
  layerSwitcher: LayerSwitcher | null = null;

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

  // withinConfigurationExperience
  @property()
  withinConfigurationExperience: boolean | null = null;

  @property()
  relatedFeatures: RelatedFeatures | null = null;

  @property()
  onlyDisplayFeaturesWithAttachments: boolean | null = null;

  @property()
  attributeEditing: boolean | null = null;

  @property()
  attrEditError = null;

  @property()
  attrEditModal = null;

  @property()
  queryParams: any;

  // THEME PROPS
  @property()
  applySharedTheme: boolean;

  @property()
  sharedTheme: any = null;

  @property()
  applicationItem: __esri.PortalItem;

  @property()
  token: string;

  @property()
  headerBackground: string;

  @property()
  headerColor: string;

  @property()
  enableHeaderBackground: boolean;

  @property()
  enableHeaderColor: boolean;

  // ----------------------------------
  //
  //  Lifecycle
  //
  // ----------------------------------

  initialize() {
    this._handles?.add([
      when(
        () => this.view,
        () => {
          this.relatedFeatures = new RelatedFeatures({
            view: this.view
          });
          this._addAttributeEditWatchHandles();
        }
      ),
      when(
        () => this.selectedAttachmentViewerData,
        () => {
          if (this.applyEffectToNonActiveLayers) {
            this.addEffectToNonActiveLayers();
          }
          this._handles?.add(
            watch(
              () => this.selectedAttachmentViewerData,
              () => {
                if (this.applyEffectToNonActiveLayers) {
                  this.addEffectToNonActiveLayers();
                }
              }
            )
          );
        },
        {
          once: true
        }
      ),
      watch(
        () => this.applyEffectToNonActiveLayers,
        () => {
          if (this.applyEffectToNonActiveLayers) {
            this.addEffectToNonActiveLayers();
          } else {
            this.removeEffectToNonActiveLayers();
          }
        }
      ),
      watch(
        () => this.nonActiveLayerEffects,
        () => {
          if (this.applyEffectToNonActiveLayers) {
            this.removeEffectToNonActiveLayers();
            this.addEffectToNonActiveLayers();
          }
        }
      ),
      when(
        () => this.applicationItem,
        () => {
          this.setToken();
        },
        { once: true }
      )
    ]);
  }

  destroy() {
    this._handles?.removeAll();
    this._handles = null;
  }

  // _setupShare
  setupShare(): void {
    this.sharePropIndexesWatcher();
  }

  // sharePropIndexesWatcher
  sharePropIndexesWatcher(): __esri.WatchHandle {
    return watch(
      () => [
        this.selectedAttachmentViewerData?.featureObjectIds,
        this.selectedAttachmentViewerData?.objectIdIndex,
        this.selectedAttachmentViewerData?.attachmentIndex,
        this.selectedAttachmentViewerData?.defaultObjectId,
        this.selectedAttachmentViewerData?.selectedLayerId,
        this.selectedAttachmentViewerData?.layerFeatureIndex
      ],
      this.updateSharePropIndexes()
    );
  }

  // updateSharePropIndexes
  updateSharePropIndexes() {
    return () => {
      if (!this.selectedAttachmentViewerData || this.withinConfigurationExperience) {
        return;
      }
      const { attachmentIndex, objectIdIndex, layerFeatureIndex, layerData } = this
        .selectedAttachmentViewerData as AttachmentViewerData;
      const featureObjectIds = this.get("selectedAttachmentViewerData.featureObjectIds") as __esri.Collection<number>;
      const defaultObjectId = featureObjectIds.getItemAt(objectIdIndex) as number;
      const selectedLayerId = layerData?.featureLayer?.id;
      const selectedFeatureData = this.selectedAttachmentViewerData?.selectedFeature
        ? {
            defaultObjectId,
            attachmentIndex,
            layerFeatureIndex
          }
        : {};
      const data = {
        ...selectedFeatureData,
        selectedLayerId
      } as any;
      const queryParams = {} as any;
      for (const prop in data) {
        queryParams[prop] = data[prop];
      }
      this.queryParams = queryParams;
    };
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
    this._handles?.add(
      when(
        () => featureWidget?.title,
        () => {
          this._handles?.remove(featureTitleKey);
          this.set("selectedAttachmentViewerData.featureLayerTitle", featureWidget.title);
        }
      ),
      featureTitleKey
    );

    const featureContentKey = "feature-content";

    this._handles?.add(
      when(
        () => featureWidget?.viewModel?.formattedAttributes?.global,
        () => {
          this._handles?.remove(featureContentKey);
          const selectedFeatureContent: { attribute: string; content: any }[] = [];
          const fieldContents = featureWidget.get("viewModel.content") as any[];
          const attributes = featureWidget.get("viewModel.formattedAttributes.global") as any;
          fieldContents &&
            fieldContents.forEach((content) => {
              if (content.type === "fields") {
                content?.fieldInfos?.forEach((fieldInfo: __esri.FieldInfo, fieldInfoIndex: number) => {
                  if (
                    fieldInfo.fieldName !== this.selectedAttachmentViewerData?.layerData?.featureLayer?.objectIdField
                  ) {
                    selectedFeatureContent[fieldInfoIndex] = {
                      attribute: fieldInfo.label,
                      content: attributes[fieldInfo.fieldName]
                    };
                  }
                });
              }
            });

          this.set("selectedAttachmentViewerData.selectedFeatureInfo", selectedFeatureContent);
        },
        { initial: true }
      ),
      featureContentKey
    );
  }

  // getTotalNumberOfAttachments
  getTotalNumberOfAttachments(): number | undefined {
    if (!this.selectedAttachmentViewerData) {
      return;
    }
    const selectedFeatureAttachments = this.get(
      "selectedAttachmentViewerData.selectedFeatureAttachments"
    ) as SelectedFeatureAttachments;
    if (selectedFeatureAttachments) {
      const attachments =
        selectedFeatureAttachments &&
        (selectedFeatureAttachments.get("attachments") as __esri.Collection<__esri.AttachmentInfo>);
      return attachments && attachments.get("length");
    }
    return;
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
    return new Promise((resolve) => {
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
    context?.drawImage(img, 0, 0);
    return canvas;
  }

  // _processDownload
  private _processDownload(canvas: HTMLCanvasElement, fileName: string): void {
    const navigator = window.navigator as any;
    const fileExt = fileName.slice(fileName.lastIndexOf(".")).split(".")[1];
    const type = `image/${fileExt}`;
    if (!navigator.msSaveOrOpenBlob) {
      canvas.toBlob((blob: Blob | null) => {
        const dataUrl = URL.createObjectURL(blob as Blob);
        const imgURL = document.createElement("a") as HTMLAnchorElement;
        imgURL.setAttribute("href", dataUrl);
        imgURL.setAttribute("download", fileName);
        imgURL.style.display = "none";
        document.body.appendChild(imgURL);
        imgURL.click();
        document.body.removeChild(imgURL);
      }, type);
    } else {
      const dataUrl = canvas.toDataURL();
      const mimeString = dataUrl.split(",")[0].split(":")[1].split(";")[0];

      canvas.toBlob((blob) => {
        navigator.msSaveOrOpenBlob(blob, fileName);
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
      (selectedFeatureAttachments.get("attachments") as __esri.Collection<__esri.AttachmentInfo>);

    const currentIndex = selectedFeatureAttachments && (selectedFeatureAttachments.get("currentIndex") as number);
    // When a user is scrolling before first image, set displayed image to the last image
    if (currentIndex === 0) {
      selectedFeatureAttachments &&
        selectedFeatureAttachments.set("currentIndex", attachments && attachments.length - 1);
    }
    // Go back one image
    else {
      const updatedCurrentIndex = currentIndex - 1;
      selectedFeatureAttachments && selectedFeatureAttachments.set("currentIndex", updatedCurrentIndex);
    }

    this.set(
      "selectedAttachmentViewerData.attachmentIndex",
      selectedFeatureAttachments && (selectedFeatureAttachments.get("currentIndex") as number)
    );
  }

  // nextImage
  nextImage(): void {
    const selectedFeatureAttachments = this.get("selectedAttachmentViewerData.selectedFeatureAttachments") as any;
    const attachments =
      selectedFeatureAttachments &&
      (selectedFeatureAttachments.get("attachments") as __esri.Collection<__esri.AttachmentInfo>);

    const currentIndex = selectedFeatureAttachments && (selectedFeatureAttachments.get("currentIndex") as number);
    // When a user is scrolling after last image, set displayed image to the first image
    if (currentIndex < attachments.length - 1) {
      const updatedCurrentIndex = currentIndex + 1;
      selectedFeatureAttachments && selectedFeatureAttachments.set("currentIndex", updatedCurrentIndex);
    }
    // Go forward one image
    else {
      selectedFeatureAttachments && selectedFeatureAttachments.set("currentIndex", 0);
    }
    this.set(
      "selectedAttachmentViewerData.attachmentIndex",
      selectedFeatureAttachments && selectedFeatureAttachments.get("currentIndex")
    );
  }

  // getGPSInformation
  getGPSInformation(attachment: __esri.AttachmentInfo): number | null {
    const exifInfo = attachment && (attachment.get("exifInfo") as __esri.ExifInfo[]);

    const GPS =
      exifInfo &&
      exifInfo.filter((exifInfoItem) => {
        return exifInfoItem.name === "GPS";
      })[0];

    const gpsImageDirection =
      GPS &&
      GPS?.tags?.filter((tagItem) => {
        return tagItem.name === "GPS Img Direction";
      })[0];

    const gpsImageDirectionVal = gpsImageDirection && gpsImageDirection.value;
    const twoDecimalPlaces = parseFloat(gpsImageDirectionVal && gpsImageDirectionVal.toFixed(2));

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

    locationToAddress(LOCATOR_SERVICE_URL, { location: point })
      .catch((err: Error) => {
        console.error("LOCATION TO ADDRESS ERROR: ", err);
        this.set("selectedAttachmentViewerData.selectedFeatureAddress", null);
      })
      .then((addressCandidate: __esri.AddressCandidate | void): void => {
        if (!addressCandidate) {
          return;
        }
        this.set("selectedAttachmentViewerData.selectedFeatureAddress", addressCandidate.address);
      });
  }

  // getAttachmentInfos
  getAttachmentInfos(feature: __esri.Feature): __esri.AttachmentInfo[] | undefined {
    if (!feature) {
      return;
    }
    const featureContentItems = feature.get("viewModel.content") as any[];
    if (!featureContentItems) {
      return;
    }
    const attachmentContent = featureContentItems.filter((featureContent) => {
      return featureContent.type === "attachments";
    })[0];
    return attachmentContent && (attachmentContent.get("attachmentInfos") as __esri.AttachmentInfo[]);
  }

  addEffectToNonActiveLayers(): void {
    this.attachmentViewerDataCollection.forEach((avData) => {
      const avDataId = avData.layerData?.featureLayer?.id;
      const selectedAvDataId = this.selectedAttachmentViewerData?.layerData?.featureLayer?.id;
      if (avDataId !== selectedAvDataId && avData?.layerData?.layerView) {
        avData.layerData.layerView.featureEffect = new FeatureEffect({
          filter: new FeatureFilter({
            where: "1=1"
          }),
          includedEffect: this.nonActiveLayerEffects?.data?.excludedEffect
        });
      } else {
        if (avData.layerData?.layerView?.featureEffect) {
          avData.layerData.layerView.featureEffect.destroy();
          avData.layerData.layerView.set("featureEffect", null);
        }
      }
    });
  }

  removeEffectToNonActiveLayers(): void {
    this.attachmentViewerDataCollection.forEach((avData) => {
      if (avData.layerData?.layerView?.featureEffect) {
        avData.layerData.layerView.featureEffect.destroy();
        avData.layerData.layerView.set("featureEffect", null);
      }
    });
  }

  verifyEditPermissions(): boolean | undefined {
    if (!this.view) {
      return;
    }
    const layer = this.selectedAttachmentViewerData?.layerData?.featureLayer;
    const operations = layer?.capabilities?.operations;
    return operations?.supportsUpdate && operations?.supportsEditing && layer?.editingEnabled;
  }

  private _addAttributeEditWatchHandles(): void {
    const attrEditingKey = "attribute-editing-key";
    const attrEditingWatchKey = "attribute-editing-watch-key";

    this._handles?.add(
      [
        when(
          () => this.attributeEditing,
          () => {
            if (this.attributeEditing) {
              this.featureFormWidget = new FeatureForm({
                container: document.createElement("div")
              });
            }
            this._handles?.add(
              [
                watch(
                  () => this.featureWidget?.graphic,
                  () => {
                    if (!this.featureFormWidget) return;
                    this.featureFormWidget.feature = (this.featureWidget as __esri.Feature).graphic;
                  }
                ),
                (this.featureFormWidget as __esri.FeatureForm).on("submit", async (edits) => {
                  const featureLayer = this.selectedAttachmentViewerData?.layerData
                    ?.featureLayer as __esri.FeatureLayer;

                  const graphic = new Graphic({
                    geometry: this.featureWidget?.graphic?.geometry,
                    attributes: edits.values
                  });

                  try {
                    this._editingFeature = true;
                    this.notifyChange("state");
                    const edits = await featureLayer?.applyEdits({
                      updateFeatures: [graphic]
                    });
                    const errorMessage = edits?.["updateFeatureResults"]?.[0]?.error?.message as any;
                    if (errorMessage) {
                      this.errorMessage = errorMessage;
                    }
                  } catch (err: any) {
                    console.error("ERROR: ", err);
                    this.errorMessage = err.message;
                  } finally {
                    const query = featureLayer?.createQuery();
                    const oid = graphic.attributes[featureLayer.objectIdField];
                    query.objectIds = [oid];
                    const queryFeaturesRes = await featureLayer.queryFeatures(query);
                    const updatedFeature = queryFeaturesRes.features[0];
                    const featureWidget = this.featureWidget as __esri.Feature;
                    featureWidget.graphic = updatedFeature;
                    this.setFeatureInfo(featureWidget);
                    this._editingFeature = false;
                    this.notifyChange("state");
                  }
                })
              ],
              attrEditingWatchKey
            );
          },
          { once: true, initial: true }
        )
      ],
      attrEditingKey
    );
  }

  getTheme(backgroundType: "primary" | "secondary" | "accent", colorType: "primary" | "secondary" | "accent") {
    const { applySharedTheme, customTheme, sharedTheme } = this;
    const noStyle = {
      backgroundColor: "",
      color: ""
    };
    const useCustomTheme = checkCustomTheme(false, customTheme);
    if ((applySharedTheme && !customTheme) || customTheme?.preset === "shared") {
      return {
        backgroundColor: sharedTheme?.themes?.[backgroundType]?.background,
        color: sharedTheme?.themes?.[colorType]?.text
      };
    } else if (useCustomTheme) {
      return {
        backgroundColor: customTheme.themes[backgroundType].background,
        color: customTheme.themes[colorType].text
      };
    } else {
      return noStyle;
    }
  }

  getThemeButtonColor(
    backgroundType: "primary" | "secondary" | "accent",
    colorType: "primary" | "secondary" | "accent"
  ) {
    const { customTheme, sharedTheme, applySharedTheme } = this;
    const useCustomTheme = checkCustomTheme(false, customTheme);
    const noStyles = {
      backgroundColor: "",
      color: "",
      border: ""
    };
    if ((applySharedTheme && !customTheme) || customTheme?.preset === "shared") {
      return {
        backgroundColor: sharedTheme?.themes?.[backgroundType]?.background,
        color: sharedTheme?.themes?.[colorType]?.text,
        border: `1px solid ${sharedTheme?.themes?.[colorType]?.text}`
      };
    } else if (useCustomTheme) {
      return {
        backgroundColor: customTheme.themes[backgroundType].background,
        color: customTheme.themes[colorType].text,
        border: `1px solid ${customTheme?.themes?.[colorType]?.text}`
      };
    } else {
      return noStyles;
    }
  }

  setToken(): void {
    const token = this.applicationItem.get("portal.credential.token") as string;
    if (token) this.set("token", token);
  }
}

export default AttachmentViewerViewModel;
