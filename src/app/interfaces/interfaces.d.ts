export type VNode = {
  /* avoids exposing vdom implementation details */
};

interface Fields {
  id: string;
  fields: string[];
}

export interface SelectedLayer {
  id: string;
  fields: Fields[];
}

export interface SelectedFeatureAttachments {
  attachments: __esri.AttachmentInfo[];
  currentIndex: number;
}
