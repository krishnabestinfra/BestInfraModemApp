import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, spacing, borderRadius, typography, shadows } from '../styles/theme';

const ErrorRow = ({ item, onPress }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'connected':
        return colors.connected;
      case 'disconnected':
        return colors.disconnected;
      case 'warning':
        return colors.warning;
      default:
        return colors.textLight;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'connected':
        return '🟢';
      case 'disconnected':
        return '🔴';
      case 'warning':
        return '🟡';
      default:
        return '⚪';
    }
  };

  const getErrorIcon = (error) => {
    switch (error) {
      case 'Low Signal':
        return '📶';
      case 'No SIM':
        return '📱';
      case 'Timeout':
        return '⏱️';
      case 'Wire Damage':
        return '🔌';
      default:
        return '❓';
    }
  };

  const getSignalStrengthColor = (strength) => {
    if (strength >= 12) return colors.connected;
    if (strength >= 8) return colors.warning;
    return colors.disconnected;
  };

  return (
    <TouchableOpacity style={[styles.container, shadows.small]} onPress={() => onPress(item)}>
      <View style={styles.header}>
        <View style={styles.modemInfo}>
          <View style={styles.modemHeader}>
            <Text style={styles.modemId}>{item.modemId}</Text>
            <View style={styles.statusContainer}>
              <Text style={styles.statusIcon}>{getStatusIcon(item.status)}</Text>
              <Text style={[styles.status, { color: getStatusColor(item.status) }]}>
                {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
              </Text>
            </View>
          </View>
          <View style={styles.errorInfo}>
            <Text style={styles.errorIcon}>{getErrorIcon(item.error)}</Text>
            <Text style={styles.errorText}>{item.error}</Text>
          </View>
        </View>
        <View style={styles.signalContainer}>
          <Text style={styles.signalLabel}>Signal</Text>
          <Text style={[styles.signalStrength, { color: getSignalStrengthColor(item.signalStrength) }]}>
            {item.signalStrength}
          </Text>
        </View>
      </View>
      
      <View style={styles.details}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>📍 Location</Text>
          <Text style={styles.detailValue}>{item.location}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>🕒 Date</Text>
          <Text style={styles.detailValue}>{item.date}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>💡 Reason</Text>
          <Text style={styles.detailValue}>{item.reason}</Text>
        </View>
      </View>
    </TouchableOpacity>
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
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  modemInfo: {
    flex: 1,
  },
  modemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  modemId: {
    ...typography.h3,
    color: colors.textPrimary,
    fontWeight: 'bold',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIcon: {
    fontSize: 16,
    marginRight: spacing.xs,
  },
  status: {
    ...typography.caption,
    fontWeight: '600',
  },
  errorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  errorIcon: {
    fontSize: 18,
    marginRight: spacing.sm,
  },
  errorText: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  signalContainer: {
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    minWidth: 60,
  },
  signalLabel: {
    ...typography.small,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  signalStrength: {
    ...typography.h3,
    fontWeight: 'bold',
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
    flex: 1,
    textAlign: 'right',
  },
});

export default ErrorRow; 