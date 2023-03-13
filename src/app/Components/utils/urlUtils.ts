type uriItem = {
  appName?: string;
  id: string;
  label: any;
  pattern: RegExp;
  target?: string;
};

// https://en.wikipedia.org/wiki/Uniform_Resource_Identifier#Examples

export function autoLink(value: any, messageBundle): any {
  if (typeof value !== "string" || !value) {
    return value;
  }

  const uriItem = _findURIItem(value, messageBundle);

  if (!uriItem) {
    return value;
  }

  const uriParts = value.match(uriItem.pattern);
  const hierPart = uriParts && uriParts[2];

  const text = replace(uriItem.label, {
    appName: uriItem.appName,
    hierPart
  });

  const target = uriItem.target ? `target="${uriItem.target}"` : "";

  return value.replace(uriItem.pattern, `<a ${target}" href="$1">${text}</a>`);
}

function _findURIItem(value: string, messageBundle): uriItem | null {
  const uriItems: uriItem[] = [
    {
      id: "http",
      pattern: /^\s*(https?:\/\/([^\s]+))\s*$/i,
      target: "_blank",
      label: messageBundle.open
    }
  ];

  let uriItem: uriItem | null = null;

  uriItems.some((item) => {
    if (item.pattern.test(value)) {
      uriItem = item;
    }

    return !!uriItem;
  });

  return uriItem;
}

const TEMPLATE_REGEX = /\{([^\}]+)\}/g;

// Replace
export interface ReplaceCallback {
  (substring: string, ...args: any[]): string;
}

export function replace(template: string, map: object | ReplaceCallback): string {
  return template.replace(TEMPLATE_REGEX, typeof map === "object" ? (_, k) => getDeepValue(k, map) : (_, k) => map(k));
}

function getDeepValue<T = any>(property: string, target: any): any {
  if (target == null) {
    return undefined;
  }

  return target[property] || getProperty<T>(property.split("."), false, target);
}

function getProperty<T>(parts: string[], createIfNotExist: boolean, target: object): T | undefined {
  let current: any = target;

  for (const part of parts) {
    if (current == null) {
      return undefined;
    }

    if (!(part in current)) {
      if (createIfNotExist) {
        current[part] = {};
      } else {
        return;
      }
    }

    current = current[part];
  }

  return current;
}
