import React, { useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Text,
  TouchableOpacity,
} from "react-native";
import { COLORS } from "../../constants/colors";
import SelectDropdown from "./SelectDropdown";
import TextArea from "./TextArea";
import UploadInput from "./UploadInput";
import Button from "./Button";
import Input from "./Input";
import CloseIcon from "../../../assets/icons/cross.svg";
import { useNavigation } from "@react-navigation/native";

const CreateNewService = ({
  onSubmit,
  onClose,
  title = "Create New Service",
}) => {
  const navigation = useNavigation();
  const [selectedCategory, setSelectedCategory] = useState("");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState([]);

  const categories = [
    "Meter Installation",
    "Connection Issue",
    "Billing Issue",
    "Technical Issue",
    "Meter Issue",
    "General Inquiry",
  ];

  const handleSubmit = () => {
    const serviceData = {
      category: selectedCategory,
      subject,
      description,
      files: uploadedFiles,
    };
    if (onSubmit) onSubmit(serviceData);
    setSelectedCategory("");
    setSubject("");
    setDescription("");
    setUploadedFiles([]);
  };

  const handleCancel = () => {
    setSelectedCategory("");
    setSubject("");
    setDescription("");
    setUploadedFiles([]);
    if (onClose) {
      onClose();
    }
  };

  return (
    <View style={styles.NewServiceContainer}>
      <View style={styles.header}>
        <Text style={styles.NewserviceTitle}>{title}</Text>
        {onClose && (
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <CloseIcon width={16} height={16} />
          </TouchableOpacity>
        )}
      </View>
      <ScrollView
        style={styles.formContainer}
        contentContainerStyle={{ paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
      >
        <SelectDropdown
          placeholder="Select category"
          value={selectedCategory}
          onSelect={setSelectedCategory}
          options={categories}
          variant="default"
          size="medium"
        />

        <Input
          placeholder="Subject"
          value={subject}
          onChangeText={setSubject}
        />

        <TextArea
          placeholder="Describe"
          value={description}
          onChangeText={setDescription}
          variant="default"
          size="medium"
          numberOfLines={4}
          maxLength={500}
        />

        <UploadInput
          placeholder="No files selected"
          value={uploadedFiles}
          onChange={setUploadedFiles}
          multiple={true}
          maxFiles={3}
          variant="outlined"
          size="medium"
        />

        <View style={styles.buttonRow}>
          <Button
            variant="outline"
            title="Cancel"
            onPress={() => {
              handleCancel();
              if (navigation?.navigate) {
                navigation.navigate("Services");
              }
            }}
            style={styles.cancelButton}
          />

          <Button
            title="Submit"
            onPress={() => {
              handleSubmit();
              if (onClose) {
                onClose();
              }
              // Don't navigate immediately - let the parent handle navigation
            }}
            style={styles.button}
          />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  NewServiceContainer: {
    backgroundColor: COLORS.secondaryFontColor,
    borderRadius: 8,
    padding: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
    marginTop: 150,
    flexDirection: "column",
    flex: 1,
    justifyContent: "center",
    marginHorizontal: 20
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 10,
    marginBottom: 10,
  },
  closeButton: {
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  formContainer: {
    backgroundColor: COLORS.secondaryFontColor,
    marginHorizontal: 20,
    marginTop: 20,
  },
  NewserviceTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.primaryFontColor,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 20,
    gap: 12,
  },
  button: {
    flex: 1,
  },
  cancelButton: {
    flex: 1,
  },
});

export default CreateNewService;

