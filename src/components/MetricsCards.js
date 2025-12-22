import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, spacing } from '../styles/theme';
import CommunicatingModemsIcon from '../../assets/icons/communicating.svg';
import NonCommunicatingModemsIcon from '../../assets/icons/noncommicating.svg';
import TotalVisitsIcon from '../../assets/icons/totaltasks.svg';
import ResolvedVisitsIcon from '../../assets/icons/completedtasks.svg';

const MetricsCards = ({ loading, metrics }) => {
  const metricsData = [
    {
      title: 'Communicating Modems',
      value: metrics.communicatingModems,
      icon: CommunicatingModemsIcon,
    },
    {
      title: 'Offline Modems',
      value: metrics.nonCommunicatingModems,
      icon: NonCommunicatingModemsIcon,
    },
    {
      title: 'Total Visits',
      value: metrics.totalTasksToday,
      icon: TotalVisitsIcon,
    },
    {
      title: 'Resolved',
      value: metrics.completedTasksToday,
      icon: ResolvedVisitsIcon,
    },
  ];

  return (
    <View style={styles.metricsRow}>
      {metricsData.map((metric, index) => {
        const IconComponent = metric.icon;
        return (
          <TouchableOpacity
            key={index}
            style={styles.metricCard}
            activeOpacity={0.7}
          >
            <View style={styles.textContainer}>
              <Text style={styles.metricTitle}>{metric.title}</Text>
              <Text style={styles.metricValue}>
                {loading ? '...' : metric.value}
              </Text>
            </View>
            <View style={styles.metricIconContainer}>
              <IconComponent width={21} height={21} />
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  metricsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  metricCard: {
    backgroundColor: '#fff',
    borderRadius: 5,
    paddingVertical: 10,
    paddingHorizontal: 10,
    width: '48%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    height: 100,
    marginBottom: 10,
  },
  textContainer: {
    width: 120,
    alignItems: 'flex-start',
    height: '100%',
    justifyContent: 'space-between',
  },
  metricValue: {
    fontSize: 20,
    color: colors.secondary,
    fontFamily: 'Manrope-Bold',
  },
  metricTitle: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'Manrope-Regular',
  },
  metricIconContainer: {
    width: 34,
    height: 34,
    borderRadius: 19,
    backgroundColor: colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default MetricsCards;
