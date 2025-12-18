import React, { useMemo, useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Image as ExpoImage } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import RippleLogo from '../components/global/RippleLogo';
import AppHeader from '../components/global/AppHeader';
import Button from '../components/global/Button';
import ModemStatusCard from '../components/ModemStatusCard';
import { colors, spacing, borderRadius } from '../styles/theme';
import { COLORS } from '../constants/colors';
import { getTroubleshootSteps, hasTroubleshootSteps } from '../data/troubleshootData';
import { extractModemId } from '../utils/modemHelpers';

import checkConnectionGif from '../../assets/images/Check_connection.gif';
import voltageCheckGif from '../../assets/images/voltageCheck.gif';
import checkSignalGif from '../../assets/images/Check_singal.gif';
import successImg from '../../assets/images/Success_page.gif';
import checkConnection2Gif from '../../assets/icons/check_connection2.gif';
import voltageCheck2Gif from '../../assets/icons/voltageCheck2.gif';
import checkSignal2Gif from '../../assets/icons/Check_singal2.gif';


import NotificationLight from '../../assets/icons/notification.svg';
import CheckCircleIcon from '../../assets/icons/successIcon.svg';

// Default font
if (!Text.defaultProps) Text.defaultProps = {};
Text.defaultProps.style = [{ fontFamily: 'Manrope-Regular' }];

// Default generic troubleshooting steps (fallback)
const defaultTroubleshootSteps = [
  {
    id: 1,
    title: 'Check Cable Connection',
    description: 'Ensure every cable and connector is firmly seated on the modem and meter.',
    image: checkConnectionGif,

    noTitle: 'Cable Not Connected Properly',
    noSubtitle: 'The cable connection check has failed. Please follow these steps.',
    noImage: checkConnection2Gif,
    noSteps: [
      'Disconnect all cables and inspect for any visible damage',
      'Firmly reconnect all cables ensuring you hear/feel a click when properly seated',
      'Wait 30 seconds for the modem to recognize the connections',
    ]
  },
  {
    id: 2,
    title: 'Measure Input Voltage',
    description: 'Use the multimeter to confirm the supply voltage.',
    image: voltageCheckGif,

    noTitle: 'Voltage Not Detected at Input Line',
    noImage: voltageCheck2Gif,
    noSubtitle: 'No voltage has been detected. Follow these corrective steps carefully.',
    noSteps: [
      'Check if the power outlet is working by testing with another device',
      'Inspect the power adapter for any damage or burnt smell',
      'Verify the circuit breaker has not tripped for this line',
    ]
  },
  {
    id: 3,
    title: 'Check Signal Strength',
    description: 'Verify modem LED or app indicator shows stable signal.',
    image: checkSignalGif,

    noTitle: 'Communication Not Established',
    noSubtitle: 'The modem is unable to communicate with the network. Follow these steps.',
    noImage: checkSignal2Gif,
    noSteps: [
      'Power cycle the modem by unplugging it for 30 seconds',
      'Check that network cables are securely connected',
      'Verify network settings and configuration are correct',
    ]
  },
];

const TroubleshootScreen = ({ navigation, route }) => {
  const modem = route?.params?.modem;
  
  // Get error code from modem
  const errorCode = modem?.code || modem?.errorCode || modem?.originalAlert?.code || modem?.originalData?.code;

  // Get troubleshooting steps based on error code
  const troubleshootSteps = useMemo(() => {
    const codeNum = typeof errorCode === 'number' ? errorCode : parseInt(errorCode);
    
    if (codeNum && !isNaN(codeNum) && hasTroubleshootSteps(codeNum)) {
      return getTroubleshootSteps(codeNum);
    }
    return defaultTroubleshootSteps;
  }, [errorCode]);

  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [showRetry, setShowRetry] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(false);

  useEffect(() => {
    setCurrentStepIndex(0);
    setFeedback(null);
    setShowRetry(false);
  }, [errorCode]);

  const currentStep = troubleshootSteps[currentStepIndex];
  const isComplete = currentStepIndex >= troubleshootSteps.length;

  const statusMeta = useMemo(() => {
    if (route?.params?.status === 'Communicating') {
      return { label: 'Communicating', color: colors.secondary };
    }
    return { label: 'Non-Communicating', color: '#C62828' };
  }, [route?.params?.status]);

  const handleResponse = useCallback((isSuccess) => {
    if (!isSuccess) {
      setShowRetry(true);
      setFeedback({
        title: currentStep.noTitle,
        subtitle: currentStep.noSubtitle,
        steps: currentStep.noSteps,
      });
      return;
    }

    setShowRetry(false);
    setFeedback(null);

    if (currentStepIndex < troubleshootSteps.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    } else {
      setCurrentStepIndex(troubleshootSteps.length);
    }
  }, [currentStep, currentStepIndex, troubleshootSteps.length]);

  const checkModemStatus = useCallback(async (modemId) => {
    try {
      if (!modemId) return false;

      const url = `https://api.bestinfra.app/v2tgnpdcl/api/modems/modem/${modemId}/status`;
      const response = await fetch(url, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const json = await response.json();
      return json.success && json.data && json.data.status === "resolved";
    } catch (error) {
      console.error('Error checking modem status:', error);
      return false;
    }
  }, []);

  const handleComplete = useCallback(async () => {
    setCheckingStatus(true);
    
    // Extract modem ID from various possible fields
    const modemId = extractModemId(modem) || 
                    modem?.modemId || 
                    modem?.modemSlNo || 
                    modem?.modemno || 
                    route?.params?.modemId;

    try {
      const isResolved = await checkModemStatus(modemId);
      
      if (isResolved) {
        // Status is resolved - refresh dashboard and navigate
        navigation.navigate('Dashboard', { refresh: true });
      } else {
        // Status is not resolved - redirect to dashboard so user can start process again
        navigation.navigate('Dashboard', { refresh: true });
      }
    } catch (error) {
      // On error, redirect to dashboard so user can start process again
      navigation.navigate('Dashboard', { refresh: true });
    } finally {
      setCheckingStatus(false);
    }
  }, [modem, navigation, checkModemStatus, route]);

  const handleRetry = useCallback(() => {
    setShowRetry(false);
    setFeedback(null);
  }, []);

  return (
    <SafeAreaView style={styles.safeArea} edges={[]}>
      <StatusBar style="dark" />

      <View style={styles.container}>

        {/* HEADER */}
        <LinearGradient
          colors={['#f4fbf7', '#e6f4ed']}
          style={styles.heroCard}
        >
          <AppHeader
            containerStyle={styles.heroTopRow}
            leftButtonStyle={styles.barsIcon}
            rightButtonStyle={styles.bellIcon}
            rightIcon={NotificationLight}
            logo={<RippleLogo size={68} />}
            onPressLeft={() => navigation.navigate('SideMenu')}
            onPressCenter={() => navigation.navigate('Dashboard')}
            onPressRight={() => navigation.navigate('Profile')}
          />

          {!isComplete && (
            <ModemStatusCard
              modemId={modem?.modemId ?? 'MDM000'}
              statusLabel={statusMeta.label}
              statusColor={statusMeta.color}
              statusBackground="#fff"
            />
          )}
        </LinearGradient>

        {/* MAIN CONTENT */}
        <View style={styles.stepArea}>
          {!isComplete && (
            <View style={styles.progressContainer}>
              <ProgressBars currentStep={currentStepIndex + 1} totalSteps={troubleshootSteps.length} />
            </View>
          )}
          <View style={styles.contentWrapper}>
            {!isComplete ? (
              <StepContent
                step={currentStep}
                feedback={feedback}
                showRetry={showRetry}
              />
            ) : (
              <SuccessCard 
                image={successImg} 
                onComplete={handleComplete}
                checkingStatus={checkingStatus}
              />
            )}
          </View>
        </View>

        {/* BOTTOM BUTTONS */}
        {!isComplete && (
          <View style={styles.bottomResponseBar}>
            <View style={styles.responseRow}>
              {showRetry ? (
                <TouchableOpacity
                  style={[styles.responseButton, styles.responseButtonRetry]}
                  onPress={handleRetry}
                >
                  <Text style={styles.responseTextYes}>Retry Check</Text>
                </TouchableOpacity>
              ) : (
                <>
                  <TouchableOpacity
                    style={[styles.responseButton, styles.responseButtonYes]}
                    onPress={() => handleResponse(true)}
                  >
                    <Text style={styles.responseTextYes}>Yes</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.responseButton, styles.responseButtonNo]}
                    onPress={() => handleResponse(false)}
                  >
                    <Text style={styles.responseTextNo}>No</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>
        )}

      </View>
    </SafeAreaView>
  );
};

/* PROGRESS BARS COMPONENT */
const ProgressBars = React.memo(({ currentStep = 1, totalSteps = 3 }) => {
  const steps = useMemo(() => Array.from({ length: totalSteps }, (_, idx) => idx + 1), [totalSteps]);

  return (
    <View style={styles.progressBarsWrapper}>
      {steps.map((step) => (
        <View
          key={step}
          style={[
            styles.progressBar,
            step <= currentStep ? styles.progressBarActive : styles.progressBarInactive,
          ]}
        />
      ))}
    </View>
  );
});

/* STEP CONTENT */
const StepContent = React.memo(({ step, feedback, showRetry }) => (
  <View style={[styles.stepCard, styles.cardShadow]}>

    <ExpoImage
      source={showRetry ? step.noImage : step.image}
      style={styles.stepImage}
      contentFit="contain"
    />

    {!showRetry ? (
      <>
        <Text style={styles.stepTitle}>{step.title}</Text>
        <Text style={styles.stepDescription}>{step.description}</Text>
      </>
    ) : (
      <>
        <Text style={styles.stepTitle}>{feedback.title}</Text>
        <Text style={styles.stepDescription}>{feedback.subtitle}</Text>

        <View style={styles.feedbackCardInside}>
          {feedback.steps.map((s, i) => (
            <View key={i} style={styles.stepRowInside}>
              <View style={styles.bulletDotInside} />
              <Text style={styles.stepTextInside}>{s}</Text>
            </View>
          ))}
        </View>
      </>
    )}

  </View>
));

/* SUCCESS COMPONENT */
const SuccessCard = React.memo(({ image, onComplete, checkingStatus = false }) => (
  <View style={styles.successWrapper}>
    <View style={styles.successCard}>
      <ExpoImage
        source={image}
        style={styles.successImage}
        contentFit="contain"
      />

      <View style={styles.successImageContainer}>
        <CheckCircleIcon width={18} height={18} />
        <Text style={styles.successTitle}>Success</Text>
      </View>

      <Text style={styles.successSubtitle}>Issue successfully resolved</Text>
      <Text style={styles.successBody}>The meter is now communicating properly.</Text>

      <Button 
        title={checkingStatus ? "Checking Status..." : "Issue Fixed"} 
        onPress={onComplete} 
        style={styles.completeButton}
        disabled={checkingStatus}
        loading={checkingStatus}
      />
    </View>
  </View>
));

/* STYLES */
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },

  container: { flex: 1 },

  heroCard: {
    paddingHorizontal: 18,
    paddingBottom: 15,
    overflow: 'hidden',
  },

  heroTopRow: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  barsIcon: {
    backgroundColor: COLORS.secondaryFontColor,
    width: 54, height: 54,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center'
  },
  bellIcon: {
    backgroundColor: COLORS.secondaryFontColor,
    width: 54, height: 54,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center'
  },

  /* MAIN AREA */
  stepArea: {
    flex: 1,
    paddingHorizontal: spacing.md,
  },

  progressContainer: {
    backgroundColor: colors.cardBackground,
    marginHorizontal: 0,
    marginTop: spacing.md,
    borderRadius: 5,
    padding: spacing.md,
    marginBottom: spacing.md,
  },

  progressBarsWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },

  progressBar: {
    flex: 1,
    height: 8,
    borderRadius: 4,
  },

  progressBarActive: {
    backgroundColor: colors.secondary, // Green color for active/completed steps
  },

  progressBarInactive: {
    backgroundColor: '#E0E0E0', // Light gray for inactive steps
  },

  contentWrapper: {
    flex: 1,
  },

  /* STEP CARD */
  stepCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  cardShadow: {
    shadowColor: 'rgba(22, 59, 124, 0.18)',
    shadowOffset: { width: 6, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  stepImage: {
    width: '100%',
    height: 240,
    borderRadius: borderRadius.lg
  },
  stepTitle: {
    fontSize: 16,
    color: '#163B7C',
    marginTop: spacing.md,
    fontFamily: 'Manrope-SemiBold',
  },
  stepDescription: {
    fontSize: 13,
    color: '#898992',
    marginTop: spacing.sm,
  },

  bottomResponseBar: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxl,
    backgroundColor: '#fff',
  },
  responseRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  responseButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 5,
    alignItems: 'center',
  },
  responseButtonYes: { backgroundColor: colors.secondary },
  responseButtonNo: { backgroundColor: '#eef0f4' },
  responseButtonRetry: { backgroundColor: colors.secondary },

  responseTextYes: { fontSize: 14, color: '#fff', fontWeight: '500' },
  responseTextNo: { fontSize: 14, color: '#6E6E6E', fontWeight: '500' },

  /* FAILURE CONTENT */
  feedbackCardInside: {
    backgroundColor: '#F7F7F7',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.xsm,
    marginTop: spacing.ms,
  },
  stepRowInside: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
    width: '100%',
  },
  bulletDotInside: {
    width: 5,
    height: 5,
    borderRadius: '50%',
    backgroundColor: colors.secondary,
    marginRight: spacing.sm,
    marginTop: 6,
  },
  stepTextInside: {
    flex: 1,
    fontSize: 10,
    color: colors.textSecondary,
    fontFamily: 'Manrope',
  },

  /* SUCCESS */
  successWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
  },
  successCard: {
    width: '100%',
    borderRadius: borderRadius.xl,
    backgroundColor: '#fff',
    padding: spacing.md,
    alignItems: 'center',
  },
  successImage: {
    width: '100%',
    height: 150,
    borderRadius: borderRadius.lg,
  },
  successImageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md,
  },
  successTitle: {
    fontSize: 24,
    color: colors.secondary,
    marginLeft: 8,
    fontFamily: 'Manrope-SemiBold',
  },
  successSubtitle: {
    fontSize: 16,
    marginTop: spacing.xs,
  },
  successBody: {
    fontSize: 14,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  completeButton: {
    width: '100%',
    marginTop: spacing.md,
  },
});

export default TroubleshootScreen;
