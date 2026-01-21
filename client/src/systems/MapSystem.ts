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
  private onMapClick: ((lat: number, lng: number) => void) | null = null;

  constructor(elementId: string, onMapClick?: (lat: number, lng: number) => void) {
    console.log(`MapSystem: Initializing with ID #${elementId}`);
    this.onMapClick = onMapClick || null;
    // Wait for DOM to be ready
    setTimeout(() => this.initMap(elementId), 100);
  }

  /**
   * Initialize Leaflet map
   */
  private initMap(elementId: string): void {
    // ... (Existing checks)

    try {
        console.log('MapSystem: Creating Leaflet instance...');
        // Default view (Hanoi)
        this.map = L.map(elementId, {
          zoomControl: false,
          attributionControl: false,
        }).setView([21.0285, 105.8542], 16);
    
        // Dark Theme Map (CartoDB Dark Matter)
        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
          maxZoom: 20,
          subdomains: 'abcd'
        }).addTo(this.map);
        
        // Click Event for Auto-Pathing
        this.map.on('click', (e: L.LeafletMouseEvent) => {
            if (this.onMapClick) {
                this.onMapClick(e.latlng.lat, e.latlng.lng);
            }
        });
    
        console.log('MapSystem: Map created successfully.');

        // Force resize loop to ensure visibility
        const resizeInterval = setInterval(() => {
            if (this.map) {
                this.map.invalidateSize();
                console.log('MapSystem: invalidateSize called');
            } else {
                clearInterval(resizeInterval);
            }
        }, 500);

        // Stop checking after 5 seconds
        setTimeout(() => clearInterval(resizeInterval), 5000);
    
        this.injectStyles();
    } catch (e) {
        console.error("Map Init Error:", e);
    }
  }

  /**
   * Destroy map instance
   */
  destroy(): void {
    if (this.map) {
      console.log('MapSystem: Destroying map');
      this.map.remove();
      this.map = null;
    }
  }

  /**
   * Update current player position
   */
  updatePlayerPosition(position: GPSPosition, avatarUrl?: string): void {
    if (!this.map) return;

    const latLng = new L.LatLng(position.lat, position.lng);

    if (!this.playerMarker) {
      // Create player marker
      const playerIcon = L.divIcon({
        className: 'player-marker-icon',
        html: `<div class="pulse"></div><div class="dot" style="${avatarUrl ? `background-image: url('${avatarUrl}')` : ''}"></div>`,
        iconSize: [20, 20],
        iconAnchor: [10, 10],
      });

      this.playerMarker = L.marker(latLng, { icon: playerIcon }).addTo(this.map);
      // ...
    } else {
      this.playerMarker.setLatLng(latLng);
      this.userCircle?.setLatLng(latLng);
      
      // Update avatar if changed
      if (avatarUrl) {
          const el = this.playerMarker.getElement();
          const dot = el?.querySelector('.dot') as HTMLElement;
          if (dot) dot.style.backgroundImage = `url('${avatarUrl}')`;
      }
      
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
    // Only inject if not exists
    if (document.getElementById('map-styles')) return;

    const style = document.createElement('style');
    style.id = 'map-styles';
    style.textContent = `
      /* Map Filter for Mystic Look */
      .leaflet-tile-pane {
        filter: contrast(1.1) sepia(0.2) saturate(0.8);
      }
      
      .player-marker-icon .dot {
        width: 32px;
        height: 32px;
        background-color: transparent;
        border: 2px solid #2DD4BF;
        box-shadow: 0 0 10px #2DD4BF, inset 0 0 10px #2DD4BF;
        border-radius: 50%;
        position: absolute;
        top: -6px;
        left: -6px;
        z-index: 2;
        /* Image will be injected via JS if avatar exists */
        background-size: cover;
        background-position: center;
      }
      .player-marker-icon .pulse {
        width: 60px;
        height: 60px;
        background-color: rgba(45, 212, 191, 0.2);
        border: 1px solid rgba(45, 212, 191, 0.5);
        border-radius: 50%;
        position: absolute;
        top: -20px;
        left: -20px;
        animation: pulse 3s infinite;
      }
      @keyframes pulse {
        0% { transform: scale(0.8); opacity: 0.8; box-shadow: 0 0 0 0 rgba(45, 212, 191, 0.4); }
        70% { transform: scale(1.2); opacity: 0; box-shadow: 0 0 20px 20px rgba(45, 212, 191, 0); }
        100% { transform: scale(0.8); opacity: 0; }
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
      /* Hide Leaflet Controls to use our HUD */
      .leaflet-control-container { display: none; }
    `;
    document.head.appendChild(style);
  }
}
