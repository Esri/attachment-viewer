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
define(["require", "exports", "esri/core/tsSupport/declareExtendsHelper", "esri/core/tsSupport/decorateHelper", "esri/core/Collection", "esri/core/accessorSupport/decorators", "../AttachmentViewer/AttachmentViewerData"], function (require, exports, __extends, __decorate, Collection, decorators_1, AttachmentViewerData) {
    "use strict";
    var MapCentricData = /** @class */ (function (_super) {
        __extends(MapCentricData, _super);
        function MapCentricData() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            // attachmentDataCollection
            _this.attachmentDataCollection = new Collection();
            // attachmentsHaveMoreThanOne
            _this.attachmentsHaveMoreThanOne = null;
            return _this;
        }
        __decorate([
            decorators_1.property()
        ], MapCentricData.prototype, "attachmentDataCollection", void 0);
        __decorate([
            decorators_1.property()
        ], MapCentricData.prototype, "attachmentsHaveMoreThanOne", void 0);
        MapCentricData = __decorate([
            decorators_1.subclass("MapCentricData")
        ], MapCentricData);
        return MapCentricData;
    }(decorators_1.declared(AttachmentViewerData)));
    return MapCentricData;
});
//# sourceMappingURL=MapCentricData.js.map