import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS } from '../../constants/colors';

const UploadInput = ({
  placeholder = 'No files selected',
  value = [],
  onChange,
  multiple = false,
  maxFiles = 3,
  variant = 'outlined',
  size = 'medium',
  style,
}) => {
  const handlePress = () => {
    // In a real app, this would open file picker
    // For now, we'll just simulate adding a file
    if (multiple && value.length < maxFiles) {
      const newFile = `file_${value.length + 1}.pdf`;
      onChange([...value, newFile]);
    } else if (!multiple && value.length === 0) {
      onChange(['file_1.pdf']);
    }
  };

  const handleRemove = (index) => {
    const newFiles = value.filter((_, i) => i !== index);
    onChange(newFiles);
  };

  const getContainerStyle = () => {
    const baseStyle = [styles.container, styles[`${variant}Container`], styles[size]];
    return baseStyle;
  };

  return (
    <View style={[styles.wrapper, style]}>
      <TouchableOpacity
        style={getContainerStyle()}
        onPress={handlePress}
        activeOpacity={0.7}
      >
        <Text
          style={[
            styles.text,
            value.length === 0 && styles.placeholderText,
            styles[`${size}Text`],
          ]}
        >
          {value.length > 0
            ? `${value.length} file${value.length > 1 ? 's' : ''} selected`
            : placeholder}
        </Text>
        <Text style={styles.uploadText}>Upload</Text>
      </TouchableOpacity>

      {value.length > 0 && (
        <View style={styles.fileList}>
          {value.map((file, index) => (
            <View key={index} style={styles.fileItem}>
              <Text style={styles.fileName} numberOfLines={1}>
                {file}
              </Text>
              <TouchableOpacity
                onPress={() => handleRemove(index)}
                style={styles.removeButton}
              >
                <Text style={styles.removeText}>×</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}
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
  },
  outlinedContainer: {
    borderColor: '#e9eaee',
    backgroundColor: 'transparent',
  },
  defaultContainer: {
    borderColor: '#e9eaee',
    backgroundColor: '#e9eaee',
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
  uploadText: {
    fontSize: 14,
    fontFamily: 'Manrope-Medium',
    color: COLORS.secondaryColor,
  },
  fileList: {
    marginTop: 8,
  },
  fileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8F8F8',
    padding: 8,
    borderRadius: 6,
    marginBottom: 4,
  },
  fileName: {
    flex: 1,
    fontSize: 12,
    fontFamily: 'Manrope-Regular',
    color: COLORS.primaryFontColor,
  },
  removeButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FF4444',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  removeText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Manrope-Bold',
  },
});

export default UploadInput;

