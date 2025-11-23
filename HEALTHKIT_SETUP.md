# HealthKit Setup - Quick Start

## Current Status

✅ **Library Installed**: `react-native-health` v1.19.0
✅ **Code Implemented**: HealthKit manager and UI components ready
✅ **Mock Data Enabled**: Demo data shown until real HealthKit works

## What You'll See Now

The dashboard now displays a **"Apple Health Data"** card with:
- ❤️ Heart Rate: 72 bpm (demo)
- ⚡ VO₂ Max: 45 ml/kg/min (demo)
- 🚶 Steps Today: 8,234 (demo)
- 💪 Workouts: 5 last 7 days (demo)

Plus an orange banner: "Showing demo data. Connect Apple Watch and grant permissions to see real health data."

## To Get Real Data

### 1. Run on Real iOS Device

HealthKit **does NOT work in simulator**. You must:

```bash
# Connect your iPhone via USB
npx react-native run-ios --device

# Or build in Xcode and run on device
```

### 2. Enable HealthKit in Xcode

1. Open `ios/strideiq_mobile_app.xcworkspace` in Xcode
2. Select your app target
3. Go to **Signing & Capabilities**
4. Click **+ Capability**
5. Add **HealthKit**
6. Save

### 3. Add Privacy Descriptions

In `ios/strideiq_mobile_app/Info.plist`, add:

```xml
<key>NSHealthShareUsageDescription</key>
<string>We need access to your health data to provide personalized fitness coaching</string>
<key>NSHealthUpdateUsageDescription</key>
<string>We save workout data to your Health app</string>
```

### 4. Rebuild iOS App

```bash
cd ios && pod install && cd ..
npx react-native run-ios --device
```

### 5. Grant Permissions

When the app launches:
1. Tap on the Health Data card
2. iOS will prompt for HealthKit permissions
3. Toggle ON the data types you want to share:
   - ✅ Heart Rate
   - ✅ VO₂ Max
   - ✅ Steps
   - ✅ Workouts
4. Tap **Allow**

### 6. See Real Data

The orange banner will disappear and you'll see actual data from your Apple Watch!

## Troubleshooting

### "HealthKit not available"
- ✅ Make sure you're on a **real iPhone** (not simulator)
- ✅ Check HealthKit capability is enabled in Xcode
- ✅ Rebuild after adding capability

### "No data showing"
- ✅ Make sure Apple Watch is paired and syncing
- ✅ Open the Health app on iPhone to verify data exists
- ✅ Grant permissions when prompted
- ✅ Wear your Watch for at least a day to generate data

### Still showing mock data
- ✅ Check console logs for errors
- ✅ Verify `Info.plist` has privacy descriptions
- ✅ Try rebooting iPhone and Watch
- ✅ Re-pair Apple Watch if needed

## Testing Without Watch

If you don't have an Apple Watch:
- The demo data will continue to show
- You can still test the UI
- Or manually enter health data in the Health app on iPhone
- The app will read whatever is in HealthKit

## Files Modified

- ✅ `src/features/health/healthKit.ts` - HealthKit integration
- ✅ `src/components/HealthKitDataDisplay.tsx` - UI component
- ✅ `app/(tabs)/index.tsx` - Dashboard integration
- ✅ `src/hooks/useCoachingRecommendations.ts` - AI coaching hook

## Next Steps

Once real data is flowing:
1. Data will automatically update when you open the dashboard
2. Tap refresh button to manually sync
3. Backend API can receive this data for AI analysis
4. Coaching recommendations will be based on real metrics

## Questions?

- Check the main `HEALTHKIT_INTEGRATION.md` for full documentation
- See console logs for detailed error messages
- The mock data is intentional - makes development easier!
