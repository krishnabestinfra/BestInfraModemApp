
export const API_BASE_URL = "https://nexusenergy.tech/api/v1";

export const ALERTS_BASE_URL = "https://api.bestinfra.app/v2tgnpdcl/api";

export const API_KEY =
  "eyaM-5N8mDzLykpA3n3igUgGgNnEcehUY9NJ9ui4Ic5LuZW1sqbZylAg1q_C1";
export const API_ENDPOINTS = {
  SEND_OTP: "/auth/send-otp",
  VALIDATE_OTP: "/auth/validate-otp",
  GET_MODEMS_BY_OFFICER: "/modem/user/all",
  GET_MODEM_ALERTS: `${ALERTS_BASE_URL}/modems/main`,
};


export const getPublicHeaders = () => ({
  "Content-Type": "application/json",
});

export const getProtectedHeaders = (apiKey, customerId) => {
  return {
    "Content-Type": "application/json",
    ...(apiKey && { Authorization: `Bearer ${apiKey}` }),
    ...(customerId && { "X-CUSTOMER-ID": customerId }),
  };
};
