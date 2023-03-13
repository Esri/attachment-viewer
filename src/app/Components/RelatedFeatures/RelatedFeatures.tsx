import { subclass, property, aliasOf } from "@arcgis/core/core/accessorSupport/decorators";
import Widget from "@arcgis/core/widgets/Widget";
import { tsx } from "@arcgis/core/widgets/support/widget";
import RelatedFeaturesViewModel from "./RelatedFeatures/RelatedFeaturesViewModel";
import RelatedFeatureItem from "./RelatedFeatures/RelatedFeatureItem";

import { on } from "@arcgis/core/core/reactiveUtils";

const BASE = "esri-attachment-viewer-related-features";

const CSS = {
  base: BASE,
  button: `${BASE}__button`,
  buttonIcon: `${BASE}__button-icon`,
  buttonText: `${BASE}__button-text`,
  buttonChip: `${BASE}__button-chip`,
  list: `${BASE}__list`,
  listOpen: `${BASE}__list--open`,
  listItem: `${BASE}__list-item`
};

@subclass("RelatedFeatures")
class RelatedFeatures extends Widget {
  constructor(params?) {
    super(params);
  }

  private _listIsOpen = false;

  @aliasOf("viewModel.view")
  view: __esri.MapView | null = null;

  @aliasOf("viewModel.destinationLayer")
  destinationLayer: __esri.FeatureLayer | null = null;

  @aliasOf("viewModel.selectedFeature")
  selectedFeature: __esri.Graphic | null = null;

  @aliasOf("viewModel.relatedFeatures")
  relatedFeatures: __esri.Collection<RelatedFeatureItem> | null = null;

  @aliasOf("viewModel.queryRelatedFeatures")
  queryRelatedFeatures: (graphic: __esri.Graphic, layer: __esri.FeatureLayer) => Promise<void>;

  @property({
    type: RelatedFeaturesViewModel
  })
  viewModel: RelatedFeaturesViewModel = new RelatedFeaturesViewModel();

  postInitialize() {
    this.own(
      on(
        () => this.relatedFeatures,
        "change",
        () => this.scheduleRender()
      )
    );
  }

  render() {
    const list = this._renderList();
    const button = this._renderButton();
    return (this.relatedFeatures as __esri.Collection<RelatedFeatureItem>).length > 0 ? (
      [list, button]
    ) : (
      <div />
    );
  }

  private _renderList() {
    const listOpen = {
      [CSS.listOpen]: this._listIsOpen
    };
    return <ul class={this.classes(CSS.list, listOpen)}>{this._renderListItems()}</ul>;
  }

  private _renderListItems() {
    return this.relatedFeatures?.toArray().map((relatedFeature) => {
      const oid =
        relatedFeature.graphic?.attributes[this.destinationLayer?.objectIdField as string];
      return (
        <li
          bind={this}
          onclick={this._selectRelatedFeature}
          class={CSS.listItem}
          data-oid={`${oid}`}
        >
          Related feature: {`${oid}`}
        </li>
      );
    });
  }

  private _renderButton() {
    const icon = this._renderButtonIcon();
    const text = this._renderButtonText();
    const chip = this._renderButtonChip();
    return (
      <button bind={this} onclick={this._toggleList} class={CSS.button}>
        {icon}
        {text}
        {chip}
      </button>
    );
  }

  private _renderButtonIcon() {
    return <calcite-icon class={CSS.buttonIcon} icon="tables" scale="s" />;
  }

  private _renderButtonText() {
    return <span class={CSS.buttonText}>Additional Features</span>;
  }

  private _renderButtonChip() {
    const length = this.relatedFeatures?.length as number;
    return length > 0 ? (
      <calcite-chip class={CSS.buttonChip} value={length} kind="brand" scale="s">
        {length}
      </calcite-chip>
    ) : null;
  }

  private _toggleList() {
    this._listIsOpen = !this._listIsOpen;
  }

  private async _selectRelatedFeature(e: Event) {
    const node = e.target as HTMLLIElement;
    const oid = parseInt(node.getAttribute("data-oid") as string);
    const relatedFeatureItem = this.relatedFeatures?.find(
      (relatedFeatureItem) =>
        relatedFeatureItem?.graphic?.attributes[
          (this.destinationLayer as __esri.FeatureLayer).objectIdField
        ] === oid
    );
    this.set("selectedFeature", relatedFeatureItem?.graphic);
    this._listIsOpen = false;
  }
}

export default RelatedFeatures;
