import Accessor from "@arcgis/core/core/Accessor";
import { subclass, property } from "@arcgis/core/core/accessorSupport/decorators";

@subclass("RelatedFeatureItem")
class RelatedFeatureItem extends Accessor {
  constructor(params?) {
    super(params);
  }

  @property()
  graphic: __esri.Graphic | null = null;
}

export default RelatedFeatureItem;
