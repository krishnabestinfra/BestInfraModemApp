// ModemDetailsScreen.js
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, borderRadius, typography, shadows } from '../styles/theme';
import { Picker } from '@react-native-picker/picker';

const ModemDetailsScreen = ({ route, navigation }) => {
  const { modem, isNonCommunicating } = route.params; // modem object and tab info passed from ErrorDetailsScreen
  const [selectedReason, setSelectedReason] = useState('');
  const [notes, setNotes] = useState('');

  const handleResolve = () => {
    // Add API call or state update logic here
    alert(`Modem ${modem.modemId} marked as resolved with reason: ${selectedReason}`);
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Modem Details</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Modem Info */}
        <View style={styles.infoCard}>
          <Text style={styles.label}>Modem ID</Text>
          <Text style={styles.value}>{modem.modemId}</Text>

          <Text style={styles.label}>Status</Text>
          <Text style={styles.value}>{modem.status}</Text>

          <Text style={styles.label}>Error</Text>
          <Text style={styles.value}>{modem.error}</Text>

          <Text style={styles.label}>Reason</Text>
          <Text style={styles.value}>{modem.reason}</Text>

          <Text style={styles.label}>Location</Text>
          <Text style={styles.value}>{modem.location}</Text>

          <Text style={styles.label}>Date</Text>
          <Text style={styles.value}>{modem.date}</Text>

          <Text style={styles.label}>Signal Strength</Text>
          <Text style={styles.value}>{modem.signalStrength}</Text>
        </View>

        {/* Conditional rendering based on tab */}
        {!isNonCommunicating && (
          <>
            {/* Dropdown */}
            <Text style={styles.label}>Resolution Type</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={selectedReason}
                onValueChange={(itemValue) => setSelectedReason(itemValue)}
              >
                <Picker.Item label="Select resolution..." value="" />
                <Picker.Item label="Restarted Modem" value="restarted" />
                <Picker.Item label="Replaced Hardware" value="replaced" />
                <Picker.Item label="Network Issue Fixed" value="network_fixed" />
              </Picker>
            </View>

            {/* Notes */}
            <Text style={styles.label}>Notes</Text>
            <TextInput
              style={styles.textArea}
              placeholder="Write any additional notes..."
              placeholderTextColor={colors.textSecondary}
              multiline
              numberOfLines={4}
              value={notes}
              onChangeText={setNotes}
            />

            {/* Resolve Button */}
            <TouchableOpacity style={styles.resolveButton} onPress={handleResolve}>
              <Text style={styles.resolveButtonText}>Mark as Resolved</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    backgroundColor: colors.cardBackground,
    ...shadows.small,
  },
  backButton: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '600',
  },
  title: {
    ...typography.h2,
    color: colors.textPrimary,
  },
  placeholder: {
    width: 50,
  },
  content: {
    padding: spacing.md,
  },
  infoCard: {
    backgroundColor: colors.cardBackground,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.lg,
    ...shadows.small,
  },
  label: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },
  value: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  pickerContainer: {
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.lg,
  },
  textArea: {
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    fontSize: 14,
    color: colors.textPrimary,
    textAlignVertical: 'top',
    marginBottom: spacing.lg,
  },
  resolveButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.round,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  resolveButtonText: {
    color: colors.cardBackground,
    fontWeight: '600',
    fontSize: 16,
  },
});

export default ModemDetailsScreen;
