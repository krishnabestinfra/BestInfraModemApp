import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import RippleLogo from '../components/global/RippleLogo';
import AppHeader from '../components/global/AppHeader';
import Button from '../components/global/Button';
import ModemStatusCard from '../components/ModemStatusCard';
import { colors, spacing, borderRadius, typography } from '../styles/theme';
import { COLORS } from '../constants/colors';
import { modemErrors } from '../data/dummyData';
import NotificationLight from '../../assets/icons/notification.svg';
import NotificationIcon from '../../assets/icons/notificationDark.svg';
import SignalWeaknessIcon from '../../assets/icons/Signal-Weak.svg';
import SignalAverageIcon from '../../assets/icons/Signal-Moderate.svg';
import SignalStrongIcon from '../../assets/icons/Signal-Strong.svg';



const fallbackDetails = {
  drtSlNo: '2345',
  feederNo: '123456783',
  feederName: 'Tadepalligudem - Rural',
  substationNo: '1234533423',
  substationName: 'Tadepalligudem - Rural',
  section: 'Tadepalligudem',
  subDivision: 'Tadepalligudem',
  division: 'Tadepalligudem',
  circle: 'Tadepalligudem - Rural',
  organisation: 'NPDCL',
};

const statusMetaMap = {
  warning: { label: 'Warning', color: '#F57C00', bg: '#FFF3E0' },
  disconnected: { label: 'Non-Communicating', color: '#FF1E00', bg: '#FFF' },
  default: { label: 'Active', color: colors.secondary, bg: '#E6F7EE' },
};

const API_BASE_URL = 'https://api.bestinfra.app/v2tgnpdcl/api/modem-alerts';
const USE_MOCK_ALERTS = false; // flip to false to hit live endpoint

const formatDisplayDateTime = (dateString) => {
  if (!dateString || dateString === 'N/A') return 'N/A';

  const normalizeInput = (value) => value.replace(/\s+/g, ' ').trim();
  const formatParts = (date) => {
    const month = date.toLocaleString('en-US', { month: 'short' });
    const day = date.getDate().toString().padStart(2, '0');
    const year = date.getFullYear();
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const period = hours >= 12 ? 'PM' : 'AM';
    const formattedHour = ((hours % 12) || 12).toString().padStart(2, '0');
    const formattedMinute = minutes.toString().padStart(2, '0');
    return `${month} ${day}, ${year} ${formattedHour}:${formattedMinute} ${period}`;
  };

  try {
    const normalized = normalizeInput(dateString);
    const parts = normalized.split(' ');
    const candidate = parts.length >= 5 ? parts.slice(0, 5).join(' ') : normalized;
    const parsed = new Date(candidate);
    if (!Number.isNaN(parsed.getTime())) {
      return formatParts(parsed);
    }
  } catch {
    // fall through to regex fallback
  }

  const regex =
    /(\d{1,2})\s([A-Za-z]{3})\s(\d{4})\s(\d{1,2}):(\d{2})(?::\d{2})?\s?(AM|PM)?/i;
  const match = dateString.match(regex);
  if (match) {
    const [, day, monthStr, year, hourStr, minuteStr, suffix] = match;
    const month =
      monthStr.charAt(0).toUpperCase() + monthStr.slice(1).toLowerCase();
    const hourNum = Number(hourStr);
    const period = suffix?.toUpperCase() ?? 'AM';
    const formattedHour = ((hourNum % 12) || 12).toString().padStart(2, '0');
    const formattedMinute = minuteStr.padStart(2, '0');
    return `${month} ${day.padStart(2, '0')}, ${year} ${formattedHour}:${formattedMinute} ${period}`;
  }

  return dateString.length > 20 ? dateString.substring(0, 20) : dateString;
};

const ModemDetailsScreen = ({ route, navigation, modems = [] }) => {
  const insets = useSafeAreaInsets();
  const [apiData, setApiData] = useState(null);
  const [loading, setLoading] = useState(true);

  const assignedModems = Array.isArray(modems) ? modems : [];
  const routeModem = route?.params?.modem;
  const routeModemId =
  route?.params?.modemSlNo ||
  routeModem?.modemSlNo ||
  routeModem?.modemno; // API 3 value


  const matchedAssignedModem = useMemo(() => {
    if (!routeModemId || assignedModems.length === 0) {
      return null;
    }
    return assignedModems.find((item) => {
      const candidateId =
        item?.modemId || item?.modemSlNo || item?.modem_sl_no || item?.id;
      return candidateId === routeModemId;
    });
  }, [assignedModems, routeModemId]);

  const resolvedModem = routeModem || matchedAssignedModem;
  const modemSlNo =
  route?.params?.modemSlNo ||
  resolvedModem?.modemSlNo ||
  resolvedModem?.modemno;

  const fallbackModem = resolvedModem ?? {
    modemId: 'MDM000',
    status: 'warning',
    error: 'Unknown',
    reason: '—',
    location: '—',
    date: new Date().toISOString(),
    signalStrength: '—',
  };

  const getStatusFromCode = (code) => {
    const codeMap = {
      202: 'disconnected', // Modem / DCU Auto Restart
      213: 'disconnected', // Meter COM Restored
      214: 'disconnected', // DCU / Modem Power Failed
      215: 'disconnected', // DCU / Modem Power Restored
      212: 'disconnected', // Meter COM Failed
    };
    return codeMap[code] || 'default';
  };

  useEffect(() => {
    // Modem data is already passed via route params when navigating from Dashboard/AllModems
    // No API call needed - use the data from route
    if (resolvedModem) {
      // Use originalAlert if available (from normalized modem record), otherwise use resolvedModem
      const modemData = resolvedModem.originalAlert || resolvedModem;
      setApiData(modemData);
    }
    setLoading(false);
  }, [resolvedModem]);

 


  const modem = useMemo(() => {
    if (apiData && (apiData.modemSlNo || apiData.sno)) {
      return {
        modemId: apiData.modemSlNo || fallbackModem.modemId,
        status: getStatusFromCode(apiData.code),
        error: apiData.codeDesc || fallbackModem.error,
        errorCode: apiData.code || 'N/A',
        reason: apiData.codeDesc || fallbackModem.reason,
        location: apiData.discom || 'N/A', // Using discom as location
        date: apiData.modemDate ? `${apiData.modemDate} ${apiData.modemTime || ''}` : fallbackModem.date,
        signalStrength: apiData.signalStrength1 || apiData.signalStrength2 || 0,
        discom: apiData.discom || 'N/A',
        meterSlNo: apiData.meterSlNo || 'N/A',
        fwVer: apiData.fwVer || 'N/A',
        meterMake: apiData.meterMake || 'N/A',
        apn: apiData.apn || 'N/A',
        simService: apiData.simService || 'N/A',
        simNumber: apiData.simNumber || 'N/A',
        sysmode: apiData.sysmode || 'N/A',
        freqMode: apiData.freqMode || 'N/A',
        uid: apiData.uid || 'N/A',
        imei: apiData.imei || 'N/A',
        logTimestamp: apiData.logTimestamp || apiData.modemDate ? `${apiData.modemDate} ${apiData.modemTime || ''}` : 'N/A',
        prevFwver: apiData.prevFwver || 'N/A',
        updatedFwver: apiData.updatedFwver || 'N/A',
        originalData: apiData,
      };
    }
    return fallbackModem;
  }, [apiData, fallbackModem]);

  const statusMeta =
    statusMetaMap[modem.status] ??
    (modem.status?.toLowerCase?.() === 'non-communicating'
      ? statusMetaMap.disconnected
      : statusMetaMap.default);

  // Format last update date
  const formatLastUpdate = (dateString) => formatDisplayDateTime(dateString);

  // Get signal strength icon based on value - moved outside to be accessible

  // Map network type to display format
  const getNetworkType = (sysmode) => {
    if (!sysmode || sysmode === 'N/A') return 'N/A';
    if (sysmode.includes('LTE')) return '4G';
    if (sysmode.includes('GSM')) return '2G';
    if (sysmode.includes('UMTS') || sysmode.includes('WCDMA')) return '3G';
    return sysmode;
  };

  const detailFields = useMemo(() => {
    // Always show the required fields in the specified order
    const fields = [];
    
    if (apiData && modem) {
      fields.push(
        { label: 'Error Code', value: modem.errorCode || 'N/A', type: 'text' },
        { label: 'Error Type', value: modem.error || 'N/A', type: 'text' },
        { label: 'IMEI Number', value: modem.imei || 'N/A', type: 'text' },
        { label: 'Firmware Version', value: modem.fwVer || 'N/A', type: 'text' },
        { label: 'SIM Number', value: modem.simNumber || 'N/A', type: 'text' },
        { label: 'Location', value: modem.location || modem.discom || 'N/A', type: 'text' },
        { label: 'Network Type', value: getNetworkType(modem.sysmode), type: 'text' },
        { label: 'Operator', value: modem.simService || 'N/A', type: 'text' },
        { label: 'Signal Strength', value: modem.signalStrength || 0, type: 'signal' },
        { label: 'Last Update', value: formatLastUpdate(modem.logTimestamp), type: 'text' },
      );
    } else {
      // Fallback fields
      fields.push(
        { label: 'Error Code', value: 'N/A', type: 'text' },
        { label: 'Error Type', value: 'N/A', type: 'text' },
        { label: 'IMEI Number', value: 'N/A', type: 'text' },
        { label: 'Firmware Version', value: 'N/A', type: 'text' },
        { label: 'SIM Number', value: 'N/A', type: 'text' },
        { label: 'Location', value: 'N/A', type: 'text' },
        { label: 'Network Type', value: 'N/A', type: 'text' },
        { label: 'Operator', value: 'N/A', type: 'text' },
        { label: 'Signal Strength', value: 0, type: 'signal' },
        { label: 'Last Update', value: 'N/A', type: 'text' },
      );
    }
    
    return fields;
  }, [modem, apiData]);


  const handleResolve = useCallback(() => {
    navigation?.navigate?.('Troubleshoot', { modem, status: statusMeta.label });
  }, [navigation, modem, statusMeta.label]);

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea} edges={[]}>
        <StatusBar style="dark" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading modem details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar style="dark" />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: spacing.xxl + insets.bottom }]}
        showsVerticalScrollIndicator={false}
      >
        <LinearGradient
          colors={['#f4fbf7', '#e6f4ed']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroCard}
        >
          <AppHeader
            containerStyle={styles.heroTopRow}
            leftButtonStyle={styles.barsIcon}
            rightButtonStyle={styles.bellIcon}
            rightIcon={NotificationLight}
            logo={<RippleLogo size={68} />}
            onPressLeft={() => navigation?.navigate?.('SideMenu')}
            onPressCenter={() => navigation?.navigate?.('Dashboard')}
            onPressRight={() => navigation?.navigate?.('Profile')}
          />
          <View style={styles.cardBackground}>
            <ModemStatusCard
              modemId={modem.modemId}
              statusLabel={statusMeta.label}
              statusColor={statusMeta.color}
              statusBackground={statusMeta.bg}
              style={styles.heroStatusCard}
            />
          </View>
          
        </LinearGradient>

        <View style={styles.detailCard}>
          <DetailGrid fields={detailFields} getSignalIcon={getSignalIcon} />
        </View>

      </ScrollView>

      <View style={styles.footer}>
        <Button title="Start Troubleshooting" onPress={handleResolve} style={styles.resolveButton} />
      </View>

    </SafeAreaView>
  );
};

// Get signal strength icon based on value
const getSignalIcon = (signalStrength) => {
  const strength = signalStrength || 0;
  if (strength < 15) {
    return <SignalWeaknessIcon width={16} height={16} />;
  } else if (strength >= 15 && strength <= 20) {
    return <SignalAverageIcon width={16} height={16} />;
  } else {
    return <SignalStrongIcon width={16} height={16} />;
  }
};


const DetailGrid = React.memo(({ fields, getSignalIcon }) => (
  <View style={styles.detailGrid}>
    {fields.map((field) => (
      <View key={field.label} style={styles.detailItem}>
        <Text style={styles.detailLabel}>{field.label}</Text>
        {field.type === 'signal' ? (
          <View style={styles.signalStrengthContainer}>
            {getSignalIcon(field.value)}
            <Text style={styles.signalStrengthText}>
              {field.value || 0} dBm
            </Text>
          </View>
        ) : (
          <Text style={styles.detailValue}>{field.value ?? '—'}</Text>
        )}
      </View>
    ))}
  </View>
));


const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#EEF8F0',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.xxl,
  },
  heroCard: {
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
    paddingTop: 10,
    paddingBottom: 5,
    paddingHorizontal: 27,
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
    backgroundColor: '#ffffff',
    width: 54,
    height: 54,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 1,
    zIndex: 2,
  },
  bellIcon: {
    backgroundColor: '#ffffff',
    width: 54,
    height: 54,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 1,
    zIndex: 2,
  },
  cardBackground:{
    paddingHorizontal:15
  },
  heroContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: spacing.xs,
  },
  detailCard: {
    backgroundColor: colors.cardBackground,
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    borderRadius: 5,
    padding: spacing.md,
  },
  detailGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  detailItem: {
    width: '48%',
    marginBottom: spacing.md,
  },
  detailLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  detailValue: {
    ...typography.body,
    color: colors.textPrimary,
    fontFamily: 'Manrope-SemiBold',
    fontSize: 12,
  },
  signalStrengthContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  signalStrengthText: {
    fontSize: 12,
    color: "#262626",
    fontFamily: 'Manrope-SemiBold',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: spacing.md,
    marginTop: spacing.lg,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  sectionCount: {
    ...typography.small,
    color: colors.textSecondary,
  },
  issuesWrapper: {
    marginTop: spacing.md,
    paddingHorizontal: spacing.md,
    gap: spacing.md,
  },
  emptyIssuesText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginVertical: spacing.lg,
  },
  modemCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 15,
    borderWidth: 1,
    borderColor: '#F8F8F8',
    marginBottom: spacing.md,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  itemIdContainer: {
    flex: 1,
  },
  itemId: {
    fontSize: 16,
    color: '#333',
    fontFamily: 'Manrope-Bold',
  },
  itemImei: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
    fontFamily: 'Manrope-Regular',
  },
  issueBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.round,
    marginTop: spacing.xs,
    gap: 4,
  },
  issueBadgeText: {
    ...typography.small,
    fontWeight: '600',
  },
  directionButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 5,
    paddingHorizontal: 16,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  directionText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 13,
  },
  itemDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  photoSection: {
    width: '25%',
    backgroundColor: '#F8F8F8',
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
  },
  photoSectionContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  subDataSection: {
    width: '75%',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  subDataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  subDataItem: {
    flex: 1,
    marginHorizontal: 5,
  },
  detailLabel: {
    fontSize: 14,
    color: '#6E6E6E',
    marginBottom: 3,
    fontFamily: 'Manrope-Regular',
  },
  detailValueGreen: {
    fontSize: 13,
    color: '#55b56c',
    fontFamily: 'Manrope-Medium',
  },
  datedetails: {
    backgroundColor: '#F8F8F8',
    paddingVertical: 3,
    paddingHorizontal: 4,
    textAlign: 'center',
    borderRadius: 5,
    fontSize: 9,
  },
  statusPillPending: {
    backgroundColor: '#FF8A00',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 5,
    alignSelf: 'flex-start',
  },
  statusPillText: {
    color: '#fff',
    fontSize: 10,
    fontFamily: 'Manrope-ExtraBold',
  },
  footer: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xxl,
    paddingTop: spacing.sm,
    backgroundColor: "#EEF8F0",
  },
  resolveButton: {
    borderRadius:5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  loadingText: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
});

export default ModemDetailsScreen;
