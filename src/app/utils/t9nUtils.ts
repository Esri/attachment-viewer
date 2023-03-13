export function getMessageBundlePath(componentName: string, fileName?: string): string {
  return `${import.meta.env.BASE_URL}assets/t9n/${componentName}/${fileName ? fileName : "resources"}`;
}
