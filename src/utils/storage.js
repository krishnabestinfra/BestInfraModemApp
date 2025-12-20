import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  USER_PHONE: '@app:user_phone',
  USER_DATA: '@app:user_data',
};

export const storeUserPhone = async (phone) => {
  try {
    await AsyncStorage.setItem(KEYS.USER_PHONE, phone);
  } catch (error) {
    // Error storing user phone
  }
};

export const getUserPhone = async () => {
  try {
    return await AsyncStorage.getItem(KEYS.USER_PHONE);
  } catch (error) {
    return null;
  }
};

export const clearAuthData = async () => {
  try {
    await Promise.all([
      AsyncStorage.removeItem(KEYS.USER_PHONE),
      AsyncStorage.removeItem(KEYS.USER_DATA),
    ]);
  } catch (error) {
    // Error clearing auth data
  }
};
