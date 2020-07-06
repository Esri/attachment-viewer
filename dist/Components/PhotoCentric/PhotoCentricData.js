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
define(["require", "exports", "tslib", "esri/core/accessorSupport/decorators", "esri/core/Collection", "../AttachmentViewer/AttachmentViewerData"], function (require, exports, tslib_1, decorators_1, Collection, AttachmentViewerData) {
    "use strict";
    var PhotoCentricData = /** @class */ (function (_super) {
        tslib_1.__extends(PhotoCentricData, _super);
        function PhotoCentricData() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            // queryRange
            _this.queryRange = [0, 10];
            // layerFeatures
            _this.layerFeatures = new Collection();
            return _this;
        }
        tslib_1.__decorate([
            decorators_1.property()
        ], PhotoCentricData.prototype, "layerFeatures", void 0);
        PhotoCentricData = tslib_1.__decorate([
            decorators_1.subclass("PhotoCentricData")
        ], PhotoCentricData);
        return PhotoCentricData;
    }(AttachmentViewerData));
    return PhotoCentricData;
});
//# sourceMappingURL=PhotoCentricData.js.map