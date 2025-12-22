import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Image as ExpoImage } from 'expo-image';
import AppHeader from '../components/global/AppHeader';
import Button from '../components/global/Button';
import PhotoUpload from '../components/global/PhotoUpload';
import { colors, spacing, borderRadius } from '../styles/theme';
import { COLORS } from '../constants/colors';
import CheckCircleIcon from '../../assets/icons/successIcon.svg';
import successImg from '../../assets/images/Success_page.gif';

if (!Text.defaultProps) Text.defaultProps = {};
Text.defaultProps.style = [{ fontFamily: 'Manrope-Regular' }];

const ModemReplacementSuccessScreen = ({ navigation, route }) => {
  const { oldModem, newModem, isReplaced = true } = route?.params || {};
  const [remark, setRemark] = useState('');
  const [images, setImages] = useState([null, null]);

  const handleSubmit = () => {
    // Navigate back to Dashboard
    navigation.reset({
      index: 0,
      routes: [{ name: 'Dashboard' }],
    });
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={[]}>
      <StatusBar style="dark" />
      <AppHeader navigation={navigation} />
      <LinearGradient colors={['#FFFFFF', '#F5F5F5']} style={styles.backgroundGradient}>
        <ScrollView 
          showsVerticalScrollIndicator={false} 
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.content}>
            {/* Success Indicator */}
            <View style={styles.successCard}>
              <ExpoImage
                source={successImg}
                style={styles.successImage}
                contentFit="contain"
              />
              <View style={styles.successTitleContainer}>
                <CheckCircleIcon width={18} height={18} />
                <Text style={styles.successTitle}>Success</Text>
              </View>
            </View>

            {/* Show remark box and image upload only when modem is not replaced */}
            {!isReplaced && (
              <>
                {/* Remark Box */}
                <View style={styles.remarkContainer}>
                  <Text style={styles.remarkLabel}>Remarks</Text>
                  <TextInput
                    style={styles.remarkInput}
                    placeholder="Enter remarks..."
                    placeholderTextColor={colors.textSecondary}
                    value={remark}
                    onChangeText={setRemark}
                    multiline
                    numberOfLines={6}
                    textAlignVertical="top"
                  />
                </View>

                {/* Image Upload Section */}
                <View style={styles.uploadSection}>
                  <PhotoUpload
                    images={images}
                    onImagesChange={setImages}
                    maxImages={2}
                    uploadButtonText="Upload"
                    takePhotoButtonText="Take Photo"
                  />
                </View>
              </>
            )}

            {/* Show success message when modem is replaced */}
            {isReplaced && (
              <View style={styles.messageContainer}>
                <Text style={styles.successSubtitle}>
                  {oldModem && newModem 
                    ? `Old Modem: ${oldModem} has been replaced with New Modem: ${newModem}`
                    : 'Modem replacement recorded successfully'}
                </Text>
              </View>
            )}
          </View>
        </ScrollView>

        {/* Submit Button - Fixed at bottom */}
        <View style={styles.submitContainer}>
          <Button 
            title="Submit" 
            onPress={handleSubmit} 
            style={styles.submitButton}
            variant="primary"
            size="large"
          />
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  backgroundGradient: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
  },
  content: {
    width: '100%',
    alignItems: 'center',
  },
  successCard: {
    width: '100%',
    borderRadius: borderRadius.xl,
    backgroundColor: '#fff',
    padding: spacing.md,
    alignItems: 'center',
    marginBottom: spacing.xl,
    marginTop: spacing.md,
  },
  successImage: {
    width: '100%',
    height: 150,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
  },
  successTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  successTitle: {
    fontSize: 24,
    color: colors.secondary,
    fontFamily: 'Manrope-SemiBold',
  },
  messageContainer: {
    width: '100%',
    paddingHorizontal: spacing.sm,
    marginTop: spacing.lg,
  },
  successSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    fontFamily: 'Manrope-Regular',
    textAlign: 'center',
  },
  remarkContainer: {
    width: '100%',
    marginTop: spacing.lg,
    marginBottom: spacing.lg,
  },
  remarkLabel: {
    fontSize: 14,
    color: COLORS.primaryFontColor,
    fontFamily: 'Manrope-SemiBold',
    marginBottom: spacing.sm,
  },
  remarkInput: {
    width: '100%',
    minHeight: 120,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: 14,
    color: COLORS.primaryFontColor,
    fontFamily: 'Manrope-Regular',
    backgroundColor: '#FFFFFF',
  },
  uploadSection: {
    width: '100%',
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  submitContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxl,
    backgroundColor: '#FFFFFF',
  },
  submitButton: {
    width: '100%',
    borderRadius: 5,
  },
});

export default ModemReplacementSuccessScreen;
