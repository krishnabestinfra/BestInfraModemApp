import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert, Modal, Pressable, AppState } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Button from './Button';
import { colors, spacing, borderRadius } from '../../styles/theme';

const PhotoUpload = ({
  images = [null, null], // Array of image URIs or null
  onImagesChange, // Callback: (images: string[]) => void
  maxImages = 2, // Maximum number of images
  uploadButtonText = 'Upload',
  takePhotoButtonText = 'Take Photo',
  showButtons = true, // Whether to show action buttons
  aspectRatio = [1, 1],
  quality = 0.8, 
  style,
  containerStyle,
}) => {
  // Initialize images array to match maxImages
  const normalizeImages = (imgArray) => {
    const normalized = Array.isArray(imgArray) ? [...imgArray] : [];
    while (normalized.length < maxImages) {
      normalized.push(null);
    }
    return normalized.slice(0, maxImages);
  };

  const [localImages, setLocalImages] = useState(() => normalizeImages(images));
  const prevImagesRef = useRef(images);
  const [showPickerModal, setShowPickerModal] = useState(false);
  const cameraOpenRef = useRef(false);
  const pendingCameraResultRef = useRef(null);

  // Sync local state with prop changes
  useEffect(() => {
    // Check if images prop actually changed
    const imagesChanged = 
      !prevImagesRef.current || 
      images.length !== prevImagesRef.current.length ||
      images.some((img, idx) => img !== prevImagesRef.current[idx]);

    if (imagesChanged) {
      const normalized = normalizeImages(images);
      setLocalImages(normalized);
      prevImagesRef.current = images;
    }
  }, [images, maxImages]);

  // Handle app state changes when camera is open
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      // When app comes to foreground and camera was open, check for pending result
      if (nextAppState === 'active' && cameraOpenRef.current) {
        // Reset camera open flag after a short delay to allow result processing
        setTimeout(() => {
          cameraOpenRef.current = false;
        }, 1000);
      }
    });

    return () => {
      subscription?.remove();
    };
  }, []);

  const pickImage = async (index, useCamera = false) => {
    try {
      if (useCamera) {
        // Mark camera as open before launching
        cameraOpenRef.current = true;
        
        // Check camera permission status first
        const { status: existingStatus } = await ImagePicker.getCameraPermissionsAsync();
        
        let permission;
        if (existingStatus !== 'granted') {
          // Request permission if not granted
          permission = await ImagePicker.requestCameraPermissionsAsync();
          
          if (permission.status !== 'granted') {
            cameraOpenRef.current = false;
            Alert.alert(
              'Camera Permission Required',
              'Please grant camera permission to take photos. You can enable it in your device settings.',
              [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Open Settings', onPress: () => {
                  // On some platforms, you might want to open settings
                  // This is handled by the permission request dialog
                }}
              ]
            );
            return;
          }
        }
      } else {
        // Request media library permission
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        
        if (permission.status !== 'granted') {
          Alert.alert(
            'Permission needed',
            'Please grant camera roll permissions to continue.'
          );
          return;
        }
      }

      // Launch image picker
      // Note: When camera opens, app goes to background. 
      // The result will be available when app returns to foreground.
      const result = useCamera
        ? await ImagePicker.launchCameraAsync({
            allowsEditing: false,
            quality: quality,
            exif: false,
          })
        : await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: false,
            quality: quality,
          });

      // Reset camera open flag
      cameraOpenRef.current = false;

      if (!result.canceled && result.assets[0]) {
        const newImages = [...localImages];
        // If picking from first box, store image in second box (index 1)
        const targetIndex = index === 0 ? 1 : index;
        newImages[targetIndex] = result.assets[0].uri;
        setLocalImages(newImages);
        
        // Call the callback with updated images
        if (onImagesChange) {
          onImagesChange(newImages);
        }
      } else {
        // User cancelled, reset flag
        cameraOpenRef.current = false;
      }
    } catch (error) {
      cameraOpenRef.current = false;
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  const handleImageBoxPress = (index) => {
    // Only first box (index 0) is interactive - show modal to choose camera or gallery
    if (index === 0) {
      setShowPickerModal(true);
    }
    // Second box (index 1) is disabled - only displays image
  };

  const handleCameraPress = () => {
    setShowPickerModal(false);
    pickImage(0, true); // Always use index 0, but image will be stored in index 1
  };

  const handleGalleryPress = () => {
    setShowPickerModal(false);
    pickImage(0, false); // Always use index 0, but image will be stored in index 1
  };

  const handleClosePickerModal = () => {
    setShowPickerModal(false);
  };

  const removeImage = (index) => {
    const newImages = [...localImages];
    newImages[index] = null;
    setLocalImages(newImages);
    
    if (onImagesChange) {
      onImagesChange(newImages);
    }
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {/* Image Preview Boxes */}
      <View style={styles.uploadBoxes}>
        {Array.from({ length: maxImages }).map((_, index) => {
          const isSecondBox = index === 1;
          const BoxComponent = isSecondBox ? View : TouchableOpacity;
          
          return (
            <BoxComponent
              key={index}
              style={[styles.uploadBox, isSecondBox && styles.uploadBoxDisabled]}
              onPress={isSecondBox ? undefined : () => handleImageBoxPress(index)}
              activeOpacity={isSecondBox ? 1 : 0.7}
            >
              {localImages[index] ? (
                <Image source={{ uri: localImages[index] }} style={styles.uploadImage} />
              ) : (
                <Ionicons
                  name={index === 0 ? 'add-circle' : 'image-outline'}
                  size={32}
                  color={colors.secondary}
                />
              )}
            </BoxComponent>
          );
        })}
      </View>

      {/* Action Buttons */}
      {showButtons && (
        <View style={styles.uploadButtons}>
          <Button
            title={uploadButtonText}
            onPress={() => {
              setShowPickerModal(true);
            }}
            variant="outline"
            size="medium"
            style={{ flex: 1 }}
          />
          <Button
            title={takePhotoButtonText}
            onPress={() => pickImage(0, true)}
            variant="primary"
            size="medium"
            style={{ flex: 1 }}
          />
        </View>
      )}

      {/* Picker Modal */}
      <Modal transparent visible={showPickerModal} animationType="fade">
        <View style={styles.modalOverlay}>
          <Pressable style={styles.modalBackdrop} onPress={handleClosePickerModal} />
          <View style={styles.pickerModalCard}>
            <Text style={styles.modalTitle}>Select Image Source</Text>
            <Text style={styles.modalMessage}>Choose how you want to add an image</Text>
            <View style={styles.modalActions}>
              <TouchableOpacity onPress={handleGalleryPress} style={[styles.modalButton, styles.modalButtonCancel]}>
                <Text style={styles.modalButtonCancelText}>Gallery</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleCameraPress} style={[styles.modalButton, styles.modalButtonCamera]}>
                <Text style={styles.modalButtonCameraText}>Camera</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({

  uploadBoxes: {
    flexDirection: 'row',
    gap: spacing.xl,
    marginBottom: spacing.lg,
  },
  uploadBox: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: borderRadius.md,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#E0E0E0',
    backgroundColor: '#FAFAFA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadBoxDisabled: {
    opacity: 0.6,
  },
  uploadImage: {
    width: '100%',
    height: '100%',
    borderRadius: borderRadius.md,
  },
  uploadButtons: {
    flexDirection: 'row',
    gap: spacing.lg,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  pickerModalCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: 'Manrope-SemiBold',
    marginBottom: 10,
  },
  modalMessage: {
    fontSize: 14,
    fontFamily: 'Manrope-Regular',
    marginBottom: 20,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalButtonCancel: {
    borderWidth: 1,
    borderColor: '#ddd',
  },
  modalButtonCamera: {
    backgroundColor: '#55B56C',
  },
  modalButtonCancelText: {
    fontSize: 14,
    fontFamily: 'Manrope-Medium',
  },
  modalButtonCameraText: {
    fontSize: 14,
    fontFamily: 'Manrope-Medium',
    color: '#fff',
  },
});

export default PhotoUpload;


