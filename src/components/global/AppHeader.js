import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import MenuIcon from '../../../assets/icons/bars.svg';
import NotificationIcon from '../../../assets/icons/notification.svg';
import RippleLogo from './RippleLogo';
import { COLORS } from '../../constants/colors';

const DEFAULT_ICON_PROPS = { width: 18, height: 18, fill: '#202d59' };
const DEFAULT_HIT_SLOP = { top: 10, bottom: 10, left: 10, right: 10 };
const BUTTON_SIZE = 54;

const AppHeader = ({
  containerStyle,
  contentStyle,
  leftButtonStyle,
  rightButtonStyle,
  logoContainerStyle,
  leftIcon: LeftIcon = MenuIcon,
  rightIcon: RightIcon = NotificationIcon,
  onPressLeft,
  onPressRight,
  onPressCenter,
  logo = <RippleLogo size={68} />,
}) => {
  const insets = useSafeAreaInsets();
  
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

  const CenterWrapper = onPressCenter ? Pressable : View;

  const renderButton = (IconComponent, pressHandler, customStyle) => (
    <Pressable
      hitSlop={DEFAULT_HIT_SLOP}
      onPress={pressHandler}
      disabled={!pressHandler}
      style={[styles.circleButton, buttonStyle, customStyle, !pressHandler && styles.hidden]}
    >
      {pressHandler && <IconComponent {...DEFAULT_ICON_PROPS} />}
    </Pressable>
  );

  return (
    <View style={[styles.container, defaultContainerStyle, containerStyle]}>
      <View style={[styles.content, contentStyle]}>
        {renderButton(LeftIcon, onPressLeft, leftButtonStyle)}

        <CenterWrapper
          style={[styles.logoWrapper, logoContainerStyle]}
          onPress={onPressCenter}
          hitSlop={onPressCenter ? DEFAULT_HIT_SLOP : undefined}
        >
          {logo}
        </CenterWrapper>

        {renderButton(RightIcon, onPressRight, rightButtonStyle)}
      </View>
    </View>
  );
};

export default AppHeader;

const styles = StyleSheet.create({
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
