import React, { useState, useCallback, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import SplashScreen from '../screens/SplashScreen';
import OnBoarding from '../screens/OnBoarding';
import LoginScreen from '../screens/LoginScreen';
import { clearAuthData, getUserPhone, hasApiKey } from '../utils/storage';

import DashboardScreen from '../screens/DashboardScreen';
import ProfileScreen from '../screens/ProfileScreen';
import ErrorDetailsScreen from '../screens/ErrorDetailsScreen';
import AlertsScreen from '../screens/AlertsScreen';
import ModemDetailsScreen from '../screens/ModemDetailsScreen';
import TroubleshootScreen from '../screens/TroubleshootScreen';
import SideMenu from '../screens/Sidemenu';  
import ScanScreen from '../components/ScanScreen';
import CompletedActivities from '../screens/CompletedActivities';
import { API_BASE_URL, API_KEY, API_ENDPOINTS, getProtectedHeaders } from '../config/apiConfig';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [userModems, setUserModems] = useState([]);
  const [userPhone, setUserPhone] = useState(null);

  async function fetchModemsByOfficer(phone) {
  const url = `${API_BASE_URL}${API_ENDPOINTS.GET_MODEMS_BY_OFFICER}`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: getProtectedHeaders(API_KEY, phone),
    });

    const json = await response.json();

    console.log("API3 Response:", json);

    return Array.isArray(json) ? json : [];  // FIXED
  } catch (err) {
    console.log("fetchModemsByOfficer ERROR:", err);
    return [];
  }
}

  
  
  useEffect(() => {
    let isMounted = true;
  
    const checkPersistentLogin = async () => {
      await new Promise(resolve => setTimeout(resolve, 1500)); // splash delay
  
      const apiKeyExists = await hasApiKey();
      if (!apiKeyExists) {
        if (isMounted) {
          setIsAuthenticated(false);
          setIsLoading(false);
        }
        return;
      }
  
      const storedPhone = await getUserPhone();
  
      // Auto-login
      if (isMounted) {
        setIsAuthenticated(true);
        setShowOnboarding(false);
        setUserPhone(storedPhone);
      }
  
      if (storedPhone && isMounted) {
        try {
          console.log("Persistent Login → Fetching modems for:", storedPhone);
      
          const modems = await fetchModemsByOfficer(storedPhone);
          console.log("Persistent Modems Loaded:", modems);
      
          if (isMounted) setUserModems(modems);
        } catch (err) {
          console.log("Persistent fetch error:", err);
        }
      }
      
  
      if (isMounted) setIsLoading(false);
    };
  
    checkPersistentLogin();
    return () => (isMounted = false);
  }, []);
  

  const handleSplashFinish = useCallback(() => {
    // SplashScreen is now purely visual - loading is controlled by useEffect
    // This callback is kept for backwards compatibility but doesn't control loading
  }, []);

  const handleOnboardingComplete = useCallback(() => {
    setShowOnboarding(false);
  }, []);

  const handleLogin = useCallback((modems = [], phoneNumber) => {
    console.log("APP NAVIGATOR handleLogin CALLED");
    console.log("MODENS RECEIVED:", modems);
    console.log("PHONE RECEIVED:", phoneNumber);
  
    setUserModems(Array.isArray(modems) ? modems : []);
    setUserPhone(phoneNumber || null);
    setIsAuthenticated(true);
  }, []);

  const handleLogout = useCallback(async () => {
    // Clear API Key and auth data from AsyncStorage
    await clearAuthData();
    
    // Clear local state
    setUserModems([]);
    setUserPhone(null);
    setIsAuthenticated(false);
  }, []);

  return (
    <NavigationContainer key={isAuthenticated ? 'authenticated' : 'unauthenticated'}>
      <Stack.Navigator
        initialRouteName={
          isLoading 
            ? "Splash" 
            : !isAuthenticated && showOnboarding 
            ? "OnBoarding" 
            : !isAuthenticated 
            ? "Login" 
            : "Dashboard"
        }
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
            {/* Dashboard is the initial screen after login */}
            <Stack.Screen name="Dashboard">
              {(props) => (
                <DashboardScreen
                  {...props}
                  modems={userModems}
                  modemIds={userModems.map(m => m.modemno)}
                  userPhone={userPhone}
                  onLogout={handleLogout}
                />
              )}
            </Stack.Screen>

            <Stack.Screen 
              name="SideMenu" 
              options={{ 
                headerShown: false,
                animation: 'slide_from_left'
              }}
            >
              {(props) => (
                <SideMenu
                  {...props}
                  onLogout={handleLogout}
                />
              )}
            </Stack.Screen>

            {/* Other screens */}
            <Stack.Screen name="ErrorDetails" component={ErrorDetailsScreen} />
            <Stack.Screen name="Alerts" component={AlertsScreen} />
            <Stack.Screen name="ModemDetails">
              {(props) => (
                <ModemDetailsScreen
                  {...props}
                  modems={userModems}
                />
              )}
            </Stack.Screen>
            <Stack.Screen name="Troubleshoot" component={TroubleshootScreen} />
            <Stack.Screen name="Profile" component={ProfileScreen} />
            <Stack.Screen name="ScanScreen" component={ScanScreen} />
            <Stack.Screen name="CompletedActivities" component={CompletedActivities} />
          </>
        )
        }

      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
