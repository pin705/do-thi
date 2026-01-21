import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { GPSPosition, PlayerMapData, SpiritHerb, LinhCan, ItemRarity, PlayerStatus } from '@urban-xianxia/shared';

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
  private selfId: string | null = null;

  private onHerbClick: ((herb: SpiritHerb) => void) | null = null;
  private onMapClick: ((lat: number, lng: number) => void) | null = null;

  constructor(elementId: string, onMapClick?: (lat: number, lng: number) => void) {
    console.log(`MapSystem: Initializing with ID #${elementId}`);
    this.onMapClick = onMapClick || null;
    setTimeout(() => this.initMap(elementId), 100);
  }

  setSelfId(id: string) {
      this.selfId = id;
  }

  private initMap(elementId: string): void {
    const element = document.getElementById(elementId);
    if (!element) return;

    try {
        this.map = L.map(elementId, {
          zoomControl: false,
          attributionControl: false,
        }).setView([21.0285, 105.8542], 16);
    
        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
          maxZoom: 20,
          subdomains: 'abcd'
        }).addTo(this.map);
        
        this.map.on('click', (e: L.LeafletMouseEvent) => {
            if (this.onMapClick) this.onMapClick(e.latlng.lat, e.latlng.lng);
        });
    
        const resizeInterval = setInterval(() => {
            if (this.map) this.map.invalidateSize();
            else clearInterval(resizeInterval);
        }, 500);
        setTimeout(() => clearInterval(resizeInterval), 5000);
    
        this.injectStyles();
    } catch (e) { console.error("Map Init Error:", e); }
  }

  destroy(): void {
    if (this.map) {
      this.map.remove();
      this.map = null;
    }
  }

  updatePlayerPosition(position: GPSPosition, avatarUrl?: string, name?: string, status?: PlayerStatus): void {
    if (!this.map) return;
    const latLng = new L.LatLng(position.lat, position.lng);

    if (!this.playerMarker) {
      const playerIcon = L.divIcon({
        className: 'player-marker-icon',
        html: `
            <div class="pulse"></div>
            <div class="dot" style="${avatarUrl ? `background-image: url('${avatarUrl}')` : ''}"></div>
            <div class="player-name">${name || 'Đạo Hữu'}</div>
        `,
        iconSize: [20, 20],
        iconAnchor: [10, 10],
      });
      this.playerMarker = L.marker(latLng, { icon: playerIcon }).addTo(this.map);
      
      this.userCircle = L.circle(latLng, {
        radius: 50, color: '#4a90e2', fillColor: '#4a90e2', fillOpacity: 0.1, weight: 1,
      }).addTo(this.map);
      this.map.setView(latLng, 17);
    } else {
      this.playerMarker.setLatLng(latLng);
      this.userCircle?.setLatLng(latLng);
      this.map.panTo(latLng);
      
      // Update DOM if needed
      const el = this.playerMarker.getElement();
      if (el) {
          if (avatarUrl) {
              const dot = el.querySelector('.dot') as HTMLElement;
              if (dot) dot.style.backgroundImage = `url('${avatarUrl}')`;
          }
          if (name) {
              const nameEl = el.querySelector('.player-name');
              if (nameEl) nameEl.innerHTML = name;
          }
          if (status === PlayerStatus.MEDITATING) el.classList.add('meditating');
          else el.classList.remove('meditating');
      }
    }
  }

  updateOtherPlayers(players: PlayerMapData[]): void {
    if (!this.map) return;
    const activeIds = new Set<string>();

    players.forEach((player) => {
      // SKIP SELF to avoid double rendering
      if (this.selfId && player.id === this.selfId) return;

      activeIds.add(player.id);
      const latLng = new L.LatLng(player.lat, player.lng);

      if (this.otherPlayerMarkers.has(player.id)) {
        const marker = this.otherPlayerMarkers.get(player.id)!;
        marker.setLatLng(latLng);
        
        const el = marker.getElement();
        if (el) {
            if (player.status === PlayerStatus.MEDITATING) el.classList.add('meditating');
            else el.classList.remove('meditating');
            
            // Update Avatar for others
            if (player.avatar) {
                const dot = el.querySelector('.player-dot') as HTMLElement;
                if (dot) {
                    dot.style.backgroundImage = `url('${player.avatar}')`;
                    dot.style.backgroundSize = 'cover';
                    dot.style.backgroundColor = 'transparent';
                    dot.style.border = 'none';
                }
            }
        }
      } else {
        const color = this.getLinhCanColor(player.linhCan);
        // Initial Render with Avatar
        const icon = L.divIcon({
          className: 'other-player-icon',
          html: `
            <div class="player-dot" style="background-color: ${color}; ${player.avatar ? `background-image: url('${player.avatar}'); background-size: cover; border: none; background-color: transparent;` : ''}"></div>
            <div class="player-name">${player.name}</div>
          `,
          iconSize: [40, 40],
          iconAnchor: [20, 35],
        });
        const marker = L.marker(latLng, { icon }).addTo(this.map!);
        this.otherPlayerMarkers.set(player.id, marker);
      }
    });

    for (const [id, marker] of this.otherPlayerMarkers.entries()) {
      if (!activeIds.has(id)) {
        marker.remove();
        this.otherPlayerMarkers.delete(id);
      }
    }
  }

  renderSpiritHerbs(herbs: SpiritHerb[], onHerbClick: (herb: SpiritHerb) => void): void {
    if (!this.map) return;
    this.onHerbClick = onHerbClick;
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
      marker.on('click', () => { if (this.onHerbClick) this.onHerbClick(herb); });
      this.herbMarkers.set(herb.id, marker);
    });
  }

  private getLinhCanColor(linhCan: LinhCan): string {
    switch (linhCan) {
      case LinhCan.KIM: return '#FFD700'; 
      case LinhCan.MOC: return '#228B22'; 
      case LinhCan.THUY: return '#1E90FF'; 
      case LinhCan.HOA: return '#FF4500'; 
      case LinhCan.THO: return '#8B4513'; 
      default: return '#999999';
    }
  }

  private injectStyles(): void {
    if (document.getElementById('map-styles')) return;
    const style = document.createElement('style');
    style.id = 'map-styles';
    style.textContent = `
      .leaflet-tile-pane { filter: contrast(1.1) sepia(0.2) saturate(0.8); }
      .player-marker-icon .dot { width: 32px; height: 32px; background-color: transparent; border: 2px solid #2DD4BF; box-shadow: 0 0 10px #2DD4BF, inset 0 0 10px #2DD4BF; border-radius: 50%; position: absolute; top: -6px; left: -6px; z-index: 2; background-size: cover; background-position: center; }
      .player-marker-icon.meditating .dot, .other-player-icon.meditating .player-dot { box-shadow: 0 0 20px #FFD700, inset 0 0 10px #FFD700; border-color: #FFD700; }
      .player-marker-icon.meditating .pulse { animation: none; border-color: #FFD700; background-color: rgba(255, 215, 0, 0.2); transform: scale(1.5); }
      .player-marker-icon .pulse { width: 60px; height: 60px; background-color: rgba(45, 212, 191, 0.2); border: 1px solid rgba(45, 212, 191, 0.5); border-radius: 50%; position: absolute; top: -20px; left: -20px; animation: pulse 3s infinite; }
      @keyframes pulse { 0% { transform: scale(0.8); opacity: 0.8; box-shadow: 0 0 0 0 rgba(45, 212, 191, 0.4); } 70% { transform: scale(1.2); opacity: 0; box-shadow: 0 0 20px 20px rgba(45, 212, 191, 0); } 100% { transform: scale(0.8); opacity: 0; } }
      .player-name { position: absolute; top: 30px; left: 50%; transform: translateX(-50%); font-size: 10px; color: white; text-shadow: 1px 1px 2px black; text-align: center; background: rgba(0,0,0,0.6); border-radius: 4px; padding: 2px 4px; white-space: nowrap; font-family: 'JetBrains Mono', monospace; border: 1px solid rgba(45, 212, 191, 0.3); }
      .other-player-icon .player-dot { width: 32px; height: 32px; border-radius: 50%; border: 1px solid white; margin: 0 auto; background-position: center; }
      .other-player-icon .player-name { position: absolute; top: 30px; left: 50%; transform: translateX(-50%); width: max-content; font-size: 10px; color: white; text-shadow: 1px 1px 2px black; text-align: center; background: rgba(0,0,0,0.6); border-radius: 4px; padding: 1px 3px; }
      .herb-marker .herb-icon { font-size: 20px; text-align: center; filter: drop-shadow(0 0 5px gold); animation: float 3s ease-in-out infinite; }
      .herb-marker .herb-icon.rare { filter: drop-shadow(0 0 8px purple); }
      .herb-marker .herb-icon.legendary { filter: drop-shadow(0 0 10px orange); }
      @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
      .leaflet-control-container { display: none; }
    `;
    document.head.appendChild(style);
  }
}
