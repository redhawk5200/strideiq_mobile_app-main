import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Slot, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState, useCallback } from 'react';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import StoreProvider from '../src/store/StoreProvider';
import { ClerkProvider, ClerkLoaded, useAuth } from '@clerk/clerk-expo';
import { tokenCache } from '../src/utils/tokenCache';
import { ClerkApiSync } from '../src/components/ClerkApiSync';
import { useAppDispatch } from '../src/store';
import { restoreProgress } from '../src/store/thunks/onboardingThunks';

import SplashPlaceholder from '@/components/splashscreen/SplashPlaceholder';
export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary
} from 'expo-router';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: 'onboarding',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

// Global flags to ensure auth check only runs once per app session
let authCheckHasRun = false;
let authCheckIsComplete = false;

function InitialRouteHandler({ onReady }: { onReady: () => void }) {
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const router = useRouter();
  const segments = useSegments();
  const dispatch = useAppDispatch();

  useEffect(() => {
    // Only run once per app session
    if (!isLoaded || authCheckHasRun) return;

    authCheckHasRun = true;
    console.log('🔐 InitialRouteHandler: Starting authentication check');

    const handleInitialRoute = async () => {
      try {
        if (isSignedIn) {
          // Wait for token to be available with retry logic
          let token = await getToken();
          let retries = 0;

          while (!token && retries < 10) {
            console.log(`Waiting for token... (attempt ${retries + 1})`);
            await new Promise(resolve => setTimeout(resolve, 100));
            token = await getToken();
            retries++;
          }

          if (!token) {
            console.error('Could not get token after 10 retries');
            router.replace('/name-screen');
            onReady();
            return;
          }

          console.log('User is signed in, checking onboarding progress...');

          try {
            const result = await dispatch(restoreProgress()).unwrap();

            if (result.isCompleted) {
              console.log('✅ User completed onboarding, navigating to tabs');
              router.replace('/(tabs)');
            } else {
              console.log(`✅ User not completed, navigating to: ${result.route}`);
              router.replace(result.route as any);
            }
          } catch (err) {
            console.error('Error checking progress, starting fresh:', err);
            router.replace('/name-screen');
          }
        } else {
          // User is not signed in, go to onboarding welcome
          const isOnOnboarding = segments[0] === '(onboarding)';
          if (!isOnOnboarding) {
            console.log('❌ User not signed in, navigating to onboarding');
            router.replace('/(onboarding)');
          }
        }

        console.log('🎉 Navigation complete, calling onReady()');
        authCheckIsComplete = true; // Set global flag
        onReady(); // Signal that navigation is complete
      } catch (error) {
        console.error('Error in initial route handler:', error);
        router.replace('/(onboarding)');
        authCheckIsComplete = true; // Set global flag even on error
        onReady(); // Signal that navigation is complete even on error
      }
    };

    handleInitialRoute();
  }, [isLoaded, isSignedIn, getToken, router, segments, dispatch, onReady]);

  return null;
}

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });
  const [authCheckComplete, setAuthCheckComplete] = useState(authCheckIsComplete);

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  // Hide splash screen only after fonts loaded AND auth check complete
  useEffect(() => {
    if (loaded && (authCheckComplete || authCheckIsComplete)) {
      const hideSplash = async () => {
        try {
          await SplashScreen.hideAsync();
        } catch (e) {
          // ignore hide errors during fast reloads
        }
      };
      // Small delay for smooth transition
      setTimeout(hideSplash, 100);
    }
  }, [loaded, authCheckComplete]);

  // Memoize the callback to prevent re-renders
  const handleAuthCheckComplete = useCallback(() => {
    console.log('📞 handleAuthCheckComplete called - setting authCheckComplete to true');
    authCheckIsComplete = true; // Set global flag first
    setAuthCheckComplete(true); // Then set state
  }, []);

  const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;

  if (!publishableKey) {
    throw new Error('Missing Publishable Key. Please set EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY in your .env');
  }

  // Show our custom splash while fonts are loading OR auth is being checked
  // Check both state AND global variable
  const showSplash = !loaded || (!authCheckComplete && !authCheckIsComplete);

  console.log(`🔍 Splash visibility: showSplash=${showSplash}, loaded=${loaded}, authCheckComplete=${authCheckComplete}, authCheckIsComplete=${authCheckIsComplete}`);

  return (
    <ClerkProvider tokenCache={tokenCache} publishableKey={publishableKey}>
      <ClerkLoaded>
        <ClerkApiSync />
        <StoreProvider>
          <InitialRouteHandler onReady={handleAuthCheckComplete} />
          {showSplash ? (
            <SplashPlaceholder />
          ) : (
            <GestureHandlerRootView style={{ flex: 1 }}>
              <ThemeProvider value={DefaultTheme}>
                <Slot />
                <StatusBar style="auto" />
              </ThemeProvider>
            </GestureHandlerRootView>
          )}
        </StoreProvider>
      </ClerkLoaded>
    </ClerkProvider>
  );
}

