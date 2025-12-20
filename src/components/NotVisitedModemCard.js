import React from 'react';
import { View, Text, StyleSheet, Image, Pressable, TouchableOpacity, Platform, Linking, Alert } from 'react-native';
import { formatDisplayDateTime } from '../utils/dateUtils';
import { getSignalBand, getErrorType } from '../utils/modemHelpers';
import { colors, spacing } from '../styles/theme';
import SignalWeaknessIcon from '../../assets/icons/Signal-Weak.svg';
import SignalAverageIcon from '../../assets/icons/Signal-Moderate.svg';
import SignalStrongIcon from '../../assets/icons/Signal-Strong.svg';
import Meter from '../../assets/images/meter.png';

const NotVisitedModemCard = React.memo(({ modem, navigation, onPress, onDirectionPress }) => {
  const getSignalIcon = () => {
    const band = getSignalBand(modem.signalStrength);
    if (band === 'weak') return <SignalWeaknessIcon width={20} height={20} />;
    if (band === 'average') return <SignalAverageIcon width={20} height={20} />;
    return <SignalStrongIcon width={20} height={20} />;
  };

  const handleCardPress = () => {
    if (onPress) {
      onPress(modem);
    } else if (navigation) {
      navigation.navigate('ModemDetails', {
        modem,
        modemSlNo: modem.modemId,
      });
    }
  };

  const handleDirection = async () => {
    if (onDirectionPress) {
      onDirectionPress(modem);
      return;
    }

    const lat = 17.3850;
    const lon = 78.4867;
    const url = Platform.OS === 'ios'
      ? `http://maps.apple.com/?daddr=${lat},${lon}`
      : `https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}`;

    Linking.openURL(url).catch(() => {
      Alert.alert('Cannot open maps', 'Install Google Maps or Apple Maps to use directions.');
    });
  };

  return (
    <Pressable onPress={handleCardPress} style={styles.notVisitedCard}>
      <View style={styles.itemHeader}>
        <View style={styles.itemIdContainer}>
          <Text style={styles.itemId}>{modem.modemId}</Text>
          <Text style={styles.itemImei}>Error Code – {modem.code}</Text>
        </View>

        <TouchableOpacity style={styles.directionButton} onPress={handleDirection}>
          <Text style={styles.directionButtonText}>Get Direction</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.itemDetails}>
        <View style={styles.photoSection}>
          <Image source={modem.photos?.[0] || Meter} style={styles.photoImage} resizeMode="cover" />
        </View>

        <View style={styles.subDataSection}>
          <View style={styles.subDataRow}>
            <View style={styles.subDataItem}>
              <Text style={styles.detailLabel}>Error Type</Text>
              <Text style={styles.detailValueGreen}>{getErrorType(modem.code, modem.error)}</Text>
            </View>

            <View style={styles.subDataItem}>
              <Text style={styles.detailLabel}>Signal</Text>
              <View style={styles.signalStrengthContainer}>
                {getSignalIcon()}
                <Text style={styles.signalStrengthText}>{modem.signalStrength} dBm</Text>
              </View>
            </View>
          </View>

          <View style={styles.subDataRow}>
            <View style={styles.subDataItem}>
              <Text style={styles.detailLabel}>HES Status</Text>
              <View style={styles.statusPillPending}>
                <Text style={styles.statusPillText}>Pending</Text>
              </View>
            </View>

            <View style={styles.subDataItem}>
              <Text style={styles.detailLabel}>Occurred On</Text>
              <Text style={styles.datedetails}>{formatDisplayDateTime(modem.date)}</Text>
            </View>
          </View>
        </View>
      </View>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  notVisitedCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 15,
    borderWidth: 1,
    borderColor: '#F8F8F8',
    marginBottom: spacing.md,
    elevation: 0.5,
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
    height: 115,
  },
  photoImage: {
    width: '100%',
    height: '140%',
    borderRadius: 5,
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
  signalStrengthContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  signalStrengthText: {
    fontSize: 12,
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
    fontFamily: 'Manrope-Regular',
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
  directionButton: {
    backgroundColor: colors.secondary,
    borderRadius: 5,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  directionButtonText: {
    color: '#fff',
    fontSize: 13,
    fontFamily: 'Manrope-Bold',
  },
});

NotVisitedModemCard.displayName = 'NotVisitedModemCard';

export default NotVisitedModemCard;
