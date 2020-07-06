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
define(["require", "exports", "tslib", "esri/core/Collection", "esri/core/accessorSupport/decorators", "../AttachmentViewer/AttachmentViewerData"], function (require, exports, tslib_1, Collection, decorators_1, AttachmentViewerData) {
    "use strict";
    var MapCentricData = /** @class */ (function (_super) {
        tslib_1.__extends(MapCentricData, _super);
        function MapCentricData() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            // attachmentDataCollection
            _this.attachmentDataCollection = new Collection();
            // attachmentsHaveMoreThanOne
            _this.attachmentsHaveMoreThanOne = null;
            return _this;
        }
        tslib_1.__decorate([
            decorators_1.property()
        ], MapCentricData.prototype, "attachmentDataCollection", void 0);
        tslib_1.__decorate([
            decorators_1.property()
        ], MapCentricData.prototype, "attachmentsHaveMoreThanOne", void 0);
        MapCentricData = tslib_1.__decorate([
            decorators_1.subclass("MapCentricData")
        ], MapCentricData);
        return MapCentricData;
    }(AttachmentViewerData));
    return MapCentricData;
});
//# sourceMappingURL=MapCentricData.js.map