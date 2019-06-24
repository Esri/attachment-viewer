
// Copyright 2019 Esri
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//   http://www.apache.org/licenses/LICENSE-2.0
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

define(["require", "exports", "dojo/_base/declare"], function (require, exports, declare) {
  "use strict";
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  /**
   * A decorator that converts a TypeScript class into a declare constructor.
   * This allows declare constructors to be defined as classes, which nicely
   * hides away the `declare([], {})` boilerplate.
   */
  function default_1() {
    var mixins = [];
    for (var _i = 0; _i < arguments.length; _i++) {
      mixins[_i] = arguments[_i];
    }
    return function (target) {
      return declare(mixins, target.prototype);
    };
  }
  exports.default = default_1;
});
//# sourceMappingURL=declareDecorator.js.map
