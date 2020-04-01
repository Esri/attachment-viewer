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
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
define(["require", "exports", "ApplicationBase/support/itemUtils", "ApplicationBase/support/domHelper", "dojo/i18n!./nls/common", "dojo/i18n!./Components/MapCentric/nls/resources", "esri/widgets/Expand", "esri/widgets/Fullscreen", "esri/widgets/Home", "esri/widgets/LayerList", "esri/widgets/Legend", "esri/widgets/Sketch", "esri/widgets/Search", "esri/widgets/Zoom", "esri/core/Collection", "esri/core/Handles", "esri/core/watchUtils", "esri/layers/FeatureLayer", "esri/layers/GraphicsLayer", "./Components/LayerSwitcher", "./Components/MapCentric", "./Components/MobileExpand", "./Components/OnboardingContent", "./Components/PhotoCentric"], function (require, exports, itemUtils_1, domHelper_1, i18n, i18nMapCentric, Expand, FullScreen, Home, LayerList, Legend, Sketch, Search, Zoom, Collection, Handles, watchUtils, FeatureLayer, GraphicsLayer, LayerSwitcher, MapCentric, MobileExpand, OnboardingContent, PhotoCentric) {
    "use strict";
    var CSS = {
        loading: "configurable-application--loading"
    };
    var AttachmentViewerApp = /** @class */ (function () {
        function AttachmentViewerApp() {
            //--------------------------------------------------------------------------
            //
            //  Properties
            //
            //--------------------------------------------------------------------------
            //----------------------------------
            //  ApplicationBase
            //----------------------------------
            this.app = null;
            this.base = null;
            this.graphicsLayer = null;
            this.handles = new Handles();
            this.layerList = null;
            this.layerSwitcher = null;
            this.searchWidget = null;
            this.sketchWidget = null;
            this.view = null;
            this.widgets = new Collection();
        }
        //--------------------------------------------------------------------------
        //
        //  Public Methods
        //
        //--------------------------------------------------------------------------
        AttachmentViewerApp.prototype.init = function (base) {
            var _this = this;
            if (!base) {
                console.error("ApplicationBase is not defined");
                return;
            }
            var config = base.config, results = base.results, settings = base.settings;
            this._applySharedTheme(config);
            domHelper_1.setPageLocale(base.locale);
            domHelper_1.setPageDirection(base.direction);
            this.base = base;
            var addressEnabled = config.addressEnabled, appMode = config.appMode, attachmentLayer = config.attachmentLayer, attachmentLayers = config.attachmentLayers, showOnboardingOnStart = config.showOnboardingOnStart, downloadEnabled = config.downloadEnabled, find = config.find, fullScreenEnabled = config.fullScreenEnabled, homeEnabled = config.homeEnabled, imageDirectionEnabled = config.imageDirectionEnabled, imagePanZoomEnabled = config.imagePanZoomEnabled, layerListEnabled = config.layerListEnabled, legendEnabled = config.legendEnabled, mapCentricTooltipEnabled = config.mapCentricTooltipEnabled, photoCentricMobileMapExpanded = config.photoCentricMobileMapExpanded, mapToolsExpanded = config.mapToolsExpanded, marker = config.marker, onboardingIsEnabled = config.onboardingIsEnabled, onboardingButtonText = config.onboardingButtonText, onboardingImage = config.onboardingImage, onlyDisplayFeaturesWithAttachmentsIsEnabled = config.onlyDisplayFeaturesWithAttachmentsIsEnabled, order = config.order, searchConfig = config.searchConfig, searchEnabled = config.searchEnabled, searchExpanded = config.searchExpanded, selectFeaturesEnabled = config.selectFeaturesEnabled, socialSharingEnabled = config.socialSharingEnabled, title = config.title, zoomEnabled = config.zoomEnabled, zoomLevel = config.zoomLevel;
            var webMapItems = results.webMapItems;
            var validWebMapItems = webMapItems.map(function (response) {
                return response.value;
            });
            var firstItem = validWebMapItems[0];
            if (!firstItem) {
                var error = "Could not load an item to display";
                document.body.classList.remove("configurable-application--loading");
                document.body.classList.add("app-error");
                document.getElementById("app-container").innerHTML = "<h1>" + error + "</h1>";
                console.error(error);
                return;
            }
            config.title = !config.title ? itemUtils_1.getItemTitle(firstItem) : "";
            domHelper_1.setPageTitle(config.title);
            var portalItem = this.base.results.applicationItem
                .value;
            var appProxies = portalItem && portalItem.applicationProxies
                ? portalItem.applicationProxies
                : null;
            var defaultViewProperties = itemUtils_1.getConfigViewProperties(config);
            validWebMapItems.forEach(function (item) {
                var viewNode = document.createElement("div");
                var container = {
                    container: viewNode
                };
                var viewProperties = __assign(__assign({}, defaultViewProperties), container);
                itemUtils_1.createMapFromItem({ item: item, appProxies: appProxies }).then(function (map) {
                    return itemUtils_1.createView(__assign(__assign({}, viewProperties), { map: map })).then(function (view) {
                        return itemUtils_1.findQuery(find, view).then(function () {
                            _this.view = view;
                            var selectedLayerId = _this._getURLParameter("selectedLayerId");
                            if (selectedLayerId) {
                                var layer = view.map.allLayers.find(function (layer) {
                                    return layer.id === selectedLayerId;
                                });
                                if (!layer || (layer && !layer.visible)) {
                                    var url = new URL(window.location.href);
                                    var params = new URLSearchParams(url.search);
                                    params.delete("center");
                                    params.delete("level");
                                    params.delete("attachmentIndex");
                                    params.delete("selectedLayerId");
                                    params.delete("defaultObjectId");
                                    window.history.replaceState({}, "", "" + location.pathname);
                                    location.reload();
                                    return;
                                }
                            }
                            if (document.body.clientWidth > 830 &&
                                appMode === "photo-centric") {
                                view.padding.bottom = 380;
                            }
                            var appTitle = _this._handleDocTitle(title);
                            var docDirection = document
                                .querySelector("html")
                                .getAttribute("dir");
                            _this.view.ui.remove("zoom");
                            _this._handleSearchWidget(searchConfig, searchEnabled, searchExpanded, mapCentricTooltipEnabled, docDirection);
                            _this._handleZoomControls(zoomEnabled);
                            _this._handleHomeWidget(homeEnabled);
                            _this._handleLegendWidget(legendEnabled);
                            _this._handleLayerListWidget(layerListEnabled);
                            _this._handleFullScreenWidget(fullScreenEnabled);
                            _this._handleSketchWidget(selectFeaturesEnabled);
                            _this._removeGraphicsLayerFromLayerList();
                            _this._addWidgetsToUI(mapToolsExpanded, docDirection);
                            var defaultObjectIdParam = parseInt(_this._getURLParameter("defaultObjectId"));
                            var defaultObjectId = socialSharingEnabled
                                ? isNaN(defaultObjectIdParam)
                                    ? null
                                    : defaultObjectIdParam
                                : null;
                            var featureAttachmentIndexParam = parseInt(_this._getURLParameter("attachmentIndex"));
                            var attachmentIndex = socialSharingEnabled
                                ? isNaN(featureAttachmentIndexParam)
                                    ? null
                                    : featureAttachmentIndexParam
                                : null;
                            _this._handleLayerSwitcher(appMode, selectedLayerId, socialSharingEnabled);
                            var container = document.createElement("div");
                            var onboardingContent = new OnboardingContent({
                                container: container,
                                config: config,
                                appMode: appMode
                            });
                            var scale = isNaN(zoomLevel) ? parseInt(zoomLevel) : zoomLevel;
                            var isIE11 = navigator.userAgent.indexOf("MSIE") !== -1 ||
                                navigator.appVersion.indexOf("Trident/") > -1;
                            var imagePanZoomValue = isIE11 ? false : imagePanZoomEnabled;
                            var appConfig = {
                                addressEnabled: addressEnabled,
                                attachmentLayer: attachmentLayer,
                                attachmentLayers: attachmentLayers,
                                appMode: appMode,
                                attachmentIndex: attachmentIndex,
                                container: document.getElementById("app-container"),
                                defaultObjectId: defaultObjectId,
                                showOnboardingOnStart: showOnboardingOnStart,
                                downloadEnabled: downloadEnabled,
                                docDirection: docDirection,
                                graphicsLayer: _this.graphicsLayer,
                                imageDirectionEnabled: imageDirectionEnabled,
                                imagePanZoomEnabled: imagePanZoomValue,
                                layerSwitcher: _this.layerSwitcher,
                                mapCentricTooltipEnabled: mapCentricTooltipEnabled,
                                onboardingButtonText: onboardingButtonText,
                                onboardingContent: onboardingContent,
                                onboardingImage: onboardingImage,
                                onboardingIsEnabled: onboardingIsEnabled,
                                onlyDisplayFeaturesWithAttachmentsIsEnabled: onlyDisplayFeaturesWithAttachmentsIsEnabled,
                                order: order,
                                searchWidget: _this.searchWidget,
                                selectFeaturesEnabled: selectFeaturesEnabled,
                                sketchWidget: _this.sketchWidget,
                                selectedLayerId: selectedLayerId,
                                socialSharingEnabled: socialSharingEnabled,
                                title: appTitle,
                                view: view,
                                zoomLevel: scale
                            };
                            if (appMode === "photo-centric") {
                                _this.app = new PhotoCentric(__assign(__assign({}, appConfig), { photoCentricMobileMapExpanded: photoCentricMobileMapExpanded }));
                                document.body.classList.add("photo-centric-body");
                            }
                            else if (appMode === "map-centric") {
                                _this.app = new MapCentric(appConfig);
                                if (_this.layerSwitcher) {
                                    _this.layerSwitcher.mapCentricViewModel = _this.app.viewModel;
                                }
                                document.body.classList.add("map-centric-body");
                            }
                            itemUtils_1.goToMarker(marker, view);
                            if (config.customCSS) {
                                _this._handleCustomCSS(config);
                            }
                            document.body.classList.remove(CSS.loading);
                        });
                    });
                });
            });
        };
        // _handleDocTitle
        AttachmentViewerApp.prototype._handleDocTitle = function (title) {
            var portalItemTitle = this.view.get("map.portalItem.title");
            var appTitle = title
                ? title
                : portalItemTitle
                    ? portalItemTitle
                    : "Attachment Viewer";
            var titleElement = document.createElement("title");
            titleElement.appendChild(document.createTextNode(appTitle));
            document.getElementsByTagName("head")[0].appendChild(titleElement);
            return appTitle;
        };
        // _handleZoomControls
        AttachmentViewerApp.prototype._handleZoomControls = function (zoomEnabled) {
            if (zoomEnabled) {
                var zoom = new Zoom({
                    view: this.view
                });
                this.widgets.add(zoom);
            }
        };
        // _handleHomeWidget
        AttachmentViewerApp.prototype._handleHomeWidget = function (homeEnabled) {
            if (homeEnabled) {
                var home = new Home({
                    view: this.view
                });
                this.widgets.add(home);
            }
        };
        // _handleSearchWidget
        AttachmentViewerApp.prototype._handleSearchWidget = function (searchConfig, searchEnabled, searchExpanded, mapCentricTooltipEnabled, docDirection) {
            var _this = this;
            if (!searchEnabled) {
                return;
            }
            var popupEnabled = mapCentricTooltipEnabled ? true : false;
            var searchProperties = {
                view: this.view,
                popupEnabled: popupEnabled
            };
            if (searchConfig) {
                if (searchConfig.sources) {
                    var sources = searchConfig.sources;
                    searchProperties.sources = sources.filter(function (source) {
                        if (source.flayerId && source.url) {
                            var layer = _this.view.map.findLayerById(source.flayerId);
                            source.layer = layer ? layer : new FeatureLayer(source.url);
                        }
                        if (source.hasOwnProperty("enableSuggestions")) {
                            source.suggestionsEnabled = source.enableSuggestions;
                        }
                        if (source.hasOwnProperty("searchWithinMap")) {
                            source.withinViewEnabled = source.searchWithinMap;
                        }
                        return source;
                    });
                }
                if (searchProperties.sources &&
                    searchProperties.sources.length &&
                    searchProperties.sources.length > 0) {
                    searchProperties.includeDefaultSources = false;
                }
                searchProperties.searchAllEnabled = searchConfig.enableSearchingAll
                    ? true
                    : false;
                if (searchConfig.activeSourceIndex &&
                    searchProperties.sources &&
                    searchProperties.sources.length >= searchConfig.activeSourceIndex) {
                    searchProperties.activeSourceIndex = searchConfig.activeSourceIndex;
                }
            }
            this.searchWidget = new Search(__assign({ container: document.createElement("div") }, searchProperties));
            var expand = new Expand({
                view: this.view,
                content: this.searchWidget,
                mode: "floating",
                expanded: searchExpanded,
                expandTooltip: i18n.search
            });
            var widgetPos = docDirection === "rtl" ? "top-right" : "top-left";
            this.view.ui.add(expand, widgetPos);
        };
        // _handleLegendWidget
        AttachmentViewerApp.prototype._handleLegendWidget = function (legendEnabled) {
            if (legendEnabled) {
                var legend = new Legend({
                    view: this.view
                });
                this.widgets.add(new Expand({
                    view: this.view,
                    content: legend,
                    mode: "floating",
                    group: "top-right",
                    expandTooltip: legend.label
                }));
            }
        };
        //  _handleSketchWidget
        AttachmentViewerApp.prototype._handleSketchWidget = function (selectFeaturesEnabled) {
            if (selectFeaturesEnabled) {
                this.graphicsLayer = new GraphicsLayer();
                this.view.map.layers.unshift(this.graphicsLayer);
                var sketch = new Sketch({
                    layer: this.graphicsLayer,
                    view: this.view,
                    availableCreateTools: ["rectangle"],
                    defaultUpdateOptions: {
                        toggleToolOnClick: false,
                        enableRotation: false
                    },
                    iconClass: "custom-sketch"
                });
                this.sketchWidget = sketch;
                this.sketchWidget.viewModel.updateOnGraphicClick = false;
                this.widgets.add(new Expand({
                    view: this.view,
                    content: sketch,
                    mode: "floating",
                    group: "top-right",
                    expandTooltip: i18nMapCentric.drawToSelectFeatures
                }));
            }
        };
        // _removeGrahpicsLayerFromLayerList
        AttachmentViewerApp.prototype._removeGraphicsLayerFromLayerList = function () {
            var _this = this;
            if (this.layerList && this.sketchWidget) {
                var operationalItems_1 = this.layerList.get("operationalItems");
                watchUtils.when(this.layerList, "operationalItems.length", function () {
                    var graphicsLayer = operationalItems_1 &&
                        operationalItems_1.find(function (operationalItem) {
                            var layer = operationalItem.layer;
                            return layer.id === _this.graphicsLayer.id;
                        });
                    _this.layerList.operationalItems.remove(graphicsLayer);
                });
            }
        };
        // _handleLayerListWidget
        AttachmentViewerApp.prototype._handleLayerListWidget = function (layerListEnabled) {
            if (layerListEnabled) {
                this.layerList = new LayerList({
                    view: this.view
                });
                this.widgets.add(new Expand({
                    view: this.view,
                    content: this.layerList,
                    mode: "floating",
                    group: "top-right",
                    expandTooltip: this.layerList.label
                }));
            }
        };
        // _handleFullScreenWidget
        AttachmentViewerApp.prototype._handleFullScreenWidget = function (fullScreenEnabled) {
            if (fullScreenEnabled) {
                var fullscreen = new FullScreen({
                    view: this.view
                });
                this.widgets.add(fullscreen);
            }
        };
        // _handleLayerSwitcher
        AttachmentViewerApp.prototype._handleLayerSwitcher = function (appMode, selectedLayerId, socialSharingEnabled) {
            var _this = this;
            var layerId = socialSharingEnabled ? selectedLayerId : null;
            var layerSwitcher = new LayerSwitcher({
                container: document.createElement("div"),
                view: this.view,
                appMode: appMode,
                selectedLayerId: layerId
            });
            this.layerSwitcher = layerSwitcher;
            watchUtils.watch(layerSwitcher, "selectedLayer", function () {
                watchUtils.when(_this.app, "selectedAttachmentViewerData", function () {
                    if (!layerSwitcher.selectedLayer) {
                        return;
                    }
                    var selectedLayer = layerSwitcher.get("selectedLayer");
                    var featureLayerId = selectedLayer.get("id");
                    var attachmentViewerDataCollection = _this.app.get("attachmentViewerDataCollection");
                    var selectedLayerData = attachmentViewerDataCollection.find(function (attachmentViewerData) {
                        return (attachmentViewerData.get("layerData.featureLayer.id") ===
                            featureLayerId);
                    });
                    _this.app.selectedAttachmentViewerData = selectedLayerData;
                });
            });
        };
        // _addWidgetsToUI
        AttachmentViewerApp.prototype._addWidgetsToUI = function (mapToolsExpanded, docDirection) {
            var widgetPos = docDirection === "rtl" ? "top-left" : "top-right";
            if (this.widgets.length > 1) {
                var content_1 = [];
                this.widgets.forEach(function (widget) {
                    content_1.push(widget);
                });
                var mobileExpand = new MobileExpand({
                    content: content_1,
                    mode: "floating",
                    expandIconClass: "icon-ui-down-arrow icon-ui-flush",
                    collapseIconClass: "icon-ui-up-arrow icon-ui-flush",
                    expandTooltip: i18n.moreTools,
                    expanded: mapToolsExpanded
                });
                this.view.ui.add(mobileExpand, widgetPos);
            }
            else if (this.widgets.length === 1) {
                this.view.ui.add(this.widgets.getItemAt(0), widgetPos);
            }
        };
        // _getURLParameter
        AttachmentViewerApp.prototype._getURLParameter = function (name) {
            return (decodeURIComponent((new RegExp("[?|&]" + name + "=" + "([^&;]+?)(&|#|;|$)").exec(location.search) || [null, ""])[1].replace(/\+/g, "%20")) || null);
        };
        // _handleCustomCSS
        AttachmentViewerApp.prototype._handleCustomCSS = function (config) {
            var styles = document.createElement("style");
            styles.type = "text/css";
            styles.appendChild(document.createTextNode(config.customCSS));
            document.head.appendChild(styles);
        };
        // _applySharedTheme
        AttachmentViewerApp.prototype._applySharedTheme = function (config) {
            var styles = [];
            var headerBackground = config.headerBackground &&
                !isNaN(config.headerBackground.r) &&
                !isNaN(config.headerBackground.g) &&
                !isNaN(config.headerBackground.b) &&
                !isNaN(config.headerBackground.a)
                ? "rgba(" + config.headerBackground.r + ", " + config.headerBackground.g + ", " + config.headerBackground.b + ", " + config.headerBackground.a + ")"
                : config.headerBackground === "no-color"
                    ? "transparent"
                    : config.headerBackground;
            var headerColor = config.headerColor &&
                !isNaN(config.headerColor.r) &&
                !isNaN(config.headerColor.g) &&
                !isNaN(config.headerColor.b) &&
                !isNaN(config.headerColor.a)
                ? "rgba(" + config.headerColor.r + ", " + config.headerColor.g + ", " + config.headerColor.b + ", " + config.headerColor.a + ")"
                : config.headerColor === "no-color"
                    ? "transparent"
                    : config.headerColor;
            if (config.appMode === "photo-centric") {
                styles.push(config.headerBackground
                    ? ".esri-photo-centric__header{background:" + headerBackground + ";}"
                    : null);
                styles.push(config.headerColor
                    ? ".esri-photo-centric__header{color:" + headerColor + ";}"
                    : null);
            }
            else {
                styles.push(config.headerBackground
                    ? ".esri-map-centric__header{background:" + headerBackground + ";}"
                    : null);
                styles.push(config.headerColor
                    ? ".esri-map-centric__header{color:" + headerColor + ";}"
                    : null);
            }
            var style = document.createElement("style");
            style.appendChild(document.createTextNode(styles.join("")));
            document.getElementsByTagName("head")[0].appendChild(style);
        };
        return AttachmentViewerApp;
    }());
    return AttachmentViewerApp;
});
//# sourceMappingURL=Main.js.map