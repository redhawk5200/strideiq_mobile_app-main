#!/bin/bash

echo "🧹 Clearing React Native Metro Bundler cache..."

# Clear Metro bundler cache
rm -rf node_modules/.cache

# Clear watchman cache (if watchman is installed)
if command -v watchman &> /dev/null; then
    echo "🧹 Clearing Watchman cache..."
    watchman watch-del-all
fi

# Clear Expo cache
rm -rf .expo

echo "✅ Cache cleared! Now restart your app with: npx expo start -c"
