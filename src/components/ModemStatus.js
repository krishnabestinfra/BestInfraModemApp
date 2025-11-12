import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { COLORS } from "../constants/colors";

const ModemStatus = () => {
    return (
        <View style={styles.container}>
            <View style={styles.headerTable}>
                <Text style={styles.headerText}>Modem ID</Text>
                <Text style={styles.headerText}>Location</Text>
                <Text style={styles.headerText}>Status</Text>
            </View>

            <View style={styles.dataTab}>
                <Text style={styles.dataText}>MDM001</Text>
                <Text style={styles.dataText}>Bangalore</Text>
                <Text style={styles.dataStatus}>Non-Communicating</Text>
            </View>

            <View style={styles.dataTab}>
                <Text style={styles.dataText}>MDM002</Text>
                <Text style={styles.dataText}>Mumbai</Text>
                <Text style={styles.dataStatus}>Non-Communicating</Text>
            </View>

            <View style={styles.dataTab}>
                <Text style={styles.dataText}>MDM003</Text>
                <Text style={styles.dataText}>Delhi</Text>
                <Text style={styles.dataStatus}>Non-Communicating</Text>
            </View>

            <View style={styles.dataTab}>
                <Text style={styles.dataText}>MDM004</Text>
                <Text style={styles.dataText}>Chennai</Text>
                <Text style={styles.dataStatus}>Non-Communicating</Text>
            </View>

            <View style={styles.dataTab}>
                <Text style={styles.dataText}>MDM005</Text>
                <Text style={styles.dataText}>Hyderabad</Text>
                <Text style={styles.dataStatus}>Non-Communicating</Text>
            </View>
        </View>
    );
};

export default ModemStatus;

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    headerTable: {
        backgroundColor: "#EEF8F0",
        borderRadius: 5,
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 8,
        paddingHorizontal: 10,
    },
    headerText: {
        flex: 1,
        color: COLORS.primaryFontColor,
        fontFamily: "Manrope-Medium",
        fontSize: 14,
        textAlign: "left",
    },
    dataTab: {
        backgroundColor: "#E9EAEE",
        borderRadius: 5,
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 8,
        paddingHorizontal: 10,
        marginTop: 2,
    },
    dataText: {
        flex: 1,
        color: COLORS.primaryFontColor,
        fontFamily: "Manrope-Regular",
        fontSize: 12,
        textAlign: "left",
    },
    dataStatusActive: {
        flex: 1,
        color: COLORS.secondaryColor,
        fontFamily: "Manrope-Medium",
        fontSize: 12,
        textAlign: "left",
    },
    dataStatus: {
        flex: 1,
        color: COLORS.primaryFontColor,
        fontFamily: "Manrope-Regular",
        fontSize: 12,
        textAlign: "left",
    },
});
