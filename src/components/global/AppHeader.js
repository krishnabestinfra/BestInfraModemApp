import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

import MenuIcon from '../../../assets/icons/bars.svg';
import NotificationIcon from '../../../assets/icons/notification.svg';
import RippleLogo from './RippleLogo';
import { COLORS } from '../../constants/colors';
import NotificationLight from '../../../assets/icons/notification.svg';

const DEFAULT_ICON_PROPS = { width: 18, height: 18, fill: '#202d59' };
const DEFAULT_HIT_SLOP = { top: 10, bottom: 10, left: 10, right: 10 };
const BUTTON_SIZE = 54;

const AppHeader = ({
  navigation,
  containerStyle,
  contentStyle,
  leftButtonStyle,
  rightButtonStyle,
  logoContainerStyle,
  leftIcon: LeftIcon = MenuIcon,
  rightIcon: RightIcon = NotificationLight,
  leftIconProps,
  rightIconProps,
  onPressLeft,
  onPressRight,
  onPressCenter,
  logo,
  withGradient = true,
  gradientColors = ['#f4fbf7', '#e6f4ed'],
  headerWrapperStyle,
  headerContainerStyle,
  children,
}) => {
  const insets = useSafeAreaInsets();
  
  // Default logo if not provided
  const defaultLogo = logo || <RippleLogo size={68} />;
  
  // Auto-setup navigation handlers if navigation prop is provided (only if custom handlers not provided)
  const handlePressLeft = onPressLeft || (navigation ? () => navigation.navigate('SideMenu') : undefined);
  const handlePressCenter = onPressCenter || (navigation ? () => navigation.navigate('Dashboard') : undefined);
  const handlePressRight = onPressRight || (navigation ? () => navigation.navigate('Profile') : undefined);
  
  // Default button styles (only apply if no custom style provided)
  const defaultButtonStyle = React.useMemo(() => ({
    backgroundColor: COLORS.secondaryFontColor,
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 1,
    zIndex: 2,
  }), []);
  
  const buttonStyle = React.useMemo(
    () => ({
      width: BUTTON_SIZE,
      height: BUTTON_SIZE,
      borderRadius: BUTTON_SIZE / 2,
    }),
    []
  );

  const defaultContainerStyle = React.useMemo(() => ({
    paddingTop: Math.max(insets.top + 10, 10),
  }), [insets.top]);
  
  // Default container style (only if not provided)
  const defaultContainerStyleValue = containerStyle || { paddingTop: 10, paddingBottom: 5 };

  const CenterWrapper = handlePressCenter ? Pressable : View;

  const renderButton = (IconComponent, pressHandler, customStyle, iconProps) => {
    // Only apply default button style if no custom style is provided
    const buttonStyles = customStyle 
      ? [styles.circleButton, buttonStyle, customStyle]
      : [styles.circleButton, buttonStyle, defaultButtonStyle];
    
    // Use custom icon props if provided, otherwise use defaults
    const iconPropsToUse = iconProps || DEFAULT_ICON_PROPS;
    
    return (
      <Pressable
        hitSlop={DEFAULT_HIT_SLOP}
        onPress={pressHandler}
        disabled={!pressHandler}
        style={[...buttonStyles, !pressHandler && styles.hidden]}
      >
        {pressHandler && <IconComponent {...iconPropsToUse} />}
      </Pressable>
    );
  };

  const headerContent = (
    <View style={[styles.container, defaultContainerStyle, defaultContainerStyleValue]}>
      <View style={[styles.content, contentStyle]}>
        {renderButton(LeftIcon, handlePressLeft, leftButtonStyle, leftIconProps)}

        <CenterWrapper
          style={[styles.logoWrapper, logoContainerStyle]}
          onPress={handlePressCenter}
          hitSlop={handlePressCenter ? DEFAULT_HIT_SLOP : undefined}
        >
          {defaultLogo}
        </CenterWrapper>

        {renderButton(RightIcon, handlePressRight, rightButtonStyle, rightIconProps)}
      </View>
      {children}
    </View>
  );

  if (!withGradient) {
    return headerContent;
  }

  return (
    <View style={[styles.headerWrapper, headerWrapperStyle]}>
      <LinearGradient
        colors={gradientColors}
        style={[styles.headerContainer, headerContainerStyle]}
      >
        {headerContent}
      </LinearGradient>
    </View>
  );
};

export default AppHeader;

const styles = StyleSheet.create({
  headerWrapper: {
    overflow: 'hidden',
  },
  headerContainer: {
    paddingHorizontal: 15,
    paddingVertical: 20,
  },
  container: {
    width: '100%',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  circleButton: {
    backgroundColor: COLORS.secondaryFontColor,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholder: {
    opacity: 0,
  },
  logoWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  hidden: {
    opacity: 0,
  },
});
