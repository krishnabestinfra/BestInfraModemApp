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
import Logo from '../components/global/Logo';
import RippleLogo from '../components/global/RippleLogo';
import Button from '../components/global/Button';
import ModemStatusCard from '../components/ModemStatusCard';
import { colors, spacing, borderRadius, typography } from '../styles/theme';
import { COLORS } from '../constants/colors';
import checkWireImg from '../../assets/check-wire.png';
import checkVoltageImg from '../../assets/check-voltage.png';
import checkCommImg from '../../assets/communication.png';
import Menu from '../../assets/icons/bars.svg';
import MenuIcon from '../../assets/icons/bars.svg';
import NotificationLight from '../../assets/icons/notification.svg';
import NotificationIcon from '../../assets/icons/notificationDark.svg';
import DashboardIcon from '../../assets/icons/dashboardMenu.svg';
import ActiveDashboard from '../../assets/icons/activeDashboard.svg';
import UsageIcon from '../../assets/icons/usageMenu.svg';
import ActiveUsage from '../../assets/icons/activeUsage.svg';
import PaymentsIcon from '../../assets/icons/paymentsMenu.svg';
import ActivePayments from '../../assets/icons/activePayments.svg';
import TransactionsIcon from '../../assets/icons/transactionMenu.svg';
import ActiveTransactions from '../../assets/icons/transactionsActive.svg';
import TicketsIcon from '../../assets/icons/ticketsMenu.svg';
import ActiveTickets from '../../assets/icons/activeTickets.svg';
import SettingsIcon from '../../assets/icons/settingMenu.svg';
import ActiveSettings from '../../assets/icons/activeSettings.svg';
import LogoutIcon from '../../assets/icons/logoutMenu.svg';
import ActiveLogout from '../../assets/icons/activeLogout.svg';

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
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeMenuItem, setActiveMenuItem] = useState('Dashboard');

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
            <Pressable style={styles.barsIcon} onPress={() => setIsMenuOpen(true)}>
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

      {isMenuOpen && (
        <SideMenuOverlay
          activeItem={activeMenuItem}
          onSelect={(itemKey) => {
            setActiveMenuItem(itemKey);
            handleMenuNavigation(itemKey, navigation);
            setIsMenuOpen(false);
          }}
          onClose={() => setIsMenuOpen(false)}
          onLogout={() => {
            setActiveMenuItem('Logout');
            navigation?.replace?.('Login');
            setIsMenuOpen(false);
          }}
        />
      )}
    </SafeAreaView>
  );
};

const handleMenuNavigation = (itemKey, navigation) => {
  const routeMap = {
    Dashboard: 'Dashboard',
    Usage: 'Dashboard',
    PostPaidRechargePayments: 'Alerts',
    Transactions: 'ModemDetails',
    DG: 'Dashboard',
    Settings: 'Dashboard',
  };

  const routeName = routeMap[itemKey];
  if (routeName) {
    navigation?.navigate?.(routeName);
  }
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
  sideMenuRoot: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 99,
  },
  sideMenuBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  sideMenuPanel: {
    flex: 1,
    backgroundColor: COLORS.brandBlueColor,
    paddingTop: 75,
    paddingHorizontal: 30,
  },
  sideMenuTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 35,
  },
  sideMenuCircle: {
    width: 54,
    height: 54,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  circleLight: {
    backgroundColor: COLORS.secondaryFontColor,
  },
  circleSecondary: {
    backgroundColor: COLORS.secondaryColor,
  },
  circleIconLight: {
    backgroundColor: '#fff',
  },
  sideMenuContent: {
    flexDirection: 'row',
    flex: 1,
  },
  menuListWrapper: {
    width: '45%',
    paddingRight: 20,
    justifyContent: 'space-between',
  },
  menuList: {},
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  menuIcon: {
    marginRight: 20,
    opacity: 0.5,
  },
  menuText: {
    fontSize: 16,
    fontFamily: 'Manrope-Medium',
    color: COLORS.secondaryFontColor,
    opacity: 0.7,
  },
  menuTextActive: {
    opacity: 1,
    fontFamily: 'Manrope-Bold',
  },
  menuFooter: {
    paddingBottom: 30,
  },
  logoutButtonRow: {
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  logoutText: {
    fontSize: 16,
    fontFamily: 'Manrope-Medium',
    color: COLORS.secondaryFontColor,
    opacity: 0.7,
  },
  logoutIcon: {
    marginRight: 20,
    opacity: 0.6,
  },
  menuVersion: {
    fontSize: 12,
    fontFamily: 'Manrope-Medium',
    color: '#89A1F3',
    marginTop: 10,
  },
  menuPreviewWrapper: {
    flex: 1,
    position: 'relative',
    paddingLeft: 40,
  },
  previewCard: {
    flex: 1,
    backgroundColor: '#eef8f0',
    borderTopLeftRadius: 20,
    borderBottomLeftRadius: 20,
    padding: 24,
    elevation: 10,
  },
  previewGhost: {
    position: 'absolute',
    top: 80,
    bottom: 0,
    left: 25,
    right: 0,
    backgroundColor: '#eef8f0',
    opacity: 0.3,
    borderTopLeftRadius: 30,
    borderBottomLeftRadius: 20,
  },
  previewTitle: {
    fontSize: 18,
    fontFamily: 'Manrope-Bold',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  previewSubtitle: {
    fontSize: 14,
    fontFamily: 'Manrope-Medium',
    color: colors.textSecondary,
  },
});

const MENU_ITEMS = [
  {
    key: 'Dashboard',
    label: 'Dashboard',
    Icon: DashboardIcon,
    ActiveIcon: ActiveDashboard,
  },
  {
    key: 'Usage',
    label: 'Usage',
    Icon: UsageIcon,
    ActiveIcon: ActiveUsage,
  },
  {
    key: 'PostPaidRechargePayments',
    label: 'Payments',
    Icon: PaymentsIcon,
    ActiveIcon: ActivePayments,
  },
  {
    key: 'Transactions',
    label: 'Transactions',
    Icon: TransactionsIcon,
    ActiveIcon: ActiveTransactions,
  },
  {
    key: 'DG',
    label: 'Diesel Generator',
    Icon: TicketsIcon,
    ActiveIcon: ActiveTickets,
  },
  {
    key: 'Settings',
    label: 'Settings',
    Icon: SettingsIcon,
    ActiveIcon: ActiveSettings,
  },
];

const SideMenuOverlay = ({ activeItem, onSelect, onClose, onLogout }) => (
  <View pointerEvents="box-none" style={styles.sideMenuRoot}>
    <Pressable style={styles.sideMenuBackdrop} onPress={onClose} />

    <View style={styles.sideMenuPanel}>
      <View style={styles.sideMenuTopRow}>
        <Pressable style={[styles.sideMenuCircle, styles.circleLight]} onPress={onClose}>
          <MenuIcon width={18} height={18} fill="#202d59" />
        </Pressable>

        <Logo variant="white" size="medium" />

        <Pressable
          style={[styles.sideMenuCircle, styles.circleIconLight]}
          onPress={() => {
            onClose();
          }}
        >
          <NotificationIcon width={18} height={18} fill="#0c1f3d" />
        </Pressable>
      </View>

      <View style={styles.sideMenuContent}>
        <View style={styles.menuListWrapper}>
          <SideMenuNavigation activeItem={activeItem} onSelect={onSelect} onLogout={onLogout} />
        </View>

        <View style={styles.menuPreviewWrapper}>
          <View style={styles.previewCard}>
            <Text style={styles.previewTitle}>Need quick insights?</Text>
            <Text style={styles.previewSubtitle}>
              Access your modem diagnostics, payments, and tickets without leaving the field.
            </Text>
          </View>
          <View style={styles.previewGhost} />
        </View>
      </View>
    </View>
  </View>
);

const SideMenuNavigation = ({ activeItem, onSelect, onLogout }) => (
  <>
    <View style={styles.menuList}>
      {MENU_ITEMS.map((item) => {
        const ItemIcon = activeItem === item.key ? item.ActiveIcon : item.Icon;
        return (
          <Pressable key={item.key} style={styles.menuRow} onPress={() => onSelect(item.key)}>
            <ItemIcon width={18} height={18} style={styles.menuIcon} />
            <Text
              style={[
                styles.menuText,
                activeItem === item.key && styles.menuTextActive,
              ]}
            >
              {item.label}
            </Text>
          </Pressable>
        );
      })}
    </View>

    <View style={styles.menuFooter}>
      <Button
        title="Logout"
        variant="ghost"
        size="small"
        onPress={onLogout}
        style={styles.logoutButtonRow}
        textStyle={styles.logoutText}
      >
        {activeItem === 'Logout' ? (
          <ActiveLogout width={18} height={18} style={styles.logoutIcon} />
        ) : (
          <LogoutIcon width={18} height={18} style={styles.logoutIcon} />
        )}
      </Button>
      <Text style={styles.menuVersion}>Version 1.0.26</Text>
    </View>
  </>
);

export default TroubleshootScreen;

