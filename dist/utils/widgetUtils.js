define(["require", "exports", "tslib", "esri/core/promiseUtils"], function (require, exports, tslib_1, promiseUtils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.toggleAppMode = exports.addSketch = exports.addFullScreen = exports.addLayerList = exports.addLegend = exports.addHome = exports.addZoom = exports.addSearch = void 0;
    function addSearch(props) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var view, portal, config, propertyName, search, searchConfiguration, searchOpenAtStart, modules, _a, Search, FeatureLayer, Expand, node, sources, content, searchExpand;
            return tslib_1.__generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        view = props.view, portal = props.portal, config = props.config, propertyName = props.propertyName;
                        search = config.search, searchConfiguration = config.searchConfiguration, searchOpenAtStart = config.searchOpenAtStart;
                        return [4 /*yield*/, promiseUtils_1.eachAlways([
                                new Promise(function (resolve_1, reject_1) { require(["esri/widgets/Search"], resolve_1, reject_1); }).then(tslib_1.__importStar),
                                new Promise(function (resolve_2, reject_2) { require(["esri/layers/FeatureLayer"], resolve_2, reject_2); }).then(tslib_1.__importStar),
                                new Promise(function (resolve_3, reject_3) { require(["esri/widgets/Expand"], resolve_3, reject_3); }).then(tslib_1.__importStar)
                            ])];
                    case 1:
                        modules = _b.sent();
                        _a = modules.map(function (module) { return module.value; }), Search = _a[0], FeatureLayer = _a[1], Expand = _a[2];
                        node = view.ui.find("searchExpand");
                        if (!Search || !FeatureLayer || !Expand) {
                            return [2 /*return*/];
                        }
                        if (!search) {
                            if (node) {
                                view.ui.remove(node);
                            }
                            return [2 /*return*/];
                        }
                        if (propertyName === "searchOpenAtStart" && node) {
                            node.expanded = searchOpenAtStart;
                        }
                        else if (propertyName === "search" ||
                            (propertyName === "searchConfiguration" && node)) {
                            if (node) {
                                view.ui.remove(node);
                            }
                            sources = searchConfiguration === null || searchConfiguration === void 0 ? void 0 : searchConfiguration.sources;
                            if (sources) {
                                sources.forEach(function (source) {
                                    var _a, _b;
                                    if ((_a = source === null || source === void 0 ? void 0 : source.layer) === null || _a === void 0 ? void 0 : _a.url) {
                                        source.layer = new FeatureLayer.default((_b = source === null || source === void 0 ? void 0 : source.layer) === null || _b === void 0 ? void 0 : _b.url);
                                    }
                                });
                            }
                            content = new Search.default(tslib_1.__assign({ view: view,
                                portal: portal, includeDefaultSources: true }, searchConfiguration));
                            searchExpand = new Expand.default({
                                expanded: searchOpenAtStart,
                                id: "searchExpand",
                                content: content,
                                mode: "floating",
                                view: view
                            });
                            view.ui.add({
                                component: searchExpand,
                                position: "top-left",
                                index: 0
                            });
                        }
                        return [2 /*return*/];
                }
            });
        });
    }
    exports.addSearch = addSearch;
    function addZoom(props) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var view, portal, config, mapZoom, modules, Zoom, node, content, zoomNode, zoomWidget;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        view = props.view, portal = props.portal, config = props.config;
                        mapZoom = config.mapZoom;
                        return [4 /*yield*/, promiseUtils_1.eachAlways([new Promise(function (resolve_4, reject_4) { require(["esri/widgets/Zoom"], resolve_4, reject_4); }).then(tslib_1.__importStar)])];
                    case 1:
                        modules = _a.sent();
                        Zoom = modules.map(function (module) { return module.value; })[0];
                        node = view.ui.find("mobileExpand");
                        content = node.get("content");
                        zoomNode = content.find(function (contentItem) {
                            return contentItem.id === "zoomWidget";
                        });
                        if (!mapZoom) {
                            if (zoomNode) {
                                content.remove(zoomNode);
                            }
                        }
                        if (mapZoom) {
                            zoomWidget = new Zoom.default({
                                id: "zoomWidget",
                                view: view,
                                portal: portal
                            });
                            node.content.splice(0, 0, zoomWidget);
                        }
                        return [2 /*return*/];
                }
            });
        });
    }
    exports.addZoom = addZoom;
    function addHome(props) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var view, portal, config, home, modules, Home, node, content, homeNode, homeWidget;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        view = props.view, portal = props.portal, config = props.config;
                        home = config.home;
                        return [4 /*yield*/, promiseUtils_1.eachAlways([new Promise(function (resolve_5, reject_5) { require(["esri/widgets/Home"], resolve_5, reject_5); }).then(tslib_1.__importStar)])];
                    case 1:
                        modules = _a.sent();
                        Home = modules.map(function (module) { return module.value; })[0];
                        node = view.ui.find("mobileExpand");
                        content = node.get("content");
                        homeNode = content.find(function (contentItem) {
                            return contentItem.id === "homeWidget";
                        });
                        if (!home) {
                            if (homeNode) {
                                content.remove(homeNode);
                            }
                        }
                        if (home) {
                            homeWidget = new Home.default({
                                id: "homeWidget",
                                view: view,
                                portal: portal
                            });
                            node.content.splice(1, 0, homeWidget);
                        }
                        return [2 /*return*/];
                }
            });
        });
    }
    exports.addHome = addHome;
    function addLegend(props) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var view, config, legend, modules, _a, Legend, Expand, node, content, legendNode, legendWidget, legendExpand;
            return tslib_1.__generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        view = props.view, config = props.config;
                        legend = config.legend;
                        return [4 /*yield*/, promiseUtils_1.eachAlways([
                                new Promise(function (resolve_6, reject_6) { require(["esri/widgets/Legend"], resolve_6, reject_6); }).then(tslib_1.__importStar),
                                new Promise(function (resolve_7, reject_7) { require(["esri/widgets/Expand"], resolve_7, reject_7); }).then(tslib_1.__importStar)
                            ])];
                    case 1:
                        modules = _b.sent();
                        _a = modules.map(function (module) { return module.value; }), Legend = _a[0], Expand = _a[1];
                        node = view.ui.find("mobileExpand");
                        content = node.get("content");
                        legendNode = content.find(function (contentItem) {
                            return contentItem.id === "legendWidget";
                        });
                        if (!legend) {
                            if (legendNode) {
                                content.remove(legendNode);
                            }
                        }
                        if (legend) {
                            legendWidget = new Legend.default({
                                view: view
                            });
                            legendExpand = new Expand.default({
                                view: view,
                                content: legendWidget,
                                mode: "floating",
                                id: "legendWidget",
                                group: "top-right"
                            });
                            node.content.splice(2, 0, legendExpand);
                        }
                        return [2 /*return*/];
                }
            });
        });
    }
    exports.addLegend = addLegend;
    function addLayerList(props) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var view, config, layerList, modules, _a, LayerList, Expand, node, content, layerListNode, layerList_1, legendExpand;
            return tslib_1.__generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        view = props.view, config = props.config;
                        layerList = config.layerList;
                        return [4 /*yield*/, promiseUtils_1.eachAlways([
                                new Promise(function (resolve_8, reject_8) { require(["esri/widgets/LayerList"], resolve_8, reject_8); }).then(tslib_1.__importStar),
                                new Promise(function (resolve_9, reject_9) { require(["esri/widgets/Expand"], resolve_9, reject_9); }).then(tslib_1.__importStar)
                            ])];
                    case 1:
                        modules = _b.sent();
                        _a = modules.map(function (module) { return module.value; }), LayerList = _a[0], Expand = _a[1];
                        node = view.ui.find("mobileExpand");
                        content = node.get("content");
                        layerListNode = content.find(function (contentItem) {
                            return contentItem.id === "layerlistWidget";
                        });
                        if (!layerList) {
                            if (layerListNode) {
                                content.remove(layerListNode);
                            }
                        }
                        if (layerList) {
                            layerList_1 = new LayerList.default({
                                view: view
                            });
                            legendExpand = new Expand.default({
                                view: view,
                                content: layerList_1,
                                mode: "floating",
                                id: "layerlistWidget",
                                group: "top-right"
                            });
                            node.content.splice(3, 0, legendExpand);
                            return [2 /*return*/, layerList_1];
                        }
                        return [2 /*return*/];
                }
            });
        });
    }
    exports.addLayerList = addLayerList;
    function addFullScreen(props) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var view, config, fullScreen, modules, FullScreen, node, content, fullScreenNode, fullScreen_1;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        view = props.view, config = props.config;
                        fullScreen = config.fullScreen;
                        return [4 /*yield*/, promiseUtils_1.eachAlways([new Promise(function (resolve_10, reject_10) { require(["esri/widgets/Fullscreen"], resolve_10, reject_10); }).then(tslib_1.__importStar)])];
                    case 1:
                        modules = _a.sent();
                        FullScreen = modules.map(function (module) { return module.value; })[0];
                        node = view.ui.find("mobileExpand");
                        content = node.get("content");
                        fullScreenNode = content.find(function (contentItem) {
                            return contentItem.id === "fullScreenWidget";
                        });
                        if (!fullScreen) {
                            if (fullScreenNode) {
                                content.remove(fullScreenNode);
                            }
                        }
                        if (fullScreen) {
                            fullScreen_1 = new FullScreen.default({
                                view: view,
                                id: "fullScreenWidget"
                            });
                            node.content.splice(4, 0, fullScreen_1);
                        }
                        return [2 /*return*/];
                }
            });
        });
    }
    exports.addFullScreen = addFullScreen;
    function addSketch(props) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var view, config, selectFeatures, modules, _a, Sketch, Expand, GraphicsLayer, node, content, sketchWidget, existingGraphicsLayer, graphicsLayer, sketch, sketchExpand;
            return tslib_1.__generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        view = props.view, config = props.config;
                        selectFeatures = config.selectFeatures;
                        return [4 /*yield*/, promiseUtils_1.eachAlways([
                                new Promise(function (resolve_11, reject_11) { require(["esri/widgets/Sketch"], resolve_11, reject_11); }).then(tslib_1.__importStar),
                                new Promise(function (resolve_12, reject_12) { require(["esri/widgets/Expand"], resolve_12, reject_12); }).then(tslib_1.__importStar),
                                new Promise(function (resolve_13, reject_13) { require(["esri/layers/GraphicsLayer"], resolve_13, reject_13); }).then(tslib_1.__importStar)
                            ])];
                    case 1:
                        modules = _b.sent();
                        _a = modules.map(function (module) { return module.value; }), Sketch = _a[0], Expand = _a[1], GraphicsLayer = _a[2];
                        node = view.ui.find("mobileExpand");
                        content = node.get("content");
                        sketchWidget = content.find(function (contentItem) {
                            return contentItem.id === "sketchWidget";
                        });
                        if (!selectFeatures) {
                            if (sketchWidget) {
                                content.remove(sketchWidget);
                            }
                        }
                        if (selectFeatures) {
                            existingGraphicsLayer = view.map.findLayerById("av-sketchGraphicsLayer");
                            graphicsLayer = null;
                            if (!existingGraphicsLayer) {
                                graphicsLayer = new GraphicsLayer.default({
                                    id: "av-sketchGraphicsLayer"
                                });
                                view.map.layers.unshift(graphicsLayer);
                            }
                            else {
                                graphicsLayer = existingGraphicsLayer;
                            }
                            sketch = new Sketch.default({
                                layer: graphicsLayer,
                                view: view,
                                availableCreateTools: ["rectangle"],
                                defaultUpdateOptions: {
                                    toggleToolOnClick: false,
                                    enableRotation: false
                                },
                                iconClass: "custom-sketch"
                            });
                            sketch.viewModel.updateOnGraphicClick = false;
                            sketchExpand = new Expand.default({
                                view: view,
                                content: sketch,
                                mode: "floating",
                                id: "sketchWidget",
                                group: "top-right"
                            });
                            node.content.splice(5, 0, sketchExpand);
                            return [2 /*return*/, sketch];
                        }
                        return [2 /*return*/];
                }
            });
        });
    }
    exports.addSketch = addSketch;
    function toggleAppMode(props, appProps, photoCentricMobileMapExpanded) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var appMode, config, appLayout, modules, _a, PhotoCentric, MapCentric;
            return tslib_1.__generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (props.propertyName === "appLayout") {
                            appMode = appProps.appMode;
                            if (appMode === "photo-centric") {
                                document
                                    .getElementById("app-container")
                                    .classList.remove("esri-map-centric");
                            }
                            else {
                                document
                                    .getElementById("app-container")
                                    .classList.remove("esri-photo-centric");
                            }
                        }
                        config = props.config;
                        appLayout = config.appLayout;
                        return [4 /*yield*/, promiseUtils_1.eachAlways([
                                new Promise(function (resolve_14, reject_14) { require(["../Components/PhotoCentric"], resolve_14, reject_14); }).then(tslib_1.__importStar),
                                new Promise(function (resolve_15, reject_15) { require(["../Components/MapCentric"], resolve_15, reject_15); }).then(tslib_1.__importStar)
                            ])];
                    case 1:
                        modules = _b.sent();
                        _a = modules.map(function (module) { return module.value; }), PhotoCentric = _a[0], MapCentric = _a[1];
                        if (appLayout === "photo-centric") {
                            if (document.body.clientWidth > 830) {
                                appProps.view.padding = {
                                    top: 0,
                                    bottom: 380,
                                    left: 0,
                                    right: 0
                                };
                            }
                            return [2 /*return*/, new PhotoCentric.default(tslib_1.__assign(tslib_1.__assign({}, appProps), { photoCentricMobileMapExpanded: photoCentricMobileMapExpanded }))];
                        }
                        else {
                            appProps.view.padding = {
                                top: 0,
                                bottom: 0,
                                left: 0,
                                right: 0
                            };
                            return [2 /*return*/, new MapCentric.default(tslib_1.__assign({}, appProps))];
                        }
                        return [2 /*return*/];
                }
            });
        });
    }
    exports.toggleAppMode = toggleAppMode;
});
//# sourceMappingURL=widgetUtils.js.map