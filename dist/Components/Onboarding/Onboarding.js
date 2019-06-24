// Copyright 2019 Esri
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//   http://www.apache.org/licenses/LICENSE-2.0
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.


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
define(["require", "exports", "esri/core/tsSupport/declareExtendsHelper", "esri/core/tsSupport/decorateHelper", "esri/core/accessorSupport/decorators", "esri/widgets/Widget", "esri/widgets/support/widget", "dojo/i18n!../PhotoCentric/nls/resources"], function (require, exports, __extends, __decorate, decorators_1, Widget, widget_1, i18n) {
  "use strict";
  var CSS = {
    title: "title-container",
    onboardingHeadingText: "esri-photo-centric__onboarding-heading-text",
    onboardingContent: "esri-photo-centric__onboarding-content"
  };
  var OnboardingContent = /** @class */ (function (_super) {
    __extends(OnboardingContent, _super);

    function OnboardingContent(params) {
      return _super.call(this, params) || this;
    }
    OnboardingContent.prototype.render = function () {
      var _a = this.config,
        onboardingHTML = _a.onboardingHTML,
        customOnboardingEnabled = _a.customOnboardingEnabled;
      return (widget_1.tsx("div", {
        innerHTML: customOnboardingEnabled ?
          onboardingHTML ?
          onboardingHTML :
          null :
          null
      }, customOnboardingEnabled ? null : (widget_1.tsx("div", null,
        widget_1.tsx("h2", {
          class: CSS.onboardingHeadingText
        }, i18n.welcome),
        widget_1.tsx("p", {
          class: CSS.onboardingContent
        }, "Lorem ipsum dolor, sit amet consectetur adipisicing elit. Magnam nostrum rerum aliquam veritatis? Similique omnis rerum quod perspiciatis laudantium error voluptatem, dolorum unde itaque. Sed unde magnam repellat repudiandae soluta."),
        widget_1.tsx("h2", {
          class: CSS.onboardingHeadingText
        }, i18n.about),
        widget_1.tsx("p", {
          class: CSS.onboardingContent
        }, "Lorem ipsum dolor sit, amet consectetur adipisicing elit. Non dicta sint inventore. Nam magnam enim commodi in dolores perferendis fuga eligendi vero?"),
        widget_1.tsx("p", {
          class: CSS.onboardingContent
        }, "Lorem ipsum dolor sit, amet consectetur adipisicing elit. Hic possimus accusamus quidem ullam dolorem molestiae at sequi ducimus. Nulla, maiores. Officia aspernatur quis corporis expedita quibusdam! Ullam suscipit distinctio tempora unde dolores, iste doloribus itaque nam adipisci asperiores repudiandae deleniti.")))));
    };
    __decorate([
      decorators_1.property(),
      widget_1.renderable()
    ], OnboardingContent.prototype, "config", void 0);
    OnboardingContent = __decorate([
      decorators_1.subclass("OnboardingContent")
    ], OnboardingContent);
    return OnboardingContent;
  }(decorators_1.declared(Widget)));
  return OnboardingContent;
});
//# sourceMappingURL=Onboarding.js.map
