import React, { useMemo, useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import RippleLogo from '../components/global/RippleLogo';
import Button from '../components/global/Button';
import ModemStatusCard from '../components/ModemStatusCard';
import { colors, spacing, borderRadius, typography } from '../styles/theme';
import { COLORS } from '../constants/colors';
import { modemErrors } from '../data/dummyData';
import Menu from '../../assets/icons/bars.svg';
import NotificationLight from '../../assets/icons/notification.svg';
import NotificationIcon from '../../assets/icons/notificationDark.svg';
import SignalWeaknessIcon from '../../assets/icons/Signal-Weak.svg';
import SignalAverageIcon from '../../assets/icons/Signal-Moderate.svg';
import SignalStrongIcon from '../../assets/icons/Signal-Strong.svg';
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

const ModemDetailsScreen = ({ route, navigation }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeMenuItem, setActiveMenuItem] = useState('Transactions');
  const [apiData, setApiData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const modemSlNo = route?.params?.modemSlNo || route?.params?.modem?.modemId;
  const fallbackModem = route?.params?.modem ?? {
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
    if (modemSlNo && modemSlNo !== 'N/A') {
      fetchModemDetails();
    } else {
      console.warn('No modemSlNo provided, using fallback data');
      setLoading(false);
    }
  }, [modemSlNo]);

  const fetchModemDetails = async () => {
    try {
      setLoading(true);
      const url = `${API_BASE_URL}/${encodeURIComponent(modemSlNo)}`;
      console.log('Fetching modem details from:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const json = await response.json();
      console.log('API Response:', JSON.stringify(json, null, 2));
      
      // Handle different response structures
      let alertData = null;
      
      if (json.success !== undefined) {
        // Response has success field
        if (json.success) {
          // Try different possible structures
          alertData = json.alert || json.data || json.result || (json.alerts && json.alerts[0]) || null;
        }
      } else if (json.modemSlNo || json.sno) {
        // Direct alert object without success wrapper
        alertData = json;
      } else if (Array.isArray(json) && json.length > 0) {
        // Array response, take first item
        alertData = json[0];
      }
      
      if (alertData && (alertData.modemSlNo || alertData.sno)) {
        setApiData(alertData);
        console.log('Successfully set API data:', alertData.modemSlNo);
      } else {
        console.warn('API response missing valid alert data, using fallback');
        setApiData(null);
      }
    } catch (error) {
      console.error('Error fetching modem details:', error.message);
      setApiData(null);
      // Continue with fallback data
    } finally {
      setLoading(false);
    }
  };

  // Use API data if available, otherwise use fallback
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

  const relatedIssues = useMemo(
    () => modemErrors.filter((item) => item.modemId === modem.modemId),
    [modem.modemId]
  );

  const handleResolve = () => {
    navigation?.navigate?.('Troubleshoot', { modem, status: statusMeta.label });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar style="dark" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading modem details...</Text>
        </View>
      </SafeAreaView>
    );
  }

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
            <View style={styles.barsIcon}>
              <Menu width={18} height={18} fill="#202d59" />
            </View>

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

const DetailGrid = ({ fields, getSignalIcon }) => (
  <View style={styles.detailGrid}>
    {fields.map((field, index) => (
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
);

const IssueCard = ({ issue }) => {
  const statusMeta = statusMetaMap[issue.status] ?? statusMetaMap.default;

  return (
    <View style={styles.modemCard}>
      {/* Header row */}
      <View style={styles.itemHeader}>
        <View style={styles.itemIdContainer}>
          <Text style={styles.itemId}>{issue.modemId}</Text>
          <Text style={styles.itemImei}>IMEI - {issue.location}</Text>

        </View>

        <TouchableOpacity style={styles.directionButton}>
          <Text style={styles.directionText}>Get Direction</Text>
        </TouchableOpacity>
      </View>

      {/* Body row: left photo block + right details */}
      <View style={styles.itemDetails}>
        {/* Photo Section - 25% */}
        <View style={styles.photoSection}>
          <View style={styles.photoSectionContent}>
            <Ionicons name="image-outline" size={22} color="#B0B0B0" />
            <Text style={styles.detailLabel}>Photos</Text>
          </View>
        </View>

        {/* Right details - 75% */}
        <View style={styles.subDataSection}>
          {/* Row 1: Error + Meter Type */}
          <View style={styles.subDataRow}>
            <View style={styles.subDataItem}>
              <Text style={styles.detailLabel}>Error</Text>
              <Text style={styles.detailValueGreen}>{issue.error}</Text>
            </View>

            <View style={styles.subDataItem}>
              <Text style={styles.detailLabel}>Meter Type</Text>
              <Text style={styles.detailValueGreen}>Smart</Text>
            </View>
          </View>

          {/* Row 2: HES Status + Issue Occurrence */}
          <View style={styles.subDataRow}>
            <View style={styles.subDataItem}>
              <Text style={styles.detailLabel}>HES Status</Text>
              <View style={styles.statusPillPending}>
                <Text style={styles.statusPillText}>Pending</Text>
              </View>
            </View>

            <View style={styles.subDataItem}>
              <Text style={styles.detailLabel}>Issue Occurrence</Text>
              <Text style={styles.datedetails}>{formatDisplayDateTime(issue.date)}</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 5,
    paddingHorizontal: 27,
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
    paddingBottom: spacing.lg,
    paddingTop: spacing.sm,
    backgroundColor: "#EEF8F0",
  },
  resolveButton: {
    borderRadius:5,
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

export default ModemDetailsScreen;
