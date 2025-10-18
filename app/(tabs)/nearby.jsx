// app/(tabs)/nearby.jsx
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";
import { useMemo } from "react";

import { NearbyProviders } from "../../components/NearbyProviders";
import SafeScreen from "../../components/SafeScreen";
import { useTheme } from "../../hooks/theme";
import { responsiveFontSize } from "../../utils/responsive";

export default function NearbyScreen() {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <SafeScreen>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Ionicons name="location-sharp" size={32} color={theme.white} />
            <Text style={styles.title}>Proveedores Cercanos</Text>
          </View>
          <Text style={styles.subtitle}>Encuentra autopartes cerca de ti</Text>
        </View>

        <NearbyProviders
          maxDistance={15}
          showAlert={false}
          showTitle={false}
          containerStyle={styles.providersContainer}
        />
      </View>
    </SafeScreen>
  );
}

const createStyles = (theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    header: {
      backgroundColor: theme.primary,
      paddingHorizontal: 20,
      paddingTop: 15,
      paddingBottom: 20,
      borderBottomLeftRadius: 25,
      borderBottomRightRadius: 25,
      shadowColor: theme.shadow,
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.25,
      shadowRadius: 5,
      elevation: 8,
    },
    headerContent: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 8,
    },
    title: {
      fontSize: responsiveFontSize(22),
      fontWeight: "bold",
      color: theme.white,
      marginLeft: 10,
    },
    subtitle: {
      fontSize: responsiveFontSize(14),
      color: "rgba(255, 255, 255, 0.9)",
      marginLeft: 42,
    },
    providersContainer: {
      flex: 1,
      marginTop: 0,
    },
  });
