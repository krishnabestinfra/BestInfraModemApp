import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import RippleLogo from '../components/global/RippleLogo';
import AppHeader from '../components/global/AppHeader';
import Button from '../components/global/Button';
import { colors, spacing, borderRadius } from '../styles/theme';
import { COLORS } from '../constants/colors';
import NotificationLight from '../../assets/icons/notification.svg';
import IssueNotResolvedGif from '../../assets/IssueNotresolved.gif';

if (!Text.defaultProps) Text.defaultProps = {};
Text.defaultProps.style = [{ fontFamily: 'Manrope-Regular' }];

const IssueNotResolvedScreen = ({ navigation }) => {
  const [remarks, setRemarks] = useState('');

  const handleSubmit = () => {
    navigation.navigate('Dashboard', { refresh: true });
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={[]}>
      <StatusBar style="dark" />
      <View style={styles.container}>
        <LinearGradient colors={['#f4fbf7', '#e6f4ed']} style={styles.headerGradient}>
          <View style={styles.header}>
            <AppHeader
              containerStyle={styles.headerTop}
              leftButtonStyle={styles.iconBtn}
              rightButtonStyle={styles.iconBtn}
              rightIcon={NotificationLight}
              logo={<RippleLogo size={68} />}
              onPressLeft={() => navigation.navigate('SideMenu')}
              onPressCenter={() => navigation.navigate('Dashboard')}
              onPressRight={() => navigation.navigate('Profile')}
            />
          </View>
        </LinearGradient>

        <ScrollView 
          showsVerticalScrollIndicator={false} 
          contentContainerStyle={styles.scrollContent}
          style={styles.scrollView}
        >
          <View style={styles.contentCard}>
            <View style={styles.errorIconContainer}>
              <Image 
                source={IssueNotResolvedGif} 
                style={styles.errorIcon}
                resizeMode="contain"
              />
            </View>

            <Text style={styles.title}>Issue Not Resolved</Text>

            <View style={styles.remarksContainer}>
              <Text style={styles.remarksLabel}>Remarks</Text>
              <TextInput
                style={styles.remarksInput}
                placeholder="Enter remarks..."
                placeholderTextColor="#898992"
                multiline
                value={remarks}
                onChangeText={setRemarks}
              />
            </View>
          </View>
        </ScrollView>

        <View style={styles.submitContainer}>
          <Button
            title="Submit"
            onPress={handleSubmit}
            variant="primary"
            size="large"
            style={styles.submitButton}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  headerGradient: {
    paddingBottom: spacing.xs,
  },
  header: {
    paddingHorizontal: spacing.md,
  },
  scrollView: {
    backgroundColor: '#fff',
  },
  headerTop: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  iconBtn: {
    backgroundColor: COLORS.secondaryFontColor,
    width: 54,
    height: 54,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: 100,
    paddingTop: spacing.md,
  },
  contentCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    alignItems: 'center',
    shadowColor: 'rgba(22, 59, 124, 0.18)',
    shadowOffset: { width: 6, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  errorIconContainer: {
    marginBottom: spacing.md,
  },
  errorIcon: {
    width: 100,
    height: 100,
  },
  title: {
    fontSize: 20,
    fontFamily: 'Manrope-SemiBold',
    color: '#163B7C',
    marginBottom: spacing.xl,
    textAlign: 'center',
  },
  remarksContainer: {
    width: '100%',
    marginBottom: spacing.lg,
  },
  remarksLabel: {
    fontSize: 14,
    fontFamily: 'Manrope-Medium',
    color: '#163B7C',
    marginBottom: spacing.sm,
  },
  remarksInput: {
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    minHeight: 100,
    textAlignVertical: 'top',
    fontSize: 14,
    fontFamily: 'Manrope-Regular',
    color: '#163B7C',
  },
  submitContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
    backgroundColor: '#fff',
  },
  submitButton: {
    width: '100%',
    borderRadius: 5,
  },
});

export default IssueNotResolvedScreen;

