import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import Menu from '../../assets/icons/bars.svg';
import Notification from '../../assets/icons/notificationsWhite.svg';
import NotificationIcon from '../../assets/icons/notificationDark.svg';
import HandBill from '../../assets/icons/handBill.svg';
import Calendar from '../../assets/icons/calendar.svg';
import CheapDollar from '../../assets/icons/cheapDollar.svg';
import Logo from '../components/global/Logo';
import NotificationCard from '../components/global/NotificationCard';
import { COLORS } from '../constants/colors';
import EmptyNotification from '../../assets/icons/NoNotification.svg';
// import { notifications as defaultNotifications } from '../data/dummyData';
import { useContext } from 'react';
import { NotificationContext } from '../context/NotificationContext';

const iconMapper = {
  payment: HandBill,
  success: HandBill,
  warning: Calendar,
  alert: Calendar,
  due: Calendar,
  balance: CheapDollar,
  info: CheapDollar,
};

const variantMapper = {
  warning: 'warning',
  alert: 'warning',
  success: 'success',
  payment: 'success',
  info: 'info',
  balance: 'info',
};

const ProfileScreen = ({ navigation }) => {
  const { notifications, setNotifications } = useContext(NotificationContext);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const consumerUid = 'BI25GMRA0001';
  
  const displayNotifications = notifications.slice(0, 10);
  console.log("Display Notifications:", displayNotifications);

  const markAsRead = (id) => {
    const updated = notifications.map(n =>
      n.id === id ? { ...n, is_read: true } : n
    );
    setNotifications(updated);
  };

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    setError(null);
    setTimeout(() => {
      setNotifications((prev) => [...prev]);
      setRefreshing(false);
    }, 800);
  }, []);

  const getNotificationIcon = (type) =>
    iconMapper[type?.toLowerCase()] ?? NotificationIcon;

  const getNotificationVariant = (type) =>
    variantMapper[type?.toLowerCase()] ?? 'default';

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.topMenu}>
        <Pressable
          style={styles.barsIcon}
          onPress={() => navigation?.navigate?.('SideMenu')}
        >
          <Menu width={18} height={18} fill="#202d59" />
        </Pressable>

        <Pressable onPress={() => navigation?.navigate?.('SideMenu')}>
          <Logo variant="white" size="medium" />
        </Pressable>

        <Pressable
          style={styles.bellIcon}
          onPress={() => navigation?.navigate?.('')}
        >
          <Notification width={18} height={18} fill="#ffffff" />
        </Pressable>
      </View>

      <ScrollView
        style={styles.notificationsContainer}
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[COLORS.secondaryFontColor]}
            tintColor={COLORS.secondaryFontColor}
          />
        }
      >
        {isLoading && displayNotifications.length === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.secondaryFontColor} />
            <Text style={styles.loadingText}>Loading notifications...</Text>
          </View>
        ) : error && displayNotifications.length === 0 ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>
              {`Unable to load notifications for ${consumerUid}`}
            </Text>
            <Pressable style={styles.retryButton} onPress={handleRefresh}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </Pressable>
          </View>
        ) : displayNotifications.length === 0 ? (

          <View style={styles.emptyContainer}>
            <EmptyNotification width={60} height={60}/>

            <Text style={styles.emptyText}>No Notification</Text>
            <Text style={styles.emptySubText}>We’ll let you know when there will be</Text>
            <Text style={styles.emptySubText}>something to update you.</Text>
          </View>
        ) : (
          displayNotifications.map((notification) => (
            <NotificationCard
              key={notification.id}
              title={notification.title}
              message={notification.message}
              sentAt={notification.created_at}
              icon={getNotificationIcon(notification.type)}
              variant={getNotificationVariant(notification.type)}
              isRead={notification.is_read}
              onPress={() => handleNotificationPress(notification)}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.brandBlueColor,
    flex: 1,
  },
  topMenu: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 75,
    paddingBottom: 15,
    paddingHorizontal: 30,
  },
  barsIcon: {
    backgroundColor: COLORS.secondaryFontColor,
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
  bellIcon: {
    backgroundColor: COLORS.secondaryColor,
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
  notificationsContainer: {
    paddingVertical: 20,
    paddingHorizontal: 25,
    paddingTop: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    color: COLORS.secondaryFontColor,
    fontSize: 14,
    fontFamily: 'Manrope-Medium',
    marginTop: 12,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  errorText: {
    color: COLORS.secondaryFontColor,
    fontSize: 14,
    fontFamily: 'Manrope-Medium',
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 0.8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontFamily: 'Manrope',
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 12,
    marginTop: 24,
  },
  emptySubText: {
    color: '#CDCDCD',
    fontSize: 16,
    fontFamily: 'Manrope',
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: COLORS.primaryColor,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  retryButtonText: {
    color: COLORS.secondaryFontColor,
    fontSize: 14,
    fontFamily: 'Manrope-SemiBold',
    textAlign: 'center',
  },
});
