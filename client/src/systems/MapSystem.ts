import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { GPSPosition, PlayerMapData, SpiritHerb, LinhCan, ItemRarity } from '@urban-xianxia/shared';

// Fix Leaflet default icon issue
const defaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

L.Marker.prototype.options.icon = defaultIcon;

export class MapSystem {
  private map: L.Map | null = null;
  private playerMarker: L.Marker | null = null;
  private otherPlayerMarkers: Map<string, L.Marker> = new Map();
  private herbMarkers: Map<string, L.Marker> = new Map();
  private userCircle: L.Circle | null = null;

  // Callbacks
  private onHerbClick: ((herb: SpiritHerb) => void) | null = null;

  constructor(elementId: string) {
    // Wait for DOM to be ready
    setTimeout(() => this.initMap(elementId), 100);
  }

  /**
   * Initialize Leaflet map
   */
  private initMap(elementId: string): void {
    const element = document.getElementById(elementId);
    if (!element) {
      console.error(`Map container #${elementId} not found`);
      return;
    }

    // Default view (will be updated by GPS)
    this.map = L.map(elementId, {
      zoomControl: false,
      attributionControl: false,
    }).setView([21.0285, 105.8542], 16); // Hanoi default

    // Dark mode map tiles (Stadia Maps or CartoDB Dark Matter are good for gaming look,
    // but we use OpenStreetMap standard for guaranteed free access, maybe styled with CSS later)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
    }).addTo(this.map);

    // Add custom styles for map markers via CSS if needed
    this.injectStyles();
  }

  /**
   * Update current player position
   */
  updatePlayerPosition(position: GPSPosition): void {
    if (!this.map) return;

    const latLng = new L.LatLng(position.lat, position.lng);

    if (!this.playerMarker) {
      // Create player marker (Blue dot with pulse)
      const playerIcon = L.divIcon({
        className: 'player-marker-icon',
        html: '<div class="pulse"></div><div class="dot"></div>',
        iconSize: [20, 20],
        iconAnchor: [10, 10],
      });

      this.playerMarker = L.marker(latLng, { icon: playerIcon }).addTo(this.map);

      // Add detection radius circle (50m)
      this.userCircle = L.circle(latLng, {
        radius: 50,
        color: '#4a90e2',
        fillColor: '#4a90e2',
        fillOpacity: 0.1,
        weight: 1,
      }).addTo(this.map);

      this.map.setView(latLng, 17); // Zoom in on first locate
    } else {
      this.playerMarker.setLatLng(latLng);
      this.userCircle?.setLatLng(latLng);
      // Smooth pan to new location
      this.map.panTo(latLng);
    }
  }

  /**
   * Update other players on map
   */
  updateOtherPlayers(players: PlayerMapData[]): void {
    if (!this.map) return;

    // Track active IDs to remove disconnected players
    const activeIds = new Set<string>();

    players.forEach((player) => {
      activeIds.add(player.id);
      const latLng = new L.LatLng(player.lat, player.lng);

      if (this.otherPlayerMarkers.has(player.id)) {
        // Update existing marker
        const marker = this.otherPlayerMarkers.get(player.id)!;
        marker.setLatLng(latLng);
      } else {
        // Create new marker based on Linh Căn color
        const color = this.getLinhCanColor(player.linhCan);
        const icon = L.divIcon({
          className: 'other-player-icon',
          html: `<div class="player-dot" style="background-color: ${color}"></div><div class="player-name">${player.name}</div>`,
          iconSize: [40, 40],
          iconAnchor: [20, 35],
        });

        const marker = L.marker(latLng, { icon }).addTo(this.map!);
        marker.bindPopup(`<b>${player.name}</b><br>${player.level}`);
        this.otherPlayerMarkers.set(player.id, marker);
      }
    });

    // Remove markers for players who left
    for (const [id, marker] of this.otherPlayerMarkers.entries()) {
      if (!activeIds.has(id)) {
        marker.remove();
        this.otherPlayerMarkers.delete(id);
      }
    }
  }

  /**
   * Render Spirit Herbs (Linh Thảo) on map
   */
  renderSpiritHerbs(herbs: SpiritHerb[], onHerbClick: (herb: SpiritHerb) => void): void {
    if (!this.map) return;
    this.onHerbClick = onHerbClick;

    // Clear old markers that are not in the new list?
    // For simplicity, we'll clear all and redraw or update.
    // A better approach is diffing, similar to players.

    // Simple implementation: clear all and redraw
    this.herbMarkers.forEach((marker) => marker.remove());
    this.herbMarkers.clear();

    herbs.forEach((herb) => {
      const latLng = new L.LatLng(herb.lat, herb.lng);

      const icon = L.divIcon({
        className: 'herb-marker',
        html: `<div class="herb-icon ${herb.rarity}">🌿</div>`,
        iconSize: [30, 30],
        iconAnchor: [15, 15],
      });

      const marker = L.marker(latLng, { icon }).addTo(this.map!);

      // Click handler for AR mode
      marker.on('click', () => {
        if (this.onHerbClick) {
          this.onHerbClick(herb);
        }
      });

      this.herbMarkers.set(herb.id, marker);
    });
  }

  /**
   * Get hex color for Linh Căn
   */
  private getLinhCanColor(linhCan: LinhCan): string {
    switch (linhCan) {
      case LinhCan.KIM:
        return '#FFD700'; // Gold
      case LinhCan.MOC:
        return '#228B22'; // Green
      case LinhCan.THUY:
        return '#1E90FF'; // Blue
      case LinhCan.HOA:
        return '#FF4500'; // Red
      case LinhCan.THO:
        return '#8B4513'; // Brown
      default:
        return '#999999';
    }
  }

  private injectStyles(): void {
    const style = document.createElement('style');
    style.textContent = `
      .player-marker-icon .dot {
        width: 12px;
        height: 12px;
        background-color: #4a90e2;
        border: 2px solid white;
        border-radius: 50%;
        position: absolute;
        top: 4px;
        left: 4px;
        z-index: 2;
      }
      .player-marker-icon .pulse {
        width: 20px;
        height: 20px;
        background-color: rgba(74, 144, 226, 0.5);
        border-radius: 50%;
        position: absolute;
        top: 0;
        left: 0;
        animation: pulse 2s infinite;
      }
      @keyframes pulse {
        0% { transform: scale(1); opacity: 0.8; }
        100% { transform: scale(3); opacity: 0; }
      }
      .other-player-icon .player-dot {
        width: 10px;
        height: 10px;
        border-radius: 50%;
        border: 1px solid white;
        margin: 0 auto;
      }
      .other-player-icon .player-name {
        font-size: 10px;
        color: white;
        text-shadow: 1px 1px 2px black;
        text-align: center;
        margin-top: 2px;
        background: rgba(0,0,0,0.5);
        border-radius: 4px;
        padding: 1px 3px;
      }
      .herb-marker .herb-icon {
        font-size: 20px;
        text-align: center;
        filter: drop-shadow(0 0 5px gold);
        animation: float 3s ease-in-out infinite;
      }
      .herb-marker .herb-icon.rare { filter: drop-shadow(0 0 8px purple); }
      .herb-marker .herb-icon.legendary { filter: drop-shadow(0 0 10px orange); }
      
      @keyframes float {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-5px); }
      }
    `;
    document.head.appendChild(style);
  }
}
