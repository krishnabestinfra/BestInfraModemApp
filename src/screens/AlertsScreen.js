import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import AppHeader from '../components/global/AppHeader';
import AlertCard from '../components/AlertCard';
import SummaryCard from '../components/SummaryCard';
import { alerts } from '../data/dummyData';
import { colors, spacing, borderRadius, typography, shadows } from '../styles/theme';
import { COLORS } from '../constants/colors';

const AlertsScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [selectedSeverity, setSelectedSeverity] = useState('All');

  const severityOptions = ['All', 'High', 'Medium', 'Low'];

  const filteredAlerts = alerts.filter(alert => {
    if (selectedSeverity === 'All') return true;
    return alert.severity === selectedSeverity.toLowerCase();
  });

  const getSeverityCount = (severity) => {
    if (severity === 'All') return alerts.length;
    return alerts.filter(alert => alert.severity === severity.toLowerCase()).length;
  };

  const renderSeverityFilter = (severity) => (
    <TouchableOpacity
      key={severity}
      style={[styles.severityButton, selectedSeverity === severity && styles.severityButtonActive]}
      onPress={() => setSelectedSeverity(severity)}
    >
      <Text style={[styles.severityButtonText, selectedSeverity === severity && styles.severityButtonTextActive]}>
        {severity}
      </Text>
      <View style={styles.severityCount}>
        <Text style={[styles.severityCountText, selectedSeverity === severity && styles.severityCountTextActive]}>
          {getSeverityCount(severity)}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={[]}>
      <StatusBar style="dark" />
      <AppHeader navigation={navigation} />
      <View style={styles.titleContainer}>
        <Text style={styles.title}>Alerts</Text>
      </View>

      <View style={styles.statsContainer}>
        <SummaryCard
          label="Total Alerts"
          value={alerts.length}
          color={colors.primary}
        />
        <SummaryCard
          label="High Priority"
          value={alerts.filter(alert => alert.severity === 'high').length}
          color={colors.error}
        />
        <SummaryCard
          label="Medium Priority"
          value={alerts.filter(alert => alert.severity === 'medium').length}
          color={colors.warning}
        />
      </View>

      <View style={styles.filtersContainer}>
        <Text style={styles.filterTitle}>Filter by Severity</Text>
        <View style={styles.severityFilters}>
          {severityOptions.map(severity => renderSeverityFilter(severity))}
        </View>
      </View>

      <View style={styles.resultsHeader}>
        <Text style={styles.resultsCount}>
          {filteredAlerts.length} alert{filteredAlerts.length !== 1 ? 's' : ''} found
        </Text>
      </View>

      <FlatList
        data={filteredAlerts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <AlertCard alert={item} />}
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
  statsContainer: {
    flexDirection: 'row',
    padding: spacing.md,
    backgroundColor: colors.cardBackground,
    marginBottom: spacing.sm,
    ...shadows.small,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: spacing.sm,
  },
  statNumber: {
    ...typography.h1,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  statLabel: {
    ...typography.small,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  filtersContainer: {
    backgroundColor: colors.cardBackground,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...shadows.small,
  },
  filterTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  severityFilters: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  severityButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.round,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  severityButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  severityButtonText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '500',
    marginRight: spacing.xs,
  },
  severityButtonTextActive: {
    color: colors.cardBackground,
  },
  severityCount: {
    backgroundColor: colors.textLight,
    borderRadius: borderRadius.round,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
  },
  severityCountText: {
    ...typography.small,
    color: colors.cardBackground,
    fontWeight: 'bold',
  },
  severityCountTextActive: {
    color: colors.primary,
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

export default AlertsScreen; 