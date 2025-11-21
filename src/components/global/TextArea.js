import React from 'react';
import { View, Text, StyleSheet, TextInput } from 'react-native';
import { COLORS } from '../../constants/colors';

const TextArea = ({
  placeholder,
  value,
  onChangeText,
  variant = 'default',
  size = 'medium',
  numberOfLines = 4,
  maxLength,
  style,
}) => {
  const getContainerStyle = () => {
    const baseStyle = [styles.container, styles[`${variant}Container`], styles[size]];
    return baseStyle;
  };

  return (
    <View style={[styles.wrapper, style]}>
      <TextInput
        style={[getContainerStyle(), styles.textArea]}
        placeholder={placeholder}
        placeholderTextColor="#6E6E6E"
        value={value}
        onChangeText={onChangeText}
        multiline
        numberOfLines={numberOfLines}
        maxLength={maxLength}
        textAlignVertical="top"
      />
      {maxLength && (
        <Text style={styles.charCount}>
          {value?.length || 0}/{maxLength}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 16,
  },
  container: {
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#e9eaee',
    backgroundColor: '#e9eaee',
  },
  defaultContainer: {
    borderColor: '#e9eaee',
    backgroundColor: '#e9eaee',
  },
  medium: {
    minHeight: 100,
  },
  small: {
    minHeight: 80,
  },
  large: {
    minHeight: 120,
  },
  textArea: {
    fontSize: 14,
    fontFamily: 'Manrope-Regular',
    color: COLORS.primaryFontColor,
  },
  charCount: {
    fontSize: 12,
    fontFamily: 'Manrope-Regular',
    color: '#6E6E6E',
    textAlign: 'right',
    marginTop: 4,
  },
});

export default TextArea;

