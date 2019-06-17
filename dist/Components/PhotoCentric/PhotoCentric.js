/// <amd-dependency path="esri/core/tsSupport/declareExtendsHelper" name="__extends" />
/// <amd-dependency path="esri/core/tsSupport/decorateHelper" name="__decorate" />
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
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
define(["require", "exports", "esri/core/tsSupport/declareExtendsHelper", "esri/core/tsSupport/decorateHelper", "esri/core/accessorSupport/decorators", "esri/widgets/support/widget", "dojo/i18n!./nls/resources", "esri/widgets/Widget", "esri/core/watchUtils", "../AttachmentViewer/AttachmentViewerViewModel", "../utils", "../utils/imageUtils"], function (require, exports, __extends, __decorate, decorators_1, widget_1, i18n, Widget, watchUtils, AttachmentViewerViewModel, utils_1, imageUtils_1) {
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
        // feature content
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
            rotating: "esri-rotating"
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
            //  Variables
            //
            //----------------------------------
            _this._mapAndSearchIsExpanded = true;
            _this._imageCarouselIsOpen = null;
            _this._photoViewerContainer = null;
            _this._mobileAttachment = null;
            _this._layerDoesNotSupportAttachments = null;
            _this._onboardingPanelIsOpen = null;
            _this._featureContentAvailable = null;
            _this._previousImageUrl = null;
            _this._featureContentPanel = null;
            //----------------------------------
            //
            //  Properties
            //
            //----------------------------------
            // view
            _this.view = null;
            // title
            _this.title = null;
            // shareLocationWidget
            _this.shareLocationWidget = null;
            // selectedFeatureAttachments
            _this.selectedFeatureAttachments = null;
            // featureLayerTitle
            _this.featureLayerTitle = null;
            // selectedFeatureInfo
            _this.selectedFeatureInfo = null;
            // layerFeatureIndex
            _this.layerFeatureIndex = null;
            // attachmentIndex
            _this.attachmentIndex = null;
            // defaultObjectId
            _this.defaultObjectId = null;
            // socialSharingEnabled
            _this.socialSharingEnabled = null;
            // onboardingContent
            _this.onboardingContent = null;
            // layerFeatures
            _this.layerFeatures = null;
            // imageIsLoaded
            _this.imageIsLoaded = null;
            // attachmentLayer
            _this.attachmentLayer = null;
            // order
            _this.order = null;
            // featureLayer
            _this.featureLayer = null;
            // zoomLevel
            _this.zoomLevel = null;
            // selectedFeatureAddress
            _this.selectedFeatureAddress = null;
            // onboardingImage
            _this.onboardingImage = null;
            // onboardingButtonText
            _this.onboardingButtonText = null;
            // docDirection
            _this.docDirection = null;
            // addressEnabled
            _this.addressEnabled = null;
            // currentImageUrl
            _this.currentImageUrl = null;
            // viewModel
            _this.viewModel = null;
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
                watchUtils.whenOnce(this, "view", function () {
                    if (localStorage.getItem("firstTimeUseApp")) {
                        _this._onboardingPanelIsOpen = false;
                    }
                    else {
                        _this._onboardingPanelIsOpen = true;
                        localStorage.setItem("firstTimeUseApp", "" + Date.now());
                    }
                    _this.scheduleRender();
                }),
                watchUtils.when(this, "featureLayer", function () {
                    if (!_this.featureLayer.get("capabilities.data.supportsAttachment")) {
                        _this._layerDoesNotSupportAttachments = true;
                        _this.scheduleRender();
                    }
                }),
                watchUtils.watch(this, ["selectedFeatureAttachments", "attachmentIndex"], function () {
                    _this._previousImageUrl = _this.currentImageUrl;
                    var _a = _this, selectedFeatureAttachments = _a.selectedFeatureAttachments, attachmentIndex = _a.attachmentIndex;
                    var attachments = selectedFeatureAttachments &&
                        selectedFeatureAttachments.attachments &&
                        selectedFeatureAttachments.attachments[attachmentIndex];
                    _this.currentImageUrl = attachments ? attachments.url : null;
                    _this.scheduleRender();
                }),
                watchUtils.when(this, "selectedFeatureAttachments", function () {
                    if (_this._previousImageUrl !== _this.currentImageUrl &&
                        _this.defaultObjectId === null) {
                        _this.set("attachmentIndex", 0);
                        _this.selectedFeatureAttachments.currentIndex = 0;
                        _this.scheduleRender();
                        return;
                    }
                    _this.defaultObjectId = null;
                }),
                watchUtils.watch(this, "viewModel.objectIdIndex", function () {
                    if (_this._featureContentPanel) {
                        _this._featureContentPanel.scrollTop = 0;
                    }
                })
            ]);
        };
        PhotoCentric.prototype.render = function () {
            var header = this._renderHeader();
            var homePage = this._renderHomePage();
            var onboarding = this._renderOnboarding();
            return (widget_1.tsx("div", { class: CSS.base },
                !this._imageCarouselIsOpen ? header : null,
                this._onboardingPanelIsOpen && document.body.clientWidth < 813 ? (widget_1.tsx("div", { key: buildKey("onboarding-node"), class: CSS.onboarding }, onboarding)) : null,
                homePage));
        };
        PhotoCentric.prototype.destroy = function () {
            this._onboardingPanelIsOpen = null;
            this._mapAndSearchIsExpanded = null;
            this._imageCarouselIsOpen = null;
        };
        //----------------------------------
        //
        //  START OF RENDER NODE METHODS
        //
        //----------------------------------
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
        // _renderHomePage
        PhotoCentric.prototype._renderHomePage = function () {
            var onboarding = this._renderOnboarding();
            var content = this._renderContent();
            var imageViewerDesktop = this._renderImageViewerDesktop();
            return (widget_1.tsx("div", { key: buildKey("main-page"), class: CSS.mainPageContainer },
                widget_1.tsx("div", { class: CSS.mainPage },
                    this._onboardingPanelIsOpen && document.body.clientWidth > 813 ? (widget_1.tsx("div", { class: CSS.onboardingOverlay }, onboarding)) : null,
                    content),
                imageViewerDesktop));
        };
        // _renderImageContainer
        PhotoCentric.prototype._renderImageContainer = function () {
            var _a, _b;
            var attachmentCount = this._onboardingPanelIsOpen
                ? this.onboardingImage
                    ? null
                    : this._renderAttachmentCount()
                : this._renderAttachmentCount();
            var selectedFeatureAttachments = this.selectedFeatureAttachments;
            var downloadEnabled = (_a = {},
                _a[CSS.downloadEnabled] = !this.viewModel.downloadEnabled,
                _a);
            var attachments = selectedFeatureAttachments && selectedFeatureAttachments.attachments;
            var attachment = attachments && attachments.length > 0
                ? attachments[this.attachmentIndex]
                : null;
            var name = attachment ? attachment.name : null;
            var imageStyles = attachment && attachment.orientationInfo && this._photoViewerContainer
                ? imageUtils_1.getOrientationStyles(attachment.orientationInfo, this._photoViewerContainer)
                : {
                    transform: "none",
                    maxHeight: "100%",
                    height: "initial",
                    width: "initial"
                };
            var fadeImage = (_b = {},
                _b[CSS.fadeImage] = !this.imageIsLoaded,
                _b);
            return (widget_1.tsx("div", { class: this.classes(CSS.rightPanel) }, this._layerDoesNotSupportAttachments ? (widget_1.tsx("div", { class: CSS.layerNotSupported }, i18n.notSupported)) : (widget_1.tsx("div", { bind: this, afterCreate: widget_1.storeNode, "data-node-ref": "_photoViewerContainer", key: buildKey("image-container"), class: this.classes(downloadEnabled, CSS.photoViewer) },
                !this.imageIsLoaded &&
                    attachment &&
                    attachment.contentType &&
                    attachment.contentType.indexOf("video") === -1 &&
                    attachments ? (widget_1.tsx("div", { class: CSS.widgetLoader, key: buildKey("base-loader") },
                    widget_1.tsx("span", { class: CSS.animationLoader }))) : null,
                attachments && attachments.length === 0 ? (this.onboardingImage && this._onboardingPanelIsOpen ? null : (widget_1.tsx("div", { key: buildKey("no-attachments-container"), class: CSS.noAttachmentsContainer },
                    widget_1.tsx("svg", { class: CSS.svg.media, xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 16 16" },
                        widget_1.tsx("path", { d: "M1 2v12h14V2zm13 11H2V3h12zm-1-1H3v-1h10zM3 8.678l.333-.356a.3.3 0 0 1 .445 0 .3.3 0 0 0 .444 0l2.242-2.39a.3.3 0 0 1 .423-.021l2.255 2.005a.299.299 0 0 0 .39.01l1.361-.915a.3.3 0 0 1 .41.032L13 8.678V10H3zM11.894 9l-.89-.859-.846.565a1.299 1.299 0 0 1-1.68-.043L6.732 7.11 4.958 9zm-.644-4.5a.75.75 0 1 1-.75-.75.75.75 0 0 1 .75.75z" })),
                    widget_1.tsx("span", { class: CSS.noAttachmentsText }, i18n.noPhotoAttachmentsFound)))) : null,
                widget_1.tsx("div", { class: CSS.imageContainer }, attachment &&
                    attachment.contentType &&
                    attachment.contentType.indexOf("video") !== -1 ? (widget_1.tsx("video", { bind: this, afterCreate: this._removeImageLoader, class: CSS.videoContainer, controls: true },
                    widget_1.tsx("source", { src: attachment.url, type: "video/mp4" }),
                    widget_1.tsx("source", { src: attachment.url, type: "video/quicktime" }),
                    widget_1.tsx("source", { src: attachment.url, type: "video/ogg" }),
                    widget_1.tsx("source", { src: attachment.url, type: "video/mov" }),
                    i18n.doesNotSupportVideo)) : this._onboardingPanelIsOpen && this.onboardingImage ? (widget_1.tsx("img", { styles: imageStyles, src: this.onboardingImage, alt: name })) : (widget_1.tsx("img", { class: this.classes(CSS.imageDesktop, fadeImage), styles: imageStyles, bind: this, src: this.currentImageUrl, onload: this._removeImageLoader, alt: name }))),
                attachmentCount))));
        };
        // _renderImageViewerDesktop
        PhotoCentric.prototype._renderImageViewerDesktop = function () {
            var imageContainer = this._renderImageContainer();
            return widget_1.tsx("div", { class: CSS.imageViewerDesktop }, imageContainer);
        };
        // _renderAttachmentCount
        PhotoCentric.prototype._renderAttachmentCount = function () {
            var currentIndex = this.attachmentIndex + 1;
            var totalNumberOfAttachments = this.viewModel.getTotalNumberOfAttachments();
            var selectedFeatureAttachments = this.selectedFeatureAttachments;
            var attachments = selectedFeatureAttachments && selectedFeatureAttachments.attachments;
            var attachment = attachments && attachments.length > 0
                ? attachments[this.attachmentIndex]
                : null;
            var hasMoreThanOneAttachment = selectedFeatureAttachments &&
                selectedFeatureAttachments.attachments &&
                selectedFeatureAttachments.attachments.length > 1;
            return (widget_1.tsx("div", { key: buildKey("attachment-count"), class: CSS.attachmentNumber },
                this.selectedFeatureAttachments &&
                    this.selectedFeatureAttachments.attachments &&
                    this.selectedFeatureAttachments.attachments.length > 0 ? (widget_1.tsx("div", { key: buildKey("download-attachment"), class: CSS.downloadIconTextContainer },
                    widget_1.tsx("button", { bind: this, onclick: this._previousImage, onkeydown: this._previousImage, disabled: hasMoreThanOneAttachment &&
                            this.imageIsLoaded &&
                            !this._onboardingPanelIsOpen
                            ? false
                            : true, tabIndex: 0, class: CSS.leftArrowContainer, title: i18n.previousImage }, this.docDirection === "rtl" ? (widget_1.tsx("span", { class: this.classes(CSS.calcite.rightArrow, CSS.calcite.flush) })) : (widget_1.tsx("span", { class: this.classes(CSS.calcite.leftArrow, CSS.calcite.flush) }))),
                    widget_1.tsx("span", { class: CSS.attachmentNumberText }, currentIndex + " " + i18n.of + " " + totalNumberOfAttachments + " " + i18n.attachments),
                    widget_1.tsx("button", { bind: this, onclick: this._nextImage, onkeydown: this._nextImage, disabled: hasMoreThanOneAttachment &&
                            this.imageIsLoaded &&
                            !this._onboardingPanelIsOpen
                            ? false
                            : true, tabIndex: 0, class: CSS.rightArrowContainer, title: i18n.nextImage }, this.docDirection === "rtl" ? (widget_1.tsx("span", { class: this.classes(CSS.calcite.leftArrow, CSS.calcite.flush) })) : (widget_1.tsx("span", { class: this.classes(CSS.calcite.rightArrow, CSS.calcite.flush) }))))) : null,
                attachment &&
                    attachment.contentType &&
                    attachment.contentType.indexOf("video") === -1 &&
                    this.viewModel.downloadEnabled ? (this.viewModel.state === "downloading" ? (widget_1.tsx("div", { class: CSS.downloadIconContainer },
                    widget_1.tsx("span", { class: this.classes(CSS.calcite.loadingIcon, CSS.calcite.rotating, CSS.spinner) }))) : (widget_1.tsx("button", { class: this.classes(CSS.downloadIconContainer, CSS.downloadButtonDesktop), bind: this, onclick: this._downloadImage, onkeydown: this._downloadImage, "data-image-url": attachment.url, "data-image-name": attachment.name, title: i18n.download, disabled: this.imageIsLoaded ? false : true },
                    widget_1.tsx("span", { class: this.classes(CSS.calcite.downloadIcon, CSS.calcite.flush, CSS.downloadIcon) })))) : null));
        };
        // _renderHeader
        PhotoCentric.prototype._renderHeader = function () {
            var title = document.body.clientWidth < 813 && this.title.length > 40
                ? this.title
                    .split("")
                    .slice(0, 35)
                    .join("") + "..."
                : this.title;
            var shareWidget = this.shareLocationWidget &&
                this.layerFeatures &&
                this.layerFeatures.length &&
                document.body.clientWidth > 813
                ? this._renderShareLocationWidget()
                : null;
            return (widget_1.tsx("div", { class: CSS.header },
                widget_1.tsx("div", { class: CSS.headerContainer },
                    widget_1.tsx("div", { class: CSS.titleInfoContainer },
                        widget_1.tsx("h1", { class: CSS.headerText }, title),
                        widget_1.tsx("span", { bind: this, onclick: this._toggleOnboardingPanel, onkeydown: this._toggleOnboardingPanel, tabIndex: 0, class: this.classes(CSS.infoButton, CSS.calcite.descriptionIcon, CSS.calcite.flush), title: i18n.viewDetails }))),
                widget_1.tsx("div", { class: CSS.shareWidgetContainer }, shareWidget)));
        };
        // _renderShareWidget
        PhotoCentric.prototype._renderShareLocationWidget = function () {
            return (widget_1.tsx("div", { class: CSS.shareLocationWidget, bind: this.shareLocationWidget.container, afterCreate: utils_1.attachToNode }));
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
            return (widget_1.tsx("div", { bind: this.view.container, afterCreate: utils_1.attachToNode, class: this.classes(CSS.mapView) }));
        };
        // _renderPagination
        PhotoCentric.prototype._renderPagination = function () {
            var featureTotal = this.viewModel.featureTotal;
            var currentlayerFeatureIndex = this.viewModel.objectIdIndex + 1;
            return (widget_1.tsx("div", { key: buildKey("feature-pagination"), class: CSS.paginationContainer },
                widget_1.tsx("button", { bind: this, onclick: this.docDirection === "rtl"
                        ? this._nextFeature
                        : this._previousFeature, onkeydown: this.docDirection === "rtl"
                        ? this._nextFeature
                        : this._previousFeature, tabIndex: 0, class: CSS.leftArrowContainer, disabled: this._onboardingPanelIsOpen ? true : false, title: this.docDirection === "rtl"
                        ? i18n.nextLocation
                        : i18n.previousLocation },
                    widget_1.tsx("span", { class: this.classes(CSS.calcite.leftArrow, CSS.calcite.flush) })),
                featureTotal ? (widget_1.tsx("div", { class: CSS.paginationTextContainer }, currentlayerFeatureIndex + " " + i18n.of + " " + featureTotal + " " + i18n.locations)) : null,
                widget_1.tsx("button", { bind: this, onclick: this.docDirection === "rtl"
                        ? this._previousFeature
                        : this._nextFeature, onkeydown: this.docDirection === "rtl"
                        ? this._previousFeature
                        : this._nextFeature, tabIndex: 0, class: CSS.rightArrowContainer, disabled: this._onboardingPanelIsOpen ? true : false, title: this.docDirection === "rtl"
                        ? i18n.previousLocation
                        : i18n.nextLocation },
                    widget_1.tsx("span", { class: this.classes(CSS.calcite.rightArrow, CSS.calcite.flush) }))));
        };
        // _renderExpandCollapse
        PhotoCentric.prototype._renderExpandCollapse = function () {
            return (widget_1.tsx("div", { bind: this, onclick: this._toggleExpand, onkeydown: this._toggleExpand, tabIndex: 0, class: CSS.expandCollapseContainer },
                widget_1.tsx("span", { class: this.classes(this._mapAndSearchIsExpanded
                        ? CSS.calcite.upArrow
                        : CSS.calcite.downArrow, CSS.calcite.flush) })));
        };
        // _renderAttachmentsContainer
        PhotoCentric.prototype._renderAttachmentsContainer = function () {
            var featureContentInfo = this.selectedFeatureInfo
                ? this._renderFeatureContentInfos()
                : null;
            var selectedFeatureAttachments = this.selectedFeatureAttachments;
            var attachmentsMobile = selectedFeatureAttachments &&
                selectedFeatureAttachments.attachments &&
                document.body.clientWidth < 813
                ? this._renderAttachmentsMobile(selectedFeatureAttachments.attachments)
                : null;
            var zoomTo = this.layerFeatures && this.layerFeatures.length
                ? this._renderZoomTo()
                : null;
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
            var otherAttachmentTypes = this.viewModel.unsupportedAttachmentTypes &&
                this.viewModel.unsupportedAttachmentTypes.length > 0
                ? this._renderOtherAttachmentTypes()
                : null;
            return (widget_1.tsx("div", { bind: this, afterCreate: widget_1.storeNode, "data-node-ref": "_featureContentPanel", class: CSS.featureContent },
                widget_1.tsx("div", { class: CSS.featureContentTitle },
                    widget_1.tsx("h2", { class: CSS.featureLayerTitle }, this.featureLayerTitle),
                    zoomTo),
                widget_1.tsx("h6", { class: CSS.addressText }, this.selectedFeatureAddress),
                widget_1.tsx("div", { class: CSS.attachmentsImageContainer }, attachmentsMobile),
                fieldsInfoText && fieldsInfoText.length > 0 ? (widget_1.tsx("div", { key: buildKey("feture-widget-content"), class: CSS.featureInfoContent }, featureWidget && featureWidget.render())) : fieldsInfoContent && fieldsInfoContent.length > 0 ? (widget_1.tsx("div", { key: buildKey("feature-info-content"), class: CSS.featureInfoContent }, featureContentInfo)) : this._featureContentAvailable ? (widget_1.tsx("div", { key: buildKey("feature-content-loader"), class: CSS.widgetLoader }, i18n.loadingImages)) : (widget_1.tsx("div", { key: buildKey("no-content"), class: CSS.noInfo }, i18n.noInfo)),
                this.viewModel.unsupportedAttachmentTypes &&
                    this.viewModel.unsupportedAttachmentTypes.length > 0 ? (widget_1.tsx("div", { key: buildKey("other-attachment-types") },
                    widget_1.tsx("h4", { class: CSS.attributeHeading }, i18n.otherAttachments),
                    otherAttachmentTypes)) : null));
        };
        // _renderFeatureContentInfos
        PhotoCentric.prototype._renderFeatureContentInfos = function () {
            var _this = this;
            var selectedFeatureInfo = this.viewModel.selectedFeatureInfo;
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
            return (widget_1.tsx("div", { class: CSS.featureContentInfo },
                widget_1.tsx("h4", { class: CSS.attributeHeading }, contentInfo.attribute),
                contentInfo && contentInfo.content && contentCheck ? (hyperlink ? (widget_1.tsx("p", null,
                    contentInfo.content.replace(hyperlink, ""),
                    widget_1.tsx("a", { class: CSS.contentLink, href: hyperlink, target: "_blank" }, hyperlink))) : (widget_1.tsx("p", { class: CSS.attributeContent }, contentInfo.content))) : (widget_1.tsx("p", null, i18n.noContentAvailable))));
        };
        // _renderOtherAttachmentTypes
        PhotoCentric.prototype._renderOtherAttachmentTypes = function () {
            var _this = this;
            var otherAttachmentTypes = this.viewModel.unsupportedAttachmentTypes.map(function (attachment) {
                return _this._renderOtherAttachmentType(attachment);
            });
            return widget_1.tsx("ul", { class: CSS.otherAttachmentsList }, otherAttachmentTypes);
        };
        // _renderOtherAttachmentType
        PhotoCentric.prototype._renderOtherAttachmentType = function (attachment) {
            return (widget_1.tsx("li", null,
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
            var featureContentInfos = selectedFeatureAttachments.map(function (attachment) {
                return _this._renderAttachmentMobile(attachment);
            });
            var attachmentCount = selectedFeatureAttachments && selectedFeatureAttachments.length > 0
                ? selectedFeatureAttachments.length
                : null;
            return (widget_1.tsx("div", { class: CSS.mobileFeatureContent },
                attachmentCount ? (widget_1.tsx("div", { class: CSS.mobileAttachmentCount },
                    widget_1.tsx("span", { class: CSS.mobileAttachmentText }, i18n.upperCaseAttachments),
                    widget_1.tsx("div", { class: CSS.attachmentCountNumber }, selectedFeatureAttachments.length),
                    !this.imageIsLoaded ? (widget_1.tsx("div", { class: CSS.widgetLoader, key: buildKey("base-loader") },
                        widget_1.tsx("span", { class: CSS.animationLoader }))) : null)) : null,
                this.imageIsLoaded ? featureContentInfos : null));
        };
        // _renderAttachmentMobile
        PhotoCentric.prototype._renderAttachmentMobile = function (attachment) {
            var _a, _b, _c, _d;
            var url = attachment.url, name = attachment.name;
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
            var addPadding = (_a = {},
                _a[CSS.mobileAttachmentsAddPadding] = attachment &&
                    attachment.orientationInfo &&
                    attachment.orientationInfo.rotation !== 0,
                _a);
            var removeBorderRadius = (_b = {},
                _b[CSS.removeBorderRadius] = attachment &&
                    attachment.orientationInfo &&
                    attachment.orientationInfo.rotation !== 0,
                _b);
            var removeOpacity = (_c = {},
                _c[CSS.removeOpacity] = this.imageIsLoaded,
                _c);
            var transparentBackground = (_d = {},
                _d[CSS.transparentBackground] = !this.imageIsLoaded,
                _d);
            return (widget_1.tsx("div", { bind: this, styles: { height: imageAttachmentHeight }, afterCreate: widget_1.storeNode, afterUpdate: widget_1.storeNode, "data-node-ref": "_mobileAttachment", class: this.classes(CSS.mobileAttachment, addPadding, transparentBackground) },
                widget_1.tsx("div", { class: CSS.mobileAttachmentContainer }, attachment &&
                    attachment.contentType &&
                    attachment.contentType.indexOf("video") !== -1 ? (widget_1.tsx("video", { class: CSS.videoContainer, controls: true },
                    widget_1.tsx("source", { src: attachment.url, type: "video/mp4" }),
                    widget_1.tsx("source", { src: attachment.url, type: "video/ogg" }),
                    widget_1.tsx("source", { src: attachment.url, type: "video/mov" }),
                    i18n.doesNotSupportVideo)) : (widget_1.tsx("img", { class: this.classes(CSS.imageMobile, removeBorderRadius, removeOpacity), styles: imageStyles, src: url, alt: name }))),
                attachment &&
                    attachment.contentType &&
                    attachment.contentType.indexOf("video") === -1 &&
                    this.viewModel.downloadEnabled &&
                    this.imageIsLoaded ? (widget_1.tsx("button", { bind: this, "data-image-url": url, "data-image-name": name, disabled: this.imageIsLoaded ? false : true, onclick: this._downloadImage, onkeydown: this._downloadImage, class: CSS.downloadIconContainer },
                    widget_1.tsx("span", { class: this.classes(CSS.calcite.downloadIcon, CSS.calcite.flush, CSS.downloadIcon) }))) : null));
        };
        //----------------------------------
        //
        //  END OF RENDER NODE METHODS
        //
        //----------------------------------
        // _removeImageLoader
        PhotoCentric.prototype._removeImageLoader = function () {
            if (this.currentImageUrl !== this._previousImageUrl) {
                this.imageIsLoaded = true;
                this.scheduleRender();
            }
        };
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
            this.imageIsLoaded = false;
            this.scheduleRender();
        };
        // _previousImage
        PhotoCentric.prototype._previousImage = function () {
            this.viewModel.previousImage();
            this.imageIsLoaded = false;
            this.scheduleRender();
        };
        // _previousFeature
        PhotoCentric.prototype._previousFeature = function () {
            if (this.viewModel.state === "querying") {
                return;
            }
            this.viewModel.previousFeature();
            if (this.featureLayer.get("capabilities.data.supportsAttachment")) {
                this.imageIsLoaded = false;
            }
            this.scheduleRender();
        };
        // _nextFeature
        PhotoCentric.prototype._nextFeature = function () {
            if (this.viewModel.state === "querying") {
                return;
            }
            this.viewModel.nextFeature();
            if (this.featureLayer.get("capabilities.data.supportsAttachment")) {
                this.imageIsLoaded = false;
            }
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
        // _getHyperLink
        PhotoCentric.prototype._getHyperLink = function (contentInfo) {
            var expression = /(http|ftp|https)(:\/\/)([\w_-]+(?:(?:\.[\w_-]+)+))([\w.,@?^=%&:/~+#-]*[\w@?^=%&/~+#-])?/;
            var regex = new RegExp(expression);
            var content = contentInfo && contentInfo.content;
            return content && content.match(regex) && content.match(regex).length > 0
                ? content.match(regex)[0]
                : null;
        };
        __decorate([
            decorators_1.aliasOf("viewModel.view"),
            decorators_1.property()
        ], PhotoCentric.prototype, "view", void 0);
        __decorate([
            decorators_1.aliasOf("viewModel.title"),
            decorators_1.property()
        ], PhotoCentric.prototype, "title", void 0);
        __decorate([
            decorators_1.aliasOf("viewModel.shareLocationWidget"),
            decorators_1.property()
        ], PhotoCentric.prototype, "shareLocationWidget", void 0);
        __decorate([
            decorators_1.aliasOf("viewModel.selectedFeatureAttachments"),
            decorators_1.property(),
            widget_1.renderable()
        ], PhotoCentric.prototype, "selectedFeatureAttachments", void 0);
        __decorate([
            decorators_1.aliasOf("viewModel.featureLayerTitle"),
            decorators_1.property()
        ], PhotoCentric.prototype, "featureLayerTitle", void 0);
        __decorate([
            decorators_1.aliasOf("viewModel.selectedFeatureInfo"),
            decorators_1.property(),
            widget_1.renderable()
        ], PhotoCentric.prototype, "selectedFeatureInfo", void 0);
        __decorate([
            decorators_1.aliasOf("viewModel.layerFeatureIndex"),
            decorators_1.property(),
            widget_1.renderable()
        ], PhotoCentric.prototype, "layerFeatureIndex", void 0);
        __decorate([
            decorators_1.aliasOf("viewModel.attachmentIndex"),
            decorators_1.property(),
            widget_1.renderable()
        ], PhotoCentric.prototype, "attachmentIndex", void 0);
        __decorate([
            decorators_1.aliasOf("viewModel.defaultObjectId"),
            decorators_1.property()
        ], PhotoCentric.prototype, "defaultObjectId", void 0);
        __decorate([
            decorators_1.aliasOf("viewModel.socialSharingEnabled"),
            decorators_1.property()
        ], PhotoCentric.prototype, "socialSharingEnabled", void 0);
        __decorate([
            decorators_1.property()
        ], PhotoCentric.prototype, "onboardingContent", void 0);
        __decorate([
            decorators_1.aliasOf("viewModel.layerFeatures"),
            decorators_1.property(),
            widget_1.renderable()
        ], PhotoCentric.prototype, "layerFeatures", void 0);
        __decorate([
            decorators_1.aliasOf("viewModel.imageIsLoaded"),
            decorators_1.property()
        ], PhotoCentric.prototype, "imageIsLoaded", void 0);
        __decorate([
            decorators_1.aliasOf("viewModel.attachmentLayer"),
            decorators_1.property()
        ], PhotoCentric.prototype, "attachmentLayer", void 0);
        __decorate([
            decorators_1.aliasOf("viewModel.order"),
            decorators_1.property()
        ], PhotoCentric.prototype, "order", void 0);
        __decorate([
            decorators_1.aliasOf("viewModel.featureLayer"),
            decorators_1.property()
        ], PhotoCentric.prototype, "featureLayer", void 0);
        __decorate([
            decorators_1.aliasOf("viewModel.zoomLevel"),
            decorators_1.property()
        ], PhotoCentric.prototype, "zoomLevel", void 0);
        __decorate([
            decorators_1.aliasOf("viewModel.selectedFeatureAddress"),
            decorators_1.property(),
            widget_1.renderable()
        ], PhotoCentric.prototype, "selectedFeatureAddress", void 0);
        __decorate([
            decorators_1.property(),
            widget_1.renderable()
        ], PhotoCentric.prototype, "onboardingImage", void 0);
        __decorate([
            decorators_1.property(),
            widget_1.renderable()
        ], PhotoCentric.prototype, "onboardingButtonText", void 0);
        __decorate([
            decorators_1.property()
        ], PhotoCentric.prototype, "docDirection", void 0);
        __decorate([
            decorators_1.property()
        ], PhotoCentric.prototype, "addressEnabled", void 0);
        __decorate([
            decorators_1.property(),
            widget_1.renderable()
        ], PhotoCentric.prototype, "currentImageUrl", void 0);
        __decorate([
            widget_1.renderable(["viewModel.state"]),
            decorators_1.property({
                type: AttachmentViewerViewModel
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