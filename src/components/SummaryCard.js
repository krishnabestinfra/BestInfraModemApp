import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, spacing, borderRadius, typography, shadows } from '../styles/theme';

const SummaryCard = ({ label, value, icon, color = colors.primary, trend = null, onPress }) => {
  return (
    <TouchableOpacity style={[styles.card, shadows.medium]} onPress={onPress}>
      <View style={styles.header}>
        <View style={[styles.iconContainer, { backgroundColor: color + '15' }]}>
          <Text style={[styles.icon, { color }]}>{icon}</Text>
        </View>
        {trend && (
          <View style={[styles.trendContainer, { backgroundColor: trend > 0 ? colors.success + '15' : colors.error + '15' }]}>
            <Text style={[styles.trendText, { color: trend > 0 ? colors.success : colors.error }]}>
              {trend > 0 ? '+' : ''}{trend}%
            </Text>
          </View>
        )}
      </View>
      
      <View style={styles.content}>
        <Text style={styles.value}>{value}</Text>
        <Text style={styles.label}>{label}</Text>
      </View>
      
      <View style={[styles.accentBar, { backgroundColor: color }]} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginHorizontal: spacing.xs,
    marginVertical: spacing.xs,
    flex: 1,
    minHeight: 120,
    position: 'relative',
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  trendContainer: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  trendText: {
    ...typography.small,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  value: {
    ...typography.h1,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
    fontWeight: 'bold',
  },
  label: {
    ...typography.caption,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  accentBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
  },
});

export default SummaryCard; 