import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import { Image as ExpoImage } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import RippleLogo from '../components/global/RippleLogo';
import Button from '../components/global/Button';
import ModemStatusCard from '../components/ModemStatusCard';
import { colors, spacing, borderRadius, typography } from '../styles/theme';
import { COLORS } from '../constants/colors';

import checkConnectionGif from '../../assets/images/Check_connection.gif';
import voltageCheckGif from '../../assets/images/voltageCheck.gif';
import checkSignalGif from '../../assets/images/Check_singal.gif';
import successImg from '../../assets/images/Success_page.gif';
import checkConnection2Gif from '../../assets/icons/check_connection2.gif';
import voltageCheck2Gif from '../../assets/icons/voltageCheck2.gif';
import checkSignal2Gif from '../../assets/icons/Check_singal2.gif';


import Menu from '../../assets/icons/bars.svg';
import NotificationLight from '../../assets/icons/notification.svg';
import CheckCircleIcon from '../../assets/icons/successIcon.svg';

// Default font
if (!Text.defaultProps) Text.defaultProps = {};
Text.defaultProps.style = [{ fontFamily: 'Manrope-Regular' }];

const troubleshootSteps = [
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
      'Reconnect all cables firmly until you hear a click',
      'Wait 30 seconds for reconnection detection',
    ]
  },
  {
    id: 2,
    title: 'Measure Input Voltage',
    description: 'Use the multimeter to confirm the supply voltage.',
    image: voltageCheckGif,

    noTitle: 'Voltage Not Detected',
    noImage: voltageCheck2Gif,
    noSubtitle: 'Follow these corrective steps.',
    noSteps: [
      'Test the power outlet with another device',
      'Inspect the power adapter for damage',
      'Check if the circuit breaker has tripped',
    ]
  },
  {
    id: 3,
    title: 'Check Signal Strength',
    description: 'Verify modem LED or app indicator shows stable signal.',
    image: checkSignalGif,

    noTitle: 'Communication Not Established',
    noSubtitle: 'Follow these steps.',
    noImage: checkSignal2Gif,
    noSteps: [
      'Power cycle the modem (30 seconds)',
      'Check network cables',
      'Verify network settings',
    ]
  },
];

const TroubleshootScreen = ({ navigation, route }) => {
  const modem = route?.params?.modem;

  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [showRetry, setShowRetry] = useState(false);

  const currentStep = troubleshootSteps[currentStepIndex];
  const isComplete = currentStepIndex >= troubleshootSteps.length;

  const statusMeta = useMemo(() => {
    if (route?.params?.status === 'Communicating') {
      return { label: 'Communicating', color: colors.secondary };
    }
    return { label: 'Non-Communicating', color: '#C62828' };
  }, [route?.params?.status]);

  const handleResponse = (isSuccess) => {
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
  };

  const handleComplete = () => navigation.navigate('Dashboard');

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />

      <View style={styles.container}>

        {/* HEADER */}
        <LinearGradient
          colors={['#f4fbf7', '#e6f4ed']}
          style={styles.heroCard}
        >
          <View style={styles.heroTopRow}>
            <Pressable style={styles.barsIcon} onPress={() => navigation.navigate('SideMenu')}>
              <Menu width={18} height={18} fill="#202d59" />
            </Pressable>

            <RippleLogo size={68} />

            <Pressable style={styles.bellIcon} onPress={() => navigation.navigate('Profile')}>
              <NotificationLight width={18} height={18} fill="#202d59" />
            </Pressable>
          </View>

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
          {!isComplete ? (
            <StepContent
              step={currentStep}
              feedback={feedback}
              showRetry={showRetry}
            />
          ) : (
            <SuccessCard image={successImg} onComplete={handleComplete} />
          )}
        </View>

        {/* BOTTOM BUTTONS */}
        {!isComplete && (
          <View style={styles.bottomResponseBar}>
            {showRetry ? (
              <TouchableOpacity
                style={[styles.responseButton, styles.responseButtonRetry]}
                onPress={() => {
                  setShowRetry(false);
                  setFeedback(null);
                }}
              >
                <Text style={styles.responseTextYes}>Retry Check</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.responseRow}>
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
              </View>
            )}
          </View>
        )}

      </View>
    </SafeAreaView>
  );
};

/* STEP CONTENT */
const StepContent = ({ step, feedback, showRetry }) => (
  <View style={styles.stepCard}>

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
);

/* SUCCESS COMPONENT */
const SuccessCard = ({ image, onComplete }) => (
  <View style={styles.successWrapper}>
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

    <Button title="Resolve Completed" onPress={onComplete} style={styles.completeButton} />
  </View>
);

/* STYLES */
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },

  container: { flex: 1 },

  heroCard: { paddingHorizontal: 18, paddingBottom: 15 },

  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
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
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },

  /* STEP CARD */
  stepCard: {
    backgroundColor: '#fff',
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    elevation: 1,
  },
  stepImage: {
    width: '100%',
    height: 200,
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

  /* BOTTOM BUTTONS */
  bottomResponseBar: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
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
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginTop: spacing.sm,
  },
  stepRowInside: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  bulletDotInside: {
    width: 5,
    height: 5,
    borderRadius: 5,
    backgroundColor: colors.textSecondary,
    marginRight: spacing.sm,
    marginTop: 6,
  },
  stepTextInside: {
    flex: 1,
    fontSize: 10,
    color: colors.textSecondary,
  },

  /* SUCCESS */
  successWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
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
