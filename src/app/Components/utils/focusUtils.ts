export function focusNode(node: HTMLElement): void {
  if (document.activeElement !== node) {
    let limit = 0;
    const focusInterval = setInterval(() => {
      if (node) node.focus();
      if (document.activeElement === node || limit > 500) clearInterval(focusInterval);
      limit++;
    }, 0);
  }
}
