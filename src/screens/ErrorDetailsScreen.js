import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ErrorRow from '../components/ErrorRow';
import { modemErrors } from '../data/dummyData';
import { colors, spacing, borderRadius, typography, shadows } from '../styles/theme';

const ErrorDetailsScreen = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('non-communicating'); // 'resolved'
  const [searchQuery, setSearchQuery] = useState('');

  // Show all modems on both tabs (same cards)
  const allModems = modemErrors;

  // Filter by search only
  const filteredErrors = allModems.filter(error =>
    error.modemId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    error.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleErrorPress = (error) => {
    // Navigate to ModemDetails for both tabs, but pass tab info
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
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Modems</Text>
        <View style={styles.placeholder} />
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
        contentContainerStyle={styles.listContainer}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    backgroundColor: colors.cardBackground,
    ...shadows.small,
  },
  backButton: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '600',
  },
  title: {
    ...typography.h2,
    color: colors.textPrimary,
  },
  placeholder: {
    width: 50,
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
