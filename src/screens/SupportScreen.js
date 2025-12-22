import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Linking,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import AppHeader from '../components/global/AppHeader';
import { COLORS } from '../constants/colors';
import TelephoneCall from '../../assets/icons/telephone-call.svg';
import SendMessage from '../../assets/icons/sendMessage.svg';
import ArrowIcon from '../../assets/icons/arrow.svg';

if (!Text.defaultProps) Text.defaultProps = {};
Text.defaultProps.style = [{ fontFamily: 'Manrope-Regular' }];

const SupportScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();

  const handlePhoneCall = () => {
    Linking.openURL('tel:+918765432189');
  };

  const handleEmail = () => {
    Linking.openURL('mailto:contact@bestinfra.tech');
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={[]}>
      <StatusBar style="dark" />
      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 100 + insets.bottom }]}
      >
        <AppHeader navigation={navigation} />
        
        <View style={styles.contentContainer}>
          <View style={styles.headerContainer}>
            <Text style={styles.title}>Support</Text>
            <Text style={styles.subtitle}>Tech Support</Text>
          </View>

          <View style={styles.supportOptions}>
            <Pressable style={styles.supportCard} onPress={handlePhoneCall}>
              <View style={styles.iconContainer}>
                <TelephoneCall width={30} height={30} fill="#FFFFFF" />
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.cardLabel}>Phone Number</Text>
                <Text style={styles.cardContact}>+91 8765432189</Text>
              </View>
              <ArrowIcon width={20} height={20} fill={COLORS.primaryFontColor} style={styles.arrowIcon} />
            </Pressable>

            <Pressable style={styles.supportCard} onPress={handleEmail}>
              <View style={styles.iconContainer}>
                <SendMessage width={30} height={30} fill="#FFFFFF" />
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.cardLabel}>Email Address</Text>
                <Text style={styles.cardContact}>contact@bestinfra.tech</Text>
              </View>
              <ArrowIcon width={20} height={20} fill={COLORS.primaryFontColor} style={styles.arrowIcon} />
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SupportScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    paddingBottom: 20,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  headerContainer: {
    marginBottom: 10,
  },
  title: {
    color: COLORS.primaryFontColor,
    fontSize: 20,
    fontFamily: 'Manrope',
    fontWeight: "700",

    marginBottom: 25,
  },
  subtitle: {
    color: COLORS.primaryFontColor,
    fontSize: 14,
    fontFamily: 'Manrope',
    fontWeight: "700",
  },
  supportOptions: {
    gap: 16,
  },
  supportCard: {
    backgroundColor: COLORS.secondaryFontColor,
    borderRadius: 5,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#4CAF50',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  cardContent: {
    flex: 1,
  },
  cardLabel: {
    color: COLORS.primaryFontColor,
    fontSize: 14,
    fontFamily: 'Manrope-Medium',
    marginBottom: 4,
  },
  cardContact: {
    color: COLORS.primaryFontColor,
    fontSize: 14,
    fontFamily: 'Manrope-Regular',
    opacity: 0.6,
  },
  arrowIcon: {
    marginLeft: 8,
    opacity: 0.5,
  },
});

