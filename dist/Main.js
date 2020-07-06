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
define(["require", "exports", "tslib", "./ConfigurationSettings/ConfigurationSettings", "ApplicationBase/support/itemUtils", "ApplicationBase/support/domHelper", "dojo/i18n!./nls/common", "esri/core/Handles", "esri/core/Collection", "esri/core/watchUtils", "./Components/LayerSwitcher", "./Components/MobileExpand", "./Components/OnboardingContent", "./utils/widgetUtils"], function (require, exports, tslib_1, ConfigurationSettings, itemUtils_1, domHelper_1, common_1, Handles, Collection, watchUtils_1, LayerSwitcher, MobileExpand, OnboardingContent, widgetUtils_1) {
    "use strict";
    common_1 = tslib_1.__importDefault(common_1);
    var CSS = {
        loading: "configurable-application--loading"
    };
    var AttachmentViewerApp = /** @class */ (function () {
        function AttachmentViewerApp() {
            this._configurationSettings = null;
            this.appProps = null;
            this.currentApp = null;
            this.base = null;
            this.graphicsLayer = null;
            this.handles = new Handles();
            this.sketchHandles = new Handles();
            this.layerList = null;
            this.layerSwitcher = null;
            this.onboardingContent = null;
            this.searchWidget = null;
            this.sketchWidget = null;
            this.view = null;
        }
        AttachmentViewerApp.prototype.init = function (base) {
            if (!base) {
                console.error("ApplicationBase is not defined");
                return;
            }
            domHelper_1.setPageLocale(base.locale);
            domHelper_1.setPageDirection(base.direction);
            this.base = base;
            this._createApp();
            document.body.classList.remove(CSS.loading);
        };
        AttachmentViewerApp.prototype._createApp = function () {
            var _this = this;
            var _a = this.base, config = _a.config, results = _a.results;
            var find = config.find, photoCentricMobileMapExpanded = config.photoCentricMobileMapExpanded, mapToolsExpanded = config.mapToolsExpanded, marker = config.marker, share = config.share;
            this._configurationSettings = new ConfigurationSettings(config);
            var webMapItems = results.webMapItems;
            this.item = null;
            webMapItems.forEach(function (response) {
                var _a, _b, _c;
                if (((_a = response === null || response === void 0 ? void 0 : response.value) === null || _a === void 0 ? void 0 : _a.id) === ((_b = _this._configurationSettings) === null || _b === void 0 ? void 0 : _b.webmap)) {
                    _this.item = response.value;
                }
                else if (((_c = _this._configurationSettings) === null || _c === void 0 ? void 0 : _c.webmap) === "default") {
                    _this.item = response.value;
                }
            });
            if (this.item) {
                var title = this._configurationSettings.title &&
                    this._configurationSettings.title !== ""
                    ? this._configurationSettings.title
                    : itemUtils_1.getItemTitle(this.item);
                this.handles.add(watchUtils_1.init(this._configurationSettings, "title", domHelper_1.setPageTitle), "configuration");
                this._configurationSettings.title = title;
            }
            if (!this.item) {
                var error = "Could not load an item to display";
                document.body.classList.remove("configurable-application--loading");
                document.body.classList.add("app-error");
                document.getElementById("app-container").innerHTML = "<h1>" + error + "</h1>";
                console.error(error);
                return;
            }
            var portalItem = this.base.results.applicationItem
                .value;
            var appProxies = portalItem && portalItem.applicationProxies
                ? portalItem.applicationProxies
                : null;
            var defaultViewProperties = itemUtils_1.getConfigViewProperties(config);
            var viewNode = document.createElement("div");
            var container = {
                container: viewNode
            };
            var viewProperties = tslib_1.__assign(tslib_1.__assign({}, defaultViewProperties), container);
            itemUtils_1.createMapFromItem({ item: this.item, appProxies: appProxies }).then(function (map) {
                return itemUtils_1.createView(tslib_1.__assign(tslib_1.__assign({}, viewProperties), { map: map })).then(function (view) {
                    return itemUtils_1.findQuery(find, view).then(function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
                        var selectedLayerId, layer, url, params, appid, docDirection, defaultObjectIdParam, defaultObjectId, featureAttachmentIndexParam, attachmentIndex, container, sharedTheme, widgetProps;
                        return tslib_1.__generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    this.view = view;
                                    selectedLayerId = this._getURLParameter("selectedLayerId");
                                    if (!this._configurationSettings.withinConfigurationExperience) {
                                        if (selectedLayerId) {
                                            layer = view.map.allLayers.find(function (layer) {
                                                return layer.id === selectedLayerId;
                                            });
                                            if (!layer || (layer && !layer.visible)) {
                                                url = new URL(window.location.href);
                                                params = new URLSearchParams(url.search);
                                                params.delete("center");
                                                params.delete("level");
                                                params.delete("attachmentIndex");
                                                params.delete("selectedLayerId");
                                                params.delete("defaultObjectId");
                                                appid = params.get("appid");
                                                window.history.replaceState(null, "", location.pathname + "?appid=" + appid);
                                                location.reload();
                                                return [2 /*return*/];
                                            }
                                        }
                                    }
                                    docDirection = this.base.direction;
                                    this.view.ui.remove("zoom");
                                    defaultObjectIdParam = parseInt(this._getURLParameter("defaultObjectId"));
                                    defaultObjectId = share
                                        ? isNaN(defaultObjectIdParam)
                                            ? null
                                            : defaultObjectIdParam
                                        : null;
                                    featureAttachmentIndexParam = parseInt(this._getURLParameter("attachmentIndex"));
                                    attachmentIndex = share
                                        ? isNaN(featureAttachmentIndexParam)
                                            ? null
                                            : featureAttachmentIndexParam
                                        : null;
                                    container = document.createElement("div");
                                    this.onboardingContent = new OnboardingContent({
                                        container: container,
                                        config: this._configurationSettings,
                                        appMode: this._configurationSettings.appLayout,
                                        withinConfigurationExperience: this._configurationSettings
                                            .withinConfigurationExperience
                                    });
                                    sharedTheme = this._createSharedTheme();
                                    this.appProps = {
                                        addressEnabled: this._configurationSettings.address,
                                        appMode: this._configurationSettings.appLayout,
                                        downloadEnabled: this._configurationSettings.download,
                                        imagePanZoomEnabled: this._configurationSettings.imagePanZoom,
                                        selectFeaturesEnabled: this._configurationSettings.selectFeatures,
                                        onboardingIsEnabled: this._configurationSettings.onboarding,
                                        socialSharingEnabled: this._configurationSettings.share,
                                        customOnboardingContentEnabled: this._configurationSettings
                                            .customOnboarding,
                                        customOnboardingHTML: this._configurationSettings
                                            .customOnboardingHTML,
                                        imageDirectionEnabled: this._configurationSettings.imageDirection,
                                        graphicsLayer: this.graphicsLayer,
                                        headerBackground: this._configurationSettings.headerBackground,
                                        headerColor: this._configurationSettings.headerColor,
                                        showOnboardingOnStart: this._configurationSettings
                                            .showOnboardingOnStart,
                                        onlyDisplayFeaturesWithAttachmentsIsEnabled: this
                                            ._configurationSettings.onlyDisplayFeaturesWithAttachments,
                                        applySharedTheme: this._configurationSettings.applySharedTheme,
                                        sharedTheme: sharedTheme,
                                        attachmentLayers: this._configurationSettings.attachmentLayers,
                                        attachmentIndex: attachmentIndex,
                                        container: document.getElementById("app-container"),
                                        defaultObjectId: defaultObjectId,
                                        docDirection: docDirection,
                                        layerSwitcher: this.layerSwitcher,
                                        mapCentricTooltipEnabled: this._configurationSettings
                                            .mapCentricTooltip,
                                        onboardingButtonText: this._configurationSettings
                                            .onboardingButtonText,
                                        onboardingContent: this.onboardingContent,
                                        onboarding: this._configurationSettings.onboarding,
                                        order: this._configurationSettings.order,
                                        searchWidget: this.searchWidget,
                                        sketchWidget: this.sketchWidget,
                                        selectedLayerId: selectedLayerId,
                                        title: this._configurationSettings.title,
                                        view: view,
                                        zoomLevel: this._configurationSettings.zoomLevel,
                                        highlightedFeature: {
                                            feature: null
                                        },
                                        withinConfigurationExperience: this._configurationSettings
                                            .withinConfigurationExperience
                                    };
                                    widgetProps = {
                                        view: view,
                                        config: this._configurationSettings,
                                        portal: this.base.portal
                                    };
                                    this._initAppModeWatcher(widgetProps, selectedLayerId, photoCentricMobileMapExpanded);
                                    return [4 /*yield*/, view.when()];
                                case 1:
                                    _a.sent();
                                    this._addWidgetsToUI(mapToolsExpanded, docDirection);
                                    this._initPropWatchers(widgetProps);
                                    itemUtils_1.goToMarker(marker, view);
                                    this._cleanUpHandles();
                                    return [2 /*return*/];
                            }
                        });
                    }); });
                });
            });
        };
        // _addWidgetsToUI
        AttachmentViewerApp.prototype._addWidgetsToUI = function (mapToolsExpanded, docDirection) {
            var widgetPos = docDirection === "rtl" ? "top-left" : "top-right";
            var content = new Collection();
            var mobileExpand = new MobileExpand({
                content: content,
                id: "mobileExpand",
                mode: "floating",
                expandIconClass: "icon-ui-down-arrow icon-ui-flush",
                collapseIconClass: "icon-ui-up-arrow icon-ui-flush",
                expandTooltip: common_1.default.moreTools,
                expanded: mapToolsExpanded
            });
            this.view.ui.add(mobileExpand, widgetPos);
        };
        AttachmentViewerApp.prototype._initAppModeWatcher = function (widgetProps, selectedLayerId, photoCentricMobileMapExpanded) {
            var _this = this;
            this.handles.add([
                watchUtils_1.init(this._configurationSettings, "appLayout", function (newValue, oldValue, propertyName) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
                    return tslib_1.__generator(this, function (_a) {
                        widgetProps.propertyName = propertyName;
                        this._updateApp(widgetProps, photoCentricMobileMapExpanded, selectedLayerId);
                        return [2 /*return*/];
                    });
                }); }),
                watchUtils_1.init(this._configurationSettings, "order", function (newValue, oldValue, propertyName) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
                    return tslib_1.__generator(this, function (_a) {
                        widgetProps.propertyName = propertyName;
                        this._updateApp(widgetProps, photoCentricMobileMapExpanded, selectedLayerId);
                        return [2 /*return*/];
                    });
                }); }),
                watchUtils_1.init(this._configurationSettings, "attachmentLayers", function (newValue, oldValue, propertyName) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
                    return tslib_1.__generator(this, function (_a) {
                        widgetProps.propertyName = propertyName;
                        this._updateApp(widgetProps, photoCentricMobileMapExpanded, selectedLayerId);
                        return [2 /*return*/];
                    });
                }); }),
                watchUtils_1.init(this._configurationSettings, "onlyDisplayFeaturesWithAttachments", function (newValue, oldValue, propertyName) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
                    return tslib_1.__generator(this, function (_a) {
                        widgetProps.propertyName = propertyName;
                        this._updateApp(widgetProps, photoCentricMobileMapExpanded, selectedLayerId);
                        return [2 /*return*/];
                    });
                }); })
            ]);
        };
        AttachmentViewerApp.prototype._mapPropName = function (propName) {
            switch (propName) {
                case "onlyDisplayFeaturesWithAttachments":
                    return "onlyDisplayFeaturesWithAttachmentsIsEnabled";
                case "appLayout":
                    return "appMode";
                case "order":
                    return "order";
                case "attachmentLayers":
                    return "attachmentLayers";
            }
        };
        AttachmentViewerApp.prototype._updateApp = function (widgetProps, photoCentricMobileMapExpanded, selectedLayerId) {
            var _a, _b;
            return tslib_1.__awaiter(this, void 0, void 0, function () {
                var propertyName, appContainer, mappedPropName, app;
                return tslib_1.__generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            propertyName = widgetProps.propertyName;
                            document.body.removeChild(document.getElementById("app-container"));
                            appContainer = document.createElement("div");
                            appContainer.id = "app-container";
                            document.body.appendChild(appContainer);
                            this.appProps.container = appContainer;
                            mappedPropName = this._mapPropName(propertyName);
                            this.appProps[mappedPropName] = this._configurationSettings[propertyName];
                            if ((_a = this.currentApp) === null || _a === void 0 ? void 0 : _a.hasOwnProperty(propertyName)) {
                                this.currentApp[propertyName] = this._configurationSettings[propertyName];
                            }
                            this._handleHighlightedFeatures();
                            return [4 /*yield*/, widgetUtils_1.toggleAppMode(widgetProps, this.appProps, photoCentricMobileMapExpanded)];
                        case 1:
                            app = _c.sent();
                            (_b = this.currentApp) === null || _b === void 0 ? void 0 : _b.destroy();
                            this.currentApp = app;
                            this._handleLayerSwitcher(this.appProps, selectedLayerId);
                            this.layerSwitcher.appMode = this._configurationSettings.appLayout;
                            this.currentApp.layerSwitcher = this.layerSwitcher;
                            return [2 /*return*/];
                    }
                });
            });
        };
        AttachmentViewerApp.prototype._handleHighlightedFeatures = function () {
            if (this.appProps.highlightedFeature.feature) {
                this.appProps.highlightedFeature.feature.remove();
            }
            this.appProps.highlightedFeature.feature = null;
        };
        AttachmentViewerApp.prototype._handleLayerSwitcher = function (appConfig, selectedLayerId) {
            var _this = this;
            var share = appConfig.share, view = appConfig.view;
            var layerId = share ? selectedLayerId : null;
            this.layerSwitcher = new LayerSwitcher({
                container: document.createElement("div"),
                view: view,
                appMode: this.currentApp.appMode,
                selectedLayerId: layerId
            });
            watchUtils_1.watch(this.layerSwitcher, "selectedLayer", function () {
                watchUtils_1.when(_this.currentApp, "selectedAttachmentViewerData", function () {
                    if (!_this.layerSwitcher.selectedLayer) {
                        return;
                    }
                    var selectedLayer = _this.layerSwitcher.get("selectedLayer");
                    var featureLayerId = selectedLayer.get("id");
                    var attachmentViewerDataCollection = _this.currentApp.get("attachmentViewerDataCollection");
                    var selectedLayerData = attachmentViewerDataCollection.find(function (attachmentViewerData) {
                        return (attachmentViewerData.get("layerData.featureLayer.id") ===
                            featureLayerId);
                    });
                    _this.currentApp.selectedAttachmentViewerData = selectedLayerData;
                    if (_this.currentApp.appMode === "map-centric") {
                        _this.layerSwitcher.mapCentricViewModel = _this.currentApp
                            .viewModel;
                    }
                });
            });
        };
        AttachmentViewerApp.prototype._initPropWatchers = function (widgetProps) {
            var _this = this;
            this.handles.add([
                watchUtils_1.init(this._configurationSettings, "search, searchConfiguration, searchOpenAtStart", function (newValue, oldValue, propertyName) {
                    widgetProps.propertyName = propertyName;
                    widgetUtils_1.addSearch(widgetProps);
                }),
                watchUtils_1.init(this._configurationSettings, "mapToolsExpanded", function (newValue, oldValue, propertyName) {
                    widgetProps.propertyName = propertyName;
                    var mobileExpand = _this.view.ui.find("mobileExpand");
                    if (mobileExpand) {
                        mobileExpand.expanded = _this._configurationSettings.mapToolsExpanded;
                    }
                }),
                watchUtils_1.init(this._configurationSettings, "home", function (newValue, oldValue, propertyName) {
                    widgetProps.propertyName = propertyName;
                    widgetUtils_1.addHome(widgetProps);
                }),
                watchUtils_1.init(this._configurationSettings, "mapZoom", function (newValue, oldValue, propertyName) {
                    widgetProps.propertyName = propertyName;
                    widgetUtils_1.addZoom(widgetProps);
                }),
                watchUtils_1.init(this._configurationSettings, "legend", function (newValue, oldValue, propertyName) {
                    widgetProps.propertyName = propertyName;
                    widgetUtils_1.addLegend(widgetProps);
                }),
                watchUtils_1.init(this._configurationSettings, "layerList", function (newValue, oldValue, propertyName) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
                    var layerListWatcher, layerList;
                    return tslib_1.__generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                layerListWatcher = "layer-list-watcher";
                                if (this.sketchHandles.has(layerListWatcher)) {
                                    this.sketchHandles.remove(layerListWatcher);
                                }
                                widgetProps.propertyName = propertyName;
                                return [4 /*yield*/, widgetUtils_1.addLayerList(widgetProps)];
                            case 1:
                                layerList = _a.sent();
                                if (layerList) {
                                    this.sketchHandles.add(watchUtils_1.when(layerList, "operationalItems.length", function () {
                                        var sketchGraphicsLayer = layerList.operationalItems.find(function (operationalItem) {
                                            return operationalItem.layer.id === "av-sketchGraphicsLayer";
                                        });
                                        if (sketchGraphicsLayer) {
                                            layerList.operationalItems.remove(sketchGraphicsLayer);
                                        }
                                    }), layerListWatcher);
                                }
                                return [2 /*return*/];
                        }
                    });
                }); }),
                watchUtils_1.init(this._configurationSettings, "fullScreen", function (newValue, oldValue, propertyName) {
                    widgetProps.propertyName = propertyName;
                    widgetUtils_1.addFullScreen(widgetProps);
                }),
                watchUtils_1.init(this._configurationSettings, "selectFeatures", function (newValue, oldValue, propertyName) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
                    var sketch;
                    var _a, _b, _c, _d;
                    return tslib_1.__generator(this, function (_e) {
                        switch (_e.label) {
                            case 0:
                                widgetProps.propertyName = propertyName;
                                return [4 /*yield*/, widgetUtils_1.addSketch(widgetProps)];
                            case 1:
                                sketch = _e.sent();
                                if (this._configurationSettings.selectFeatures) {
                                    this.appProps.selectFeaturesEnabled = this._configurationSettings.selectFeatures;
                                    this.appProps.sketchWidget = sketch;
                                    this.appProps.graphicsLayer = sketch.layer;
                                    this.currentApp.selectFeaturesEnabled = this._configurationSettings.selectFeatures;
                                    this.currentApp.graphicsLayer = sketch.layer;
                                    this.currentApp.sketchWidget = sketch;
                                }
                                else {
                                    if (this.appProps.graphicsLayer) {
                                        this.appProps.graphicsLayer.graphics.removeAll();
                                    }
                                    this.appProps.selectFeaturesEnabled = this._configurationSettings.selectFeatures;
                                    (_b = (_a = this.appProps) === null || _a === void 0 ? void 0 : _a.sketchWidget) === null || _b === void 0 ? void 0 : _b.cancel();
                                    this.appProps.sketchWidget = null;
                                    this.appProps.graphicsLayer = null;
                                    this.currentApp.selectFeaturesEnabled = this._configurationSettings.selectFeatures;
                                    this.currentApp.graphicsLayer = null;
                                    (_d = (_c = this.currentApp) === null || _c === void 0 ? void 0 : _c.sketchWidget) === null || _d === void 0 ? void 0 : _d.cancel();
                                    this.currentApp.sketchWidget = null;
                                    this.view.layerViews.forEach(function (layerView) {
                                        if (layerView.layer.type === "feature") {
                                            var featureLayerView = layerView;
                                            featureLayerView.effect = null;
                                        }
                                    });
                                }
                                return [2 /*return*/];
                        }
                    });
                }); }),
                watchUtils_1.init(this._configurationSettings, "share", function (newValue, oldValue, propertyName) {
                    widgetProps.propertyName = propertyName;
                    _this.appProps.socialSharingEnabled = _this._configurationSettings.share;
                    _this.currentApp.socialSharingEnabled = _this._configurationSettings.share;
                }),
                watchUtils_1.init(this._configurationSettings, "address", function (newValue, oldValue, propertyName) {
                    widgetProps.propertyName = propertyName;
                    _this.appProps.addressEnabled = _this._configurationSettings.address;
                    _this.currentApp.addressEnabled = _this._configurationSettings.address;
                }),
                watchUtils_1.init(this._configurationSettings, "download", function (newValue, oldValue, propertyName) {
                    widgetProps.propertyName = propertyName;
                    _this.appProps.downloadEnabled = _this._configurationSettings.download;
                    _this.currentApp.downloadEnabled = _this._configurationSettings.download;
                }),
                watchUtils_1.init(this._configurationSettings, "onboarding", function (newValue, oldValue, propertyName) {
                    widgetProps.propertyName = propertyName;
                    _this.appProps.onboardingIsEnabled = _this._configurationSettings.onboarding;
                    _this.currentApp.onboardingIsEnabled = _this._configurationSettings.onboarding;
                }),
                watchUtils_1.init(this._configurationSettings, "imageDirection", function (newValue, oldValue, propertyName) {
                    widgetProps.propertyName = propertyName;
                    _this.appProps.imageDirectionEnabled = _this._configurationSettings.imageDirection;
                    _this.currentApp.imageDirectionEnabled = _this._configurationSettings.imageDirection;
                }),
                watchUtils_1.init(this._configurationSettings, "customOnboarding, customOnboardingHTML", function (newValue, oldValue, propertyName) {
                    widgetProps.propertyName = propertyName;
                    _this.appProps.customOnboarding = _this._configurationSettings.customOnboarding;
                    _this.appProps.customOnboardingHTML = _this._configurationSettings.customOnboardingHTML;
                    _this.onboardingContent.config.customOnboarding = _this._configurationSettings.customOnboarding;
                    _this.onboardingContent.config.customOnboardingHTML = _this._configurationSettings.customOnboardingHTML;
                }),
                watchUtils_1.init(this._configurationSettings, "customCSS", function (newValue, oldValue, propertyName) {
                    widgetProps.propertyName = propertyName;
                    _this.appProps.customCSS = _this._configurationSettings.customCSS;
                    _this._handleCustomCSS();
                }),
                watchUtils_1.init(this._configurationSettings, "onboardingButtonText", function (newValue, oldValue, propertyName) {
                    widgetProps.propertyName = propertyName;
                    _this.appProps.onboardingButtonText = _this._configurationSettings.onboardingButtonText;
                    _this.currentApp.onboardingButtonText = _this._configurationSettings.onboardingButtonText;
                }),
                watchUtils_1.init(this._configurationSettings, "zoomLevel", function (newValue, oldValue, propertyName) {
                    widgetProps.propertyName = propertyName;
                    _this.appProps.zoomLevel = _this._configurationSettings.zoomLevel;
                    _this.currentApp.zoomLevel = _this._configurationSettings.zoomLevel;
                }),
                watchUtils_1.init(this._configurationSettings, "headerColor, headerBackground", function (newValue, oldValue, propertyName) {
                    widgetProps.propertyName = propertyName;
                    _this.appProps.headerBackground = _this._configurationSettings.headerBackground;
                    _this.appProps.headerColor = _this._configurationSettings.headerColor;
                    _this._applyHeaderColors();
                }),
                watchUtils_1.init(this._configurationSettings, "onboardingImage", function (newValue, oldValue, propertyName) {
                    widgetProps.propertyName = propertyName;
                    _this.appProps.onboardingImage = _this._configurationSettings.onboardingImage;
                    var photoCentricApp = _this.currentApp;
                    photoCentricApp.onboardingImage = _this._configurationSettings.onboardingImage;
                }),
                watchUtils_1.init(this._configurationSettings, "mapCentricTooltip", function (newValue, oldValue, propertyName) {
                    widgetProps.propertyName = propertyName;
                    _this.appProps.mapCentricTooltipEnabled = _this._configurationSettings.mapCentricTooltip;
                    var mapCentricApp = _this.currentApp;
                    mapCentricApp.mapCentricTooltipEnabled = _this._configurationSettings.mapCentricTooltip;
                }),
                watchUtils_1.init(this._configurationSettings, "showOnboardingOnStart", function (newValue, oldValue, propertyName) {
                    widgetProps.propertyName = propertyName;
                    _this.appProps.showOnboardingOnStart = _this._configurationSettings.showOnboardingOnStart;
                    _this.currentApp.showOnboardingOnStart = _this._configurationSettings.showOnboardingOnStart;
                }),
                watchUtils_1.init(this._configurationSettings, "imagePanZoom", function (newValue, oldValue, propertyName) {
                    var isIE11 = navigator.userAgent.indexOf("MSIE") !== -1 ||
                        navigator.appVersion.indexOf("Trident/") > -1;
                    var imagePanZoomEnabledValue = isIE11
                        ? false
                        : _this._configurationSettings.imagePanZoom;
                    widgetProps.propertyName = propertyName;
                    _this.appProps.imagePanZoomEnabled = imagePanZoomEnabledValue;
                    _this.currentApp.imagePanZoomEnabled = imagePanZoomEnabledValue;
                }),
                watchUtils_1.init(this._configurationSettings, "applySharedTheme", function (newValue, oldValue, propertyName) {
                    widgetProps.propertyName = propertyName;
                    _this.appProps.applySharedTheme = _this._configurationSettings.applySharedTheme;
                    _this.currentApp.applySharedTheme = _this._configurationSettings.applySharedTheme;
                }),
                watchUtils_1.init(this._configurationSettings, "title", function (newValue, oldValue, propertyName) {
                    if (!_this._configurationSettings.title) {
                        _this._configurationSettings.title = itemUtils_1.getItemTitle(_this.item);
                    }
                    widgetProps.propertyName = propertyName;
                    _this.appProps.title = _this._configurationSettings.title;
                    _this.currentApp.title = _this._configurationSettings.title;
                })
            ]);
        };
        AttachmentViewerApp.prototype._getURLParameter = function (name) {
            return (decodeURIComponent((new RegExp("[?|&]" + name + "=" + "([^&;]+?)(&|#|;|$)").exec(location.search) || [null, ""])[1].replace(/\+/g, "%20")) || null);
        };
        // _handleCustomCSS
        AttachmentViewerApp.prototype._handleCustomCSS = function () {
            var customCSSStyleSheet = document.getElementById("customCSS");
            if (customCSSStyleSheet) {
                customCSSStyleSheet.remove();
            }
            var styles = document.createElement("style");
            styles.id = "customCSS";
            styles.type = "text/css";
            var styleTextNode = document.createTextNode(this._configurationSettings.customCSS);
            styles.appendChild(styleTextNode);
            document.head.appendChild(styles);
        };
        // _applyHeaderColors
        AttachmentViewerApp.prototype._applyHeaderColors = function () {
            var headerStyles = document.getElementById("headerStyles");
            if (headerStyles) {
                headerStyles.remove();
            }
            var config = this._configurationSettings;
            var headerColorConfig = this._configurationSettings.headerColor
                ? typeof this._configurationSettings.headerColor === "string"
                    ? this._configurationSettings.headerColor
                    : JSON.parse(this._configurationSettings.headerColor)
                : null;
            var headerBackgroundConfig = this._configurationSettings.headerBackground
                ? typeof this._configurationSettings.headerBackground === "string"
                    ? this._configurationSettings.headerBackground
                    : JSON.parse(this._configurationSettings.headerBackground)
                : null;
            var styles = [];
            var headerBackground = config.headerBackground &&
                !isNaN(headerBackgroundConfig.r) &&
                !isNaN(headerBackgroundConfig.g) &&
                !isNaN(headerBackgroundConfig.b) &&
                !isNaN(headerBackgroundConfig.a)
                ? "rgba(" + headerBackgroundConfig.r + ", " + headerBackgroundConfig.g + ", " + headerBackgroundConfig.b + ", " + headerBackgroundConfig.a + ")"
                : config.headerBackground === "no-color"
                    ? "transparent"
                    : config.headerBackground;
            var headerColor = config.headerColor &&
                !isNaN(headerColorConfig.r) &&
                !isNaN(headerColorConfig.g) &&
                !isNaN(headerColorConfig.b) &&
                !isNaN(headerColorConfig.a)
                ? "rgba(" + headerColorConfig.r + ", " + headerColorConfig.g + ", " + headerColorConfig.b + ", " + headerColorConfig.a + ")"
                : config.headerColor === "no-color"
                    ? "transparent"
                    : config.headerColor;
            styles.push(config.headerBackground
                ? ".esri-photo-centric__header{background:" + headerBackground + ";}"
                : null);
            styles.push(config.headerColor
                ? ".esri-photo-centric__header{color:" + headerColor + ";}"
                : null);
            styles.push(config.headerBackground
                ? ".esri-map-centric__header{background:" + headerBackground + ";}"
                : null);
            styles.push(config.headerColor
                ? ".esri-map-centric__header{color:" + headerColor + ";}"
                : null);
            var style = document.createElement("style");
            style.id = "headerStyles";
            style.appendChild(document.createTextNode(styles.join("")));
            document.getElementsByTagName("head")[0].appendChild(style);
        };
        AttachmentViewerApp.prototype._createSharedTheme = function () {
            var _a, _b, _c, _d, _e, _f;
            var portal = (_a = this.base) === null || _a === void 0 ? void 0 : _a.portal;
            var sharedTheme = null;
            if (portal === null || portal === void 0 ? void 0 : portal.portalProperties) {
                var theme = (_b = portal === null || portal === void 0 ? void 0 : portal.portalProperties) === null || _b === void 0 ? void 0 : _b.sharedTheme;
                sharedTheme = {
                    background: (_c = theme === null || theme === void 0 ? void 0 : theme.header) === null || _c === void 0 ? void 0 : _c.background,
                    text: (_d = theme === null || theme === void 0 ? void 0 : theme.header) === null || _d === void 0 ? void 0 : _d.text,
                    logo: (_e = theme === null || theme === void 0 ? void 0 : theme.logo) === null || _e === void 0 ? void 0 : _e.small,
                    logoLink: (_f = theme === null || theme === void 0 ? void 0 : theme.logo) === null || _f === void 0 ? void 0 : _f.link
                };
            }
            return sharedTheme;
        };
        AttachmentViewerApp.prototype._cleanUpHandles = function () {
            if (!this._configurationSettings.withinConfigurationExperience) {
                this.handles.removeAll();
                this.handles = null;
            }
        };
        return AttachmentViewerApp;
    }());
    return AttachmentViewerApp;
});
//# sourceMappingURL=Main.js.map