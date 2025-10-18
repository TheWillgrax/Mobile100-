// app/(tabs)/nearby.jsx
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";
import { NearbyProviders } from "../../components/NearbyProviders";
import SafeScreen from "../../components/SafeScreen";
import { COLORS } from "../../constants/colors";

export default function NearbyScreen() {
  return (
    <SafeScreen>
      <View style={styles.container}>
        {/* Header de la pantalla */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Ionicons name="location-sharp" size={32} color={COLORS.white} />
            <Text style={styles.title}>Proveedores Cercanos</Text>
          </View>
          <Text style={styles.subtitle}>
            Encuentra autopartes cerca de ti
          </Text>
        </View>

        {/* Componente de proveedores cercanos */}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 20,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    shadowColor: "#000",
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
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.white,
    marginLeft: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.9)",
    marginLeft: 42, // Para alinear con el ícono
  },
  providersContainer: {
    flex: 1,
    marginTop: 0,
  },
});