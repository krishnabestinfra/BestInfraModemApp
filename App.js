import React, { useEffect, useCallback } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import AppNavigator from './src/navigation/AppNavigator';
import { SidebarProvider } from './src/context/SidebarContext';
import { NotificationProvider } from './src/context/NotificationContext';
import * as NavigationBar from 'expo-navigation-bar';
import ErrorBoundary from './src/components/ErrorBoundary';
 
SplashScreen.preventAutoHideAsync().catch(() => {});

export default function App() {
  const [fontsLoaded, fontError] = useFonts({
    'Manrope-ExtraLight': require('./assets/fonts/Manrope-ExtraLight.ttf'),
    'Manrope-Light': require('./assets/fonts/Manrope-Light.ttf'),
    'Manrope-Regular': require('./assets/fonts/Manrope-Regular.ttf'),
    'Manrope-Medium': require('./assets/fonts/Manrope-Medium.ttf'),
    'Manrope-SemiBold': require('./assets/fonts/Manrope-SemiBold.ttf'),
    'Manrope-Bold': require('./assets/fonts/Manrope-Bold.ttf'),
    'Manrope-ExtraBold': require('./assets/fonts/Manrope-ExtraBold.ttf'),
  });

  // Hide splash screen when fonts are loaded
  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [fontsLoaded, fontError]);

  // Configure navigation bar once on mount
  useEffect(() => {
    NavigationBar.setBehaviorAsync("overlay-swipe").catch(() => {});
    NavigationBar.setVisibilityAsync("visible").catch(() => {});
    NavigationBar.setBackgroundColorAsync("transparent").catch(() => {});
  }, []);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <SidebarProvider>
          <NotificationProvider>
            <AppNavigator />
          </NotificationProvider>
        </SidebarProvider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}
