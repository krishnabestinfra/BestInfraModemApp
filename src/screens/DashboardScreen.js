import React, { useMemo, useState, useEffect, useCallback, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Pressable,
  ActivityIndicator,
  Modal,
  Linking,
  Alert,
  Platform,
  FlatList,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import Ionicons from 'react-native-vector-icons/Ionicons';

import AppHeader from '../components/global/AppHeader';
import NotVisitedModemCard from '../components/NotVisitedModemCard';
import MetricsCards from '../components/MetricsCards';
import NotificationPopup from '../components/NotificationPopup';
import SearchBar from '../components/global/SearchBar';
import ScanIcon from '../../assets/icons/scan.svg';
import { modemErrors } from '../data/dummyData';
import { colors, spacing, typography } from '../styles/theme';
import { COLORS } from '../constants/colors';
import { NotificationContext } from '../context/NotificationContext';
import { 
  normalizeModemRecord, 
  getSignalBand, 
  createSearchableText,
} from '../utils/modemHelpers';
import { calculateDashboardMetrics } from '../utils/dashboardMetrics';
import Hand from '../../assets/icons/hand.svg';
import Meter from '../../assets/images/meter.png';

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
    return `${raw.codeDesc || ''} ${item.error || ''}`.toLowerCase().includes('network');
  }
  return true;
};

const DashboardScreen = ({ navigation, modems = [], modemIds = [], userPhone }) => {
  const { showPopup, popupNotification, setShowPopup, startTracking } = useContext(NotificationContext);
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState('');
  const [userName] = useState('Field Officer');
  const [loading, setLoading] = useState(false);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState({ statuses: [], signal: 'all', errorType: 'all', sortBy: 'newest' });
  const [draftFilters, setDraftFilters] = useState({ statuses: [], signal: 'all', errorType: 'all', sortBy: 'newest' });

  const hasActiveFilters = appliedFilters.statuses.length > 0 || appliedFilters.signal !== 'all' || appliedFilters.errorType !== 'all';

  const handleResetFilters = useCallback(() => {
    const cleared = { statuses: [], signal: 'all', errorType: 'all', sortBy: 'newest' };
    setAppliedFilters(cleared);
    setDraftFilters(cleared);
  }, []);

  const handleDirectionPress = useCallback(async (modem) => {
    await startTracking(modem.modemId);
    const lat = 17.3850;
    const lon = 78.4867;
    const url = Platform.OS === 'ios'
      ? `http://maps.apple.com/?daddr=${lat},${lon}`
      : `https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}`;
    Linking.openURL(url).catch(() => {
      Alert.alert("Cannot open maps", "Install Google Maps or Apple Maps to use directions.");
    });
  }, [startTracking]);

  // No API calls - using dummy data only

  const transformedAlerts = useMemo(() => {
    return modemErrors.map((alert, index) => normalizeModemRecord(alert, index, Meter));
  }, []);

  const dashboardMetrics = useMemo(() => calculateDashboardMetrics(null, modemIds), [modemIds]);

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
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(m => createSearchableText(m).includes(q));
    }
    return list;
  }, [transformedAlerts, appliedFilters, searchQuery]);

  const renderModemItem = useCallback(({ item }) => (
    <NotVisitedModemCard 
      modem={item} 
      navigation={navigation}
      onDirectionPress={handleDirectionPress}
    />
  ), [navigation, handleDirectionPress]);

  return (
    <SafeAreaView style={styles.safeArea} edges={[]}>
      <StatusBar style="dark" />
      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 100 + insets.bottom }]}
      >
        <AppHeader navigation={navigation}>
          <View style={styles.ProfileBox}>
            <View style={styles.profileGreetingContainer}>
              <View style={styles.profileGreetingRow}>
                <Text style={styles.hiText}>Hi, {userName}</Text>
                <Hand width={30} height={30} />
              </View>
              <Text style={styles.stayingText}>Monitoring modems today?</Text>
            </View>
          </View>
          <MetricsCards loading={loading} metrics={dashboardMetrics} />
        </AppHeader>

        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          onFilterPress={() => setFilterModalVisible(true)}
          hasActiveFilters={hasActiveFilters}
        />

        <View style={styles.cardsWrapper}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={styles.loadingText}>Loading alerts…</Text>
            </View>
          ) : filteredModems.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No alerts found</Text>
            </View>
          ) : (
            <FlatList
              data={filteredModems}
              renderItem={renderModemItem}
              keyExtractor={(item) => item.id || `modem-${item.modemId}`}
              scrollEnabled={false}
              removeClippedSubviews={true}
              maxToRenderPerBatch={10}
              initialNumToRender={10}
            />
          )}
        </View>
      </ScrollView>

      <View style={[styles.stickyScanButtonContainer, { paddingBottom: spacing.md + insets.bottom }]}>
        <TouchableOpacity 
          style={styles.stickyScanButton} 
          onPress={() => navigation.navigate("ScanScreen")}
          activeOpacity={0.8}
        >
          <ScanIcon width={20} height={20} />
          <Text style={styles.stickyScanButtonText}>Scan QR Code</Text>
        </TouchableOpacity>
      </View>

      <Modal transparent visible={filterModalVisible} animationType="fade">
        <View style={styles.modalOverlay}>
          <Pressable style={styles.modalBackdrop} onPress={() => setFilterModalVisible(false)} />
          <View style={styles.filterModalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filter Alerts</Text>
              <Pressable onPress={() => setFilterModalVisible(false)}>
                <Ionicons name="close" size={22} />
              </Pressable>
            </View>
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

      <NotificationPopup
        visible={showPopup}
        notification={popupNotification}
        onClose={() => setShowPopup(false)}
      />
    </SafeAreaView>
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
  ProfileBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 2,
    marginTop: 20,
    marginBottom: 20,
    paddingHorizontal: 0,
  },
  profileGreetingContainer: {
    gap: 6,
  },
  profileGreetingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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
