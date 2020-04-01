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

// nls
import * as i18n from "dojo/i18n!./LayerSwitcher/nls/resources";

// esri.widgets
import Widget = require("esri/widgets/Widget");

//esri.widgets.support
import {
  accessibleHandler,
  renderable,
  tsx
} from "esri/widgets/support/widget";

import LayerSwitcherViewModel = require("./LayerSwitcher/LayerSwitcherViewModel");
import MapCentricViewModel = require("./MapCentric/MapCentricViewModel");

//----------------------------------
//
//  CSS Classes
//
//----------------------------------

const CSS = {
  base: "esri-layer-switcher",
  layerSwitcherPhotoCentric: "esri-layer-switcher__photo-centric",
  layerSwitcherMapCentric: "esri-layer-switcher__map-centric",
  layerItem: "esri-layer-switcher__layer-item",
  layerItemSelected: "esri-layer-switcher__layer-item--selected",
  selectLayerDropDown: "esri-layer-switcher__select-layer-dropdown",
  selectLayerDropDownTitle: "esri-layer-switcher__select-layer-dropdown-title",
  featureLayerTitleContainer:
    "esri-layer-switcher__feature-layer-title-container",
  checkMarkContainer: "esri-layer-switcher__check-mark-container",
  arrowContainer: "esri-layer-switcher__arrow-container",
  dropDownList: "esri-layer-switcher__layer-dropdown-list",
  dropDownArrowIcon: "esri-layer-switcher__dropdown-arrow-icon",
  svg: "esri-attachment-viewer__svg",
  mediaLayerIcon: "esri-photo-centric-media-layer-icon",
  arrowButtonContainer: "esri-layer-switcher__arrow-button-container",
  dropDownMapCentric: "esri-layer-switcher__dropdown-map-centric",
  dropdownList: "esri-layer-switcher-dropdown-list",
  icons: {
    upArrowIcon: "icon-ui-up-arrow ",
    downArrowIcon: "icon-ui-down-arrow",
    flushIcon: "icon-ui-flush",
    layersIcon: "icon-ui-layers",
    checkMark: "esri-icon-check-mark"
  }
};

@subclass("LayerSwitcher")
class LayerSwitcher extends declared(Widget) {
  constructor(value?: any) {
    super();
  }

  // _dropDownIsOpen
  private _dropDownIsOpen: boolean = null;

  @property()
  appMode: string = null;

  // view
  @aliasOf("viewModel.view")
  @property()
  view: __esri.MapView = null;

  // featureLayerCollection
  @aliasOf("viewModel.featureLayerCollection")
  @property()
  featureLayerCollection: __esri.Collection<__esri.FeatureLayer> = null;

  // mapCentricViewModel
  @aliasOf("viewModel.mapCentricViewModel")
  @property()
  mapCentricViewModel: MapCentricViewModel = null;

  // selectedLayer
  @aliasOf("viewModel.selectedLayer")
  @property()
  selectedLayer: __esri.FeatureLayer = null;

  // selectedLayer
  @aliasOf("viewModel.selectedLayerId")
  @property()
  selectedLayerId: string = null;

  // viewModel
  @property({
    type: LayerSwitcherViewModel
  })
  @renderable()
  viewModel: LayerSwitcherViewModel = new LayerSwitcherViewModel();

  render() {
    const layers = this._renderLayerItems();

    const arrowIcon = {
      [CSS.icons.upArrowIcon]: this._dropDownIsOpen,
      [CSS.icons.downArrowIcon]: !this._dropDownIsOpen
    };
    const selectedLayerTitle = this.get("selectedLayer.title") as string;
    const title =
      selectedLayerTitle && selectedLayerTitle.length > 30
        ? `${selectedLayerTitle
            .split("")
            .slice(0, 30)
            .join("")}...`
        : selectedLayerTitle;
    const layerTitleToDisplay = title ? title : null;
    return (
      <div class={CSS.base}>
        {this.appMode === "photo-centric" ? (
          <button
            bind={this}
            onclick={this._toggleLayerDropdown}
            onkeydown={this._toggleLayerDropdown}
            class={this.classes(
              CSS.selectLayerDropDown,
              CSS.layerSwitcherPhotoCentric
            )}
            tabIndex={0}
          >
            <svg class={this.classes(CSS.svg, CSS.mediaLayerIcon)}>
              <g>
                <path d="M8.1,1.7L0.1,6.3L8.1,11L16,6.3L8.1,1.7z M2.9,6.3l5.2-3l5.2,3l-5.2,3L2.9,6.3z" />
                <polygon points="8.1,11.6 2.7,8.5 0.1,10 8.1,14.5 16,10 13.4,8.5" />
              </g>
            </svg>

            <span
              class={this.classes(
                CSS.dropDownArrowIcon,
                arrowIcon,
                CSS.icons.flushIcon
              )}
            />
          </button>
        ) : (
          <div class={CSS.dropDownMapCentric}>
            {layerTitleToDisplay ? (
              <div
                key={"layer-switcher-dropdown"}
                class={this.classes(
                  CSS.selectLayerDropDown,
                  CSS.layerSwitcherMapCentric
                )}
              >
                <span class={CSS.svg}>
                  <svg class={CSS.svg}>
                    <g>
                      <path d="M8.1,1.7L0.1,6.3L8.1,11L16,6.3L8.1,1.7z M2.9,6.3l5.2-3l5.2,3l-5.2,3L2.9,6.3z" />
                      <polygon points="8.1,11.6 2.7,8.5 0.1,10 8.1,14.5 16,10 13.4,8.5 	" />
                    </g>
                  </svg>
                </span>
                <span class={CSS.selectLayerDropDownTitle}>
                  {layerTitleToDisplay}
                </span>
              </div>
            ) : null}
            {this.featureLayerCollection &&
            this.featureLayerCollection.length > 1 ? (
              <div class={CSS.arrowButtonContainer}>
                <button
                  bind={this}
                  onclick={this._toggleLayerDropdown}
                  onkeydown={this._toggleLayerDropdown}
                  class={CSS.arrowContainer}
                  title={i18n.selectLayerToViewAttachments}
                  tabIndex={0}
                >
                  <span
                    class={this.classes(
                      CSS.dropDownArrowIcon,
                      arrowIcon,
                      CSS.icons.flushIcon
                    )}
                  />
                </button>
              </div>
            ) : null}
          </div>
        )}

        {this._dropDownIsOpen ? (
          <div key={CSS.dropdownList} class={CSS.dropDownList}>
            {layers}
          </div>
        ) : null}
      </div>
    );
  }

  @accessibleHandler()
  private _toggleLayerDropdown(): void {
    if (this._dropDownIsOpen) {
      this._dropDownIsOpen = false;
    } else {
      this._dropDownIsOpen = true;
    }
    this.scheduleRender();
  }

  private _renderLayerItems(): any {
    if (!this.featureLayerCollection) {
      return;
    }
    return this.featureLayerCollection
      .toArray()
      .map((featureLayer: __esri.FeatureLayer) => {
        return this._renderLayerItem(featureLayer);
      });
  }

  private _renderLayerItem(featureLayer: __esri.FeatureLayer): any {
    const title = featureLayer && featureLayer.title;
    const layerItemTitle = title ? title : null;
    return (
      <div
        bind={this}
        class={CSS.layerItem}
        onclick={this._setLayer}
        onkeydown={this._setLayer}
        data-layer-item={featureLayer}
        tabIndex={0}
        role="button"
      >
        <div class={CSS.featureLayerTitleContainer}>{layerItemTitle}</div>
        {this.selectedLayer && this.selectedLayer.id === featureLayer.id ? (
          <div key={`${featureLayer.id}`} class={CSS.checkMarkContainer}>
            <span class={CSS.icons.checkMark}></span>
          </div>
        ) : null}
      </div>
    );
  }

  @accessibleHandler()
  private async _setLayer(event: Event): Promise<void> {
    if (
      this.mapCentricViewModel &&
      this.mapCentricViewModel.featureContentPanelIsOpen
    ) {
      this.set("mapCentricViewModel.featureContentPanelIsOpen", false);
    }
    const node = event.currentTarget as HTMLElement;
    const featureLayer = node["data-layer-item"] as __esri.FeatureLayer;
    const extent = await featureLayer.queryExtent();
    if (extent) {
      await this.view.goTo(extent);
    }
    this.viewModel.setLayer(featureLayer);
    this._dropDownIsOpen = false;
    this.scheduleRender();
  }
}

export = LayerSwitcher;
