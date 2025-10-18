// components/NearbyProviders.jsx
import React from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { useNearbyProviders } from '../hooks/useNearbyProviders';

export function NearbyProviders({ 
  maxDistance = 10, 
  showAlert = true,
  showTitle = true,
  containerStyle = {},
  limit = 10,
  isTab = false // Nueva prop para modo pestaña
}) {
  const { 
    nearbyProviders, 
    loading, 
    error, 
    userLocation,
    userAddress,
    refetch,
    stats 
  } = useNearbyProviders(maxDistance, limit);

  const [refreshing, setRefreshing] = React.useState(false);

  // Función para actualizar
  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refetch();
    } catch (err) {
      console.error('Error refreshing:', err);
    } finally {
      setRefreshing(false);
    }
  };

  // Funciones de contacto
  const handleCallProvider = (phone) => {
    Linking.openURL(`tel:${phone}`);
  };

  const handleEmailProvider = (email) => {
    Linking.openURL(`mailto:${email}?subject=Consulta desde Autoparts Mobile`);
  };

  const handleOpenMaps = (provider) => {
    const { lat, lng } = provider.location;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    Linking.openURL(url);
  };

  // Alerta de proveedores cercanos (solo si no es pestaña)
  React.useEffect(() => {
    if (isTab) return; // No mostrar alertas en modo pestaña
    
    if (showAlert && !loading && userLocation) {
      if (nearbyProviders.length > 0) {
        Alert.alert(
          '🏪 Proveedores cercanos',
          `Encontramos ${nearbyProviders.length} proveedor(es) cerca de ti`,
          [{ text: 'Ver proveedores' }]
        );
      } else {
        Alert.alert(
          '📍 Sin proveedores cercanos',
          `No encontramos proveedores en tu área.`,
          [{ text: 'OK' }]
        );
      }
    }
  }, [nearbyProviders, loading, showAlert, userLocation, isTab]);

  // Estados de carga y error
  if (loading && !refreshing) {
    return (
      <View style={[styles.container, isTab && styles.tabContainer, containerStyle]}>
        {showTitle && !isTab && (
          <Text style={styles.title}>🏪 Buscando proveedores cercanos...</Text>
        )}
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007bff" />
          <Text style={styles.loadingText}>
            {userLocation ? 'Buscando proveedores...' : 'Obteniendo ubicación...'}
          </Text>
          {userAddress && (
            <Text style={styles.locationText}>
              📍 {userAddress.city}, {userAddress.country}
            </Text>
          )}
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, isTab && styles.tabContainer, containerStyle]}>
        {showTitle && !isTab && <Text style={styles.title}>❌ Error de conexión</Text>}
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <Text style={styles.errorSubtext}>Verifica tu conexión a internet</Text>
          <TouchableOpacity style={styles.retryButton} onPress={refetch}>
            <Text style={styles.retryText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, isTab && styles.tabContainer, containerStyle]}>
      {showTitle && !isTab && (
        <View style={styles.header}>
          <Text style={styles.title}>
            🏪 Proveedores cercanos ({nearbyProviders.length})
          </Text>
          <Text style={styles.subtitle}>
            Radio: {maxDistance}km 
            {userAddress?.city && ` • 📍 ${userAddress.city}`}
          </Text>
        </View>
      )}
      
      {nearbyProviders.length === 0 ? (
        <View style={[styles.emptyContainer, isTab && styles.tabEmptyContainer]}>
          <Text style={styles.emptyEmoji}>📭</Text>
          <Text style={styles.emptyText}>No hay proveedores en tu área</Text>
          <Text style={styles.emptySubtext}>
            No encontramos proveedores en un radio de {maxDistance}km alrededor de tu ubicación.
          </Text>
          <TouchableOpacity style={styles.retryButton} onPress={refetch}>
            <Text style={styles.retryText}>Buscar nuevamente</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView 
          style={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={onRefresh}
              colors={['#007bff']}
              tintColor={'#007bff'}
            />
          }
        >
          {nearbyProviders.map((provider) => (
            <View key={provider.id} style={[
              styles.providerCard,
              isTab && styles.tabProviderCard
            ]}>
              <View style={styles.providerHeader}>
                <View style={styles.providerInfo}>
                  <Text style={styles.providerName}>{provider.name}</Text>
                  <Text style={styles.providerDistance}>
                    📏 {provider.distance ? `${provider.distance.toFixed(1)} km` : 'Distancia no disponible'}
                  </Text>
                </View>
                <TouchableOpacity 
                  onPress={() => handleOpenMaps(provider)}
                  style={styles.mapsButton}
                >
                  <Text style={styles.mapsText}>🗺️ Cómo llegar</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.addressSection}>
                <Text style={styles.addressText}>
                  📍 {provider.address || 'Dirección no disponible'}
                </Text>
                <Text style={styles.locationDetail}>
                  {provider.city}{provider.state ? `, ${provider.state}` : ''} • {provider.country}
                </Text>
              </View>

              <View style={styles.contactSection}>
                {provider.phone && (
                  <TouchableOpacity 
                    onPress={() => handleCallProvider(provider.phone)}
                    style={styles.contactButton}
                  >
                    <Text style={styles.contactText}>📞 {provider.phone}</Text>
                  </TouchableOpacity>
                )}
                
                {provider.email && (
                  <TouchableOpacity 
                    onPress={() => handleEmailProvider(provider.email)}
                    style={styles.contactButton}
                  >
                    <Text style={styles.contactText}>✉️ {provider.email}</Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Información adicional */}
              <View style={styles.footerSection}>
                <Text style={styles.footerText}>
                  ID: {provider.id} • 
                  Actualizado: {provider.updated_at ? 
                    new Date(provider.updated_at).toLocaleDateString('es-GT') : 
                    'Fecha no disponible'
                  }
                </Text>
              </View>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#fff' 
  },
  tabContainer: {
    flex: 1,
    marginTop: 0, // Eliminar margen superior en modo pestaña
  },
  header: { 
    marginBottom: 15, 
    paddingHorizontal: 10 
  },
  title: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    color: '#333' 
  },
  subtitle: { 
    fontSize: 14, 
    color: '#666', 
    marginTop: 4 
  },
  loadingContainer: { 
    padding: 30, 
    alignItems: 'center' 
  },
  loadingText: { 
    fontSize: 16, 
    color: '#666', 
    marginTop: 10,
    textAlign: 'center'
  },
  locationText: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    marginTop: 5
  },
  errorContainer: { 
    padding: 20, 
    alignItems: 'center', 
    backgroundColor: '#ffe6e6', 
    borderRadius: 10, 
    margin: 10 
  },
  errorText: { 
    fontSize: 16, 
    color: '#d63031', 
    fontWeight: 'bold', 
    marginBottom: 8, 
    textAlign: 'center' 
  },
  errorSubtext: { 
    fontSize: 14, 
    color: '#666', 
    textAlign: 'center', 
    marginBottom: 15 
  },
  retryButton: { 
    backgroundColor: '#007bff', 
    paddingHorizontal: 20, 
    paddingVertical: 10, 
    borderRadius: 5 
  },
  retryText: { 
    color: '#fff', 
    fontWeight: 'bold' 
  },
  emptyContainer: { 
    padding: 40, 
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    marginHorizontal: 10,
  },
  tabEmptyContainer: {
    marginHorizontal: 15,
    marginTop: 20,
  },
  emptyEmoji: { 
    fontSize: 40, 
    marginBottom: 10 
  },
  emptyText: { 
    fontSize: 16, 
    color: '#666', 
    fontWeight: 'bold', 
    marginBottom: 8, 
    textAlign: 'center' 
  },
  emptySubtext: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    marginBottom: 15,
    lineHeight: 20,
  },
  scrollContainer: { 
    flex: 1 
  },
  providerCard: { 
    backgroundColor: '#f8f9fa', 
    padding: 15, 
    margin: 10, 
    borderRadius: 10, 
    borderLeftWidth: 4, 
    borderLeftColor: '#007bff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  tabProviderCard: {
    marginHorizontal: 15,
    marginVertical: 8,
  },
  providerHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'flex-start', 
    marginBottom: 10 
  },
  providerInfo: { 
    flex: 1, 
    marginRight: 10 
  },
  providerName: { 
    fontSize: 16, 
    fontWeight: 'bold', 
    color: '#333', 
    marginBottom: 4 
  },
  providerDistance: { 
    fontSize: 14, 
    color: '#007bff', 
    fontWeight: '500' 
  },
  mapsButton: { 
    backgroundColor: '#28a745', 
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 5 
  },
  mapsText: { 
    color: '#fff', 
    fontWeight: 'bold',
    fontSize: 12,
  },
  addressSection: { 
    marginBottom: 10 
  },
  addressText: {
    fontSize: 14,
    color: '#555',
    marginBottom: 2
  },
  locationDetail: {
    fontSize: 13,
    color: '#777'
  },
  contactSection: { 
    flexDirection: 'row', 
    flexWrap: 'wrap',
    marginBottom: 10 
  },
  contactButton: { 
    backgroundColor: '#e9ecef', 
    paddingHorizontal: 12, 
    paddingVertical: 6, 
    borderRadius: 15, 
    marginRight: 8, 
    marginBottom: 8 
  },
  contactText: { 
    fontSize: 12, 
    color: '#007bff', 
    fontWeight: '500' 
  },
  footerSection: {
    borderTopWidth: 1,
    borderTopColor: '#dee2e6',
    paddingTop: 8,
  },
  footerText: {
    fontSize: 11,
    color: '#999',
    fontStyle: 'italic',
  }
});

export default NearbyProviders;