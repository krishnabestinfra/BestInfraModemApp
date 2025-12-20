import React from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, spacing } from '../../styles/theme';
import SearchIcon from '../../../assets/icons/searchIcon.svg';
import FilterIcon from '../../../assets/icons/filter.svg';

const SearchBar = ({ 
  value, 
  onChangeText, 
  placeholder = 'Quick Search',
  onFilterPress,
  showFilter = true,
  hasActiveFilters = false,
  style,
}) => {
  return (
    <View style={[styles.searchCardWrapper, style]}>
      <View style={styles.searchCard}>
        <TextInput
          placeholder={placeholder}
          placeholderTextColor={colors.textSecondary}
          value={value}
          onChangeText={onChangeText}
          style={styles.searchInput}
        />
        <SearchIcon width={16} height={16} />
      </View>

      {showFilter && (
        <TouchableOpacity style={styles.filterButton} onPress={onFilterPress}>
          <FilterIcon width={20} height={20} />
          {hasActiveFilters && <View style={styles.filterActiveDot} />}
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  searchCardWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 7,
    paddingBottom: 14,
  },
  searchCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
    marginHorizontal: 20,
    height: 45,
    paddingHorizontal: 10,
    borderRadius: 5,
    marginTop: 10,
    flex: 1,
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    paddingHorizontal: spacing.sm,
    color: '#6E6E6E',
    fontFamily: 'Manrope-Regular',
    fontSize: 14,
  },
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
});

export default SearchBar;

