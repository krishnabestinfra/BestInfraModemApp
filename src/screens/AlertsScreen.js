import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AlertCard from '../components/AlertCard';
import { alerts } from '../data/dummyData';
import { colors, spacing, borderRadius, typography, shadows } from '../styles/theme';

const AlertsScreen = ({ navigation }) => {
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
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Alerts</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{alerts.length}</Text>
          <Text style={styles.statLabel}>Total Alerts</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statNumber, { color: colors.error }]}>
            {alerts.filter(alert => alert.severity === 'high').length}
          </Text>
          <Text style={styles.statLabel}>High Priority</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statNumber, { color: colors.warning }]}>
            {alerts.filter(alert => alert.severity === 'medium').length}
          </Text>
          <Text style={styles.statLabel}>Medium Priority</Text>
        </View>
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