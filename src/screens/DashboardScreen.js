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
  Modal,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import Ionicons from 'react-native-vector-icons/Ionicons';
import RippleLogo from '../components/global/RippleLogo';
import AppHeader from '../components/global/AppHeader';
import { modemStats, modemErrors } from '../data/dummyData';
import { colors, spacing, borderRadius, typography } from '../styles/theme';
import { COLORS } from '../constants/colors';
import SearchIcon from '../../assets/icons/searchIcon.svg';
import ScanIcon from '../../assets/icons/scan.svg';
import FilterIcon from '../../assets/icons/filter.svg';
import NotificationLight from '../../assets/icons/notification.svg';
import Hand from '../../assets/icons/hand.svg';
import MeterInstallIcon from '../../assets/icons/meterWhite.svg';
import CalendarIcon from '../../assets/icons/CalendarNew.svg';
import SignalWeaknessIcon from '../../assets/icons/Signal-Weak.svg';
import SignalAverageIcon from '../../assets/icons/Signal-Moderate.svg';
import SignalStrongIcon from '../../assets/icons/Signal-Strong.svg';
import TotalTasksIcon from '../../assets/icons/totaltasks.svg';
import CompletedTasksIcon from '../../assets/icons/completedtasks.svg';
import CommunicatingModemsIcon from '../../assets/icons/communicating.svg';
import NonCommunicatingModemsIcon from '../../assets/icons/noncommicating.svg';
import Meter from '../../assets/images/meter.png';

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

const STATUS_FILTERS = [
  { label: 'Communicating', value: 'success' },
  { label: 'Warning', value: 'warning' },
  { label: 'Disconnected', value: 'disconnected' },
];

const SIGNAL_FILTERS = [
  { label: 'All', value: 'all' },
  { label: 'Strong (>20 dBm)', value: 'strong' },
  { label: 'Average (15-20 dBm)', value: 'average' },
  { label: 'Weak (<15 dBm)', value: 'weak' },
];

const getSignalBand = (signalStrength = 0) => {
  const strength = Number(signalStrength) || 0;
  if (strength < 15) return 'weak';
  if (strength <= 20) return 'average';
  return 'strong';
};

const DashboardScreen = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [userName] = useState('Field Officer');
  const [apiData, setApiData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState({
    statuses: [],
    signal: 'all',
    errorType: 'all',
    sortBy: 'newest'
  });

  const [draftFilters, setDraftFilters] = useState({
    statuses: [],
    signal: 'all',
    errorType: 'all',
    sortBy: 'newest'
  });
  const hasActiveFilters =
    appliedFilters.statuses.length > 0 || appliedFilters.signal !== 'all';

  const openFilterModal = () => {
    setDraftFilters({
      statuses: [...appliedFilters.statuses],
      signal: appliedFilters.signal,
      errorType: appliedFilters.errorType,
      sortBy: appliedFilters.sortBy,
    });
    setFilterModalVisible(true);
  };

  const closeFilterModal = () => setFilterModalVisible(false);

  const toggleDraftStatus = (value) => {
    setDraftFilters((prev) => {
      const statuses = prev.statuses.includes(value)
        ? prev.statuses.filter((item) => item !== value)
        : [...prev.statuses, value];
      return { ...prev, statuses };
    });
  };

  const setDraftSignal = (value) => {
    setDraftFilters((prev) => ({ ...prev, signal: value }));
  };

  const handleApplyFilters = () => {
    setAppliedFilters(draftFilters);
    setFilterModalVisible(false);
  };

  const handleResetFilters = () => {
    const cleared = { statuses: [], signal: 'all', errorType: 'all', sortBy: 'newest' };
    setAppliedFilters(cleared);
    setDraftFilters(cleared);
  };

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
      photos: [Meter],
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
  // Helper to get status label for search
  const getStatusLabel = (status) => {
    const statusMap = {
      warning: 'warning',
      disconnected: 'disconnected',
      success: 'communicating',
      default: 'info',
    };
    return statusMap[status] || '';
  };

  const filteredModems = useMemo(() => {
    let list = [...transformedAlerts];

    // STATUS FILTER
    if (appliedFilters.statuses.length > 0) {
      list = list.filter(item =>
        appliedFilters.statuses.includes(item.status)
      );
    }

    // SIGNAL FILTER
    if (appliedFilters.signal !== "all") {
      list = list.filter(
        (item) => getSignalBand(item.signalStrength) === appliedFilters.signal
      );
    }

    // ERROR TYPE FILTER
    if (appliedFilters.errorType !== "all") {
      list = list.filter(item => {
        const err = (item.error || "").toLowerCase();
        const t = appliedFilters.errorType;

        if (t === "network") return err.includes("network");
        if (t === "power") return err.includes("power");
        if (t === "restart") return err.includes("restart");
        return true;
      });
    }

    // SORTING
    if (appliedFilters.sortBy === "newest") {
      list.sort((a, b) => new Date(b.date) - new Date(a.date));
    } else {
      list.sort((a, b) => new Date(a.date) - new Date(b.date));
    }

    // SEARCH
    const query = searchQuery.trim().toLowerCase();
    if (query.length > 0) {
      list = list.filter(item =>
        `${item.modemId} ${item.error} ${item.location} ${item.date}`
          .toLowerCase()
          .includes(query)
      );
    }

    return list;
  }, [searchQuery, transformedAlerts, appliedFilters]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.bluecontainer}>
          <AppHeader
            containerStyle={styles.TopMenu}
            leftButtonStyle={styles.barsIcon}
            rightButtonStyle={styles.bellIcon}
            rightIcon={NotificationLight}
            logo={<RippleLogo size={68} />}
            onPressLeft={() => navigation.navigate('SideMenu')}
            onPressCenter={() => navigation.navigate('Dashboard')}
            onPressRight={() => navigation.navigate('Profile')}
          />
          <View style={styles.ProfileBox}>
            <View style={styles.profileGreetingContainer}>
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
                <Text style={styles.metricTitle}>Total Field Activities</Text>
                <Text style={styles.metricValue}>
                  {loading ? '...' : (wipData?.totalTasksToday ?? 0)}
                </Text>
              </View>
              <View style={styles.metricIconContainer}>
                <TotalTasksIcon width={21} height={21} />
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.metricCard}
              // onPress={() => navigation.navigate('FindMeters', { selectedStatus: 'COMMISSIONED' })}
              onPress={() => navigation.navigate("CompletedActivities")}
              activeOpacity={0.7}
            >
              <View style={styles.textContainer}>
                <Text style={styles.metricTitle}>Completed Field Activities</Text>
                <Text style={styles.metricValue}>
                  {loading ? '...' : (wipData?.completedTasksToday ?? 0)}
                </Text>
              </View>
              <View style={[styles.metricIconContainer, styles.metricIconContainerSuccess]}>
                <CompletedTasksIcon width={21} height={21} />
              </View>
            </TouchableOpacity>
          </View>
          <View style={styles.metricsRow}>
            <TouchableOpacity
              style={styles.metricCard}
              onPress={() => navigation.navigate("ModemDetails")}
              activeOpacity={0.7}
            >
              <View style={styles.textContainer}>
                <Text style={styles.metricTitle}>Communicating Modems</Text>
                <Text style={styles.metricValue}>
                  {loading ? '...' : (wipData?.communicatingModems ?? 0)}
                </Text>
              </View>
              <View style={styles.metricIconContainer}>
                <CommunicatingModemsIcon width={21} height={21} />
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.metricCard}
              onPress={() => navigation.navigate("ModemDetails")}
              activeOpacity={0.7}
            >
              <View style={styles.textContainer}>
                <Text style={styles.metricTitle}>Non-Communicating Modems</Text>
                <Text style={styles.metricValue}>
                  {loading ? '...' : (wipData?.nonCommunicatingModems ?? 0)}
                </Text>
              </View>
              <View style={styles.metricIconContainer}>
                <NonCommunicatingModemsIcon width={21} height={21} />
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
            onPress={() => navigation.navigate('ScanScreen')}
          >
            <Text style={styles.scanText}>Scan</Text>
            <ScanIcon width={16} height={16} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.filterButton}
            onPress={openFilterModal}
          >
            <FilterIcon width={18} height={18} />
            {hasActiveFilters && <View style={styles.filterActiveDot} />}
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

      <Modal
        transparent
        visible={filterModalVisible}
        animationType="fade"
        onRequestClose={closeFilterModal}
      >
        <View style={styles.modalOverlay}>
          <Pressable style={styles.modalBackdrop} onPress={closeFilterModal} />
          <View style={styles.filterModalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filter Alerts</Text>
              <Pressable onPress={closeFilterModal}>
                <Ionicons name="close" size={20} color="#1b1f3b" />
              </Pressable>
            </View>
            <View style={styles.modalSection}>
              <Text style={styles.modalSectionLabel}>Error Type</Text>
              <View style={styles.chipGroup}>
                {[
                  { label: "All", value: "all" },
                  { label: "Network Failure", value: "network" },
                  { label: "Power Failure", value: "power" },
                  { label: "Modem Restart", value: "restart" },
                ].map((option) => {
                  const isActive = draftFilters.errorType === option.value;
                  return (
                    <TouchableOpacity
                      key={option.value}
                      style={[
                        styles.filterChip,
                        isActive && styles.filterChipActive,
                      ]}
                      onPress={() =>
                        setDraftFilters((prev) => ({
                          ...prev,
                          errorType: option.value,
                        }))
                      }
                    >
                      <Text
                        style={[
                          styles.filterChipText,
                          isActive && styles.filterChipTextActive,
                        ]}
                      >
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            <View style={styles.modalSection}>
              <Text style={styles.modalSectionLabel}>Sort By</Text>

              <View style={styles.chipGroup}>
                {[
                  { label: "Newest First", value: "newest" },
                  { label: "Oldest First", value: "oldest" },
                ].map((option) => {
                  const isActive = draftFilters.sortBy === option.value;

                  return (
                    <TouchableOpacity
                      key={option.value}
                      style={[
                        styles.filterChip,
                        isActive && styles.filterChipActive,
                      ]}
                      onPress={() =>
                        setDraftFilters((prev) => ({
                          ...prev,
                          sortBy: option.value,
                        }))
                      }
                    >
                      <Text
                        style={[
                          styles.filterChipText,
                          isActive && styles.filterChipTextActive,
                        ]}
                      >
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonGhost]}
                onPress={handleResetFilters}
              >
                <Text style={[styles.modalButtonText, styles.modalButtonGhostText]}>
                  Reset
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonPrimary]}
                onPress={handleApplyFilters}
              >
                <Text style={styles.modalButtonText}>Apply Filters</Text>
              </TouchableOpacity>
            </View>

          </View>
        </View>
      </Modal>


    </SafeAreaView>
  );
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
      const month = monthStr.charAt(0).toUpperCase() + monthStr.slice(1).toLowerCase();
      const hourNum = Number(hourStr);
      const period = suffix?.toUpperCase() ?? 'AM';
      const formattedHour = ((hourNum % 12) || 12).toString().padStart(2, '0');
      const formattedMinute = minuteStr.padStart(2, '0');
      return `${month} ${day.padStart(2, '0')}, ${year} ${formattedHour}:${formattedMinute} ${period}`;
    }

    return dateString.length > 20 ? dateString.substring(0, 20) : dateString;
  };

  // Get signal strength icon based on signal strength value
  const getSignalIcon = () => {
    const signalStrength = modem.signalStrength || 0;
    // Signal strength ranges: Weak (< 15), Average (15-20), Strong (> 20)
    if (signalStrength < 15) {
      return <SignalWeaknessIcon width={20} height={20} />;
    } else if (signalStrength >= 15 && signalStrength <= 20) {
      return <SignalAverageIcon width={20} height={20} />;
    } else {
      return <SignalStrongIcon width={20} height={20} />;
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
          <Text style={styles.itemImei}>Error Code - {modem.code || 'N/A'}</Text>
        </View>

        <TouchableOpacity style={styles.directionButton} onPress={handleGetDirection}>
          <Text style={styles.directionButtonText}>Get Direction</Text>
        </TouchableOpacity>
      </View>

      {/* Body row: left photo block + right details */}
      <View style={styles.itemDetails}>
        {/* Photo Section - 25% */}
        {/* <View style={styles.photoSection}>
          <View style={styles.photoSectionContent}>
            <Ionicons name="image-outline" size={22} color="#B0B0B0" />
            <Text style={styles.detailLabel}>Photos</Text>
          </View>
        </View> */}

        <View style={styles.photoSection}>
          {modem?.photos && modem.photos.length > 0 ? (
            <Image
              source={modem.photos[0]}
              style={styles.photoImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.photoSectionContent}>
              <Ionicons name="image-outline" size={22} color="#B0B0B0" />
              <Text style={styles.detailLabel}>Photos</Text>
            </View>
          )}
        </View>

        {/* Right details - 75% */}
        <View style={styles.subDataSection}>
          {/* Row 1: Error + Meter Type */}
          <View style={styles.subDataRow}>
            <View style={styles.subDataItem}>
              <Text style={styles.detailLabel}>Error Type</Text>
              <Text style={styles.detailValueGreen} numberOfLines={2}>
                {modem.error || 'N/A'}
              </Text>
            </View>

            <View style={styles.subDataItem}>
              <Text style={styles.detailLabel}>Signal Strength</Text>
              <View style={styles.signalStrengthContainer}>
                {getSignalIcon()}
                <Text style={styles.signalStrengthText}>
                  {modem.signalStrength || 0} dBm
                </Text>
              </View>
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
              <Text style={styles.detailLabel}>Issue Occurred On</Text>
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
    paddingVertical: 10,
    paddingHorizontal: 10,
    width: (width - 40) / 2,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    height: 100,
    // shadowColor: '#6E6E6E',
    // shadowOffset: { width: 0, height: 2 },
    // shadowOpacity: 0.1,
    // shadowRadius: 4,
    // elevation: 3,
  },
  metricIconContainer: {
    width: 34,
    height: 34,
    borderRadius: 19,
    backgroundColor: colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    width: 120,
    alignItems: 'flex-start',
    height: "100%",
    justifyContent: "space-between",
  },
  metricValue: {
    fontSize: 20,
    color: colors.secondary,
    fontFamily: 'Manrope-Bold',
    // marginTop: 4,
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
    paddingVertical: 7,
    paddingBottom: 14,
    // justifyContent: 'space-between',
  },
  searchCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: "#F8F8F8",
    marginHorizontal: 20,
    height: 45,
    paddingHorizontal: 10,
    // paddingVertical: spacing.sm,
    borderRadius: 5,
    // elevation: 2,
    marginTop: 10,
    width: '55%',
  },
  searchInput: {
    flex: 1,
    paddingHorizontal: spacing.sm,
    color: "#6E6E6E",
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
    height: 45,
    width: '23%',
    marginTop: 9,
  },
  scanText: {
    color: '#fff',
    fontFamily: 'Manrope-Regular',
    fontSize: 16,
  },
  filterButton: {
    // width: 50,
    // height: 50,
    // borderRadius: 12,
    // borderWidth: 1,
    // borderColor: '#d7e2d9',
    alignItems: 'center',
    justifyContent: 'center',
    // marginTop: 9,
    marginLeft: 5,
    backgroundColor: '#fff',
    position: 'relative',
    marginTop: 8,
  },
  filterButtonActive: {
    borderColor: colors.secondary,
    backgroundColor: '#e9f5ef',
  },
  filterActiveDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.secondary,
    position: 'absolute',
    top: 8,
    right: 8,
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
    backgroundColor: colors.secondary,
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
    fontFamily: 'Manrope-Bold',
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
    height: 115
  },
  photoImage: {
    width: "100%",
    height: "140%",
    borderRadius: 5,
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
    fontSize: 12,
    color: '#333',
    fontFamily: 'Manrope-SemiBold',
  },
  detailValueGreen: {
    fontSize: 13,
    color: '#55b56c',
    fontFamily: 'Manrope-Medium',
  },
  signalStrengthContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  signalStrengthText: {
    fontSize: 12,
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
    fontFamily: 'Manrope-Regular',
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
    marginBottom: 20,
  },
  profileGreetingContainer: {
    gap: 6,
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
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
    backgroundColor: 'rgba(4, 12, 34, 0.45)',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  filterModalCard: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: spacing.lg,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  modalTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    fontSize: 18,
  },
  modalSection: {
    marginBottom: spacing.lg,
  },
  modalSectionLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    fontFamily: 'Manrope-SemiBold',
  },
  chipGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  filterChip: {
    borderWidth: 1,
    borderColor: '#dfe5eb',
    borderRadius: 999,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    backgroundColor: '#fff',
  },
  filterChipActive: {
    backgroundColor: '#e6f4ed',
    borderColor: colors.secondary,
  },
  filterChipText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontFamily: 'Manrope-Medium',
  },
  filterChipTextActive: {
    color: colors.secondary,
    fontFamily: 'Manrope-SemiBold',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  modalButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalButtonGhost: {
    borderWidth: 1,
    borderColor: '#dfe5eb',
    backgroundColor: '#fff',
  },
  modalButtonPrimary: {
    backgroundColor: colors.secondary,
  },
  modalButtonText: {
    fontSize: 15,
    fontFamily: 'Manrope-SemiBold',
    color: '#fff',
  },
  modalButtonGhostText: {
    color: colors.textPrimary,
  },
});
