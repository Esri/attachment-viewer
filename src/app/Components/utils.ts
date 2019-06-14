export function attachToNode(this: HTMLElement, node: HTMLElement): void {
  const content: HTMLElement = this;
  node.appendChild(content);
}
