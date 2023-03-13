import Accessor from "@arcgis/core/core/Accessor";
import { subclass, property } from "@arcgis/core/core/accessorSupport/decorators";
import Collection from "@arcgis/core/core/Collection";
import RelatedFeatureItem from "./RelatedFeatureItem";
import Relationship from "@arcgis/core/layers/support/Relationship";

@subclass("RelatedFeaturesViewModel")
class RelatedFeaturesViewModel extends Accessor {
  @property()
  view: __esri.MapView | null = null;

  @property()
  destinationLayer: __esri.FeatureLayer | null = null;

  @property()
  selectedFeature: __esri.Graphic | null = null;

  @property()
  relatedFeatures: Collection<RelatedFeatureItem> = new Collection();

  async getRelatedOriginFeature(graphic: __esri.Graphic): Promise<__esri.Graphic | null | undefined> {
    let target = null;
    const featureLayer = graphic.layer as __esri.FeatureLayer;
    const destinationLayer = this.getRelatedDestinationLayer(featureLayer);
    const role = this.getRelationshipRole(destinationLayer);

    if (destinationLayer && role === "origin") {
      try {
        const oid = graphic.attributes[featureLayer.objectIdField];
        const relationshipId = this.getRelationshipId(destinationLayer, featureLayer);
        const relatedFeatures = (await featureLayer.queryRelatedFeatures({
          objectIds: [oid],
          returnGeometry: true,
          outFields: ["*"],
          relationshipId
        })) as __esri.FeatureSet;
        const features = relatedFeatures?.[oid]?.features as __esri.Graphic;
        target = features?.[0];
      } catch (err) {
        console.error("CANNOT GET RELATED FEATURE TO ZOOM TO: ", err);
      } finally {
        return target;
      }
    }
    return;
  }

  getRelatedFeatureOIDs(relatedFeatures, objectIdField: string): number[] {
    const oids: number[] = [];
    if (!relatedFeatures) {
      return oids;
    }
    const values = Object.values(relatedFeatures);
    values.forEach((value: any) => {
      return value.features.forEach((feature) => {
        const oid = feature.attributes[objectIdField];
        oids.push(oid);
      });
    });
    return oids;
  }

  getRelationshipRole(layer: __esri.FeatureLayer): "destination" | "origin" | undefined {
    const relatedDest = this.getRelatedDestinationLayer(layer);

    const relationship = layer?.relationships?.find(
      (relationship) => relationship?.relatedTableId === relatedDest?.layerId
    );
    return relationship?.role;
  }

  getRelatedDestinationLayer(layer: __esri.FeatureLayer): __esri.FeatureLayer {
    let relatedLayer;
    // GET RELATED DESTINATION, EITHER FEATURE LAYER OR TABLE
    const map = this.view?.map as __esri.WebMap;
    // CHECK IF SOURCE IS IN ALLLAYERS OR ALLTABLES COLLECTIONS
    const layers = map.allLayers.filter((layer) => layer.type === "feature") as Collection<__esri.FeatureLayer>;
    const tables = map.allTables.filter((layer) => layer.type === "feature") as Collection<__esri.FeatureLayer>;
    // ITERATE THROUGH SELECTED LAYERS RELATIONSHIPS TO GET RELATED DATA SET
    const relationships = layer?.relationships;
    relationships?.forEach((relationship) => {
      const layer = layers.find((layer: __esri.FeatureLayer) => {
        return relationship?.relatedTableId === layer?.layerId && layer?.relationships?.length > 0;
      });
      const table = tables.find((layer: __esri.FeatureLayer) => {
        return relationship?.relatedTableId === layer?.layerId && relationships?.length > 0;
      });
      relatedLayer = layer ?? table;
    });
    return relatedLayer;
  }

  async queryRelatedFeatures(graphic: __esri.Graphic, layer: __esri.FeatureLayer) {
    if (!graphic) {
      return;
    }
    try {
      const destinationLayer = this.getRelatedDestinationLayer(layer);
      if (!destinationLayer || !destinationLayer?.visible) {
        if (this.relatedFeatures?.length > 0) {
          this.relatedFeatures.removeAll();
        }
        return;
      }
      const oid = graphic.attributes[layer.objectIdField];
      const relationshipId = this.getRelationshipId(destinationLayer, layer);
      const relatedFeatureRes = await layer.queryRelatedFeatures({
        objectIds: [oid],
        returnGeometry: true,
        outFields: ["*"],
        relationshipId
      });
      if (!relatedFeatureRes[oid]) {
        this.relatedFeatures.removeAll();
        return;
      }
      this.destinationLayer = destinationLayer;
      const relatedFeatures = relatedFeatureRes[oid].features.map((graphic) => {
        if (!graphic.layer) {
          graphic.layer = destinationLayer;
        }
        return new RelatedFeatureItem({
          graphic
        });
      });
      this.relatedFeatures.removeAll();
      this.relatedFeatures.addMany([...relatedFeatures]);
    } catch (err) {}
  }

  // This function grabs the origin relationship from the destination layer's `layer.relationships`
  getOriginRelationship(destinationLayer: __esri.FeatureLayer, originLayer: __esri.FeatureLayer): __esri.Relationship {
    return destinationLayer?.relationships?.find(
      (relationship) => relationship?.relatedTableId === parseInt(`${originLayer?.layerId}`, 10)
    ) as __esri.Relationship;
  }

  getDestinationRelation({
    originRelationship, // Relationship item from destination layer's `layer.relationships`
    relationships, // Relationship array from origin layer's `layer.relationships`
    layerId // Destination layer's `layer.layerId`
  }: {
    originRelationship: Relationship | null;
    relationships: Relationship[];
    layerId: string;
  }): Relationship | null {
    let destinationRelation: Relationship | null = null;
    if (relationships) {
      relationships?.some((relationship) => {
        if (`${relationship?.relatedTableId}` === layerId && relationship?.id === originRelationship?.id) {
          destinationRelation = relationship;
        }
        return !!destinationRelation;
      });
    }
    return destinationRelation;
  }

  getRelationshipId(destinationLayer: __esri.FeatureLayer, originLayer: __esri.FeatureLayer): number {
    const originRelationship = this.getOriginRelationship(destinationLayer, originLayer);
    const destinationRelation = this.getDestinationRelation({
      originRelationship,
      relationships: originLayer?.relationships,
      layerId: `${destinationLayer?.layerId}`
    });
    return destinationRelation?.id as number;
  }
}

export default RelatedFeaturesViewModel;
