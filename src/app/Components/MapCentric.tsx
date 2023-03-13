// Copyright 2023 Esri
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//   http://www.apache.org/licenses/LICENSE-2.0
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.​

import { subclass, property, aliasOf } from "@arcgis/core/core/accessorSupport/decorators";

import {
  accessibleHandler,
  tsx,
  storeNode,
  messageBundle
} from "@arcgis/core/widgets/support/widget";
import Widget from "@arcgis/core/widgets/Widget";

import { autoLink } from "./utils/urlUtils";

import { attachToNode } from "./utils/utils";
import { focusNode } from "./utils/focusUtils";

import MapCentricData from "./MapCentric/MapCentricData";
import AttachmentViewerData from "./AttachmentViewer/AttachmentViewerData";

import MapCentricViewModel from "./MapCentric/MapCentricViewModel";

import LayerSwitcher from "./LayerSwitcher";

import ImageViewer from "iv-viewer";
import "iv-viewer/dist/iv-viewer.css";

import { NavItem, AttachmentData } from "../interfaces/interfaces";

import { when, watch, on } from "@arcgis/core/core/reactiveUtils";

import ResizeObserver from "resize-observer-polyfill";
import Sanitizer from "@esri/arcgis-html-sanitizer";
import { createSanitizerInstance } from "templates-common-library/functionality/securityUtils";

import Common_t9n from "../../t9n/Common/common.json";
import MapCentric_t9n from "../../t9n/Components/MapCentric/resources.json";
import RelatedFeatures from "./RelatedFeatures/RelatedFeatures";

// ----------------------------------
//
//  CSS Classes
//
// ----------------------------------

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
  onboardingOverlay: "esri-map-centric__onboarding-overlay",
  onboardingOverlayDark: "esri-map-centric__onboarding-overlay--dark",
  onboardingContent: "esri-map-centric__onboarding-content",
  onboardingContentContainer: "esri-map-centric__onboarding-content-container",
  onboardingStartButtonContainer: "esri-map-centric__start-button-container",
  onboardingStartButton: "esri-map-centric__start-button",
  onboardingMain: "esri-map-centric__main-onboarding",
  onboardingTrayContentContainer: "esri-map-centric__onboarding-tray-content-container",
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
  featureContentExpanded: "esri-map-centric__feature-content--expanded",
  featureContentNoRelatedFeatures: "esri-map-centric__feature-content--no-related-features",
  featureContentHasRelatedFeatures: "esri-map-centric__feature-content--has-related-features",
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
  featureContentPanelOpen: "esri-map-centric--feature-content-panel-open",
  featureContentPanelLayerSwitcher: "esri-map-centric--feature-content-panel-layer-switcher",
  featureContentHeader: "esri-map-centric__feature-content-header",
  featureContentHeaderExpanded:
    "esri-map-centric__feature-content-header--feature-content-expanded",
  featureZoomToContainer: "esri-map-centric__zoom-to-container",
  featureContentContainer: "esri-map-centric__feature-content-container",
  featureContentContainerExpanded:
    "esri-map-centric__feature-content-container--feature-content-expanded",
  minimize: "esri-map-centric__minimize",
  expand: "esri-map-centric__expand",
  attrEdit: "esri-map-centric__attribute-edit-button",
  attrEditModalFooterButtonContainer:
    "esri-map-centric__attribute-edit-modal-footer-button-container",
  // mobile
  mobileBody: "esri-map-centric__mobile-body",
  mobileNav: "esri-map-centric__mobile-nav",
  mobileNavItem: "esri-map-centric__mobile-nav-item",
  mobileNavItemSelected: "esri-map-centric__nav-item--selected",
  mobileOnboardingGallery: "esri-map-centric__mobile-onboarding-gallery",
  mobileMedia: "esri-map-centric__mobile-media",
  mobileNavItemOnboardingDisabled: "esri-map-centric__mobile-nav-item--onboarding-disabled",
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
  logo: "esri-map-centric__logo",
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
  }
};

const WIDGET_KEY_PARTIAL = "esri-map-centric";

function buildKey(element: string, index?: number): string | undefined {
  if (index === undefined) {
    return `${WIDGET_KEY_PARTIAL}__${element}`;
  }
  return;
}

@subclass("MapCentric")
class MapCentric extends Widget {
  constructor(value?: any) {
    super(value);
  }
  private _currentMobileScreen: string | null = null;
  private _expandAttachmentNode: HTMLElement | null = null;
  private _featureContentAvailable: boolean | null = null;
  private _fullAttachmentContainerIsOpen = false;
  private _fullScreenCloseNode: HTMLElement | null = null;
  private _imageViewer: any = null;
  private _imageViewerSet = false;
  private _imageZoomLoaded: boolean | null = null;
  private _layerDoesNotSupportAttachments = false;
  private _mediaViewerContainerFullAttachment: HTMLElement | null = null;
  private _onboardingPanelIsOpen: boolean | null = null;
  private _triggerScrollElement: HTMLElement | null = null;
  private _onboardingButtonDesktop: HTMLElement | null = null;
  private _featureContentExpanded: boolean = false;
  private _resizeObserver = new ResizeObserver(() => this.scheduleRender());
  private _zoomSlider;
  private _header;

  @aliasOf("viewModel.applicationItem")
  applicationItem: __esri.PortalItem | null = null;

  @aliasOf("viewModel.applySharedTheme")
  applySharedTheme: boolean | null = null;

  @aliasOf("viewModel.addressEnabled")
  @property()
  addressEnabled: boolean | null = null;

  @aliasOf("viewModel.appMode")
  @property()
  appMode: string | null = null;

  @aliasOf("viewModel.attachmentIndex")
  @property()
  attachmentIndex: number | null = null;

  @aliasOf("viewModel.attachmentLayer")
  @property()
  attachmentLayer: any = null;

  @aliasOf("viewModel.attachmentLayers")
  @property()
  attachmentLayers: any = null;

  @aliasOf("viewModel.attachmentViewerDataCollection")
  @property()
  attachmentViewerDataCollection: __esri.Collection<AttachmentViewerData> | null = null;

  @aliasOf("viewModel.currentImageUrl")
  @property()
  currentImageUrl: string | null = null;

  @aliasOf("viewModel.customTheme")
  customTheme: any = null;

  @aliasOf("viewModel.defaultObjectId")
  @property()
  defaultObjectId: number | null = null;

  @property()
  showOnboardingOnStart = true;

  @aliasOf("viewModel.downloadEnabled")
  @property()
  downloadEnabled: boolean | null = null;

  @property()
  docDirection: string | null = null;

  @aliasOf("viewModel.featureContentPanelIsOpen")
  @property()
  featureContentPanelIsOpen: boolean | null = null;

  @aliasOf("viewModel.graphicsLayer")
  @property()
  graphicsLayer: __esri.GraphicsLayer | null = null;

  @aliasOf("viewModel.imageDirectionEnabled")
  imageDirectionEnabled: boolean | null = null;

  @property()
  imagePanZoomEnabled: boolean | null = null;

  @aliasOf("viewModel.layerSwitcher")
  @property()
  layerSwitcher: LayerSwitcher | null = null;

  @aliasOf("viewModel.mapCentricSketchQueryExtent")
  @property()
  mapCentricSketchQueryExtent: __esri.Extent | null = null;

  @aliasOf("viewModel.mapCentricTooltipEnabled")
  @property()
  mapCentricTooltipEnabled: boolean | null = null;

  @property()
  onboardingButtonText: string | null = null;

  @property()
  onboardingContent: any = null;

  @property()
  onboardingIsEnabled = true;

  @aliasOf("viewModel.order")
  @property()
  order: string | null = null;

  @aliasOf("viewModel.sharedTheme")
  sharedTheme: any = null;

  @aliasOf("viewModel.searchWidget")
  @property()
  searchWidget: __esri.Search | null = null;

  @aliasOf("viewModel.selectFeaturesEnabled")
  @property()
  selectFeaturesEnabled: boolean | null = null;

  @aliasOf("viewModel.selectedAttachmentViewerData")
  @property()
  selectedAttachmentViewerData: MapCentricData | null = null;

  @aliasOf("viewModel.sketchWidget")
  @property()
  sketchWidget: __esri.Sketch | null = null;

  @aliasOf("viewModel.socialSharingEnabled")
  @property()
  socialSharingEnabled: boolean | null = null;

  @aliasOf("viewModel.supportedAttachmentTypes")
  @property()
  supportedAttachmentTypes: string[] | null = null;

  @aliasOf("viewModel.token")
  @property()
  token: string | null = null;

  @property()
  thumbnailFormat: "stretch" | "fit" | "crop" = "stretch";

  @property()
  thumbnailHeight: number | null = null;

  @aliasOf("viewModel.title")
  @property()
  title: string | null = null;

  @aliasOf("viewModel.view")
  @property()
  view: __esri.MapView | null = null;

  @aliasOf("viewModel.withinConfigurationExperience")
  @property()
  withinConfigurationExperience: boolean | null = null;

  @property()
  mapA11yDesc: string;

  @aliasOf("viewModel.headerBackground")
  headerBackground: string;

  @aliasOf("viewModel.headerColor")
  headerColor: string;

  @aliasOf("viewModel.enableHeaderBackground")
  enableHeaderBackground: boolean;

  @aliasOf("viewModel.enableHeaderColor")
  enableHeaderColor: boolean;

  @property()
  viewModel: MapCentricViewModel = new MapCentricViewModel();

  @aliasOf("viewModel.zoomLevel")
  @property()
  zoomLevel: string | null = null;

  @aliasOf("viewModel.highlightedFeature")
  @property()
  highlightedFeature = null;

  @property()
  theme: "light" | "dark" = "light";

  @property()
  @messageBundle(`${import.meta.env.BASE_URL}assets/t9n/Components/MapCentric/resources`)
  mapCentricMessages: typeof MapCentric_t9n | null = null;

  @property()
  @messageBundle(`${import.meta.env.BASE_URL}assets/t9n/Common/common`)
  commonMessages: typeof Common_t9n | null = null;

  @aliasOf("viewModel.relatedFeatures")
  relatedFeatures: RelatedFeatures | null = null;

  @aliasOf("viewModel.onlyDisplayFeaturesWithAttachments")
  onlyDisplayFeaturesWithAttachments = null;

  @aliasOf("viewModel.applyEffectToNonActiveLayers")
  applyEffectToNonActiveLayers: boolean | null = null;

  @aliasOf("viewModel.nonActiveLayerEffects")
  nonActiveLayerEffects = null;

  @aliasOf("viewModel.attributeEditing")
  attributeEditing: boolean | null = null;

  @aliasOf("viewModel.attrEditError")
  attrEditError: HTMLCalciteAlertElement | null = null;

  @aliasOf("viewModel.attrEditModal")
  attrEditModal: HTMLCalciteModalElement | null = null;

  @aliasOf("viewModel.queryParams")
  queryParams;

  @property()
  zoomSliderNode: HTMLCalciteSliderElement | null = null;

  @property()
  hideAttributePanel: boolean;

  private _sanitizer = createSanitizerInstance(Sanitizer);

  postInitialize() {
    if (this.onboardingIsEnabled) {
      this.own([this._handleOnboarding()]);
    } else {
      if (document.body.clientWidth < 813) {
        this._currentMobileScreen = "images";
        this.scheduleRender();
      }
    }
    this.own([
      this._handleAttachmentUrl(),
      this._galleryScrollTopOnFeatureRemoval(),
      this._watchAttachmentData(),
      this._scrollGalleryToTopOnAttachmentRemoval(),
      this._watchSelectedFeature(),
      watch(
        () => this.selectedAttachmentViewerData,
        () => this.scheduleRender()
      ),
      watch(
        () => this.layerSwitcher?.selectedLayer,
        () => {
          if (this.featureContentPanelIsOpen) {
            this.featureContentPanelIsOpen = false;
            this.currentImageUrl = null;
            this.set("viewModel.selectedAttachmentViewerData.attachmentIndex", 0);
            this.set("selectedAttachmentViewerData.selectedFeatureAddress", null);
            this.set("selectedAttachmentViewerData.selectedFeature", null);
            this.viewModel.closeTooltipPopup();
          }
        }
      ),
      when(
        () => !this.featureContentPanelIsOpen,
        () => {
          this._featureContentExpanded = false;
          this.viewModel.errorMessage = null;
          this.scheduleRender();
        },
        { initial: true }
      ),
      when(
        () => this.viewModel?.state === "editing",
        () => {
          when(
            () => this.viewModel?.state === "ready",
            () => {
              (this.attrEditModal as HTMLCalciteModalElement).open = false;
            },
            {
              once: true
            }
          );
        }
      ),
      when(
        () => this.attrEditError,
        () => {
          this.attrEditError?.addEventListener("calciteAlertClose", () => {
            (this.attrEditError as HTMLCalciteAlertElement).innerHTML = "";
            this.viewModel.errorMessage = null;
          });
        },
        { once: true }
      ),
      when(
        () => this.viewModel?.errorMessage,
        () => {
          const msg = document.createElement("div");
          msg.setAttribute("slot", "message");
          msg.innerText = `${this.viewModel.errorMessage} ${this.commonMessages?.editAttributes?.notSaved}`;
          this.attrEditError?.appendChild(msg);
          this.attrEditError?.setAttribute("active", "");
        }
      ),
      when(
        () => this.zoomSliderNode,
        () => {
          this.zoomSliderNode?.addEventListener("calciteSliderInput", (e: any) => {
            if (this._imageViewer) this._imageViewer.zoom(e.target.value);
          });
        },
        { once: true }
      )
    ]);
    if (this.addressEnabled) {
      this.own([this._watchSelectedFeatureAddress()]);
    }

    this.own([
      when(
        () => !this.imagePanZoomEnabled,
        () => {
          if (this._imageViewer) {
            this._imageViewer.destroy();
            this._imageViewer = null;
            this._imageViewerSet = false;
            this._imageZoomLoaded = false;
          }
        }
      )
    ]);
  }

  destroy(): void {
    this.viewModel?.destroy();
  }

  private _handleOnboarding(): __esri.WatchHandle {
    return when(
      () => this.view,
      () => {
        if (this.showOnboardingOnStart) {
          this._onboardingPanelIsOpen = true;
          if (document.body.clientWidth < 813) {
            this._currentMobileScreen = "information";
          }
        } else {
          this._handleOnboardingOnVisitDisabled();
        }
        this.scheduleRender();
      },
      { once: true, initial: true }
    );
  }

  private _handleOnboardingOnVisitDisabled(): void {
    this._onboardingPanelIsOpen = false;
    if (document.body.clientWidth < 813) {
      this._currentMobileScreen = "images";
    }
  }

  private _handleAttachmentUrl(): __esri.WatchHandle {
    return watch(
      () => [
        this.selectedAttachmentViewerData?.selectedFeatureAttachments?.attachments,
        this.selectedAttachmentViewerData?.attachmentIndex
      ],
      () => {
        if (!this.selectedAttachmentViewerData) {
          return;
        }
        const attachment = this.viewModel.getCurrentAttachment();
        const attachmentUrl = attachment && (attachment.get("url") as string);
        this.currentImageUrl = this.viewModel.updateAttachmentUrlToHTTPS(
          attachmentUrl as string
        ) as string;
        this.scheduleRender();
      },
      { initial: true }
    );
  }

  private _galleryScrollTopOnFeatureRemoval(): __esri.WatchHandle {
    return watch(
      () => this.layerSwitcher?.selectedLayer,
      () => {
        this._scrollGalleryToTop();
      }
    );
  }

  private _watchAttachmentData(): __esri.WatchHandle {
    return on(
      () => this.selectedAttachmentViewerData?.attachmentDataCollection,
      "after-changes",
      () => this.scheduleRender()
    );
  }

  private _scrollGalleryToTopOnAttachmentRemoval(): __esri.WatchHandle {
    return on(
      () => this.selectedAttachmentViewerData?.attachmentDataCollection,
      "after-remove",
      () => this._scrollGalleryToTop()
    );
  }

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

  private _watchSelectedFeature(): __esri.WatchHandle {
    return watch(
      () => this.selectedAttachmentViewerData?.selectedFeature,
      () => this.scheduleRender()
    );
  }

  private _watchSelectedFeatureAddress(): __esri.WatchHandle {
    return watch(
      () => this.selectedAttachmentViewerData?.selectedFeatureAddress,
      () => this.scheduleRender()
    );
  }

  render(): any {
    const header = this._renderHeader();
    const fullAttachment = this._renderFullAttachmentContainer();
    const content = this._renderContent();
    const { clientWidth } = document.body;
    const isMobile = clientWidth < 813;
    const mobile = isMobile ? this._renderMobile() : null;
    const mobileNav = isMobile ? this._renderMobileNav() : null;
    const attrModal = this.attributeEditing ? this._renderAttributeEditModal() : null;
    return (
      <div
        bind={this}
        afterCreate={(node) => {
          this._resizeObserver.observe(node);
        }}
        class={CSS.base}
      >
        {header}
        {isMobile ? (
          <div class={CSS.mobileBody}>
            {mobile}
            {mobileNav}
          </div>
        ) : (
          <div
            key={buildKey("desktop")}
            styles={
              this._header
                ? {
                    height: `calc(100% - ${this._header?.offsetHeight}px)`
                  }
                : {}
            }
            class={CSS.desktopContent}
          >
            {fullAttachment}
            {content}
          </div>
        )}
        {this.attributeEditing ? (
          <calcite-alert
            bind={this}
            afterCreate={storeNode}
            data-node-ref="attrEditError"
            auto-dismiss="true"
            auto-dismiss-duration="medium"
            kind="danger"
            icon="exclamation-mark-triangle-f"
          />
        ) : null}
        {attrModal}
      </div>
    );
  }

  private _renderMobile(): any {
    const mobileContent = this._renderMobileContent();
    return (
      <div key={buildKey("mobile")} class={CSS.mobile}>
        {mobileContent}
      </div>
    );
  }

  private _renderMobileNav(): any {
    const mobileNavItems = this._renderMobileNavItems();
    return (
      <div key={buildKey("mobile-nav")} class={CSS.mobileNav}>
        {mobileNavItems}
      </div>
    );
  }

  private _renderMobileNavItems(): any {
    const navObjects = this._generateNavObjects();
    return navObjects.map((navItem, navItemIndex) => {
      const isLast = navObjects.length - 1 === navItemIndex;
      return this._renderMobileNavItem(navItem, isLast);
    });
  }

  private _renderMobileContent(): any {
    const mapView = this._renderMapView();
    const mobileOnboarding = this._renderMobileOnboarding();
    const mobileMedia = this._renderMobileMedia();
    return (
      <div class={CSS.mobileContent}>
        {mapView}
        {this._currentMobileScreen === "map" ? null : (
          <div class={CSS.mobileOnboardingGallery}>
            {this._currentMobileScreen === "information"
              ? mobileOnboarding
              : this._currentMobileScreen === "images"
              ? mobileMedia
              : null}
          </div>
        )}
      </div>
    );
  }

  private _renderMobileMedia(): any {
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

  private _renderMobileOnboarding(): any {
    const onboardingWelcomeContent = this._renderOnboardingWelcomeContent();
    const onboardingOverlayDark = {
      [CSS.onboardingOverlayDark]: this.theme === "dark"
    };
    return (
      <focus-trap>
        <div
          key={buildKey("mobile-onboarding")}
          class={this.classes(CSS.onboardingOverlay, onboardingOverlayDark)}
        >
          <div class={CSS.onboardingContentContainer}>{onboardingWelcomeContent}</div>
        </div>
      </focus-trap>
    );
  }

  private _renderMobileNavItem(navItem: NavItem, isLast: boolean): any {
    const { type, iconClass } = navItem;
    const mobileNavItemSelected = {
      [CSS.mobileNavItemSelected]: type === this._currentMobileScreen
    };
    const mobileNavItemOnboardingDisabled = {
      [CSS.mobileNavItemOnboardingDisabled]: !this.onboardingIsEnabled
    };
    const buttonTheme = this.viewModel.getThemeButtonColor("accent", "accent");
    return (
      <div
        bind={this}
        onclick={this._handleNavItem}
        onkeydown={this._handleNavItem}
        class={this.classes(
          CSS.mobileNavItem,
          mobileNavItemSelected,
          mobileNavItemOnboardingDisabled
        )}
        data-nav-item={type}
        role="button"
        styles={{
          ...buttonTheme,
          border: "none",
          borderRight: isLast ? "none" : buttonTheme?.border
        }}
      >
        <calcite-icon
          styles={{
            ...buttonTheme,
            border: "none"
          }}
          icon={iconClass}
          scale="s"
        ></calcite-icon>
      </div>
    );
  }

  private _renderHeader(): any {
    const {
      applySharedTheme,
      sharedTheme,
      customTheme,
      viewModel,
      enableHeaderBackground,
      headerBackground,
      enableHeaderColor,
      headerColor
    } = this;
    const title =
      document.body.clientWidth < 830 && (this.title as string).length > 40
        ? `${(this.title as string).split("").slice(0, 35).join("")}...`
        : this.title;
    const theme = viewModel.getTheme("primary", "primary");

    const logo =
      this.customTheme?.applySharedTheme && this.sharedTheme?.logo
        ? this.sharedTheme.logo
        : this.customTheme?.logo
        ? this.customTheme.logo
        : "";
    const logoLink =
      ((applySharedTheme && !customTheme) || customTheme?.preset === "shared") &&
      sharedTheme?.logoLink
        ? sharedTheme.logoLink
        : customTheme?.logoLink
        ? customTheme.logoLink
        : "";

    const fontFamily = customTheme?.font ?? "var(--calcite-sans-family)";
    if (enableHeaderBackground && headerBackground && !theme.backgroundColor) {
      theme.backgroundColor = headerBackground;
    }
    if (enableHeaderColor && headerColor && !theme.color) {
      theme.color = headerColor;
    }
    return (
      <instant-apps-header
        bind={this}
        afterCreate={storeNode}
        data-node-ref="_header"
        style={`--calcite-ui-icon: ${theme?.color};`}
        logo-image={`${logo}${logo && this.token ? `?token=${this.token}` : ""}`}
        logo-link={logoLink}
        title-text={title}
        background-color={theme?.backgroundColor}
        text-color={theme?.color}
        onInfoIsOpenChanged={() => {
          this._toggleOnboardingPanel();
        }}
        info-is-open={`${
          document.body.clientWidth > 915 && this.onboardingIsEnabled && this._onboardingPanelIsOpen
        }`}
        info-button={`${document.body.clientWidth > 915 && this.onboardingIsEnabled}`}
        logo-scale={customTheme?.logoScale ? customTheme.logoScale : "m"}
        font-family={fontFamily}
      >
        {this._renderSocialShare()}
      </instant-apps-header>
    );
  }

  private _renderSocialShare(): any {
    const theme = this.viewModel.getTheme("primary", "primary");
    return this.socialSharingEnabled && document.body.clientWidth > 915 ? (
      <instant-apps-social-share
        style={`--instant-apps-social-share-popover-button-icon-color: ${
          theme?.color ? theme.color : "var(--calcite-ui-text-1)"
        };${
          this.customTheme?.appFont ? ` font-family: ${this.customTheme?.appFont} !important;` : ""
        }`}
        bind={this}
        afterCreate={storeNode}
        afterUpdate={(node: HTMLInstantAppsSocialShareElement) => {
          const url = node.shareUrl;
          if (!url) return;
          const urlObj = new URL(url);
          for (const prop in this.queryParams) {
            urlObj.searchParams.set(prop, `${this.queryParams[prop]}`);
          }
          node.shareUrl = urlObj.href;
        }}
        data-node-ref="_socialShare"
        share-button-color="inverse"
        view={this.view}
        slot="actions-end"
        auto-update-share-url="false"
      />
    ) : null;
  }

  private _renderContent(): any {
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

  private _renderAttributeEditModal(): any {
    const featureWidgetTitle = this.get("viewModel.featureWidget.title");

    return (
      <calcite-modal
        key="esri-av--map-centric-attr-edit"
        bind={this}
        data-node-ref="attrEditModal"
        afterCreate={storeNode}
        width="s"
        no-padding="true"
        class={this.theme === "dark" ? "calcite-mode-dark" : "calcite-mode-light"}
      >
        <h3 slot="header">{featureWidgetTitle ? featureWidgetTitle : ""}</h3>
        <div slot="content">{this.viewModel.featureFormWidget?.render()}</div>
        <calcite-button
          bind={this}
          onclick={this._closeAttrEditPanel}
          onkeydown={this._closeAttrEditPanel}
          appearance="outline"
          slot="secondary"
          width={document.body.clientWidth > 813 ? "auto" : "full"}
        >
          {this.commonMessages?.cancel}
        </calcite-button>
        <calcite-button
          bind={this}
          onclick={this._saveAttributeEdits}
          onkeydown={this._saveAttributeEdits}
          slot="primary"
          loading={this.viewModel.state === "editing" ? true : false}
          width={document.body.clientWidth > 813 ? "auto" : "full"}
        >
          {this.commonMessages?.save}
        </calcite-button>
      </calcite-modal>
    );
  }

  private _renderSidePanel(): any {
    const layerSwitcher = this._renderLayerSwitcher();
    const galleryContentPanelContainer = this._renderFeatureGalleryContentPanelContainer();
    return (
      <div class={CSS.sidePanel}>
        {layerSwitcher}
        {galleryContentPanelContainer}
      </div>
    );
  }

  private _renderLayerSwitcher(): any {
    return (
      <div key={buildKey("back-layer-container")} class={CSS.backToGalleryContainer}>
        {this.featureContentPanelIsOpen ? (
          <div
            bind={this}
            onclick={this._closeFeatureContent}
            onkeydown={this._closeFeatureContent}
            tabIndex={0}
            class={CSS.backToGallery}
            title={this.commonMessages?.back}
          >
            <calcite-icon
              icon={this.docDirection === "ltr" ? "arrow-left" : "arrow-right"}
              scale="s"
              styles={{
                ...this.viewModel.getThemeButtonColor("secondary", "secondary"),
                border: "none"
              }}
            />
          </div>
        ) : null}
        <div
          bind={this.layerSwitcher?.container}
          afterCreate={this.layerSwitcher ? attachToNode : null}
          class={CSS.layerSwitcherContainer}
        />
      </div>
    );
  }

  private _renderFeatureGalleryContentPanelContainer(): any {
    const featureGallery = this._renderFeatureGallery();
    const featureContentPanel = this._renderFeatureContentPanel();
    const multipleLayers = {
      [CSS.multipleLayers]: (this.get("attachmentViewerDataCollection.length") as number) > 1
    };
    return (
      <div class={this.classes(CSS.featureContentGalleryContainer, multipleLayers)}>
        {featureGallery}
        {featureContentPanel}
      </div>
    );
  }

  private _renderOnboarding(): any {
    const onboardingIsOpen = {
      [CSS.onboardingOpen]: this._onboardingPanelIsOpen
    };
    const onboarding = this._onboardingPanelIsOpen ? this._renderOnboardingPanel() : null;
    return (
      <div
        key={buildKey("onboarding-container")}
        class={this.classes(CSS.onboardingMain, onboardingIsOpen)}
      >
        <focus-trap>{onboarding}</focus-trap>
      </div>
    );
  }

  private _renderOnboardingPanel(): any {
    const onboardingWelcomeContent = this._renderOnboardingWelcomeContent();
    const onboardingStartButton = this._renderOnboardingStartButton();
    return (
      <div bind={this} onclick={this._disableOnboardingPanel} class={CSS.onboardingOverlay}>
        <div
          bind={this}
          onclick={(e: Event) => {
            e.stopPropagation();
          }}
          class={CSS.onboardingContentContainer}
        >
          {onboardingWelcomeContent}
          {onboardingStartButton}
        </div>
      </div>
    );
  }

  private _renderOnboardingWelcomeContent(): any {
    return (
      <div class={CSS.onboardingWelcomeContent} key={buildKey("onboarding-welcome")}>
        {this.onboardingContent.render()}
      </div>
    );
  }

  private _renderOnboardingStartButton(): any {
    const buttonText = this.onboardingButtonText
      ? this.onboardingButtonText
      : this.commonMessages?.form?.ok;
    const buttonTheme = this.viewModel.getThemeButtonColor("primary", "primary");
    const styles = `
    button {
      --calcite-ui-brand: ${buttonTheme?.backgroundColor ? buttonTheme.backgroundColor : "#0079c1"};
      --calcite-ui-brand-hover: ${
        buttonTheme?.backgroundColor ? buttonTheme.backgroundColor : "#0079c1"
      };
      --calcite-ui-brand-press: ${
        buttonTheme?.backgroundColor ? buttonTheme.backgroundColor : "#0079c1"
      };
      --calcite-ui-text-inverse: ${buttonTheme?.color ? buttonTheme.color : "#ffffff"};
    }
    `;
    return (
      <div class={CSS.onboardingStartButtonContainer}>
        <calcite-button
          bind={this}
          onclick={this._disableOnboardingPanel}
          onkeydown={this._disableOnboardingPanel}
          tabIndex={0}
          class={CSS.onboardingStartButton}
          afterCreate={(node) => {
            const styleSheet = document.createElement("style");
            styleSheet.id = "startButton";
            styleSheet.innerHTML = this._sanitizer.sanitize(styles);
            node.shadowRoot.appendChild(styleSheet);
            if (document.activeElement !== node) {
              const focusInterval = setInterval(() => {
                node.focus();
                if (document.activeElement === node) {
                  clearInterval(focusInterval);
                }
              }, 50);
            }
          }}
          afterUpdate={(node) => {
            const styleSheet = node.shadowRoot.getElementById("startButton");
            styleSheet.innerHTML = this._sanitizer.sanitize(styles);
          }}
          width="full"
        >
          {buttonText}
        </calcite-button>
      </div>
    );
  }

  private _renderFeatureGallery(): any {
    const attachmentDataCollectionLength = this.get(
      "selectedAttachmentViewerData.attachmentDataCollection.length"
    ) as number;
    const noVisibleLayers = this.layerSwitcher?.featureLayerCollection?.every(
      (layer) => !layer.visible
    );
    const featureGalleryItems =
      this.selectedAttachmentViewerData && attachmentDataCollectionLength > 0 && !noVisibleLayers
        ? this._renderFeatureGalleryItems()
        : null;
    const featureObjectIdsLength = this.get(
      "selectedAttachmentViewerData.featureObjectIds.length"
    ) as number;

    const layerSwitcherIsEnabled = {
      [CSS.layerSwitcherMobile]: (this.get("attachmentViewerDataCollection.length") as number) > 1
    };
    const loader =
      featureObjectIdsLength > attachmentDataCollectionLength && !noVisibleLayers
        ? this._renderGalleryLoader()
        : null;
    return (
      <div
        bind={this}
        afterCreate={storeNode}
        data-node-ref="_triggerScrollElement"
        onscroll={this._triggerScrollQuery}
        class={this.classes(CSS.featureGalleryContainer, layerSwitcherIsEnabled)}
      >
        {featureGalleryItems}
        {loader}
      </div>
    );
  }

  private _renderGalleryLoader(): any {
    return (
      <div class={CSS.loaderContainer}>
        <calcite-loader scale="s" />
      </div>
    );
  }

  private _renderFeatureGalleryItems(): any {
    const attachmentDataCollection = this.get(
      "selectedAttachmentViewerData.attachmentDataCollection"
    ) as __esri.Collection<AttachmentData>;
    return (
      <div>
        {this.selectedAttachmentViewerData &&
          attachmentDataCollection
            .toArray()
            .map((feature) => this._renderFeatureGallleryItem(feature))}
      </div>
    );
  }

  private _renderFeatureGallleryItem(attachmentContent: any): any {
    if (!attachmentContent) {
      return;
    }
    const { attachments, objectId } = attachmentContent;
    const thumbnailContainer = this._renderThumbnailContainer(attachments);
    const attachmentUrl = attachments && attachments.length > 0 ? attachments[0].url : null;
    const multSVGIcon =
      attachments && attachments.length > 1 ? this._renderMultipleSVGIcon(objectId) : null;
    const featureTitle = this._renderFeatureTitle(objectId);
    const styles =
      !isNaN(this.thumbnailHeight as number) && this.thumbnailHeight !== null
        ? {
            height: `${this.thumbnailHeight}px`
          }
        : {};
    return (
      <div
        styles={styles}
        key={buildKey(`gallery-item-${attachmentUrl}`)}
        bind={this}
        class={CSS.featureGalleryGridItem}
        onmouseover={this._openToolTipPopup}
        onmouseleave={this._closeToolTipPopup}
        onclick={this._selectGalleryItem}
        onkeydown={this._selectGalleryItem}
        data-object-id={`${objectId}`}
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

  private _renderMultipleSVGIcon(objectId: number): any {
    const layerId = this.get("selectedAttachmentViewerData.layerData.featureLayer.id") as string;
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

  private _renderFeatureTitle(objectId: number): any {
    const titleText = this._processTitle(objectId);
    return <div class={CSS.featureContentTitleContainer}>{titleText}</div>;
  }

  private _renderThumbnailContainer(attachments: any): any {
    const attachment = attachments[0];
    const contentType = attachment && attachment.contentType;
    const imageAttachmentTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif"];

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

    const fit = {
      ["esri-map-centric__image-thumbnail--fit"]: this.thumbnailFormat === "fit"
    };

    const crop = {
      ["esri-map-centric__image-thumbnail--crop"]: this.thumbnailFormat === "crop"
    };

    return (
      <div class={CSS.thumbnailContainer}>
        {!attachments || (attachments && attachments.length === 0) ? (
          <div key={buildKey("no-attachments-container")} class={CSS.noAttachmentsContainer}>
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
            class={this.classes(CSS.imageThumbnail, fit, crop)}
            src={
              attachmentUrl
                ? attachmentUrl?.indexOf("?") === -1
                  ? `${attachmentUrl}?w=200`
                  : `${attachmentUrl}&w=200`
                : ""
            }
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

  private _renderPDFThumbnailContainer(): any {
    return (
      <div class={this.classes(CSS.pdfContainer, "esri-map-centric__pointer-events-none")}>
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

  private _renderFeatureContentPanel(): any {
    const mediaViewerDesktop = this._renderMediaViewerDesktop();
    const featureInfo = this._renderFeatureInfoPanel();
    const featureContentPanelIsOpen = {
      [CSS.featureContentPanelOpen]: this.featureContentPanelIsOpen
    };
    const featureContentPanelLayerSwitcher = {
      [CSS.featureContentPanelLayerSwitcher]:
        this.attachmentViewerDataCollection && this.attachmentViewerDataCollection.length > 1
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
        {!this._featureContentExpanded ? mediaViewerDesktop : null}
        {featureInfo}
        {this.relatedFeatures?.render()}
      </div>
    );
  }

  private _renderMediaViewerDesktop(): any {
    const mediaContainer = this._renderMediaContainer();
    const expandAttachment =
      this.viewModel.mapCentricState !== "querying" &&
      this.selectedAttachmentViewerData &&
      this.selectedAttachmentViewerData?.selectedFeatureAttachments &&
      (this.selectedAttachmentViewerData?.selectedFeatureAttachments?.attachments
        ?.length as number) > 0
        ? this._renderExpandAttachment()
        : null;
    return (
      <div key="esri-av-map-centric--media-viewer-desktop" class={CSS.mediaViewerDesktop}>
        {expandAttachment}
        {mediaContainer}
      </div>
    );
  }

  private _renderExpandAttachment(): any {
    return (
      <button
        bind={this}
        onclick={this._expandAttachment}
        onkeydown={this._expandAttachment}
        afterCreate={storeNode}
        data-node-ref="_expandAttachmentNode"
        tabIndex={!this.featureContentPanelIsOpen ? -1 : 0}
        class={CSS.expandMediaContainer}
        title={this.mapCentricMessages?.viewInFullScreen}
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

  private _renderMediaContainer(): any {
    if (!this.selectedAttachmentViewerData) {
      return;
    }
    const mediaViewerParentContainer = this._renderMediaViewerParentContainer();
    return (
      <div class={CSS.mediaViewerSection}>
        {this._layerDoesNotSupportAttachments ? (
          // HARDCODED IN EN
          <div class={CSS.layerNotSupported}>Selected layer does not support attachments</div>
        ) : (
          mediaViewerParentContainer
        )}
      </div>
    );
  }

  private _renderMediaViewerParentContainer(): any {
    const downloadEnabled = {
      [CSS.downloadEnabled]: !this.viewModel.downloadEnabled
    };

    const attachment = this.viewModel.getCurrentAttachment();

    const mediaViewerContainer = this._renderMediaViewerContainer();
    const imageDirection = this._fullAttachmentContainerIsOpen
      ? this.imageDirectionEnabled
        ? this._renderImageDirection(attachment as __esri.AttachmentInfo)
        : null
      : null;

    return (
      <div key={buildKey("image-container")} class={this.classes(downloadEnabled, CSS.mediaViewer)}>
        {mediaViewerContainer}
        {imageDirection}
        {this._renderAttachmentScrollContainer()}
      </div>
    );
  }

  private _renderMediaViewerContainer(): any {
    const { currentImageUrl } = this;
    const attachment = this.viewModel.getCurrentAttachment();
    const contentType = attachment && (attachment.get("contentType") as string);

    const video =
      contentType && contentType.indexOf("video") !== -1
        ? this._renderVideo(currentImageUrl as string)
        : null;

    const isIE =
      navigator.userAgent.indexOf("MSIE") !== -1 || navigator.appVersion.indexOf("Trident/") > -1;

    const pdf =
      contentType && contentType.indexOf("pdf") !== -1 && !isIE
        ? this._renderPdf(currentImageUrl as string)
        : null;

    const image =
      this.supportedAttachmentTypes?.indexOf(contentType as string) !== -1 &&
      contentType?.indexOf("pdf") === -1 &&
      contentType?.indexOf("mov") === -1 &&
      contentType?.indexOf("mp4") === -1 &&
      contentType?.indexOf("gif") === -1 &&
      contentType?.indexOf("quicktime") === -1
        ? currentImageUrl
          ? this.imagePanZoomEnabled && this._fullAttachmentContainerIsOpen
            ? null
            : this._renderCurrentImage()
          : null
        : null;

    const gif =
      contentType && contentType.indexOf("gif") !== -1 ? this._renderCurrentImage() : null;

    const attachmentsLength = this.get(
      "selectedAttachmentViewerData.selectedFeatureAttachments.attachments.length"
    );

    return (
      <div
        bind={this}
        afterCreate={storeNode}
        data-node-ref="_mediaViewerContainer"
        class={CSS.mediaContainer}
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
        ) : attachmentsLength === 0 && this.viewModel.mapCentricState !== "querying" ? (
          <div key={buildKey("no-attachments-container")} class={CSS.noAttachmentsContainer}>
            <svg class={CSS.svg.media} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">
              <path d="M1 2v12h14V2zm13 11H2V3h12zm-1-1H3v-1h10zM3 8.678l.333-.356a.3.3 0 0 1 .445 0 .3.3 0 0 0 .444 0l2.242-2.39a.3.3 0 0 1 .423-.021l2.255 2.005a.299.299 0 0 0 .39.01l1.361-.915a.3.3 0 0 1 .41.032L13 8.678V10H3zM11.894 9l-.89-.859-.846.565a1.299 1.299 0 0 1-1.68-.043L6.732 7.11 4.958 9zm-.644-4.5a.75.75 0 1 1-.75-.75.75.75 0 0 1 .75.75z" />
            </svg>

            <span class={CSS.noAttachmentsText}>{this.mapCentricMessages?.noAttachmentsFound}</span>
          </div>
        ) : null}
      </div>
    );
  }

  private _renderCurrentImage(): any {
    const url = this.currentImageUrl
      ? this.currentImageUrl?.indexOf("?") === -1
        ? `${this.currentImageUrl}?w=600`
        : `${this.currentImageUrl}&w=600`
      : "";
    return (
      <img
        bind={this}
        key={buildKey(`image-desktop-${this.currentImageUrl}`)}
        class={CSS.imageDesktop}
        src={url}
      />
    );
  }

  private _renderVideo(currentImageUrl: string): any {
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
        {/* Hardcoded in EN */}
        Your browser does not support the video tag.
      </video>
    );
  }

  private _renderPdf(currentImageUrl: string): any {
    return (
      <iframe
        class={CSS.pdf}
        key={buildKey(`pdf-${currentImageUrl}`)}
        src={currentImageUrl}
        frameborder="0"
      />
    );
  }

  private _renderAttachmentScrollContainer(): any {
    const attachments = this.get(
      "selectedAttachmentViewerData.selectedFeatureAttachments.attachments"
    ) as __esri.Collection<__esri.AttachmentInfo>;

    const attachment = this.viewModel.getCurrentAttachment();
    const imageDirection = this._renderImageDirection(attachment as __esri.AttachmentInfo);
    const download = this._renderDownload();
    const attachmentScroll = this._renderAttachmentScroll();
    return (
      <div key={buildKey("attachment-scroll")} class={CSS.attachmentNumber}>
        {attachments && attachments.length > 0 ? (
          <div key={buildKey("download-attachment")} class={CSS.downloadIconTextContainer}>
            {attachmentScroll}
            {imageDirection}
          </div>
        ) : null}
        {download}
      </div>
    );
  }

  private _renderAttachmentScroll(): any {
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
          disabled={attachments && attachments.length < 2 ? true : false}
          tabIndex={0}
          class={CSS.leftArrowContainer}
          title={this.mapCentricMessages?.previousAttachment}
        >
          <calcite-icon
            icon={this.docDirection === "rtl" ? "chevron-right" : "chevron-left"}
            scale="s"
          />
        </button>
        <span class={CSS.attachmentNumberText}>
          {`${currentIndex} ${this.mapCentricMessages?.of} ${totalNumberOfAttachments}`}
        </span>
        <button
          bind={this}
          onclick={this._nextImage}
          onkeydown={this._nextImage}
          disabled={attachments && attachments.length < 2 ? true : false}
          tabIndex={0}
          class={CSS.rightArrowContainer}
          title={this.mapCentricMessages?.nextAttachment}
        >
          <calcite-icon
            icon={this.docDirection === "rtl" ? "chevron-left" : "chevron-right"}
            scale="s"
          />
        </button>
      </div>
    );
  }

  private _renderImageDirection(attachment: __esri.AttachmentInfo): any {
    const imageDirectionValue = this.imageDirectionEnabled
      ? this.viewModel.getGPSInformation(attachment)
      : null;
    return imageDirectionValue ? (
      this.docDirection === "ltr" ? (
        <div key={buildKey("gps-image-direction")} class={CSS.gpsImageDirection}>
          {this._fullAttachmentContainerIsOpen ? (
            <span class={CSS.imageDirectionDegrees}>
              {this.mapCentricMessages?.gpsImageDirection}: {`${imageDirectionValue}`}&deg;
            </span>
          ) : null}
          <div
            title={`${this.mapCentricMessages?.gpsImageDirection}: ${imageDirectionValue}\u00B0`}
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
      ) : (
        <div key={buildKey("gps-image-direction")} class={CSS.gpsImageDirection}>
          <div
            title={`${this.mapCentricMessages?.gpsImageDirection}: ${imageDirectionValue}\u00B0`}
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
          {this._fullAttachmentContainerIsOpen ? (
            this.docDirection === "ltr" ? (
              <div
                key={buildKey("map-centric-gps-image-direction")}
                class={CSS.imageDirectionDegrees}
              >
                <div>{this.mapCentricMessages?.gpsImageDirection}: </div>
                <div>{`${imageDirectionValue}`}&deg;</div>
              </div>
            ) : (
              <div
                key={buildKey("map-centric-gps-image-direction")}
                class={CSS.imageDirectionDegrees}
              >
                <div>{this.mapCentricMessages?.gpsImageDirection}: </div>
                <div>{`${imageDirectionValue}`}&deg;</div>
              </div>
            )
          ) : null}
        </div>
      )
    ) : null;
  }

  private _renderDownload(): any {
    const attachment = this.viewModel.getCurrentAttachment();
    const contentType = attachment && (attachment.get("contentType") as string);
    const download =
      contentType &&
      contentType.indexOf("video") === -1 &&
      contentType.indexOf("gif") === -1 &&
      contentType.indexOf("pdf") === -1 &&
      this.viewModel.downloadEnabled
        ? this._renderDownloadButton()
        : null;
    return download;
  }

  private _renderDownloadButton(): any {
    const attachment = this.viewModel.getCurrentAttachment();
    return (
      <button
        class={this.classes(CSS.downloadIconContainer, CSS.downloadButtonDesktop)}
        bind={this}
        onclick={this._downloadImage}
        onkeydown={this._downloadImage}
        data-image-url={this.currentImageUrl}
        data-image-name={attachment?.name}
        title={this.mapCentricMessages?.download}
      >
        <calcite-icon scale="m" icon="download"></calcite-icon>
      </button>
    );
  }

  private _renderFeatureInfoPanel(): any {
    const featureWidget = this.get("viewModel.featureWidget") as __esri.Feature;

    const featureWidgetContent =
      featureWidget && (featureWidget.get("viewModel.content") as __esri.Content[]);

    const fieldsInfoContent =
      (featureWidget &&
        featureWidgetContent &&
        featureWidgetContent.filter((contentItem) => {
          const fieldInfos = contentItem.get("fieldInfos") as __esri.FieldInfo[];
          return contentItem.type === "fields" && fieldInfos && fieldInfos.length > 0;
        })) ||
      [];

    const mediaInfoContent =
      (featureWidget &&
        featureWidgetContent &&
        featureWidgetContent.filter((contentItem) => {
          const mediaInfos = contentItem.get("mediaInfos") as __esri.MediaInfo[];
          return contentItem.type === "media" && mediaInfos && mediaInfos.length > 0;
        })) ||
      [];

    const fieldsInfoText =
      (featureWidget &&
        featureWidgetContent &&
        featureWidgetContent.filter((contentItem) => {
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

    const address = this._renderFeatureContentAddress();
    const unsupportedAttachmentTypesLength = this.get(
      "selectedAttachmentViewerData.unsupportedAttachmentTypes.length"
    ) as number;
    const unsupportedAttachmentTypes =
      unsupportedAttachmentTypesLength > 0 ? this._renderUnsupportedAttachmentTypes() : null;

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
      (this.selectedAttachmentViewerData.get("featureObjectIds.length") as number);
    const { mapCentricState } = this.viewModel;
    const featureContentRelatedFeatures = {
      [CSS.featureContentNoRelatedFeatures]: this.relatedFeatures?.relatedFeatures?.length === 0
    };
    const featureContentHeader = this._renderFeatureContentHeader();

    const layerId = this.get("selectedAttachmentViewerData.layerData.featureLayer.id");
    const objectIdField = this.get(
      "selectedAttachmentViewerData.layerData.featureLayer.objectIdField"
    ) as string;
    const attributes = this.get("selectedAttachmentViewerData.selectedFeature.attributes");
    const objectId = attributes && attributes[objectIdField];
    const featureWidgetTitle = this.get("viewModel.featureWidget.title");
    const title = featureWidgetTitle && featureWidgetTitle !== "null" ? featureWidgetTitle : "";
    const featureContentExpanded = {
      [CSS.featureContentExpanded]: this._featureContentExpanded
    };
    const featureContentContainerContentExpanded = {
      [CSS.featureContentContainerExpanded]: this._featureContentExpanded
    };
    const featureContentPanelHasRelatedFeatures = {
      [CSS.featureContentHasRelatedFeatures]:
        (this.relatedFeatures?.relatedFeatures?.length as number) > 0
    };
    return (
      <div
        class={this.classes(
          CSS.featureContent,
          featureContentExpanded,
          featureContentRelatedFeatures,
          featureContentPanelHasRelatedFeatures
        )}
      >
        {featureContentHeader}
        {mapCentricState === "waitingForContent" || mapCentricState === "querying" ? (
          <div class={CSS.featureContentLoader}>
            <div class={CSS.loaderGraphic} />
            <div>{this.mapCentricMessages?.loading}...</div>
          </div>
        ) : (
          <div
            class={this.classes(
              CSS.featureContentContainer,
              featureContentContainerContentExpanded
            )}
          >
            <div
              key={buildKey(`feature-content-title-${layerId}-${objectId}`)}
              class={CSS.featureContentTitle}
            >
              <h2 class={CSS.featureLayerTitle}>{title}</h2>
            </div>
            {this.addressEnabled ? address : null}
            {(fieldsInfoText && fieldsInfoText.length > 0) ||
            (mediaInfoContent && mediaInfoContent.length > 0) ||
            this._featureContentAvailable ? (
              <div>
                {this._featureContentAvailable ? this._renderFeatureInfoContent() : null}
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

  private _renderFeatureContentHeader(): any {
    const zoomTo = this._renderZoomTo();
    const attrEdit =
      this.attributeEditing && this.viewModel.verifyEditPermissions()
        ? this._renderAttributeEdit()
        : null;
    const featureContentHeaderContentExpanded = {
      [CSS.featureContentHeaderExpanded]: this._featureContentExpanded
    };
    const buttonTheme = this.viewModel.getThemeButtonColor("secondary", "secondary");
    return (
      <div
        class={this.classes(CSS.featureContentHeader, featureContentHeaderContentExpanded)}
        styles={this.viewModel.getTheme("secondary", "secondary")}
      >
        <button
          bind={this}
          onclick={this._toggleFeatureContentExpand}
          class={CSS.expand}
          styles={{ ...buttonTheme, border: "none" }}
        >
          <calcite-icon
            icon={this._featureContentExpanded ? "chevron-down" : "chevron-up"}
            scale="s"
          />
        </button>
        <div class={CSS.featureZoomToContainer}>
          {attrEdit}
          {zoomTo}
        </div>
      </div>
    );
  }

  private _renderAttributeEdit(): any {
    const buttonTheme = this.viewModel.getThemeButtonColor("primary", "primary");
    return (
      <button
        key="attr-edit-button"
        bind={this}
        class={CSS.attrEdit}
        tabIndex={0}
        onclick={this._openAttrEditPanel}
        onkeydown={this._openAttrEditPanel}
        title={this.mapCentricMessages?.openAttrEditPanel}
        label={this.mapCentricMessages?.openAttrEditPanel}
        styles={buttonTheme}
      >
        <calcite-icon scale="s" icon="pencil" />
      </button>
    );
  }

  private _renderZoomTo(): any {
    const buttonTheme = this.viewModel.getThemeButtonColor("primary", "primary");

    return (
      <button
        bind={this}
        class={CSS.zoomTo}
        tabIndex={0}
        onclick={this._zoomTo}
        onkeydown={this._zoomTo}
        title={this.mapCentricMessages?.zoomTo}
        label={this.mapCentricMessages?.zoomTo}
        styles={buttonTheme}
      >
        <calcite-icon scale="s" icon="magnifying-glass-plus" />
      </button>
    );
  }

  private _renderFeatureContentAddress(): any {
    return (
      <h3 class={CSS.addressText}>
        {this.get("selectedAttachmentViewerData.selectedFeatureAddress")}
      </h3>
    );
  }

  private _renderFeatureWidgetContent(): any {
    const featureWidget = this.get("viewModel.featureWidget") as __esri.Feature;
    return (
      <div key={buildKey("feture-widget-content")} class={CSS.featureInfoContent}>
        {featureWidget && featureWidget.render()}
      </div>
    );
  }

  private _renderFeatureInfoContent(): any {
    const featureContentInfo =
      this.selectedAttachmentViewerData && this.selectedAttachmentViewerData.selectedFeatureInfo
        ? this._renderFeatureContentInfos()
        : null;
    return (
      <div key={buildKey("feature-info-content")} class={CSS.featureInfoContent}>
        {featureContentInfo}
      </div>
    );
  }

  private _renderFeatureContentInfos(): any {
    const selectedFeatureInfo = this.selectedAttachmentViewerData?.selectedFeatureInfo;
    const featureContentInfos = selectedFeatureInfo.map(
      (contentInfo: any, contentInfoIndex: number) => {
        return this._renderFeatureContentInfo(contentInfo, contentInfoIndex);
      }
    );
    return <div>{featureContentInfos}</div>;
  }

  private _renderFeatureContentInfo(contentInfo: any, contentInfoIndex: number): any {
    const hyperlink = this.viewModel.isHyperlink(contentInfo);
    const contentCheck = contentInfo && contentInfo.content && contentInfo.content !== null;
    const layerId = this._getLayerId();
    const selectedFeature = this.get(
      "selectedAttachmentViewerData.selectedFeature"
    ) as __esri.Graphic;
    const objectIdField = selectedFeature ? this.viewModel.getObjectIdField(selectedFeature) : null;
    const attributes = selectedFeature && selectedFeature.attributes;
    const objectId = attributes && objectIdField && attributes[objectIdField];
    const key = `feature-content-info-${layerId}-${contentInfo.attribute}-${contentInfo.content}-${objectId}-${contentInfoIndex}`;
    return (
      <div key={buildKey(key)} class={CSS.featureContentInfo}>
        <h4
          class={CSS.attributeHeading}
          innerHTML={this._sanitizer.sanitize(contentInfo.attribute)}
        />
        {contentInfo && contentInfo.content && contentCheck ? (
          hyperlink ? (
            <p class={CSS.attributeContent}>
              <div
                innerHTML={this._sanitizer.sanitize(
                  contentInfo.content.replace(contentInfo.content, "")
                )}
              />
              <span
                innerHTML={this._sanitizer.sanitize(
                  autoLink(contentInfo.content, this.commonMessages)
                )}
              />
            </p>
          ) : contentInfo &&
            contentInfo.content &&
            typeof contentInfo.content === "string" &&
            contentInfo.content.trim() === "" ? (
            <p>{this.mapCentricMessages?.noContentAvailable}</p>
          ) : (
            <p
              class={CSS.attributeContent}
              innerHTML={this._sanitizer.sanitize(contentInfo.content)}
            />
          )
        ) : (
          <p>{this.mapCentricMessages?.noContentAvailable}</p>
        )}
      </div>
    );
  }

  private _renderFeatureContentLoader(): any {
    return (
      <div key={buildKey("feature-content-loader")} class={CSS.widgetLoader}>
        {this.mapCentricMessages?.loading}
      </div>
    );
  }

  private _renderNoFeatureContentInfo(): any {
    return (
      <div key={buildKey("no-content")} class={CSS.noInfo}>
        {this.mapCentricMessages?.noContentAvailable}
      </div>
    );
  }

  private _renderUnsupportedAttachmentTypes(): any {
    const unsupportedAttachmentTypes = this._renderUnsupportedAttachmentTypesList();
    return (
      <div key={buildKey("other-attachment-types")}>
        <h4 class={CSS.attributeHeading}>{this.mapCentricMessages?.otherAttachments}</h4>
        {unsupportedAttachmentTypes}
      </div>
    );
  }

  private _renderUnsupportedAttachmentTypesList(): any {
    const otherAttachmentTypes = this.selectedAttachmentViewerData?.unsupportedAttachmentTypes?.map(
      (attachment: __esri.AttachmentInfo) => {
        return this._renderUnsupportedAttachmentType(attachment);
      }
    );
    return <ul class={CSS.otherAttachmentsList}>{otherAttachmentTypes}</ul>;
  }

  private _renderUnsupportedAttachmentType(attachment: __esri.AttachmentInfo): any {
    const { id, name, size } = attachment;
    return (
      <li key={buildKey(`other-attachment-${id}-${name}-${size}`)}>
        <a href={attachment.url} target="_blank">
          {attachment.name}
        </a>
      </li>
    );
  }

  private _renderFullAttachmentContainer(): any {
    const fullAttachmentNode = this._renderFullAttachmentNode();
    const attachment = this.viewModel.getCurrentAttachment();
    if (this.imagePanZoomEnabled) {
      this._handleImagePanZoom(attachment as __esri.AttachmentInfo);
    }
    const fullAttachmentContainerIsOpen = {
      [CSS.fullMediaContainerOpen]: this._fullAttachmentContainerIsOpen
    };
    return (
      <div
        key={buildKey("full-image-container")}
        class={this.classes(CSS.fullMediaContainer, fullAttachmentContainerIsOpen)}
      >
        <focus-trap inactive={this._fullAttachmentContainerIsOpen ? false : true}>
          {fullAttachmentNode}
        </focus-trap>
      </div>
    );
  }

  private _renderFullAttachmentNode(): any {
    const attachment = this.viewModel.getCurrentAttachment();
    const contentType = attachment && (attachment.get("contentType") as string);
    const contentTypesToCheck = [
      "image/gif",
      "video/mp4",
      "video/mov",
      "video/quicktime",
      "application/pdf"
    ];
    const contentTypeCheck = contentTypesToCheck.indexOf(contentType as string) === -1;

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

    return (
      <div class={CSS.mediaViewerSection}>
        {this._layerDoesNotSupportAttachments ? (
          <div class={CSS.layerNotSupported}>
            {/* Hardcoded in EN */}
            Selected layer does not support attachments
          </div>
        ) : (
          <div class={CSS.mediaViewer}>
            <button
              bind={this}
              afterCreate={storeNode}
              data-node-ref="_fullScreenCloseNode"
              onclick={this._expandAttachment}
              onkeydown={this._expandAttachment}
              class={CSS.closeFeatureContainer}
              title={this.mapCentricMessages?.closeFullScreen}
              tabIndex={
                !this.featureContentPanelIsOpen || !this._fullAttachmentContainerIsOpen ? -1 : 0
              }
            >
              <calcite-icon scale="m" icon="x" />
            </button>

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

  private _renderZoomSlider(): any {
    if (!this._zoomSlider) {
      this._zoomSlider = (
        <calcite-slider
          bind={this}
          afterCreate={storeNode}
          data-node-ref="zoomSliderNode"
          min="100"
          max="500"
          step="10"
        />
      );
    }
    return <div class={CSS.zoomSlider}>{this._zoomSlider}</div>;
  }

  private _renderMapViewContainer(): any {
    const mapView = this._renderMapView();
    return <div class={CSS.mapViewContainer}>{mapView}</div>;
  }

  private _renderMapView(): any {
    return (
      <div bind={this.view?.container} class={CSS.mapView} afterCreate={attachToNode}>
        {this.mapA11yDesc ? (
          <div
            id="mapDescription"
            class="sr-only"
            afterCreate={() => {
              (document.getElementById("mapDescription") as HTMLDivElement).innerHTML =
                this._sanitizer.sanitize(this.mapA11yDesc);
              const rootNode = document.getElementsByClassName("esri-view-surface");
              this.view?.container.setAttribute("aria-describedby", "mapDescription");
              for (let k = 0; k < rootNode.length; k++) {
                rootNode[k].setAttribute("aria-describedby", "mapDescription");
              }
            }}
          >
            {this.mapA11yDesc}
          </div>
        ) : null}
      </div>
    );
  }

  private _toggleOnboardingPanel(): void {
    if (this._onboardingPanelIsOpen) {
      this._onboardingPanelIsOpen = false;
    } else {
      this._onboardingPanelIsOpen = true;
    }
    this.scheduleRender();
  }

  @accessibleHandler()
  private _disableOnboardingPanel(): void {
    this._onboardingPanelIsOpen = false;
    focusNode(this._onboardingButtonDesktop as HTMLElement);
    this.scheduleRender();
  }

  @accessibleHandler()
  private _selectGalleryItem(event: Event): void {
    this.currentImageUrl = null;
    this.set("currentImageUrl", null);
    const node = event.currentTarget as HTMLElement;
    const objectId = node?.getAttribute("data-object-id") as string;
    this.viewModel.handleGalleryItem(
      parseInt(objectId),
      this.selectedAttachmentViewerData as MapCentricData
    );
    this.scheduleRender();
  }

  @accessibleHandler()
  private _zoomTo(): void {
    if (document.body.clientWidth < 813) {
      this._currentMobileScreen = "map";
      this.scheduleRender();
    }
    this.viewModel.zoomTo();
  }

  @accessibleHandler()
  private _toggleFeatureContentExpand(): void {
    this._featureContentExpanded = !this._featureContentExpanded;
    this.scheduleRender();
  }

  @accessibleHandler()
  private _openAttrEditPanel(): void {
    (this.attrEditModal as HTMLCalciteModalElement).open = true;
    this.scheduleRender();
  }

  @accessibleHandler()
  private _closeAttrEditPanel(): void {
    (this.attrEditModal as HTMLCalciteModalElement).open = false;
    (this.viewModel.featureFormWidget as __esri.FeatureForm).feature = this.viewModel?.featureWidget
      ?.graphic as __esri.Graphic;
    this.scheduleRender();
  }

  @accessibleHandler()
  private _previousImage(): void {
    this._disableImagePanZoom();
    this.viewModel.previousImage();
    this.scheduleRender();
  }

  @accessibleHandler()
  private _nextImage(): void {
    this._disableImagePanZoom();
    this.viewModel.nextImage();
    this.scheduleRender();
  }

  @accessibleHandler()
  private _downloadImage(event: Event): void {
    this.viewModel.downloadImage(event);
  }

  @accessibleHandler()
  private _closeFeatureContent(): void {
    this.featureContentPanelIsOpen = false;
    this.currentImageUrl = null;
    this.set("viewModel.selectedAttachmentViewerData.attachmentIndex", 0);
    this.set("selectedAttachmentViewerData.selectedFeatureAddress", null);
    this.set("selectedAttachmentViewerData.selectedFeature", null);
    this.viewModel.closeTooltipPopup();
  }

  @accessibleHandler()
  private _expandAttachment(): void {
    if (this._fullAttachmentContainerIsOpen) {
      this._fullAttachmentContainerIsOpen = false;
      if (this.imagePanZoomEnabled) {
        this._imageViewer && this._imageViewer.destroy();
        this._imageViewer = null;
        this._imageViewerSet = false;
        this._imageZoomLoaded = false;
        (this.zoomSliderNode as HTMLCalciteSliderElement).value = 0;
      }
      this._expandAttachmentNode && this._expandAttachmentNode.focus();
    } else {
      this._fullAttachmentContainerIsOpen = true;
      this._fullScreenCloseNode && this._fullScreenCloseNode.focus();
    }
    this.scheduleRender();
  }

  @accessibleHandler()
  private _handleNavItem(event: Event): void {
    const node = event.currentTarget as HTMLElement;
    const navItem = node.getAttribute("data-nav-item") as string;
    this._currentMobileScreen = navItem;
    this.scheduleRender();
  }

  private _triggerScrollQuery(): void {
    const { _triggerScrollElement } = this;
    if (!_triggerScrollElement) {
      return;
    }
    const { scrollTop, scrollHeight, offsetHeight } = _triggerScrollElement;
    if (scrollTop + 10 > scrollHeight - offsetHeight) {
      this.viewModel.updateAttachmentData();
    }
  }

  private _processTitle(objectId: number): string | null {
    const featureWidget = this.get("view.popup.selectedFeatureWidget") as __esri.Feature;
    const attributes = featureWidget && featureWidget.get("graphic.attributes");
    const objectIdField = featureWidget?.graphic
      ? this.viewModel.getObjectIdField(featureWidget.graphic)
      : null;

    const waitingForContent = featureWidget && featureWidget.get("viewModel.waitingForContent");
    let title: string | null = null;
    if (attributes && objectIdField) {
      if (!waitingForContent && attributes[objectIdField] === objectId) {
        title = this.get("view.popup.title");
      } else {
        title = null;
      }
    }
    const featureTitle = title ? `${title}` : null;
    return featureTitle
      ? (title as string)?.length >= 30
        ? `${title?.split("").slice(0, 25).join("")}...`
        : title
      : null;
  }

  private _openToolTipPopup(event: Event): void {
    this.viewModel.openTooltipPopup(event);
  }

  private _closeToolTipPopup(): void {
    this.viewModel.closeTooltipPopup();
  }

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
    if (this.currentImageUrl && this._fullAttachmentContainerIsOpen && contentTypeCheck) {
      if (this._mediaViewerContainerFullAttachment && !this._imageViewerSet) {
        if (this._imageViewer) {
          this._imageViewer.destroy();
          this._imageViewer = null;
          this._imageViewerSet = false;
          this._imageZoomLoaded = false;
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
        this._imageZoomLoaded = true;
        this.scheduleRender();
      }
    }
  }

  private _disableImagePanZoom(): void {
    if (this.imagePanZoomEnabled) {
      this._imageViewer && this._imageViewer.destroy();
      this._imageViewer = null;
      this._imageViewerSet = false;
      this._imageZoomLoaded = false;
      if (this.zoomSliderNode) {
        this.zoomSliderNode.value = 0;
      }
    }
  }

  private _generateNavObjects(): NavItem[] {
    const navData = this.onboardingIsEnabled ? ["information", "images", "map"] : ["images", "map"];
    return navData.map((navDataItem) => {
      return {
        type: navDataItem,
        iconClass: navDataItem
      };
    });
  }

  private _getLayerId(): string {
    return this.get("selectedAttachmentViewerData.layerData.featureLayer.id");
  }

  private _saveAttributeEdits(): void {
    (this.viewModel.featureFormWidget as __esri.FeatureForm).submit();
  }
}

export default MapCentric;
