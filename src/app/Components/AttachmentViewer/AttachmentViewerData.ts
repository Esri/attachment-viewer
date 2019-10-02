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

// esri.core.accessorSupport
import {
  subclass,
  declared,
  property
} from "esri/core/accessorSupport/decorators";

// SelectedFeatureAttachments
import SelectedFeatureAttachments = require("./SelectedFeatureAttachments");

// esri.core.Collection
import Collection = require("esri/core/Collection");

// AttachmentViewerLayerData
import AttachmentViewerLayerData = require("./AttachmentViewerLayerData");

@subclass("AttachmentViewerData")
class AttachmentViewerData extends declared(Accessor) {
  // attachments
  @property()
  attachments: any = null;

  @property()
  defaultLayerExpression: string = null;

  // featureLayerTitle
  @property()
  featureLayerTitle: string = null;

  // layerData
  @property()
  layerData: AttachmentViewerLayerData = null;

  // selectedFeature
  @property()
  selectedFeature: __esri.Graphic = null;

  // selectedFeatureInfo
  @property()
  selectedFeatureInfo: any = null;

  // selectedFeatureAttachments
  @property()
  selectedFeatureAttachments: SelectedFeatureAttachments = null;

  // selectedFeatureAddress
  @property()
  selectedFeatureAddress: string = null;

  // unsupportedAttachmentTypes
  @property()
  unsupportedAttachmentTypes: __esri.AttachmentInfo[] = [];

  // defaultObjectId
  @property()
  defaultObjectId: number = null;

  // attachmentIndex
  @property()
  attachmentIndex: number = 0;

  // featureObjectIds
  @property()
  featureObjectIds: Collection<number> = new Collection();

  @property()
  sortField: string = null;

  // objectIdIndex
  @property()
  objectIdIndex: number = 0;

  // selectedLayerId
  @property()
  selectedLayerId: string = null;

  // layerFeatureIndex
  @property()
  layerFeatureIndex: number = null;
}

export = AttachmentViewerData;
