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

// esri.core.accessorSupport
import {
  subclass,
  declared,
  property
} from "esri/core/accessorSupport/decorators";

// esri.core
import Collection = require("esri/core/Collection");
import Handles = require("esri/core/Handles");
import watchUtils = require("esri/core/watchUtils");

// esri.widgets
import Feature = require("esri/widgets/Feature");

// esri.tasks.support
import Query = require("esri/tasks/support/Query");

// esri.views.layers.support
import FeatureEffect = require("esri/views/layers/support/FeatureEffect");

// PhotoCentricViewModel Classes
import AttachmentViewerLayerData = require("../AttachmentViewer/AttachmentViewerLayerData");
import AttachmentViewerViewModel = require("../AttachmentViewer/AttachmentViewerViewModel");
import PhotoCentricData = require("./PhotoCentricData");
import SelectedFeatureAttachments = require("../AttachmentViewer/SelectedFeatureAttachments");

type State =
  | "ready"
  | "loading"
  | "disabled"
  | "querying"
  | "performingHitTest";

import {
  PhotoCentricOIDPromise,
  PhotoCentricFeaturesPromise,
  HitTestResult
} from "../../interfaces/interfaces";

@subclass("PhotoCentricViewModel")
class PhotoCentricViewModel extends declared(AttachmentViewerViewModel) {
  private _photoCentricHandles: Handles = new Handles();
  private _queryingForFeaturesPhotoCentric: Promise<void> = null;
  private _highlightedFeaturePhotoCentric: __esri.Handle = null;
  private _performingHitTestPhotoCentric: Promise<__esri.HitTestResult> = null;
  private _currentSketchExtentPhotoCentric: __esri.Extent = null;
  private _queryingForObjectIds: Promise<void> = null;
  private _layerViewLoadPromises: Promise<__esri.FeatureLayerView>[] = [];
  private _queryObjectIdPromises: Promise<PhotoCentricOIDPromise>[] = [];
  private _queryFeaturesPromises: Promise<PhotoCentricFeaturesPromise>[] = [];
  private _queryAttachmentsPromises: Promise<void>[] = [];
  private _queryingFeatures: Promise<__esri.FeatureSet> = null;

  //----------------------------------
  //
  //  state - readOnly
  //
  //----------------------------------
  @property({
    dependsOn: ["view.ready", "imageIsLoaded"],
    readOnly: true
  })
  get queryingState(): State {
    const ready = this.get("view.ready");
    return ready
      ? this._queryingForFeaturesPhotoCentric ||
        this._queryingForObjectIds ||
        this._queryingFeatures
        ? "querying"
        : "ready"
      : this.view
      ? "loading"
      : "disabled";
  }

  // currentImageUrl
  @property()
  currentImageUrl: string = null;

  // attachmentLayer
  @property()
  attachmentLayer: any = null;

  // attachmentLayers
  @property()
  attachmentLayers: string = null;

  // imagePanZoomEnabled
  @property()
  imagePanZoomEnabled: boolean = null;

  // order
  @property()
  order: string = null;

  // defaultObjectId
  @property()
  defaultObjectId: number = null;

  // attachmentIndex
  @property()
  attachmentIndex: number = null;

  // selectedLayerId
  @property()
  selectedLayerId: string = null;

  initialize() {
    this._initAppOnViewReady();
    this._initializeSketch();
    this._initSelectedAttachmentViewerDataWatcher();
  }

  // _initAppOnViewReady
  private _initAppOnViewReady(): void {
    const photoCentricInit = "photo-centric-init";
    this._photoCentricHandles.add(
      watchUtils.whenOnce(this, "view.ready", () => {
        this._photoCentricHandles.remove(photoCentricInit);
        this._initializeAppData();
        this._detectFeatureClick();
      }),
      photoCentricInit
    );
  }

  // _initSelectedAttachmentViewerDataWatcher
  private _initSelectedAttachmentViewerDataWatcher(): void {
    this._photoCentricHandles.add([
      watchUtils.watch(this, "selectedAttachmentViewerData", async () => {
        const { socialSharingEnabled, defaultObjectId, selectedLayerId } = this;
        if (
          socialSharingEnabled &&
          defaultObjectId !== null &&
          selectedLayerId
        ) {
          this._handleSharedFeature();
        } else {
          this._setFeaturePhotoCentric();
        }
        if (socialSharingEnabled) {
          this.updateSharePropIndexes();
        }
        this._removeFeatureHighlight();
        this._highlightFeature();
      })
    ]);
  }

  // _handleShareFeature
  private _handleSharedFeature(): void {
    const { defaultObjectId } = this;
    const { featureLayer } = this.selectedAttachmentViewerData.layerData;
    featureLayer
      .queryFeatures({
        outFields: ["*"],
        objectIds: [defaultObjectId],
        returnGeometry: true
      })
      .then((featureSet: __esri.FeatureSet) => {
        const graphic = featureSet && featureSet.features[0];
        if (!graphic) {
          return;
        }
        this.set("selectedAttachmentViewerData.selectedFeature", graphic);
        this.updateSelectedFeatureFromClickOrSearch(graphic);
      });
    this.set("defaultObjectId", null);
    this.set("selectedLayerId", null);
  }

  // _initializeAppData
  private _initializeAppData(): void {
    watchUtils.when(this, "layerSwitcher.featureLayerCollection.length", () => {
      this._layerViewLoadPromises = [];
      this._initLayerViewLoadPromises(
        this.layerSwitcher.featureLayerCollection
      );
    });
  }

  // _initLayerViewLoadPromises
  private _initLayerViewLoadPromises(
    featureLayersRes: __esri.Collection<__esri.FeatureLayer>
  ): void {
    featureLayersRes.forEach(featureLayerRes => {
      featureLayerRes.popupEnabled = false;

      this._layerViewLoadPromises.push(
        this.view
          .whenLayerView(featureLayerRes)
          .then((layerView: __esri.FeatureLayerView) => {
            return layerView;
          })
      );
    });
    Promise.all(this._layerViewLoadPromises).then(layerViewPromiseResults => {
      this._handleLayerViewPromises(layerViewPromiseResults);
    });
  }

  // _handleLayerViewPromises
  private _handleLayerViewPromises(
    layerViewPromiseResults: __esri.FeatureLayerView[]
  ): void {
    this._handleLayerViewPromiseResults(layerViewPromiseResults);
    this._initQueryAttachmentsPromise();
    Promise.all(this._queryAttachmentsPromises).then(() => {
      this._queryObjectIdPromises = [];
      this._initQueryObjectIdPromises();
    });
  }

  // _initQueryAttachmentsPromise
  private _initQueryAttachmentsPromise(): void {
    this.attachmentViewerDataCollection.forEach(
      (attachmentViewerData: PhotoCentricData) => {
        this._queryAttachmentsPromises.push(
          this._handleQueryAttachments(attachmentViewerData)
        );
      }
    );
  }

  // _handleQueryAttachments
  private _handleQueryAttachments(
    attachmentViewerData: PhotoCentricData
  ): Promise<void> {
    const { featureLayer } = attachmentViewerData.layerData;
    return featureLayer
      .queryAttachments({
        where: "1=1",
        returnMetadata: true
      })
      .catch(err => {
        console.error("ATTACHMENT QUERY ERROR: ", err);
        this._handleOnlyDisplayFeaturesWithAttachmentsExpression(
          attachmentViewerData,
          null
        );
        attachmentViewerData.set("attachments", null);
      })
      .then((attachmentsRes: Object) => {
        this._handleOnlyDisplayFeaturesWithAttachmentsExpression(
          attachmentViewerData,
          attachmentsRes
        );
        attachmentViewerData.set("attachments", attachmentsRes);
      });
  }

  // _handleOnlyDisplayFeaturesWithAttachmentsExpression
  private _handleOnlyDisplayFeaturesWithAttachmentsExpression(
    attachmentViewerData: PhotoCentricData,
    attachments: Object
  ): void {
    const { featureLayer } = attachmentViewerData.layerData;
    if (this.onlyDisplayFeaturesWithAttachmentsIsEnabled) {
      featureLayer
        .queryObjectIds({
          where: "1=1"
        })
        .then(objectIds => {
          const objectIdsLength = objectIds.length;
          const attacmentsLength = attachments
            ? Object.keys(attachments).map(objectId => {
                return parseInt(objectId);
              }).length
            : 0;
          const supportsQueryAttachments = featureLayer.get(
            "capabilities.operations.supportsQueryAttachments"
          );

          if (
            objectIdsLength !== attacmentsLength &&
            supportsQueryAttachments
          ) {
            const definitionExpressionForLayer = this._createUpdatedDefinitionExpressionForLayer(
              attachmentViewerData
            );

            featureLayer.set(
              "definitionExpression",
              definitionExpressionForLayer
            );
          }
        });
    }
  }

  // _createUpdatedDefinitionExpressionForLayer
  private _createUpdatedDefinitionExpressionForLayer(
    attachmentViewerData: PhotoCentricData
  ): string {
    const { attachments } = attachmentViewerData;
    const { featureLayer } = attachmentViewerData.layerData;
    const { definitionExpression, objectIdField } = featureLayer;
    const attachmentObjectIds = this._createAttachmentObjectIdArr(attachments);
    const attachmentObjectIdsExpression =
      attachmentObjectIds && attachmentObjectIds.join(",");
    return attachmentObjectIds && attachmentObjectIds.length
      ? definitionExpression
        ? `${definitionExpression} AND ${objectIdField} IN (${attachmentObjectIdsExpression})`
        : `${objectIdField} IN (${attachmentObjectIdsExpression})`
      : "1=0";
  }

  // _createAttachmentObjectIdArr
  private _createAttachmentObjectIdArr(attachmentsRes): string[] {
    return attachmentsRes
      ? Object.keys(attachmentsRes).map(objectId => {
          return `'${objectId}'`;
        })
      : [];
  }

  // _handleLayerViewPromiseResults
  private _handleLayerViewPromiseResults(layerViewPromiseResults): void {
    layerViewPromiseResults.forEach(layerViewPromiseResult => {
      const attachmentViewerData = this._addAttachmentViewerDataToCollection(
        layerViewPromiseResult
      );
      this._handleAttachmentViewerDataSortField(attachmentViewerData);
    });
  }

  // _addAttachmentViewerDataToCollection
  private _addAttachmentViewerDataToCollection(
    layerViewPromiseResult: __esri.FeatureLayerView
  ): PhotoCentricData {
    const { layer } = layerViewPromiseResult;

    const layerData = new AttachmentViewerLayerData({
      featureLayer: layer,
      layerView: layerViewPromiseResult
    });
    const attachmentViewerData = new PhotoCentricData({
      defaultLayerExpression: layer.definitionExpression,
      layerData,
      selectedLayerId: layer.id
    });
    this.attachmentViewerDataCollection.add(attachmentViewerData);
    return attachmentViewerData;
  }

  // _handleAttachmentViewerDataSortField
  private _handleAttachmentViewerDataSortField(
    attachmentViewerData: PhotoCentricData
  ): void {
    const { featureLayer } = attachmentViewerData.layerData;
    const attachmentLayers = JSON.parse(this.attachmentLayers);
    if (attachmentLayers && attachmentLayers.length > 0) {
      this._handleAttachmentLayers(
        attachmentLayers,
        attachmentViewerData,
        featureLayer
      );
    } else {
      this._handleAttachmentLayer(attachmentViewerData, featureLayer);
    }
  }

  // _handleAttachmentLayers
  private _handleAttachmentLayers(
    attachmentLayers: any,
    attachmentViewerData: PhotoCentricData,
    featureLayer: __esri.FeatureLayer
  ): void {
    attachmentLayers.forEach(attachmentLayer => {
      const { fields, id } = attachmentLayer;
      const sortField = fields && fields.length > 0 && fields[0];
      if (id === featureLayer.id && sortField) {
        attachmentViewerData.sortField = sortField;
      }
    });
  }

  // _handleAttachmentLayer
  private _handleAttachmentLayer(
    attachmentViewerData: PhotoCentricData,
    featureLayer: __esri.FeatureLayer
  ): void {
    const { attachmentLayer } = this;
    if (!attachmentLayer) {
      return;
    }
    const { fields } = attachmentLayer;
    if (
      attachmentLayer &&
      attachmentLayer.id === featureLayer.id &&
      attachmentLayer &&
      fields &&
      fields.length > 0 &&
      fields[0] &&
      fields[0].fields &&
      fields[0].fields.length > 0 &&
      fields[0].fields[0]
    ) {
      attachmentViewerData.sortField = this.attachmentLayer.fields[0].fields[0];
    }
  }

  // _initQueryObjectIdPromises
  private _initQueryObjectIdPromises(
    sketchGeometry?: __esri.Extent,
    isSketchDelete?: boolean
  ): void {
    this.attachmentViewerDataCollection.forEach(
      (attachmentViewerData: PhotoCentricData) => {
        const sketchQuery = sketchGeometry
          ? this._generateSketchQuery(sketchGeometry, attachmentViewerData)
          : null;
        this._setupQueryObjectIdPromises(attachmentViewerData, sketchQuery);
      }
    );

    Promise.all(this._queryObjectIdPromises).then(
      (objectIdPromiseResults: PhotoCentricOIDPromise[]) => {
        this._handleQueryObjectIdPromisesResults(
          objectIdPromiseResults,
          isSketchDelete
        );
      }
    );
  }

  // _handleQueryObjectIdPromises
  private _setupQueryObjectIdPromises(
    attachmentViewerData: PhotoCentricData,
    sketchQuery?: __esri.Query
  ): void {
    this._resetQueryRange(attachmentViewerData);
    let featureQuery = null;
    if (sketchQuery) {
      const where = this._createUpdatedDefinitionExpression(
        attachmentViewerData
      );
      const updatedSketchQuery = where
        ? { ...sketchQuery, where }
        : sketchQuery;
      featureQuery = updatedSketchQuery;
    } else {
      featureQuery = this._createFeatureQuery(attachmentViewerData);
    }

    this._handleObjectIdPromise(attachmentViewerData, featureQuery);
  }

  // _resetQueryRange
  private _resetQueryRange(attachmentViewerData: PhotoCentricData): void {
    const { queryRange } = attachmentViewerData;
    queryRange[0] = 0;
    queryRange[1] = 10;
  }

  // _createFeatureQuery
  private _createFeatureQuery(
    attachmentViewerData: PhotoCentricData
  ): __esri.Query {
    const orderByFields = this._createOrderByFields(attachmentViewerData);
    const where = this._createUpdatedDefinitionExpression(attachmentViewerData);
    const attachmentObjectIds = this._getAttachmentObjectIds(
      attachmentViewerData
    );
    const queryConfig = {
      outFields: ["*"],
      orderByFields: orderByFields,
      where,
      returnGeometry: true
    };

    return this.onlyDisplayFeaturesWithAttachmentsIsEnabled &&
      attachmentObjectIds &&
      attachmentObjectIds.length > 0
      ? new Query({ ...queryConfig, objectIds: attachmentObjectIds })
      : new Query(queryConfig);
  }

  // _createUpdatedDefinitionExpression
  private _createUpdatedDefinitionExpression(
    attachmentViewerData: PhotoCentricData
  ): string {
    const attachmentObjectIds =
      attachmentViewerData && attachmentViewerData.attachments
        ? Object.keys(attachmentViewerData.attachments).map(objectId => {
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
  }

  // _createOrderByFields
  private _createOrderByFields(
    attachmentViewerData: PhotoCentricData
  ): string[] {
    const { featureLayer } = attachmentViewerData.layerData;
    const { objectIdField } = featureLayer;
    const { order } = this;
    const sortField = attachmentViewerData.get("sortField") as string;
    const sortFieldValue = sortField ? sortField : objectIdField;
    const fieldOrder = order ? order : "ASC";
    return [`${sortFieldValue} ${fieldOrder}`];
  }

  // _getAttachmentObjectIds
  private _getAttachmentObjectIds(
    attachmentViewerData: PhotoCentricData
  ): number[] {
    const { attachments } = attachmentViewerData;
    return attachments
      ? Object.keys(attachments).map(objectId => {
          return parseInt(objectId);
        })
      : null;
  }

  // _handleObjectIdPromise
  private _handleObjectIdPromise(
    attachmentViewerData: PhotoCentricData,
    featureQuery: __esri.Query
  ): void {
    const { featureLayer } = attachmentViewerData.layerData;
    this._queryObjectIdPromises.push(
      featureLayer
        .queryObjectIds(featureQuery)
        .catch((err: Error) => {
          this._queryingForObjectIds = null;
          this.notifyChange("state");
          console.error("ERROR: ", err);
        })
        .then((objectIds: number[]) => {
          return {
            attachmentViewerData,
            objectIds
          };
        })
    );
  }

  // _handleQueryObjectIdPromisesResults
  private _handleQueryObjectIdPromisesResults(
    objectIdPromiseResults: PhotoCentricOIDPromise[],
    isSketchDelete?: boolean
  ): void {
    this._queryFeaturesPromises = [];
    this._initQueryFeaturesPromises(objectIdPromiseResults);

    Promise.all(this._queryFeaturesPromises).then(
      (queriedFeaturesPromisesResults: PhotoCentricFeaturesPromise[]) => {
        this._handleQueryFeaturesPromisesResults(
          queriedFeaturesPromisesResults,
          isSketchDelete
        );
      }
    );
  }

  // _initQueryFeaturesPromises
  private _initQueryFeaturesPromises(
    objectIdPromiseResults: PhotoCentricOIDPromise[]
  ): void {
    objectIdPromiseResults.forEach(
      (objectIdPromiseResult: PhotoCentricOIDPromise) => {
        const { attachmentViewerData, objectIds } = objectIdPromiseResult;
        const { featureObjectIds } = attachmentViewerData;

        if (!objectIds) {
          return;
        }

        featureObjectIds.removeAll();
        featureObjectIds.addMany([...objectIds]);

        const featureQuery = this._setupFeatureQuery(attachmentViewerData);

        this._queryFeaturesPromises.push(
          attachmentViewerData.layerData.featureLayer
            .queryFeatures(featureQuery)
            .catch(err => {
              this._queryingForFeaturesPhotoCentric = null;
              this.notifyChange("state");
              console.error("ERROR: ", err);
            })
            .then((queriedFeatures: __esri.FeatureSet) => {
              return { attachmentViewerData, queriedFeatures };
            })
        );
      }
    );
  }

  // _handleQueryFeaturesPromisesResults
  private _handleQueryFeaturesPromisesResults(
    queriedFeaturesPromisesResults: any,
    isSketchDelete?: boolean
  ): void {
    queriedFeaturesPromisesResults.forEach(queriedFeaturesPromisesResult => {
      this._addLayerFeaturesToAttachmentViewerData(
        queriedFeaturesPromisesResult
      );
    });
    this._setupPhotoCentricLayout(isSketchDelete);
  }

  // _addLayerFeaturesToAttachmentViewerData
  private _addLayerFeaturesToAttachmentViewerData(
    queriedFeaturesPromisesResult: any
  ): void {
    const {
      attachmentViewerData,
      queriedFeatures
    } = queriedFeaturesPromisesResult;

    const { layerFeatures, layerFeatureIndex } = attachmentViewerData;

    layerFeatures.removeAll();

    const currentSet = this._getCurrentSetOfFeatures(attachmentViewerData);
    const features = this._sortFeatures(
      queriedFeatures,
      currentSet,
      attachmentViewerData
    );
    layerFeatures.addMany(features);

    attachmentViewerData.set(
      "layerFeatureIndex",
      layerFeatureIndex !== null ? layerFeatureIndex : 0
    );
  }

  // _getCurrentSetOfFeatures
  private _getCurrentSetOfFeatures(
    attachmentViewerData: PhotoCentricData
  ): Collection<number> {
    const { queryRange, featureObjectIds } = attachmentViewerData;
    const [low, high] = queryRange;
    return featureObjectIds.slice(low, high);
  }

  // _setupPhotoCentricLayout
  private _setupPhotoCentricLayout(isSketchDelete?: boolean): void {
    if (this._currentSketchExtentPhotoCentric || isSketchDelete) {
      this.attachmentViewerDataCollection.forEach(attachmentViewerData => {
        attachmentViewerData.set("attachmentIndex", 0);
        attachmentViewerData.set("objectIdIndex", 0);
        attachmentViewerData.set("layerFeatureIndex", 0);
      });
      this._setFeaturePhotoCentric();
    } else {
      this._setAttachmentViewerData();
      this._setupDataWatchers();
      this._setupSocialSharing();
    }
  }

  // _sortFeatures
  private _sortFeatures(
    queriedFeatures: any,
    currentSet: __esri.Collection,
    attachmentViewerData: PhotoCentricData
  ): __esri.Graphic[] {
    const features = [];
    const objectIdField = attachmentViewerData.get(
      "layerData.featureLayer.objectIdField"
    ) as string;
    if (!queriedFeatures) {
      return;
    }

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

  // _initializeSketch
  private _initializeSketch(): void {
    const { _photoCentricHandles } = this;
    const selectFeaturesEnabled = "select-features-enabled";
    _photoCentricHandles.add(
      watchUtils.whenOnce(this, "selectFeaturesEnabled", () => {
        _photoCentricHandles.remove(selectFeaturesEnabled);
        const sketchWidgetInit = "sketch-widget-init";
        _photoCentricHandles.add(
          watchUtils.whenOnce(this, "sketchWidget", () => {
            _photoCentricHandles.remove(sketchWidgetInit);
            this._handleSketch();
          }),
          sketchWidgetInit
        );
      }),
      selectFeaturesEnabled
    );
  }

  // _handlesketch
  private _handleSketch(): void {
    const sketchWidgetKey = "sketch-widget";
    this._photoCentricHandles.add(
      watchUtils.when(
        this,
        "selectedAttachmentViewerData.layerData.featureLayer",
        () => {
          const { sketchWidget, graphicsLayer } = this;
          this._watchSketchCreateAndUpdate(sketchWidget, graphicsLayer);
          this._watchSketchDelete(sketchWidget);
          this._photoCentricHandles.remove(sketchWidgetKey);
        }
      ),
      sketchWidgetKey
    );
  }

  // _watchSketchCreateAndUpdate
  private _watchSketchCreateAndUpdate(
    sketchWidget: __esri.Sketch,
    graphicsLayer: __esri.GraphicsLayer
  ): void {
    this._photoCentricHandles.add([
      sketchWidget.on("create", (sketchEvent: __esri.SketchCreateEvent) => {
        this._handleSketchEvent(sketchEvent, graphicsLayer);
      }),
      sketchWidget.on("update", (sketchEvent: __esri.SketchUpdateEvent) => {
        this._handleSketchEvent(sketchEvent, graphicsLayer);
      })
    ]);
  }

  // _handleSketchEvent
  private _handleSketchEvent(
    sketchEvent: __esri.SketchCreateEvent | __esri.SketchUpdateEvent,
    graphicsLayer: __esri.GraphicsLayer
  ): void {
    const { type, state } = sketchEvent;
    if (type === "create" && (state === "active" || state === "start")) {
      graphicsLayer.graphics.removeAt(0);
    }
    if (state === "complete") {
      let geometry = null;
      if (sketchEvent.type === "update") {
        const event = sketchEvent as __esri.SketchUpdateEvent;
        geometry = event.graphics[0].geometry;
      } else {
        const event = sketchEvent as __esri.SketchCreateEvent;
        geometry = event.graphic.geometry;
      }
      this._currentSketchExtentPhotoCentric = geometry;
      this._queryFeaturesWithinSketchExtent(geometry);
      this._handleSketchFeatureEffect(geometry);
    }
  }

  // _watchSketchDelete
  private _watchSketchDelete(sketchWidget: __esri.Sketch): void {
    this._photoCentricHandles.add(
      sketchWidget.on("delete", () => {
        this.attachmentViewerDataCollection.forEach(attachmentViewerData => {
          attachmentViewerData.set("layerData.layerView.effect", null);
        });
        this._currentSketchExtentPhotoCentric = null;
        this.notifyChange("state");
        this._initQueryObjectIdPromises(null, true);
      })
    );
  }

  // _generateSketchQuery
  private _generateSketchQuery(
    geometry: __esri.Extent,
    photoCentricData: PhotoCentricData
  ): any {
    const attachmentObjectIds = this._getAttachmentObjectIds(photoCentricData);
    const where = this._createUpdatedDefinitionExpression(photoCentricData);
    const queryConfig = {
      outFields: ["*"],
      geometry,
      outSpatialReference: this.view.get("spatialReference"),
      where,
      returnGeometry: true
    };
    return attachmentObjectIds &&
      attachmentObjectIds.length > 0 &&
      this.onlyDisplayFeaturesWithAttachmentsIsEnabled
      ? { ...queryConfig, objectIds: [...attachmentObjectIds] }
      : queryConfig;
  }

  // _handleSketchFeatureEffect
  private _handleSketchFeatureEffect(geometry: __esri.Extent): void {
    this.attachmentViewerDataCollection.forEach(attachmentViewerData => {
      const layerView = attachmentViewerData.get(
        "layerData.layerView"
      ) as __esri.FeatureLayerView;

      const featureEffect = new FeatureEffect({
        filter: {
          geometry
        },
        excludedEffect: "grayscale(100%) opacity(50%)"
      });
      layerView.set("effect", featureEffect);
    });
  }

  // _queryFeaturesWithinSketchExtent
  private _queryFeaturesWithinSketchExtent(
    sketchGeometry: __esri.Extent
  ): void {
    this._queryObjectIdPromises = [];
    this._initQueryObjectIdPromises(sketchGeometry);
  }

  // _detectFeatureClick
  private _detectFeatureClick(): __esri.WatchHandle {
    return this.view.on("click", (event: __esri.MapViewClickEvent) => {
      if (this.queryingState !== "ready") {
        return;
      }
      if (!this.imagePanZoomEnabled) {
        if (this.state !== "ready" || this._performingHitTestPhotoCentric) {
          return;
        }
      }
      const { view } = this;
      this._performingHitTestPhotoCentric = view.hitTest(event);
      this.notifyChange("state");
      this._performingHitTestPhotoCentric.then(
        (hitTestRes: __esri.HitTestResult) => {
          this._handleHitTestRes(hitTestRes);
        }
      );
    });
  }

  // _handleHitTestRes
  private _handleHitTestRes(hitTestRes: __esri.HitTestResult): void {
    const results = hitTestRes && hitTestRes.results;

    const layerIds = this.attachmentViewerDataCollection
      .slice()
      .map(attachmentViewerData => {
        return attachmentViewerData.selectedLayerId;
      });
    const filteredResults =
      results &&
      results.filter(result => {
        const { id } = result.graphic.layer;
        return (
          layerIds.indexOf(id) !== -1 ||
          (this.graphicsLayer && this.graphicsLayer.id === id)
        );
      });

    if (!filteredResults || (filteredResults && filteredResults.length === 0)) {
      this._resetHitTestState();
      return;
    }

    const result = filteredResults[0] as HitTestResult;

    if (this._currentSketchExtentPhotoCentric) {
      const mapPoint = result && (result.mapPoint as __esri.Point);
      const containsPoint = this._currentSketchExtentPhotoCentric.contains(
        mapPoint
      );
      if (!containsPoint) {
        this._resetHitTestState();
        return;
      }

      const { viewModel } = this.sketchWidget;
      if (result.graphic.layer === viewModel.layer) {
        viewModel.update([result.graphic], {
          tool: "transform"
        });
      }
    }

    this._removeFeatureHighlight();
    this._resetHitTestState();

    const attachmentViewerData = this._getHitTestAttachmentViewerData(result);

    if (!attachmentViewerData) {
      return;
    }

    this.set("imageIsLoaded", false);

    const { objectIdField } = attachmentViewerData.layerData.featureLayer;
    const objectId = this._getHitTestGraphicObjectId(result, objectIdField);
    if (attachmentViewerData.featureObjectIds.indexOf(objectId) === -1) {
      this.set("imageIsLoaded", true);
      return;
    }

    if (hitTestRes.results.length) {
      this._setClickedFeature(hitTestRes, attachmentViewerData);
    } else {
      this.set("imageIsLoaded", true);
    }
  }

  // _resetHitTestState
  private _resetHitTestState(): void {
    this._performingHitTestPhotoCentric = null;
    this.notifyChange("state");
  }

  // _removeFeatureHighlight
  private _removeFeatureHighlight(): void {
    if (this._highlightedFeaturePhotoCentric) {
      this._highlightedFeaturePhotoCentric.remove();
      this._highlightedFeaturePhotoCentric = null;
    }
  }

  // _getHitTestAttachmentViewerData
  private _getHitTestAttachmentViewerData(
    result: HitTestResult
  ): PhotoCentricData {
    return this.attachmentViewerDataCollection.find(attachmentViewerData => {
      return (
        attachmentViewerData.layerData.featureLayer.id ===
        result.graphic.layer.id
      );
    }) as PhotoCentricData;
  }

  // _getHitTestGraphicObjectId
  private _getHitTestGraphicObjectId(
    result: any,
    objectIdField: string
  ): number {
    return (
      result &&
      result.graphic &&
      result.graphic.attributes &&
      result.graphic.attributes[objectIdField]
    );
  }

  // _setClickedFeature
  private _setClickedFeature(
    hitTestRes: __esri.HitTestResult,
    attachmentViewerData: PhotoCentricData
  ): void {
    const { featureLayer } = attachmentViewerData.layerData;
    const detectedFeature = hitTestRes.results.filter(result => {
      const { layer } = result.graphic;
      return layer.id === featureLayer.id;
    })[0].graphic;
    attachmentViewerData.set("selectedFeature", detectedFeature);

    if (featureLayer.id !== this.layerSwitcher.selectedLayer.id) {
      this.set("layerSwitcher.selectedLayer", featureLayer);
      this.set("layerSwitcher.selectedLayerId", featureLayer.id);
      this.set("selectedAttachmentViewerData", attachmentViewerData);
    }

    this.updateSelectedFeatureFromClickOrSearch(detectedFeature);
  }

  // _setSelectedFeature
  private _setSelectedFeature(
    selectedAttachmentViewerData: PhotoCentricData
  ): __esri.Graphic {
    const layerFeatures = selectedAttachmentViewerData.get(
      "layerFeatures"
    ) as __esri.Collection<__esri.Graphic>;

    const layerFeatureIndex = selectedAttachmentViewerData.get(
      "layerFeatureIndex"
    ) as number;

    const selectedFeature = layerFeatures.getItemAt(
      layerFeatureIndex
    ) as __esri.Graphic;
    selectedAttachmentViewerData.set("selectedFeature", selectedFeature);
    return selectedFeature;
  }

  // _setFeatureWidget
  private _setFeatureWidget(): void {
    const featureWidget = new Feature({
      graphic: this.selectedAttachmentViewerData.selectedFeature,
      map: this.view.map,
      spatialReference: this.view.spatialReference
    });

    this.set("featureWidget", featureWidget);
    this.featureWidget.set("visibleElements.title", false);
    const featureWidgetKey = "feature-widget";
    this._photoCentricHandles.add(
      this._watchFeatureWidgetLoad(featureWidgetKey),
      featureWidgetKey
    );
  }

  // _watchFeatureWidgetLoad
  private _watchFeatureWidgetLoad(
    featureWidgetKey: string
  ): __esri.WatchHandle {
    return watchUtils.whenOnce(this, "featureWidget.viewModel.content", () => {
      this._photoCentricHandles.remove(featureWidgetKey);
      this._setupFeatureWidgetContent();
    });
  }

  // _setupFeatureWidgetContent
  private _setupFeatureWidgetContent(): void {
    this.setFeatureInfo(this.featureWidget);
    const layerAttachments = this._extractLayerAttachments();
    if (!layerAttachments) {
      return;
    }
    this._setupFeatureAttachments(layerAttachments);
  }

  // _setupFeatureAttachments
  private _setupFeatureAttachments(
    layerAttachments: __esri.AttachmentInfo[]
  ): void {
    let currentIndex = null;
    const attachmentExists = this._checkExistingAttachment();
    if (
      this.socialSharingEnabled &&
      this.attachmentIndex !== null &&
      attachmentExists
    ) {
      this.set(
        "selectedAttachmentViewerData.attachmentIndex",
        this.attachmentIndex
      );
      currentIndex = this.attachmentIndex;
      this.set("attachmentIndex", null);
    } else {
      this.set("selectedAttachmentViewerData.attachmentIndex", 0);
      currentIndex = 0;
    }

    const featureAttachments = this._sortFeatureAttachments(layerAttachments);
    const attachmentsArr =
      featureAttachments && featureAttachments.length > 0
        ? featureAttachments
        : [];
    const attachments = new Collection([...attachmentsArr]);
    const selectedFeatureAttachments = new SelectedFeatureAttachments({
      attachments,
      currentIndex
    });
    if (attachments.length === 0) {
      this.set("imageIsLoaded", true);
    }
    this.set(
      "selectedAttachmentViewerData.selectedFeatureAttachments",
      selectedFeatureAttachments
    );
  }

  // _checkExistingAttachment
  private _checkExistingAttachment(): boolean {
    const {
      attachments,
      layerData,
      selectedFeature
    } = this.selectedAttachmentViewerData;
    const { attributes } = selectedFeature;
    const { objectIdField } = layerData.featureLayer;
    const objectId = attributes[objectIdField];
    const featureAttachments = attachments[objectId];
    const currentAttachment =
      featureAttachments && featureAttachments[this.attachmentIndex];
    return !!currentAttachment;
  }

  // _extractLayerAttachments
  private _extractLayerAttachments(): __esri.AttachmentInfo[] {
    const attributes = this.get("featureWidget.graphic.attributes");
    const objectIdField = this.get(
      "selectedAttachmentViewerData.layerData.featureLayer.objectIdField"
    ) as string;
    const objectId = attributes && attributes[objectIdField];
    const attachments = this.get("selectedAttachmentViewerData.attachments");
    const layerAttachments = attachments && attachments[objectId];
    return layerAttachments ? layerAttachments : [];
  }

  // _sortFeatureAttachments
  private _sortFeatureAttachments(
    layerAttachments: __esri.AttachmentInfo[]
  ): __esri.AttachmentInfo[] {
    const featureAttachments = [];
    this.set("selectedAttachmentViewerData.unsupportedAttachmentTypes", []);

    if (layerAttachments) {
      layerAttachments &&
        layerAttachments.forEach(attachmentInfo => {
          const { contentType } = attachmentInfo;

          if (this.supportedAttachmentTypes.indexOf(contentType) !== -1) {
            featureAttachments.push(attachmentInfo);
          } else {
            const unsupportedAttachmentTypes = this.get(
              "selectedAttachmentViewerData.unsupportedAttachmentTypes"
            ) as __esri.AttachmentInfo[];
            unsupportedAttachmentTypes.push(attachmentInfo);
          }
        });
    }
    return featureAttachments;
  }

  // _goToSelectedFeature
  private _goToSelectedFeature(): void {
    const { selectedFeature } = this.selectedAttachmentViewerData;
    if (selectedFeature) {
      this.view.goTo({
        target: selectedFeature
      });
    }
  }

  // _handleSearchWidgets
  private _handleSearchWidgets(): __esri.WatchHandle {
    return watchUtils.whenOnce(this, ["searchWidget"], () => {
      this.searchWidget.popupEnabled = false;
      this._photoCentricHandles.add(this._watchSelectedSearchResults());
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

          if (!selectedFeatureResult) {
            return;
          }

          const selectedFeatureResultId =
            selectedFeatureResult &&
            (selectedFeatureResult.get("layer.id") as string);

          const selectedLayerId = this.get(
            "selectedAttachmentViewerData.layerData.featureLayer.id"
          ) as string;

          if (selectedFeatureResultId !== selectedLayerId) {
            const updatedAttachmentViewerData = this.attachmentViewerDataCollection.find(
              attachmentViewerData => {
                return (
                  attachmentViewerData.layerData.featureLayer.id ===
                  selectedFeatureResultId
                );
              }
            );

            if (!updatedAttachmentViewerData) {
              return;
            }

            const updatedLayer = updatedAttachmentViewerData.get(
              "layerData.featureLayer"
            ) as __esri.FeatureLayer;

            this.set("layerSwitcher.selectedLayer", updatedLayer);
            this.set("layerSwitcher.selectedLayerId", updatedLayer.id);
            this.set(
              "selectedAttachmentViewerData",
              updatedAttachmentViewerData
            );

            updatedAttachmentViewerData.set(
              "selectedFeature",
              selectedFeatureResult
            );
          }

          this.updateSelectedFeatureFromClickOrSearch(selectedFeatureResult);
        }
      }
    );
  }

  // _setupSocialSharing
  private _setupSocialSharing(): void {
    const socialsharing = "social-sharing";
    this._photoCentricHandles.add(
      watchUtils.when(this, "socialSharingEnabled", () => {
        this._photoCentricHandles.remove(socialsharing);
        this.setupShare();
      }),
      socialsharing
    );
  }

  // _setAttachmentViewerData
  private _setAttachmentViewerData(): void {
    const { selectedLayerId, socialSharingEnabled } = this;
    const photoCentricDataCollection = this
      .attachmentViewerDataCollection as __esri.Collection<PhotoCentricData>;
    const attachmentViewerData = this._getAttachmentViewerData(
      selectedLayerId,
      socialSharingEnabled,
      photoCentricDataCollection
    );
    if (!attachmentViewerData) {
      return;
    }
    const { featureLayer } = attachmentViewerData.layerData;
    if (
      (selectedLayerId && socialSharingEnabled) ||
      !this._currentSketchExtentPhotoCentric
    )
      this.set("layerSwitcher.selectedLayer", featureLayer);
    this.set("layerSwitcher.selectedLayerId", featureLayer.id);
    this.set("selectedAttachmentViewerData", attachmentViewerData);
  }

  // _getAttachmentViewerData
  private _getAttachmentViewerData(
    selectedLayerId: string,
    socialSharingEnabled: boolean,
    attachmentViewerDataCollection: __esri.Collection<PhotoCentricData>
  ): PhotoCentricData {
    const dataThatSupportsAttachments = attachmentViewerDataCollection.find(
      attachmentViewerData => {
        return attachmentViewerData.layerData.featureLayer.capabilities.data
          .supportsAttachment;
      }
    );
    return selectedLayerId && socialSharingEnabled
      ? attachmentViewerDataCollection.find(attachmentViewerData => {
          const { id } = attachmentViewerData.layerData.featureLayer;
          return id === selectedLayerId;
        })
      : dataThatSupportsAttachments
      ? dataThatSupportsAttachments
      : attachmentViewerDataCollection.getItemAt(0);
  }

  // _setupDataWatchers
  private _setupDataWatchers(): void {
    const { _photoCentricHandles } = this;
    const setupDataWatchers = "setup-data-watchers";
    if (_photoCentricHandles.has(setupDataWatchers)) {
      _photoCentricHandles.remove(setupDataWatchers);
    }
    _photoCentricHandles.add(
      [
        this._handleSearchWidgets(),
        watchUtils.watch(
          this,
          "selectedAttachmentViewerData.selectedFeature",
          () => {
            this._goToSelectedFeature();
          }
        )
      ],
      setupDataWatchers
    );
  }

  // _updateIndexData
  private _updateIndexData(queryType: string, objectId?: number): void {
    const selectedAttachmentViewerData = this
      .selectedAttachmentViewerData as PhotoCentricData;
    this._updateLayerFeatureAndObjectIdIndexes(
      selectedAttachmentViewerData,
      queryType,
      objectId
    );
    this._highlightFeature(selectedAttachmentViewerData.layerFeatureIndex);
    const selectedAttachmentViewerDataIndex = this.get(
      "selectedAttachmentViewerData.attachmentIndex"
    );
    const attachmentIndex = selectedAttachmentViewerDataIndex
      ? selectedAttachmentViewerDataIndex
      : 0;
    this.set("selectedAttachmentViewerData.attachmentIndex", attachmentIndex);
  }

  // _updateLayerFeatureAndObjectIdIndexes
  private _updateLayerFeatureAndObjectIdIndexes(
    selectedAttachmentViewerData: PhotoCentricData,
    queryType: string,
    objectId: number
  ): void {
    if (!selectedAttachmentViewerData) {
      return;
    }
    const { layerFeatures, featureObjectIds } = selectedAttachmentViewerData;
    if (queryType === "updatingNext") {
      selectedAttachmentViewerData.layerFeatureIndex = 0;
      selectedAttachmentViewerData.objectIdIndex += 1;
    } else if (queryType === "updatingPrevious") {
      selectedAttachmentViewerData.layerFeatureIndex = layerFeatures.length - 1;
      selectedAttachmentViewerData.objectIdIndex -= 1;
    } else if (queryType === "restartNext") {
      selectedAttachmentViewerData.layerFeatureIndex = 0;
      selectedAttachmentViewerData.objectIdIndex = 0;
    } else if (queryType === "restartPrevious") {
      selectedAttachmentViewerData.layerFeatureIndex = layerFeatures.length - 1;
      selectedAttachmentViewerData.objectIdIndex = featureObjectIds.length - 1;
    } else if (queryType === "updatingClick") {
      this._updateFeatureClick(objectId);
    } else if (queryType === "share") {
      this._updateFeatureFromShare();
    }
  }

  // _setFeaturePhotoCentric
  private _setFeaturePhotoCentric(): void {
    const selectedAttachmentViewerData = this.get(
      "selectedAttachmentViewerData"
    ) as PhotoCentricData;
    if (!selectedAttachmentViewerData) {
      return;
    }

    const selectedFeature = this._setSelectedFeature(
      selectedAttachmentViewerData
    );
    if (this.addressEnabled && selectedFeature) {
      this.getAddress(selectedFeature.geometry);
    }

    this._setSelectedFeatureHighlight(
      selectedAttachmentViewerData,
      selectedFeature
    );
    this._setFeatureWidget();
  }

  // _setSelectedFeatureHighlight
  private _setSelectedFeatureHighlight(
    selectedAttachmentViewerData: PhotoCentricData,
    selectedFeature: __esri.Graphic
  ): void {
    this._removeFeatureHighlight();
    const { layerView } = selectedAttachmentViewerData.layerData;
    this._highlightedFeaturePhotoCentric = layerView.highlight(selectedFeature);
  }

  //----------------------------------
  //
  //  SCROLL FEATURES
  //
  //----------------------------------

  // previousFeature
  previousFeature(): void {
    const selectedAttachmentViewerData = this
      .selectedAttachmentViewerData as PhotoCentricData;
    if (selectedAttachmentViewerData.layerFeatureIndex - 1 === -1) {
      this._updateFeatureData("updatingPrevious");
    } else {
      selectedAttachmentViewerData.layerFeatureIndex -= 1;
      selectedAttachmentViewerData.objectIdIndex -= 1;
      this._setFeaturePhotoCentric();
    }
    this.set("selectedAttachmentViewerData.selectedFeatureAttachments", null);
    this._highlightFeature(selectedAttachmentViewerData.layerFeatureIndex);
    this.setUpdateShareIndexes();
  }

  // nextFeature
  nextFeature(): void {
    const selectedAttachmentViewerData = this
      .selectedAttachmentViewerData as PhotoCentricData;
    if (
      selectedAttachmentViewerData.layerFeatureIndex ===
      selectedAttachmentViewerData.layerFeatures.length - 1
    ) {
      this._updateFeatureData("updatingNext");
    } else {
      selectedAttachmentViewerData.layerFeatureIndex += 1;
      selectedAttachmentViewerData.objectIdIndex += 1;
      this._setFeaturePhotoCentric();
    }
    this.set("selectedAttachmentViewerData.selectedFeatureAttachments", null);
    this._highlightFeature(selectedAttachmentViewerData.layerFeatureIndex);
    this.setUpdateShareIndexes();
  }

  // _updateFeatureData
  private _updateFeatureData(updatingType: string): void {
    const selectedAttachmentViewerData = this
      .selectedAttachmentViewerData as PhotoCentricData;
    const featureTotal = selectedAttachmentViewerData.get(
      "featureObjectIds.length"
    ) as number;
    if (featureTotal === selectedAttachmentViewerData.objectIdIndex + 1) {
      selectedAttachmentViewerData.queryRange = [0, 10];
      this._queryFeaturesForSelectedAttachmentViewerData("restartNext");
      return;
    }

    if (selectedAttachmentViewerData.objectIdIndex - 1 === -1) {
      const low = Math.floor(featureTotal / 10) * 10 - 10;
      selectedAttachmentViewerData.queryRange = [low, featureTotal];
      this._queryFeaturesForSelectedAttachmentViewerData("restartPrevious");
      return;
    }

    if (updatingType === "updatingNext") {
      this._updateQueryRange("updatingNext");
      this._queryFeaturesForSelectedAttachmentViewerData("updatingNext");
    } else if (updatingType === "updatingPrevious") {
      this._updateQueryRange("updatingPrevious");
      this._queryFeaturesForSelectedAttachmentViewerData("updatingPrevious");
    }
  }

  // If feature does not exist in current queried layer features, the query range will be updated
  // _updateQueryRange
  private _updateQueryRange(
    updatingType: string,
    objectIdIndex?: number
  ): void {
    const floor = Math.floor(objectIdIndex / 10) * 10;
    const ceil = Math.ceil(objectIdIndex / 10) * 10;

    const queryRange = this.selectedAttachmentViewerData.get("queryRange");
    // Update query range to query for next 10 features
    if (updatingType === "updatingNext") {
      const currentLow = queryRange[0];
      const updatedLow =
        queryRange[0] === 0 ? 10 : Math.round(currentLow / 10) * 10 + 10;
      const updatedHigh = updatedLow + 10;

      queryRange[0] = updatedLow;
      queryRange[1] = updatedHigh;
    }
    // Update query range to query for previous 10 features
    else if (updatingType === "updatingPrevious") {
      const currentLow = queryRange[0];
      const updatedHigh = currentLow;
      const updatedLow = Math.floor(currentLow / 10) * 10 - 10;
      queryRange[0] = updatedLow;
      queryRange[1] = updatedHigh;
    }
    // Update query range to query for 10 features relative to feature that was clicked
    else if (
      updatingType === "updatingClick" &&
      (objectIdIndex || objectIdIndex === 0)
    ) {
      const updatedLow = floor;
      const updatedHigh = objectIdIndex % 10 === 0 ? ceil + 10 : ceil;
      queryRange[0] = updatedLow;
      queryRange[1] = updatedHigh;
    }
    // Update query range based on defaultObjectId from share widget
    else if (updatingType === "share" && this.defaultObjectId) {
      const defaultObjectIdIndex = this.selectedAttachmentViewerData.featureObjectIds.indexOf(
        this.defaultObjectId
      );

      const objectIdIndex =
        defaultObjectIdIndex !== -1 ? defaultObjectIdIndex : 0;

      const shareFloor = Math.floor(objectIdIndex / 10) * 10;
      const shareCeil = Math.ceil(objectIdIndex / 10) * 10;

      const updatedLow = shareFloor;
      const updatedHigh = objectIdIndex % 10 === 0 ? shareCeil + 10 : shareCeil;
      queryRange[0] = updatedLow;
      queryRange[1] = updatedHigh;
    }
  }

  // _setupFeatureQuery
  private _setupFeatureQuery(
    attachmentViewerData: PhotoCentricData
  ): __esri.Query {
    const { order } = this;
    const { featureLayer } = attachmentViewerData.layerData;

    // Query for features only within the set query range
    const [low, high] = attachmentViewerData.queryRange;
    const updatedLow = low < 0 ? 0 : low;
    const currentSet = attachmentViewerData.featureObjectIds.slice(
      updatedLow,
      high
    );
    const { objectIdField } = featureLayer;
    const fieldOrder = order ? order : "ASC";
    const orderByFieldsValue = attachmentViewerData.get("sortField")
      ? [`${attachmentViewerData.get("sortField")} ${fieldOrder}`]
      : [`${objectIdField} ${fieldOrder}`];

    const outSpatialReference =
      this.view && this.view.spatialReference
        ? this.view.spatialReference
        : null;

    const definitionExpression = attachmentViewerData.get(
      "defaultLayerExpression"
    ) as string;
    const where = definitionExpression ? definitionExpression : "1=1";

    const queryConfig = {
      objectIds: currentSet.toArray(),
      outFields: ["*"],
      orderByFields: orderByFieldsValue,
      where,
      returnGeometry: true,
      outSpatialReference
    };

    return new Query(queryConfig);
  }

  // _updateFeatureFromShare
  private _updateFeatureFromShare(): void {
    const selectedAttachmentViewerData = this
      .selectedAttachmentViewerData as PhotoCentricData;
    const { defaultObjectId } = this;
    const { featureLayer } = this.selectedAttachmentViewerData.layerData;
    const { objectIdField } = featureLayer;
    const layerFeatureIndex = selectedAttachmentViewerData.layerFeatures.indexOf(
      selectedAttachmentViewerData.layerFeatures.find(
        layerFeature =>
          layerFeature &&
          layerFeature.attributes[objectIdField] === defaultObjectId
      )
    );
    const objectIdIndex = this.selectedAttachmentViewerData.featureObjectIds.indexOf(
      defaultObjectId
    );
    selectedAttachmentViewerData.layerFeatureIndex =
      layerFeatureIndex !== -1 ? layerFeatureIndex : 0;
    selectedAttachmentViewerData.objectIdIndex =
      objectIdIndex !== -1 ? objectIdIndex : 0;
  }

  //----------------------------------
  //
  //  Highlight
  //
  //----------------------------------

  // _highlightFeature
  private _highlightFeature(layerFeatureIndex?: number): void {
    this._removeFeatureHighlight();
    const layerFeatures = this.selectedAttachmentViewerData.get(
      "layerFeatures"
    ) as __esri.Collection<__esri.Graphic>;
    const selectedFeature = this.selectedAttachmentViewerData.get(
      "selectedFeature"
    ) as __esri.Graphic;
    const feature =
      layerFeatureIndex || layerFeatureIndex === 0
        ? layerFeatures.getItemAt(layerFeatureIndex)
        : (selectedFeature as __esri.Graphic);
    const layerView = this.selectedAttachmentViewerData.get(
      "layerData.layerView"
    ) as __esri.FeatureLayerView;
    this._highlightedFeaturePhotoCentric =
      layerView && feature && layerView.highlight(feature);
  }

  // updateSelectedFeatureFromClickOrSearch
  updateSelectedFeatureFromClickOrSearch(feature: __esri.Graphic): void {
    const { featureObjectIds, selectedFeature, layerFeatures } = this
      .selectedAttachmentViewerData as PhotoCentricData;
    const { featureLayer } = this.selectedAttachmentViewerData.layerData;
    const { objectIdField } = featureLayer;

    if (!selectedFeature) {
      return;
    }

    const layerFeature = layerFeatures.find(layerFeature => {
      return (
        layerFeature.attributes[objectIdField] ===
        feature.attributes[objectIdField]
      );
    });

    const layerFeatureIndex = layerFeatures.indexOf(layerFeature);
    const objectId = featureObjectIds.find(objectId => {
      return feature.attributes[objectIdField] === objectId;
    });

    this.set("currentImageUrl", null);

    // If layer feature exists in current queried feature list, do not update query range or re-query features
    if (layerFeatureIndex !== -1) {
      this.set(
        "selectedAttachmentViewerData.layerFeatureIndex",
        layerFeatureIndex
      );
      this.set(
        "selectedAttachmentViewerData.objectIdIndex",
        this.selectedAttachmentViewerData.featureObjectIds.indexOf(objectId)
      );
      this._setFeaturePhotoCentric();
      this._highlightFeature(
        (this.selectedAttachmentViewerData as PhotoCentricData)
          .layerFeatureIndex
      );
      this.setUpdateShareIndexes();
      return;
    }

    const objectIdIndex = featureObjectIds.indexOf(objectId);
    this._updateQueryRange("updatingClick", objectIdIndex);
    this._queryFeaturesForSelectedAttachmentViewerData(
      "updatingClick",
      objectId
    );
  }

  // _queryFeaturesForSelectedAttachmentViewerData
  private _queryFeaturesForSelectedAttachmentViewerData(
    queryType?: string,
    objectIdIndex?: number
  ): void {
    const selectedAttachmentViewerData = this
      .selectedAttachmentViewerData as PhotoCentricData;

    this.set(
      "layerSwitcher.selectedLayer",
      selectedAttachmentViewerData.layerData.featureLayer
    );

    const layerFeatures = selectedAttachmentViewerData.get(
      "layerFeatures"
    ) as __esri.Collection<__esri.Graphic>;

    const { featureLayer } = this.selectedAttachmentViewerData.layerData;
    const featureQuery = this._setupFeatureQuery(selectedAttachmentViewerData);
    this._queryingFeatures = featureLayer.queryFeatures(featureQuery);

    this._queryingFeatures
      .catch(err => {
        console.error("ERROR: ", err);
      })
      .then((queriedFeatures: __esri.FeatureSet) => {
        this._queryingFeatures = null;
        this.notifyChange("queryingState");
        // Reset features

        layerFeatures.removeAll();
        const [low, high] = selectedAttachmentViewerData.queryRange;

        const featureObjectIds = selectedAttachmentViewerData.get(
          "featureObjectIds"
        ) as __esri.Collection<number>;

        const currentSet = featureObjectIds.slice(low, high);
        // Sort features
        const features = this._sortFeatures(
          queriedFeatures,
          currentSet,
          selectedAttachmentViewerData
        );

        // Add features to layerFeatures prop
        layerFeatures.addMany(features);

        const layerFeatureIndex = selectedAttachmentViewerData.get(
          "layerFeatureIndex"
        ) as number;

        selectedAttachmentViewerData.set(
          "layerFeatureIndex",
          layerFeatureIndex !== null ? layerFeatureIndex : 0
        );

        this._updateIndexData(queryType, objectIdIndex);
        this.setUpdateShareIndexes();
        this._setFeaturePhotoCentric();
      });
    this.notifyChange("queryingState");
  }

  // _updateFeatureClick
  private _updateFeatureClick(objectId: number): void {
    const selectedAttachmentViewerData = this
      .selectedAttachmentViewerData as PhotoCentricData;
    const { layerFeatures } = this
      .selectedAttachmentViewerData as PhotoCentricData;
    const { featureLayer } = this.selectedAttachmentViewerData.layerData;
    selectedAttachmentViewerData.layerFeatureIndex = layerFeatures.indexOf(
      layerFeatures.find(
        layerFeature =>
          layerFeature.attributes[featureLayer.objectIdField] === objectId
      )
    );

    selectedAttachmentViewerData.objectIdIndex = this.selectedAttachmentViewerData.featureObjectIds.indexOf(
      objectId
    );
    if (featureLayer.get("capabilities.data.supportsAttachment")) {
      this.set("imageIsLoaded", false);
    }
  }
}

export = PhotoCentricViewModel;
