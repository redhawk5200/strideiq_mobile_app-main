/**
 * HealthKit Data Sync Module
 * Syncs health data from HealthKit to backend API
 */

import { apiClient } from './api';
import { healthKitManager } from '../features/health/healthKit';

export interface SyncResult {
  success: boolean;
  synced: number;
  errors: number;
  message?: string;
}

export interface HeartRateSyncData {
  bpm: number;
  captured_at: string; // ISO 8601
  context?: 'resting' | 'workout' | 'sleep' | 'unknown';
  source_record_id?: string;
}

export interface StepSyncData {
  steps: number;
  start_minute: string; // ISO 8601
  source_record_id?: string;
}

export interface VO2MaxSyncData {
  ml_per_kg_min: number;
  measured_at: string; // ISO 8601
  estimation_method: 'apple_health' | 'fitbit_cardio_fitness' | 'lab' | 'field_test';
  source_record_id?: string;
}

export interface WorkoutSyncData {
  activity_type: string;
  start_time: string; // ISO 8601
  end_time: string; // ISO 8601
  duration_seconds: number;
  calories?: number;
  distance_miles?: number;
  source_record_id?: string;
}

/**
 * Sync heart rate samples to backend
 */
export async function syncHeartRate(
  startDate: Date,
  endDate: Date = new Date()
): Promise<SyncResult> {
  try {
    console.log('📤 Syncing heart rate data...');

    // Fetch from HealthKit
    const samples = await healthKitManager.getHeartRateSamples(startDate, endDate);

    if (samples.length === 0) {
      return {
        success: true,
        synced: 0,
        errors: 0,
        message: 'No heart rate data to sync'
      };
    }

    // Smart sampling: Keep all data from last 7 days, downsample older data
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const recentSamples: HeartRateSyncData[] = [];
    const olderSamples: HeartRateSyncData[] = [];

    samples.forEach(sample => {
      const sampleDate = new Date(sample.startDate);
      const payload: HeartRateSyncData = {
        bpm: Math.round(sample.value),
        captured_at: sampleDate.toISOString(),
        context: 'unknown',
        source_record_id: sample.id || `hr_${sample.startDate}_${sample.value}`,
      };

      if (sampleDate >= sevenDaysAgo) {
        recentSamples.push(payload);
      } else {
        olderSamples.push(payload);
      }
    });

    // Downsample older data: Keep 1 sample per hour
    const downsampledOlder: HeartRateSyncData[] = [];
    const hourlyBuckets: Record<string, HeartRateSyncData> = {};

    olderSamples.forEach(sample => {
      const date = new Date(sample.captured_at);
      const hourKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}-${date.getHours()}`;

      // Keep the first sample in each hour bucket
      if (!hourlyBuckets[hourKey]) {
        hourlyBuckets[hourKey] = sample;
      }
    });

    downsampledOlder.push(...Object.values(hourlyBuckets));

    // Combine recent (all) + downsampled older data
    const allPayload = [...recentSamples, ...downsampledOlder];

    console.log(`📊 Smart sampling: ${recentSamples.length} recent samples (last 7 days, all kept)`);
    console.log(`📊 Smart sampling: ${olderSamples.length} → ${downsampledOlder.length} older samples (downsampled to 1/hour)`);
    console.log(`📊 Total to sync: ${allPayload.length} samples`);

    // Split into batches of 100 to avoid network timeout
    const BATCH_SIZE = 100;
    let totalSynced = 0;
    let totalErrors = 0;

    console.log(`📦 Splitting ${allPayload.length} samples into batches of ${BATCH_SIZE}`);

    for (let i = 0; i < allPayload.length; i += BATCH_SIZE) {
      const batch = allPayload.slice(i, i + BATCH_SIZE);
      const batchNum = Math.floor(i / BATCH_SIZE) + 1;
      const totalBatches = Math.ceil(allPayload.length / BATCH_SIZE);

      console.log(`📤 Sending batch ${batchNum}/${totalBatches} (${batch.length} samples)`);

      try {
        const response = await apiClient.post('/api/v1/health/heart-rate/batch', {
          provider: 'apple_healthkit',
          samples: batch,
        });

        if (response.success) {
          totalSynced += batch.length;
          console.log(`✅ Batch ${batchNum}/${totalBatches} synced`);
        } else {
          totalErrors += batch.length;
          console.error(`❌ Batch ${batchNum}/${totalBatches} failed:`, response.error);
        }
      } catch (batchError) {
        totalErrors += batch.length;
        console.error(`❌ Batch ${batchNum}/${totalBatches} error:`, batchError);
      }
    }

    console.log(`✅ Heart rate sync complete: ${totalSynced} synced, ${totalErrors} errors`);

    return {
      success: totalErrors === 0,
      synced: totalSynced,
      errors: totalErrors,
      message: totalErrors > 0 ? `${totalErrors} samples failed` : undefined,
    };
  } catch (error) {
    console.error('❌ Heart rate sync error:', error);
    return {
      success: false,
      synced: 0,
      errors: 0,
      message: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Sync steps data to backend
 */
export async function syncSteps(
  startDate: Date,
  endDate: Date = new Date()
): Promise<SyncResult> {
  try {
    console.log('📤 Syncing steps data...');
    console.log(`📅 Sync range: ${startDate.toISOString()} to ${endDate.toISOString()}`);

    // Fetch daily steps for each day in range (inclusive of end date)
    const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000)) + 1; // +1 to include end date
    const stepsPromises: Promise<{ date: Date; steps: number }>[] = [];

    for (let i = 0; i < days; i++) {
      const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
      console.log(`🔍 Fetching steps for date: ${date.toISOString().split('T')[0]}`);
      stepsPromises.push(
        healthKitManager.getDailySteps(date).then(steps => {
          console.log(`  ✅ ${date.toISOString().split('T')[0]}: ${steps} steps`);
          return { date, steps };
        })
      );
    }

    const dailySteps = await Promise.all(stepsPromises);
    const validSteps = dailySteps.filter(d => d.steps > 0);

    if (validSteps.length === 0) {
      return {
        success: true,
        synced: 0,
        errors: 0,
        message: 'No steps data to sync'
      };
    }

    // Transform to backend format (store as daily aggregates at midnight UTC)
    const payload: StepSyncData[] = validSteps.map(item => {
      // Get the date components in LOCAL timezone
      const year = item.date.getFullYear();
      const month = String(item.date.getMonth() + 1).padStart(2, '0');
      const day = String(item.date.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;

      // Create UTC midnight for this LOCAL date (prevents timezone shift)
      const utcMidnight = `${dateStr}T00:00:00.000Z`;

      return {
        steps: Math.round(item.steps), // Round to integer
        start_minute: utcMidnight,
        source_record_id: `steps_${dateStr}`,
      };
    });

    console.log(`📦 Prepared ${payload.length} days of step data:`);
    payload.forEach(p => {
      console.log(`  📅 ${p.start_minute}: ${p.steps} steps`);
    });

    // Send to backend
    console.log('🚀 Sending steps to backend...');
    const response = await apiClient.post('/api/v1/health/steps/batch', {
      provider: 'apple_healthkit',
      samples: payload,
    });

    if (response.success) {
      console.log(`✅ Synced ${payload.length} days of steps`);
      return {
        success: true,
        synced: payload.length,
        errors: 0,
      };
    } else {
      console.error('❌ Failed to sync steps:', response.error);
      return {
        success: false,
        synced: 0,
        errors: payload.length,
        message: response.error,
      };
    }
  } catch (error) {
    console.error('❌ Steps sync error:', error);
    return {
      success: false,
      synced: 0,
      errors: 0,
      message: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Sync VO2 Max data to backend
 */
export async function syncVO2Max(
  startDate: Date,
  endDate: Date = new Date()
): Promise<SyncResult> {
  try {
    console.log('📤 Syncing VO2 Max data...');

    const samples = await healthKitManager.getVO2MaxSamples(startDate, endDate);

    if (samples.length === 0) {
      return {
        success: true,
        synced: 0,
        errors: 0,
        message: 'No VO2 Max data to sync'
      };
    }

    // Transform to backend format
    const payload: VO2MaxSyncData[] = samples.map(sample => ({
      ml_per_kg_min: sample.value,
      measured_at: new Date(sample.startDate).toISOString(),
      estimation_method: 'apple_health',
      source_record_id: sample.id || `vo2_${sample.startDate}_${sample.value}`,
    }));

    // Send to backend
    const response = await apiClient.post('/api/v1/health/vo2max/batch', {
      provider: 'apple_healthkit',
      samples: payload,
    });

    if (response.success) {
      console.log(`✅ Synced ${payload.length} VO2 Max samples`);
      return {
        success: true,
        synced: payload.length,
        errors: 0,
      };
    } else {
      console.error('❌ Failed to sync VO2 Max:', response.error);
      return {
        success: false,
        synced: 0,
        errors: payload.length,
        message: response.error,
      };
    }
  } catch (error) {
    console.error('❌ VO2 Max sync error:', error);
    return {
      success: false,
      synced: 0,
      errors: 0,
      message: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Sync workouts to backend
 */
export async function syncWorkouts(
  startDate: Date,
  endDate: Date = new Date()
): Promise<SyncResult> {
  try {
    console.log('📤 Syncing workouts data...');

    const workouts = await healthKitManager.getWorkouts(startDate, endDate);

    if (workouts.length === 0) {
      return {
        success: true,
        synced: 0,
        errors: 0,
        message: 'No workouts to sync'
      };
    }

    // Transform to backend format
    const payload: WorkoutSyncData[] = workouts.map(workout => {
      // Calculate duration in seconds if not provided
      const startTime = new Date(workout.startDate).getTime();
      const endTime = new Date(workout.endDate).getTime();
      const durationSeconds = workout.duration || Math.round((endTime - startTime) / 1000);

      return {
        activity_type: workout.activityType,
        start_time: new Date(workout.startDate).toISOString(),
        end_time: new Date(workout.endDate).toISOString(),
        duration_seconds: durationSeconds,
        calories: workout.calories > 0 ? workout.calories : undefined,
        distance_miles: workout.distance && workout.distance > 0 ? workout.distance : undefined,
        source_record_id: `workout_${workout.startDate}_${workout.activityType}`,
      };
    });

    // Send to backend
    const response = await apiClient.post('/api/v1/health/workouts/batch', {
      provider: 'apple_healthkit',
      workouts: payload,
    });

    if (response.success) {
      console.log(`✅ Synced ${payload.length} workouts`);
      return {
        success: true,
        synced: payload.length,
        errors: 0,
      };
    } else {
      console.error('❌ Failed to sync workouts:', response.error);
      return {
        success: false,
        synced: 0,
        errors: payload.length,
        message: response.error,
      };
    }
  } catch (error) {
    console.error('❌ Workouts sync error:', error);
    return {
      success: false,
      synced: 0,
      errors: 0,
      message: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Sync all HealthKit data (comprehensive sync)
 */
export async function syncAllHealthData(
  startDate: Date = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Default: last 30 days
  endDate: Date = new Date()
): Promise<{
  heartRate: SyncResult;
  steps: SyncResult;
  vo2Max: SyncResult;
  workouts: SyncResult;
  overall: { success: boolean; totalSynced: number; totalErrors: number };
}> {
  console.log('🔄 Starting comprehensive HealthKit sync...');

  // Run all syncs in parallel
  const [heartRate, steps, vo2Max, workouts] = await Promise.all([
    syncHeartRate(startDate, endDate),
    syncSteps(startDate, endDate),
    syncVO2Max(startDate, endDate),
    syncWorkouts(startDate, endDate),
  ]);

  const totalSynced = heartRate.synced + steps.synced + vo2Max.synced + workouts.synced;
  const totalErrors = heartRate.errors + steps.errors + vo2Max.errors + workouts.errors;
  const allSuccess = heartRate.success && steps.success && vo2Max.success && workouts.success;

  console.log('✅ HealthKit sync complete:', {
    totalSynced,
    totalErrors,
    success: allSuccess,
  });

  return {
    heartRate,
    steps,
    vo2Max,
    workouts,
    overall: {
      success: allSuccess,
      totalSynced,
      totalErrors,
    },
  };
}
