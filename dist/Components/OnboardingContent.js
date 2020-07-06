// Copyright 2020 Esri
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//   http://www.apache.org/licenses/LICENSE-2.0
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.​
define(["require", "exports", "tslib", "esri/core/accessorSupport/decorators", "esri/widgets/Widget", "esri/widgets/support/widget", "dojo/i18n!./PhotoCentric/nls/resources"], function (require, exports, tslib_1, decorators_1, Widget, widget_1, resources_1) {
    "use strict";
    resources_1 = tslib_1.__importDefault(resources_1);
    var CSS = {
        title: "title-container",
        onboardingHeadingText: "esri-photo-centric__onboarding-heading-text",
        headingContainer: "esri-photo-centric__heading-container",
        onboardingContent: "esri-photo-centric__onboarding-content",
        onboardingContentContainer: "esri-photo-centric__onboarding--custom-disabled"
    };
    var OnboardingContent = /** @class */ (function (_super) {
        tslib_1.__extends(OnboardingContent, _super);
        function OnboardingContent(params) {
            var _this = _super.call(this, params) || this;
            _this.appMode = null;
            _this.withinConfigurationExperience = null;
            return _this;
        }
        OnboardingContent.prototype.render = function () {
            var _a;
            var _b = this.config, customOnboarding = _b.customOnboarding, customOnboardingHTML = _b.customOnboardingHTML;
            var onboardingContainer = (_a = {},
                _a[CSS.onboardingContentContainer] = !customOnboarding,
                _a);
            return customOnboarding ? (this.withinConfigurationExperience ? (widget_1.tsx("div", { key: "custom-onboarding", class: this.classes(onboardingContainer), bind: this, afterCreate: this._setCustomOnboardingHTML, afterUpdate: this._setCustomOnboardingHTML, "data-onboarding-html": customOnboardingHTML })) : (widget_1.tsx("div", { key: "custom-onboarding", class: this.classes(onboardingContainer), bind: this, afterCreate: this._setCustomOnboardingHTML, "data-onboarding-html": customOnboardingHTML }))) : (widget_1.tsx("div", { key: "default-onboarding" },
                widget_1.tsx("h2", { key: "default-onboarding-title" },
                    widget_1.tsx("span", { key: "default-onboarding-span", style: "color:#0079c1;" }, resources_1.default.welcome)),
                widget_1.tsx("p", { key: "default-onboarding-subtitle" }, resources_1.default.subtitle),
                widget_1.tsx("p", { key: "default-onboarding-int-heading" }, resources_1.default.instructionHeading),
                widget_1.tsx("ul", { key: "default-onboarding-ul" },
                    widget_1.tsx("li", { key: "default-onboarding-li-1" }, resources_1.default.stepOne),
                    widget_1.tsx("li", { key: "default-onboarding-li-2" }, resources_1.default.stepTwo))));
        };
        OnboardingContent.prototype._setCustomOnboardingHTML = function (node) {
            while (node.firstChild) {
                node.removeChild(node.firstChild);
            }
            var content = node.getAttribute("data-onboarding-html");
            var paragraph = document.createElement("p");
            paragraph.innerHTML = content;
            node.appendChild(paragraph);
        };
        tslib_1.__decorate([
            decorators_1.property(),
            widget_1.renderable(["config.customOnboarding", "config.customOnboardingHTML"])
        ], OnboardingContent.prototype, "config", void 0);
        tslib_1.__decorate([
            decorators_1.property(),
            widget_1.renderable()
        ], OnboardingContent.prototype, "appMode", void 0);
        tslib_1.__decorate([
            decorators_1.property()
        ], OnboardingContent.prototype, "withinConfigurationExperience", void 0);
        OnboardingContent = tslib_1.__decorate([
            decorators_1.subclass("OnboardingContent")
        ], OnboardingContent);
        return OnboardingContent;
    }(Widget));
    return OnboardingContent;
});
//# sourceMappingURL=OnboardingContent.js.map