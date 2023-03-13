export function handleAppFontStyles(customTheme: any): void {
  const id = "applicationFont";
  const existingStylesheet = document.getElementById(id);
  if (!!existingStylesheet) existingStylesheet.remove();
  if (!customTheme?.appFont) return;
  const { appFont } = customTheme;
  const styleSheet = document.createElement("style");
  styleSheet.id = id;
  styleSheet.innerHTML = `
  html,
  body,
  .esri-widget,
  .esri-input,
  instant-apps-social-share {
    --calcite-sans-family: ${appFont} !important;
    font-family: ${appFont} !important;
  }
  `;
  document.head.appendChild(styleSheet);
}
