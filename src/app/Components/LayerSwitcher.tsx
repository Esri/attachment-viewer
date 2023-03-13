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

// esri.core.accessorSupport
import { subclass, property, aliasOf } from "@arcgis/core/core/accessorSupport/decorators";

// esri.widgets
import Widget from "@arcgis/core/widgets/Widget";

//esri.widgets.support
import { accessibleHandler, tsx, messageBundle } from "@arcgis/core/widgets/support/widget";

import LayerSwitcherViewModel from "./LayerSwitcher/LayerSwitcherViewModel";
import MapCentricViewModel from "./MapCentric/MapCentricViewModel";

import LayerSwitcher_t9n from "../../t9n/Components/LayerSwitcher/resources.json";

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
  groupLayerItem: "esri-layer-switcher__group-layer-item",
  layerItemSelected: "esri-layer-switcher__layer-item--selected",
  selectLayerDropDown: "esri-layer-switcher__select-layer-dropdown",
  selectLayerDropDownTitle: "esri-layer-switcher__select-layer-dropdown-title",
  groupLayerTitleContainer: "esri-layer-switcher__group-layer-title-container",
  childLayerFeatureTitleContainer: "esri-layer-switcher__child-layer-title-container",
  featureLayerTitleContainer: "esri-layer-switcher__feature-layer-title-container",
  checkMarkContainer: "esri-layer-switcher__check-mark-container",
  arrowContainer: "esri-layer-switcher__arrow-container",
  dropDownList: "esri-layer-switcher__layer-dropdown-list",
  dropDownArrowIcon: "esri-layer-switcher__dropdown-arrow-icon",
  svg: "esri-attachment-viewer__svg",
  mediaLayerIcon: "esri-photo-centric-media-layer-icon",
  arrowButtonContainer: "esri-layer-switcher__arrow-button-container",
  dropDownMapCentric: "esri-layer-switcher__dropdown-map-centric",
  dropdownList: "esri-layer-switcher-dropdown-list"
};

@subclass("LayerSwitcher")
class LayerSwitcher extends Widget {
  constructor(value?: any) {
    super(value);
  }

  // _dropDownIsOpen
  private _dropDownIsOpen: boolean | null = null;

  @property()
  appMode: string | null = null;

  // view
  @aliasOf("viewModel.view")
  @property()
  view: __esri.MapView | null = null;

  // featureLayerCollection
  @aliasOf("viewModel.featureLayerCollection")
  @property()
  featureLayerCollection: __esri.Collection<__esri.FeatureLayer> | null = null;

  // mapCentricViewModel
  @aliasOf("viewModel.mapCentricViewModel")
  @property()
  mapCentricViewModel: MapCentricViewModel | null = null;

  // selectedLayer
  @aliasOf("viewModel.selectedLayer")
  @property()
  selectedLayer: __esri.FeatureLayer | null = null;

  // selectedLayer
  @aliasOf("viewModel.selectedLayerId")
  @property()
  selectedLayerId: string | null = null;

  @aliasOf("viewModel.applySharedTheme")
  applySharedTheme: boolean;

  @aliasOf("viewModel.sharedTheme")
  sharedTheme;

  @aliasOf("viewModel.groupLayerData")
  groupLayerData: __esri.Collection<__esri.GroupLayer> | null = null;

  @property()
  @messageBundle(`${import.meta.env.BASE_URL}assets/t9n/Components/LayerSwitcher/resources`)
  messages: typeof LayerSwitcher_t9n | null = null;

  // viewModel
  @property({
    type: LayerSwitcherViewModel
  })
  viewModel: LayerSwitcherViewModel = new LayerSwitcherViewModel();

  @aliasOf("viewModel.customTheme")
  customTheme;

  render() {
    const layers = this._renderLayerItems();
    const groupLayerItems = this._renderGroupLayerItems();
    const tables = this._renderTableItems();
    const selectedLayerTitle = this.get("selectedLayer.title") as string;
    const title =
      selectedLayerTitle && selectedLayerTitle.length > 30
        ? `${selectedLayerTitle.split("").slice(0, 30).join("")}...`
        : selectedLayerTitle;
    const layerTitleToDisplay = title ? title : null;
    const theme = this.viewModel.getThemeButtonColor("primary", "primary");
    return (
      <div class={CSS.base}>
        {this.appMode === "photo-centric" ? (
          <button
            styles={theme}
            bind={this}
            onclick={this._toggleLayerDropdown}
            onkeydown={this._toggleLayerDropdown}
            class={this.classes(CSS.selectLayerDropDown, CSS.layerSwitcherPhotoCentric)}
            tabIndex={0}
          >
            <calcite-icon icon="layers" scale="s" />
            <calcite-icon icon={this._dropDownIsOpen ? "chevron-up" : "chevron-down"} scale="s" />
          </button>
        ) : (
          <div class={CSS.dropDownMapCentric}>
            {layerTitleToDisplay ? (
              <div
                key={"layer-switcher-dropdown"}
                class={this.classes(CSS.selectLayerDropDown, CSS.layerSwitcherMapCentric)}
                styles={{
                  ...this.viewModel.getTheme("secondary", "secondary"),
                  border: "none"
                }}
              >
                <calcite-icon icon="layers" scale="s" />
                <span class={CSS.selectLayerDropDownTitle}>{layerTitleToDisplay}</span>
              </div>
            ) : null}
            {this.featureLayerCollection &&
            this.featureLayerCollection.length > 1 &&
            this.featureLayerCollection.filter((layer) => layer.visible).length > 0 ? (
              <div class={CSS.arrowButtonContainer}>
                <button
                  styles={this.viewModel.getThemeButtonColor("primary", "primary")}
                  bind={this}
                  onclick={this._toggleLayerDropdown}
                  onkeydown={this._toggleLayerDropdown}
                  class={CSS.arrowContainer}
                  title={this.messages?.selectLayerToViewAttachments}
                  tabIndex={0}
                >
                  <calcite-icon
                    icon={this._dropDownIsOpen ? "chevron-up" : "chevron-down"}
                    scale="s"
                  />
                </button>
              </div>
            ) : null}
          </div>
        )}

        {this._dropDownIsOpen ? (
          <div key={CSS.dropdownList} class={CSS.dropDownList}>
            {groupLayerItems}
            {layers}
            {tables}
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
    if (!this.featureLayerCollection) return;

    return (
      <div class={CSS.groupLayerItem}>
        {this.featureLayerCollection
          .filter((layer) => !layer.isTable)
          .filter((layer) => !(layer as any)?.parent)
          .every((featureLayer) => !featureLayer.visible) ? null : (
          <div key="group-layer-title-container" class={CSS.groupLayerTitleContainer}>
            {this.messages?.layers}
          </div>
        )}
        {this.featureLayerCollection.toArray().map((featureLayer: any) => {
          const groupLayers = this.view?.map.allLayers.filter(
            (layer) => layer.type === "group"
          ) as __esri.Collection<__esri.GroupLayer>;
          const groupLayer = groupLayers?.find(
            (groupLayer: __esri.GroupLayer) => groupLayer.layers.indexOf(featureLayer) !== -1
          );
          if (groupLayer) {
            return;
          }
          if (featureLayer.isTable) {
            return;
          }
          return this._renderLayerItem(featureLayer);
        })}
      </div>
    );
  }

  private _renderTableItems(): any {
    if (!this.featureLayerCollection) {
      return;
    }
    const tables = this.featureLayerCollection.toArray().filter((layer) => layer.isTable);
    return tables.length > 0 ? (
      <div class={CSS.groupLayerItem}>
        <div class={CSS.groupLayerTitleContainer}>{this.messages?.tables}</div>
        {tables
          .filter((layer) => layer.isTable)
          .map((featureLayer: any) => {
            return this._renderLayerItem(featureLayer);
          })}
      </div>
    ) : null;
  }

  private _renderGroupLayerItems(): any {
    return this.groupLayerData?.toArray().map((groupLayerDataItem) => {
      const childLayers = this.featureLayerCollection?.filter(
        (featureLayer) => featureLayer.get("parent.id") === groupLayerDataItem.id
      ) as __esri.Collection<__esri.FeatureLayer>;
      return (
        <div class={CSS.groupLayerItem}>
          {childLayers?.length > 0 ? (
            <div key="group-layer-item-label" class={CSS.groupLayerTitleContainer}>
              {groupLayerDataItem.title}
            </div>
          ) : null}
          {childLayers.toArray().map((childLayer) => {
            return this._renderLayerItem(childLayer, true);
          })}
        </div>
      );
    });
  }

  private _renderLayerItem(featureLayer: __esri.FeatureLayer, isChild?: boolean): any {
    const title = featureLayer && featureLayer.title;
    const layerItemTitle = title ? title : null;
    const childStyles = {
      [CSS.childLayerFeatureTitleContainer]: isChild
    };
    if (!featureLayer.visible) {
      return;
    }
    return (
      <div
        class={CSS.layerItem}
        onclick={this._setLayer.bind(this, featureLayer)}
        onkeydown={this._setLayer.bind(this, featureLayer)}
        data-layer-item={featureLayer}
        tabIndex={0}
        role="button"
      >
        <div class={this.classes(CSS.featureLayerTitleContainer, childStyles)}>
          {layerItemTitle}
        </div>
        {this.selectedLayer && this.selectedLayer.id === featureLayer.id ? (
          <div key={`${featureLayer.id}`} class={CSS.checkMarkContainer}>
            <calcite-icon icon="check" scale="s" />
          </div>
        ) : null}
      </div>
    );
  }

  @accessibleHandler()
  private _setLayer(featureLayer: __esri.FeatureLayer): void {
    if (this.mapCentricViewModel?.appMode === "map-centric") {
      featureLayer.when(async () => {
        try {
          const extentRes = await featureLayer.queryExtent();
          await this.view?.goTo(extentRes);
        } catch (err) {
          console.error(err);
        } finally {
          if (this.mapCentricViewModel?.featureContentPanelIsOpen) {
            this.set("mapCentricViewModel.featureContentPanelIsOpen", false);
          }
          this.viewModel.setLayer(featureLayer);
          this._dropDownIsOpen = false;
          this.scheduleRender();
        }
      });
    } else {
      this.viewModel.setLayer(featureLayer);
      this._dropDownIsOpen = false;
      this.scheduleRender();
    }
  }
}

export default LayerSwitcher;
