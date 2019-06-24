/// <amd-dependency path="esri/core/tsSupport/declareExtendsHelper" name="__extends" />
/// <amd-dependency path="esri/core/tsSupport/decorateHelper" name="__decorate" />

// esri.core.accessorSupport
import {
  subclass,
  declared,
  property,
  aliasOf
} from "esri/core/accessorSupport/decorators";

// esri.widgets
import Widget = require("esri/widgets/Widget");

//esri.widgets.support
import { renderable, tsx } from "esri/widgets/support/widget";

import PhotoCentric = require("./PhotoCentric/PhotoCentric");

import watchUtils = require("esri/core/watchUtils");

import AttachmentViewerViewModel = require("./AttachmentViewer/AttachmentViewerViewModel");

import { SelectedLayer } from "../interfaces/interfaces";

//----------------------------------
//
//  CSS Classes
//
//----------------------------------

const CSS = {
  base: "esri-feature-browser"
};

type LayoutMode = "photo-centric";

@subclass("AttachmentViewer")
class AttachmentViewer extends declared(Widget) {
  constructor(value?: any) {
    super();
  }

  private _apptoRun: PhotoCentric;

  @aliasOf("viewModel.view")
  @property()
  view: __esri.MapView = null;

  @aliasOf("viewModel.searchWidget")
  @property()
  searchWidget: __esri.Search = null;

  @aliasOf("viewModel.layerFeatureIndex")
  @property()
  layerFeatureIndex: number = null;

  @aliasOf("viewModel.defaultObjectId")
  @property()
  defaultObjectId: number = null;

  @aliasOf("viewModel.attachmentIndex")
  @property()
  attachmentIndex: number = null;

  @property()
  appMode: LayoutMode = null;

  @aliasOf("viewModel.title")
  @property()
  title: string = null;

  @aliasOf("viewModel.attachmentLayer")
  @property()
  attachmentLayer: SelectedLayer = null;

  @aliasOf("viewModel.order")
  @property()
  order: string = null;

  @property()
  onboardingContent: string = null;

  @aliasOf("viewModel.downloadEnabled")
  @property()
  downloadEnabled: string = null;

  @aliasOf("viewModel.socialSharingEnabled")
  @property()
  socialSharingEnabled: boolean = null;

  @aliasOf("viewModel.zoomLevel")
  @property()
  zoomLevel: string = null;

  @aliasOf("viewModel.addressEnabled")
  @property()
  addressEnabled: boolean = null;

  @property()
  onboardingImage: boolean = null;

  @property()
  onboardingButtonText: boolean = null;

  @property()
  docDirection: string = null;

  @renderable(["viewModel.state"])
  @property({
    type: AttachmentViewerViewModel
  })
  viewModel: AttachmentViewerViewModel = new AttachmentViewerViewModel();

  postInitialize() {
    this.own([
      watchUtils.when(this, "view", () => {
        this._apptoRun = this.startApp();
        watchUtils.when(this, "socialSharingEnabled", () => {
          this._apptoRun.socialSharingEnabled = this.socialSharingEnabled;
        });
      })
    ]);
  }

  //----------------------------------
  //
  //  Lifecycle
  //
  //----------------------------------

  render() {
    return <div class={CSS.base}>{this._apptoRun.render()}</div>;
  }

  startApp() {
    const app = new PhotoCentric({
      view: this.view,
      title: this.title,
      viewModel: this.viewModel,
      layerFeatureIndex: this.layerFeatureIndex,
      attachmentIndex: this.attachmentIndex,
      attachmentLayer: this.attachmentLayer,
      order: this.order,
      downloadEnabled: this.downloadEnabled,
      socialSharingEnabled: this.socialSharingEnabled,
      onboardingContent: this.onboardingContent,
      zoomLevel: this.zoomLevel,
      docDirection: this.docDirection,
      addressEnabled: this.addressEnabled,
      onboardingImage: this.onboardingImage,
      onboardingButtonText: this.onboardingButtonText
    });

    return app;
  }
}

export = AttachmentViewer;
