/*
  Copyright 2020 Esri
  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at
    http://www.apache.org/licenses/LICENSE-2.0
  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.​
*/

import Accessor = require("esri/core/Accessor");
import { ApplicationConfig } from "../application-base-js/interfaces";

interface AttachmentViewerLayerData extends Accessor {
  featureLayer: __esri.FeatureLayer;
  layerView: __esri.FeatureLayerView;
  start: number;
}

interface SelectedFeatureAttachments extends Accessor {
  attachments: __esri.Collection<__esri.AttachmentInfo>;
  currentIndex: number;
}

interface AttachmentViewerData extends Accessor {
  attachments: any;
  defaultLayerExpression: string;
  featureLayerTitle: string;
  layerData: AttachmentViewerLayerData;
  selectedFeature: __esri.Graphic;
  selectedFeatureInfo: any;
  selectedFeatureAttachments: SelectedFeatureAttachments;
  selectedFeatureAddress: string;
  unsupportedAttachmentTypes: __esri.AttachmentInfo[];
  defaultObjectId: number;
  attachmentIndex: number;
  featureObjectIds: __esri.Collection<number>;
  sortField: string;
  objectIdIndex: number;
  selectedLayerId: string;
  layerFeatureIndex: number;
}

interface PhotoCentricData extends AttachmentViewerData {
  queryRange: number[];
  layerFeatures: __esri.Collection<__esri.Graphic>;
}

interface MapCentricData extends AttachmentViewerData {
  attachmentDataCollection: __esri.Collection<AttachmentData>;
  attachmentsHaveMoreThanOne: boolean;
}

export type VNode = {
  /* avoids exposing vdom implementation details */
};

interface Fields {
  id: string;
  fields: string[];
}

export interface SelectedLayer {
  id: string;
  fields: Fields[];
}

export interface AttachmentData {
  attachments: __esri.AttachmentInfo[];
  objectId: number;
}

export interface NavItem {
  type: string;
  iconClass: string;
}

export interface PhotoCentricOIDPromise {
  attachmentViewerData: PhotoCentricData;
  objectIds: number[];
}

export interface MapCentricOIDPromise {
  attachmentViewerData: MapCentricData;
  objectIds: number[];
}

export interface MapCentricAttachmentsPromise {
  featureLayer: __esri.FeatureLayer;
  attachments: any;
}

export interface MapCentricLayerViewPromise {
  attachments: any;
  layerView: __esri.FeatureLayerView;
}

export interface MapCentricAttachmentDataPromise {
  features: __esri.FeatureSet;
  attachmentViewerData: MapCentricData;
}

export interface PhotoCentricFeaturesPromise {
  attachmentViewerData: PhotoCentricData;
  queriedFeatures: __esri.FeatureSet;
}

export interface HitTestResult {
  graphic: __esri.Graphic;
  mapPoint: __esri.Point;
}

export interface esriWidgetProps extends __esri.WidgetProperties {
  config: ApplicationConfig;
  view?: __esri.MapView;
  portal?: __esri.Portal;
  propertyName?: string;
  docDirection?: string;
}
