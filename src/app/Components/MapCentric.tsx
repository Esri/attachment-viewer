/// <amd-dependency path="esri/core/tsSupport/declareExtendsHelper" name="__extends" />
/// <amd-dependency path="esri/core/tsSupport/decorateHelper" name="__decorate" />

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

// esri.core
import {
  subclass,
  declared,
  property,
  aliasOf
} from "esri/core/accessorSupport/decorators";
import watchUtils = require("esri/core/watchUtils");

//esri.widgets
import {
  accessibleHandler,
  renderable,
  tsx,
  storeNode
} from "esri/widgets/support/widget";
import Widget = require("esri/widgets/Widget");

// nls
import * as i18n from "dojo/i18n!./MapCentric/nls/resources";
import * as i18nCommon from "dojo/i18n!../nls/common";

// utils
import { autoLink } from "./utils/urlUtils";
import { attachToNode } from "./utils/utils";
import {
  getOrientationStyles,
  getOrientationStylesImageThumbnail
} from "./utils/imageUtils";

// AppData
import MapCentricData = require("./MapCentric/MapCentricData");
import AttachmentViewerData = require("./AttachmentViewer/AttachmentViewerData");

// MapCentricViewModel
import MapCentricViewModel = require("./MapCentric/MapCentricViewModel");

// Share
import Share = require("./Share");

// LayerSwitcher
import LayerSwitcher = require("./LayerSwitcher");

// ImageViewer
import ImageViewer = require("ImageViewer");

// interfaces
import { VNode, NavItem, AttachmentData } from "../interfaces/interfaces";

//----------------------------------
//
//  CSS Classes
//
//----------------------------------

const CSS = {
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
  onboardingTrayContentContainer:
    "esri-map-centric__onboarding-tray-content-container",
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
  featureContentGalleryContainer:
    "esri-map-centric__gallery-feature-content-container",
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
  animationLoader:
    "esri-widget__loader-animation esri-map-centric__loader-animation",
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
  featureContentPanelContainer:
    "esri-map-centric__feature-content-panel-container",
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
  featureContentPanelLayerSwitcher:
    "esri-map-centric--feature-content-panel-layer-switcher",
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

const WIDGET_KEY_PARTIAL = "esri-map-centric";

function buildKey(element: string, index?: number): string {
  if (index === undefined) {
    return `${WIDGET_KEY_PARTIAL}__${element}`;
  }
}

@subclass("MapCentric")
class MapCentric extends declared(Widget) {
  constructor(value?: any) {
    super();
  }
  //----------------------------------
  //
  //  Private Variables
  //
  //----------------------------------
  private _currentMobileScreen: string = "media";
  private _expandAttachmentNode: HTMLElement = null;
  private _featureContentAvailable: boolean = null;
  private _fullAttachmentContainerIsOpen = false;
  private _fullScreenCloseNode: HTMLElement = null;
  private _imageViewer: any = null;
  private _imageViewerSet = false;
  private _imageZoomLoaded: boolean = null;
  private _layerDoesNotSupportAttachments = false;
  private _mediaViewerContainer: HTMLElement = null;
  private _mediaViewerContainerFullAttachment: HTMLElement = null;
  private _onboardingPanelIsOpen: boolean = null;
  private _triggerScrollElement: HTMLElement = null;
  private _zoomSliderNode: HTMLInputElement = null;

  //----------------------------------
  //
  //  Properties
  //
  //----------------------------------

  // addressEnabled
  @aliasOf("viewModel.addressEnabled")
  @property()
  addressEnabled: string = null;

  // appMode
  @aliasOf("viewModel.appMode")
  @renderable()
  @property()
  appMode: string = null;

  // attachmentIndex
  @aliasOf("viewModel.attachmentIndex")
  @property()
  attachmentIndex: number = null;

  // attachmentLayer
  @aliasOf("viewModel.attachmentLayer")
  @property()
  attachmentLayer: any = null;

  // attachmentLayers
  @aliasOf("viewModel.attachmentLayers")
  @property()
  attachmentLayers: string = null;

  // attachmentViewerDataCollection
  @aliasOf("viewModel.attachmentViewerDataCollection")
  @property()
  attachmentViewerDataCollection: __esri.Collection<
    AttachmentViewerData
  > = null;

  // currentImageUrl
  @aliasOf("viewModel.currentImageUrl")
  @property()
  currentImageUrl: string = null;

  // defaultObjectId
  @aliasOf("viewModel.defaultObjectId")
  @property()
  defaultObjectId: number = null;

  // downloadEnabled
  @aliasOf("viewModel.downloadEnabled")
  @property()
  downloadEnabled: boolean = null;

  // docDirection
  @property()
  docDirection: string = null;

  // featureContentPanelIsOpen
  @aliasOf("viewModel.featureContentPanelIsOpen")
  @renderable()
  @property()
  featureContentPanelIsOpen: boolean = null;

  // graphicsLayer
  @aliasOf("viewModel.graphicsLayer")
  @property()
  graphicsLayer: __esri.GraphicsLayer = null;

  // imageDirectionEnabled
  @aliasOf("viewModel.imageDirectionEnabled")
  @renderable()
  @property()
  imageDirectionEnabled: boolean = null;

  // imageIsLoaded
  @aliasOf("viewModel.imageIsLoaded")
  @property()
  imageIsLoaded: boolean = null;

  // imagePanZoomEnabled
  @property()
  imagePanZoomEnabled: boolean = null;

  // layerSwitcher
  @aliasOf("viewModel.layerSwitcher")
  @property()
  layerSwitcher: LayerSwitcher = null;

  // mapCentricSketchQueryExtent
  @aliasOf("viewModel.mapCentricSketchQueryExtent")
  @property()
  mapCentricSketchQueryExtent: __esri.Extent = null;

  // mapCentricTooltipEnabled
  @aliasOf("viewModel.mapCentricTooltipEnabled")
  @property()
  mapCentricTooltipEnabled: boolean = null;

  // onboardingButtonText
  @property()
  onboardingButtonText: string = null;

  // onboardingContent
  @property()
  onboardingContent: any = null;

  // onlyDisplayFeaturesWithAttachmentsIsEnabled
  @aliasOf("viewModel.onlyDisplayFeaturesWithAttachmentsIsEnabled")
  @property()
  onlyDisplayFeaturesWithAttachmentsIsEnabled: boolean = null;

  // order
  @aliasOf("viewModel.order")
  @property()
  order: string = null;

  // searchWidget
  @aliasOf("viewModel.searchWidget")
  @property()
  searchWidget: __esri.Search = null;

  // selectFeaturesEnabled
  @aliasOf("viewModel.selectFeaturesEnabled")
  @property()
  selectFeaturesEnabled: boolean = null;

  // selectedAttachmentViewerData
  @aliasOf("viewModel.selectedAttachmentViewerData")
  @renderable()
  @property()
  selectedAttachmentViewerData: MapCentricData = null;

  // selectedLayerId
  @aliasOf("viewModel.selectedLayerId")
  @property()
  selectedLayerId: string = null;

  // shareLocationWidget
  @aliasOf("viewModel.shareLocationWidget")
  @property()
  shareLocationWidget: Share = null;

  // sketchWidget
  @aliasOf("viewModel.sketchWidget")
  @property()
  sketchWidget: __esri.Sketch = null;

  // socialSharingEnabled
  @aliasOf("viewModel.socialSharingEnabled")
  @property()
  socialSharingEnabled: boolean = null;

  // supportedAttachmentTypes
  @aliasOf("viewModel.supportedAttachmentTypes")
  @property()
  supportedAttachmentTypes: string[] = null;

  // title
  @aliasOf("viewModel.title")
  @property()
  title: string = null;

  // view
  @aliasOf("viewModel.view")
  @property()
  view: __esri.MapView = null;

  // viewModel
  @renderable(["viewModel.state", "viewModel.mapCentricState"])
  @property({
    type: MapCentricViewModel
  })
  viewModel: MapCentricViewModel = new MapCentricViewModel();

  // zoomLevel
  @aliasOf("viewModel.zoomLevel")
  @property()
  zoomLevel: string = null;

  postInitialize() {
    this.own([
      this._handleOnboarding(),
      this._handleAttachmentUrl(),
      this._galleryScrollTopOnFeatureRemoval(),
      this._watchAttachmentData(),
      this._scrollGalleryToTopOnAttachmentRemoval(),
      this._watchSelectedFeature()
    ]);
    if (this.addressEnabled) {
      this.own([this._watchSelectedFeatureAddress()]);
    }
  }

  // _handleOnboarding
  private _handleOnboarding(): __esri.WatchHandle {
    return watchUtils.whenOnce(this, "view", () => {
      if (localStorage.getItem("firstTimeUseApp")) {
        this._onboardingPanelIsOpen = false;
      } else {
        this._onboardingPanelIsOpen = true;
        localStorage.setItem("firstTimeUseApp", `${Date.now()}`);
      }
      this.scheduleRender();
    });
  }

  // _handleAttachmentUrl
  private _handleAttachmentUrl(): __esri.WatchHandle {
    return watchUtils.watch(
      this,
      [
        "selectedAttachmentViewerData.selectedFeatureAttachments.attachments",
        "selectedAttachmentViewerData.attachmentIndex"
      ],
      () => {
        if (!this.selectedAttachmentViewerData) {
          return;
        }
        const attachment = this.viewModel.getCurrentAttachment();
        const attachmentUrl = attachment && (attachment.get("url") as string);
        this.currentImageUrl = this.viewModel.updateAttachmentUrlToHTTPS(
          attachmentUrl
        );
        this.scheduleRender();
      }
    );
  }

  // _galleryScrollTopOnFeatureRemoval
  private _galleryScrollTopOnFeatureRemoval(): __esri.WatchHandle {
    return watchUtils.watch(this, "layerSwitcher.selectedLayer", () => {
      this._scrollGalleryToTop();
    });
  }

  // _watchAttachmentData
  private _watchAttachmentData(): __esri.WatchHandle {
    return watchUtils.on(
      this,
      ["selectedAttachmentViewerData.attachmentDataCollection"],
      "after-changes",
      () => {
        this.scheduleRender();
      }
    );
  }

  // _scrollGalleryToTopOnAttachmentRemoval
  private _scrollGalleryToTopOnAttachmentRemoval(): __esri.WatchHandle {
    return watchUtils.on(
      this,
      "selectedAttachmentViewerData.attachmentDataCollection",
      "after-remove",
      () => {
        this._scrollGalleryToTop();
      }
    );
  }

  // _scrollGalleryToTop
  private _scrollGalleryToTop(): void {
    const isIE =
      navigator.userAgent.indexOf("MSIE") !== -1 ||
      navigator.userAgent.indexOf("Edge") !== -1 ||
      navigator.appVersion.indexOf("Trident/") > -1;
    if (this._triggerScrollElement && !isIE) {
      this._triggerScrollElement.scrollTo({
        top: 0
      });
    }
  }

  // _watchSelectedFeature
  private _watchSelectedFeature(): __esri.WatchHandle {
    return watchUtils.watch(
      this,
      "selectedAttachmentViewerData.selectedFeature",
      () => {
        this.scheduleRender();
      }
    );
  }

  // _watchSelectedFeatureAddress
  private _watchSelectedFeatureAddress(): __esri.WatchHandle {
    return watchUtils.watch(
      this,
      "selectedAttachmentViewerData.selectedFeatureAddress",
      () => {
        this.scheduleRender();
      }
    );
  }

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

  render(): VNode {
    const header = this._renderHeader();
    const fullAttachment = this._renderFullAttachmentContainer();
    const content = this._renderContent();
    const { clientWidth } = document.body;
    const isMobile = clientWidth < 813;
    const mobile = isMobile ? this._renderMobile() : null;
    const mobileNav = isMobile ? this._renderMobileNav() : null;
    return (
      <div class={CSS.base}>
        {header}
        {isMobile ? (
          <div class={CSS.mobileBody}>
            {mobile}
            {mobileNav}
          </div>
        ) : (
          <div key={buildKey("desktop")} class={CSS.desktopContent}>
            {fullAttachment}
            {content}
          </div>
        )}
      </div>
    );
  }

  // _renderMobile
  private _renderMobile(): VNode {
    const mobileContent = this._renderMobileContent();
    return (
      <div key={buildKey("mobile")} class={CSS.mobile}>
        {mobileContent}
      </div>
    );
  }

  // _renderMobileNav
  private _renderMobileNav(): VNode {
    const mobileNavItems = this._renderMobileNavItems();
    return (
      <div key={buildKey("mobile-nav")} class={CSS.mobileNav}>
        {mobileNavItems}
      </div>
    );
  }

  // _renderMobileNavItems
  private _renderMobileNavItems(): VNode {
    const navObjects = this._generateNavObjects();
    return navObjects.map(navItem => {
      return this._renderMobileNavItem(navItem);
    });
  }

  // _renderMobileContent
  private _renderMobileContent(): VNode {
    const mapView = this._renderMapView();
    const mobileOnboarding = this._renderMobileOnboarding();
    const mobileMedia = this._renderMobileMedia();
    return (
      <div class={CSS.mobileContent}>
        {mapView}
        {this._currentMobileScreen === "maps" ? null : (
          <div class={CSS.mobileOnboardingGallery}>
            {this._currentMobileScreen === "description"
              ? mobileOnboarding
              : this._currentMobileScreen === "media"
              ? mobileMedia
              : null}
          </div>
        )}
      </div>
    );
  }

  // _renderMobileMedia
  private _renderMobileMedia(): VNode {
    const featureContentPanel = this._renderFeatureContentPanel();
    const featureGallery = this._renderFeatureGallery();
    const layerSwitcher = this._renderLayerSwitcher();
    return (
      <div class={CSS.mobileMedia}>
        {layerSwitcher}
        {featureContentPanel}
        {featureGallery}
      </div>
    );
  }

  // _renderMobileOnboarding
  private _renderMobileOnboarding(): VNode {
    const onboardingWelcomeContent = this._renderOnboardingWelcomeContent();
    return (
      <div key={buildKey("mobile-onboarding")} class={CSS.onboardingOverlay}>
        <div class={CSS.onboardingContentContainer}>
          {onboardingWelcomeContent}
        </div>
      </div>
    );
  }

  // _renderMobileNavItem
  private _renderMobileNavItem(navItem: NavItem): VNode {
    const { type, iconClass } = navItem;
    const mobileNavItemSelected = {
      [CSS.mobileNavItemSelected]: type === this._currentMobileScreen
    };
    return (
      <div
        bind={this}
        onclick={this._handleNavItem}
        onkeydown={this._handleNavItem}
        class={this.classes(CSS.mobileNavItem, mobileNavItemSelected)}
        data-nav-item={type}
        role="button"
      >
        <span class={this.classes(iconClass, CSS.icons.flush)} />
      </div>
    );
  }

  // _renderHeader
  private _renderHeader(): VNode {
    const { clientWidth } = document.body;
    const { title, shareLocationWidget } = this;
    const titleLength = title && this.title.length;
    const titleValue =
      clientWidth < 813 && titleLength > 40
        ? `${title
            .split("")
            .slice(0, 35)
            .join("")}...`
        : title;
    const shareWidget =
      shareLocationWidget && clientWidth > 813 && this._renderShareWidget();
    return (
      <header class={CSS.header}>
        <div class={CSS.headerContainer}>
          <div class={CSS.titleInfoContainer}>
            <h1 class={CSS.headerText}>{titleValue}</h1>
          </div>
          {clientWidth > 813 ? (
            <div
              bind={this}
              onclick={this._toggleOnboardingPanel}
              onkeydown={this._toggleOnboardingPanel}
              class={CSS.onboardingIcon}
              title={i18n.viewDetails}
              tabIndex={0}
            >
              <span
                class={this.classes(CSS.icons.descriptionIcon, CSS.icons.flush)}
              />
            </div>
          ) : null}
        </div>
        <div class={CSS.shareWidgetContainer}>{shareWidget}</div>
      </header>
    );
  }

  // _renderShareWidget
  private _renderShareWidget(): VNode {
    return (
      <div
        class={CSS.shareLocationWidget}
        bind={this.shareLocationWidget.container}
        afterCreate={attachToNode}
      />
    );
  }

  // _renderContent
  private _renderContent(): VNode {
    const mapViewContainer = this._renderMapViewContainer();
    const sidePanel = this._renderSidePanel();
    const onboarding = this._renderOnboarding();
    return (
      <div class={CSS.content}>
        {sidePanel}
        {mapViewContainer}
        {onboarding}
      </div>
    );
  }

  // _renderSidePanel
  private _renderSidePanel(): VNode {
    const layerSwitcher = this._renderLayerSwitcher();
    const galleryContentPanelContainer = this._renderFeatureGalleryContentPanelContainer();
    return (
      <div class={CSS.sidePanel}>
        {layerSwitcher}
        {galleryContentPanelContainer}
      </div>
    );
  }

  // _renderLayerSwitcher
  private _renderLayerSwitcher(): VNode {
    return (
      <div
        key={buildKey("back-layer-container")}
        class={CSS.backToGalleryContainer}
      >
        {this.featureContentPanelIsOpen ? (
          <div
            bind={this}
            onclick={this._closeFeatureContent}
            onkeydown={this._closeFeatureContent}
            tabIndex={0}
            class={CSS.backToGallery}
            title={i18nCommon.back}
          >
            {this.docDirection === "ltr" ? (
              <span class={CSS.icons.backArrow}></span>
            ) : (
              <span class={CSS.icons.backArrowRTL}></span>
            )}
          </div>
        ) : null}
        <div
          bind={this.layerSwitcher.container}
          afterCreate={attachToNode}
          class={CSS.layerSwitcherContainer}
        />
      </div>
    );
  }

  // _renderFeatureGalleryContentPanelContainer
  private _renderFeatureGalleryContentPanelContainer(): VNode {
    const featureGallery = this._renderFeatureGallery();
    const featureContentPanel = this._renderFeatureContentPanel();
    const multipleLayers = {
      [CSS.multipleLayers]:
        this.get("attachmentViewerDataCollection.length") > 1
    };
    return (
      <div
        class={this.classes(CSS.featureContentGalleryContainer, multipleLayers)}
      >
        {featureGallery}
        {featureContentPanel}
      </div>
    );
  }

  // _renderOnboarding
  private _renderOnboarding(): VNode {
    const onboardingIsOpen = {
      [CSS.onboardingOpen]: this._onboardingPanelIsOpen
    };
    const onboarding = this._onboardingPanelIsOpen
      ? this._renderOnboardingPanel()
      : null;
    return (
      <div
        key={buildKey("onboarding-container")}
        class={this.classes(CSS.onboardingMain, onboardingIsOpen)}
      >
        {onboarding}
      </div>
    );
  }

  // _renderOnboardingPanel
  private _renderOnboardingPanel(): VNode {
    const onboardingWelcomeContent = this._renderOnboardingWelcomeContent();
    const onboardingStartButton = this._renderOnboardingStartButton();
    return (
      <div class={CSS.onboardingOverlay}>
        <div class={CSS.onboardingContentContainer}>
          {onboardingWelcomeContent}
          {onboardingStartButton}
        </div>
      </div>
    );
  }

  // _renderOnboardingWelcomeContent
  private _renderOnboardingWelcomeContent(): VNode {
    return (
      <div
        class={CSS.onboardingWelcomeContent}
        key={buildKey("onboarding-welcome")}
      >
        {this.onboardingContent.render()}
      </div>
    );
  }

  // _renderOnboardingStartButton
  private _renderOnboardingStartButton(): VNode {
    const buttonText = this.onboardingButtonText
      ? this.onboardingButtonText
      : i18n.start;
    return (
      <div class={CSS.onboardingStartButtonContainer}>
        <button
          bind={this}
          onclick={this._disableOnboardingPanel}
          onkeydown={this._disableOnboardingPanel}
          tabIndex={0}
          class={this.classes(
            CSS.onboardingStartButton,
            CSS.icons.button,
            CSS.icons.buttonFill
          )}
        >
          {buttonText}
        </button>
      </div>
    );
  }

  // _renderFeatureGallery
  private _renderFeatureGallery(): VNode {
    const attachmentDataCollectionLength = this.get(
      "selectedAttachmentViewerData.attachmentDataCollection.length"
    ) as number;
    const featureGalleryItems =
      this.selectedAttachmentViewerData && attachmentDataCollectionLength > 0
        ? this._renderFeatureGalleryItems()
        : null;
    const featureObjectIdsLength = this.get(
      "selectedAttachmentViewerData.featureObjectIds.length"
    ) as number;

    const layerSwitcherIsEnabled = {
      [CSS.layerSwitcherMobile]:
        this.get("attachmentViewerDataCollection.length") > 1
    };
    const loader =
      featureObjectIdsLength > attachmentDataCollectionLength
        ? this._renderGalleryLoader()
        : null;
    return (
      <div
        bind={this}
        afterCreate={storeNode}
        data-node-ref="_triggerScrollElement"
        onscroll={this._triggerScrollQuery}
        class={this.classes(
          CSS.featureGalleryContainer,
          layerSwitcherIsEnabled
        )}
      >
        {featureGalleryItems}
        {loader}
      </div>
    );
  }

  // _renderGalleryLoader
  private _renderGalleryLoader(): VNode {
    return (
      <div class={CSS.loaderContainer}>
        <span class={CSS.loadingText}>{i18n.loading}...</span>
        <div class={CSS.loaderGraphic} />
      </div>
    );
  }

  //   _renderFeatureGalleryItems
  private _renderFeatureGalleryItems(): VNode {
    const attachmentDataCollection = this.get(
      "selectedAttachmentViewerData.attachmentDataCollection"
    ) as __esri.Collection<AttachmentData>;
    return (
      <div>
        {this.selectedAttachmentViewerData &&
          attachmentDataCollection
            .toArray()
            .map(feature => this._renderFeatureGallleryItem(feature))}
      </div>
    );
  }

  //   _renderFeatureGallleryItem
  private _renderFeatureGallleryItem(attachmentContent: any): VNode {
    if (!attachmentContent) {
      return;
    }
    const { attachments, objectId } = attachmentContent;
    const thumbnailContainer = this._renderThumbnailContainer(attachments);
    const attachmentUrl =
      attachments && attachments.length > 0 ? attachments[0].url : null;
    const multSVGIcon =
      attachments && attachments.length > 1
        ? this._renderMultipleSVGIcon(objectId)
        : null;
    const featureTitle = this._renderFeatureTitle(objectId);
    return (
      <div
        key={buildKey(`gallery-item-${attachmentUrl}`)}
        bind={this}
        class={CSS.featureGalleryGridItem}
        onmouseover={this._openToolTipPopup}
        onmouseleave={this._closeToolTipPopup}
        onclick={this._selectGalleryItem}
        onkeydown={this._selectGalleryItem}
        data-object-id={objectId}
        tabIndex={this.featureContentPanelIsOpen ? -1 : 0}
      >
        <div class={CSS.featureGalleryItem}>
          {thumbnailContainer}
          {featureTitle}
          {multSVGIcon}
        </div>
      </div>
    );
  }

  // _renderMultipleSVGIcon
  private _renderMultipleSVGIcon(objectId: number): VNode {
    const layerId = this.get(
      "selectedAttachmentViewerData.layerData.featureLayer.id"
    ) as string;
    return (
      <div
        key={buildKey(`mult-svg-icon-${layerId}-${objectId}`)}
        class={CSS.svg.multipleAttachmentsIcon}
      >
        <svg class={CSS.svg.size}>
          <g>
            <path
              d="M18.2,23.8H1.1c-0.5,0-0.9-0.4-0.9-0.9V5.8c0-0.5,0.4-0.9,0.9-0.9h17.1c0.5,0,0.9,0.4,0.9,0.9v17.1
C19.2,23.4,18.8,23.8,18.2,23.8z M2.2,21.8h15v-15h-15V21.8z"
            />
          </g>
          <g>
            <path
              d="M22.6,17.3c-0.6,0-1.2-0.5-1.2-1.2V2.6H7.9c-0.6,0-1.2-0.5-1.2-1.2s0.5-1.2,1.2-1.2h14.8
c0.6,0,1.1,0.5,1.1,1.1v14.8C23.8,16.8,23.3,17.3,22.6,17.3z"
            />
          </g>
        </svg>
      </div>
    );
  }

  // _renderFeatureTitle
  private _renderFeatureTitle(objectId: number): VNode {
    const titleText = this._processTitle(objectId);
    return <div class={CSS.featureContentTitleContainer}>{titleText}</div>;
  }

  // _renderThumbnailContainer
  private _renderThumbnailContainer(attachments: any): VNode {
    const attachment = attachments[0];
    const contentType = attachment && attachment.contentType;
    const imageStyles =
      this.imageIsLoaded && attachment && attachment.orientationInfo
        ? getOrientationStylesImageThumbnail(attachment.orientationInfo)
        : {};
    const imageAttachmentTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif"
    ];

    const isImage = imageAttachmentTypes.indexOf(contentType) !== -1;

    const isPDF = contentType && contentType.indexOf("pdf") !== -1;

    const isVideo =
      contentType &&
      (contentType.indexOf("mov") !== -1 ||
        contentType.indexOf("mp4") !== -1 ||
        contentType.indexOf("quicktime") !== -1);

    const pdf = isPDF ? this._renderPDFThumbnailContainer() : null;

    const attachmentUrl =
      attachment && attachment.url
        ? this.viewModel.updateAttachmentUrlToHTTPS(attachment.url)
        : null;

    return (
      <div class={CSS.thumbnailContainer}>
        {!attachments || (attachments && attachments.length === 0) ? (
          <div
            key={buildKey("no-attachments-container")}
            class={CSS.noAttachmentsContainer}
          >
            <svg class={CSS.svg.noAttachments}>
              <g>
                <g>
                  <path
                    d="M29.6,17c0-0.7,0.2-1.2,0.7-1.7s1-0.7,1.7-0.7c0.7,0,1.3,0.2,1.7,0.7c0.5,0.5,0.7,1.1,0.7,1.8
			c0,0.7-0.2,1.2-0.7,1.7c-0.5,0.5-1,0.7-1.7,0.7H32c-0.7,0-1.2-0.2-1.7-0.7c-0.5-0.5-0.7-1-0.7-1.7V17z M13.7,35.9V31
			c0.4,0.2,0.8,0.3,1.2,0.3c0.8,0,1.4-0.3,1.9-0.8l6.4-6.5l6.3,5.4c0.5,0.4,1.1,0.7,1.8,0.7c0.7,0,1.3-0.2,1.8-0.6l3.5-2.7l4.1,4.2
			v5H13.7z M37.4,24.7c-0.4-0.4-0.8-0.4-1.3-0.1L32,27.8c-0.4,0.3-0.8,0.3-1.2,0l-7-6c-0.2-0.2-0.4-0.2-0.7-0.2
			c-0.3,0-0.5,0.1-0.6,0.3l-7,7.2c-0.2,0.2-0.4,0.3-0.7,0.2c-0.3,0-0.5-0.1-0.6-0.3c-0.2-0.2-0.4-0.3-0.7-0.3
			c-0.3,0-0.5,0.1-0.7,0.3l-1,1.1v7.8h30.9V30L37.4,24.7z M42.7,41.8H11.7v-2h30.9V41.8z M44.6,43.8H9.8V12.1h34.8V43.8z M7.9,10.1
			v35.6h38.7V10.1H7.9z"
                  />
                </g>
                <g>
                  <polygon points="3.8,8.8 5.5,6.9 49.4,47.5 47.7,49.4" />
                  <path
                    d="M6,8l42.7,39.5l-1.1,1.2L4.9,9.2L6,8 M5.5,6.2L4.8,6.9L3.8,8.1L3.1,8.8l0.7,0.7l43.2,40l0.7,0.7l0.7-0.7
			l1.1-1.2l0.7-0.7l-0.7-0.7L6.2,6.8L5.5,6.2L5.5,6.2z"
                  />
                </g>
              </g>
            </svg>
          </div>
        ) : isImage ? (
          <img
            bind={this}
            styles={imageStyles}
            class={CSS.imageThumbnail}
            src={attachmentUrl}
            afterCreate={this._fadeInImage}
            afterUpdate={this._fadeInImage}
            alt=""
          />
        ) : isPDF ? (
          pdf
        ) : isVideo ? (
          <svg class={CSS.svg.video}>
            <path
              d="M31,21.3h-3.5v3.6H31V21.3z M15.1,32.1H9.8v1.8h5.3V32.1z M52.2,39.3H51L41.6,33v-8.9l9.4-6.4h1.2V39.3z
           M50.5,15.9l-10.6,7.2v10.8l10.6,7.2H54V15.9H50.5z M4.4,41.1l-1.6-1.6V17.6l1.6-1.6h30.3l1.6,1.6v21.9l-1.6,1.6L4.4,41.1z
           M38.1,40.2V16.8l-2.6-2.7h-5.8l-7.1-7.2H9.8v1.8h12l5.3,5.4H3.6L1,16.8v23.4l2.6,2.7h31.8L38.1,40.2z"
            />
          </svg>
        ) : null}
      </div>
    );
  }

  // _renderPDFThumbnailContainer
  private _renderPDFThumbnailContainer(): VNode {
    return (
      <div
        class={this.classes(
          CSS.pdfContainer,
          "esri-map-centric__pointer-events-none"
        )}
      >
        <svg
          class={this.classes(
            CSS.pdfThumbnailIconContainer,
            "esri-map-centric__pointer-events-none"
          )}
        >
          <path
            d="M27.9,3.5c-0.6-2.1-2-3.1-3.2-3c-1.4,0.2-2.9,1-3.5,2.4c-1.7,3.9,1.8,15.3,2.4,17.2
	c-3.5,10.6-15.3,31.6-21.1,33c-0.1-1.4,0.6-5.4,8.2-10.4c0.4-0.4,0.8-1,1.1-1.3C5.4,44.7-3,49.8,2,53.7c0.3,0.2,0.7,0.4,1.2,0.6
	c3.9,1.4,9.2-3.3,14.7-14.1c6-2,10.8-3.5,17.6-4.6c7.5,5.1,12.5,6.2,15.9,4.9c0.9-0.4,2.4-1.6,2.9-3.1c-2.8,3.5-9.2,1-14.4-2.3
	c4.8-0.5,9.7-0.8,11.8-0.2c2.7,0.9,2.6,2.2,2.6,2.4c0.2-0.7,0.5-1.9-0.1-2.9c-2.3-3.8-12.7-1.6-16.5-1.2c-6-3.7-10.1-10.2-11.8-14.9
	C27.5,12.3,29.1,7.9,27.9,3.5 M25.3,16.2c-1-3.6-2.4-11.6-0.2-14.2C29.6,4.6,26.8,10.7,25.3,16.2 M33.5,34.1
	c-5.8,1.1-9.7,2.6-15.3,4.8c1.7-3.3,4.8-11.7,6.3-17.3C26.7,26,29.3,30.2,33.5,34.1"
          />
        </svg>
      </div>
    );
  }

  // _renderFeatureContentPanel
  private _renderFeatureContentPanel(): VNode {
    const mediaViewerDesktop = this._renderMediaViewerDesktop();
    const featureInfo = this._renderFeatureInfoPanel();
    const featureContentPanelIsOpen = {
      [CSS.featureContentPanelOpen]: this.featureContentPanelIsOpen
    };
    const featureContentPanelLayerSwitcher = {
      [CSS.featureContentPanelLayerSwitcher]:
        this.attachmentViewerDataCollection &&
        this.attachmentViewerDataCollection.length > 1
    };
    return (
      <div
        key={buildKey(
          `feature-content-panel-${this.get(
            "selectedAttachmentViewerData.layerData.featureLayer.id"
          )}`
        )}
        class={this.classes(
          CSS.featureContentPanelContainer,
          featureContentPanelIsOpen,
          featureContentPanelLayerSwitcher
        )}
      >
        {mediaViewerDesktop}
        {featureInfo}
      </div>
    );
  }

  // _renderMediaViewerDesktop
  private _renderMediaViewerDesktop(): VNode {
    const mediaContainer = this._renderMediaContainer();
    const expandAttachment =
      this.viewModel.mapCentricState !== "querying" &&
      this.selectedAttachmentViewerData &&
      this.selectedAttachmentViewerData.selectedFeatureAttachments &&
      this.selectedAttachmentViewerData.selectedFeatureAttachments.attachments
        .length > 0
        ? this._renderExpandAttachment()
        : null;
    return (
      <div class={CSS.mediaViewerDesktop}>
        {expandAttachment}
        {mediaContainer}
      </div>
    );
  }

  // _renderExpandAttachmentIconContainer
  private _renderExpandAttachment(): VNode {
    return (
      <button
        bind={this}
        onclick={this._expandAttachment}
        onkeydown={this._expandAttachment}
        storeNode="_expandAttachmentNode"
        tabIndex={!this.featureContentPanelIsOpen ? -1 : 0}
        class={CSS.expandMediaContainer}
        title={i18n.viewInFullScreen}
      >
        <svg class={CSS.svg.expandAttachment}>
          <g>
            <path d="M17.8,11.2v6.6h-6.6v-1.5h4.1l-5.3-4.7l1-0.9l5.3,4.7v-4.2L17.8,11.2z" />
            <polygon points="6.8,1.7 6.8,0.2 0.2,0.2 0.2,6.8 1.7,6.8 1.7,2.6 6.4,7.3 7.2,6.4 2.6,1.7" />
          </g>
        </svg>
      </button>
    );
  }

  // _renderMediaContainer
  private _renderMediaContainer(): VNode {
    if (!this.selectedAttachmentViewerData) {
      return;
    }
    const mediaViewerParentContainer = this._renderMediaViewerParentContainer();
    return (
      <div class={CSS.mediaViewerSection}>
        {this._layerDoesNotSupportAttachments ? (
          <div class={CSS.layerNotSupported}>{i18n.notSupported}</div>
        ) : (
          mediaViewerParentContainer
        )}
      </div>
    );
  }

  // _renderMediaViewerParentContainer
  private _renderMediaViewerParentContainer(): VNode {
    const downloadEnabled = {
      [CSS.downloadEnabled]: !this.viewModel.downloadEnabled
    };

    const attachment = this.viewModel.getCurrentAttachment();

    const attachmentLoader =
      !this.imageIsLoaded || this.viewModel.mapCentricState === "querying"
        ? this._renderAttachmentLoader()
        : null;

    const mediaViewerContainer = this._renderMediaViewerContainer();
    const imageDirection = this._fullAttachmentContainerIsOpen
      ? this.imageDirectionEnabled
        ? this._renderImageDirection(attachment)
        : null
      : null;

    const attachmentScrollNode = this._renderAttachmentScrollContainer();
    const attachmentScroll = !this._fullAttachmentContainerIsOpen
      ? attachmentScrollNode
      : null;
    return (
      <div
        key={buildKey("image-container")}
        class={this.classes(downloadEnabled, CSS.mediaViewer)}
      >
        {attachmentLoader}
        {mediaViewerContainer}
        {imageDirection}
        {this._fullAttachmentContainerIsOpen ? null : attachmentScroll}
        {this._renderAttachmentScrollContainer()}
      </div>
    );
  }

  // _renderAttachmentLoader
  private _renderAttachmentLoader(): VNode {
    return (
      <div class={CSS.widgetLoader} key={buildKey("base-loader")}>
        <span
          class={CSS.animationLoader}
          role="presentation"
          aria-label={i18n.loadingImages}
        />
      </div>
    );
  }

  // _renderMediaViewerContainer
  private _renderMediaViewerContainer(): VNode {
    const { currentImageUrl } = this;
    const attachment = this.viewModel.getCurrentAttachment();
    const contentType = attachment && (attachment.get("contentType") as string);

    const video =
      contentType && contentType.indexOf("video") !== -1
        ? this._renderVideo(currentImageUrl)
        : null;

    const pdf =
      contentType && contentType.indexOf("pdf") !== -1
        ? this._renderPdf(currentImageUrl)
        : null;

    const image =
      this.supportedAttachmentTypes.indexOf(contentType) !== -1 &&
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

    const gif =
      contentType && contentType.indexOf("gif") !== -1
        ? this._renderCurrentImage()
        : null;

    const mediaContainerLoading = {
      [CSS.mediaContainerLoading]: !this.imageIsLoaded
    };

    const attachmentsLength = this.get(
      "selectedAttachmentViewerData.selectedFeatureAttachments.attachments.length"
    );

    return (
      <div
        bind={this}
        afterCreate={storeNode}
        data-node-ref="_mediaViewerContainer"
        class={this.classes(mediaContainerLoading, CSS.mediaContainer)}
      >
        {video || pdf || image || gif ? (
          <div
            class={
              pdf
                ? CSS.pdf
                : video
                ? CSS.videoParentContainer
                : image || gif
                ? CSS.imageParentContainer
                : ""
            }
          >
            {image}
            {video}
            {pdf}
            {gif}
          </div>
        ) : attachmentsLength === 0 &&
          this.viewModel.mapCentricState !== "querying" ? (
          <div
            key={buildKey("no-attachments-container")}
            class={CSS.noAttachmentsContainer}
          >
            <svg
              class={CSS.svg.media}
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 16 16"
            >
              <path d="M1 2v12h14V2zm13 11H2V3h12zm-1-1H3v-1h10zM3 8.678l.333-.356a.3.3 0 0 1 .445 0 .3.3 0 0 0 .444 0l2.242-2.39a.3.3 0 0 1 .423-.021l2.255 2.005a.299.299 0 0 0 .39.01l1.361-.915a.3.3 0 0 1 .41.032L13 8.678V10H3zM11.894 9l-.89-.859-.846.565a1.299 1.299 0 0 1-1.68-.043L6.732 7.11 4.958 9zm-.644-4.5a.75.75 0 1 1-.75-.75.75.75 0 0 1 .75.75z" />
            </svg>

            <span class={CSS.noAttachmentsText}>{i18n.noAttachmentsFound}</span>
          </div>
        ) : null}
      </div>
    );
  }

  // _renderCurrentImage
  private _renderCurrentImage(): VNode {
    const attachment = this.viewModel.getCurrentAttachment();

    const orientationInfo = attachment && attachment.get("orientationInfo");
    const name = attachment ? attachment.name : null;
    const container = this._fullAttachmentContainerIsOpen
      ? this._mediaViewerContainerFullAttachment
      : this._mediaViewerContainer;
    const imageStyles =
      orientationInfo && container && this.imageIsLoaded
        ? getOrientationStyles(orientationInfo, container, this.appMode)
        : {
            transform: "none",
            height: "initial",
            maxHeight: "100%"
          };

    const fadeImage = {
      [CSS.fadeImage]: !this.imageIsLoaded
    };
    return (
      <img
        bind={this}
        key={buildKey(`image-desktop-${this.currentImageUrl}`)}
        class={this.classes(CSS.imageDesktop, fadeImage)}
        styles={imageStyles}
        src={this.currentImageUrl}
        afterCreate={this._fadeInImage}
        afterUpdate={this._fadeInImage}
        onload={this._fadeInImage}
        alt={name}
      />
    );
  }

  // _renderVideo
  private _renderVideo(currentImageUrl: string): VNode {
    return (
      <video
        bind={this}
        key={buildKey(`video-${currentImageUrl}`)}
        class={CSS.videoContainer}
        controls
      >
        <source src={currentImageUrl} type="video/mp4" />
        <source src={currentImageUrl} type="video/quicktime" />
        <source src={currentImageUrl} type="video/ogg" />
        <source src={currentImageUrl} type="video/mov" />
        {i18n.doesNotSupportVideo}
      </video>
    );
  }

  // _renderPdf
  private _renderPdf(currentImageUrl: string): VNode {
    return (
      <embed
        key={buildKey(`pdf-${currentImageUrl}`)}
        class={CSS.pdf}
        src={currentImageUrl}
        type="application/pdf"
      />
    );
  }

  // _renderAttachmentScrollContainer
  private _renderAttachmentScrollContainer(): VNode {
    const attachments = this.get(
      "selectedAttachmentViewerData.selectedFeatureAttachments.attachments"
    ) as __esri.Collection<__esri.AttachmentInfo>;

    const attachment = this.viewModel.getCurrentAttachment();
    const imageDirection = this._renderImageDirection(attachment);
    const download = this._renderDownload();
    const attachmentScroll = this._renderAttachmentScroll();
    return (
      <div key={buildKey("attachment-scroll")} class={CSS.attachmentNumber}>
        {attachments && attachments.length > 0 ? (
          <div
            key={buildKey("download-attachment")}
            class={CSS.downloadIconTextContainer}
          >
            {attachmentScroll}
            {imageDirection}
          </div>
        ) : null}
        {download}
      </div>
    );
  }

  // _renderAttachmentScroll
  private _renderAttachmentScroll(): VNode {
    const { selectedAttachmentViewerData } = this;
    if (!selectedAttachmentViewerData) {
      return;
    }
    const currentIndex = selectedAttachmentViewerData.attachmentIndex + 1;
    const attachments = this.viewModel.getAttachments();
    const totalNumberOfAttachments = attachments && attachments.length;
    return (
      <div class={CSS.attachmentScroll}>
        <button
          bind={this}
          onclick={this._previousImage}
          onkeydown={this._previousImage}
          disabled={
            this._onboardingPanelIsOpen ||
            (attachments && attachments.length < 2)
              ? true
              : false
          }
          tabIndex={0}
          class={CSS.leftArrowContainer}
          title={i18n.previousAttachment}
        >
          {this.docDirection === "rtl" ? (
            <span class={this.classes(CSS.icons.rightArrow, CSS.icons.flush)} />
          ) : (
            <span class={this.classes(CSS.icons.leftArrow, CSS.icons.flush)} />
          )}
        </button>
        <span class={CSS.attachmentNumberText}>
          {`${currentIndex} / ${totalNumberOfAttachments}`}
        </span>
        <button
          bind={this}
          onclick={this._nextImage}
          onkeydown={this._nextImage}
          disabled={
            this._onboardingPanelIsOpen ||
            (attachments && attachments.length < 2)
              ? true
              : false
          }
          tabIndex={0}
          class={CSS.rightArrowContainer}
          title={i18n.nextAttachment}
        >
          {this.docDirection === "rtl" ? (
            <span class={this.classes(CSS.icons.leftArrow, CSS.icons.flush)} />
          ) : (
            <span class={this.classes(CSS.icons.rightArrow, CSS.icons.flush)} />
          )}
        </button>
      </div>
    );
  }

  // _renderImageDirection
  private _renderImageDirection(attachment: __esri.AttachmentInfo): VNode {
    const imageDirectionValue = this.imageDirectionEnabled
      ? this.viewModel.getGPSInformation(attachment)
      : null;
    return imageDirectionValue ? (
      <div key={buildKey("gps-image-direction")} class={CSS.gpsImageDirection}>
        {this._fullAttachmentContainerIsOpen ? (
          <span class={CSS.imageDirectionDegrees}>
            {i18n.gpsImageDirection}: {`${imageDirectionValue}`}&deg;
          </span>
        ) : null}
        <div
          title={`${i18n.gpsImageDirection}: ${imageDirectionValue}\u00B0`}
          class={CSS.imageDirection}
        >
          <svg
            styles={{ transform: `rotateZ(${imageDirectionValue}deg)` }}
            class={CSS.mapCentricCamera}
          >
            <g>
              <path
                d="M19.1,10.8h-0.3h-0.3h-1.3v2h-1v-0.7v-0.3h-11l0,0h-1v1.1v5.8v0h16v-1.9v-3.9v-1.1
		C20.2,11.3,19.7,10.8,19.1,10.8z"
              />
              <path d="M15.2,8.2V7.4v-2c0-0.9-0.7-1.6-1.6-1.6H7.8c-0.9,0-1.6,0.7-1.6,1.6v2v0.8v2.6h9V8.2z" />
              <path
                d="M12,1c6.1,0,11,4.9,11,11s-4.9,11-11,11S1,18.1,1,12S5.9,1,12,1 M12,0C5.4,0,0,5.4,0,12s5.4,12,12,12
		c6.6,0,12-5.4,12-12S18.6,0,12,0L12,0z"
              />
            </g>
          </svg>
        </div>
      </div>
    ) : null;
  }

  // _renderDownload
  private _renderDownload(): VNode {
    const attachment = this.viewModel.getCurrentAttachment();
    const contentType = attachment && (attachment.get("contentType") as string);
    const download =
      contentType &&
      contentType.indexOf("video") === -1 &&
      contentType.indexOf("gif") === -1 &&
      contentType.indexOf("pdf") === -1 &&
      this.viewModel.downloadEnabled
        ? this.viewModel.state === "downloading"
          ? this._renderDownloadSpinner()
          : this._renderDownloadButton()
        : null;
    return download;
  }

  // _renderDownloadSpinner
  private _renderDownloadSpinner(): VNode {
    return (
      <div class={CSS.downloadIconContainer}>
        <span
          class={this.classes(
            CSS.icons.loadingIcon,
            CSS.icons.rotating,
            CSS.spinner
          )}
          role="presentation"
        />
      </div>
    );
  }

  // _renderDownloadButton
  private _renderDownloadButton(): VNode {
    const attachment = this.viewModel.getCurrentAttachment();
    return (
      <button
        class={this.classes(
          CSS.downloadIconContainer,
          CSS.downloadButtonDesktop
        )}
        bind={this}
        onclick={this._downloadImage}
        onkeydown={this._downloadImage}
        data-image-url={this.currentImageUrl}
        data-image-name={attachment.name}
        title={i18n.download}
        disabled={this.imageIsLoaded ? false : true}
      >
        <span
          class={this.classes(
            CSS.icons.downloadIcon,
            CSS.icons.flush,
            CSS.downloadIcon
          )}
        />
      </button>
    );
  }

  // _renderFeatureInfoPanel
  private _renderFeatureInfoPanel(): VNode {
    const featureWidget = this.get("viewModel.featureWidget") as __esri.Feature;

    const featureWidgetContent =
      featureWidget &&
      (featureWidget.get("viewModel.content") as __esri.Content[]);

    const fieldsInfoContent =
      (featureWidget &&
        featureWidgetContent &&
        featureWidgetContent.filter(contentItem => {
          const fieldInfos = contentItem.get(
            "fieldInfos"
          ) as __esri.FieldInfo[];
          return (
            contentItem.type === "fields" && fieldInfos && fieldInfos.length > 0
          );
        })) ||
      [];

    const mediaInfoContent =
      (featureWidget &&
        featureWidgetContent &&
        featureWidgetContent.filter(contentItem => {
          const mediaInfos = contentItem.get(
            "mediaInfos"
          ) as __esri.MediaInfo[];
          return (
            contentItem.type === "media" && mediaInfos && mediaInfos.length > 0
          );
        })) ||
      [];

    const fieldsInfoText =
      (featureWidget &&
        featureWidgetContent &&
        featureWidgetContent.filter(contentItem => {
          return contentItem.type === "text";
        })) ||
      [];

    if (this._featureContentAvailable === null) {
      if (
        (fieldsInfoContent && fieldsInfoContent.length > 0) ||
        (fieldsInfoText && fieldsInfoText.length > 0)
      ) {
        this._featureContentAvailable = true;
      }
    }

    const featureContentHeader = this._renderFeatureContentHeader();
    const address = this._renderFeatureContentAddress();
    const unsupportedAttachmentTypesLength = this.get(
      "selectedAttachmentViewerData.unsupportedAttachmentTypes.length"
    );
    const unsupportedAttachmentTypes =
      unsupportedAttachmentTypesLength > 0
        ? this._renderUnsupportedAttachmentTypes()
        : null;

    if (this._featureContentAvailable === null) {
      if (
        (fieldsInfoContent && fieldsInfoContent.length > 0) ||
        (fieldsInfoText && fieldsInfoText.length > 0)
      ) {
        this._featureContentAvailable = true;
      }
    }

    const featureTotal =
      this.selectedAttachmentViewerData &&
      (this.selectedAttachmentViewerData.get(
        "featureObjectIds.length"
      ) as number);

    return (
      <div class={CSS.featureContent}>
        {this.viewModel.mapCentricState === "waitingForContent" ? (
          <div class={CSS.featureContentLoader}>
            <div class={CSS.loaderGraphic} />
            <div>{i18n.loading}...</div>
          </div>
        ) : (
          <div class={CSS.featureContentContainer}>
            {featureContentHeader}
            {address}
            {(fieldsInfoText && fieldsInfoText.length > 0) ||
            (mediaInfoContent && mediaInfoContent.length > 0) ||
            this._featureContentAvailable ? (
              <div>
                {this._featureContentAvailable
                  ? this._renderFeatureInfoContent()
                  : null}
                {(mediaInfoContent && mediaInfoContent.length > 0) ||
                (fieldsInfoText && fieldsInfoText.length > 0)
                  ? this._renderFeatureWidgetContent()
                  : null}
              </div>
            ) : this._featureContentAvailable && featureTotal ? (
              this._renderFeatureContentLoader()
            ) : (
              this._renderNoFeatureContentInfo()
            )}
            {unsupportedAttachmentTypes}
          </div>
        )}
      </div>
    );
  }

  // _renderFeatureContentHeader
  private _renderFeatureContentHeader(): VNode {
    const zoomTo = this._renderZoomTo();

    const layerId = this.get(
      "selectedAttachmentViewerData.layerData.featureLayer.id"
    );
    const objectIdField = this.get(
      "selectedAttachmentViewerData.layerData.featureLayer.objectIdField"
    ) as string;
    const attributes = this.get(
      "selectedAttachmentViewerData.selectedFeature.attributes"
    );
    const objectId = attributes && attributes[objectIdField];
    return (
      <div class={CSS.featureTitleZoomContainer}>
        <div
          key={buildKey(`feature-content-title-${layerId}-${objectId}`)}
          class={CSS.featureContentTitle}
        >
          <h2 class={CSS.featureLayerTitle}>
            {this.get("viewModel.featureWidget.title")}
          </h2>
        </div>
        <div class={CSS.featureZoomToContainer}>{zoomTo}</div>
      </div>
    );
  }

  // _renderZoomTo
  private _renderZoomTo(): VNode {
    return (
      <button
        bind={this}
        class={CSS.zoomTo}
        tabIndex={0}
        onclick={this._zoomTo}
        onkeydown={this._zoomTo}
        title={i18n.zoomTo}
        label={i18n.zoomTo}
      >
        <span
          class={this.classes(
            CSS.zoomToIcon,
            CSS.icons.zoomInIcon,
            CSS.icons.flush
          )}
        />
      </button>
    );
  }

  // _renderFeatureContentAddress
  private _renderFeatureContentAddress(): VNode {
    return (
      <h3 class={CSS.addressText}>
        {this.get("selectedAttachmentViewerData.selectedFeatureAddress")}
      </h3>
    );
  }

  // _renderFeatureWidgetContent
  private _renderFeatureWidgetContent(): VNode {
    const featureWidget = this.get("viewModel.featureWidget") as __esri.Feature;
    return (
      <div
        key={buildKey("feture-widget-content")}
        class={CSS.featureInfoContent}
      >
        {featureWidget && featureWidget.render()}
      </div>
    );
  }

  // _renderFeatureInfoContent
  private _renderFeatureInfoContent(): VNode {
    const featureContentInfo =
      this.selectedAttachmentViewerData &&
      this.selectedAttachmentViewerData.selectedFeatureInfo
        ? this._renderFeatureContentInfos()
        : null;
    return (
      <div
        key={buildKey("feature-info-content")}
        class={CSS.featureInfoContent}
      >
        {featureContentInfo}
      </div>
    );
  }

  // _renderFeatureContentInfos
  private _renderFeatureContentInfos(): VNode {
    const { selectedFeatureInfo } = this.selectedAttachmentViewerData;
    const featureContentInfos = selectedFeatureInfo.map(
      (contentInfo: any, contentInfoIndex: number) => {
        return this._renderFeatureContentInfo(contentInfo, contentInfoIndex);
      }
    );
    return <div>{featureContentInfos}</div>;
  }

  // _renderFeatureContentInfo
  private _renderFeatureContentInfo(
    contentInfo: any,
    contentInfoIndex: number
  ): VNode {
    const hyperlink = this.viewModel.getHyperLink(contentInfo);
    const contentCheck =
      contentInfo && contentInfo.content && contentInfo.content !== null;
    const layerId = this._getLayerId();
    const objectIdField = this.viewModel.getObjectIdField();
    const selectedFeature = this.get(
      "selectedAttachmentViewerData.selectedFeature"
    ) as __esri.Graphic;
    const attributes = selectedFeature && selectedFeature.attributes;
    const objectId = attributes && objectIdField && attributes[objectIdField];
    const key = `feature-content-info-${layerId}-${contentInfo.attribute}-${contentInfo.content}-${objectId}-${contentInfoIndex}`;
    return (
      <div key={buildKey(key)} class={CSS.featureContentInfo}>
        <h4 class={CSS.attributeHeading} innerHTML={contentInfo.attribute} />
        {contentInfo && contentInfo.content && contentCheck ? (
          hyperlink ? (
            <p class={CSS.attributeContent}>
              <div innerHTML={contentInfo.content.replace(hyperlink, "")} />
              <span innerHTML={autoLink(hyperlink)} />
            </p>
          ) : contentInfo &&
            contentInfo.content &&
            typeof contentInfo.content === "string" &&
            contentInfo.content.trim() === "" ? (
            <p>{i18n.noContentAvailable}</p>
          ) : (
            <p class={CSS.attributeContent} innerHTML={contentInfo.content} />
          )
        ) : (
          <p>{i18n.noContentAvailable}</p>
        )}
      </div>
    );
  }

  // _renderFeatureContentLoader
  private _renderFeatureContentLoader(): VNode {
    return (
      <div key={buildKey("feature-content-loader")} class={CSS.widgetLoader}>
        {i18n.loadingImages}
      </div>
    );
  }

  // _renderNoFeatureContentInfo
  private _renderNoFeatureContentInfo(): VNode {
    return (
      <div key={buildKey("no-content")} class={CSS.noInfo}>
        {i18n.noContentAvailable}
      </div>
    );
  }

  // _renderUnsupportedAttachmentTypes
  private _renderUnsupportedAttachmentTypes(): VNode {
    const unsupportedAttachmentTypes = this._renderUnsupportedAttachmentTypesList();
    return (
      <div key={buildKey("other-attachment-types")}>
        <h4 class={CSS.attributeHeading}>{i18n.otherAttachments}</h4>
        {unsupportedAttachmentTypes}
      </div>
    );
  }

  // _renderUnsupportedAttachmentTypesList
  private _renderUnsupportedAttachmentTypesList(): VNode {
    const otherAttachmentTypes = this.selectedAttachmentViewerData.unsupportedAttachmentTypes.map(
      (attachment: __esri.AttachmentInfo) => {
        return this._renderUnsupportedAttachmentType(attachment);
      }
    );
    return <ul class={CSS.otherAttachmentsList}>{otherAttachmentTypes}</ul>;
  }

  // _renderOtherAttachmentType
  private _renderUnsupportedAttachmentType(
    attachment: __esri.AttachmentInfo
  ): VNode {
    const { id, name, size } = attachment;
    return (
      <li key={buildKey(`other-attachment-${id}-${name}-${size}`)}>
        <a href={attachment.url} target="_blank">
          {attachment.name}
        </a>
      </li>
    );
  }

  // _renderFullAttachmentContainer
  private _renderFullAttachmentContainer(): VNode {
    const fullAttachmentNode = this._renderFullAttachmentNode();
    const attachment = this.viewModel.getCurrentAttachment();
    if (this.imagePanZoomEnabled) {
      this._handleImagePanZoom(attachment);
    }
    const fullAttachmentContainerIsOpen = {
      [CSS.fullMediaContainerOpen]: this._fullAttachmentContainerIsOpen
    };
    return (
      <div
        key={buildKey("full-image-container")}
        class={this.classes(
          CSS.fullMediaContainer,
          fullAttachmentContainerIsOpen
        )}
      >
        {fullAttachmentNode}
      </div>
    );
  }

  // _renderFullAttachmentNode
  private _renderFullAttachmentNode(): VNode {
    const attachment = this.viewModel.getCurrentAttachment();
    const contentType = attachment && (attachment.get("contentType") as string);
    const contentTypesToCheck = [
      "image/gif",
      "video/mp4",
      "video/mov",
      "video/quicktime",
      "application/pdf"
    ];
    const contentTypeCheck = contentTypesToCheck.indexOf(contentType) === -1;

    const zoomSlider = this._fullAttachmentContainerIsOpen
      ? this.imagePanZoomEnabled &&
        document.body.clientWidth > 813 &&
        this.currentImageUrl &&
        contentTypeCheck
        ? this._renderZoomSlider()
        : null
      : null;

    const attachmentViewerContainer = this._renderMediaViewerContainer();

    const attachmentScroll = this._renderAttachmentScrollContainer();

    const attachmentLoader =
      this.viewModel.state !== "querying" && !this.imageIsLoaded
        ? this._renderAttachmentLoader()
        : null;

    const imageAttachmentTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif"
    ];

    if (imageAttachmentTypes.indexOf(contentType) === -1) {
      this.set("imageIsLoaded", true);
    }

    return (
      <div class={CSS.mediaViewerSection}>
        {this._layerDoesNotSupportAttachments ? (
          <div class={CSS.layerNotSupported}>{i18n.notSupported}</div>
        ) : (
          <div class={CSS.mediaViewer}>
            <button
              bind={this}
              afterCreate={storeNode}
              data-node-ref="_fullScreenCloseNode"
              onclick={this._expandAttachment}
              onkeydown={this._expandAttachment}
              class={CSS.closeFeatureContainer}
              title={i18n.closeFullScreen}
              tabIndex={
                !this.featureContentPanelIsOpen ||
                !this._fullAttachmentContainerIsOpen
                  ? -1
                  : 0
              }
            >
              <span
                class={this.classes(CSS.icons.closeIcon, CSS.icons.flush)}
              />
            </button>

            {attachmentLoader}
            <div
              bind={this}
              afterCreate={storeNode}
              data-node-ref="_mediaViewerContainerFullAttachment"
              key={buildKey("image-container")}
              class={CSS.mediaContainer}
            >
              {attachmentViewerContainer}
              {zoomSlider}
            </div>
            {attachmentScroll}
          </div>
        )}
      </div>
    );
  }

  // _renderZoomSlider
  private _renderZoomSlider(): VNode {
    return (
      <div class={CSS.zoomSlider}>
        <button
          bind={this}
          onclick={this._zoomOutImage}
          onkeydown={this._zoomOutImage}
          tabIndex={0}
          class={CSS.zoomSliderButton}
          title={i18n.zoomOutImage}
        >
          <span class={this.classes(CSS.slideSymbol, CSS.icons.minusIcon)} />
        </button>
        <input
          bind={this}
          afterCreate={storeNode}
          data-node-ref="_zoomSliderNode"
          type="range"
          min="100"
          max="500"
          step="10"
          oninput={event => {
            if (this._imageViewer) {
              this._imageViewer.zoom(event.target.valueAsNumber);
            }
          }}
        />
        <button
          bind={this}
          onclick={this._zoomInImage}
          onkeydown={this._zoomInImage}
          tabIndex={0}
          class={CSS.zoomSliderButton}
          title={i18n.zoomInImage}
        >
          <span class={this.classes(CSS.slideSymbol, CSS.icons.plusIcon)} />
        </button>
      </div>
    );
  }

  // _renderMapViewContainer
  private _renderMapViewContainer(): VNode {
    const mapView = this._renderMapView();
    return <div class={CSS.mapViewContainer}>{mapView}</div>;
  }

  // _renderMapView
  private _renderMapView(): VNode {
    return (
      <div
        bind={this.view.container}
        afterCreate={attachToNode}
        class={CSS.mapView}
      />
    );
  }

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
  @accessibleHandler()
  private _toggleOnboardingPanel(): void {
    if (this._onboardingPanelIsOpen) {
      this._onboardingPanelIsOpen = false;
    } else {
      this._onboardingPanelIsOpen = true;
    }
    this.scheduleRender();
  }

  // _disableOnboardingPanel
  @accessibleHandler()
  private _disableOnboardingPanel(): void {
    this._onboardingPanelIsOpen = false;
    this.scheduleRender();
  }

  // _selectGalleryItem
  @accessibleHandler()
  private _selectGalleryItem(event: Event): void {
    this.currentImageUrl = null;
    this.set("currentImageUrl", null);
    const node = event.currentTarget as HTMLElement;
    const objectId = node["data-object-id"] as number;
    this.viewModel.handleGalleryItem(objectId);
    this.featureContentPanelIsOpen = true;
    this.scheduleRender();
  }

  // _zoomTo
  @accessibleHandler()
  private _zoomTo(): void {
    if (document.body.clientWidth < 813) {
      this._currentMobileScreen = "maps";
      this.scheduleRender();
    }
    this.viewModel.zoomToMapCentric();
  }

  // _previousImage
  @accessibleHandler()
  private _previousImage(): void {
    this._disableImagePanZoom();
    this.viewModel.previousImage();
    if (
      (this.imagePanZoomEnabled && !this._fullAttachmentContainerIsOpen) ||
      !this.imagePanZoomEnabled
    ) {
      this.set("imageIsLoaded", false);
    }
    this.scheduleRender();
  }

  // _nextImage
  @accessibleHandler()
  private _nextImage(): void {
    this._disableImagePanZoom();
    this.viewModel.nextImage();
    if (
      (this.imagePanZoomEnabled && !this._fullAttachmentContainerIsOpen) ||
      !this.imagePanZoomEnabled
    ) {
      this.set("imageIsLoaded", false);
    }
    this.scheduleRender();
  }

  // _downloadImage
  @accessibleHandler()
  private _downloadImage(event: Event): void {
    this.viewModel.downloadImage(event);
  }

  // _closeFeatureContent
  @accessibleHandler()
  private _closeFeatureContent(): void {
    this.featureContentPanelIsOpen = false;
    this.currentImageUrl = null;
    this.set("viewModel.selectedAttachmentViewerData.attachmentIndex", 0);
    this.set("selectedAttachmentViewerData.selectedFeatureAddress", null);
    this.viewModel.closeTooltipPopup();
  }

  // _expandAttachment
  @accessibleHandler()
  private _expandAttachment(): void {
    if (this._fullAttachmentContainerIsOpen) {
      this._fullAttachmentContainerIsOpen = false;
      if (this.imagePanZoomEnabled) {
        this._imageViewer && this._imageViewer.destroy();
        this._imageViewer = null;
        this._imageViewerSet = false;
        this._imageZoomLoaded = false;
      }
      this._expandAttachmentNode && this._expandAttachmentNode.focus();
    } else {
      this._fullAttachmentContainerIsOpen = true;
      this._fullScreenCloseNode && this._fullScreenCloseNode.focus();
    }
    this.scheduleRender();
  }

  // _zoomInImage
  @accessibleHandler()
  private _zoomInImage(): void {
    if (this._imageViewer._state.zoomValue === 500) {
      return;
    }
    const updatedZoomValue = this._imageViewer._state.zoomValue + 50;
    this._imageViewer.zoom(updatedZoomValue);
    this._zoomSliderNode.value = `${updatedZoomValue}`;
    this.scheduleRender();
  }

  // _zoomOutImage
  @accessibleHandler()
  private _zoomOutImage(): void {
    if (this._imageViewer._state.zoomValue === 0) {
      return;
    }
    const updatedZoomValue = this._imageViewer._state.zoomValue - 50;
    this._imageViewer.zoom(updatedZoomValue);
    this._zoomSliderNode.value = `${updatedZoomValue}`;
    this.scheduleRender();
  }

  // _handleContent
  @accessibleHandler()
  private _handleNavItem(event: Event): void {
    const node = event.currentTarget as HTMLElement;
    const navItem = node.getAttribute("data-nav-item") as string;
    this._currentMobileScreen = navItem;
    this.scheduleRender();
  }

  //----------------------------------
  //
  //  END OF ACCESSIBLE HANDLERS
  //
  //----------------------------------

  // _triggerScrollQuery
  private _triggerScrollQuery(): void {
    const { _triggerScrollElement } = this;
    if (!_triggerScrollElement) {
      return;
    }
    const { scrollTop, scrollHeight, offsetHeight } = _triggerScrollElement;
    if (scrollTop + 10 > scrollHeight - offsetHeight) {
      this.viewModel.updateAttachmentDataMapCentric();
    }
  }

  // _fadeInImage
  private _fadeInImage(imageElement: HTMLImageElement): void {
    imageElement.onload = () => {
      this.set("imageIsLoaded", true);
      imageElement.style.opacity = "1";
    };
  }

  // _processTitle
  private _processTitle(objectId: number): void {
    const featureWidget = this.get(
      "view.popup.selectedFeatureWidget"
    ) as __esri.Feature;
    const attributes = featureWidget && featureWidget.get("graphic.attributes");
    const objectIdField = this.viewModel.getObjectIdField();

    const waitingForContent =
      featureWidget && featureWidget.get("viewModel.waitingForContent");
    let title = null;
    if (attributes && objectIdField) {
      if (!waitingForContent && attributes[objectIdField] === objectId) {
        title = this.get("view.popup.title");
      } else {
        title = null;
      }
    }
    const featureTitle = title ? `${title}` : null;
    return featureTitle
      ? title.length >= 30
        ? `${title
            .split("")
            .slice(0, 25)
            .join("")}...`
        : title
      : null;
  }

  // _openToolTipPopup
  private _openToolTipPopup(event: Event): void {
    this.viewModel.openTooltipPopup(event);
  }

  // _closeToolTipPopup
  private _closeToolTipPopup(): void {
    this.viewModel.closeTooltipPopup();
  }

  // _handleImagePanZoom
  private _handleImagePanZoom(attachment: __esri.AttachmentInfo): void {
    const contentType = attachment && (attachment.get("contentType") as string);
    const contentTypesToCheck = [
      "image/gif",
      "video/mp4",
      "video/mov",
      "video/quicktime",
      "application/pdf"
    ];

    const contentTypeCheck = contentTypesToCheck.indexOf(contentType) === -1;
    if (
      this.currentImageUrl &&
      this._fullAttachmentContainerIsOpen &&
      contentTypeCheck
    ) {
      if (this._mediaViewerContainerFullAttachment && !this._imageViewerSet) {
        if (this._imageViewer) {
          this._imageViewer.destroy();
          this._imageViewer = null;
        }
        this._imageViewer = new ImageViewer(
          this._mediaViewerContainerFullAttachment,
          {
            snapView: false,
            zoomOnMouseWheel: false,
            zoomValue: 100,
            maxZoom: 500
          }
        );
        this._imageViewerSet = true;
        this.scheduleRender();
      }

      if (this._imageViewerSet && !this._imageZoomLoaded && contentTypeCheck) {
        this._imageViewer.load(this.currentImageUrl);
        const rotation =
          attachment && (attachment.get("orientationInfo.rotation") as number);
        if (rotation) {
          const ivImageElement = document.querySelector(
            ".iv-image"
          ) as HTMLImageElement;
          ivImageElement.style.transform = `rotate(${rotation}deg)`;
        }
        this._imageZoomLoaded = true;
        this.scheduleRender();
      }
    }
  }

  // _disableImagePanZoom
  private _disableImagePanZoom(): void {
    if (this.imagePanZoomEnabled) {
      this._imageViewer && this._imageViewer.destroy();
      this._imageViewer = null;
      this._imageViewerSet = false;
      this._imageZoomLoaded = false;
      if (this._zoomSliderNode) {
        this._zoomSliderNode.value = "0";
      }
    }
  }

  // _generateNavObjects
  private _generateNavObjects(): NavItem[] {
    const iconUi = "icon-ui-";
    const navData = ["description", "media", "maps"];
    return navData.map(navDataItem => {
      return {
        type: navDataItem,
        iconClass: `${iconUi}${navDataItem}`
      };
    });
  }

  // _getLayerId
  private _getLayerId(): string {
    return this.get("selectedAttachmentViewerData.layerData.featureLayer.id");
  }
}

export = MapCentric;
