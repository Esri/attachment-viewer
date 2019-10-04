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

// esri.core.accessorSupport
import {
  subclass,
  declared,
  property,
  aliasOf
} from "esri/core/accessorSupport/decorators";

//esri.widgets.support
import {
  accessibleHandler,
  renderable,
  tsx,
  storeNode
} from "esri/widgets/support/widget";

// nls
import * as i18n from "dojo/i18n!./PhotoCentric/nls/resources";

// esri.widgets
import Widget = require("esri/widgets/Widget");

// esri.core
import watchUtils = require("esri/core/watchUtils");

// PhotoCentricViewModel
import PhotoCentricViewModel = require("./PhotoCentric/PhotoCentricViewModel");

// utils
import { attachToNode } from "./utils/utils";

// Custom Share
import Share = require("./Share");

// interfaces
import { VNode } from "../interfaces/interfaces";

// getOrientationStyles
import {
  getOrientationStyles,
  getOrientationStylesMobile
} from "./utils/imageUtils";

// autoLink
import { autoLink } from "./utils/urlUtils";

// PhotoCentricData
import PhotoCentricData = require("./PhotoCentric/PhotoCentricData");

// AttachmentViewerData
import AttachmentViewerData = require("./AttachmentViewer/AttachmentViewerData");

// LayerSwitcher
import LayerSwitcher = require("./LayerSwitcher");

// ImageViewer
import ImageViewer = require("ImageViewer");

//----------------------------------
//
//  CSS Classes
//
//----------------------------------

const CSS = {
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
  onboardingContentContainer:
    "esri-photo-centric__onboarding-content-container",
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
  mobileAttachmentsAddPadding:
    "esri-photo-centric__mobile-attachments-add-padding",
  transparentBackground: "esri-photo-centric__transparent-background",
  removeBorderRadius:
    "esri-photo-centric__mobile-attachments-remove-border-radius",
  // loader
  widgetLoader: "esri-widget__loader esri-photo-centric__loader",
  animationLoader:
    "esri-widget__loader-animation esri-photo-centric__loader-animation",
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

const WIDGET_KEY_PARTIAL = "esri-photo-centric";

function buildKey(element: string, index?: number): string {
  if (index === undefined) {
    return `${WIDGET_KEY_PARTIAL}__${element}`;
  }
}

@subclass("PhotoCentric")
class PhotoCentric extends declared(Widget) {
  constructor(value?: any) {
    super();
  }

  //----------------------------------
  //
  //  Private Variables
  //
  //----------------------------------
  private _mapAndSearchIsExpanded = true;
  private _imageAttachment: HTMLImageElement = null;
  private _imageCarouselIsOpen: boolean = null;
  private _photoViewerContainer: HTMLElement = null;
  private _mobileAttachment: HTMLElement = null;
  private _onboardingPanelIsOpen: boolean = null;
  private _featureContentAvailable: boolean = null;
  private _previousImageUrl: string = null;
  private _featureContentPanel: HTMLElement = null;
  private _imageViewerSet = false;
  private _imageViewer: any = null;
  private _imageZoomLoaded: boolean = null;
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
  @renderable()
  currentImageUrl: string = null;

  // defaultObjectId
  @aliasOf("viewModel.defaultObjectId")
  @property()
  defaultObjectId: number = null;

  // docDirection
  @property()
  docDirection: string = null;

  // downloadEnabled
  @aliasOf("viewModel.downloadEnabled")
  @property()
  @renderable()
  downloadEnabled: boolean = null;

  // featureLayerTitle
  @aliasOf("viewModel.featureLayerTitle")
  @property()
  featureLayerTitle: string = null;

  // featureWidget
  @aliasOf("viewModel.featureWidget")
  @property()
  featureWidget: __esri.Feature = null;

  // graphicsLayer
  @aliasOf("viewModel.graphicsLayer")
  @property()
  graphicsLayer: __esri.GraphicsLayer = null;

  // imageDirectionEnabled
  @aliasOf("viewModel.imageDirectionEnabled")
  @property()
  imageDirectionEnabled: boolean = null;

  // imageIsLoaded
  @aliasOf("viewModel.imageIsLoaded")
  @renderable()
  @property()
  imageIsLoaded: boolean = null;

  // imagePanZoomEnabled
  @aliasOf("viewModel.imagePanZoomEnabled")
  @property()
  imagePanZoomEnabled: boolean = null;

  // layerSwitcher
  @aliasOf("viewModel.layerSwitcher")
  @property()
  layerSwitcher: LayerSwitcher = null;

  // onboardingButtonText
  @property()
  @renderable()
  onboardingButtonText: string = null;

  // onboardingContent
  @property()
  onboardingContent: any = null;

  // onboardingImage
  @property()
  @renderable()
  onboardingImage: string = null;

  // onlyDisplayFeaturesWithAttachments
  @aliasOf("viewModel.onlyDisplayFeaturesWithAttachmentsIsEnabled")
  @property()
  @renderable()
  onlyDisplayFeaturesWithAttachmentsIsEnabled: boolean = null;

  // order
  @aliasOf("viewModel.order")
  @property()
  order: string = null;

  // photoCentricSketchExtent
  @aliasOf("viewModel.photoCentricSketchExtent")
  @property()
  photoCentricSketchExtent: __esri.Extent = null;

  // searchWidget
  @aliasOf("viewModel.searchWidget")
  @property()
  searchWidget: __esri.Search = null;

  // selectedAttachmentViewerData
  @aliasOf("viewModel.selectedAttachmentViewerData")
  @renderable()
  @property()
  selectedAttachmentViewerData: PhotoCentricData = null;

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

  // title
  @aliasOf("viewModel.title")
  @property()
  title: string = null;

  // selectFeaturesEnabled
  @aliasOf("viewModel.selectFeaturesEnabled")
  @property()
  selectFeaturesEnabled: boolean = null;

  // selectedLayerId
  @aliasOf("viewModel.selectedLayerId")
  @property()
  selectedLayerId: string = null;

  // view
  @aliasOf("viewModel.view")
  @property()
  view: __esri.MapView = null;

  // zoomLevel
  @aliasOf("viewModel.zoomLevel")
  @property()
  zoomLevel: string = null;

  // viewModel
  @renderable(["viewModel.state"])
  @property({
    type: PhotoCentricViewModel
  })
  viewModel: PhotoCentricViewModel = new PhotoCentricViewModel();

  //----------------------------------
  //
  //  Lifecycle
  //
  //----------------------------------

  postInitialize() {
    this.own([
      watchUtils.whenOnce(this, "view.ready", () => {
        this._initOnViewReady();
      })
    ]);
  }

  // _initOnViewReady
  private _initOnViewReady(): void {
    this._handleOnboardingPanel();
    this.own([
      this._handleCurrentAttachment(),
      this._scrollFeatureContentPanelToTop(),
      this._scheduleRenderOnLayerFeatureChange(),
      this._handleSelectFeaturesWatchers(),
      watchUtils.whenFalse(this, "imageIsLoaded", () => {
        if (this._imageAttachment) {
          this._imageAttachment.style.opacity = "0";
        }
      })
    ]);
    if (this.imagePanZoomEnabled) {
      this.own([this._setImageZoomLoadedToFalse()]);
    }
  }

  // _handleOnboardingPanel
  private _handleOnboardingPanel(): void {
    if (localStorage.getItem("firstTimeUseApp")) {
      this._onboardingPanelIsOpen = false;
    } else {
      this._onboardingPanelIsOpen = true;
      localStorage.setItem("firstTimeUseApp", `${Date.now()}`);
    }
    this.scheduleRender();
  }

  // _handleCurrentAttachment
  private _handleCurrentAttachment(): __esri.WatchHandle {
    return watchUtils.watch(
      this,
      [
        "selectedAttachmentViewerData.selectedFeatureAttachments",
        "selectedAttachmentViewerData.attachmentIndex"
      ],
      () => {
        this._previousImageUrl = this.currentImageUrl;

        const attachments = this.get(
          "selectedAttachmentViewerData.selectedFeatureAttachments.attachments"
        ) as __esri.Collection<__esri.AttachmentInfo>;
        const attachmentIndex = this.get(
          "selectedAttachmentViewerData.attachmentIndex"
        ) as number;

        const attachment =
          attachments &&
          (attachments.getItemAt(attachmentIndex) as __esri.AttachmentInfo);

        const attachmentUrl = attachment ? attachment.url : null;
        this.currentImageUrl = this._convertAttachmentUrl(attachmentUrl);
        this._handlePanZoomForCurrentAttachment(attachment);
        this.scheduleRender();
      }
    );
  }

  // _handlePanZoomForCurrentAttachment
  private _handlePanZoomForCurrentAttachment(
    attachment: __esri.AttachmentInfo
  ): void {
    if (
      this.imagePanZoomEnabled &&
      this._imageViewer &&
      document.body.clientWidth > 813
    ) {
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
  }

  // _scrollFeatureContentPanelToTop
  private _scrollFeatureContentPanelToTop(): __esri.WatchHandle {
    return watchUtils.watch(
      this,
      "selectedAttachmentViewerData.objectIdIndex",
      () => {
        if (this._featureContentPanel) {
          this._featureContentPanel.scrollTop = 0;
        }
      }
    );
  }

  // _setImageZoomLoadedToFalse
  private _setImageZoomLoadedToFalse(): __esri.WatchHandle {
    return watchUtils.watch(this, "selectedAttachmentViewerData", () => {
      this._imageZoomLoaded = false;
      this.scheduleRender();
    });
  }

  // _scheduleRenderOnLayerFeatureChange
  private _scheduleRenderOnLayerFeatureChange(): __esri.WatchHandle {
    return watchUtils.on(
      this,
      "selectedAttachmentViewerData.layerFeatures",
      "change",
      () => {
        this.scheduleRender();
      }
    );
  }

  // _handleSelectFeaturesWatchers
  private _handleSelectFeaturesWatchers(): __esri.WatchHandle {
    return watchUtils.whenOnce(this, "selectFeaturesEnabled", () => {
      this._handleScheduleRenderOnSketchEvent();
    });
  }

  // _handleScheduleRenderOnSketchEvent
  private _handleScheduleRenderOnSketchEvent(): void {
    this.own([
      this.sketchWidget.on("create", () => {
        this.scheduleRender();
      }),
      this.sketchWidget.on("update", () => {
        this.scheduleRender();
      })
    ]);
  }

  render() {
    const header = this._renderHeader();
    const homePage = this._renderHomePage();
    const onboarding = this._renderOnboarding();
    return (
      <div class={CSS.base}>
        {!this._imageCarouselIsOpen ? header : null}
        {this._onboardingPanelIsOpen && document.body.clientWidth < 813 ? (
          <div key={buildKey("onboarding-node")} class={CSS.onboarding}>
            {onboarding}
          </div>
        ) : null}
        {homePage}
      </div>
    );
  }

  destroy() {
    this._onboardingPanelIsOpen = null;
    this._mapAndSearchIsExpanded = null;
    this._imageCarouselIsOpen = null;
    if (this.imagePanZoomEnabled && this._imageViewer) {
      this._imageViewer.destroy();
      this._imageViewer = null;
    }
  }

  //----------------------------------
  //
  //  START OF RENDER NODE METHODS
  //
  //----------------------------------

  // _renderHeader
  private _renderHeader(): VNode {
    const title =
      document.body.clientWidth < 813 && this.title.length > 40
        ? `${this.title
            .split("")
            .slice(0, 35)
            .join("")}...`
        : this.title;
    const layerFeatures = this.get(
      "selectedAttachmentViewerData.layerFeatures"
    ) as __esri.Collection<__esri.Graphic>;
    const shareWidget =
      this.shareLocationWidget &&
      layerFeatures &&
      layerFeatures.length &&
      document.body.clientWidth > 813
        ? this._renderShareLocationWidget()
        : null;
    return (
      <header class={CSS.header}>
        <div class={CSS.headerContainer}>
          <div class={CSS.titleInfoContainer}>
            <h1 class={CSS.headerText}>{title}</h1>
            <span
              bind={this}
              onclick={this._toggleOnboardingPanel}
              onkeydown={this._toggleOnboardingPanel}
              tabIndex={0}
              class={this.classes(
                CSS.infoButton,
                CSS.calcite.descriptionIcon,
                CSS.calcite.flush
              )}
              title={i18n.viewDetails}
            />
          </div>
        </div>
        <div class={CSS.shareWidgetContainer}>{shareWidget}</div>
      </header>
    );
  }

  // _renderShareWidget
  private _renderShareLocationWidget(): VNode {
    return (
      <div
        class={CSS.shareLocationWidget}
        bind={this.shareLocationWidget.container}
        afterCreate={attachToNode}
      />
    );
  }

  // _renderHomePage
  private _renderHomePage(): VNode {
    const onboarding = this._renderOnboarding();
    const content = this._renderContent();
    const mediaViewerDesktop = this._renderMediaViewerDesktop();
    const { clientWidth } = document.body;
    return (
      <div
        key={buildKey("main-page")}
        class={CSS.mainPageContainer}
        role="main"
      >
        <div class={CSS.mainPage}>
          {this._onboardingPanelIsOpen && clientWidth > 813 ? (
            <div class={CSS.onboardingOverlay}>{onboarding}</div>
          ) : null}
          {content}
        </div>
        {mediaViewerDesktop}
      </div>
    );
  }

  // _renderContent
  private _renderContent(): VNode {
    const mapView = this._renderMapView();
    const pagination = this._renderPagination();
    const mapCollapsed = {
      [CSS.mapCollapsed]: !this._mapAndSearchIsExpanded
    };
    const expandCollapse = this._renderExpandCollapse();
    const attachmentsContainer = this._renderAttachmentsContainer();

    const featureContentExpanded = {
      [CSS.mainPageBottom]: this._mapAndSearchIsExpanded,
      [CSS.mainPageBottomExpanded]: !this._mapAndSearchIsExpanded
    };

    return (
      <div
        key={buildKey("map-attachment-content")}
        class={CSS.mapAttachmentContent}
      >
        <div class={this.classes(CSS.mainPageTop, mapCollapsed)}>
          {pagination}
          {this._mapAndSearchIsExpanded ? (
            <div key={buildKey("mapview-search")} class={CSS.mapViewAndSearch}>
              {mapView}
            </div>
          ) : null}
        </div>

        <div class={CSS.mainPageMid}>{expandCollapse}</div>
        <div
          key={buildKey("feature-content-panel")}
          class={this.classes(featureContentExpanded)}
        >
          {attachmentsContainer}
        </div>
      </div>
    );
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

  // _renderPagination
  private _renderPagination(): VNode {
    const { selectedAttachmentViewerData } = this;

    const featureTotal =
      selectedAttachmentViewerData &&
      (selectedAttachmentViewerData.get("featureObjectIds.length") as number);

    const leftButtonLayerSwitcherContainer = this._renderLeftButtonLayerSwitcherContainer(
      featureTotal
    );

    const rightFeatureScrollButton = this._renderRightFeatureScrollButton(
      featureTotal
    );

    const paginationNumbers = featureTotal
      ? this._renderPaginationNumbers(featureTotal)
      : null;

    return (
      <div key={buildKey("feature-pagination")} class={CSS.paginationContainer}>
        {leftButtonLayerSwitcherContainer}
        {paginationNumbers}
        {rightFeatureScrollButton}
      </div>
    );
  }

  // _renderLeftButtonLayerSwitcherContainer
  private _renderLeftButtonLayerSwitcherContainer(featureTotal: number): VNode {
    const previousFeatureButton = this._renderPreviousFeatureButton(
      featureTotal
    );
    const nextFeatureButton = this._renderNextFeatureButton(featureTotal);
    const layerSwitcherButton =
      this.get("layerSwitcher.featureLayerCollection.length") > 1
        ? this._renderLayerSwitcherButton()
        : null;

    if (this.docDirection === "ltr") {
      return (
        <div
          key={buildKey("left-button-layer-switcher")}
          class={CSS.leftButtonLayerSwitcher}
        >
          {previousFeatureButton}
          {layerSwitcherButton}
        </div>
      );
    } else {
      return (
        <div
          key={buildKey("left-button-layer-switcher")}
          class={CSS.leftButtonLayerSwitcher}
        >
          {layerSwitcherButton}
          {nextFeatureButton}
        </div>
      );
    }
  }

  // _renderPreviousFeatureButton
  private _renderPreviousFeatureButton(featureTotal: number): VNode {
    const { selectedAttachmentViewerData } = this;
    return (
      <button
        bind={this}
        onclick={this._previousFeature}
        onkeydown={this._previousFeature}
        tabIndex={0}
        class={CSS.leftArrowContainer}
        disabled={
          this._onboardingPanelIsOpen ||
          featureTotal === 1 ||
          (selectedAttachmentViewerData &&
            selectedAttachmentViewerData.layerFeatures &&
            selectedAttachmentViewerData.layerFeatures.length === 0) ||
          !selectedAttachmentViewerData
            ? true
            : false
        }
        title={i18n.previousLocation}
      >
        <span class={this.classes(CSS.calcite.leftArrow, CSS.calcite.flush)} />
      </button>
    );
  }

  // _renderNextFeatureButton
  private _renderNextFeatureButton(featureTotal: number): VNode {
    const { selectedAttachmentViewerData } = this;
    return (
      <button
        bind={this}
        onclick={this._nextFeature}
        onkeydown={this._nextFeature}
        tabIndex={0}
        class={CSS.leftArrowContainer}
        disabled={
          this._onboardingPanelIsOpen ||
          featureTotal === 1 ||
          (selectedAttachmentViewerData &&
            selectedAttachmentViewerData.layerFeatures &&
            selectedAttachmentViewerData.layerFeatures.length === 0) ||
          !selectedAttachmentViewerData
            ? true
            : false
        }
        title={i18n.nextLocation}
      >
        <span class={this.classes(CSS.calcite.leftArrow, CSS.calcite.flush)} />
      </button>
    );
  }

  // _renderRightFeatureScrollButton
  private _renderRightFeatureScrollButton(featureTotal: number): VNode {
    const { selectedAttachmentViewerData } = this;
    return (
      <button
        bind={this}
        onclick={
          this.docDirection === "rtl"
            ? this._previousFeature
            : this._nextFeature
        }
        onkeydown={
          this.docDirection === "rtl"
            ? this._previousFeature
            : this._nextFeature
        }
        tabIndex={0}
        class={CSS.rightArrowContainer}
        disabled={
          this._onboardingPanelIsOpen ||
          featureTotal === 1 ||
          (selectedAttachmentViewerData &&
            selectedAttachmentViewerData.layerFeatures &&
            selectedAttachmentViewerData.layerFeatures.length === 0) ||
          !selectedAttachmentViewerData
            ? true
            : false
        }
        title={
          this.docDirection === "rtl"
            ? i18n.previousLocation
            : i18n.nextLocation
        }
      >
        <span class={this.classes(CSS.calcite.rightArrow, CSS.calcite.flush)} />
      </button>
    );
  }

  // _renderPaginationNumbers
  private _renderPaginationNumbers(featureTotal: number): VNode {
    const { selectedAttachmentViewerData } = this;
    const currentlayerFeatureIndex =
      selectedAttachmentViewerData &&
      selectedAttachmentViewerData.objectIdIndex + 1;
    return (
      <div class={CSS.paginationTextContainer}>{`${
        document.body.clientWidth > 813 ? `${i18n.upperCaseLocations}: ` : ""
      }${currentlayerFeatureIndex} / ${featureTotal}`}</div>
    );
  }

  // _renderLayerSwitcherButton
  private _renderLayerSwitcherButton(): VNode {
    return (
      <div
        bind={this.layerSwitcher.container}
        class={CSS.layerSwitcherContainer}
        afterCreate={attachToNode}
      />
    );
  }

  // _renderExpandCollapse
  private _renderExpandCollapse(): VNode {
    return (
      <div
        bind={this}
        onclick={this._toggleExpand}
        onkeydown={this._toggleExpand}
        tabIndex={0}
        class={CSS.expandCollapseContainer}
      >
        <span
          class={this.classes(
            this._mapAndSearchIsExpanded
              ? CSS.calcite.upArrow
              : CSS.calcite.downArrow,
            CSS.calcite.flush
          )}
        />
      </div>
    );
  }

  // _renderOnboarding
  private _renderOnboarding(): VNode {
    const onboardingWelcomeContent = this._renderOnboardingWelcomeContent();
    const onboardingStartButton = this._renderOnboardingStartButton();
    return (
      <div
        key={buildKey("onboarding-container")}
        class={CSS.onboardingContainer}
      >
        <div class={CSS.onboardingContentContainer}>
          {onboardingWelcomeContent}
        </div>
        {onboardingStartButton}
      </div>
    );
  }

  // _renderOnboardingWelcomeContent
  private _renderOnboardingWelcomeContent(): VNode {
    return (
      <div key={buildKey("onboarding-welcome")}>
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
            CSS.calcite.button,
            CSS.calcite.buttonFill
          )}
        >
          {buttonText}
        </button>
      </div>
    );
  }

  // _renderMediaContainer
  private _renderMediaContainer(): VNode {
    const attachments = this.get(
      "selectedAttachmentViewerData.selectedFeatureAttachments.attachments"
    ) as __esri.Collection<__esri.AttachmentInfo>;

    const attachment = this._getCurrentAttachment(attachments);

    const downloadEnabled = {
      [CSS.downloadEnabled]: !this.downloadEnabled
    };

    const contentTypeCheck = this._validateContentType(attachment);
    const mediaViewerLoader =
      this.selectedAttachmentViewerData &&
      !this.imageIsLoaded &&
      !this.imagePanZoomEnabled
        ? this._renderMediaViewerLoader()
        : null;

    const mediaViewerContainer = this._renderMediaViewerContainer(attachment);

    const onboardingImage =
      this._onboardingPanelIsOpen && this.onboardingImage
        ? this._renderOnboardingImage()
        : null;

    const zoomSlider =
      this.imagePanZoomEnabled &&
      document.body.clientWidth > 813 &&
      this.currentImageUrl &&
      contentTypeCheck &&
      this.imagePanZoomEnabled
        ? this._onboardingPanelIsOpen && this.onboardingImage
          ? null
          : this._renderZoomSlider()
        : null;

    const mediaViewerFooter = this._renderMediaViewerFooter();

    return (
      <div class={CSS.rightPanel}>
        <div
          key={buildKey("image-container")}
          class={this.classes(downloadEnabled, CSS.photoViewer)}
        >
          {mediaViewerContainer}
          {mediaViewerLoader}
          {onboardingImage}
          {zoomSlider}
          {mediaViewerFooter}
        </div>
      </div>
    );
  }

  // _renderMediaViewerLoader
  private _renderMediaViewerLoader(): VNode {
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

  // _renderNoAttachmentsContainer
  private _renderNoAttachmentsContainer(): VNode {
    return (
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

        <span class={CSS.noAttachmentsText}>
          {i18n.noPhotoAttachmentsFound}
        </span>
      </div>
    );
  }

  // _renderMediaViewerContainer
  private _renderMediaViewerContainer(
    attachment: __esri.AttachmentInfo
  ): VNode {
    const hasOnboardingImage = {
      [CSS.hasOnboardingImage]:
        this._onboardingPanelIsOpen && this.onboardingImage
    };

    const { currentImageUrl } = this;

    const currentImage =
      !this.imagePanZoomEnabled ||
      (attachment &&
        attachment.contentType &&
        attachment.contentType.indexOf("gif") !== -1)
        ? this._renderCurrentImage()
        : null;

    const media =
      attachment && attachment.contentType
        ? attachment.contentType.indexOf("video") !== -1
          ? this._renderVideo(currentImageUrl)
          : attachment.contentType.indexOf("pdf") !== -1
          ? this._renderPDF(currentImageUrl)
          : currentImage
        : null;

    const supportsAttachment = this.get(
      "selectedAttachmentViewerData.layerData.featureLayer.capabilities.data.supportsAttachment"
    );
    const attachments = this.get(
      "selectedAttachmentViewerData.selectedFeatureAttachments.attachments"
    ) as __esri.Collection<__esri.AttachmentInfo>;

    const videoStyles = {
      [CSS.attachmentIsVideo]:
        attachment &&
        attachment.contentType &&
        attachment.contentType.indexOf("video") !== -1
    };

    return (
      <div
        bind={this}
        afterCreate={storeNode}
        data-node-ref="_photoViewerContainer"
        class={this.classes(
          CSS.imageContainer,
          hasOnboardingImage,
          videoStyles
        )}
      >
        {supportsAttachment === false ? (
          <div class={CSS.layerNotSupported}>{i18n.notSupported}</div>
        ) : !this.selectedAttachmentViewerData ||
          (attachments && attachments.length === 0) ? (
          this._renderNoAttachmentsContainer()
        ) : (
          media
        )}
      </div>
    );
  }

  // _renderVideo
  private _renderVideo(currentImageUrl: string): VNode {
    this.set("imageIsLoaded", true);
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

  // _renderPDF
  private _renderPDF(currentImageUrl: string): VNode {
    this.set("imageIsLoaded", true);
    return (
      <embed
        class={CSS.pdf}
        key={buildKey(`pdf-${currentImageUrl}`)}
        src={currentImageUrl}
        type="application/pdf"
      />
    );
  }

  // _renderCurrentImage
  private _renderCurrentImage(): VNode {
    const attachments = this.get(
      "selectedAttachmentViewerData.selectedFeatureAttachments.attachments"
    ) as __esri.Collection<__esri.AttachmentInfo>;

    const attachment = this._getCurrentAttachment(attachments);
    const name = attachment ? attachment.name : null;
    return (
      <img
        bind={this}
        class={this.classes(CSS.imageDesktop)}
        src={this.currentImageUrl ? this.currentImageUrl : ""}
        onload={this._removeImageLoader}
        afterCreate={storeNode}
        data-node-ref="_imageAttachment"
        data-attachment={attachment}
        alt={name}
      />
    );
  }

  // _renderOnboardingImage
  private _renderOnboardingImage(): VNode {
    return (
      <div class={CSS.imageContainer}>
        <img src={this.onboardingImage} />
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
          title={i18n.zoomOutImage}
          class={CSS.zoomSliderButton}
          tabIndex={0}
        >
          <span class={this.classes(CSS.slideSymbol, CSS.calcite.minusIcon)} />
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
          <span class={this.classes(CSS.slideSymbol, CSS.calcite.plusIcon)} />
        </button>
      </div>
    );
  }

  // _renderMediaViewerFooter
  private _renderMediaViewerFooter(): VNode {
    const attachments = this.get(
      "selectedAttachmentViewerData.selectedFeatureAttachments.attachments"
    ) as __esri.Collection<__esri.AttachmentInfo>;

    const attachment = this._getCurrentAttachment(attachments);

    const attachmentScrollContent =
      attachments && attachments.length > 0
        ? this._renderAttachmentScrollContent(attachments)
        : null;
    const contentType = attachment && (attachment.get("contentType") as string);

    const downloadButton =
      contentType &&
      contentType.indexOf("video") === -1 &&
      contentType.indexOf("gif") === -1 &&
      contentType.indexOf("pdf") === -1 &&
      this.downloadEnabled
        ? this.viewModel.state === "downloading"
          ? this._renderDownloadLoaderIcon()
          : this._renderDownloadButton(attachment)
        : null;

    return (
      <div key={buildKey("attachment-count")} class={CSS.attachmentNumber}>
        {attachmentScrollContent}
        {downloadButton}
      </div>
    );
  }

  // _renderMediaViewerDesktop
  private _renderMediaViewerDesktop(): VNode {
    const mediaContainer = this._renderMediaContainer();
    return <div class={CSS.imageViewerDesktop}>{mediaContainer}</div>;
  }

  // _renderDownloadButton
  private _renderDownloadButton(attachment: __esri.AttachmentInfo): VNode {
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
      >
        <span
          class={this.classes(
            CSS.calcite.downloadIcon,
            CSS.calcite.flush,
            CSS.downloadIcon
          )}
        />
      </button>
    );
  }

  // _renderDownloadIcon
  private _renderDownloadLoaderIcon(): VNode {
    return (
      <div class={CSS.downloadIconContainer}>
        <span
          class={this.classes(
            CSS.calcite.loadingIcon,
            CSS.calcite.rotating,
            CSS.spinner
          )}
          role="presentation"
        />
      </div>
    );
  }

  // _renderAttachmentScrollContent
  private _renderAttachmentScrollContent(
    attachments: __esri.Collection<__esri.AttachmentInfo>
  ): VNode {
    const attachment = this._getCurrentAttachment(attachments);
    const attachmentScroll = this._renderAttachmentScroll(attachments);
    const imageDirection = this._renderImageDirection(attachment);
    return (
      <div
        key={buildKey("download-attachment")}
        class={CSS.downloadIconTextContainer}
      >
        {attachmentScroll}
        {imageDirection}
      </div>
    );
  }

  // _renderAttachmentScroll
  private _renderAttachmentScroll(
    attachments: __esri.Collection<__esri.AttachmentInfo>
  ): VNode {
    const { selectedAttachmentViewerData } = this;
    const currentIndex =
      selectedAttachmentViewerData &&
      selectedAttachmentViewerData.attachmentIndex + 1;
    const totalNumberOfAttachments = this.viewModel.getTotalNumberOfAttachments();

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
          title={i18n.previousImage}
        >
          {this.docDirection === "rtl" ? (
            <span
              class={this.classes(CSS.calcite.rightArrow, CSS.calcite.flush)}
            />
          ) : (
            <span
              class={this.classes(CSS.calcite.leftArrow, CSS.calcite.flush)}
            />
          )}
        </button>
        <span class={CSS.attachmentNumberText}>
          {`${i18n.upperCaseAttachments}: ${currentIndex} / ${totalNumberOfAttachments}`}
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
          title={i18n.nextImage}
        >
          {this.docDirection === "rtl" ? (
            <span
              class={this.classes(CSS.calcite.leftArrow, CSS.calcite.flush)}
            />
          ) : (
            <span
              class={this.classes(CSS.calcite.rightArrow, CSS.calcite.flush)}
            />
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
      <div
        key={buildKey(
          `gps-image-direction-${attachment.name}-${attachment.size}-${attachment.url}-${imageDirectionValue}`
        )}
        class={CSS.gpsImageDirection}
      >
        <span class={CSS.imageDirectionDegrees}>
          {i18n.gpsImageDirection}: {`${imageDirectionValue}`}&deg;
        </span>

        <div
          title={`${i18n.gpsImageDirection}: ${imageDirectionValue}\u00B0`}
          class={CSS.imageDirection}
        >
          <svg
            styles={{ transform: `rotateZ(${imageDirectionValue}deg)` }}
            class={CSS.photoCentricCamera}
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

  // _renderAttachmentsContainer
  private _renderAttachmentsContainer(): VNode {
    const attachments = this.get(
      "selectedAttachmentViewerData.selectedFeatureAttachments.attachments"
    ) as __esri.Collection<__esri.AttachmentInfo>;
    const { clientWidth } = document.body;
    const attachmentsMobile =
      attachments && clientWidth < 813
        ? this._renderAttachmentsMobile(attachments)
        : null;

    const titleZoomToContainer = this._renderTitleZoomToContainer();
    const selectedFeatureAddress = this.get(
      "selectedAttachmentViewerData.selectedFeatureAddress"
    );

    const featureInformation = this._renderFeatureInformation();

    return (
      <div
        bind={this}
        afterCreate={storeNode}
        data-node-ref="_featureContentPanel"
        class={CSS.featureContent}
      >
        {titleZoomToContainer}

        {selectedFeatureAddress ? (
          <h3 class={CSS.addressText}>{selectedFeatureAddress}</h3>
        ) : null}
        <div class={CSS.attachmentsImageContainer}>{attachmentsMobile}</div>
        {featureInformation}
      </div>
    );
  }

  // _renderFeatureInformation
  private _renderFeatureInformation(): VNode {
    const featureWidgetContent = this.get(
      "viewModel.featureWidget.viewModel.content"
    ) as __esri.Content[];
    const fieldsInfoContent =
      (featureWidgetContent &&
        featureWidgetContent.filter(contentItem => {
          const fieldInfos = contentItem.get(
            "fieldInfos"
          ) as __esri.FieldInfo[];
          return (
            contentItem.type === "fields" && fieldInfos && fieldInfos.length > 0
          );
        })) ||
      [];
    const fieldsInfoText =
      (featureWidgetContent &&
        featureWidgetContent.filter(contentItem => {
          return contentItem.type === "text";
        })) ||
      [];

    const mediaInfoContent =
      (featureWidgetContent &&
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

    const unsupportedAttachmentTypesData = this.get(
      "selectedAttachmentViewerData.unsupportedAttachmentTypes"
    ) as any[];
    const unsupportedAttachmentTypes =
      unsupportedAttachmentTypesData &&
      unsupportedAttachmentTypesData.length > 0
        ? this._renderUnsupportedAttachmentTypes()
        : null;

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
      <div class={CSS.featureContentContainer}>
        {(fieldsInfoText && fieldsInfoText.length > 0) ||
        (mediaInfoContent && mediaInfoContent.length > 0) ||
        this._featureContentAvailable ? (
          <div>
            {this._featureContentAvailable ? (
              <div
                key={buildKey(`feature-info-${layerId}-${objectId}`)}
                class={CSS.featureInfoContainer}
              >
                {this._renderFeatureInfoContent()}
              </div>
            ) : null}
            {(mediaInfoContent && mediaInfoContent.length > 0) ||
            (fieldsInfoText && fieldsInfoText.length > 0) ? (
              <div
                key={buildKey(`feature-widget-${layerId}-${objectId}`)}
                class={CSS.featureInfoContainer}
              >
                {this._renderFeatureWidgetContent()}
              </div>
            ) : null}
          </div>
        ) : this._featureContentAvailable && featureTotal ? (
          <div
            key={buildKey(`feature-loader-${layerId}-${objectId}`)}
            class={CSS.featureInfoLoader}
          >
            {this._renderFeatureContentLoader()}
          </div>
        ) : (
          <div
            key={buildKey(`no-feature-info-${layerId}-${objectId}`)}
            class={CSS.noFeatureContentContainer}
          >
            {this._renderNoFeatureContentInfo()}
          </div>
        )}
        {unsupportedAttachmentTypes}
      </div>
    );
  }

  // _renderUnsupportedAttachmentTypes
  private _renderUnsupportedAttachmentTypes(): VNode {
    const otherAttachmentTypes = this._renderOtherAttachmentTypes();
    return (
      <div key={buildKey("other-attachment-types")}>
        <h4 class={CSS.attributeHeading}>{i18n.otherAttachments}</h4>
        {otherAttachmentTypes}
      </div>
    );
  }

  // _renderFeatureWidgetContent
  private _renderFeatureWidgetContent(): VNode {
    const featureWidget = this.get("viewModel.featureWidget") as __esri.Feature;
    const featureWidgetNode = featureWidget ? featureWidget.render() : null;
    return (
      <div
        key={buildKey("feture-widget-content")}
        class={CSS.featureInfoContent}
      >
        {featureWidgetNode}
      </div>
    );
  }

  // _renderFeatureInfoContent
  private _renderFeatureInfoContent(): VNode {
    const selectedFeatureInfo = this.get(
      "selectedAttachmentViewerData.selectedFeatureInfo"
    );
    const featureContentInfo = selectedFeatureInfo
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

  // _renderNoFeatureContentInfo
  private _renderNoFeatureContentInfo(): VNode {
    return (
      <div key={buildKey("no-content")} class={CSS.noInfo}>
        {i18n.noInfo}
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

  // _renderTitleZoomToContainer
  private _renderTitleZoomToContainer(): VNode {
    const layerFeaturesLength = this.get(
      "selectedAttachmentViewerData.layerFeatures.length"
    );
    const zoomTo = layerFeaturesLength ? this._renderZoomTo() : null;

    return (
      <div class={CSS.featureTitleZoomContainer}>
        <div class={CSS.featureContentTitle}>
          <h2 class={CSS.featureLayerTitle}>
            {this.get("featureWidget.title")}
          </h2>
        </div>
        <div class={CSS.zoomContainer}>{zoomTo}</div>
      </div>
    );
  }

  // _renderFeatureContentInfos
  private _renderFeatureContentInfos(): VNode {
    const { selectedFeatureInfo } = this.selectedAttachmentViewerData;
    const featureContentInfos = selectedFeatureInfo.map((contentInfo: any) => {
      return this._renderFeatureContentInfo(contentInfo);
    });
    return <div>{featureContentInfos}</div>;
  }

  // _renderFeatureContentInfo
  private _renderFeatureContentInfo(contentInfo: any): VNode {
    const hyperlink = this._getHyperLink(contentInfo);
    const contentCheck =
      contentInfo &&
      contentInfo.content &&
      ((typeof contentInfo.content === "string" &&
        contentInfo.content.trim() !== "") ||
        contentInfo.content !== null);

    return (
      <div
        key={buildKey(`${contentInfo.attribute}-${contentInfo.content}`)}
        class={CSS.featureContentInfo}
      >
        <h4 class={CSS.attributeHeading} innerHTML={contentInfo.attribute} />
        {contentInfo && contentInfo.content && contentCheck ? (
          hyperlink ? (
            <p class={CSS.attributeContent}>
              <div innerHTML={contentInfo.content.replace(hyperlink, "")} />
              <span innerHTML={autoLink(hyperlink)} />
            </p>
          ) : (
            <p class={CSS.attributeContent} innerHTML={contentInfo.content} />
          )
        ) : (
          <p>{i18n.noContentAvailable}</p>
        )}
      </div>
    );
  }

  // _renderOtherAttachmentTypes
  private _renderOtherAttachmentTypes(): VNode {
    const otherAttachmentTypes = this.selectedAttachmentViewerData.unsupportedAttachmentTypes.map(
      (attachment: __esri.AttachmentInfo) => {
        return this._renderOtherAttachmentType(attachment);
      }
    );
    return <ul class={CSS.otherAttachmentsList}>{otherAttachmentTypes}</ul>;
  }

  // _renderOtherAttachmentType
  private _renderOtherAttachmentType(attachment: __esri.AttachmentInfo): VNode {
    const { id, name, size } = attachment;
    return (
      <li key={buildKey(`other-attachment-${id}-${name}-${size}`)}>
        <a href={attachment.url} target="_blank">
          {attachment.name}
        </a>
      </li>
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
            CSS.calcite.zoomInIcon,
            CSS.calcite.flush
          )}
        />
      </button>
    );
  }

  // _renderAttachmentsMobile
  private _renderAttachmentsMobile(
    selectedFeatureAttachments: __esri.Collection<__esri.AttachmentInfo>
  ): VNode {
    if (!selectedFeatureAttachments) {
      return;
    }
    const featureContentInfos = selectedFeatureAttachments
      .toArray()
      .map((attachment: __esri.AttachmentInfo) => {
        return this._renderAttachmentMobile(attachment);
      });
    const attachmentCount =
      selectedFeatureAttachments && selectedFeatureAttachments.length > 0
        ? selectedFeatureAttachments.length
        : null;

    return (
      <div class={CSS.mobileFeatureContent}>
        {attachmentCount ? (
          <div class={CSS.mobileAttachmentCount}>
            <span class={CSS.mobileAttachmentText}>
              {i18n.upperCaseAttachments}
            </span>
            <div class={CSS.attachmentCountNumber}>
              {selectedFeatureAttachments.length}
            </div>
            {!this.imageIsLoaded && !this.imagePanZoomEnabled
              ? this._renderMediaViewerLoader()
              : null}
          </div>
        ) : null}
        {featureContentInfos}
      </div>
    );
  }

  // _renderAttachmentMobile
  private _renderAttachmentMobile(attachment: __esri.AttachmentInfo): VNode {
    const { url } = attachment;
    const attachmentUrl = this._convertAttachmentUrl(url);

    const imageStyles =
      attachment &&
      attachment.orientationInfo &&
      this._photoViewerContainer &&
      this.imageIsLoaded
        ? getOrientationStylesMobile(
            attachment.orientationInfo,
            this._mobileAttachment
          )
        : {
            transform: "none",
            maxHeight: "100%",
            height: "initial",
            width: "initial"
          };

    const imageAttachmentHeight = imageStyles.width;
    const transparentBackground = {
      [CSS.transparentBackground]: !this.imageIsLoaded
    };

    const contentType = attachment && (attachment.get("contentType") as string);

    const mobileAttachment = this._renderMobileAttachment(attachment);
    const imageDirectionValue = this.imageDirectionEnabled
      ? this.viewModel.getGPSInformation(attachment)
      : null;
    const mobileImageDirection =
      this.imageDirectionEnabled && imageDirectionValue
        ? this._renderMobileImageDirection(attachmentUrl, imageDirectionValue)
        : null;

    const mobileDownloadButton =
      contentType &&
      contentType.indexOf("video") === -1 &&
      contentType.indexOf("gif") === -1 &&
      contentType.indexOf("pdf") === -1 &&
      this.downloadEnabled &&
      this.imageIsLoaded
        ? this._renderMobileDownloadButton(attachmentUrl)
        : null;
    return (
      <div
        bind={this}
        styles={{ height: imageAttachmentHeight }}
        afterCreate={storeNode}
        afterUpdate={storeNode}
        data-node-ref="_mobileAttachment"
        class={this.classes(CSS.mobileAttachment, transparentBackground)}
      >
        {mobileAttachment}
        {mobileImageDirection}
        {mobileDownloadButton}
      </div>
    );
  }

  // _renderMobileDownloadButton
  private _renderMobileDownloadButton(attachmentUrl: string): VNode {
    return (
      <button
        bind={this}
        data-image-url={attachmentUrl}
        data-image-name={name}
        onclick={this._downloadImage}
        onkeydown={this._downloadImage}
        class={CSS.downloadIconContainer}
      >
        <span
          class={this.classes(
            CSS.calcite.downloadIcon,
            CSS.calcite.flush,
            CSS.downloadIcon
          )}
        />
      </button>
    );
  }

  // _mobileImageDirection
  private _renderMobileImageDirection(
    attachmentUrl: string,
    imageDirectionValue: number
  ): VNode {
    return (
      <div
        key={buildKey(`mobile-image-direction-${attachmentUrl}`)}
        class={CSS.imageDirectionMobile}
      >
        <svg
          styles={{ transform: `rotateZ(${imageDirectionValue}deg)` }}
          class={CSS.photoCentricCamera}
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
    );
  }

  // _renderMobileAttachment
  private _renderMobileAttachment(attachment: __esri.AttachmentInfo): VNode {
    const userAgent = navigator.userAgent || navigator.vendor;

    let isAndroid = false;

    if (userAgent.match(/Android/i)) {
      isAndroid = true;
    }

    const addPadding = {
      [CSS.mobileAttachmentsAddPadding]:
        attachment &&
        attachment.orientationInfo &&
        attachment.orientationInfo.rotation !== 0 &&
        isAndroid
    };

    const removeBorderRadius = {
      [CSS.removeBorderRadius]:
        attachment &&
        attachment.orientationInfo &&
        attachment.orientationInfo.rotation !== 0 &&
        isAndroid
    };

    const removeOpacity = {
      [CSS.removeOpacity]: this.imageIsLoaded
    };

    const { url, name } = attachment;

    const attachmentUrl = this._convertAttachmentUrl(url);

    return (
      <div class={this.classes(CSS.mobileAttachmentContainer, addPadding)}>
        {attachment &&
        attachment.contentType &&
        attachment.contentType.indexOf("video") !== -1 ? (
          <video
            key={buildKey(`mobile-video-${attachmentUrl}`)}
            class={CSS.videoContainer}
            controls
          >
            <source src={attachmentUrl} type="video/mp4" />
            <source src={attachmentUrl} type="video/ogg" />
            <source src={attachmentUrl} type="video/mov" />
            {i18n.doesNotSupportVideo}
          </video>
        ) : attachment &&
          attachment.contentType &&
          attachment.contentType.indexOf("pdf") !== -1 ? (
          <embed
            key={buildKey(`mobile-pdf-${attachmentUrl}`)}
            class={CSS.pdf}
            src={this.currentImageUrl}
            type="application/pdf"
          />
        ) : attachment &&
          attachment.contentType &&
          attachment.contentType.indexOf("image") !== -1 ? (
          <img
            key={buildKey(`mobile-image-${attachmentUrl}`)}
            class={this.classes(
              CSS.imageMobile,
              removeBorderRadius,
              removeOpacity
            )}
            src={attachmentUrl}
            alt={name}
          />
        ) : null}
      </div>
    );
  }

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
  @accessibleHandler()
  private _disableOnboardingPanel(): void {
    this._onboardingPanelIsOpen = false;
    this.scheduleRender();
  }

  // _toggleExpand
  @accessibleHandler()
  private _toggleExpand(): void {
    this._mapAndSearchIsExpanded = !this._mapAndSearchIsExpanded;
    this.scheduleRender();
  }

  // _toggleExpand
  @accessibleHandler()
  private _toggleOnboardingPanel(): void {
    if (this._onboardingPanelIsOpen) {
      this._onboardingPanelIsOpen = false;
    } else {
      this._onboardingPanelIsOpen = true;
    }
    this.scheduleRender();
  }

  // _nextImage
  @accessibleHandler()
  private _nextImage(): void {
    this.viewModel.nextImage();
    if (!this.imagePanZoomEnabled) {
      this.set("imageIsLoaded", false);
      if (this._imageAttachment) {
        this._imageAttachment.style.opacity = "0";
      }
    }

    this._handlePdfAttachment();
    this.scheduleRender();
  }

  // _previousImage
  @accessibleHandler()
  private _previousImage(): void {
    this.viewModel.previousImage();
    if (!this.imagePanZoomEnabled) {
      this.set("imageIsLoaded", false);
      if (this._imageAttachment) {
        this._imageAttachment.style.opacity = "0";
      }
    }
    this._handlePdfAttachment();
    this.scheduleRender();
  }

  // _previousFeature
  @accessibleHandler()
  private _previousFeature(): void {
    const { queryingState } = this.viewModel;
    if (queryingState !== "ready") {
      return;
    }
    this.viewModel.previousFeature();
    this.set("currentImageUrl", null);
    const featureLayer = this.get(
      "selectedAttachmentViewerData.layerData.featureLayer"
    ) as __esri.FeatureLayer;
    const supportsAttachment =
      featureLayer && featureLayer.get("capabilities.data.supportsAttachment");
    if (supportsAttachment) {
      this.set("imageIsLoaded", false);
    }

    if (this._imageAttachment) {
      this._imageAttachment.src = "";
    }

    this._handlePdfAttachment();
    this.scheduleRender();
  }

  // _nextFeature
  @accessibleHandler()
  private _nextFeature(): void {
    const { queryingState } = this.viewModel;
    if (queryingState !== "ready") {
      return;
    }
    this.viewModel.nextFeature();
    this.set("currentImageUrl", null);
    const featureLayer = this.get(
      "selectedAttachmentViewerData.layerData.featureLayer"
    ) as __esri.FeatureLayer;
    const supportsAttachment =
      featureLayer && featureLayer.get("capabilities.data.supportsAttachment");
    if (supportsAttachment) {
      this.set("imageIsLoaded", false);
    }

    if (this._imageAttachment) {
      this._imageAttachment.src = "";
    }

    this._handlePdfAttachment();
    this.scheduleRender();
  }

  @accessibleHandler()
  private _zoomInImage() {
    if (this._imageViewer._state.zoomValue === 500) {
      return;
    }
    const updatedZoomValue = this._imageViewer._state.zoomValue + 50;
    this._imageViewer.zoom(updatedZoomValue);
    this._zoomSliderNode.value = `${updatedZoomValue}`;
    this.scheduleRender();
  }

  @accessibleHandler()
  private _zoomOutImage() {
    if (this._imageViewer._state.zoomValue === 0) {
      return;
    }
    const updatedZoomValue = this._imageViewer._state.zoomValue - 50;
    this._imageViewer.zoom(updatedZoomValue);
    this._zoomSliderNode.value = `${updatedZoomValue}`;
    this.scheduleRender();
  }

  // _downloadImage
  @accessibleHandler()
  private _downloadImage(event: Event): void {
    this.viewModel.downloadImage(event);
  }

  // _zoomTo
  @accessibleHandler()
  private _zoomTo(): void {
    this.viewModel.zoomTo();
  }

  // _handlePdfAttachment
  private _handlePdfAttachment(): void {
    const attachments = this.get(
      "selectedAttachmentViewerData.selectedFeatureAttachments.attachments"
    ) as __esri.Collection<__esri.AttachmentInfo>;
    const attachmentIndex = this.get(
      "selectedAttachmentViewerData.attachmentIndex"
    ) as number;
    const currentAttachment =
      attachments && attachments.getItemAt(attachmentIndex);
    const contentType =
      currentAttachment && currentAttachment.get("contentType");
    if (contentType === "application/pdf") {
      this.set("imageIsLoaded", true);
    }
  }

  // _getHyperLink
  private _getHyperLink(contentInfo: any): string {
    const expression = /(http|ftp|https)(:\/\/)([\w_-]+(?:(?:\.[\w_-]+)+))([\w.,@?^=%&:/~+#-]*[\w@?^=%&/~+#-])?/;
    const regex = new RegExp(expression);

    const content = contentInfo && contentInfo.content;
    return content &&
      content.match &&
      content.match(regex) &&
      content.match(regex).length > 0
      ? content.match(regex)[0]
      : null;
  }

  // _convertAttachmentUrl
  private _convertAttachmentUrl(attachmentUrl: string): string {
    if (!this.selectedAttachmentViewerData) {
      return;
    }
    const featureLayer = this.selectedAttachmentViewerData.get(
      "layerData.featureLayer"
    ) as __esri.FeatureLayer;
    const parentPortalUrl =
      featureLayer &&
      (featureLayer.get("parent.portalItem.portal.url") as string);

    const portalUrl =
      featureLayer && (featureLayer.get("portalItem.portal.url") as string);
    const portalIsHTTPS =
      (portalUrl && portalUrl.indexOf("https") !== -1) ||
      (parentPortalUrl && parentPortalUrl.indexOf("https") !== -1);

    if (
      portalIsHTTPS &&
      attachmentUrl &&
      attachmentUrl.indexOf("https") === -1
    ) {
      return attachmentUrl.replace(/^http:\/\//i, "https://");
    }
    return attachmentUrl;
  }

  // _handleImagePanZoom
  private _handleImagePanZoom(attachment: __esri.AttachmentInfo): void {
    if (!attachment) {
      return;
    }

    const contentTypeCheck = this._validateContentType(attachment);
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
        const rotation = attachment.get("orientationInfo.rotation") as number;

        if (rotation) {
          const ivImageElement = document.querySelector(
            ".iv-image"
          ) as HTMLImageElement;
          ivImageElement.style.transform = `rotate(${rotation}deg)`;
        }

        this.scheduleRender();
      }
    }
  }

  // _removeImageLoader
  private _removeImageLoader(event: Event): void {
    const node = event.currentTarget as HTMLImageElement;
    const attachment = node["data-attachment"];
    if (this._imageAttachment) {
      const imageStyles =
        attachment && attachment.orientationInfo === null
          ? {
              transform: "none",
              maxHeight: "100%",
              maxWidth: "100%",
              height: "initial"
            }
          : attachment &&
            attachment.orientationInfo &&
            this._photoViewerContainer
          ? getOrientationStyles(
              attachment.orientationInfo,
              this._photoViewerContainer
            )
          : ({} as any);
      const { style } = this._imageAttachment;
      style.width = `${imageStyles.width}`;
      style.height = `${imageStyles.height}`;
      style.maxHeight = `${imageStyles.maxHeight}`;
      style.transform = `${imageStyles.transform}`;
      style.opacity = "1";
    }
    this.set("imageIsLoaded", true);
    this.scheduleRender();
  }

  // _getCurrentAttachment
  private _getCurrentAttachment(
    attachments: __esri.Collection<__esri.AttachmentInfo>
  ): __esri.AttachmentInfo {
    const attachmentIndex = this.get(
      "selectedAttachmentViewerData.attachmentIndex"
    ) as number;

    return attachments && attachments.length > 0
      ? attachments && attachments.getItemAt(attachmentIndex)
      : null;
  }

  // _validateContentType
  private _validateContentType(attachment: __esri.AttachmentInfo): boolean {
    const contentType = attachment && (attachment.get("contentType") as string);
    return (
      contentType !== "image/gif" &&
      contentType !== "video/mp4" &&
      contentType !== "video/mov" &&
      contentType !== "video/quicktime" &&
      contentType !== "application/pdf"
    );
  }
}

export = PhotoCentric;
