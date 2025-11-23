import { useEffect } from 'react';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { apiClient } from '../lib/api';

/**
 * Component that syncs Clerk authentication token with the API client
 * This ensures all API requests include the user's authentication token
 */
export function ClerkApiSync() {
  const { getToken, isSignedIn, userId } = useAuth();
  const { user } = useUser();

  useEffect(() => {
    const syncToken = async () => {
      if (isSignedIn) {
        try {
          // Get the Clerk session token
          const token = await getToken();

          if (token) {
            // Set it in the API client
            apiClient.setToken(token);
            console.log('✅ Clerk token synced with API client');
            console.log('👤 Current Clerk User ID:', userId);
            console.log('📧 Current User Email:', user?.primaryEmailAddress?.emailAddress);
          }
        } catch (error) {
          console.error('❌ Failed to get Clerk token:', error);
          apiClient.setToken(null);
        }
      } else {
        // Clear token when signed out
        apiClient.setToken(null);
        console.log('🔓 API client token cleared (user signed out)');
      }
    };

    syncToken();

    // Refresh token more frequently (every 30 seconds, Clerk tokens last 60 seconds)
    // This gives us a 30-second buffer before expiration
    const interval = setInterval(syncToken, 30000);

    return () => clearInterval(interval);
  }, [isSignedIn, getToken]);

  return null; // This component doesn't render anything
}
