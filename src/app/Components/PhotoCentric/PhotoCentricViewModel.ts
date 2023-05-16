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

import Collection from "@arcgis/core/core/Collection";
import Handles from "@arcgis/core/core/Handles";
import { watch, when } from "@arcgis/core/core/reactiveUtils";

import Feature from "@arcgis/core/widgets/Feature";
import Query from "@arcgis/core/rest/support/Query";
import FeatureEffect from "@arcgis/core/layers/support/FeatureEffect";
import AttachmentViewerLayerData from "../AttachmentViewer/AttachmentViewerLayerData";
import AttachmentViewerViewModel from "../AttachmentViewer/AttachmentViewerViewModel";
import PhotoCentricData from "./PhotoCentricData";
import SelectedFeatureAttachments from "../AttachmentViewer/SelectedFeatureAttachments";

type State = "ready" | "loading" | "disabled" | "querying" | "performingHitTest" | "queryingData";

import { PhotoCentricOIDPromise, PhotoCentricFeaturesPromise, HitTestResult } from "../../interfaces/interfaces";

import { removeAttachmentsContent } from "../../utils/layerUtils";
import esriRequest from "@arcgis/core/request";
import { prefersReducedMotion } from "templates-common-library/structuralFunctionality/a11yUtils";
import FeatureFilter from "@arcgis/core/layers/support/FeatureFilter";

@subclass("PhotoCentricViewModel")
class PhotoCentricViewModel extends AttachmentViewerViewModel {
  private _photoCentricHandles: Handles | null = new Handles();
  private _queryingForFeaturesPhotoCentric: Promise<void> | null = null;
  private _performingHitTestPhotoCentric: Promise<__esri.HitTestResult> | null = null;
  private _currentSketchExtentPhotoCentric: __esri.Extent | null = null;
  private _queryingForObjectIds: Promise<void> | null = null;
  private _layerViewLoadPromises: Array<Promise<any>> = [];
  private _queryObjectIdPromises: Array<Promise<PhotoCentricOIDPromise>> = [];
  private _queryFeaturesPromises: Array<Promise<PhotoCentricFeaturesPromise>> = [];
  private _queryAttachmentCountPromises: Array<Promise<PhotoCentricOIDPromise>> = [];
  private _queryingFeatures: Promise<__esri.FeatureSet> | null = null;
  private _queryingAttachments = false;
  private _queryingData: boolean | null = null;
  private _timeoutId: NodeJS.Timeout | null;

  @property({
    dependsOn: ["view.ready"],
    readOnly: true
  })
  get queryingState(): State {
    const querying =
      this._queryingForFeaturesPhotoCentric ||
      this._queryingForObjectIds ||
      this._queryingFeatures ||
      this._queryingAttachments;
    const ready = this.view?.ready && this._queryingData === false && !querying;
    return ready ? "ready" : querying ? "loading" : "disabled";
  }

  destroy(): void {
    if (this.highlightedFeature) {
      this.highlightedFeature.remove();
      this.highlightedFeature = null;
    }
    this._photoCentricHandles?.removeAll();
    this._photoCentricHandles?.destroy();
    this._photoCentricHandles = null;
  }

  @property()
  currentImageUrl: string | null = null;

  @property()
  attachmentLayers: any = null;

  @property()
  imagePanZoomEnabled: boolean | null = null;

  @property()
  order: string | null = null;

  @property()
  defaultObjectId: number | null = null;

  @property()
  attachmentIndex: number | null = null;

  @property()
  selectedLayerId: string | null = null;

  @property()
  highlightedFeature: any = null;

  @property()
  imageDirectionEnabled: boolean | null = null;

  @property()
  applyEffectToNonActiveLayers = null;

  @property()
  nonActiveLayerEffects = null;

  initialize() {
    this._photoCentricHandles?.add(
      when(
        () => this.view?.popup?.autoOpenEnabled,
        () => ((this.view as __esri.MapView).popup.autoOpenEnabled = false),
        { once: true }
      ),
      watch(
        () => this.appMode,
        () => this._removeFeatureHighlight()
      )
    );

    this._initAppOnViewReady();
    this._photoCentricHandles?.add([
      when(
        () => this.selectFeaturesEnabled,
        () => {
          this._initializeSketch();
        },
        { initial: true }
      ),
      when(
        () => !this.selectFeaturesEnabled,
        () => {
          if (this.layerSwitcher?.featureLayerCollection) {
            this._layerViewLoadPromises = [];
            this._initLayerViewLoadPromises(this.layerSwitcher.featureLayerCollection);
          }
        }
      ),
      when(
        () => this.state === "editing",
        () => {
          this._photoCentricHandles?.add(
            when(
              () => this.state === "ready",
              () => {
                this._photoCentricHandles?.add(
                  when(
                    () => this.featureWidget?.graphic,
                    () => {
                      const avData = this.selectedAttachmentViewerData as PhotoCentricData;
                      const indexOfGraphicToUpdate = avData.layerFeatures.findIndex((graphic) => {
                        return (
                          graphic.attributes[avData?.layerData?.featureLayer?.objectIdField as string] ===
                          this.featureWidget?.graphic?.attributes?.[
                            avData?.layerData?.featureLayer?.objectIdField as string
                          ]
                        );
                      });
                      avData.layerFeatures.splice(
                        indexOfGraphicToUpdate,
                        1,
                        this.featureWidget?.graphic as __esri.Graphic
                      );
                    },
                    { once: true }
                  )
                );
              },
              { once: true }
            )
          );
        }
      ),
      when(
        () => this.view?.popup?.highlightEnabled,
        () => ((this.view as __esri.MapView).popup.highlightEnabled = false),
        {
          initial: true,
          once: true
        }
      ),
      when(
        () => this.view?.popup?.dockEnabled,
        () => ((this.view as __esri.MapView).popup.dockEnabled = false),
        {
          initial: true,
          once: true
        }
      )
    ]);
    this._initSelectedAttachmentViewerDataWatcher();
    this._initRelatedFeaturesWatcher();
  }

  // zoomTo
  async zoomTo(): Promise<void> {
    const scale = this.zoomLevel ? parseInt(this.zoomLevel) : (32000 as number);
    let selectedFeature = this.get("selectedAttachmentViewerData.selectedFeature") as __esri.Graphic;

    const relatedOriginFeature = selectedFeature
      ? await this.relatedFeatures?.viewModel?.getRelatedOriginFeature(selectedFeature)
      : null;

    if (relatedOriginFeature) {
      selectedFeature = relatedOriginFeature;
    }

    this.view?.goTo(
      {
        target: selectedFeature,
        scale
      },
      { animate: prefersReducedMotion() ? false : true }
    );
  }

  private _initAppOnViewReady(): void {
    const photoCentricInit = "photo-centric-init";
    this._photoCentricHandles?.add(
      when(
        () => this.view?.ready,
        () => {
          this._photoCentricHandles?.remove(photoCentricInit);
          this._initializeAppData();
          this._photoCentricHandles?.add(this._detectFeatureClick());
        },
        { once: true }
      ),
      photoCentricInit
    );
  }

  private _initSelectedAttachmentViewerDataWatcher(): void {
    this._photoCentricHandles?.add([
      when(
        () => this.selectedAttachmentViewerData,
        () => {
          this._photoCentricHandles?.add(
            watch(
              () => this.layerSwitcher?.selectedLayer,
              async () => {
                const avData = this.attachmentViewerDataCollection.find(
                  (avData) => avData?.layerData?.featureLayer?.id === this.layerSwitcher?.selectedLayer?.id
                );
                this.selectedAttachmentViewerData = avData as PhotoCentricData;
              }
            )
          );
        },
        { once: true }
      ),
      watch(
        () => this.selectedAttachmentViewerData,
        async () => {
          this._removeFeatureHighlight();

          const { socialSharingEnabled, defaultObjectId, selectedLayerId } = this;
          if (socialSharingEnabled && defaultObjectId !== null && selectedLayerId) {
            this._handleSharedFeature();
          } else {
            this._setFeaturePhotoCentric();
          }
          if (socialSharingEnabled) {
            this.updateSharePropIndexes();
          }
        }
      )
    ]);
  }

  private _initRelatedFeaturesWatcher() {
    this._photoCentricHandles?.add(
      watch(
        () => this.relatedFeatures?.selectedFeature,
        () => {
          const selectedFeature = this.relatedFeatures?.selectedFeature;
          const destinationLayer = this.relatedFeatures?.destinationLayer;
          if (!selectedFeature) {
            return;
          }
          const { layerSwitcher, attachmentViewerDataCollection } = this;
          layerSwitcher?.viewModel.setLayer(destinationLayer as __esri.FeatureLayer);
          when(
            () => this.selectedAttachmentViewerData,
            () => {
              const avData = attachmentViewerDataCollection.find((avDataItem) => {
                const id = avDataItem?.layerData?.featureLayer?.id;
                return id === destinationLayer?.id;
              }) as PhotoCentricData;
              this.set("selectedAttachmentViewerData", avData);
              this._setRelatedFeature(selectedFeature, avData);
            },
            { initial: true, once: true }
          );
        }
      )
    );
  }

  private _handleSharedFeature(): void {
    const { defaultObjectId } = this;
    const featureLayer = this.selectedAttachmentViewerData?.layerData?.featureLayer;
    featureLayer
      ?.queryFeatures({
        outFields: ["*"],
        objectIds: [defaultObjectId as number],
        returnGeometry: true
      })
      .then((featureSet: __esri.FeatureSet) => {
        const graphic = featureSet?.features?.[0];
        if (!graphic) {
          return;
        }
        this.set("selectedAttachmentViewerData.selectedFeature", graphic);
        this.updateSelectedFeatureFromClickOrSearch(graphic);
      });
    this.set("defaultObjectId", null);
    this.set("selectedLayerId", null);
  }

  private _initializeAppData(): void {
    when(
      () => this.layerSwitcher?.featureLayerCollection?.length,
      () => {
        this._layerViewLoadPromises = [];
        this._initLayerViewLoadPromises(
          this.layerSwitcher?.featureLayerCollection as __esri.Collection<__esri.FeatureLayer>
        );
      }
    );
  }

  private async _initLayerViewLoadPromises(
    featureLayerCollection: __esri.Collection<__esri.FeatureLayer>
  ): Promise<void> {
    featureLayerCollection.forEach((featureLayerRes) => {
      removeAttachmentsContent(featureLayerRes);
      if (featureLayerRes.isTable) {
        const tablePromise = new Promise((resolve) => {
          setTimeout(() => {
            resolve(null);
          }, 100);
        });
        this._layerViewLoadPromises.push(
          tablePromise.then(() => {
            return {
              layer: featureLayerRes,
              layerView: null
            };
          })
        );
      } else {
        this._layerViewLoadPromises.push(
          (this.view as __esri.MapView).whenLayerView(featureLayerRes).then((layerView: __esri.FeatureLayerView) => {
            return {
              layer: featureLayerRes,
              layerView: layerView
            };
          })
        );
      }
    });
    this._queryingData = true;
    this.notifyChange("queryingState");
    const layerViewPromiseResults = await Promise.all(this._layerViewLoadPromises);
    this._handleLayerViewPromiseResults(layerViewPromiseResults);
  }

  private async _handleQueryAttachments(queriedFeaturesPromisesResult: {
    attachmentViewerData: PhotoCentricData;
    queriedFeatures: __esri.FeatureSet;
  }): Promise<{ [key: number]: __esri.AttachmentInfo }> {
    const { attachmentViewerData, queriedFeatures } = queriedFeaturesPromisesResult;
    const objectIdField = attachmentViewerData?.layerData?.featureLayer?.objectIdField;
    const objectIds = queriedFeatures.features.map((feature) => feature.attributes[objectIdField as string]);

    const featureLayer = attachmentViewerData?.layerData?.featureLayer;

    const returnMetadata = this.imageDirectionEnabled ? true : false;
    const query = {
      where: "1=1",
      returnMetadata,
      objectIds
    };

    // attachmentsWhere used to take the definition expression from
    // featureLayer, but since we added instant-apps-filter-list,
    // a bug is caused where attachments dont have the same "fields"
    // as the featureLayer and crashes the app.
    let attachmentsWhere = "2=2";

    const attachmentQuery = attachmentsWhere
      ? {
          ...query,
          attachmentsWhere
        }
      : query;
    return await featureLayer?.queryAttachments(attachmentQuery);
  }

  private _handleLayerViewPromiseResults(layerViewPromiseResults: __esri.FeatureLayerView[]): void {
    layerViewPromiseResults.forEach((layerViewPromiseResult) => {
      const attachmentViewerData = this._addAttachmentViewerDataToCollection(layerViewPromiseResult);
      this._handleAttachmentViewerDataSortField(attachmentViewerData);
    });

    this._initQueryObjectIdPromises();
  }

  private _addAttachmentViewerDataToCollection(layerViewPromiseResult: any): PhotoCentricData {
    const { layer } = layerViewPromiseResult;
    const layerData = new AttachmentViewerLayerData({
      featureLayer: layer,
      layerView: layerViewPromiseResult.layerView
    });
    const attachmentViewerData = new PhotoCentricData({
      defaultLayerExpression: layer?.definitionExpression,
      layerData,
      selectedLayerId: layer?.id
    });

    this.attachmentViewerDataCollection.add(attachmentViewerData);
    return attachmentViewerData;
  }

  private _handleAttachmentViewerDataSortField(attachmentViewerData: PhotoCentricData): void {
    const featureLayer = attachmentViewerData?.layerData?.featureLayer as __esri.FeatureLayer;
    const { attachmentLayers } = this;
    const layers = attachmentLayers?.layers;
    if (layers?.length > 0) {
      this._handleAttachmentLayers(layers, attachmentViewerData, featureLayer);
    } else {
      this._handleAttachmentLayer(attachmentViewerData, featureLayer);
    }
  }

  private _handleAttachmentLayers(
    attachmentLayers: any,
    attachmentViewerData: PhotoCentricData,
    featureLayer: __esri.FeatureLayer
  ): void {
    attachmentLayers.forEach((attachmentLayer: any) => {
      const { fields, id } = attachmentLayer;
      const sortField = fields?.[0];
      if (id === featureLayer.id && sortField) {
        attachmentViewerData.sortField = sortField;
      }
    });
  }

  private _handleAttachmentLayer(attachmentViewerData: PhotoCentricData, featureLayer: __esri.FeatureLayer): void {
    const { attachmentLayer } = this;
    if (!attachmentLayer) {
      return;
    }
    const { fields } = attachmentLayer;
    const field = fields?.[0]?.fields?.[0];
    if (attachmentLayer?.id === featureLayer?.id && fields?.length > 0 && field) {
      attachmentViewerData.set("sortField", field);
    }
  }

  private async _initQueryObjectIdPromises(
    sketchGeometry?: __esri.Extent | null,
    isSketchDelete?: boolean
  ): Promise<void> {
    (this.attachmentViewerDataCollection as __esri.Collection<PhotoCentricData>).forEach(
      (attachmentViewerData: PhotoCentricData) => {
        const sketchQuery = sketchGeometry ? this._generateSketchQuery(sketchGeometry, attachmentViewerData) : null;
        this._setupQueryObjectIdPromises(attachmentViewerData, sketchQuery);
      }
    );

    const objectIdPromiseResults = await Promise.all(this._queryObjectIdPromises);

    this._queryObjectIdPromises = [];
    this._handleQueryObjectIdPromisesResults(objectIdPromiseResults, isSketchDelete);
  }

  private _setupQueryObjectIdPromises(attachmentViewerData: PhotoCentricData, sketchQuery?: __esri.Query): void {
    this._resetQueryRange(attachmentViewerData);
    let featureQuery: any = null;
    if (sketchQuery) {
      const where = this._createUpdatedDefinitionExpression(attachmentViewerData);
      const updatedSketchQuery = where ? { ...sketchQuery, where } : sketchQuery;
      featureQuery = updatedSketchQuery;
    } else {
      featureQuery = this._createFeatureQuery(attachmentViewerData);
    }

    const definitionExpression = attachmentViewerData?.layerData?.featureLayer?.definitionExpression;

    if (definitionExpression) {
      featureQuery.where = definitionExpression;
    }

    this._handleObjectIdPromise(attachmentViewerData, featureQuery);
  }

  private _resetQueryRange(attachmentViewerData: PhotoCentricData): void {
    const { queryRange } = attachmentViewerData;
    queryRange[0] = 0;
    queryRange[1] = 10;
  }

  private _createFeatureQuery(attachmentViewerData: PhotoCentricData): __esri.Query {
    const orderByFields = this._createOrderByFields(attachmentViewerData);
    const where = this._createUpdatedDefinitionExpression(attachmentViewerData);
    const queryConfig = {
      outFields: ["*"],
      orderByFields: orderByFields,
      where,
      returnGeometry: true
    };
    return new Query(queryConfig);
  }

  private _createUpdatedDefinitionExpression(attachmentViewerData: PhotoCentricData): string {
    const { defaultLayerExpression } = attachmentViewerData;
    return defaultLayerExpression ? defaultLayerExpression : "1=1";
  }

  private _createOrderByFields(attachmentViewerData: PhotoCentricData): string[] {
    const featureLayer = attachmentViewerData?.layerData?.featureLayer;
    const objectIdField = featureLayer?.objectIdField;
    const { order } = this;
    const sortField = attachmentViewerData.get("sortField") as string;
    const sortFieldValue = sortField ? sortField : objectIdField;
    const fieldOrder = order ? order : "ASC";
    return [`${sortFieldValue} ${fieldOrder}`];
  }

  private _handleObjectIdPromise(attachmentViewerData: PhotoCentricData, featureQuery: __esri.Query): void {
    const featureLayer = attachmentViewerData?.layerData?.featureLayer;
    const promise = featureLayer?.isTable ? featureLayer.queryObjectIds() : featureLayer?.queryObjectIds(featureQuery);
    this._queryObjectIdPromises.push(
      promise
        ?.catch((err: Error) => {
          this._queryingForObjectIds = null;
          this.notifyChange("state");
          this.notifyChange("queryingState");
          console.error("ERROR: ", err);
        })
        .then((objectIds: any) => {
          return {
            attachmentViewerData,
            objectIds
          };
        }) as any
    );
  }

  private async _handleQueryObjectIdPromisesResults(
    objectIdPromiseResults: PhotoCentricOIDPromise[],
    isSketchDelete?: boolean
  ): Promise<void> {
    if (this.onlyDisplayFeaturesWithAttachments) {
      this._handleOnlyDisplayFeaturesWithAttachments(objectIdPromiseResults, isSketchDelete);
    } else {
      this._queryFeaturesPromises = [];
      this._initQueryFeaturesPromises(objectIdPromiseResults);
      Promise.all(this._queryFeaturesPromises).then((queriedFeaturesPromisesResults: PhotoCentricFeaturesPromise[]) => {
        this._queryFeaturesPromises = [];
        this._handleQueryFeaturesPromisesResults(queriedFeaturesPromisesResults, isSketchDelete);
      });
    }
  }

  private async _handleOnlyDisplayFeaturesWithAttachments(
    objectIdPromiseResults: PhotoCentricOIDPromise[],
    isSketchDelete?: boolean
  ): Promise<void> {
    this._queryAttachmentCountPromises = [];

    objectIdPromiseResults.forEach((objectIdPromiseResult) => {
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
            const updatedObjectIds = objectIds?.filter((oid) => filteredObjectIds.indexOf(oid) !== -1);
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
    });

    this._queryFeaturesPromises = [];
    this._initQueryFeaturesPromises(attachmentCountPromiseResults);
    const queriedFeaturesPromisesResults = await Promise.all(this._queryFeaturesPromises);

    this._queryFeaturesPromises = [];
    this._handleQueryFeaturesPromisesResults(queriedFeaturesPromisesResults, isSketchDelete);
  }

  private _initQueryFeaturesPromises(objectIdPromiseResults: PhotoCentricOIDPromise[]): void {
    objectIdPromiseResults.forEach(async (objectIdPromiseResult: PhotoCentricOIDPromise) => {
      const { attachmentViewerData, objectIds } = objectIdPromiseResult;
      const { featureObjectIds } = attachmentViewerData;

      if (!objectIds) {
        return;
      }

      if (
        !this.onlyDisplayFeaturesWithAttachments &&
        attachmentViewerData?.layerData?.layerView?.filter?.objectIds?.length > 0
      ) {
        attachmentViewerData.layerData.layerView.filter.objectIds = [];
      }

      featureObjectIds.removeAll();
      featureObjectIds.addMany([...objectIds]);

      const featureQuery = this._setupFeatureQuery(attachmentViewerData);
      this._queryFeaturesPromises.push(
        attachmentViewerData.layerData.featureLayer
          .queryFeatures(featureQuery)
          .catch((err) => {
            this._queryingForFeaturesPhotoCentric = null;
            this.notifyChange("state");
            this.notifyChange("queryingState");
            console.error("ERROR: ", err);
          })
          .then((queriedFeatures: any) => {
            return { attachmentViewerData, queriedFeatures };
          })
      );
    });
  }

  private async _handleQueryFeaturesPromisesResults(
    queriedFeaturesPromisesResults: any,
    isSketchDelete?: boolean
  ): Promise<void> {
    const attachmentPromises: any = [];

    queriedFeaturesPromisesResults.forEach(async (queriedFeaturesPromisesResult) => {
      this._queryingAttachments = true;
      this.notifyChange("state");
      this.notifyChange("queryingState");

      const { attachmentViewerData, queriedFeatures } = queriedFeaturesPromisesResult;
      const { objectIdField } = attachmentViewerData.layerData.featureLayer;
      const objectIds = queriedFeatures.features.map((feature) => feature.attributes[objectIdField]);

      const { featureLayer } = attachmentViewerData.layerData;
      const returnMetadata = this.imageDirectionEnabled ? true : false;
      const attachmentsWhere = featureLayer?.definitionExpression;
      const config = {
        where: "1=1",
        returnMetadata,
        objectIds
      };
      const attachmentConfig = attachmentsWhere
        ? {
            ...config,
            attachmentsWhere
          }
        : config;

      attachmentPromises.push(
        featureLayer
          .queryAttachments(attachmentConfig)
          .catch(() => {
            console.error();
          })
          .then((res) => {
            attachmentViewerData.set("attachments", {
              ...attachmentViewerData.attachments,
              ...res
            });
            return {
              attachmentViewerData,
              queriedFeatures
            };
          })
      );
    });

    const attachmentPromisesResults = await Promise.all(attachmentPromises);

    this._queryingAttachments = false;
    this.notifyChange("state");
    this.notifyChange("queryingState");

    attachmentPromisesResults.forEach((attachmentPromisesResult) => {
      this._addLayerFeaturesToAttachmentViewerData({
        attachmentViewerData: attachmentPromisesResult.attachmentViewerData,
        queriedFeatures: attachmentPromisesResult.queriedFeatures
      });
    });
    this._setupPhotoCentricLayout(isSketchDelete);
    this._queryingData = false;
    this.notifyChange("queryingState");
  }

  private _addLayerFeaturesToAttachmentViewerData(queriedFeaturesPromisesResult: any): void {
    const { attachmentViewerData, queriedFeatures } = queriedFeaturesPromisesResult;

    const { layerFeatures, layerFeatureIndex } = attachmentViewerData;

    layerFeatures.removeAll();

    const currentSet = this._getCurrentSetOfFeatures(attachmentViewerData);
    const features = this._sortFeatures(queriedFeatures, currentSet, attachmentViewerData);
    layerFeatures.addMany(features);

    attachmentViewerData.set("layerFeatureIndex", layerFeatureIndex !== null ? layerFeatureIndex : 0);
  }

  private _getCurrentSetOfFeatures(attachmentViewerData: PhotoCentricData): Collection<number> {
    const { queryRange, featureObjectIds } = attachmentViewerData;
    const [low, high] = queryRange;
    return featureObjectIds.slice(low, high);
  }

  private _setupPhotoCentricLayout(isSketchDelete?: boolean): void {
    if (this._currentSketchExtentPhotoCentric || isSketchDelete) {
      this.attachmentViewerDataCollection.forEach((attachmentViewerData) => {
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

  private _sortFeatures(
    queriedFeatures: any,
    currentSet: __esri.Collection,
    attachmentViewerData: PhotoCentricData
  ): __esri.Graphic[] | undefined {
    const features: any = [];
    const objectIdField = attachmentViewerData.get("layerData.featureLayer.objectIdField") as string;
    if (!queriedFeatures) {
      return;
    }

    queriedFeatures.features.forEach((feature: __esri.Graphic) => {
      const objectIdFromQuery = feature.attributes[objectIdField];
      currentSet.forEach((objectId: number, objectIdIndex: number) => {
        if (objectId === objectIdFromQuery && features.indexOf(features[objectIdIndex]) === -1) {
          features[objectIdIndex] = feature;
        }
      });
    });
    return features;
  }

  private _initializeSketch(): void {
    const selectFeaturesEnabled = "select-features-enabled";
    this._photoCentricHandles?.add(
      when(
        () => this.selectFeaturesEnabled,
        () => {
          this._photoCentricHandles?.remove(selectFeaturesEnabled);
          const sketchWidgetInit = "sketch-widget-init";
          this._photoCentricHandles?.add(
            when(
              () => this.sketchWidget,
              () => {
                this._photoCentricHandles?.remove(sketchWidgetInit);
                this._handleSketch();
              },
              { initial: true, once: true }
            ),
            sketchWidgetInit
          );
        },
        {
          initial: true
        }
      ),
      selectFeaturesEnabled
    );
  }

  private _handleSketch(): void {
    const sketchWidgetKey = "sketch-widget";
    this._photoCentricHandles?.add(
      when(
        () => this.selectedAttachmentViewerData?.layerData?.featureLayer,
        () => {
          const { sketchWidget, graphicsLayer } = this;
          this._watchSketchCreateAndUpdate(sketchWidget as __esri.Sketch, graphicsLayer as __esri.GraphicsLayer);
          this._watchSketchDelete(sketchWidget as __esri.Sketch);
          this._photoCentricHandles?.remove(sketchWidgetKey);
        },
        { initial: true }
      ),
      sketchWidgetKey
    );
  }

  private _watchSketchCreateAndUpdate(sketchWidget: __esri.Sketch, graphicsLayer: __esri.GraphicsLayer): void {
    this._photoCentricHandles?.add([
      sketchWidget.on("create", (sketchEvent: __esri.SketchCreateEvent) => {
        if (this.appMode === "map-centric") {
          return;
        }
        this._handleSketchEvent(sketchEvent, graphicsLayer);
      }),
      sketchWidget.on("update", (sketchEvent: __esri.SketchUpdateEvent) => {
        if (this.appMode === "map-centric") {
          return;
        }
        this._handleSketchEvent(sketchEvent, graphicsLayer);
      })
    ]);
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

  private _handleSketchEventDebounce(sketchEvent) {
    if (sketchEvent?.aborted) return;
    if (this._timeoutId) clearTimeout(this._timeoutId);
    this._timeoutId = setTimeout(() => {
      this._timeoutId = null;
      let geometry: any = null;
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
    }, 500);
  }

  private _watchSketchDelete(sketchWidget: __esri.Sketch): void {
    this._photoCentricHandles?.add(
      sketchWidget.on("delete", () => {
        if (this.appMode === "map-centric") {
          return;
        }
        this.attachmentViewerDataCollection.forEach((attachmentViewerData) => {
          attachmentViewerData.set("layerData.layerView.featureEffect", null);
        });
        this._currentSketchExtentPhotoCentric = null;
        this.notifyChange("state");
        this.notifyChange("queryingState");
        this._initQueryObjectIdPromises(null, true);
      })
    );
  }

  private _generateSketchQuery(geometry: __esri.Extent, photoCentricData: PhotoCentricData): any {
    const where = this._createUpdatedDefinitionExpression(photoCentricData);
    const queryConfig = {
      outFields: ["*"],
      geometry,
      outSpatialReference: this.view?.get("spatialReference"),
      where,
      returnGeometry: true
    };
    return queryConfig;
  }

  private _handleSketchFeatureEffect(geometry: __esri.Extent): void {
    this.attachmentViewerDataCollection.forEach((attachmentViewerData) => {
      const layerView = attachmentViewerData.get("layerData.layerView") as __esri.FeatureLayerView;

      const featureEffect = new FeatureEffect({
        filter: {
          geometry
        },
        excludedEffect: "grayscale(100%) opacity(50%)"
      });
      layerView.set("effect", featureEffect);
    });
  }

  private _queryFeaturesWithinSketchExtent(sketchGeometry: __esri.Extent): void {
    this._queryObjectIdPromises = [];
    this._initQueryObjectIdPromises(sketchGeometry);
  }

  private _detectFeatureClick(): __esri.WatchHandle {
    return (this.view as __esri.MapView).on("click", (event) => {
      if (this.appMode === "map-centric") {
        return;
      }
      if (this.queryingState !== "ready") {
        return;
      }
      if (!this.imagePanZoomEnabled) {
        if (this.state !== "ready" || this._performingHitTestPhotoCentric) {
          return;
        }
      }
      const { view } = this;
      this._performingHitTestPhotoCentric = (view as __esri.MapView).hitTest(event);
      this.notifyChange("state");
      this.notifyChange("queryingState");
      this._performingHitTestPhotoCentric.then((hitTestRes: __esri.HitTestResult) => {
        this._handleHitTestRes(hitTestRes);
      });
    });
  }

  private _handleHitTestRes(hitTestRes: __esri.HitTestResult): void {
    this.view?.popup?.close();
    if (this.view?.popup.highlightEnabled) this.view.popup.highlightEnabled = false;
    const results = hitTestRes && hitTestRes.results;

    const layerIds = this.attachmentViewerDataCollection.slice().map((attachmentViewerData) => {
      return attachmentViewerData.selectedLayerId;
    });
    const filteredResults =
      results &&
      results.filter((result) => {
        // @ts-ignore
        const { id } = result.graphic.layer;
        return layerIds.indexOf(id) !== -1 || (this.graphicsLayer && this.graphicsLayer.id === id);
      });

    if (!filteredResults || (filteredResults && filteredResults.length === 0)) {
      this._resetHitTestState();
      return;
    }

    const result = filteredResults[0] as HitTestResult;

    if (this._currentSketchExtentPhotoCentric) {
      const mapPoint = result && (result.mapPoint as __esri.Point);
      const containsPoint = this._currentSketchExtentPhotoCentric.contains(mapPoint);
      if (!containsPoint) {
        this._resetHitTestState();
        return;
      }

      const sketchWidgetVM = this.sketchWidget?.viewModel as __esri.SketchViewModel;
      if (result.graphic.layer === sketchWidgetVM.layer) {
        sketchWidgetVM.update([result.graphic], {
          tool: "transform"
        });
      }
    }

    this._resetHitTestState();

    const attachmentViewerData = this._getHitTestAttachmentViewerData(result);

    if (!attachmentViewerData) {
      return;
    }

    const objectIdField = attachmentViewerData?.layerData?.featureLayer?.objectIdField as string;
    const objectId = this._getHitTestGraphicObjectId(result, objectIdField);
    if (attachmentViewerData.featureObjectIds.indexOf(objectId) === -1) {
      return;
    }

    if (hitTestRes.results.length) {
      this._setClickedFeature(hitTestRes, attachmentViewerData);
    }
  }

  private _resetHitTestState(): void {
    this._removeFeatureHighlight();
    this._performingHitTestPhotoCentric = null;
    this.notifyChange("state");
    this.notifyChange("queryingState");
  }

  private _getHitTestAttachmentViewerData(result: HitTestResult): PhotoCentricData {
    return this.attachmentViewerDataCollection.find((attachmentViewerData) => {
      return attachmentViewerData?.layerData?.featureLayer?.id === result.graphic.layer.id;
    }) as PhotoCentricData;
  }

  private _getHitTestGraphicObjectId(result: any, objectIdField: string): number {
    return result && result.graphic && result.graphic.attributes && result.graphic.attributes[objectIdField];
  }

  private _setClickedFeature(hitTestRes: __esri.HitTestResult, attachmentViewerData: PhotoCentricData): void {
    const featureLayer = attachmentViewerData?.layerData?.featureLayer;

    const detectedFeature = hitTestRes.results.filter((result) => {
      // @ts-ignore comment.
      const { layer } = result.graphic;
      return layer.id === featureLayer?.id;
      // @ts-ignore
    })[0].graphic;
    attachmentViewerData.set("selectedFeature", detectedFeature);

    if (featureLayer?.id !== this.layerSwitcher?.selectedLayer?.id) {
      this.set("layerSwitcher.selectedLayer", featureLayer);
      this.set("layerSwitcher.selectedLayerId", featureLayer?.id);
      this.set("selectedAttachmentViewerData", attachmentViewerData);
    }

    this.updateSelectedFeatureFromClickOrSearch(detectedFeature);

    if (this.searchWidget?.selectedResult) {
      this.searchWidget?.clear();
    }
  }

  private _setSelectedFeature(selectedAttachmentViewerData: PhotoCentricData): __esri.Graphic {
    const layerFeatures = selectedAttachmentViewerData.get("layerFeatures") as __esri.Collection<__esri.Graphic>;

    const layerFeatureIndex = selectedAttachmentViewerData.get("layerFeatureIndex") as number;

    const selectedFeature = layerFeatures.getItemAt(layerFeatureIndex) as __esri.Graphic;

    selectedAttachmentViewerData.set("selectedFeature", selectedFeature);

    this.relatedFeatures?.queryRelatedFeatures(
      selectedFeature,
      selectedAttachmentViewerData?.layerData?.featureLayer as __esri.FeatureLayer
    );
    return selectedFeature;
  }

  private _setFeatureWidget(): void {
    const featureWidget = new Feature({
      graphic: this.selectedAttachmentViewerData?.selectedFeature as __esri.Graphic,
      map: this.view?.map,
      spatialReference: this.view?.spatialReference
    });

    this.set("featureWidget", featureWidget);
    this.featureWidget?.set("visibleElements.title", false);
    const featureWidgetKey = "feature-widget";
    this._photoCentricHandles?.add(this._watchFeatureWidgetLoad(featureWidgetKey), featureWidgetKey);
  }

  private _watchFeatureWidgetLoad(featureWidgetKey: string): __esri.WatchHandle {
    return when(
      () => this.featureWidget?.viewModel?.content,
      () => {
        this._photoCentricHandles?.remove(featureWidgetKey);
        this._setupFeatureWidgetContent();
      },
      { once: true }
    );
  }

  private _setupFeatureWidgetContent(): void {
    this.setFeatureInfo(this.featureWidget as __esri.Feature);
    const layerAttachments = this._extractLayerAttachments();
    if (!layerAttachments) {
      return;
    }
    this._setupFeatureAttachments(layerAttachments);
  }

  private _setupFeatureAttachments(layerAttachments: __esri.AttachmentInfo[]): void {
    let currentIndex: number | null = null;
    const attachmentExists = this._checkExistingAttachment();
    if (this.socialSharingEnabled && this.attachmentIndex !== null && attachmentExists) {
      this.set("selectedAttachmentViewerData.attachmentIndex", this.attachmentIndex);
      currentIndex = this.attachmentIndex;
      this.set("attachmentIndex", null);
    } else {
      this.set("selectedAttachmentViewerData.attachmentIndex", 0);
      currentIndex = 0;
    }

    const featureAttachments = this._sortFeatureAttachments(layerAttachments);
    const attachmentsArr = featureAttachments && featureAttachments.length > 0 ? featureAttachments : [];
    const attachments = new Collection([...attachmentsArr]);
    const selectedFeatureAttachments = new SelectedFeatureAttachments({
      attachments,
      currentIndex
    });
    this.set("selectedAttachmentViewerData.selectedFeatureAttachments", selectedFeatureAttachments);
  }

  private _checkExistingAttachment(): boolean {
    const attachments = this.selectedAttachmentViewerData?.attachments;
    const layerData = this.selectedAttachmentViewerData?.layerData;
    const selectedFeature = this.selectedAttachmentViewerData?.selectedFeature;
    const attributes = selectedFeature?.attributes;
    const objectIdField = layerData?.featureLayer?.objectIdField as string;
    const objectId = attributes[objectIdField];
    const featureAttachments = attachments?.[objectId];
    const currentAttachment = featureAttachments && featureAttachments[this.attachmentIndex as number];
    return !!currentAttachment;
  }

  private _extractLayerAttachments(): __esri.AttachmentInfo[] {
    const attributes = this.get("featureWidget.graphic.attributes");
    const objectIdField = this.get("selectedAttachmentViewerData.layerData.featureLayer.objectIdField") as string;
    const objectId = attributes && attributes[objectIdField];
    const attachments = this.get("selectedAttachmentViewerData.attachments");
    const layerAttachments = attachments && attachments[objectId];
    return layerAttachments ? layerAttachments : [];
  }

  private _sortFeatureAttachments(layerAttachments: __esri.AttachmentInfo[]): __esri.AttachmentInfo[] {
    const featureAttachments: __esri.AttachmentInfo[] = [];
    this.set("selectedAttachmentViewerData.unsupportedAttachmentTypes", []);

    if (layerAttachments) {
      layerAttachments &&
        layerAttachments.forEach((attachmentInfo) => {
          const { contentType } = attachmentInfo as __esri.AttachmentInfo;

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

  private async _goToSelectedFeature(): Promise<void> {
    let selectedFeature = this.selectedAttachmentViewerData?.selectedFeature;
    if (selectedFeature) {
      const relatedOriginFeature = selectedFeature
        ? await this.relatedFeatures?.viewModel.getRelatedOriginFeature(selectedFeature)
        : null;

      if (relatedOriginFeature) {
        selectedFeature = relatedOriginFeature;
      }

      (this.view as __esri.MapView).goTo(
        {
          target: selectedFeature
        },
        { animate: prefersReducedMotion() ? false : true }
      );
    }
  }

  private _handleSearchWidgets(): __esri.WatchHandle {
    return when(
      () => this.searchWidget,
      () => {
        this._photoCentricHandles?.add(this._watchSelectedSearchResults());
      },
      { once: true }
    );
  }

  private _watchSelectedSearchResults(): __esri.WatchHandle {
    return watch(
      () => this.searchWidget?.viewModel?.selectedResult,
      () => {
        const { searchWidget } = this;
        if (searchWidget) {
          const selectedFeatureResult = searchWidget.get("viewModel.selectedResult.feature") as __esri.Graphic;

          if (!selectedFeatureResult) {
            return;
          }

          const selectedFeatureResultId = selectedFeatureResult && (selectedFeatureResult.get("layer.id") as string);

          const selectedLayerId = this.get("selectedAttachmentViewerData.layerData.featureLayer.id") as string;

          if (selectedFeatureResultId !== selectedLayerId) {
            const updatedAttachmentViewerData = this.attachmentViewerDataCollection.find((attachmentViewerData) => {
              return attachmentViewerData?.layerData?.featureLayer?.id === selectedFeatureResultId;
            });

            if (!updatedAttachmentViewerData) {
              return;
            }

            const updatedLayer = updatedAttachmentViewerData.get("layerData.featureLayer") as __esri.FeatureLayer;

            this.set("layerSwitcher.selectedLayer", updatedLayer);
            this.set("layerSwitcher.selectedLayerId", updatedLayer.id);
            this.set("selectedAttachmentViewerData", updatedAttachmentViewerData);

            updatedAttachmentViewerData.set("selectedFeature", selectedFeatureResult);
          }

          this.updateSelectedFeatureFromClickOrSearch(selectedFeatureResult);
        }
      }
    );
  }

  private _setupSocialSharing(): void {
    const socialsharing = "social-sharing";
    this._photoCentricHandles?.add(
      when(
        () => this.socialSharingEnabled,
        () => {
          this._photoCentricHandles?.remove(socialsharing);
          this.setupShare();
        },
        { initial: true }
      ),
      socialsharing
    );
  }

  private _setAttachmentViewerData(): void {
    const { selectedLayerId, socialSharingEnabled } = this;
    const photoCentricDataCollection = this.attachmentViewerDataCollection as __esri.Collection<PhotoCentricData>;
    const attachmentViewerData = this._getAttachmentViewerData(
      selectedLayerId as string,
      socialSharingEnabled as boolean,
      photoCentricDataCollection
    );

    if (!attachmentViewerData) {
      return;
    }
    const featureLayer = attachmentViewerData?.layerData?.featureLayer;
    if ((selectedLayerId && socialSharingEnabled) || !this._currentSketchExtentPhotoCentric) {
      this.set("layerSwitcher.selectedLayer", featureLayer);
    }
    this.set("layerSwitcher.selectedLayerId", featureLayer?.id);
    this.set("selectedAttachmentViewerData", attachmentViewerData);
  }

  private _getAttachmentViewerData(
    selectedLayerId: string,
    socialSharingEnabled: boolean,
    attachmentViewerDataCollection: __esri.Collection<PhotoCentricData>
  ): PhotoCentricData {
    const dataThatSupportsAttachments = attachmentViewerDataCollection.find(
      (attachmentViewerData: PhotoCentricData) => {
        return !!attachmentViewerData?.layerData?.featureLayer?.capabilities?.data?.supportsAttachment;
      }
    );
    return selectedLayerId && socialSharingEnabled
      ? attachmentViewerDataCollection.find((attachmentViewerData) => {
          const id = attachmentViewerData?.layerData?.featureLayer?.id;
          return id === selectedLayerId;
        })
      : dataThatSupportsAttachments
      ? dataThatSupportsAttachments
      : attachmentViewerDataCollection.getItemAt(0);
  }

  private _setupDataWatchers(): void {
    const setupDataWatchers = "setup-data-watchers";
    if (this._photoCentricHandles?.has(setupDataWatchers)) {
      this._photoCentricHandles?.remove(setupDataWatchers);
    }
    this._photoCentricHandles?.add(
      [
        this._handleSearchWidgets(),
        watch(
          () => this.selectedAttachmentViewerData?.selectedFeature,
          () => {
            this._goToSelectedFeature();
          }
        )
      ],
      setupDataWatchers
    );
  }

  private _updateIndexData(queryType: string, objectId?: number): void {
    const selectedAttachmentViewerData = this.selectedAttachmentViewerData as PhotoCentricData;
    this._updateLayerFeatureAndObjectIdIndexes(selectedAttachmentViewerData, queryType, objectId as number);
    const selectedAttachmentViewerDataIndex = this.get("selectedAttachmentViewerData.attachmentIndex");
    const attachmentIndex = selectedAttachmentViewerDataIndex ? selectedAttachmentViewerDataIndex : 0;
    this.set("selectedAttachmentViewerData.attachmentIndex", attachmentIndex);
  }

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

  private _setFeaturePhotoCentric(): void {
    const selectedAttachmentViewerData = this.get("selectedAttachmentViewerData") as PhotoCentricData;
    if (!selectedAttachmentViewerData) {
      return;
    }

    const selectedFeature = this._setSelectedFeature(selectedAttachmentViewerData);

    if (selectedFeature) {
      this.getAddress(selectedFeature.geometry);
    }

    this._handleHighlight(selectedAttachmentViewerData, selectedFeature);
    this._setFeatureWidget();
  }

  private _setRelatedFeature(feature: __esri.Graphic, attachmentViewerData: PhotoCentricData): void {
    attachmentViewerData.set("selectedFeature", feature);
    this.set("layerSwitcher.selectedLayer", this.relatedFeatures?.destinationLayer);
    this.set("layerSwitcher.selectedLayerId", this.relatedFeatures?.destinationLayer?.id);
    this.set("selectedAttachmentViewerData", attachmentViewerData);
    this.updateSelectedFeatureFromClickOrSearch(feature);
    if (this.searchWidget?.selectedResult) {
      this.searchWidget?.clear();
    }
  }
  // ----------------------------------
  //
  //  Highlight
  //
  // ----------------------------------

  private _setSelectedFeatureHighlight(
    selectedAttachmentViewerData: PhotoCentricData,
    selectedFeature: __esri.Graphic
  ): void {
    this._removeFeatureHighlight();
    const layerView = selectedAttachmentViewerData?.layerData?.layerView;

    if (!layerView || !selectedFeature) return;
    this.highlightedFeature = layerView.highlight(selectedFeature);
  }

  private _removeFeatureHighlight(): void {
    if (this.highlightedFeature) this.highlightedFeature.remove();
    this.highlightedFeature = null;
  }

  private async _handleHighlight(
    selectedAttachmentViewerData: PhotoCentricData,
    selectedFeature: __esri.Graphic
  ): Promise<void> {
    const layerView = this.selectedAttachmentViewerData?.get("layerData.layerView") as __esri.FeatureLayerView;

    if (layerView) {
      this._setSelectedFeatureHighlight(selectedAttachmentViewerData, selectedFeature);
    } else {
      const destLayer = this.relatedFeatures?.viewModel?.getRelatedDestinationLayer(
        this.selectedAttachmentViewerData?.layerData?.featureLayer as __esri.FeatureLayer
      );

      if (!destLayer) {
        return;
      }

      const destLayerData = this.attachmentViewerDataCollection.find(
        (avData) => avData?.layerData?.featureLayer?.id === destLayer?.id
      ) as PhotoCentricData;

      if (destLayerData?.layerData?.layerView) {
        await this.relatedFeatures?.queryRelatedFeatures(
          selectedFeature,
          this.selectedAttachmentViewerData?.layerData?.featureLayer as __esri.FeatureLayer
        );

        const relatedFeature = this.relatedFeatures?.relatedFeatures?.getItemAt(0);

        const relatedFeatureOid =
          relatedFeature?.graphic?.attributes[(relatedFeature?.graphic?.layer as __esri.FeatureLayer).objectIdField];

        const featureToHighlight = destLayerData.layerFeatures.find(
          (feature) => relatedFeatureOid === feature.attributes[(feature.layer as __esri.FeatureLayer).objectIdField]
        );
        this._setSelectedFeatureHighlight(destLayerData, featureToHighlight);
      }
    }
  }

  // ----------------------------------
  //
  //  SCROLL FEATURES
  //
  // ----------------------------------

  // previousFeature
  previousFeature(): void {
    const selectedAttachmentViewerData = this.selectedAttachmentViewerData as PhotoCentricData;
    if (selectedAttachmentViewerData.layerFeatureIndex - 1 === -1) {
      this._updateFeatureData("updatingPrevious");
    } else {
      selectedAttachmentViewerData.layerFeatureIndex -= 1;
      selectedAttachmentViewerData.objectIdIndex -= 1;
      this._setFeaturePhotoCentric();
    }
    this.set("selectedAttachmentViewerData.selectedFeatureAttachments", null);
    this.setUpdateShareIndexes();
  }

  // nextFeature
  nextFeature(): void {
    const selectedAttachmentViewerData = this.selectedAttachmentViewerData as PhotoCentricData;
    if (selectedAttachmentViewerData.layerFeatureIndex === selectedAttachmentViewerData.layerFeatures.length - 1) {
      this._updateFeatureData("updatingNext");
    } else {
      selectedAttachmentViewerData.layerFeatureIndex += 1;
      selectedAttachmentViewerData.objectIdIndex += 1;
      this._setFeaturePhotoCentric();
    }
    this.set("selectedAttachmentViewerData.selectedFeatureAttachments", null);
    this.setUpdateShareIndexes();
  }

  private _updateFeatureData(updatingType: string): void {
    const selectedAttachmentViewerData = this.selectedAttachmentViewerData as PhotoCentricData;
    const featureTotal = selectedAttachmentViewerData.get("featureObjectIds.length") as number;
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
  private _updateQueryRange(updatingType: string, objectIdIndex?: number): void {
    const floor = Math.floor((objectIdIndex as number) / 10) * 10;
    const ceil = Math.ceil((objectIdIndex as number) / 10) * 10;

    const queryRange = this.selectedAttachmentViewerData?.get("queryRange") as number;
    // Update query range to query for next 10 features
    if (updatingType === "updatingNext") {
      const currentLow = queryRange[0];
      const updatedLow = queryRange[0] === 0 ? 10 : Math.round(currentLow / 10) * 10 + 10;
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
    else if (updatingType === "updatingClick" && (objectIdIndex || objectIdIndex === 0)) {
      const updatedLow = floor;
      const updatedHigh = objectIdIndex % 10 === 0 ? ceil + 10 : ceil;
      queryRange[0] = updatedLow;
      queryRange[1] = updatedHigh;
    }
    // Update query range based on defaultObjectId from share widget
    else if (updatingType === "share" && this.defaultObjectId) {
      const defaultObjectIdIndex = this.selectedAttachmentViewerData?.featureObjectIds?.indexOf(this.defaultObjectId);

      const objectIdIndex = (defaultObjectIdIndex !== -1 ? defaultObjectIdIndex : 0) as number;

      const shareFloor = Math.floor(objectIdIndex / 10) * 10;
      const shareCeil = Math.ceil(objectIdIndex / 10) * 10;

      const updatedLow = shareFloor;
      const updatedHigh = objectIdIndex % 10 === 0 ? shareCeil + 10 : shareCeil;
      queryRange[0] = updatedLow;
      queryRange[1] = updatedHigh;
    }
  }

  private _setupFeatureQuery(attachmentViewerData: PhotoCentricData): __esri.Query {
    const { order } = this;
    const featureLayer = attachmentViewerData?.layerData?.featureLayer;

    // Query for features only within the set query range
    const [low, high] = attachmentViewerData.queryRange;
    const updatedLow = low < 0 ? 0 : low;
    const currentSet = attachmentViewerData.featureObjectIds.slice(updatedLow, high);

    const objectIdField = featureLayer?.objectIdField;
    const fieldOrder = order ? order : "ASC";
    const orderByFieldsValue = attachmentViewerData.get("sortField")
      ? [`${attachmentViewerData.get("sortField")} ${fieldOrder}`]
      : [`${objectIdField} ${fieldOrder}`];

    const outSpatialReference = this.view && this.view.spatialReference ? this.view.spatialReference : null;

    const definitionExpression = attachmentViewerData.get("defaultLayerExpression") as string;
    const where = definitionExpression ? definitionExpression : "1=1";

    const cacheHint = featureLayer?.capabilities?.query?.supportsCacheHint;

    const queryConfig = {
      objectIds: currentSet.toArray(),
      outFields: ["*"],
      orderByFields: orderByFieldsValue,
      where,
      returnGeometry: true,
      outSpatialReference,
      cacheHint
    } as any;

    return new Query(queryConfig);
  }

  private _updateFeatureFromShare(): void {
    const selectedAttachmentViewerData = this.selectedAttachmentViewerData as PhotoCentricData;
    const { defaultObjectId } = this;
    const featureLayer = this.selectedAttachmentViewerData?.layerData?.featureLayer;
    const objectIdField = featureLayer?.objectIdField as string;
    const layerFeatureIndex = selectedAttachmentViewerData.layerFeatures.indexOf(
      selectedAttachmentViewerData.layerFeatures.find(
        (layerFeature) => layerFeature && layerFeature.attributes[objectIdField] === defaultObjectId
      )
    );
    const objectIdIndex = this.selectedAttachmentViewerData?.featureObjectIds?.indexOf(defaultObjectId as number);
    selectedAttachmentViewerData.layerFeatureIndex = layerFeatureIndex !== -1 ? layerFeatureIndex : 0;
    selectedAttachmentViewerData.objectIdIndex = (objectIdIndex !== -1 ? objectIdIndex : 0) as number;
  }

  // updateSelectedFeatureFromClickOrSearch
  updateSelectedFeatureFromClickOrSearch(feature: __esri.Graphic): void {
    const { featureObjectIds, selectedFeature, layerFeatures } = this.selectedAttachmentViewerData as PhotoCentricData;
    const featureLayer = this.selectedAttachmentViewerData?.layerData?.featureLayer;
    const objectIdField = featureLayer?.objectIdField as string;

    if (!selectedFeature) {
      return;
    }

    const layerFeature = layerFeatures.find((layerFeature) => {
      return layerFeature.attributes[objectIdField] === feature.attributes[objectIdField];
    });

    const layerFeatureIndex = layerFeatures.indexOf(layerFeature);
    const objectId = featureObjectIds.find((objectId) => {
      return feature.attributes[objectIdField] === objectId;
    });

    this.set("currentImageUrl", null);

    // If layer feature exists in current queried feature list, do not update query range or re-query features
    if (layerFeatureIndex !== -1) {
      this.set("selectedAttachmentViewerData.layerFeatureIndex", layerFeatureIndex);
      this.set(
        "selectedAttachmentViewerData.objectIdIndex",
        this.selectedAttachmentViewerData?.featureObjectIds?.indexOf(objectId)
      );
      this._setFeaturePhotoCentric();
      this.setUpdateShareIndexes();
      return;
    }

    const objectIdIndex = featureObjectIds.indexOf(objectId);
    this._updateQueryRange("updatingClick", objectIdIndex);
    this._queryFeaturesForSelectedAttachmentViewerData("updatingClick", objectId);
  }

  private async _queryFeaturesForSelectedAttachmentViewerData(
    queryType?: string,
    objectIdIndex?: number
  ): Promise<void> {
    const selectedAttachmentViewerData = this.selectedAttachmentViewerData as PhotoCentricData;

    this.set("layerSwitcher.selectedLayer", selectedAttachmentViewerData?.layerData?.featureLayer);

    const layerFeatures = selectedAttachmentViewerData.get("layerFeatures") as __esri.Collection<__esri.Graphic>;

    const featureLayer = this.selectedAttachmentViewerData?.layerData?.featureLayer;
    const featureQuery = await this._setupFeatureQuery(selectedAttachmentViewerData);
    this._queryingFeatures = featureLayer?.queryFeatures(featureQuery) as any;

    this._queryingFeatures
      ?.catch((err) => {
        console.error("ERROR: ", err);
      })
      .then(async (queriedFeatures: any) => {
        this._queryingFeatures = null;
        this.notifyChange("queryingState");
        // Reset features

        layerFeatures.removeAll();
        const [low, high] = selectedAttachmentViewerData.queryRange;

        const featureObjectIds = selectedAttachmentViewerData.get("featureObjectIds") as __esri.Collection<number>;

        const currentSet = featureObjectIds.slice(low, high);

        this._queryingAttachments = true;
        this.notifyChange("state");
        this.notifyChange("queryingState");
        console.log("HERE11111");
        const attachments = await this._handleQueryAttachments({
          attachmentViewerData: selectedAttachmentViewerData,
          queriedFeatures
        });

        selectedAttachmentViewerData.set("attachments", {
          ...selectedAttachmentViewerData.attachments,
          ...attachments
        });

        // this._setFeaturePhotoCentric();

        this._queryingAttachments = false;
        this.notifyChange("state");
        this.notifyChange("queryingState");

        // Sort features
        const features = this._sortFeatures(
          queriedFeatures,
          currentSet,
          selectedAttachmentViewerData
        ) as __esri.Graphic[];

        // Add features to layerFeatures prop
        layerFeatures.addMany(features);

        const layerFeatureIndex = selectedAttachmentViewerData.get("layerFeatureIndex") as number;

        selectedAttachmentViewerData.set("layerFeatureIndex", layerFeatureIndex !== null ? layerFeatureIndex : 0);

        this._updateIndexData(queryType as string, objectIdIndex);
        this.setUpdateShareIndexes();
        this._setFeaturePhotoCentric();
      });
    this.notifyChange("queryingState");
  }

  private _updateFeatureClick(objectId: number): void {
    const selectedAttachmentViewerData = this.selectedAttachmentViewerData as PhotoCentricData;
    const { layerFeatures } = this.selectedAttachmentViewerData as PhotoCentricData;
    const featureLayer = this.selectedAttachmentViewerData?.layerData?.featureLayer as __esri.FeatureLayer;
    selectedAttachmentViewerData.layerFeatureIndex = layerFeatures.indexOf(
      layerFeatures.find((layerFeature) => layerFeature.attributes[featureLayer.objectIdField] === objectId)
    );

    selectedAttachmentViewerData.objectIdIndex = this.selectedAttachmentViewerData?.featureObjectIds?.indexOf(
      objectId
    ) as number;
  }
}

export default PhotoCentricViewModel;
