import React, { useMemo, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import AppHeader from '../components/global/AppHeader';
import SearchBar from '../components/global/SearchBar';
import TabNavigation from '../components/global/TabNavigation';
import LoadingState from '../components/global/LoadingState';
import EmptyState from '../components/global/EmptyState';
import VisitedModemCard from '../components/VisitedModemCard';
import { spacing } from '../styles/theme';
import { COLORS } from '../constants/colors';
import { normalizeModemIdentifier } from '../utils/modemHelpers';
import { searchModems, filterByResolved, sortModemsByDate } from '../utils/searchUtils';
import { visitedModems as visitedModemsDummy } from '../data/dummyData';
import Meter from '../../assets/images/meter.png';

if (!Text.defaultProps) Text.defaultProps = {};
Text.defaultProps.style = [{ fontFamily: 'Manrope-Regular' }];

const VisitedScreen = ({ navigation, modems = [], modemIds = [], userPhone }) => {
  const insets = useSafeAreaInsets();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('Resolved');
  const [visitedModems, setVisitedModems] = useState(new Set());

  const transformedAlerts = useMemo(() => {
    // Use dummy data only - no API calls
    const alerts = visitedModemsDummy;
    
    // Ensure alerts is always an array
    if (!Array.isArray(alerts)) {
      return [];
    }
    
    return alerts.map((alert, index) => {
      const modemId = normalizeModemIdentifier(alert) || alert.modemSlNo || alert.modemno || alert.sno || `modem-${index}`;
      const code = alert.code || alert.errorCode || 'N/A';
      const resolved = alert.resolved === true || alert.status === 'resolved' || alert.resolutionStatus === 'resolved';
      
      const getErrorType = () => {
        if (code === 202) return 'Modem Auto Restart';
        if (code === 214) return 'Modem Power Failed';
        if (code === 112 || code === 212) return 'Meter COM Failed';
        if (code === 213) return 'Meter COM Restored';
        if (code === 215) return 'Modem Power Restored';
        return alert.codeDesc || alert.error || 'Network Failure';
      };

      return {
        id: alert.id?.toString() || `${modemId}-${index}`,
        modemId: modemId,
        status: getErrorType(),
        resolved: resolved,
        resolvedAt: alert.updatedAt || alert.resolvedAt || alert.modemDate || alert.date || 'N/A',
        location: alert.discom || alert.location || alert.section || alert.subdivision || alert.division || alert.circle || 'Building B-Floor 2',
        photos: [Meter],
        originalAlert: alert,
      };
    });
  }, []);

  // Mark modems as visited
  useEffect(() => {
    if (transformedAlerts.length > 0) {
      const newVisited = new Set(visitedModems);
      transformedAlerts.forEach(alert => {
        newVisited.add(alert.modemId);
      });
      if (newVisited.size !== visitedModems.size) {
        setVisitedModems(newVisited);
      }
    }
  }, [transformedAlerts]);

  const filteredModems = useMemo(() => {
    let list = [...transformedAlerts];

    // Filter by visited modems
    list = list.filter(m => visitedModems.has(m.modemId));

    // Filter by resolved/not resolved
    list = filterByResolved(list, activeTab === 'Resolved');

    // Filter by search query
    if (searchQuery.trim()) {
      list = searchModems(list, searchQuery);
    }

    // Sort by date (newest first)
    return sortModemsByDate(list, true);
  }, [transformedAlerts, activeTab, visitedModems, searchQuery]);

  const tabs = [
    { key: 'Resolved', label: 'Resolved' },
    { key: 'NotResolved', label: 'Not Resolved' },
  ];

  return (
    <SafeAreaView style={styles.safeArea} edges={[]}>
      <StatusBar style="dark" />
      
      <AppHeader navigation={navigation} />

      <View style={styles.titleContainer}>
          <Text style={styles.title}>Visited</Text>
        </View>

      <TabNavigation
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      <SearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        onFilterPress={() => {}}
      />

      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 100 + insets.bottom }]}
      >
        <View style={styles.cardsWrapper}>
          {filteredModems.length === 0 ? (
            <EmptyState message="No visited modems found" />
          ) : (
            filteredModems.map((item, index) => (
              <VisitedModemCard 
                key={item.id || `visited-${index}`} 
                item={item}
                dateLabel={activeTab === 'Resolved' ? 'Resolved' : 'Visited'}
              />
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};


export default VisitedScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    paddingBottom: spacing.xl,
  },
  cardsWrapper: {
    marginTop: spacing.md,
    paddingHorizontal: spacing.md,
    gap: spacing.md,
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
    fontSize: 20,
    color: COLORS.primaryFontColor,
    fontFamily: 'Manrope-Bold',
  },
});

