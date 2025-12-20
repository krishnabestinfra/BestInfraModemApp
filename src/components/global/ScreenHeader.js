import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../../constants/colors';
import RippleLogo from './RippleLogo';
import AppHeader from './AppHeader';
import NotificationLight from '../../../assets/icons/notification.svg';

const ScreenHeader = ({ 
  navigation, 
  title, 
  subtitle,
  showLogo = true,
  logoSize = 68,
}) => {
  return (
    <LinearGradient
      colors={['#f4fbf7', '#e6f4ed']}
      style={styles.headerContainer}
    >
      <AppHeader
        containerStyle={styles.topMenu}
        leftButtonStyle={styles.barsIcon}
        rightButtonStyle={styles.bellIcon}
        rightIcon={NotificationLight}
        logo={showLogo ? <RippleLogo size={logoSize} /> : null}
        onPressLeft={() => navigation.navigate('SideMenu')}
        onPressCenter={() => navigation.navigate('Dashboard')}
        onPressRight={() => navigation.navigate('Profile')}
      />

      {(title || subtitle) && (
        <View style={styles.titleContainer}>
          {subtitle && (
            <Text style={styles.subtitle}>{subtitle}</Text>
          )}
          {title && (
            <Text style={styles.title}>{title}</Text>
          )}
        </View>
      )}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    paddingHorizontal: 15,
    paddingBottom: 15,
  },
  topMenu: {
    paddingTop: 10,
    paddingBottom: 5,
    paddingHorizontal: 15,
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
  titleContainer: {
    marginTop: 10,
    marginBottom: 15,
    paddingHorizontal: 2,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.primaryFontColor,
    fontFamily: 'Manrope-Regular',
    marginBottom: 4,
  },
  title: {
    fontSize: 24,
    color: COLORS.primaryFontColor,
    fontFamily: 'Manrope-Bold',
  },
});

export default ScreenHeader;

