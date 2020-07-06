import { property, subclass } from "esri/core/accessorSupport/decorators";
import Accessor = require("esri/core/Accessor");
import { ApplicationConfig } from "../application-base-js/interfaces";

@subclass("app.ConfigurationSettings")
class ConfigurationSettings extends Accessor {
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
  applySharedTheme: boolean = null;

  @property()
  customCSS: string;

  @property()
  customOnboarding: boolean;

  @property()
  customOnboardingHTML: string;

  @property()
  download: boolean;

  @property()
  fullScreen: boolean;

  @property()
  headerBackground: any;

  @property()
  headerColor: any;

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
  onlyDisplayFeaturesWithAttachments: boolean;

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
  withinConfigurationExperience: boolean =
    window.location !== window.parent.location;

  _storageKey = "config-values";
  _draft: ApplicationConfig = null;
  _draftMode: boolean = false;
  constructor(params?: ApplicationConfig) {
    super(params);
    this._draft = params?.draft;
    this._draftMode = params?.mode === "draft";
  }
  initialize() {
    if (this.withinConfigurationExperience || this._draftMode) {
      // Apply any draft properties
      if (this._draft) {
        Object.assign(this, this._draft);
      }

      window.addEventListener(
        "message",
        function (e) {
          this._handleConfigurationUpdates(e);
        }.bind(this),
        false
      );
    }
  }

  _handleConfigurationUpdates(e) {
    if (e?.data?.type === "cats-app") {
      Object.assign(this, e.data);
    }
  }
}
export = ConfigurationSettings;
