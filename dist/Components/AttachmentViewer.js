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

/// <amd-dependency path="esri/core/tsSupport/declareExtendsHelper" name="__extends" />
/// <amd-dependency path="esri/core/tsSupport/decorateHelper" name="__decorate" />
var __extends = (this && this.__extends) || (function () {
  var extendStatics = Object.setPrototypeOf ||
    ({
        __proto__: []
      }
      instanceof Array && function (d, b) {
        d.__proto__ = b;
      }) ||
    function (d, b) {
      for (var p in b)
        if (b.hasOwnProperty(p)) d[p] = b[p];
    };
  return function (d, b) {
    extendStatics(d, b);

    function __() {
      this.constructor = d;
    }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
  };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
  var c = arguments.length,
    r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
    d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
  else
    for (var i = decorators.length - 1; i >= 0; i--)
      if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
};
define(["require", "exports", "esri/core/tsSupport/declareExtendsHelper", "esri/core/tsSupport/decorateHelper", "esri/core/accessorSupport/decorators", "esri/widgets/Widget", "esri/widgets/support/widget", "./PhotoCentric/PhotoCentric", "esri/core/watchUtils", "./AttachmentViewer/AttachmentViewerViewModel"], function (require, exports, __extends, __decorate, decorators_1, Widget, widget_1, PhotoCentric, watchUtils, AttachmentViewerViewModel) {
  "use strict";
  //----------------------------------
  //
  //  CSS Classes
  //
  //----------------------------------
  var CSS = {
    base: "esri-feature-browser"
  };
  var AttachmentViewer = /** @class */ (function (_super) {
    __extends(AttachmentViewer, _super);

    function AttachmentViewer(value) {
      var _this = _super.call(this) || this;
      _this.view = null;
      _this.searchWidget = null;
      _this.layerFeatureIndex = null;
      _this.defaultObjectId = null;
      _this.attachmentIndex = null;
      _this.appMode = null;
      _this.title = null;
      _this.attachmentLayer = null;
      _this.order = null;
      _this.onboardingContent = null;
      _this.downloadEnabled = null;
      _this.socialSharingEnabled = null;
      _this.zoomLevel = null;
      _this.addressEnabled = null;
      _this.onboardingImage = null;
      _this.onboardingButtonText = null;
      _this.docDirection = null;
      _this.viewModel = new AttachmentViewerViewModel();
      return _this;
    }
    AttachmentViewer.prototype.postInitialize = function () {
      var _this = this;
      this.own([
        watchUtils.when(this, "view", function () {
          _this._apptoRun = _this.startApp();
          watchUtils.when(_this, "socialSharingEnabled", function () {
            _this._apptoRun.socialSharingEnabled = _this.socialSharingEnabled;
          });
        })
      ]);
    };
    //----------------------------------
    //
    //  Lifecycle
    //
    //----------------------------------
    AttachmentViewer.prototype.render = function () {
      return widget_1.tsx("div", {
        class: CSS.base
      }, this._apptoRun.render());
    };
    AttachmentViewer.prototype.startApp = function () {
      var app = new PhotoCentric({
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
    };
    __decorate([
      decorators_1.aliasOf("viewModel.view"),
      decorators_1.property()
    ], AttachmentViewer.prototype, "view", void 0);
    __decorate([
      decorators_1.aliasOf("viewModel.searchWidget"),
      decorators_1.property()
    ], AttachmentViewer.prototype, "searchWidget", void 0);
    __decorate([
      decorators_1.aliasOf("viewModel.layerFeatureIndex"),
      decorators_1.property()
    ], AttachmentViewer.prototype, "layerFeatureIndex", void 0);
    __decorate([
      decorators_1.aliasOf("viewModel.defaultObjectId"),
      decorators_1.property()
    ], AttachmentViewer.prototype, "defaultObjectId", void 0);
    __decorate([
      decorators_1.aliasOf("viewModel.attachmentIndex"),
      decorators_1.property()
    ], AttachmentViewer.prototype, "attachmentIndex", void 0);
    __decorate([
      decorators_1.property()
    ], AttachmentViewer.prototype, "appMode", void 0);
    __decorate([
      decorators_1.aliasOf("viewModel.title"),
      decorators_1.property()
    ], AttachmentViewer.prototype, "title", void 0);
    __decorate([
      decorators_1.aliasOf("viewModel.attachmentLayer"),
      decorators_1.property()
    ], AttachmentViewer.prototype, "attachmentLayer", void 0);
    __decorate([
      decorators_1.aliasOf("viewModel.order"),
      decorators_1.property()
    ], AttachmentViewer.prototype, "order", void 0);
    __decorate([
      decorators_1.property()
    ], AttachmentViewer.prototype, "onboardingContent", void 0);
    __decorate([
      decorators_1.aliasOf("viewModel.downloadEnabled"),
      decorators_1.property()
    ], AttachmentViewer.prototype, "downloadEnabled", void 0);
    __decorate([
      decorators_1.aliasOf("viewModel.socialSharingEnabled"),
      decorators_1.property()
    ], AttachmentViewer.prototype, "socialSharingEnabled", void 0);
    __decorate([
      decorators_1.aliasOf("viewModel.zoomLevel"),
      decorators_1.property()
    ], AttachmentViewer.prototype, "zoomLevel", void 0);
    __decorate([
      decorators_1.aliasOf("viewModel.addressEnabled"),
      decorators_1.property()
    ], AttachmentViewer.prototype, "addressEnabled", void 0);
    __decorate([
      decorators_1.property()
    ], AttachmentViewer.prototype, "onboardingImage", void 0);
    __decorate([
      decorators_1.property()
    ], AttachmentViewer.prototype, "onboardingButtonText", void 0);
    __decorate([
      decorators_1.property()
    ], AttachmentViewer.prototype, "docDirection", void 0);
    __decorate([
      widget_1.renderable(["viewModel.state"]),
      decorators_1.property({
        type: AttachmentViewerViewModel
      })
    ], AttachmentViewer.prototype, "viewModel", void 0);
    AttachmentViewer = __decorate([
      decorators_1.subclass("AttachmentViewer")
    ], AttachmentViewer);
    return AttachmentViewer;
  }(decorators_1.declared(Widget)));
  return AttachmentViewer;
});
//# sourceMappingURL=AttachmentViewer.js.map
