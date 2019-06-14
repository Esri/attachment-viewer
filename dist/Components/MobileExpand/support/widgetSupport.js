define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function isWidget(value) {
        // duck-type check
        return value && typeof value.render === "function";
    }
    exports.isWidget = isWidget;
    function isWidgetBase(value) {
        // duck-type check
        return (value &&
            typeof value.postMixInProperties === "function" &&
            typeof value.buildRendering === "function" &&
            typeof value.postCreate === "function" &&
            typeof value.startup === "function");
    }
    exports.isWidgetBase = isWidgetBase;
});
//# sourceMappingURL=widgetSupport.js.map