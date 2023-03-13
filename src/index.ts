import "./Main.scss";

// @arcgis/core
import { registerMessageBundleLoader, createJSONLoader, fetchMessageBundle } from "@arcgis/core/intl";
import esriConfig from "@arcgis/core/config";

// Calcite Components
import "@esri/calcite-components";
import "@esri/calcite-components/dist/calcite/calcite.css";

import "@esri/calcite-components/dist/components/calcite-icon";
import "@esri/calcite-components/dist/components/calcite-button";
import "@esri/calcite-components/dist/components/calcite-slider";
import "@esri/calcite-components/dist/components/calcite-alert";
import "@esri/calcite-components/dist/components/calcite-modal";

// Instant Apps Components
import "@esri/instant-apps-components";
import "@esri/instant-apps-components/dist/components/instant-apps-header";
import { InstantAppsHeader } from "@esri/instant-apps-components/dist/components/instant-apps-header";
import { InstantAppsSocialShare } from "@esri/instant-apps-components/dist/components/instant-apps-social-share";
customElements.define("instant-apps-header", InstantAppsHeader);
customElements.define("instant-apps-social-share", InstantAppsSocialShare);

// App
import "./Main.scss";
import "./app/App";

// Configuration files
import applicationConfig from "./config/application.json";
import applicationBaseConfig from "./config/applicationBase.json";

// templates-common-library
import ApplicationBase from "templates-common-library/baseClasses/ApplicationBase";
import { ApplicationBaseSettings, ApplicationConfig } from "templates-common-library/interfaces/applicationBase";
import { EAppTemplateType } from "templates-common-library/baseClasses/CompatibilityChecker";

import App from "./app/App";
import { getMessageBundlePath } from "./app/utils/t9nUtils";

import Common_t9n from "./t9n/Common/common.json";
import UserTypesError_t9n from "./t9n/UserTypesError/resources.json";

(async function init() {
  setupAssetPaths();
  registerMessageLoaders();
  await setupCalciteLoader();
  const applicationBase = (await setupApplicationBase()) as ApplicationBase;
  new App().init(applicationBase);
})();

// Set up asset path for Calcite Components + Instant Apps Components
function setupAssetPaths(): void {
  const assetsPath = new URL("./assets", window.location.href).href;
  esriConfig.assetsPath = assetsPath;
}

function registerMessageLoaders(): void {
  registerMessageBundleLoader(
    createJSONLoader({
      pattern: `${import.meta.env.BASE_URL}`,
      base: `${import.meta.env.BASE_URL}`,
      location: new URL(`${import.meta.env.BASE_URL}`, window.location.href)
    })
  );
}

async function setupCalciteLoader(): Promise<void> {
  try {
    const messages = (await fetchMessageBundle(getMessageBundlePath("Common", "common"))) as typeof Common_t9n;

    const { loading } = messages;
    const loader = document.getElementById("loader");
    loader?.setAttribute("text", loading);
    return Promise.resolve();
  } catch {}
}

async function setupApplicationBase(): Promise<ApplicationBase | void> {
  const config = applicationConfig as ApplicationConfig;
  const settings = applicationBaseConfig as ApplicationBaseSettings;
  

  const applicationBase = new ApplicationBase({
    config,
    settings
  });
  return applicationBase
    .load(EAppTemplateType.AttachmentViewer)
    .then((loadedAppBase) => loadedAppBase, handleAppError());
}

function handleAppError(): (message) => void {
  return async (message) => {
    const root = document.getElementById("root") as HTMLDivElement;
    if (message === "identity-manager:not-authorized") {
      const messages = (await fetchMessageBundle(getMessageBundlePath("UserTypesError"))) as typeof UserTypesError_t9n;

      document.body.classList.add("app-error");

      root.innerHTML = `<h1>${messages.licenseError.title}</h1><p>${messages.licenseError.message}</p>`;
    } else if (message?.error === "application:origin-other") {
      document.location.href = `../../shared/origin/index.html?appUrl=${message.appUrl}`;
    } else if (message?.message === "Item does not exist or is inaccessible.") {
      document.body.classList.add("app-error");
      root.innerHTML = `<p>${message?.message}</p>`;
    }
  };
}
