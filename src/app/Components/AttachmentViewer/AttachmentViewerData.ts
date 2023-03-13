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

// esri.core
import Accessor from "@arcgis/core/core/Accessor";

// esri.core.accessorSupport
import { subclass, property } from "@arcgis/core/core/accessorSupport/decorators";

// SelectedFeatureAttachments
import SelectedFeatureAttachments from "./SelectedFeatureAttachments";

// esri.core.Collection
import Collection from "@arcgis/core/core/Collection";

// AttachmentViewerLayerData
import AttachmentViewerLayerData from "./AttachmentViewerLayerData";

@subclass("AttachmentViewerData")
class AttachmentViewerData extends Accessor {
  // attachments
  @property()
  attachments: { [oid: number]: __esri.AttachmentInfo[] } | null = null;

  @property()
  defaultLayerExpression: string | null = null;

  // featureLayerTitle
  @property()
  featureLayerTitle: string | null = null;

  // layerData
  @property()
  layerData: AttachmentViewerLayerData | null = null;

  // selectedFeature
  @property()
  selectedFeature: __esri.Graphic | null = null;

  // selectedFeatureInfo
  @property()
  selectedFeatureInfo: any = null;

  // selectedFeatureAttachments
  @property()
  selectedFeatureAttachments: SelectedFeatureAttachments | null = null;

  // selectedFeatureAddress
  @property()
  selectedFeatureAddress: string | null = null;

  // unsupportedAttachmentTypes
  @property()
  unsupportedAttachmentTypes: __esri.AttachmentInfo[] = [];

  // defaultObjectId
  @property()
  defaultObjectId: number | null = null;

  // attachmentIndex
  @property()
  attachmentIndex: number = 0;

  // featureObjectIds
  @property()
  featureObjectIds: Collection<number> = new Collection();

  @property()
  sortField: string | null = null;

  // objectIdIndex
  @property()
  objectIdIndex: number = 0;

  // selectedLayerId
  @property()
  selectedLayerId: string | null = null;

  // layerFeatureIndex
  @property()
  layerFeatureIndex: number = 0;
}

export default AttachmentViewerData;
