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
    var ORIENTATION_MAP = {
        1: {
            rotate: 0,
            scaleX: 1
        },
        2: {
            rotate: 0,
            scaleX: -1
        },
        3: {
            rotate: 180,
            scaleX: 1
        },
        4: {
            rotate: 180,
            scaleX: -1
        },
        5: {
            rotate: 270,
            scaleX: -1
        },
        6: {
            rotate: 90,
            scaleX: 1
        },
        7: {
            rotate: -270,
            scaleX: -1
        },
        8: {
            rotate: -90,
            scaleX: 1
        }
    };
    function getOrientationStyles(orientationInfo, containerNode) {
        var orientation = ORIENTATION_MAP[orientationInfo.id];
        var width = containerNode && containerNode.offsetWidth && orientationInfo.rotation !== 0
            ? containerNode.offsetWidth / 2 + "px"
            : "initial";
        var height = containerNode &&
            containerNode.offsetHeight &&
            orientationInfo.rotation !== 0
            ? containerNode.offsetHeight + "px"
            : "initial";
        return orientation
            ? {
                transform: "rotate(" + orientationInfo.rotation + "deg) scaleX(" + orientation.scaleX + ")",
                height: width,
                width: height,
                objectFit: "cover",
                maxHeight: "100%"
            }
            : {};
    }
    exports.getOrientationStyles = getOrientationStyles;
    function getOrientationStylesMobile(orientationInfo, containerNode) {
        var userAgent = navigator.userAgent || navigator.vendor;
        var isAndroid = false;
        if (userAgent.match(/Android/i)) {
            isAndroid = true;
        }
        if (isAndroid) {
            var orientation_1 = ORIENTATION_MAP[orientationInfo.id];
            return orientation_1
                ? {
                    transform: "rotate(" + orientationInfo.rotation + "deg) scaleX(" + orientation_1.scaleX + ")"
                }
                : {};
        }
        else {
            return {};
        }
    }
    exports.getOrientationStylesMobile = getOrientationStylesMobile;
});
//# sourceMappingURL=imageUtils.js.map