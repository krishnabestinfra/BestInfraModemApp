import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { formatDisplayDateTime } from '../utils/dateUtils';
import { getErrorType } from '../utils/modemHelpers';
import { COLORS } from '../constants/colors';
import { spacing } from '../styles/theme';
import ModemIcon from '../../assets/icons/greenMeter.svg';
import CalendarIcon from '../../assets/icons/greenCalendar.svg';
import LocationIcon from '../../assets/icons/greenMap.svg';
import Meter from '../../assets/images/meter.png';

const VisitedModemCard = React.memo(({ item, dateLabel = 'Visited', showPhotos = true }) => {
  const dateValue = item.date || item.resolvedAt || 'N/A';
  const formattedDate = dateValue !== 'N/A' ? formatDisplayDateTime(dateValue) : 'N/A';

  return (
    <View style={styles.visitedCard}>
      <View style={styles.visitedCardRow}>
        <View style={styles.iconTextRow}>
          <ModemIcon width={16} height={16} />
          <Text style={styles.modemIdText}>{item.modemId}</Text>
        </View>
        <Text style={styles.statusText}>{getErrorType(item.code, item.error || item.status)}</Text>
      </View>

      <View style={styles.detailRow}>
        <CalendarIcon width={16} height={16} />
        <View style={styles.detailTextContainer}>
          <Text style={styles.detailValue}>
            {dateLabel}: {formattedDate}
          </Text>
        </View>
      </View>

      <View style={styles.detailRow}>
        <LocationIcon width={16} height={16} />
        <View style={styles.detailTextContainer}>
          <Text style={styles.detailValue}>Location: {item.location}</Text>
        </View>
      </View>

      {showPhotos && (
        <View style={styles.photosSection}>
          <Text style={styles.photosLabel}>Photos</Text>
          <View style={styles.photoThumbnailContainer}>
            <Image 
              source={item.photos?.[0] || Meter} 
              style={styles.photoThumbnail} 
              resizeMode="cover" 
            />
          </View>
        </View>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  visitedCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 5,
    padding: 12,
    borderWidth: 1,
    borderColor: '#F8F8F8',
    marginBottom: spacing.md,
    elevation: 0.3,
    gap: 10,
  },
  visitedCardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  iconTextRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modemIdText: {
    fontSize: 14,
    fontFamily: 'Manrope-Medium',
    color: COLORS.primaryFontColor,
  },
  statusText: {
    fontSize: 12,
    color: '#55B56C',
    fontFamily: 'Manrope-SemiBold',
  },
  detailRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  detailTextContainer: {
    flex: 1,
  },
  detailValue: {
    fontSize: 14,
    color: COLORS.primaryFontColor,
    fontFamily: 'Manrope-Medium',
  },
  photosSection: {
    marginTop: 4,
  },
  photosLabel: {
    fontSize: 14,
    fontFamily: 'Manrope-Medium',
    color: COLORS.primaryFontColor,
    marginBottom: 8,
  },
  photoThumbnailContainer: {
    width: 80,
    height: 80,
    borderRadius: 5,
    overflow: 'hidden',
    backgroundColor: '#F8F8F8',
  },
  photoThumbnail: {
    width: '100%',
    height: '100%',
  },
});

VisitedModemCard.displayName = 'VisitedModemCard';

export default VisitedModemCard;
