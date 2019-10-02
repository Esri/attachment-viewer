/// <amd-dependency path="esri/core/tsSupport/declareExtendsHelper" name="__extends" />
/// <amd-dependency path="esri/core/tsSupport/decorateHelper" name="__decorate" />
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
define(["require", "exports", "esri/core/tsSupport/declareExtendsHelper", "esri/core/tsSupport/decorateHelper", "esri/core/Accessor", "esri/core/accessorSupport/decorators", "esri/core/Collection"], function (require, exports, __extends, __decorate, Accessor, decorators_1, Collection) {
    "use strict";
    var AttachmentViewerData = /** @class */ (function (_super) {
        __extends(AttachmentViewerData, _super);
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
            _this.layerFeatureIndex = null;
            return _this;
        }
        __decorate([
            decorators_1.property()
        ], AttachmentViewerData.prototype, "attachments", void 0);
        __decorate([
            decorators_1.property()
        ], AttachmentViewerData.prototype, "defaultLayerExpression", void 0);
        __decorate([
            decorators_1.property()
        ], AttachmentViewerData.prototype, "featureLayerTitle", void 0);
        __decorate([
            decorators_1.property()
        ], AttachmentViewerData.prototype, "layerData", void 0);
        __decorate([
            decorators_1.property()
        ], AttachmentViewerData.prototype, "selectedFeature", void 0);
        __decorate([
            decorators_1.property()
        ], AttachmentViewerData.prototype, "selectedFeatureInfo", void 0);
        __decorate([
            decorators_1.property()
        ], AttachmentViewerData.prototype, "selectedFeatureAttachments", void 0);
        __decorate([
            decorators_1.property()
        ], AttachmentViewerData.prototype, "selectedFeatureAddress", void 0);
        __decorate([
            decorators_1.property()
        ], AttachmentViewerData.prototype, "unsupportedAttachmentTypes", void 0);
        __decorate([
            decorators_1.property()
        ], AttachmentViewerData.prototype, "defaultObjectId", void 0);
        __decorate([
            decorators_1.property()
        ], AttachmentViewerData.prototype, "attachmentIndex", void 0);
        __decorate([
            decorators_1.property()
        ], AttachmentViewerData.prototype, "featureObjectIds", void 0);
        __decorate([
            decorators_1.property()
        ], AttachmentViewerData.prototype, "sortField", void 0);
        __decorate([
            decorators_1.property()
        ], AttachmentViewerData.prototype, "objectIdIndex", void 0);
        __decorate([
            decorators_1.property()
        ], AttachmentViewerData.prototype, "selectedLayerId", void 0);
        __decorate([
            decorators_1.property()
        ], AttachmentViewerData.prototype, "layerFeatureIndex", void 0);
        AttachmentViewerData = __decorate([
            decorators_1.subclass("AttachmentViewerData")
        ], AttachmentViewerData);
        return AttachmentViewerData;
    }(decorators_1.declared(Accessor)));
    return AttachmentViewerData;
});
//# sourceMappingURL=AttachmentViewerData.js.map