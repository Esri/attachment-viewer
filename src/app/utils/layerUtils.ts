export function removeAttachmentsContent(layer: __esri.FeatureLayer): void {
  const popupTemplateContent = layer.get("popupTemplate.content");
  if (popupTemplateContent && Array.isArray(popupTemplateContent)) {
    const contentArr = popupTemplateContent as __esri.Content[];
    const updatedContents = contentArr.filter((contentItem) => contentItem?.type !== "attachments");
    layer.popupTemplate.set("content", updatedContents);
  }
}
