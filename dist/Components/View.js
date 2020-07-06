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
define(["require", "exports", "esri/core/tsSupport/declareExtendsHelper", "esri/core/tsSupport/decorateHelper", "esri/core/accessorSupport/decorators", "esri/widgets/support/widget", "esri/widgets/Widget", "./utils/utils"], function (require, exports, __extends, __decorate, decorators_1, widget_1, Widget, utils_1) {
    "use strict";
    var ViewWidget = /** @class */ (function (_super) {
        __extends(ViewWidget, _super);
        function ViewWidget(params) {
            var _this = _super.call(this, params) || this;
            _this.view = null;
            return _this;
        }
        ViewWidget.prototype.render = function () {
            return widget_1.tsx("div", { bind: this.view.container, afterCreate: utils_1.attachToNode });
        };
        __decorate([
            decorators_1.property(),
            widget_1.renderable()
        ], ViewWidget.prototype, "view", void 0);
        ViewWidget = __decorate([
            decorators_1.subclass("ViewWidget")
        ], ViewWidget);
        return ViewWidget;
    }(decorators_1.declared(Widget)));
    return ViewWidget;
});
//# sourceMappingURL=View.js.map