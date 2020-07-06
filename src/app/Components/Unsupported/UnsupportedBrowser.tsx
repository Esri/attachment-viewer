// i18n
import i18n = require("dojo/i18n!./nls/resources");

// esri.core
import { subclass, property } from "esri/core/accessorSupport/decorators";

// esri.widgets
import Widget from "esri/widgets/Widget";
import { tsx } from "esri/widgets/support/widget";

import { substitute } from "esri/intl";

// ----------------------------------
//
//  CSS Classes
//
// ----------------------------------
const CSS = {
  base: "esri-config-panel-unsupported-browser",
  browserIconContainer:
    "esri-config-panel-unsupported-browser__browser-icon-container",
  browserIcon: "esri-config-panel-unsupported-browser__browser-icon",
  messageContainer: "esri-config-panel-unsupported-browser__message-container",
  jsGlobalNav: "js-global-nav",
  globalNav: "global-nav"
};

@subclass("UnsupportedBrowser")
class UnsupportedBrowser extends Widget {
  private _downloadUrls = {
    chrome: "https://www.google.com/chrome/",
    firefox: "https://www.mozilla.org/firefox/new/",
    edge: "https://www.microsoft.com/edge",
    safari: "https://support.apple.com/downloads/safari",
    catsGeoNetLink: "https://community.esri.com/groups/cats",
    edgelegacy:
      "https://support.microsoft.com/en-us/help/4533505/what-is-microsoft-edge-legacy"
  };

  constructor(params?: any) {
    super(params);
  }

  @property()
  isIE = false;

  render() {
    const message = !this.isIE ? i18n.message : i18n.ie11Message;
    return (
      <div>
        <div class={CSS.messageContainer}>
          <h2>{i18n.title}</h2>
          <div innerHTML={substitute(message, this._downloadUrls)} />
          <div class={CSS.browserIconContainer}>
            <img
              class={CSS.browserIcon}
              src="Components/Unsupported/icons/chrome.jpg"
              alt="Google Chrome Icon"
            />
            <img
              class={CSS.browserIcon}
              src="Components/Unsupported/icons/firefox.jpg"
              alt="Mozilla Firefox Icon"
            />
            <img
              class={CSS.browserIcon}
              src="Components/Unsupported/icons/safari.jpg"
              alt="Safari Icon"
            />
            {!this.isIE ? (
              <img
                class={CSS.browserIcon}
                src="Components/Unsupported/icons/new_edge.jpg"
                alt="Chromium Edge Icon"
              />
            ) : null}
          </div>
        </div>
      </div>
    );
  }
}

export = UnsupportedBrowser;
