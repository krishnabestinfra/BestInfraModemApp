import React, { useState } from "react";
import { View, Text, ScrollView, StyleSheet, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import RippleLogo from "../components/global/RippleLogo";
import AppHeader from "../components/global/AppHeader";
import NotificationLight from "../../assets/icons/notification.svg";
import { COLORS } from "../constants/colors";
import CalendarIcon from "../../assets/icons/greenCalendar.svg";
import LocationIcon from "../../assets/icons/greenMap.svg";
import ModemIcon from "../../assets/icons/greenMeter.svg";
import DownloadIcon from "../../assets/icons/downloadbutton.svg";
import { exportCompletedPDF } from "../utils/exportCompletedPDF";
import { Alert } from "react-native";

const CompletedActivities = ({ navigation }) => {
    const [resolvedList, setResolvedList] = useState([]);
    const [loading, setLoading] = useState(true);

    // const resolvedList = [
    //     {
    //         id: "1",
    //         modemId: "MDM001",
    //         status: "Network Failure",
    //         resolvedAt: "Nov 21, 2025 02:45 PM",
    //         location: "Building B-Floor 2",
    //     },
    //     {
    //         id: "2",
    //         modemId: "MDM002",
    //         status: "Modem Auto Restart",
    //         resolvedAt: "Nov 21, 2025 02:45 PM",
    //         location: "Building B-Floor 2",
    //     },
    //     {
    //         id: "3",
    //         modemId: "MDM003",
    //         status: "Modem Power Failed",
    //         resolvedAt: "Nov 21, 2025 02:45 PM",
    //         location: "Building B-Floor 2",
    //     },
    //     {
    //         id: "4",
    //         modemId: "MDM004",
    //         status: "Network Failure",
    //         resolvedAt: "Nov 21, 2025 02:45 PM",
    //         location: "Building B-Floor 2",
    //     },
    //     {
    //         id: "5",
    //         modemId: "MDM005",
    //         status: "Modem Auto Restart",
    //         resolvedAt: "Nov 21, 2025 02:45 PM",
    //         location: "Building B-Floor 2",
    //     },
    //     {
    //         id: "6",
    //         modemId: "MDM006",
    //         status: "Modem Power Failed",
    //         resolvedAt: "Nov 21, 2025 02:45 PM",
    //         location: "Building B-Floor 2",
    //     },
    // ];
    const fetchModems = async () => {
        try {
            const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/modems/main`);
            const json = await response.json();
    
            const allModems = json.modems || [];
    
            const resolved = allModems.filter(
                m => m.resolved === true || m.status === "resolved"
            );
    
            const formatted = resolved.map((item, index) => ({
                id: item.id?.toString() || index.toString(),
                modemId: item.modemSlNo || item.modemId || "Unknown",
                status: item.status || "Resolved",
                resolvedAt: item.resolvedAt || item.updatedAt || "N/A",
                location: item.location || item.address || "Not Provided",
            }));
    
            setResolvedList(formatted);
        } catch (error) {
            console.log("Error fetching modems:", error);
            Alert.alert("Error", "Failed to load resolved modems");
        } finally {
            setLoading(false);
        }
    };
    
    useEffect(() => {
        fetchModems();
    }, []);

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar style="dark" />
            <LinearGradient
                colors={["#f4fbf7", "#e6f4ed"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.headerContainer}
            >
                <AppHeader
                    containerStyle={styles.headerRow}
                    leftButtonStyle={styles.circleButton}
                    rightButtonStyle={styles.circleButton}
                    rightIcon={NotificationLight}
                    logo={<RippleLogo size={64} />}
                    onPressLeft={() => navigation.navigate("SideMenu")}
                    onPressCenter={() => navigation.navigate("Dashboard")}
                    onPressRight={() => navigation.navigate("Notifications")}
                    buttonSize={54}
                    rightIconProps={{ width: 20, height: 20, fill: "#202d59" }}
                    leftIconProps={{ width: 20, height: 20, fill: "#202d59" }}
                />
            </LinearGradient>
            <View
                style={styles.container}
            >
                <View style={styles.subContainer}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Resolved Modem List</Text>
                        <View style={styles.downloadContainer}>
                            <Pressable
                                onPress={async () => {
                                    const result = await exportCompletedPDF(resolvedList);

                                    if (!result.success) {
                                        Alert.alert("Error", "PDF sharing failed");
                                    }
                                }}
                            >
                                <DownloadIcon width={16} height={16} />
                            </Pressable>
                        </View>
                    </View>
                    {loading && (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color={COLORS.secondaryFontColor} />
                            <Text style={styles.loadingText}>Loading resolved modems...</Text>
                        </View>
                    )}
                    <ScrollView
                        style={{ flex: 1 }}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ paddingBottom: 40 }}
                    >
                        <View style={styles.cardsContainer}>
                            {resolvedList.map((item) => (
                                <View key={item.id} style={styles.card}>
                                    <View style={styles.cardRow}>
                                        <View style={styles.iconTextRow}>
                                            <ModemIcon width={16} height={16} />
                                            <Text style={styles.modemId}>{item.modemId}</Text>
                                        </View>

                                        <Text style={styles.statusText}>{item.status}</Text>
                                    </View>

                                    <View style={styles.detailRow}>
                                        <CalendarIcon width={16} height={16} />
                                        <View>
                                            <Text style={styles.detailValue}>Resolved: {item.resolvedAt}</Text>
                                        </View>
                                    </View>

                                    <View style={styles.detailRow}>
                                        <LocationIcon width={16} height={16} />
                                        <View>
                                            <Text style={styles.detailValue}>Location: {item.location}</Text>
                                        </View>
                                    </View>
                                </View>
                            ))}
                        </View>
                    </ScrollView>
                </View>
            </View>
        </SafeAreaView>
    );
};

export default CompletedActivities;

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: "#EEF8F0",
    },

    // HEADER
    headerContainer: {
        paddingVertical: 20,
        paddingHorizontal: 20,
    },
    headerRow: {
        paddingHorizontal: 15,
        paddingTop: 10
    },
    circleButton: {
        backgroundColor: "#fff",
        width: 54,
        height: 54,
        borderRadius: 60,
        alignItems: "center",
        justifyContent: "center",
        elevation: 2,
    },

    // CONTENT
    container: {
        flex: 1,                // allow container to fill available screen
        paddingHorizontal: 15,
        backgroundColor: "#EEF8F0",
    },

    subContainer: {
        backgroundColor: "#fff",
        borderRadius: 5,
        flex: 1,               // make the white card fill remaining vertical space
        overflow: "hidden",    // prevents child shadows leaking when rounded
    },
    sectionHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "#F8FAFD",
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderTopLeftRadius: 5,
        borderTopRightRadius: 5,
        marginBottom: 10,
        zIndex: 10,   // helps keep above list
    },

    sectionTitle: {
        fontSize: 14,
        fontFamily: "Manrope-Medium",
        color: "#202D59",
    },
    downloadContainer: {
        backgroundColor: "#fff",
        padding: 8,
        borderRadius: 30
    },

    card: {
        backgroundColor: "#fff",
        padding: 12,
        borderRadius: 5,
        borderWidth: 1,
        borderColor: "#F8F8F8",
        elevation: 0.3,
        gap: 10
    },
    cardsContainer: {
        paddingHorizontal: 15,
        gap: 10
    },

    cardRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },

    iconTextRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },

    modemId: {
        fontSize: 14,
        fontFamily: "Manrope-Medium",
        color: "#202D59",
    },

    statusText: {
        fontSize: 12,
        color: "#55B56C",
        fontFamily: "Manrope-SemiBold",
        width: "30%"
    },

    detailRow: {
        flexDirection: "row",
        gap: 12,
        alignItems: "center",
        width: "60%"
    },
    detailValue: {
        fontSize: 14,
        color: "#202D59",
        fontFamily: "Manrope-Medium",
    },
});
