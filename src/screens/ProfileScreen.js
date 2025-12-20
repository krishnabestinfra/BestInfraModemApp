import React, { useCallback, useMemo, useState, useEffect } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import AppHeader from '../components/global/AppHeader';
import NotificationCard from '../components/global/NotificationCard';
import { COLORS } from '../constants/colors';
import { colors } from '../styles/theme';
import EmptyNotification from '../../assets/icons/NoNotification.svg';
import { useContext } from 'react';
import { NotificationContext } from '../context/NotificationContext';
import HandBill from '../../assets/icons/handBill.svg';
import Calendar from '../../assets/icons/calendar.svg';
import CheapDollar from '../../assets/icons/cheapDollar.svg';
import NotificationIcon from '../../assets/icons/notificationDark.svg';

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
  const insets = useSafeAreaInsets();
  const { notifications, setNotifications } = useContext(NotificationContext);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const consumerUid = 'BI25GMRA0001';
  
  useFocusEffect(
    useCallback(() => {
      const loadNotifications = async () => {
        try {
          const savedNoti = await AsyncStorage.getItem("notifications");
          if (savedNoti) {
            const parsed = JSON.parse(savedNoti);
            setNotifications(parsed);
          } else {
            setNotifications([]);
          }
        } catch (e) {
        }
      };
      
      loadNotifications();
    }, [setNotifications])
  );
  
  const displayNotifications = useMemo(() => notifications.slice(0, 5), [notifications]);

  const markAsRead = async (id) => {
    const updated = notifications.map(n =>
      n.id === id ? { ...n, is_read: true } : n
    );
    setNotifications(updated);
    await AsyncStorage.setItem("notifications", JSON.stringify(updated));
  };

  const handleNotificationPress = (notification) => {
    if (!notification.is_read) {
      markAsRead(notification.id);
    }
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
    <SafeAreaView style={styles.container} edges={[]}>
      <StatusBar style="dark" />
      <AppHeader navigation={navigation} />

      <ScrollView
        style={styles.notificationsContainer}
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 15 + insets.bottom }}
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
    </SafeAreaView>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    flex: 1,
  },
  topMenu: {
    paddingTop: 10,
    paddingBottom: 5,
  },
  barsIcon: {
    backgroundColor: COLORS.secondaryFontColor,
    width: 54,
    height: 54,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 1,
    zIndex: 2,
  },
  bellIcon: {
    backgroundColor: COLORS.secondaryFontColor,
    width: 54,
    height: 54,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 1,
    zIndex: 2,
  },
  notificationsContainer: {
    paddingVertical: 20,
    paddingHorizontal: 25,
    paddingTop: 10,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    color: colors.textPrimary,
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
    color: colors.textPrimary,
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
    color: colors.textPrimary,
    fontSize: 20,
    fontFamily: 'Manrope',
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 12,
    marginTop: 24,
  },
  emptySubText: {
    color: colors.textSecondary,
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
