import { subclass, property } from "@arcgis/core/core/accessorSupport/decorators";
import Widget from "@arcgis/core/widgets/Widget";
import { tsx } from "@arcgis/core/widgets/support/widget";
import Point from "@arcgis/core/geometry/Point";
import { whenTrue } from "@arcgis/core/core/watchUtils";

interface ShareLocationConfig {
  view: __esri.MapView | __esri.SceneView;
}

@subclass("ShareLocation")
class ShareLocation extends Widget {
  @property()
  view: __esri.MapView | __esri.SceneView | null = null;

  @property()
  selectedLocation: Point| null = null;

  @property()
  isSharing: boolean = false;

// ...existing code...
constructor(params: ShareLocationConfig) {
  super(); // Don't pass params to super
  this.view = params.view;
}
// ...existing code...

  postInitialize() {
    whenTrue(this, "view.ready", () => {
      this.setupClickHandler();
    });
  }

private setupClickHandler(): void {
  if (!this.view) return;

  this.view.on("click", (event) => {
    if (!this.view) return; // Add this check
    this.view.hitTest(event).then((response) => {
      if (response.results.length > 0) {
        const result = response.results[0];
        if (
          result.graphic &&
          result.graphic.geometry &&
          result.graphic.geometry.type === "point"
        ) {
          this.selectedLocation = result.graphic.geometry as Point;
          this.isSharing = true;
        }
      }
    });
  });
}

  private formatCoordinates(point: Point): string {
    const lat = point.latitude.toFixed(6);
    const lon = point.longitude.toFixed(6);
    return `${lat},${lon}`;
  }

  private shareViaWhatsApp(): void {
    if (!this.selectedLocation) return;

    const coords = this.formatCoordinates(this.selectedLocation);
    const message = encodeURIComponent(
      `Check out this location: ${coords}\n` +
      `https://www.google.com/maps?q=${coords}`
    );
    
    const whatsappUrl = `https://wa.me/?text=${message}`;
    window.open(whatsappUrl, "_blank");
    this.isSharing = false;
  }

  private shareViaWebShare(): void {
    if (!this.selectedLocation || !navigator.share) {
      this.shareViaWhatsApp();
      return;
    }

    const coords = this.formatCoordinates(this.selectedLocation);
    
    navigator.share({
      title: "Location Share",
      text: `Check out this location: ${coords}`,
      url: `https://www.google.com/maps?q=${coords}`
    })
    .then(() => {
      this.isSharing = false;
    })
    .catch((error) => {
      console.log("Share failed:", error);
      this.shareViaWhatsApp();
    });
  }

  private copyToClipboard(): void {
    if (!this.selectedLocation) return;

    const coords = this.formatCoordinates(this.selectedLocation);
    const text = `Location: ${coords}\nhttps://www.google.com/maps?q=${coords}`;
    
    navigator.clipboard.writeText(text).then(() => {
      alert("Location copied to clipboard!");
      this.isSharing = false;
    }).catch(() => {
      alert("Failed to copy location");
    });
  }

  render() {
    const { isSharing, selectedLocation } = this;

    return (
      <div class="share-location-widget">
        {isSharing && selectedLocation && (
          <div class="share-popup">
            <div class="share-header">
              <h3>שתף מיקום</h3>
              <button 
                class="close-btn"
                onclick={() => { this.isSharing = false; }}
              >
                ×
              </button>
            </div>
            <div class="share-content">
              <div class="share-buttons">
                <button 
                  class="share-btn whatsapp"
                  onclick={() => this.shareViaWebShare()}
                >
                  שתף בעזרת - WhatsApp
                  <svg viewBox="0 0 24 24" width="20" height="20">
                  <path fill="currentColor" d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.03 14.69 2 12.04 2M12.05 3.67C14.25 3.67 16.31 4.53 17.87 6.09C19.42 7.65 20.28 9.72 20.28 11.92C20.28 16.46 16.58 20.15 12.04 20.15C10.56 20.15 9.11 19.76 7.85 19L7.55 18.83L4.43 19.65L5.26 16.61L5.06 16.29C4.24 15 3.8 13.47 3.8 11.91C3.8 7.37 7.5 3.67 12.05 3.67M8.53 7.33C8.37 7.33 8.1 7.39 7.87 7.64C7.65 7.89 7 8.5 7 9.71C7 10.93 7.89 12.1 8 12.27C8.14 12.44 9.76 14.94 12.25 16C12.84 16.27 13.3 16.42 13.66 16.53C14.25 16.72 14.79 16.69 15.22 16.63C15.7 16.56 16.68 16.03 16.89 15.45C17.1 14.87 17.1 14.38 17.04 14.27C16.97 14.17 16.81 14.11 16.56 14C16.31 13.86 15.09 13.26 14.87 13.18C14.64 13.1 14.5 13.06 14.31 13.3C14.15 13.55 13.67 14.11 13.53 14.27C13.38 14.44 13.24 14.46 13 14.34C12.74 14.21 11.94 13.95 11 13.11C10.26 12.45 9.77 11.64 9.62 11.39C9.5 11.15 9.61 11 9.73 10.89C9.84 10.78 10 10.6 10.1 10.45C10.23 10.31 10.27 10.2 10.35 10.04C10.43 9.87 10.39 9.73 10.33 9.61C10.27 9.5 9.77 8.26 9.56 7.77C9.36 7.29 9.16 7.35 9 7.34C8.86 7.34 8.7 7.33 8.53 7.33Z"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
}

export default ShareLocation;