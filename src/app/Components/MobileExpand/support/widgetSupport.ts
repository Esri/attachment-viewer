import _WidgetBase = require("dijit/_WidgetBase");
import Widget = require("esri/widgets/Widget");

export function isWidget(value: any): value is Widget {
  // duck-type check
  return value && typeof value.render === "function";
}

export function isWidgetBase(value: any): value is _WidgetBase {
  // duck-type check
  return (
    value &&
    typeof value.postMixInProperties === "function" &&
    typeof value.buildRendering === "function" &&
    typeof value.postCreate === "function" &&
    typeof value.startup === "function"
  );
}
