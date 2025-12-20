import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS } from '../../constants/colors';

const TabNavigation = ({ tabs, activeTab, onTabChange, style }) => {
  return (
    <View style={[styles.tabsContainer, style]}>
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab.key}
          style={[styles.tab, activeTab === tab.key && styles.tabActive]}
          onPress={() => onTabChange(tab.key)}
          activeOpacity={0.7}
        >
          <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>
            {tab.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  tabsContainer: {
    flexDirection: 'row',
    marginTop: 10,
    marginLeft: 20, // Match search bar left margin
    marginRight: 10, // Match search bar right margin (where filter button ends)
    borderRadius: 8,
    padding: 3,
    gap: 0,
    backgroundColor: '#f8f8f8', // Container background
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent', // Transparent to show container background
  },
  tabActive: {
    backgroundColor: '#FFFFFF', // White for active tab
  },
  tabText: {
    fontSize: 14,
    color: '#898992', 
    fontFamily: 'Manrope-Medium',
  },
  tabTextActive: {
    color: '#000000', // Black for active text
    fontFamily: 'Manrope-SemiBold',
  },
});

export default TabNavigation;

