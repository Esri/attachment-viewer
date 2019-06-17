/*
  Copyright 2019 Esri
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
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
define(["require", "exports", "ApplicationBase/support/itemUtils", "ApplicationBase/support/domHelper", "./Components/AttachmentViewer", "esri/widgets/Search", "esri/widgets/Expand", "./Components/MobileExpand/MobileExpand", "esri/widgets/Legend", "esri/widgets/LayerList", "esri/widgets/Home", "esri/layers/FeatureLayer", "./Components/Onboarding/OnboardingContent", "dojo/i18n!./nls/common", "esri/widgets/Fullscreen", "esri/core/Collection", "esri/widgets/Zoom"], function (require, exports, itemUtils_1, domHelper_1, AttachmentViewer, Search, Expand, MobileExpand, Legend, LayerList, Home, FeatureLayer, OnboardingContent, i18n, FullScreen, Collection, Zoom) {
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
            this.base = null;
            this.searchWidget = null;
            this.searchWidgetMobile = null;
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
            var find = config.find, marker = config.marker, appMode = config.appMode, title = config.title, attachmentLayer = config.attachmentLayer, order = config.order, downloadEnabled = config.downloadEnabled, homeEnabled = config.homeEnabled, zoomEnabled = config.zoomEnabled, legendEnabled = config.legendEnabled, layerListEnabled = config.layerListEnabled, searchConfig = config.searchConfig, searchEnabled = config.searchEnabled, zoomLevel = config.zoomLevel, addressEnabled = config.addressEnabled, fullScreenEnabled = config.fullScreenEnabled, socialSharingEnabled = config.socialSharingEnabled, onboardingImage = config.onboardingImage, onboardingButtonText = config.onboardingButtonText, mapToolsExpanded = config.mapToolsExpanded, searchExpanded = config.searchExpanded;
            var webMapItems = results.webMapItems;
            var validWebMapItems = webMapItems.map(function (response) {
                return response.value;
            });
            var firstItem = validWebMapItems[0];
            if (!firstItem) {
                console.error("Could not load an item to display");
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
                var viewProperties = __assign({}, defaultViewProperties, container);
                itemUtils_1.createMapFromItem({ item: item, appProxies: appProxies }).then(function (map) {
                    return itemUtils_1.createView(__assign({}, viewProperties, { map: map })).then(function (view) {
                        return itemUtils_1.findQuery(find, view).then(function () {
                            _this.view = view;
                            if (document.body.clientWidth > 813) {
                                _this.view.padding.bottom = 380;
                            }
                            var appTitle = title
                                ? title
                                : view.map.get("portalItem").title
                                    ? view.map.get("portalItem").title
                                    : "Feature Browser";
                            _this.view.ui.remove("zoom");
                            _this._handleSearchWidget(searchConfig, searchEnabled, searchExpanded);
                            _this._handleZoomControls(zoomEnabled);
                            _this._handleHomeWidget(homeEnabled);
                            _this._handleLegendWidget(legendEnabled);
                            _this._handleLayerListWidget(layerListEnabled);
                            _this._handleFullScreenWidget(fullScreenEnabled);
                            _this._addWidgetsToUI(mapToolsExpanded);
                            var defaultObjectIdParam = parseInt(_this._getURLParameter("defaultObjectId"));
                            var defaultObjectId = isNaN(defaultObjectIdParam)
                                ? null
                                : defaultObjectIdParam;
                            var featureAttachmentIndexParam = parseInt(_this._getURLParameter("attachmentIndex"));
                            var attachmentIndex = isNaN(featureAttachmentIndexParam)
                                ? null
                                : featureAttachmentIndexParam;
                            var container = document.createElement("div");
                            var onboardingContent = new OnboardingContent({
                                container: container,
                                config: config
                            });
                            var scale = isNaN(zoomLevel) ? parseInt(zoomLevel) : zoomLevel;
                            var docDirection = document
                                .querySelector("html")
                                .getAttribute("dir");
                            new AttachmentViewer({
                                view: view,
                                container: document.getElementById("app-container"),
                                appMode: appMode,
                                title: appTitle,
                                searchWidget: _this.searchWidget,
                                defaultObjectId: defaultObjectId,
                                attachmentIndex: attachmentIndex,
                                attachmentLayer: attachmentLayer,
                                order: order,
                                downloadEnabled: downloadEnabled,
                                socialSharingEnabled: socialSharingEnabled,
                                onboardingContent: onboardingContent,
                                zoomLevel: scale,
                                docDirection: docDirection,
                                addressEnabled: addressEnabled,
                                onboardingImage: onboardingImage,
                                onboardingButtonText: onboardingButtonText
                            });
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
        AttachmentViewerApp.prototype._handleSearchWidget = function (searchConfig, searchEnabled, searchExpanded) {
            var _this = this;
            if (!searchEnabled) {
                return;
            }
            var searchProperties = {
                view: this.view
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
            this.view.ui.add(expand, "top-right");
        };
        AttachmentViewerApp.prototype._handleLegendWidget = function (legendEnabled) {
            if (legendEnabled) {
                var legend = new Legend({
                    view: this.view
                });
                this.widgets.add(new Expand({
                    view: this.view,
                    content: legend,
                    mode: "floating",
                    group: "top-left",
                    expandTooltip: legend.label
                }));
            }
        };
        // _handleLayerListWidget
        AttachmentViewerApp.prototype._handleLayerListWidget = function (layerListEnabled) {
            if (layerListEnabled) {
                var layerList = new LayerList({
                    view: this.view
                });
                this.widgets.add(new Expand({
                    view: this.view,
                    content: layerList,
                    mode: "floating",
                    group: "top-left",
                    expandTooltip: layerList.label
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
        // _addWidgetsToUI
        AttachmentViewerApp.prototype._addWidgetsToUI = function (mapToolsExpanded) {
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
                this.view.ui.add(mobileExpand, "top-left");
            }
            else if (this.widgets.length === 1) {
                this.view.ui.add(this.widgets.getItemAt(0), "top-left");
            }
            // this.view.ui.add(this.searchWidget);
        };
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
            styles.push(config.headerBackground
                ? ".esri-photo-centric__header{background:" + config.headerBackground + ";}"
                : null);
            styles.push(config.headerColor
                ? ".esri-photo-centric__header{color:" + config.headerColor + ";}"
                : null);
            var style = document.createElement("style");
            style.appendChild(document.createTextNode(styles.join("")));
            document.getElementsByTagName("head")[0].appendChild(style);
        };
        return AttachmentViewerApp;
    }());
    return AttachmentViewerApp;
});
//# sourceMappingURL=Main.js.map