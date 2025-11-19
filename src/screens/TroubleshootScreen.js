import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import RippleLogo from '../components/global/RippleLogo';
import Button from '../components/global/Button';
import ModemStatusCard from '../components/ModemStatusCard';
import { colors, spacing, borderRadius, typography } from '../styles/theme';
import { COLORS } from '../constants/colors';
import checkWireImg from '../../assets/check-wire.png';
import checkVoltageImg from '../../assets/check-voltage.png';
import checkCommImg from '../../assets/communication.png';
import Menu from '../../assets/icons/bars.svg';
import NotificationLight from '../../assets/icons/notification.svg';

// Ensure all text on this screen uses Manrope by default without changing sizes
if (!Text.defaultProps) {
  Text.defaultProps = {};
}
Text.defaultProps.style = [
  Text.defaultProps.style,
  { fontFamily: 'Manrope-Regular' },
];
import successImg from '../../assets/success.png';


const troubleshootSteps = [
  {
    id: 1,
    title: 'Check Wire Connection',
    description: 'Verify if the main supply wire is properly connected to the meter terminals.',
    question: 'Is The Wire Properly Connected Now?',
    image: checkWireImg,
  },
  {
    id: 2,
    title: 'Check Voltage Input',
    description: 'Use the test device to confirm voltage is present in the input line.',
    question: 'Is Voltage Present At The Input Line?',
    image: checkVoltageImg,
  },
  {
    id: 3,
    title: 'Confirm Communication',
    description: 'Check if the meter symbol on your device shows active communication.',
    question: 'Is The Meter Communicating Now?',
    image: checkCommImg,
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

          <ModemStatusCard
            modemId={modem?.modemId ?? 'MDM000'}
            statusLabel={statusMeta.label}
            statusColor={statusMeta.color ?? colors.secondary}
            statusBackground="#fff"
            style={styles.heroStatusCard}
          />
        </LinearGradient>

        {!isComplete && (
          <StepIndicator
            currentStepIndex={currentStepIndex}
            totalSteps={troubleshootSteps.length}
          />
        )}
      {isComplete ? (
          <SuccessCard image={successImage} onComplete={handleComplete} />
        ) : (
          <StepContent
            step={currentStep}
            onRespond={handleResponse}
            feedback={feedback}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const StepIndicator = ({ currentStepIndex, totalSteps }) => (
  <View style={styles.stepIndicatorRow}>
    {Array.from({ length: totalSteps }).map((_, index) => {
      const isActive = index === currentStepIndex;
      const isComplete = index < currentStepIndex;
      return (
        <React.Fragment key={`step-${index}`}>
          <View
            style={[
              styles.stepCircle,
              (isActive || isComplete) && styles.stepCircleActive,
            ]}
          >
            <Text
              style={[
                styles.stepNumber,
                (isActive || isComplete) && styles.stepNumberActive,
              ]}
            >
              {index + 1}
            </Text>
          </View>
          {index < totalSteps - 1 && <View style={styles.stepDivider} />}
        </React.Fragment>
      );
    })}
  </View>
);

const StepContent = ({ step, onRespond, feedback }) => (
  <View style={styles.stepWrapper}>
    
    <View style={styles.stepCard}>
    <Image source={step.image} style={styles.stepImage} resizeMode="contain" />
      <View style={styles.stepTextBlock}>
        <Text style={styles.stepTitle}>{step.title}</Text>
        <Text style={styles.stepDescription}>{step.description}</Text>
      </View>
    </View>

    <View style={styles.questionBlock}>
      <Text style={styles.questionLabel}>{step.question}</Text>
      <View style={styles.responseRow}>
        <TouchableOpacity
          style={[styles.responseButton, styles.responseButtonYes]}
          onPress={() => onRespond(true)}
        >
          <Text style={styles.responseTextYes}>Yes</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.responseButton, styles.responseButtonNo]}
          onPress={() => onRespond(false)}
        >
          <Text style={styles.responseTextNo}>No</Text>
        </TouchableOpacity>
      </View>
      {feedback ? <Text style={styles.feedbackText}>{feedback}</Text> : null}
    </View>
  </View>
);

const SuccessCard = ({ image, onComplete }) => (
  <View style={styles.successWrapper}>
   <Image source={image} style={styles.successImage} resizeMode="contain" />
    <Text style={styles.successTitle}>Success</Text>
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
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.xxl,
  },
  heroCard: {
    paddingHorizontal:18,
    paddingBottom:15  
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
    marginTop: spacing.lg,
  },
  stepIndicatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
  },
  stepCircle: {
    width: 35,
    height: 35,
    borderRadius: 35,
    borderWidth: 1,
    borderColor: '#d7e2d9',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  stepCircleActive: {
    backgroundColor: colors.secondary,
    borderColor: colors.secondary,
  },
  stepNumber: {
    ...typography.small,
    color: colors.textSecondary,
    fontSize:14,
    fontFamily: 'Manrope-SemiBold',
  },
  stepNumberActive: {
    color: '#fff',
    fontWeight: '600',
  },
  stepDivider: {
    flex: 1,
    borderWidth: 0.8,
    borderColor: '#d7e2d9',
    borderStyle: 'dashed',
    marginHorizontal: spacing.xs,
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
  },
  stepImage: {
    width: '100%',
    height: 180,
  },
  stepTextBlock: {
    marginTop: spacing.md,
  },
  stepTitle: {
    ...typography.caption,
    color: '#163B7C',
    fontFamily: 'Manrope-SemiBold',
    fontSize:16
  },
  stepDescription: {
    ...typography.small,
    color: '#898992',
    marginTop: spacing.sm,
    fontSize:13,
    fontFamily: 'Manrope-Regular',
  },
  questionBlock: {
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    paddingBottom: spacing.xl,
  },
  questionLabel: {
    ...typography.caption,
    color: colors.textPrimary,
    marginBottom: 10,
    color: '#163B7C'
  },
  responseRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  responseButton: {
    flex: 1,
    paddingVertical: spacing.md,
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
  successWrapper: {
    marginHorizontal: spacing.md,
    marginTop: spacing.lg,
    alignItems: 'center',
    padding: spacing.lg,
    backgroundColor: '#fff',
    borderRadius: borderRadius.xl,
  },
  successImage: {
    width: 180,
    height: 180,
  },
  successTitle: {
    ...typography.h3,
    color: colors.secondary,
    marginTop: spacing.sm,
  },
  successSubtitle: {
    ...typography.caption,
    color: colors.primary,
    fontFamily: 'Manrope-Medium',
    fontSize:16,
    marginTop: spacing.xs,
  },
  successBody: {
    ...typography.body,
    fontSize:14,
    marginTop: spacing.xs,
    textAlign: 'center',
    fontFamily:'Manrope-Regular',
  },
  completeButton: {
    marginTop: spacing.lg,
    alignSelf: 'stretch',
    borderRadius:5,
    marginTop:40,
  },
});

export default TroubleshootScreen;

