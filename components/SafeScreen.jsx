// components/SafeScreen.jsx
import { Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocation } from "../app/providers/LocationProvider";
import { COLORS } from "../constants/colors";

const SafeScreen = ({ children }) => {
  const insets = useSafeAreaInsets();
  const { location, errorMsg } = useLocation();

  return (
    <View style={{ 
      paddingTop: insets.top, 
      flex: 1, 
      backgroundColor: COLORS.background 
    }}>
      {children}
      
      {/* Información de ubicación (opcional - puedes comentar si no la necesitas) */}
      {errorMsg ? (
        <Text style={{ color: "red", padding: 10, fontSize: 12 }}>
          Error ubicación: {errorMsg}
        </Text>
      ) : location ? (
        <Text style={{ padding: 10, color: "#666", fontSize: 12 }}>
          📍 Lat: {location.coords.latitude.toFixed(4)}, Lon: {location.coords.longitude.toFixed(4)}
        </Text>
      ) : (
        <Text style={{ padding: 10, color: "#999", fontSize: 12 }}>
          Obteniendo ubicación...
        </Text>
      )}
    </View>
  );
};

export default SafeScreen;