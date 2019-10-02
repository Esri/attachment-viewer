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
define(["require", "exports", "esri/core/tsSupport/declareExtendsHelper", "esri/core/tsSupport/decorateHelper", "esri/core/accessorSupport/decorators", "dojo/i18n!./LayerSwitcher/nls/resources", "esri/widgets/Widget", "esri/widgets/support/widget", "./LayerSwitcher/LayerSwitcherViewModel"], function (require, exports, __extends, __decorate, decorators_1, i18n, Widget, widget_1, LayerSwitcherViewModel) {
    "use strict";
    //----------------------------------
    //
    //  CSS Classes
    //
    //----------------------------------
    var CSS = {
        base: "esri-layer-switcher",
        layerSwitcherPhotoCentric: "esri-layer-switcher__photo-centric",
        layerSwitcherMapCentric: "esri-layer-switcher__map-centric",
        layerItem: "esri-layer-switcher__layer-item",
        layerItemSelected: "esri-layer-switcher__layer-item--selected",
        selectLayerDropDown: "esri-layer-switcher__select-layer-dropdown",
        selectLayerDropDownTitle: "esri-layer-switcher__select-layer-dropdown-title",
        featureLayerTitleContainer: "esri-layer-switcher__feature-layer-title-container",
        checkMarkContainer: "esri-layer-switcher__check-mark-container",
        arrowContainer: "esri-layer-switcher__arrow-container",
        dropDownList: "esri-layer-switcher__layer-dropdown-list",
        dropDownArrowIcon: "esri-layer-switcher__dropdown-arrow-icon",
        svg: "esri-attachment-viewer__svg",
        mediaLayerIcon: "esri-photo-centric-media-layer-icon",
        arrowButtonContainer: "esri-layer-switcher__arrow-button-container",
        dropDownMapCentric: "esri-layer-switcher__dropdown-map-centric",
        dropdownList: "esri-layer-switcher-dropdown-list",
        icons: {
            upArrowIcon: "icon-ui-up-arrow ",
            downArrowIcon: "icon-ui-down-arrow",
            flushIcon: "icon-ui-flush",
            layersIcon: "icon-ui-layers",
            checkMark: "esri-icon-check-mark"
        }
    };
    var LayerSwitcher = /** @class */ (function (_super) {
        __extends(LayerSwitcher, _super);
        function LayerSwitcher(value) {
            var _this = _super.call(this) || this;
            // _dropDownIsOpen
            _this._dropDownIsOpen = null;
            _this.appMode = null;
            // view
            _this.view = null;
            // featureLayerCollection
            _this.featureLayerCollection = null;
            // mapCentricViewModel
            _this.mapCentricViewModel = null;
            // selectedLayer
            _this.selectedLayer = null;
            // selectedLayer
            _this.selectedLayerId = null;
            // viewModel
            _this.viewModel = new LayerSwitcherViewModel();
            return _this;
        }
        LayerSwitcher.prototype.render = function () {
            var _a;
            var layers = this._renderLayerItems();
            var arrowIcon = (_a = {},
                _a[CSS.icons.upArrowIcon] = this._dropDownIsOpen,
                _a[CSS.icons.downArrowIcon] = !this._dropDownIsOpen,
                _a);
            var selectedLayerTitle = this.get("selectedLayer.title");
            var title = selectedLayerTitle && selectedLayerTitle.length > 30
                ? selectedLayerTitle
                    .split("")
                    .slice(0, 30)
                    .join("") + "..."
                : selectedLayerTitle;
            var layerTitleToDisplay = title ? title : null;
            return (widget_1.tsx("div", { class: CSS.base },
                this.appMode === "photo-centric" ? (widget_1.tsx("button", { bind: this, onclick: this._toggleLayerDropdown, onkeydown: this._toggleLayerDropdown, class: this.classes(CSS.selectLayerDropDown, CSS.layerSwitcherPhotoCentric), tabIndex: 0 },
                    widget_1.tsx("svg", { class: this.classes(CSS.svg, CSS.mediaLayerIcon) },
                        widget_1.tsx("g", null,
                            widget_1.tsx("path", { d: "M8.1,1.7L0.1,6.3L8.1,11L16,6.3L8.1,1.7z M2.9,6.3l5.2-3l5.2,3l-5.2,3L2.9,6.3z" }),
                            widget_1.tsx("polygon", { points: "8.1,11.6 2.7,8.5 0.1,10 8.1,14.5 16,10 13.4,8.5" }))),
                    widget_1.tsx("span", { class: this.classes(CSS.dropDownArrowIcon, arrowIcon, CSS.icons.flushIcon) }))) : (widget_1.tsx("div", { class: CSS.dropDownMapCentric },
                    layerTitleToDisplay ? (widget_1.tsx("div", { key: "layer-switcher-dropdown", class: this.classes(CSS.selectLayerDropDown, CSS.layerSwitcherMapCentric) },
                        widget_1.tsx("span", { class: CSS.svg },
                            widget_1.tsx("svg", { class: CSS.svg },
                                widget_1.tsx("g", null,
                                    widget_1.tsx("path", { d: "M8.1,1.7L0.1,6.3L8.1,11L16,6.3L8.1,1.7z M2.9,6.3l5.2-3l5.2,3l-5.2,3L2.9,6.3z" }),
                                    widget_1.tsx("polygon", { points: "8.1,11.6 2.7,8.5 0.1,10 8.1,14.5 16,10 13.4,8.5 \t" })))),
                        widget_1.tsx("span", { class: CSS.selectLayerDropDownTitle }, layerTitleToDisplay))) : null,
                    this.featureLayerCollection &&
                        this.featureLayerCollection.length > 1 ? (widget_1.tsx("div", { class: CSS.arrowButtonContainer },
                        widget_1.tsx("button", { bind: this, onclick: this._toggleLayerDropdown, onkeydown: this._toggleLayerDropdown, class: CSS.arrowContainer, title: i18n.selectLayerToViewAttachments, tabIndex: 0 },
                            widget_1.tsx("span", { class: this.classes(CSS.dropDownArrowIcon, arrowIcon, CSS.icons.flushIcon) })))) : null)),
                this._dropDownIsOpen ? (widget_1.tsx("div", { key: CSS.dropdownList, class: CSS.dropDownList }, layers)) : null));
        };
        LayerSwitcher.prototype._toggleLayerDropdown = function () {
            if (this._dropDownIsOpen) {
                this._dropDownIsOpen = false;
            }
            else {
                this._dropDownIsOpen = true;
            }
            this.scheduleRender();
        };
        LayerSwitcher.prototype._renderLayerItems = function () {
            var _this = this;
            if (!this.featureLayerCollection) {
                return;
            }
            return this.featureLayerCollection
                .toArray()
                .map(function (featureLayer) {
                return _this._renderLayerItem(featureLayer);
            });
        };
        LayerSwitcher.prototype._renderLayerItem = function (featureLayer) {
            var title = featureLayer && featureLayer.title;
            var layerItemTitle = title ? title : null;
            return (widget_1.tsx("div", { bind: this, class: CSS.layerItem, onclick: this._setLayer, onkeydown: this._setLayer, "data-layer-item": featureLayer, tabIndex: 0, role: "button" },
                widget_1.tsx("div", { class: CSS.featureLayerTitleContainer }, layerItemTitle),
                this.selectedLayer && this.selectedLayer.id === featureLayer.id ? (widget_1.tsx("div", { key: "" + featureLayer.id, class: CSS.checkMarkContainer },
                    widget_1.tsx("span", { class: CSS.icons.checkMark }))) : null));
        };
        LayerSwitcher.prototype._setLayer = function (event) {
            if (this.mapCentricViewModel &&
                this.mapCentricViewModel.featureContentPanelIsOpen) {
                this.set("mapCentricViewModel.featureContentPanelIsOpen", false);
            }
            var node = event.currentTarget;
            var featureLayer = node["data-layer-item"];
            this.viewModel.setLayer(featureLayer);
            this._dropDownIsOpen = false;
            this.scheduleRender();
        };
        __decorate([
            decorators_1.property()
        ], LayerSwitcher.prototype, "appMode", void 0);
        __decorate([
            decorators_1.aliasOf("viewModel.view"),
            decorators_1.property()
        ], LayerSwitcher.prototype, "view", void 0);
        __decorate([
            decorators_1.aliasOf("viewModel.featureLayerCollection"),
            decorators_1.property()
        ], LayerSwitcher.prototype, "featureLayerCollection", void 0);
        __decorate([
            decorators_1.aliasOf("viewModel.mapCentricViewModel"),
            decorators_1.property()
        ], LayerSwitcher.prototype, "mapCentricViewModel", void 0);
        __decorate([
            decorators_1.aliasOf("viewModel.selectedLayer"),
            decorators_1.property()
        ], LayerSwitcher.prototype, "selectedLayer", void 0);
        __decorate([
            decorators_1.aliasOf("viewModel.selectedLayerId"),
            decorators_1.property()
        ], LayerSwitcher.prototype, "selectedLayerId", void 0);
        __decorate([
            decorators_1.property({
                type: LayerSwitcherViewModel
            }),
            widget_1.renderable()
        ], LayerSwitcher.prototype, "viewModel", void 0);
        __decorate([
            widget_1.accessibleHandler()
        ], LayerSwitcher.prototype, "_toggleLayerDropdown", null);
        __decorate([
            widget_1.accessibleHandler()
        ], LayerSwitcher.prototype, "_setLayer", null);
        LayerSwitcher = __decorate([
            decorators_1.subclass("LayerSwitcher")
        ], LayerSwitcher);
        return LayerSwitcher;
    }(decorators_1.declared(Widget)));
    return LayerSwitcher;
});
//# sourceMappingURL=LayerSwitcher.js.map