/**
 * HealthKit Data Display Component
 * Shows real-time data from Apple Watch/iPhone Health
 */

import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { healthKitManager } from '../features/health/healthKit';

interface HealthData {
  heartRate: number | null;
  vo2Max: number | null;
  steps: number;
  workouts: number;
  lastSync: string;
  isMockData?: boolean;
}

export function HealthKitDataDisplay() {
  const [data, setData] = useState<HealthData>({
    heartRate: null,
    vo2Max: null,
    steps: 0,
    workouts: 0,
    lastSync: 'Never',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    initializeAndFetch();
  }, []);

  const initializeAndFetch = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🏥 Initializing HealthKit...');

      // On real devices, native modules might take a moment to load
      // Retry initialization if it fails initially
      let success = await healthKitManager.initialize();

      if (!success) {
        console.log('🔄 First initialization attempt failed, retrying in 500ms...');
        await new Promise(resolve => setTimeout(resolve, 500));
        success = await healthKitManager.initialize();
      }

      if (!success) {
        console.warn('⚠️ HealthKit not available, using mock data for demonstration');

        // Use mock data for demonstration
        setData({
          heartRate: 72,
          vo2Max: 45,
          steps: 8234,
          workouts: 5,
          lastSync: new Date().toLocaleTimeString(),
          isMockData: true,
        });

        setInitialized(true);
        setLoading(false);
        return;
      }

      setInitialized(true);
      console.log('✅ HealthKit initialized');

      // Fetch data immediately
      await fetchHealthData();

      // On real devices, HealthKit data might not be immediately available
      // Schedule a retry after a short delay to catch late-arriving data
      setTimeout(async () => {
        console.log('🔄 Auto-refreshing HealthKit data...');
        await fetchHealthData();
      }, 2000); // Retry after 2 seconds

    } catch (err: any) {
      console.error('❌ HealthKit error:', err);

      // Use mock data on error
      setData({
        heartRate: 72,
        vo2Max: 45,
        steps: 8234,
        workouts: 5,
        lastSync: new Date().toLocaleTimeString(),
        isMockData: true,
      });
      setInitialized(true);
      setLoading(false);
    }
  };

  const fetchHealthData = async () => {
    try {
      setLoading(true);
      console.log('📊 Fetching health data...');

      // Fetch all data in parallel
      const [heartRate, vo2Max, steps, workouts] = await Promise.all([
        healthKitManager.getLatestHeartRate(),
        healthKitManager.getLatestVO2Max(),
        healthKitManager.getDailySteps(),
        healthKitManager.getWorkouts(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)),
      ]);

      console.log('📊 Health data:', { heartRate, vo2Max, steps, workouts: workouts.length });

      // Check if we got ANY data
      const hasData = heartRate || vo2Max || steps > 0 || workouts.length > 0;

      if (!hasData) {
        console.log('⚠️ HealthKit returned no data - this is normal if you haven\'t worn Apple Watch recently');
      }

      setData({
        heartRate,
        vo2Max,
        steps,
        workouts: workouts.length,
        lastSync: new Date().toLocaleTimeString(),
        isMockData: false,
      });

      setError(null);
    } catch (err: any) {
      console.error('❌ Error fetching health data:', err);
      setError('Failed to fetch health data');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    if (initialized) {
      fetchHealthData();
    } else {
      initializeAndFetch();
    }
  };

  if (!initialized && !loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Ionicons name="fitness" size={24} color="#175CD3" />
          <Text style={styles.title}>Apple Health Data</Text>
        </View>

        <View style={styles.errorContainer}>
          <Ionicons name="warning-outline" size={48} color="#FF9500" />
          <Text style={styles.errorTitle}>HealthKit Not Available</Text>
          <Text style={styles.errorText}>
            {error || 'HealthKit requires iOS with permissions enabled'}
          </Text>
          <TouchableOpacity style={styles.retryButton} onPress={initializeAndFetch}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Ionicons name="fitness" size={24} color="#175CD3" />
          <Text style={styles.title}>Apple Health Data</Text>
        </View>
        <TouchableOpacity onPress={handleRefresh} disabled={loading} style={{ padding: 4 }}>
          <Ionicons name="refresh" size={20} color={loading ? "#CCC" : "#175CD3"} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#175CD3" />
          <Text style={styles.loadingText}>Loading health data...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          {data.isMockData && (
            <View style={styles.mockDataBanner}>
              <Ionicons name="information-circle" size={20} color="#FF9500" />
              <Text style={styles.mockDataText}>
                Showing demo data. Connect Apple Watch and grant permissions to see real health data.
              </Text>
            </View>
          )}

          {!data.isMockData && !data.heartRate && !data.vo2Max && data.steps === 0 && (
            <View style={styles.noDataBanner}>
              <Ionicons name="watch-outline" size={20} color="#175CD3" />
              <Text style={styles.noDataText}>
                HealthKit connected! Wear your Apple Watch and exercise to see data here.
              </Text>
            </View>
          )}

          <View style={styles.dataGrid}>
            
            {/* VO2 Max */}
            <View style={[styles.dataCard, { backgroundColor: '#ECFDF3' }]}>
              <Ionicons name="speedometer" size={28} color="#10B981" />
              <Text style={styles.dataValue}>
                {data.vo2Max ? `${Math.round(data.vo2Max)}` : '--'}
              </Text>
              <Text style={styles.dataLabel}>VO₂ Max</Text>
              <Text style={styles.dataUnit}>{data.vo2Max ? 'ml/kg/min' : 'No data'}</Text>
            </View>

            {/* Heart Rate */}
            <View style={[styles.dataCard, { backgroundColor: '#FFF1F0' }]}>
              <Ionicons name="heart" size={28} color="#FF3B30" />
              <Text style={styles.dataValue}>
                {data.heartRate ? `${Math.round(data.heartRate)}` : '--'}
              </Text>
              <Text style={styles.dataLabel}>Heart Rate</Text>
              <Text style={styles.dataUnit}>{data.heartRate ? 'bpm' : 'No data'}</Text>
            </View>


            {/* Steps */}
            <View style={[styles.dataCard, { backgroundColor: '#EFF6FF' }]}>
              <Ionicons name="walk" size={28} color="#175CD3" />
              <Text style={styles.dataValue}>{data.steps.toLocaleString()}</Text>
              <Text style={styles.dataLabel}>Steps Today</Text>
              <Text style={styles.dataUnit}>steps</Text>
            </View>

            {/* Workouts */}
            <View style={[styles.dataCard, { backgroundColor: '#FFF6ED' }]}>
              <Ionicons name="barbell" size={28} color="#FF9500" />
              <Text style={styles.dataValue}>{data.workouts}</Text>
              <Text style={styles.dataLabel}>Workouts</Text>
              <Text style={styles.dataUnit}>last 7 days</Text>
            </View>
          </View>

          <Text style={styles.syncText}>Last synced: {data.lastSync}</Text>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    color: '#757575',
  },
  errorContainer: {
    padding: 24,
    alignItems: 'center',
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    color: '#757575',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#175CD3',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  dataGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  dataCard: {
    flex: 1,
    minWidth: '45%',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  dataValue: {
    fontSize: 32,
    fontWeight: '700',
    color: '#333',
    marginTop: 8,
  },
  dataLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginTop: 4,
  },
  dataUnit: {
    fontSize: 12,
    color: '#757575',
    marginTop: 2,
  },
  syncText: {
    fontSize: 12,
    color: '#757575',
    textAlign: 'center',
    marginTop: 16,
  },
  mockDataBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF6ED',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    gap: 8,
  },
  mockDataText: {
    flex: 1,
    fontSize: 13,
    color: '#B45309',
    lineHeight: 18,
  },
  noDataBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    gap: 8,
  },
  noDataText: {
    flex: 1,
    fontSize: 13,
    color: '#1E40AF',
    lineHeight: 18,
  },
});
