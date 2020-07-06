define(["require", "exports", "tslib", "dojo/i18n!./nls/resources", "esri/core/accessorSupport/decorators", "esri/widgets/Widget", "esri/widgets/support/widget", "esri/intl"], function (require, exports, tslib_1, i18n, decorators_1, Widget_1, widget_1, intl_1) {
    "use strict";
    Widget_1 = tslib_1.__importDefault(Widget_1);
    // ----------------------------------
    //
    //  CSS Classes
    //
    // ----------------------------------
    var CSS = {
        base: "esri-config-panel-unsupported-browser",
        browserIconContainer: "esri-config-panel-unsupported-browser__browser-icon-container",
        browserIcon: "esri-config-panel-unsupported-browser__browser-icon",
        messageContainer: "esri-config-panel-unsupported-browser__message-container",
        jsGlobalNav: "js-global-nav",
        globalNav: "global-nav"
    };
    var UnsupportedBrowser = /** @class */ (function (_super) {
        tslib_1.__extends(UnsupportedBrowser, _super);
        function UnsupportedBrowser(params) {
            var _this = _super.call(this, params) || this;
            _this._downloadUrls = {
                chrome: "https://www.google.com/chrome/",
                firefox: "https://www.mozilla.org/firefox/new/",
                edge: "https://www.microsoft.com/edge",
                safari: "https://support.apple.com/downloads/safari",
                catsGeoNetLink: "https://community.esri.com/groups/cats",
                edgelegacy: "https://support.microsoft.com/en-us/help/4533505/what-is-microsoft-edge-legacy"
            };
            _this.isIE = false;
            return _this;
        }
        UnsupportedBrowser.prototype.render = function () {
            var message = !this.isIE ? i18n.message : i18n.ie11Message;
            return (widget_1.tsx("div", null,
                widget_1.tsx("div", { class: CSS.messageContainer },
                    widget_1.tsx("h2", null, i18n.title),
                    widget_1.tsx("div", { innerHTML: intl_1.substitute(message, this._downloadUrls) }),
                    widget_1.tsx("div", { class: CSS.browserIconContainer },
                        widget_1.tsx("img", { class: CSS.browserIcon, src: "Components/Unsupported/icons/chrome.jpg", alt: "Google Chrome Icon" }),
                        widget_1.tsx("img", { class: CSS.browserIcon, src: "Components/Unsupported/icons/firefox.jpg", alt: "Mozilla Firefox Icon" }),
                        widget_1.tsx("img", { class: CSS.browserIcon, src: "Components/Unsupported/icons/safari.jpg", alt: "Safari Icon" }),
                        !this.isIE ? (widget_1.tsx("img", { class: CSS.browserIcon, src: "Components/Unsupported/icons/new_edge.jpg", alt: "Chromium Edge Icon" })) : null))));
        };
        tslib_1.__decorate([
            decorators_1.property()
        ], UnsupportedBrowser.prototype, "isIE", void 0);
        UnsupportedBrowser = tslib_1.__decorate([
            decorators_1.subclass("UnsupportedBrowser")
        ], UnsupportedBrowser);
        return UnsupportedBrowser;
    }(Widget_1.default));
    return UnsupportedBrowser;
});
//# sourceMappingURL=UnsupportedBrowser.js.map