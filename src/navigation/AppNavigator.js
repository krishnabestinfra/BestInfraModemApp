import React, { useState, useCallback, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import SplashScreen from '../screens/SplashScreen';
import OnBoarding from '../screens/OnBoarding';
import LoginScreen from '../screens/LoginScreen';
import { clearAuthData, getUserPhone } from '../utils/storage';

import DashboardScreen from '../screens/DashboardScreen';
import ProfileScreen from '../screens/ProfileScreen';
import ErrorDetailsScreen from '../screens/ErrorDetailsScreen';
import AlertsScreen from '../screens/AlertsScreen';
import ModemDetailsScreen from '../screens/ModemDetailsScreen';
import TroubleshootScreen from '../screens/TroubleshootScreen';
import UploadIssueImageScreen from '../screens/UploadIssueIamgeScreen';
import ReplacedModemDetailsScreen from '../screens/ReplacedModemDetailsScreen';
import ModemReplacementSuccessScreen from '../screens/ModemReplacementSuccessScreen';
import IssueNotResolvedScreen from '../screens/IssueNotResolvedScreen';
import SideMenu from '../screens/Sidemenu';  
import ScanScreen from '../components/ScanScreen';
import OfflineModemsScreen from '../screens/OfflineModemsScreen';
import VisitedScreen from '../screens/VisitedScreen';
import SupportScreen from '../screens/SupportScreen';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [userModems, setUserModems] = useState([]);
  const [userPhone, setUserPhone] = useState(null);

  const extractModemId = (modem) => {
    return modem?.modemSINo ||
           modem?.modemNo ||
           modem?.modemno || 
           modem?.modemSlNo || 
           modem?.modemId || 
           modem?.modem_sl_no || 
           modem?.sno?.toString() || 
           modem?.id?.toString() || 
           null;
  };

  // API call removed - return empty array, app will use dummy data
  async function fetchModemsByOfficer(phone) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return [];
  }

  useEffect(() => {
    let isMounted = true;
  
    const checkPersistentLogin = async () => {
      await new Promise(resolve => setTimeout(resolve, 1500)); // splash delay
  
      const storedPhone = await getUserPhone();
  
      if (storedPhone && isMounted) {
        setIsAuthenticated(true);
        setShowOnboarding(false);
        setUserPhone(storedPhone);
        
        // No API call - use empty array, app will work with dummy data
        if (isMounted) setUserModems([]);
      } else if (isMounted) {
        setIsAuthenticated(false);
      }

      if (isMounted) setIsLoading(false);
    };
  
    checkPersistentLogin();
    return () => (isMounted = false);
  }, []);
  

  const handleSplashFinish = useCallback(() => {
  }, []);

  const handleOnboardingComplete = useCallback(() => {
    setShowOnboarding(false);
  }, []);

  const handleLogin = useCallback((modems = [], phoneNumber) => {
    const modemsArray = Array.isArray(modems) ? modems : [];
    const extractedIds = modemsArray.map(m => extractModemId(m)).filter(Boolean);
  
    setUserModems(modemsArray);
    setUserPhone(phoneNumber || null);
    setIsAuthenticated(true);
  }, []);

  const handleLogout = useCallback(async () => {
    await clearAuthData();
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
          // Prevent screens from being unmounted when app goes to background
          detachInactiveScreens: false,
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
              {(props) => {
                const extractedModemIds = userModems.map(m => extractModemId(m)).filter(Boolean);
                return (
                  <DashboardScreen
                    {...props}
                    modems={userModems}
                    modemIds={extractedModemIds}
                    userPhone={userPhone}
                    onLogout={handleLogout}
                  />
                );
              }}
            </Stack.Screen>

            <Stack.Screen 
              name="SideMenu" 
              options={{ 
                headerShown: false,
                animation: 'slide_from_left'
              }}
            >
              {(props) => {
                const extractedModemIds = userModems.map(m => extractModemId(m)).filter(Boolean);
                return (
                  <SideMenu
                    {...props}
                    modems={userModems}
                    modemIds={extractedModemIds}
                    userPhone={userPhone}
                    onLogout={handleLogout}
                  />
                );
              }}
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
            <Stack.Screen name="UploadIssueImage" component={UploadIssueImageScreen} />
            <Stack.Screen name="ReplacedModemDetails" component={ReplacedModemDetailsScreen} />
            <Stack.Screen name="ModemReplacementSuccess" component={ModemReplacementSuccessScreen} />
            <Stack.Screen name="IssueNotResolved" component={IssueNotResolvedScreen} />
            <Stack.Screen name="Profile" component={ProfileScreen} />
            <Stack.Screen name="Support" component={SupportScreen} />
            <Stack.Screen name="ScanScreen" component={ScanScreen} />
            <Stack.Screen name="OfflineModems">
              {(props) => {
                const extractedModemIds = userModems.map(m => extractModemId(m)).filter(Boolean);
                return (
                  <OfflineModemsScreen
                    {...props}
                    modems={userModems}
                    modemIds={extractedModemIds}
                    userPhone={userPhone}
                  />
                );
              }}
            </Stack.Screen>
            <Stack.Screen name="Visited">
              {(props) => {
                const extractedModemIds = userModems.map(m => extractModemId(m)).filter(Boolean);
                return (
                  <VisitedScreen
                    {...props}
                    modems={userModems}
                    modemIds={extractedModemIds}
                    userPhone={userPhone}
                  />
                );
              }}
            </Stack.Screen>
          </>
        )
        }

      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
