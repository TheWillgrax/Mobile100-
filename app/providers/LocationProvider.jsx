// app/providers/LocationProvider.jsx
import * as Location from "expo-location";
import { createContext, useContext, useEffect, useRef, useState } from "react";

const LocationContext = createContext({
  location: null,       // objeto completo de expo-location
  address: null,        // resultado de reverse geocode (city, country, ...)
  errorMsg: null,
  loading: true,
});

export const LocationProvider = ({ children }) => {
  const [location, setLocation] = useState(null);
  const [address, setAddress] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [loading, setLoading] = useState(true);
  const subscriptionRef = useRef(null);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        // pedir permiso en primer plano
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          setErrorMsg("Permiso de ubicación denegado");
          setLoading(false);
          return;
        }

        // obtener ubicación actual una vez
        const current = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Highest,
        });

        if (!mounted) return;
        setLocation(current);

        // opcional: reverse geocode para obtener ciudad/país
        try {
          const places = await Location.reverseGeocodeAsync({
            latitude: current.coords.latitude,
            longitude: current.coords.longitude,
          });
          if (places && places.length > 0) {
            const p = places[0];
            setAddress({
              city: p.city || p.subregion || p.region,
              country: p.country,
              street: p.street,
              postalCode: p.postalCode,
            });
          }
        } catch (e) {
          // no es crítico
          console.warn("reverseGeocode error:", e.message);
        }

        // iniciar seguimiento (watch) — ajusta timeInterval/distanceInterval según necesites
        subscriptionRef.current = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.Balanced,
            timeInterval: 5000,    // ms
            distanceInterval: 10,  // metros
          },
          (newLocation) => {
            setLocation(newLocation);
          }
        );
      } catch (e) {
        setErrorMsg(e.message || "Error al obtener la ubicación");
      } finally {
        setLoading(false);
      }
    })();

    return () => {
      mounted = false;
      if (subscriptionRef.current && subscriptionRef.current.remove) {
        subscriptionRef.current.remove();
      }
    };
  }, []);

  return (
    <LocationContext.Provider value={{ location, address, errorMsg, loading }}>
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => useContext(LocationContext);
