import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
  SafeAreaView,
  Pressable,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import { COLORS } from "../constants/colors";
import Button from "../components/global/Button";
import Input from "../components/global/Input";
import Logo from "../components/global/Logo";
import Tick from "../../assets/icons/tick.svg";
import Icon from 'react-native-vector-icons/AntDesign';
import User from '../../assets/icons/user.svg';

const screenHeight = Dimensions.get("window").height;

const LoginScreen = ({ onLogin }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [checked, setChecked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [hasAnyInput, setHasAnyInput] = useState(false);

  // Check if any input is entered
  useEffect(() => {
    const hasUid = email && email.trim().length > 0;
    const hasPassword = password && password.trim().length > 0;
    setHasAnyInput(hasUid || hasPassword);
  }, [email, password]);

  const handleInputChange = (field, value) => {
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }

    switch (field) {
      case 'uid':
        setEmail(value);
        break;
      case 'password':
        setPassword(value);
        break;
    }
  };

  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));

    let value;
    switch (field) {
      case 'uid':
        value = email;
        break;
      case 'password':
        value = password;
        break;
      default:
        return;
    }

    // Simple validation
    if (field === 'uid' && value && value.length < 3) {
      setErrors(prev => ({ ...prev, [field]: 'UID must be at least 3 characters' }));
    } else if (field === 'password' && value && value.length < 6) {
      setErrors(prev => ({ ...prev, [field]: 'Password must be at least 6 characters' }));
    } else {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const handleLogin = async () => {
    setIsLoading(true);

    // Mark all fields as touched
    setTouched({ uid: true, password: true });

    // Simple validation
    const newErrors = {};
    if (!email || email.length < 3) {
      newErrors.uid = 'UID must be at least 3 characters';
    }
    if (!password || password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsLoading(false);
      return;
    }

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // For demo purposes, accept any valid credentials
      if (email && password) {
        onLogin();
      }
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fillDummyCredentials = () => {
    setEmail("user123");
    setPassword("pass123");
    setErrors({});
    setTouched({});
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleForgotPassword = () => {
    // Simple alert for forgot password
    alert('Please contact your system administrator to reset your password.');
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
                <Text style={styles.welcomeText}>Welcome</Text>
                <Text style={styles.bestinfraText}>to Best Infra</Text>
              </View>
              <View style={styles.TextContainer}>
                <Text style={styles.LoginText}>
                  Log in to access modem diagnostics, analytics dashboards, and
                  real-time infrastructure updates
                </Text>
                <Text style={styles.allText}>--all in one place</Text>
              </View>

              <View style={styles.inputBoxes}>
                <Input
                  placeholder="Enter your UID"
                  value={email}
                  onChangeText={(value) => handleInputChange('uid', value)}
                  onBlur={() => handleBlur('uid')}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  variant="default"
                  size="medium"
                  style={styles.inputContainer}
                  error={touched.uid ? errors.uid : null}
                  leftIcon={
                    <Tick
                      size={16}
                      fill={errors.uid ? COLORS.color_danger : COLORS.color_positive}
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

                <Input
                  placeholder="Password"
                  value={password}
                  onChangeText={(value) => handleInputChange('password', value)}
                  onBlur={() => handleBlur('password')}
                  secureTextEntry={!showPassword}
                  variant="default"
                  size="medium"
                  style={styles.inputContainer}
                  error={touched.password ? errors.password : null}
                  leftIcon={
                    <Tick
                      size={16}
                      fill={errors.password ? COLORS.color_danger : COLORS.color_positive}
                    />
                  }
                  rightIcon={
                    <Pressable onPress={togglePasswordVisibility} disabled={isLoading}>
                      <View style={styles.eyeIconContainer}>
                        <Icon
                          name={showPassword ? "eye" : "eyeo"}
                          size={20}
                          color={COLORS.color_text_secondary}
                        />
                      </View>
                    </Pressable>
                  }
                  disabled={isLoading}
                />
              </View>

              <View style={styles.forgetboxContainer}>
                <Pressable
                  style={styles.checkboxContainer}
                  onPress={() => !isLoading && setChecked(!checked)}
                  disabled={isLoading}
                >
                  <View style={[styles.checkbox, checked && styles.checked]}>
                    {checked && (
                      <Tick
                        size={14}
                        fill={COLORS.surfaceColor}
                      />
                    )}
                  </View>
                  <Text style={styles.rememberText}>Remember</Text>
                </Pressable>
                <Button
                  title="Forgot Password?"
                  variant="ghost"
                  size="small"
                  onPress={handleForgotPassword}
                  textStyle={styles.forgotText}
                  disabled={isLoading}
                />
              </View>

              <Button
                title={isLoading ? "Logging in..." : "Login Now"}
                variant={hasAnyInput ? "primary" : "outline"}
                size="medium"
                style={styles.loginButton}
                onPress={handleLogin}
                loading={isLoading}
                disabled={isLoading || !hasAnyInput}
              />

              <Button
                title="Fill Dummy Credentials"
                variant="outline"
                size="small"
                style={styles.dummyButton}
                onPress={fillDummyCredentials}
                disabled={isLoading}
              />

              <View style={{ backgroundColor: "#fff" }}>
                <View style={styles.straightLine}></View>
                <View style={styles.orContainer}>
                  <Text style={styles.orText}>OR</Text>
                </View>
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
  forgetboxContainer: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 10,
    fontFamily: "Manrope-Medium",
  },
  rememberText: {
    color: COLORS.secondaryColor,
    fontSize: 14,
    textAlign: "center",
    fontFamily: "Manrope-Medium",
    marginLeft: 10,
  },
  forgotText: {
    color: COLORS.secondaryColor,
    fontSize: 14,
    textAlign: "center",
    fontFamily: "Manrope-Medium",
  },
  loginButton: {
    marginTop: 20,
  },
  dummyButton: {
    marginTop: 10,
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 5,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  checked: {
    backgroundColor: COLORS.secondaryColor,
    borderColor: COLORS.secondaryColor,
  },
  eyeIconContainer: {
    padding: 8,
    justifyContent: "center",
    alignItems: "center",
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
    marginTop: 40,
    height: 2,
    alignSelf: "center",
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