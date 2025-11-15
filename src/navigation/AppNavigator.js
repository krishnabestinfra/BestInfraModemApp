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

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(true);

  const handleSplashFinish = useCallback((userAuthenticated) => {
    const authenticated = Boolean(userAuthenticated);
    setIsAuthenticated(authenticated);
    setShowOnboarding(!authenticated);
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
              <SplashScreen
                {...props}
                onFinish={handleSplashFinish}
              />
            )}
          </Stack.Screen>
        ) : !isAuthenticated && showOnboarding ? (
          <Stack.Screen name="OnBoarding">
            {(props) => (
              <OnBoarding
                {...props}
                onComplete={handleOnboardingComplete}
              />
            )}
          </Stack.Screen>
        ) : !isAuthenticated ? (
          <Stack.Screen name="Login">
            {(props) => (
              <LoginScreen
                {...props}
                onLogin={handleLogin}
              />
            )}
          </Stack.Screen>
        ) : (
          <>
            <Stack.Screen 
              name="Dashboard" 
              options={{
                title: 'Modem Diagnostics',
              }}
            >
              {(props) => <DashboardScreen {...props} onLogout={handleLogout} />}
            </Stack.Screen>
            <Stack.Screen 
              name="ErrorDetails" 
              component={ErrorDetailsScreen}
              options={{
                title: 'Error Details',
              }}
            />
            <Stack.Screen 
              name="Alerts" 
              component={AlertsScreen}
              options={{
                title: 'Alerts',
              }}
            />
            <Stack.Screen 
              name="ModemDetails" 
              component={ModemDetailsScreen}
              options={{
                title: 'Modem Details',
              }}
            />
            <Stack.Screen 
              name="Troubleshoot" 
              component={TroubleshootScreen}
              options={{
                title: 'Troubleshoot',
              }}
            />
            <Stack.Screen 
              name="Profile" 
              component={ProfileScreen}
              options={{
                title: 'Notifications',
              }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;