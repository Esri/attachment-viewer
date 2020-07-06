// Copyright 2019 Esri
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//   http://www.apache.org/licenses/LICENSE-2.0
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.​
define(["require", "exports", "tslib", "esri/core/Accessor", "esri/core/accessorSupport/decorators"], function (require, exports, tslib_1, Accessor, decorators_1) {
    "use strict";
    var LayerData = /** @class */ (function (_super) {
        tslib_1.__extends(LayerData, _super);
        function LayerData() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            // featureLayer
            _this.featureLayer = null;
            // layerView
            _this.layerView = null;
            _this.start = 0;
            return _this;
        }
        tslib_1.__decorate([
            decorators_1.property()
        ], LayerData.prototype, "featureLayer", void 0);
        tslib_1.__decorate([
            decorators_1.property()
        ], LayerData.prototype, "layerView", void 0);
        tslib_1.__decorate([
            decorators_1.property()
        ], LayerData.prototype, "start", void 0);
        LayerData = tslib_1.__decorate([
            decorators_1.subclass("LayerData")
        ], LayerData);
        return LayerData;
    }(Accessor));
    return LayerData;
});
//# sourceMappingURL=AttachmentViewerLayerData.js.map