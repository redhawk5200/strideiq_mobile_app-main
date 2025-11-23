import React, { useEffect, useState } from 'react';
import { View, Text, Button, Alert, StyleSheet } from 'react-native';
import { WatchConnectivity } from '../../lib/WatchConnectivity';

export const ExampleWatchUsage: React.FC = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [lastHeartRate, setLastHeartRate] = useState<number | null>(null);
  const [workoutStatus, setWorkoutStatus] = useState<string>('idle');

  useEffect(() => {
    // Set up event listeners
    const listeners = [
      WatchConnectivity.onConnectionChanged((data) => {
        setIsConnected(data.isConnected);
        console.log('Watch connection status:', data.isConnected);
      }),

      WatchConnectivity.onHeartRateUpdate((data) => {
        setLastHeartRate(data.heartRate);
        console.log('Heart rate update:', data.heartRate, 'BPM');
      }),

      WatchConnectivity.onWorkoutStart((data) => {
        setWorkoutStatus('started');
        console.log('Workout started on watch:', data);
        Alert.alert('Workout Started', `Type: ${data.workoutType || 'Unknown'}`);
      }),

      WatchConnectivity.onWorkoutPause((data) => {
        setWorkoutStatus('paused');
        console.log('Workout paused on watch:', data);
        Alert.alert('Workout Paused', 'Your workout has been paused from the watch');
      }),

      WatchConnectivity.onWorkoutEnd((data) => {
        setWorkoutStatus('ended');
        console.log('Workout ended on watch:', data);
        Alert.alert(
          'Workout Completed', 
          `Duration: ${Math.round((data.duration || 0) / 60)} minutes\nCalories: ${data.calories || 'N/A'}`
        );
      }),

      WatchConnectivity.onWatchMessage((message) => {
        console.log('Generic watch message:', message);
      })
    ];

    // Cleanup listeners on unmount
    return () => {
      listeners.forEach(listener => listener.remove());
    };
  }, []);

  const handleStartWorkout = async () => {
    try {
      WatchConnectivity.startWorkout('running', 1800); // 30 minutes
      Alert.alert('Success', 'Workout started on watch');
    } catch (error) {
      console.error('Failed to start workout:', error);
      Alert.alert('Error', 'Failed to start workout on watch');
    }
  };

  const handlePauseWorkout = () => {
    try {
      WatchConnectivity.pauseWorkout();
      Alert.alert('Success', 'Workout paused on watch');
    } catch (error) {
      console.error('Failed to pause workout:', error);
      Alert.alert('Error', 'Failed to pause workout on watch');
    }
  };

  const handleSyncSettings = () => {
    const userSettings = {
      targetHeartRate: 150,
      workoutGoals: {
        dailySteps: 10000,
        weeklyWorkouts: 5
      },
      preferences: {
        units: 'metric',
        notifications: true
      }
    };

    try {
      WatchConnectivity.syncUserSettings(userSettings);
      Alert.alert('Success', 'Settings synced to watch');
    } catch (error) {
      console.error('Failed to sync settings:', error);
      Alert.alert('Error', 'Failed to sync settings to watch');
    }
  };

  const handleSendCustomMessage = async () => {
    try {
      const message = {
        type: 'custom_action',
        action: 'show_notification',
        title: 'Hello from iPhone!',
        body: 'This is a test notification'
      };

      const reply = await WatchConnectivity.sendMessage(message);
      console.log('Watch replied:', reply);
      Alert.alert('Success', 'Custom message sent and acknowledged');
    } catch (error) {
      console.error('Failed to send custom message:', error);
      Alert.alert('Error', 'Failed to send message to watch');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Apple Watch Integration</Text>
      
      <View style={styles.statusRow}>
        <View 
          style={[
            styles.statusIndicator,
            { backgroundColor: isConnected ? 'green' : 'red' }
          ]}
        />
        <Text>{isConnected ? 'Connected to Watch' : 'Watch Disconnected'}</Text>
      </View>

      {lastHeartRate && (
        <Text style={styles.heartRate}>
          Last Heart Rate: {Math.round(lastHeartRate)} BPM
        </Text>
      )}

      <Text style={styles.workoutStatus}>
        Workout Status: {workoutStatus}
      </Text>

      <View style={styles.buttonContainer}>
        <Button 
          title="Start Workout on Watch" 
          onPress={handleStartWorkout}
          disabled={!isConnected}
        />
        
        <Button 
          title="Pause Workout on Watch" 
          onPress={handlePauseWorkout}
          disabled={!isConnected}
        />
        
        <Button 
          title="Sync Settings to Watch" 
          onPress={handleSyncSettings}
          disabled={!isConnected}
        />
        
        <Button 
          title="Send Custom Message" 
          onPress={handleSendCustomMessage}
          disabled={!isConnected}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  statusIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  heartRate: {
    marginBottom: 15,
  },
  workoutStatus: {
    marginBottom: 15,
  },
  buttonContainer: {
    gap: 10,
  },
});