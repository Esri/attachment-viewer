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

export function getOrientationStyles(
  orientationInfo: any,
  containerNode?: HTMLElement
): {
  transform?: string;
  height?: string;
  width?: string;
  objectFit?: string;
  maxHeight?: string;
} {
  const orientation = ORIENTATION_MAP[orientationInfo.id];
  const width =
    containerNode && containerNode.offsetWidth && orientationInfo.rotation !== 0
      ? `${containerNode.offsetWidth / 2}px`
      : "initial";
  const height =
    containerNode &&
    containerNode.offsetHeight &&
    orientationInfo.rotation !== 0
      ? `${containerNode.offsetHeight}px`
      : "initial";
  return orientation
    ? {
        transform: `rotate(${orientationInfo.rotation}deg) scaleX(${
          orientation.scaleX
        })`,
        height: width,
        width: height,
        objectFit: "cover",
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
          transform: `rotate(${orientationInfo.rotation}deg) scaleX(${
            orientation.scaleX
          })`
        }
      : {};
  } else {
    return {};
  }
}
