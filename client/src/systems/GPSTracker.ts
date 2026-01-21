import { GPSPosition } from '@urban-xianxia/shared';

// Constants
const METERS_PER_LINH_KHI = 100;
const EARTH_RADIUS_KM = 6371;
const WALKING_SPEED_M_S = 1.5; // ~5.4 km/h

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
  
  // Auto-Pathing
  private targetPosition: { lat: number, lng: number } | null = null;
  private autoPathInterval: any = null;

  constructor(initialDistance: number = 0) {
    this.totalDistance = initialDistance;
  }

  // Set destination for auto-walking
  moveTo(lat: number, lng: number) {
    this.targetPosition = { lat, lng };
    if (!this.autoPathInterval) {
        this.startAutoPathLoop();
    }
    // Stop real GPS watch if we start auto-walking to avoid conflict?
    // Better: Prioritize Auto-Path if set.
  }

  private startAutoPathLoop() {
    this.autoPathInterval = setInterval(() => {
        if (!this.targetPosition || !this.lastPosition) return;

        const currentLat = this.lastPosition.lat;
        const currentLng = this.lastPosition.lng;
        
        const distToTarget = this.calculateDistance(currentLat, currentLng, this.targetPosition.lat, this.targetPosition.lng);
        
        if (distToTarget < 2) {
            // Arrived
            this.targetPosition = null;
            clearInterval(this.autoPathInterval);
            this.autoPathInterval = null;
            return;
        }

        // Move towards target (simulate 1 second step)
        // Simple linear interpolation
        const stepSize = Math.min(distToTarget, WALKING_SPEED_M_S * 2); // 2s update interval
        const ratio = stepSize / distToTarget;
        
        const newLat = currentLat + (this.targetPosition.lat - currentLat) * ratio;
        const newLng = currentLng + (this.targetPosition.lng - currentLng) * ratio;

        this.handlePositionUpdate({
            coords: { latitude: newLat, longitude: newLng },
            timestamp: Date.now()
        } as any);

    }, 2000);
  }

  startTracking(
    onUpdate: (result: GPSTrackingResult) => void,
    onError?: (error: GeolocationPositionError) => void,
  ): boolean {
    this.onUpdate = onUpdate;
    this.onError = onError || null;

    if (!navigator.geolocation) {
      this.moveTo(21.0285, 105.8542); // Start simulating at default
      return true;
    }

    this.watchId = navigator.geolocation.watchPosition(
      (position) => {
        // Only update if NOT auto-pathing
        if (!this.targetPosition) {
            this.handlePositionUpdate(position);
        }
      },
      (error) => {
        // Fallback to simulation at Hanoi
        this.moveTo(21.0285, 105.8542);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 },
    );

    return true;
  }

  stopTracking(): void {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
    if (this.autoPathInterval) {
        clearInterval(this.autoPathInterval);
        this.autoPathInterval = null;
    }
  }

  // ... (Helpers kept same)
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
  
  // Keep required static method
  static calculatePassiveCultivation(
    lastOnlineTimestamp: number,
    currentTimestamp: number = Date.now(),
  ): { linhKhiGained: number; hoursElapsed: number } {
    const msElapsed = currentTimestamp - lastOnlineTimestamp;
    const hoursElapsed = msElapsed / (1000 * 60 * 60);
    const maxHours = 24;
    const effectiveHours = Math.min(hoursElapsed, maxHours);
    const linhKhiGained = Math.floor(effectiveHours);
    return { linhKhiGained, hoursElapsed: Math.round(hoursElapsed * 10) / 10 };
  }
  getRemainingDistance() { return METERS_PER_LINH_KHI - this.accumulatedDistance; }
  getTotalDistance() { return this.totalDistance; }
  getLastPosition() { return this.lastPosition; }
}
