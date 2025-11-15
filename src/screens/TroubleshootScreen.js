import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Logo from '../components/global/Logo';
import Button from '../components/global/Button';
import { colors, spacing, borderRadius, typography } from '../styles/theme';

const troubleshootSteps = [
  {
    id: 1,
    title: 'Check Wire Connection',
    description: 'Verify if the main supply wire is properly connected to the meter terminals.',
    question: 'Is the wire properly connected now?',
    image: 'https://res.cloudinary.com/dk3rdh3yo/image/upload/v1731598800/bestinfra-wire.png',
  },
  {
    id: 2,
    title: 'Check Voltage Input',
    description: 'Use the test device to confirm voltage is present in the input line.',
    question: 'Is voltage present at the input line?',
    image: 'https://res.cloudinary.com/dk3rdh3yo/image/upload/v1731598800/bestinfra-voltage.png',
  },
  {
    id: 3,
    title: 'Confirm Communication',
    description: 'Check if the meter symbol on your device shows active communication.',
    question: 'Is the meter communicating now?',
    image: 'https://res.cloudinary.com/dk3rdh3yo/image/upload/v1731598800/bestinfra-communication.png',
  },
];

const successImage =
  'https://res.cloudinary.com/dk3rdh3yo/image/upload/v1731598800/bestinfra-success.png';

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
          <View style={styles.heroOverlayCircleLarge} />
          <View style={styles.heroOverlayCircleSmall} />

          <View style={styles.heroTopRow}>
            <TouchableOpacity style={styles.iconChip} onPress={() => navigation?.goBack?.()}>
              <Ionicons name="chevron-back" size={18} color={colors.primary} />
            </TouchableOpacity>

            <Logo width={60} height={24} />

            <TouchableOpacity
              style={styles.iconChip}
              onPress={() => navigation?.navigate?.('Profile')}
            >
              <Ionicons name="notifications-outline" size={18} color={colors.primary} />
            </TouchableOpacity>
          </View>

          <View style={styles.heroContent}>
            <View>
              <Text style={styles.heroLabel}>Modem No</Text>
              <Text style={styles.heroValue}>{modem?.modemId ?? 'MDM000'}</Text>
            </View>
            <View style={styles.statusBadge}>
              <View
                style={[
                  styles.statusDot,
                  { backgroundColor: statusMeta.color ?? colors.secondary },
                ]}
              />
              <Text style={styles.statusBadgeText}>{statusMeta.label}</Text>
            </View>
          </View>
        </LinearGradient>

        <StepIndicator currentStepIndex={currentStepIndex} totalSteps={troubleshootSteps.length} />

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
      <Image source={{ uri: step.image }} style={styles.stepImage} resizeMode="contain" />
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
    <Image source={{ uri: image }} style={styles.successImage} resizeMode="contain" />
    <Text style={styles.successTitle}>Success</Text>
    <Text style={styles.successSubtitle}>Issue successfully resolved</Text>
    <Text style={styles.successBody}>The meter is now communicating properly.</Text>
    <Button title="Complete Job" onPress={onComplete} style={styles.completeButton} />
  </View>
);

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.xxl,
  },
  heroCard: {
    margin: spacing.md,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    overflow: 'hidden',
  },
  heroOverlayCircleLarge: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
    borderWidth: 1,
    borderColor: '#d6e8dc',
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
  iconChip: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.lg,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
  },
  heroContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  heroLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  heroValue: {
    ...typography.h2,
    color: colors.textPrimary,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.round,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: spacing.xs,
  },
  statusBadgeText: {
    ...typography.small,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  stepIndicatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
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
  },
  stepNumberActive: {
    color: '#fff',
    fontWeight: '600',
  },
  stepDivider: {
    flex: 1,
    height: 1,
    backgroundColor: '#d7e2d9',
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
    elevation: 3,
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
    ...typography.h3,
    color: colors.textPrimary,
  },
  stepDescription: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  questionBlock: {
    marginTop: spacing.md,
    paddingBottom: spacing.xl,
  },
  questionLabel: {
    ...typography.h4,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  responseRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  responseButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
  },
  responseButtonYes: {
    backgroundColor: colors.secondary,
  },
  responseButtonNo: {
    backgroundColor: '#eef0f4',
  },
  responseTextYes: {
    color: '#fff',
    fontWeight: '600',
  },
  responseTextNo: {
    color: colors.textSecondary,
    fontWeight: '600',
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
    elevation: 3,
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
    ...typography.body,
    color: colors.primary,
    fontWeight: '600',
    marginTop: spacing.xs,
  },
  successBody: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  completeButton: {
    marginTop: spacing.lg,
    alignSelf: 'stretch',
  },
});

export default TroubleshootScreen;

