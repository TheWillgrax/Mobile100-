// utils/locationUtils.js

/**
 * Calcula la distancia entre dos puntos geográficos usando la fórmula de Haversine
 * @param {number} lat1 - Latitud del primer punto
 * @param {number} lon1 - Longitud del primer punto  
 * @param {number} lat2 - Latitud del segundo punto
 * @param {number} lon2 - Longitud del segundo punto
 * @returns {number} Distancia en kilómetros
 */
export function calculateDistance(lat1, lon1, lat2, lon2) {
  // Validar coordenadas
  if (!isValidCoordinate(lat1, lon1) || !isValidCoordinate(lat2, lon2)) {
    console.warn('Coordenadas inválidas:', { lat1, lon1, lat2, lon2 });
    return Infinity; // Retornar valor muy alto para que no aparezca como cercano
  }
  
  const R = 6371; // Radio de la Tierra en kilómetros
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  // Redondear a 2 decimales
  return Math.round(distance * 100) / 100;
}

/**
 * Convierte grados a radianes
 * @param {number} deg - Valor en grados
 * @returns {number} Valor en radianes
 */
function deg2rad(deg) {
  return deg * (Math.PI / 180);
}

/**
 * Valida si las coordenadas son válidas
 * @param {number} lat - Latitud
 * @param {number} lng - Longitud
 * @returns {boolean} True si las coordenadas son válidas
 */
function isValidCoordinate(lat, lng) {
  return (
    typeof lat === 'number' && 
    typeof lng === 'number' &&
    !isNaN(lat) && 
    !isNaN(lng) &&
    lat >= -90 && 
    lat <= 90 &&
    lng >= -180 && 
    lng <= 180
  );
}

/**
 * Formatea la distancia de manera legible
 * @param {number} distance - Distancia en kilómetros
 * @returns {string} Distancia formateada
 */
export function formatDistance(distance) {
  if (distance === null || distance === undefined || !isFinite(distance)) {
    return 'N/A';
  }
  
  if (distance < 0.1) {
    // Menos de 100 metros
    const meters = Math.round(distance * 1000);
    return `${meters} m`;
  } else if (distance < 1) {
    // Menos de 1 km
    const meters = Math.round(distance * 1000);
    return `${meters} m`;
  } else {
    // 1 km o más
    return `${distance.toFixed(1)} km`;
  }
}

/**
 * Filtra un array de ubicaciones por distancia máxima
 * @param {Object} userLocation - Ubicación del usuario {coords: {latitude, longitude}}
 * @param {Array} locations - Array de ubicaciones a filtrar
 * @param {number} maxDistance - Distancia máxima en km
 * @returns {Array} Ubicaciones dentro del radio
 */
export function filterByDistance(userLocation, locations, maxDistance) {
  if (!userLocation || !userLocation.coords || !Array.isArray(locations)) {
    return [];
  }
  
  const { latitude: userLat, longitude: userLng } = userLocation.coords;
  
  return locations.filter(location => {
    if (!location.location || !location.location.lat || !location.location.lng) {
      return false;
    }
    
    try {
      const distance = calculateDistance(
        userLat,
        userLng,
        location.location.lat,
        location.location.lng
      );
      
      // Agregar la distancia calculada al objeto para uso posterior
      location.distance = distance;
      
      return distance <= maxDistance;
    } catch (error) {
      console.warn('Error calculando distancia para:', location.id, error);
      return false;
    }
  });
}

/**
 * Ordena un array de ubicaciones por distancia (más cercano primero)
 * @param {Array} locations - Array de ubicaciones con propiedad distance
 * @returns {Array} Ubicaciones ordenadas por distancia
 */
export function sortByDistance(locations) {
  if (!Array.isArray(locations)) return [];
  
  return [...locations].sort((a, b) => {
    const distA = a.distance !== undefined ? a.distance : Infinity;
    const distB = b.distance !== undefined ? b.distance : Infinity;
    return distA - distB;
  });
}

export default {
  calculateDistance,
  formatDistance,
  filterByDistance,
  sortByDistance
};