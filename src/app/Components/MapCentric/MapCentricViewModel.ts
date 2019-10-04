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
import Handles = require("esri/core/Handles");
import Collection = require("esri/core/Collection");
import promiseUtils = require("esri/core/promiseUtils");
import watchUtils = require("esri/core/watchUtils");

// esri.widgets.Feature
import Feature = require("esri/widgets/Feature");

// esri.tasks.support
import Query = require("esri/tasks/support/Query");
import AttachmentQuery = require("esri/tasks/support/AttachmentQuery");

// esri.views.layers.support
import FeatureEffect = require("esri/views/layers/support/FeatureEffect");

// MapCentricViewModel Classes
import AttachmentViewerViewModel = require("../AttachmentViewer/AttachmentViewerViewModel");
import AttachmentViewerLayerData = require("../AttachmentViewer/AttachmentViewerLayerData");
import MapCentricData = require("./MapCentricData");
import SelectedFeatureAttachments = require("../AttachmentViewer/SelectedFeatureAttachments");

import { AttachmentData } from "../../interfaces/interfaces";

// MapCentricState
type MapCentricState = "ready" | "querying" | "loading" | "disabled";

@subclass("MapCentricViewModel")
class MapCentricViewModel extends declared(AttachmentViewerViewModel) {
  //----------------------------------
  //
  //  Variables
  //
  //----------------------------------
  private _highlightedFeatureMapCentric: any = null;
  private _mapCentricHandles = new Handles();
  private _performingHitTestMapCentric: IPromise = null;
  private _layerViewPromises: IPromise[] = [];
  private _objectIdPromises: IPromise[] = [];
  private _attachmentDataPromises: IPromise[] = [];
  private _queriedAttachmentsPromises: IPromise[] = [];
  private _settingUpAttachments = false;
  private _openToolTipPromise: IPromise = null;
  private _galleryItemPromise: IPromise = null;

  //----------------------------------
  //
  //  state - readOnly
  //
  //----------------------------------
  @property({
    dependsOn: ["view.ready", "featureWidget.viewModel.waitingForContent"],
    readOnly: true
  })
  get mapCentricState(): MapCentricState {
    const ready = this.get("view.ready");
    return ready
      ? this._settingUpAttachments ||
        this._galleryItemPromise ||
        this._performingHitTestMapCentric
        ? "querying"
        : "ready"
      : this.view
      ? "loading"
      : "disabled";
  }

  //----------------------------------
  //
  // Properties
  //
  //----------------------------------

  // attachmentLayer
  @property()
  attachmentLayer: any = null;

  // attachmentLayers
  @property()
  attachmentLayers: any = null;

  // attachmentIndex
  @property()
  attachmentIndex: number = null;

  // currentImageUrl
  @property()
  currentImageUrl: string = null;

  // defaultObjectId
  @property()
  defaultObjectId: number = null;

  // featureContentPanelIsOpen
  @property()
  featureContentPanelIsOpen = false;

  // mapSketchQueryExtent
  @property()
  mapCentricSketchQueryExtent: __esri.Extent = null;

  // mapCentricTooltipEnabled
  @property()
  mapCentricTooltipEnabled: boolean = null;

  // order
  @property()
  order: string = null;

  // selectedLayerId
  @property()
  selectedLayerId: string = null;

  //----------------------------------
  //
  //  Lifecycle Methods
  //
  //----------------------------------

  initialize() {
    this._initLayers();
    this._initSocialShare();
    this._initSketch();
    this._mapCentricHandles.add([
      this._initQueryFeaturesOnStationaryWatcher(),
      this._initFeatureContentCloseWatcher(),
      this._initLayerSwitchWatcher(),
      this._watchSelectedSearchResult()
    ]);
  }

  destroy() {
    this._mapCentricHandles.removeAll();
    this._mapCentricHandles.destroy();
    this._mapCentricHandles = null;
  }

  //----------------------------------
  //
  //  Private Methods
  //
  //----------------------------------
  // _initLayers
  private _initLayers(): void {
    const layerInitKey = "layer-init-key";
    this._mapCentricHandles.add(
      this._handleLayerInitialization(layerInitKey),
      layerInitKey
    );
  }

  // _handleLayerInitialization
  private _handleLayerInitialization(layerInitKey: string): __esri.WatchHandle {
    return watchUtils.whenOnce(this, "view.ready", () => {
      this._mapCentricHandles.remove(layerInitKey);
      this._handleFeatureClickEvent();
      const featureLayerCollection = "feature-layer-collection";
      this._mapCentricHandles.add(
        this._watchFeatureLayerCollection(featureLayerCollection),
        featureLayerCollection
      );
    });
  }

  private _watchFeatureLayerCollection(
    featureLayerCollection: string
  ): __esri.WatchHandle {
    return watchUtils.whenOnce(
      this,
      "layerSwitcher.featureLayerCollection.length",
      () => {
        this._mapCentricHandles.remove(featureLayerCollection);
        this.layerSwitcher.featureLayerCollection.forEach(featureLayer => {
          return this._handleLayerFromCollection(featureLayer);
        });
        this._handleLayerLoadPromises();
      }
    );
  }

  // _handleLayerFromCollection
  private _handleLayerFromCollection(featureLayer: __esri.FeatureLayer): any {
    if (!featureLayer) {
      return;
    }
    if (!this.mapCentricTooltipEnabled) {
      featureLayer.popupEnabled = false;
    }
    if (!featureLayer.capabilities.data.supportsAttachment) {
      return;
    }
    const attachmentQuery = new AttachmentQuery({
      where: "1=1",
      returnMetadata: true
    });

    this._queriedAttachmentsPromises.push(
      featureLayer
        .queryAttachments(attachmentQuery)
        .catch(err => {
          console.error("ATTACHMENT QUERY ERROR: ", err);
        })
        .then(attachments => {
          return {
            featureLayer,
            attachments
          };
        })
    );
  }

  // _handleFeatureClickEvent
  private _handleFeatureClickEvent(): __esri.WatchHandle {
    const popup = this.get("view.popup");
    if (this.mapCentricTooltipEnabled && popup) {
      this.set("view.popup.autoOpenEnabled", false);
    }
    return this.view.on("click", (event: __esri.MapViewClickEvent) => {
      if (this.state !== "ready") {
        return;
      }
      const { view } = this;
      this._performingHitTestMapCentric = view.hitTest(event);
      this.notifyChange("mapCentricState");
      this._performingHitTestMapCentric.then(
        (hitTestRes: __esri.HitTestResult) => {
          const mapPoint = event && event.mapPoint;
          this._handleHitTestRes(hitTestRes, mapPoint);
        }
      );
    });
  }

  // _handleHitTestRes
  private _handleHitTestRes(
    hitTestRes: __esri.HitTestResult,
    mapPoint: __esri.Point
  ): void {
    if (!hitTestRes.results.length) {
      this._resetHitTest();
      return;
    }
    const result = hitTestRes.results[0];
    const selectedFeature = this.get(
      "selectedAttachmentViewerData.selectedFeature"
    ) as __esri.Graphic;
    if (result && selectedFeature) {
      const layerIdFromGraphic =
        result.graphic && result.graphic.layer && result.graphic.layer.id;

      const resultAttributes = result.graphic && result.graphic.attributes;

      const selectedFeatureAttributes =
        selectedFeature && selectedFeature.attributes;

      const selectedAttachmentViewerDataLayerId = this.get(
        "selectedAttachmentViewerData.layerData.featureLayer.id"
      );

      const objectIdField = this.getObjectIdField();
      if (
        layerIdFromGraphic === selectedAttachmentViewerDataLayerId &&
        (resultAttributes &&
          selectedFeatureAttributes &&
          resultAttributes[objectIdField] ===
            selectedFeature.attributes[objectIdField])
      ) {
        this._resetHitTest();
        return;
      }
    }

    if (this.mapCentricSketchQueryExtent) {
      const containsPoint = this._getMapPointContains(result);
      if (!containsPoint) {
        this._performingHitTestMapCentric = null;
        this.notifyChange("mapCentricState");
        return;
      }

      const sketchWidgetViewModel = this.sketchWidget.viewModel;
      if (result.graphic.layer === this.sketchWidget.viewModel.layer) {
        sketchWidgetViewModel.update([result.graphic], { tool: "transform" });
      }
    }

    const resultLayerFromGraphic = result.graphic.layer as __esri.FeatureLayer;
    const resultFeatureLayerId = resultLayerFromGraphic.id;
    const resultAttachmentViewerData = this._getResultAttachmentViewerData(
      resultFeatureLayerId
    );
    if (!resultAttachmentViewerData) {
      this._performingHitTestMapCentric = null;
      this.notifyChange("mapCentricState");
      return;
    }

    const selectedAttachmentViewerDataId = this.get(
      "selectedAttachmentViewerData.layerData.featureLayer.id"
    ) as string;

    this._setLayerFromHitTestResult(
      resultFeatureLayerId,
      selectedAttachmentViewerDataId,
      resultLayerFromGraphic
    );
    this._setClickedFeature(hitTestRes, resultAttachmentViewerData, mapPoint);
    this._performingHitTestMapCentric = null;
    this.notifyChange("mapCentricState");
  }

  // _resetHitTest
  private _resetHitTest(): void {
    this._performingHitTestMapCentric = null;
    this.notifyChange("mapCentricState");
  }

  // _getMapPointContains
  private _getMapPointContains(result: any): boolean {
    const mapPoint = result.mapPoint as __esri.Point;
    return this.mapCentricSketchQueryExtent.contains(mapPoint);
  }

  // _getResultAttachmentViewerData
  private _getResultAttachmentViewerData(
    resultFeatureLayerId: string
  ): MapCentricData {
    return this.attachmentViewerDataCollection.find(attachmentViewerData => {
      const { id } = attachmentViewerData.layerData.featureLayer;
      return resultFeatureLayerId === id;
    }) as MapCentricData;
  }

  // _setLayerFromHitTestResult
  private _setLayerFromHitTestResult(
    resultFeatureLayerId: string,
    selectedAttachmentViewerDataId: string,
    resultLayerFromGraphic: __esri.FeatureLayer
  ): void {
    if (resultFeatureLayerId !== selectedAttachmentViewerDataId) {
      this.set("layerSwitcher.selectedLayer", resultLayerFromGraphic);
    }
  }

  // _setClickedFeature
  private _setClickedFeature(
    hitTestRes: __esri.HitTestResult,
    attachmentViewerData: MapCentricData,
    mapPoint: __esri.Point
  ): void {
    const { featureLayer, layerView } = attachmentViewerData.layerData;
    const graphic = hitTestRes.results.filter(result => {
      const { layer } = result.graphic;
      return layer.id === featureLayer.id;
    })[0].graphic;
    this._processSelectedFeatureIndicator(layerView, graphic, null, mapPoint);
    attachmentViewerData.set("selectedFeature", graphic);
    this.setUpdateShareIndexes();
    this._setFeatureMapCentric(graphic);
  }

  // _handleLayerLoadPromises
  private _handleLayerLoadPromises(): void {
    Promise.all(this._queriedAttachmentsPromises).then(promiseResults => {
      promiseResults.forEach((promiseResult: any) => {
        const { featureLayer, attachments } = promiseResult;

        if (
          featureLayer.type !== "feature" ||
          !featureLayer.get("capabilities.data.supportsAttachment")
        ) {
          return;
        }

        this._layerViewPromises.push(
          this.view
            .whenLayerView(featureLayer)
            .catch(err => {
              console.error("ERROR: ", err);
            })
            .then((layerView: __esri.FeatureLayerView) => {
              return {
                attachments,
                layerView
              };
            })
        );
      });
      this._handleLayerViewLoadPromises();
    });
  }

  // _handleLayerViewLoadPromises
  private _handleLayerViewLoadPromises(): void {
    Promise.all(this._layerViewPromises).then(layerViewPromiseResults => {
      layerViewPromiseResults.forEach((layerViewPromiseResult: any) => {
        this._handleLayerViewLoad(layerViewPromiseResult);
      });
      if (this.onlyDisplayFeaturesWithAttachmentsIsEnabled) {
        this._handleOnlyDisplayFeaturesWithAttachmentsExpression();
      }
      this._queryAllLayerData();
    });
  }

  // _handleOnlyDisplayFeaturesWithAttachmentsExpression
  private _handleOnlyDisplayFeaturesWithAttachmentsExpression(): void {
    this.attachmentViewerDataCollection.forEach(
      (attachmentViewerData: MapCentricData) => {
        const { attachments } = attachmentViewerData;
        const { featureLayer } = attachmentViewerData.layerData;

        featureLayer
          .queryObjectIds({
            where: "1=1"
          })
          .then(objectIds => {
            const objectIdsLength = objectIds.length;
            const attacmentsLength = Object.keys(attachments).map(objectId => {
              return parseInt(objectId);
            }).length;
            if (objectIdsLength !== attacmentsLength) {
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
    );
  }

  private _createUpdatedDefinitionExpressionForLayer(
    attachmentViewerData: MapCentricData
  ): string {
    const { attachments } = attachmentViewerData;
    const { featureLayer } = attachmentViewerData.layerData;
    const { definitionExpression, objectIdField } = featureLayer;
    const attachmentObjectIdArr = this._createAttachmentObjectIdArr(
      attachments
    );
    const attachmentObjectIdsExpression =
      attachmentObjectIdArr && attachmentObjectIdArr.join(",");
    return attachmentObjectIdArr && attachmentObjectIdArr.length
      ? definitionExpression
        ? `${definitionExpression} AND ${objectIdField} IN (${attachmentObjectIdsExpression})`
        : `${objectIdField} IN (${attachmentObjectIdsExpression})`
      : "1=0";
  }

  // _createAttachmentObjectIdArr
  private _createAttachmentObjectIdArr(attachmentsRes): string[] {
    return Object.keys(attachmentsRes).map(objectId => {
      return `'${objectId}'`;
    });
  }

  // _handleLayerViewLoad
  private _handleLayerViewLoad(layerViewPromiseResult: any): void {
    const { attachments, layerView } = layerViewPromiseResult;
    const { layer } = layerView;

    const attachmentViewerData = this._createAttachmentViewerData(
      layer,
      layerView,
      attachments
    );
    this._storeFeatureSortFields(layer, attachmentViewerData);
    this.attachmentViewerDataCollection.add(attachmentViewerData);
  }

  // _createAttachmentViewerData
  private _createAttachmentViewerData(
    featureLayer: __esri.FeatureLayer,
    layerView: __esri.LayerView,
    attachments: any
  ): MapCentricData {
    const layerData = new AttachmentViewerLayerData({
      featureLayer,
      layerView
    });

    return new MapCentricData({
      defaultLayerExpression: featureLayer.definitionExpression,
      layerData,
      selectedLayerId: featureLayer.id,
      attachments
    });
  }

  // _storeFeatureSortFields
  private _storeFeatureSortFields(
    featureLayer: __esri.FeatureLayer,
    attachmentViewerData: MapCentricData
  ): void {
    const { attachmentLayer } = this;
    const attachmentLayers = JSON.parse(this.attachmentLayers);
    if (attachmentLayers && attachmentLayers.length > 0) {
      attachmentLayers.forEach(currentAttachmentLayer => {
        const sortField =
          currentAttachmentLayer.fields &&
          currentAttachmentLayer.fields.length > 0 &&
          currentAttachmentLayer.fields[0];
        if (currentAttachmentLayer.id === featureLayer.id && sortField) {
          attachmentViewerData.sortField = sortField;
        }
      });
    } else {
      if (
        attachmentLayer &&
        attachmentLayer.id === featureLayer.id &&
        attachmentLayer &&
        attachmentLayer.fields &&
        attachmentLayer.fields.length > 0 &&
        attachmentLayer.fields[0] &&
        attachmentLayer.fields[0].fields &&
        attachmentLayer.fields[0].fields.length > 0 &&
        attachmentLayer.fields[0].fields[0]
      ) {
        attachmentViewerData.sortField = this.attachmentLayer.fields[0].fields[0];
      }
    }
  }

  // _initSocialShare
  private _initSocialShare(): void {
    const setupSocialShare = "setup-social-share";
    this._mapCentricHandles.add(
      watchUtils.whenOnce(this, "selectedAttachmentViewerData", () => {
        this._mapCentricHandles.remove(setupSocialShare);
        if (this.socialSharingEnabled) {
          this._setupSocialSharing();
        }

        if (this.mapCentricTooltipEnabled) {
          const { popup } = this.view;
          popup.defaultPopupTemplateEnabled = true;
          popup.dockOptions.buttonEnabled = false;
          popup.featureNavigationEnabled = false;
          popup.collapseEnabled = false;
          popup.highlightEnabled = true;
          popup.actions.removeAll();
        }
      }),
      setupSocialShare
    );
  }

  // _initSketch
  private _initSketch(): void {
    const selectFeauresEnabledKey = "select-features-enabled";
    this._mapCentricHandles.add(
      watchUtils.whenOnce(this, "selectFeaturesEnabled", () => {
        this._initSketchWatchers(selectFeauresEnabledKey);
      }),
      selectFeauresEnabledKey
    );
  }

  // Feature selection methods
  // _initSketchWatchers
  private _initSketchWatchers(selectFeauresEnabledKey: string): void {
    this._mapCentricHandles.remove(selectFeauresEnabledKey);
    const sketchWidgetInitKey = "sketch-widget-init";
    this._mapCentricHandles.add(
      watchUtils.when(this, "sketchWidget", () => {
        this._handleSketchWidgetLoad(sketchWidgetInitKey);
      }),
      sketchWidgetInitKey
    );
  }

  // _handleSketchWidgetLoad
  private _handleSketchWidgetLoad(sketchWidgetInitKey: string): void {
    this._mapCentricHandles.remove(sketchWidgetInitKey);
    this._watchSketchCreateAndUpdate(this.sketchWidget, this.graphicsLayer);
    this._watchSketchDelete(this.sketchWidget);
  }

  // _watchSketchCreateAndUpdate
  private _watchSketchCreateAndUpdate(
    sketchWidget: __esri.Sketch,
    graphicsLayer: __esri.GraphicsLayer
  ): void {
    this._mapCentricHandles.add([
      sketchWidget.on("create", (sketchEvent: __esri.SketchCreateEvent) => {
        this._handleSketchEvent(sketchEvent, graphicsLayer);
      }),
      sketchWidget.on("update", (sketchEvent: __esri.SketchUpdateEvent) => {
        this._handleSketchEvent(sketchEvent, graphicsLayer);
      })
    ]);
  }

  // _watchSketchDelete
  private _watchSketchDelete(sketchWidget: __esri.Sketch): void {
    this._mapCentricHandles.add(
      sketchWidget.on("delete", () => {
        this.set("mapCentricSketchQueryExtent", null);
        this._queryAllLayerData();
        this.attachmentViewerDataCollection.forEach(attachmentViewerData => {
          attachmentViewerData.layerData.layerView.effect = null;
        });
      })
    );
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
      this.set("mapCentricSketchQueryExtent", geometry);
      this._queryAllLayerData(geometry);
    }
  }

  // _handleSketchFeatureEffect
  private _handleSketchFeatureEffect(
    geometry: __esri.Extent,
    attachmentViewerData: MapCentricData
  ): void {
    const layerView = attachmentViewerData.get(
      "layerData.layerView"
    ) as __esri.FeatureLayerView;

    const featureEffect = new FeatureEffect({
      filter: {
        geometry
      },
      excludedEffect: "grayscale(100%) opacity(50%)"
    });
    layerView.effect = featureEffect;
  }
  // End of feature selection methods

  // _initQueryFeaturesOnStationaryWatcher
  private _initQueryFeaturesOnStationaryWatcher(): __esri.WatchHandle {
    return watchUtils.whenFalse(this, "view.stationary", () => {
      this._queryOnStationary();
    });
  }

  // _queryOnStationary
  private _queryOnStationary(): void {
    if (!this.selectedAttachmentViewerData) {
      return;
    }
    if (
      (this.sketchWidget && this.get("graphicsLayer.graphics.length")) ||
      this.featureContentPanelIsOpen
    ) {
      return;
    }

    if (this.view && !this.view.stationary) {
      const mapCentricStationaryWhenTrue = "map-centric-stationary-when-true";
      if (this._mapCentricHandles.has(mapCentricStationaryWhenTrue)) {
        this._mapCentricHandles.remove(mapCentricStationaryWhenTrue);
      }
      this._mapCentricHandles.add(
        watchUtils.whenTrueOnce(this.view, "stationary", () => {
          this._queryAllLayerData();
        }),
        mapCentricStationaryWhenTrue
      );
    } else {
      const mapCentricStationaryWhenFalse = "map-centric-stationary-when-false";
      if (this._mapCentricHandles.has(mapCentricStationaryWhenFalse)) {
        this._mapCentricHandles.remove(mapCentricStationaryWhenFalse);
      }
      this._mapCentricHandles.add(
        watchUtils.whenFalseOnce(this.view, "interacting", () => {
          this._queryAllLayerData();
        }),
        mapCentricStationaryWhenFalse
      );
    }
  }

  // _queryAllLayerData
  private _queryAllLayerData(sketchGeometry?: __esri.Extent): void {
    const geometry = sketchGeometry
      ? sketchGeometry
      : (this.get("view.extent") as __esri.Extent);
    const outSpatialReference = this.get(
      "view.spatialReference"
    ) as __esri.SpatialReference;
    this._objectIdPromises = [];
    this._attachmentDataPromises = [];
    const isSketch = sketchGeometry ? true : false;
    this._queryObjectIdsMapCentric(geometry, outSpatialReference, isSketch);
  }

  // _queryObjectIdsMapCentric
  private _queryObjectIdsMapCentric(
    geometry: __esri.Extent,
    outSpatialReference: __esri.SpatialReference,
    isSketch?: boolean
  ): void {
    this.attachmentViewerDataCollection.forEach(
      (attachmentViewerData: MapCentricData) => {
        attachmentViewerData.layerData.start = null;
        const objectIdField = attachmentViewerData.get(
          "layerData.featureLayer.objectIdField"
        );
        if (isSketch) {
          this._handleSketchFeatureEffect(
            geometry as __esri.Extent,
            attachmentViewerData
          );
        }

        const sortField = attachmentViewerData.get("sortField");
        const order = this.order ? this.order : "ASC";

        const sortFieldValue = sortField
          ? [`${sortField} ${order}`]
          : [`${objectIdField} ${order}`];

        const featureLayer = attachmentViewerData.get(
          "layerData.featureLayer"
        ) as __esri.FeatureLayer;

        const attachmentObjectIds =
          attachmentViewerData && attachmentViewerData.attachments
            ? Object.keys(attachmentViewerData.attachments).map(objectId => {
                return parseInt(objectId);
              })
            : [];

        const where = this.onlyDisplayFeaturesWithAttachmentsIsEnabled
          ? attachmentObjectIds && attachmentObjectIds.length
            ? attachmentViewerData.defaultLayerExpression
              ? attachmentViewerData.defaultLayerExpression
              : "1=1"
            : "1=0"
          : attachmentViewerData.defaultLayerExpression
          ? attachmentViewerData.defaultLayerExpression
          : "1=1";

        const queryConfig = {
          geometry,
          outSpatialReference,
          orderByFields: sortFieldValue,
          where
        };

        const query = this.onlyDisplayFeaturesWithAttachmentsIsEnabled
          ? new Query({
              ...queryConfig,
              objectIds: [...attachmentObjectIds]
            })
          : new Query(queryConfig);

        const objectIdPromise = featureLayer
          .queryObjectIds(query)
          .then(objectIds => {
            return {
              objectIds,
              attachmentViewerData
            };
          });
        this._objectIdPromises.push(objectIdPromise);
      }
    );

    this._handleQueryObjectIDPromises();
  }

  // _handleQueryObjectIDPromises
  private _handleQueryObjectIDPromises(): void {
    Promise.all(this._objectIdPromises).then(objectIdResults => {
      objectIdResults.forEach(objectIdResult => {
        this._handleQueryFeaturesMapCentric(objectIdResult);
      });
      this._settingUpAttachments = false;
      this.notifyChange("mapCentricState");
      this._handleAttachmentDataPromises();
    });
  }

  // _handleQueryFeaturesMapCentric
  private _handleQueryFeaturesMapCentric(objectIdResult: any): void {
    const featureObjectIds = objectIdResult.attachmentViewerData.get(
      "featureObjectIds"
    ) as __esri.Collection<number>;
    const stringifyObjectIds = JSON.stringify(featureObjectIds.slice().sort());
    const stringifyQueriedObjectIds = JSON.stringify(
      objectIdResult.objectIds.slice().sort()
    );

    if (stringifyObjectIds === stringifyQueriedObjectIds) {
      return;
    }
    this._settingUpAttachments = true;
    this.notifyChange("mapCentricState");
    this._handleQueryFeaturesLogic(featureObjectIds, objectIdResult);
  }

  // _handleQueryFeaturesLogic
  private _handleQueryFeaturesLogic(
    featureObjectIds: __esri.Collection<number>,
    objectIdResult: any
  ): void {
    featureObjectIds.removeAll();
    featureObjectIds.addMany([...objectIdResult.objectIds]);
    const featureObjectIdArr = featureObjectIds.slice();

    const attachmentsArr = featureObjectIdArr.map(objectId => {
      const attachments =
        objectIdResult &&
        objectIdResult.attachmentViewerData &&
        objectIdResult.attachmentViewerData.attachments &&
        objectIdResult.attachmentViewerData.attachments[`${objectId}`];
      return attachments
        ? {
            objectId,
            attachments
          }
        : {
            objectId,
            attachments: []
          };
    });

    const {
      layerData,
      attachmentDataCollection
    } = objectIdResult.attachmentViewerData;

    layerData.start = 0;

    const subsetFeatures = attachmentsArr
      .toArray()
      .slice(layerData.start, layerData.start + 24);
    attachmentDataCollection.removeAll();
    attachmentDataCollection.addMany([...subsetFeatures]);
  }

  // _handleAttachmentDataPromises
  private _handleAttachmentDataPromises(): void {
    Promise.all(this._attachmentDataPromises).then(promiseResults => {
      promiseResults.forEach(promiseResult => {
        const { res, attachmentViewerData } = promiseResult;
        this._handleAttachmentDataRes(res, attachmentViewerData);
      });
      let attachmentViewerData = null;
      if (this.selectedLayerId) {
        attachmentViewerData = this.attachmentViewerDataCollection.find(
          currentAttachmentViewerData => {
            return (
              currentAttachmentViewerData.layerData.featureLayer.id ===
              this.selectedLayerId
            );
          }
        ) as MapCentricData;
      } else {
        attachmentViewerData = this.attachmentViewerDataCollection.getItemAt(
          0
        ) as MapCentricData;
      }
      this.set("selectedAttachmentViewerData", attachmentViewerData);
      this._handleFeatureUpdate();
    });
  }

  //_handleFeatureUpdate
  private _handleFeatureUpdate(): void {
    if (this.defaultObjectId) {
      this._handleDefaultObjectId();
    }
  }

  // _handleSelectedSearchResult
  private _handleSelectedSearchResult(): void {
    const selectedResult = this.get(
      "searchWidget.selectedResult"
    ) as __esri.SearchResult;
    if (!selectedResult) {
      return;
    }

    if (
      selectedResult &&
      selectedResult.feature &&
      selectedResult.feature.layer &&
      selectedResult.feature.layer.id
    ) {
      if (this._highlightedFeatureMapCentric) {
        this._highlightedFeatureMapCentric.remove();
        this._highlightedFeatureMapCentric = null;
      }

      this._updateAttachmentViewerDataOnSearch(selectedResult);
      this.set("selectedAttachmentViewerData.attachmentIndex", 0);
      this._setFeatureMapCentric(selectedResult.feature);
    }
  }

  private _updateAttachmentViewerDataOnSearch(
    selectedResult: __esri.SearchResult
  ): void {
    const selectedResultLayerId = selectedResult.feature.layer.id as string;
    const selectedAttachmentViewerDataLayerId = this.get(
      "selectedAttachmentViewerData.layerData.featureLayer.id"
    ) as string;
    if (selectedResultLayerId !== selectedAttachmentViewerDataLayerId) {
      const updatedAttachmentViewerData = this.attachmentViewerDataCollection.find(
        attachmentViewerData => {
          return (
            selectedResultLayerId ===
            attachmentViewerData.layerData.featureLayer.id
          );
        }
      );

      if (!updatedAttachmentViewerData) {
        return;
      }

      this.set(
        "layerSwitcher.selectedLayer",
        updatedAttachmentViewerData.layerData.featureLayer
      );
      updatedAttachmentViewerData.set(
        "selectedFeature",
        selectedResult.feature
      );
    }
  }

  // _handleDefaultObjectId
  private _handleDefaultObjectId(): void {
    const handleDefaultObjectIdKey = "handle-default-object-id-key";
    this._mapCentricHandles.add(
      watchUtils.when(
        this,
        "selectedAttachmentViewerData.layerData.featureLayer",
        () => {
          this._mapCentricHandles.remove(handleDefaultObjectIdKey);
          if (!this.defaultObjectId) {
            return;
          }

          const featureLayer = this.get(
            "selectedAttachmentViewerData.layerData.featureLayer"
          ) as __esri.FeatureLayer;

          const queryFeatures = featureLayer.queryFeatures({
            outFields: ["*"],
            objectIds: [this.defaultObjectId],
            returnGeometry: true,
            outSpatialReference: this.view.spatialReference
          });

          queryFeatures
            .catch(err => {
              console.error("ERROR: ", err);
            })
            .then((featureSet: __esri.FeatureSet) => {
              this.defaultObjectId = null;
              if (
                featureSet &&
                featureSet.features &&
                !featureSet.features.length
              ) {
                return;
              }

              this.set(
                "selectedAttachmentViewerData.attachmentIndex",
                this.attachmentIndex
              );
              const feature = featureSet && featureSet.features[0];
              if (this.mapCentricTooltipEnabled) {
                this.view.popup.open({
                  features: [feature],
                  featureMenuOpen: false,
                  collapsed: true
                });
              } else {
                const layerView = this.get(
                  "selectedAttachmentViewerData.layerData.layerView"
                ) as __esri.FeatureLayerView;
                if (this._highlightedFeatureMapCentric) {
                  this._highlightedFeatureMapCentric.remove();
                  this._highlightedFeatureMapCentric = null;
                }
                this._highlightedFeatureMapCentric = layerView.highlight(
                  feature
                );
              }

              if (!feature) {
                return;
              }
              this._setFeatureMapCentric(feature);
            });
        }
      ),
      handleDefaultObjectIdKey
    );
  }

  // _handleAttachmentDataRes
  private _handleAttachmentDataRes(
    featureSet: __esri.FeatureSet,
    attachmentViewerData: MapCentricData
  ): void {
    const attachmentDataCollection = attachmentViewerData.get(
      "attachmentDataCollection"
    ) as __esri.Collection<AttachmentData>;
    attachmentDataCollection.removeAll();

    if (!featureSet) {
      return;
    }

    const graphics = featureSet.get("features") as __esri.Graphic[];
    const features = [];
    graphics.forEach((graphic: __esri.Graphic) => {
      const featureWidget = this._createFeatureWidget(graphic);
      features.push(featureWidget);
    });

    if (graphics.length === 0) {
      attachmentDataCollection.removeAll();
    } else {
      attachmentDataCollection.addMany(features);
    }
  }

  // _initFeatureContentCloseWatcher
  private _initFeatureContentCloseWatcher(): __esri.WatchHandle {
    return watchUtils.whenFalse(this, "featureContentPanelIsOpen", () => {
      const { attachmentIndex, defaultObjectId, sketchWidget } = this;
      if (attachmentIndex !== null) {
        this.set("attachmentIndex", null);
      }
      if (defaultObjectId !== null) {
        this.set("defaultObjectId", null);
      }
      const graphicsLength = this.get(
        "graphicsLayer.graphics.length"
      ) as number;
      if (sketchWidget && graphicsLength > 0) {
        return;
      }

      this.set("selectedAttachmentViewerData.objectIdIndex", null);
      this.set("selectedAttachmentViewerData.defaultObjectId", null);
      this.set("selectedAttachmentViewerData.attachmentIndex", 0);
      this.set(
        "selectedAttachmentViewerData.selectedFeatureAttachments.currentIndex",
        0
      );
      this.set("selectedAttachmentViewerData.selectedFeature", null);
      if (this.get("searchWidget.selectedResult")) {
        this.searchWidget.clear();
      }
      this._queryAllLayerData();
    });
  }

  // _initLayerSwitchWatcher
  private _initLayerSwitchWatcher(): __esri.WatchHandle {
    return watchUtils.whenOnce(this, "selectedAttachmentViewerData", () => {
      this._handleLayerSwitch();
    });
  }

  // _watchSelectedSearchResult
  private _watchSelectedSearchResult(): __esri.WatchHandle {
    return watchUtils.watch(this, "searchWidget.selectedResult", () => {
      this._handleSelectedSearchResult();
    });
  }

  // _handleLayerSwitch
  private _handleLayerSwitch(): void {
    this._mapCentricHandles.add(
      watchUtils.watch(this, "selectedAttachmentViewerData", () => {
        this._resetViewExtentOnDataChange();
      })
    );
  }

  // _resetViewExtentOnDataChange
  private _resetViewExtentOnDataChange(): void {
    const attachmentDataCollectionLength = this.get(
      "selectedAttachmentViewerData.attachmentDataCollection.length"
    ) as number;
    const target = this.get(
      "selectedAttachmentViewerData.layerData.featureLayer.fullExtent"
    ) as __esri.Extent;
    if (attachmentDataCollectionLength === 0) {
      this.view.goTo({
        target
      });
    }
  }

  // SET FEATURE METHODS
  // _setFeatureMapCentric
  private _setFeatureMapCentric(feature: __esri.Graphic): void {
    if (!feature) {
      return;
    }
    this.imageIsLoaded = false;
    this.set("selectedAttachmentViewerData.selectedFeature", feature);
    this._updateSelectedAttachmentViewerData(feature);
    this._handleFeatureWidget();
  }

  // _updateSelectedAttachmentViewerData
  private _updateSelectedAttachmentViewerData(feature: __esri.Graphic): void {
    const objectIdField = this.getObjectIdField();
    const objectId = feature.attributes[objectIdField];
    const featureObjectIds = this.get(
      "selectedAttachmentViewerData.featureObjectIds"
    ) as __esri.Collection<number>;
    const objectIdIndex =
      featureObjectIds && (featureObjectIds.indexOf(objectId) as number);
    this.set("selectedAttachmentViewerData.defaultObjectId", objectId);
    this.set("selectedAttachmentViewerData.objectIdIndex", objectIdIndex);
    this.set(
      "selectedAttachmentViewerData.selectedLayerId",
      this.selectedAttachmentViewerData.layerData.featureLayer.id
    );

    const attachmentIndex = this.attachmentIndex ? this.attachmentIndex : 0;
    this.set("selectedAttachmentViewerData.attachmentIndex", attachmentIndex);
  }

  // _handleFeatureWidget
  private _handleFeatureWidget(): void {
    const graphic = this.get(
      "selectedAttachmentViewerData.selectedFeature"
    ) as __esri.Graphic;
    if (!this.featureWidget) {
      this.featureWidget = this._createFeatureWidget(graphic);
    } else {
      this.featureWidget.graphic = graphic;
    }
    this.featureWidget.set("visibleElements.title", false);
    const featureWidgetKey = "feature-widget";
    this._mapCentricHandles.add(
      watchUtils.when(this, "featureWidget", () => {
        this._watchForFeatureContentLoad(featureWidgetKey);
      }),
      featureWidgetKey
    );
  }

  // _createFeatureWidget
  private _createFeatureWidget(graphic: __esri.Graphic): __esri.Feature {
    const spatialReference = this.get(
      "view.spatialReference"
    ) as __esri.SpatialReference;

    return new Feature({
      view: this.view,
      graphic,
      spatialReference
    });
  }

  // _watchForFeatureContentLoad
  private _watchForFeatureContentLoad(featureWidgetKey: string): void {
    const { _mapCentricHandles } = this;
    _mapCentricHandles.remove(featureWidgetKey);
    const featureWidgetContentKey = "feature-widget-content";
    _mapCentricHandles.add(
      watchUtils.whenFalse(
        this,
        "featureWidget.viewModel.waitingForContent",
        () => {
          this._handleFeatureWidgetContent(featureWidgetContentKey);
        }
      ),
      featureWidgetContentKey
    );
  }

  // _handleFeatureWidgetContent
  private _handleFeatureWidgetContent(featureWidgetContentKey: string): void {
    this._mapCentricHandles.remove(featureWidgetContentKey);
    this.setFeatureInfo(this.featureWidget);
    this._setFeatureAttachments();
  }

  // _setFeatureAttachments
  private _setFeatureAttachments(): void {
    const attachmentContentInfos = this._getAttachmentContentInfos() as __esri.AttachmentInfo[];
    const attachmentIndex = this.get(
      "selectedAttachmentViewerData.attachmentIndex"
    ) as number;

    const currentIndex = attachmentIndex !== null ? attachmentIndex : 0;
    const attachmentsArr =
      attachmentContentInfos && attachmentContentInfos.length > 0
        ? attachmentContentInfos
        : [];

    const sortedAttachments = this._sortFeatureAttachments(attachmentsArr);

    const attachments = new Collection([...sortedAttachments]);

    const selectedFeatureAttachments = new SelectedFeatureAttachments({
      attachments,
      currentIndex
    });

    this.set(
      "selectedAttachmentViewerData.selectedFeatureAttachments",
      selectedFeatureAttachments
    );
    this.imageIsLoaded = true;
    this.set("featureContentPanelIsOpen", true);
  }

  // _getAttachmentContentInfos
  private _getAttachmentContentInfos(): __esri.AttachmentInfo[] {
    const selectedAttachmentViewerData = this
      .selectedAttachmentViewerData as MapCentricData;
    if (
      selectedAttachmentViewerData &&
      selectedAttachmentViewerData.attachments
    ) {
      const selectedFeature = this.get(
        "selectedAttachmentViewerData.selectedFeature"
      ) as __esri.Graphic;

      const objectIdField = this.getObjectIdField();

      const objectId =
        selectedFeature && selectedFeature.attributes[objectIdField];
      const attachments =
        selectedAttachmentViewerData.attachments[`${objectId}`];
      return attachments;
    }
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
            ) as any;
            unsupportedAttachmentTypes.push(attachmentInfo);
          }
        });
    }
    return featureAttachments;
  }

  // _setupSocialSharing
  private _setupSocialSharing(): void {
    this.setupShare();
    this.sharePropIndexesWatcher();
  }

  //----------------------------------
  //
  //  End of Private Methods
  //
  //----------------------------------

  //----------------------------------
  //
  //  Public Methods
  //
  //----------------------------------

  // updateSelectedFeatureMapCentric
  updateSelectedFeatureMapCentric(graphic: __esri.Graphic) {
    this.set("selectedAttachmentViewerData.selectedFeature", graphic);
    this.setUpdateShareIndexes();
    this._setFeatureMapCentric(graphic);

    if (
      this.selectedAttachmentViewerData.selectedFeature &&
      this.addressEnabled
    ) {
      this.getAddress(graphic.geometry);
    }
  }

  // handleGalleryItem
  handleGalleryItem(objectId: number): void {
    const selectedFeatureLayer = this.get(
      "selectedAttachmentViewerData.layerData.featureLayer"
    ) as __esri.FeatureLayer;
    const objectIdField = selectedFeatureLayer.get("objectIdField");
    const query = selectedFeatureLayer.createQuery();
    query.where = `${objectIdField} = ${objectId}`;
    query.outSpatialReference = this.view.spatialReference;
    this._galleryItemPromise = selectedFeatureLayer
      .queryFeatures(query)
      .catch(err => {
        console.error("ERROR: ", err);
      })
      .then((featureSet: __esri.FeatureSet) => {
        if (!featureSet) {
          return;
        }
        this._galleryItemPromise = null;
        this.notifyChange("mapCentricState");
        const graphic = featureSet.features[0];
        this.updateSelectedFeatureMapCentric(graphic);
      });
    this.notifyChange("mapCentricState");
  }

  // updateAttachmentDataMapCentric
  updateAttachmentDataMapCentric(): void {
    const selectedAttachmentViewerData = this
      .selectedAttachmentViewerData as MapCentricData;
    if (!selectedAttachmentViewerData || this.mapCentricState === "querying") {
      return;
    }
    const layerData = selectedAttachmentViewerData.get(
      "layerData"
    ) as AttachmentViewerLayerData;

    const featureObjectIdsLength =
      selectedAttachmentViewerData.featureObjectIds.length;
    const attachmentDataCollectionLength =
      selectedAttachmentViewerData.attachmentDataCollection.length;

    if (featureObjectIdsLength < 24) {
      return;
    }

    if (attachmentDataCollectionLength < featureObjectIdsLength) {
      const featureObjectIdArr = selectedAttachmentViewerData.featureObjectIds.slice();
      const attachmentsArr = featureObjectIdArr.map(objectId => {
        const attachments =
          selectedAttachmentViewerData &&
          selectedAttachmentViewerData.attachments &&
          selectedAttachmentViewerData.attachments[`${objectId}`];
        return attachments
          ? {
              attachments,
              objectId
            }
          : {
              attachments: [],
              objectId
            };
      });

      let end = null;

      if (layerData.start === 0) {
        layerData.start = 24;
      } else {
        layerData.start = layerData.start + 24;
      }

      if (layerData.start > featureObjectIdsLength) {
        end = featureObjectIdsLength;
      } else {
        end = layerData.start + 24;
      }

      if (layerData.start < end) {
        const attachmentDataSubset = attachmentsArr
          .toArray()
          .slice(layerData.start, end);
        selectedAttachmentViewerData.attachmentDataCollection.addMany([
          ...attachmentDataSubset
        ]);
      }
    }
  }

  // // openTooltipPopup
  openTooltipPopup(event: Event): void {
    const node = event && (event.currentTarget as HTMLElement);
    const objectId = node && (node["data-object-id"] as string);

    const layerView = this.get(
      "selectedAttachmentViewerData.layerData.layerView"
    ) as __esri.FeatureLayerView;

    const outSpatialReference = this.get(
      "view.spatialReference"
    ) as __esri.SpatialReference;

    const geometry = this.get("view.extent");

    const queryPromise = layerView
      .queryFeatures({
        objectIds: [parseInt(objectId)],
        returnGeometry: true,
        outSpatialReference,
        geometry
      })
      .catch(err => {
        console.error("POPUP ERROR: ", err);
      });

    queryPromise.then((featureSet: __esri.FeatureSet) => {
      if (queryPromise === this._openToolTipPromise) {
        this._openToolTipPromise = null;
        this.notifyChange("mapCentricState");
        const features = featureSet.features;
        const graphic = features[0];
        if (!graphic) {
          return;
        }
        this._processSelectedFeatureIndicator(layerView, graphic, queryPromise);
      }
    });

    this._openToolTipPromise = queryPromise;
    this.notifyChange("mapCentricState");
  }

  // closeTooltipPopup
  closeTooltipPopup(): void {
    if (!this.featureContentPanelIsOpen) {
      if (this.mapCentricTooltipEnabled) {
        if (this.view && this.view.popup) {
          this.view.popup.clear();
          this.view.popup.close();
        }
      } else {
        if (this._highlightedFeatureMapCentric) {
          this._highlightedFeatureMapCentric.remove();
          this._highlightedFeatureMapCentric = null;
        }
      }
    }
  }

  // _processSelectedFeatureIndicator
  private _processSelectedFeatureIndicator(
    layerView: __esri.FeatureLayerView,
    graphic: __esri.Graphic,
    queryPromise?: IPromise,
    mapPoint?: __esri.Point
  ) {
    if (this.mapCentricTooltipEnabled) {
      const config = mapPoint
        ? {
            location: mapPoint,
            features: [graphic],
            featureMenuOpen: false,
            collapsed: true
          }
        : {
            features: [graphic],
            featureMenuOpen: false,
            collapsed: true
          };
      const popupConfigToOpen = queryPromise
        ? { ...config, promises: [queryPromise] }
        : config;
      this.view.popup.open(popupConfigToOpen);
    } else {
      if (this._highlightedFeatureMapCentric) {
        this._highlightedFeatureMapCentric.remove();
        this._highlightedFeatureMapCentric = null;
      }
      this._highlightedFeatureMapCentric = layerView.highlight(graphic);
    }
  }

  // getCurrentAttachment
  getCurrentAttachment(): __esri.AttachmentInfo {
    const attachments = this.get(
      "selectedAttachmentViewerData.selectedFeatureAttachments.attachments"
    ) as __esri.Collection<__esri.AttachmentInfo>;
    const attachmentIndex = this.get(
      "selectedAttachmentViewerData.attachmentIndex"
    ) as number;
    return attachments && attachments.length > 0
      ? attachments.getItemAt(attachmentIndex)
        ? attachments.getItemAt(attachmentIndex)
        : null
      : null;
  }

  // getHyperLink
  getHyperLink(contentInfo: any): string {
    const expression = /(http|ftp|https)(:\/\/)([\w_-]+(?:(?:\.[\w_-]+)+))([\w.,@?^=%&:/~+#-]*[\w@?^=%&/~+#-])?/;
    const regex = new RegExp(expression);

    const content = contentInfo && contentInfo.content;
    return content &&
      content.match &&
      content.match(regex) &&
      content.match(regex).length > 0
      ? content.match(regex)[0]
      : null;
  }

  // getAttachentLoadState
  getAttachentLoadState(): any {
    const attachments = this.get(
      "selectedAttachmentViewerData.selectedFeatureAttachments.attachments"
    ) as __esri.Collection<__esri.AttachmentInfo>;
    const attachment = this.getCurrentAttachment();
    return (
      attachment &&
      attachment.contentType &&
      attachment.contentType.indexOf("pdf") === -1 &&
      attachment.contentType.indexOf("video") === -1 &&
      attachments
    );
  }

  // updateAttachmentUrlToHTTPS
  updateAttachmentUrlToHTTPS(attachmentUrl: string): string {
    if (!attachmentUrl) {
      return;
    }
    const featureLayer = this.selectedAttachmentViewerData.get(
      "layerData.featureLayer"
    ) as __esri.FeatureLayer;
    const parentPortalUrl =
      featureLayer &&
      (featureLayer.get("parent.portalItem.portal.url") as string);
    const portalUrl =
      featureLayer && (featureLayer.get("portalItem.portal.url") as string);
    const portalIsHTTPS =
      (portalUrl && portalUrl.indexOf("https") !== -1) ||
      (parentPortalUrl && parentPortalUrl.indexOf("https") !== -1);

    if (
      portalIsHTTPS &&
      attachmentUrl &&
      attachmentUrl.indexOf("https") === -1
    ) {
      return attachmentUrl.replace(/^http:\/\//i, "https://");
    }
    return attachmentUrl;
  }

  // zoomToMapCentric
  zoomToMapCentric(): void {
    const scale = this.zoomLevel ? parseInt(this.zoomLevel) : (32000 as number);
    const target = this.get(
      "selectedAttachmentViewerData.selectedFeature"
    ) as __esri.Graphic;
    this.view
      .goTo({
        target,
        scale
      })
      .then(() => {
        this._queryAllLayerData();
      });
  }

  // getObjectIdField
  getObjectIdField(): string {
    return this.get(
      "selectedAttachmentViewerData.layerData.featureLayer.objectIdField"
    );
  }

  // getAttachments
  getAttachments(): __esri.Collection<__esri.AttachmentInfo> {
    return this.get(
      "selectedAttachmentViewerData.selectedFeatureAttachments.attachments"
    );
  }
}

export = MapCentricViewModel;
