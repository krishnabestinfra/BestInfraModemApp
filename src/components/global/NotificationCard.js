import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { COLORS } from '../../constants/colors';

const formatTimestamp = (timestamp) => {
  if (!timestamp) return '';

  const now = new Date();
  const notificationTime = new Date(timestamp);
  const diffInSeconds = Math.floor((now - notificationTime) / 1000);

  if (diffInSeconds < 60) {
    return 'Just now';
  }
  if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes}m ago`;
  }
  if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours}h ago`;
  }
  if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days}d ago`;
  }
  return notificationTime.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

const NotificationCard = ({
  title,
  description,
  message,
  subDescription,
  icon,
  variant = 'default',
  onPress,
  style,
  containerStyle,
  titleStyle,
  descriptionStyle,
  subDescriptionStyle,
  iconStyle,
  iconContainerStyle,
  disabled = false,
  isRead = true,
  sentAt,
  showTimestamp = true,
  ...props
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'warning':
        return {
          titleColor: '#FF7C5C',
          iconBgColor: '#FFF2EF',
          borderColor: '#FF7C5C',
        };
      case 'success':
        return {
          titleColor: COLORS.secondaryColor,
          iconBgColor: '#EEF8F0',
          borderColor: COLORS.secondaryColor,
        };
      case 'info':
        return {
          titleColor: COLORS.primaryColor,
          iconBgColor: '#E9EAEE',
          borderColor: COLORS.primaryColor,
        };
      default:
        return {
          titleColor: COLORS.primaryColor,
          iconBgColor: '#E9EAEE',
          borderColor: COLORS.primaryColor,
        };
    }
  };

  const variantStyles = getVariantStyles();
  const displayDescription = description || message;

  const cardContent = (
    <View
      style={[
        styles.container,
        containerStyle,
        style,
        !isRead && styles.unreadContainer,
      ]}
      {...props}
    >
      <View style={styles.contentContainer}>
        <View style={styles.textContainer}>
          <View style={styles.titleRow}>
            <Text
              style={[
                styles.title,
                { color: variantStyles.titleColor },
                titleStyle,
                !isRead && styles.unreadTitle,
              ]}
            >
              {title}
            </Text>
          </View>

          {displayDescription ? (
            <Text style={[styles.description, descriptionStyle]}>
              {displayDescription}
            </Text>
          ) : null}

          {subDescription ? (
            <Text style={[styles.description, subDescriptionStyle]}>
              {subDescription}
            </Text>
          ) : null}

          {showTimestamp && sentAt ? (
            <Text
              style={[styles.timestamp, { color: variantStyles.titleColor }]}
            >
              {formatTimestamp(sentAt)}
            </Text>
          ) : null}
        </View>

        {icon ? (
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: variantStyles.iconBgColor },
              iconContainerStyle,
            ]}
          >
            {React.createElement(icon, {
              width: 16,
              height: 16,
              style: iconStyle,
            })}
          </View>
        ) : null}
      </View>
    </View>
  );

  if (onPress && !disabled) {
    return (
      <Pressable style={styles.pressable} onPress={onPress}>
        {cardContent}
      </Pressable>
    );
  }

  return cardContent;
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.secondaryFontColor,
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  contentContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  textContainer: {
    flex: 1,
    marginRight: 10,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  title: {
    fontSize: 14,
    fontFamily: 'Manrope-Bold',
    marginBottom: 4,
  },
  description: {
    color: COLORS.primaryFontColor,
    fontSize: 12,
    fontFamily: 'Manrope-Regular',
    marginBottom: 2,
  },
  iconContainer: {
    width: 30,
    height: 30,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unreadContainer: {
    backgroundColor: '#F8F9FF',
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primaryColor,
  },
  unreadTitle: {
    fontFamily: 'Manrope-Bold',
  },
  timestamp: {
    fontSize: 10,
    fontFamily: 'Manrope-Regular',
    opacity: 0.7,
    marginTop: 4,
  },
  pressable: {
    width: '100%',
  },
});

export default NotificationCard;

