import { StyleSheet, Text, View, ScrollView, TouchableOpacity, RefreshControl } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { COLORS } from "../constants/colors";
import React, { useState, useEffect, useRef, useCallback } from "react";
import Button from "../components/global/Button";
import Table from "../components/global/Table";
import OpenIcon from "../../assets/icons/open.svg";
import ProgressIcon from "../../assets/icons/progress.svg";
import ResolvedIcon from "../../assets/icons/resolved.svg";
import ClosedIcon from "../../assets/icons/closed.svg";
import EyeIcon from "../../assets/icons/eyeFill.svg";
import DashboardHeaderSection from "../components/DashboardHeaderSection";
import { LinearGradient } from "expo-linear-gradient";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SkeletonLoader } from '../utils/loadingManager';
import CreateNewService from "../components/global/CreateNewService";

// Dummy data
const dummyServiceStats = {
  total: 24,
  open: 8,
  inProgress: 6,
  resolved: 7,
  closed: 3
};

const dummyServiceData = [
  {
    serviceNumber: "SRV001",
    category: "Meter Installation",
    status: "Open",
    priority: "High",
    createdOn: "15/01/2025, 10:30 AM",
    lastUpdated: "15/01/2025, 10:30 AM",
    assignedTo: "BI - Tech Team"
  },
  {
    serviceNumber: "SRV002",
    category: "Connection Issue",
    status: "In Progress",
    priority: "High",
    createdOn: "14/01/2025, 02:15 PM",
    lastUpdated: "15/01/2025, 09:00 AM",
    assignedTo: "BI - Field Team"
  },
  {
    serviceNumber: "SRV003",
    category: "Billing",
    status: "Resolved",
    priority: "Low",
    createdOn: "13/01/2025, 11:20 AM",
    lastUpdated: "14/01/2025, 04:30 PM",
    assignedTo: "BI - Support Team"
  },
  {
    serviceNumber: "SRV004",
    category: "Technical",
    status: "Open",
    priority: "High",
    createdOn: "15/01/2025, 08:45 AM",
    lastUpdated: "15/01/2025, 08:45 AM",
    assignedTo: "BI - Tech Team"
  },
  {
    serviceNumber: "SRV005",
    category: "Meter Issue",
    status: "Closed",
    priority: "Medium",
    createdOn: "10/01/2025, 03:00 PM",
    lastUpdated: "12/01/2025, 11:00 AM",
    assignedTo: "BI - Field Team"
  },
  {
    serviceNumber: "SRV006",
    category: "Connection Issue",
    status: "In Progress",
    priority: "High",
    createdOn: "14/01/2025, 01:30 PM",
    lastUpdated: "15/01/2025, 10:15 AM",
    assignedTo: "BI - Tech Team"
  }
];

const Services = ({ navigation }) => {
  const bottomSheetRef = useRef(null);
  const snapPoints = ['100%'];

  const handleOpenBottomSheet = useCallback(() => {
    bottomSheetRef.current?.expand();
  }, []);

  const handleCloseBottomSheet = useCallback(() => {
    bottomSheetRef.current?.close();
  }, []);

  const [consumerData] = useState({
    name: "Field Engineer",
    identifier: "BI25GMRA0001"
  });
  const [isLoading, setIsLoading] = useState(false);
  const [serviceStats, setServiceStats] = useState(dummyServiceStats);
  const [statsLoading, setStatsLoading] = useState(false);
  const [tableData, setTableData] = useState(dummyServiceData);
  const [tableLoading, setTableLoading] = useState(false);

  // Fetch data function with dummy data
  const fetchData = async () => {
    try {
      setIsLoading(true);
      setStatsLoading(true);
      setTableLoading(true);

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));

      setServiceStats(dummyServiceStats);
      setTableData(dummyServiceData);
    } catch (error) {
      console.error('Error fetching service data:', error);
    } finally {
      setIsLoading(false);
      setStatsLoading(false);
      setTableLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      fetchData();
    }, [])
  );

  const handleCreateService = (serviceData) => {
    console.log("New Service Created:", serviceData);
    handleCloseBottomSheet();
    // Optionally navigate to service details
    // navigation.navigate('ServiceDetails', { serviceId: 'new' });
  };

  const handleViewService = useCallback((service) => {
    console.log("📄 Viewing service:", service);
    navigation.navigate('ServiceDetails', {
      serviceId: service.serviceNumber || service.id,
      serviceData: service,
      category: service.category,
      status: service.status,
    });
  }, [navigation]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ScrollView
        style={styles.Container}
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={fetchData}
            colors={[COLORS.secondaryColor]}
            tintColor={COLORS.secondaryColor}
          />
        }
        nestedScrollEnabled={true}
      >
        <DashboardHeaderSection
          navigation={navigation}
        />

        <View style={styles.ServiceContainer}>
          <Text style={styles.usageText}>Services</Text>
          <Button
            title="Create New"
            variant="primary"
            size="small"
            textStyle={styles.forgotText}
            onPress={handleOpenBottomSheet}
          />
        </View>

        <View style={styles.ServiceContainerTwo}>
          <View style={styles.ServiceBox}>
            <View style={styles.ServiceBoxTextContainer}>
              <Text style={styles.ServiceBoxtext}>Open Services</Text>
              <View style={{ minWidth: 20 }}>
                {statsLoading ? (
                  <SkeletonLoader variant="lines" lines={1} style={{ height: 60, width: 10 }} />
                ) : (
                  <Text style={styles.ServiceBoxNumber}>{serviceStats.open}</Text>
                )}
              </View>
            </View>
            <LinearGradient
              colors={["#E6F6ED", "#C2EAD2"]}
              start={{ x: 0.5, y: 0.5 }}
              end={{ x: 1, y: 1 }}
              style={styles.ServiceBoxIcon}
            >
              <OpenIcon width={16} height={16} />
            </LinearGradient>
          </View>

          <View style={styles.ServiceBox}>
            <View style={styles.ServiceBoxTextContainer}>
              <Text style={styles.ServiceBoxtext}>In Progress</Text>
              <View style={{ minWidth: 20 }}>
                {statsLoading ? (
                  <SkeletonLoader variant="lines" lines={1} style={{ height: 30, width: 20 }} />
                ) : (
                  <Text style={styles.ServiceBoxNumber}>{serviceStats.inProgress}</Text>
                )}
              </View>
            </View>
            <LinearGradient
              colors={["#E6F6ED", "#C2EAD2"]}
              start={{ x: 0.5, y: 0.5 }}
              end={{ x: 1, y: 1 }}
              style={styles.ServiceBoxIcon}
            >
              <ProgressIcon width={16} height={16} />
            </LinearGradient>
          </View>

          <View style={styles.ServiceBox}>
            <View style={styles.ServiceBoxTextContainer}>
              <Text style={styles.ServiceBoxtext}>Resolved</Text>
              <View style={{ minWidth: 20 }}>
                {statsLoading ? (
                  <SkeletonLoader variant="lines" lines={1} style={{ height: 30, width: 20 }} />
                ) : (
                  <Text style={styles.ServiceBoxNumber}>{serviceStats.resolved}</Text>
                )}
              </View>
            </View>
            <LinearGradient
              colors={["#E6F6ED", "#C2EAD2"]}
              start={{ x: 0.5, y: 0.5 }}
              end={{ x: 1, y: 1 }}
              style={styles.ServiceBoxIcon}
            >
              <ResolvedIcon width={16} height={16} />
            </LinearGradient>
          </View>

          <View style={styles.ServiceBox}>
            <View style={styles.ServiceBoxTextContainer}>
              <Text style={styles.ServiceBoxtext}>Closed</Text>
              <View style={{ minWidth: 20 }}>
                {statsLoading ? (
                  <SkeletonLoader variant="lines" lines={1} style={{ height: 30, width: 20 }} />
                ) : (
                  <Text style={styles.ServiceBoxNumber}>{serviceStats.closed}</Text>
                )}
              </View>
            </View>
            <LinearGradient
              colors={["#E6F6ED", "#C2EAD2"]}
              start={{ x: 0.5, y: 0.5 }}
              end={{ x: 1, y: 1 }}
              style={styles.ServiceBoxIcon}
            >
              <ClosedIcon width={16} height={16} />
            </LinearGradient>
          </View>
        </View>

        <View style={styles.ServiceContainerThree}>
          <Table
            data={tableData}
            loading={tableLoading}
            skeletonLines={3}
            emptyMessage="No services available"
            showSerial={true}
            showPriority={false}
            inlinePriority
            priorityField="category"
            priorityMapping={{
              "BILLING": "Low",
              "METER": "High",
              "CONNECTION": "High",
              "TECHNICAL": "High",
              "Meter Installation": "High",
              "Connection Issue": "High",
              "Billing": "Low",
              "Technical": "High",
              "Meter Issue": "High"
            }}
            columns={[
              { key: 'serviceNumber', title: 'Service ID', flex: 1.2 },
              { key: 'category', title: 'Category', flex: 1.5 },
              { key: 'status', title: 'Status', flex: 1 },
              {
                key: 'view',
                title: 'View',
                flex: 0.7,
                render: (service) => (
                  <TouchableOpacity
                    style={styles.viewIconButton}
                    onPress={() => handleViewService(service)}
                    activeOpacity={0.7}
                  >
                    <EyeIcon width={16} height={16} fill="#6C757D" />
                  </TouchableOpacity>
                )
              }
            ]}
          />
        </View>
      </ScrollView>

      <BottomSheet
        ref={bottomSheetRef}
        snapPoints={snapPoints}
        index={-1}
        handleComponent={null}
        enablePanDownToClose={false}
        backgroundStyle={styles.bottomSheetBackground}
        handleIndicatorStyle={styles.bottomSheetIndicator}
        enableHandlePanningGesture={false}
        enableContentPanningGesture={false}
        enableOverDrag={false}
        animateOnMount={false}
      >
        <BottomSheetView style={styles.bottomSheetContent}>
          <CreateNewService
            onSubmit={handleCreateService}
            onClose={handleCloseBottomSheet}
            title="Create New Service"
          />
        </BottomSheetView>
      </BottomSheet>
    </GestureHandlerRootView>
  );
};

export default Services;

const styles = StyleSheet.create({
  Container: {
    backgroundColor: COLORS.secondaryFontColor,
    borderTopLeftRadius: 30,
    borderBottomRightRadius: 30,
    flex: 1,
  },
  ServiceContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(186, 190, 204, 0.4)',
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "rgba(0, 0, 0, 0.02)",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 5,
  },
  usageText: {
    color: COLORS.primaryFontColor,
    fontFamily: "Manrope-Bold",
    fontSize: 14,
  },
  forgotText: {
    fontFamily: "Manrope-Medium",
  },
  ServiceContainerTwo: {
    flexWrap: "wrap",
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 15,
    gap: 15,
  },
  ServiceBox: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    borderWidth: 1,
    borderColor: 'rgba(186, 190, 204, 0.4)',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 5,
    backgroundColor: COLORS.secondaryFontColor,
    width: "43%",
    height: 80,
  },
  ServiceBoxtext: {
    color: COLORS.primaryFontColor,
    fontFamily: "Manrope-Medium",
    fontSize: 12,
  },
  ServiceBoxNumber: {
    color: COLORS.secondaryColor,
    fontFamily: "Manrope-Bold",
    fontSize: 20,
  },
  ServiceBoxIcon: {
    borderRadius: 50,
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
    overflow: 'hidden',
  },
  ServiceBoxTextContainer: {
    height: "100%",
    justifyContent: "space-between",
  },
  ServiceContainerThree: {
    marginTop: 15,
    minHeight: 400,
    flex: 1,
  },
  bottomSheetBackground: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  bottomSheetContent: {
    flex: 1,
  },
  viewIconButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F3F4',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E9ECEF',
    shadowColor: 'rgba(0, 0, 0, 0.1)',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 2,
    elevation: 1,
  },
});

