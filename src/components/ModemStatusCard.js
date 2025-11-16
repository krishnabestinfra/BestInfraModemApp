import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import MeterFireIcon from '../../assets/icons/meter-fire 1.svg';
import { colors, spacing, borderRadius, typography } from '../styles/theme';

const ModemStatusCard = ({
  modemId = 'MDM000',
  statusLabel = 'Active',
  statusColor = colors.secondary,
  statusBackground = '#fff',
  cardColor = colors.secondary,
  style,
}) => {
  return (
    <View style={[styles.card, { backgroundColor: cardColor }, style]}>
      <View style={styles.left}>
        <View style={styles.iconCircle}>
          <MeterFireIcon width={30} height={30} />
        </View>
        <View style={styles.details}>
          <Text style={styles.label}>Modem No</Text>
          <Text style={styles.value}>{modemId}</Text>
        </View>
      </View>
      <View style={[styles.badge, { backgroundColor: statusBackground }]}>
        <View style={[styles.dot, { backgroundColor: statusColor }]} />
        <Text style={[styles.badgeText, { color: '#6E6E6E' }]}>{statusLabel}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: borderRadius.xs,
    paddingVertical: spacing.md,
    paddingRight: spacing.ms,
    paddingLeft: spacing.ml,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconCircle: {
    width: 30,
    height: 30,
  },
  details: {
    marginLeft: spacing.md,
  },
  label: {
...typography.caption,
    fontFamily: 'Manrope',
    fontWeight: '500',
    fontSize: 12,
    lineHeight: 12,
    letterSpacing: 0,
    color: '#fff',
  },
  value: {
    ...typography.body,
    color: '#fff',
    fontWeight: '800',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.ms,
    paddingVertical: spacing.xsm,
    borderRadius: borderRadius.sm,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: spacing.xs,
  },
  badgeText: {
    ...typography.small,
    fontWeight: '600',
    fontSize: 10,
  },
});

export default ModemStatusCard;

