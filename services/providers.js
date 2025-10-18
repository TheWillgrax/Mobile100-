// services/providers.js
import { api } from './api';

export async function fetchNearbyProviders(latitude, longitude, limit = 10) {
  try {
    console.log('📍 Buscando proveedores cercanos para:', latitude, longitude);
    
    const response = await api.get(`/provider/nearby`, {
      params: {
        lat: latitude,
        lng: longitude,
        limit: limit
      }
    });
    
    console.log('✅ Proveedores cercanos encontrados:', response.data?.length || 0);
    
    // Manejar diferentes formatos de respuesta
    if (Array.isArray(response.data)) {
      return response.data;
    } else if (response.data && Array.isArray(response.data.data)) {
      return response.data.data;
    } else if (response.data && Array.isArray(response.data.providers)) {
      return response.data.providers;
    } else {
      console.warn('Formato de respuesta inesperado:', response.data);
      return [];
    }
  } catch (error) {
    console.error('❌ Error fetching nearby providers:', {
      message: error.message,
      status: error.response?.status,
      url: error.config?.url
    });
    
    // Fallback a datos mock si la API falla
    if (error.response?.status === 403 || error.code === 'ECONNREFUSED') {
      console.warn('📱 Usando datos de prueba...');
      return getMockProviders();
    }
    
    throw new Error('No se pudieron cargar los proveedores cercanos');
  }
}

// Función alternativa para obtener todos los proveedores (si necesitas)
export async function fetchAllProviders() {
  try {
    const response = await api.get('/provider');
    
    if (Array.isArray(response.data)) {
      return response.data;
    } else if (response.data && Array.isArray(response.data.data)) {
      return response.data.data;
    } else {
      return [];
    }
  } catch (error) {
    console.error('Error fetching all providers:', error);
    return getMockProviders();
  }
}