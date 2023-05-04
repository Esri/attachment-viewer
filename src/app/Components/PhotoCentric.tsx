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
import { accessibleHandler, tsx, storeNode, messageBundle } from "@arcgis/core/widgets/support/widget";
import Widget from "@arcgis/core/widgets/Widget";
import { watch, on, when } from "@arcgis/core/core/reactiveUtils";
import PhotoCentricViewModel from "./PhotoCentric/PhotoCentricViewModel";
import { attachToNode } from "./utils/utils";
import { focusNode } from "./utils/focusUtils";
import { VNode } from "../interfaces/interfaces";
import { autoLink } from "./utils/urlUtils";
import PhotoCentricData from "./PhotoCentric/PhotoCentricData";
import AttachmentViewerData from "./AttachmentViewer/AttachmentViewerData";
import LayerSwitcher from "./LayerSwitcher";
import ImageViewer from "iv-viewer";
import "iv-viewer/dist/iv-viewer.css";
import Search from "@arcgis/core/widgets/Search";

import ResizeObserver from "resize-observer-polyfill";
import Sanitizer from "@esri/arcgis-html-sanitizer";
import { createSanitizerInstance } from "templates-common-library/functionality/securityUtils";

import Common_t9n from "../../t9n/Common/common.json";
import PhotoCentric_t9n from "../../t9n/Components/PhotoCentric/resources.json";
import OnboardingContent from "./OnboardingContent";

import layerExpression from "./../../config/layerExpression.json";
const CSS = {
  base: "esri-photo-centric",
  // onboarding
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
  // social share
  socialShareContainer: "esri-photo-centric__social-share-container",
  // pagination
  paginationContainer: "esri-photo-centric__pagination-container",
  paginationTextContainer: "esri-photo-centric__pagination-text-container",
  leftArrowContainer: "esri-photo-centric__left-arrow-container",
  rightArrowContainer: "esri-photo-centric__right-arrow-container",
  leftButtonLayerSwitcher: "esri-photo-centric__left-button-layer-switcher",

  rightButtonLayerSwitcher: "esri-photo-centric__right-button-layer-switcher",
  // Layer Switcher container
  layerSwitcherContainer: "esri-photo-centric__layer-switcher-container",
  // Content containers
  mainPageContainer: "esri-photo-centric__main-page-container",
  mainPage: "esri-photo-centric__main-page",
  mainPageTop: "esri-photo-centric__main-page-top-container",
  mainPageBottom: "esri-photo-centric__main-page-bottom-container",
  mainPageMid: "esri-photo-centric__main-page-mid-container",
  rightPanel: "esri-photo-centric__right-panel",
  midBottomContainer: "esri-photo-centric__mid-bottom-container",
  logo: "esri-photo-centric__logo",
  trailingActionButtonContainer: "esri-photo-centric__trailing-action-button-container",
  // mobile collapse
  midBottomContainerCollapsed: "esri-photo-centric__mid-bottom-container--map-collapsed",
  mainPageBottomContainerCollapsed: "esri-photo-centric__main-page-bottom-container--map-collapsed",
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
  featureTitleContainer: "esri-photo-centric__feature-title-container",
  attrEditZoomContainer: "esri-photo-centric__attr-edit-zoom-to-container",
  featureLayerTitle: "esri-photo-centric__feature-layer-title",
  featureInfoContent: "esri-photo-centric__feature-info-content",
  featureContentInfo: "esri-photo-centric__feature-content-info",
  attributeHeading: "esri-photo-centric__attribute-heading",
  attributeContent: "esri-photo-centric__attribute-content",
  featureContent: "esri-photo-centric__feature-content",
  featureContentPanelContent: "esri-photo-centric__feature-content-panel-content",
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
  relatedFeatures: "esri-photo-centric__related-features",
  attrEdit: "esri-photo-centric__attribute-edit-button",
  // pdf
  pdf: "esri-photo-centric__pdf",
  // download
  downloadIconContainer: "esri-photo-centric__download-icon-container",
  downloadButtonDesktop: "esri-photo-centric__download-button-desktop",
  downloadIconTextContainer: "esri-photo-centric__download-icon-text-container",
  downloadIcon: "esri-photo-centric__download-icon",
  downloadEnabled: "esri-photo-centric--download-enabled",
  // minimize
  minimizedFeatureContentPanel: "esri-photo-centric__minimized-feature-content-panel",
  restoreFeatureContentPanelButton: "esri-photo-centric__restore-feature-content-panel-button",
  minimizeZoomToContainer: "esri-photo-centric__minimize-zoom-to-container",
  minimizeButton: "esri-photo-centric__minimize-button",
  featureContentPanelMinimized: "esri-photo-centric__feature-content-panel--minimized",
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
  darkBackground: "esri-photo-centric--dark-background",
  darkText: "esri-photo-centric--dark-text",
  svg: {
    media: "esri-photo-centric__media-svg"
  },

  // freeport customizations
  filterPanel: "filter-panel",
  containerComponents: "containers-components"
};

const WIDGET_KEY_PARTIAL = "esri-photo-centric";

function buildKey(element: string, index?: number): string | undefined {
  if (index === undefined) {
    return `${WIDGET_KEY_PARTIAL}__${element}`;
  }
  return;
}

@subclass("PhotoCentric")
class PhotoCentric extends Widget {
  constructor(value) {
    super(value);
  }

  private _imageAttachment: HTMLImageElement | null = null;
  private _imageCarouselIsOpen: boolean | null = null;
  private _featureContentAvailable: boolean | null = null;
  private _featureContentPanel: HTMLElement | null = null;
  private _imageViewerSet = false;
  private _imageViewer: ImageViewer | null = null;
  private _imageZoomLoaded: boolean | null = null;
  private _onboardingButton: HTMLCalciteButtonElement | null = null;
  private _resizeObserver = new ResizeObserver(() => this.scheduleRender());
  private _zoomSlider;
  private _header;

  @aliasOf("viewModel.applicationItem")
  applicationItem: __esri.PortalItem | null = null;

  @aliasOf("viewModel.applySharedTheme")
  applySharedTheme: boolean | null = null;

  @aliasOf("viewModel.sharedTheme")
  sharedTheme: any = null;

  @aliasOf("viewModel.customTheme")
  customTheme: any = null;

  @aliasOf("viewModel.addressEnabled")
  addressEnabled: boolean | null = null;

  @aliasOf("viewModel.appMode")
  appMode: string | null = null;

  @aliasOf("viewModel.attachmentIndex")
  attachmentIndex: number | null = null;

  @aliasOf("viewModel.attachmentLayers")
  attachmentLayers;

  @aliasOf("viewModel.attachmentViewerDataCollection")
  attachmentViewerDataCollection: __esri.Collection<AttachmentViewerData> | null = null;

  @property()
  photoCentricMobileMapExpanded: boolean | null = null;

  @aliasOf("viewModel.currentImageUrl")
  currentImageUrl: string | null = null;

  @aliasOf("viewModel.defaultObjectId")
  defaultObjectId: number | null = null;

  @property()
  showOnboardingOnStart = true;

  @property()
  docDirection: string | null = null;

  @aliasOf("viewModel.downloadEnabled")
  downloadEnabled: boolean | null = null;

  @aliasOf("viewModel.featureLayerTitle")
  featureLayerTitle: string | null = null;

  @aliasOf("viewModel.featureWidget")
  featureWidget: __esri.Feature | null = null;

  @aliasOf("viewModel.graphicsLayer")
  graphicsLayer: __esri.GraphicsLayer | null = null;

  @aliasOf("viewModel.imageDirectionEnabled")
  imageDirectionEnabled: boolean | null = null;

  @aliasOf("viewModel.imagePanZoomEnabled")
  imagePanZoomEnabled: boolean | null = null;

  @aliasOf("viewModel.layerSwitcher")
  layerSwitcher: LayerSwitcher | null = null;

  @property()
  onboardingButtonText: string | null = null;

  @property()
  onboardingContent: OnboardingContent | null = null;

  @property()
  onboardingImage: string | null = null;

  @aliasOf("viewModel.order")
  order: string | null = null;

  @aliasOf("viewModel.photoCentricSketchExtent")
  photoCentricSketchExtent: __esri.Extent | null = null;

  @aliasOf("viewModel.searchWidget")
  searchWidget: Search | null = null;

  @aliasOf("viewModel.selectedAttachmentViewerData")
  selectedAttachmentViewerData: PhotoCentricData | null = null;

  @aliasOf("viewModel.sketchWidget")
  sketchWidget: __esri.Sketch | null = null;

  @aliasOf("viewModel.socialSharingEnabled")
  socialSharingEnabled: boolean | null = null;

  @aliasOf("viewModel.title")
  title: string | null = null;

  @aliasOf("viewModel.selectFeaturesEnabled")
  selectFeaturesEnabled: boolean | null = null;

  @aliasOf("viewModel.selectedLayerId")
  selectedLayerId: string | null = null;

  @aliasOf("viewModel.token")
  token: string | null = null;

  @aliasOf("viewModel.highlightedFeature")
  highlightedFeature = null;

  @aliasOf("viewModel.view")
  view: __esri.MapView | null = null;

  @aliasOf("viewModel.zoomLevel")
  zoomLevel: string | null = null;

  @property()
  onboardingIsEnabled = true;

  @property()
  onboardingPanelIsOpen: boolean | null = null;

  @aliasOf("viewModel.withinConfigurationExperience")
  withinConfigurationExperience: boolean | null = null;

  @property()
  mapA11yDesc: string;

  @property()
  theme: "light" | "dark" = "light";

  @property()
  @messageBundle(`${import.meta.env.BASE_URL}assets/t9n/Components/PhotoCentric/resources`)
  photoCentricMessages: typeof PhotoCentric_t9n | null = null;

  @property()
  @messageBundle(`${import.meta.env.BASE_URL}assets/t9n/Common/common`)
  commonMessages: typeof Common_t9n | null = null;

  @aliasOf("viewModel.applyEffectToNonActiveLayers")
  applyEffectToNonActiveLayers = null;

  @aliasOf("viewModel.nonActiveLayerEffects")
  nonActiveLayerEffects = null;

  @aliasOf("viewModel.headerBackground")
  headerBackground: string;

  @aliasOf("viewModel.headerColor")
  headerColor: string;

  @aliasOf("viewModel.enableHeaderBackground")
  enableHeaderBackground: boolean;

  @aliasOf("viewModel.enableHeaderColor")
  enableHeaderColor: boolean;

  @property()
  viewModel: PhotoCentricViewModel = new PhotoCentricViewModel();

  @aliasOf("viewModel.onlyDisplayFeaturesWithAttachments")
  onlyDisplayFeaturesWithAttachments = null;

  @aliasOf("viewModel.attributeEditing")
  attributeEditing = null;

  @aliasOf("viewModel.attrEditModal")
  attrEditModal: HTMLCalciteModalElement | null = null;

  @aliasOf("viewModel.attrEditError")
  attrEditError: HTMLCalciteAlertElement | null = null;

  @aliasOf("viewModel.queryParams")
  queryParams;

  @property()
  zoomSliderNode: HTMLCalciteSliderElement | null = null;

  @property()
  photoViewerContainer: HTMLElement | null = null;

  @property()
  hideAttributePanel: boolean;

  private _sanitizer = createSanitizerInstance(Sanitizer);

  postInitialize(): void {
    this.own([
      when(
        () => this.view?.ready,
        () => this._initOnViewReady(),
        { initial: true, once: true }
      )
    ]);
  }

  private _initOnViewReady(): void {
    if (this.onboardingIsEnabled) {
      this._handleOnboardingPanel();
    }
    this.own([
      this._handleCurrentAttachment(),
      this._scrollFeatureContentPanelToTop(),
      this._scheduleRenderOnLayerFeatureChange(),
      this._handleSelectFeaturesWatchers(),
      when(
        () => this.layerSwitcher?.featureLayerCollection?.length,
        () => {
          const layerVisibleWatcher: __esri.WatchHandle[] = [];

          const layerSwitcher = this.layerSwitcher as LayerSwitcher as LayerSwitcher;

          (this.layerSwitcher as LayerSwitcher as LayerSwitcher)?.featureLayerCollection?.forEach((layer) => {
            layerVisibleWatcher.push(
              watch(
                () => layer.visible,
                () => {
                  const noVisibleLayers = layerSwitcher?.featureLayerCollection?.every((layer) => !layer.visible);

                  if (noVisibleLayers) {
                    if (this.imagePanZoomEnabled && this._imageViewer && document.body.clientWidth > 830) {
                      this._imageViewer && this._imageViewer.destroy();
                      this._imageViewer = null;
                      this._imageViewerSet = false;
                      this._imageZoomLoaded = false;
                      if (this.zoomSliderNode) {
                        this.zoomSliderNode.value = 100;
                      }
                    }
                  } else {
                    const attachments = this.get(
                      "selectedAttachmentViewerData.selectedFeatureAttachments.attachments"
                    ) as __esri.Collection<__esri.AttachmentInfo>;
                    const attachmentIndex = this.get("selectedAttachmentViewerData.attachmentIndex") as number;

                    const attachment = attachments?.getItemAt(attachmentIndex) as __esri.AttachmentInfo;
                    this._handlePanZoomForCurrentAttachment(attachment);
                  }
                }
              )
            );
          });

          this.own([...layerVisibleWatcher]);
        }
      ),
      when(
        () => this.viewModel?.state === "editing",
        () => {
          when(
            () => this.viewModel?.state === "ready",
            () => {
              const attrEditModal = this.attrEditModal as HTMLCalciteModalElement;
              attrEditModal.open = false;
            },
            { once: true, initial: true }
          );
        }
      ),
      when(
        () => this.attrEditError,
        () => {
          const attrEditError = this.attrEditError as HTMLCalciteAlertElement;
          attrEditError.addEventListener("calciteAlertClose", () => {
            attrEditError.innerHTML = "";
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
          const attrEditError = this.attrEditError as HTMLCalciteAlertElement;
          attrEditError.appendChild(msg);
          attrEditError.setAttribute("active", "");
        }
      ),
      when(
        () => this.zoomSliderNode,
        () => {
          const zoomSliderNode = this.zoomSliderNode as HTMLCalciteSliderElement;
          zoomSliderNode.addEventListener("calciteSliderInput", (e: any) => {
            const value = e?.target?.value as any;
            if (this._imageViewer) this._imageViewer.zoom(value);
          });
        },
        { once: true }
      )
    ]);

    if (this.imagePanZoomEnabled) {
      this.own([this._setImageZoomLoadedToFalse()]);
    }

    this.own([
      watch(
        () => this.imagePanZoomEnabled,
        () => {
          if (this.imagePanZoomEnabled) {
            const attachments = this.get(
              "selectedAttachmentViewerData.selectedFeatureAttachments.attachments"
            ) as __esri.Collection<__esri.AttachmentInfo>;
            const attachmentIndex = this.get("selectedAttachmentViewerData.attachmentIndex") as number;

            const attachment = attachments?.getItemAt(attachmentIndex) as __esri.AttachmentInfo;

            const attachmentUrl = attachment ? attachment.url : null;
            this.currentImageUrl = this._convertAttachmentUrl(attachmentUrl as string) as string;
            this._handlePanZoomForCurrentAttachment(attachment);
            this.scheduleRender();
          } else {
            this._imageViewer && this._imageViewer.destroy();
            this._imageViewer = null;
            this._imageViewerSet = false;
            this._imageZoomLoaded = false;
            if (this.zoomSliderNode) {
              this.zoomSliderNode.value = 100;
            }
          }
        }
      )
    ]);
  }

  private _handleOnboardingPanel(): void {
    this.onboardingPanelIsOpen = this.showOnboardingOnStart;
    this.scheduleRender();
  }

  private _handleCurrentAttachment(): __esri.WatchHandle {
    return watch(
      () => [
        this.selectedAttachmentViewerData?.selectedFeatureAttachments,
        this.selectedAttachmentViewerData?.attachmentIndex
      ],
      () => {
        const attachments = this.get(
          "selectedAttachmentViewerData.selectedFeatureAttachments.attachments"
        ) as __esri.Collection<__esri.AttachmentInfo>;
        const attachmentIndex = this.get("selectedAttachmentViewerData.attachmentIndex") as number;

        const attachment = attachments?.getItemAt(attachmentIndex) as __esri.AttachmentInfo;

        const attachmentUrl = attachment ? attachment.url : null;
        this.currentImageUrl = this._convertAttachmentUrl(attachmentUrl as string) as string;
        this._handlePanZoomForCurrentAttachment(attachment);
        this.scheduleRender();
      },
      { initial: true }
    );
  }

  private _handlePanZoomForCurrentAttachment(attachment: __esri.AttachmentInfo): void {
    if (this.imagePanZoomEnabled && this._imageViewer && document.body.clientWidth > 830) {
      this._imageViewer && this._imageViewer.destroy();
      this._imageViewer = null;
      this._imageViewerSet = false;
      this._imageZoomLoaded = false;
      if (this.zoomSliderNode) {
        this.zoomSliderNode.value = 100;
      }
    }

    if (this.imagePanZoomEnabled) {
      this._handleImagePanZoom(attachment);
    }
  }

  private _scrollFeatureContentPanelToTop(): __esri.WatchHandle {
    return watch(
      () => this.selectedAttachmentViewerData?.objectIdIndex,
      () => {
        if (this._featureContentPanel) {
          this._featureContentPanel.scrollTop = 0;
        }
      }
    );
  }

  private _setImageZoomLoadedToFalse(): __esri.WatchHandle {
    return watch(
      () => this.selectedAttachmentViewerData,
      () => {
        this._imageZoomLoaded = false;
        this.scheduleRender();
      }
    );
  }

  private _scheduleRenderOnLayerFeatureChange(): __esri.WatchHandle {
    return on(
      () => this.selectedAttachmentViewerData?.layerFeatures,
      "change",
      // () => this.scheduleRender()
      () => null
    );
  }

  private _handleSelectFeaturesWatchers(): __esri.WatchHandle {
    return when(
      () => this.selectFeaturesEnabled,
      () => {
        this._handleScheduleRenderOnSketchEvent();
      },
      { once: true }
    );
  }

  private _handleScheduleRenderOnSketchEvent(): void {
    this.sketchWidget?.on("create", () => this.scheduleRender());
    this.sketchWidget?.on("update", () => this.scheduleRender());
  }

  render(): VNode {
    const header = this._renderHeader();
    const homePage = this._renderHomePage();
    const filterList = this._renderInstantAppsFilter();
    const attrEditModal = this.attributeEditing ? this._renderAttributeEditModal() : null;
    return (
      <div
        bind={this}
        afterCreate={(node) => {
          this._resizeObserver.observe(node);
        }}
        class={CSS.base}
      >
        {!this._imageCarouselIsOpen ? header : null}
        <div class={this.classes(CSS.containerComponents)}>
          {filterList}
          {homePage}
          {attrEditModal}
        </div>
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
      </div>
    );
  }

  destroy(): void {
    this.viewModel.destroy();
    this.onboardingPanelIsOpen = null;
    this.photoCentricMobileMapExpanded = null;
    this._imageCarouselIsOpen = null;
    if (this.imagePanZoomEnabled && this._imageViewer) {
      this._imageViewer.destroy();
      this._imageViewer = null;
    }
  }

  private _renderHeader(): VNode {
    const {
      applySharedTheme,
      customTheme,
      viewModel,
      enableHeaderBackground,
      headerBackground,
      enableHeaderColor,
      headerColor,
      sharedTheme
    } = this;
    const title = this._getTitle();
    const theme = viewModel.getTheme("primary", "primary");
    const logo =
      this.customTheme?.applySharedTheme && this.sharedTheme?.logo
        ? this.sharedTheme.logo
        : this.customTheme?.logo
        ? this.customTheme.logo
        : "";
    const logoLink =
      ((applySharedTheme && !customTheme) || customTheme?.preset === "shared") && sharedTheme?.logoLink
        ? sharedTheme.logoLink
        : customTheme?.logoLink
        ? customTheme.logoLink
        : "";
    const socialShare = this._renderSocialShare();
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
        info-button={`${this.onboardingIsEnabled}`}
        info-is-open={`${document.body.clientWidth > 915 && this.onboardingIsEnabled && this.onboardingPanelIsOpen}`}
        logo-scale={customTheme?.logoScale ? customTheme.logoScale : "m"}
        font-family={fontFamily}
      >
        {socialShare}
      </instant-apps-header>
    );
  }

  private _renderInstantAppsFilter(): any {
    this.view?.when(async () => {
      const filterList = document.getElementById("filter-list");
      if (filterList) {
        filterList.view = this.view;
        filterList.layerExpressions = layerExpression;
      }
    });

    return (
      <div class={this.classes(CSS.filterPanel)}>
          <div class="filter-header" slot="filter-header-content">
            <calcite-icon scale="s" icon="filter"></calcite-icon>Filter List
          </div>
        </instant-apps-filter-list>
      </div>
    );
  }

  private _renderSocialShare(): any {
    const layerFeatures = this.get("selectedAttachmentViewerData.layerFeatures") as __esri.Collection<__esri.Graphic>;
    const { socialSharingEnabled } = this;
    const { clientWidth } = document.body;
    const theme = this.viewModel.getTheme("primary", "primary");
    return socialSharingEnabled && layerFeatures?.length && clientWidth > 915 ? (
      <instant-apps-social-share
        style={`--instant-apps-social-share-popover-button-icon-color: ${
          theme?.color ? theme.color : "var(--calcite-ui-text-1)"
        };${this.customTheme?.appFont ? ` font-family: ${this.customTheme?.appFont} !important;` : ""}`}
        bind={this}
        afterCreate={storeNode}
        afterUpdate={(node) => {
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

  private _renderHomePage(): VNode {
    const onboarding = this._renderOnboarding();
    const content = this._renderContent();
    const mediaViewerDesktop = this._renderMediaViewerDesktop();
    const darkBackground = {
      [CSS.darkBackground]: this.theme === "dark"
    };
    return (
      <div
        key={buildKey("main-page")}
        styles={
          this._header
            ? {
                height: `calc(100% - ${this._header?.offsetHeight}px)`
              }
            : {}
        }
        class={CSS.mainPageContainer}
        role="main"
      >
        <div class={this.classes(CSS.mainPage, darkBackground)}>
          {this.onboardingPanelIsOpen ? (
            <div bind={this} onclick={this._disableOnboardingPanel} class={CSS.onboardingOverlay}>
              {onboarding}
            </div>
          ) : null}
          {content}
        </div>
        {mediaViewerDesktop}
      </div>
    );
  }

  private _renderContent(): VNode {
    const mapView = this._renderMapView();
    const pagination = this._renderPagination();
    const expandCollapse = this._renderExpandCollapse();
    const noVisibleLayers = (this.layerSwitcher as LayerSwitcher as LayerSwitcher)?.featureLayerCollection?.every(
      (layer) => !layer.visible
    );
    const featureContentPanel = !noVisibleLayers ? this._renderFeatureContentPanel() : null;

    const { clientWidth } = document.body;

    const mobileView = clientWidth < 830;
    const desktopView = clientWidth > 813;

    const mobileCollapsed = !this.photoCentricMobileMapExpanded && mobileView;
    const desktopMinimized = this.hideAttributePanel && desktopView;

    const midBottomContainerCollapsed = {
      [CSS.midBottomContainerCollapsed]: mobileCollapsed
    };

    const mainPageBottomContainerCollapsed = {
      [CSS.mainPageBottomContainerCollapsed]: mobileCollapsed
    };
    const minimizedFeatureContentPanel = desktopMinimized ? this._renderMinimizedFeatureContentPanel() : null;

    const featureContentPanelMinimized = {
      [CSS.featureContentPanelMinimized]: desktopMinimized
    };
    const darkBackground = {
      [CSS.darkBackground]: this.theme === "dark"
    };
    return (
      <div key={buildKey("map-attachment-content")} class={CSS.mapAttachmentContent}>
        <div class={this.classes(CSS.mainPageTop)}>
          {pagination}
          <div key={buildKey("mapview-search")} class={CSS.mapViewAndSearch}>
            {mapView}
          </div>
          {minimizedFeatureContentPanel}
        </div>

        <div
          class={this.classes(
            CSS.midBottomContainer,
            midBottomContainerCollapsed,
            featureContentPanelMinimized,
            darkBackground
          )}
        >
          <div class={CSS.mainPageMid}>{expandCollapse}</div>
          <div
            key={buildKey("feature-content-panel")}
            class={this.classes(CSS.mainPageBottom, mainPageBottomContainerCollapsed)}
          >
            {featureContentPanel}
          </div>
        </div>
      </div>
    );
  }

  private _renderMinimizedFeatureContentPanel(): VNode {
    const zoomTo = this._renderZoomTo();
    const attrEditButton =
      this.attributeEditing && this.viewModel.verifyEditPermissions() ? this._renderAttributeEditButton() : null;
    const theme = this.viewModel.getTheme("secondary", "secondary");
    const buttonTheme = this.viewModel.getThemeButtonColor("primary", "primary");
    return (
      <div styles={theme} class={CSS.minimizedFeatureContentPanel}>
        <button
          bind={this}
          onclick={this._restoreFeatureContentPanel}
          class={CSS.restoreFeatureContentPanelButton}
          title={this.photoCentricMessages?.restore}
          styles={{ ...buttonTheme, border: "none" }}
        >
          <calcite-icon icon="expand" scale="s" />
        </button>
        <div class={CSS.trailingActionButtonContainer}>
          {attrEditButton}
          {zoomTo}
        </div>
      </div>
    );
  }

  private _renderMapView(): VNode {
    const { view, mapA11yDesc } = this;
    return (
      <div bind={view?.container} class={CSS.mapView} afterCreate={attachToNode}>
        {mapA11yDesc ? (
          <div
            id="mapDescription"
            class="sr-only"
            afterCreate={() => {
              (document.getElementById("mapDescription") as HTMLDivElement).innerHTML =
                this._sanitizer.sanitize(mapA11yDesc);
              const rootNode = document.getElementsByClassName("esri-view-surface");
              view?.container.setAttribute("aria-describedby", "mapDescription");
              for (let k = 0; k < rootNode.length; k++) {
                rootNode[k].setAttribute("aria-describedby", "mapDescription");
              }
            }}
          >
            {mapA11yDesc}
          </div>
        ) : null}
      </div>
    );
  }

  private _renderPagination(): VNode {
    const noVisibleLayers = (this.layerSwitcher as LayerSwitcher as LayerSwitcher)?.featureLayerCollection?.every(
      (layer) => !layer.visible
    );

    const { selectedAttachmentViewerData } = this;

    const featureTotal =
      selectedAttachmentViewerData && (selectedAttachmentViewerData.get("featureObjectIds.length") as number);

    const leftButtonLayerSwitcherContainer = this._renderLeftButtonLayerSwitcherContainer();

    const rightFeatureScrollButton = this._renderRightButtonLayerSwitcherContainer();

    const paginationNumbers = featureTotal ? this._renderPaginationNumbers(featureTotal) : null;

    const theme = this.viewModel.getTheme("secondary", "secondary");

    return (
      <div key={buildKey("feature-pagination")} styles={theme} class={CSS.paginationContainer}>
        {leftButtonLayerSwitcherContainer}
        {!noVisibleLayers ? paginationNumbers : null}
        {rightFeatureScrollButton}
      </div>
    );
  }

  private _renderLeftButtonLayerSwitcherContainer(): VNode {
    const previousFeatureButton = this._renderPreviousFeatureButton();
    const nextFeatureButton = this._renderNextFeatureButton();
    const noVisibleLayers = (this.layerSwitcher as LayerSwitcher)?.featureLayerCollection?.every(
      (layer) => !layer.visible
    );
    const featureLayerCollectionLen = this.get("layerSwitcher.featureLayerCollection.length") as number;
    const layerSwitcherButton =
      featureLayerCollectionLen > 1 && !noVisibleLayers ? this._renderLayerSwitcherButton() : null;

    const content =
      this.docDirection === "ltr"
        ? [previousFeatureButton, layerSwitcherButton]
        : [layerSwitcherButton, nextFeatureButton];

    return (
      <div key={buildKey("left-button-layer-switcher")} class={CSS.leftButtonLayerSwitcher}>
        {content}
      </div>
    );
  }

  private _renderRightButtonLayerSwitcherContainer(): VNode {
    const previousFeatureButton = this._renderPreviousFeatureButton();
    const nextFeatureButton = this._renderNextFeatureButton();
    const noVisibleLayers = (this.layerSwitcher as LayerSwitcher)?.featureLayerCollection?.every(
      (layer) => !layer.visible
    );
    const featureLayerCollectionLen = this.get("layerSwitcher.featureLayerCollection.length") as number;
    const layerSwitcherButton =
      featureLayerCollectionLen > 1 && !noVisibleLayers && this.docDirection === "rtl"
        ? this._renderLayerSwitcherButton()
        : null;

    const content =
      this.docDirection === "ltr"
        ? [nextFeatureButton, layerSwitcherButton]
        : [previousFeatureButton, layerSwitcherButton];

    return (
      <div key={buildKey("right-button-layer-switcher")} class={CSS.rightButtonLayerSwitcher}>
        {content}
      </div>
    );
  }

  private _renderPreviousFeatureButton(): VNode {
    const theme = this.viewModel.getThemeButtonColor("primary", "primary");
    return (
      <button
        bind={this}
        onclick={this._previousFeature}
        onkeydown={this._previousFeature}
        tabIndex={0}
        class={CSS.leftArrowContainer}
        title={this.photoCentricMessages?.previousLocation}
        styles={theme}
      >
        <calcite-icon scale="m" icon={this.docDirection === "ltr" ? "chevron-left" : "chevron-right"} />
      </button>
    );
  }

  private _renderNextFeatureButton(): VNode {
    const theme = this.viewModel.getThemeButtonColor("primary", "primary");
    return (
      <button
        bind={this}
        onclick={this._nextFeature}
        onkeydown={this._nextFeature}
        tabIndex={0}
        class={CSS.leftArrowContainer}
        title={this.photoCentricMessages?.nextLocation}
        styles={theme}
      >
        <calcite-icon scale="m" icon={this.docDirection === "rtl" ? "chevron-left" : "chevron-right"} />
      </button>
    );
  }

  private _renderPaginationNumbers(featureTotal: number): VNode {
    const { selectedAttachmentViewerData } = this;
    const currentlayerFeatureIndex = (selectedAttachmentViewerData?.objectIdIndex as number) + 1;
    const { clientWidth } = document.body;
    return (
      <div class={CSS.paginationTextContainer}>{`${
        clientWidth > 830 ? `${this.photoCentricMessages?.upperCaseLocations}: ` : ""
      }${currentlayerFeatureIndex} / ${featureTotal}`}</div>
    );
  }

  private _renderLayerSwitcherButton(): VNode {
    return (
      <div
        bind={(this.layerSwitcher as LayerSwitcher).container}
        class={CSS.layerSwitcherContainer}
        afterCreate={attachToNode}
      />
    );
  }

  private _renderExpandCollapse(): VNode {
    const darkBackground = {
      [CSS.darkBackground]: this.theme === "dark"
    };
    return (
      <div
        bind={this}
        onclick={this._toggleExpand}
        onkeydown={this._toggleExpand}
        tabIndex={0}
        class={this.classes(CSS.expandCollapseContainer, darkBackground)}
      >
        <calcite-icon scale="m" icon={this.photoCentricMobileMapExpanded ? "chevron-up" : "chevron-down"} />
      </div>
    );
  }

  private _renderOnboarding(): VNode {
    const onboardingWelcomeContent = this._renderOnboardingWelcomeContent();
    const onboardingStartButton = this._renderOnboardingStartButton();
    return (
      <div
        bind={this}
        onclick={(e: Event) => {
          e.stopPropagation();
        }}
        key={buildKey("onboarding-container")}
        class={CSS.onboardingContainer}
      >
        <focus-trap>
          <div class={CSS.onboardingContentContainer}>{onboardingWelcomeContent}</div>
          {onboardingStartButton}
        </focus-trap>
      </div>
    );
  }

  private _renderOnboardingWelcomeContent(): VNode {
    return <div key={buildKey("onboarding-welcome")}>{this.onboardingContent?.render()}</div>;
  }

  private _renderOnboardingStartButton(): VNode {
    const buttonText = this.onboardingButtonText ? this.onboardingButtonText : this.commonMessages?.form?.ok;
    const buttonTheme = this.viewModel.getThemeButtonColor("primary", "primary");
    const styles = `
    button {
      --calcite-ui-brand: ${buttonTheme?.backgroundColor ? buttonTheme.backgroundColor : "#0079c1"};
      --calcite-ui-brand-hover: ${buttonTheme?.backgroundColor ? buttonTheme.backgroundColor : "#0079c1"};
      --calcite-ui-brand-press: ${buttonTheme?.backgroundColor ? buttonTheme.backgroundColor : "#0079c1"};
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
          class={this.classes(CSS.onboardingStartButton)}
          afterCreate={(node) => {
            const styleSheet = document.createElement("style");
            styleSheet.id = "startButton";
            styleSheet.innerHTML = this._sanitizer.sanitize(styles);
            node.shadowRoot.appendChild(styleSheet);
            this._handleFocus(node);
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

  private _renderMediaContainer(): VNode {
    const attachments = this.get(
      "selectedAttachmentViewerData.selectedFeatureAttachments.attachments"
    ) as __esri.Collection<__esri.AttachmentInfo>;

    const attachment = this._getCurrentAttachment(attachments) as __esri.AttachmentInfo;

    const downloadEnabled = {
      [CSS.downloadEnabled]: !this.downloadEnabled
    };

    const contentTypeCheck = this._validateContentType(attachment);

    const mediaViewerContainer = this._renderMediaViewerContainer(attachment);

    const onboardingImage =
      this.onboardingPanelIsOpen && this.onboardingImage && this.onboardingIsEnabled
        ? this._renderOnboardingImage()
        : null;

    const noVisibleLayers = (this.layerSwitcher as LayerSwitcher)?.featureLayerCollection?.every(
      (layer) => !layer.visible
    );

    const zoomSlider =
      this.imagePanZoomEnabled &&
      document.body.clientWidth > 830 &&
      this.currentImageUrl &&
      contentTypeCheck &&
      this.imagePanZoomEnabled
        ? this.onboardingPanelIsOpen && this.onboardingImage && this.onboardingIsEnabled
          ? null
          : !noVisibleLayers
          ? this._renderZoomSlider()
          : null
        : null;

    const mediaViewerFooter = this._renderMediaViewerFooter();

    return (
      <div class={CSS.rightPanel}>
        <div key={buildKey("image-container")} class={this.classes(downloadEnabled, CSS.photoViewer)}>
          {mediaViewerContainer}
          {onboardingImage}
          {zoomSlider}
          {mediaViewerFooter}
        </div>
      </div>
    );
  }

  private _renderNoAttachmentsContainer(): VNode {
    return (
      <div key={buildKey("no-attachments-container")} class={CSS.noAttachmentsContainer}>
        <calcite-icon icon="no-image" scale="l" />

        <span class={CSS.noAttachmentsText}>{this.photoCentricMessages?.noPhotoAttachmentsFound}</span>
      </div>
    );
  }

  private _renderMediaViewerContainer(attachment: __esri.AttachmentInfo): VNode {
    const hasOnboardingImage = {
      [CSS.hasOnboardingImage]: this.onboardingPanelIsOpen && this.onboardingImage && this.onboardingIsEnabled
    };

    const { currentImageUrl } = this;

    const currentImage =
      !this.imagePanZoomEnabled ||
      (attachment && attachment.contentType && attachment.contentType.indexOf("gif") !== -1)
        ? this._renderCurrentImage()
        : null;

    const noVisibleLayers = (this.layerSwitcher as LayerSwitcher)?.featureLayerCollection?.every(
      (layer) => !layer.visible
    );

    const media =
      attachment && attachment.contentType
        ? attachment.contentType.indexOf("video") !== -1
          ? this._renderVideo(currentImageUrl as string)
          : attachment.contentType.indexOf("pdf") !== -1
          ? this._renderPDF(currentImageUrl as string)
          : currentImage
        : null;

    const supportsAttachment = this.get(
      "selectedAttachmentViewerData.layerData.featureLayer.capabilities.data.supportsAttachment"
    );
    const attachments = this.get(
      "selectedAttachmentViewerData.selectedFeatureAttachments.attachments"
    ) as __esri.Collection<__esri.AttachmentInfo>;

    const videoStyles = {
      [CSS.attachmentIsVideo]: attachment && attachment.contentType && attachment.contentType.indexOf("video") !== -1
    };
    return (
      <div
        bind={this}
        afterCreate={storeNode}
        data-node-ref="photoViewerContainer"
        class={this.classes(CSS.imageContainer, hasOnboardingImage, videoStyles)}
      >
        {this.viewModel.queryingState === "loading" ? (
          <calcite-loader key={buildKey("loadingApp")} label={`${this.commonMessages?.loading}`} />
        ) : supportsAttachment === false ? (
          <div class={CSS.layerNotSupported}>{this.photoCentricMessages?.notSupported}</div>
        ) : !this.selectedAttachmentViewerData || (attachments && attachments.length === 0) || noVisibleLayers ? (
          this._renderNoAttachmentsContainer()
        ) : (
          media
        )}
      </div>
    );
  }

  private _renderVideo(currentImageUrl: string): VNode {
    return (
      <video bind={this} key={buildKey(`video-${currentImageUrl}`)} class={CSS.videoContainer} controls>
        <source src={currentImageUrl} type="video/mp4" />
        <source src={currentImageUrl} type="video/quicktime" />
        <source src={currentImageUrl} type="video/ogg" />
        <source src={currentImageUrl} type="video/mov" />
        {this.photoCentricMessages?.doesNotSupportVideo}
      </video>
    );
  }

  private _renderPDF(currentImageUrl: string): VNode {
    return <iframe class={CSS.pdf} key={buildKey(`pdf-${currentImageUrl}`)} src={currentImageUrl} frameborder="0" />;
  }

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
        src={
          this.currentImageUrl
            ? this.currentImageUrl.indexOf("?") === -1
              ? `${this.currentImageUrl}?w=800`
              : `${this.currentImageUrl}&w=800`
            : ""
        }
        afterCreate={storeNode}
        data-node-ref="_imageAttachment"
        data-attachment={attachment}
        alt={name}
      />
    );
  }

  private _renderOnboardingImage(): VNode {
    return (
      <div class={CSS.imageContainer}>
        <img src={this.onboardingImage} />
      </div>
    );
  }

  private _renderZoomSlider(): VNode {
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

  private _renderMediaViewerFooter(): VNode {
    const attachments = this.get(
      "selectedAttachmentViewerData.selectedFeatureAttachments.attachments"
    ) as __esri.Collection<__esri.AttachmentInfo>;

    const attachment = this._getCurrentAttachment(attachments);

    const attachmentScrollContent =
      attachments && attachments.length > 0 ? this._renderAttachmentScrollContent(attachments) : null;
    const contentType = attachment && (attachment.get("contentType") as string);

    const downloadButton =
      contentType &&
      contentType.indexOf("video") === -1 &&
      contentType.indexOf("gif") === -1 &&
      contentType.indexOf("pdf") === -1 &&
      this.downloadEnabled
        ? this._renderDownloadButton(attachment)
        : null;

    return (
      <div key={buildKey("attachment-count")} class={CSS.attachmentNumber}>
        {attachmentScrollContent}
        {downloadButton}
      </div>
    );
  }

  private _renderMediaViewerDesktop(): VNode {
    const mediaContainer = this._renderMediaContainer();
    return <div class={CSS.imageViewerDesktop}>{mediaContainer}</div>;
  }

  private _renderDownloadButton(attachment: __esri.AttachmentInfo): VNode {
    return (
      <button
        class={this.classes(CSS.downloadIconContainer, CSS.downloadButtonDesktop)}
        bind={this}
        onclick={this._downloadImage}
        onkeydown={this._downloadImage}
        data-image-url={this.currentImageUrl}
        data-image-name={attachment.name}
        title={this.photoCentricMessages?.download}
      >
        <span class={CSS.downloadIcon}>
          <calcite-icon icon="download" scale="m" />
        </span>
      </button>
    );
  }

  private _renderAttachmentScrollContent(attachments: __esri.Collection<__esri.AttachmentInfo>): VNode {
    const attachment = this._getCurrentAttachment(attachments) as __esri.AttachmentInfo;
    const attachmentScroll = this._renderAttachmentScroll(attachments);
    const imageDirection = this._renderImageDirection(attachment);
    return (
      <div key={buildKey("download-attachment")} class={CSS.downloadIconTextContainer}>
        {attachmentScroll}
        {imageDirection}
      </div>
    );
  }

  private _renderAttachmentScroll(attachments: __esri.Collection<__esri.AttachmentInfo>): VNode {
    const { selectedAttachmentViewerData } = this;
    const currentIndex = selectedAttachmentViewerData && selectedAttachmentViewerData.attachmentIndex + 1;
    const totalNumberOfAttachments = this.viewModel.getTotalNumberOfAttachments();

    return (
      <div class={CSS.attachmentScroll}>
        <button
          bind={this}
          onclick={this._previousImage}
          onkeydown={this._previousImage}
          disabled={this.onboardingPanelIsOpen || (attachments && attachments.length < 2) ? true : false}
          tabIndex={0}
          class={CSS.leftArrowContainer}
          title={this.photoCentricMessages?.previousImage}
        >
          <calcite-icon icon={this.docDirection === "rtl" ? "chevron-right" : "chevron-left"} scale="m" />
        </button>
        <span class={CSS.attachmentNumberText}>
          {`${this.photoCentricMessages?.upperCaseAttachments}: ${currentIndex} / ${totalNumberOfAttachments}`}
        </span>
        <button
          bind={this}
          onclick={this._nextImage}
          onkeydown={this._nextImage}
          disabled={this.onboardingPanelIsOpen || (attachments && attachments.length < 2) ? true : false}
          tabIndex={0}
          class={CSS.rightArrowContainer}
          title={this.photoCentricMessages?.nextImage}
        >
          <calcite-icon icon={this.docDirection === "rtl" ? "chevron-left" : "chevron-right"} scale="m" />
        </button>
      </div>
    );
  }

  private _renderImageDirection(attachment: __esri.AttachmentInfo): any {
    const imageDirectionValue = this.imageDirectionEnabled ? this.viewModel.getGPSInformation(attachment) : null;

    return imageDirectionValue ? (
      <div
        key={buildKey(
          `gps-image-direction-${attachment.name}-${attachment.size}-${attachment.url}-${imageDirectionValue}`
        )}
        class={CSS.gpsImageDirection}
      >
        {this.docDirection === "ltr" ? (
          <div class={CSS.imageDirectionDegrees}>
            <div>{this.photoCentricMessages?.gpsImageDirection}: </div>
            <div>{`${imageDirectionValue}`}&deg;</div>
          </div>
        ) : (
          <div class={CSS.imageDirectionDegrees}>
            <div>{this.photoCentricMessages?.gpsImageDirection}: </div>
            <div>{`${imageDirectionValue}`}&deg;</div>
          </div>
        )}

        <div
          title={`${this.photoCentricMessages?.gpsImageDirection}: ${imageDirectionValue}\u00B0`}
          class={CSS.imageDirection}
        >
          <svg styles={{ transform: `rotateZ(${imageDirectionValue}deg)` }} class={CSS.photoCentricCamera}>
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

  private _renderFeatureContentPanel(): VNode {
    const attachments = this.get(
      "selectedAttachmentViewerData.selectedFeatureAttachments.attachments"
    ) as __esri.Collection<__esri.AttachmentInfo>;
    const { clientWidth } = document.body;
    const attachmentsMobile = attachments && clientWidth < 830 ? this._renderAttachmentsMobile(attachments) : null;

    const titleContainer = this._renderTitleContainer();
    const selectedFeatureAddress = this.get("selectedAttachmentViewerData.selectedFeatureAddress");

    const featureInformation = this._renderFeatureInformation();
    const minimizeZoomToContainer = document.body.clientWidth > 813 ? this._renderMinimizeZoomToContainer() : null;
    const relatedFeatures = {
      [CSS.relatedFeatures]: (this.viewModel.relatedFeatures?.relatedFeatures?.length as number) > 0
    };
    return (
      <div
        bind={this}
        afterCreate={storeNode}
        data-node-ref="_featureContentPanel"
        class={this.classes(CSS.featureContent, relatedFeatures)}
      >
        {minimizeZoomToContainer}
        <div class={CSS.featureContentPanelContent}>
          {titleContainer}
          {this.addressEnabled ? <h3 class={CSS.addressText}>{selectedFeatureAddress}</h3> : null}
          <div class={CSS.attachmentsImageContainer}>{attachmentsMobile}</div>
          {featureInformation}
        </div>
        {this.viewModel.relatedFeatures?.render()}
      </div>
    );
  }

  private _renderMinimizeZoomToContainer(): VNode {
    const layerFeaturesLength = this.get("selectedAttachmentViewerData.layerFeatures.length");
    const zoomTo = layerFeaturesLength ? this._renderZoomTo() : null;
    const attrEditButton =
      this.attributeEditing && this.viewModel.verifyEditPermissions() ? this._renderAttributeEditButton() : null;
    const theme = this.viewModel.getTheme("secondary", "secondary");
    const buttonTheme = this.viewModel.getThemeButtonColor("secondary", "secondary");
    return (
      <div key={buildKey("minimize-zoom-to")} class={CSS.minimizeZoomToContainer} styles={theme}>
        <button
          bind={this}
          onclick={this._minimizeFeatureContentPanel}
          class={CSS.minimizeButton}
          title={this.photoCentricMessages?.minimize}
          styles={{ ...buttonTheme, border: "none" }}
        >
          <calcite-icon scale="s" icon="minus" />
        </button>
        <div class={CSS.attrEditZoomContainer}>
          {attrEditButton}
          {zoomTo}
        </div>
      </div>
    );
  }

  private _renderAttributeEditButton(): VNode {
    const buttonTheme = this.viewModel.getThemeButtonColor("primary", "primary");
    return (
      <button
        key="attr-edit-button"
        bind={this}
        class={CSS.attrEdit}
        tabIndex={0}
        onclick={this._openAttrEditPanel}
        onkeydown={this._openAttrEditPanel}
        title={this.photoCentricMessages?.openAttrEditPanel}
        label={this.photoCentricMessages?.openAttrEditPanel}
        styles={buttonTheme}
      >
        <calcite-icon scale="s" icon="pencil" />
      </button>
    );
  }

  private _renderFeatureInformation(): VNode {
    const featureWidgetContent = this.get("viewModel.featureWidget.viewModel.content") as __esri.Content[];
    const fieldsInfoContent =
      (featureWidgetContent &&
        featureWidgetContent.filter((contentItem) => {
          const fieldInfos = contentItem.get("fieldInfos") as __esri.FieldInfo[];
          return contentItem.type === "fields" && fieldInfos && fieldInfos.length > 0;
        })) ||
      [];
    const fieldsInfoText =
      (featureWidgetContent &&
        featureWidgetContent.filter((contentItem) => {
          return contentItem.type === "text";
        })) ||
      [];

    const mediaInfoContent =
      (featureWidgetContent &&
        featureWidgetContent &&
        featureWidgetContent.filter((contentItem) => {
          const mediaInfos = contentItem.get("mediaInfos") as __esri.MediaInfo[];
          return contentItem.type === "media" && mediaInfos && mediaInfos.length > 0;
        })) ||
      [];

    if (this._featureContentAvailable === null) {
      if ((fieldsInfoContent && fieldsInfoContent.length > 0) || (fieldsInfoText && fieldsInfoText.length > 0)) {
        this._featureContentAvailable = true;
      }
    }

    const featureTotal =
      this.selectedAttachmentViewerData && (this.selectedAttachmentViewerData.get("featureObjectIds.length") as number);

    const unsupportedAttachmentTypesData = this.get("selectedAttachmentViewerData.unsupportedAttachmentTypes") as any[];
    const unsupportedAttachmentTypes =
      unsupportedAttachmentTypesData && unsupportedAttachmentTypesData.length > 0
        ? this._renderUnsupportedAttachmentTypes()
        : null;

    const layerId = this.get("selectedAttachmentViewerData.layerData.featureLayer.id");
    const objectIdField = this.get("selectedAttachmentViewerData.layerData.featureLayer.objectIdField") as string;
    const attributes = this.get("selectedAttachmentViewerData.selectedFeature.attributes");
    const objectId = attributes && attributes[objectIdField];

    return (
      <div class={CSS.featureContentContainer}>
        {(fieldsInfoText && fieldsInfoText.length > 0) ||
        (mediaInfoContent && mediaInfoContent.length > 0) ||
        this._featureContentAvailable ? (
          <div>
            {this._featureContentAvailable ? (
              <div key={buildKey(`feature-info-${layerId}-${objectId}`)} class={CSS.featureInfoContainer}>
                {this._renderFeatureInfoContent()}
              </div>
            ) : null}
            {(mediaInfoContent && mediaInfoContent.length > 0) || (fieldsInfoText && fieldsInfoText.length > 0) ? (
              <div key={buildKey(`feature-widget-${layerId}-${objectId}`)} class={CSS.featureInfoContainer}>
                {this._renderFeatureWidgetContent()}
              </div>
            ) : null}
          </div>
        ) : this._featureContentAvailable && featureTotal ? (
          <div key={buildKey(`feature-loader-${layerId}-${objectId}`)} class={CSS.featureInfoLoader}>
            {this._renderFeatureContentLoader()}
          </div>
        ) : (
          <div key={buildKey(`no-feature-info-${layerId}-${objectId}`)} class={CSS.noFeatureContentContainer}>
            {this._renderNoFeatureContentInfo()}
          </div>
        )}
        {unsupportedAttachmentTypes}
      </div>
    );
  }

  private _renderUnsupportedAttachmentTypes(): VNode {
    const otherAttachmentTypes = this._renderOtherAttachmentTypes();
    return (
      <div key={buildKey("other-attachment-types")}>
        <h4 class={CSS.attributeHeading}>{this.photoCentricMessages?.otherAttachments}</h4>
        {otherAttachmentTypes}
      </div>
    );
  }

  private _renderFeatureWidgetContent(): VNode {
    const featureWidget = this.get("viewModel.featureWidget") as __esri.Feature;
    const featureWidgetNode = featureWidget ? featureWidget.render() : null;
    return (
      <div key={buildKey("feture-widget-content")} class={CSS.featureInfoContent}>
        {featureWidgetNode}
      </div>
    );
  }

  private _renderFeatureInfoContent(): VNode {
    const selectedFeatureInfo = this.get("selectedAttachmentViewerData.selectedFeatureInfo");
    const featureContentInfo = selectedFeatureInfo ? this._renderFeatureContentInfos() : null;
    return (
      <div key={buildKey("feature-info-content")} class={CSS.featureInfoContent}>
        {featureContentInfo}
      </div>
    );
  }

  private _renderNoFeatureContentInfo(): VNode {
    return (
      <div key={buildKey("no-content")} class={CSS.noInfo}>
        {this.photoCentricMessages?.noInfo}
      </div>
    );
  }

  private _renderFeatureContentLoader(): VNode {
    return (
      <div key={buildKey("feature-content-loader")} class={CSS.widgetLoader}>
        {this.photoCentricMessages?.loadingImages}
      </div>
    );
  }

  private _renderTitleContainer(): VNode {
    const featureWidgetTitle = this.get("featureWidget.title");
    const title = featureWidgetTitle && featureWidgetTitle !== "null" ? featureWidgetTitle : "";
    return (
      <div class={CSS.featureTitleContainer}>
        <div class={CSS.featureContentTitle}>
          <h2 class={CSS.featureLayerTitle}>{title}</h2>
          {document.body.clientWidth < 813 ? (
            <div key="attr-edit-zoom-mobile" class={CSS.attrEditZoomContainer}>
              {this.attributeEditing ? this._renderAttributeEditButton() : null}
              {this._renderZoomTo()}
            </div>
          ) : null}
        </div>
      </div>
    );
  }

  private _renderFeatureContentInfos(): VNode {
    const featureContentInfos = this.selectedAttachmentViewerData?.selectedFeatureInfo.map((contentInfo) => {
      return this._renderFeatureContentInfo(contentInfo);
    });
    return <div>{featureContentInfos}</div>;
  }

  private _renderFeatureContentInfo(contentInfo): VNode {
    const isHyperLink = this._testHyperLink(contentInfo);
    const contentCheck =
      contentInfo &&
      contentInfo.content &&
      ((typeof contentInfo.content === "string" && contentInfo.content.trim() !== "") || contentInfo.content !== null);

    return (
      <div key={buildKey(`${contentInfo.attribute}-${contentInfo.content}`)} class={CSS.featureContentInfo}>
        <h4 class={CSS.attributeHeading} innerHTML={this._sanitizer.sanitize(contentInfo.attribute)} />
        {contentInfo && contentInfo.content && contentCheck ? (
          isHyperLink ? (
            <p class={CSS.attributeContent}>
              <div innerHTML={this._sanitizer.sanitize(contentInfo.content.replace(contentInfo.content, ""))} />
              <span innerHTML={this._sanitizer.sanitize(autoLink(contentInfo.content, this.commonMessages))} />
            </p>
          ) : (
            <p class={CSS.attributeContent} innerHTML={this._sanitizer.sanitize(contentInfo.content)} />
          )
        ) : (
          <p>{this.photoCentricMessages?.noContentAvailable}</p>
        )}
      </div>
    );
  }

  private _renderOtherAttachmentTypes(): VNode {
    const otherAttachmentTypes = this.selectedAttachmentViewerData?.unsupportedAttachmentTypes.map(
      (attachment: __esri.AttachmentInfo) => {
        return this._renderOtherAttachmentType(attachment);
      }
    );
    return <ul class={CSS.otherAttachmentsList}>{otherAttachmentTypes}</ul>;
  }

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

  private _renderZoomTo(): VNode {
    const buttonTheme = this.viewModel.getThemeButtonColor("primary", "primary");
    return (
      <button
        bind={this}
        class={CSS.zoomTo}
        tabIndex={0}
        onclick={this._zoomTo}
        onkeydown={this._zoomTo}
        title={this.photoCentricMessages?.zoomTo}
        label={this.photoCentricMessages?.zoomTo}
        styles={buttonTheme}
      >
        <calcite-icon icon="magnifying-glass-plus" scale="s" />
      </button>
    );
  }

  private _renderAttachmentsMobile(selectedFeatureAttachments: __esri.Collection<__esri.AttachmentInfo>): any {
    if (!selectedFeatureAttachments) {
      return;
    }
    const featureContentInfos = selectedFeatureAttachments.toArray().map((attachment: __esri.AttachmentInfo) => {
      return this._renderAttachmentMobile(attachment);
    });
    const attachmentCount =
      selectedFeatureAttachments && selectedFeatureAttachments.length > 0 ? selectedFeatureAttachments.length : null;

    const darkText = {
      [CSS.darkText]: this.theme === "dark"
    };

    return (
      <div class={CSS.mobileFeatureContent}>
        {attachmentCount ? (
          <div class={CSS.mobileAttachmentCount}>
            <span class={this.classes(CSS.mobileAttachmentText, darkText)}>
              {this.photoCentricMessages?.upperCaseAttachments}
            </span>
            <div class={CSS.attachmentCountNumber}>{selectedFeatureAttachments.length}</div>
          </div>
        ) : null}
        {featureContentInfos}
      </div>
    );
  }

  private _renderAttachmentMobile(attachment: __esri.AttachmentInfo): VNode {
    const { url } = attachment;
    const attachmentUrl = this._convertAttachmentUrl(url) as string;

    const contentType = attachment && (attachment.get("contentType") as string);

    const mobileAttachment = this._renderMobileAttachment(attachment);
    const imageDirectionValue = this.imageDirectionEnabled ? this.viewModel.getGPSInformation(attachment) : null;
    const mobileImageDirection =
      this.imageDirectionEnabled && imageDirectionValue
        ? this._renderMobileImageDirection(attachmentUrl, imageDirectionValue)
        : null;

    const mobileDownloadButton =
      contentType &&
      contentType.indexOf("video") === -1 &&
      contentType.indexOf("gif") === -1 &&
      contentType.indexOf("pdf") === -1 &&
      this.downloadEnabled
        ? this._renderMobileDownloadButton(attachmentUrl)
        : null;
    return (
      <div
        bind={this}
        afterCreate={storeNode}
        afterUpdate={storeNode}
        data-node-ref="_mobileAttachment"
        class={CSS.mobileAttachment}
      >
        {mobileAttachment}
        {mobileImageDirection}
        {mobileDownloadButton}
      </div>
    );
  }

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
        <calcite-icon icon="download" scale="m" />
      </button>
    );
  }

  private _renderMobileImageDirection(attachmentUrl: string, imageDirectionValue: number): VNode {
    return (
      <div key={buildKey(`mobile-image-direction-${attachmentUrl}`)} class={CSS.imageDirectionMobile}>
        <svg styles={{ transform: `rotateZ(${imageDirectionValue}deg)` }} class={CSS.photoCentricCamera}>
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

  private _renderMobileAttachment(attachment: __esri.AttachmentInfo): VNode {
    const { url, name } = attachment;

    const attachmentUrl = this._convertAttachmentUrl(url);

    return (
      <div class={CSS.mobileAttachmentContainer}>
        {attachment && attachment.contentType && attachment.contentType.indexOf("video") !== -1 ? (
          <video key={buildKey(`mobile-video-${attachmentUrl}`)} class={CSS.videoContainer} controls>
            <source src={attachmentUrl} type="video/mp4" />
            <source src={attachmentUrl} type="video/ogg" />
            <source src={attachmentUrl} type="video/mov" />
            {this.photoCentricMessages?.doesNotSupportVideo}
          </video>
        ) : attachment && attachment.contentType && attachment.contentType.indexOf("pdf") !== -1 ? (
          <embed
            key={buildKey(`mobile-pdf-${attachmentUrl}`)}
            class={CSS.pdf}
            src={this.currentImageUrl}
            type="application/pdf"
          />
        ) : attachment && attachment.contentType && attachment.contentType.indexOf("image") !== -1 ? (
          <img
            key={buildKey(`mobile-image-${attachmentUrl}`)}
            class={this.classes(
              CSS.imageMobile
              // , removeOpacity
            )}
            src={
              attachmentUrl
                ? attachmentUrl?.indexOf("?") === -1
                  ? `${attachmentUrl}?w=200`
                  : `${attachmentUrl}&w=200`
                : ""
            }
            alt={name}
          />
        ) : null}
      </div>
    );
  }

  private _renderAttributeEditModal(): VNode {
    const featureWidgetTitle = this.get("viewModel.featureWidget.title");

    return (
      <calcite-modal
        key="esri-av--map-centric-attr-edit"
        class={this.theme === "dark" ? "calcite-mode-dark" : "calcite-mode-light"}
        bind={this}
        data-node-ref="attrEditModal"
        afterCreate={storeNode}
        width="s"
        no-padding="true"
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

  @accessibleHandler()
  private _disableOnboardingPanel(): void {
    this.onboardingPanelIsOpen = false;
    focusNode(this._onboardingButton as HTMLCalciteButtonElement);
    this.scheduleRender();
  }

  @accessibleHandler()
  private _toggleExpand(): void {
    this.photoCentricMobileMapExpanded = !this.photoCentricMobileMapExpanded;
    this.scheduleRender();
  }

  private _toggleOnboardingPanel(): void {
    if (this.onboardingPanelIsOpen) {
      this.onboardingPanelIsOpen = false;
    } else {
      this.onboardingPanelIsOpen = true;
    }
    this.scheduleRender();
  }

  @accessibleHandler()
  private _nextImage(): void {
    this.viewModel.nextImage();
    if (!this.imagePanZoomEnabled) {
      if (this._imageAttachment) {
        this._imageAttachment.style.opacity = "0";
      }
    }

    this.scheduleRender();
  }

  @accessibleHandler()
  private _previousImage(): void {
    this.viewModel.previousImage();
    if (!this.imagePanZoomEnabled) {
      if (this._imageAttachment) {
        this._imageAttachment.style.opacity = "0";
      }
    }
    this.scheduleRender();
  }

  @accessibleHandler()
  private _previousFeature(): void {
    const noVisibleLayers = (this.layerSwitcher as LayerSwitcher)?.featureLayerCollection?.every(
      (layer) => !layer.visible
    );
    if (noVisibleLayers) {
      return;
    }
    const { queryingState } = this.viewModel;
    if (queryingState !== "ready") {
      return;
    }
    const preventLocationSwitch = this._preventLocationSwitch();
    if (preventLocationSwitch) {
      return;
    }
    this.viewModel.previousFeature();
    this.set("currentImageUrl", null);
    if (this._imageAttachment) {
      this._imageAttachment.src = "";
    }
    this.scheduleRender();
  }

  @accessibleHandler()
  private _nextFeature(): void {
    const noVisibleLayers = (this.layerSwitcher as LayerSwitcher)?.featureLayerCollection?.every(
      (layer) => !layer.visible
    );
    if (noVisibleLayers) {
      return;
    }
    const { queryingState } = this.viewModel;
    if (queryingState !== "ready") {
      return;
    }
    const preventLocationSwitch = this._preventLocationSwitch();
    if (preventLocationSwitch) {
      return;
    }
    this.viewModel.nextFeature();
    this.set("currentImageUrl", null);

    if (this._imageAttachment) {
      this._imageAttachment.src = "";
    }
    this.scheduleRender();
  }

  private _preventLocationSwitch(): boolean {
    const { selectedAttachmentViewerData } = this;

    const featureTotal = selectedAttachmentViewerData?.get("featureObjectIds.length") as number;
    return (
      this.onboardingPanelIsOpen ||
      featureTotal === 1 ||
      selectedAttachmentViewerData?.layerFeatures?.length === 0 ||
      !selectedAttachmentViewerData
    );
  }

  @accessibleHandler()
  private _downloadImage(event: Event): void {
    this.viewModel.downloadImage(event);
  }

  @accessibleHandler()
  private _zoomTo(): void {
    this.viewModel.zoomTo();
  }

  private _testHyperLink(contentInfo): boolean | null {
    const content = contentInfo?.content;
    const regex = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;
    return content ? regex.test(content) : null;
  }

  private _convertAttachmentUrl(attachmentUrl: string): string | undefined {
    if (!this.selectedAttachmentViewerData) {
      return;
    }
    const featureLayer = this.selectedAttachmentViewerData.get("layerData.featureLayer") as __esri.FeatureLayer;
    const parentPortalUrl = featureLayer?.get("parent.portalItem.portal.url") as string;

    const portalUrl = featureLayer?.get("portalItem.portal.url") as string;
    const portalIsHTTPS = portalUrl?.indexOf("https") !== -1 || parentPortalUrl?.indexOf("https") !== -1;

    if (portalIsHTTPS && attachmentUrl?.indexOf("https") === -1) {
      return attachmentUrl.replace(/^http:\/\//i, "https://");
    }
    return attachmentUrl;
  }

  private _handleImagePanZoom(attachment: __esri.AttachmentInfo): void {
    if (!attachment) {
      return;
    }

    if (this.onboardingIsEnabled && this.onboardingImage) {
      when(
        () => !this.onboardingPanelIsOpen,
        () => this._activateImageViewer(attachment),
        { initial: true, once: true }
      );
    } else {
      this._activateImageViewer(attachment);
    }
  }

  private async _activateImageViewer(attachment: __esri.AttachmentInfo): Promise<void> {
    const contentTypeCheck = this._validateContentType(attachment);
    if (this.currentImageUrl && contentTypeCheck) {
      if (this.photoViewerContainer && !this._imageViewerSet) {
        this._imageViewer = new ImageViewer(this.photoViewerContainer, {
          zoomValue: 100,
          snapView: false,
          zoomOnMouseWheel: false,
          maxZoom: 500
        });
        this._imageViewerSet = true;
        this.scheduleRender();
      }

      const url = this.currentImageUrl
        ? this.currentImageUrl.indexOf("?") === -1
          ? `${this.currentImageUrl}?w=800`
          : `${this.currentImageUrl}&w=800`
        : "";
      if (this._imageViewerSet && !this._imageZoomLoaded && url) {
        await this._imageViewer?.load(url, this.currentImageUrl);
        this._imageZoomLoaded = true;
        this.scheduleRender();
      }
    }
  }

  private _getCurrentAttachment(attachments: __esri.Collection<__esri.AttachmentInfo>): __esri.AttachmentInfo | null {
    const attachmentIndex = this.get("selectedAttachmentViewerData.attachmentIndex") as number;
    return attachments?.length > 0 ? attachments.getItemAt(attachmentIndex) : null;
  }

  private _validateContentType(attachment: __esri.AttachmentInfo): boolean {
    const contentType = attachment?.get("contentType") as string;
    const supportedTypes = ["image/gif", "video/mp4", "video/mov", "video/quicktime", "application/pdf"];
    return supportedTypes.indexOf(contentType) === -1;
  }

  private _restoreFeatureContentPanel(): void {
    this.hideAttributePanel = false;
    this.scheduleRender();
  }

  private _minimizeFeatureContentPanel(): void {
    this.hideAttributePanel = true;
    this.scheduleRender();
  }

  private _getTitle(): string | null {
    return document.body.clientWidth < 830 && (this.title as string)?.length > 40
      ? `${(this.title as string)?.split("").slice(0, 35).join("")}...`
      : this.title;
  }

  private _handleFocus(node: HTMLElement): void {
    if (document.activeElement !== node) {
      const focusInterval = setInterval(() => {
        node.focus();
        if (document.activeElement === node) {
          clearInterval(focusInterval);
        }
      }, 50);
    }
  }

  @accessibleHandler()
  private _openAttrEditPanel(): void {
    if (!this.viewModel?.featureWidget?.graphic) {
      return;
    }
    (this.viewModel.featureFormWidget as __esri.FeatureForm).feature = this.viewModel.featureWidget.graphic;
    const attrEditModal = this.attrEditModal as HTMLCalciteModalElement;
    attrEditModal.open = true;
    this.scheduleRender();
  }

  @accessibleHandler()
  private _closeAttrEditPanel(): void {
    const attrEditModal = this.attrEditModal as HTMLCalciteModalElement;
    attrEditModal.open = false;
    (this.viewModel.featureFormWidget as __esri.FeatureForm).feature = (
      this.viewModel.featureWidget as __esri.Feature
    ).graphic;
    this.scheduleRender();
  }

  private _saveAttributeEdits(): void {
    (this.viewModel.featureFormWidget as __esri.FeatureForm).submit();
  }
}

export default PhotoCentric;
