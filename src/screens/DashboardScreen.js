import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Pressable,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Logo from '../components/global/Logo';
import NotificationCard from '../components/global/NotificationCard';
import { modemStats, modemErrors, notifications as notificationSeed } from '../data/dummyData';
import { colors, spacing, borderRadius, typography } from '../styles/theme';
import { COLORS } from '../constants/colors';
import Button from '../components/global/Button';
import MenuIcon from '../../assets/icons/bars.svg';
import NotificationIcon from '../../assets/icons/notificationDark.svg';
import HandBill from '../../assets/icons/handBill.svg';
import Calendar from '../../assets/icons/calendar.svg';
import CheapDollar from '../../assets/icons/cheapDollar.svg';
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

const DashboardScreen = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeMenuItem, setActiveMenuItem] = useState('Dashboard');
  const [notificationList] = useState(notificationSeed);

  const notificationIconMapper = useMemo(
    () => ({
      payment: HandBill,
      success: HandBill,
      warning: Calendar,
      alert: Calendar,
      due: Calendar,
      balance: CheapDollar,
      info: CheapDollar,
    }),
    []
  );

  const notificationVariantMapper = useMemo(
    () => ({
      warning: 'warning',
      alert: 'warning',
      success: 'success',
      payment: 'success',
      info: 'info',
      balance: 'info',
    }),
    []
  );

  const recentNotifications = useMemo(
    () => notificationList.slice(0, 2),
    [notificationList]
  );

  const filteredModems = useMemo(() => {
    if (!searchQuery.trim()) {
      return modemErrors;
    }
    const query = searchQuery.toLowerCase();
    return modemErrors.filter((item) =>
      [item.modemId, item.location, item.error, item.reason]
        .join(' ')
        .toLowerCase()
        .includes(query)
    );
  }, [searchQuery]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <LinearGradient
          colors={['#f4fbf7', '#e6f4ed']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroCard}
        >
          <View style={styles.heroOverlayCircleLarge} />
          <View style={styles.heroOverlayCircleSmall} />

          <View style={styles.heroTopRow}>
            <TouchableOpacity
              style={styles.iconChip}
              onPress={() => setIsMenuOpen(true)}
            >
              <Ionicons name="menu-outline" size={18} color={colors.primary} />
            </TouchableOpacity>

            <View style={styles.logoWrapper}>
              <Logo width={60} height={24} />
            </View>

            <TouchableOpacity
              style={[styles.iconChip, styles.notificationChip]}
              onPress={() => navigation?.navigate?.('Profile')}
            >
              <Ionicons
                name="notifications-outline"
                size={18}
                color={colors.primary}
              />
            </TouchableOpacity>
          </View>

          <Text style={styles.greetingText}>Hi, Sandeep 👋</Text>
          <Text style={styles.greetingSubText}>Staying efficient today?</Text>

          <View style={styles.statRow}>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Connected Modems</Text>
              <View style={styles.statValueRow}>
                <Ionicons
                  name="checkmark-circle"
                  size={18}
                  color={colors.secondary}
                />
                <Text style={styles.statValue}>
                  {modemStats.connected.toLocaleString()}
                </Text>
              </View>
              <View style={styles.badgePill}>
                <Ionicons name="calendar" size={12} color="#fff" />
              </View>
            </View>

            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Disconnected Modems</Text>
              <View style={styles.statValueRow}>
                <Ionicons
                  name="alert-circle"
                  size={18}
                  color={colors.error}
                />
                <Text style={styles.statValue}>
                  {modemStats.disconnected.toLocaleString()}
                </Text>
              </View>
              <View style={[styles.badgePill, { backgroundColor: '#1f915a' }]}>
                <Ionicons name="calendar" size={12} color="#fff" />
              </View>
            </View>
          </View>
        </LinearGradient>

        <View style={styles.searchCard}>
          <Ionicons
            name="search-outline"
            size={18}
            color={colors.textSecondary}
          />
          <TextInput
            placeholder="Quick Search"
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={styles.searchInput}
          />
          <TouchableOpacity style={styles.scanButton}>
            <Ionicons name="scan-outline" size={16} color="#fff" />
            <Text style={styles.scanText}>Scan</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.filterButton}>
            <Ionicons name="options-outline" size={16} color={colors.primary} />
          </TouchableOpacity>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Active Issues</Text>
          <Text style={styles.sectionCount}>
            {filteredModems.length} devices
          </Text>
        </View>

        <View style={styles.cardsWrapper}>
          {filteredModems.map((modem) => (
            <ModemCard key={modem.id} modem={modem} navigation={navigation} />
          ))}
        </View>

        <View style={styles.notificationSection}>
          <View style={styles.notificationHeader}>
            <Text style={styles.sectionTitle}>Notifications</Text>
            <TouchableOpacity onPress={() => navigation?.navigate?.('Profile')}>
              <Text style={styles.viewAllText}>View all</Text>
            </TouchableOpacity>
          </View>

          {recentNotifications.map((notification) => {
            const iconComponent =
              notificationIconMapper[notification.type?.toLowerCase()] ??
              NotificationIcon;
            const variant =
              notificationVariantMapper[notification.type?.toLowerCase()] ??
              'default';

            return (
              <NotificationCard
                key={notification.id}
                title={notification.title}
                message={notification.message}
                sentAt={notification.created_at}
                icon={iconComponent}
                variant={variant}
                isRead={notification.is_read}
                onPress={() => navigation?.navigate?.('Profile')}
                containerStyle={styles.dashboardNotificationCard}
              />
            );
          })}
        </View>
      </ScrollView>

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

const statusConfig = {
  warning: {
    label: 'Warning',
    color: '#FFB74D25',
    icon: 'warning-outline',
    text: '#AD5A00',
  },
  disconnected: {
    label: 'Disconnected',
    color: '#FFCDD225',
    icon: 'alert-circle-outline',
    text: '#C62828',
  },
  default: {
    label: 'Info',
    color: '#E3F2FD55',
    icon: 'information-circle-outline',
    text: colors.primary,
  },
};

const ModemCard = ({ modem, navigation }) => {
  const meta = statusConfig[modem.status] ?? statusConfig.default;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return dateString;
    const day = date.toLocaleDateString(undefined, {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
    });
    const time = date.toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
    });
    return `${day} · ${time}`;
  };

  const handleCardPress = () => {
    navigation?.navigate?.('ModemDetails', { modem });
  };

  return (
    <Pressable onPress={handleCardPress} style={styles.modemCard}>
      <View style={styles.modemCardHeader}>
        <View>
          <Text style={styles.modemId}>{modem.modemId}</Text>
          <View style={[styles.statusBadge, { backgroundColor: meta.color }]}>
            <Ionicons name={meta.icon} size={12} color={meta.text} />
            <Text style={[styles.statusText, { color: meta.text }]}>
              {meta.label}
            </Text>
          </View>
        </View>

        <TouchableOpacity style={styles.directionButton}>
          <Text style={styles.directionText}>Get Direction</Text>
          <Ionicons
            name="navigate-outline"
            size={14}
            color="#fff"
            style={{ marginLeft: 4 }}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.modemInfoRow}>
        <View style={styles.infoBlock}>
          <Text style={styles.infoLabel}>Error</Text>
          <Text style={styles.infoHighlight}>{modem.error}</Text>
        </View>
        <View style={styles.infoBlock}>
          <Text style={styles.infoLabel}>Meter Type</Text>
          <Text style={styles.infoValue}>Smart</Text>
        </View>
      </View>

      <View style={styles.modemInfoRow}>
        <View style={styles.infoBlock}>
          <Text style={styles.infoLabel}>Location</Text>
          <Text style={styles.infoValue}>{modem.location}</Text>
        </View>
        <View style={styles.infoBlock}>
          <Text style={styles.infoLabel}>Issue Occurrence</Text>
          <Text style={styles.infoValue}>{formatDate(modem.date)}</Text>
        </View>
      </View>

      <View style={styles.cardFooter}>
        <TouchableOpacity style={styles.photoButton}>
          <Ionicons name="image-outline" size={14} color={colors.primary} />
          <Text style={styles.photoText}>Photos</Text>
        </TouchableOpacity>
        <Text style={styles.signalText}>
          Signal Strength: {modem.signalStrength ?? '—'} dBm
        </Text>
      </View>
    </Pressable>
  );
};

export default DashboardScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingBottom: spacing.xl,
  },
  heroCard: {
    margin: spacing.md,
    marginBottom: spacing.lg,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
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
    marginBottom: spacing.lg,
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
  notificationChip: {
    borderWidth: 1,
    borderColor: '#d7e2d9',
  },
  logoWrapper: {
    paddingHorizontal: spacing.sm,
  },
  greetingText: {
    ...typography.h2,
    color: colors.textPrimary,
  },
  greetingSubText: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginRight: spacing.sm,
    elevation: 3,
  },
  statLabel: {
    ...typography.small,
    color: colors.textSecondary,
  },
  statValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  statValue: {
    ...typography.h1,
    marginLeft: spacing.xs,
    color: colors.textPrimary,
  },
  badgePill: {
    marginTop: spacing.sm,
    alignSelf: 'flex-start',
    backgroundColor: colors.secondary,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.round,
  },
  searchCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardBackground,
    marginHorizontal: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    paddingHorizontal: spacing.sm,
    color: colors.textPrimary,
  },
  scanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.secondary,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.round,
    marginRight: spacing.sm,
  },
  scanText: {
    color: '#fff',
    marginLeft: 4,
    fontWeight: '600',
    fontSize: 12,
  },
  filterButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#d7e2d9',
    alignItems: 'center',
    justifyContent: 'center',
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
  cardsWrapper: {
    marginTop: spacing.md,
    paddingHorizontal: spacing.md,
    gap: spacing.md,
  },
  notificationSection: {
    marginTop: spacing.lg,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.lg,
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  viewAllText: {
    ...typography.small,
    color: colors.primary,
    fontWeight: '600',
  },
  dashboardNotificationCard: {
    backgroundColor: '#fff',
  },
  modemCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    elevation: 3,
    marginBottom: spacing.md,
  },
  modemCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  modemId: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.round,
    marginTop: spacing.xs,
    gap: 4,
  },
  statusText: {
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
  modemInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  infoBlock: {
    flex: 1,
    marginRight: spacing.sm,
  },
  infoLabel: {
    ...typography.small,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  infoValue: {
    ...typography.body,
    color: colors.textPrimary,
  },
  infoHighlight: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '700',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  photoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eef2ff',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.round,
  },
  photoText: {
    color: colors.primary,
    marginLeft: spacing.xs,
    fontWeight: '600',
  },
  signalText: {
    ...typography.small,
    color: colors.textSecondary,
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
