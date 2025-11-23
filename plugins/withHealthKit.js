const { withEntitlementsPlist, withInfoPlist } = require('@expo/config-plugins');

/**
 * Expo Config Plugin for react-native-health
 * Adds HealthKit entitlements and Info.plist entries
 */
const withHealthKit = (config) => {
  // Add HealthKit entitlements
  config = withEntitlementsPlist(config, (config) => {
    config.modResults['com.apple.developer.healthkit'] = true;
    config.modResults['com.apple.developer.healthkit.access'] = ['health-records'];
    config.modResults['com.apple.developer.healthkit.background-delivery'] = true;

    return config;
  });

  // Add HealthKit usage descriptions to Info.plist
  config = withInfoPlist(config, (config) => {
    config.modResults.NSHealthShareUsageDescription =
      config.modResults.NSHealthShareUsageDescription ||
      'We need access to read your heart rate, steps, distance, VO2 max, and workout data to provide personalized training recommendations';

    config.modResults.NSHealthUpdateUsageDescription =
      config.modResults.NSHealthUpdateUsageDescription ||
      'We need to save workout data to Health';

    config.modResults.NSHealthClinicalHealthRecordsShareUsageDescription =
      config.modResults.NSHealthClinicalHealthRecordsShareUsageDescription ||
      'We need access to clinical health records to provide accurate VO2 max recommendations';

    return config;
  });

  return config;
};

module.exports = withHealthKit;
