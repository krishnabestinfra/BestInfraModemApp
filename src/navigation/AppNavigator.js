import React, { useState, useCallback } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import SplashScreen from '../screens/SplashScreen';
import OnBoarding from '../screens/OnBoarding';
import LoginScreen from '../screens/LoginScreen';

import DashboardScreen from '../screens/DashboardScreen';
import ProfileScreen from '../screens/ProfileScreen';
import ErrorDetailsScreen from '../screens/ErrorDetailsScreen';
import AlertsScreen from '../screens/AlertsScreen';
import ModemDetailsScreen from '../screens/ModemDetailsScreen';
import TroubleshootScreen from '../screens/TroubleshootScreen';
import SideMenu from '../screens/Sidemenu';  
import ScanScreen from '../components/ScanScreen';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(true);

  const handleSplashFinish = useCallback((userAuthenticated) => {
    setIsAuthenticated(Boolean(userAuthenticated));
    setShowOnboarding(!userAuthenticated);
    setIsLoading(false);
  }, []);

  const handleOnboardingComplete = useCallback(() => {
    setShowOnboarding(false);
  }, []);

  const handleLogin = useCallback(() => {
    setIsAuthenticated(true);
  }, []);

  const handleLogout = useCallback(() => {
    setIsAuthenticated(false);
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      >
        {isLoading ? (
          <Stack.Screen name="Splash">
            {(props) => (
              <SplashScreen {...props} onFinish={handleSplashFinish} />
            )}
          </Stack.Screen>
        ) : 
        !isAuthenticated && showOnboarding ? (
          <Stack.Screen name="OnBoarding">
            {(props) => (
              <OnBoarding {...props} onComplete={handleOnboardingComplete} />
            )}
          </Stack.Screen>
        ) :
        !isAuthenticated ? (
          <Stack.Screen name="Login">
            {(props) => (
              <LoginScreen {...props} onLogin={handleLogin} />
            )}
          </Stack.Screen>
        ) :

        (
          <>
            <Stack.Screen
              name="SideMenu"
              component={SideMenu}
              options={{ headerShown: false }}
            />

            {/* ORIGINAL SCREENS */}
            <Stack.Screen name="Dashboard">
              {(props) => (
                <DashboardScreen {...props} onLogout={handleLogout} />
              )}
            </Stack.Screen>

            <Stack.Screen name="ErrorDetails" component={ErrorDetailsScreen} />
            <Stack.Screen name="Alerts" component={AlertsScreen} />
            <Stack.Screen name="ModemDetails" component={ModemDetailsScreen} />
            <Stack.Screen name="Troubleshoot" component={TroubleshootScreen} />
            <Stack.Screen name="Profile" component={ProfileScreen} />
            <Stack.Screen name="ScanScreen" component={ScanScreen} />
          </>
        )
        }

      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
