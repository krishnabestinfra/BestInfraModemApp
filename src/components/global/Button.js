import React, { useMemo, useCallback } from 'react';
import { Pressable, Text, StyleSheet, ActivityIndicator, View } from 'react-native';
import { COLORS } from '../../constants/colors';

const Button = React.memo(({
  title,
  onPress,
  variant = 'primary', // 'primary', 'secondary', 'outline', 'ghost', 'gray', 'disabled'
  size = 'medium', // 'small', 'medium', 'large'
  disabled = false,
  loading = false,
  style,
  textStyle,
  children,
  leftIcon,
  rightIcon,
  iconGap = 8,
  ...props
}) => {
  const getButtonStyle = useMemo(() => {
    const baseStyle = [styles.button, styles[size]];
    
    switch (variant) {
      case 'primary':
        baseStyle.push(styles.primary);
        break;
      case 'secondary':
        baseStyle.push(styles.secondary);
        break;
      case 'outline':
        baseStyle.push(styles.outline);
        break;
      case 'ghost':
        baseStyle.push(styles.ghost);
        break;
      case 'gray':
        baseStyle.push(styles.gray);
        break;
      default:
        baseStyle.push(styles.primary);
    }

    if (disabled) {
      baseStyle.push(styles.disabled);
    }

    // Add flexDirection row if icons are present
    if (leftIcon || rightIcon) {
      baseStyle.push(styles.buttonWithIcons);
    }

    return baseStyle;
  }, [variant, size, disabled, leftIcon, rightIcon]);

  const getTextStyle = useMemo(() => {
    const baseTextStyle = [styles.text, styles[`${size}Text`]];
    
    switch (variant) {
      case 'primary':
        baseTextStyle.push(styles.primaryText);
        break;
      case 'secondary':
        baseTextStyle.push(styles.secondaryText);
        break;
      case 'outline':
        baseTextStyle.push(styles.outlineText);
        break;
      case 'ghost':
        baseTextStyle.push(styles.ghostText);
        break;
      case 'gray':
        baseTextStyle.push(styles.grayText);
        break;
      default:
        baseTextStyle.push(styles.primaryText);
    }

    if (disabled) {
      baseTextStyle.push(styles.disabledText);
    }

    return baseTextStyle;
  }, [variant, size, disabled]);

  const handlePress = useCallback(() => {
    if (!disabled && !loading && onPress) {
      onPress();
    }
  }, [disabled, loading, onPress]);

  const renderContent = () => {
    if (loading) {
      return (
        <ActivityIndicator 
          color={variant === 'primary' || variant === 'secondary' ? COLORS.secondaryFontColor : COLORS.secondaryColor} 
          size="small" 
        />
      );
    }

    // If children are provided, render them (for custom content)
    if (children && !title) {
      return children;
    }

    // Render with icons and/or title
    const hasIcons = leftIcon || rightIcon;
    const content = (
      <>
        {leftIcon && (
          <View style={{ marginRight: title ? iconGap : 0 }}>
            {typeof leftIcon === 'function' ? leftIcon() : leftIcon}
          </View>
        )}
        {title && <Text style={[getTextStyle, textStyle]}>{title}</Text>}
        {rightIcon && (
          <View style={{ marginLeft: title ? iconGap : 0 }}>
            {typeof rightIcon === 'function' ? rightIcon() : rightIcon}
          </View>
        )}
        {children}
      </>
    );

    return hasIcons ? (
      <View style={styles.buttonContent}>
        {content}
      </View>
    ) : content;
  };

  return (
    <Pressable
      style={[getButtonStyle, style]}
      onPress={handlePress}
      disabled={disabled || loading}
      {...props}
    >
      {renderContent()}
    </Pressable>
  );
});

Button.displayName = 'Button';

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    fontFamily: 'Manrope-Medium',
  },
  buttonWithIcons: {
    flexDirection: 'row',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Size variants
  small: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    minHeight: 36,
  },
  medium: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    minHeight: 42,
  },
  large: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    minHeight: 56,
  },
  // Variant styles
  primary: {
    backgroundColor: COLORS.secondaryColor,
  },
  secondary: {
    backgroundColor: COLORS.primaryColor,
  },
  outline: {
    backgroundColor: '#F8F8F8',
    borderWidth: 1,
    borderColor: COLORS.secondaryColor,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  gray: {
    backgroundColor: '#eef0f4',
  },
  disabled: {
    backgroundColor: '#e0e0e0',
    borderColor: '#e0e0e0',
  },
  // Text styles
  text: {
    fontFamily: 'Manrope-Medium',
    textAlign: 'center',
    
  },
  smallText: {
    fontSize: 12,
    fontFamily: 'Manrope-Regular',
  },
  mediumText: {
    fontSize: 14,
  },
  largeText: {
    fontSize: 16,
  },
  primaryText: {
    color: COLORS.secondaryFontColor,
  },
  secondaryText: {
    color: COLORS.secondaryFontColor,
  },
  outlineText: {
    color: COLORS.secondaryColor,
  },
  ghostText: {
    color: COLORS.secondaryColor,
  },
  grayText: {
    color: '#6E6E6E',
  },
  disabledText: {
    color: '#999',
  },
});

export default Button; 