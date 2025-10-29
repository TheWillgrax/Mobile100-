// services/inventory.js
import { api } from "./api";

const INVENTORY_ENDPOINT = "/bulkloadinventory/all";
const CREATE_INVENTORY_ENDPOINT = "/bulkloadinventory/createOne";

const getStrapiBaseURL = () => {
  const baseURL = api.defaults?.baseURL ?? "";
  if (!baseURL) return "";
  return baseURL.replace(/\/?api\/?$/, "");
};

const toAbsoluteUrl = (url) => {
  if (!url || typeof url !== "string") return null;
  if (/^https?:\/\//i.test(url)) return url;
  const baseURL = getStrapiBaseURL();
  if (!baseURL) return url.startsWith("/") ? url : `/${url}`;
  const sanitized = url.startsWith("/") ? url : `/${url}`;
  return `${baseURL}${sanitized}`;
};

const parseNumber = (value) => {
  if (value === null || value === undefined) return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
};

const resolveMediaUrl = (value) => {
  if (!value) return null;
  if (typeof value === "string") return value;
  if (Array.isArray(value)) {
    for (const candidate of value) {
      const resolved = resolveMediaUrl(candidate);
      if (resolved) return resolved;
    }
    return null;
  }
  if (value?.url) return value.url;
  if (value?.formats) {
    const formatUrl =
      value.formats?.medium?.url ??
      value.formats?.small?.url ??
      value.formats?.thumbnail?.url ??
      null;
    if (formatUrl) return formatUrl;
  }
  if (value?.data) return resolveMediaUrl(value.data);
  if (value?.attributes) return resolveMediaUrl(value.attributes);
  return null;
};

const formatInventoryStatus = (status) => {
  switch (status) {
    case "in_stock":
      return "Disponible";
    case "out_of_stock":
      return "Agotado";
    case "low_stock":
      return "Stock bajo";
    default:
      return status ?? null;
  }
};

const normalizeInventoryItem = (item) => {
  if (!item) return null;

  const product = item.product ?? {};

  const price =
    parseNumber(product.salePrice) ??
    parseNumber(product.retailPrice) ??
    parseNumber(product.wholesalePrice) ??
    null;

  const imageCandidate =
    resolveMediaUrl(item.image) ??
    resolveMediaUrl(item.images) ??
    resolveMediaUrl(product.image) ??
    resolveMediaUrl(product.images) ??
    null;

  const status = item.stock_status ?? item.status ?? null;

  return {
    id:
      item.id ??
      product.id ??
      item.documentId ??
      product.documentId ??
      `${product.code ?? product.name ?? Math.random()}`,
    name: product.name ?? item.name ?? "Producto sin nombre",
    sku:
      product.code ??
      product.vendorCode ??
      item.sku ??
      product.documentId ??
      null,
    stock: parseNumber(item.quantity),
    price,
    description: product.description ?? item.description ?? null,
    brand: product.vendorCode ?? null,
    type: product.type ?? null,
    vendor: item.vendor ?? null,
    status,
    statusLabel: formatInventoryStatus(status),
    image: toAbsoluteUrl(imageCandidate),
  };
};

const unwrapInventoryResponse = (payload) => {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.results)) return payload.results;
  if (payload?.data?.data && Array.isArray(payload.data.data)) return payload.data.data;
  return [];
};

export async function fetchInventoryItems() {
  try {
    const response = await api.get(INVENTORY_ENDPOINT);

    const rawItems = unwrapInventoryResponse(response?.data);
    return rawItems
      .map((item) => normalizeInventoryItem(item))
      .filter((item) => item !== null);
  } catch (error) {
    console.error("Error fetching inventory:", error);
    const err = new Error(
      error?.friendlyMessage ||
        error?.message ||
        "No se pudo cargar el inventario real."
    );
    err.cause = error;
    throw err;
  }
}

export async function createInventoryRecord({ product, quantity, vendor }) {
  try {
    const payload = {
      product,
      quantity,
      vendor,
    };

    const response = await api.post(CREATE_INVENTORY_ENDPOINT, payload);

    const createdItem =
      response?.data?.data ?? response?.data?.item ?? response?.data ?? null;

    return normalizeInventoryItem(createdItem);
  } catch (error) {
    console.error("Error creating inventory record:", error);
    const err = new Error(
      error?.friendlyMessage ||
        error?.message ||
        "No se pudo crear el registro de inventario."
    );
    err.cause = error;
    throw err;
  }
}
