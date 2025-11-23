# HealthKit Setup Steps - IMPORTANT

The HealthKit native module (`react-native-health`) is installed but not properly linked to your iOS app. Follow these steps to fix it:

## Problem
You're seeing: `⚠️ HealthKit not available (simulator or missing native module)`

This means the `react-native-health` native module isn't loaded, even though it's installed in package.json.

## Solution: Rebuild the iOS App

Since you're using Expo with a custom dev client, you need to rebuild the native iOS app to include the `react-native-health` module.

### Steps to Fix:

1. **Clean and Reinstall Pods**
   ```bash
   cd strideiq_mobile_app/ios
   rm -rf Pods Podfile.lock
   cd ..
   ```

2. **Reinstall Dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Prebuild iOS (This regenerates native code)**
   ```bash
   npx expo prebuild --platform ios --clean
   ```

4. **Install Pods**
   ```bash
   cd ios
   pod install
   cd ..
   ```

5. **Rebuild the Development Client**
   ```bash
   npx expo run:ios
   ```

   This will:
   - Compile the native module into your app
   - Install the app on your device
   - Start the Metro bundler

### Alternative: Use EAS Build (Recommended for Physical Devices)

If the above doesn't work or you're testing on a physical device:

```bash
# Install EAS CLI if you haven't
npm install -g eas-cli

# Login to Expo
eas login

# Create a development build
eas build --profile development --platform ios
```

Then install the resulting `.ipa` file on your device.

## Verification

After rebuilding, you should see these logs instead:
- ✅ `🔐 Requesting HealthKit permissions...`
- ✅ `✅ HealthKit initialized successfully`
- ✅ `🚶 Fetching step count...`
- ✅ `✅ Steps data received: { value: 1234 }`

## Why This is Needed

`react-native-health` is a **native module** that requires:
1. Native iOS code (Objective-C/Swift) compiled into your app
2. Proper linking in Xcode project
3. HealthKit framework added to your target

Expo's standard workflow doesn't include custom native modules - you need either:
- **expo-dev-client** (custom development build) - what you're doing
- **expo prebuild** to generate native iOS code
- **EAS Build** to build in the cloud

## Current Status

✅ Package installed: `react-native-health@1.19.0`
✅ Info.plist configured with HealthKit permissions
✅ Entitlements file has HealthKit capability
✅ Config plugin created (`plugins/withHealthKit.js`)
❌ Native module not linked (needs rebuild)

## Next Steps

Run the commands above to rebuild your iOS app with the HealthKit module properly linked.
