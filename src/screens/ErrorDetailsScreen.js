import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import AppHeader from '../components/global/AppHeader';
import ErrorRow from '../components/ErrorRow';
import { modemErrors } from '../data/dummyData';
import { colors, spacing, borderRadius, typography, shadows } from '../styles/theme';
import { COLORS } from '../constants/colors';

const ErrorDetailsScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState('non-communicating'); // 'resolved'
  const [searchQuery, setSearchQuery] = useState('');

  const allModems = modemErrors;

  const filteredErrors = allModems.filter(error =>
    error.modemId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    error.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          placeholder="Search modems..."
          placeholderTextColor={colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={styles.searchInput}
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
  searchContainer: {
    backgroundColor: colors.cardBackground,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    ...shadows.small,
  },
  searchInput: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.round,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: 14,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: colors.border,
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
});

export default ErrorDetailsScreen;
