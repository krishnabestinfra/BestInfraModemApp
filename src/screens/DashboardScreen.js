import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Share, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import SummaryCard from '../components/SummaryCard';
import ErrorChart from '../components/ErrorChart';
import DashboardHeaderSection from '../components/DashboardHeaderSection';
import ModemStatus from '../components/ModemStatus';
import { modemStats, errorChartData, modemErrors, alerts } from '../data/dummyData';
import { colors, spacing, borderRadius, typography, shadows } from '../styles/theme';
import LogoutIcon from '../../assets/icons/logout.svg';

const DashboardScreen = ({ navigation, onLogout }) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const handleExportData = () => {
    try {
      // Create CSV data for export
      const csvData = createCSVData();

      // Share the data (on mobile this will show share options)
      Share.share({
        message: `Modem Diagnostics Report\n\n${csvData}`,
        title: 'Modem Diagnostics Export',
      });

      Alert.alert(
        'Export Successful',
        'Data has been prepared for export. Use the share options to save as Excel or CSV.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      Alert.alert('Export Failed', 'Unable to export data. Please try again.');
    }
  };

  const createCSVData = () => {
    const headers = 'Modem ID,Status,Error,Reason,Location,Date,Signal Strength\n';
    const errorRows = modemErrors.map(error =>
      `${error.modemId},${error.status},${error.error},${error.reason},${error.location},${error.date},${error.signalStrength}`
    ).join('\n');

    const alertHeaders = '\n\nAlerts\nAlert ID,Modem ID,Type,Severity,Location,Date\n';
    const alertRows = alerts.map(alert =>
      `${alert.id},${alert.modemId},${alert.type},${alert.severity},${alert.location},${alert.date}`
    ).join('\n');

    const summary = `\n\nSummary\nConnected Modems,${modemStats.connected}\nDisconnected Modems,${modemStats.disconnected}\nTotal Issues,${modemStats.totalIssues}\nMost Common Error,${modemStats.mostCommon.label} (${modemStats.mostCommon.count})`;

    return headers + errorRows + alertHeaders + alertRows + summary;
  };

  const handleDownloadLogs = () => {
    try {
      // Create log data
      const logData = createLogData();

      // Share the log data
      Share.share({
        message: `Modem Diagnostics Logs\n\n${logData}`,
        title: 'Modem Diagnostics Logs',
      });

      Alert.alert(
        'Logs Ready',
        'System logs have been prepared. Use the share options to save the log file.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      Alert.alert('Download Failed', 'Unable to download logs. Please try again.');
    }
  };

  const createLogData = () => {
    const timestamp = new Date().toISOString();
    const logHeader = `=== MODEM DIAGNOSTICS SYSTEM LOG ===\nGenerated: ${timestamp}\n\n`;

    const systemLogs = [
      'INFO: System initialized successfully',
      'INFO: Connected to modem network',
      'WARN: 5 modems showing connectivity issues',
      'ERROR: MDM002 - SIM card removed',
      'ERROR: MDM004 - Physical wire damage detected',
      'INFO: Alert system active',
      'INFO: Data collection completed',
    ].join('\n');

    const errorLogs = modemErrors.map(error =>
      `ERROR: ${error.modemId} - ${error.error} at ${error.location} (${error.date})`
    ).join('\n');

    const alertLogs = alerts.map(alert =>
      `ALERT: ${alert.severity.toUpperCase()} - ${alert.type} for ${alert.modemId} at ${alert.location}`
    ).join('\n');

    return logHeader + systemLogs + '\n\n=== ERROR LOGS ===\n' + errorLogs + '\n\n=== ALERT LOGS ===\n' + alertLogs;
  };

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);

    // Simulate refresh delay
    setTimeout(() => {
      setLastRefresh(new Date());
      setIsRefreshing(false);

      Alert.alert(
        'Refresh Complete',
        `Dashboard updated at ${new Date().toLocaleTimeString()}`,
        [{ text: 'OK' }]
      );
    }, 1500);
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        <DashboardHeaderSection navigation={navigation} onLogout={onLogout} />

        {/* <View style={styles.whiteContainer}>
          <View
            style={{
              display: "flex",
              justifyContent: "space-between",
              flexDirection: "row",
            }}
          >
            <Text style={styles.energyText}>Modem Summary</Text>
            <View style={{ display: "flex", flexDirection: "row" }}>
              <TouchableOpacity onPress={() => { }}>
                <Text style={styles.monthlyText}>Daily</Text>
              </TouchableOpacity>
              <Text> / </Text>
              <TouchableOpacity onPress={() => { }}>
                <Text style={styles.dailyText}>Monthly</Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.graphsContainer}>
            <Text style={styles.thismonthText}>
              Today's Status: <Text style={styles.kwhText}>25 Connected</Text>
            </Text>
            <View
              style={{
                display: "flex",
                flexDirection: "row",
                marginTop: 10,
              }}
            >
              <View style={styles.tenPercentageTextContainer}>
                <Text style={styles.percentText}>5%</Text>
                <Text style={styles.arrowText}>↑</Text>
              </View>
              <Text style={styles.lastText}>Yesterday.</Text>
            </View>
            <View>
              <ErrorChart data={errorChartData} />
            </View>
          </View>
        </View> */}

        <View style={styles.summaryContainer}>
          <SummaryCard
            label="Connected Modems"
            value={modemStats.connected.toString()}
            icon="📶"
            color={colors.connected}
            // trend={5}
          />
          <SummaryCard
            label="Disconnected Modems"
            value={modemStats.disconnected.toString()}
            icon="🔌"
            color={colors.disconnected}
            onPress={() => navigation.navigate('ErrorDetails')}
            // trend={-2}
          />
        </View>

        {/* <View style={styles.summaryContainer}>
          <SummaryCard
            label="Total Issues"
            value={modemStats.totalIssues.toString()}
            icon="⚠️"
            color={colors.warning}
            onPress={() => navigation.navigate('Alerts')}
            // trend={-1}
          />
          <SummaryCard
            label="Most Common Error"
            value={`${modemStats.mostCommon.label} (${modemStats.mostCommon.count})`}
            icon="📊"
            color={colors.info}
          />
        </View> */}

        <ModemStatus />

        {/* <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={() => navigation.navigate('ErrorDetails')}
          >
            <Text style={styles.buttonText}>View Error Details</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={() => navigation.navigate('Alerts')}
          >
            <Text style={[styles.buttonText, { color: colors.primary }]}>View Alerts</Text>
          </TouchableOpacity>
        </View> */}

        {/* <View style={styles.quickActions}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.quickAction} onPress={handleExportData}>
              <Text style={styles.quickActionIcon}>📊</Text>
              <Text style={styles.quickActionText}>Export Data</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickAction} onPress={handleDownloadLogs}>
              <Text style={styles.quickActionIcon}>📱</Text>
              <Text style={styles.quickActionText}>Download Logs</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.quickAction, isRefreshing && styles.quickActionDisabled]}
              onPress={handleRefresh}
              disabled={isRefreshing}
            >
              <Text style={[styles.quickActionIcon, isRefreshing && styles.quickActionIconDisabled]}>
                {isRefreshing ? '⏳' : '🔄'}
              </Text>
              <Text style={[styles.quickActionText, isRefreshing && styles.quickActionTextDisabled]}>
                {isRefreshing ? 'Refreshing...' : 'Refresh'}
              </Text>
            </TouchableOpacity>
          </View>
        </View> */}
      </ScrollView>

      {/* Floating Logout Button
      <View style={styles.logoutContainer}>
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={onLogout}
          activeOpacity={0.8}
        >
          <View style={styles.logoutIconContainer}>
            <LogoutIcon width={18} height={18} fill="#fff" />
          </View>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View> */}
    </SafeAreaView>
  );
};

export default DashboardScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  whiteContainer: {
    padding: 20,
  },
  energyText: {
    color: colors.textPrimary,
    fontSize: 14,
    fontFamily: "Manrope-Bold",
  },
  dailyText: {
    color: colors.textPrimary,
    fontSize: 12,
    fontFamily: "Manrope-Regular",
  },
  monthlyText: {
    color: colors.secondary,
    fontSize: 12,
    fontFamily: "Manrope-Bold",
  },
  separator: {
    color: colors.textPrimary,
    fontSize: 12,
    fontFamily: "Manrope-Regular",
    marginHorizontal: 5,
  },
  toggleButton: {
    minHeight: 30,
    paddingHorizontal: 8,
  },
  graphsContainer: {
    backgroundColor: "#eef8f0",
    paddingHorizontal: 15,
    paddingTop: 15,
    marginTop: 10,
    borderRadius: 5,
    paddingBottom: 5,
  },
  thismonthText: {
    color: colors.textPrimary,
    fontSize: 14,
    fontFamily: "Manrope-Regular",
  },
  kwhText: {
    color: colors.secondary,
    fontSize: 14,
    fontFamily: "Manrope-Bold",
  },
  tenPercentageTextContainer: {
    backgroundColor: colors.secondary,
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    width: 60,
    borderRadius: 20,
    height: 19,
  },
  percentText: {
    color: colors.cardBackground,
    fontSize: 12,
    fontFamily: "Manrope-SemiBold",
    marginRight: 5,
  },
  arrowText: {
    color: colors.cardBackground,
    fontSize: 12,
    fontFamily: "Manrope-SemiBold",
  },
  lastText: {
    color: colors.textPrimary,
    fontSize: 12,
    fontFamily: "Manrope-Regular",
    marginLeft: 10,
  },
  summaryContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.sm,
    marginBottom: spacing.sm,
  },
  actionButtons: {
    padding: spacing.md,
  },
  button: {
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
    alignItems: 'center',
    ...shadows.small,
  },
  primaryButton: {
    backgroundColor: colors.primary,
  },
  secondaryButton: {
    backgroundColor: colors.cardBackground,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  buttonText: {
    ...typography.body,
    color: colors.cardBackground,
    fontWeight: '600',
  },
  quickActions: {
    padding: spacing.md,
    backgroundColor: colors.cardBackground,
    margin: spacing.md,
    borderRadius: borderRadius.lg,
    ...shadows.medium,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  quickAction: {
    alignItems: 'center',
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    minWidth: 80,
  },
  quickActionDisabled: {
    opacity: 0.5,
  },
  quickActionIcon: {
    fontSize: 24,
    marginBottom: spacing.xs,
  },
  quickActionIconDisabled: {
    opacity: 0.5,
  },
  quickActionText: {
    ...typography.small,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  quickActionTextDisabled: {
    opacity: 0.5,
  },
  logoutContainer: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    zIndex: 1000,
  },
  logoutButton: {
    backgroundColor: colors.primary,
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  logoutIconContainer: {
    marginRight: 8,
  },
  logoutText: {
    color: colors.cardBackground,
    fontSize: 14,
    fontFamily: 'Manrope-SemiBold',
    fontWeight: '600',
  },
}); 