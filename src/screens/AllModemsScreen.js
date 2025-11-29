import React, { useMemo, useState, useEffect, useContext } from 'react';
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
  Linking,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import Ionicons from 'react-native-vector-icons/Ionicons';

import RippleLogo from '../components/global/RippleLogo';
import AppHeader from '../components/global/AppHeader';
import { API_KEY, API_ENDPOINTS, getProtectedHeaders } from "../config/apiConfig";
import { getUserPhone } from '../utils/storage';

import { modemErrors } from '../data/dummyData';
import { colors, spacing } from '../styles/theme';
import { COLORS } from '../constants/colors';

import SearchIcon from '../../assets/icons/searchIcon.svg';
import ScanIcon from '../../assets/icons/scan.svg';
import FilterIcon from '../../assets/icons/filter.svg';
import NotificationLight from '../../assets/icons/notification.svg';
import SignalWeaknessIcon from '../../assets/icons/Signal-Weak.svg';
import SignalAverageIcon from '../../assets/icons/Signal-Moderate.svg';
import SignalStrongIcon from '../../assets/icons/Signal-Strong.svg';
import { NotificationContext } from '../context/NotificationContext';

import Meter from '../../assets/images/meter.png';

// Default Manrope font for all Text
if (!Text.defaultProps) Text.defaultProps = {};
Text.defaultProps.style = [{ fontFamily: 'Manrope-Regular' }];

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

const AllModemsScreen = ({ navigation, modems = [], modemIds = [], userPhone }) => {
  const { showPopup, popupNotification, setShowPopup, testNotification } = useContext(NotificationContext);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [apiData, setApiData] = useState(null);
  const [loading, setLoading] = useState(true);

  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState({
    signal: 'all',
    errorType: 'all',
    sortBy: 'newest',
  });

  const [draftFilters, setDraftFilters] = useState({
    signal: 'all',
    errorType: 'all',
    sortBy: 'newest',
  });

  const hasActiveFilters =
    appliedFilters.signal !== 'all' ||
    appliedFilters.errorType !== 'all';

  const handleResetFilters = () => {
    const cleared = { signal: 'all', errorType: 'all', sortBy: 'newest' };
    setAppliedFilters(cleared);
    setDraftFilters(cleared);
  };

  useEffect(() => {
    if (modemIds.length > 0 && userPhone) {
      fetchApiData();
    }
  }, [modemIds, userPhone]);

  const fetchApiData = async () => {
    try {
      setLoading(true);
      
      // Build query with user's modem IDs
      const modemQuery = modemIds.join(",");
      const url = `${API_ENDPOINTS.GET_MODEM_ALERTS}?modems=${encodeURIComponent(modemQuery)}`;
      
      console.log("Fetching alerts for user modems from:", url);
      console.log("User modemIds:", modemIds);
      
      const response = await fetch(url, {
        method: "GET",
        headers: getProtectedHeaders(API_KEY, userPhone),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const json = await response.json();
      console.log("All modems API response:", json);

      // Filter alerts to ensure only user's modems are included
      const filteredAlerts = Array.isArray(json.alerts)
        ? json.alerts.filter(item => {
            const keysToCheck = [
              item.modemSlNo,
              item.modemno,
              item.sno?.toString(),
              item.modemId
            ];
      
            return keysToCheck.some(key => key && modemIds.includes(key));
          })
        : [];
      
      console.log("Total modems received:", filteredAlerts.length);
      
      setApiData({
        alerts: filteredAlerts,
        stats: json.stats || {}
      });
  
    } catch (error) {
      console.error("Error fetching all modems:", error);
      setApiData(null);
    } finally {
      setLoading(false);
    }
  };

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
    const id = alert.id?.toString() || alert.modemSlNo || alert.modemno || alert.sno || `alert-${index}`;
    const modemId = alert.modemSlNo || alert.modemno || alert.sno || alert.modemId || id;
    const code = alert.code || alert.errorCode || 'N/A';

    return {
      id,
      modemId,
      location: alert.discom || alert.location || alert.meterLocation || alert.section || alert.subdivision || alert.division || alert.circle || 'N/A',
      error: alert.codeDesc || alert.error || alert.commissionStatus || alert.communicationStatus || 'N/A',
      reason: alert.reason || alert.codeDesc || alert.comments || alert.techSupportStatus || 'N/A',
      date: alert.modemDate ? `${alert.modemDate} ${alert.modemTime || ''}` : alert.date || alert.lastCommunicatedAt || alert.installedOn || alert.updatedAt || 'N/A',
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

  // ================================
  // 🔍 FILTERED LIST + SEARCH
  // ================================
  const filteredModems = useMemo(() => {
    let list = [...transformedAlerts];

    if (appliedFilters.signal !== 'all') {
      list = list.filter(m => getSignalBand(m.signalStrength) === appliedFilters.signal);
    }

    if (appliedFilters.errorType !== 'all') {
      list = list.filter(m => matchesErrorFilter(m, appliedFilters.errorType));
    }

    if (appliedFilters.sortBy === 'newest') {
      list.sort((a, b) => new Date(b.date) - new Date(a.date));
    } else {
      list.sort((a, b) => new Date(a.date) - new Date(b.date));
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(m =>
        `${m.modemId} ${m.error} ${m.location}`
          .toLowerCase()
          .includes(q)
      );
    }

    return list;
  }, [transformedAlerts, appliedFilters, searchQuery]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

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

          <TouchableOpacity style={styles.scanButton} onPress={() => navigation.navigate("ScanScreen")}>
            <Text style={styles.scanText}>Scan</Text>
            <ScanIcon width={16} height={16} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.filterButton} onPress={() => setFilterModalVisible(true)}>
            <FilterIcon width={20} height={20} />
            {hasActiveFilters && <View style={styles.filterActiveDot} />}
          </TouchableOpacity>
        </View>

        {/* ================= MODEM CARDS LIST ================= */}
        <View style={styles.cardsWrapper}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={styles.loadingText}>Loading modems…</Text>
            </View>
          ) : filteredModems.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No modems found</Text>
            </View>
          ) : (
            filteredModems.map((modem) => (
              <ModemCard key={modem.id} modem={modem} navigation={navigation} />
            ))
          )}
        </View>
      </ScrollView>

      {/* ================= FILTER MODAL ================= */}
      <Modal transparent visible={filterModalVisible} animationType="fade">
        <View style={styles.modalOverlay}>
          <Pressable style={styles.modalBackdrop} onPress={() => setFilterModalVisible(false)} />

          <View style={styles.filterModalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filter Modems</Text>
              <Pressable onPress={() => setFilterModalVisible(false)}>
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
                onPress={() => {
                  setAppliedFilters(draftFilters);
                  setFilterModalVisible(false);
                }}
                style={[styles.modalButton, styles.modalButtonPrimary]}
              >
                <Text style={styles.modalButtonText}>Apply</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ================= NOTIFICATION POPUP ================= */}
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

// =============================
// 📌 MODEM CARD COMPONENT
// =============================
const ModemCard = ({ modem, navigation }) => {
  const { startTracking } = useContext(NotificationContext);
  
  const getSignalIcon = () => {
    if (modem.signalStrength < 15) return <SignalWeaknessIcon width={20} height={20} />;
    if (modem.signalStrength <= 20) return <SignalAverageIcon width={20} height={20} />;
    return <SignalStrongIcon width={20} height={20} />;
  };

  const handleCardPress = () => {
    navigation.navigate("ModemDetails", {
      modem,
      modemSlNo: modem.modemId
    });
  };

  const handleDirection = async () => {
    await startTracking(modem.modemId);

    console.log("Now tracking:", modem.modemId);

    const lat = 17.3850;
    const lon = 78.4867;

    const url =
      Platform.OS === 'ios'
        ? `http://maps.apple.com/?daddr=${lat},${lon}`
        : `https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}`;

    Linking.openURL(url).catch(() => {
      Alert.alert("Cannot open maps", "Install Google Maps or Apple Maps to use directions.");
    });
  };

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
          <Image source={modem.photos[0]} style={styles.photoImage} resizeMode="cover" />
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
};

export default AllModemsScreen;

/* ============================================
   ✅ STYLES
   ============================================ */

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollContent: {
    paddingBottom: spacing.xl,
  },

  /* ---------- HEADER ---------- */
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

  /* ---------- SEARCH + FILTER ---------- */
  searchCardWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    elevation: 0.5,
    paddingVertical: 7,
    paddingBottom: 14,
    paddingHorizontal: 20,
  },
  searchCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: "#F8F8F8",
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
    marginLeft: 5,
    backgroundColor: '#fff',
    position: 'relative',
    marginTop: 8,
    padding: 10,
    borderRadius: 5
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

  /* ---------- MODEM LIST ---------- */
  cardsWrapper: {
    marginTop: spacing.md,
    paddingHorizontal: spacing.md,
    gap: spacing.md,
  },

  loadingContainer: {
    padding: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: colors.textSecondary,
    marginTop: spacing.md,
    fontFamily: 'Manrope-Regular',
    fontSize: 14,
  },
  emptyContainer: {
    padding: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: colors.textSecondary,
    fontFamily: 'Manrope-Regular',
    fontSize: 14,
  },

  /* ---------- MODEM CARD ---------- */
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

  /* ---------- FILTER MODAL ---------- */
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
    fontFamily: 'Manrope-Bold',
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

  /* ---------- DIRECTION BUTTON ---------- */
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

  /* ---------- NOTIFICATION POPUP ---------- */
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
});
