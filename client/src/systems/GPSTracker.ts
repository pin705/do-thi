import { GPSPosition } from '@urban-xianxia/shared';

// Constants
const METERS_PER_LINH_KHI = 100;
const EARTH_RADIUS_KM = 6371;

export interface GPSTrackingResult {
  currentPosition: GPSPosition;
  distanceMoved: number;
  linhKhiGained: number;
  totalDistance: number;
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

  constructor(initialDistance: number = 0) {
    this.totalDistance = initialDistance;
  }

  startTracking(
    onUpdate: (result: GPSTrackingResult) => void,
    onError?: (error: GeolocationPositionError) => void,
  ): boolean {
    this.onUpdate = onUpdate;
    this.onError = onError || null;

    console.log('GPSTracker: Starting...');

    if (!navigator.geolocation) {
      console.warn('GPSTracker: No Geolocation API, using Fake.');
      this.startFakeGPS();
      return true;
    }

    // Set timeout to switch to simulation if GPS hangs
    this.gpsTimeout = setTimeout(() => {
        if (!this.lastPosition) {
            console.warn("GPSTracker: GPS Timeout (3s), forcing Simulation mode.");
            this.startFakeGPS();
        }
    }, 3000);

    this.watchId = navigator.geolocation.watchPosition(
      (position) => {
        // Got real signal, clear timeout and fake gps
        if (this.gpsTimeout) clearTimeout(this.gpsTimeout);
        if (this.fakeInterval) clearInterval(this.fakeInterval);
        
        console.log('GPSTracker: Real Signal Acquired');
        this.handlePositionUpdate(position);
      },
      (error) => {
        console.error('GPSTracker Error:', error.message);
        // Fallback
        this.startFakeGPS();
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 5000,
      },
    );

    return true;
  }

  private startFakeGPS() {
    if (this.fakeInterval) return;
    
    console.log("GPSTracker: >>> SIMULATION MODE ACTIVE <<<");
    // Start at Sword Lake, Hanoi
    let lat = 21.0285;
    let lng = 105.8542;

    // Send initial immediate update
    this.handlePositionUpdate({
        coords: { latitude: lat, longitude: lng },
        timestamp: Date.now()
    } as any);

    this.fakeInterval = setInterval(() => {
        // Random walk (approx 5-10 meters)
        lat += (Math.random() - 0.5) * 0.0002;
        lng += (Math.random() - 0.5) * 0.0002;
        
        const fakePos: any = {
            coords: { latitude: lat, longitude: lng },
            timestamp: Date.now()
        };
        this.handlePositionUpdate(fakePos);
    }, 2000);
  }

  stopTracking(): void {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
    if (this.fakeInterval) {
        clearInterval(this.fakeInterval);
        this.fakeInterval = null;
    }
    if (this.gpsTimeout) {
        clearTimeout(this.gpsTimeout);
    }
  }

  // ... (Keep existing helpers: getCurrentPosition, handlePositionUpdate, etc.)
  // I will copy them back to ensure file integrity

  async getCurrentPosition(): Promise<GPSPosition | null> {
    return new Promise((resolve) => {
      // Mock for dev
      resolve({ lat: 21.0285, lng: 105.8542, timestamp: Date.now() });
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

    if (this.lastPosition) {
      distanceMoved = this.calculateDistance(
        this.lastPosition.lat,
        this.lastPosition.lng,
        currentPosition.lat,
        currentPosition.lng,
      );

      // Allow small movements for fake GPS
      if (distanceMoved > 0.1 && distanceMoved < 200) {
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
      });
    }
  }

  private calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const dLat = this.toRadians(lat2 - lat1);
    const dLng = this.toRadians(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) *
        Math.cos(this.toRadians(lat2)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return EARTH_RADIUS_KM * c * 1000;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }
}
