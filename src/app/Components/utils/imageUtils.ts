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

const ORIENTATION_MAP = {
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

export function getOrientationStylesImageThumbnail(
  orientationInfo: any
): {
  transform?: string;
  height?: string;
  width?: string;
  objectFit?: string;
  maxHeight?: string;
} {
  const orientation = ORIENTATION_MAP[orientationInfo.id];
  return orientation
    ? {
        transform: `rotate(${orientationInfo.rotation}deg) scale(1.5)`
      }
    : {};
}

export function getOrientationStyles(
  orientationInfo: any,
  containerNode?: HTMLElement,
  appMode?: string
): {
  transform?: string;
  height?: string;
  width?: string;
  objectFit?: string;
  maxHeight?: string;
} {
  const orientation = ORIENTATION_MAP[orientationInfo.id];
  const width =
    containerNode &&
    containerNode.offsetWidth &&
    orientationInfo.rotation !== 0 &&
    appMode !== "map-centric"
      ? `${containerNode.offsetWidth / 2}px`
      : "";
  const height =
    containerNode &&
    containerNode.offsetHeight &&
    orientationInfo.rotation !== 0 &&
    appMode !== "map-centric"
      ? `${containerNode.offsetHeight}px`
      : "";

  return orientation
    ? {
        transform: `rotate(${orientationInfo.rotation}deg) scaleX(${orientation.scaleX})`,
        height: width,
        width: height,
        maxHeight: "100%"
      }
    : {};
}

export function getOrientationStylesMobile(
  orientationInfo: any,
  containerNode?: HTMLElement
): {
  transform?: string;
  height?: string;
  width?: string;
  objectFit?: string;
  maxHeight?: string;
} {
  const userAgent = navigator.userAgent || navigator.vendor;

  let isAndroid = false;

  if (userAgent.match(/Android/i)) {
    isAndroid = true;
  }
  if (isAndroid) {
    const orientation = ORIENTATION_MAP[orientationInfo.id];
    return orientation
      ? {
          transform: `rotate(${orientationInfo.rotation}deg) scaleX(${orientation.scaleX})`
        }
      : {};
  } else {
    return {};
  }
}
