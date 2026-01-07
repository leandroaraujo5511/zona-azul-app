import React, { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StatusBar } from 'expo-status-bar';
import * as Updates from 'expo-updates';
import { AuthProvider } from './src/contexts/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export default function App() {
  useEffect(() => {
    async function onFetchUpdateAsync() {
      try {
        // Check if we're running on a physical device
        // Updates only work in production builds, not in development
        if (__DEV__) {
          console.log('[Updates] Dev mode - updates disabled');
          return;
        }

        // Check if updates are enabled and available
        if (!Updates.isEnabled) {
          console.log('[Updates] Updates not enabled');
          return;
        }

        // Log current update info for debugging
        console.log('[Updates] Channel:', Updates.channel);
        console.log('[Updates] Runtime version:', Updates.runtimeVersion);
        console.log('[Updates] Update ID:', Updates.updateId);

        console.log('[Updates] Checking for updates...');
        const update = await Updates.checkForUpdateAsync();

        console.log('[Updates] Update available:', update.isAvailable);
        if (update.isAvailable) {
          console.log('[Updates] Manifest:', update.manifest?.id);
        }

        if (update.isAvailable) {
          console.log('[Updates] Fetching update...');
          // Fetch the update in the background
          const result = await Updates.fetchUpdateAsync();
          console.log('[Updates] Update fetched successfully:', result.isNew);
          
          if (result.isNew) {
            console.log('[Updates] New update downloaded, reloading app...');
            // Reload the app to apply the update
            await Updates.reloadAsync();
          } else {
            console.log('[Updates] Update already cached');
          }
        } else {
          console.log('[Updates] No updates available');
        }
      } catch (error) {
        // Log error for debugging
        console.error('[Updates] Error checking for updates:', error);
        // Don't disrupt user experience - updates are optional
      }
    }

    // Check for updates when app starts
    // With checkAutomatically: "ON_LOAD" in app.json, this will happen automatically
    // but we can also manually trigger it for immediate updates
    onFetchUpdateAsync();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <StatusBar style="auto" />
        <AppNavigator />
      </AuthProvider>
    </QueryClientProvider>
  );
}




