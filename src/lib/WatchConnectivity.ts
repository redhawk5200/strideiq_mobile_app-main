// WatchConnectivity.ts
// TypeScript interface for React Native Watch Connectivity

import { NativeModules, NativeEventEmitter, EmitterSubscription, Platform } from 'react-native';

interface WatchConnectivityModule {
  startWorkout(workoutType: string, duration: number): void;
  pauseWorkout(): void;
  syncUserSettings(settings: Record<string, any>): void;
  sendMessageToWatch(message: Record<string, any>): Promise<Record<string, any>>;
}

const { WatchConnectivityBridge } = NativeModules;

// Check if the native module exists before creating the event emitter
let watchEventEmitter: NativeEventEmitter | null = null;

if (WatchConnectivityBridge) {
  watchEventEmitter = new NativeEventEmitter(WatchConnectivityBridge);
} else {
  console.warn('WatchConnectivityBridge native module not found. Watch functionality will be disabled.');
}

export class WatchConnectivity {
  private static eventListeners: EmitterSubscription[] = [];

  // Send commands to watch
  static startWorkout(workoutType: string, durationInSeconds: number): void {
    if (WatchConnectivityBridge) {
      WatchConnectivityBridge.startWorkout(workoutType, durationInSeconds);
    } else {
      console.log('Mock: Starting workout:', workoutType, 'for', durationInSeconds, 'seconds');
    }
  }

  static pauseWorkout(): void {
    if (WatchConnectivityBridge) {
      WatchConnectivityBridge.pauseWorkout();
    } else {
      console.log('Mock: Pausing workout');
    }
  }

  static syncUserSettings(settings: Record<string, any>): void {
    if (WatchConnectivityBridge) {
      WatchConnectivityBridge.syncUserSettings(settings);
    } else {
      console.log('Mock: Syncing user settings:', settings);
    }
  }

  static async sendMessage(message: Record<string, any>): Promise<Record<string, any>> {
    try {
      if (WatchConnectivityBridge) {
        const reply = await WatchConnectivityBridge.sendMessageToWatch(message);
        return reply;
      } else {
        console.log('Mock: Sending message to watch:', message);
        return { status: 'mock_reply', timestamp: Date.now() };
      }
    } catch (error) {
      console.error('Failed to send message to watch:', error);
      throw error;
    }
  }

  // Event listeners for watch messages
  static onWatchMessage(callback: (message: Record<string, any>) => void): EmitterSubscription {
    if (watchEventEmitter) {
      const listener = watchEventEmitter.addListener('watchMessage', callback);
      this.eventListeners.push(listener);
      return listener;
    } else {
      // Return a mock subscription for development
      return {
        remove: () => console.log('Mock: Removing watch message listener')
      } as EmitterSubscription;
    }
  }

  static onWorkoutStart(callback: (data: Record<string, any>) => void): EmitterSubscription {
    if (watchEventEmitter) {
      const listener = watchEventEmitter.addListener('watchWorkoutStart', callback);
      this.eventListeners.push(listener);
      return listener;
    } else {
      return {
        remove: () => console.log('Mock: Removing workout start listener')
      } as EmitterSubscription;
    }
  }

  static onWorkoutPause(callback: (data: Record<string, any>) => void): EmitterSubscription {
    if (watchEventEmitter) {
      const listener = watchEventEmitter.addListener('watchWorkoutPause', callback);
      this.eventListeners.push(listener);
      return listener;
    } else {
      return {
        remove: () => console.log('Mock: Removing workout pause listener')
      } as EmitterSubscription;
    }
  }

  static onWorkoutEnd(callback: (data: Record<string, any>) => void): EmitterSubscription {
    if (watchEventEmitter) {
      const listener = watchEventEmitter.addListener('watchWorkoutEnd', callback);
      this.eventListeners.push(listener);
      return listener;
    } else {
      return {
        remove: () => console.log('Mock: Removing workout end listener')
      } as EmitterSubscription;
    }
  }

  static onHeartRateUpdate(callback: (data: { heartRate: number; timestamp: number }) => void): EmitterSubscription {
    if (watchEventEmitter) {
      const listener = watchEventEmitter.addListener('watchHeartRateUpdate', callback);
      this.eventListeners.push(listener);
      return listener;
    } else {
      // Return empty subscription when native module not available
      // No mock data - requires real Apple Watch connection
      return {
        remove: () => console.log('Mock: Removing heart rate update listener')
      } as EmitterSubscription;
    }
  }

  static onConnectionChanged(callback: (data: { isConnected: boolean }) => void): EmitterSubscription {
    if (watchEventEmitter) {
      const listener = watchEventEmitter.addListener('watchConnectionChanged', callback);
      this.eventListeners.push(listener);
      return listener;
    } else {
      // For development, simulate connection status
      setTimeout(() => {
        callback({ isConnected: false }); // Mock as disconnected since no real watch
      }, 1000);

      return {
        remove: () => console.log('Mock: Removing connection changed listener')
      } as EmitterSubscription;
    }
  }

  // Clean up listeners
  static removeAllListeners(): void {
    this.eventListeners.forEach(listener => listener.remove());
    this.eventListeners = [];
  }
}

export default WatchConnectivity;