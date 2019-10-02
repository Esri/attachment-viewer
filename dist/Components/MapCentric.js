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
define(["require", "exports", "esri/core/tsSupport/declareExtendsHelper", "esri/core/tsSupport/decorateHelper", "esri/core/accessorSupport/decorators", "esri/core/watchUtils", "esri/widgets/support/widget", "esri/widgets/Widget", "dojo/i18n!./MapCentric/nls/resources", "dojo/i18n!../nls/common", "./utils/urlUtils", "./utils/utils", "./utils/imageUtils", "./MapCentric/MapCentricViewModel", "ImageViewer"], function (require, exports, __extends, __decorate, decorators_1, watchUtils, widget_1, Widget, i18n, i18nCommon, urlUtils_1, utils_1, imageUtils_1, MapCentricViewModel, ImageViewer) {
    "use strict";
    //----------------------------------
    //
    //  CSS Classes
    //
    //----------------------------------
    var CSS = {
        // general
        base: "esri-map-centric",
        content: "esri-map-centric__content",
        expandCollapseContainer: "esri-map-centric__expand-collapse-container",
        desktopContent: "esri-map-centric__desktop-content",
        sidePanel: "esri-map-centric__side-panel",
        // mobile
        mobile: "esri-map-centric__mobile",
        mobileContent: "esri-map-centric__mobile-content",
        // header
        header: "esri-map-centric__header",
        headerText: "esri-map-centric__header-text",
        headerContainer: "esri-map-centric__title-header-container",
        titleInfoContainer: "esri-map-centric__title-info-container",
        // share widget
        shareWidgetContainer: "esri-photo-centric__share-widget-container",
        shareLocationWidget: "esri-photo-centric__share-location-widget",
        // onboarding
        onboarding: "esri-map-centric__onboarding",
        onboardingOverlay: "esri-map-centric__onboarding-overlay",
        onboardingContent: "esri-map-centric__onboarding-content",
        onboardingContentContainer: "esri-map-centric__onboarding-content-container",
        onboardingStartButtonContainer: "esri-map-centric__start-button-container",
        onboardingStartButton: "esri-map-centric__start-button",
        onboardingMain: "esri-map-centric__main-onboarding",
        onboardingTrayContentContainer: "esri-map-centric__onboarding-tray-content-container",
        onboardingIcon: "esri-map-centric__onboarding-icon",
        onboardingOpen: "esri-map-centric--onboarding-open",
        onboardingWelcomeContent: "esri-map-centric__onboarding-welcome-content",
        // map
        mapView: "esri-map-centric__map-view",
        mapCollapsed: "esri-map-centric--map-collapsed",
        mapViewContainer: "esri-map-centric__map-view-container",
        // gallery
        featureGalleryContainer: "esri-map-centric__feature-gallery-container",
        featureGalleryGridItem: "esri-map-centric__gallery-grid-item",
        featureGalleryItem: "esri-map-centric__feature-gallery-item",
        thumbnailContainer: "esri-map-centric__thumbnail-container",
        imageThumbnail: "esri-map-centric__image-thumbnail",
        attachmentCountContainer: "esri-map-centric__attachment-count-container",
        attachmentCount: "esri-map-centric__attachment-count",
        featureContentGalleryContainer: "esri-map-centric__gallery-feature-content-container",
        multipleLayers: "esri-map-centric--multiple-layers",
        backToGalleryContainer: "esri-map-centric__back-layer-container",
        backToGallery: "esri-map-centric__back-to-gallery",
        // layerSwitcher
        layerSwitcherContainer: "esri-map-centric__layer-switcher-container",
        layerSwitcherMobile: "esri-map-centric--layer-switcher-mobile",
        // media viewer
        mediaViewer: "esri-map-centric__media-viewer-container",
        mediaViewerSection: "esri-map-centric__media-viewer-section",
        mediaViewerDesktop: "esri-map-centric__media-viewer--desktop",
        mediaContainer: "esri-map-centric__media-container",
        layerNotSupported: "esri-map-centric__layer-not-supported",
        noAttachmentsContainer: "esri-map-centric__no-attachments-container",
        noAttachmentsText: "esri-map-centric__no-attachments-text",
        noAttachments: "esri-map-centric__no-attachments",
        gpsImageDirection: "esri-map-centric__gps-image-direction",
        mapCentricCamera: "esri-map-centric__map-centric-camera",
        imageDirectionDegrees: "esri-map-centric__image-direction-degrees",
        imageDirection: "esri-map-centric__image-direction",
        downloadEnabled: "esri-map-centric--download-enabled",
        downloadIconContainer: "esri-map-centric__download-icon-container",
        downloadButtonDesktop: "esri-map-centric__download-button-desktop",
        downloadIconTextContainer: "esri-map-centric__download-icon-text-container",
        downloadIcon: "esri-map-centric__download-icon",
        videoContainer: "esri-map-centric__video-container",
        fadeImage: "esri-map-centric--fade-image",
        imageDesktop: "esri-map-centric__media--desktop",
        closeFeatureContainer: "esri-map-centric__close-feature-content",
        // pagination
        paginationContainer: "esri-photo-centric__pagination-container",
        paginationTextContainer: "esri-photo-centric__pagination-text-container",
        // loader
        widgetLoader: "esri-widget__loader esri-map-centric__loader",
        animationLoader: "esri-widget__loader-animation esri-map-centric__loader-animation",
        spinner: "esri-map-centric__spinner",
        loaderContainer: "esri-map-centric__loader-container",
        loadingText: "esri-map-centric__loading-text",
        loaderGraphic: "esri-map-centric__loader-graphic",
        mediaContainerLoading: "esri-map-centric__media-container--loading",
        // attachment scroll
        leftArrowContainer: "esri-map-centric__left-arrow-container",
        rightArrowContainer: "esri-map-centric__right-arrow-container",
        attachmentNumberText: "esri-map-centric__attachment-number-text",
        attachmentNumber: "esri-map-centric__attachment-number",
        attachmentScroll: "esri-map-centric__attachment-scroll",
        // feature content
        featureContent: "esri-map-centric__feature-content",
        featureContentTitleContainer: "esri-map-centric__title-container",
        featureContentPanelContainer: "esri-map-centric__feature-content-panel-container",
        featureContentLoader: "esri-map-centric__feature-content-loader",
        featureContentTitle: "esri-map-centric__feature-content-title",
        featureLayerTitle: "esri-map-centric__feature-layer-title",
        addressText: "esri-map-centric__address-text",
        featureInfoContent: "esri-map-centric__feature-info-content",
        noInfo: "esri-map-centric__no-info-text",
        attributeHeading: "esri-map-centric__attribute-heading",
        zoomToIcon: "esri-map-centric__zoom-to-icon",
        zoomTo: "esri-map-centric__zoom-to",
        otherAttachmentsList: "esri-map-centric__other-attachment-types",
        featureContentInfo: "esri-map-centric__feature-content-info",
        attributeContent: "esri-map-centric__attribute-content",
        fade: "esri-map-centric--fade",
        featureContentPanelOpen: "esri-map-centric--feature-content-panel-open",
        featureContentPanelLayerSwitcher: "esri-map-centric--feature-content-panel-layer-switcher",
        featureTitleZoomContainer: "esri-map-centric__feature-title-zoom-container",
        featureZoomToContainer: "esri-map-centric__zoom-to-container",
        featureContentContainer: "esri-map-centric__feature-content-container",
        // mobile
        mobileBody: "esri-map-centric__mobile-body",
        mobileNav: "esri-map-centric__mobile-nav",
        mobileNavItem: "esri-map-centric__mobile-nav-item",
        mobileNavItemSelected: "esri-map-centric__nav-item--selected",
        mobileOnboardingGallery: "esri-map-centric__mobile-onboarding-gallery",
        mobileMedia: "esri-map-centric__mobile-media",
        // fullAttachment
        fullMediaContainer: "esri-map-centric__full-media-container",
        expandMediaContainer: "esri-map-centric__expand-media-container",
        zoomSlider: "esri-map-centric__image-zoom-slider",
        zoomSliderButton: "esri-map-centric__zoom-slider-button",
        zoomSliderMoreThanOneAtt: "esri-map-centric--more-than-one-att",
        slideSymbol: "esri-map-centric__slide-symbol",
        fullMediaContainerOpen: "esri-map-centric__full-media-container--open",
        // pdf
        pdfContainer: "esri-map-centric__pdf-container",
        pdfThumbnailIconContainer: "esri-map-centric__pdf-thumbnail-icon-container",
        pdf: "esri-map-centric__pdf",
        pdfSVG: "esri-map-centric__pdf-svg",
        pdfName: "esri-map-centric__pdf-name",
        // video
        videoParentContainer: "esri-map-centric__video-parent-container",
        // image
        imageParentContainer: "esri-map-centric__image-parent-container",
        // icons
        svg: {
            media: "esri-map-centric__media-svg",
            size: "esri-attachment-viewer__svg",
            noAttachments: "esri-map-centric__no-attachments",
            multipleAttachmentsIcon: "esri-map-centric__multiple-attachments-icon",
            video: "esri-map-centric__video-svg",
            expandAttachment: "esri-map-centric__expand-attachment"
        },
        // calcite icons
        icons: {
            downloadIcon: "icon-ui-download",
            zoomInIcon: "icon-ui-zoom-in-magnifying-glass",
            leftArrow: "icon-ui-left",
            rightArrow: "icon-ui-right",
            upArrow: "icon-ui-up-arrow",
            downArrow: "icon-ui-down-arrow",
            button: "btn",
            buttonFill: "btn-fill",
            descriptionIcon: "icon-ui-description",
            closeIcon: "icon-ui-close",
            flush: "icon-ui-flush",
            loadingIcon: "esri-icon-loading-indicator",
            rotating: "esri-rotating",
            upArrowCircled: "esri-icon-up-arrow-circled",
            expandImageIcon: "icon-ui-zoom-out-fixed",
            minusIcon: "esri-icon-minus",
            plusIcon: "esri-icon-plus",
            backArrow: "esri-icon-left-arrow",
            backArrowRTL: "esri-icon-right-arrow"
        }
    };
    var WIDGET_KEY_PARTIAL = "esri-map-centric";
    function buildKey(element, index) {
        if (index === undefined) {
            return WIDGET_KEY_PARTIAL + "__" + element;
        }
    }
    var MapCentric = /** @class */ (function (_super) {
        __extends(MapCentric, _super);
        function MapCentric(value) {
            var _this = _super.call(this) || this;
            //----------------------------------
            //
            //  Private Variables
            //
            //----------------------------------
            _this._currentMobileScreen = "media";
            _this._expandAttachmentNode = null;
            _this._featureContentAvailable = null;
            _this._fullAttachmentContainerIsOpen = false;
            _this._fullScreenCloseNode = null;
            _this._imageViewer = null;
            _this._imageViewerSet = false;
            _this._imageZoomLoaded = null;
            _this._layerDoesNotSupportAttachments = false;
            _this._mediaViewerContainer = null;
            _this._mediaViewerContainerFullAttachment = null;
            _this._onboardingPanelIsOpen = null;
            _this._triggerScrollElement = null;
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
            // downloadEnabled
            _this.downloadEnabled = null;
            // docDirection
            _this.docDirection = null;
            // featureContentPanelIsOpen
            _this.featureContentPanelIsOpen = null;
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
            // mapCentricSketchQueryExtent
            _this.mapCentricSketchQueryExtent = null;
            // mapCentricTooltipEnabled
            _this.mapCentricTooltipEnabled = null;
            // onboardingButtonText
            _this.onboardingButtonText = null;
            // onboardingContent
            _this.onboardingContent = null;
            // onlyDisplayFeaturesWithAttachmentsIsEnabled
            _this.onlyDisplayFeaturesWithAttachmentsIsEnabled = null;
            // order
            _this.order = null;
            // searchWidget
            _this.searchWidget = null;
            // selectFeaturesEnabled
            _this.selectFeaturesEnabled = null;
            // selectedAttachmentViewerData
            _this.selectedAttachmentViewerData = null;
            // selectedLayerId
            _this.selectedLayerId = null;
            // shareLocationWidget
            _this.shareLocationWidget = null;
            // sketchWidget
            _this.sketchWidget = null;
            // socialSharingEnabled
            _this.socialSharingEnabled = null;
            // supportedAttachmentTypes
            _this.supportedAttachmentTypes = null;
            // title
            _this.title = null;
            // view
            _this.view = null;
            // viewModel
            _this.viewModel = new MapCentricViewModel();
            // zoomLevel
            _this.zoomLevel = null;
            return _this;
        }
        MapCentric.prototype.postInitialize = function () {
            this.own([
                this._handleOnboarding(),
                this._handleAttachmentUrl(),
                this._galleryScrollTopOnFeatureRemoval(),
                this._watchAttachmentData(),
                this._scrollGalleryToTopOnAttachmentRemoval(),
                this._watchAddressAndFeature()
            ]);
        };
        // _handleOnboarding
        MapCentric.prototype._handleOnboarding = function () {
            var _this = this;
            return watchUtils.whenOnce(this, "view", function () {
                if (localStorage.getItem("firstTimeUseApp")) {
                    _this._onboardingPanelIsOpen = false;
                }
                else {
                    _this._onboardingPanelIsOpen = true;
                    localStorage.setItem("firstTimeUseApp", "" + Date.now());
                }
                _this.scheduleRender();
            });
        };
        // _handleAttachmentUrl
        MapCentric.prototype._handleAttachmentUrl = function () {
            var _this = this;
            return watchUtils.watch(this, [
                "selectedAttachmentViewerData.selectedFeatureAttachments.attachments",
                "selectedAttachmentViewerData.attachmentIndex"
            ], function () {
                if (!_this.selectedAttachmentViewerData) {
                    return;
                }
                var attachment = _this.viewModel.getCurrentAttachment();
                var attachmentUrl = attachment && attachment.get("url");
                _this.currentImageUrl = _this.viewModel.updateAttachmentUrlToHTTPS(attachmentUrl);
                _this.scheduleRender();
            });
        };
        // _galleryScrollTopOnFeatureRemoval
        MapCentric.prototype._galleryScrollTopOnFeatureRemoval = function () {
            var _this = this;
            return watchUtils.watch(this, "layerSwitcher.selectedLayer", function () {
                _this._scrollGalleryToTop();
            });
        };
        // _watchAttachmentData
        MapCentric.prototype._watchAttachmentData = function () {
            var _this = this;
            return watchUtils.on(this, ["selectedAttachmentViewerData.attachmentDataCollection"], "after-changes", function () {
                _this.scheduleRender();
            });
        };
        // _scrollGalleryToTopOnAttachmentRemoval
        MapCentric.prototype._scrollGalleryToTopOnAttachmentRemoval = function () {
            var _this = this;
            return watchUtils.on(this, "selectedAttachmentViewerData.attachmentDataCollection", "after-remove", function () {
                _this._scrollGalleryToTop();
            });
        };
        // _scrollGalleryToTop
        MapCentric.prototype._scrollGalleryToTop = function () {
            var isIE = navigator.userAgent.indexOf("MSIE") !== -1 ||
                navigator.userAgent.indexOf("Edge") !== -1 ||
                navigator.appVersion.indexOf("Trident/") > -1;
            if (this._triggerScrollElement && !isIE) {
                this._triggerScrollElement.scrollTo({
                    top: 0
                });
            }
        };
        // _watchFeatureAddressAndFeature
        MapCentric.prototype._watchAddressAndFeature = function () {
            var _this = this;
            return watchUtils.watch(this, "selectedAttachmentViewerData.selectedFeature", function () {
                _this.scheduleRender();
            });
        };
        //----------------------------------
        //
        //  END OF WATCH UTILITY METHODS
        //
        //----------------------------------
        //----------------------------------
        //
        //  START OF RENDER METHODS
        //
        //----------------------------------
        MapCentric.prototype.render = function () {
            var header = this._renderHeader();
            var fullAttachment = this._renderFullAttachmentContainer();
            var content = this._renderContent();
            var clientWidth = document.body.clientWidth;
            var isMobile = clientWidth < 813;
            var mobile = isMobile ? this._renderMobile() : null;
            var mobileNav = isMobile ? this._renderMobileNav() : null;
            return (widget_1.tsx("div", { class: CSS.base },
                header,
                isMobile ? (widget_1.tsx("div", { class: CSS.mobileBody },
                    mobile,
                    mobileNav)) : (widget_1.tsx("div", { key: buildKey("desktop"), class: CSS.desktopContent },
                    fullAttachment,
                    content))));
        };
        // _renderMobile
        MapCentric.prototype._renderMobile = function () {
            var mobileContent = this._renderMobileContent();
            return (widget_1.tsx("div", { key: buildKey("mobile"), class: CSS.mobile }, mobileContent));
        };
        // _renderMobileNav
        MapCentric.prototype._renderMobileNav = function () {
            var mobileNavItems = this._renderMobileNavItems();
            return (widget_1.tsx("div", { key: buildKey("mobile-nav"), class: CSS.mobileNav }, mobileNavItems));
        };
        // _renderMobileNavItems
        MapCentric.prototype._renderMobileNavItems = function () {
            var _this = this;
            var navObjects = this._generateNavObjects();
            return navObjects.map(function (navItem) {
                return _this._renderMobileNavItem(navItem);
            });
        };
        // _renderMobileContent
        MapCentric.prototype._renderMobileContent = function () {
            var mapView = this._renderMapView();
            var mobileOnboarding = this._renderMobileOnboarding();
            var mobileMedia = this._renderMobileMedia();
            return (widget_1.tsx("div", { class: CSS.mobileContent },
                mapView,
                this._currentMobileScreen === "maps" ? null : (widget_1.tsx("div", { class: CSS.mobileOnboardingGallery }, this._currentMobileScreen === "description"
                    ? mobileOnboarding
                    : this._currentMobileScreen === "media"
                        ? mobileMedia
                        : null))));
        };
        // _renderMobileMedia
        MapCentric.prototype._renderMobileMedia = function () {
            var featureContentPanel = this._renderFeatureContentPanel();
            var featureGallery = this._renderFeatureGallery();
            var layerSwitcher = this._renderLayerSwitcher();
            return (widget_1.tsx("div", { class: CSS.mobileMedia },
                layerSwitcher,
                featureContentPanel,
                featureGallery));
        };
        // _renderMobileOnboarding
        MapCentric.prototype._renderMobileOnboarding = function () {
            var onboardingWelcomeContent = this._renderOnboardingWelcomeContent();
            return (widget_1.tsx("div", { key: buildKey("mobile-onboarding"), class: CSS.onboardingOverlay },
                widget_1.tsx("div", { class: CSS.onboardingContentContainer }, onboardingWelcomeContent)));
        };
        // _renderMobileNavItem
        MapCentric.prototype._renderMobileNavItem = function (navItem) {
            var _a;
            var type = navItem.type, iconClass = navItem.iconClass;
            var mobileNavItemSelected = (_a = {},
                _a[CSS.mobileNavItemSelected] = type === this._currentMobileScreen,
                _a);
            return (widget_1.tsx("div", { bind: this, onclick: this._handleNavItem, onkeydown: this._handleNavItem, class: this.classes(CSS.mobileNavItem, mobileNavItemSelected), "data-nav-item": type, role: "button" },
                widget_1.tsx("span", { class: this.classes(iconClass, CSS.icons.flush) })));
        };
        // _renderHeader
        MapCentric.prototype._renderHeader = function () {
            var clientWidth = document.body.clientWidth;
            var _a = this, title = _a.title, shareLocationWidget = _a.shareLocationWidget;
            var titleLength = title && this.title.length;
            var titleValue = clientWidth < 813 && titleLength > 40
                ? title
                    .split("")
                    .slice(0, 35)
                    .join("") + "..."
                : title;
            var shareWidget = shareLocationWidget && clientWidth > 813 && this._renderShareWidget();
            return (widget_1.tsx("header", { class: CSS.header },
                widget_1.tsx("div", { class: CSS.headerContainer },
                    widget_1.tsx("div", { class: CSS.titleInfoContainer },
                        widget_1.tsx("h1", { class: CSS.headerText }, titleValue)),
                    clientWidth > 813 ? (widget_1.tsx("div", { bind: this, onclick: this._toggleOnboardingPanel, onkeydown: this._toggleOnboardingPanel, class: CSS.onboardingIcon, title: i18n.viewDetails, tabIndex: 0 },
                        widget_1.tsx("span", { class: this.classes(CSS.icons.descriptionIcon, CSS.icons.flush) }))) : null),
                widget_1.tsx("div", { class: CSS.shareWidgetContainer }, shareWidget)));
        };
        // _renderShareWidget
        MapCentric.prototype._renderShareWidget = function () {
            return (widget_1.tsx("div", { class: CSS.shareLocationWidget, bind: this.shareLocationWidget.container, afterCreate: utils_1.attachToNode }));
        };
        // _renderContent
        MapCentric.prototype._renderContent = function () {
            var mapViewContainer = this._renderMapViewContainer();
            var sidePanel = this._renderSidePanel();
            var onboarding = this._renderOnboarding();
            return (widget_1.tsx("div", { class: CSS.content },
                sidePanel,
                mapViewContainer,
                onboarding));
        };
        // _renderSidePanel
        MapCentric.prototype._renderSidePanel = function () {
            var layerSwitcher = this._renderLayerSwitcher();
            var galleryContentPanelContainer = this._renderFeatureGalleryContentPanelContainer();
            return (widget_1.tsx("div", { class: CSS.sidePanel },
                layerSwitcher,
                galleryContentPanelContainer));
        };
        // _renderLayerSwitcher
        MapCentric.prototype._renderLayerSwitcher = function () {
            return (widget_1.tsx("div", { key: buildKey("back-layer-container"), class: CSS.backToGalleryContainer },
                this.featureContentPanelIsOpen ? (widget_1.tsx("div", { bind: this, onclick: this._closeFeatureContent, onkeydown: this._closeFeatureContent, tabIndex: 0, class: CSS.backToGallery, title: i18nCommon.back }, this.docDirection === "ltr" ? (widget_1.tsx("span", { class: CSS.icons.backArrow })) : (widget_1.tsx("span", { class: CSS.icons.backArrowRTL })))) : null,
                widget_1.tsx("div", { bind: this.layerSwitcher.container, afterCreate: utils_1.attachToNode, class: CSS.layerSwitcherContainer })));
        };
        // _renderFeatureGalleryContentPanelContainer
        MapCentric.prototype._renderFeatureGalleryContentPanelContainer = function () {
            var _a;
            var featureGallery = this._renderFeatureGallery();
            var featureContentPanel = this._renderFeatureContentPanel();
            var multipleLayers = (_a = {},
                _a[CSS.multipleLayers] = this.get("attachmentViewerDataCollection.length") > 1,
                _a);
            return (widget_1.tsx("div", { class: this.classes(CSS.featureContentGalleryContainer, multipleLayers) },
                featureGallery,
                featureContentPanel));
        };
        // _renderOnboarding
        MapCentric.prototype._renderOnboarding = function () {
            var _a;
            var onboardingIsOpen = (_a = {},
                _a[CSS.onboardingOpen] = this._onboardingPanelIsOpen,
                _a);
            var onboarding = this._onboardingPanelIsOpen
                ? this._renderOnboardingPanel()
                : null;
            return (widget_1.tsx("div", { key: buildKey("onboarding-container"), class: this.classes(CSS.onboardingMain, onboardingIsOpen) }, onboarding));
        };
        // _renderOnboardingPanel
        MapCentric.prototype._renderOnboardingPanel = function () {
            var onboardingWelcomeContent = this._renderOnboardingWelcomeContent();
            var onboardingStartButton = this._renderOnboardingStartButton();
            return (widget_1.tsx("div", { class: CSS.onboardingOverlay },
                widget_1.tsx("div", { class: CSS.onboardingContentContainer },
                    onboardingWelcomeContent,
                    onboardingStartButton)));
        };
        // _renderOnboardingWelcomeContent
        MapCentric.prototype._renderOnboardingWelcomeContent = function () {
            return (widget_1.tsx("div", { class: CSS.onboardingWelcomeContent, key: buildKey("onboarding-welcome") }, this.onboardingContent.render()));
        };
        // _renderOnboardingStartButton
        MapCentric.prototype._renderOnboardingStartButton = function () {
            var buttonText = this.onboardingButtonText
                ? this.onboardingButtonText
                : i18n.start;
            return (widget_1.tsx("div", { class: CSS.onboardingStartButtonContainer },
                widget_1.tsx("button", { bind: this, onclick: this._disableOnboardingPanel, onkeydown: this._disableOnboardingPanel, tabIndex: 0, class: this.classes(CSS.onboardingStartButton, CSS.icons.button, CSS.icons.buttonFill) }, buttonText)));
        };
        // _renderFeatureGallery
        MapCentric.prototype._renderFeatureGallery = function () {
            var _a;
            var attachmentDataCollectionLength = this.get("selectedAttachmentViewerData.attachmentDataCollection.length");
            var featureGalleryItems = this.selectedAttachmentViewerData && attachmentDataCollectionLength > 0
                ? this._renderFeatureGalleryItems()
                : null;
            var featureObjectIdsLength = this.get("selectedAttachmentViewerData.featureObjectIds.length");
            var layerSwitcherIsEnabled = (_a = {},
                _a[CSS.layerSwitcherMobile] = this.get("attachmentViewerDataCollection.length") > 1,
                _a);
            var loader = featureObjectIdsLength > attachmentDataCollectionLength
                ? this._renderGalleryLoader()
                : null;
            return (widget_1.tsx("div", { bind: this, afterCreate: widget_1.storeNode, "data-node-ref": "_triggerScrollElement", onscroll: this._triggerScrollQuery, class: this.classes(CSS.featureGalleryContainer, layerSwitcherIsEnabled) },
                featureGalleryItems,
                loader));
        };
        // _renderGalleryLoader
        MapCentric.prototype._renderGalleryLoader = function () {
            return (widget_1.tsx("div", { class: CSS.loaderContainer },
                widget_1.tsx("span", { class: CSS.loadingText },
                    i18n.loading,
                    "..."),
                widget_1.tsx("div", { class: CSS.loaderGraphic })));
        };
        //   _renderFeatureGalleryItems
        MapCentric.prototype._renderFeatureGalleryItems = function () {
            var _this = this;
            var attachmentDataCollection = this.get("selectedAttachmentViewerData.attachmentDataCollection");
            return (widget_1.tsx("div", null, this.selectedAttachmentViewerData &&
                attachmentDataCollection
                    .toArray()
                    .map(function (feature) { return _this._renderFeatureGallleryItem(feature); })));
        };
        //   _renderFeatureGallleryItem
        MapCentric.prototype._renderFeatureGallleryItem = function (attachmentContent) {
            if (!attachmentContent) {
                return;
            }
            var attachments = attachmentContent.attachments, objectId = attachmentContent.objectId;
            var thumbnailContainer = this._renderThumbnailContainer(attachments);
            var attachmentUrl = attachments && attachments.length > 0 ? attachments[0].url : null;
            var multSVGIcon = attachments && attachments.length > 1
                ? this._renderMultipleSVGIcon(objectId)
                : null;
            var featureTitle = this._renderFeatureTitle(objectId);
            return (widget_1.tsx("div", { key: buildKey("gallery-item-" + attachmentUrl), bind: this, class: CSS.featureGalleryGridItem, onmouseover: this._openToolTipPopup, onmouseleave: this._closeToolTipPopup, onclick: this._selectGalleryItem, onkeydown: this._selectGalleryItem, "data-object-id": objectId, tabIndex: this.featureContentPanelIsOpen ? -1 : 0 },
                widget_1.tsx("div", { class: CSS.featureGalleryItem },
                    thumbnailContainer,
                    featureTitle,
                    multSVGIcon)));
        };
        // _renderMultipleSVGIcon
        MapCentric.prototype._renderMultipleSVGIcon = function (objectId) {
            var layerId = this.get("selectedAttachmentViewerData.layerData.featureLayer.id");
            return (widget_1.tsx("div", { key: "mult-svg-icon-" + layerId + "-" + objectId, class: CSS.svg.multipleAttachmentsIcon },
                widget_1.tsx("svg", { class: CSS.svg.size },
                    widget_1.tsx("g", null,
                        widget_1.tsx("path", { d: "M18.2,23.8H1.1c-0.5,0-0.9-0.4-0.9-0.9V5.8c0-0.5,0.4-0.9,0.9-0.9h17.1c0.5,0,0.9,0.4,0.9,0.9v17.1\nC19.2,23.4,18.8,23.8,18.2,23.8z M2.2,21.8h15v-15h-15V21.8z" })),
                    widget_1.tsx("g", null,
                        widget_1.tsx("path", { d: "M22.6,17.3c-0.6,0-1.2-0.5-1.2-1.2V2.6H7.9c-0.6,0-1.2-0.5-1.2-1.2s0.5-1.2,1.2-1.2h14.8\nc0.6,0,1.1,0.5,1.1,1.1v14.8C23.8,16.8,23.3,17.3,22.6,17.3z" })))));
        };
        // _renderFeatureTitle
        MapCentric.prototype._renderFeatureTitle = function (objectId) {
            var titleText = this._processTitle(objectId);
            return widget_1.tsx("div", { class: CSS.featureContentTitleContainer }, titleText);
        };
        // _renderThumbnailContainer
        MapCentric.prototype._renderThumbnailContainer = function (attachments) {
            var attachment = attachments[0];
            var contentType = attachment && attachment.contentType;
            var imageStyles = this.imageIsLoaded && attachment && attachment.orientationInfo
                ? imageUtils_1.getOrientationStylesImageThumbnail(attachment.orientationInfo)
                : {};
            var imageAttachmentTypes = [
                "image/jpeg",
                "image/jpg",
                "image/png",
                "image/gif"
            ];
            var isImage = imageAttachmentTypes.indexOf(contentType) !== -1;
            var isPDF = contentType && contentType.indexOf("pdf") !== -1;
            var isVideo = contentType &&
                (contentType.indexOf("mov") !== -1 ||
                    contentType.indexOf("mp4") !== -1 ||
                    contentType.indexOf("quicktime") !== -1);
            var pdf = isPDF ? this._renderPDFThumbnailContainer() : null;
            return (widget_1.tsx("div", { class: CSS.thumbnailContainer }, !attachments || (attachments && attachments.length === 0) ? (widget_1.tsx("div", { key: buildKey("no-attachments-container"), class: CSS.noAttachmentsContainer },
                widget_1.tsx("svg", { class: CSS.svg.noAttachments },
                    widget_1.tsx("g", null,
                        widget_1.tsx("g", null,
                            widget_1.tsx("path", { d: "M29.6,17c0-0.7,0.2-1.2,0.7-1.7s1-0.7,1.7-0.7c0.7,0,1.3,0.2,1.7,0.7c0.5,0.5,0.7,1.1,0.7,1.8\n\t\t\tc0,0.7-0.2,1.2-0.7,1.7c-0.5,0.5-1,0.7-1.7,0.7H32c-0.7,0-1.2-0.2-1.7-0.7c-0.5-0.5-0.7-1-0.7-1.7V17z M13.7,35.9V31\n\t\t\tc0.4,0.2,0.8,0.3,1.2,0.3c0.8,0,1.4-0.3,1.9-0.8l6.4-6.5l6.3,5.4c0.5,0.4,1.1,0.7,1.8,0.7c0.7,0,1.3-0.2,1.8-0.6l3.5-2.7l4.1,4.2\n\t\t\tv5H13.7z M37.4,24.7c-0.4-0.4-0.8-0.4-1.3-0.1L32,27.8c-0.4,0.3-0.8,0.3-1.2,0l-7-6c-0.2-0.2-0.4-0.2-0.7-0.2\n\t\t\tc-0.3,0-0.5,0.1-0.6,0.3l-7,7.2c-0.2,0.2-0.4,0.3-0.7,0.2c-0.3,0-0.5-0.1-0.6-0.3c-0.2-0.2-0.4-0.3-0.7-0.3\n\t\t\tc-0.3,0-0.5,0.1-0.7,0.3l-1,1.1v7.8h30.9V30L37.4,24.7z M42.7,41.8H11.7v-2h30.9V41.8z M44.6,43.8H9.8V12.1h34.8V43.8z M7.9,10.1\n\t\t\tv35.6h38.7V10.1H7.9z" })),
                        widget_1.tsx("g", null,
                            widget_1.tsx("polygon", { points: "3.8,8.8 5.5,6.9 49.4,47.5 47.7,49.4" }),
                            widget_1.tsx("path", { d: "M6,8l42.7,39.5l-1.1,1.2L4.9,9.2L6,8 M5.5,6.2L4.8,6.9L3.8,8.1L3.1,8.8l0.7,0.7l43.2,40l0.7,0.7l0.7-0.7\n\t\t\tl1.1-1.2l0.7-0.7l-0.7-0.7L6.2,6.8L5.5,6.2L5.5,6.2z" })))))) : isImage ? (widget_1.tsx("img", { bind: this, styles: imageStyles, class: CSS.imageThumbnail, src: attachment.url, afterCreate: this._fadeInImage, afterUpdate: this._fadeInImage, alt: "" })) : isPDF ? (pdf) : isVideo ? (widget_1.tsx("svg", { class: CSS.svg.video },
                widget_1.tsx("path", { d: "M31,21.3h-3.5v3.6H31V21.3z M15.1,32.1H9.8v1.8h5.3V32.1z M52.2,39.3H51L41.6,33v-8.9l9.4-6.4h1.2V39.3z\n           M50.5,15.9l-10.6,7.2v10.8l10.6,7.2H54V15.9H50.5z M4.4,41.1l-1.6-1.6V17.6l1.6-1.6h30.3l1.6,1.6v21.9l-1.6,1.6L4.4,41.1z\n           M38.1,40.2V16.8l-2.6-2.7h-5.8l-7.1-7.2H9.8v1.8h12l5.3,5.4H3.6L1,16.8v23.4l2.6,2.7h31.8L38.1,40.2z" }))) : null));
        };
        // _renderPDFThumbnailContainer
        MapCentric.prototype._renderPDFThumbnailContainer = function () {
            return (widget_1.tsx("div", { class: this.classes(CSS.pdfContainer, "esri-map-centric__pointer-events-none") },
                widget_1.tsx("svg", { class: this.classes(CSS.pdfThumbnailIconContainer, "esri-map-centric__pointer-events-none") },
                    widget_1.tsx("path", { d: "M27.9,3.5c-0.6-2.1-2-3.1-3.2-3c-1.4,0.2-2.9,1-3.5,2.4c-1.7,3.9,1.8,15.3,2.4,17.2\n\tc-3.5,10.6-15.3,31.6-21.1,33c-0.1-1.4,0.6-5.4,8.2-10.4c0.4-0.4,0.8-1,1.1-1.3C5.4,44.7-3,49.8,2,53.7c0.3,0.2,0.7,0.4,1.2,0.6\n\tc3.9,1.4,9.2-3.3,14.7-14.1c6-2,10.8-3.5,17.6-4.6c7.5,5.1,12.5,6.2,15.9,4.9c0.9-0.4,2.4-1.6,2.9-3.1c-2.8,3.5-9.2,1-14.4-2.3\n\tc4.8-0.5,9.7-0.8,11.8-0.2c2.7,0.9,2.6,2.2,2.6,2.4c0.2-0.7,0.5-1.9-0.1-2.9c-2.3-3.8-12.7-1.6-16.5-1.2c-6-3.7-10.1-10.2-11.8-14.9\n\tC27.5,12.3,29.1,7.9,27.9,3.5 M25.3,16.2c-1-3.6-2.4-11.6-0.2-14.2C29.6,4.6,26.8,10.7,25.3,16.2 M33.5,34.1\n\tc-5.8,1.1-9.7,2.6-15.3,4.8c1.7-3.3,4.8-11.7,6.3-17.3C26.7,26,29.3,30.2,33.5,34.1" }))));
        };
        // _renderFeatureContentPanel
        MapCentric.prototype._renderFeatureContentPanel = function () {
            var _a, _b;
            var mediaViewerDesktop = this._renderMediaViewerDesktop();
            var featureInfo = this._renderFeatureInfoPanel();
            var featureContentPanelIsOpen = (_a = {},
                _a[CSS.featureContentPanelOpen] = this.featureContentPanelIsOpen,
                _a);
            var featureContentPanelLayerSwitcher = (_b = {},
                _b[CSS.featureContentPanelLayerSwitcher] = this.attachmentViewerDataCollection &&
                    this.attachmentViewerDataCollection.length > 1,
                _b);
            return (widget_1.tsx("div", { key: buildKey("feature-content-panel-" + this.get("selectedAttachmentViewerData.layerData.featureLayer.id")), class: this.classes(CSS.featureContentPanelContainer, featureContentPanelIsOpen, featureContentPanelLayerSwitcher) },
                mediaViewerDesktop,
                featureInfo));
        };
        // _renderMediaViewerDesktop
        MapCentric.prototype._renderMediaViewerDesktop = function () {
            var mediaContainer = this._renderMediaContainer();
            var expandAttachment = this.viewModel.mapCentricState !== "querying" &&
                this.selectedAttachmentViewerData &&
                this.selectedAttachmentViewerData.selectedFeatureAttachments &&
                this.selectedAttachmentViewerData.selectedFeatureAttachments.attachments
                    .length > 0
                ? this._renderExpandAttachment()
                : null;
            return (widget_1.tsx("div", { class: CSS.mediaViewerDesktop },
                expandAttachment,
                mediaContainer));
        };
        // _renderExpandAttachmentIconContainer
        MapCentric.prototype._renderExpandAttachment = function () {
            return (widget_1.tsx("button", { bind: this, onclick: this._expandAttachment, onkeydown: this._expandAttachment, storeNode: "_expandAttachmentNode", tabIndex: !this.featureContentPanelIsOpen ? -1 : 0, class: CSS.expandMediaContainer, title: i18n.viewInFullScreen },
                widget_1.tsx("svg", { class: CSS.svg.expandAttachment },
                    widget_1.tsx("g", null,
                        widget_1.tsx("path", { d: "M17.8,11.2v6.6h-6.6v-1.5h4.1l-5.3-4.7l1-0.9l5.3,4.7v-4.2L17.8,11.2z" }),
                        widget_1.tsx("polygon", { points: "6.8,1.7 6.8,0.2 0.2,0.2 0.2,6.8 1.7,6.8 1.7,2.6 6.4,7.3 7.2,6.4 2.6,1.7" })))));
        };
        // _renderMediaContainer
        MapCentric.prototype._renderMediaContainer = function () {
            if (!this.selectedAttachmentViewerData) {
                return;
            }
            var mediaViewerParentContainer = this._renderMediaViewerParentContainer();
            return (widget_1.tsx("div", { class: CSS.mediaViewerSection }, this._layerDoesNotSupportAttachments ? (widget_1.tsx("div", { class: CSS.layerNotSupported }, i18n.notSupported)) : (mediaViewerParentContainer)));
        };
        // _renderMediaViewerParentContainer
        MapCentric.prototype._renderMediaViewerParentContainer = function () {
            var _a;
            var downloadEnabled = (_a = {},
                _a[CSS.downloadEnabled] = !this.viewModel.downloadEnabled,
                _a);
            var attachment = this.viewModel.getCurrentAttachment();
            var attachmentLoader = !this.imageIsLoaded || this.viewModel.mapCentricState === "querying"
                ? this._renderAttachmentLoader()
                : null;
            var mediaViewerContainer = this._renderMediaViewerContainer();
            var imageDirection = this._fullAttachmentContainerIsOpen
                ? this.imageDirectionEnabled
                    ? this._renderImageDirection(attachment)
                    : null
                : null;
            var attachmentScrollNode = this._renderAttachmentScrollContainer();
            var attachmentScroll = !this._fullAttachmentContainerIsOpen
                ? attachmentScrollNode
                : null;
            return (widget_1.tsx("div", { key: buildKey("image-container"), class: this.classes(downloadEnabled, CSS.mediaViewer) },
                attachmentLoader,
                mediaViewerContainer,
                imageDirection,
                this._fullAttachmentContainerIsOpen ? null : attachmentScroll,
                this._renderAttachmentScrollContainer()));
        };
        // _renderAttachmentLoader
        MapCentric.prototype._renderAttachmentLoader = function () {
            return (widget_1.tsx("div", { class: CSS.widgetLoader, key: buildKey("base-loader") },
                widget_1.tsx("span", { class: CSS.animationLoader, role: "presentation", "aria-label": i18n.loadingImages })));
        };
        // _renderMediaViewerContainer
        MapCentric.prototype._renderMediaViewerContainer = function () {
            var _a;
            var currentImageUrl = this.currentImageUrl;
            var attachment = this.viewModel.getCurrentAttachment();
            var contentType = attachment && attachment.get("contentType");
            var video = contentType && contentType.indexOf("video") !== -1
                ? this._renderVideo(currentImageUrl)
                : null;
            var pdf = contentType && contentType.indexOf("pdf") !== -1
                ? this._renderPdf(currentImageUrl)
                : null;
            var image = this.supportedAttachmentTypes.indexOf(contentType) !== -1 &&
                contentType.indexOf("pdf") === -1 &&
                contentType.indexOf("mov") === -1 &&
                contentType.indexOf("mp4") === -1 &&
                contentType.indexOf("gif") === -1 &&
                contentType.indexOf("quicktime") === -1
                ? currentImageUrl
                    ? this.imagePanZoomEnabled && this._fullAttachmentContainerIsOpen
                        ? null
                        : this._renderCurrentImage()
                    : null
                : null;
            var gif = contentType && contentType.indexOf("gif") !== -1
                ? this._renderCurrentImage()
                : null;
            var mediaContainerLoading = (_a = {},
                _a[CSS.mediaContainerLoading] = !this.imageIsLoaded,
                _a);
            var attachmentsLength = this.get("selectedAttachmentViewerData.selectedFeatureAttachments.attachments.length");
            return (widget_1.tsx("div", { bind: this, afterCreate: widget_1.storeNode, "data-node-ref": "_mediaViewerContainer", class: this.classes(mediaContainerLoading, CSS.mediaContainer) }, video || pdf || image || gif ? (widget_1.tsx("div", { class: pdf
                    ? CSS.pdf
                    : video
                        ? CSS.videoParentContainer
                        : image || gif
                            ? CSS.imageParentContainer
                            : "" },
                image,
                video,
                pdf,
                gif)) : attachmentsLength === 0 &&
                this.viewModel.mapCentricState !== "querying" ? (widget_1.tsx("div", { key: buildKey("no-attachments-container"), class: CSS.noAttachmentsContainer },
                widget_1.tsx("svg", { class: CSS.svg.media, xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 16 16" },
                    widget_1.tsx("path", { d: "M1 2v12h14V2zm13 11H2V3h12zm-1-1H3v-1h10zM3 8.678l.333-.356a.3.3 0 0 1 .445 0 .3.3 0 0 0 .444 0l2.242-2.39a.3.3 0 0 1 .423-.021l2.255 2.005a.299.299 0 0 0 .39.01l1.361-.915a.3.3 0 0 1 .41.032L13 8.678V10H3zM11.894 9l-.89-.859-.846.565a1.299 1.299 0 0 1-1.68-.043L6.732 7.11 4.958 9zm-.644-4.5a.75.75 0 1 1-.75-.75.75.75 0 0 1 .75.75z" })),
                widget_1.tsx("span", { class: CSS.noAttachmentsText }, i18n.noAttachmentsFound))) : null));
        };
        // _renderCurrentImage
        MapCentric.prototype._renderCurrentImage = function () {
            var _a;
            var attachment = this.viewModel.getCurrentAttachment();
            var orientationInfo = attachment && attachment.get("orientationInfo");
            var name = attachment ? attachment.name : null;
            var imageStyles = orientationInfo && this._mediaViewerContainer && this.imageIsLoaded
                ? imageUtils_1.getOrientationStyles(orientationInfo, this._mediaViewerContainer, this.appMode)
                : {
                    transform: "none",
                    height: "initial",
                    maxHeight: "100%"
                };
            var fadeImage = (_a = {},
                _a[CSS.fadeImage] = !this.imageIsLoaded,
                _a);
            return (widget_1.tsx("img", { bind: this, class: this.classes(CSS.imageDesktop, fadeImage), styles: imageStyles, src: this.currentImageUrl, afterCreate: this._fadeInImage, afterUpdate: this._fadeInImage, onload: this._fadeInImage, alt: name }));
        };
        // _renderVideo
        MapCentric.prototype._renderVideo = function (currentImageUrl) {
            return (widget_1.tsx("video", { bind: this, key: "" + currentImageUrl, class: CSS.videoContainer, controls: true },
                widget_1.tsx("source", { src: currentImageUrl, type: "video/mp4" }),
                widget_1.tsx("source", { src: currentImageUrl, type: "video/quicktime" }),
                widget_1.tsx("source", { src: currentImageUrl, type: "video/ogg" }),
                widget_1.tsx("source", { src: currentImageUrl, type: "video/mov" }),
                i18n.doesNotSupportVideo));
        };
        // _renderPdf
        MapCentric.prototype._renderPdf = function (currentImageUrl) {
            return (widget_1.tsx("embed", { key: "" + currentImageUrl, class: CSS.pdf, src: currentImageUrl, type: "application/pdf" }));
        };
        // _renderAttachmentScrollContainer
        MapCentric.prototype._renderAttachmentScrollContainer = function () {
            var attachments = this.get("selectedAttachmentViewerData.selectedFeatureAttachments.attachments");
            var attachment = this.viewModel.getCurrentAttachment();
            var imageDirection = this._renderImageDirection(attachment);
            var download = this._renderDownload();
            var attachmentScroll = this._renderAttachmentScroll();
            return (widget_1.tsx("div", { key: buildKey("attachment-scroll"), class: CSS.attachmentNumber },
                attachments && attachments.length > 0 ? (widget_1.tsx("div", { key: buildKey("download-attachment"), class: CSS.downloadIconTextContainer },
                    attachmentScroll,
                    imageDirection)) : null,
                download));
        };
        // _renderAttachmentScroll
        MapCentric.prototype._renderAttachmentScroll = function () {
            var selectedAttachmentViewerData = this.selectedAttachmentViewerData;
            if (!selectedAttachmentViewerData) {
                return;
            }
            var currentIndex = selectedAttachmentViewerData.attachmentIndex + 1;
            var attachments = this.viewModel.getAttachments();
            var totalNumberOfAttachments = attachments && attachments.length;
            return (widget_1.tsx("div", { class: CSS.attachmentScroll },
                widget_1.tsx("button", { bind: this, onclick: this._previousImage, onkeydown: this._previousImage, disabled: this._onboardingPanelIsOpen ||
                        (attachments && attachments.length < 2)
                        ? true
                        : false, tabIndex: 0, class: CSS.leftArrowContainer, title: i18n.previousAttachment }, this.docDirection === "rtl" ? (widget_1.tsx("span", { class: this.classes(CSS.icons.rightArrow, CSS.icons.flush) })) : (widget_1.tsx("span", { class: this.classes(CSS.icons.leftArrow, CSS.icons.flush) }))),
                widget_1.tsx("span", { class: CSS.attachmentNumberText }, currentIndex + " / " + totalNumberOfAttachments),
                widget_1.tsx("button", { bind: this, onclick: this._nextImage, onkeydown: this._nextImage, disabled: this._onboardingPanelIsOpen ||
                        (attachments && attachments.length < 2)
                        ? true
                        : false, tabIndex: 0, class: CSS.rightArrowContainer, title: i18n.nextAttachment }, this.docDirection === "rtl" ? (widget_1.tsx("span", { class: this.classes(CSS.icons.leftArrow, CSS.icons.flush) })) : (widget_1.tsx("span", { class: this.classes(CSS.icons.rightArrow, CSS.icons.flush) })))));
        };
        // _renderImageDirection
        MapCentric.prototype._renderImageDirection = function (attachment) {
            var imageDirectionValue = this.imageDirectionEnabled
                ? this.viewModel.getGPSInformation(attachment)
                : null;
            return imageDirectionValue ? (widget_1.tsx("div", { key: buildKey("gps-image-direction"), class: CSS.gpsImageDirection },
                this._fullAttachmentContainerIsOpen ? (widget_1.tsx("span", { class: CSS.imageDirectionDegrees },
                    i18n.gpsImageDirection,
                    ": ", "" + imageDirectionValue,
                    "\u00B0")) : null,
                widget_1.tsx("div", { title: i18n.gpsImageDirection + ": " + imageDirectionValue + "\u00B0", class: CSS.imageDirection },
                    widget_1.tsx("svg", { styles: { transform: "rotateZ(" + imageDirectionValue + "deg)" }, class: CSS.mapCentricCamera },
                        widget_1.tsx("g", null,
                            widget_1.tsx("path", { d: "M19.1,10.8h-0.3h-0.3h-1.3v2h-1v-0.7v-0.3h-11l0,0h-1v1.1v5.8v0h16v-1.9v-3.9v-1.1\n\t\tC20.2,11.3,19.7,10.8,19.1,10.8z" }),
                            widget_1.tsx("path", { d: "M15.2,8.2V7.4v-2c0-0.9-0.7-1.6-1.6-1.6H7.8c-0.9,0-1.6,0.7-1.6,1.6v2v0.8v2.6h9V8.2z" }),
                            widget_1.tsx("path", { d: "M12,1c6.1,0,11,4.9,11,11s-4.9,11-11,11S1,18.1,1,12S5.9,1,12,1 M12,0C5.4,0,0,5.4,0,12s5.4,12,12,12\n\t\tc6.6,0,12-5.4,12-12S18.6,0,12,0L12,0z" })))))) : null;
        };
        // _renderDownload
        MapCentric.prototype._renderDownload = function () {
            var attachment = this.viewModel.getCurrentAttachment();
            var contentType = attachment && attachment.get("contentType");
            var download = contentType &&
                contentType.indexOf("video") === -1 &&
                contentType.indexOf("gif") === -1 &&
                contentType.indexOf("pdf") === -1 &&
                this.viewModel.downloadEnabled
                ? this.viewModel.state === "downloading"
                    ? this._renderDownloadSpinner()
                    : this._renderDownloadButton()
                : null;
            return download;
        };
        // _renderDownloadSpinner
        MapCentric.prototype._renderDownloadSpinner = function () {
            return (widget_1.tsx("div", { class: CSS.downloadIconContainer },
                widget_1.tsx("span", { class: this.classes(CSS.icons.loadingIcon, CSS.icons.rotating, CSS.spinner), role: "presentation" })));
        };
        // _renderDownloadButton
        MapCentric.prototype._renderDownloadButton = function () {
            var attachment = this.viewModel.getCurrentAttachment();
            return (widget_1.tsx("button", { class: this.classes(CSS.downloadIconContainer, CSS.downloadButtonDesktop), bind: this, onclick: this._downloadImage, onkeydown: this._downloadImage, "data-image-url": this.currentImageUrl, "data-image-name": attachment.name, title: i18n.download, disabled: this.imageIsLoaded ? false : true },
                widget_1.tsx("span", { class: this.classes(CSS.icons.downloadIcon, CSS.icons.flush, CSS.downloadIcon) })));
        };
        // _renderFeatureInfoPanel
        MapCentric.prototype._renderFeatureInfoPanel = function () {
            var featureWidget = this.get("viewModel.featureWidget");
            var featureWidgetContent = featureWidget &&
                featureWidget.get("viewModel.content");
            var fieldsInfoContent = (featureWidget &&
                featureWidgetContent &&
                featureWidgetContent.filter(function (contentItem) {
                    var fieldInfos = contentItem.get("fieldInfos");
                    return (contentItem.type === "fields" && fieldInfos && fieldInfos.length > 0);
                })) ||
                [];
            var mediaInfoContent = (featureWidget &&
                featureWidgetContent &&
                featureWidgetContent.filter(function (contentItem) {
                    var mediaInfos = contentItem.get("mediaInfos");
                    return (contentItem.type === "media" && mediaInfos && mediaInfos.length > 0);
                })) ||
                [];
            var fieldsInfoText = (featureWidget &&
                featureWidgetContent &&
                featureWidgetContent.filter(function (contentItem) {
                    return contentItem.type === "text";
                })) ||
                [];
            if (this._featureContentAvailable === null) {
                if ((fieldsInfoContent && fieldsInfoContent.length > 0) ||
                    (fieldsInfoText && fieldsInfoText.length > 0)) {
                    this._featureContentAvailable = true;
                }
            }
            var featureContentHeader = this._renderFeatureContentHeader();
            var address = this._renderFeatureContentAddress();
            var unsupportedAttachmentTypesLength = this.get("selectedAttachmentViewerData.unsupportedAttachmentTypes.length");
            var unsupportedAttachmentTypes = unsupportedAttachmentTypesLength > 0
                ? this._renderUnsupportedAttachmentTypes()
                : null;
            if (this._featureContentAvailable === null) {
                if ((fieldsInfoContent && fieldsInfoContent.length > 0) ||
                    (fieldsInfoText && fieldsInfoText.length > 0)) {
                    this._featureContentAvailable = true;
                }
            }
            var featureTotal = this.selectedAttachmentViewerData &&
                this.selectedAttachmentViewerData.get("featureObjectIds.length");
            return (widget_1.tsx("div", { class: CSS.featureContent }, this.viewModel.mapCentricState === "querying" ? (widget_1.tsx("div", { class: CSS.featureContentLoader },
                widget_1.tsx("div", { class: CSS.loaderGraphic }),
                widget_1.tsx("div", null,
                    i18n.loading,
                    "..."))) : (widget_1.tsx("div", { class: CSS.featureContentContainer },
                featureContentHeader,
                address,
                (fieldsInfoText && fieldsInfoText.length > 0) ||
                    (mediaInfoContent && mediaInfoContent.length > 0) ||
                    this._featureContentAvailable ? (widget_1.tsx("div", null,
                    this._featureContentAvailable
                        ? this._renderFeatureInfoContent()
                        : null,
                    (mediaInfoContent && mediaInfoContent.length > 0) ||
                        (fieldsInfoText && fieldsInfoText.length > 0)
                        ? this._renderFeatureWidgetContent()
                        : null)) : this._featureContentAvailable && featureTotal ? (this._renderFeatureContentLoader()) : (this._renderNoFeatureContentInfo()),
                unsupportedAttachmentTypes))));
        };
        // _renderFeatureContentHeader
        MapCentric.prototype._renderFeatureContentHeader = function () {
            var zoomTo = this._renderZoomTo();
            var layerId = this.get("selectedAttachmentViewerData.layerData.featureLayer.id");
            var objectIdField = this.get("selectedAttachmentViewerData.layerData.featureLayer.objectIdField");
            var attributes = this.get("selectedAttachmentViewerData.selectedFeature.attributes");
            var objectId = attributes && attributes[objectIdField];
            return (widget_1.tsx("div", { class: CSS.featureTitleZoomContainer },
                widget_1.tsx("div", { key: buildKey("feature-content-title-" + layerId + "-" + objectId), class: CSS.featureContentTitle },
                    widget_1.tsx("h2", { class: CSS.featureLayerTitle }, this.get("viewModel.featureWidget.title"))),
                widget_1.tsx("div", { class: CSS.featureZoomToContainer }, zoomTo)));
        };
        // _renderZoomTo
        MapCentric.prototype._renderZoomTo = function () {
            return (widget_1.tsx("button", { bind: this, class: CSS.zoomTo, tabIndex: 0, onclick: this._zoomTo, onkeydown: this._zoomTo, title: i18n.zoomTo, label: i18n.zoomTo },
                widget_1.tsx("span", { class: this.classes(CSS.zoomToIcon, CSS.icons.zoomInIcon, CSS.icons.flush) })));
        };
        // _renderFeatureContentAddress
        MapCentric.prototype._renderFeatureContentAddress = function () {
            return (widget_1.tsx("h3", { class: CSS.addressText }, this.get("selectedAttachmentViewerData.selectedFeatureAddress")));
        };
        // _renderFeatureWidgetContent
        MapCentric.prototype._renderFeatureWidgetContent = function () {
            var featureWidget = this.get("viewModel.featureWidget");
            return (widget_1.tsx("div", { key: buildKey("feture-widget-content"), class: CSS.featureInfoContent }, featureWidget && featureWidget.render()));
        };
        // _renderFeatureInfoContent
        MapCentric.prototype._renderFeatureInfoContent = function () {
            var featureContentInfo = this.selectedAttachmentViewerData &&
                this.selectedAttachmentViewerData.selectedFeatureInfo
                ? this._renderFeatureContentInfos()
                : null;
            return (widget_1.tsx("div", { key: buildKey("feature-info-content"), class: CSS.featureInfoContent }, featureContentInfo));
        };
        // _renderFeatureContentInfos
        MapCentric.prototype._renderFeatureContentInfos = function () {
            var _this = this;
            var selectedFeatureInfo = this.selectedAttachmentViewerData.selectedFeatureInfo;
            var featureContentInfos = selectedFeatureInfo.map(function (contentInfo, contentInfoIndex) {
                return _this._renderFeatureContentInfo(contentInfo, contentInfoIndex);
            });
            return widget_1.tsx("div", null, featureContentInfos);
        };
        // _renderFeatureContentInfo
        MapCentric.prototype._renderFeatureContentInfo = function (contentInfo, contentInfoIndex) {
            var hyperlink = this.viewModel.getHyperLink(contentInfo);
            var contentCheck = contentInfo && contentInfo.content && contentInfo.content !== null;
            var layerId = this._getLayerId();
            var objectIdField = this.viewModel.getObjectIdField();
            var selectedFeature = this.get("selectedAttachmentViewerData.selectedFeature");
            var attributes = selectedFeature && selectedFeature.attributes;
            var objectId = attributes && objectIdField && attributes[objectIdField];
            var key = "feature-content-info-" + layerId + "-" + contentInfo.attribute + "-" + contentInfo.content + "-" + objectId + "-" + contentInfoIndex;
            return (widget_1.tsx("div", { key: buildKey(key), class: CSS.featureContentInfo },
                widget_1.tsx("h4", { class: CSS.attributeHeading, innerHTML: contentInfo.attribute }),
                contentInfo && contentInfo.content && contentCheck ? (hyperlink ? (widget_1.tsx("p", { class: CSS.attributeContent },
                    widget_1.tsx("div", { innerHTML: contentInfo.content.replace(hyperlink, "") }),
                    widget_1.tsx("span", { innerHTML: urlUtils_1.autoLink(hyperlink) }))) : contentInfo &&
                    contentInfo.content &&
                    typeof contentInfo.content === "string" &&
                    contentInfo.content.trim() === "" ? (widget_1.tsx("p", null, i18n.noContentAvailable)) : (widget_1.tsx("p", { class: CSS.attributeContent, innerHTML: contentInfo.content }))) : (widget_1.tsx("p", null, i18n.noContentAvailable))));
        };
        // _renderFeatureContentLoader
        MapCentric.prototype._renderFeatureContentLoader = function () {
            return (widget_1.tsx("div", { key: buildKey("feature-content-loader"), class: CSS.widgetLoader }, i18n.loadingImages));
        };
        // _renderNoFeatureContentInfo
        MapCentric.prototype._renderNoFeatureContentInfo = function () {
            return (widget_1.tsx("div", { key: buildKey("no-content"), class: CSS.noInfo }, i18n.noContentAvailable));
        };
        // _renderUnsupportedAttachmentTypes
        MapCentric.prototype._renderUnsupportedAttachmentTypes = function () {
            var unsupportedAttachmentTypes = this._renderUnsupportedAttachmentTypesList();
            return (widget_1.tsx("div", { key: buildKey("other-attachment-types") },
                widget_1.tsx("h4", { class: CSS.attributeHeading }, i18n.otherAttachments),
                unsupportedAttachmentTypes));
        };
        // _renderUnsupportedAttachmentTypesList
        MapCentric.prototype._renderUnsupportedAttachmentTypesList = function () {
            var _this = this;
            var otherAttachmentTypes = this.selectedAttachmentViewerData.unsupportedAttachmentTypes.map(function (attachment) {
                return _this._renderUnsupportedAttachmentType(attachment);
            });
            return widget_1.tsx("ul", { class: CSS.otherAttachmentsList }, otherAttachmentTypes);
        };
        // _renderOtherAttachmentType
        MapCentric.prototype._renderUnsupportedAttachmentType = function (attachment) {
            var id = attachment.id, name = attachment.name, size = attachment.size;
            return (widget_1.tsx("li", { key: buildKey("other-attachment-" + id + "-" + name + "-" + size) },
                widget_1.tsx("a", { href: attachment.url, target: "_blank" }, attachment.name)));
        };
        // _renderFullAttachmentContainer
        MapCentric.prototype._renderFullAttachmentContainer = function () {
            var _a;
            var fullAttachmentNode = this._renderFullAttachmentNode();
            var attachment = this.viewModel.getCurrentAttachment();
            if (this.imagePanZoomEnabled) {
                this._handleImagePanZoom(attachment);
            }
            var fullAttachmentContainerIsOpen = (_a = {},
                _a[CSS.fullMediaContainerOpen] = this._fullAttachmentContainerIsOpen,
                _a);
            return (widget_1.tsx("div", { key: buildKey("full-image-container"), class: this.classes(CSS.fullMediaContainer, fullAttachmentContainerIsOpen) }, fullAttachmentNode));
        };
        // _renderFullAttachmentNode
        MapCentric.prototype._renderFullAttachmentNode = function () {
            var attachment = this.viewModel.getCurrentAttachment();
            var contentType = attachment && attachment.get("contentType");
            var contentTypesToCheck = [
                "image/gif",
                "video/mp4",
                "video/mov",
                "video/quicktime",
                "application/pdf"
            ];
            var contentTypeCheck = contentTypesToCheck.indexOf(contentType) === -1;
            var zoomSlider = this._fullAttachmentContainerIsOpen
                ? this.imagePanZoomEnabled &&
                    document.body.clientWidth > 813 &&
                    this.currentImageUrl &&
                    contentTypeCheck
                    ? this._renderZoomSlider()
                    : null
                : null;
            var attachmentViewerContainer = this._renderMediaViewerContainer();
            var attachmentScroll = this._renderAttachmentScrollContainer();
            var attachmentLoader = this.viewModel.state !== "querying" && !this.imageIsLoaded
                ? this._renderAttachmentLoader()
                : null;
            var imageAttachmentTypes = [
                "image/jpeg",
                "image/jpg",
                "image/png",
                "image/gif"
            ];
            if (imageAttachmentTypes.indexOf(contentType) === -1) {
                this.set("imageIsLoaded", true);
            }
            return (widget_1.tsx("div", { class: CSS.mediaViewerSection }, this._layerDoesNotSupportAttachments ? (widget_1.tsx("div", { class: CSS.layerNotSupported }, i18n.notSupported)) : (widget_1.tsx("div", { class: CSS.mediaViewer },
                widget_1.tsx("button", { bind: this, afterCreate: widget_1.storeNode, "data-node-ref": "_fullScreenCloseNode", onclick: this._expandAttachment, onkeydown: this._expandAttachment, class: CSS.closeFeatureContainer, title: i18n.closeFullScreen, tabIndex: !this.featureContentPanelIsOpen ||
                        !this._fullAttachmentContainerIsOpen
                        ? -1
                        : 0 },
                    widget_1.tsx("span", { class: this.classes(CSS.icons.closeIcon, CSS.icons.flush) })),
                attachmentLoader,
                widget_1.tsx("div", { bind: this, afterCreate: widget_1.storeNode, "data-node-ref": "_mediaViewerContainerFullAttachment", key: buildKey("image-container"), class: CSS.mediaContainer },
                    attachmentViewerContainer,
                    zoomSlider),
                attachmentScroll))));
        };
        // _renderZoomSlider
        MapCentric.prototype._renderZoomSlider = function () {
            var _this = this;
            return (widget_1.tsx("div", { class: CSS.zoomSlider },
                widget_1.tsx("button", { bind: this, onclick: this._zoomOutImage, onkeydown: this._zoomOutImage, tabIndex: 0, class: CSS.zoomSliderButton, title: i18n.zoomOutImage },
                    widget_1.tsx("span", { class: this.classes(CSS.slideSymbol, CSS.icons.minusIcon) })),
                widget_1.tsx("input", { bind: this, afterCreate: widget_1.storeNode, "data-node-ref": "_zoomSliderNode", type: "range", min: "100", max: "500", step: "10", oninput: function (event) {
                        if (_this._imageViewer) {
                            _this._imageViewer.zoom(event.target.valueAsNumber);
                        }
                    } }),
                widget_1.tsx("button", { bind: this, onclick: this._zoomInImage, onkeydown: this._zoomInImage, tabIndex: 0, class: CSS.zoomSliderButton, title: i18n.zoomInImage },
                    widget_1.tsx("span", { class: this.classes(CSS.slideSymbol, CSS.icons.plusIcon) }))));
        };
        // _renderMapViewContainer
        MapCentric.prototype._renderMapViewContainer = function () {
            var mapView = this._renderMapView();
            return widget_1.tsx("div", { class: CSS.mapViewContainer }, mapView);
        };
        // _renderMapView
        MapCentric.prototype._renderMapView = function () {
            return (widget_1.tsx("div", { bind: this.view.container, afterCreate: utils_1.attachToNode, class: CSS.mapView }));
        };
        //----------------------------------
        //
        //  END OF RENDER NODE METHODS
        //
        //----------------------------------
        //----------------------------------
        //
        //  START OF ACCESSIBLE HANDLERS
        //
        //----------------------------------
        // _toggleOnboardingPanel
        MapCentric.prototype._toggleOnboardingPanel = function () {
            if (this._onboardingPanelIsOpen) {
                this._onboardingPanelIsOpen = false;
            }
            else {
                this._onboardingPanelIsOpen = true;
            }
            this.scheduleRender();
        };
        // _disableOnboardingPanel
        MapCentric.prototype._disableOnboardingPanel = function () {
            this._onboardingPanelIsOpen = false;
            this.scheduleRender();
        };
        // _selectGalleryItem
        MapCentric.prototype._selectGalleryItem = function (event) {
            this.currentImageUrl = null;
            this.set("currentImageUrl", null);
            var node = event.currentTarget;
            var objectId = node["data-object-id"];
            this.viewModel.handleGalleryItem(objectId);
            this.featureContentPanelIsOpen = true;
            this.scheduleRender();
        };
        // _zoomTo
        MapCentric.prototype._zoomTo = function () {
            if (document.body.clientWidth < 813) {
                this._currentMobileScreen = "maps";
                this.scheduleRender();
            }
            this.viewModel.zoomToMapCentric();
        };
        // _previousImage
        MapCentric.prototype._previousImage = function () {
            this._disableImagePanZoom();
            this.viewModel.previousImage();
            if ((this.imagePanZoomEnabled && !this._fullAttachmentContainerIsOpen) ||
                !this.imagePanZoomEnabled) {
                this.set("imageIsLoaded", false);
            }
            this.scheduleRender();
        };
        // _nextImage
        MapCentric.prototype._nextImage = function () {
            this._disableImagePanZoom();
            this.viewModel.nextImage();
            if ((this.imagePanZoomEnabled && !this._fullAttachmentContainerIsOpen) ||
                !this.imagePanZoomEnabled) {
                this.set("imageIsLoaded", false);
            }
            this.scheduleRender();
        };
        // _downloadImage
        MapCentric.prototype._downloadImage = function (event) {
            this.viewModel.downloadImage(event);
        };
        // _closeFeatureContent
        MapCentric.prototype._closeFeatureContent = function () {
            this.featureContentPanelIsOpen = false;
            this.currentImageUrl = null;
            this.set("viewModel.selectedAttachmentViewerData.attachmentIndex", 0);
            this.set("selectedAttachmentViewerData.selectedFeatureAddress", null);
            this.viewModel.closeTooltipPopup();
        };
        // _expandAttachment
        MapCentric.prototype._expandAttachment = function () {
            if (this._fullAttachmentContainerIsOpen) {
                this._fullAttachmentContainerIsOpen = false;
                if (this.imagePanZoomEnabled) {
                    this._imageViewer && this._imageViewer.destroy();
                    this._imageViewer = null;
                    this._imageViewerSet = false;
                    this._imageZoomLoaded = false;
                }
                this._expandAttachmentNode && this._expandAttachmentNode.focus();
            }
            else {
                this._fullAttachmentContainerIsOpen = true;
                this._fullScreenCloseNode && this._fullScreenCloseNode.focus();
            }
            this.scheduleRender();
        };
        // _zoomInImage
        MapCentric.prototype._zoomInImage = function () {
            if (this._imageViewer._state.zoomValue === 500) {
                return;
            }
            var updatedZoomValue = this._imageViewer._state.zoomValue + 50;
            this._imageViewer.zoom(updatedZoomValue);
            this._zoomSliderNode.value = "" + updatedZoomValue;
            this.scheduleRender();
        };
        // _zoomOutImage
        MapCentric.prototype._zoomOutImage = function () {
            if (this._imageViewer._state.zoomValue === 0) {
                return;
            }
            var updatedZoomValue = this._imageViewer._state.zoomValue - 50;
            this._imageViewer.zoom(updatedZoomValue);
            this._zoomSliderNode.value = "" + updatedZoomValue;
            this.scheduleRender();
        };
        // _handleContent
        MapCentric.prototype._handleNavItem = function (event) {
            var node = event.currentTarget;
            var navItem = node.getAttribute("data-nav-item");
            this._currentMobileScreen = navItem;
            this.scheduleRender();
        };
        //----------------------------------
        //
        //  END OF ACCESSIBLE HANDLERS
        //
        //----------------------------------
        // _triggerScrollQuery
        MapCentric.prototype._triggerScrollQuery = function () {
            var _triggerScrollElement = this._triggerScrollElement;
            if (!_triggerScrollElement) {
                return;
            }
            var scrollTop = _triggerScrollElement.scrollTop, scrollHeight = _triggerScrollElement.scrollHeight, offsetHeight = _triggerScrollElement.offsetHeight;
            if (scrollTop + 10 > scrollHeight - offsetHeight) {
                this.viewModel.updateAttachmentDataMapCentric();
            }
        };
        // _fadeInImage
        MapCentric.prototype._fadeInImage = function (imageElement) {
            var _this = this;
            imageElement.onload = function () {
                _this.set("imageIsLoaded", true);
                imageElement.style.opacity = "1";
            };
        };
        // _processTitle
        MapCentric.prototype._processTitle = function (objectId) {
            var featureWidget = this.get("view.popup.selectedFeatureWidget");
            var attributes = featureWidget && featureWidget.get("graphic.attributes");
            var objectIdField = this.viewModel.getObjectIdField();
            var waitingForContent = featureWidget && featureWidget.get("viewModel.waitingForContent");
            var title = null;
            if (attributes && objectIdField) {
                if (!waitingForContent && attributes[objectIdField] === objectId) {
                    title = this.get("view.popup.title");
                }
                else {
                    title = null;
                }
            }
            var featureTitle = title ? "" + title : null;
            return featureTitle
                ? title.length >= 30
                    ? title
                        .split("")
                        .slice(0, 25)
                        .join("") + "..."
                    : title
                : null;
        };
        // _openToolTipPopup
        MapCentric.prototype._openToolTipPopup = function (event) {
            this.viewModel.openTooltipPopup(event);
        };
        // _closeToolTipPopup
        MapCentric.prototype._closeToolTipPopup = function () {
            this.viewModel.closeTooltipPopup();
        };
        // _handleImagePanZoom
        MapCentric.prototype._handleImagePanZoom = function (attachment) {
            var contentType = attachment && attachment.get("contentType");
            var contentTypesToCheck = [
                "image/gif",
                "video/mp4",
                "video/mov",
                "video/quicktime",
                "application/pdf"
            ];
            var contentTypeCheck = contentTypesToCheck.indexOf(contentType) === -1;
            if (this.currentImageUrl &&
                this._fullAttachmentContainerIsOpen &&
                contentTypeCheck) {
                if (this._mediaViewerContainerFullAttachment && !this._imageViewerSet) {
                    if (this._imageViewer) {
                        this._imageViewer.destroy();
                        this._imageViewer = null;
                    }
                    this._imageViewer = new ImageViewer(this._mediaViewerContainerFullAttachment, {
                        snapView: false,
                        zoomOnMouseWheel: false,
                        zoomValue: 100,
                        maxZoom: 500
                    });
                    this._imageViewerSet = true;
                    this.scheduleRender();
                }
                if (this._imageViewerSet && !this._imageZoomLoaded && contentTypeCheck) {
                    this._imageViewer.load(this.currentImageUrl);
                    var rotation = attachment && attachment.get("orientationInfo.rotation");
                    if (rotation) {
                        var ivImageElement = document.querySelector(".iv-image");
                        ivImageElement.style.transform = "rotate(" + rotation + "deg)";
                    }
                    this._imageZoomLoaded = true;
                    this.scheduleRender();
                }
            }
        };
        // _disableImagePanZoom
        MapCentric.prototype._disableImagePanZoom = function () {
            if (this.imagePanZoomEnabled) {
                this._imageViewer && this._imageViewer.destroy();
                this._imageViewer = null;
                this._imageViewerSet = false;
                this._imageZoomLoaded = false;
                if (this._zoomSliderNode) {
                    this._zoomSliderNode.value = "0";
                }
            }
        };
        // _generateNavObjects
        MapCentric.prototype._generateNavObjects = function () {
            var iconUi = "icon-ui-";
            var navData = ["description", "media", "maps"];
            return navData.map(function (navDataItem) {
                return {
                    type: navDataItem,
                    iconClass: "" + iconUi + navDataItem
                };
            });
        };
        // _getLayerId
        MapCentric.prototype._getLayerId = function () {
            return this.get("selectedAttachmentViewerData.layerData.featureLayer.id");
        };
        __decorate([
            decorators_1.aliasOf("viewModel.addressEnabled"),
            decorators_1.property()
        ], MapCentric.prototype, "addressEnabled", void 0);
        __decorate([
            decorators_1.aliasOf("viewModel.appMode"),
            widget_1.renderable(),
            decorators_1.property()
        ], MapCentric.prototype, "appMode", void 0);
        __decorate([
            decorators_1.aliasOf("viewModel.attachmentIndex"),
            decorators_1.property()
        ], MapCentric.prototype, "attachmentIndex", void 0);
        __decorate([
            decorators_1.aliasOf("viewModel.attachmentLayer"),
            decorators_1.property()
        ], MapCentric.prototype, "attachmentLayer", void 0);
        __decorate([
            decorators_1.aliasOf("viewModel.attachmentLayers"),
            decorators_1.property()
        ], MapCentric.prototype, "attachmentLayers", void 0);
        __decorate([
            decorators_1.aliasOf("viewModel.attachmentViewerDataCollection"),
            decorators_1.property()
        ], MapCentric.prototype, "attachmentViewerDataCollection", void 0);
        __decorate([
            decorators_1.aliasOf("viewModel.currentImageUrl"),
            decorators_1.property()
        ], MapCentric.prototype, "currentImageUrl", void 0);
        __decorate([
            decorators_1.aliasOf("viewModel.defaultObjectId"),
            decorators_1.property()
        ], MapCentric.prototype, "defaultObjectId", void 0);
        __decorate([
            decorators_1.aliasOf("viewModel.downloadEnabled"),
            decorators_1.property()
        ], MapCentric.prototype, "downloadEnabled", void 0);
        __decorate([
            decorators_1.property()
        ], MapCentric.prototype, "docDirection", void 0);
        __decorate([
            decorators_1.aliasOf("viewModel.featureContentPanelIsOpen"),
            widget_1.renderable(),
            decorators_1.property()
        ], MapCentric.prototype, "featureContentPanelIsOpen", void 0);
        __decorate([
            decorators_1.aliasOf("viewModel.graphicsLayer"),
            decorators_1.property()
        ], MapCentric.prototype, "graphicsLayer", void 0);
        __decorate([
            decorators_1.aliasOf("viewModel.imageDirectionEnabled"),
            widget_1.renderable(),
            decorators_1.property()
        ], MapCentric.prototype, "imageDirectionEnabled", void 0);
        __decorate([
            decorators_1.aliasOf("viewModel.imageIsLoaded"),
            decorators_1.property()
        ], MapCentric.prototype, "imageIsLoaded", void 0);
        __decorate([
            decorators_1.property()
        ], MapCentric.prototype, "imagePanZoomEnabled", void 0);
        __decorate([
            decorators_1.aliasOf("viewModel.layerSwitcher"),
            decorators_1.property()
        ], MapCentric.prototype, "layerSwitcher", void 0);
        __decorate([
            decorators_1.aliasOf("viewModel.mapCentricSketchQueryExtent"),
            decorators_1.property()
        ], MapCentric.prototype, "mapCentricSketchQueryExtent", void 0);
        __decorate([
            decorators_1.aliasOf("viewModel.mapCentricTooltipEnabled"),
            decorators_1.property()
        ], MapCentric.prototype, "mapCentricTooltipEnabled", void 0);
        __decorate([
            decorators_1.property()
        ], MapCentric.prototype, "onboardingButtonText", void 0);
        __decorate([
            decorators_1.property()
        ], MapCentric.prototype, "onboardingContent", void 0);
        __decorate([
            decorators_1.aliasOf("viewModel.onlyDisplayFeaturesWithAttachmentsIsEnabled"),
            decorators_1.property()
        ], MapCentric.prototype, "onlyDisplayFeaturesWithAttachmentsIsEnabled", void 0);
        __decorate([
            decorators_1.aliasOf("viewModel.order"),
            decorators_1.property()
        ], MapCentric.prototype, "order", void 0);
        __decorate([
            decorators_1.aliasOf("viewModel.searchWidget"),
            decorators_1.property()
        ], MapCentric.prototype, "searchWidget", void 0);
        __decorate([
            decorators_1.aliasOf("viewModel.selectFeaturesEnabled"),
            decorators_1.property()
        ], MapCentric.prototype, "selectFeaturesEnabled", void 0);
        __decorate([
            decorators_1.aliasOf("viewModel.selectedAttachmentViewerData"),
            widget_1.renderable(),
            decorators_1.property()
        ], MapCentric.prototype, "selectedAttachmentViewerData", void 0);
        __decorate([
            decorators_1.aliasOf("viewModel.selectedLayerId"),
            decorators_1.property()
        ], MapCentric.prototype, "selectedLayerId", void 0);
        __decorate([
            decorators_1.aliasOf("viewModel.shareLocationWidget"),
            decorators_1.property()
        ], MapCentric.prototype, "shareLocationWidget", void 0);
        __decorate([
            decorators_1.aliasOf("viewModel.sketchWidget"),
            decorators_1.property()
        ], MapCentric.prototype, "sketchWidget", void 0);
        __decorate([
            decorators_1.aliasOf("viewModel.socialSharingEnabled"),
            decorators_1.property()
        ], MapCentric.prototype, "socialSharingEnabled", void 0);
        __decorate([
            decorators_1.aliasOf("viewModel.supportedAttachmentTypes"),
            decorators_1.property()
        ], MapCentric.prototype, "supportedAttachmentTypes", void 0);
        __decorate([
            decorators_1.aliasOf("viewModel.title"),
            decorators_1.property()
        ], MapCentric.prototype, "title", void 0);
        __decorate([
            decorators_1.aliasOf("viewModel.view"),
            decorators_1.property()
        ], MapCentric.prototype, "view", void 0);
        __decorate([
            widget_1.renderable(["viewModel.state", "viewModel.mapCentricState"]),
            decorators_1.property({
                type: MapCentricViewModel
            })
        ], MapCentric.prototype, "viewModel", void 0);
        __decorate([
            decorators_1.aliasOf("viewModel.zoomLevel"),
            decorators_1.property()
        ], MapCentric.prototype, "zoomLevel", void 0);
        __decorate([
            widget_1.accessibleHandler()
        ], MapCentric.prototype, "_toggleOnboardingPanel", null);
        __decorate([
            widget_1.accessibleHandler()
        ], MapCentric.prototype, "_disableOnboardingPanel", null);
        __decorate([
            widget_1.accessibleHandler()
        ], MapCentric.prototype, "_selectGalleryItem", null);
        __decorate([
            widget_1.accessibleHandler()
        ], MapCentric.prototype, "_zoomTo", null);
        __decorate([
            widget_1.accessibleHandler()
        ], MapCentric.prototype, "_previousImage", null);
        __decorate([
            widget_1.accessibleHandler()
        ], MapCentric.prototype, "_nextImage", null);
        __decorate([
            widget_1.accessibleHandler()
        ], MapCentric.prototype, "_downloadImage", null);
        __decorate([
            widget_1.accessibleHandler()
        ], MapCentric.prototype, "_closeFeatureContent", null);
        __decorate([
            widget_1.accessibleHandler()
        ], MapCentric.prototype, "_expandAttachment", null);
        __decorate([
            widget_1.accessibleHandler()
        ], MapCentric.prototype, "_zoomInImage", null);
        __decorate([
            widget_1.accessibleHandler()
        ], MapCentric.prototype, "_zoomOutImage", null);
        __decorate([
            widget_1.accessibleHandler()
        ], MapCentric.prototype, "_handleNavItem", null);
        MapCentric = __decorate([
            decorators_1.subclass("MapCentric")
        ], MapCentric);
        return MapCentric;
    }(decorators_1.declared(Widget)));
    return MapCentric;
});
//# sourceMappingURL=MapCentric.js.map