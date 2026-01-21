import { GPSPosition } from '@urban-xianxia/shared';

// Constants
const METERS_PER_LINH_KHI = 100; // 100m = 1 Linh Khí
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
  private accumulatedDistance: number = 0; // Distance not yet converted to Linh Khí
  private onUpdate: ((result: GPSTrackingResult) => void) | null = null;
  private onError: ((error: GeolocationPositionError) => void) | null = null;

  constructor(initialDistance: number = 0) {
    this.totalDistance = initialDistance;
  }

  /**
   * Start tracking GPS position
   */
  startTracking(
    onUpdate: (result: GPSTrackingResult) => void,
    onError?: (error: GeolocationPositionError) => void,
  ): boolean {
    if (!navigator.geolocation) {
      console.error('Geolocation not supported');
      return false;
    }

    this.onUpdate = onUpdate;
    this.onError = onError || null;

    this.watchId = navigator.geolocation.watchPosition(
      (position) => this.handlePositionUpdate(position),
      (error) => this.handleError(error),
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 5000,
      },
    );

    return true;
  }

  /**
   * Stop tracking GPS position
   */
  stopTracking(): void {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
  }

  /**
   * Get current position once
   */
  async getCurrentPosition(): Promise<GPSPosition | null> {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve(null);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            timestamp: position.timestamp,
          });
        },
        () => resolve(null),
        { enableHighAccuracy: true, timeout: 10000 },
      );
    });
  }

  /**
   * Handle position update from GPS
   */
  private handlePositionUpdate(position: GeolocationPosition): void {
    const currentPosition: GPSPosition = {
      lat: position.coords.latitude,
      lng: position.coords.longitude,
      timestamp: position.timestamp,
    };

    let distanceMoved = 0;
    let linhKhiGained = 0;

    if (this.lastPosition) {
      // Calculate distance from last position
      distanceMoved = this.calculateDistance(
        this.lastPosition.lat,
        this.lastPosition.lng,
        currentPosition.lat,
        currentPosition.lng,
      );

      // Filter out GPS noise (ignore movements less than 5m or more than 100m in one update)
      if (distanceMoved > 5 && distanceMoved < 100) {
        this.totalDistance += distanceMoved;
        this.accumulatedDistance += distanceMoved;

        // Convert accumulated distance to Linh Khí
        linhKhiGained = Math.floor(this.accumulatedDistance / METERS_PER_LINH_KHI);
        this.accumulatedDistance = this.accumulatedDistance % METERS_PER_LINH_KHI;
      } else {
        distanceMoved = 0;
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

  /**
   * Handle GPS error
   */
  private handleError(error: GeolocationPositionError): void {
    console.error('GPS Error:', error.message);
    if (this.onError) {
      this.onError(error);
    }
  }

  /**
   * Calculate distance between two GPS coordinates using Haversine formula
   * Returns distance in meters
   */
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
    const distanceKm = EARTH_RADIUS_KM * c;

    return distanceKm * 1000; // Convert to meters
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * Calculate passive cultivation (idle mode)
   * Returns Linh Khí gained during offline time
   */
  static calculatePassiveCultivation(
    lastOnlineTimestamp: number,
    currentTimestamp: number = Date.now(),
  ): { linhKhiGained: number; hoursElapsed: number } {
    const msElapsed = currentTimestamp - lastOnlineTimestamp;
    const hoursElapsed = msElapsed / (1000 * 60 * 60);

    // Passive cultivation: 1 Linh Khí per hour, max 24 hours
    const maxHours = 24;
    const effectiveHours = Math.min(hoursElapsed, maxHours);
    const linhKhiGained = Math.floor(effectiveHours);

    return {
      linhKhiGained,
      hoursElapsed: Math.round(hoursElapsed * 10) / 10,
    };
  }

  /**
   * Get remaining distance until next Linh Khí
   */
  getRemainingDistance(): number {
    return METERS_PER_LINH_KHI - this.accumulatedDistance;
  }

  /**
   * Get total distance traveled
   */
  getTotalDistance(): number {
    return this.totalDistance;
  }

  /**
   * Get last known position
   */
  getLastPosition(): GPSPosition | null {
    return this.lastPosition;
  }
}
