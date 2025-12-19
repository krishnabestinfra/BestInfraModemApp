import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import RippleLogo from '../components/global/RippleLogo';
import AppHeader from '../components/global/AppHeader';
import Button from '../components/global/Button';
import PhotoUpload from '../components/global/PhotoUpload';
import { colors, spacing, borderRadius } from '../styles/theme';
import { COLORS } from '../constants/colors';
import NotificationLight from '../../assets/icons/notification.svg';

if (!Text.defaultProps) Text.defaultProps = {};
Text.defaultProps.style = [{ fontFamily: 'Manrope-Regular' }];

const ReplacedModemDetailScreen = ({ navigation, route }) => {
  const [oldModem, setOldModem] = useState(route?.params?.oldModem || 'MDM001');
  const [newModem, setNewModem] = useState(route?.params?.newModem || '');
  const [remarks, setRemarks] = useState('');
  const [images, setImages] = useState([null, null]);

  const handleImagesChange = (newImages) => {
    setImages(newImages);
  };

  const handleSubmit = () => {
    if (!oldModem.trim() || !newModem.trim()) {
      Alert.alert('Validation', 'Please fill in both Old Modem and New Modem fields');
      return;
    }
    Alert.alert('Success', 'Modem replacement recorded successfully', [
      { text: 'OK', onPress: () => navigation.goBack() },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={[]}>
      <StatusBar style="dark" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <LinearGradient colors={['#f4fbf7', '#e6f4ed']} style={styles.header}>
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
          <View style={styles.titleSection}>
            <View style={styles.iconBox}>
              <Ionicons name="swap-horizontal" size={32} color={colors.secondary} />
            </View>
            <Text style={styles.title}>Modem Replaced</Text>
          </View>
        </LinearGradient>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Old Modem</Text>
            <TextInput style={styles.input} value={oldModem} onChangeText={setOldModem} placeholder="Enter old modem ID" placeholderTextColor="#6E6E6E" />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>New Modem</Text>
            <TextInput style={styles.input} value={newModem} onChangeText={setNewModem} placeholder="Enter new modem ID" placeholderTextColor="#6E6E6E" />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Remarks</Text>
            <TextInput style={styles.textArea} value={remarks} onChangeText={setRemarks} placeholder="Enter remarks" placeholderTextColor="#6E6E6E" multiline numberOfLines={4} textAlignVertical="top" />
          </View>
          <PhotoUpload
            images={images}
            onImagesChange={handleImagesChange}
            maxImages={2}
          />
        </View>
      </ScrollView>
      <View style={styles.submitContainer}>
        <Button title="Submit" onPress={handleSubmit} variant="primary" size="large" style={{ width: '100%' }} />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  header: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.lg,
    overflow: 'hidden',
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
  titleSection: {
    alignItems: 'center',
    marginTop: spacing.md,
  },
  iconBox: {
    width: 80,
    height: 80,
    borderRadius: 16,
    backgroundColor: colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  title: {
    fontSize: 20,
    color: COLORS.primaryColor,
    fontFamily: 'Manrope-SemiBold',
  },
  form: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
  },
  inputGroup: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: 14,
    color: COLORS.primaryFontColor,
    fontFamily: 'Manrope-Medium',
    marginBottom: spacing.xs,
  },
  input: {
    backgroundColor: '#F8F8F8',
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.ms,
    fontSize: 14,
    fontFamily: 'Manrope-Regular',
    color: COLORS.primaryFontColor,
  },
  textArea: {
    backgroundColor: '#F8F8F8',
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.ms,
    fontSize: 14,
    fontFamily: 'Manrope-Regular',
    color: COLORS.primaryFontColor,
    minHeight: 100,
  },
  submitContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: '#F8F8F8',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
});

export default ReplacedModemDetailScreen;
