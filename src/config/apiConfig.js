
// Base URL
export const API_BASE_URL = 'https://nexusenergy.tech/api/v1';


export const API_KEY = 'eyaM-5N8mDzLykpA3n3igUgGgNnEcehUY9NJ9ui4Ic5LuZW1sqbZylAg1q_C1';
export const API_ENDPOINTS = {
  SEND_OTP: '/auth/send-otp',
  VALIDATE_OTP: '/auth/validate-otp',
    
    // Protected endpoints
  GET_MODEMS_BY_OFFICER: '/modem/user/all',
};

export const getPublicHeaders = () => ({
  'Content-Type': 'application/json',
});

/**
 * Get headers for protected endpoints (authentication required)
 * @param {string} apiKey - API key for Bearer token
 * @param {string} customerId - Phone number used as X-CUSTOMER-ID
 */
export const getProtectedHeaders = (apiKey, customerId) => {
  const headers = {
    'Content-Type': 'application/json',
  };

  if (apiKey) {
    headers['Authorization'] = `Bearer ${apiKey}`;
  }

  if (customerId) {
    headers['X-CUSTOMER-ID'] = customerId;
  }

  return headers;
};

