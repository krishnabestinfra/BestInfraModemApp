import React, { useMemo, useState } from 'react';
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
import EmptyState from '../components/global/EmptyState';
import VisitedModemCard from '../components/VisitedModemCard';
import NotVisitedModemCard from '../components/NotVisitedModemCard';
import { spacing } from '../styles/theme';
import { COLORS } from '../constants/colors';
import Meter from '../../assets/images/meter.png';

if (!Text.defaultProps) Text.defaultProps = {};
Text.defaultProps.style = [{ fontFamily: 'Manrope-Regular' }];

const visitedModemsData = [
  {
    id: 'VIS001',
    modemId: 'MDM001',
    code: 214,
    error: 'Modem Power Failed',
    date: '2025-11-11 15:00:00',
    location: 'Building B-Floor 2',
    photos: [Meter],
  },
  {
    id: 'VIS002',
    modemId: 'MDM002',
    code: 112,
    error: 'Meter COM Failed',
    date: '2023-08-13 16:00:00',
    location: 'Building A-Floor 1',
    photos: [Meter],
  },
];

const notVisitedModemsData = [
  {
    id: 'NOTVIS001',
    modemId: 'MDM003',
    code: 212,
    error: 'Meter COM Failed',
    date: '2025-11-20 14:30:00',
    location: 'Building C-Floor 3',
    signalStrength: 5,
    photos: [Meter],
  },
  {
    id: 'NOTVIS002',
    modemId: 'MDM004',
    code: 214,
    error: 'Modem Power Failed',
    date: '2025-11-18 10:15:00',
    location: 'Building D-Floor 2',
    signalStrength: 0,
    photos: [Meter],
  },
];

const OfflineModemsScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('NotVisited');

  const filteredModems = useMemo(() => {
    const data = activeTab === 'Visited' ? visitedModemsData : notVisitedModemsData;
    
    if (!searchQuery.trim()) {
      return data;
    }
    
    const query = searchQuery.toLowerCase();
    return data.filter(modem => 
      modem.modemId.toLowerCase().includes(query) ||
      modem.location.toLowerCase().includes(query) ||
      modem.error.toLowerCase().includes(query)
    );
  }, [activeTab, searchQuery]);

  const tabs = [
    { key: 'Visited', label: 'Visited' },
    { key: 'NotVisited', label: 'Not Visited' },
  ];

  return (
    <SafeAreaView style={styles.safeArea} edges={[]}>
      <StatusBar style="dark" />
      
      <AppHeader navigation={navigation} />

      <View style={styles.titleContainer}>
        <Text style={styles.title}>Offline Modems</Text>
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
            <EmptyState message="No offline modems found" />
          ) : (
            filteredModems.map((modem, index) => (
              activeTab === 'Visited' ? (
                <VisitedModemCard 
                  key={modem.id || `visited-${index}`} 
                  item={modem}
                  dateLabel="Visited"
                />
              ) : (
                <NotVisitedModemCard 
                  key={modem.id || `notvisited-${index}`} 
                  modem={modem} 
                  navigation={navigation}
                />
              )
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};


export default OfflineModemsScreen;

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
  subtitle: {
    fontSize: 14,
    color: COLORS.primaryFontColor,
    fontFamily: 'Manrope-Regular',
    marginBottom: 4,
  },
  title: {
    fontSize: 24,
    color: COLORS.primaryFontColor,
    fontFamily: 'Manrope-Bold',
  },
});
