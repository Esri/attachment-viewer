import { property, subclass } from "@arcgis/core/core/accessorSupport/decorators";
import { IExtentSelectorOutput } from "../interfaces/interfaces";
import ConfigurationSettingsBase from "templates-common-library/baseClasses/configurationSettingsBase";

@subclass("app.ConfigurationSettings")
class ConfigurationSettings extends ConfigurationSettingsBase {
  @property()
  webmap: string;

  @property()
  attachmentLayers;

  @property()
  title: string;

  @property()
  address: boolean;

  @property()
  appLayout: string;

  @property()
  applySharedTheme: boolean | null = null;

  @property()
  theme: "light" | "dark";

  @property()
  customCSS: string;

  @property()
  customOnboarding: boolean;

  @property()
  customOnboardingHTML: string;

  @property()
  download: boolean;

  @property()
  extentSelector: boolean;

  @property()
  extentSelectorConfig: IExtentSelectorOutput;

  @property()
  fullScreen: boolean;

  @property()
  headerBackground: string;

  @property()
  headerColor: string;

  @property()
  enableHeaderBackground: boolean;

  @property()
  enableHeaderColor: boolean;

  @property()
  home: boolean;

  @property()
  imagePanZoom: boolean;

  @property()
  imageDirection: boolean;

  @property()
  layerList: boolean;

  @property()
  legend: boolean;

  @property()
  mapCentricTooltip: boolean;

  @property()
  mapToolsExpanded: boolean;

  @property()
  onboardingButtonText: string;

  @property()
  onboarding: boolean;

  @property()
  onboardingImage: string;

  @property()
  order: string;

  @property()
  searchConfiguration: string;

  @property()
  search: boolean;

  @property()
  searchOpenAtStart: boolean;

  @property()
  selectFeatures: boolean;

  @property()
  showOnboardingOnStart: boolean;

  @property()
  share: boolean;

  @property()
  mapZoom: boolean;

  @property()
  zoomLevel: string;

  @property()
  thumbnailFormat: "stretch" | "fit" | "crop";

  @property()
  thumbnailHeight: number;

  @property()
  googleAnalytics: boolean;

  @property()
  googleAnalyticsKey: string;

  @property()
  googleAnalyticsConsent: boolean;

  @property()
  googleAnalyticsConsentMsg: string;

  @property()
  mapA11yDesc: string;

  @property()
  onlyDisplayFeaturesWithAttachments: boolean;

  @property()
  locateWidget: boolean;

  @property()
  applyEffectToNonActiveLayers: boolean;

  @property()
  nonActiveLayerEffects;

  @property()
  attributeEditing: boolean;

  @property()
  customTheme: any;

  @property()
  hideAttributePanel: boolean;
}
export default ConfigurationSettings;
