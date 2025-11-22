import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Pressable,
} from 'react-native';
import { Image as ExpoImage } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import RippleLogo from '../components/global/RippleLogo';
import Button from '../components/global/Button';
import ModemStatusCard from '../components/ModemStatusCard';
import { colors, spacing, borderRadius, typography } from '../styles/theme';
import { COLORS } from '../constants/colors';
import checkConnectionGif from '../../assets/images/Check_connection.gif';
import voltageCheckGif from '../../assets/images/voltageCheck.gif';
import checkSignalGif from '../../assets/images/Check_singal.gif';
import Menu from '../../assets/icons/bars.svg';
import NotificationLight from '../../assets/icons/notification.svg';
import CheckCircleIcon from '../../assets/icons/successIcon.svg';

// Ensure all text on this screen uses Manrope by default without changing sizes
if (!Text.defaultProps) {
  Text.defaultProps = {};
}
Text.defaultProps.style = [
  Text.defaultProps.style,
  { fontFamily: 'Manrope-Regular' },
];
import successImg from '../../assets/images/Success_page.gif';


const troubleshootSteps = [
  {
    id: 1,
    title: 'Check Connection',
    description: 'Ensure every cable and connector is firmly seated on the modem and meter.',
    image: checkConnectionGif,
  },
  {
    id: 2,
    title: 'Measure Input Voltage',
    description: 'Use the multimeter to confirm the supply voltage is within the acceptable range.',
    image: voltageCheckGif,
  },
  {
    id: 3,
    title: 'Check Signal Strength',
    description: 'Verify that the modem LED or app indicator shows a stable signal.',
    image: checkSignalGif,
  },
];

const successImage = successImg;

const TroubleshootScreen = ({ navigation, route }) => {
  const modem = route?.params?.modem;
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [feedback, setFeedback] = useState('');

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
      setFeedback('Please re-check the step until the condition is satisfied.');
      return;
    }

    setFeedback('');
    if (currentStepIndex < troubleshootSteps.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    } else {
      setCurrentStepIndex(troubleshootSteps.length);
    }
  };

  const handleComplete = () => {
    navigation?.navigate?.('Dashboard');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <View style={styles.screenContent}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <LinearGradient
            colors={['#f4fbf7', '#e6f4ed']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroCard}
          >

            <View style={styles.heroTopRow}>
              <Pressable
                style={styles.barsIcon}
                onPress={() => navigation?.navigate?.('SideMenu')}
              >
                <Menu width={18} height={18} fill="#202d59" />
              </Pressable>

              <View style={styles.logoWrapper}>
                <RippleLogo size={68} />
              </View>

              <Pressable
                style={styles.bellIcon}
                onPress={() => navigation?.navigate?.('Profile')}
              >
                <NotificationLight width={18} height={18} fill="#202d59" />
              </Pressable>
            </View>

            {!isComplete && (
              <ModemStatusCard
                modemId={modem?.modemId ?? 'MDM000'}
                statusLabel={statusMeta.label}
                statusColor={statusMeta.color ?? colors.secondary}
                statusBackground="#fff"
                style={styles.heroStatusCard}
              />
            )}
          </LinearGradient>

          <View style={styles.GifContainer}>
            {!isComplete && (
              <View style={styles.progressContainer}>
                <ProgressBars currentStep={currentStepIndex + 1} totalSteps={troubleshootSteps.length} />
              </View>
            )}
            {isComplete ? (
              <SuccessCard image={successImage} onComplete={handleComplete} />
            ) : (
              <StepContent
                step={currentStep}
              />
            )}
          </View>
        </ScrollView>

        {!isComplete && (
          <View style={styles.bottomResponseBar}>
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
            {feedback ? <Text style={styles.feedbackText}>{feedback}</Text> : null}
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

// Progress Bars Component - Shows bars filling up step by step
const ProgressBars = ({ currentStep = 1, totalSteps = 3 }) => {
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
};

const StepContent = ({ step }) => (
  <View style={styles.stepWrapper}>

    <View style={styles.stepCard}>
      <ExpoImage
        source={step.image}
        style={styles.stepImage}
        contentFit="contain"
        transition={0}
      />
      <View style={styles.stepTextBlock}>
        <Text style={styles.stepTitle}>{step.title}</Text>
        <Text style={styles.stepDescription}>{step.description}</Text>
      </View>
    </View>
  </View>
);

const SuccessCard = ({ image, onComplete }) => (
  <View style={styles.successWrapper}>
    <ExpoImage
      source={image}
      style={styles.successImage}
      contentFit="contain"
      transition={0}
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

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  screenContent: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.xxl * 2,
  },
  heroCard: {
    paddingHorizontal: 18,
    paddingBottom: 15
  },
  heroOverlayCircleLarge: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
    borderWidth: 1,
    top: -80,
    right: -80,
  },
  heroOverlayCircleSmall: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 1,
    borderColor: '#d6e8dc',
    top: 10,
    right: 20,
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    paddingHorizontal: 5
  },
  logoWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  iconChip: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.lg,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
  },
  barsIcon: {
    backgroundColor: COLORS.secondaryFontColor,
    width: 54,
    height: 54,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 1,
    zIndex: 2,
  },
  bellIcon: {
    backgroundColor: COLORS.secondaryFontColor,
    width: 54,
    height: 54,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 1,
    zIndex: 2,
  },
  heroStatusCard: {
    marginTop: 0,
  },
  GifContainer:{
    backgroundColor:"#fff"
  },
  progressContainer: {
    backgroundColor: colors.cardBackground,
    marginHorizontal: spacing.md,
    marginTop: 1,
    borderRadius: 5,
    padding: spacing.md,
  },
  progressTitle: {
    ...typography.body,
    color: colors.textPrimary,
    fontFamily: 'Manrope-SemiBold',
    fontSize: 14,
    marginBottom: spacing.sm,
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
    backgroundColor: '#4CAF50', // Green color for active/completed steps
  },
  progressBarInactive: {
    backgroundColor: '#E0E0E0', // Light gray for inactive steps
  },
  stepWrapper: {
    marginHorizontal: spacing.md,
    marginTop: spacing.lg,
  },
  stepCard: {
    backgroundColor: '#fff',
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    marginBottom: spacing.lg,
    elevation: 1,
  },
  stepImage: {
    width: '100%',
    height: 260,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  stepTextBlock: {
    marginTop: spacing.md,
  },
  stepTitle: {
    ...typography.caption,
    color: '#163B7C',
    fontFamily: 'Manrope-SemiBold',
    fontSize: 16
  },
  stepDescription: {
    ...typography.small,
    color: '#898992',
    marginTop: spacing.sm,
    fontSize: 13,
    fontFamily: 'Manrope-Regular',
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
  responseButtonYes: {
    backgroundColor: colors.secondary,
  },
  responseButtonNo: {
    backgroundColor: '#eef0f4',
  },
  responseTextYes: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '500',
  },
  responseTextNo: {
    fontSize: 14,
    color: '#6E6E6E',
    fontWeight: '500',
  },
  feedbackText: {
    marginTop: spacing.md,
    ...typography.caption,
    color: colors.error,
  },
  bottomResponseBar: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.lg,
    backgroundColor: '#fff',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#e0e0e0',
  },
  successWrapper: {
    marginHorizontal: spacing.md,
    marginTop: spacing.lg,
    alignItems: 'center',
    padding: spacing.lg,
    backgroundColor: '',
    borderRadius: borderRadius.xl,
  },
  successImage: {
    width: '100%',
    height: 150,
    borderRadius: borderRadius.lg,
  },
  successImageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: spacing.sm,
  },
  successTitle: {
    ...typography.h3,
    color: colors.secondary,
  },
  successSubtitle: {
    ...typography.caption,
    color: colors.primary,
    fontFamily: 'Manrope-Medium',
    fontSize: 16,
    marginTop: spacing.xs,
  },
  successBody: {
    ...typography.body,
    fontSize: 14,
    marginTop: spacing.xs,
    textAlign: 'center',
    fontFamily: 'Manrope-Regular',
  },
  completeButton: {
    marginTop: spacing.lg,
    alignSelf: 'stretch',
    borderRadius: 5,
    marginTop: 40,
  },
});

export default TroubleshootScreen;

