import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Pressable } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors, spacing } from '../../styles/theme';
import FilterIcon from '../../../assets/icons/filter.svg';

const Filter = ({
  filterOptions = [],
  sortOptions = [
    { label: 'Newest First', value: 'newest' },
    { label: 'Oldest First', value: 'oldest' },
  ],
  initialFilters = { statuses: [], signal: 'all', errorType: 'all', sortBy: 'newest' },
  onFiltersChange,
  hasActiveFilters: externalHasActiveFilters,
  modalTitle = 'Filter Alerts',
  style,
}) => {
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState(initialFilters);
  const [draftFilters, setDraftFilters] = useState(initialFilters);

  // Sync with external initialFilters if they change
  useEffect(() => {
    setAppliedFilters(initialFilters);
    setDraftFilters(initialFilters);
  }, [initialFilters]);

  const hasActiveFilters = externalHasActiveFilters !== undefined 
    ? externalHasActiveFilters 
    : appliedFilters.statuses.length > 0 || 
      appliedFilters.signal !== 'all' || 
      appliedFilters.errorType !== 'all';

  const handleResetFilters = useCallback(() => {
    const cleared = { statuses: [], signal: 'all', errorType: 'all', sortBy: 'newest' };
    setAppliedFilters(cleared);
    setDraftFilters(cleared);
    if (onFiltersChange) {
      onFiltersChange(cleared);
    }
  }, [onFiltersChange]);

  const handleApplyFilters = useCallback(() => {
    setAppliedFilters(draftFilters);
    setFilterModalVisible(false);
    if (onFiltersChange) {
      onFiltersChange(draftFilters);
    }
  }, [draftFilters, onFiltersChange]);

  const handleCloseModal = useCallback(() => {
    setDraftFilters(appliedFilters); // Reset draft to applied filters
    setFilterModalVisible(false);
  }, [appliedFilters]);

  return (
    <>
      <TouchableOpacity 
        style={[styles.filterButton, style]} 
        onPress={() => setFilterModalVisible(true)}
      >
        <FilterIcon width={20} height={20} />
        {hasActiveFilters && <View style={styles.filterActiveDot} />}
      </TouchableOpacity>

      <Modal transparent visible={filterModalVisible} animationType="fade">
        <View style={styles.modalOverlay}>
          <Pressable style={styles.modalBackdrop} onPress={handleCloseModal} />
          <View style={styles.filterModalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{modalTitle}</Text>
              <Pressable onPress={handleCloseModal}>
                <Ionicons name="close" size={22} />
              </Pressable>
            </View>

            {filterOptions.length > 0 && (
              <View style={styles.modalSection}>
                <Text style={styles.modalSectionLabel}>Error Type</Text>
                <View style={styles.chipGroup}>
                  {filterOptions.map((opt) => {
                    const active = draftFilters.errorType === opt.value;
                    return (
                      <TouchableOpacity
                        key={opt.value}
                        onPress={() => setDraftFilters((p) => ({ ...p, errorType: opt.value }))}
                        style={[styles.filterChip, active && styles.filterChipActive]}
                      >
                        <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>
                          {opt.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            )}

            {sortOptions.length > 0 && (
              <View style={styles.modalSection}>
                <Text style={styles.modalSectionLabel}>Sort By</Text>
                <View style={styles.chipGroup}>
                  {sortOptions.map((opt) => {
                    const active = draftFilters.sortBy === opt.value;
                    return (
                      <TouchableOpacity
                        key={opt.value}
                        onPress={() => setDraftFilters((p) => ({ ...p, sortBy: opt.value }))}
                        style={[styles.filterChip, active && styles.filterChipActive]}
                      >
                        <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>
                          {opt.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            )}

            <View style={styles.modalActions}>
              <TouchableOpacity 
                onPress={handleResetFilters} 
                style={[styles.modalButton, styles.modalButtonGhost]}
              >
                <Text style={[styles.modalButtonText, styles.modalButtonGhostText]}>Reset</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleApplyFilters}
                style={[styles.modalButton, styles.modalButtonPrimary]}
              >
                <Text style={styles.modalButtonText}>Apply</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  filterButton: {
    marginLeft: 5,
    backgroundColor: '#fff',
    marginTop: 8,
    padding: 10,
    borderRadius: 5,
    marginRight: 10,
    position: 'relative',
  },
  filterActiveDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.secondary,
    position: 'absolute',
    top: 8,
    right: 8,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
    backgroundColor: 'rgba(4, 12, 34, 0.45)',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  filterModalCard: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: spacing.lg,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: 'Manrope-SemiBold',
  },
  modalSection: {
    marginBottom: spacing.lg,
  },
  modalSectionLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    fontFamily: 'Manrope-SemiBold',
  },
  chipGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  filterChip: {
    borderWidth: 1,
    borderColor: '#dfe5eb',
    borderRadius: 999,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    backgroundColor: '#fff',
  },
  filterChipActive: {
    backgroundColor: '#e6f4ed',
    borderColor: colors.secondary,
  },
  filterChipText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontFamily: 'Manrope-Medium',
  },
  filterChipTextActive: {
    color: colors.secondary,
    fontFamily: 'Manrope-SemiBold',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  modalButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalButtonGhost: {
    borderWidth: 1,
    borderColor: '#dfe5eb',
    backgroundColor: '#fff',
  },
  modalButtonPrimary: {
    backgroundColor: colors.secondary,
  },
  modalButtonText: {
    fontSize: 15,
    fontFamily: 'Manrope-SemiBold',
    color: '#fff',
  },
  modalButtonGhostText: {
    color: colors.textPrimary,
  },
});

export default Filter;

