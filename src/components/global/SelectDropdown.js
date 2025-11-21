import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, FlatList } from 'react-native';
import { COLORS } from '../../constants/colors';
import DropdownIcon from '../../../assets/icons/dropDown.svg';

const SelectDropdown = ({
  placeholder = 'Select an option',
  value,
  onSelect,
  options = [],
  variant = 'default',
  size = 'medium',
  style,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (option) => {
    onSelect(option);
    setIsOpen(false);
  };

  const getContainerStyle = () => {
    const baseStyle = [styles.container, styles[`${variant}Container`], styles[size]];
    return baseStyle;
  };

  return (
    <View style={[styles.wrapper, style]}>
      <TouchableOpacity
        style={getContainerStyle()}
        onPress={() => setIsOpen(true)}
        activeOpacity={0.7}
      >
        <Text
          style={[
            styles.text,
            !value && styles.placeholderText,
            styles[`${size}Text`],
          ]}
        >
          {value || placeholder}
        </Text>
        <DropdownIcon
          width={14}
          height={14}
          style={{
            transform: [{ rotate: isOpen ? '180deg' : '0deg' }],
          }}
        />
      </TouchableOpacity>

      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsOpen(false)}
        >
          <View style={styles.modalContent}>
            <FlatList
              data={options}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.optionItem,
                    value === item && styles.selectedOption,
                  ]}
                  onPress={() => handleSelect(item)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      value === item && styles.selectedOptionText,
                    ]}
                  >
                    {item}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 16,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#e9eaee',
    backgroundColor: '#e9eaee',
  },
  defaultContainer: {
    borderColor: '#e9eaee',
    backgroundColor: '#e9eaee',
  },
  size: {
    minHeight: 50,
  },
  medium: {
    minHeight: 50,
  },
  small: {
    minHeight: 40,
  },
  large: {
    minHeight: 56,
  },
  text: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Manrope-Regular',
    color: COLORS.primaryFontColor,
  },
  placeholderText: {
    color: '#6E6E6E',
  },
  smallText: {
    fontSize: 12,
  },
  mediumText: {
    fontSize: 14,
  },
  largeText: {
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: COLORS.secondaryFontColor,
    borderRadius: 8,
    maxHeight: 300,
    width: '80%',
    padding: 8,
  },
  optionItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  selectedOption: {
    backgroundColor: COLORS.secondaryColor + '20',
  },
  optionText: {
    fontSize: 14,
    fontFamily: 'Manrope-Regular',
    color: COLORS.primaryFontColor,
  },
  selectedOptionText: {
    fontFamily: 'Manrope-SemiBold',
    color: COLORS.secondaryColor,
  },
});

export default SelectDropdown;

