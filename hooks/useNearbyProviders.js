// hooks/useNearbyProviders.js
import { useEffect, useState } from 'react';
import { useLocation } from '../app/providers/LocationProvider';
import { fetchNearbyProviders } from '../services/providers.js';

export function useNearbyProviders(maxDistance = 10, limit = 10) {
  const { location, address, errorMsg: locationError, loading: locationLoading } = useLocation();
  const [nearbyProviders, setNearbyProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cargar proveedores cercanos cuando tenemos ubicación
  useEffect(() => {
    let isMounted = true;

    async function loadNearbyProviders() {
      if (!location || !location.coords) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        const { latitude, longitude } = location.coords;
        const providers = await fetchNearbyProviders(latitude, longitude, limit);
        
        if (isMounted) {
          // Filtrar por distancia máxima si el endpoint no lo hace
          const filteredProviders = providers.filter(provider => 
            provider.distance <= maxDistance
          );
          
          setNearbyProviders(filteredProviders);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadNearbyProviders();

    return () => {
      isMounted = false;
    };
  }, [location, maxDistance, limit]);

  // Función para recargar manualmente
  const refetch = async () => {
    if (!location?.coords) return;
    
    try {
      setLoading(true);
      const { latitude, longitude } = location.coords;
      const providers = await fetchNearbyProviders(latitude, longitude, limit);
      setNearbyProviders(providers);
      return providers;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Calcular estadísticas
  const stats = {
    totalCount: nearbyProviders.length,
    closestProvider: nearbyProviders.length > 0 
      ? nearbyProviders.reduce((closest, provider) => 
          provider.distance < closest.distance ? provider : closest
        )
      : null,
    averageDistance: nearbyProviders.length > 0
      ? nearbyProviders.reduce((sum, provider) => sum + provider.distance, 0) / nearbyProviders.length
      : 0
  };

  return {
    // Estados
    nearbyProviders,
    loading: locationLoading || loading,
    error: locationError || error,
    userLocation: location,
    userAddress: address,
    
    // Funciones
    refetch,
    
    // Estadísticas
    stats,
    
    // Información
    hasLocation: !!location,
    searchRadius: maxDistance
  };
}

export default useNearbyProviders;