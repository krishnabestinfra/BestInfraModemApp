import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Logo from '../components/global/Logo';
import RippleLogo from '../components/global/RippleLogo';
import Button from '../components/global/Button';
import ModemStatusCard from '../components/ModemStatusCard';
import { colors, spacing, borderRadius, typography } from '../styles/theme';
import { modemErrors } from '../data/dummyData';
import Menu from '../../assets/icons/bars.svg';
import NotificationLight from '../../assets/icons/notification.svg';

const fallbackDetails = {
  drtSlNo: '2345',
  feederNo: '123456783',
  feederName: 'Tadepalligudem - Rural',
  substationNo: '1234533423',
  substationName: 'Tadepalligudem - Rural',
  section: 'Tadepalligudem',
  subDivision: 'Tadepalligudem',
  division: 'Tadepalligudem',
  circle: 'Tadepalligudem - Rural',
  organisation: 'NPDCL',
};

const statusMetaMap = {
  warning: { label: 'Warning', color: '#F57C00', bg: '#FFF3E0' },
  disconnected: { label: 'Non-Communicating', color: '#C62828', bg: '#FFE9E9' },
  default: { label: 'Active', color: colors.secondary, bg: '#E6F7EE' },
};

const ModemDetailsScreen = ({ route, navigation }) => {
  const modem = route?.params?.modem ?? {
    modemId: 'MDM000',
    status: 'warning',
    error: 'Unknown',
    reason: '—',
    location: '—',
    date: new Date().toISOString(),
    signalStrength: '—',
  };

  const statusMeta =
    statusMetaMap[modem.status] ??
    (modem.status?.toLowerCase?.() === 'non-communicating'
      ? statusMetaMap.disconnected
      : statusMetaMap.default);

  const detailFields = useMemo(() => {
    const merged = {
      ...fallbackDetails,
      ...modem.details,
    };

    return [
      { label: 'DRT SL No.', value: merged.drtSlNo },
      { label: 'Feeder Name', value: merged.feederName },
      { label: 'Feeder No.', value: merged.feederNo },
      { label: 'Substation Name', value: merged.substationName },
      { label: 'Substation No.', value: merged.substationNo },
      { label: 'Section', value: merged.section },
      { label: 'Sub Division', value: merged.subDivision },
      { label: 'Division', value: merged.division },
      { label: 'Circle', value: merged.circle },
      { label: 'Organisation', value: merged.organisation },
    ];
  }, [modem.details]);

  const relatedIssues = useMemo(
    () => modemErrors.filter((item) => item.modemId === modem.modemId),
    [modem.modemId]
  );

  const handleResolve = () => {
    navigation?.navigate?.('Troubleshoot', { modem, status: statusMeta.label });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <LinearGradient
          colors={['#f4fbf7', '#e6f4ed']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroCard}
        >


          <View style={styles.heroTopRow}>
            <TouchableOpacity style={styles.barsIcon} onPress={() => navigation?.goBack?.()}>
              <Menu width={18} height={18} fill="#202d59" />
            </TouchableOpacity>

            <View style={styles.logoWrapper}>
              <RippleLogo size={68} />
            </View>

            <TouchableOpacity
              style={styles.bellIcon}
              onPress={() => navigation?.navigate?.('Profile')}
            >
              <NotificationLight width={18} height={18} fill="#202d59" />
            </TouchableOpacity>
          </View>

          <ModemStatusCard
            modemId={modem.modemId}
            statusLabel={statusMeta.label}
            statusColor={statusMeta.color}
            statusBackground={statusMeta.bg}
            style={styles.heroStatusCard}
          />
        </LinearGradient>

        <View style={styles.detailCard}>
          <DetailGrid fields={detailFields} />
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Issue History</Text>
          <Text style={styles.sectionCount}>{relatedIssues.length} entries</Text>
        </View>

        <View style={styles.issuesWrapper}>
          {relatedIssues.length === 0 ? (
            <Text style={styles.emptyIssuesText}>No issues logged for this modem.</Text>
          ) : (
            relatedIssues.map((issue) => <IssueCard key={issue.id} issue={issue} />)
          )}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button title="Resolve Issue" onPress={handleResolve} style={styles.resolveButton} />
      </View>
    </SafeAreaView>
  );
};

const DetailGrid = ({ fields }) => (
  <View style={styles.detailGrid}>
    {fields.map((field) => (
      <View key={field.label} style={styles.detailItem}>
        <Text style={styles.detailLabel}>{field.label}</Text>
        <Text style={styles.detailValue}>{field.value ?? '—'}</Text>
      </View>
    ))}
  </View>
);

const IssueCard = ({ issue }) => {
  const statusMeta = statusMetaMap[issue.status] ?? statusMetaMap.default;

  return (
    <View style={styles.issueCard}>
      <View style={styles.issueHeader}>
        <View>
          <Text style={styles.issueId}>{issue.modemId}</Text>
          <View style={[styles.issueBadge, { backgroundColor: statusMeta.bg }]}>
            <View style={[styles.statusDot, { backgroundColor: statusMeta.color }]} />
            <Text style={[styles.issueBadgeText, { color: statusMeta.color }]}>
              {statusMeta.label}
            </Text>
          </View>
        </View>

        <TouchableOpacity style={styles.directionButton}>
          <Text style={styles.directionText}>Get Direction</Text>
          <Ionicons name="navigate-outline" size={14} color="#fff" style={{ marginLeft: 4 }} />
        </TouchableOpacity>
      </View>

      <View style={styles.issueRow}>
        <View style={styles.issueInfoBlock}>
          <Text style={styles.issueLabel}>Error</Text>
          <Text style={styles.issueHighlight}>{issue.error}</Text>
        </View>
        <View style={styles.issueInfoBlock}>
          <Text style={styles.issueLabel}>Meter Type</Text>
          <Text style={styles.issueValue}>Smart</Text>
        </View>
      </View>

      <View style={styles.issueRow}>
        <View style={styles.issueInfoBlock}>
          <Text style={styles.issueLabel}>Location</Text>
          <Text style={styles.issueValue}>{issue.location}</Text>
        </View>
        <View style={styles.issueInfoBlock}>
          <Text style={styles.issueLabel}>Issue Occurrence</Text>
          <Text style={styles.issueValue}>{issue.date}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.xxl,
  },
  heroCard: {
    overflow: 'hidden',
  },
  heroOverlayCircleLarge: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
    borderWidth: 1,
    borderColor: '#d6e8dc',
    top: -80,
    right: -80,
  },
  heroOverlayCircleSmall: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 1,
    borderColor: '#d6e8dc',
    top: 10,
    right: 20,
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 5,
    paddingHorizontal: 15,
  },
  logoWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  iconChip: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.lg,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
  },
  barsIcon: {
    backgroundColor: '#ffffff',
    width: 54,
    height: 54,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 1,
    zIndex: 2,
  },
  bellIcon: {
    backgroundColor: '#ffffff',
    width: 54,
    height: 54,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 1,
    zIndex: 2,
  },
  heroContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: spacing.xs,
  },
  detailCard: {
    backgroundColor: colors.cardBackground,
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
  },
  detailGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  detailItem: {
    width: '48%',
    marginBottom: spacing.md,
  },
  detailLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  detailValue: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: spacing.md,
    marginTop: spacing.lg,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  sectionCount: {
    ...typography.small,
    color: colors.textSecondary,
  },
  issuesWrapper: {
    marginTop: spacing.md,
    paddingHorizontal: spacing.md,
    gap: spacing.md,
  },
  emptyIssuesText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginVertical: spacing.lg,
  },
  issueCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    elevation: 3,
    marginBottom: spacing.md,
  },
  issueHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  issueId: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  issueBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.round,
    marginTop: spacing.xs,
    gap: 4,
  },
  issueBadgeText: {
    ...typography.small,
    fontWeight: '600',
  },
  directionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.secondary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.round,
  },
  directionText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 13,
  },
  issueRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  issueInfoBlock: {
    flex: 1,
    marginRight: spacing.sm,
  },
  issueLabel: {
    ...typography.small,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  issueValue: {
    ...typography.body,
    color: colors.textPrimary,
  },
  issueHighlight: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '700',
  },
  footer: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.lg,
    paddingTop: spacing.sm,
    backgroundColor: colors.background,
  },
  resolveButton: {
    borderRadius: borderRadius.round,
  },
});

export default ModemDetailsScreen;
