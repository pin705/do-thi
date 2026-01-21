import { GPSPosition } from '@urban-xianxia/shared';

// Constants
const METERS_PER_LINH_KHI = 100;
const EARTH_RADIUS_KM = 6371;
const WALKING_SPEED_M_S = 4.5; 

export interface GPSTrackingResult {
  currentPosition: GPSPosition;
  distanceMoved: number;
  linhKhiGained: number;
  totalDistance: number;
  speed: number; // km/h
}

export class GPSTracker {
  private watchId: number | null = null;
  private lastPosition: GPSPosition | null = null;
  private totalDistance: number = 0;
  private accumulatedDistance: number = 0;
  private onUpdate: ((result: GPSTrackingResult) => void) | null = null;
  private onError: ((error: GeolocationPositionError) => void) | null = null;
  
  private fakeInterval: any = null;
  private gpsTimeout: any = null;
  
  // Auto-Pathing
  private targetPosition: { lat: number, lng: number } | null = null;
  private autoPathInterval: any = null;

  // Default / Last Known Position
  private initialLat = 21.0285;
  private initialLng = 105.8542;

  constructor(initialDistance: number = 0) {
    this.totalDistance = initialDistance;
  }

  setInitialPosition(lat: number, lng: number) {
      this.initialLat = lat;
      this.initialLng = lng;
  }

  moveTo(lat: number, lng: number) {
    this.targetPosition = { lat, lng };
    if (!this.autoPathInterval) {
        this.startAutoPathLoop();
    }
  }

  private startAutoPathLoop() {
    this.autoPathInterval = setInterval(() => {
        if (!this.targetPosition) return;
        
        // Use lastPosition or Initial if null
        const currentLat = this.lastPosition?.lat || this.initialLat;
        const currentLng = this.lastPosition?.lng || this.initialLng;
        
        const distToTarget = this.calculateDistance(currentLat, currentLng, this.targetPosition.lat, this.targetPosition.lng);
        
        if (distToTarget < 5) { 
            this.targetPosition = null;
            clearInterval(this.autoPathInterval);
            this.autoPathInterval = null;
            return;
        }

        const stepSize = Math.min(distToTarget, WALKING_SPEED_M_S * 0.1); // 100ms update for smooth
        const ratio = stepSize / distToTarget;
        
        const newLat = currentLat + (this.targetPosition.lat - currentLat) * ratio;
        const newLng = currentLng + (this.targetPosition.lng - currentLng) * ratio;

        this.handlePositionUpdate({
            coords: { latitude: newLat, longitude: newLng },
            timestamp: Date.now()
        } as any);

    }, 100); // 100ms smooth update (Fix lag 1)
  }

  startTracking(
    onUpdate: (result: GPSTrackingResult) => void,
    onError?: (error: GeolocationPositionError) => void,
  ): boolean {
    this.onUpdate = onUpdate;
    this.onError = onError || null;

    if (!navigator.geolocation) {
      this.startFakeGPS();
      return true;
    }

    this.gpsTimeout = setTimeout(() => {
        if (!this.lastPosition) {
            console.warn("GPSTracker: GPS Timeout, forcing Simulation.");
            this.startFakeGPS();
        }
    }, 3000);

    this.watchId = navigator.geolocation.watchPosition(
      (position) => {
        if (this.gpsTimeout) clearTimeout(this.gpsTimeout);
        if (this.fakeInterval) clearInterval(this.fakeInterval);
        
        if (!this.targetPosition) {
            this.handlePositionUpdate(position);
        }
      },
      (error) => {
        console.error(error);
        this.startFakeGPS();
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 },
    );

    return true;
  }

  private startFakeGPS() {
    if (this.fakeInterval) return;
    
    // Start at Initial
    let lat = this.initialLat;
    let lng = this.initialLng;

    // Send initial immediate update
    this.handlePositionUpdate({
        coords: { latitude: lat, longitude: lng },
        timestamp: Date.now()
    } as any);

    this.fakeInterval = setInterval(() => {
        // Random walk tiny bits
        lat += (Math.random() - 0.5) * 0.00005;
        lng += (Math.random() - 0.5) * 0.00005;
        
        const fakePos: any = {
            coords: { latitude: lat, longitude: lng },
            timestamp: Date.now()
        };
        this.handlePositionUpdate(fakePos);
    }, 1000); // 1s update (Fix lag 2)
  }

  // ... (Stop Tracking & Getters kept same)
  stopTracking(): void {
    if (this.watchId !== null) { navigator.geolocation.clearWatch(this.watchId); this.watchId = null; }
    if (this.fakeInterval) { clearInterval(this.fakeInterval); this.fakeInterval = null; }
    if (this.autoPathInterval) { clearInterval(this.autoPathInterval); this.autoPathInterval = null; }
    if (this.gpsTimeout) clearTimeout(this.gpsTimeout);
  }

  async getCurrentPosition(): Promise<GPSPosition | null> {
    return new Promise((resolve) => {
      resolve({ lat: this.initialLat, lng: this.initialLng, timestamp: Date.now() });
    });
  }

  private handlePositionUpdate(position: GeolocationPosition): void {
    const currentPosition: GPSPosition = {
      lat: position.coords.latitude,
      lng: position.coords.longitude,
      timestamp: position.timestamp,
    };

    let distanceMoved = 0;
    let linhKhiGained = 0;
    let speed = 0;

    if (this.lastPosition) {
      distanceMoved = this.calculateDistance(
        this.lastPosition.lat,
        this.lastPosition.lng,
        currentPosition.lat,
        currentPosition.lng,
      );

      const timeDelta = (currentPosition.timestamp - this.lastPosition.timestamp) / 1000;
      if (timeDelta > 0) {
          const speedMps = distanceMoved / timeDelta;
          speed = Math.round(speedMps * 3.6); 
      }

      if (distanceMoved > 0.01 && distanceMoved < 500) {
        this.totalDistance += distanceMoved;
        this.accumulatedDistance += distanceMoved;

        linhKhiGained = Math.floor(this.accumulatedDistance / METERS_PER_LINH_KHI);
        this.accumulatedDistance = this.accumulatedDistance % METERS_PER_LINH_KHI;
      }
    }

    this.lastPosition = currentPosition;

    if (this.onUpdate) {
      this.onUpdate({
        currentPosition,
        distanceMoved,
        linhKhiGained,
        totalDistance: this.totalDistance,
        speed
      });
    }
  }

  private calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const dLat = this.toRadians(lat2 - lat1);
    const dLng = this.toRadians(lng2 - lng1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return EARTH_RADIUS_KM * c * 1000;
  }
  private toRadians(deg: number): number { return deg * (Math.PI / 180); }
  static calculatePassiveCultivation(last: number, now: number) { return { linhKhiGained: 0, hoursElapsed: 0 }; } // Simplified
  getRemainingDistance() { return METERS_PER_LINH_KHI - this.accumulatedDistance; }
  getTotalDistance() { return this.totalDistance; }
  getLastPosition() { return this.lastPosition; }
}
