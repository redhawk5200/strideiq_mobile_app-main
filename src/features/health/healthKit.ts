/**
 * HealthKit Integration for React Native
 *
 * This module provides access to Apple Watch health data via iPhone's HealthKit.
 *
 * Key features:
 * - Read heart rate, VO2 Max, workouts, steps from Apple Watch (via iPhone sync)
 * - No watchOS app needed - data syncs automatically to iPhone
 * - Request permissions and fetch historical data
 *
 * Installation required:
 * npm install react-native-health
 *
 * Note: For real-time monitoring during workouts, a watchOS companion app would be needed.
 * For historical data and recent samples (with 5-60s delay), this is sufficient.
 */

import { Platform, NativeModules } from 'react-native';

// Import only the types and constants from react-native-health
// The actual native methods aren't being exported properly
import type { HealthKitPermissions } from 'react-native-health';

// Since the native module isn't exporting methods properly through the normal import,
// we need to access it directly from NativeModules
const AppleHealthKitModule = NativeModules.RNAppleHealthKit || NativeModules.AppleHealthKit || NativeModules.RCTAppleHealthKit;

// Re-export constants from the package
import * as RNHealth from 'react-native-health';
const Constants = (RNHealth as any).Constants || {};

// The native module methods are on the prototype, so we use the module directly
// but add Constants from the JS package
const AppleHealthKit = AppleHealthKitModule;
if (AppleHealthKit) {
  AppleHealthKit.Constants = Constants;
}

// Log once for verification
console.log('✅ HealthKit module loaded:', !!AppleHealthKit);

// Type definitions
// interface HealthKitPermissions {
//   permissions: {
//     read: string[];
//     write?: string[];
//   };
// }

interface HeartRateSample {
  value: number;
  startDate: string;
  endDate: string;
  metadata?: any;
}

interface WorkoutSample {
  activityType: string;
  calories: number;
  distance?: number;
  duration: number;
  startDate: string;
  endDate: string;
}

interface VO2MaxSample {
  value: number;
  startDate: string;
  endDate: string;
}

interface StepSample {
  value: number;
  startDate: string;
  endDate: string;
  metadata?: any;
}

/**
 * HealthKit Manager
 * Handles all interactions with Apple HealthKit
 */
class HealthKitManager {
  private isInitialized = false;
  private initializationPromise: Promise<boolean> | null = null;

  /**
   * Initialize HealthKit with required permissions
   */
  async initialize(): Promise<boolean> {
    // If already initialized, return success immediately
    if (this.isInitialized) {
      console.log('✅ HealthKit already initialized');
      return true;
    }

    // If initialization is in progress, return the existing promise
    if (this.initializationPromise) {
      console.log('⏳ HealthKit initialization already in progress...');
      return this.initializationPromise;
    }

    if (Platform.OS !== 'ios') {
      console.warn('HealthKit is only available on iOS');
      return false;
    }

    // Check if HealthKit is actually available (not in simulator)
    if (!AppleHealthKit || typeof AppleHealthKit.initHealthKit !== 'function') {
      console.warn('⚠️ HealthKit not available (simulator or missing native module)');
      console.log('💡 HealthKit only works on real iOS devices, not in simulator');
      return false;
    }

    // Create and store the initialization promise
    this.initializationPromise = (async () => {
      try {
        console.log('🔐 Requesting HealthKit permissions...');

        const permissions: HealthKitPermissions = {
          permissions: {
            read: [
              AppleHealthKit.Constants.Permissions.HeartRate,
              AppleHealthKit.Constants.Permissions.StepCount,
              AppleHealthKit.Constants.Permissions.DistanceWalkingRunning,
              AppleHealthKit.Constants.Permissions.ActiveEnergyBurned,
              AppleHealthKit.Constants.Permissions.Workout,
              AppleHealthKit.Constants.Permissions.Vo2Max,
              AppleHealthKit.Constants.Permissions.RestingHeartRate,
              AppleHealthKit.Constants.Permissions.HeartRateVariability,
            ],
            write: [],
          },
        };

        return new Promise<boolean>((resolve) => {
          AppleHealthKit.initHealthKit(permissions, (error: string) => {
            if (error) {
              console.error('❌ Error initializing HealthKit:', error);
              this.initializationPromise = null; // Allow retry
              resolve(false);
            } else {
              this.isInitialized = true;
              console.log('✅ HealthKit initialized successfully');
              resolve(true);
            }
          });
        });
      } catch (error: any) {
        console.error('❌ Failed to initialize HealthKit:', error);
        console.log('💡 Make sure you are running on a real iOS device');
        console.log('💡 HealthKit does not work in simulator');
        this.initializationPromise = null; // Allow retry
        return false;
      }
    })();

    return this.initializationPromise;
  }

  /**
   * Check if HealthKit is available and initialized
   */
  isAvailable(): boolean {
    return Platform.OS === 'ios' && this.isInitialized;
  }

  /**
   * Get heart rate samples for a date range
   */
  async getHeartRateSamples(
    startDate: Date,
    endDate: Date = new Date()
  ): Promise<HeartRateSample[]> {
    if (!this.isAvailable()) {
      console.log('⚠️ HealthKit not available for heart rate query');
      return [];
    }

    return new Promise((resolve) => {
      const options = {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        ascending: false,
        limit: 10000, // Increased to fetch all samples (was 100, which only covered ~1 day)
      };

      console.log('❤️ Fetching heart rate samples with options:', options);

      AppleHealthKit.getHeartRateSamples(
        options,
        (err: any, results: HeartRateSample[]) => {
          if (err) {
            console.error('❌ Error fetching heart rate:', err);
            resolve([]);
          } else {
            console.log('✅ Heart rate samples received:', results?.length || 0, 'samples');
            resolve(results || []);
          }
        }
      );
    });
  }

  /**
   * Get latest heart rate
   */
  async getLatestHeartRate(): Promise<number | null> {
    const samples = await this.getHeartRateSamples(
      new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
    );
    return samples.length > 0 ? samples[0].value : null;
  }

  /**
   * Get VO2 Max samples
   */
  async getVO2MaxSamples(
    startDate: Date,
    endDate: Date = new Date()
  ): Promise<VO2MaxSample[]> {
    if (!this.isAvailable()) {
      console.log('⚠️ HealthKit not available for VO2 max query');
      return [];
    }

    return new Promise((resolve) => {
      const options = {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      };

      console.log('💨 Fetching VO2 max samples with options:', options);

      AppleHealthKit.getVo2MaxSamples(
        options,
        (err: any, results: VO2MaxSample[]) => {
          if (err) {
            console.error('❌ Error fetching VO2 Max:', err);
            resolve([]);
          } else {
            console.log('✅ VO2 max samples received:', results?.length || 0, 'samples');
            resolve(results || []);
          }
        }
      );
    });
  }

  /**
   * Get latest VO2 Max value
   */
  async getLatestVO2Max(): Promise<number | null> {
    const samples = await this.getVO2MaxSamples(
      new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
    );
    return samples.length > 0 ? samples[0].value : null;
  }

  /**
   * Get workouts for a date range
   */
  async getWorkouts(
    startDate: Date,
    endDate: Date = new Date()
  ): Promise<WorkoutSample[]> {
    if (!this.isAvailable()) {
      console.log('⚠️ HealthKit not available for workout query');
      return [];
    }

    return new Promise((resolve) => {
      const options = {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        type: 'Workout', // Required: get all workout types
      } as any;

      console.log('🏃 Fetching workouts with options:', options);

      AppleHealthKit.getSamples(
        options,
        (err: any, results: any[]) => {
          if (err) {
            console.error('❌ Error fetching workouts:', err);
            resolve([]);
          } else {
            console.log('✅ Workouts data received:', results?.length || 0, 'workouts');

            // Map to our expected format
            const workouts: WorkoutSample[] = (results || []).map((r: any) => {
              const startDate = r.start || r.startDate;
              const endDate = r.end || r.endDate;

              // Calculate duration from timestamps if not provided
              let duration = r.duration || 0;
              if (duration === 0 && startDate && endDate) {
                const startTime = new Date(startDate).getTime();
                const endTime = new Date(endDate).getTime();
                duration = Math.round((endTime - startTime) / 1000); // Duration in seconds
              }

              return {
                activityType: r.activityName || r.activityType || 'Unknown',
                calories: r.calories || 0,
                distance: r.distance || 0,
                duration: duration,
                startDate: startDate,
                endDate: endDate,
              };
            });
            resolve(workouts);
          }
        }
      );
    });
  }

  /**
   * Get daily step count
   */
  async getDailySteps(date: Date = new Date()): Promise<number> {
    if (!this.isAvailable()) {
      console.log('⚠️ HealthKit not available for steps query');
      return 0;
    }

    return new Promise((resolve) => {
      const options = {
        date: date.toISOString(),
        includeManuallyAdded: true,
      };

      console.log('🚶 Fetching step count with options:', options);

      AppleHealthKit.getStepCount(
        options,
        (err: any, results: { value: number }) => {
          if (err) {
            console.error('❌ Error fetching steps:', err);
            resolve(0);
          } else {
            console.log('✅ Steps data received:', results);
            resolve(results?.value || 0);
          }
        }
      );
    });
  }

  /**
   * Get step samples for a date range (granular data with timestamps)
   */
  async getStepSamples(
    startDate: Date,
    endDate: Date = new Date()
  ): Promise<StepSample[]> {
    if (!this.isAvailable()) {
      console.log('⚠️ HealthKit not available for step samples query');
      return [];
    }

    return new Promise((resolve) => {
      const options = {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      };

      console.log('🚶 Fetching step samples with options:', options);

      AppleHealthKit.getDailyStepCountSamples(
        options,
        (err: any, results: StepSample[]) => {
          if (err) {
            console.error('❌ Error fetching step samples:', err);
            resolve([]);
          } else {
            console.log('✅ Step samples received:', results?.length || 0, 'samples');
            resolve(results || []);
          }
        }
      );
    });
  }

  /**
   * Sync health data to backend
   * Fetches recent data and sends to API
   */
  async syncToBackend(apiClient: any): Promise<void> {
    if (!this.isAvailable()) {
      console.log('HealthKit not available, skipping sync');
      return;
    }

    try {
      console.log('🔄 Syncing HealthKit data to backend...');

      // Get data from last 7 days
      const startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

      // Fetch all data types
      const [heartRates, vo2Max, workouts] = await Promise.all([
        this.getHeartRateSamples(startDate),
        this.getVO2MaxSamples(startDate),
        this.getWorkouts(startDate),
      ]);

      console.log(`Found: ${heartRates.length} HR samples, ${vo2Max.length} VO2 Max, ${workouts.length} workouts`);

      // Send to backend (endpoints would need to be created)
      // await apiClient.post('/api/v1/health/sync', {
      //   heart_rates: heartRates,
      //   vo2_max: vo2Max,
      //   workouts: workouts,
      // });

      console.log('✅ HealthKit data synced successfully');
    } catch (error) {
      console.error('Failed to sync HealthKit data:', error);
    }
  }
}

// Singleton instance
export const healthKitManager = new HealthKitManager();

// Export types
export type { HeartRateSample, WorkoutSample, VO2MaxSample, StepSample };
