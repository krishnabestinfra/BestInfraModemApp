import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  API_KEY: '@app:api_key',
  USER_PHONE: '@app:user_phone',
  USER_DATA: '@app:user_data',
};

// Cache for frequently accessed values
const cache = {
  apiKey: null,
  userPhone: null,
  initialized: false,
};

// Initialize cache on app start
export const initializeStorageCache = async () => {
  if (cache.initialized) return;
  
  try {
    const [apiKey, userPhone] = await AsyncStorage.multiGet([
      KEYS.API_KEY,
      KEYS.USER_PHONE,
    ]);
    
    cache.apiKey = apiKey[1];
    cache.userPhone = userPhone[1];
    cache.initialized = true;
  } catch (error) {
    // Silent error handling
  }
};

// API Key functions
export const storeApiKey = async (apiKey) => {
  try {
    await AsyncStorage.setItem(KEYS.API_KEY, apiKey);
    cache.apiKey = apiKey; // Update cache
  } catch (error) {
    console.error('Error storing API key:', error);
  }
};

export const getApiKey = async () => {
  // Return cached value if available
  if (cache.apiKey !== null) {
    return cache.apiKey;
  }
  
  try {
    const apiKey = await AsyncStorage.getItem(KEYS.API_KEY);
    cache.apiKey = apiKey; // Update cache
    return apiKey;
  } catch (error) {
    console.error('Error getting API key:', error);
    return null;
  }
};

export const removeApiKey = async () => {
  try {
    await AsyncStorage.removeItem(KEYS.API_KEY);
    cache.apiKey = null; // Clear cache
  } catch (error) {
    console.error('Error removing API key:', error);
  }
};

export const hasApiKey = async () => {
  // Use cache if available
  if (cache.apiKey !== null) {
    return cache.apiKey.length > 0;
  }
  
  const apiKey = await getApiKey();
  return apiKey !== null && apiKey.length > 0;
};

// User phone functions
export const storeUserPhone = async (phone) => {
  try {
    await AsyncStorage.setItem(KEYS.USER_PHONE, phone);
    cache.userPhone = phone; // Update cache
  } catch (error) {
    console.error('Error storing user phone:', error);
  }
};

export const getUserPhone = async () => {
  // Return cached value if available
  if (cache.userPhone !== null) {
    return cache.userPhone;
  }
  
  try {
    const phone = await AsyncStorage.getItem(KEYS.USER_PHONE);
    cache.userPhone = phone; // Update cache
    return phone;
  } catch (error) {
    console.error('Error getting user phone:', error);
    return null;
  }
};

export const removeUserPhone = async () => {
  try {
    await AsyncStorage.removeItem(KEYS.USER_PHONE);
    cache.userPhone = null; // Clear cache
  } catch (error) {
    console.error('Error removing user phone:', error);
  }
};

// Clear all auth data - optimized with multiRemove
export const clearAuthData = async () => {
  try {
    // Use multiRemove for better performance
    await AsyncStorage.multiRemove([
      KEYS.API_KEY,
      KEYS.USER_PHONE,
      KEYS.USER_DATA,
    ]);
    
    // Clear cache
    cache.apiKey = null;
    cache.userPhone = null;
  } catch (error) {
    console.error('Error clearing auth data:', error);
  }
};
