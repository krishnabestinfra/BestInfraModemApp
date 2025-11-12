import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SplashScreen from '../screens/SplashScreen';
import LoginScreen from '../screens/LoginScreen';
import DashboardScreen from '../screens/DashboardScreen';
import ErrorDetailsScreen from '../screens/ErrorDetailsScreen';
import AlertsScreen from '../screens/AlertsScreen';
import ModemDetailsScreen from '../screens/ModemDetailsScreen';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleSplashFinish = () => {
    setIsLoading(false);
  };

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
  };

  if (isLoading) {
    return <SplashScreen onFinish={handleSplashFinish} />;
  }

  if (!isAuthenticated) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Dashboard"
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      >
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
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator; 