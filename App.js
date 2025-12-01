import React, { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import AppNavigator from './src/navigation/AppNavigator';
import { SidebarProvider } from './src/context/SidebarContext';
import { NotificationProvider } from './src/context/NotificationContext';
import * as NavigationBar from 'expo-navigation-bar';


SplashScreen.preventAutoHideAsync().catch(() => {});

export default function App() {
  const [fontsLoaded] = useFonts({
    'Manrope-ExtraLight': require('./assets/fonts/Manrope-ExtraLight.ttf'),
    'Manrope-Light': require('./assets/fonts/Manrope-Light.ttf'),
    'Manrope-Regular': require('./assets/fonts/Manrope-Regular.ttf'),
    'Manrope-Medium': require('./assets/fonts/Manrope-Medium.ttf'),
    'Manrope-SemiBold': require('./assets/fonts/Manrope-SemiBold.ttf'),
    'Manrope-Bold': require('./assets/fonts/Manrope-Bold.ttf'),
    'Manrope-ExtraBold': require('./assets/fonts/Manrope-ExtraBold.ttf'),
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  useEffect(() => {
    NavigationBar.setBehaviorAsync("overlay-swipe");
    NavigationBar.setVisibilityAsync("visible"); // keeps the bar visible
    NavigationBar.setBackgroundColorAsync("transparent");
  }, []);

  if (!fontsLoaded) {
    return null;
  }



  return (
    <SafeAreaProvider>
      <SidebarProvider>
        <NotificationProvider>
        <AppNavigator />
        </NotificationProvider>
      </SidebarProvider>
    </SafeAreaProvider>
  );
}
