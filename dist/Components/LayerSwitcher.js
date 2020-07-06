// Copyright 2020 Esri
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//   http://www.apache.org/licenses/LICENSE-2.0
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.​
define(["require", "exports", "tslib", "esri/core/accessorSupport/decorators", "dojo/i18n!./LayerSwitcher/nls/resources", "esri/widgets/Widget", "esri/widgets/support/widget", "./LayerSwitcher/LayerSwitcherViewModel"], function (require, exports, tslib_1, decorators_1, resources_1, Widget, widget_1, LayerSwitcherViewModel) {
    "use strict";
    resources_1 = tslib_1.__importDefault(resources_1);
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
        tslib_1.__extends(LayerSwitcher, _super);
        function LayerSwitcher(value) {
            var _this = _super.call(this, value) || this;
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
                ? selectedLayerTitle.split("").slice(0, 30).join("") + "..."
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
                        widget_1.tsx("button", { bind: this, onclick: this._toggleLayerDropdown, onkeydown: this._toggleLayerDropdown, class: CSS.arrowContainer, title: resources_1.default.selectLayerToViewAttachments, tabIndex: 0 },
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
            return tslib_1.__awaiter(this, void 0, void 0, function () {
                var node, featureLayer, extent;
                return tslib_1.__generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (this.mapCentricViewModel &&
                                this.mapCentricViewModel.featureContentPanelIsOpen) {
                                this.set("mapCentricViewModel.featureContentPanelIsOpen", false);
                            }
                            node = event.currentTarget;
                            featureLayer = node["data-layer-item"];
                            return [4 /*yield*/, featureLayer.queryExtent()];
                        case 1:
                            extent = _a.sent();
                            if (!extent) return [3 /*break*/, 3];
                            return [4 /*yield*/, this.view.goTo(extent)];
                        case 2:
                            _a.sent();
                            _a.label = 3;
                        case 3:
                            this.viewModel.setLayer(featureLayer);
                            this._dropDownIsOpen = false;
                            this.scheduleRender();
                            return [2 /*return*/];
                    }
                });
            });
        };
        tslib_1.__decorate([
            decorators_1.property(),
            widget_1.renderable()
        ], LayerSwitcher.prototype, "appMode", void 0);
        tslib_1.__decorate([
            decorators_1.aliasOf("viewModel.view"),
            decorators_1.property()
        ], LayerSwitcher.prototype, "view", void 0);
        tslib_1.__decorate([
            decorators_1.aliasOf("viewModel.featureLayerCollection"),
            decorators_1.property()
        ], LayerSwitcher.prototype, "featureLayerCollection", void 0);
        tslib_1.__decorate([
            decorators_1.aliasOf("viewModel.mapCentricViewModel"),
            decorators_1.property()
        ], LayerSwitcher.prototype, "mapCentricViewModel", void 0);
        tslib_1.__decorate([
            decorators_1.aliasOf("viewModel.selectedLayer"),
            decorators_1.property()
        ], LayerSwitcher.prototype, "selectedLayer", void 0);
        tslib_1.__decorate([
            decorators_1.aliasOf("viewModel.selectedLayerId"),
            decorators_1.property()
        ], LayerSwitcher.prototype, "selectedLayerId", void 0);
        tslib_1.__decorate([
            decorators_1.property({
                type: LayerSwitcherViewModel
            }),
            widget_1.renderable()
        ], LayerSwitcher.prototype, "viewModel", void 0);
        tslib_1.__decorate([
            widget_1.accessibleHandler()
        ], LayerSwitcher.prototype, "_toggleLayerDropdown", null);
        tslib_1.__decorate([
            widget_1.accessibleHandler()
        ], LayerSwitcher.prototype, "_setLayer", null);
        LayerSwitcher = tslib_1.__decorate([
            decorators_1.subclass("LayerSwitcher")
        ], LayerSwitcher);
        return LayerSwitcher;
    }(Widget));
    return LayerSwitcher;
});
//# sourceMappingURL=LayerSwitcher.js.map