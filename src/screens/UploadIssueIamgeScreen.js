import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, AppState } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AppHeader from '../components/global/AppHeader';
import Button from '../components/global/Button';
import PhotoUpload from '../components/global/PhotoUpload';
import ConfirmationModal from '../components/global/ConfirmationModal';
import { colors, spacing, borderRadius } from '../styles/theme';
import { COLORS } from '../constants/colors';

if (!Text.defaultProps) Text.defaultProps = {};
Text.defaultProps.style = [{ fontFamily: 'Manrope-Regular' }];

const UploadIssueImageScreen = ({ navigation, route }) => {
  const modem = route?.params?.modem;
  const status = route?.params?.status;
  const [images, setImages] = useState([null, null]);
  const [validationModalVisible, setValidationModalVisible] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      return () => {
      };
    }, [])
  );

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active') {
      }
    });

    return () => {
      subscription?.remove();
    };
  }, []);

  const handleImagesChange = (newImages) => {
    setImages(newImages);
  };

  const handleStartTroubleshooting = () => {
    const hasImages = images.some(img => img !== null);
    if (!hasImages) {
      setValidationModalVisible(true);
      return;
    }

    navigation?.navigate?.('Troubleshoot', { 
      modem: modem || { 
        modemId: modem?.modemId || modem?.modemSlNo || modem?.modemno,
        errorCode: modem?.errorCode 
      },
      status: status 
    });
  };

  const handleCloseValidationModal = () => {
    setValidationModalVisible(false);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={[]}>
      <StatusBar style="dark" />
      <AppHeader navigation={navigation}>
        <View style={styles.infoBanner}>
          <Ionicons name="information-circle" size={20} color={COLORS.secondaryFontColor} />
          <Text style={styles.infoBannerText}>Please Upload Issue Images</Text>
        </View>
      </AppHeader>
      <LinearGradient colors={['#FFFFFF', '#F5F5F5']} style={styles.backgroundGradient}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <View style={styles.uploadCard}>
            <PhotoUpload
              images={images}
              onImagesChange={handleImagesChange}
              maxImages={2}
              uploadButtonText="Upload"
              takePhotoButtonText="Take Photo"
            />
          </View>
        </ScrollView>

        <View style={styles.submitContainer}>
          <Button
            title="Start Troubleshooting"
            onPress={handleStartTroubleshooting}
            variant="primary"
            size="large"
            style={{ width: '100%', borderRadius: 5 }}
          />
        </View>
      </LinearGradient>

      <ConfirmationModal
        visible={validationModalVisible}
        title="Validation"
        message="Please upload at least one image"
        onCancel={handleCloseValidationModal}
        onConfirm={handleCloseValidationModal}
        cancelText="Cancel"
        confirmText="OK"
        confirmButtonColor="#55B56C"
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  backgroundGradient: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  iconBtn: {
    backgroundColor: COLORS.secondaryFontColor,
    width: 54,
    height: 54,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.secondary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.ms,
    borderRadius: borderRadius.md,
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  infoBannerText: {
    fontSize: 14,
    color: COLORS.secondaryFontColor,
    fontFamily: 'Manrope-Medium',
    flex: 1,
  },
  uploadCard: {
    backgroundColor: colors.cardBackground,
    marginHorizontal: spacing.md,
    marginTop: 7,
    borderRadius: 5,
    padding: spacing.lg,
  },
  submitContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxl,
  },
});

export default UploadIssueImageScreen;


