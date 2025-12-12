import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  API_KEY: '@app:api_key',
  USER_PHONE: '@app:user_phone',
  USER_DATA: '@app:user_data',
};

export const storeApiKey = async (apiKey) => {
  try {
    await AsyncStorage.setItem(KEYS.API_KEY, apiKey);
  } catch (error) {
    console.error('Error storing API key:', error);
  }
};

export const getApiKey = async () => {
  try {
    return await AsyncStorage.getItem(KEYS.API_KEY);
  } catch (error) {
    console.error('Error getting API key:', error);
    return null;
  }
};

export const removeApiKey = async () => {
  try {
    await AsyncStorage.removeItem(KEYS.API_KEY);
  } catch (error) {
    console.error('Error removing API key:', error);
  }
};

export const hasApiKey = async () => {
  const apiKey = await getApiKey();
  return apiKey !== null && apiKey.length > 0;
};

// User phone functions
export const storeUserPhone = async (phone) => {
  try {
    await AsyncStorage.setItem(KEYS.USER_PHONE, phone);
  } catch (error) {
    console.error('Error storing user phone:', error);
  }
};

export const getUserPhone = async () => {
  try {
    return await AsyncStorage.getItem(KEYS.USER_PHONE);
  } catch (error) {
    console.error('Error getting user phone:', error);
    return null;
  }
};

export const removeUserPhone = async () => {
  try {
    await AsyncStorage.removeItem(KEYS.USER_PHONE);
  } catch (error) {
    console.error('Error removing user phone:', error);
  }
};

export const clearAuthData = async () => {
  try {
    await Promise.all([
      AsyncStorage.removeItem(KEYS.API_KEY),
      AsyncStorage.removeItem(KEYS.USER_PHONE),
      AsyncStorage.removeItem(KEYS.USER_DATA),
    ]);
  } catch (error) {
    console.error('Error clearing auth data:', error);
  }
};
