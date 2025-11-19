import React, { useMemo, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Pressable,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Logo from '../components/global/Logo';
import RippleLogo from '../components/global/RippleLogo';
import NotificationCard from '../components/global/NotificationCard';
import { modemStats, modemErrors, notifications as notificationSeed } from '../data/dummyData';
import { colors, spacing, borderRadius, typography } from '../styles/theme';
import { COLORS } from '../constants/colors';
import Button from '../components/global/Button';
import MenuIcon from '../../assets/icons/bars.svg';
import Menu from '../../assets/icons/bars.svg';
import SearchIcon from '../../assets/icons/searchIcon.svg';
import ScanIcon from '../../assets/icons/scan.svg';
import FilterIcon from '../../assets/icons/filter.svg';
import NotificationIcon from '../../assets/icons/notificationDark.svg';
import NotificationLight from '../../assets/icons/notification.svg';
import HandBill from '../../assets/icons/handBill.svg';
import Calendar from '../../assets/icons/calendar.svg';
import CheapDollar from '../../assets/icons/cheapDollar.svg';
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
import Hand from '../../assets/icons/hand.svg';
import Plus from '../../assets/icons/plus.svg';
import MeterInstallIcon from '../../assets/icons/meterWhite.svg';
import MeterStatusIcon from '../../assets/icons/meterBolt.svg';
import CalendarIcon from '../../assets/icons/CalendarNew.svg';

// Ensure all text on this screen uses Manrope by default without altering sizes.
if (!Text.defaultProps) {
  Text.defaultProps = {};
}
Text.defaultProps.style = [
  Text.defaultProps.style,
  { fontFamily: 'Manrope-Regular' },
];

const { width } = Dimensions.get('window');

const API_URL = 'https://api.bestinfra.app/v2tgnpdcl/api/modem-alerts';

const DashboardScreen = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeMenuItem, setActiveMenuItem] = useState('Dashboard');
  const [notificationList] = useState(notificationSeed);
  const [userName] = useState('Field Engineer');
  const [apiData, setApiData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApiData();
  }, []);

  const fetchApiData = async () => {
    try {
      setLoading(true);
      const response = await fetch(API_URL);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const json = await response.json();
      if (json.success && json.alerts && Array.isArray(json.alerts)) {
        setApiData(json);
      } else {
        console.warn('API response missing expected data structure');
        setApiData(null);
      }
    } catch (error) {
      console.error('Error fetching API data:', error);
      // Fallback to dummy data on error
      setApiData(null);
    } finally {
      setLoading(false);
    }
  };

  // Map API code to status
  const getStatusFromCode = (code) => {
    const codeMap = {
      202: 'warning', // Modem / DCU Auto Restart
      213: 'success', // Meter COM Restored
      214: 'disconnected', // DCU / Modem Power Failed
      215: 'success', // DCU / Modem Power Restored
      212: 'disconnected', // Meter COM Failed
    };
    return codeMap[code] || 'default';
  };

  // Transform API alerts to modem format
  const transformedAlerts = useMemo(() => {
    if (!apiData?.alerts || !Array.isArray(apiData.alerts) || apiData.alerts.length === 0) {
      return modemErrors;
    }
    
    return apiData.alerts.map((alert, index) => ({
      id: alert.sno?.toString() || alert.modemSlNo || `alert-${index}`,
      modemId: alert.modemSlNo || 'N/A',
      location: alert.imei || 'N/A',
      error: alert.codeDesc || 'N/A',
      reason: alert.codeDesc || 'N/A',
      date: alert.modemDate ? `${alert.modemDate} ${alert.modemTime || ''}` : 'N/A',
      status: getStatusFromCode(alert.code),
      signalStrength: alert.signalStrength1 || 0,
      discom: alert.discom || 'N/A',
      meterSlNo: alert.meterSlNo || 'N/A',
      code: alert.code,
      // Keep original alert data for details screen
      originalAlert: alert,
    }));
  }, [apiData]);

  // Calculate metrics from API data
  const dashboardMetrics = useMemo(() => {
    if (!apiData) {
      return {
        communicatingModems: 0,
        nonCommunicatingModems: 0,
        totalTasksToday: 0,
        completedTasksToday: 0,
      };
    }

    // Calculate communicating vs non-communicating modems from alertsByCode
    let communicatingCount = 0;
    let nonCommunicatingCount = 0;

    if (apiData.alertsByCode && Array.isArray(apiData.alertsByCode)) {
      apiData.alertsByCode.forEach((item) => {
        // Codes 202 (Auto Restart), 213 (COM Restored), 215 (Power Restored) = communicating
        if ([202, 213, 215].includes(item.code)) {
          communicatingCount += item.uniqueModems || 0;
        }
        // Codes 214 (Power Failed), 212 (COM Failed) = non-communicating
        if ([214, 212].includes(item.code)) {
          nonCommunicatingCount += item.uniqueModems || 0;
        }
      });
    }

    // Calculate today's tasks from timelineData
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let totalTasksToday = 0;
    let completedTasksToday = 0;

    // Find today's data from timelineData
    if (apiData.timelineData && Array.isArray(apiData.timelineData)) {
      const todayData = apiData.timelineData.find((item) => {
        const itemDate = new Date(item.date);
        itemDate.setHours(0, 0, 0, 0);
        return itemDate.getTime() === today.getTime();
      });
      
      if (todayData) {
        totalTasksToday = todayData.count || 0;
      }
    }

    // Calculate completed tasks (success codes 213, 215) from today's alerts
    if (apiData.alerts && Array.isArray(apiData.alerts)) {
      const todayAlerts = apiData.alerts.filter((alert) => {
        if (!alert.logTimestamp) return false;
        const alertDate = new Date(alert.logTimestamp);
        alertDate.setHours(0, 0, 0, 0);
        return alertDate.getTime() === today.getTime();
      });

      completedTasksToday = todayAlerts.filter(
        (alert) => [213, 215].includes(alert.code)
      ).length;
    }

    return {
      communicatingModems: communicatingCount || 0,
      nonCommunicatingModems: nonCommunicatingCount || 0,
      totalTasksToday: totalTasksToday || 0,
      completedTasksToday: completedTasksToday || 0,
    };
  }, [apiData]);

  const wipData = useMemo(
    () => ({
      metersInstalled: apiData?.stats?.uniqueModems || modemStats.connected,
      metersCommissioned: apiData?.stats?.totalAlerts || modemStats.disconnected,
      totalAlerts: apiData?.stats?.totalAlerts || '0',
      uniqueMeters: apiData?.stats?.uniqueMeters || '0',
      uniqueDiscoms: apiData?.stats?.uniqueDiscoms || '0',
      avgSignalStrength: apiData?.stats?.avgSignalStrength1 || '0',
      // Add dashboard metrics
      ...dashboardMetrics,
    }),
    [apiData, dashboardMetrics]
  );

  const notificationIconMapper = useMemo(
    () => ({
      payment: HandBill,
      success: HandBill,
      warning: Calendar,
      alert: Calendar,
      due: Calendar,
      balance: CheapDollar,
      info: CheapDollar,
    }),
    []
  );

  const notificationVariantMapper = useMemo(
    () => ({
      warning: 'warning',
      alert: 'warning',
      success: 'success',
      payment: 'success',
      info: 'info',
      balance: 'info',
    }),
    []
  );

  const recentNotifications = useMemo(
    () => notificationList.slice(0, 2),
    [notificationList]
  );

  const filteredModems = useMemo(() => {
    const dataToFilter = transformedAlerts;
    if (!searchQuery.trim()) {
      return dataToFilter;
    }
    const query = searchQuery.toLowerCase();
    return dataToFilter.filter((item) => {
      const searchableText = [
        item.modemId || '',
        item.location || '',
        item.error || '',
        item.reason || '',
        item.discom || '',
        item.meterSlNo || '',
      ]
        .filter(Boolean) // Remove empty strings
        .join(' ')
        .toLowerCase();
      return searchableText.includes(query);
    });
  }, [searchQuery, transformedAlerts]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.bluecontainer}>
          <View style={styles.TopMenu}>
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
          <View style={styles.ProfileBox}>
            <View>
              <View style={styles.profileGreetingRow}>
                <Text style={styles.hiText}>Hi, {userName} </Text>
                <Hand width={30} height={30} fill="#55B56C" />
              </View>
              <Text style={styles.stayingText}>Monitoring modems today?</Text>
            </View>
          </View>

          <View style={styles.metricsRow}>
            <TouchableOpacity
              style={styles.metricCard}
              onPress={() => navigation.navigate('FindMeters', { selectedStatus: 'ALL' })}
              activeOpacity={0.7}
            >
              <View style={styles.textContainer}>
                <Text style={styles.metricTitle}>Communicating Modems</Text>
                <Text style={styles.metricValue}>
                  {loading ? '...' : (wipData?.communicatingModems ?? 0)}
                </Text>
              </View>
              <View style={styles.metricIconContainer}>
                <MeterInstallIcon width={24} height={24} />
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.metricCard}
              onPress={() => navigation.navigate('FindMeters', { selectedStatus: 'COMMISSIONED' })}
              activeOpacity={0.7}
            >
              <View style={styles.textContainer}>
                <Text style={styles.metricTitle}>Non- Communicating Modems</Text>
                <Text style={styles.metricValue}>
                  {loading ? '...' : (wipData?.nonCommunicatingModems ?? 0)}
                </Text>
              </View>
              <View style={styles.metricIconContainer}>
                <MeterInstallIcon width={24} height={24} />
              </View>
            </TouchableOpacity>
          </View>
          <View style={styles.metricsRow}>
            <TouchableOpacity
              style={styles.metricCard}
              onPress={() => navigation.navigate('FindMeters', { selectedStatus: 'ALL' })}
              activeOpacity={0.7}
            >
              <View style={styles.textContainer}>
                <Text style={styles.metricTitle}>Total Tasks Today</Text>
                <Text style={styles.metricValue}>
                  {loading ? '...' : (wipData?.totalTasksToday ?? 0)}
                </Text>
              </View>
              <View style={styles.metricIconContainer}>
                <CalendarIcon width={24} height={24} />
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.metricCard}
              onPress={() => navigation.navigate('FindMeters', { selectedStatus: 'COMMISSIONED' })}
              activeOpacity={0.7}
            >
              <View style={styles.textContainer}>
                <Text style={styles.metricTitle}>Completed Tasks Today</Text>
                <Text style={styles.metricValue}>
                  {loading ? '...' : (wipData?.completedTasksToday ?? 0)}
                </Text>
              </View>
              <View style={[styles.metricIconContainer, styles.metricIconContainerSuccess]}>
                <CalendarIcon width={24} height={24} />
              </View>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.searchCardWrapper}>
          <View style={styles.searchCard}>
            <TextInput
              placeholder="Quick Search"
              placeholderTextColor={colors.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
              style={styles.searchInput}
            />
            <SearchIcon width={16} height={16} />
          </View>
          <TouchableOpacity 
            style={styles.scanButton}
            onPress={() => navigation?.navigate?.('Demo')}
          >
            <Text style={styles.scanText}>Scan</Text>
            <FilterIcon width={16} height={16} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.filterButton}>
            <ScanIcon width={23} height={23} />
          </TouchableOpacity>
        </View>

        <View style={styles.cardsWrapper}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={styles.loadingText}>Loading alerts...</Text>
            </View>
          ) : filteredModems.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No alerts found</Text>
            </View>
          ) : (
            filteredModems.map((modem) => (
              <ModemCard key={modem.id} modem={modem} navigation={navigation} />
            ))
          )}
        </View>
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

const statusConfig = {
  warning: {
    label: 'Warning',
    color: '#FFB74D25',
    icon: 'warning-outline',
    text: '#AD5A00',
  },
  disconnected: {
    label: 'Disconnected',
    color: '#FFCDD225',
    icon: 'alert-circle-outline',
    text: '#C62828',
  },
  default: {
    label: 'Info',
    color: '#E3F2FD55',
    icon: 'information-circle-outline',
    text: colors.primary,
  },
};

const ModemCard = ({ modem, navigation }) => {
  const meta = statusConfig[modem.status] ?? statusConfig.default;

  const formatDate = (dateString) => {
    if (!dateString || dateString === 'N/A') return 'N/A';
    try {
      // Handle API date format: "17 Nov 2025 06:30:00 PM" or "17 Nov 2025 06:30:00 PM 11:45:24"
      const dateStr = dateString.split(' ').slice(0, 4).join(' '); // Take first 4 parts (date + time)
      const date = new Date(dateStr);
      if (Number.isNaN(date.getTime())) {
        // If parsing fails, try to return formatted string
        return dateString.length > 20 ? dateString.substring(0, 20) : dateString;
      }
      const day = date.toLocaleDateString(undefined, {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
      const time = date.toLocaleTimeString(undefined, {
        hour: '2-digit',
        minute: '2-digit',
      });
      return `${day}  ·  ${time}`;
    } catch {
      return dateString.length > 20 ? dateString.substring(0, 20) : dateString;
    }
  };

  const handleCardPress = () => {
    // Pass modemSlNo for API fetch, and keep modem data for fallback
    const modemSlNo = modem.modemId || modem.originalAlert?.modemSlNo || modem.modemId;
    
    if (!modemSlNo || modemSlNo === 'N/A') {
      console.warn('No valid modemSlNo found for navigation');
      // Still navigate but with available data
      navigation?.navigate?.('ModemDetails', { 
        modem,
        modemSlNo: modem.modemId 
      });
      return;
    }

    navigation?.navigate?.('ModemDetails', { 
      modem,
      modemSlNo: modemSlNo
    });
  };

  const handleGetDirection = () => {
    // TODO: integrate maps navigation here
  };

  return (
    <Pressable onPress={handleCardPress} style={styles.modemCard}>
      {/* Header row */}
      <View style={styles.itemHeader}>
        <View style={styles.itemIdContainer}>
          <Text style={styles.itemId}>{modem.modemId}</Text>
          {/* Update this line once IMEI is available in data */}
          <Text style={styles.itemImei}>IMEI - {modem.location}</Text>
        </View>

        <TouchableOpacity style={styles.directionButton} onPress={handleGetDirection}>
          <Text style={styles.directionButtonText}>Get Direction</Text>
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
              <Text style={styles.detailValueGreen} numberOfLines={1}>
                {modem.error || 'N/A'}
              </Text>
            </View>

            <View style={styles.subDataItem}>
              <Text style={styles.detailLabel}>Discom</Text>
              <Text style={styles.detailValueGreen} numberOfLines={1}>
                {modem.discom || 'N/A'}
              </Text>
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
              <Text style={[styles.datedetails]}>
                {formatDate(modem.date)}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </Pressable>
  );
};

export default DashboardScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollContent: {
    paddingBottom: spacing.xl,
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
  notificationChip: {
    borderWidth: 1,
    borderColor: '#d7e2d9',
  },
  logoWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  metricCard: {
    backgroundColor: '#fff',
    borderRadius: 5,
    padding: 15,
    width: (width - 40) / 2,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    // shadowColor: '#6E6E6E',
    // shadowOffset: { width: 0, height: 2 },
    // shadowOpacity: 0.1,
    // shadowRadius: 4,
    // elevation: 3,
  },
  metricIconContainer: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    width: 110,
    alignItems: 'flex-start',
  },
  metricValue: {
    fontSize: 18,
    color: '#55B56C',
    fontFamily: 'Manrope-Bold',
    marginTop: 4,
  },
  metricTitle: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'Manrope-Regular',
  },
  metricSubtext: {
    fontSize: 10,
    color: '#999',
    fontFamily: 'Manrope-Regular',
    marginTop: 2,
  },
  metricIconContainerWarning: {
    backgroundColor: '#FF9800',
  },
  metricIconContainerSuccess: {
    backgroundColor: '#4CAF50',
  },
  searchCardWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    elevation: 0.5,
    paddingBottom: 10,
    // justifyContent: 'space-between',
  },
  searchCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: "#F8F8F8",
    marginHorizontal: 20,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 5,
    // elevation: 2,
    marginTop: 10,
    width: '55%',
  },
  searchInput: {
    flex: 1,
    paddingHorizontal: spacing.sm,
    color: colors.textPrimary,
    fontFamily: 'Manrope-Regular',
    fontSize: 14,
  },
  scanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: colors.secondary,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: 5,
    marginRight: spacing.sm,
    height: 55,
    width: '22%',
    marginTop: 9,
  },
  scanText: {
    color: '#fff',
    fontFamily: 'Manrope-Regular',
    fontSize: 16,
  },
  filterButton: {
    width: 60,
    height: 60,
    // borderRadius: 18,
    // borderWidth: 1,
    // borderColor: '#d7e2d9',
    // alignItems: 'center',
    justifyContent: 'center',
    marginTop: 9,
    marginLeft: 6,
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
  cardsWrapper: {
    marginTop: spacing.md,
    paddingHorizontal: spacing.md,
    gap: spacing.md,
  },
  notificationSection: {
    marginTop: spacing.lg,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.lg,
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  viewAllText: {
    ...typography.small,
    color: colors.primary,
    fontWeight: '600',
  },
  dashboardNotificationCard: {
    backgroundColor: '#fff',
  },
  modemCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 15,
    borderWidth: 1,
    borderColor: '#F8F8F8',
    marginBottom: spacing.md,
  },
  modemCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  modemId: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.round,
    marginTop: spacing.xs,
    gap: 4,
  },
  statusText: {
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
  directionButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 13,
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
    height:115
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
    fontSize: 13,
    color: '#666',
    marginBottom: 3,
    fontFamily: 'Manrope-Regular',
  },
  detailValue: {
    fontSize:12,
    color: '#333',
    fontFamily: 'Manrope-SemiBold',
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
    fontSize:9
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
  bluecontainer: {
    backgroundColor: '#eef8f0',
    padding: 15,
  },
  TopMenu: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 5,
    paddingHorizontal: 15,
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
  ProfileBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 2,
    marginBottom: 10,
  },
  profileGreetingRow: {
    flexDirection: 'row',
    alignItems: 'center',

  },
  hiText: {
    color: COLORS.primaryFontColor,
    fontSize: 18,
    fontFamily: 'Manrope-Bold',
  },
  stayingText: {
    color: COLORS.primaryFontColor,
    fontSize: 14,
    fontFamily: 'Manrope-Regular',
  },
  balanceText: {
    color: COLORS.primaryFontColor,
    marginLeft: 20,
    fontSize: 14,
    fontFamily: 'Manrope-Regular',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 5,
    justifyContent: 'center',
  },
  amountText: {
    color: COLORS.primaryColor,
    fontSize: 20,
    fontFamily: 'Manrope-Bold',
  },
  plusBox: {
    marginLeft: 7,
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
    padding: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
  emptyContainer: {
    padding: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    ...typography.body,
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
