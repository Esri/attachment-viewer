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
define(["require", "exports", "esri/core/tsSupport/declareExtendsHelper", "esri/core/tsSupport/decorateHelper", "esri/core/accessorSupport/decorators", "esri/widgets/support/widget", "dojo/i18n!./PhotoCentric/nls/resources", "esri/widgets/Widget", "esri/core/watchUtils", "./PhotoCentric/PhotoCentricViewModel", "./utils/utils", "./utils/imageUtils", "./utils/urlUtils", "ImageViewer"], function (require, exports, __extends, __decorate, decorators_1, widget_1, i18n, Widget, watchUtils, PhotoCentricViewModel, utils_1, imageUtils_1, urlUtils_1, ImageViewer) {
    "use strict";
    //----------------------------------
    //
    //  CSS Classes
    //
    //----------------------------------
    var CSS = {
        base: "esri-photo-centric",
        // header
        header: "esri-photo-centric__header",
        headerText: "esri-photo-centric__header-text",
        headerContainer: "esri-photo-centric__title-header-container",
        infoButton: "esri-photo-centric__info-button",
        titleInfoContainer: "esri-photo-centric__title-info-container",
        // onboarding
        onboarding: "esri-photo-centric__onboarding",
        onboardingContainer: "esri-photo-centric__onboarding-container",
        onboardingContentContainer: "esri-photo-centric__onboarding-content-container",
        onboardingContent: "esri-photo-centric__onboarding-content",
        onboardingStartButtonContainer: "esri-photo-centric__start-button-container",
        onboardingStartButton: "esri-photo-centric__start-button",
        onboardingOverlay: "esri-photo-centric__onboarding-overlay",
        hasOnboardingImage: "esri-photo-centric--has-onboarding-image",
        // map
        mapView: "esri-photo-centric__map-view",
        mapViewAndSearch: "esri-photo-centric__map-view-search",
        mapCollapsed: "esri-photo-centric--map-collapsed",
        expandCollapseContainer: "esri-photo-centric__expand-collapse-container",
        // share widget
        shareWidgetContainer: "esri-photo-centric__share-widget-container",
        shareLocationWidget: "esri-photo-centric__share-location-widget",
        // pagination
        paginationContainer: "esri-photo-centric__pagination-container",
        paginationTextContainer: "esri-photo-centric__pagination-text-container",
        leftArrowContainer: "esri-photo-centric__left-arrow-container",
        rightArrowContainer: "esri-photo-centric__right-arrow-container",
        leftButtonLayerSwitcher: "esri-photo-centric__left-button-layer-switcher",
        // Layer Switcher container
        layerSwitcherContainer: "esri-photo-centric__layer-switcher-container",
        // Content containers
        mainPageContainer: "esri-photo-centric__main-page-container",
        mainPage: "esri-photo-centric__main-page",
        mainPageTop: "esri-photo-centric__main-page-top-container",
        mainPageBottom: "esri-photo-centric__main-page-bottom-container",
        mainPageBottomExpanded: "esri-photo-centric--bottom-container-expanded",
        mainPageMid: "esri-photo-centric__main-page-mid-container",
        rightPanel: "esri-photo-centric__right-panel",
        // attachments
        attachmentNumber: "esri-photo-centric__attachment-number",
        mapAttachmentContent: "esri-photo-centric__map-attachment-content",
        attachmentsImageContainer: "esri-photo-centric__attachments-image-container",
        attachmentsImage: "esri-photo-centric__attachments-image",
        noAttachmentsContainer: "esri-photo-centric__no-attachments-container",
        noAttachmentsText: "esri-photo-centric__no-attachments-text",
        otherAttachmentsList: "esri-photo-centric__other-attachment-types",
        attachmentNumberText: "esri-photo-centric__attachment-number-text",
        mobileAttachmentText: "esri-photo-centric__mobile-attachments-text",
        attachmentCountNumber: "esri-photo-centric__mobile-attachment-count-number",
        imageMobile: "esri-photo-centric__image-mobile",
        photoCentricCamera: "esri-photo-centric__photo-centric-camera",
        attachmentScroll: "esri-photo-centric__attachment-scroll",
        attachmentIsVideo: "esri-photo-centric__attachment--is-video",
        // media
        photoViewer: "esri-photo-centric__photo-viewer-container",
        imageContainer: "esri-photo-centric__image-container",
        imageDesktop: "esri-photo-centric__image--desktop",
        imageViewerDesktop: "esri-photo-centric__image-viewer--desktop",
        imageLoader: "esri-photo-centric__image-loader",
        spinner: "esri-photo-centric__spinner",
        layerNotSupported: "esri-photo-centric__layer-not-supported",
        fadeImage: "esri-photo-centric--fade-image",
        videoContainer: "esri-photo-centric__video-container",
        zoomSlider: "esri-photo-centric__image-zoom-slider",
        zoomSliderButton: "esri-photo-centric__zoom-slider-button",
        slideSymbol: "esri-photo-centric__slide-symbol",
        hideImage: "esri-photo-centric--hide-image",
        // feature content
        featureTitleZoomContainer: "esri-photo-centric__feature-title-zoom-container",
        zoomContainer: "esri-photo-centric__zoom-to-container",
        featureLayerTitle: "esri-photo-centric__feature-layer-title",
        featureInfoContent: "esri-photo-centric__feature-info-content",
        featureContentInfo: "esri-photo-centric__feature-content-info",
        attributeHeading: "esri-photo-centric__attribute-heading",
        attributeContent: "esri-photo-centric__attribute-content",
        featureContent: "esri-photo-centric__feature-content",
        featureContentTitle: "esri-photo-centric__feature-content-title",
        noInfo: "esri-photo-centric__no-info-text",
        addressText: "esri-photo-centric__address-text",
        zoomTo: "esri-photo-centric__zoom-to",
        zoomToIcon: "esri-photo-centric__zoom-to-icon",
        contentLink: "esri-photo-centric__content-link",
        contentLoader: "esri-photo-centric__content-loader",
        featureContentContainer: "esri-photo-centric__feature-content-container",
        featureInfoContainer: "esri-photo-centric__feature-info-container",
        featureInfoLoader: "esri-photo-centric__feature-info-loader",
        noFeatureContentContainer: "esri-photo-centric__no-feature-content-container",
        // pdf
        pdf: "esri-photo-centric__pdf",
        // download
        downloadIconContainer: "esri-photo-centric__download-icon-container",
        downloadButtonDesktop: "esri-photo-centric__download-button-desktop",
        downloadIconTextContainer: "esri-photo-centric__download-icon-text-container",
        downloadIcon: "esri-photo-centric__download-icon",
        downloadEnabled: "esri-photo-centric--download-enabled",
        // mobile
        mobileAttachment: "esri-photo-centric__mobile-attachment",
        mobileFeatureContent: "esri-photo-centric__mobile-feature-content",
        mobileAttachmentCount: "esri-photo-centric__mobile-attachment-count",
        mobileAttachmentContainer: "esri-photo-centric__mobile-image-container",
        mobileAttachmentsAddPadding: "esri-photo-centric__mobile-attachments-add-padding",
        transparentBackground: "esri-photo-centric__transparent-background",
        removeBorderRadius: "esri-photo-centric__mobile-attachments-remove-border-radius",
        // loader
        widgetLoader: "esri-widget__loader esri-photo-centric__loader",
        animationLoader: "esri-widget__loader-animation esri-photo-centric__loader-animation",
        removeOpacity: "esri-photo-centric__remove-opacity",
        gpsImageDirection: "esri-photo-centric__gps-image-direction",
        imageDirectionDegrees: "esri-photo-centric__image-direction-degrees",
        imageDirection: "esri-photo-centric__image-direction",
        imageDirectionMobile: "esri-photo-centric__image-direction-mobile",
        attachmentViewerSvg: "esri-attachment-viewer__svg",
        svg: {
            media: "esri-photo-centric__media-svg"
        },
        // calcite
        calcite: {
            downloadIcon: "icon-ui-download",
            zoomInIcon: "icon-ui-zoom-in-magnifying-glass",
            leftArrow: "icon-ui-left",
            rightArrow: "icon-ui-right",
            upArrow: "icon-ui-up-arrow",
            downArrow: "icon-ui-down-arrow",
            button: "btn",
            buttonFill: "btn-fill",
            descriptionIcon: "icon-ui-description",
            close: "icon-ui-close",
            flush: "icon-ui-flush",
            loader: "loader",
            isActive: "is-active",
            paddingLeader: "padding-leader-3",
            paddingTrailer: "padding-trailer-3",
            loadingIcon: "esri-icon-loading-indicator",
            rotating: "esri-rotating",
            upArrowCircled: "esri-icon-up-arrow-circled",
            plusIcon: "esri-icon-plus",
            minusIcon: "esri-icon-minus"
        }
    };
    var WIDGET_KEY_PARTIAL = "esri-photo-centric";
    function buildKey(element, index) {
        if (index === undefined) {
            return WIDGET_KEY_PARTIAL + "__" + element;
        }
    }
    var PhotoCentric = /** @class */ (function (_super) {
        __extends(PhotoCentric, _super);
        function PhotoCentric(value) {
            var _this = _super.call(this) || this;
            //----------------------------------
            //
            //  Private Variables
            //
            //----------------------------------
            _this._mapAndSearchIsExpanded = true;
            _this._imageAttachment = null;
            _this._imageCarouselIsOpen = null;
            _this._photoViewerContainer = null;
            _this._mobileAttachment = null;
            _this._onboardingPanelIsOpen = null;
            _this._featureContentAvailable = null;
            _this._previousImageUrl = null;
            _this._featureContentPanel = null;
            _this._imageViewerSet = false;
            _this._imageViewer = null;
            _this._imageZoomLoaded = null;
            _this._zoomSliderNode = null;
            //----------------------------------
            //
            //  Properties
            //
            //----------------------------------
            // addressEnabled
            _this.addressEnabled = null;
            // appMode
            _this.appMode = null;
            // attachmentIndex
            _this.attachmentIndex = null;
            // attachmentLayer
            _this.attachmentLayer = null;
            // attachmentLayers
            _this.attachmentLayers = null;
            // attachmentViewerDataCollection
            _this.attachmentViewerDataCollection = null;
            // currentImageUrl
            _this.currentImageUrl = null;
            // defaultObjectId
            _this.defaultObjectId = null;
            // showOnboardingOnStart
            _this.showOnboardingOnStart = true;
            // docDirection
            _this.docDirection = null;
            // downloadEnabled
            _this.downloadEnabled = null;
            // featureLayerTitle
            _this.featureLayerTitle = null;
            // featureWidget
            _this.featureWidget = null;
            // graphicsLayer
            _this.graphicsLayer = null;
            // imageDirectionEnabled
            _this.imageDirectionEnabled = null;
            // imageIsLoaded
            _this.imageIsLoaded = null;
            // imagePanZoomEnabled
            _this.imagePanZoomEnabled = null;
            // layerSwitcher
            _this.layerSwitcher = null;
            // onboardingButtonText
            _this.onboardingButtonText = null;
            // onboardingContent
            _this.onboardingContent = null;
            // onboardingImage
            _this.onboardingImage = null;
            // onlyDisplayFeaturesWithAttachments
            _this.onlyDisplayFeaturesWithAttachmentsIsEnabled = null;
            // order
            _this.order = null;
            // photoCentricSketchExtent
            _this.photoCentricSketchExtent = null;
            // searchWidget
            _this.searchWidget = null;
            // selectedAttachmentViewerData
            _this.selectedAttachmentViewerData = null;
            // shareLocationWidget
            _this.shareLocationWidget = null;
            // sketchWidget
            _this.sketchWidget = null;
            // socialSharingEnabled
            _this.socialSharingEnabled = null;
            // title
            _this.title = null;
            // selectFeaturesEnabled
            _this.selectFeaturesEnabled = null;
            // selectedLayerId
            _this.selectedLayerId = null;
            // view
            _this.view = null;
            // zoomLevel
            _this.zoomLevel = null;
            // onboardingIsEnabled
            _this.onboardingIsEnabled = true;
            // viewModel
            _this.viewModel = new PhotoCentricViewModel();
            return _this;
        }
        //----------------------------------
        //
        //  Lifecycle
        //
        //----------------------------------
        PhotoCentric.prototype.postInitialize = function () {
            var _this = this;
            this.own([
                watchUtils.whenOnce(this, "view.ready", function () {
                    _this._initOnViewReady();
                })
            ]);
        };
        // _initOnViewReady
        PhotoCentric.prototype._initOnViewReady = function () {
            var _this = this;
            if (this.onboardingIsEnabled) {
                this._handleOnboardingPanel();
            }
            this.own([
                this._handleCurrentAttachment(),
                this._scrollFeatureContentPanelToTop(),
                this._scheduleRenderOnLayerFeatureChange(),
                this._handleSelectFeaturesWatchers(),
                watchUtils.whenFalse(this, "imageIsLoaded", function () {
                    if (_this._imageAttachment) {
                        _this._imageAttachment.style.opacity = "0";
                    }
                })
            ]);
            if (this.imagePanZoomEnabled) {
                this.own([this._setImageZoomLoadedToFalse()]);
            }
        };
        // _handleOnboardingPanel
        PhotoCentric.prototype._handleOnboardingPanel = function () {
            if (this.showOnboardingOnStart) {
                if (localStorage.getItem("firstTimeUseApp")) {
                    this._onboardingPanelIsOpen = false;
                }
                else {
                    this._onboardingPanelIsOpen = true;
                    localStorage.setItem("firstTimeUseApp", "" + Date.now());
                }
            }
            else {
                this._onboardingPanelIsOpen = false;
            }
            this.scheduleRender();
        };
        // _handleCurrentAttachment
        PhotoCentric.prototype._handleCurrentAttachment = function () {
            var _this = this;
            return watchUtils.watch(this, [
                "selectedAttachmentViewerData.selectedFeatureAttachments",
                "selectedAttachmentViewerData.attachmentIndex"
            ], function () {
                _this._previousImageUrl = _this.currentImageUrl;
                var attachments = _this.get("selectedAttachmentViewerData.selectedFeatureAttachments.attachments");
                var attachmentIndex = _this.get("selectedAttachmentViewerData.attachmentIndex");
                var attachment = attachments &&
                    attachments.getItemAt(attachmentIndex);
                var attachmentUrl = attachment ? attachment.url : null;
                _this.currentImageUrl = _this._convertAttachmentUrl(attachmentUrl);
                _this._handlePanZoomForCurrentAttachment(attachment);
                _this.scheduleRender();
            });
        };
        // _handlePanZoomForCurrentAttachment
        PhotoCentric.prototype._handlePanZoomForCurrentAttachment = function (attachment) {
            if (this.imagePanZoomEnabled &&
                this._imageViewer &&
                document.body.clientWidth > 813) {
                this._imageViewer && this._imageViewer.destroy();
                this._imageViewer = null;
                this._imageViewerSet = false;
                this._imageZoomLoaded = false;
                if (this._zoomSliderNode) {
                    this._zoomSliderNode.value = "100";
                }
            }
            if (this.imagePanZoomEnabled) {
                this._handleImagePanZoom(attachment);
            }
        };
        // _scrollFeatureContentPanelToTop
        PhotoCentric.prototype._scrollFeatureContentPanelToTop = function () {
            var _this = this;
            return watchUtils.watch(this, "selectedAttachmentViewerData.objectIdIndex", function () {
                if (_this._featureContentPanel) {
                    _this._featureContentPanel.scrollTop = 0;
                }
            });
        };
        // _setImageZoomLoadedToFalse
        PhotoCentric.prototype._setImageZoomLoadedToFalse = function () {
            var _this = this;
            return watchUtils.watch(this, "selectedAttachmentViewerData", function () {
                _this._imageZoomLoaded = false;
                _this.scheduleRender();
            });
        };
        // _scheduleRenderOnLayerFeatureChange
        PhotoCentric.prototype._scheduleRenderOnLayerFeatureChange = function () {
            var _this = this;
            return watchUtils.on(this, "selectedAttachmentViewerData.layerFeatures", "change", function () {
                _this.scheduleRender();
            });
        };
        // _handleSelectFeaturesWatchers
        PhotoCentric.prototype._handleSelectFeaturesWatchers = function () {
            var _this = this;
            return watchUtils.whenOnce(this, "selectFeaturesEnabled", function () {
                _this._handleScheduleRenderOnSketchEvent();
            });
        };
        // _handleScheduleRenderOnSketchEvent
        PhotoCentric.prototype._handleScheduleRenderOnSketchEvent = function () {
            var _this = this;
            this.own([
                this.sketchWidget.on("create", function () {
                    _this.scheduleRender();
                }),
                this.sketchWidget.on("update", function () {
                    _this.scheduleRender();
                })
            ]);
        };
        PhotoCentric.prototype.render = function () {
            var header = this._renderHeader();
            var homePage = this._renderHomePage();
            var onboarding = this._renderOnboarding();
            return (widget_1.tsx("div", { class: CSS.base },
                !this._imageCarouselIsOpen ? header : null,
                this._onboardingPanelIsOpen &&
                    document.body.clientWidth < 813 &&
                    this.onboardingIsEnabled ? (widget_1.tsx("div", { key: buildKey("onboarding-node"), class: CSS.onboarding }, onboarding)) : null,
                homePage));
        };
        PhotoCentric.prototype.destroy = function () {
            this._onboardingPanelIsOpen = null;
            this._mapAndSearchIsExpanded = null;
            this._imageCarouselIsOpen = null;
            if (this.imagePanZoomEnabled && this._imageViewer) {
                this._imageViewer.destroy();
                this._imageViewer = null;
            }
        };
        //----------------------------------
        //
        //  START OF RENDER NODE METHODS
        //
        //----------------------------------
        // _renderHeader
        PhotoCentric.prototype._renderHeader = function () {
            var title = document.body.clientWidth < 813 && this.title.length > 40
                ? this.title
                    .split("")
                    .slice(0, 35)
                    .join("") + "..."
                : this.title;
            var layerFeatures = this.get("selectedAttachmentViewerData.layerFeatures");
            var shareWidget = this.shareLocationWidget &&
                layerFeatures &&
                layerFeatures.length &&
                document.body.clientWidth > 813
                ? this._renderShareLocationWidget()
                : null;
            return (widget_1.tsx("header", { class: CSS.header },
                widget_1.tsx("div", { class: CSS.headerContainer },
                    widget_1.tsx("div", { class: CSS.titleInfoContainer },
                        widget_1.tsx("h1", { class: CSS.headerText }, title),
                        this.onboardingIsEnabled ? (widget_1.tsx("span", { bind: this, onclick: this._toggleOnboardingPanel, onkeydown: this._toggleOnboardingPanel, tabIndex: 0, class: this.classes(CSS.infoButton, CSS.calcite.descriptionIcon, CSS.calcite.flush), title: i18n.viewDetails })) : null)),
                widget_1.tsx("div", { class: CSS.shareWidgetContainer }, shareWidget)));
        };
        // _renderShareWidget
        PhotoCentric.prototype._renderShareLocationWidget = function () {
            return (widget_1.tsx("div", { class: CSS.shareLocationWidget, bind: this.shareLocationWidget.container, afterCreate: utils_1.attachToNode }));
        };
        // _renderHomePage
        PhotoCentric.prototype._renderHomePage = function () {
            var onboarding = this._renderOnboarding();
            var content = this._renderContent();
            var mediaViewerDesktop = this._renderMediaViewerDesktop();
            var clientWidth = document.body.clientWidth;
            return (widget_1.tsx("div", { key: buildKey("main-page"), class: CSS.mainPageContainer, role: "main" },
                widget_1.tsx("div", { class: CSS.mainPage },
                    this._onboardingPanelIsOpen && clientWidth > 813 ? (widget_1.tsx("div", { class: CSS.onboardingOverlay }, onboarding)) : null,
                    content),
                mediaViewerDesktop));
        };
        // _renderContent
        PhotoCentric.prototype._renderContent = function () {
            var _a, _b;
            var mapView = this._renderMapView();
            var pagination = this._renderPagination();
            var mapCollapsed = (_a = {},
                _a[CSS.mapCollapsed] = !this._mapAndSearchIsExpanded,
                _a);
            var expandCollapse = this._renderExpandCollapse();
            var attachmentsContainer = this._renderAttachmentsContainer();
            var featureContentExpanded = (_b = {},
                _b[CSS.mainPageBottom] = this._mapAndSearchIsExpanded,
                _b[CSS.mainPageBottomExpanded] = !this._mapAndSearchIsExpanded,
                _b);
            return (widget_1.tsx("div", { key: buildKey("map-attachment-content"), class: CSS.mapAttachmentContent },
                widget_1.tsx("div", { class: this.classes(CSS.mainPageTop, mapCollapsed) },
                    pagination,
                    this._mapAndSearchIsExpanded ? (widget_1.tsx("div", { key: buildKey("mapview-search"), class: CSS.mapViewAndSearch }, mapView)) : null),
                widget_1.tsx("div", { class: CSS.mainPageMid }, expandCollapse),
                widget_1.tsx("div", { key: buildKey("feature-content-panel"), class: this.classes(featureContentExpanded) }, attachmentsContainer)));
        };
        // _renderMapView
        PhotoCentric.prototype._renderMapView = function () {
            return (widget_1.tsx("div", { bind: this.view.container, afterCreate: utils_1.attachToNode, class: CSS.mapView }));
        };
        // _renderPagination
        PhotoCentric.prototype._renderPagination = function () {
            var selectedAttachmentViewerData = this.selectedAttachmentViewerData;
            var featureTotal = selectedAttachmentViewerData &&
                selectedAttachmentViewerData.get("featureObjectIds.length");
            var leftButtonLayerSwitcherContainer = this._renderLeftButtonLayerSwitcherContainer();
            var rightFeatureScrollButton = this._renderRightFeatureScrollButton();
            var paginationNumbers = featureTotal
                ? this._renderPaginationNumbers(featureTotal)
                : null;
            return (widget_1.tsx("div", { key: buildKey("feature-pagination"), class: CSS.paginationContainer },
                leftButtonLayerSwitcherContainer,
                paginationNumbers,
                rightFeatureScrollButton));
        };
        // _renderLeftButtonLayerSwitcherContainer
        PhotoCentric.prototype._renderLeftButtonLayerSwitcherContainer = function () {
            var previousFeatureButton = this._renderPreviousFeatureButton();
            var nextFeatureButton = this._renderNextFeatureButton();
            var layerSwitcherButton = this.get("layerSwitcher.featureLayerCollection.length") > 1
                ? this._renderLayerSwitcherButton()
                : null;
            if (this.docDirection === "ltr") {
                return (widget_1.tsx("div", { key: buildKey("left-button-layer-switcher"), class: CSS.leftButtonLayerSwitcher },
                    previousFeatureButton,
                    layerSwitcherButton));
            }
            else {
                return (widget_1.tsx("div", { key: buildKey("left-button-layer-switcher"), class: CSS.leftButtonLayerSwitcher },
                    layerSwitcherButton,
                    nextFeatureButton));
            }
        };
        // _renderPreviousFeatureButton
        PhotoCentric.prototype._renderPreviousFeatureButton = function () {
            var selectedAttachmentViewerData = this.selectedAttachmentViewerData;
            return (widget_1.tsx("button", { bind: this, onclick: this._previousFeature, onkeydown: this._previousFeature, tabIndex: 0, class: CSS.leftArrowContainer, title: i18n.previousLocation },
                widget_1.tsx("span", { class: this.classes(CSS.calcite.leftArrow, CSS.calcite.flush) })));
        };
        // _renderNextFeatureButton
        PhotoCentric.prototype._renderNextFeatureButton = function () {
            return (widget_1.tsx("button", { bind: this, onclick: this._nextFeature, onkeydown: this._nextFeature, tabIndex: 0, class: CSS.leftArrowContainer, title: i18n.nextLocation },
                widget_1.tsx("span", { class: this.classes(CSS.calcite.leftArrow, CSS.calcite.flush) })));
        };
        // _renderRightFeatureScrollButton
        PhotoCentric.prototype._renderRightFeatureScrollButton = function () {
            return (widget_1.tsx("button", { bind: this, onclick: this.docDirection === "rtl"
                    ? this._previousFeature
                    : this._nextFeature, onkeydown: this.docDirection === "rtl"
                    ? this._previousFeature
                    : this._nextFeature, tabIndex: 0, class: CSS.rightArrowContainer, title: this.docDirection === "rtl"
                    ? i18n.previousLocation
                    : i18n.nextLocation },
                widget_1.tsx("span", { class: this.classes(CSS.calcite.rightArrow, CSS.calcite.flush) })));
        };
        // _renderPaginationNumbers
        PhotoCentric.prototype._renderPaginationNumbers = function (featureTotal) {
            var selectedAttachmentViewerData = this.selectedAttachmentViewerData;
            var currentlayerFeatureIndex = selectedAttachmentViewerData &&
                selectedAttachmentViewerData.objectIdIndex + 1;
            return (widget_1.tsx("div", { class: CSS.paginationTextContainer }, "" + (document.body.clientWidth > 813 ? i18n.upperCaseLocations + ": " : "") + currentlayerFeatureIndex + " / " + featureTotal));
        };
        // _renderLayerSwitcherButton
        PhotoCentric.prototype._renderLayerSwitcherButton = function () {
            return (widget_1.tsx("div", { bind: this.layerSwitcher.container, class: CSS.layerSwitcherContainer, afterCreate: utils_1.attachToNode }));
        };
        // _renderExpandCollapse
        PhotoCentric.prototype._renderExpandCollapse = function () {
            return (widget_1.tsx("div", { bind: this, onclick: this._toggleExpand, onkeydown: this._toggleExpand, tabIndex: 0, class: CSS.expandCollapseContainer },
                widget_1.tsx("span", { class: this.classes(this._mapAndSearchIsExpanded
                        ? CSS.calcite.upArrow
                        : CSS.calcite.downArrow, CSS.calcite.flush) })));
        };
        // _renderOnboarding
        PhotoCentric.prototype._renderOnboarding = function () {
            var onboardingWelcomeContent = this._renderOnboardingWelcomeContent();
            var onboardingStartButton = this._renderOnboardingStartButton();
            return (widget_1.tsx("div", { key: buildKey("onboarding-container"), class: CSS.onboardingContainer },
                widget_1.tsx("div", { class: CSS.onboardingContentContainer }, onboardingWelcomeContent),
                onboardingStartButton));
        };
        // _renderOnboardingWelcomeContent
        PhotoCentric.prototype._renderOnboardingWelcomeContent = function () {
            return (widget_1.tsx("div", { key: buildKey("onboarding-welcome") }, this.onboardingContent.render()));
        };
        // _renderOnboardingStartButton
        PhotoCentric.prototype._renderOnboardingStartButton = function () {
            var buttonText = this.onboardingButtonText
                ? this.onboardingButtonText
                : i18n.start;
            return (widget_1.tsx("div", { class: CSS.onboardingStartButtonContainer },
                widget_1.tsx("button", { bind: this, onclick: this._disableOnboardingPanel, onkeydown: this._disableOnboardingPanel, tabIndex: 0, class: this.classes(CSS.onboardingStartButton, CSS.calcite.button, CSS.calcite.buttonFill) }, buttonText)));
        };
        // _renderMediaContainer
        PhotoCentric.prototype._renderMediaContainer = function () {
            var _a;
            var attachments = this.get("selectedAttachmentViewerData.selectedFeatureAttachments.attachments");
            var attachment = this._getCurrentAttachment(attachments);
            var downloadEnabled = (_a = {},
                _a[CSS.downloadEnabled] = !this.downloadEnabled,
                _a);
            var contentTypeCheck = this._validateContentType(attachment);
            var mediaViewerLoader = attachment &&
                this.selectedAttachmentViewerData &&
                !this.imageIsLoaded &&
                !this.imagePanZoomEnabled
                ? this._renderMediaViewerLoader()
                : null;
            var mediaViewerContainer = this._renderMediaViewerContainer(attachment);
            var onboardingImage = this._onboardingPanelIsOpen &&
                this.onboardingImage &&
                this.onboardingIsEnabled
                ? this._renderOnboardingImage()
                : null;
            var zoomSlider = this.imagePanZoomEnabled &&
                document.body.clientWidth > 813 &&
                this.currentImageUrl &&
                contentTypeCheck &&
                this.imagePanZoomEnabled
                ? this._onboardingPanelIsOpen &&
                    this.onboardingImage &&
                    this.onboardingIsEnabled
                    ? null
                    : this._renderZoomSlider()
                : null;
            var mediaViewerFooter = this._renderMediaViewerFooter();
            return (widget_1.tsx("div", { class: CSS.rightPanel },
                widget_1.tsx("div", { key: buildKey("image-container"), class: this.classes(downloadEnabled, CSS.photoViewer) },
                    mediaViewerContainer,
                    mediaViewerLoader,
                    onboardingImage,
                    zoomSlider,
                    mediaViewerFooter)));
        };
        // _renderMediaViewerLoader
        PhotoCentric.prototype._renderMediaViewerLoader = function () {
            return (widget_1.tsx("div", { class: CSS.widgetLoader, key: buildKey("base-loader") },
                widget_1.tsx("span", { class: CSS.animationLoader, role: "presentation", "aria-label": i18n.loadingImages })));
        };
        // _renderNoAttachmentsContainer
        PhotoCentric.prototype._renderNoAttachmentsContainer = function () {
            return (widget_1.tsx("div", { key: buildKey("no-attachments-container"), class: CSS.noAttachmentsContainer },
                widget_1.tsx("svg", { class: CSS.svg.media, xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 16 16" },
                    widget_1.tsx("path", { d: "M1 2v12h14V2zm13 11H2V3h12zm-1-1H3v-1h10zM3 8.678l.333-.356a.3.3 0 0 1 .445 0 .3.3 0 0 0 .444 0l2.242-2.39a.3.3 0 0 1 .423-.021l2.255 2.005a.299.299 0 0 0 .39.01l1.361-.915a.3.3 0 0 1 .41.032L13 8.678V10H3zM11.894 9l-.89-.859-.846.565a1.299 1.299 0 0 1-1.68-.043L6.732 7.11 4.958 9zm-.644-4.5a.75.75 0 1 1-.75-.75.75.75 0 0 1 .75.75z" })),
                widget_1.tsx("span", { class: CSS.noAttachmentsText }, i18n.noPhotoAttachmentsFound)));
        };
        // _renderMediaViewerContainer
        PhotoCentric.prototype._renderMediaViewerContainer = function (attachment) {
            var _a, _b;
            var hasOnboardingImage = (_a = {},
                _a[CSS.hasOnboardingImage] = this._onboardingPanelIsOpen &&
                    this.onboardingImage &&
                    this.onboardingIsEnabled,
                _a);
            var currentImageUrl = this.currentImageUrl;
            var currentImage = !this.imagePanZoomEnabled ||
                (attachment &&
                    attachment.contentType &&
                    attachment.contentType.indexOf("gif") !== -1)
                ? this._renderCurrentImage()
                : null;
            var media = attachment && attachment.contentType
                ? attachment.contentType.indexOf("video") !== -1
                    ? this._renderVideo(currentImageUrl)
                    : attachment.contentType.indexOf("pdf") !== -1
                        ? this._renderPDF(currentImageUrl)
                        : currentImage
                : null;
            var supportsAttachment = this.get("selectedAttachmentViewerData.layerData.featureLayer.capabilities.data.supportsAttachment");
            var attachments = this.get("selectedAttachmentViewerData.selectedFeatureAttachments.attachments");
            var videoStyles = (_b = {},
                _b[CSS.attachmentIsVideo] = attachment &&
                    attachment.contentType &&
                    attachment.contentType.indexOf("video") !== -1,
                _b);
            return (widget_1.tsx("div", { bind: this, afterCreate: widget_1.storeNode, "data-node-ref": "_photoViewerContainer", class: this.classes(CSS.imageContainer, hasOnboardingImage, videoStyles) }, supportsAttachment === false ? (widget_1.tsx("div", { class: CSS.layerNotSupported }, i18n.notSupported)) : !this.selectedAttachmentViewerData ||
                (attachments && attachments.length === 0) ? (this._renderNoAttachmentsContainer()) : (media)));
        };
        // _renderVideo
        PhotoCentric.prototype._renderVideo = function (currentImageUrl) {
            this.set("imageIsLoaded", true);
            return (widget_1.tsx("video", { bind: this, key: buildKey("video-" + currentImageUrl), class: CSS.videoContainer, controls: true },
                widget_1.tsx("source", { src: currentImageUrl, type: "video/mp4" }),
                widget_1.tsx("source", { src: currentImageUrl, type: "video/quicktime" }),
                widget_1.tsx("source", { src: currentImageUrl, type: "video/ogg" }),
                widget_1.tsx("source", { src: currentImageUrl, type: "video/mov" }),
                i18n.doesNotSupportVideo));
        };
        // _renderPDF
        PhotoCentric.prototype._renderPDF = function (currentImageUrl) {
            this.set("imageIsLoaded", true);
            return (widget_1.tsx("iframe", { class: CSS.pdf, key: buildKey("pdf-" + currentImageUrl), src: currentImageUrl, frameborder: "0" }));
        };
        // _renderCurrentImage
        PhotoCentric.prototype._renderCurrentImage = function () {
            var attachments = this.get("selectedAttachmentViewerData.selectedFeatureAttachments.attachments");
            var attachment = this._getCurrentAttachment(attachments);
            var name = attachment ? attachment.name : null;
            return (widget_1.tsx("img", { bind: this, class: this.classes(CSS.imageDesktop), src: this.currentImageUrl ? this.currentImageUrl : "", onload: this._removeImageLoader, afterCreate: widget_1.storeNode, "data-node-ref": "_imageAttachment", "data-attachment": attachment, alt: name }));
        };
        // _renderOnboardingImage
        PhotoCentric.prototype._renderOnboardingImage = function () {
            return (widget_1.tsx("div", { class: CSS.imageContainer },
                widget_1.tsx("img", { src: this.onboardingImage })));
        };
        // _renderZoomSlider
        PhotoCentric.prototype._renderZoomSlider = function () {
            var _this = this;
            return (widget_1.tsx("div", { class: CSS.zoomSlider },
                widget_1.tsx("button", { bind: this, onclick: this._zoomOutImage, onkeydown: this._zoomOutImage, title: i18n.zoomOutImage, class: CSS.zoomSliderButton, tabIndex: 0 },
                    widget_1.tsx("span", { class: this.classes(CSS.slideSymbol, CSS.calcite.minusIcon) })),
                widget_1.tsx("input", { bind: this, afterCreate: widget_1.storeNode, "data-node-ref": "_zoomSliderNode", type: "range", min: "100", max: "500", step: "10", oninput: function (event) {
                        if (_this._imageViewer) {
                            _this._imageViewer.zoom(event.target.valueAsNumber);
                        }
                    } }),
                widget_1.tsx("button", { bind: this, onclick: this._zoomInImage, onkeydown: this._zoomInImage, tabIndex: 0, class: CSS.zoomSliderButton, title: i18n.zoomInImage },
                    widget_1.tsx("span", { class: this.classes(CSS.slideSymbol, CSS.calcite.plusIcon) }))));
        };
        // _renderMediaViewerFooter
        PhotoCentric.prototype._renderMediaViewerFooter = function () {
            var attachments = this.get("selectedAttachmentViewerData.selectedFeatureAttachments.attachments");
            var attachment = this._getCurrentAttachment(attachments);
            var attachmentScrollContent = attachments && attachments.length > 0
                ? this._renderAttachmentScrollContent(attachments)
                : null;
            var contentType = attachment && attachment.get("contentType");
            var downloadButton = contentType &&
                contentType.indexOf("video") === -1 &&
                contentType.indexOf("gif") === -1 &&
                contentType.indexOf("pdf") === -1 &&
                this.downloadEnabled
                ? this.viewModel.state === "downloading"
                    ? this._renderDownloadLoaderIcon()
                    : this._renderDownloadButton(attachment)
                : null;
            return (widget_1.tsx("div", { key: buildKey("attachment-count"), class: CSS.attachmentNumber },
                attachmentScrollContent,
                downloadButton));
        };
        // _renderMediaViewerDesktop
        PhotoCentric.prototype._renderMediaViewerDesktop = function () {
            var mediaContainer = this._renderMediaContainer();
            return widget_1.tsx("div", { class: CSS.imageViewerDesktop }, mediaContainer);
        };
        // _renderDownloadButton
        PhotoCentric.prototype._renderDownloadButton = function (attachment) {
            return (widget_1.tsx("button", { class: this.classes(CSS.downloadIconContainer, CSS.downloadButtonDesktop), bind: this, onclick: this._downloadImage, onkeydown: this._downloadImage, "data-image-url": this.currentImageUrl, "data-image-name": attachment.name, title: i18n.download },
                widget_1.tsx("span", { class: this.classes(CSS.calcite.downloadIcon, CSS.calcite.flush, CSS.downloadIcon) })));
        };
        // _renderDownloadIcon
        PhotoCentric.prototype._renderDownloadLoaderIcon = function () {
            return (widget_1.tsx("div", { class: CSS.downloadIconContainer },
                widget_1.tsx("span", { class: this.classes(CSS.calcite.loadingIcon, CSS.calcite.rotating, CSS.spinner), role: "presentation" })));
        };
        // _renderAttachmentScrollContent
        PhotoCentric.prototype._renderAttachmentScrollContent = function (attachments) {
            var attachment = this._getCurrentAttachment(attachments);
            var attachmentScroll = this._renderAttachmentScroll(attachments);
            var imageDirection = this._renderImageDirection(attachment);
            return (widget_1.tsx("div", { key: buildKey("download-attachment"), class: CSS.downloadIconTextContainer },
                attachmentScroll,
                imageDirection));
        };
        // _renderAttachmentScroll
        PhotoCentric.prototype._renderAttachmentScroll = function (attachments) {
            var selectedAttachmentViewerData = this.selectedAttachmentViewerData;
            var currentIndex = selectedAttachmentViewerData &&
                selectedAttachmentViewerData.attachmentIndex + 1;
            var totalNumberOfAttachments = this.viewModel.getTotalNumberOfAttachments();
            return (widget_1.tsx("div", { class: CSS.attachmentScroll },
                widget_1.tsx("button", { bind: this, onclick: this._previousImage, onkeydown: this._previousImage, disabled: this._onboardingPanelIsOpen ||
                        (attachments && attachments.length < 2)
                        ? true
                        : false, tabIndex: 0, class: CSS.leftArrowContainer, title: i18n.previousImage }, this.docDirection === "rtl" ? (widget_1.tsx("span", { class: this.classes(CSS.calcite.rightArrow, CSS.calcite.flush) })) : (widget_1.tsx("span", { class: this.classes(CSS.calcite.leftArrow, CSS.calcite.flush) }))),
                widget_1.tsx("span", { class: CSS.attachmentNumberText }, i18n.upperCaseAttachments + ": " + currentIndex + " / " + totalNumberOfAttachments),
                widget_1.tsx("button", { bind: this, onclick: this._nextImage, onkeydown: this._nextImage, disabled: this._onboardingPanelIsOpen ||
                        (attachments && attachments.length < 2)
                        ? true
                        : false, tabIndex: 0, class: CSS.rightArrowContainer, title: i18n.nextImage }, this.docDirection === "rtl" ? (widget_1.tsx("span", { class: this.classes(CSS.calcite.leftArrow, CSS.calcite.flush) })) : (widget_1.tsx("span", { class: this.classes(CSS.calcite.rightArrow, CSS.calcite.flush) })))));
        };
        // _renderImageDirection
        PhotoCentric.prototype._renderImageDirection = function (attachment) {
            var imageDirectionValue = this.imageDirectionEnabled
                ? this.viewModel.getGPSInformation(attachment)
                : null;
            return imageDirectionValue ? (widget_1.tsx("div", { key: buildKey("gps-image-direction-" + attachment.name + "-" + attachment.size + "-" + attachment.url + "-" + imageDirectionValue), class: CSS.gpsImageDirection },
                widget_1.tsx("span", { class: CSS.imageDirectionDegrees },
                    i18n.gpsImageDirection,
                    ": ", "" + imageDirectionValue,
                    "\u00B0"),
                widget_1.tsx("div", { title: i18n.gpsImageDirection + ": " + imageDirectionValue + "\u00B0", class: CSS.imageDirection },
                    widget_1.tsx("svg", { styles: { transform: "rotateZ(" + imageDirectionValue + "deg)" }, class: CSS.photoCentricCamera },
                        widget_1.tsx("g", null,
                            widget_1.tsx("path", { d: "M19.1,10.8h-0.3h-0.3h-1.3v2h-1v-0.7v-0.3h-11l0,0h-1v1.1v5.8v0h16v-1.9v-3.9v-1.1\n\t\tC20.2,11.3,19.7,10.8,19.1,10.8z" }),
                            widget_1.tsx("path", { d: "M15.2,8.2V7.4v-2c0-0.9-0.7-1.6-1.6-1.6H7.8c-0.9,0-1.6,0.7-1.6,1.6v2v0.8v2.6h9V8.2z" }),
                            widget_1.tsx("path", { d: "M12,1c6.1,0,11,4.9,11,11s-4.9,11-11,11S1,18.1,1,12S5.9,1,12,1 M12,0C5.4,0,0,5.4,0,12s5.4,12,12,12\n\t\tc6.6,0,12-5.4,12-12S18.6,0,12,0L12,0z" })))))) : null;
        };
        // _renderAttachmentsContainer
        PhotoCentric.prototype._renderAttachmentsContainer = function () {
            var attachments = this.get("selectedAttachmentViewerData.selectedFeatureAttachments.attachments");
            var clientWidth = document.body.clientWidth;
            var attachmentsMobile = attachments && clientWidth < 813
                ? this._renderAttachmentsMobile(attachments)
                : null;
            var titleZoomToContainer = this._renderTitleZoomToContainer();
            var selectedFeatureAddress = this.get("selectedAttachmentViewerData.selectedFeatureAddress");
            var featureInformation = this._renderFeatureInformation();
            return (widget_1.tsx("div", { bind: this, afterCreate: widget_1.storeNode, "data-node-ref": "_featureContentPanel", class: CSS.featureContent },
                titleZoomToContainer,
                selectedFeatureAddress ? (widget_1.tsx("h3", { class: CSS.addressText }, selectedFeatureAddress)) : null,
                widget_1.tsx("div", { class: CSS.attachmentsImageContainer }, attachmentsMobile),
                featureInformation));
        };
        // _renderFeatureInformation
        PhotoCentric.prototype._renderFeatureInformation = function () {
            var featureWidgetContent = this.get("viewModel.featureWidget.viewModel.content");
            var fieldsInfoContent = (featureWidgetContent &&
                featureWidgetContent.filter(function (contentItem) {
                    var fieldInfos = contentItem.get("fieldInfos");
                    return (contentItem.type === "fields" && fieldInfos && fieldInfos.length > 0);
                })) ||
                [];
            var fieldsInfoText = (featureWidgetContent &&
                featureWidgetContent.filter(function (contentItem) {
                    return contentItem.type === "text";
                })) ||
                [];
            var mediaInfoContent = (featureWidgetContent &&
                featureWidgetContent &&
                featureWidgetContent.filter(function (contentItem) {
                    var mediaInfos = contentItem.get("mediaInfos");
                    return (contentItem.type === "media" && mediaInfos && mediaInfos.length > 0);
                })) ||
                [];
            if (this._featureContentAvailable === null) {
                if ((fieldsInfoContent && fieldsInfoContent.length > 0) ||
                    (fieldsInfoText && fieldsInfoText.length > 0)) {
                    this._featureContentAvailable = true;
                }
            }
            var featureTotal = this.selectedAttachmentViewerData &&
                this.selectedAttachmentViewerData.get("featureObjectIds.length");
            var unsupportedAttachmentTypesData = this.get("selectedAttachmentViewerData.unsupportedAttachmentTypes");
            var unsupportedAttachmentTypes = unsupportedAttachmentTypesData &&
                unsupportedAttachmentTypesData.length > 0
                ? this._renderUnsupportedAttachmentTypes()
                : null;
            var layerId = this.get("selectedAttachmentViewerData.layerData.featureLayer.id");
            var objectIdField = this.get("selectedAttachmentViewerData.layerData.featureLayer.objectIdField");
            var attributes = this.get("selectedAttachmentViewerData.selectedFeature.attributes");
            var objectId = attributes && attributes[objectIdField];
            return (widget_1.tsx("div", { class: CSS.featureContentContainer },
                (fieldsInfoText && fieldsInfoText.length > 0) ||
                    (mediaInfoContent && mediaInfoContent.length > 0) ||
                    this._featureContentAvailable ? (widget_1.tsx("div", null,
                    this._featureContentAvailable ? (widget_1.tsx("div", { key: buildKey("feature-info-" + layerId + "-" + objectId), class: CSS.featureInfoContainer }, this._renderFeatureInfoContent())) : null,
                    (mediaInfoContent && mediaInfoContent.length > 0) ||
                        (fieldsInfoText && fieldsInfoText.length > 0) ? (widget_1.tsx("div", { key: buildKey("feature-widget-" + layerId + "-" + objectId), class: CSS.featureInfoContainer }, this._renderFeatureWidgetContent())) : null)) : this._featureContentAvailable && featureTotal ? (widget_1.tsx("div", { key: buildKey("feature-loader-" + layerId + "-" + objectId), class: CSS.featureInfoLoader }, this._renderFeatureContentLoader())) : (widget_1.tsx("div", { key: buildKey("no-feature-info-" + layerId + "-" + objectId), class: CSS.noFeatureContentContainer }, this._renderNoFeatureContentInfo())),
                unsupportedAttachmentTypes));
        };
        // _renderUnsupportedAttachmentTypes
        PhotoCentric.prototype._renderUnsupportedAttachmentTypes = function () {
            var otherAttachmentTypes = this._renderOtherAttachmentTypes();
            return (widget_1.tsx("div", { key: buildKey("other-attachment-types") },
                widget_1.tsx("h4", { class: CSS.attributeHeading }, i18n.otherAttachments),
                otherAttachmentTypes));
        };
        // _renderFeatureWidgetContent
        PhotoCentric.prototype._renderFeatureWidgetContent = function () {
            var featureWidget = this.get("viewModel.featureWidget");
            var featureWidgetNode = featureWidget ? featureWidget.render() : null;
            return (widget_1.tsx("div", { key: buildKey("feture-widget-content"), class: CSS.featureInfoContent }, featureWidgetNode));
        };
        // _renderFeatureInfoContent
        PhotoCentric.prototype._renderFeatureInfoContent = function () {
            var selectedFeatureInfo = this.get("selectedAttachmentViewerData.selectedFeatureInfo");
            var featureContentInfo = selectedFeatureInfo
                ? this._renderFeatureContentInfos()
                : null;
            return (widget_1.tsx("div", { key: buildKey("feature-info-content"), class: CSS.featureInfoContent }, featureContentInfo));
        };
        // _renderNoFeatureContentInfo
        PhotoCentric.prototype._renderNoFeatureContentInfo = function () {
            return (widget_1.tsx("div", { key: buildKey("no-content"), class: CSS.noInfo }, i18n.noInfo));
        };
        // _renderFeatureContentLoader
        PhotoCentric.prototype._renderFeatureContentLoader = function () {
            return (widget_1.tsx("div", { key: buildKey("feature-content-loader"), class: CSS.widgetLoader }, i18n.loadingImages));
        };
        // _renderTitleZoomToContainer
        PhotoCentric.prototype._renderTitleZoomToContainer = function () {
            var layerFeaturesLength = this.get("selectedAttachmentViewerData.layerFeatures.length");
            var zoomTo = layerFeaturesLength ? this._renderZoomTo() : null;
            return (widget_1.tsx("div", { class: CSS.featureTitleZoomContainer },
                widget_1.tsx("div", { class: CSS.featureContentTitle },
                    widget_1.tsx("h2", { class: CSS.featureLayerTitle }, this.get("featureWidget.title"))),
                widget_1.tsx("div", { class: CSS.zoomContainer }, zoomTo)));
        };
        // _renderFeatureContentInfos
        PhotoCentric.prototype._renderFeatureContentInfos = function () {
            var _this = this;
            var selectedFeatureInfo = this.selectedAttachmentViewerData.selectedFeatureInfo;
            var featureContentInfos = selectedFeatureInfo.map(function (contentInfo) {
                return _this._renderFeatureContentInfo(contentInfo);
            });
            return widget_1.tsx("div", null, featureContentInfos);
        };
        // _renderFeatureContentInfo
        PhotoCentric.prototype._renderFeatureContentInfo = function (contentInfo) {
            var hyperlink = this._getHyperLink(contentInfo);
            var contentCheck = contentInfo &&
                contentInfo.content &&
                ((typeof contentInfo.content === "string" &&
                    contentInfo.content.trim() !== "") ||
                    contentInfo.content !== null);
            return (widget_1.tsx("div", { key: buildKey(contentInfo.attribute + "-" + contentInfo.content), class: CSS.featureContentInfo },
                widget_1.tsx("h4", { class: CSS.attributeHeading, innerHTML: contentInfo.attribute }),
                contentInfo && contentInfo.content && contentCheck ? (hyperlink ? (widget_1.tsx("p", { class: CSS.attributeContent },
                    widget_1.tsx("div", { innerHTML: contentInfo.content.replace(hyperlink, "") }),
                    widget_1.tsx("span", { innerHTML: urlUtils_1.autoLink(hyperlink) }))) : (widget_1.tsx("p", { class: CSS.attributeContent, innerHTML: contentInfo.content }))) : (widget_1.tsx("p", null, i18n.noContentAvailable))));
        };
        // _renderOtherAttachmentTypes
        PhotoCentric.prototype._renderOtherAttachmentTypes = function () {
            var _this = this;
            var otherAttachmentTypes = this.selectedAttachmentViewerData.unsupportedAttachmentTypes.map(function (attachment) {
                return _this._renderOtherAttachmentType(attachment);
            });
            return widget_1.tsx("ul", { class: CSS.otherAttachmentsList }, otherAttachmentTypes);
        };
        // _renderOtherAttachmentType
        PhotoCentric.prototype._renderOtherAttachmentType = function (attachment) {
            var id = attachment.id, name = attachment.name, size = attachment.size;
            return (widget_1.tsx("li", { key: buildKey("other-attachment-" + id + "-" + name + "-" + size) },
                widget_1.tsx("a", { href: attachment.url, target: "_blank" }, attachment.name)));
        };
        // _renderZoomTo
        PhotoCentric.prototype._renderZoomTo = function () {
            return (widget_1.tsx("button", { bind: this, class: CSS.zoomTo, tabIndex: 0, onclick: this._zoomTo, onkeydown: this._zoomTo, title: i18n.zoomTo, label: i18n.zoomTo },
                widget_1.tsx("span", { class: this.classes(CSS.zoomToIcon, CSS.calcite.zoomInIcon, CSS.calcite.flush) })));
        };
        // _renderAttachmentsMobile
        PhotoCentric.prototype._renderAttachmentsMobile = function (selectedFeatureAttachments) {
            var _this = this;
            if (!selectedFeatureAttachments) {
                return;
            }
            var featureContentInfos = selectedFeatureAttachments
                .toArray()
                .map(function (attachment) {
                return _this._renderAttachmentMobile(attachment);
            });
            var attachmentCount = selectedFeatureAttachments && selectedFeatureAttachments.length > 0
                ? selectedFeatureAttachments.length
                : null;
            return (widget_1.tsx("div", { class: CSS.mobileFeatureContent },
                attachmentCount ? (widget_1.tsx("div", { class: CSS.mobileAttachmentCount },
                    widget_1.tsx("span", { class: CSS.mobileAttachmentText }, i18n.upperCaseAttachments),
                    widget_1.tsx("div", { class: CSS.attachmentCountNumber }, selectedFeatureAttachments.length),
                    !this.imageIsLoaded && !this.imagePanZoomEnabled
                        ? this._renderMediaViewerLoader()
                        : null)) : null,
                featureContentInfos));
        };
        // _renderAttachmentMobile
        PhotoCentric.prototype._renderAttachmentMobile = function (attachment) {
            var _a;
            var url = attachment.url;
            var attachmentUrl = this._convertAttachmentUrl(url);
            var imageStyles = attachment &&
                attachment.orientationInfo &&
                this._photoViewerContainer &&
                this.imageIsLoaded
                ? imageUtils_1.getOrientationStylesMobile(attachment.orientationInfo, this._mobileAttachment)
                : {
                    transform: "none",
                    maxHeight: "100%",
                    height: "initial",
                    width: "initial"
                };
            var imageAttachmentHeight = imageStyles.width;
            var transparentBackground = (_a = {},
                _a[CSS.transparentBackground] = !this.imageIsLoaded,
                _a);
            var contentType = attachment && attachment.get("contentType");
            var mobileAttachment = this._renderMobileAttachment(attachment);
            var imageDirectionValue = this.imageDirectionEnabled
                ? this.viewModel.getGPSInformation(attachment)
                : null;
            var mobileImageDirection = this.imageDirectionEnabled && imageDirectionValue
                ? this._renderMobileImageDirection(attachmentUrl, imageDirectionValue)
                : null;
            var mobileDownloadButton = contentType &&
                contentType.indexOf("video") === -1 &&
                contentType.indexOf("gif") === -1 &&
                contentType.indexOf("pdf") === -1 &&
                this.downloadEnabled &&
                this.imageIsLoaded
                ? this._renderMobileDownloadButton(attachmentUrl)
                : null;
            return (widget_1.tsx("div", { bind: this, styles: { height: imageAttachmentHeight }, afterCreate: widget_1.storeNode, afterUpdate: widget_1.storeNode, "data-node-ref": "_mobileAttachment", class: this.classes(CSS.mobileAttachment, transparentBackground) },
                mobileAttachment,
                mobileImageDirection,
                mobileDownloadButton));
        };
        // _renderMobileDownloadButton
        PhotoCentric.prototype._renderMobileDownloadButton = function (attachmentUrl) {
            return (widget_1.tsx("button", { bind: this, "data-image-url": attachmentUrl, "data-image-name": name, onclick: this._downloadImage, onkeydown: this._downloadImage, class: CSS.downloadIconContainer },
                widget_1.tsx("span", { class: this.classes(CSS.calcite.downloadIcon, CSS.calcite.flush, CSS.downloadIcon) })));
        };
        // _mobileImageDirection
        PhotoCentric.prototype._renderMobileImageDirection = function (attachmentUrl, imageDirectionValue) {
            return (widget_1.tsx("div", { key: buildKey("mobile-image-direction-" + attachmentUrl), class: CSS.imageDirectionMobile },
                widget_1.tsx("svg", { styles: { transform: "rotateZ(" + imageDirectionValue + "deg)" }, class: CSS.photoCentricCamera },
                    widget_1.tsx("g", null,
                        widget_1.tsx("path", { d: "M19.1,10.8h-0.3h-0.3h-1.3v2h-1v-0.7v-0.3h-11l0,0h-1v1.1v5.8v0h16v-1.9v-3.9v-1.1\nC20.2,11.3,19.7,10.8,19.1,10.8z" }),
                        widget_1.tsx("path", { d: "M15.2,8.2V7.4v-2c0-0.9-0.7-1.6-1.6-1.6H7.8c-0.9,0-1.6,0.7-1.6,1.6v2v0.8v2.6h9V8.2z" }),
                        widget_1.tsx("path", { d: "M12,1c6.1,0,11,4.9,11,11s-4.9,11-11,11S1,18.1,1,12S5.9,1,12,1 M12,0C5.4,0,0,5.4,0,12s5.4,12,12,12\nc6.6,0,12-5.4,12-12S18.6,0,12,0L12,0z" })))));
        };
        // _renderMobileAttachment
        PhotoCentric.prototype._renderMobileAttachment = function (attachment) {
            var _a, _b, _c;
            var userAgent = navigator.userAgent || navigator.vendor;
            var isAndroid = false;
            if (userAgent.match(/Android/i)) {
                isAndroid = true;
            }
            var addPadding = (_a = {},
                _a[CSS.mobileAttachmentsAddPadding] = attachment &&
                    attachment.orientationInfo &&
                    attachment.orientationInfo.rotation !== 0 &&
                    isAndroid,
                _a);
            var removeBorderRadius = (_b = {},
                _b[CSS.removeBorderRadius] = attachment &&
                    attachment.orientationInfo &&
                    attachment.orientationInfo.rotation !== 0 &&
                    isAndroid,
                _b);
            var removeOpacity = (_c = {},
                _c[CSS.removeOpacity] = this.imageIsLoaded,
                _c);
            var url = attachment.url, name = attachment.name;
            var attachmentUrl = this._convertAttachmentUrl(url);
            return (widget_1.tsx("div", { class: this.classes(CSS.mobileAttachmentContainer, addPadding) }, attachment &&
                attachment.contentType &&
                attachment.contentType.indexOf("video") !== -1 ? (widget_1.tsx("video", { key: buildKey("mobile-video-" + attachmentUrl), class: CSS.videoContainer, controls: true },
                widget_1.tsx("source", { src: attachmentUrl, type: "video/mp4" }),
                widget_1.tsx("source", { src: attachmentUrl, type: "video/ogg" }),
                widget_1.tsx("source", { src: attachmentUrl, type: "video/mov" }),
                i18n.doesNotSupportVideo)) : attachment &&
                attachment.contentType &&
                attachment.contentType.indexOf("pdf") !== -1 ? (widget_1.tsx("embed", { key: buildKey("mobile-pdf-" + attachmentUrl), class: CSS.pdf, src: this.currentImageUrl, type: "application/pdf" })) : attachment &&
                attachment.contentType &&
                attachment.contentType.indexOf("image") !== -1 ? (widget_1.tsx("img", { key: buildKey("mobile-image-" + attachmentUrl), class: this.classes(CSS.imageMobile, removeBorderRadius, removeOpacity), src: attachmentUrl, alt: name })) : null));
        };
        //----------------------------------
        //
        //  END OF RENDER NODE METHODS
        //
        //----------------------------------
        //----------------------------------
        //
        //  ACCESSIBLE HANDLERS
        //
        //----------------------------------
        // _disableOnboardingPanel
        PhotoCentric.prototype._disableOnboardingPanel = function () {
            this._onboardingPanelIsOpen = false;
            this.scheduleRender();
        };
        // _toggleExpand
        PhotoCentric.prototype._toggleExpand = function () {
            this._mapAndSearchIsExpanded = !this._mapAndSearchIsExpanded;
            this.scheduleRender();
        };
        // _toggleExpand
        PhotoCentric.prototype._toggleOnboardingPanel = function () {
            if (this._onboardingPanelIsOpen) {
                this._onboardingPanelIsOpen = false;
            }
            else {
                this._onboardingPanelIsOpen = true;
            }
            this.scheduleRender();
        };
        // _nextImage
        PhotoCentric.prototype._nextImage = function () {
            this.viewModel.nextImage();
            if (!this.imagePanZoomEnabled) {
                this.set("imageIsLoaded", false);
                if (this._imageAttachment) {
                    this._imageAttachment.style.opacity = "0";
                }
            }
            this._handlePdfAttachment();
            this.scheduleRender();
        };
        // _previousImage
        PhotoCentric.prototype._previousImage = function () {
            this.viewModel.previousImage();
            if (!this.imagePanZoomEnabled) {
                this.set("imageIsLoaded", false);
                if (this._imageAttachment) {
                    this._imageAttachment.style.opacity = "0";
                }
            }
            this._handlePdfAttachment();
            this.scheduleRender();
        };
        // _previousFeature
        PhotoCentric.prototype._previousFeature = function () {
            var queryingState = this.viewModel.queryingState;
            if (queryingState !== "ready") {
                return;
            }
            var preventLocationSwitch = this._preventLocationSwitch();
            if (preventLocationSwitch) {
                return;
            }
            this.viewModel.previousFeature();
            this.set("currentImageUrl", null);
            var featureLayer = this.get("selectedAttachmentViewerData.layerData.featureLayer");
            var supportsAttachment = featureLayer && featureLayer.get("capabilities.data.supportsAttachment");
            if (supportsAttachment) {
                this.set("imageIsLoaded", false);
            }
            if (this._imageAttachment) {
                this._imageAttachment.src = "";
            }
            this._handlePdfAttachment();
            this.scheduleRender();
        };
        // _nextFeature
        PhotoCentric.prototype._nextFeature = function () {
            var queryingState = this.viewModel.queryingState;
            if (queryingState !== "ready") {
                return;
            }
            var preventLocationSwitch = this._preventLocationSwitch();
            if (preventLocationSwitch) {
                return;
            }
            this.viewModel.nextFeature();
            this.set("currentImageUrl", null);
            var featureLayer = this.get("selectedAttachmentViewerData.layerData.featureLayer");
            var supportsAttachment = featureLayer && featureLayer.get("capabilities.data.supportsAttachment");
            if (supportsAttachment) {
                this.set("imageIsLoaded", false);
            }
            if (this._imageAttachment) {
                this._imageAttachment.src = "";
            }
            this._handlePdfAttachment();
            this.scheduleRender();
        };
        // _preventLocationSwitch
        PhotoCentric.prototype._preventLocationSwitch = function () {
            var selectedAttachmentViewerData = this.selectedAttachmentViewerData;
            var featureTotal = selectedAttachmentViewerData &&
                selectedAttachmentViewerData.get("featureObjectIds.length");
            return (this._onboardingPanelIsOpen ||
                featureTotal === 1 ||
                (selectedAttachmentViewerData &&
                    selectedAttachmentViewerData.layerFeatures &&
                    selectedAttachmentViewerData.layerFeatures.length === 0) ||
                !selectedAttachmentViewerData);
        };
        PhotoCentric.prototype._zoomInImage = function () {
            if (this._imageViewer._state.zoomValue === 500) {
                return;
            }
            var updatedZoomValue = this._imageViewer._state.zoomValue + 50;
            this._imageViewer.zoom(updatedZoomValue);
            this._zoomSliderNode.value = "" + updatedZoomValue;
            this.scheduleRender();
        };
        PhotoCentric.prototype._zoomOutImage = function () {
            if (this._imageViewer._state.zoomValue === 0) {
                return;
            }
            var updatedZoomValue = this._imageViewer._state.zoomValue - 50;
            this._imageViewer.zoom(updatedZoomValue);
            this._zoomSliderNode.value = "" + updatedZoomValue;
            this.scheduleRender();
        };
        // _downloadImage
        PhotoCentric.prototype._downloadImage = function (event) {
            this.viewModel.downloadImage(event);
        };
        // _zoomTo
        PhotoCentric.prototype._zoomTo = function () {
            this.viewModel.zoomTo();
        };
        // _handlePdfAttachment
        PhotoCentric.prototype._handlePdfAttachment = function () {
            var attachments = this.get("selectedAttachmentViewerData.selectedFeatureAttachments.attachments");
            var attachmentIndex = this.get("selectedAttachmentViewerData.attachmentIndex");
            var currentAttachment = attachments && attachments.getItemAt(attachmentIndex);
            var contentType = currentAttachment && currentAttachment.get("contentType");
            if (contentType === "application/pdf") {
                this.set("imageIsLoaded", true);
            }
        };
        // _getHyperLink
        PhotoCentric.prototype._getHyperLink = function (contentInfo) {
            var expression = /(http|ftp|https)(:\/\/)([\w_-]+(?:(?:\.[\w_-]+)+))([\w.,@?^=%&:/~+#-]*[\w@?^=%&/~+#-])?/;
            var regex = new RegExp(expression);
            var content = contentInfo && contentInfo.content;
            return content &&
                content.match &&
                content.match(regex) &&
                content.match(regex).length > 0
                ? content.match(regex)[0]
                : null;
        };
        // _convertAttachmentUrl
        PhotoCentric.prototype._convertAttachmentUrl = function (attachmentUrl) {
            if (!this.selectedAttachmentViewerData) {
                return;
            }
            var featureLayer = this.selectedAttachmentViewerData.get("layerData.featureLayer");
            var parentPortalUrl = featureLayer &&
                featureLayer.get("parent.portalItem.portal.url");
            var portalUrl = featureLayer && featureLayer.get("portalItem.portal.url");
            var portalIsHTTPS = (portalUrl && portalUrl.indexOf("https") !== -1) ||
                (parentPortalUrl && parentPortalUrl.indexOf("https") !== -1);
            if (portalIsHTTPS &&
                attachmentUrl &&
                attachmentUrl.indexOf("https") === -1) {
                return attachmentUrl.replace(/^http:\/\//i, "https://");
            }
            return attachmentUrl;
        };
        // _handleImagePanZoom
        PhotoCentric.prototype._handleImagePanZoom = function (attachment) {
            if (!attachment) {
                return;
            }
            var contentTypeCheck = this._validateContentType(attachment);
            if (this.currentImageUrl && contentTypeCheck) {
                if (this._photoViewerContainer && !this._imageViewerSet) {
                    this._imageViewer = new ImageViewer(this._photoViewerContainer, {
                        snapView: false,
                        zoomOnMouseWheel: false,
                        maxZoom: 500
                    });
                    this._imageViewerSet = true;
                    this.scheduleRender();
                }
                if (this._imageViewerSet && !this._imageZoomLoaded) {
                    this._imageViewer.load(this.currentImageUrl);
                    this._imageZoomLoaded = true;
                    var rotation = attachment.get("orientationInfo.rotation");
                    if (rotation) {
                        var ivImageElement = document.querySelector(".iv-image");
                        ivImageElement.style.transform = "rotate(" + rotation + "deg)";
                    }
                    this.scheduleRender();
                }
            }
        };
        // _removeImageLoader
        PhotoCentric.prototype._removeImageLoader = function (event) {
            var node = event.currentTarget;
            var attachment = node["data-attachment"];
            if (this._imageAttachment) {
                var imageStyles = attachment && attachment.orientationInfo === null
                    ? {
                        transform: "none",
                        maxHeight: "100%",
                        maxWidth: "100%",
                        height: "initial"
                    }
                    : attachment &&
                        attachment.orientationInfo &&
                        this._photoViewerContainer
                        ? imageUtils_1.getOrientationStyles(attachment.orientationInfo, this._photoViewerContainer)
                        : {};
                var style = this._imageAttachment.style;
                style.width =
                    imageStyles && imageStyles.transform && imageStyles.transform === "none"
                        ? ""
                        : "" + imageStyles.width;
                style.height =
                    imageStyles && imageStyles.transform && imageStyles.transform === "none"
                        ? ""
                        : "" + imageStyles.height;
                style.maxHeight = "" + imageStyles.maxHeight;
                style.transform = "" + imageStyles.transform;
                style.opacity = "1";
            }
            this.set("imageIsLoaded", true);
            this.scheduleRender();
        };
        // _getCurrentAttachment
        PhotoCentric.prototype._getCurrentAttachment = function (attachments) {
            var attachmentIndex = this.get("selectedAttachmentViewerData.attachmentIndex");
            return attachments && attachments.length > 0
                ? attachments && attachments.getItemAt(attachmentIndex)
                : null;
        };
        // _validateContentType
        PhotoCentric.prototype._validateContentType = function (attachment) {
            var contentType = attachment && attachment.get("contentType");
            return (contentType !== "image/gif" &&
                contentType !== "video/mp4" &&
                contentType !== "video/mov" &&
                contentType !== "video/quicktime" &&
                contentType !== "application/pdf");
        };
        __decorate([
            decorators_1.aliasOf("viewModel.addressEnabled"),
            decorators_1.property()
        ], PhotoCentric.prototype, "addressEnabled", void 0);
        __decorate([
            decorators_1.aliasOf("viewModel.appMode"),
            decorators_1.property()
        ], PhotoCentric.prototype, "appMode", void 0);
        __decorate([
            decorators_1.aliasOf("viewModel.attachmentIndex"),
            decorators_1.property()
        ], PhotoCentric.prototype, "attachmentIndex", void 0);
        __decorate([
            decorators_1.aliasOf("viewModel.attachmentLayer"),
            decorators_1.property()
        ], PhotoCentric.prototype, "attachmentLayer", void 0);
        __decorate([
            decorators_1.aliasOf("viewModel.attachmentLayers"),
            decorators_1.property()
        ], PhotoCentric.prototype, "attachmentLayers", void 0);
        __decorate([
            decorators_1.aliasOf("viewModel.attachmentViewerDataCollection"),
            decorators_1.property()
        ], PhotoCentric.prototype, "attachmentViewerDataCollection", void 0);
        __decorate([
            decorators_1.aliasOf("viewModel.currentImageUrl"),
            decorators_1.property(),
            widget_1.renderable()
        ], PhotoCentric.prototype, "currentImageUrl", void 0);
        __decorate([
            decorators_1.aliasOf("viewModel.defaultObjectId"),
            decorators_1.property()
        ], PhotoCentric.prototype, "defaultObjectId", void 0);
        __decorate([
            decorators_1.property()
        ], PhotoCentric.prototype, "showOnboardingOnStart", void 0);
        __decorate([
            decorators_1.property()
        ], PhotoCentric.prototype, "docDirection", void 0);
        __decorate([
            decorators_1.aliasOf("viewModel.downloadEnabled"),
            decorators_1.property(),
            widget_1.renderable()
        ], PhotoCentric.prototype, "downloadEnabled", void 0);
        __decorate([
            decorators_1.aliasOf("viewModel.featureLayerTitle"),
            decorators_1.property()
        ], PhotoCentric.prototype, "featureLayerTitle", void 0);
        __decorate([
            decorators_1.aliasOf("viewModel.featureWidget"),
            decorators_1.property()
        ], PhotoCentric.prototype, "featureWidget", void 0);
        __decorate([
            decorators_1.aliasOf("viewModel.graphicsLayer"),
            decorators_1.property()
        ], PhotoCentric.prototype, "graphicsLayer", void 0);
        __decorate([
            decorators_1.aliasOf("viewModel.imageDirectionEnabled"),
            decorators_1.property()
        ], PhotoCentric.prototype, "imageDirectionEnabled", void 0);
        __decorate([
            decorators_1.aliasOf("viewModel.imageIsLoaded"),
            widget_1.renderable(),
            decorators_1.property()
        ], PhotoCentric.prototype, "imageIsLoaded", void 0);
        __decorate([
            decorators_1.aliasOf("viewModel.imagePanZoomEnabled"),
            decorators_1.property()
        ], PhotoCentric.prototype, "imagePanZoomEnabled", void 0);
        __decorate([
            decorators_1.aliasOf("viewModel.layerSwitcher"),
            decorators_1.property()
        ], PhotoCentric.prototype, "layerSwitcher", void 0);
        __decorate([
            decorators_1.property(),
            widget_1.renderable()
        ], PhotoCentric.prototype, "onboardingButtonText", void 0);
        __decorate([
            decorators_1.property()
        ], PhotoCentric.prototype, "onboardingContent", void 0);
        __decorate([
            decorators_1.property(),
            widget_1.renderable()
        ], PhotoCentric.prototype, "onboardingImage", void 0);
        __decorate([
            decorators_1.aliasOf("viewModel.onlyDisplayFeaturesWithAttachmentsIsEnabled"),
            decorators_1.property(),
            widget_1.renderable()
        ], PhotoCentric.prototype, "onlyDisplayFeaturesWithAttachmentsIsEnabled", void 0);
        __decorate([
            decorators_1.aliasOf("viewModel.order"),
            decorators_1.property()
        ], PhotoCentric.prototype, "order", void 0);
        __decorate([
            decorators_1.aliasOf("viewModel.photoCentricSketchExtent"),
            decorators_1.property()
        ], PhotoCentric.prototype, "photoCentricSketchExtent", void 0);
        __decorate([
            decorators_1.aliasOf("viewModel.searchWidget"),
            decorators_1.property()
        ], PhotoCentric.prototype, "searchWidget", void 0);
        __decorate([
            decorators_1.aliasOf("viewModel.selectedAttachmentViewerData"),
            widget_1.renderable(),
            decorators_1.property()
        ], PhotoCentric.prototype, "selectedAttachmentViewerData", void 0);
        __decorate([
            decorators_1.aliasOf("viewModel.shareLocationWidget"),
            decorators_1.property()
        ], PhotoCentric.prototype, "shareLocationWidget", void 0);
        __decorate([
            decorators_1.aliasOf("viewModel.sketchWidget"),
            decorators_1.property()
        ], PhotoCentric.prototype, "sketchWidget", void 0);
        __decorate([
            decorators_1.aliasOf("viewModel.socialSharingEnabled"),
            decorators_1.property()
        ], PhotoCentric.prototype, "socialSharingEnabled", void 0);
        __decorate([
            decorators_1.aliasOf("viewModel.title"),
            decorators_1.property()
        ], PhotoCentric.prototype, "title", void 0);
        __decorate([
            decorators_1.aliasOf("viewModel.selectFeaturesEnabled"),
            decorators_1.property()
        ], PhotoCentric.prototype, "selectFeaturesEnabled", void 0);
        __decorate([
            decorators_1.aliasOf("viewModel.selectedLayerId"),
            decorators_1.property()
        ], PhotoCentric.prototype, "selectedLayerId", void 0);
        __decorate([
            decorators_1.aliasOf("viewModel.view"),
            decorators_1.property()
        ], PhotoCentric.prototype, "view", void 0);
        __decorate([
            decorators_1.aliasOf("viewModel.zoomLevel"),
            decorators_1.property()
        ], PhotoCentric.prototype, "zoomLevel", void 0);
        __decorate([
            decorators_1.property()
        ], PhotoCentric.prototype, "onboardingIsEnabled", void 0);
        __decorate([
            widget_1.renderable(["viewModel.state"]),
            decorators_1.property({
                type: PhotoCentricViewModel
            })
        ], PhotoCentric.prototype, "viewModel", void 0);
        __decorate([
            widget_1.accessibleHandler()
        ], PhotoCentric.prototype, "_disableOnboardingPanel", null);
        __decorate([
            widget_1.accessibleHandler()
        ], PhotoCentric.prototype, "_toggleExpand", null);
        __decorate([
            widget_1.accessibleHandler()
        ], PhotoCentric.prototype, "_toggleOnboardingPanel", null);
        __decorate([
            widget_1.accessibleHandler()
        ], PhotoCentric.prototype, "_nextImage", null);
        __decorate([
            widget_1.accessibleHandler()
        ], PhotoCentric.prototype, "_previousImage", null);
        __decorate([
            widget_1.accessibleHandler()
        ], PhotoCentric.prototype, "_previousFeature", null);
        __decorate([
            widget_1.accessibleHandler()
        ], PhotoCentric.prototype, "_nextFeature", null);
        __decorate([
            widget_1.accessibleHandler()
        ], PhotoCentric.prototype, "_zoomInImage", null);
        __decorate([
            widget_1.accessibleHandler()
        ], PhotoCentric.prototype, "_zoomOutImage", null);
        __decorate([
            widget_1.accessibleHandler()
        ], PhotoCentric.prototype, "_downloadImage", null);
        __decorate([
            widget_1.accessibleHandler()
        ], PhotoCentric.prototype, "_zoomTo", null);
        PhotoCentric = __decorate([
            decorators_1.subclass("PhotoCentric")
        ], PhotoCentric);
        return PhotoCentric;
    }(decorators_1.declared(Widget)));
    return PhotoCentric;
});
//# sourceMappingURL=PhotoCentric.js.map