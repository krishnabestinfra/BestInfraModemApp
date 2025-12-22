import React, { useMemo, useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { Image as ExpoImage } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import AppHeader from '../components/global/AppHeader';
import Button from '../components/global/Button';
import ModemStatusCard from '../components/ModemStatusCard';
import { colors, spacing, borderRadius } from '../styles/theme';
import { COLORS } from '../constants/colors';
import { getTroubleshootSteps, hasTroubleshootSteps } from '../data/troubleshootData';
import { extractModemId } from '../utils/modemHelpers';
import successImg from '../../assets/images/Success_page.gif';
import CheckCircleIcon from '../../assets/icons/successIcon.svg';

if (!Text.defaultProps) Text.defaultProps = {};
Text.defaultProps.style = [{ fontFamily: 'Manrope-Regular' }];

const TroubleshootScreen = ({ navigation, route }) => {
  const modem = route?.params?.modem;
  const errorCode = modem?.code || modem?.errorCode || modem?.originalAlert?.code || modem?.originalData?.code;
  const showSuccess = route?.params?.showSuccess || false; // Parameter to show success page directly

  const troubleshootSteps = useMemo(() => {
    const codeNum = typeof errorCode === 'number' ? errorCode : parseInt(errorCode);
    
    if (codeNum && !isNaN(codeNum) && hasTroubleshootSteps(codeNum)) {
      return getTroubleshootSteps(codeNum);
    }
    return [];
  }, [errorCode]);

  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [showRetry, setShowRetry] = useState(false);

  useEffect(() => {
    // If showSuccess is true, set currentStepIndex to show success immediately
    if (showSuccess && troubleshootSteps.length > 0) {
      setCurrentStepIndex(troubleshootSteps.length);
    } else {
      setCurrentStepIndex(0);
    }
    setFeedback(null);
    setShowRetry(false);
  }, [errorCode, showSuccess, troubleshootSteps.length]);

  const currentStep = troubleshootSteps[currentStepIndex];
  const hasSteps = troubleshootSteps.length > 0;
  const isComplete = showSuccess || (hasSteps && currentStepIndex >= troubleshootSteps.length);

  const statusMeta = useMemo(() => {
    if (route?.params?.status === 'Communicating') {
      return { label: 'Communicating', color: colors.secondary };
    }
    return { label: 'Non-Communicating', color: '#C62828' };
  }, [route?.params?.status]);

  const handleResponse = useCallback((isSuccess) => {
    // Check if current step is "Is Modem Replaced" and user clicked "Yes"
    if (isSuccess && currentStep?.title?.trim() === 'Is Modem Replaced') {
      // Extract modem ID from various possible fields
      const modemId = extractModemId(modem) || 
                      modem?.modemId || 
                      modem?.modemSlNo || 
                      modem?.modemno || 
                      route?.params?.modemId || 
                      'MDM000';
      
      // Navigate to ReplacedModemDetailsScreen with old modem ID
      navigation.navigate('ReplacedModemDetails', {
        oldModem: modemId,
      });
      return;
    }

    // Check if current step is "Is Modem Replaced" and user clicked "No"
    // If modem is not replaced, navigate to success screen with remark option
    if (!isSuccess && currentStep?.title?.trim() === 'Is Modem Replaced') {
      // Extract modem ID from various possible fields
      const modemId = extractModemId(modem) || 
                      modem?.modemId || 
                      modem?.modemSlNo || 
                      modem?.modemno || 
                      route?.params?.modemId || 
                      'MDM000';
      
      // Navigate to ModemReplacementSuccessScreen with isReplaced=false
      navigation.navigate('ModemReplacementSuccess', {
        oldModem: modemId,
        isReplaced: false,
        modem: modem,
      });
      return;
    }

    // Check if current step is "Confirm Communication" and user clicked "No" (issue not fixed)
    if (!isSuccess && currentStep?.title?.trim() === 'Confirm Communication') {
      // Navigate to IssueNotResolvedScreen
      navigation.navigate('IssueNotResolved', {
        modem: modem,
        status: route?.params?.status,
      });
      return;
    }

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
  }, [currentStep, currentStepIndex, troubleshootSteps.length, modem, navigation, route]);

  const handleComplete = useCallback(() => {
    // Navigate directly to Dashboard without API check
    navigation.navigate('Dashboard', { refresh: true });
  }, [navigation]);

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
            navigation={navigation}
            containerStyle={styles.heroTopRow}
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
            {isComplete ? (
              <SuccessCard 
                image={successImg} 
                onComplete={handleComplete}
              />
            ) : !hasSteps ? (
              <View style={styles.noStepsContainer}>
                <Text style={styles.noStepsText}>No troubleshooting steps available for this error code.</Text>
              </View>
            ) : (
              <StepContent
                step={currentStep}
                feedback={feedback}
                showRetry={showRetry}
              />
            )}
          </View>
        </View>

        {/* BOTTOM BUTTONS */}
        {!isComplete && (
          <View style={styles.bottomResponseBar}>
            <View style={styles.responseRow}>
              {showRetry ? (
                <Button
                  title="Retry Check"
                  onPress={handleRetry}
                  variant="primary"
                  size="medium"
                  style={{ flex: 1 }}
                />
              ) : (
                <>
                  <Button
                    title="Yes"
                    onPress={() => handleResponse(true)}
                    variant="primary"
                    size="medium"
                    style={{ flex: 1 }}
                  />

                  <Button
                    title="No"
                    onPress={() => handleResponse(false)}
                    variant="gray"
                    size="medium"
                    style={{ flex: 1 }}
                  />
                </>
              )}
            </View>
          </View>
        )}

      </View>
    </SafeAreaView>
  );
};

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
const SuccessCard = React.memo(({ image, onComplete }) => (
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
        title="Issue Fixed" 
        onPress={onComplete} 
        style={{ width: '100%', marginTop: spacing.md }}
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
    paddingBottom: spacing.lg,
    backgroundColor: '#fff',
  },
  responseRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  
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
  noStepsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
  },
  noStepsText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    fontFamily: 'Manrope-Medium',
  },
});

export default TroubleshootScreen;
