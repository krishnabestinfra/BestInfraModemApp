import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, borderRadius, typography, shadows } from '../styles/theme';
import { formatDisplayDateTime } from '../utils/dateUtils';

const AlertCard = ({ alert }) => {
  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high':
        return colors.error;
      case 'medium':
        return colors.warning;
      case 'low':
        return colors.info;
      default:
        return colors.textLight;
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'high':
        return '🚨';
      case 'medium':
        return '⚠️';
      case 'low':
        return 'ℹ️';
      default:
        return '📢';
    }
  };

  const getAlertTypeIcon = (type) => {
    if (type.includes('Signal')) return '📶';
    if (type.includes('SIM')) return '📱';
    if (type.includes('Connection')) return '🔌';
    if (type.includes('Timeout')) return '⏱️';
    return '📢';
  };

  return (
    <View style={[styles.container, shadows.medium]}>
      <View style={styles.header}>
        <View style={styles.severityContainer}>
          <Text style={styles.severityIcon}>{getSeverityIcon(alert.severity)}</Text>
          <View style={[styles.severityIndicator, { backgroundColor: getSeverityColor(alert.severity) }]} />
        </View>
        <View style={styles.alertInfo}>
          <View style={styles.alertHeader}>
            <Text style={styles.alertTypeIcon}>{getAlertTypeIcon(alert.type)}</Text>
            <Text style={styles.alertType}>{alert.type}</Text>
          </View>
          <Text style={styles.modemId}>Modem: {alert.modemId}</Text>
        </View>
        <View style={styles.timeContainer}>
          <Text style={styles.timeLabel}>Time</Text>
          <Text style={styles.timeValue}>
            {formatDisplayDateTime(alert.date).split(' ').slice(-2).join(' ')}
          </Text>
        </View>
      </View>
      
      <View style={styles.details}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>📍 Location</Text>
          <Text style={styles.detailValue}>{alert.location}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>📅 Date</Text>
          <Text style={styles.detailValue}>
            {formatDisplayDateTime(alert.date).split(',').slice(0, 2).join(',')}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>⚡ Severity</Text>
          <Text style={[styles.severity, { color: getSeverityColor(alert.severity) }]}>
            {alert.severity.charAt(0).toUpperCase() + alert.severity.slice(1)}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginHorizontal: spacing.md,
    marginVertical: spacing.xs,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  severityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  severityIcon: {
    fontSize: 24,
    marginRight: spacing.xs,
  },
  severityIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  alertInfo: {
    flex: 1,
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  alertTypeIcon: {
    fontSize: 18,
    marginRight: spacing.sm,
  },
  alertType: {
    ...typography.h3,
    color: colors.textPrimary,
    fontWeight: 'bold',
  },
  modemId: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  timeContainer: {
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    minWidth: 60,
  },
  timeLabel: {
    ...typography.small,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  timeValue: {
    ...typography.caption,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  details: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  detailLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  detailValue: {
    ...typography.caption,
    color: colors.textPrimary,
  },
  severity: {
    ...typography.caption,
    fontWeight: 'bold',
  },
});

export default AlertCard; 