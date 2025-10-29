// services/providers.js
import { api } from "./api";

const PROVIDERS_ENDPOINT = "/providers";

const getMockProviders = () => [
  {
    id: "mock-1",
    name: "Autopartes Express",
    address: "Av. Siempre Viva 742",
    distance: "1.2 km",
    phone: "+52 55 1234 5678",
  },
  {
    id: "mock-2",
    name: "Refacciones del Norte",
    address: "Calle Principal 123",
    distance: "2.8 km",
    phone: "+52 55 9876 5432",
  },
];

const unwrapProvidersResponse = (payload) => {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.providers)) return payload.providers;
  return [];
};

export async function fetchNearbyProviders(latitude, longitude, limit = 10) {
  try {
    const response = await api.get(`${PROVIDERS_ENDPOINT}/nearby`, {
      params: {
        lat: latitude,
        lng: longitude,
        limit,
      },
    });

    return unwrapProvidersResponse(response?.data);
  } catch (error) {
    console.error("❌ Error fetching nearby providers:", {
      message: error.message,
      status: error.response?.status,
      url: error.config?.url,
    });

    if (error.response?.status === 403 || error.response?.status === 404 || error.code === "ECONNREFUSED") {
      console.warn("📱 Usando datos de prueba...");
      return getMockProviders();
    }

    throw new Error("No se pudieron cargar los proveedores cercanos");
  }
}

export async function fetchAllProviders() {
  try {
    const response = await api.get(PROVIDERS_ENDPOINT);
    return unwrapProvidersResponse(response?.data);
  } catch (error) {
    console.error("Error fetching all providers:", error);
    return getMockProviders();
  }
}
