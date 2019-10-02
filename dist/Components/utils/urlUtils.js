define(["require", "exports", "dojo/i18n!../../nls/common"], function (require, exports, i18n) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    // https://en.wikipedia.org/wiki/Uniform_Resource_Identifier#Examples
    var uriItems = [
        {
            id: "http",
            pattern: /^\s*(https?:\/\/([^\s]+))\s*$/i,
            target: "_blank",
            label: i18n.view
        }
    ];
    function autoLink(value) {
        if (typeof value !== "string" || !value) {
            return value;
        }
        var uriItem = _findURIItem(value);
        if (!uriItem) {
            return value;
        }
        var uriParts = value.match(uriItem.pattern);
        var hierPart = uriParts && uriParts[2];
        var text = replace(uriItem.label, {
            appName: uriItem.appName,
            hierPart: hierPart
        });
        var target = uriItem.target ? "target=\"" + uriItem.target + "\"" : "";
        return value.replace(uriItem.pattern, "<a " + target + "\" href=\"$1\">" + text + "</a>");
    }
    exports.autoLink = autoLink;
    function _findURIItem(value) {
        var uriItem = null;
        uriItems.some(function (item) {
            if (item.pattern.test(value)) {
                uriItem = item;
            }
            return !!uriItem;
        });
        return uriItem;
    }
    var TEMPLATE_REGEX = /\{([^\}]+)\}/g;
    function replace(template, map) {
        return template.replace(TEMPLATE_REGEX, typeof map === "object" ? function (_, k) { return getDeepValue(k, map); } : function (_, k) { return map(k); });
    }
    exports.replace = replace;
    function getDeepValue(property, target) {
        if (target == null) {
            return undefined;
        }
        return target[property] || getProperty(property.split("."), false, target);
    }
    function getProperty(parts, createIfNotExist, target) {
        var current = target;
        for (var _i = 0, parts_1 = parts; _i < parts_1.length; _i++) {
            var part = parts_1[_i];
            if (current == null) {
                return undefined;
            }
            if (!(part in current)) {
                if (createIfNotExist) {
                    current[part] = {};
                }
                else {
                    return;
                }
            }
            current = current[part];
        }
        return current;
    }
});
//# sourceMappingURL=urlUtils.js.map