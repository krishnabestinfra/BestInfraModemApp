import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import AppHeader from '../components/global/AppHeader';
import ErrorRow from '../components/ErrorRow';
import Search from '../components/global/Search';
import Filter from '../components/global/Filter';
import { modemErrors } from '../data/dummyData';
import { colors, spacing, borderRadius, typography, shadows } from '../styles/theme';
import { COLORS } from '../constants/colors';
import { 
  normalizeModemRecord, 
  getSignalBand, 
  createSearchableText,
} from '../utils/modemHelpers';
import Meter from '../../assets/images/meter.png';

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

const ErrorDetailsScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState('non-communicating');
  const [searchQuery, setSearchQuery] = useState('');
  const [appliedFilters, setAppliedFilters] = useState({ statuses: [], signal: 'all', errorType: 'all', sortBy: 'newest' });

  const hasActiveFilters = appliedFilters.statuses.length > 0 || appliedFilters.signal !== 'all' || appliedFilters.errorType !== 'all';

  const handleFiltersChange = useCallback((newFilters) => {
    setAppliedFilters(newFilters);
  }, []);

  const transformedAlerts = useMemo(() => {
    return modemErrors.map((alert, index) => normalizeModemRecord(alert, index, Meter));
  }, []);

  const filteredErrors = useMemo(() => {
    let list = [...transformedAlerts];
    
    // Filter by tab
    if (activeTab === 'resolved') {
      list = list.filter(m => m.status === 'success' || m.resolved);
    } else {
      list = list.filter(m => m.status !== 'success' && !m.resolved);
    }
    
    // Apply signal filter
    if (appliedFilters.signal !== 'all') {
      list = list.filter(m => getSignalBand(m.signalStrength) === appliedFilters.signal);
    }
    
    // Apply error type filter
    if (appliedFilters.errorType !== 'all') {
      list = list.filter(m => matchesErrorFilter(m, appliedFilters.errorType));
    }
    
    // Apply sorting
    if (appliedFilters.sortBy === 'newest') {
      list.sort((a, b) => new Date(b.date) - new Date(a.date));
    } else {
      list.sort((a, b) => new Date(a.date) - new Date(b.date));
    }
    
    // Apply search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(m => createSearchableText(m).includes(q));
    }
    
    return list;
  }, [transformedAlerts, activeTab, appliedFilters, searchQuery]);

  const handleErrorPress = (error) => {
    navigation.navigate('ModemDetails', { 
      modem: error, 
      isNonCommunicating: activeTab === 'non-communicating' 
    });
  };

  const renderTabButton = (title, key) => (
    <TouchableOpacity
      style={[styles.tabButton, activeTab === key && styles.tabButtonActive]}
      onPress={() => setActiveTab(key)}
    >
      <Text style={[styles.tabButtonText, activeTab === key && styles.tabButtonTextActive]}>
        {title}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={[]}>
      <StatusBar style="dark" />
      <AppHeader navigation={navigation} />
      <View style={styles.titleContainer}>
        <Text style={styles.title}>Modems</Text>
      </View>

      {/* Search and Filter */}
      <View style={styles.searchFilterContainer}>
        <Search
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search modems..."
        />
        <Filter
          filterOptions={ERROR_FILTER_OPTIONS}
          initialFilters={appliedFilters}
          onFiltersChange={handleFiltersChange}
          hasActiveFilters={hasActiveFilters}
        />
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        {renderTabButton('Non-Communicating', 'non-communicating')}
        {renderTabButton('Resolved Modems', 'resolved')}
      </View>

      {/* Results count */}
      <View style={styles.resultsHeader}>
        <Text style={styles.resultsCount}>
          {filteredErrors.length} modem{filteredErrors.length !== 1 ? 's' : ''} found
        </Text>
      </View>

      {/* Modem list */}
      <FlatList
        data={filteredErrors}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ErrorRow
            item={item}
            onPress={() => handleErrorPress(item)}
          />
        )}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.listContainer, { paddingBottom: spacing.lg + insets.bottom }]}
      />

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  topMenu: {
    paddingTop: 10,
    paddingBottom: 5,
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
  titleContainer: {
    marginTop: 10,
    marginBottom: 15,
    paddingHorizontal: 15,
  },
  title: {
    fontSize: 24,
    color: COLORS.primaryFontColor,
    fontFamily: 'Manrope-Bold',
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: colors.cardBackground,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    ...shadows.small,
  },
  tabButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    marginHorizontal: spacing.xs,
    borderRadius: borderRadius.round,
    backgroundColor: colors.background,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  tabButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  tabButtonText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  tabButtonTextActive: {
    color: colors.cardBackground,
    fontWeight: '600',
  },
  resultsHeader: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  resultsCount: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  listContainer: {
    paddingBottom: spacing.lg,
  },
  searchFilterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default ErrorDetailsScreen;
