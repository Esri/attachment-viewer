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

import { subclass, property } from "@arcgis/core/core/accessorSupport/decorators";
import Widget from "@arcgis/core/widgets/Widget";

import { ApplicationConfig } from "templates-common-library/interfaces/applicationBase";
import { tsx, messageBundle } from "@arcgis/core/widgets/support/widget";
import Sanitizer from "@esri/arcgis-html-sanitizer";
import { createSanitizerInstance } from "templates-common-library/functionality/securityUtils";

import PhotoCentric_t9n from "../../t9n/Components/PhotoCentric/resources.json";

const CSS = {
  title: "title-container",
  onboardingHeadingText: "esri-photo-centric__onboarding-heading-text",
  headingContainer: "esri-photo-centric__heading-container",
  onboardingContent: "esri-photo-centric__onboarding-content",
  onboardingContentContainer: "esri-photo-centric__onboarding--custom-disabled"
};

@subclass("OnboardingContent")
class OnboardingContent extends Widget {
  constructor(params) {
    super(params);
  }
  @property()
  config: ApplicationConfig;

  @property()
  appMode: string | null = null;

  @property()
  withinConfigurationExperience: boolean | null = null;

  @property()
  @messageBundle(`${import.meta.env.BASE_URL}assets/t9n/Components/PhotoCentric/resources`)
  photoCentricMessages: typeof PhotoCentric_t9n | null = null;

  private _sanitizer = createSanitizerInstance(Sanitizer);

  render() {
    const { customOnboarding, customOnboardingHTML } = this.config;
    const onboardingContainer = {
      [CSS.onboardingContentContainer]: !customOnboarding
    };
    return customOnboarding ? (
      this.withinConfigurationExperience ? (
        <div
          key="custom-onboarding"
          class={this.classes(onboardingContainer)}
          bind={this}
          afterCreate={this._setCustomOnboardingHTML}
          afterUpdate={this._setCustomOnboardingHTML}
          data-onboarding-html={customOnboardingHTML}
        />
      ) : (
        <div
          key="custom-onboarding"
          class={this.classes(onboardingContainer)}
          bind={this}
          afterCreate={this._setCustomOnboardingHTML}
          data-onboarding-html={customOnboardingHTML}
        />
      )
    ) : (
      <div key="default-onboarding">
        <h2 key="default-onboarding-title">
          <span key="default-onboarding-span" style="color:#0079c1;">
            {this.photoCentricMessages?.welcome}
          </span>
        </h2>
        <p key="default-onboarding-subtitle">{this.photoCentricMessages?.subtitle}</p>
        <p key="default-onboarding-int-heading">{this.photoCentricMessages?.instructionHeading}</p>
        <ul key="default-onboarding-ul">
          <li key="default-onboarding-li-1">{this.photoCentricMessages?.stepOne}</li>
          <li key="default-onboarding-li-2">{this.photoCentricMessages?.stepTwo}</li>
        </ul>
      </div>
    );
  }

  private _setCustomOnboardingHTML(node: HTMLDivElement): void {
    while (node.firstChild) {
      node.removeChild(node.firstChild);
    }
    const content = node.getAttribute("data-onboarding-html");
    const paragraph = document.createElement("p");
    paragraph.innerHTML = this._sanitizer.sanitize(content);
    node.appendChild(paragraph);
  }
}

export default OnboardingContent;
