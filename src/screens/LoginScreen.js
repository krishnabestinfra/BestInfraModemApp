import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
  SafeAreaView,
  TextInput,
  Pressable,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import { COLORS } from "../constants/colors";
import Button from "../components/global/Button";
import Input from "../components/global/Input";
import Logo from "../components/global/Logo";
import Tick from "../../assets/icons/tick.svg";
import User from '../../assets/icons/user.svg';
import { storeApiKey, storeUserPhone } from "../utils/storage";
import { API_BASE_URL, API_KEY, API_ENDPOINTS, getPublicHeaders, getProtectedHeaders } from "../config/apiConfig";

const screenHeight = Dimensions.get("window").height;

const PHONE_LENGTH = 10;
const OTP_LENGTH = 6;

const LoginScreen = ({ onLogin }) => {
  const [mobileNumber, setMobileNumber] = useState("");
  const [otpDigits, setOtpDigits] = useState(Array(OTP_LENGTH).fill(""));
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [otpEnabled, setOtpEnabled] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const otpRefs = useRef([]);

  const otpValue = otpDigits.join("");
  const hasCompletedOtp = otpEnabled && otpValue.length === OTP_LENGTH;
  const isGenerateEnabled = mobileNumber.length === PHONE_LENGTH;
  const formattedTimer = `${String(Math.floor(resendTimer / 60)).padStart(2, "0")}:${String(
    resendTimer % 60
  ).padStart(2, "0")}`;

  useEffect(() => {
    let timerId;
    if (otpEnabled) {
      setResendTimer(30);
      timerId = setInterval(() => {
        setResendTimer(prev => {
          if (prev <= 1) {
            clearInterval(timerId);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      setResendTimer(0);
    }

    return () => {
      if (timerId) {
        clearInterval(timerId);
      }
    };
  }, [otpEnabled]);

  const sendOtp = async (phone) => {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.SEND_OTP}`, {
      method: "POST",
      headers: getPublicHeaders(),
      body: JSON.stringify({ phone }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || "Failed to send OTP");
    }
  };

  const validateOtp = async (phone, otp) => {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.VALIDATE_OTP}`, {
      method: "POST",
      headers: getPublicHeaders(),
      body: JSON.stringify({ phone, otp }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || "OTP verification failed");
    }
  };

  const fetchModemsByOfficer = async (phone) => {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.GET_MODEMS_BY_OFFICER}`, {
      method: "GET",
      headers: getProtectedHeaders(API_KEY, phone),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || "Unable to load assigned modems");
    }

    return response.json();
  };

  const handleInputChange = (field, value) => {
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }

    switch (field) {
      case 'mobile': {
        const sanitized = value.replace(/\D/g, "").slice(0, PHONE_LENGTH);
        setMobileNumber(sanitized);
        if (otpEnabled) {
          setOtpEnabled(false);
          setOtpDigits(Array(OTP_LENGTH).fill(""));
        }
          break;
        }
      }
    };

    const handleBlur = (field) => {
      setTouched(prev => ({ ...prev, [field]: true }));

      let value;
      switch (field) {
        case 'mobile':
          value = mobileNumber;
          break;
        case 'otp':
          value = otpValue;
          break;
        default:
          return;
      }

      // Simple validation
      if (field === 'mobile' && value && value.length !== PHONE_LENGTH) {
      setErrors(prev => ({ ...prev, [field]: 'Enter a valid 10-digit mobile number' }));
    } else if (field === 'otp' && value && value.length !== OTP_LENGTH) {
      setErrors(prev => ({ ...prev, [field]: 'Enter the OTP code' }));
    } else {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const handleOtpChange = (index, digit) => {
    if (errors.otp) {
      setErrors(prev => ({ ...prev, otp: null }));
    }

    const sanitized = digit.replace(/\D/g, "").slice(-1);
    setOtpDigits(prev => {
      const updated = [...prev];
      updated[index] = sanitized;
      return updated;
    });

    if (sanitized && index < OTP_LENGTH - 1) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyPress = (index, key) => {
    if (key === "Backspace" && !otpDigits[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpFocus = (index) => {
    setTouched(prev => ({ ...prev, otp: true }));
    otpRefs.current[index]?.setNativeProps({ selection: { start: 0, end: 1 } });
  };

  const handleLogin = async () => {
    setIsLoading(true);

    if (!otpEnabled) {
      setTouched(prev => ({ ...prev, mobile: true }));
      if (!mobileNumber || mobileNumber.length !== PHONE_LENGTH) {
        setErrors(prev => ({ ...prev, mobile: 'Enter a valid 10-digit mobile number' }));
        setIsLoading(false);
        return;
      }

      try {
        await sendOtp(mobileNumber);
        setOtpDigits(Array(OTP_LENGTH).fill(""));
        setOtpEnabled(true);
        setErrors(prev => ({ ...prev, otp: null }));
        setTouched(prev => ({ ...prev, otp: false }));
        setTimeout(() => {
          otpRefs.current[0]?.focus();
        }, 100);
      } catch (error) {
        console.error('OTP request error:', error);
        setErrors(prev => ({ ...prev, mobile: error.message || 'Unable to send OTP' }));
      } finally {
        setIsLoading(false);
      }
      return;
    }

    // Verify OTP stage
    setTouched({ mobile: true, otp: true });

    const newErrors = {};
    if (!mobileNumber || mobileNumber.length !== PHONE_LENGTH) {
      newErrors.mobile = 'Enter a valid 10-digit mobile number';
    }
    if (otpValue.length !== OTP_LENGTH) {
      newErrors.otp = 'Enter the OTP code';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsLoading(false);
      return;
    }

    try {
      await validateOtp(mobileNumber, otpValue);
      const modems = await fetchModemsByOfficer(mobileNumber);
      
      // Store API Key and user phone in AsyncStorage after successful login
      await storeApiKey(API_KEY);
      await storeUserPhone(mobileNumber);
      
      onLogin ? onLogin(modems, mobileNumber) : null;
    } catch (error) {
      console.error('Login error:', error);
      setErrors(prev => ({ ...prev, otp: error.message || 'Unable to verify OTP' }));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          style={styles.subContainer}
          keyboardShouldPersistTaps="handled"
        >
          <View>
            <LinearGradient
              colors={["#55b56c", "#2a6f65", "#1f3d6d", "#163b7c"]}
              start={{ x: 0.5, y: 1.3 }}
              end={{ x: 0.3, y: 0.5 }}
              style={{
                height: screenHeight * 0.2,
                width: "100%",
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
              }}
            />
            <View style={styles.FormContainer}>
              <View style={styles.imageContainer}>
                <LinearGradient
                  colors={["#163b7c", "#1f3d6d", "#2a6f65", "#55b56c"]}
                  start={{ x: 0.5, y: 1 }}
                  end={{ x: 1.2, y: 0.2 }}
                  style={styles.gradientBackground}
                >
                  <Logo variant="white" size="large" />
                </LinearGradient>
              </View>

              <View style={styles.TextContainer}>
                <Text style={styles.welcomeText}>
                  {hasCompletedOtp ? "Welcome" : "Verify Your Mobile"}
                </Text>
                <Text style={styles.bestinfraText}>
                  {hasCompletedOtp ? "to Bestinfra" : "Number"}
                </Text>
              </View>
              <View style={styles.TextContainer}>
                {hasCompletedOtp ? (
                  <>
                    <Text style={styles.LoginText}>Log in to manage installations, view</Text>
                    <Text style={styles.LoginText}>real-time project updates, and access smart</Text>
                    <Text style={styles.LoginText}>metering insights — all in one platform.</Text>
                  </>
                ) : (
                  <>
                    <Text style={styles.LoginText}>
                      We will send you an OTP to verify your
                    </Text>
                    <Text style={styles.allText}>mobile number</Text>
                  </>
                )}
              </View>

              <View style={styles.inputBoxes}>
                <Input
                  placeholder="Enter mobile number"
                  value={mobileNumber}
                  onChangeText={(value) => handleInputChange('mobile', value)}
                  onBlur={() => handleBlur('mobile')}
                  autoCapitalize="none"
                  keyboardType="phone-pad"
                  maxLength={10}
                  variant="default"
                  size="medium"
                  style={styles.inputContainer}
                  error={touched.mobile ? errors.mobile : null}
                  leftIcon={
                    <Tick
                      size={16}
                      fill={errors.mobile ? COLORS.color_danger : COLORS.color_positive}
                    />
                  }
                  rightIcon={
                    <User 
                    width={20} 
                    height={20} 
                    fill={COLORS.color_text_secondary} 
                    style={styles.userIcon}
                  />
                  }
                  disabled={isLoading}
                />
                <View style={styles.otpContainer}>
                  <View style={styles.otpInputsRow}>
                    {otpDigits.map((digit, index) => (
                      <View key={`otp-${index}`} style={styles.otpInputWrapper}>
                        <TextInput
                          ref={(ref) => (otpRefs.current[index] = ref)}
                          style={[
                            styles.otpInput,
                            errors.otp && touched.otp ? styles.otpInputError : null,
                          ]}
                          value={digit}
                          onChangeText={(value) => handleOtpChange(index, value)}
                          onKeyPress={({ nativeEvent }) =>
                            handleOtpKeyPress(index, nativeEvent.key)
                          }
                          onFocus={() => handleOtpFocus(index)}
                          onBlur={() => handleBlur('otp')}
                          keyboardType="number-pad"
                          maxLength={1}
                          editable={otpEnabled && !isLoading}
                        />
                      </View>
                    ))}
                  </View>
                </View>

              {otpEnabled && (
                <Pressable
                  style={styles.rememberContainer}
                  onPress={() => !isLoading && setRememberMe(prev => !prev)}
                  disabled={isLoading}
                >
                  <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
                    {rememberMe && (
                      <Tick size={12} fill={COLORS.surfaceColor} />
                    )}
                  </View>
                  <Text style={styles.rememberLabel}>Remember this device</Text>
                </Pressable>
              )}
              </View>

              <Button
                title={
                  otpEnabled
                    ? isLoading
                      ? "Logging in..."
                      : "Login"
                    : isLoading
                      ? "Generating..."
                      : "Generate OTP"
                }
                variant={isGenerateEnabled ? "primary" : "outline"}
                size="medium"
                style={styles.loginButton}
                onPress={handleLogin}
                loading={isLoading}
                disabled={isLoading || !isGenerateEnabled}
              />

              <View style={{ backgroundColor: "#fff" }}>
                <View style={styles.straightLine}></View>
                <View style={styles.orContainer}>
                  <Text style={styles.orText}>OR</Text>
                </View>
                {otpEnabled && !hasCompletedOtp && (
                  <Text style={styles.resendText}>
                    Did not receive the code? ({formattedTimer})
                  </Text>
                )}
              </View>
            </View>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  imageContainer: {
    justifyContent: "baseline",
    alignItems: "center",
    width: "100%",
    zIndex: 999,
    marginTop:80
  },
  FormContainer: {
    padding: 30,
  },
  gradientBackground: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1f255e",
    ...Platform.select({
      ios: {
        shadowColor: COLORS.primaryFontColor,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  subContainer: {
    padding: 0,
  },
  TextContainer: {
    alignItems: "center",
    marginTop: 20,
  },
  welcomeText: {
    color: COLORS.primaryFontColor,
    fontSize: 24,
    fontFamily: "Manrope-Bold",
  },
  bestinfraText: {
    color: COLORS.primaryFontColor,
    fontSize: 24,
    fontFamily: "Manrope-Bold",
  },
  LoginText: {
    color: COLORS.primaryFontColor,
    fontSize: 14,
    textAlign: "center",
    fontFamily: "Manrope-Regular",
  },
  allText: {
    color: COLORS.primaryFontColor,
    fontSize: 14,
    textAlign: "center",
    fontFamily: "Manrope-Regular",
  },
  inputBoxes: {
    marginTop: 30,
  },
  inputContainer: {
    marginBottom: 15,
  },
  loginButton: {
    marginTop: 40,
  },
  rememberContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  checkbox: {
    width: 22,
    height: 22,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.surfaceColor,
  },
  checkboxChecked: {
    backgroundColor: COLORS.secondaryColor,
    borderColor: COLORS.secondaryColor,
  },
  rememberLabel: {
    marginLeft: 10,
    color: COLORS.secondaryColor,
    fontSize: 14,
    fontFamily: "Manrope-Medium",
  },
  otpContainer: {
    marginBottom: 15,
  },
  otpInputsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  otpInputWrapper: {
    position: "relative",
    width: 48,
    height: 52,
  },
  otpInput: {
    width: "100%",
    height: "100%",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e9eaee",
    backgroundColor: "#e9eaee",
    textAlign: "center",
    fontSize: 18,
    color: COLORS.primaryFontColor,
    fontFamily: "Manrope-SemiBold",
  },
  otpInputError: {
    borderColor: COLORS.color_danger,
  },
  orContainer: {
    backgroundColor: "#e9eaee",
    width: 32,
    height: 32,
    borderRadius: 35,
    alignSelf: "center",
    justifyContent: "center",
    zIndex: 9,
    marginTop: -18,
  },
  straightLine: {
    width: "40%",
    backgroundColor: "#e9eaee",
    marginTop: 100,
    height: 2,
    alignSelf: "center",
  },
  resendText: {
    textAlign: "center",
    marginTop: 16,
    color: COLORS.color_text_secondary,
    fontSize: 13,
    fontFamily: "Manrope-Medium",
  },
  orText: {
    color: COLORS.primaryFontColor,
    fontSize: Platform.OS === "ios" ? 14 : 12,
    textAlign: "center",
    verticalAlign: "middle",
    fontFamily: "Manrope-SemiBold",
  },
  userIcon:{
    marginRight: 8,
  }
}); 