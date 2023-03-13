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

import { subclass, property } from "@arcgis/core/core/accessorSupport/decorators";

import Handles from "@arcgis/core/core/Handles";
import Collection from "@arcgis/core/core/Collection";
import { watch, when } from "@arcgis/core/core/reactiveUtils";

import Feature from "@arcgis/core/widgets/Feature";

import Query from "@arcgis/core/rest/support/Query";
import AttachmentQuery from "@arcgis/core/rest/support/AttachmentQuery";

import FeatureEffect from "@arcgis/core/layers/support/FeatureEffect";
import FeatureFilter from "@arcgis/core/layers/support/FeatureFilter";

import AttachmentViewerViewModel from "../AttachmentViewer/AttachmentViewerViewModel";
import AttachmentViewerLayerData from "../AttachmentViewer/AttachmentViewerLayerData";
import MapCentricData from "./MapCentricData";
import SelectedFeatureAttachments from "../AttachmentViewer/SelectedFeatureAttachments";

import { removeAttachmentsContent } from "../../utils/layerUtils";

import {
  AttachmentData,
  MapCentricLayerViewPromise,
  MapCentricAttachmentDataPromise,
  LayerSelectorOutput,
  LayerSelectorFieldsObj
} from "../../interfaces/interfaces";
import LayerData from "../AttachmentViewer/AttachmentViewerLayerData";

import esriRequest from "@arcgis/core/request";

import { prefersReducedMotion } from "templates-common-library/structuralFunctionality/a11yUtils";
import LayerSwitcher from "../LayerSwitcher";

type MapCentricState = "ready" | "querying" | "loading" | "disabled" | "waitingForContent";

@subclass("MapCentricViewModel")
class MapCentricViewModel extends AttachmentViewerViewModel {
  private _mapCentricHandles: Handles | null = new Handles();
  private _performingHitTestMapCentric = false;
  private _layerLoadPromises: Promise<__esri.FeatureLayer>[] = [];
  private _layerViewPromises: Array<Promise<MapCentricLayerViewPromise>> | undefined = [];
  private _objectIdPromises: Array<Promise<{ attachmentViewerData: MapCentricData; objectIds: number[] }>> = [];
  private _attachmentDataPromises: Array<Promise<MapCentricAttachmentDataPromise>> = [];
  private _settingUpAttachments = false;
  private _openToolTipPromise: Promise<void | __esri.FeatureSet> | null = null;
  private _galleryItemPromise: boolean = false;
  private _scrollQueryInProgress = false;
  private _queryAttachmentCountPromises: Promise<{ objectIds: number[]; attachmentViewerData: MapCentricData }>[] = [];
  private _timeoutId: NodeJS.Timeout | null;

  @property({
    dependsOn: ["view.ready", "featureWidget.viewModel.waitingForContent"],
    readOnly: true
  })
  get mapCentricState(): MapCentricState {
    const { view } = this;
    const waitingForContent = this.get("featureWidget.viewModel.waitingForContent");
    const { _settingUpAttachments, _galleryItemPromise, _performingHitTestMapCentric } = this;
    return view?.ready
      ? _settingUpAttachments || _galleryItemPromise || _performingHitTestMapCentric
        ? "querying"
        : waitingForContent
        ? "waitingForContent"
        : "ready"
      : view
      ? "loading"
      : "disabled";
  }

  @property()
  attachmentLayer: LayerSelectorFieldsObj | null = null;

  @property()
  attachmentLayers: LayerSelectorOutput | null = null;

  @property()
  attachmentIndex: number | null = null;

  @property()
  currentImageUrl: string | null = null;

  @property()
  defaultObjectId: number | null = null;

  @property()
  featureContentPanelIsOpen = false;

  @property()
  highlightedFeature: any = null;

  @property()
  mapCentricSketchQueryExtent: __esri.Extent | null = null;

  @property()
  mapCentricTooltipEnabled: boolean | null = null;

  @property()
  order: string | null = null;

  @property()
  imageDirectionEnabled: boolean | null = null;

  initialize() {
    this._initLayers();
    this._initSocialShare();
    this._initMapCentricHandles();
    this._mapCentricHandles?.add([
      watch(
        () => this.relatedFeatures?.selectedFeature,
        async () => {
          if (!this.relatedFeatures?.selectedFeature || !this.relatedFeatures?.destinationLayer) {
            return;
          }

          this.set("layerSwitcher.selectedLayer", this.relatedFeatures.destinationLayer);

          const avData = this.attachmentViewerDataCollection.find(
            (avDataItem) => avDataItem?.layerData?.featureLayer?.id === this.relatedFeatures?.destinationLayer?.id
          ) as MapCentricData;

          const featureLayer = avData?.layerData?.featureLayer;
          try {
            const graphic = this.relatedFeatures.selectedFeature;

            if (graphic && featureLayer?.objectIdField) {
              const oid = graphic.attributes[featureLayer?.objectIdField as string];
              this.handleGalleryItem(oid, avData);

              this._setLayerFromHitTestResult(
                avData?.layerData?.featureLayer?.id as string,
                this.relatedFeatures.destinationLayer
              );

              avData.set("selectedFeature", graphic);
            }
          } catch (err) {
            console.error("error: ", err);
          }
        }
      ),
      watch(
        () => this.mapCentricTooltipEnabled,
        () => {
          if (!this.view?.popup) return;
          this.view.popup.autoOpenEnabled = this.mapCentricTooltipEnabled as boolean;
          if (!this.mapCentricTooltipEnabled) this._closeMapCentricTooltip();
        }
      ),
      when(
        () => this.view?.animation,
        () =>
          this.view?.animation.when(() =>
            when(
              () => this.view?.stationary,
              () => this._queryAllLayerData(),
              { once: true, initial: true }
            )
          )
      )
    ]);
  }

  destroy() {
    if (this.highlightedFeature) {
      this.highlightedFeature.remove();
      this.highlightedFeature = null;
    }
    this._mapCentricHandles?.removeAll();
    this._mapCentricHandles?.destroy();
    this._mapCentricHandles = null;
  }

  // PUBLIC METHODS
  async handleGalleryItem(objectId: number, avData: MapCentricData): Promise<void> {
    const selectedFeatureLayer = avData.get("layerData.featureLayer") as __esri.FeatureLayer;
    const objectIdField = selectedFeatureLayer.get("objectIdField");
    const query = selectedFeatureLayer.createQuery();
    query.where = `${objectIdField} = ${objectId}`;
    query.outSpatialReference = this.view?.spatialReference as __esri.SpatialReference;
    this._galleryItemPromise = true;
    this.notifyChange("mapCentricState");
    try {
      const featureSet = await selectedFeatureLayer.queryFeatures(query);
      const graphic = featureSet.features[0];
      this.updateSelectedFeature(graphic);
    } catch (err) {
      console.error("ERROR: ", err);
    } finally {
      this._galleryItemPromise = false;
      this.notifyChange("mapCentricState");
    }
  }

  getCurrentAttachment(): __esri.AttachmentInfo | null | undefined {
    const { selectedAttachmentViewerData } = this;
    if (!selectedAttachmentViewerData) {
      return;
    }
    const { attachmentIndex } = selectedAttachmentViewerData;
    const attachments = selectedAttachmentViewerData.get(
      "selectedFeatureAttachments.attachments"
    ) as __esri.Collection<__esri.AttachmentInfo>;
    return attachments?.length > 0 ? attachments.getItemAt(attachmentIndex) : null;
  }

  getAttachentLoadState(): any {
    const attachments = this.get("selectedAttachmentViewerData.selectedFeatureAttachments.attachments");
    const attachment = this.getCurrentAttachment();
    const contentType = attachment?.contentType;
    return attachments && contentType?.indexOf("pdf") === -1 && contentType?.indexOf("video") === -1;
  }

  updateAttachmentUrlToHTTPS(attachmentUrl: string): string | undefined {
    if (!attachmentUrl) {
      return;
    }
    const { selectedAttachmentViewerData } = this;
    const featureLayer = selectedAttachmentViewerData?.get("layerData.featureLayer") as __esri.FeatureLayer;
    const parentPortalUrl = featureLayer?.get("parent.portalItem.portal.url") as string;
    const portalUrl = featureLayer.get("portalItem.portal.url") as string;
    const portalIsHTTPS =
      (portalUrl && portalUrl.indexOf("https") !== -1) || (parentPortalUrl && parentPortalUrl.indexOf("https") !== -1);

    if (portalIsHTTPS && attachmentUrl && attachmentUrl.indexOf("https") === -1) {
      return attachmentUrl.replace(/^http:\/\//i, "https://");
    }
    return attachmentUrl;
  }

  updateSelectedFeature(graphic: __esri.Graphic): void {
    this.set("selectedAttachmentViewerData.selectedFeature", graphic);
    if (this.socialSharingEnabled) {
      this.setUpdateShareIndexes();
    }
    this._setFeature(graphic);
    this._updateAddress(graphic);
  }

  async updateAttachmentData(): Promise<void> {
    if (this._scrollQueryInProgress) {
      return;
    }
    this._scrollQueryInProgress = true;
    this.notifyChange("mapCentricState");
    const selectedAttachmentViewerData = this.selectedAttachmentViewerData as MapCentricData;
    if (!selectedAttachmentViewerData || this.mapCentricState === "querying") {
      this._scrollQueryInProgress = false;
      this.notifyChange("mapCentricState");
      return;
    }
    const layerData = selectedAttachmentViewerData.get("layerData") as AttachmentViewerLayerData;

    const { featureObjectIds, attachmentDataCollection } = selectedAttachmentViewerData;
    const featureObjectIdsLength = featureObjectIds.length;
    const attachmentDataCollectionLength = attachmentDataCollection.length;

    if (featureObjectIdsLength < 24) {
      this._scrollQueryInProgress = false;
      this.notifyChange("mapCentricState");
      return;
    }

    if (attachmentDataCollectionLength < featureObjectIdsLength) {
      let end: number | null = null;

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

      const { featureObjectIds, attachments } = selectedAttachmentViewerData;

      const queriedAttachments = await this._handleAttachmentsQuery(layerData, featureObjectIds, layerData.start);

      const updatedAttachmentsVal = {
        ...attachments,
        ...queriedAttachments
      };

      selectedAttachmentViewerData.attachments = updatedAttachmentsVal;

      const featureObjectIdArr = featureObjectIds.slice();

      const attachmentsArr = featureObjectIdArr.map((objectId) => {
        const featureAttachments = updatedAttachmentsVal?.[`${objectId}`];
        return featureAttachments
          ? {
              attachments: featureAttachments,
              objectId
            }
          : {
              attachments: [],
              objectId
            };
      });

      if (layerData.start < end) {
        const attachmentDataSubset = attachmentsArr.toArray().slice(layerData.start, end);
        selectedAttachmentViewerData.attachmentDataCollection.addMany([...attachmentDataSubset]);
      }
    }
    this._scrollQueryInProgress = false;
    this.notifyChange("mapCentricState");
  }

  async openTooltipPopup(event: Event): Promise<void> {
    let layerView = this.get("selectedAttachmentViewerData.layerData.layerView") as __esri.FeatureLayerView;
    const featureLayer = this.selectedAttachmentViewerData?.layerData?.featureLayer as __esri.FeatureLayer;
    const destLayer = this.relatedFeatures?.viewModel?.getRelatedDestinationLayer(featureLayer) as __esri.FeatureLayer;
    if (!layerView && !destLayer) {
      return;
    }

    const node = event && (event.currentTarget as HTMLElement);
    let objectId = node?.getAttribute("data-object-id") as string;

    const destLayerData = this.attachmentViewerDataCollection.find(
      (avData) => avData?.layerData?.featureLayer?.id === destLayer?.id
    );

    if (destLayerData?.layerData?.layerView) {
      layerView = destLayerData.layerData.layerView;
      const relationshipId = this.relatedFeatures?.viewModel?.getRelationshipId(destLayer, featureLayer);
      const destRelatedFeatures =
        await this.selectedAttachmentViewerData?.layerData?.featureLayer?.queryRelatedFeatures({
          objectIds: [parseInt(objectId)],
          returnGeometry: true,
          outFields: ["*"],
          relationshipId
        });
      const relatedFeatureOIDs = this.relatedFeatures?.viewModel?.getRelatedFeatureOIDs(
        destRelatedFeatures,
        destLayer.objectIdField
      );
      objectId = `${relatedFeatureOIDs?.[0]}`;
    }

    const outSpatialReference = this.get("view.spatialReference") as __esri.SpatialReference;

    const geometry = this.get("view.extent");

    const queryPromise = layerView
      .queryFeatures({
        objectIds: [parseInt(objectId)],
        returnGeometry: true,
        outSpatialReference,
        geometry: geometry as __esri.Extent
      })
      .catch((err) => {
        console.error("POPUP ERROR: ", err);
      });

    queryPromise.then((featureSet: __esri.FeatureSet | void) => {
      if (queryPromise === this._openToolTipPromise) {
        this._openToolTipPromise = null;
        this.notifyChange("mapCentricState");
        const features = featureSet?.features;
        const graphic = features && features[0];
        if (!graphic) {
          return;
        }
        this._processSelectedFeatureIndicator(layerView, graphic, queryPromise);
      }
    });

    this._openToolTipPromise = queryPromise;
    this.notifyChange("mapCentricState");
  }

  closeTooltipPopup(): void {
    if (!this.featureContentPanelIsOpen) {
      if (this.mapCentricTooltipEnabled && this.view?.popup) this._closeMapCentricTooltip();
      this._removeFeatureHighlight();
    }
  }

  isHyperlink(contentInfo: any) {
    const content = contentInfo?.content;
    const regex = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;
    return content ? regex.test(content) : null;
  }

  async zoomTo(): Promise<void> {
    const { zoomLevel, selectedAttachmentViewerData, view } = this;
    const scale = zoomLevel ? parseInt(zoomLevel) : (32000 as number);
    let target = selectedAttachmentViewerData?.get("selectedFeature") as __esri.Graphic;
    const relatedOriginFeature = await this.relatedFeatures?.viewModel?.getRelatedOriginFeature(target);
    if (relatedOriginFeature) {
      target = relatedOriginFeature;
    }
    try {
      await view?.goTo(
        {
          target,
          scale
        },
        { animate: prefersReducedMotion() ? false : true }
      );
    } catch (err) {
      console.error("ERROR: ", err);
    } finally {
      this._queryAllLayerData();
    }
  }

  getObjectIdField(graphic: __esri.Graphic): string {
    return graphic?.get("layer.objectIdField");
  }

  getAttachments(): __esri.Collection<__esri.AttachmentInfo> {
    return this.get("selectedAttachmentViewerData.selectedFeatureAttachments.attachments");
  }
  // END OF PUBLIC METHODS

  private _initLayers(): void {
    this._handleLayerInitialization();
  }

  private _handleLayerInitialization(): void {
    when(
      () => this.view?.ready,
      () => {
        if (this.view) this.view.padding.bottom = 0;
        if (this._mapCentricHandles?.has("clickHandle")) this._mapCentricHandles?.remove("clickHandle");
        this._mapCentricHandles?.add(this._handleFeatureClickEvent() as __esri.WatchHandle, "clickHandle");
        this._watchFeatureLayerCollection();
      },
      { once: true, initial: true }
    );
  }

  private _handleFeatureClickEvent(): __esri.WatchHandle | undefined {
    return this.view?.on("click", async (event) => {
      const { appMode, state, view } = this;
      if (appMode === "photo-centric" || state !== "ready") {
        return;
      }
      this._performingHitTestMapCentric = true;
      this.notifyChange("mapCentricState");
      try {
        const hitTestRes = await view?.hitTest(event);
        const mapPoint = event?.mapPoint;
        this._handleHitTestRes(hitTestRes as __esri.HitTestResult, mapPoint);
      } catch (err) {
        console.error("ERROR: ", err);
      } finally {
        this._performingHitTestMapCentric = false;
        this.notifyChange("mapCentricState");
      }
    });
  }

  private _watchFeatureLayerCollection(): void {
    when(
      () => this.layerSwitcher?.featureLayerCollection?.length,
      () => {
        this.layerSwitcher?.featureLayerCollection?.forEach((featureLayer) => {
          this._layerLoadPromises.push(featureLayer.load() as Promise<__esri.FeatureLayer>);
        });
        this._handleLayerLoadPromises();
      },
      { once: true }
    );
  }

  private _handleHitTestRes(hitTestRes: __esri.HitTestResult, mapPoint: __esri.Point): void {
    const { results } = hitTestRes;
    const { attachmentViewerDataCollection } = this;

    // GET LAYER IDS FROM AV DATA COLLECTION
    const layerIds = attachmentViewerDataCollection.slice().map((attachmentViewerData) => {
      return attachmentViewerData.selectedLayerId;
    });

    // GET RESULTS THAT BELONG TO EITHER
    // GRAPHICS LAYER FROM SKETCH
    // OR
    // LOADED LAYERS IN APP
    const filteredResults = results?.filter((result) => {
      // @ts-ignore
      const { id } = result.graphic.layer;
      const { graphicsLayer } = this;
      return layerIds.indexOf(id) !== -1 || graphicsLayer?.id === id;
    });

    // IF NOT RESULTS RESET THE HIT TEST AND EXIT
    if (!filteredResults || filteredResults?.length === 0) {
      this._resetHitTest();
      return;
    }

    // GET FIRST RETURNED RESULT
    const result = filteredResults[0];
    // @ts-ignore
    const { graphic } = result;

    // GET RELATED AV DATA FROM COLLECTION
    const avData = attachmentViewerDataCollection.find((avDataFromCollection) => {
      const id = avDataFromCollection?.layerData?.featureLayer?.id;
      return id === graphic.layer.id;
    }) as MapCentricData;

    // IF NOT AV DATA EXISTS - EXIT
    if (!avData) {
      this._resetHitTest();
      return;
    }

    // IF SELECT FEATURES ENABLED - ONLY GET FEATURES WITHIN POLYGON
    if (this.mapCentricSketchQueryExtent) {
      const containsPoint = this._getMapPointContains(result);
      if (!containsPoint) {
        this._resetHitTest();
        return;
      }

      const sketchWidgetViewModel = this.sketchWidget?.viewModel;
      // @ts-ignore
      if (result.graphic.layer === this.sketchWidget.viewModel.layer) {
        // @ts-ignore
        sketchWidgetViewModel.update([result.graphic], { tool: "transform" });
      }
    }

    const { selectedAttachmentViewerData } = this;
    const selectedFeature = selectedAttachmentViewerData?.selectedFeature;
    const layerData = selectedAttachmentViewerData?.layerData;

    // ONCE WE HAVE RESULT FROM HIT TEST - ARTIFICIALLY HANDLE FEATURE CONTENT PANEL
    if (graphic?.layer?.type !== "feature") return;
    const fLayer = graphic.layer as __esri.FeatureLayer;
    if (graphic && fLayer?.objectIdField) {
      this.handleGalleryItem(graphic.attributes[fLayer.objectIdField], avData);
    }

    const { layer } = graphic;
    const featureLayerFromResGraphic = layer.type === "feature" ? (layer as __esri.FeatureLayer) : null;

    if (!featureLayerFromResGraphic) {
      return;
    }

    const selectedAvDataLayerId = layerData?.get("featureLayer.id") as string;

    // IF HIT TEST RESULT MATCHES CURRENTLY SELECTED FEATURE - EXIT
    if (result && selectedFeature) {
      const layerIdFromGraphic = featureLayerFromResGraphic?.id;
      const resultAttributes = graphic?.attributes;
      const selectedFeatureAttributes = selectedFeature?.attributes;

      const objectIdField = this.getObjectIdField(selectedFeature);

      if (
        layerIdFromGraphic === selectedAvDataLayerId &&
        resultAttributes &&
        selectedFeatureAttributes &&
        resultAttributes[objectIdField] === selectedFeatureAttributes[objectIdField]
      ) {
        this._resetHitTest();
        return;
      }
    }

    this._setLayerFromHitTestResult(selectedAvDataLayerId, featureLayerFromResGraphic);

    this._setClickedFeature(hitTestRes, avData, mapPoint);
    this._resetHitTest();
  }

  private _resetHitTest(): void {
    this._performingHitTestMapCentric = false;
    this.notifyChange("mapCentricState");
  }

  private _getMapPointContains(result: any): boolean | undefined {
    return this.mapCentricSketchQueryExtent?.contains(result.mapPoint);
  }

  private _setLayerFromHitTestResult(avDataId: string, resultLayerFromGraphic: __esri.FeatureLayer): void {
    if (resultLayerFromGraphic.id !== avDataId) {
      this.set("layerSwitcher.selectedLayer", resultLayerFromGraphic);
    }
  }

  private _setClickedFeature(
    hitTestRes: __esri.HitTestResult,
    attachmentViewerData: MapCentricData,
    mapPoint: __esri.Point
  ): void {
    const { layerData } = attachmentViewerData;
    const featureLayer = layerData?.featureLayer;
    const layerView = layerData?.layerView;
    const filtereResults = hitTestRes.results.filter((result) => {
      // @ts-ignore
      const { layer } = result.graphic;
      return layer.id === featureLayer?.id;
    });
    // @ts-ignore
    const graphic = filtereResults?.[0].graphic;
    this._processSelectedFeatureIndicator(layerView as __esri.FeatureLayerView, graphic, null, mapPoint);
    attachmentViewerData.set("selectedFeature", graphic);
    if (this.socialSharingEnabled) {
      this.setUpdateShareIndexes();
    }
    this._setFeature(graphic);
    this._updateAddress(graphic);
  }

  private _updateAddress(graphic: __esri.Graphic): void {
    const geometry = graphic?.geometry;
    if (geometry) {
      this.set("selectedAttachmentViewerData.selectedFeatureAddress", null);
      this.getAddress(geometry);
    }
  }

  private async _handleLayerLoadPromises(): Promise<void> {
    try {
      const promiseResults = await Promise.all(this._layerLoadPromises);
      promiseResults.forEach((featureLayer: __esri.FeatureLayer) => {
        if (!featureLayer) {
          return;
        }
        const supportsAttachment = featureLayer.get("capabilities.data.supportsAttachment");

        if (!supportsAttachment || featureLayer.type !== "feature") {
          return;
        }

        removeAttachmentsContent(featureLayer);

        if (featureLayer.isTable) {
          const tablePromise = new Promise((resolve) => {
            setTimeout(() => {
              resolve({
                featureLayer,
                layerView: null
              });
            }, 100);
          });
          this._layerViewPromises?.push(
            tablePromise.then((res: any) => {
              return res;
            })
          );
        } else {
          this._layerViewPromises?.push(
            this.view
              ?.whenLayerView(featureLayer)
              .catch((err) => {
                console.error("ERROR: ", err);
              })
              .then((layerView: __esri.FeatureLayerView | void) => {
                return {
                  featureLayer,
                  layerView
                };
              }) as any
          );
        }
      });
      this._handleLayerViewLoadPromises();
    } catch (err) {
      console.error("ERROR: ", err);
    }
  }

  private async _handleLayerViewLoadPromises(): Promise<void> {
    try {
      const layerViewPromiseResults = await Promise.all(this._layerViewPromises as any);

      layerViewPromiseResults.forEach((layerViewPromiseResult: MapCentricLayerViewPromise) => {
        this._handleLayerViewLoad(layerViewPromiseResult);
      });
      this._queryAllLayerData();
    } catch (err) {
      console.error("ERROR: ", err);
    }
  }

  private _handleLayerViewLoad(layerViewPromiseResult: MapCentricLayerViewPromise): void {
    const { layerView, featureLayer } = layerViewPromiseResult;
    const attachmentViewerData = this._createAttachmentViewerData(featureLayer, layerView as __esri.FeatureLayerView);
    this._storeFeatureSortFields(featureLayer, attachmentViewerData);
    this.attachmentViewerDataCollection.add(attachmentViewerData);
  }

  private _createAttachmentViewerData(featureLayer: __esri.FeatureLayer, layerView: __esri.LayerView): MapCentricData {
    const layerData = new AttachmentViewerLayerData({
      featureLayer,
      layerView
    });

    const { definitionExpression } = featureLayer;
    const selectedLayerId = featureLayer.id;

    return new MapCentricData({
      definitionExpression,
      layerData,
      selectedLayerId
    });
  }

  private _storeFeatureSortFields(featureLayer: __esri.FeatureLayer, attachmentViewerData: MapCentricData): void {
    const { attachmentLayers } = this;
    const layers = attachmentLayers?.layers;
    const objectIdField = attachmentViewerData?.layerData?.featureLayer?.objectIdField;

    if ((layers?.length as number) > 0) {
      layers?.forEach((currentAttachmentLayer) => {
        const { fields, id } = currentAttachmentLayer;
        const sortField = fields?.length > 0 && fields[0];
        const hasValidSortField = id === featureLayer.id && sortField;
        attachmentViewerData.set("sortField", hasValidSortField ? sortField : objectIdField);
      });
    } else {
      attachmentViewerData.set("sortField", objectIdField);
    }
  }

  private _initSocialShare(): void {
    when(
      () => this.selectedAttachmentViewerData,
      () => {
        if (this.socialSharingEnabled) {
          this._setupSocialSharing();
        }

        if (this.mapCentricTooltipEnabled) {
          const popup = this.view?.popup;
          popup?.set("defaultPopupTemplateEnabled", true);
          popup?.set("dockOptions.buttonEnabled", false);
          popup?.set("visibleElements.featureNavigation", false);
          popup?.set("collapseEnabled", false);
          popup?.set("highlightEnabled", true);
          popup?.actions.removeAll();
        }
      },
      { once: true, initial: true }
    );
  }

  private _initMapCentricHandles(): void {
    this._mapCentricHandles?.add([
      watch(
        () => this.appMode,
        () => this._removeFeatureHighlight()
      ),
      watch(
        () => this.selectFeaturesEnabled,
        () => {
          this._initSketchWatchers();
        },
        { initial: true }
      ),
      watch(
        () => !this.selectFeaturesEnabled,
        () => {
          this._queryAllLayerData();
        },
        { initial: true }
      ),
      this._initQueryFeaturesOnStationaryWatcher(),
      this._initFeatureContentCloseWatcher(),
      this._watchSelectedSearchResult()
    ]);
  }

  // Feature selection methods
  private _initSketchWatchers(): void {
    const sketchWidgetInitKey = "sketch-widget-init";
    this._mapCentricHandles?.add(
      when(
        () => this.sketchWidget,
        () => this._handleSketchWidgetLoad(sketchWidgetInitKey)
      ),
      sketchWidgetInitKey
    );
  }

  private _handleSketchWidgetLoad(sketchWidgetInitKey: string): void {
    this._mapCentricHandles?.remove(sketchWidgetInitKey);
    this._watchSketchCreateAndUpdate();
    this._watchSketchDelete(this.sketchWidget as __esri.Sketch);
  }

  private _watchSketchCreateAndUpdate(): void {
    const { sketchWidget, graphicsLayer, appMode } = this;
    const createUpdateKey = "create-update-key";
    this._mapCentricHandles?.remove(createUpdateKey);
    this._mapCentricHandles?.add(
      [
        sketchWidget?.on("create", (sketchEvent: __esri.SketchCreateEvent) => {
          if (appMode === "photo-centric") {
            return;
          }
          this._handleSketchEvent(sketchEvent, graphicsLayer as __esri.GraphicsLayer);
        }) as __esri.WatchHandle,
        sketchWidget?.on("update", (sketchEvent: __esri.SketchUpdateEvent) => {
          if (appMode === "photo-centric") {
            return;
          }
          this._handleSketchEvent(sketchEvent, graphicsLayer as __esri.GraphicsLayer);
        }) as __esri.WatchHandle
      ],
      createUpdateKey
    );
  }

  private _watchSketchDelete(sketchWidget: __esri.Sketch): void {
    this._mapCentricHandles?.add(
      sketchWidget.on("delete", () => {
        const { appMode, attachmentViewerDataCollection } = this;
        if (appMode === "photo-centric") {
          return;
        }
        this.set("mapCentricSketchQueryExtent", null);
        this._queryAllLayerData();
        attachmentViewerDataCollection.forEach((attachmentViewerData) => {
          attachmentViewerData.set("layerData.layerView.featureEffect", null);
        });
      })
    );
  }

  private _handleSketchEventDebounce(sketchEvent: any) {
    if (sketchEvent?.aborted) return;
    if (this._timeoutId) clearTimeout(this._timeoutId);
    this._timeoutId = setTimeout(() => {
      this._timeoutId = null;
      let geometry: __esri.Geometry | null = null;
      if (sketchEvent.type === "update") {
        const event = sketchEvent as __esri.SketchUpdateEvent;
        geometry = event.graphics[0].geometry;
      } else {
        const event = sketchEvent as __esri.SketchCreateEvent;
        geometry = event.graphic.geometry;
      }
      this.set("mapCentricSketchQueryExtent", geometry);
      this._queryAllLayerData(geometry as __esri.Geometry);
    }, 500);
  }

  private _handleSketchEvent(
    sketchEvent: __esri.SketchCreateEvent | __esri.SketchUpdateEvent,
    graphicsLayer: __esri.GraphicsLayer
  ): void {
    const { type, state } = sketchEvent;
    if (type === "create" && (state === "active" || state === "start")) {
      graphicsLayer.graphics.removeAt(0);
    }
    if (state === "complete" || state === "active") {
      this._handleSketchEventDebounce(sketchEvent);
    }
  }

  private _handleSketchFeatureEffect(
    geometry: __esri.Extent | __esri.Geometry,
    attachmentViewerData: MapCentricData
  ): void {
    const layerView = attachmentViewerData.get("layerData.layerView") as __esri.FeatureLayerView;

    const featureEffect = new FeatureEffect({
      filter: {
        geometry
      },
      excludedEffect: "grayscale(100%) opacity(50%)"
    });
    layerView.featureEffect = featureEffect;
  }
  // End of feature selection methods

  private _initQueryFeaturesOnStationaryWatcher(): __esri.WatchHandle {
    return when(
      () => this.view?.stationary,
      () => this._queryOnStationary()
    );
  }

  private _queryOnStationary(): void {
    const { selectedAttachmentViewerData, sketchWidget, graphicsLayer, featureContentPanelIsOpen, view } = this;

    if (!selectedAttachmentViewerData) {
      return;
    }
    if ((sketchWidget && graphicsLayer?.get("graphics.length")) || featureContentPanelIsOpen) {
      return;
    }

    if (!view?.stationary) {
      if (this.view?.animation?.state === "running") return;
      when(
        () => this.view?.stationary,
        () => this._queryAllLayerData(),
        { once: true, initial: true }
      );
    } else {
      when(
        () => !this.view?.interacting,
        () => this._queryAllLayerData(),
        { once: true, initial: true }
      );
    }
  }

  private _queryAllLayerData(sketchGeometry?: __esri.Extent | __esri.Geometry): void {
    if (this._scrollQueryInProgress) {
      this._scrollQueryInProgress = false;
      this.notifyChange("mapCentricState");
    }

    const { view } = this;

    if (!view) {
      return;
    }

    const geometry = sketchGeometry ? sketchGeometry : (view.get("extent") as __esri.Extent);
    const outSpatialReference = view.get("spatialReference") as __esri.SpatialReference;
    this._objectIdPromises = [];
    this._attachmentDataPromises = [];
    const isSketch = sketchGeometry ? true : false;
    this._queryObjectIds(geometry, outSpatialReference, isSketch);
  }

  private _queryObjectIds(
    geometry: __esri.Extent | __esri.Geometry,
    outSpatialReference: __esri.SpatialReference,
    isSketch?: boolean
  ): void {
    (this.attachmentViewerDataCollection as Collection<MapCentricData>).forEach(
      async (attachmentViewerData: MapCentricData) => {
        attachmentViewerData.set("layerData.start", null);
        const objectIdField = attachmentViewerData.get("layerData.featureLayer.objectIdField");
        if (isSketch) {
          this._handleSketchFeatureEffect(geometry, attachmentViewerData);
        }
        const sortField = attachmentViewerData.sortField;
        const { order } = this;
        const orderVal = order ? order : "ASC";

        const sortFieldValue = sortField ? [`${sortField} ${orderVal}`] : [`${objectIdField} ${orderVal}`];
        const featureLayer = attachmentViewerData.get("layerData.featureLayer") as __esri.FeatureLayer;

        const query = new Query({
          geometry,
          outSpatialReference,
          orderByFields: sortFieldValue
        });

        const { definitionExpression } = featureLayer;

        if (definitionExpression) {
          query.set("where", definitionExpression);
        }

        const promise = featureLayer.isTable ? featureLayer.queryObjectIds() : featureLayer.queryObjectIds(query);
        const objectIdPromise = promise
          .catch((err) => {
            console.error("ERROR: ", err);
            return [];
          })
          .then(async (objectIds) => {
            const featureLayer = attachmentViewerData?.layerData?.featureLayer;
            const relatedFeaturesVM = this.relatedFeatures?.viewModel;
            const isTable = featureLayer?.isTable;
            const objectIdField = featureLayer?.objectIdField;
            const destLayer = relatedFeaturesVM?.getRelatedDestinationLayer(featureLayer as __esri.FeatureLayer);
            const role = relatedFeaturesVM?.getRelationshipRole(featureLayer as __esri.FeatureLayer);
            let relatedFeatureOIDs: number[] | null = null;
            if (destLayer && role === "destination" && isTable) {
              relatedFeatureOIDs = [];

              let destLayerOIDs: number[] | null = null;

              try {
                destLayerOIDs = await destLayer.queryObjectIds({
                  geometry,
                  outSpatialReference
                });
              } catch (err) {
                console.error(err);
              }

              try {
                const relationshipId = this.relatedFeatures?.viewModel?.getRelationshipId(destLayer, featureLayer);
                const destRelatedFeatures = await destLayer.queryRelatedFeatures({
                  objectIds: destLayerOIDs as number[],
                  returnGeometry: true,
                  outFields: ["*"],
                  relationshipId
                });
                relatedFeatureOIDs = this.relatedFeatures?.viewModel?.getRelatedFeatureOIDs(
                  destRelatedFeatures,
                  objectIdField as string
                ) as number[];
              } catch (err) {
                console.error(err);
              }
            }
            return {
              objectIds: Array.isArray(relatedFeatureOIDs)
                ? relatedFeatureOIDs.length > 0
                  ? relatedFeatureOIDs
                  : []
                : objectIds,
              attachmentViewerData
            };
          });
        this._objectIdPromises.push(objectIdPromise);
      }
    );

    this._handleQueryObjectIDPromises();
  }

  private async _handleQueryObjectIDPromises(): Promise<void> {
    try {
      const objectIdResults = await Promise.all(this._objectIdPromises);

      if (this.onlyDisplayFeaturesWithAttachments) {
        this._handleOnlyDisplayFeaturesWithAttachments(objectIdResults);
      } else {
        objectIdResults.forEach((objectIdResult) => {
          const layerViewFilter = objectIdResult?.attachmentViewerData?.layerData?.layerView
            ?.filter as __esri.FeatureFilter;
          const oidsLen = layerViewFilter?.objectIds?.length as number;
          if (oidsLen > 0) {
            layerViewFilter.objectIds = [];
          }
          this._handleQueryFeatures(objectIdResult);
        });
        this._settingUpAttachments = false;
        this.notifyChange("mapCentricState");
        this._handleAttachmentDataPromises();
      }
    } catch (err) {
      console.error("ERROR: ", err);
    }
  }

  private async _handleOnlyDisplayFeaturesWithAttachments(objectIdResults: any) {
    this._queryAttachmentCountPromises = [];

    objectIdResults.forEach((objectIdPromiseResult: any) => {
      const { attachmentViewerData, objectIds } = objectIdPromiseResult;

      // Only display features with attachments
      const { url, layerId } = attachmentViewerData.layerData.featureLayer;
      const reqUrl = `${url}/${layerId}/queryAttachments`;
      this._queryAttachmentCountPromises.push(
        esriRequest(reqUrl, {
          query: {
            f: "json",
            objectIds,
            returnCountOnly: true
          },
          responseType: "json"
        })
          .catch(() => {
            return {
              objectIds,
              attachmentViewerData
            };
          })
          .then((res: any) => {
            const attachmentGroups = res?.data?.attachmentGroups;
            const filteredObjectIds = attachmentGroups?.map((attachmentGroup: any) => attachmentGroup.parentObjectId);
            const updatedObjectIds = objectIds?.filter((oid: number) => filteredObjectIds.indexOf(oid) !== -1);
            return {
              objectIds: updatedObjectIds ?? [],
              attachmentViewerData
            };
          })
      );
    });

    const attachmentCountPromiseResults = await Promise.all(this._queryAttachmentCountPromises);

    attachmentCountPromiseResults.forEach((attachmentCountPromiseResult) => {
      const layerView = attachmentCountPromiseResult?.attachmentViewerData?.layerData?.layerView;
      if (attachmentCountPromiseResult?.objectIds && layerView) {
        layerView.filter = new FeatureFilter({
          objectIds: attachmentCountPromiseResult.objectIds
        });
      }
      this._handleQueryFeatures(attachmentCountPromiseResult);
    });

    this._settingUpAttachments = false;
    this.notifyChange("mapCentricState");
    this._handleAttachmentDataPromises();
  }

  private _handleQueryFeatures(objectIdResult: { objectIds: number[]; attachmentViewerData: MapCentricData }): void {
    const featureObjectIds = objectIdResult.attachmentViewerData.get("featureObjectIds") as __esri.Collection<number>;
    const stringifyObjectIds = JSON.stringify(featureObjectIds.slice().sort());
    const stringifyQueriedObjectIds = JSON.stringify(objectIdResult.objectIds.slice().sort());

    if (stringifyObjectIds === stringifyQueriedObjectIds) {
      return;
    }

    this._settingUpAttachments = true;
    this.notifyChange("mapCentricState");
    this._handleQueryFeaturesLogic(featureObjectIds, objectIdResult);
  }

  private async _handleQueryFeaturesLogic(
    featureObjectIds: __esri.Collection<number>,
    objectIdResult: any
  ): Promise<void> {
    featureObjectIds.removeAll();
    featureObjectIds.addMany([...objectIdResult.objectIds]);
    const featureObjectIdArr = featureObjectIds.slice();

    let attachments = {};

    try {
      attachments = await this._handleAttachmentsQuery(
        objectIdResult.attachmentViewerData.layerData,
        featureObjectIdArr,
        0
      );

      objectIdResult.attachmentViewerData.attachments = {
        ...objectIdResult.attachmentViewerData.attachments,
        ...attachments
      };
    } catch (err) {
    } finally {
      const attachmentsArr = featureObjectIdArr.map((objectId) => {
        const attachments = objectIdResult?.attachmentViewerData?.attachments?.[`${objectId}`];
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

      const { layerData, attachmentDataCollection } = objectIdResult.attachmentViewerData;

      layerData.start = 0;

      const subsetFeatures = attachmentsArr.toArray().slice(layerData.start, layerData.start + 24);
      attachmentDataCollection.removeAll();
      attachmentDataCollection.addMany([...subsetFeatures]);
    }
  }

  private async _handleAttachmentsQuery(
    layerData: LayerData,
    featureObjectIds: __esri.Collection<number>,
    start: number
  ): Promise<{ [oid: number]: __esri.AttachmentInfo[] }> {
    const featureLayer = layerData.featureLayer;

    const returnMetadata = this.imageDirectionEnabled ? true : false;

    const objectIds = [...featureObjectIds.toArray().slice(start, start + 24)];

    const config = {
      returnMetadata,
      objectIds
    };

    const attachmentConfig = featureLayer?.definitionExpression
      ? {
          ...config,
          attachmentsWhere: featureLayer.definitionExpression
        }
      : config;

    const attachmentQuery = new AttachmentQuery(attachmentConfig);

    return await featureLayer?.queryAttachments(attachmentQuery);
  }

  private async _handleAttachmentDataPromises(): Promise<void> {
    try {
      const attachmentDataPromiseResults = await Promise.all(this._attachmentDataPromises);
      attachmentDataPromiseResults.forEach((attachmentDataPromiseResult) => {
        const { features, attachmentViewerData } = attachmentDataPromiseResult;
        const mapCentricData = attachmentViewerData as MapCentricData;
        this._handleAttachmentDataRes(features, mapCentricData);
      });
      let attachmentViewerData: MapCentricData | null = null;

      const { attachmentViewerDataCollection } = this;
      const { selectedLayer } = this.layerSwitcher as LayerSwitcher;
      const selectedLayerId = selectedLayer?.id;
      if (selectedLayerId) {
        attachmentViewerData = attachmentViewerDataCollection.find((currentAttachmentViewerData) => {
          const featureLayerId = currentAttachmentViewerData?.layerData?.featureLayer?.id;
          return featureLayerId === selectedLayerId;
        }) as MapCentricData;
      } else {
        attachmentViewerData = attachmentViewerDataCollection.getItemAt(0) as MapCentricData;
      }
      this.set("selectedAttachmentViewerData", attachmentViewerData);
      const defaultOIDExists = this._getDefaultOIDExists();
      if (defaultOIDExists) {
        this._handleDefaultObjectId();
      }
    } catch (err) {
      console.error("ERROR: ", err);
    }
  }

  private _getDefaultOIDExists(): boolean {
    const { defaultObjectId } = this;
    return !!defaultObjectId || defaultObjectId === 0;
  }

  private _handleSelectedSearchResult(): void {
    const selectedResult = this.get("searchWidget.selectedResult") as __esri.SearchResult;
    if (!selectedResult) {
      return;
    }

    if (selectedResult?.feature?.layer?.id) {
      this._removeFeatureHighlight();
      this._updateAttachmentViewerDataOnSearch(selectedResult);
      this.set("selectedAttachmentViewerData.attachmentIndex", 0);
      const { feature } = selectedResult;
      this._setFeature(feature);
      if (feature?.geometry) {
        this._updateAddress(feature);
      }
    }
  }

  private _updateAttachmentViewerDataOnSearch(selectedResult: __esri.SearchResult): void {
    const { id } = selectedResult.feature.layer;
    const currentAVDataLayerId = this.get("selectedAttachmentViewerData.layerData.featureLayer.id") as string;
    if (id !== currentAVDataLayerId) {
      const updatedAttachmentViewerData = this.attachmentViewerDataCollection.find((attachmentViewerData) => {
        return id === attachmentViewerData?.layerData?.featureLayer?.id;
      });

      if (!updatedAttachmentViewerData) {
        return;
      }

      this.set("layerSwitcher.selectedLayer", updatedAttachmentViewerData?.layerData?.featureLayer);
      updatedAttachmentViewerData.set("selectedFeature", selectedResult.feature);
    }
  }

  private _handleDefaultObjectId(): void {
    const handleDefaultObjectIdKey = "handle-default-object-id-key";
    this._mapCentricHandles?.add(
      when(
        () => this.selectedAttachmentViewerData?.layerData?.featureLayer,
        async () => {
          this._mapCentricHandles?.remove(handleDefaultObjectIdKey);
          const defaultOIDExists = this._getDefaultOIDExists();
          if (!defaultOIDExists) {
            return;
          }

          const {
            defaultObjectId,
            view,
            selectedAttachmentViewerData,
            attachmentIndex,
            mapCentricTooltipEnabled,
            highlightedFeature
          } = this;

          const featureLayer = selectedAttachmentViewerData?.get("layerData.featureLayer") as __esri.FeatureLayer;

          try {
            const featureSet = await featureLayer.queryFeatures({
              outFields: ["*"],
              objectIds: [defaultObjectId as number],
              returnGeometry: true,
              outSpatialReference: view?.spatialReference
            });

            this.set("defaultObjectId", null);
            const featureLength = featureSet.features.length;
            if (!featureLength && featureLength !== 0) {
              return;
            }

            this.set("selectedAttachmentViewerData.attachmentIndex", attachmentIndex);
            const feature = featureSet?.features?.[0];
            if (mapCentricTooltipEnabled) {
              this.view?.popup?.open({
                features: [feature],
                featureMenuOpen: false,
                collapsed: true
              });
            } else {
              const layerView = this.get("selectedAttachmentViewerData.layerData.layerView") as __esri.FeatureLayerView;
              if (highlightedFeature) {
                highlightedFeature.remove();
                this.highlightedFeature = null;
              }
              this.highlightedFeature = layerView.highlight(feature);
            }

            if (!feature) {
              return;
            }
            this._setFeature(feature);
            this._updateAddress(feature);
          } catch (err) {
            console.error("ERROR: ", err);
          }
        },
        { initial: true }
      ),
      handleDefaultObjectIdKey
    );
  }

  private _handleAttachmentDataRes(featureSet: __esri.FeatureSet, attachmentViewerData: MapCentricData): void {
    const attachmentDataCollection = attachmentViewerData.get(
      "attachmentDataCollection"
    ) as __esri.Collection<AttachmentData>;
    attachmentDataCollection.removeAll();

    if (!featureSet) {
      return;
    }

    const graphics = featureSet.get("features") as __esri.Graphic[];
    const features: any[] = [];
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

  private _initFeatureContentCloseWatcher(): __esri.WatchHandle {
    return when(
      () => !this.featureContentPanelIsOpen,
      () => {
        this._removeFeatureHighlight();
        const { attachmentIndex, defaultObjectId, sketchWidget } = this;
        if (attachmentIndex !== null) {
          this.set("attachmentIndex", null);
        }
        if (defaultObjectId !== null) {
          this.set("defaultObjectId", null);
        }
        const graphicsLength = this.get("graphicsLayer.graphics.length") as number;
        if (sketchWidget && graphicsLength > 0) {
          return;
        }

        this.set("selectedAttachmentViewerData.objectIdIndex", null);
        this.set("selectedAttachmentViewerData.defaultObjectId", null);
        this.set("selectedAttachmentViewerData.attachmentIndex", 0);
        this.set("selectedAttachmentViewerData.selectedFeatureAttachments.currentIndex", 0);
        this.set("selectedAttachmentViewerData.selectedFeature", null);
        this.set("selectedAttachmentViewerData.featureWidget.graphic", null);
        if (this.get("searchWidget.selectedResult")) {
          this.searchWidget?.clear();
        }
        this._queryAllLayerData();
      }
    );
  }

  private _watchSelectedSearchResult(): __esri.WatchHandle {
    return watch(
      () => this.searchWidget?.selectedResult,
      () => this._handleSelectedSearchResult()
    );
  }

  // SET FEATURE METHODS
  private async _setFeature(feature: __esri.Graphic): Promise<void> {
    if (!feature) {
      return;
    }
    this.set("selectedAttachmentViewerData.selectedFeature", feature);
    if (this.selectedAttachmentViewerData?.layerData?.layerView) {
      this._removeFeatureHighlight();
      this.highlightedFeature = this.selectedAttachmentViewerData.layerData.layerView.highlight(feature);
    }

    this._handleFeatureWidget();
    try {
      await this.relatedFeatures?.queryRelatedFeatures(
        feature,
        this.layerSwitcher?.selectedLayer as __esri.FeatureLayer
      );
    } catch (err) {
      console.error("error: ", err);
    }
  }

  private _updateSelectedAttachmentViewerData(feature: __esri.Graphic): void {
    const featureLayerId = this.selectedAttachmentViewerData?.layerData?.featureLayer?.id;
    const { attachmentIndex } = this;
    const objectIdField = this.getObjectIdField(feature);
    const objectId = feature.attributes[objectIdField];
    const featureObjectIds = this.get("selectedAttachmentViewerData.featureObjectIds") as __esri.Collection<number>;
    const objectIdIndex = featureObjectIds && (featureObjectIds.indexOf(objectId) as number);
    this.set("selectedAttachmentViewerData.defaultObjectId", objectId);
    this.set("selectedAttachmentViewerData.objectIdIndex", objectIdIndex);
    this.set("selectedAttachmentViewerData.selectedLayerId", featureLayerId);

    const attachmentExists = this._checkExistingAttachment();

    const attachmentIndexVal = attachmentIndex && attachmentExists ? attachmentIndex : 0;
    this.set("selectedAttachmentViewerData.attachmentIndex", attachmentIndexVal);
  }

  // _checkExistingAttachment
  private _checkExistingAttachment(): boolean {
    const { selectedAttachmentViewerData, attachmentIndex } = this;
    const attachments = selectedAttachmentViewerData?.attachments;
    const layerData = selectedAttachmentViewerData?.layerData;
    const selectedFeature = selectedAttachmentViewerData?.selectedFeature;
    const attributes = selectedFeature?.attributes;
    const objectIdField = layerData?.featureLayer?.objectIdField as string;
    const objectId = attributes?.[objectIdField];
    const featureAttachments = attachments?.[objectId];
    const currentAttachment = featureAttachments?.[attachmentIndex as number];
    return !!currentAttachment;
  }

  private _handleFeatureWidget(): void {
    const graphic = this.get("selectedAttachmentViewerData.selectedFeature") as __esri.Graphic;
    if (!this.featureWidget) {
      this.featureWidget = this._createFeatureWidget(graphic);
    } else {
      this.featureWidget.set("graphic", graphic);
    }
    this.featureWidget.set("visibleElements.title", false);
    const featureWidgetKey = "feature-widget";
    this._mapCentricHandles?.add(
      when(
        () => this.featureWidget,
        () => {
          if (this.socialSharingEnabled) {
            this.updateSharePropIndexes();
          }
          this._watchForFeatureContentLoad();
        },
        { initial: true }
      ),
      featureWidgetKey
    );
  }

  private _createFeatureWidget(graphic: __esri.Graphic): __esri.Feature {
    const { view } = this;
    const spatialReference = view?.get("spatialReference") as __esri.SpatialReference;
    return new Feature({
      view: view as __esri.MapView,
      graphic,
      spatialReference
    });
  }

  private _watchForFeatureContentLoad(): void {
    const featureWidgetKey = "feature-widget-key--waiting";
    if (this._mapCentricHandles?.has(featureWidgetKey)) this._mapCentricHandles.remove(featureWidgetKey);
    this._mapCentricHandles?.add(
      when(
        () => !this.featureWidget?.viewModel?.waitingForContent,
        () => {
          const { featureWidget } = this;
          if (featureWidget?.graphic) {
            this._updateSelectedAttachmentViewerData(featureWidget.graphic);
          }
          this._handleFeatureWidgetContent();
        }
      ),
      featureWidgetKey
    );
  }

  private _handleFeatureWidgetContent(): void {
    const { featureWidget } = this;
    this.setFeatureInfo(featureWidget as Feature);
    this._setFeatureAttachments(this.selectedAttachmentViewerData as MapCentricData);
  }

  private async _setFeatureAttachments(avData: MapCentricData): Promise<void> {
    let attachmentContentInfos = this._getAttachmentContentInfos(avData) as __esri.AttachmentInfo[];
    const selectedFeature = this.get("selectedAttachmentViewerData.selectedFeature") as __esri.Graphic;

    if (!attachmentContentInfos) {
      const layer = selectedFeature?.layer ? selectedFeature.layer : this.relatedFeatures?.destinationLayer;
      const oidField = (layer as __esri.FeatureLayer)?.objectIdField;
      const objectId = selectedFeature?.attributes?.[oidField];
      const queriedAttachments = await (layer as __esri.FeatureLayer).queryAttachments({
        objectIds: [objectId]
      });
      const attachments = {
        ...this.selectedAttachmentViewerData?.attachments,
        ...queriedAttachments
      };
      this.set("selectedAttachmentViewerData.attachments", attachments);
      attachmentContentInfos = attachments[`${objectId}`];
    }

    const attachmentIndex = this.get("selectedAttachmentViewerData.attachmentIndex") as number;

    const currentIndex = attachmentIndex !== null ? attachmentIndex : 0;
    const attachmentsArr = attachmentContentInfos?.length > 0 ? attachmentContentInfos : [];

    const sortedAttachments = this._sortFeatureAttachments(attachmentsArr);

    const attachments = new Collection([...sortedAttachments]);

    const selectedFeatureAttachments = new SelectedFeatureAttachments({
      attachments,
      currentIndex
    });

    this.set("selectedAttachmentViewerData.selectedFeatureAttachments", selectedFeatureAttachments);
    this.set("featureContentPanelIsOpen", true);
  }

  private _getAttachmentContentInfos(avData: MapCentricData) {
    if (avData?.attachments) {
      const selectedFeature = avData.get("selectedFeature") as __esri.Graphic;

      const objectIdField = this.getObjectIdField(selectedFeature);

      const objectId = selectedFeature?.attributes?.[objectIdField];
      let attachments = avData.attachments[`${objectId as number}`];
      return attachments;
    }
    return undefined;
  }

  private _sortFeatureAttachments(layerAttachments: __esri.AttachmentInfo[]): __esri.AttachmentInfo[] {
    const featureAttachments = [] as __esri.AttachmentInfo[];
    this.set("selectedAttachmentViewerData.unsupportedAttachmentTypes", []);

    if (layerAttachments) {
      layerAttachments.forEach((attachmentInfo) => {
        const { contentType } = attachmentInfo;
        if (this.supportedAttachmentTypes.indexOf(contentType) !== -1) {
          featureAttachments.push(attachmentInfo);
        } else {
          const unsupportedAttachmentTypes = this.get("selectedAttachmentViewerData.unsupportedAttachmentTypes") as any;
          unsupportedAttachmentTypes.push(attachmentInfo);
        }
      });
    }
    return featureAttachments;
  }

  private _setupSocialSharing(): void {
    this.setupShare();
  }

  private _removeFeatureHighlight(): void {
    const { highlightedFeature } = this;
    if (highlightedFeature) {
      highlightedFeature.remove();
      this.highlightedFeature = null;
    }
  }

  private _processSelectedFeatureIndicator(
    layerView: __esri.FeatureLayerView,
    graphic: __esri.Graphic,
    queryPromise?: Promise<void | __esri.FeatureSet> | null,
    mapPoint?: __esri.Point
  ) {
    if (this.mapCentricTooltipEnabled) {
      this._openMapCentricTooltip(graphic, queryPromise, mapPoint);
    } else {
      this._removeFeatureHighlight();
      this.highlightedFeature = layerView.highlight(graphic);
    }
  }

  private _openMapCentricTooltip(
    graphic: __esri.Graphic,
    queryPromise?: Promise<void | __esri.FeatureSet> | null,
    mapPoint?: __esri.Point
  ): void {
    const config: {
      features: __esri.Graphic[];
      featureMenuOpen: boolean;
      collapsed: boolean;
      location?: __esri.Point;
    } = {
      features: [graphic],
      featureMenuOpen: false,
      collapsed: true
    };
    if (mapPoint) config["location"] = mapPoint;
    const popupConfigToOpen = queryPromise ? { ...config, promises: [queryPromise] } : config;
    setTimeout(() => this.view?.popup.open(popupConfigToOpen), 10);
  }

  private _closeMapCentricTooltip(): void {
    this.view?.popup.clear();
    this.view?.popup.close();
  }
}

export default MapCentricViewModel;
