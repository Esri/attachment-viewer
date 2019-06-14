/// <amd-dependency path="esri/core/tsSupport/declareExtendsHelper" name="__extends" />
/// <amd-dependency path="esri/core/tsSupport/decorateHelper" name="__decorate" />

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
import * as i18n from "dojo/i18n!./nls/resources";

// esri.widgets
import Widget = require("esri/widgets/Widget");

// esri.core
import watchUtils = require("esri/core/watchUtils");

// AttachmentViewerViewModel
import AttachmentViewerViewModel = require("../AttachmentViewer/AttachmentViewerViewModel");

// VNode
import { VNode } from "../../interfaces/interfaces";

// utils
import { attachToNode } from "../utils";

// Custom Share
import Share = require("../Share/Share");

// SelectedLayer
import { SelectedLayer } from "../../interfaces/interfaces";

// getOrientationStyles
import {
  getOrientationStyles,
  getOrientationStylesMobile
} from "../utils/imageUtils";

// import { LEFT_ARROW, RIGHT_ARROW } from "dojo/keys";

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
  // loader
  widgetLoader: "esri-widget__loader esri-photo-centric__loader",
  animationLoader:
    "esri-widget__loader-animation esri-photo-centric__loader-animation",
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
  //  Variables
  //
  //----------------------------------

  private _mapAndSearchIsExpanded = true;
  private _imageCarouselIsOpen: boolean = null;
  private _photoViewerContainer: HTMLElement = null;
  private _mobileAttachment: HTMLElement = null;
  private _layerDoesNotSupportAttachments: boolean = null;
  private _onboardingPanelIsOpen: boolean = null;
  private _featureContentAvailable: boolean = null;
  private _previousImageUrl: string = null;
  private _featureContentPanel: HTMLElement = null;

  //----------------------------------
  //
  //  Properties
  //
  //----------------------------------

  // view
  @aliasOf("viewModel.view")
  @property()
  view: __esri.MapView = null;

  // title
  @aliasOf("viewModel.title")
  @property()
  title: string = null;

  // shareLocationWidget
  @aliasOf("viewModel.shareLocationWidget")
  @property()
  shareLocationWidget: Share = null;

  // selectedFeatureAttachments
  @aliasOf("viewModel.selectedFeatureAttachments")
  @property()
  @renderable()
  selectedFeatureAttachments: any = null;

  // featureLayerTitle
  @aliasOf("viewModel.featureLayerTitle")
  @property()
  featureLayerTitle: string = null;

  // selectedFeatureInfo
  @aliasOf("viewModel.selectedFeatureInfo")
  @property()
  @renderable()
  selectedFeatureInfo: any = null;

  // layerFeatureIndex
  @aliasOf("viewModel.layerFeatureIndex")
  @property()
  @renderable()
  layerFeatureIndex: number = null;

  // attachmentIndex
  @aliasOf("viewModel.attachmentIndex")
  @property()
  @renderable()
  @renderable()
  attachmentIndex: number = null;

  // defaultObjectId
  @aliasOf("viewModel.defaultObjectId")
  @property()
  defaultObjectId: number = null;

  // socialSharingEnabled
  @aliasOf("viewModel.socialSharingEnabled")
  @property()
  socialSharingEnabled: boolean = null;

  // onboardingContent
  @property()
  onboardingContent: any = null;

  // layerFeatures
  @aliasOf("viewModel.layerFeatures")
  @property()
  @renderable()
  layerFeatures: __esri.Collection<__esri.Graphic> = null;

  // imageIsLoaded
  @aliasOf("viewModel.imageIsLoaded")
  @property()
  imageIsLoaded: boolean = null;

  // attachmentLayer
  @aliasOf("viewModel.attachmentLayer")
  @property()
  attachmentLayer: SelectedLayer = null;

  // order
  @aliasOf("viewModel.order")
  @property()
  order: string = null;

  // featureLayer
  @aliasOf("viewModel.featureLayer")
  @property()
  featureLayer: __esri.FeatureLayer = null;

  // zoomLevel
  @aliasOf("viewModel.zoomLevel")
  @property()
  zoomLevel: string = null;

  // selectedFeatureAddress
  @aliasOf("viewModel.selectedFeatureAddress")
  @property()
  @renderable()
  selectedFeatureAddress: string = null;

  // onboardingImage
  @property()
  @renderable()
  onboardingImage: string = null;

  // onboardingButtonText
  @property()
  @renderable()
  onboardingButtonText: string = null;

  // docDirection
  @property()
  docDirection: string = null;

  // addressEnabled
  @property()
  addressEnabled: string = null;

  // currentImageUrl
  @property()
  @renderable()
  currentImageUrl: string = null;

  // viewModel
  @renderable(["viewModel.state"])
  @property({
    type: AttachmentViewerViewModel
  })
  viewModel: AttachmentViewerViewModel = null;

  //----------------------------------
  //
  //  Lifecycle
  //
  //----------------------------------

  postInitialize() {
    this.own([
      watchUtils.whenOnce(this, "view", () => {
        if (localStorage.getItem("firstTimeUseApp")) {
          this._onboardingPanelIsOpen = false;
        } else {
          this._onboardingPanelIsOpen = true;
          localStorage.setItem("firstTimeUseApp", `${Date.now()}`);
        }
        this.scheduleRender();
      }),
      watchUtils.when(this, "featureLayer", () => {
        if (!this.featureLayer.get("capabilities.data.supportsAttachment")) {
          this._layerDoesNotSupportAttachments = true;
          this.scheduleRender();
        }
      }),
      watchUtils.watch(
        this,
        ["selectedFeatureAttachments", "attachmentIndex"],
        () => {
          this._previousImageUrl = this.currentImageUrl;

          const { selectedFeatureAttachments, attachmentIndex } = this;
          const attachments =
            selectedFeatureAttachments &&
            selectedFeatureAttachments.attachments &&
            selectedFeatureAttachments.attachments[attachmentIndex];

          this.currentImageUrl = attachments ? attachments.url : null;

          this.scheduleRender();
        }
      ),
      watchUtils.when(this, "selectedFeatureAttachments", () => {
        if (
          this._previousImageUrl !== this.currentImageUrl &&
          this.defaultObjectId === null
        ) {
          this.set("attachmentIndex", 0);
          this.selectedFeatureAttachments.currentIndex = 0;
          this.scheduleRender();
          return;
        }
        this.defaultObjectId = null;
      }),
      watchUtils.watch(this, "viewModel.objectIdIndex", () => {
        if (this._featureContentPanel) {
          this._featureContentPanel.scrollTop = 0;
        }
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
  }

  //----------------------------------
  //
  //  START OF RENDER NODE METHODS
  //
  //----------------------------------

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

  // _renderHomePage
  private _renderHomePage(): VNode {
    const onboarding = this._renderOnboarding();
    const content = this._renderContent();
    const imageViewerDesktop = this._renderImageViewerDesktop();
    return (
      <div key={buildKey("main-page")} class={CSS.mainPageContainer}>
        <div class={CSS.mainPage}>
          {this._onboardingPanelIsOpen && document.body.clientWidth > 813 ? (
            <div class={CSS.onboardingOverlay}>{onboarding}</div>
          ) : null}
          {content}
        </div>
        {imageViewerDesktop}
      </div>
    );
  }

  // _renderImageContainer
  private _renderImageContainer(): VNode {
    const attachmentCount = this._onboardingPanelIsOpen
      ? this.onboardingImage
        ? null
        : this._renderAttachmentCount()
      : this._renderAttachmentCount();
    const { selectedFeatureAttachments } = this;

    const downloadEnabled = {
      [CSS.downloadEnabled]: !this.viewModel.downloadEnabled
    };

    const attachments =
      selectedFeatureAttachments && selectedFeatureAttachments.attachments;
    const attachment =
      attachments && attachments.length > 0
        ? attachments[this.attachmentIndex]
        : null;

    const name = attachment ? attachment.name : null;
    const imageStyles =
      attachment && attachment.orientationInfo && this._photoViewerContainer
        ? getOrientationStyles(
            attachment.orientationInfo,
            this._photoViewerContainer
          )
        : {
            transform: "none",
            maxHeight: "100%",
            height: "initial",
            width: "initial"
          };

    const blurImage = {
      [CSS.fadeImage]: !this.imageIsLoaded
    };

    return (
      <div class={this.classes(CSS.rightPanel)}>
        {this._layerDoesNotSupportAttachments ? (
          <div class={CSS.layerNotSupported}>{i18n.notSupported}</div>
        ) : (
          <div
            bind={this}
            afterCreate={storeNode}
            data-node-ref="_photoViewerContainer"
            key={buildKey("image-container")}
            class={this.classes(downloadEnabled, CSS.photoViewer)}
          >
            {!this.imageIsLoaded &&
            attachment &&
            attachment.contentType &&
            attachment.contentType.indexOf("video") === -1 &&
            attachments ? (
              <div class={CSS.widgetLoader} key={buildKey("base-loader")}>
                <span class={CSS.animationLoader} />
              </div>
            ) : null}
            {attachments && attachments.length === 0 ? (
              this.onboardingImage && this._onboardingPanelIsOpen ? null : (
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
              )
            ) : null}

            <div class={CSS.imageContainer}>
              {attachment &&
              attachment.contentType &&
              attachment.contentType.indexOf("video") !== -1 ? (
                <video
                  bind={this}
                  afterCreate={this._removeImageLoader}
                  class={CSS.videoContainer}
                  controls
                >
                  <source src={attachment.url} type="video/mp4" />
                  <source src={attachment.url} type="video/quicktime" />
                  <source src={attachment.url} type="video/ogg" />
                  <source src={attachment.url} type="video/mov" />
                  {i18n.doesNotSupportVideo}
                </video>
              ) : this._onboardingPanelIsOpen && this.onboardingImage ? (
                <img
                  styles={imageStyles}
                  src={this.onboardingImage}
                  alt={name}
                />
              ) : (
                <img
                  class={this.classes(CSS.imageDesktop, blurImage)}
                  styles={imageStyles}
                  bind={this}
                  src={this.currentImageUrl}
                  onload={this._removeImageLoader}
                  alt={name}
                />
              )}
            </div>
            {attachmentCount}
          </div>
        )}
      </div>
    );
  }

  // _renderImageViewerDesktop
  private _renderImageViewerDesktop(): VNode {
    const imageContainer = this._renderImageContainer();
    return <div class={CSS.imageViewerDesktop}>{imageContainer}</div>;
  }

  // _renderAttachmentCount
  private _renderAttachmentCount(): VNode {
    const currentIndex = this.attachmentIndex + 1;
    const totalNumberOfAttachments = this.viewModel.getTotalNumberOfAttachments();
    const { selectedFeatureAttachments } = this;
    const attachments =
      selectedFeatureAttachments && selectedFeatureAttachments.attachments;
    const attachment =
      attachments && attachments.length > 0
        ? attachments[this.attachmentIndex]
        : null;
    const hasMoreThanOneAttachment =
      selectedFeatureAttachments &&
      selectedFeatureAttachments.attachments &&
      selectedFeatureAttachments.attachments.length > 1;
    return (
      <div key={buildKey("attachment-count")} class={CSS.attachmentNumber}>
        {this.selectedFeatureAttachments &&
        this.selectedFeatureAttachments.attachments &&
        this.selectedFeatureAttachments.attachments.length > 0 ? (
          <div
            key={buildKey("download-attachment")}
            class={CSS.downloadIconTextContainer}
          >
            <button
              bind={this}
              onclick={this._previousImage}
              onkeydown={this._previousImage}
              disabled={
                hasMoreThanOneAttachment &&
                this.imageIsLoaded &&
                !this._onboardingPanelIsOpen
                  ? false
                  : true
              }
              tabIndex={0}
              class={CSS.leftArrowContainer}
            >
              {this.docDirection === "rtl" ? (
                <span
                  class={this.classes(
                    CSS.calcite.rightArrow,
                    CSS.calcite.flush
                  )}
                />
              ) : (
                <span
                  class={this.classes(CSS.calcite.leftArrow, CSS.calcite.flush)}
                />
              )}
            </button>

            <span class={CSS.attachmentNumberText}>
              {`${currentIndex} ${i18n.of} ${totalNumberOfAttachments} ${
                i18n.attachments
              }`}
            </span>
            <button
              bind={this}
              onclick={this._nextImage}
              onkeydown={this._nextImage}
              disabled={
                hasMoreThanOneAttachment &&
                this.imageIsLoaded &&
                !this._onboardingPanelIsOpen
                  ? false
                  : true
              }
              tabIndex={0}
              class={CSS.rightArrowContainer}
            >
              {this.docDirection === "rtl" ? (
                <span
                  class={this.classes(CSS.calcite.leftArrow, CSS.calcite.flush)}
                />
              ) : (
                <span
                  class={this.classes(
                    CSS.calcite.rightArrow,
                    CSS.calcite.flush
                  )}
                />
              )}
            </button>
          </div>
        ) : null}

        {attachment &&
        attachment.contentType &&
        attachment.contentType.indexOf("video") === -1 &&
        this.viewModel.downloadEnabled ? (
          this.viewModel.state === "downloading" ? (
            <div class={CSS.downloadIconContainer}>
              <span
                class={this.classes(
                  CSS.calcite.loadingIcon,
                  CSS.calcite.rotating,
                  CSS.spinner
                )}
              />
            </div>
          ) : (
            <button
              class={this.classes(
                CSS.downloadIconContainer,
                CSS.downloadButtonDesktop
              )}
              bind={this}
              onclick={this._downloadImage}
              onkeydown={this._downloadImage}
              data-image-url={attachment.url}
              data-image-name={attachment.name}
              title={i18n.download}
              disabled={this.imageIsLoaded ? false : true}
            >
              <span
                class={this.classes(
                  CSS.calcite.downloadIcon,
                  CSS.calcite.flush,
                  CSS.downloadIcon
                )}
              />
            </button>
          )
        ) : null}
      </div>
    );
  }

  // _renderHeader
  private _renderHeader(): VNode {
    const title =
      document.body.clientWidth < 813 && this.title.length > 40
        ? `${this.title
            .split("")
            .slice(0, 35)
            .join("")}...`
        : this.title;

    const shareWidget =
      this.shareLocationWidget &&
      this.layerFeatures &&
      this.layerFeatures.length &&
      document.body.clientWidth > 813
        ? this._renderShareLocationWidget()
        : null;
    return (
      <div class={CSS.header}>
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
            />
          </div>
        </div>
        <div class={CSS.shareWidgetContainer}>{shareWidget}</div>
      </div>
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
        class={this.classes(CSS.mapView)}
      />
    );
  }

  // _renderPagination
  private _renderPagination(): VNode {
    const featureTotal = this.viewModel.featureTotal;
    const currentlayerFeatureIndex = this.viewModel.objectIdIndex + 1;

    return (
      <div key={buildKey("feature-pagination")} class={CSS.paginationContainer}>
        <button
          bind={this}
          onclick={
            this.docDirection === "rtl"
              ? this._nextFeature
              : this._previousFeature
          }
          onkeydown={
            this.docDirection === "rtl"
              ? this._nextFeature
              : this._previousFeature
          }
          tabIndex={0}
          class={CSS.leftArrowContainer}
          disabled={this._onboardingPanelIsOpen ? true : false}
        >
          <span
            class={this.classes(CSS.calcite.leftArrow, CSS.calcite.flush)}
          />
        </button>
        {featureTotal ? (
          <div
            class={CSS.paginationTextContainer}
          >{`${currentlayerFeatureIndex} ${i18n.of} ${featureTotal} ${
            i18n.locations
          }`}</div>
        ) : null}
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
          disabled={this._onboardingPanelIsOpen ? true : false}
        >
          <span
            class={this.classes(CSS.calcite.rightArrow, CSS.calcite.flush)}
          />
        </button>
      </div>
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

  // _renderAttachmentsContainer
  private _renderAttachmentsContainer(): VNode {
    const featureContentInfo = this.selectedFeatureInfo
      ? this._renderFeatureContentInfos()
      : null;
    const { selectedFeatureAttachments } = this;
    const attachmentsMobile =
      selectedFeatureAttachments &&
      selectedFeatureAttachments.attachments &&
      document.body.clientWidth < 813
        ? this._renderAttachmentsMobile(selectedFeatureAttachments.attachments)
        : null;

    const zoomTo =
      this.layerFeatures && this.layerFeatures.length
        ? this._renderZoomTo()
        : null;
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

    const otherAttachmentTypes =
      this.viewModel.unsupportedAttachmentTypes &&
      this.viewModel.unsupportedAttachmentTypes.length > 0
        ? this._renderOtherAttachmentTypes()
        : null;

    return (
      <div
        bind={this}
        afterCreate={storeNode}
        data-node-ref="_featureContentPanel"
        class={CSS.featureContent}
      >
        <div class={CSS.featureContentTitle}>
          <h2 class={CSS.featureLayerTitle}>{this.featureLayerTitle}</h2>
          {zoomTo}
        </div>

        <h6 class={CSS.addressText}>{this.selectedFeatureAddress}</h6>

        <div class={CSS.attachmentsImageContainer}>{attachmentsMobile}</div>

        {fieldsInfoText && fieldsInfoText.length > 0 ? (
          <div
            key={buildKey("feture-widget-content")}
            class={CSS.featureInfoContent}
          >
            {featureWidget && featureWidget.render()}
          </div>
        ) : fieldsInfoContent && fieldsInfoContent.length > 0 ? (
          <div
            key={buildKey("feature-info-content")}
            class={CSS.featureInfoContent}
          >
            {featureContentInfo}
          </div>
        ) : this._featureContentAvailable ? (
          <div
            key={buildKey("feature-content-loader")}
            class={CSS.widgetLoader}
          >
            {i18n.loadingImages}
          </div>
        ) : (
          <div key={buildKey("no-content")} class={CSS.noInfo}>
            {i18n.noInfo}
          </div>
        )}
        {this.viewModel.unsupportedAttachmentTypes &&
        this.viewModel.unsupportedAttachmentTypes.length > 0 ? (
          <div key={buildKey("other-attachment-types")}>
            <h4 class={CSS.attributeHeading}>{i18n.otherAttachments}</h4>
            {otherAttachmentTypes}
          </div>
        ) : null}
      </div>
    );
  }

  // _renderFeatureContentInfos
  private _renderFeatureContentInfos(): VNode {
    const { selectedFeatureInfo } = this.viewModel;
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
      <div class={CSS.featureContentInfo}>
        <h4 class={CSS.attributeHeading}>{contentInfo.attribute}</h4>
        {contentInfo && contentInfo.content && contentCheck ? (
          hyperlink ? (
            <p>
              {contentInfo.content.replace(hyperlink, "")}
              <a class={CSS.contentLink} href={hyperlink} target="_blank">
                {hyperlink}
              </a>
            </p>
          ) : (
            <p class={CSS.attributeContent}>{contentInfo.content}</p>
          )
        ) : (
          <p>{i18n.noContentAvailable}</p>
        )}
      </div>
    );
  }

  // _renderOtherAttachmentTypes
  private _renderOtherAttachmentTypes(): VNode {
    const otherAttachmentTypes = this.viewModel.unsupportedAttachmentTypes.map(
      (attachment: any) => {
        return this._renderOtherAttachmentType(attachment);
      }
    );
    return <ul class={CSS.otherAttachmentsList}>{otherAttachmentTypes}</ul>;
  }

  // _renderOtherAttachmentType
  private _renderOtherAttachmentType(attachment: __esri.AttachmentInfo): VNode {
    return (
      <li>
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
  private _renderAttachmentsMobile(selectedFeatureAttachments: any): VNode {
    const featureContentInfos = selectedFeatureAttachments.map(
      (attachment: any) => {
        return this._renderAttachmentMobile(attachment);
      }
    );
    const attachmentCount =
      selectedFeatureAttachments && selectedFeatureAttachments.length > 0
        ? selectedFeatureAttachments.length
        : null;
    const attachmentsUpperCase = `${i18n.attachments
      .charAt(0)
      .toUpperCase()}${i18n.attachments.slice(1)}`;

    return (
      <div class={CSS.mobileFeatureContent}>
        {attachmentCount ? (
          <div class={CSS.mobileAttachmentCount}>
            <span class={CSS.mobileAttachmentText}>{attachmentsUpperCase}</span>
            <div class={CSS.attachmentCountNumber}>
              {selectedFeatureAttachments.length}
            </div>
            {!this.imageIsLoaded ? (
              <div class={CSS.widgetLoader} key={buildKey("base-loader")}>
                <span class={CSS.animationLoader} />
              </div>
            ) : null}
          </div>
        ) : null}
        {featureContentInfos}
      </div>
    );
  }

  // _renderAttachmentMobile
  private _renderAttachmentMobile(attachment: any): VNode {
    const { url, name } = attachment;
    const imageStyles =
      attachment && attachment.orientationInfo && this._photoViewerContainer
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

    return (
      <div
        bind={this}
        styles={{ height: imageAttachmentHeight }}
        afterCreate={storeNode}
        afterUpdate={storeNode}
        data-node-ref="_mobileAttachment"
        class={CSS.mobileAttachment}
      >
        <div class={CSS.mobileAttachmentContainer}>
          {attachment &&
          attachment.contentType &&
          attachment.contentType.indexOf("video") !== -1 ? (
            <video class={CSS.videoContainer} controls>
              <source src={attachment.url} type="video/mp4" />
              <source src={attachment.url} type="video/ogg" />
              <source src={attachment.url} type="video/mov" />
              {i18n.doesNotSupportVideo}
            </video>
          ) : (
            <img
              class={CSS.imageMobile}
              styles={imageStyles}
              src={url}
              alt={name}
            />
          )}
        </div>

        {attachment &&
        attachment.contentType &&
        attachment.contentType.indexOf("video") === -1 &&
        this.viewModel.downloadEnabled &&
        this.imageIsLoaded ? (
          <button
            bind={this}
            data-image-url={url}
            data-image-name={name}
            disabled={this.imageIsLoaded ? false : true}
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
        ) : null}
      </div>
    );
  }

  //----------------------------------
  //
  //  END OF RENDER NODE METHODS
  //
  //----------------------------------

  // _removeImageLoader
  private _removeImageLoader() {
    if (this.currentImageUrl !== this._previousImageUrl) {
      this.imageIsLoaded = true;
      this.scheduleRender();
    }
  }

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
    this.imageIsLoaded = false;
    this.scheduleRender();
  }

  // _previousImage
  @accessibleHandler()
  private _previousImage(): void {
    this.viewModel.previousImage();
    this.imageIsLoaded = false;
    this.scheduleRender();
  }

  // _previousFeature
  @accessibleHandler()
  private _previousFeature(): void {
    if (this.viewModel.state === "querying") {
      return;
    }
    this.viewModel.previousFeature();
    if (this.featureLayer.get("capabilities.data.supportsAttachment")) {
      this.imageIsLoaded = false;
    }

    this.viewModel.goTo();
    this.scheduleRender();
  }

  // _nextFeature
  @accessibleHandler()
  private _nextFeature(): void {
    if (this.viewModel.state === "querying") {
      return;
    }
    this.viewModel.nextFeature();
    if (this.featureLayer.get("capabilities.data.supportsAttachment")) {
      this.imageIsLoaded = false;
    }

    this.viewModel.goTo();
    this.scheduleRender();
  }

  // _downloadImage
  @accessibleHandler()
  private _downloadImage(event: Event): void {
    this.viewModel.downloadImage(event);
  }

  // _zoomTo
  @accessibleHandler()
  private _zoomTo() {
    this.viewModel.zoomTo();
  }

  // _getHyperLink
  private _getHyperLink(contentInfo: any): string {
    const expression = /(http|ftp|https)(:\/\/)([\w_-]+(?:(?:\.[\w_-]+)+))([\w.,@?^=%&:/~+#-]*[\w@?^=%&/~+#-])?/;
    const regex = new RegExp(expression);

    const content = contentInfo && contentInfo.content;

    return content && content.match(regex) && content.match(regex).length > 0
      ? content.match(regex)[0]
      : null;
  }
}

export = PhotoCentric;
