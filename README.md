# StrideIQ Mobile App

A React Native + Expo mobile application for fitness tracking and health metrics.

## Features

- Health data tracking and monitoring
- Apple HealthKit integration
- User onboarding flow
- Activity metrics and progress tracking
- Settings and profile management

## Tech Stack

- React Native
- Expo
- TypeScript
- Expo Router for navigation

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npx expo start
```

3. Use Expo Go app on your phone to scan the QR code, or run on simulator/emulator.

## Project Structure

- `/app` - Route files with Expo Router
- `/src/ui` - Reusable UI components
- `/src/features` - Feature modules
- `/src/lib` - Shared utilities
- `/assets` - Images, fonts, and other assets
- `/components` - React components

## HealthKit Integration

This app includes Apple HealthKit integration for iOS devices. See `HEALTHKIT_SETUP.md` for setup instructions.
