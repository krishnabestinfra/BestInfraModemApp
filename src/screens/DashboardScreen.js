import React, { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Pressable,
  Dimensions,
  ActivityIndicator,
  Modal,
  Image,
  Linking,
  Alert,
  Platform,
  RefreshControl,
} from 'react-native';
import { Image as ExpoImage } from 'expo-image';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import Ionicons from 'react-native-vector-icons/Ionicons';

import RippleLogo from '../components/global/RippleLogo';
import AppHeader from '../components/global/AppHeader';
import { API_BASE_URL, API_KEY, API_ENDPOINTS, getProtectedHeaders } from "../config/apiConfig";
import { cachedFetch } from '../utils/apiCache';

import { modemStats, modemErrors } from '../data/dummyData';
import { colors, spacing, borderRadius, typography } from '../styles/theme';
import { COLORS } from '../constants/colors';
import { formatDisplayDateTime } from '../utils/dateUtils';

import SearchIcon from '../../assets/icons/searchIcon.svg';
import ScanIcon from '../../assets/icons/scan.svg';
import FilterIcon from '../../assets/icons/filter.svg';
import NotificationLight from '../../assets/icons/notification.svg';
import Hand from '../../assets/icons/hand.svg';
import SignalWeaknessIcon from '../../assets/icons/Signal-Weak.svg';
import SignalAverageIcon from '../../assets/icons/Signal-Moderate.svg';
import SignalStrongIcon from '../../assets/icons/Signal-Strong.svg';
import CommunicatingModemsIcon from '../../assets/icons/communicating.svg';
import NonCommunicatingModemsIcon from '../../assets/icons/noncommicating.svg';
import { NotificationContext } from '../context/NotificationContext';
import { useContext } from 'react';
import { SkeletonLoader } from '../utils/loadingManager';

import Meter from '../../assets/images/meter.png';

if (!Text.defaultProps) Text.defaultProps = {};
Text.defaultProps.style = [{ fontFamily: 'Manrope-Regular' }];

const { width } = Dimensions.get('window');
const USE_MOCK_ALERTS = false;

const ERROR_FILTER_OPTIONS = [
  { label: 'All', value: 'all' },
  { label: 'Meter COM Failed', value: 'meterComFailed', codes: [112] },
  { label: 'Modem/DCU Auto Restart', value: 'modemAutoRestart', codes: [202] },
  { label: 'DCU/Modem Power Failed', value: 'modemPowerFailed', codes: [214] },
  { label: 'Network Issue', value: 'networkIssue' }
];

const matchesErrorFilter = (item, filterValue) => {
  if (filterValue === 'all') return true;
  
  const byCode = ERROR_FILTER_OPTIONS.find(i => i.value === filterValue && i.codes);
  if (byCode) return byCode.codes.includes(item.code);
  if (filterValue === 'networkIssue') {
    const raw = item.originalAlert || {};
    const combined = `${raw.codeDesc || ''} ${item.error || ''}`.toLowerCase();
    return combined.includes('network');
  }
  
  return true;
};

const getSignalBand = (val = 0) => {
  const n = Number(val) || 0;
  if (n < 15) return 'weak';
  if (n <= 20) return 'average';
  return 'strong';
};

/**
 * Normalizes modem identifiers from both APIs
 * Handles: modemSINo, modemNo, modemSlNo, modemno, sno, modemId
 * These fields represent the same modem identifier across different APIs
 */
const normalizeModemIdentifier = (item) => {
  if (!item) return null;
  
 
  const identifiers = [
    item.modemSINo,    // From field officer API (nexusenergy.tech)
    item.modemNo,      // From alerts API (api.bestinfra.app)
    item.modemSlNo,
    item.modemno,
    item.modemId,
    item.sno,
    item.id
  ];
  
  for (const id of identifiers) {
    if (id !== null && id !== undefined && id !== '') {
      return String(id).trim();
    }
  }
  
  return null;
};

const DashboardScreen = ({ navigation, modems = [], modemIds = [], userPhone }) => {
  const { showPopup, popupNotification, setShowPopup, startAlertPolling, stopAlertPolling } = useContext(NotificationContext);
  const insets = useSafeAreaInsets();
    
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [userName] = useState('Field Officer');
  const [apiData, setApiData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Debounce search input to reduce lag
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState({
    statuses: [],
    signal: 'all',
    errorType: 'all',
    sortBy: 'newest',
  });

  const [draftFilters, setDraftFilters] = useState({
    statuses: [],
    signal: 'all',
    errorType: 'all',
    sortBy: 'newest',
  });

  const hasActiveFilters =
    appliedFilters.statuses.length > 0 ||
    appliedFilters.signal !== 'all' ||
    appliedFilters.errorType !== 'all';

  const handleResetFilters = useCallback(() => {
    const cleared = { statuses: [], signal: 'all', errorType: 'all', sortBy: 'newest' };
    setAppliedFilters(cleared);
    setDraftFilters(cleared);
  }, []);

  const handleOpenFilterModal = useCallback(() => {
    setFilterModalVisible(true);
  }, []);

  const handleCloseFilterModal = useCallback(() => {
    setFilterModalVisible(false);
  }, []);

  const handleApplyFilters = useCallback(() => {
    setAppliedFilters(draftFilters);
    setFilterModalVisible(false);
  }, [draftFilters]);

  const handleScanPress = useCallback(() => {
    navigation.navigate("ScanScreen");
  }, [navigation]);

  useEffect(() => {
    if (modemIds.length > 0 && userPhone) {
      fetchApiData();
      
      startAlertPolling(modemIds, userPhone);
      
      return () => {
        stopAlertPolling();
      };
    }
  }, [modemIds, userPhone, fetchApiData, startAlertPolling, stopAlertPolling]);
  
  

  const fetchApiData = useCallback(async () => {
    try {
      setLoading(true);
  
      const modemQuery = modemIds.join(",");
      let allAlerts = [];
      let offset = 0;
      let hasMore = true;
      const limit = 50; // API default limit
      let stats = {};
      let totalAlertsFromStats = null;

      while (hasMore) {
        const url = `${API_ENDPOINTS.GET_MODEM_ALERTS}?modems=${encodeURIComponent(modemQuery)}&limit=${limit}&offset=${offset}`;
      const headers = getProtectedHeaders(API_KEY, userPhone);
        // Use cached fetch - cache for 2 minutes
      const response = await cachedFetch(url, {
          method: "GET",
          headers,
        }, 2 * 60 * 1000);
  
        const json = await response.json();

        if (!response.ok || (json.success === false) || json.error) {
          if (offset === 0) {
            const fallbackUrl = `${API_ENDPOINTS.GET_MODEM_ALERTS}?modems=${encodeURIComponent(modemQuery)}&limit=9999`;
            const fallbackResponse = await fetch(fallbackUrl, {
              method: "GET",
              headers: getProtectedHeaders(API_KEY, userPhone),
            });
            const fallbackJson = await fallbackResponse.json();
            
            if (fallbackResponse.ok && !fallbackJson.error) {
              allAlerts = fallbackJson.alerts || [];
              stats = fallbackJson.stats || {};
              break;
            }
          }
          
          if (offset > 0) {
            break;
          }
          
          setApiData({
            alerts: [],
            stats: {}
          });
          return;
        }

        const alerts = json.alerts || [];
        
        if (offset === 0) {
          stats = json.stats || {};
          totalAlertsFromStats = stats.totalAlerts ? parseInt(stats.totalAlerts, 10) : null;
        }

        allAlerts = [...allAlerts, ...alerts];

        if (totalAlertsFromStats !== null && allAlerts.length >= totalAlertsFromStats) {
          hasMore = false;
        }
        else if (alerts.length === 0 || alerts.length < limit) {
          hasMore = false;
        }
        else if (json.hasMore === false || json.nextPage === null) {
          hasMore = false;
        }
        
        if (allAlerts.length >= 1000) {
          break;
        }
        
        if (hasMore && alerts.length === limit) {
          offset += limit;
        } else {
          hasMore = false;
        }
      }
      
      const normalizedModemIds = new Set(
        modemIds
          .map(id => id ? String(id).trim() : null)
          .filter(Boolean)
      );
      
      const filteredAlerts = allAlerts.filter(item => {
        const alertModemId = normalizeModemIdentifier(item);
        if (!alertModemId) return false;
        return normalizedModemIds.has(alertModemId);
      });
      
      setApiData({
        alerts: filteredAlerts,
        stats: stats
      });

      if (!showLoading && filteredAlerts.length > 0) {
        console.log('Alerts refreshed successfully', filteredAlerts.length, 'alerts loaded');
      }
  
    } catch (error) {
      setApiData(null);
      if (showLoading) {
        console.error('Network error. Please check your connection.', error);
      }
    } finally {
      if (showLoading) setLoading(false);
      setRefreshing(false);
    }
  }, [modemIds, userPhone]);

  useEffect(() => {
    if (modemIds.length > 0 && userPhone) {
      fetchApiData();
      
      // Start alert polling in context (checks every 5 minutes)
      startAlertPolling(modemIds, userPhone);
      
      return () => {
        stopAlertPolling();
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modemIds.length, userPhone]); // Only depend on actual values, not function references

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchApiData(false);
  }, [fetchApiData]);
  
  
  
  

  const getStatusFromCode = (code) => {
    const map = {
      202: 'warning',
      213: 'success',
      214: 'disconnected',
      215: 'success',
      112: 'disconnected',
      212: 'disconnected',
    };
    return map[code] || 'default';
  };

  const normalizeModemRecord = (alert = {}, index = 0) => {
    const modemId = alert.modemSlNo || alert.modemno || alert.sno || alert.modemId || 'unknown';
    const code = alert.code || alert.errorCode || 'N/A';
    const timestamp = alert.modemDate || alert.date || alert.logTimestamp || alert.lastCommunicatedAt || '';
    const uniqueId = alert.id?.toString() || `${modemId}-${code}-${timestamp}-${index}`;
    const id = uniqueId || `alert-${index}`;

    let rawDate = alert.logTimestamp || alert.modemDate || alert.date || alert.lastCommunicatedAt || alert.installedOn || alert.updatedAt || 'N/A';
    const formattedDate = formatDisplayDateTime(rawDate);

    return {
      id,
      modemId,
      location: alert.discom || alert.location || alert.meterLocation || alert.section || alert.subdivision || alert.division || alert.circle || 'N/A',
      error: alert.codeDesc || alert.error || alert.commissionStatus || alert.communicationStatus || 'N/A',
      reason: alert.reason || alert.codeDesc || alert.comments || alert.techSupportStatus || 'N/A',
      date: formattedDate,
      status: getStatusFromCode(code),
      signalStrength: alert.signalStrength1 || alert.signalStrength2 || alert.signalStrength || 0,
      discom: alert.discom || alert.circle || alert.division || 'N/A',
      meterSlNo: alert.meterSlNo || alert.ctmtrno || alert.modemSlNo || alert.modemno || 'N/A',
      code: code,
      photos: [Meter],
      originalAlert: alert,
    };
  };
  const transformedAlerts = useMemo(() => {
    if (!apiData?.alerts || apiData.alerts.length === 0) {
      return modemErrors.map((m, i) => normalizeModemRecord(m, i));
    }

    return apiData.alerts.map((alert, index) => normalizeModemRecord(alert, index));
  }, [apiData]);

  const dashboardMetrics = useMemo(() => {
    const communicatingSet = new Set();
    const nonCommunicatingSet = new Set();
    
    const nonCommunicatingCodes = [214, 112, 212];
    
    if (modemIds && modemIds.length > 0) {
      modemIds.forEach(modemId => {
        if (modemId) {
          communicatingSet.add(modemId.toString());
        }
      });
    }
    
    if (apiData && apiData.alerts && apiData.alerts.length > 0) {
      const modemStatusMap = new Map();
      
      const normalizedModemIds = new Set(
        modemIds
          .map(id => id ? String(id).trim() : null)
          .filter(Boolean)
      );
      
      apiData.alerts?.forEach(alert => {
        const alertModemId = normalizeModemIdentifier(alert);
        
        if (!alertModemId) return;
        
        if (!normalizedModemIds.has(alertModemId)) return;
        
        const matchingOfficerModemId = modemIds.find(officerModemId => {
          const normalizedOfficerId = String(officerModemId).trim();
          return normalizedOfficerId === alertModemId;
        });
        
        if (!matchingOfficerModemId) return; 
        
        const rawCode = alert.code || alert.errorCode;
        const code = rawCode ? Number(rawCode) : null;
        
        if (modemStatusMap.get(matchingOfficerModemId) === 'non-communicating') {
          return;
        }
        
        if (code && !isNaN(code) && nonCommunicatingCodes.includes(code)) {
          modemStatusMap.set(matchingOfficerModemId, 'non-communicating');
        } else if (code && !isNaN(code)) {
          
          if (!modemStatusMap.has(matchingOfficerModemId)) {
            modemStatusMap.set(matchingOfficerModemId, 'communicating');
          }
        }
      });
      
      modemStatusMap.forEach((status, modemId) => {
        if (status === 'non-communicating') {
          nonCommunicatingSet.add(modemId.toString());
          communicatingSet.delete(modemId.toString()); // Remove from communicating
        } else {
          communicatingSet.add(modemId.toString());
          nonCommunicatingSet.delete(modemId.toString()); // Remove from non-communicating
        }
      });
    }

    return {
      communicatingModems: communicatingSet.size,
      nonCommunicatingModems: nonCommunicatingSet.size,
      totalTasksToday: apiData?.alerts?.length || 0,
      completedTasksToday: 0,
    };
  }, [apiData, modemIds]);

  const wipData = useMemo(
    () => ({
      ...dashboardMetrics,
      metersInstalled: apiData?.stats?.uniqueModems || modemStats.connected,
      metersCommissioned: apiData?.stats?.totalAlerts || modemStats.disconnected,
      totalAlerts: apiData?.stats?.totalAlerts || '0',
      uniqueMeters: apiData?.stats?.uniqueMeters || '0',
      uniqueDiscoms: apiData?.stats?.uniqueDiscoms || '0',
      avgSignalStrength: apiData?.stats?.avgSignalStrength1 || '0',
    }),
    [apiData, dashboardMetrics]
  );

  const filteredModems = useMemo(() => {
    let list = [...transformedAlerts];

    if (appliedFilters.signal !== 'all') {
      list = list.filter(m => getSignalBand(m.signalStrength) === appliedFilters.signal);
    }

    if (appliedFilters.errorType !== 'all') {
      list = list.filter(m => matchesErrorFilter(m, appliedFilters.errorType));
    }

    // Optimize date sorting by using pre-parsed dates
    if (appliedFilters.sortBy === 'newest') {
      list.sort((a, b) => {
        const dateA = a._parsedDate || (a._parsedDate = new Date(a.date).getTime());
        const dateB = b._parsedDate || (b._parsedDate = new Date(b.date).getTime());
        return dateB - dateA;
      });
    } else {
      list.sort((a, b) => {
        const dateA = a._parsedDate || (a._parsedDate = new Date(a.date).getTime());
        const dateB = b._parsedDate || (b._parsedDate = new Date(b.date).getTime());
        return dateA - dateB;
      });
    }

        if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(m => {
        const searchableFields = [
          m.modemId || '',
          m.meterSlNo || '',
          m.error || '',
          m.location || '',
          m.discom || '',
          m.reason || '',
          m.status || '',
          String(m.code || ''),
          m.originalAlert?.codeDesc || '',
          m.originalAlert?.discom || '',
          m.originalAlert?.section || '',
          m.originalAlert?.subdivision || '',
          m.originalAlert?.division || '',
          m.originalAlert?.circle || '',
          m.originalAlert?.modemSlNo || '',
          m.originalAlert?.modemno || '',
          m.originalAlert?.sno || '',
          m.originalAlert?.meterSlNo || '',
          m.originalAlert?.ctmtrno || '',
        ];
        
        const searchableText = searchableFields
          .join(' ')
          .toLowerCase();
        
        return searchableText.includes(q);
      });
    }

    return list;
  }, [transformedAlerts, appliedFilters, debouncedSearchQuery]);


  const renderHeader = useCallback(() => (
    <>
      {/* ================= HEADER ================= */}
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
                <Text style={styles.hiText}>Hi, {userName}</Text>
                <Hand width={30} height={30} />
              </View>
              <Text style={styles.stayingText}>Monitoring modems today?</Text>
            </View>
          </View>

        {/* ================= CARDS ROW ================= */}
        <View style={styles.metricsRow}>
          <TouchableOpacity
            style={styles.metricCard}
            activeOpacity={0.7}
          >
            <View style={styles.textContainer}>
              <Text style={styles.metricTitle}>Communicating Modems</Text>
              <Text style={styles.metricValue}>
                {loading ? '...' : wipData.communicatingModems}
              </Text>
            </View>
            <View style={styles.metricIconContainer}>
              <CommunicatingModemsIcon width={21} height={21} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.metricCard}
            activeOpacity={0.7}
          >
            <View style={styles.textContainer}>
              <Text style={styles.metricTitle}>Non-Communicating</Text>
              <Text style={styles.metricValue}>
                {loading ? '...' : wipData.nonCommunicatingModems}
              </Text>
            </View>
            <View style={styles.metricIconContainer}>
              <NonCommunicatingModemsIcon width={21} height={21} />
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* ================= SEARCH & FILTER ================= */}
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
          style={styles.filterButton} 
          onPress={handleOpenFilterModal}
        >
          <FilterIcon width={20} height={20} />
          {hasActiveFilters && <View style={styles.filterActiveDot} />}
        </TouchableOpacity>
      </View>
    </>
  ), [navigation, userName, loading, wipData, searchQuery, hasActiveFilters, handleOpenFilterModal]);

  const renderEmptyComponent = useCallback(() => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>📭</Text>
      <Text style={styles.emptyText}>No Alerts Found</Text>
      <Text style={styles.emptySubText}>
        {debouncedSearchQuery.trim() || hasActiveFilters
          ? 'Try adjusting your search or filters'
          : 'All modems are operating normally'}
      </Text>
      {hasActiveFilters && (
        <TouchableOpacity 
          style={styles.clearFiltersButton}
          onPress={handleResetFilters}
        >
          <Text style={styles.clearFiltersText}>Clear Filters</Text>
        </TouchableOpacity>
      )}
    </View>
  ), [debouncedSearchQuery, hasActiveFilters, handleResetFilters]);

  const renderModemItem = useCallback(({ item }) => (
    <View style={styles.cardsWrapper}>
      <ModemCard modem={item} navigation={navigation} />
    </View>
  ), [navigation]);

  return (
    <SafeAreaView style={styles.safeArea} edges={[]}>
      <StatusBar style="dark" />
      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <View style={styles.skeletonContainer}>
            {[1, 2, 3].map((i) => (
              <View key={i} style={styles.skeletonCard}>
                <SkeletonLoader style={styles.skeletonHeader} />
                <SkeletonLoader style={styles.skeletonBody} />
              </View>
            ))}
          </View>
        </View>
      ) : (
        <View style={styles.flatListContainer}>
          <FlatList
            data={filteredModems}
            keyExtractor={(item) => item.id}
            renderItem={renderModemItem}
            ListHeaderComponent={renderHeader}
            ListEmptyComponent={renderEmptyComponent}
            contentContainerStyle={[
              styles.listContent,
              filteredModems.length === 0 && styles.listContentEmpty,
              { paddingBottom: 100 + insets.bottom }
            ]}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[colors.secondary]}
                tintColor={colors.secondary}
              />
            }
            removeClippedSubviews={true}
            maxToRenderPerBatch={10}
            updateCellsBatchingPeriod={50}
            initialNumToRender={10}
            windowSize={10}
            nestedScrollEnabled={false}
            scrollEnabled={true}
            keyboardShouldPersistTaps="handled"
          />
        </View>
      )}

      <View style={[styles.stickyScanButtonContainer, { paddingBottom: spacing.md + insets.bottom }]}>
        <TouchableOpacity 
          style={styles.stickyScanButton} 
          onPress={handleScanPress}
          activeOpacity={0.8}
        >
          <ScanIcon width={20} height={20} />
          <Text style={styles.stickyScanButtonText}>Scan QR Code</Text>
        </TouchableOpacity>
      </View>

      <Modal transparent visible={filterModalVisible} animationType="fade">
        <View style={styles.modalOverlay}>
          <Pressable style={styles.modalBackdrop} onPress={handleCloseFilterModal} />

          <View style={styles.filterModalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filter Alerts</Text>
              <Pressable onPress={handleCloseFilterModal}>
                <Ionicons name="close" size={22} />
              </Pressable>
            </View>

            {/* ERROR TYPE */}
            <View style={styles.modalSection}>
              <Text style={styles.modalSectionLabel}>Error Type</Text>
              <View style={styles.chipGroup}>
                {ERROR_FILTER_OPTIONS.map((opt) => {
                  const active = draftFilters.errorType === opt.value;
                  return (
                    <TouchableOpacity
                      key={opt.value}
                      onPress={() => setDraftFilters((p) => ({ ...p, errorType: opt.value }))}
                      style={[styles.filterChip, active && styles.filterChipActive]}
                    >
                      <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>
                        {opt.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* SORT */}
            <View style={styles.modalSection}>
              <Text style={styles.modalSectionLabel}>Sort By</Text>
              <View style={styles.chipGroup}>
                {[
                  { label: 'Newest First', value: 'newest' },
                  { label: 'Oldest First', value: 'oldest' },
                ].map((opt) => {
                  const active = draftFilters.sortBy === opt.value;
                  return (
                    <TouchableOpacity
                      key={opt.value}
                      onPress={() => setDraftFilters((p) => ({ ...p, sortBy: opt.value }))}
                      style={[styles.filterChip, active && styles.filterChipActive]}
                    >
                      <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>
                        {opt.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* ACTIONS */}
            <View style={styles.modalActions}>
              <TouchableOpacity onPress={handleResetFilters} style={[styles.modalButton, styles.modalButtonGhost]}>
                <Text style={[styles.modalButtonText, styles.modalButtonGhostText]}>Reset</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleApplyFilters}
                style={[styles.modalButton, styles.modalButtonPrimary]}
              >
                <Text style={styles.modalButtonText}>Apply</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        transparent
        visible={showPopup}
        animationType="fade"
        onRequestClose={() => setShowPopup(false)}
      >
        <View style={styles.notificationPopupOverlay}>
          <View style={styles.notificationPopupCard}>
            <View style={styles.notificationPopupHeader}>
              <Text style={styles.notificationPopupTitle}>
                {popupNotification?.title || 'Notification'}
              </Text>
              <TouchableOpacity onPress={() => setShowPopup(false)}>
                <Ionicons name="close" size={22} color="#666" />
              </TouchableOpacity>
            </View>
            <Text style={styles.notificationPopupMessage}>
              {popupNotification?.message || ''}
            </Text>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const ModemCard = React.memo(({ modem, navigation }) => {
  const { startTracking } = useContext(NotificationContext);
  const getSignalIcon = () => {
    if (modem.signalStrength < 15) return <SignalWeaknessIcon width={20} height={20} />;
    if (modem.signalStrength <= 20) return <SignalAverageIcon width={20} height={20} />;
    return <SignalStrongIcon width={20} height={20} />;
  };

  const handleCardPress = useCallback(() => {
    navigation.navigate("ModemDetails", {
      modem,
      modemSlNo: modem.modemId
    });
  }, [modem, navigation]);

  const handleDirection = useCallback(async () => {
    await startTracking(modem.modemId);

    const lat = 17.3850;
    const lon = 78.4867;

    const url =
      Platform.OS === 'ios'
        ? `http://maps.apple.com/?daddr=${lat},${lon}`
        : `https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}`;

    Linking.openURL(url).catch(() => {
      Alert.alert("Cannot open maps", "Install Google Maps or Apple Maps to use directions.");
    });
  }, [modem.modemId, startTracking]);

  return (
    <Pressable onPress={handleCardPress} style={styles.modemCard}>
      <View style={styles.itemHeader}>
        <View style={styles.itemIdContainer}>
          <Text style={styles.itemId}>{modem.modemId}</Text>
          <Text style={styles.itemImei}>Error Code – {modem.code}</Text>
        </View>

        <TouchableOpacity style={styles.directionButton} onPress={handleDirection}>
          <Text style={styles.directionButtonText}>Get Direction</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.itemDetails}>
        {/* PHOTO */}
        <View style={styles.photoSection}>
          <ExpoImage
            source={modem.photos[0]}
            style={styles.photoImage}
            contentFit="cover"
            transition={200}
            placeholder={require('../../assets/images/meter.png')}
            cachePolicy="memory-disk"
          />
        </View>

        {/* DETAILS */}
        <View style={styles.subDataSection}>
          <View style={styles.subDataRow}>
            <View style={styles.subDataItem}>
              <Text style={styles.detailLabel}>Error Type</Text>
              <Text style={styles.detailValueGreen}>{modem.error}</Text>
            </View>

            <View style={styles.subDataItem}>
              <Text style={styles.detailLabel}>Signal</Text>
              <View style={styles.signalStrengthContainer}>
                {getSignalIcon()}
                <Text style={styles.signalStrengthText}>{modem.signalStrength} dBm</Text>
              </View>
            </View>
          </View>

          <View style={styles.subDataRow}>
            <View style={styles.subDataItem}>
              <Text style={styles.detailLabel}>HES Status</Text>
              <View style={styles.statusPillPending}>
                <Text style={styles.statusPillText}>Pending</Text>
              </View>
            </View>

            <View style={styles.subDataItem}>
              <Text style={styles.detailLabel}>Occurred On</Text>
              <Text style={styles.datedetails}>{modem.date}</Text>
            </View>
          </View>
        </View>
      </View>
    </Pressable>
  );
});

export default DashboardScreen;


const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  flatListContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.xl,
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
  },
  metricTitle: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'Manrope-Regular',
  },
  metricIconContainer: {
    width: 34,
    height: 34,
    borderRadius: 19,
    backgroundColor: colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
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
  },
  searchCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: "#F8F8F8",
    marginHorizontal: 20,
    height: 45,
    paddingHorizontal: 10,
    borderRadius: 5,
    marginTop: 10,
    flex: 1,
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    paddingHorizontal: spacing.sm,
    color: "#6E6E6E",
    fontFamily: 'Manrope-Regular',
    fontSize: 14,
  },
  scanText: {
    color: '#fff',
    fontFamily: 'Manrope-Regular',
    fontSize: 16,
  },
  filterButton: {
    marginLeft: 5,
    backgroundColor: '#fff',
    position: 'relative',
    marginTop: 8,
    padding: 10,
    borderRadius: 5,
    marginRight: 10,
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

  cardsWrapper: {
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  listContent: {
    paddingBottom: spacing.xl,
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
  emptyScrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    minHeight: 400,
  },
  emptyContainer: {
    padding: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: spacing.md,
  },
  emptyText: {
    ...typography.h3,
    color: colors.textPrimary,
    fontFamily: 'Manrope-Bold',
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  emptySubText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  clearFiltersButton: {
    marginTop: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: colors.secondary,
    borderRadius: 8,
  },
  clearFiltersText: {
    color: '#fff',
    fontFamily: 'Manrope-SemiBold',
    fontSize: 14,
  },
  skeletonContainer: {
    paddingHorizontal: spacing.md,
  },
  skeletonCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: '#F8F8F8',
  },
  skeletonHeader: {
    height: 20,
    width: '60%',
    marginBottom: 12,
    borderRadius: 4,
  },
  skeletonBody: {
    height: 80,
    width: '100%',
    borderRadius: 4,
  },
  listContent: {
    paddingBottom: spacing.xl,
  },

  modemCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 15,
    borderWidth: 1,
    borderColor: '#F8F8F8',
    marginBottom: spacing.md,
    elevation: 0.5,
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
    height: 115,
  },
  photoImage: {
    width: '100%',
    height: '140%',
    borderRadius: 5,
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
    fontSize: 18,
    fontFamily: 'Manrope-SemiBold',
  },
  modalSection: {
    marginBottom: spacing.lg,
  },
  modalSectionLabel: {
    fontSize: 14,
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

  directionButton: {
    backgroundColor: colors.secondary,
    borderRadius: 5,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  directionButtonText: {
    color: '#fff',
    fontSize: 13,
    fontFamily: 'Manrope-Bold',
  },

  notificationPopupOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 50,
  },
  notificationPopupCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 20,
    minWidth: '85%',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  notificationPopupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  notificationPopupTitle: {
    fontSize: 18,
    fontFamily: 'Manrope-Bold',
    color: '#333',
    flex: 1,
  },
  notificationPopupMessage: {
    fontSize: 14,
    fontFamily: 'Manrope-Regular',
    color: '#666',
    lineHeight: 20,
  },

  stickyScanButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: '#F8F8F8',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  stickyScanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.secondary,
    paddingVertical: spacing.ms,
    paddingHorizontal: spacing.lg,
    borderRadius: 5,
    width: '100%',
    gap: spacing.sm,
  },
  stickyScanButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Manrope-SemiBold',
  },

});
