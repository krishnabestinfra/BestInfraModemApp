import React from 'react';
import { Modal, View, Text, StyleSheet, Linking } from 'react-native';
import { colors, spacing, borderRadius, typography } from '../styles/theme';
import Button from './global/Button';

const ForceUpdateModal = ({ visible, message, storeUrl }) => {
  const handleUpdate = () => {
    if (storeUrl) {
      Linking.openURL(storeUrl).catch(() => {});
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.content}>
          <Text style={styles.icon}>⚠️</Text>
          <Text style={styles.title}>Update Required</Text>
          <Text style={styles.message}>
            {message || 'Please update to the latest version to continue.'}
          </Text>
          <Button
            title="Update Now"
            onPress={handleUpdate}
            variant="primary"
            size="large"
            style={styles.button}
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  content: {
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    alignItems: 'center',
    width: '100%',
    maxWidth: 400,
  },
  icon: {
    fontSize: 64,
    marginBottom: spacing.md,
  },
  title: {
    ...typography.h2,
    color: colors.textPrimary,
    marginBottom: spacing.md,
    fontFamily: 'Manrope-Bold',
  },
  message: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
    fontFamily: 'Manrope-Regular',
  },
  button: {
    width: '100%',
  },
});

export default ForceUpdateModal;
