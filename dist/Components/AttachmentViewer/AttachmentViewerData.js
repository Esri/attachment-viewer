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
define(["require", "exports", "tslib", "esri/core/Accessor", "esri/core/accessorSupport/decorators", "esri/core/Collection"], function (require, exports, tslib_1, Accessor, decorators_1, Collection) {
    "use strict";
    var AttachmentViewerData = /** @class */ (function (_super) {
        tslib_1.__extends(AttachmentViewerData, _super);
        function AttachmentViewerData() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            // attachments
            _this.attachments = null;
            _this.defaultLayerExpression = null;
            // featureLayerTitle
            _this.featureLayerTitle = null;
            // layerData
            _this.layerData = null;
            // selectedFeature
            _this.selectedFeature = null;
            // selectedFeatureInfo
            _this.selectedFeatureInfo = null;
            // selectedFeatureAttachments
            _this.selectedFeatureAttachments = null;
            // selectedFeatureAddress
            _this.selectedFeatureAddress = null;
            // unsupportedAttachmentTypes
            _this.unsupportedAttachmentTypes = [];
            // defaultObjectId
            _this.defaultObjectId = null;
            // attachmentIndex
            _this.attachmentIndex = 0;
            // featureObjectIds
            _this.featureObjectIds = new Collection();
            _this.sortField = null;
            // objectIdIndex
            _this.objectIdIndex = 0;
            // selectedLayerId
            _this.selectedLayerId = null;
            // layerFeatureIndex
            _this.layerFeatureIndex = 0;
            return _this;
        }
        tslib_1.__decorate([
            decorators_1.property()
        ], AttachmentViewerData.prototype, "attachments", void 0);
        tslib_1.__decorate([
            decorators_1.property()
        ], AttachmentViewerData.prototype, "defaultLayerExpression", void 0);
        tslib_1.__decorate([
            decorators_1.property()
        ], AttachmentViewerData.prototype, "featureLayerTitle", void 0);
        tslib_1.__decorate([
            decorators_1.property()
        ], AttachmentViewerData.prototype, "layerData", void 0);
        tslib_1.__decorate([
            decorators_1.property()
        ], AttachmentViewerData.prototype, "selectedFeature", void 0);
        tslib_1.__decorate([
            decorators_1.property()
        ], AttachmentViewerData.prototype, "selectedFeatureInfo", void 0);
        tslib_1.__decorate([
            decorators_1.property()
        ], AttachmentViewerData.prototype, "selectedFeatureAttachments", void 0);
        tslib_1.__decorate([
            decorators_1.property()
        ], AttachmentViewerData.prototype, "selectedFeatureAddress", void 0);
        tslib_1.__decorate([
            decorators_1.property()
        ], AttachmentViewerData.prototype, "unsupportedAttachmentTypes", void 0);
        tslib_1.__decorate([
            decorators_1.property()
        ], AttachmentViewerData.prototype, "defaultObjectId", void 0);
        tslib_1.__decorate([
            decorators_1.property()
        ], AttachmentViewerData.prototype, "attachmentIndex", void 0);
        tslib_1.__decorate([
            decorators_1.property()
        ], AttachmentViewerData.prototype, "featureObjectIds", void 0);
        tslib_1.__decorate([
            decorators_1.property()
        ], AttachmentViewerData.prototype, "sortField", void 0);
        tslib_1.__decorate([
            decorators_1.property()
        ], AttachmentViewerData.prototype, "objectIdIndex", void 0);
        tslib_1.__decorate([
            decorators_1.property()
        ], AttachmentViewerData.prototype, "selectedLayerId", void 0);
        tslib_1.__decorate([
            decorators_1.property()
        ], AttachmentViewerData.prototype, "layerFeatureIndex", void 0);
        AttachmentViewerData = tslib_1.__decorate([
            decorators_1.subclass("AttachmentViewerData")
        ], AttachmentViewerData);
        return AttachmentViewerData;
    }(Accessor));
    return AttachmentViewerData;
});
//# sourceMappingURL=AttachmentViewerData.js.map