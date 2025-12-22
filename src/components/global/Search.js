import React from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { colors, spacing } from '../../styles/theme';
import SearchIcon from '../../../assets/icons/searchIcon.svg';

const Search = ({ 
  value, 
  onChangeText, 
  placeholder = 'Quick Search',
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
    flex: 1,
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
});

export default Search;

