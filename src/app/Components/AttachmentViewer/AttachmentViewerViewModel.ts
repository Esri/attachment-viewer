/// <amd-dependency path="esri/core/tsSupport/declareExtendsHelper" name="__extends" />
/// <amd-dependency path="esri/core/tsSupport/decorateHelper" name="__decorate" />

// esri.core
import Accessor = require("esri/core/Accessor");

// esri.core.accessorSupport
import {
  subclass,
  declared,
  property
} from "esri/core/accessorSupport/decorators";

// esri.core
import watchUtils = require("esri/core/watchUtils");
import Handles = require("esri/core/Handles");
import Collection = require("esri/core/Collection");

// esri.tasks
import Query = require("esri/tasks/support/Query");
import Locator = require("esri/tasks/Locator");

// esri.widgets
import Feature = require("esri/widgets/Feature");

// Share
import Share = require("../Share/Share");
import ShareFeatures = require("../Share/Share/ShareFeatures");

// esri.geometry
import Point = require("esri/geometry/Point");

// SelectedLayer
import {
  SelectedLayer,
  SelectedFeatureAttachments
} from "../../interfaces/interfaces";

// esri.widgets.Search
import Search = require("esri/widgets/Search");

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
  private _highlightedFeature: any = null;
  private _preparingDownload: boolean = null;
  private _selectedLayerSupportsAttachments: boolean = null;
  private _queryRange: number[] = [0, 10];
  private _sortField: string = null;
  private _queryingForFeatures: IPromise<any> = null;
  private _queryingForObjectIDs: IPromise<any> = null;
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

  // title
  @property()
  title: string = null;

  // selectedFeatureInfo
  @property()
  selectedFeatureInfo: any = null;

  // selectedFeatureAttachments
  @property()
  selectedFeatureAttachments: SelectedFeatureAttachments = null;

  // featureLayerTitle
  @property()
  featureLayerTitle: string = null;

  // layerFeatures
  @property()
  layerFeatures: Collection<__esri.Graphic> = new Collection();

  // selectedFeature
  @property()
  selectedFeature: __esri.Graphic = null;

  // layerFeatureIndex
  @property()
  layerFeatureIndex: number = null;

  // attachmentIndex
  @property()
  attachmentIndex: number = null;

  // layerView
  @property()
  layerView: __esri.FeatureLayerView = null;

  // featureLayer
  @property()
  featureLayer: __esri.FeatureLayer = null;

  // imageIsLoaded
  @property()
  imageIsLoaded: boolean = null;

  // socialSharingEnabled
  @property()
  socialSharingEnabled: boolean = null;

  // shareLocationWidget
  @property()
  shareLocationWidget: Share = null;

  // selectedFeatureAddress
  @property()
  selectedFeatureAddress: string = null;

  // attachmentLayer
  @property()
  attachmentLayer: SelectedLayer = null;

  // order
  @property()
  order: string = null;

  // defaultObjectId
  @property()
  defaultObjectId: number = null;

  // featureObjectIds
  @property()
  featureObjectIds: Collection<number> = new Collection();

  // featureTotal
  @property()
  featureTotal: number = null;

  // objectIdIndex
  @property()
  objectIdIndex: number = 0;

  // downloadEnabled
  @property()
  downloadEnabled: boolean = null;

  // featureWidget
  @property()
  featureWidget: Feature = null;

  @property()
  zoomLevel: string = null;

  @property()
  addressEnabled: boolean = null;

  @property()
  unsupportedAttachmentTypes: __esri.AttachmentInfo[] = [];

  @property()
  tempLayers: Collection<__esri.Layer> = new Collection();

  //----------------------------------
  //
  //  Lifecycle
  //
  //----------------------------------

  initialize() {
    this._initializeLayer();
    this._initializeData();
    this._initializeFirstFeature();

    const socialsharing = "social-sharing";

    this._handles.add(
      watchUtils.when(this, "socialSharingEnabled", () => {
        this._handles.remove(socialsharing);
        this._setupShare();
      })
    );
    this._setupDataWatchers();
  }

  destroy() {
    this._handles.removeAll();
    this._handles = null;
  }

  //----------------------------------
  //
  //  INITIAL SET UP
  //
  //----------------------------------

  // _initializeLayer
  private _initializeLayer() {
    const setupLayerKey = "setup-layer-key";
    this._handles.add(
      watchUtils.whenOnce(this, "view.ready", () => {
        this._layerLoadCheck();
        this._setupLayer();
        this._handles.remove(setupLayerKey);
      }),
      setupLayerKey
    );
  }

  // _layerLoadCheck
  private _layerLoadCheck(): void {
    const { layers } = this.view.map;
    const tempLayers = "temp-layers";
    this._handles.add(
      watchUtils.on(this, "tempLayers", "change", () => {
        if (this.tempLayers.length === layers.length) {
          this._handles.remove(tempLayers);

          // Find layer that supports attachments
          const supportsAttachment = layers.filter(layer => {
            return layer.get("capabilities.data.supportsAttachment");
          });

          // If none support attachments, set the first visible layer to still view feature content
          if (supportsAttachment.length === 0) {
            const visibleLayer = layers.find(layer => {
              return layer.visible;
            });
            this.set("featureLayer", visibleLayer);
            layers.forEach(layer => {
              layer.set("popupEnabled", false);
            });
            this.imageIsLoaded = true;
          }
          // Otherwise, get first feature layer that supports feature attachments
          else {
            layers.forEach((layer: __esri.FeatureLayer) => {
              if (
                layer.get("capabilities.data.supportsAttachment") &&
                !this.featureLayer
              ) {
                this._selectedLayerSupportsAttachments = layer.get(
                  "capabilities.data.supportsAttachment"
                );
                this.set("featureLayer", layer);
              }
              layer.set("popupEnabled", false);
            });
          }
          this._handles.remove(tempLayers);
        }
      }),
      tempLayers
    );
  }

  // _setupLayer
  private _setupLayer(): void {
    const { layers } = this.view.map;
    const { attachmentLayer } = this;
    if (attachmentLayer && attachmentLayer.id) {
      const selectedLayer = layers.find(layer => {
        return layer.id === attachmentLayer.id;
      });

      if (selectedLayer) {
        selectedLayer.when(layer => {
          this._selectedLayerSupportsAttachments = layer.get(
            "capabilities.data.supportsAttachment"
          );
          this.set("featureLayer", layer);

          layers.forEach(layer => {
            layer.set("popupEnabled", false);
          });
        });
      } else {
        this._initializeDefaultLayer();
      }
    } else {
      this._initializeDefaultLayer();
    }
  }

  private _initializeDefaultLayer() {
    const { layers } = this.view.map;
    layers.forEach(layer => {
      layer.when(() => {
        this.tempLayers.add(layer);
      });
    });
  }

  // _initializeData
  private _initializeData(): void {
    const initialSetupKey = "initial-setup-key";
    this._handles.add(
      watchUtils.whenOnce(this, "featureLayer", () => {
        if (this.attachmentLayer) {
          this._sortField =
            this.attachmentLayer.fields[0] &&
            this.featureLayer.getField(this.attachmentLayer.fields[0].fields[0])
              ? this.attachmentLayer.fields[0].fields[0]
              : this.featureLayer.objectIdField;
        }
        this._initialSetup();
        this._handles.remove(initialSetupKey);
      }),
      initialSetupKey
    );
  }

  // _initialSetup
  private _initialSetup(): void {
    this.view
      .whenLayerView(this.featureLayer)
      .then((layerView: __esri.FeatureLayerView) => {
        this.set("layerView", layerView);
        this._detectFeatureClick();
        this._queryObjectIds();
      });
  }

  // _setupShare
  private _setupShare(): void {
    const setupShare = "setup-share";
    this._handles.add(
      watchUtils.whenOnce(this, "view", () => {
        const shareFeatures = new ShareFeatures({
          copyToClipboard: true,
          embedMap: false
        });
        this.shareLocationWidget = new Share({
          view: this.view,
          shareFeatures,
          container: document.createElement("div")
        });
        this._handles.remove(setupShare);
      }),
      setupShare
    );
  }

  //----------------------------------
  //
  //  SCROLL IMAGES
  //
  //----------------------------------

  // previousImage
  previousImage(): void {
    const { selectedFeatureAttachments } = this;

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
  }

  // nextImage
  nextImage(): void {
    const { selectedFeatureAttachments } = this;
    const { currentIndex, attachments } = selectedFeatureAttachments;

    // When a user is scrolling after last image, set displayed image to the first image
    if (currentIndex < attachments.length - 1) {
      selectedFeatureAttachments.currentIndex += 1;
    }
    // Go forward one image
    else {
      selectedFeatureAttachments.currentIndex = 0;
    }
    this.set("attachmentIndex", selectedFeatureAttachments.currentIndex);
  }

  //----------------------------------
  //
  //  SCROLL FEATURES
  //
  //----------------------------------

  // previousFeature
  previousFeature(): void {
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
  }

  // nextFeature
  nextFeature(): void {
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
  }

  // getTotalNumberOfAttachments
  getTotalNumberOfAttachments(): number {
    const { selectedFeatureAttachments } = this;
    if (selectedFeatureAttachments) {
      const { attachments } = selectedFeatureAttachments;
      return attachments && attachments.hasOwnProperty("length")
        ? attachments.length
        : null;
    }
  }

  // Get Address for selected feature -- ONLY WORKS ON POINTS
  private _getAddress(geometry: __esri.Geometry): void {
    if (geometry.type !== "point") {
      return;
    }

    const point = new Point(geometry);

    const locator = new Locator({
      url: "https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer"
    }) as any;

    locator
      .locationToAddress({ location: point })
      .catch(err => {
        console.error("ERROR: ", err);
        this.set("selectedFeatureAddress", null);
      })
      .then(
        (addressCandidate: __esri.AddressCandidate): void => {
          this.set("selectedFeatureAddress", addressCandidate.address);
        }
      );
  }

  // _detectFeatureClick
  private _detectFeatureClick(): __esri.WatchHandle {
    return this.view.on("click", event => {
      if (this.state !== "ready") {
        return;
      }
      const { featureLayer, view } = this;
      if (featureLayer) {
        this._performingHitTest = view.hitTest(event);
        this.notifyChange("state");
        this._performingHitTest.then((hitTestRes: __esri.HitTestResult) => {
          if (this._highlightedFeature) {
            this._highlightedFeature.remove();
            this._highlightedFeature = null;
          }
          this._performingHitTest = null;
          this.notifyChange("state");

          if (hitTestRes.results.length) {
            this._setClickedFeature(hitTestRes);
          }
        });
      }
    });
  }

  // _setClickedFeature
  private _setClickedFeature(hitTestRes: __esri.HitTestResult): void {
    const { featureLayer } = this;
    const isNotFromLayer = hitTestRes.results.every(result => {
      return result.graphic.layer.id !== featureLayer.id;
    });

    // If the feature does not exist in the photo presentation layer, do not set.
    if (isNotFromLayer) {
      return;
    }

    const detectedFeature = hitTestRes.results.filter(result => {
      const { layer } = result.graphic;
      return layer.id === featureLayer.id;
    })[0].graphic;
    this._updateSelectedFeature(detectedFeature);
  }

  // updateFeature
  private _updateSelectedFeature(feature: __esri.Graphic): void {
    const { featureLayer, featureObjectIds } = this;
    const { objectIdField } = featureLayer;

    // Prevent same feature to be re-set
    if (
      this.selectedFeature.attributes[objectIdField] ===
      feature.attributes[objectIdField]
    ) {
      return;
    }
    const layerFeature = this.layerFeatures.find(layerFeature => {
      return (
        layerFeature.attributes[objectIdField] ===
        feature.attributes[objectIdField]
      );
    });

    const layerFeatureIndex = this.layerFeatures.indexOf(layerFeature);
    const objectId = featureObjectIds.find(objectId => {
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

    const objectIdIndex = featureObjectIds.indexOf(objectId);
    this._updateQueryRange("updatingClick", objectIdIndex);
    this._queryFeatures("updatingClick", objectId);
    this._setUpdateShareIndexes();
  }

  //----------------------------------
  //
  //  UPDATE
  //
  //----------------------------------

  private _updateFeatureData(updatingType: string): void {
    // When user has reached the last feature

    if (this.featureTotal === this.objectIdIndex + 1) {
      this._queryRange = [0, 10];
      this._queryFeatures("restartNext");
      return;
    }

    // When user scrolls before first feature
    if (this.objectIdIndex - 1 === -1) {
      const low = Math.floor(this.featureTotal / 10) * 10 - 10;
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
  }

  // If feature does not exist in current queried layer features, the query range will be updated
  private _updateQueryRange(updatingType: string, objectIdIndex?: number) {
    const floor = Math.floor(objectIdIndex / 10) * 10;
    const ceil = Math.ceil(objectIdIndex / 10) * 10;

    // Update query range to query for next 10 features
    if (updatingType === "updatingNext") {
      const currentLow = this._queryRange[0];
      const updatedLow =
        this._queryRange[0] === 0 ? 10 : Math.round(currentLow / 10) * 10 + 10;
      const updatedHigh = updatedLow + 10;

      this._queryRange[0] = updatedLow;
      this._queryRange[1] = updatedHigh;
    }
    // Update query range to query for previous 10 features
    else if (updatingType === "updatingPrevious") {
      const currentLow = this._queryRange[0];
      const updatedHigh = currentLow;
      const updatedLow = Math.floor(currentLow / 10) * 10 - 10;
      this._queryRange[0] = updatedLow;
      this._queryRange[1] = updatedHigh;
    }
    // Update query range to query for 10 features relative to feature that was clicked
    else if (
      updatingType === "updatingClick" &&
      (objectIdIndex || objectIdIndex === 0)
    ) {
      const updatedLow = floor;
      const updatedHigh = objectIdIndex % 10 === 0 ? ceil + 10 : ceil;
      this._queryRange[0] = updatedLow;
      this._queryRange[1] = updatedHigh;
    }
    // Update query range based on defaultObjectId from share widget
    else if (updatingType === "share" && this.defaultObjectId) {
      const objectIdIndex = this.featureObjectIds.indexOf(this.defaultObjectId);
      const shareFloor = Math.floor(objectIdIndex / 10) * 10;
      const shareCeil = Math.ceil(objectIdIndex / 10) * 10;

      const updatedLow = shareFloor;
      const updatedHigh = objectIdIndex % 10 === 0 ? shareCeil + 10 : shareCeil;
      this._queryRange[0] = updatedLow;
      this._queryRange[1] = updatedHigh;
    }
  }

  //----------------------------------
  //
  //  QUERY
  //
  //----------------------------------

  // Query for all object IDs to user to query features/attachments
  private _queryObjectIds(): void {
    const { featureLayer, _sortField, order } = this;
    const { objectIdField } = featureLayer;
    const sortField = _sortField ? _sortField : objectIdField;
    const fieldOrder = order ? order : "ASC";
    const orderByFields = [`${sortField} ${fieldOrder}`];

    const definitionExpression = this.get(
      "featureLayer.definitionExpression"
    ) as string;
    const where = definitionExpression ? definitionExpression : "1=1";
    const featureQuery = new Query({
      outFields: ["*"],
      orderByFields: orderByFields,
      where,
      returnGeometry: true
    });

    this._queryingForObjectIDs = this.featureLayer.queryObjectIds(featureQuery);
    this.notifyChange("state");
    this._queryingForObjectIDs
      .catch(err => {
        this._queryingForObjectIDs = null;
        this.notifyChange("state");
        console.error("ERROR: ", err);
      })
      .then((objectIds: number[]) => {
        this._queryingForObjectIDs = null;
        this.notifyChange("state");
        this.featureObjectIds.removeAll();
        this.featureObjectIds.addMany([...objectIds]);
        if (this.defaultObjectId !== null) {
          this._updateQueryRange("share");
          this._queryFeatures("share");
        } else {
          this._queryFeatures();
        }
      });
  }

  // _queryFeatures
  private _queryFeatures(queryType?: string, objectIdIndex?: number) {
    const { featureLayer, layerFeatures } = this;
    this.featureTotal = this.featureObjectIds.length;
    const featureQuery = this._setupFeatureQuery();
    this._queryingForFeatures = featureLayer.queryFeatures(featureQuery);
    this.notifyChange("state");

    this._queryingForFeatures
      .catch(err => {
        this._queryingForFeatures = null;
        this.notifyChange("state");
        console.error("ERROR: ", err);
      })
      .then((queriedFeatures: __esri.FeatureSet) => {
        // Reset features
        layerFeatures.removeAll();

        const [low, high] = this._queryRange;
        const currentSet = this.featureObjectIds.slice(low, high);

        // Sort features
        const features = this._sortFeatures(queriedFeatures, currentSet);

        // Add features to layerFeatures prop
        layerFeatures.addMany(features);

        this.layerFeatureIndex =
          this.layerFeatureIndex !== null ? this.layerFeatureIndex : 0;
        this._updateIndexData(queryType, objectIdIndex);
        this._queryingForFeatures = null;
        this.notifyChange("state");
      });
  }

  // _setupFeatureQuery
  private _setupFeatureQuery(): __esri.Query {
    const { featureLayer, _sortField, order } = this;

    // Query for features only within the set query range
    const [low, high] = this._queryRange;
    const currentSet = this.featureObjectIds.slice(low, high);

    const { objectIdField } = featureLayer;
    const { query } = featureLayer.capabilities;
    const { supportsOrderBy } = query;
    const sortField = _sortField ? _sortField : objectIdField;
    const fieldOrder = order ? order : "ASC";
    const orderByFieldsValue = supportsOrderBy
      ? [`${sortField} ${fieldOrder}`]
      : null;
    const outSpatialReference =
      this.view && this.view.spatialReference
        ? this.view.spatialReference
        : null;

    const definitionExpression = this.get(
      "featureLayer.definitionExpression"
    ) as string;
    const where = definitionExpression ? definitionExpression : "1=1";
    return new Query({
      objectIds: currentSet.toArray(),
      outFields: ["*"],
      orderByFields: orderByFieldsValue,
      where,
      returnGeometry: true,
      outSpatialReference
    });
  }

  // _sortFeatures
  private _sortFeatures(
    queriedFeatures: any,
    currentSet: __esri.Collection
  ): __esri.Graphic[] {
    const features = [];
    const { objectIdField } = this.featureLayer;
    queriedFeatures.features.forEach((feature: __esri.Graphic) => {
      const objectIdFromQuery = feature.attributes[objectIdField];
      currentSet.forEach((objectId: number, objectIdIndex: number) => {
        if (
          objectId === objectIdFromQuery &&
          features.indexOf(features[objectIdIndex]) === -1
        ) {
          features[objectIdIndex] = feature;
        }
      });
    });

    return features;
  }

  // _updateIndexData
  private _updateIndexData(queryType: string, objectId?: number): void {
    const { layerFeatures, featureTotal } = this;
    if (queryType === "updatingNext") {
      this.layerFeatureIndex = 0;
      this.objectIdIndex += 1;
      this.goTo();
    } else if (queryType === "updatingPrevious") {
      this.layerFeatureIndex = layerFeatures.length - 1;
      this.objectIdIndex -= 1;
      this.goTo();
    } else if (queryType === "restartNext") {
      this.layerFeatureIndex = 0;
      this.objectIdIndex = 0;
      this.goTo();
    } else if (queryType === "restartPrevious") {
      this.layerFeatureIndex = layerFeatures.length - 1;
      this.objectIdIndex = featureTotal - 1;
      this.goTo();
    } else if (queryType === "updatingClick") {
      this._updateFeatureClick(objectId);
    } else if (queryType === "share") {
      this._updateFeatureFromShare();
    }
    this._highlightFeature(this.layerFeatureIndex);
    const attachmentIndex = this.attachmentIndex ? this.attachmentIndex : 0;
    this.set("attachmentIndex", attachmentIndex);
  }

  // _updateFeatureClick
  private _updateFeatureClick(objectId: number): void {
    const { layerFeatures, featureLayer } = this;
    this.layerFeatureIndex = layerFeatures.indexOf(
      layerFeatures.find(
        layerFeature =>
          layerFeature.attributes[featureLayer.objectIdField] === objectId
      )
    );
    this.objectIdIndex = this.featureObjectIds.indexOf(objectId);
    if (featureLayer.get("capabilities.data.supportsAttachment")) {
      this.imageIsLoaded = false;
    }
  }

  // _updateFeatureFromShare
  private _updateFeatureFromShare(): void {
    const { featureLayer, defaultObjectId } = this;
    const { objectIdField } = featureLayer;
    this.layerFeatureIndex = this.layerFeatures.indexOf(
      this.layerFeatures.find(
        layerFeature =>
          layerFeature.attributes[objectIdField] === defaultObjectId
      )
    );
    this.objectIdIndex = this.featureObjectIds.indexOf(defaultObjectId);
  }

  //----------------------------------
  //
  //  Initialize first feature
  //
  //----------------------------------

  // _initializeFirstFeature
  private _initializeFirstFeature(): void {
    const initFirstFeature = "attachments-not-supported";
    this._handles.add(
      watchUtils.whenOnce(this, "layerFeatures.length", () => {
        this._setFeature();
        this._handles.remove(initFirstFeature);
      }),
      initFirstFeature
    );
  }

  //----------------------------------
  //
  //  Set feature
  //
  //----------------------------------

  // _setFeature
  private _setFeature(): void {
    this.selectedFeature = this.layerFeatures.getItemAt(this.layerFeatureIndex);

    this.featureWidget = new Feature({
      graphic: this.selectedFeature,
      map: this.view.map,
      spatialReference: this.view.spatialReference
    });

    this.featureWidget.set("visibleElements.title", false);
    const featureWidgetKey = "feature-widget";
    this._handles.add(
      watchUtils.when(this, "featureWidget", () => {
        this._handles.remove(featureWidgetKey);
        const featureWidgetContent = "feature-widget-content";
        this._handles.add(
          watchUtils.when(this, "featureWidget.viewModel.content", () => {
            this._handles.remove(featureWidgetContent);
            this._setFeatureInfo(this.featureWidget);
            if (this._selectedLayerSupportsAttachments) {
              let layerAttachments = null;
              const featureWidgetContent = this.featureWidget.viewModel
                .content as any[];
              featureWidgetContent &&
                featureWidgetContent.forEach(content => {
                  if (content.type === "attachments") {
                    layerAttachments = content;
                  }
                });

              if (!layerAttachments) {
                return;
              }

              // if (
              //   layerAttachments &&
              //   (!layerAttachments.attachmentInfos ||
              //     layerAttachments.attachmentInfos === 0)
              // ) {
              //   this.imageIsLoaded = true;
              //   return;
              // }

              const currentIndex =
                this.attachmentIndex !== null ? this.attachmentIndex : 0;

              const featureAttachments = [];
              this.unsupportedAttachmentTypes = [];

              layerAttachments.get("attachmentInfos") &&
                layerAttachments.attachmentInfos.forEach(attachmentInfo => {
                  const { contentType } = attachmentInfo;
                  if (
                    contentType === "image/jpeg" ||
                    contentType === "image/jpg" ||
                    contentType === "image/png" ||
                    contentType === "image/gif" ||
                    contentType === "video/mp4" ||
                    contentType === "video/mov" ||
                    contentType === "video/quicktime"
                  ) {
                    featureAttachments.push(attachmentInfo);
                  } else {
                    this.unsupportedAttachmentTypes.push(attachmentInfo);
                  }
                });

              const attachments =
                featureAttachments && featureAttachments.length > 0
                  ? featureAttachments
                  : [];

              const selectedFeatureAttachments = {
                attachments,
                currentIndex
              };
              if (!attachments || attachments.length === 0) {
                this.imageIsLoaded = true;
              }
              this.set("selectedFeatureAttachments", null);
              this.set(
                "selectedFeatureAttachments",
                selectedFeatureAttachments
              );
              this.notifyChange("state");
            }
          }),
          featureWidgetContent
        );
      }),
      featureWidgetKey
    );
  }

  // _setFeatureInfo
  private _setFeatureInfo(featureWidget: Feature): void {
    const featureTitleKey = "feature-title";
    this._handles.add(
      watchUtils.when(featureWidget, "title", () => {
        this._handles.remove(featureTitleKey);
        this.set("featureLayerTitle", featureWidget.title);
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
          fieldContents.forEach(content => {
            if (content.type === "fields") {
              content.fieldInfos.forEach((fieldInfo, fieldInfoIndex) => {
                if (fieldInfo.fieldName !== this.featureLayer.objectIdField) {
                  selectedFeatureContent[fieldInfoIndex] = {
                    attribute: fieldInfo.label,
                    content: attributes[fieldInfo.fieldName]
                  };
                }
              });
            }
          });

          if (this.selectedFeature && this.addressEnabled) {
            const { geometry } = this.selectedFeature;
            this._getAddress(geometry);
          }

          this.set("selectedFeatureInfo", selectedFeatureContent);
        }
      ),
      featureContentKey
    );
  }

  //----------------------------------
  //
  //  Highlight
  //
  //----------------------------------

  // _highlightFeature
  private _highlightFeature(layerFeatureIndex?: number): void {
    if (this._highlightedFeature) {
      this._highlightedFeature.remove();
      this._highlightedFeature = null;
    }
    const feature =
      layerFeatureIndex || layerFeatureIndex === 0
        ? this.layerFeatures.getItemAt(layerFeatureIndex)
        : this.selectedFeature;
    this._highlightedFeature = this.layerView.highlight(feature);
  }

  //----------------------------------
  //
  //  Download
  //
  //----------------------------------

  // downloadImage
  downloadImage(event: Event): void {
    const node = event.currentTarget as HTMLImageElement;
    const url = node.getAttribute("data-image-url");
    const fileName = node.getAttribute("data-image-name");
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

  //----------------------------------
  //
  //  Go To - Zoom to
  //
  //----------------------------------

  // zoomTo
  zoomTo(): void {
    const feature = this.layerFeatures.getItemAt(this.layerFeatureIndex);
    const zoom = this.zoomLevel ? parseInt(this.zoomLevel) : 32000;
    if (!feature) {
      return;
    }
    this.view.goTo({
      target: feature,
      scale: zoom
    });
  }

  // goTo
  goTo(): void {
    const feature = this.layerFeatures.getItemAt(this.layerFeatureIndex);
    if (!feature) {
      return;
    }
    this.view.goTo({
      target: feature
    });
  }

  //----------------------------------
  //
  //  DATA WATCHERS
  //
  //----------------------------------

  // _setupDataWatchers
  private _setupDataWatchers(): void {
    this._handles.add([
      this._objectIdIndexSetFeatureUpdate(),
      this._handleSearchWidgets()
    ]);

    const updateShareProps = "share-props";
    this._handles.add(
      watchUtils.when(this, "socialSharingEnabled", () => {
        this._updateSharePropIndexes();
        this._handles.remove(updateShareProps);
      })
    );
  }

  // _objectIdIndexSetFeatureUpdate
  private _objectIdIndexSetFeatureUpdate(): __esri.WatchHandle {
    return watchUtils.watch(this, ["objectIdIndex"], () => {
      this._setFeature();
    });
  }

  // _updateSharePropIndexes
  private _updateSharePropIndexes(): __esri.WatchHandle {
    return watchUtils.watch(this, ["objectIdIndex", "attachmentIndex"], () => {
      if (this._updateShareIndexes) {
        const { attachmentIndex, objectIdIndex } = this;
        const objectId = this.featureObjectIds.getItemAt(objectIdIndex);
        this.shareLocationWidget.defaultObjectId = objectId;
        this.shareLocationWidget.attachmentIndex = attachmentIndex;
      }
    });
  }

  // _handleSearchWidgets
  private _handleSearchWidgets(): __esri.WatchHandle {
    return watchUtils.whenOnce(this, ["searchWidget"], () => {
      this._handles.add(this._watchSelectedSearchResults());
    });
  }

  // _watchSelectedSearchResults
  private _watchSelectedSearchResults(): __esri.WatchHandle {
    return watchUtils.watch(
      this,
      ["searchWidget.viewModel.selectedResult"],
      () => {
        const { searchWidget } = this;
        if (searchWidget) {
          const selectedFeatureResult = searchWidget.get(
            "viewModel.selectedResult.feature"
          ) as __esri.Graphic;
          if (
            selectedFeatureResult &&
            selectedFeatureResult.layer &&
            selectedFeatureResult.layer.id === this.featureLayer.id
          ) {
            this._updateSelectedFeature(selectedFeatureResult);
          }
        }
      }
    );
  }

  private _setUpdateShareIndexes(): void {
    if (this._updateShareIndexes == null) {
      this._updateShareIndexes = true;
    }
  }
}

export = AttachmentViewerViewModel;
