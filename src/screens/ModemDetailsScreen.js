import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Logo from '../components/global/Logo';
import RippleLogo from '../components/global/RippleLogo';
import Button from '../components/global/Button';
import ModemStatusCard from '../components/ModemStatusCard';
import { colors, spacing, borderRadius, typography } from '../styles/theme';
import { COLORS } from '../constants/colors';
import { modemErrors } from '../data/dummyData';
import Menu from '../../assets/icons/bars.svg';
import MenuIcon from '../../assets/icons/bars.svg';
import NotificationLight from '../../assets/icons/notification.svg';
import NotificationIcon from '../../assets/icons/notificationDark.svg';
import DashboardIcon from '../../assets/icons/dashboardMenu.svg';
import ActiveDashboard from '../../assets/icons/activeDashboard.svg';
import UsageIcon from '../../assets/icons/usageMenu.svg';
import ActiveUsage from '../../assets/icons/activeUsage.svg';
import PaymentsIcon from '../../assets/icons/paymentsMenu.svg';
import ActivePayments from '../../assets/icons/activePayments.svg';
import TransactionsIcon from '../../assets/icons/transactionMenu.svg';
import ActiveTransactions from '../../assets/icons/transactionsActive.svg';
import TicketsIcon from '../../assets/icons/ticketsMenu.svg';
import ActiveTickets from '../../assets/icons/activeTickets.svg';
import SettingsIcon from '../../assets/icons/settingMenu.svg';
import ActiveSettings from '../../assets/icons/activeSettings.svg';
import LogoutIcon from '../../assets/icons/logoutMenu.svg';
import ActiveLogout from '../../assets/icons/activeLogout.svg';

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
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeMenuItem, setActiveMenuItem] = useState('Transactions');
  
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
            <Pressable style={styles.barsIcon} onPress={() => setIsMenuOpen(true)}>
              <Menu width={18} height={18} fill="#202d59" />
            </Pressable>

            <View style={styles.logoWrapper}>
              <RippleLogo size={68} />
            </View>

            <Pressable
              style={styles.bellIcon}
              onPress={() => navigation?.navigate?.('Profile')}
            >
              <NotificationLight width={18} height={18} fill="#202d59" />
            </Pressable>
          </View>
        <View style={styles.cardBackground}>
        <ModemStatusCard
            modemId={modem.modemId}
            statusLabel={statusMeta.label}
            statusColor={statusMeta.color}
            statusBackground={statusMeta.bg}
            style={styles.heroStatusCard}
          />
        </View>
          
        </LinearGradient>

        <View style={styles.detailCard}>
          <DetailGrid fields={detailFields} />
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

      {isMenuOpen && (
        <SideMenuOverlay
          activeItem={activeMenuItem}
          onSelect={(itemKey) => {
            setActiveMenuItem(itemKey);
            handleMenuNavigation(itemKey, navigation);
            setIsMenuOpen(false);
          }}
          onClose={() => setIsMenuOpen(false)}
          onLogout={() => {
            setActiveMenuItem('Logout');
            navigation?.replace?.('Login');
            setIsMenuOpen(false);
          }}
        />
      )}
    </SafeAreaView>
  );
};

const handleMenuNavigation = (itemKey, navigation) => {
  const routeMap = {
    Dashboard: 'Dashboard',
    Usage: 'Dashboard',
    PostPaidRechargePayments: 'Alerts',
    Transactions: 'ModemDetails',
    DG: 'Dashboard',
    Settings: 'Dashboard',
  };

  const routeName = routeMap[itemKey];
  if (routeName) {
    navigation?.navigate?.(routeName);
  }
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

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return dateString;
    const day = date.toLocaleDateString(undefined, {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
    const time = date.toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
    });
    return `${day}  ·  ${time}`;
  };

  return (
    <View style={styles.modemCard}>
      {/* Header row */}
      <View style={styles.itemHeader}>
        <View style={styles.itemIdContainer}>
          <Text style={styles.itemId}>{issue.modemId}</Text>
          <Text style={styles.itemImei}>IMEI - {issue.location}</Text>

        </View>

        <TouchableOpacity style={styles.directionButton}>
          <Text style={styles.directionText}>Get Direction</Text>
        </TouchableOpacity>
      </View>

      {/* Body row: left photo block + right details */}
      <View style={styles.itemDetails}>
        {/* Photo Section - 25% */}
        <View style={styles.photoSection}>
          <View style={styles.photoSectionContent}>
            <Ionicons name="image-outline" size={22} color="#B0B0B0" />
            <Text style={styles.detailLabel}>Photos</Text>
          </View>
        </View>

        {/* Right details - 75% */}
        <View style={styles.subDataSection}>
          {/* Row 1: Error + Meter Type */}
          <View style={styles.subDataRow}>
            <View style={styles.subDataItem}>
              <Text style={styles.detailLabel}>Error</Text>
              <Text style={styles.detailValueGreen}>{issue.error}</Text>
            </View>

            <View style={styles.subDataItem}>
              <Text style={styles.detailLabel}>Meter Type</Text>
              <Text style={styles.detailValueGreen}>Smart</Text>
            </View>
          </View>

          {/* Row 2: HES Status + Issue Occurrence */}
          <View style={styles.subDataRow}>
            <View style={styles.subDataItem}>
              <Text style={styles.detailLabel}>HES Status</Text>
              <View style={styles.statusPillPending}>
                <Text style={styles.statusPillText}>Pending</Text>
              </View>
            </View>

            <View style={styles.subDataItem}>
              <Text style={styles.detailLabel}>Issue Occurrence</Text>
              <Text style={styles.datedetails}>{formatDate(issue.date)}</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#EEF8F0',
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
  cardBackground:{
    paddingHorizontal:18
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
    borderRadius: 5,
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
    fontFamily: 'Manrope-SemiBold',
    fontSize:14
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
  modemCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 15,
    borderWidth: 1,
    borderColor: '#F8F8F8',
    marginBottom: spacing.md,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  itemIdContainer: {
    flex: 1,
  },
  itemId: {
    fontSize: 16,
    color: '#333',
    fontFamily: 'Manrope-Bold',
  },
  itemImei: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
    fontFamily: 'Manrope-Regular',
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
    backgroundColor: '#4CAF50',
    borderRadius: 5,
    paddingHorizontal: 16,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  directionText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 13,
  },
  itemDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  photoSection: {
    width: '25%',
    backgroundColor: '#F8F8F8',
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
  },
  photoSectionContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  subDataSection: {
    width: '75%',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  subDataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  subDataItem: {
    flex: 1,
    marginHorizontal: 5,
  },
  detailLabel: {
    fontSize: 13,
    color: '#666',
    marginBottom: 3,
    fontFamily: 'Manrope-Regular',
  },
  detailValueGreen: {
    fontSize: 13,
    color: '#55b56c',
    fontFamily: 'Manrope-Medium',
  },
  datedetails: {
    backgroundColor: '#F8F8F8',
    paddingVertical: 3,
    paddingHorizontal: 4,
    textAlign: 'center',
    borderRadius: 5,
    fontSize: 9,
  },
  statusPillPending: {
    backgroundColor: '#FF8A00',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 5,
    alignSelf: 'flex-start',
  },
  statusPillText: {
    color: '#fff',
    fontSize: 10,
    fontFamily: 'Manrope-ExtraBold',
  },
  footer: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.lg,
    paddingTop: spacing.sm,
    backgroundColor: colors.background,
  },
  resolveButton: {
    borderRadius:5,
  },
  sideMenuRoot: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 99,
  },
  sideMenuBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  sideMenuPanel: {
    flex: 1,
    backgroundColor: COLORS.brandBlueColor,
    paddingTop: 75,
    paddingHorizontal: 30,
  },
  sideMenuTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 35,
  },
  sideMenuCircle: {
    width: 54,
    height: 54,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  circleLight: {
    backgroundColor: COLORS.secondaryFontColor,
  },
  circleSecondary: {
    backgroundColor: COLORS.secondaryColor,
  },
  circleIconLight: {
    backgroundColor: '#fff',
  },
  sideMenuContent: {
    flexDirection: 'row',
    flex: 1,
  },
  menuListWrapper: {
    width: '45%',
    paddingRight: 20,
    justifyContent: 'space-between',
  },
  menuList: {},
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  menuIcon: {
    marginRight: 20,
    opacity: 0.5,
  },
  menuText: {
    fontSize: 16,
    fontFamily: 'Manrope-Medium',
    color: COLORS.secondaryFontColor,
    opacity: 0.7,
  },
  menuTextActive: {
    opacity: 1,
    fontFamily: 'Manrope-Bold',
  },
  menuFooter: {
    paddingBottom: 30,
  },
  logoutButtonRow: {
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  logoutText: {
    fontSize: 16,
    fontFamily: 'Manrope-Medium',
    color: COLORS.secondaryFontColor,
    opacity: 0.7,
  },
  logoutIcon: {
    marginRight: 20,
    opacity: 0.6,
  },
  menuVersion: {
    fontSize: 12,
    fontFamily: 'Manrope-Medium',
    color: '#89A1F3',
    marginTop: 10,
  },
  menuPreviewWrapper: {
    flex: 1,
    position: 'relative',
    paddingLeft: 40,
  },
  previewCard: {
    flex: 1,
    backgroundColor: '#eef8f0',
    borderTopLeftRadius: 20,
    borderBottomLeftRadius: 20,
    padding: 24,
    elevation: 10,
  },
  previewGhost: {
    position: 'absolute',
    top: 80,
    bottom: 0,
    left: 25,
    right: 0,
    backgroundColor: '#eef8f0',
    opacity: 0.3,
    borderTopLeftRadius: 30,
    borderBottomLeftRadius: 20,
  },
  previewTitle: {
    fontSize: 18,
    fontFamily: 'Manrope-Bold',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  previewSubtitle: {
    fontSize: 14,
    fontFamily: 'Manrope-Medium',
    color: colors.textSecondary,
  },
});

const MENU_ITEMS = [
  {
    key: 'Dashboard',
    label: 'Dashboard',
    Icon: DashboardIcon,
    ActiveIcon: ActiveDashboard,
  },
  {
    key: 'Usage',
    label: 'Usage',
    Icon: UsageIcon,
    ActiveIcon: ActiveUsage,
  },
  {
    key: 'PostPaidRechargePayments',
    label: 'Payments',
    Icon: PaymentsIcon,
    ActiveIcon: ActivePayments,
  },
  {
    key: 'Transactions',
    label: 'Transactions',
    Icon: TransactionsIcon,
    ActiveIcon: ActiveTransactions,
  },
  {
    key: 'DG',
    label: 'Diesel Generator',
    Icon: TicketsIcon,
    ActiveIcon: ActiveTickets,
  },
  {
    key: 'Settings',
    label: 'Settings',
    Icon: SettingsIcon,
    ActiveIcon: ActiveSettings,
  },
];

const SideMenuOverlay = ({ activeItem, onSelect, onClose, onLogout }) => (
  <View pointerEvents="box-none" style={styles.sideMenuRoot}>
    <Pressable style={styles.sideMenuBackdrop} onPress={onClose} />

    <View style={styles.sideMenuPanel}>
      <View style={styles.sideMenuTopRow}>
        <Pressable style={[styles.sideMenuCircle, styles.circleLight]} onPress={onClose}>
          <MenuIcon width={18} height={18} fill="#202d59" />
        </Pressable>

        <Logo variant="white" size="medium" />

        <Pressable
          style={[styles.sideMenuCircle, styles.circleIconLight]}
          onPress={() => {
            onClose();
          }}
        >
          <NotificationIcon width={18} height={18} fill="#0c1f3d" />
        </Pressable>
      </View>

      <View style={styles.sideMenuContent}>
        <View style={styles.menuListWrapper}>
          <SideMenuNavigation activeItem={activeItem} onSelect={onSelect} onLogout={onLogout} />
        </View>

        <View style={styles.menuPreviewWrapper}>
          <View style={styles.previewCard}>
            <Text style={styles.previewTitle}>Need quick insights?</Text>
            <Text style={styles.previewSubtitle}>
              Access your modem diagnostics, payments, and tickets without leaving the field.
            </Text>
          </View>
          <View style={styles.previewGhost} />
        </View>
      </View>
    </View>
  </View>
);

const SideMenuNavigation = ({ activeItem, onSelect, onLogout }) => (
  <>
    <View style={styles.menuList}>
      {MENU_ITEMS.map((item) => {
        const ItemIcon = activeItem === item.key ? item.ActiveIcon : item.Icon;
        return (
          <Pressable key={item.key} style={styles.menuRow} onPress={() => onSelect(item.key)}>
            <ItemIcon width={18} height={18} style={styles.menuIcon} />
            <Text
              style={[
                styles.menuText,
                activeItem === item.key && styles.menuTextActive,
              ]}
            >
              {item.label}
            </Text>
          </Pressable>
        );
      })}
    </View>

    <View style={styles.menuFooter}>
      <Button
        title="Logout"
        variant="ghost"
        size="small"
        onPress={onLogout}
        style={styles.logoutButtonRow}
        textStyle={styles.logoutText}
      >
        {activeItem === 'Logout' ? (
          <ActiveLogout width={18} height={18} style={styles.logoutIcon} />
        ) : (
          <LogoutIcon width={18} height={18} style={styles.logoutIcon} />
        )}
      </Button>
      <Text style={styles.menuVersion}>Version 1.0.26</Text>
    </View>
  </>
);

export default ModemDetailsScreen;
