import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { colors, spacing, borderRadius, typography, shadows } from '../styles/theme';

const { width } = Dimensions.get('window');

const ErrorChart = ({ data }) => {
  const total = data.reduce((sum, item) => sum + item.count, 0);
  
  const renderBar = (item, index) => {
    const percentage = total > 0 ? (item.count / total) * 100 : 0;
    const barWidth = percentage;
    
    return (
      <View key={index} style={styles.barContainer}>
        <View style={styles.barInfo}>
          <View style={[styles.colorDot, { backgroundColor: item.color }]} />
          <Text style={styles.barLabel}>{item.label}</Text>
          <View style={styles.barStats}>
            <Text style={styles.barCount}>{item.count}</Text>
            <Text style={styles.barPercentage}>({percentage.toFixed(1)}%)</Text>
          </View>
        </View>
        <View style={styles.barTrack}>
          <View 
            style={[
              styles.barFill, 
              { 
                width: `${barWidth}%`,
                backgroundColor: item.color 
              }
            ]} 
          />
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, shadows.medium]}>
      <View style={styles.header}>
        <Text style={styles.title}>Error Distribution</Text>
        <View style={styles.totalContainer}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>{total}</Text>
        </View>
      </View>
      
      <View style={styles.chartContainer}>
        {data.map((item, index) => renderBar(item, index))}
      </View>
      
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Data updated: {new Date().toLocaleDateString()}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    margin: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.h3,
    color: colors.textPrimary,
    fontWeight: 'bold',
  },
  totalContainer: {
    alignItems: 'center',
  },
  totalLabel: {
    ...typography.small,
    color: colors.textSecondary,
  },
  totalValue: {
    ...typography.h2,
    color: colors.primary,
    fontWeight: 'bold',
  },
  chartContainer: {
    marginBottom: spacing.md,
  },
  barContainer: {
    marginBottom: spacing.md,
  },
  barInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  colorDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: spacing.md,
  },
  barLabel: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: '600',
    flex: 1,
  },
  barStats: {
    alignItems: 'flex-end',
  },
  barCount: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: 'bold',
  },
  barPercentage: {
    ...typography.small,
    color: colors.textSecondary,
  },
  barTrack: {
    height: 12,
    backgroundColor: colors.background,
    borderRadius: 6,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 6,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.md,
    alignItems: 'center',
  },
  footerText: {
    ...typography.small,
    color: colors.textLight,
  },
});

export default ErrorChart; 