# HealthKit Integration Guide

## Overview

This app integrates with **Apple HealthKit** to read health data from Apple Watch (synced via iPhone). No watchOS app is required for historical data access.

## What's Implemented

### ✅ HealthKit Manager (`src/features/health/healthKit.ts`)

A comprehensive wrapper for accessing Apple Watch health data:

- **Heart Rate** - Get heart rate samples and latest reading
- **VO2 Max** - Access cardio fitness data
- **Workouts** - Retrieve workout history
- **Step Count** - Daily step tracking
- **Resting HR & HRV** - Additional metrics

### ✅ AI Coaching Integration

- **Hook**: `src/hooks/useCoachingRecommendations.ts`
- **API**: Connects to `/api/v1/recommendations/generate`
- **Dashboard**: Real-time AI coaching insights on home screen

## Installation Required

```bash
npm install react-native-health
```

Then update your iOS project:

```bash
cd ios && pod install
```

### Add HealthKit Capability

1. Open `ios/YourApp.xcworkspace` in Xcode
2. Select your target → **Signing & Capabilities**
3. Click **+ Capability** → Add **HealthKit**
4. In `Info.plist`, add:

```xml
<key>NSHealthShareUsageDescription</key>
<string>We need access to your health data to provide personalized fitness coaching and track your progress</string>
<key>NSHealthUpdateUsageDescription</key>
<string>We need access to save workout data to your Health app</string>
```

## Usage

### Initialize HealthKit

```typescript
import { healthKitManager } from './src/features/health/healthKit';

// Request permissions and initialize
const success = await healthKitManager.initialize();

if (success) {
  console.log('HealthKit ready!');
}
```

### Get Latest Data

```typescript
// Get latest heart rate (from last 15 minutes)
const heartRate = await healthKitManager.getLatestHeartRate();
console.log('Current HR:', heartRate, 'bpm');

// Get latest VO2 Max (from last 30 days)
const vo2Max = await healthKitManager.getLatestVO2Max();
console.log('VO2 Max:', vo2Max, 'ml/kg/min');

// Get today's steps
const steps = await healthKitManager.getDailySteps();
console.log('Steps today:', steps);
```

### Get Historical Data

```typescript
// Heart rate samples from last 7 days
const startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
const heartRates = await healthKitManager.getHeartRateSamples(startDate);

heartRates.forEach(sample => {
  console.log(`HR: ${sample.value} bpm at ${sample.startDate}`);
});
```

### Sync to Backend

```typescript
import { apiClient } from './src/lib/api';

// Sync last 7 days of data to backend
await healthKitManager.syncToBackend(apiClient);
```

## Data Flow

```
Apple Watch → iPhone Health App → HealthKit → React Native App → Backend API
```

### Key Points

✅ **No Mac connection needed** - Data syncs automatically via iPhone
✅ **Historical data available** - Last 30-90 days typically
⚠️ **5-60s sync delay** - Not real-time (that requires watchOS app)
✅ **Background sync** - Data updates when Watch is near iPhone

## Real-Time Monitoring (Future)

For **live workout tracking** (heart rate every second during exercise), you would need:

1. **watchOS Companion App** - Small Swift app on Watch
2. **HKLiveWorkoutBuilder** - Streams live sensor data
3. **WatchConnectivity** - Sends to iPhone instantly
4. **React Native Bridge** - Receives in your app

This is optional and only needed for real-time workout features.

## AI Coaching Features

### Dashboard Integration

The home dashboard now shows AI-powered coaching recommendations:

- **Automatic Loading**: Fetches recommendations on mount
- **Loading State**: Shows spinner while loading
- **Empty State**: Guides user to complete profile
- **Refresh Button**: Manual refresh of recommendations
- **Dynamic Icons**: Category-based icons (VO2, Race, Recovery, Training)

### Recommendations Categories

- `vo2` - VO2 Max improvements
- `race` - Race time optimizations
- `training` - Workout suggestions
- `recovery` - Rest and recovery tips
- `profile` - Profile completion prompts
- `device` - Device connection reminders

### Backend API

```typescript
// Generate comprehensive recommendations
GET /api/v1/recommendations/generate

// Get quick action items
GET /api/v1/recommendations/quick-actions

// Get data summary
GET /api/v1/recommendations/summary
```

## Troubleshooting

### HealthKit Not Available

```typescript
if (!healthKitManager.isAvailable()) {
  console.log('HealthKit not available - iOS only');
}
```

### Permission Denied

User must approve permissions in iOS Settings → Privacy → Health → Your App

### No Data

- Check if Apple Watch is paired and syncing
- Verify Health app has recent data
- Ensure user wore Watch recently

## Example: Dashboard Implementation

```typescript
import { useCoachingRecommendations } from './src/hooks/useCoachingRecommendations';

function Dashboard() {
  const { recommendations, loading, refresh } = useCoachingRecommendations();

  return (
    <View>
      {loading ? (
        <ActivityIndicator />
      ) : (
        recommendations.map(rec => (
          <RecommendationCard key={rec.title} {...rec} />
        ))
      )}
      <Button onPress={refresh}>Refresh</Button>
    </View>
  );
}
```

## Next Steps

1. ✅ Install `react-native-health`
2. ✅ Add HealthKit capability in Xcode
3. ✅ Initialize on app launch
4. ✅ Test on physical iPhone with paired Watch
5. 🚀 Build backend sync endpoints
6. 🚀 Implement real-time monitoring (optional)

## Resources

- [react-native-health Documentation](https://github.com/agencyenterprise/react-native-health)
- [Apple HealthKit Framework](https://developer.apple.com/documentation/healthkit)
- [WatchConnectivity Guide](https://developer.apple.com/documentation/watchconnectivity)
