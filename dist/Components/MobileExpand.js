/// <amd-dependency path="esri/core/tsSupport/declareExtendsHelper" name="__extends" />
/// <amd-dependency path="esri/core/tsSupport/decorateHelper" name="__decorate" />
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
define(["require", "exports", "esri/core/tsSupport/declareExtendsHelper", "esri/core/tsSupport/decorateHelper", "dojo/i18n!../nls/common", "esri/core/accessorSupport/decorators", "esri/widgets/Widget", "esri/widgets/Expand/ExpandViewModel", "esri/widgets/support/widget", "./MobileExpand/support/widgetSupport"], function (require, exports, __extends, __decorate, i18n, decorators_1, Widget, ExpandViewModel, widget_1, widgetSupport_1) {
    "use strict";
    // type ContentSource = string | HTMLElement | Widget | _WidgetBase;
    var CSS = {
        base: "esri-expand esri-widget esri-mobile-expand",
        modeAuto: "esri-expand--auto",
        modeDrawer: "esri-expand--drawer",
        modeFloating: "esri-expand--floating",
        container: "esri-expand__container",
        containerExpanded: "esri-expand__container--expanded",
        panel: "esri-expand__panel",
        button: "esri-widget--button",
        text: "esri-icon-font-fallback-text",
        icon: "esri-collapse__icon",
        iconExpanded: "esri-expand__icon--expanded",
        iconNumber: "esri-expand__icon-number",
        iconNumberExpanded: "esri-expand__icon-number--expanded",
        expandIcon: "icon-ui-grid",
        collapseIcon: "esri-icon-collapse",
        content: "esri-expand__content",
        contentExpanded: "esri-expand__content--expanded",
        expandMask: "esri-expand__mask",
        expandMaskExpanded: "esri-expand__mask--expanded",
        // CUSTOM
        mobileExpandContent: "esri-mobile-expand__content",
        collapseButton: "esri-mobile-expand__collapse-button",
        expandCollapseIcon: "esri-mobile-expand__expand-collapse-icon icon-ui-flush",
        mobileExpandComponent: "esri-mobile-expand__component"
    };
    var Expand = /** @class */ (function (_super) {
        __extends(Expand, _super);
        //--------------------------------------------------------------------------
        //
        //  Lifecycle
        //
        //--------------------------------------------------------------------------
        /**
         * @constructor
         * @alias module:esri/widgets/Expand
         * @extends module:esri/widgets/Widget
         * @param {Object} [properties] - See the [properties](#properties-summary) for a list of all the properties
         *                                that may be passed into the constructor.
         */
        function Expand(params) {
            var _this = _super.call(this) || this;
            //--------------------------------------------------------------------------
            //
            //  Properties
            //
            //--------------------------------------------------------------------------
            //----------------------------------
            //  autoCollapse
            //----------------------------------
            /**
             * Automatically collapses the expand widget instance when the view's
             * {@link module:esri/views/View#viewpoint viewpoint} updates.
             *
             * @name autoCollapse
             * @instance
             * @type {boolean}
             * @default false
             */
            _this.autoCollapse = null;
            //----------------------------------
            //  collapseIconClass
            //----------------------------------
            /**
             * Icon font used to style the Expand button.
             *
             * @see [Guide - Esri Icon Font](../guide/esri-icon-font/index.html)
             *
             * @since 4.4
             * @name collapseIconClass
             * @instance
             * @type {string}
             */
            // @property({
            //   dependsOn: ["content"]
            // })
            // @renderable()
            // get collapseIconClass(): string {
            //   return CSS.collapseIcon;
            // }
            // set collapseIconClass(value: string) {
            //   if (!value) {
            //     this._clearOverride("collapseIconClass");
            //     return;
            //   }
            //   this._override("collapseIconClass", value);
            // }
            //----------------------------------
            //  collapseTooltip
            //----------------------------------
            /**
             * Tooltip to display to indicate Expand widget can be collapsed.
             *
             * @name collapseTooltip
             * @instance
             * @type {string}
             * @default "Collapse" (English locale)
             */
            _this.collapseTooltip = "";
            //----------------------------------
            //  content
            //----------------------------------
            /**
             * The content to display within the expanded Expand widget.
             *
             * @example
             * // A. specify content with a widget
             *    var searchWidget = new Search({
             *      view: view
             *    });
             *
             *    var expand = new Expand({
             *      expandIconClass: "esri-icon-search",
             *      view: view,
             *      content: searchWidget
             *    });
             *    view.ui.add(expand, "bottom-left");
             *
             * @example
             * // B. specify content with a string (of HTML)
             *    content: "Hi, I can have <input placeholder='HTML'/>!"
             *
             * @example
             * // C. specify content with a DOM node
             *    var node = domConstruct.create("div", {
             *      innerHTML: "I'm a real node!"
             *    });
             *
             *    var expand = new Expand({
             *      expandIconClass: "esri-icon-right-arrow",
             *      view: view,
             *      content: node
             *    });
             *    view.ui.add(expand, "top-right");
             *
             * @example
             * // D. specify content with a Dijit
             *    var button = new Button({  // "dijit/form/Button"
             *      label: "I'm a dijit!"
             *    });
             *    button.startup();
             *
             *    var expand = new Expand({
             *      expandIconClass: "esri-icon-right-arrow",
             *      expanded: true,
             *      view: view,
             *      content: button
             *    });
             *    view.ui.add(expand, "top-left");
             *
             * @name content
             * @instance
             * @type {Node | string | module:esri/widgets/Widget}
             */
            _this.content = [];
            //----------------------------------
            //  expanded
            //----------------------------------
            /**
             * Indicates whether the widget is currently expanded or not.
             *
             * @name expanded
             * @instance
             * @type {boolean}
             * @default false
             */
            _this.expanded = null;
            //----------------------------------
            //  expandIconClass
            //----------------------------------
            /**
             * Icon font used to style the Expand button.
             * Will automatically use the [content's](#content) iconClass if it has one.
             *
             * @see [Guide - Esri Icon Font](../guide/esri-icon-font/index.html)
             *
             * @name expandIconClass
             * @instance
             * @type {string}
             */
            // @property({
            //   dependsOn: ["content"]
            // })
            // @renderable()
            // get expandIconClass(): string {
            //   return isWidget(this.content) ? this.content.iconClass : CSS.expandIcon;
            // }
            // set expandIconClass(value: string) {
            //   if (!value) {
            //     this._clearOverride("expandIconClass");
            //     return;
            //   }
            //   this._override("expandIconClass", value);
            // }
            //----------------------------------
            //  expandTooltip
            //----------------------------------
            /**
             * Tooltip to display to indicate Expand widget can be expanded.
             *
             * @name expandTooltip
             * @instance
             * @type {string}
             * @default "Expand" (English locale)
             */
            _this.expandTooltip = "";
            _this.expandIconClass = null;
            _this.collapseIconClass = null;
            //----------------------------------
            //  group
            //----------------------------------
            /**
             * This value associates two or more Expand widget instances with each other, allowing one
             * instance to auto collapse when another instance in the same group is expanded. For auto collapsing
             * to take effect, all instances of the group must be included in the {@link module:esri/views/View#ui view.ui}.
             *
             * For example, if you place multiple Expand instances in the top-left of the view's ui, you can assign them to a
             * group called `top-left`. If one Expand instance is expanded and the user clicks on a different instance in the
             * `top-left` group, then the first instance is collapsed, allowing the content of the second instance to be
             * fully visible.
             *
             * @name group
             * @instance
             * @since 4.6
             * @type {string}
             *
             * @example
             * var expand1 = new Expand({
             *   view: view,
             *   content: document.getElementById("bg-gallery"),
             *   expandIconClass: "esri-icon-basemap",
             *   group: "bottom-right"
             * });
             * var expand2 = new Expand({
             *   view: view,
             *   content: document.getElementById("legend"),
             *   expandIconClass: "esri-icon-key",
             *   group: "bottom-right"
             * });
             *
             * view.ui.add([expand1, expand2], "bottom-right");
             */
            _this.group = null;
            //----------------------------------
            //  iconNumber
            //----------------------------------
            /**
             * A number to display at the corner of the widget to indicate the number of, for example, open issues or unread notices.
             *
             * ![expand widget icon number](../../assets/img/apiref/widgets/expand-with-iconnumber.png)
             *
             * @name iconNumber
             * @instance
             * @type {number}
             */
            _this.iconNumber = 0;
            //----------------------------------
            //  mode
            //----------------------------------
            /**
             * The mode in which the widget displays. These modes are listed below.
             *
             * mode | description
             * ---------------|------------
             * auto | This is the default mode. It is responsive to browser size changes and will update based on whether the widget is viewed in a desktop or mobile application.
             * floating | Use this mode if you wish to always display the widget as floating regardless of browser size.
             * drawer | Use this mode if you wish to always display the widget in a panel regardless of browser size.
             *
             * @name mode
             * @instance
             * @since 4.7
             * @default "auto"
             * @type {string}
             */
            _this.mode = "auto";
            //----------------------------------
            //  view
            //----------------------------------
            /**
             * A reference to the {@link module:esri/views/MapView} or {@link module:esri/views/SceneView}. Set this to link the widget to a specific view.
             *
             * @name view
             * @instance
             * @type {(module:esri/views/MapView | module:esri/views/SceneView)}
             */
            _this.view = null;
            //----------------------------------
            //  viewModel
            //----------------------------------
            /**
             * The view model for this widget. This is a class that contains all the logic
             * (properties and methods) that controls this widget's behavior. See the
             * {@link module:esri/widgets/Expand/ExpandViewModel} class to access
             * all properties and methods on the widget.
             *
             * @name viewModel
             * @instance
             * @type {module:esri/widgets/Expand/ExpandViewModel}
             * @autocast
             */
            _this.viewModel = new ExpandViewModel();
            return _this;
        }
        //--------------------------------------------------------------------------
        //
        //  Public Methods
        //
        //--------------------------------------------------------------------------
        /**
         * Expand the widget.
         *
         * @method
         */
        Expand.prototype.expand = function () {
            this.viewModel.expanded = true;
        };
        /**
         * Collapse the widget.
         *
         * @method
         */
        Expand.prototype.collapse = function () {
            this.viewModel.expanded = false;
        };
        /**
         * Toggle the widget by expanding it if it's collapsed, or collapsing it if it's expanded.
         *
         * @method
         */
        Expand.prototype.toggle = function () {
            this.viewModel.expanded = !this.viewModel.expanded;
        };
        Expand.prototype.render = function () {
            var _a, _b, _c, _d, _e;
            var expanded = this.viewModel.expanded;
            var mode = this.mode;
            var expandTooltip = this.expandTooltip || i18n.expand;
            var collapseTooltip = this.collapseTooltip || i18n.collapse;
            var title = expanded ? collapseTooltip : expandTooltip;
            var collapseIconClass = this.collapseIconClass;
            var expandIconClass = this.expandIconClass;
            var expandIconClasses = (_a = {},
                _a[CSS.iconExpanded] = expanded,
                _a[collapseIconClass] = expanded,
                _a[expandIconClass] = !expanded,
                _a);
            var containerExpanded = (_b = {},
                _b[CSS.containerExpanded] = expanded,
                _b);
            var contentClasses = (_c = {},
                _c[CSS.contentExpanded] = expanded,
                _c);
            var maskClasses = (_d = {},
                _d[CSS.expandMaskExpanded] = expanded,
                _d);
            var iconNumber = this.iconNumber;
            var badgeNumberNode = iconNumber && !expanded ? (widget_1.tsx("span", { key: "expand__icon-number", class: CSS.iconNumber }, iconNumber)) : null;
            var expandedBadgeNumberNode = iconNumber && expanded ? (widget_1.tsx("span", { key: "expand__expand-icon-number", class: this.classes(CSS.iconNumber, CSS.iconNumberExpanded) }, iconNumber)) : null;
            var baseClasses = (_e = {},
                _e[CSS.modeAuto] = mode === "auto",
                _e[CSS.modeDrawer] = mode === "drawer",
                _e[CSS.modeFloating] = mode === "floating",
                _e);
            var content = this._renderContent();
            return (widget_1.tsx("div", { class: this.classes(CSS.base, baseClasses) },
                widget_1.tsx("div", { bind: this, onclick: this._toggle, class: this.classes(CSS.expandMask, maskClasses) }),
                widget_1.tsx("div", { class: this.classes(CSS.container, containerExpanded) },
                    widget_1.tsx("div", { class: CSS.panel },
                        !expanded ? (widget_1.tsx("div", { bind: this, onclick: this._toggle, onkeydown: this._toggle, "aria-label": title, title: title, role: "button", tabindex: "0", class: CSS.button },
                            badgeNumberNode,
                            widget_1.tsx("svg", { class: CSS.expandCollapseIcon, xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 16 16" },
                                widget_1.tsx("path", { d: "M7.5 6.786l4.5-4.5V3.7L7.5 8.2 3 3.7V2.286zM3 8.286V9.7l4.5 4.5L12 9.7V8.286l-4.5 4.5z" })),
                            widget_1.tsx("span", { class: CSS.text }, title))) : null,
                        expandedBadgeNumberNode),
                    widget_1.tsx("div", { class: this.classes(CSS.content, CSS.mobileExpandContent, contentClasses), bind: this }, content))));
        };
        //--------------------------------------------------------------------------
        //
        //  Private Methods
        //
        //--------------------------------------------------------------------------
        Expand.prototype._toggle = function () {
            this.toggle();
        };
        Expand.prototype._renderContent = function () {
            var _a, _b;
            var components = this.content.map(function (component) {
                if (widgetSupport_1.isWidget(component)) {
                    return (widget_1.tsx("div", { class: CSS.mobileExpandComponent }, component.render()));
                }
                return null;
            });
            var expanded = this.viewModel.expanded;
            var expandTooltip = this.expandTooltip || i18n.expand;
            var collapseTooltip = this.collapseTooltip || i18n.collapse;
            var title = expanded ? collapseTooltip : expandTooltip;
            var collapseIconClass = this.collapseIconClass;
            var expandIconClass = this.expandIconClass;
            var expandIconClasses = (_a = {},
                _a[CSS.iconExpanded] = expanded,
                _a[collapseIconClass] = expanded,
                _a[expandIconClass] = !expanded,
                _a);
            var iconNumber = this.iconNumber;
            var badgeNumberNode = iconNumber && !expanded ? (widget_1.tsx("span", { key: "expand__icon-number", class: CSS.iconNumber }, iconNumber)) : null;
            var expandedBadgeNumberNode = iconNumber && expanded ? (widget_1.tsx("span", { key: "expand__expand-icon-number", class: this.classes(CSS.iconNumber, CSS.iconNumberExpanded) }, iconNumber)) : null;
            var collapseButton = (_b = {},
                _b[CSS.collapseButton] = expanded,
                _b);
            return (widget_1.tsx("div", null,
                widget_1.tsx("div", { class: this.classes(CSS.panel, collapseButton) },
                    widget_1.tsx("div", { bind: this, onclick: this._toggle, onkeydown: this._toggle, "aria-label": title, title: title, role: "button", tabindex: "0", class: CSS.button },
                        badgeNumberNode,
                        widget_1.tsx("svg", { class: CSS.expandCollapseIcon, xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 16 16" },
                            widget_1.tsx("path", { d: "M3 13.714V12.3l4.5-4.5 4.5 4.5v1.414l-4.5-4.5zm4.5-10.5l4.5 4.5V6.3L7.5 1.8 3 6.3v1.414z" })),
                        widget_1.tsx("span", { class: CSS.text }, title)),
                    expandedBadgeNumberNode),
                components));
        };
        Expand.prototype._attachToNode = function (node) {
            var content = this;
            node.appendChild(content);
        };
        __decorate([
            decorators_1.aliasOf("viewModel.autoCollapse")
        ], Expand.prototype, "autoCollapse", void 0);
        __decorate([
            decorators_1.property(),
            widget_1.renderable()
        ], Expand.prototype, "collapseTooltip", void 0);
        __decorate([
            decorators_1.property(),
            widget_1.renderable()
        ], Expand.prototype, "content", void 0);
        __decorate([
            decorators_1.aliasOf("viewModel.expanded"),
            widget_1.renderable()
        ], Expand.prototype, "expanded", void 0);
        __decorate([
            decorators_1.property(),
            widget_1.renderable()
        ], Expand.prototype, "expandTooltip", void 0);
        __decorate([
            decorators_1.property(),
            widget_1.renderable()
        ], Expand.prototype, "expandIconClass", void 0);
        __decorate([
            decorators_1.property(),
            widget_1.renderable()
        ], Expand.prototype, "collapseIconClass", void 0);
        __decorate([
            decorators_1.aliasOf("viewModel.group")
        ], Expand.prototype, "group", void 0);
        __decorate([
            decorators_1.property(),
            widget_1.renderable()
        ], Expand.prototype, "iconNumber", void 0);
        __decorate([
            decorators_1.property(),
            widget_1.renderable()
        ], Expand.prototype, "mode", void 0);
        __decorate([
            decorators_1.aliasOf("viewModel.view"),
            widget_1.renderable()
        ], Expand.prototype, "view", void 0);
        __decorate([
            decorators_1.property({
                type: ExpandViewModel
            }),
            widget_1.renderable("viewModel.state")
        ], Expand.prototype, "viewModel", void 0);
        __decorate([
            widget_1.accessibleHandler()
        ], Expand.prototype, "_toggle", null);
        Expand = __decorate([
            decorators_1.subclass("esri.widgets.Expand")
        ], Expand);
        return Expand;
    }(decorators_1.declared(Widget)));
    return Expand;
});
//# sourceMappingURL=MobileExpand.js.map