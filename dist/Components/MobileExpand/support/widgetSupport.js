/*
  Copyright 2019 Esri
  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at
    http://www.apache.org/licenses/LICENSE-2.0
  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.​
*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.isWidgetBase = exports.isWidget = void 0;
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