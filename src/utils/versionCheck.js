import { Platform } from 'react-native';
import { VERSION_CHECK_URL, FALLBACK_VERSION_CONFIG } from '../config/versionConfig';

// Get current app version from app.json
export const getCurrentVersion = () => {
  try {
    const appConfig = require('../../app.json');
    return appConfig?.expo?.version || '1.0.0';
  } catch (error) {
    console.warn('Failed to load app.json, using default version:', error);
    // Fallback to package.json version or default
    try {
      const packageJson = require('../../package.json');
      return packageJson?.version || '1.0.0';
    } catch (e) {
      return '1.0.0';
    }
  }
};

// Compare versions: returns true if current < required
export const needsUpdate = (current, required) => {
  const currentParts = current.split('.').map(Number);
  const requiredParts = required.split('.').map(Number);
  
  for (let i = 0; i < 3; i++) {
    if (currentParts[i] < requiredParts[i]) return true;
    if (currentParts[i] > requiredParts[i]) return false;
  }
  return false;
};

// Check if update is required
export const checkAppVersion = async () => {
  try {
    const currentVersion = getCurrentVersion();
    
    // Try to fetch from remote URL
    let versionData = null;
    
    if (VERSION_CHECK_URL && VERSION_CHECK_URL !== 'https://your-website.com/version.json') {
      try {
        const response = await fetch(VERSION_CHECK_URL, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });
        
        if (response.ok) {
          versionData = await response.json();
        }
      } catch (error) {
        console.log('Remote version check failed, using fallback');
      }
    }
    
    // Use fallback if remote check failed or not configured
    if (!versionData) {
      versionData = FALLBACK_VERSION_CONFIG;
    }
    
    const requiredVersion = versionData.minimumVersion || versionData.version;
    if (!requiredVersion) return null;
    
    const updateNeeded = needsUpdate(currentVersion, requiredVersion);
    
    // Only show update if needed
    if (!updateNeeded) return null;
    
    return {
      needsUpdate: true,
      message: versionData.message || 'Please update to the latest version',
      storeUrl: versionData.storeUrl?.[Platform.OS] || 
                versionData.storeUrl?.android || 
                FALLBACK_VERSION_CONFIG.storeUrl[Platform.OS],
    };
  } catch (error) {
    console.error('Version check failed:', error);
    return null;
  }
};
