import { HealthKitDataDisplay } from "@/src/components/HealthKitDataDisplay";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { healthKitManager } from "../../src/features/health/healthKit";
import { syncAllHealthData } from "../../src/lib/healthSync";

interface DayData {
  date: string;
  value: string;
  rawDate: Date;
}

interface HeartRateReading {
  value: number;
  time: string;
  timestamp: Date;
}

interface HeartRateDayData {
  date: string;
  range: string;
  min: number;
  max: number;
  readings: HeartRateReading[];
  rawDate: Date;
}

interface StepReading {
  value: number;
  time: string;
  timestamp: Date;
}

interface StepDayData {
  date: string;
  total: number;
  readings: StepReading[];
  rawDate: Date;
}

interface WorkoutData {
  date: string;
  activityType: string;
  duration: string;
  calories: string;
  distance: string;
  rawDate: Date;
}

export default function ActivityScreen() {
  const [steps, setSteps] = useState<StepDayData[]>([]);
  const [heartRates, setHeartRates] = useState<HeartRateDayData[]>([]);
  const [vo2Maxes, setVo2Maxes] = useState<DayData[]>([]);
  const [workouts, setWorkouts] = useState<WorkoutData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedHeartRateDay, setSelectedHeartRateDay] = useState<HeartRateDayData | null>(null);
  const [showHeartRateModal, setShowHeartRateModal] = useState(false);
  const [selectedStepDay, setSelectedStepDay] = useState<StepDayData | null>(null);
  const [showStepModal, setShowStepModal] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string>('');

  useEffect(() => {
    initializeAndFetch();
  }, []);

  const formatDate = (date: Date | string): string => {
    const d = typeof date === 'string' ? new Date(date) : date;
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
  };

  const formatTime = (date: Date | string): string => {
    const d = typeof date === 'string' ? new Date(date) : date;
    const hours = d.getHours();
    const minutes = d.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    const displayMinutes = minutes < 10 ? `0${minutes}` : minutes;
    return `${displayHours}:${displayMinutes} ${ampm}`;
  };

  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const initializeAndFetch = async () => {
    try {
      setLoading(true);
      setError(null);

      // Initialize HealthKit
      const success = await healthKitManager.initialize();
      if (!success) {
        setError('HealthKit not available. Please use a real iOS device with Health app.');
        setLoading(false);
        return;
      }

      await fetchHistoricalData();
    } catch (err: any) {
      console.error('❌ Error initializing:', err);
      setError('Failed to load health data');
    } finally {
      setLoading(false);
    }
  };

  const fetchHistoricalData = async () => {
    try {
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      console.log('📊 Fetching 30-day historical data...');

      // Fetch Step samples and group by day with full readings
      const stepSamples = await healthKitManager.getStepSamples(thirtyDaysAgo);
      console.log(`📊 Fetched ${stepSamples.length} step samples from ${thirtyDaysAgo.toISOString()}`);

      // Debug: Log first few samples
      if (stepSamples.length > 0) {
        console.log('First 3 step samples:', stepSamples.slice(0, 3).map(s => ({
          value: s.value,
          date: new Date(s.startDate).toISOString()
        })));
      }

      const stepGrouped: Record<string, StepReading[]> = {};

      stepSamples.forEach((sample) => {
        const timestamp = new Date(sample.startDate);
        const dateStr = formatDate(timestamp);
        const timeStr = formatTime(timestamp);

        // Debug: Log samples around midnight
        if (timestamp.getHours() === 0 || timestamp.getHours() === 23) {
          console.log(`🕐 Midnight sample: ${timestamp.toISOString()} -> grouped as "${dateStr}" at ${timeStr}, value: ${sample.value}`);
        }

        if (!stepGrouped[dateStr]) {
          stepGrouped[dateStr] = [];
        }

        stepGrouped[dateStr].push({
          value: Math.round(sample.value),
          time: timeStr,
          timestamp: timestamp,
        });
      });

      console.log(`📊 Grouped into ${Object.keys(stepGrouped).length} days:`, Object.keys(stepGrouped));

      // Debug: Log sample count per day
      Object.entries(stepGrouped).forEach(([date, readings]) => {
        console.log(`📊 ${date}: ${readings.length} samples, total: ${readings.reduce((sum, r) => sum + r.value, 0)} steps`);
      });

      const stepsData: StepDayData[] = Object.entries(stepGrouped).map(([date, readings]) => {
        // Calculate total steps for the day
        const total = readings.reduce((sum, r) => sum + r.value, 0);

        // Sort readings by time (most recent first)
        const sortedReadings = readings.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

        return {
          date,
          total,
          readings: sortedReadings,
          rawDate: new Date(date),
        };
      }).sort((a, b) => b.rawDate.getTime() - a.rawDate.getTime());
      setSteps(stepsData);

      // Fetch Heart Rate samples and group by day with full readings
      const hrSamples = await healthKitManager.getHeartRateSamples(thirtyDaysAgo);
      console.log(`📊 Fetched ${hrSamples.length} heart rate samples from ${thirtyDaysAgo.toISOString()}`);

      // Debug: Log first few samples
      if (hrSamples.length > 0) {
        console.log('First 3 samples:', hrSamples.slice(0, 3).map(s => ({
          value: s.value,
          date: new Date(s.startDate).toISOString()
        })));
      }

      const hrGrouped: Record<string, HeartRateReading[]> = {};

      hrSamples.forEach((sample) => {
        const dateStr = formatDate(sample.startDate);
        const timeStr = formatTime(sample.startDate);

        if (!hrGrouped[dateStr]) {
          hrGrouped[dateStr] = [];
        }

        hrGrouped[dateStr].push({
          value: Math.round(sample.value),
          time: timeStr,
          timestamp: new Date(sample.startDate),
        });
      });

      console.log(`📊 Grouped into ${Object.keys(hrGrouped).length} days:`, Object.keys(hrGrouped));

      const hrData: HeartRateDayData[] = Object.entries(hrGrouped).map(([date, readings]) => {
        const values = readings.map(r => r.value);
        const min = Math.min(...values);
        const max = Math.max(...values);

        // Sort readings by time (most recent first)
        const sortedReadings = readings.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

        return {
          date,
          range: `${min} – ${max}`,
          min,
          max,
          readings: sortedReadings,
          rawDate: new Date(date),
        };
      }).sort((a, b) => b.rawDate.getTime() - a.rawDate.getTime());
      setHeartRates(hrData);

      // Fetch VO2 Max
      const vo2Samples = await healthKitManager.getVO2MaxSamples(thirtyDaysAgo);
      const vo2Data: DayData[] = vo2Samples.map(sample => ({
        date: formatDate(sample.startDate),
        value: `${sample.value.toFixed(1)} ml/kg/min`,
        rawDate: new Date(sample.startDate),
      })).sort((a, b) => b.rawDate.getTime() - a.rawDate.getTime());
      setVo2Maxes(vo2Data);

      // Fetch Workouts
      const workoutSamples = await healthKitManager.getWorkouts(thirtyDaysAgo);
      const workoutData: WorkoutData[] = workoutSamples.map(workout => {
        const duration = workout.duration / 60; // Convert seconds to minutes
        return {
          date: formatDate(workout.startDate),
          activityType: workout.activityType,
          duration: formatDuration(duration),
          calories: workout.calories > 0 ? `${Math.round(workout.calories)} cal` : '-',
          distance: workout.distance && workout.distance > 0 ? `${workout.distance.toFixed(2)} mi` : '-',
          rawDate: new Date(workout.startDate),
        };
      }).sort((a, b) => b.rawDate.getTime() - a.rawDate.getTime());
      setWorkouts(workoutData);

      console.log('✅ Historical data loaded:', {
        steps: stepsData.length,
        heartRate: hrData.length,
        vo2Max: vo2Data.length,
        workouts: workoutData.length,
      });
    } catch (err: any) {
      console.error('❌ Error fetching historical data:', err);
      setError('Failed to fetch health data');
    }
  };

  const handleSyncToBackend = async () => {
    try {
      setSyncing(true);
      setSyncStatus('Syncing health data to backend...');
      console.log('🔄 Starting backend sync...');

      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const result = await syncAllHealthData(thirtyDaysAgo, new Date());

      if (result.overall.success) {
        setSyncStatus(`✅ Synced ${result.overall.totalSynced} records successfully!`);
        console.log('✅ Sync complete:', result);
      } else {
        setSyncStatus(`⚠️ Partial sync: ${result.overall.totalSynced} synced, ${result.overall.totalErrors} errors`);
        console.warn('⚠️ Sync had errors:', result);
      }

      // Clear status after 3 seconds
      setTimeout(() => setSyncStatus(''), 3000);
    } catch (err: any) {
      console.error('❌ Sync error:', err);
      setSyncStatus('❌ Sync failed');
      setTimeout(() => setSyncStatus(''), 3000);
    } finally {
      setSyncing(false);
    }
  };

  const renderStepsTable = () => {
    // Show maximum 10 most recent entries
    const displayData = steps.slice(0, 10);

    return (
      <View style={styles.tableContainer}>
        <View style={styles.tableTitleRow}>
          <Ionicons name="footsteps" size={20} color="#175CD3" />
          <Text style={styles.tableTitle}>Steps</Text>
          <Text style={styles.tableCount}>({steps.length} days)</Text>
        </View>

        {steps.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No data available for the last 30 days</Text>
          </View>
        ) : (
          <>
            <View style={styles.tableHeader}>
              <Text style={[styles.cell, styles.headerCell, { flex: 1.5 }]}>Date</Text>
              <Text style={[styles.cell, styles.headerCell, { flex: 1, textAlign: 'right' }]}>Steps</Text>
            </View>
            {displayData.map((item, index) => (
              <TouchableOpacity
                key={`steps-${item.date}-${index}`}
                style={[styles.tableRow, styles.clickableRow, index % 2 === 0 && styles.tableRowAlt]}
                onPress={() => {
                  setSelectedStepDay(item);
                  setShowStepModal(true);
                }}
              >
                <Text style={[styles.cell, { flex: 1.5 }]}>{item.date}</Text>
                <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end' }}>
                  <Text style={[styles.cell, styles.valueText]}>{item.total.toLocaleString()}</Text>
                  <Ionicons name="chevron-forward" size={16} color="#9CA3AF" style={{ marginLeft: 8 }} />
                </View>
              </TouchableOpacity>
            ))}
            {steps.length > 10 && (
              <Text style={styles.moreText}>+ {steps.length - 10} more entries</Text>
            )}
          </>
        )}
      </View>
    );
  };

  const renderHeartRateTable = () => {
    // Show maximum 10 most recent entries
    const displayData = heartRates.slice(0, 10);

    return (
      <View style={styles.tableContainer}>
        <View style={styles.tableTitleRow}>
          <Ionicons name="heart" size={20} color="#175CD3" />
          <Text style={styles.tableTitle}>Heart Rate</Text>
          <Text style={styles.tableCount}>({heartRates.length} days)</Text>
        </View>

        {heartRates.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No data available for the last 30 days</Text>
          </View>
        ) : (
          <>
            <View style={styles.tableHeader}>
              <Text style={[styles.cell, styles.headerCell, { flex: 1.5 }]}>Date</Text>
              <Text style={[styles.cell, styles.headerCell, { flex: 1, textAlign: 'right' }]}>Beats per Minute</Text>
            </View>
            {displayData.map((item, index) => (
              <TouchableOpacity
                key={`heartrate-${item.date}-${index}`}
                style={[styles.tableRow, styles.clickableRow, index % 2 === 0 && styles.tableRowAlt]}
                onPress={() => {
                  setSelectedHeartRateDay(item);
                  setShowHeartRateModal(true);
                }}
              >
                <Text style={[styles.cell, { flex: 1.5 }]}>{item.date}</Text>
                <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end' }}>
                  <Text style={[styles.cell, styles.valueText]}>{item.range}</Text>
                  <Ionicons name="chevron-forward" size={16} color="#9CA3AF" style={{ marginLeft: 8 }} />
                </View>
              </TouchableOpacity>
            ))}
            {heartRates.length > 10 && (
              <Text style={styles.moreText}>+ {heartRates.length - 10} more entries</Text>
            )}
          </>
        )}
      </View>
    );
  };

  const renderBasicTable = (title: string, data: DayData[], icon: keyof typeof Ionicons.glyphMap) => {
    // Show maximum 10 most recent entries
    const displayData = data.slice(0, 10);

    return (
      <View style={styles.tableContainer}>
        <View style={styles.tableTitleRow}>
          <Ionicons name={icon} size={20} color="#175CD3" />
          <Text style={styles.tableTitle}>{title}</Text>
          <Text style={styles.tableCount}>({data.length} entries)</Text>
        </View>

        {data.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No data available for the last 30 days</Text>
          </View>
        ) : (
          <>
            <View style={styles.tableHeader}>
              <Text style={[styles.cell, styles.headerCell, { flex: 1.5 }]}>Date</Text>
              <Text style={[styles.cell, styles.headerCell, { flex: 1, textAlign: 'right' }]}>Value</Text>
            </View>
            {displayData.map((item, index) => (
              <View key={`${title}-${item.date}-${index}`} style={[styles.tableRow, index % 2 === 0 && styles.tableRowAlt]}>
                <Text style={[styles.cell, { flex: 1.5 }]}>{item.date}</Text>
                <Text style={[styles.cell, styles.valueText, { flex: 1, textAlign: 'right' }]}>{item.value}</Text>
              </View>
            ))}
            {data.length > 10 && (
              <Text style={styles.moreText}>+ {data.length - 10} more entries</Text>
            )}
          </>
        )}
      </View>
    );
  };

  const renderWorkoutsTable = () => {
    // Show maximum 10 most recent workouts
    const displayWorkouts = workouts.slice(0, 10);

    return (
      <View style={styles.tableContainer}>
        <View style={styles.tableTitleRow}>
          <Ionicons name="fitness" size={20} color="#175CD3" />
          <Text style={styles.tableTitle}>Workouts</Text>
          <Text style={styles.tableCount}>({workouts.length} workouts)</Text>
        </View>

        {workouts.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No workouts logged in the last 30 days</Text>
            <Text style={styles.emptySubtext}>Start a workout in the Apple Fitness app to see it here</Text>
          </View>
        ) : (
          <>
            <View style={styles.tableHeader}>
              <Text style={[styles.cell, styles.headerCell, { flex: 1.2 }]}>Date</Text>
              <Text style={[styles.cell, styles.headerCell, { flex: 1.2 }]}>Activity</Text>
              <Text style={[styles.cell, styles.headerCell, { flex: 0.8 }]}>Duration</Text>
              <Text style={[styles.cell, styles.headerCell, { flex: 0.7 }]}>Calories</Text>
              <Text style={[styles.cell, styles.headerCell, { flex: 0.7 }]}>Distance</Text>
            </View>
            {displayWorkouts.map((item, index) => (
              <View key={`workout-${index}`} style={[styles.tableRow, index % 2 === 0 && styles.tableRowAlt]}>
                <Text style={[styles.cell, styles.smallText, { flex: 1.2 }]}>{item.date}</Text>
                <Text style={[styles.cell, styles.activityText, { flex: 1.2 }]}>{item.activityType}</Text>
                <Text style={[styles.cell, styles.smallText, { flex: 0.8 }]}>{item.duration}</Text>
                <Text style={[styles.cell, styles.smallText, { flex: 0.7 }]}>{item.calories}</Text>
                <Text style={[styles.cell, styles.smallText, { flex: 0.7 }]}>{item.distance}</Text>
              </View>
            ))}
            {workouts.length > 10 && (
              <Text style={styles.moreText}>+ {workouts.length - 10} more workouts</Text>
            )}
          </>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#175CD3" />
        <Text style={styles.loadingText}>Loading Health Data…</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={48} color="#DC2626" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={initializeAndFetch}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Health Activity</Text>
          <Text style={styles.headerSubtitle}>Last 30 days of data from Apple Health</Text>
        </View>

        <View style={styles.contentContainer}>
          {/* Sync to Backend Button */}
          <TouchableOpacity
            style={[styles.syncButton, syncing && styles.syncButtonDisabled]}
            onPress={handleSyncToBackend}
            disabled={syncing}
          >
            {syncing ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Ionicons name="cloud-upload-outline" size={20} color="#FFFFFF" />
            )}
            <Text style={styles.syncButtonText}>
              {syncing ? 'Syncing to Backend...' : 'Sync to Backend'}
            </Text>
          </TouchableOpacity>

          {/* HealthKit Data Display */}
          <HealthKitDataDisplay />

          {syncStatus !== '' && (
            <View style={styles.syncStatusContainer}>
              <Text style={styles.syncStatusText}>{syncStatus}</Text>
            </View>
          )}

          {renderBasicTable("VO₂ Max", vo2Maxes, "fitness-outline")}
          {renderWorkoutsTable()}
          {renderHeartRateTable()}
          {renderStepsTable()}

          <View style={styles.footer}>
            <Text style={styles.footerText}>Data synced from Apple Health</Text>
            <TouchableOpacity onPress={fetchHistoricalData}>
              <Ionicons name="refresh" size={20} color="#175CD3" />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Step Detail Modal */}
      <Modal
        visible={showStepModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowStepModal(false)}
      >
        <SafeAreaView style={styles.modalContainer} edges={["top", "bottom"]}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowStepModal(false)}>
              <Ionicons name="close" size={28} color="#111827" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Steps</Text>
            <View style={{ width: 28 }} />
          </View>

          {selectedStepDay && (
            <>
              <View style={styles.modalDateSection}>
                <Text style={styles.modalDate}>{selectedStepDay.date}</Text>
                <Text style={styles.modalSubtitle}>
                  {selectedStepDay.readings.length} readings
                </Text>
              </View>

              <ScrollView style={styles.modalContent}>
                <View style={styles.readingsContainer}>
                  <Text style={styles.readingsHeader}>Steps</Text>
                  {selectedStepDay.readings.map((reading, index) => (
                    <View
                      key={`reading-${index}`}
                      style={[styles.readingRow, index % 2 === 0 && styles.readingRowAlt]}
                    >
                      <View style={styles.stepIconContainer}>
                        <Ionicons name="footsteps" size={16} color="#175CD3" />
                      </View>
                      <Text style={styles.readingValue}>{reading.value}</Text>
                      <Text style={styles.readingTime}>{reading.time}</Text>
                    </View>
                  ))}
                </View>
              </ScrollView>
            </>
          )}
        </SafeAreaView>
      </Modal>

      {/* Heart Rate Detail Modal */}
      <Modal
        visible={showHeartRateModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowHeartRateModal(false)}
      >
        <SafeAreaView style={styles.modalContainer} edges={["top", "bottom"]}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowHeartRateModal(false)}>
              <Ionicons name="close" size={28} color="#111827" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Heart Rate</Text>
            <View style={{ width: 28 }} />
          </View>

          {selectedHeartRateDay && (
            <>
              <View style={styles.modalDateSection}>
                <Text style={styles.modalDate}>{selectedHeartRateDay.date}</Text>
                <Text style={styles.modalSubtitle}>
                  {selectedHeartRateDay.readings.length} readings
                </Text>
              </View>

              <ScrollView style={styles.modalContent}>
                <View style={styles.readingsContainer}>
                  <Text style={styles.readingsHeader}>Beats per Minute</Text>
                  {selectedHeartRateDay.readings.map((reading, index) => (
                    <View
                      key={`reading-${index}`}
                      style={[styles.readingRow, index % 2 === 0 && styles.readingRowAlt]}
                    >
                      <View style={styles.readingIconContainer}>
                        <Ionicons name="heart" size={16} color="#DC2626" />
                      </View>
                      <Text style={styles.readingValue}>{reading.value}</Text>
                      <Text style={styles.readingTime}>{reading.time}</Text>
                    </View>
                  ))}
                </View>
              </ScrollView>
            </>
          )}
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F9FAFB",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#6B7280",
  },
  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F9FAFB",
    padding: 24,
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: "#374151",
    textAlign: "center",
  },
  retryButton: {
    marginTop: 24,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: "#175CD3",
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  header: {
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingTop: 16,
    backgroundColor: "#F9FAFB",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#6B7280",
  },
  tableContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  tableTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 8,
  },
  tableTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    flex: 1,
  },
  tableCount: {
    fontSize: 13,
    color: "#6B7280",
  },
  tableHeader: {
    flexDirection: "row",
    borderBottomWidth: 2,
    borderColor: "#E5E7EB",
    paddingBottom: 8,
    marginBottom: 4,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: "#F3F4F6",
  },
  tableRowAlt: {
    backgroundColor: "#F9FAFB",
  },
  cell: {
    fontSize: 14,
    color: "#374151",
  },
  headerCell: {
    fontWeight: "600",
    color: "#111827",
    fontSize: 13,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  valueText: {
    fontWeight: "600",
    color: "#175CD3",
  },
  smallText: {
    fontSize: 13,
  },
  activityText: {
    fontWeight: "600",
    color: "#7C3AED",
  },
  emptyState: {
    paddingVertical: 32,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
  },
  emptySubtext: {
    fontSize: 12,
    color: "#9CA3AF",
    textAlign: "center",
    marginTop: 4,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    marginTop: 16,
    paddingVertical: 16,
  },
  footerText: {
    fontSize: 13,
    color: "#6B7280",
  },
  moreText: {
    fontSize: 12,
    color: "#9CA3AF",
    textAlign: "center",
    paddingVertical: 8,
    fontStyle: "italic",
  },
  clickableRow: {
    cursor: "pointer",
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
  },
  modalDateSection: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  modalDate: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 15,
    color: "#6B7280",
  },
  modalContent: {
    flex: 1,
  },
  readingsContainer: {
    backgroundColor: "#FFFFFF",
    marginTop: 16,
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  readingsHeader: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6B7280",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  readingRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  readingRowAlt: {
    backgroundColor: "#F9FAFB",
  },
  readingIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#FEE2E2",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  stepIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#DBEAFE",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  readingValue: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    flex: 1,
  },
  readingTime: {
    fontSize: 15,
    color: "#6B7280",
  },
  // Sync button styles
  syncButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#175CD3",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 16,
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  syncButtonDisabled: {
    backgroundColor: "#9CA3AF",
    opacity: 0.7,
  },
  syncButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  syncStatusContainer: {
    backgroundColor: "#F0F9FF",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#175CD3",
  },
  syncStatusText: {
    fontSize: 14,
    color: "#1E40AF",
    fontWeight: "500",
  },
});
