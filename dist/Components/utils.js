define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function attachToNode(node) {
        var content = this;
        node.appendChild(content);
    }
    exports.attachToNode = attachToNode;
});
//# sourceMappingURL=utils.js.map