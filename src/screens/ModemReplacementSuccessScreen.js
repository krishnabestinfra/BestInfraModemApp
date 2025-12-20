import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Image as ExpoImage } from 'expo-image';
import AppHeader from '../components/global/AppHeader';
import Button from '../components/global/Button';
import { colors, spacing, borderRadius } from '../styles/theme';
import { COLORS } from '../constants/colors';
import CheckCircleIcon from '../../assets/icons/successIcon.svg';
import successImg from '../../assets/images/Success_page.gif';

if (!Text.defaultProps) Text.defaultProps = {};
Text.defaultProps.style = [{ fontFamily: 'Manrope-Regular' }];

const ModemReplacementSuccessScreen = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  const { oldModem, newModem } = route?.params || {};

  const handleContinue = () => {
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
      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={styles.scrollContent}
      >

        <View style={styles.content}>
          <View style={styles.successCard}>
            <ExpoImage
              source={successImg}
              style={styles.successImage}
              contentFit="contain"
            />

            <View style={styles.successImageContainer}>
              <CheckCircleIcon width={18} height={18} />
              <Text style={styles.successTitle}>Success</Text>
            </View>

            <Text style={styles.successSubtitle}>Modem replacement recorded successfully</Text>
            <Text style={styles.successBody}>
              {oldModem && newModem 
                ? `Old Modem: ${oldModem} has been replaced with New Modem: ${newModem}`
                : 'The modem replacement details have been saved successfully.'}
            </Text>

            <Button 
              title="Continue" 
              onPress={handleContinue} 
              style={{ width: '100%', marginTop: spacing.md }}
              variant="primary"
              size="large"
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: spacing.xl,
  },
  topMenu: {
    paddingTop: 10,
    paddingBottom: 5,
  },
  iconBtn: {
    backgroundColor: COLORS.secondaryFontColor,
    width: 54,
    height: 54,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xl,
  },
  successCard: {
    width: '100%',
    borderRadius: borderRadius.xl,
    backgroundColor: '#fff',
    padding: spacing.md,
    alignItems: 'center',
  },
  successImage: {
    width: '100%',
    height: 150,
    borderRadius: borderRadius.lg,
  },
  successImageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md,
  },
  successTitle: {
    fontSize: 24,
    color: colors.secondary,
    marginLeft: 8,
    fontFamily: 'Manrope-SemiBold',
  },
  successSubtitle: {
    fontSize: 16,
    marginTop: spacing.xs,
    color: COLORS.primaryFontColor,
    fontFamily: 'Manrope-Medium',
    textAlign: 'center',
  },
  successBody: {
    fontSize: 14,
    marginTop: spacing.xs,
    textAlign: 'center',
    color: colors.textSecondary,
    fontFamily: 'Manrope-Regular',
    paddingHorizontal: spacing.sm,
  },
});

export default ModemReplacementSuccessScreen;
