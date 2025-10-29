// services/inventory.js
import { api } from "./api";
import { fetchProducts } from "./products";

const INVENTORY_ENDPOINT = "/bulkloadinventory/all";
const CREATE_INVENTORY_ENDPOINT = "/bulkloadinventory/createOne";
const INVENTORY_BASE_ENDPOINT = "/bulkloadinventory";
const UPDATE_INVENTORY_ENDPOINT = (id) => `${INVENTORY_BASE_ENDPOINT}/updateOne/${id}`;
const DELETE_INVENTORY_ENDPOINT = (id) => `${INVENTORY_BASE_ENDPOINT}/deleteOne/${id}`;

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

const extractProductData = (value) => {
  if (!value || typeof value !== "object") {
    return {};
  }

  if (Array.isArray(value)) {
    for (const candidate of value) {
      const data = extractProductData(candidate);
      if (Object.keys(data).length > 0) {
        return data;
      }
    }
    return {};
  }

  if (value.data) {
    return extractProductData(value.data);
  }

  if (value.attributes) {
    return {
      ...value.attributes,
      id: value.id ?? value.attributes?.id ?? null,
      documentId:
        value.attributes?.documentId ?? value.attributes?.document_id ?? null,
    };
  }

  return { ...value };
};

const buildProductIndex = (products) => {
  const index = {
    byId: new Map(),
    byDocumentId: new Map(),
    byCode: new Map(),
    byVendor: new Map(),
  };

  if (!Array.isArray(products)) {
    return index;
  }

  for (const product of products) {
    if (!product) continue;

    const id = product.id ?? product.documentId ?? null;
    if (id !== null && id !== undefined) {
      index.byId.set(String(id), product);
    }

    if (product.documentId) {
      index.byDocumentId.set(String(product.documentId), product);
    }

    if (product.code) {
      index.byCode.set(String(product.code).toLowerCase(), product);
    }

    if (product.vendorCode) {
      const vendorKey = String(product.vendorCode).trim().toLowerCase();
      if (!vendorKey) continue;
      if (!index.byVendor.has(vendorKey)) {
        index.byVendor.set(vendorKey, []);
      }
      index.byVendor.get(vendorKey).push(product);
    }
  }

  return index;
};

const toKey = (value) => {
  if (value === null || value === undefined) return null;
  const str = String(value).trim();
  return str.length > 0 ? str : null;
};

const findProductMatch = (item, index) => {
  if (!index) return null;

  const rawProduct = extractProductData(item?.product);

  const idCandidates = [
    item?.productId,
    item?.product_id,
    rawProduct?.id,
    rawProduct?.productId,
    rawProduct?.product_id,
  ];

  for (const candidate of idCandidates) {
    const key = toKey(candidate);
    if (!key) continue;
    const product = index.byId.get(key) ?? index.byDocumentId.get(key);
    if (product) return product;
  }

  const documentCandidates = [
    item?.productDocumentId,
    item?.product_document_id,
    rawProduct?.documentId,
    rawProduct?.document_id,
  ];

  for (const candidate of documentCandidates) {
    const key = toKey(candidate);
    if (!key) continue;
    const product = index.byDocumentId.get(key);
    if (product) return product;
  }

  const codeCandidates = [
    item?.sku,
    item?.code,
    item?.productCode,
    item?.product_code,
    rawProduct?.code,
    rawProduct?.sku,
    rawProduct?.productCode,
    rawProduct?.product_code,
  ];

  for (const candidate of codeCandidates) {
    const key = toKey(candidate);
    if (!key) continue;
    const product = index.byCode.get(key.toLowerCase());
    if (product) return product;
  }

  const vendorCandidates = [
    item?.vendor,
    rawProduct?.vendor,
    rawProduct?.vendorCode,
    rawProduct?.vendor_code,
  ];

  for (const candidate of vendorCandidates) {
    const key = toKey(candidate);
    if (!key) continue;
    const matches = index.byVendor.get(key.toLowerCase());
    if (matches?.length === 1) {
      return matches[0];
    }
  }

  return null;
};

const normalizeInventoryItem = (item, productIndex) => {
  if (!item) return null;

  const fallbackProduct = extractProductData(item.product);
  const matchedProduct = findProductMatch(item, productIndex);
  const product = { ...(matchedProduct ?? {}), ...(fallbackProduct ?? {}) };

  const productId =
    product.id ??
    matchedProduct?.id ??
    fallbackProduct?.id ??
    item.productId ??
    item.product_id ??
    (typeof item.product === "string" || typeof item.product === "number"
      ? item.product
      : null);

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
    brand: product.vendorCode ?? product.vendor ?? null,
    type: product.type ?? null,
    vendor: item.vendor ?? product.vendorCode ?? product.vendor ?? null,
    status,
    statusLabel: formatInventoryStatus(status),
    image: toAbsoluteUrl(imageCandidate),
    productId,
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
    const [response, products] = await Promise.all([
      api.get(INVENTORY_ENDPOINT),
      fetchProducts().catch((error) => {
        console.warn("Failed to fetch products for inventory merge", error);
        return [];
      }),
    ]);

    const productIndex = buildProductIndex(products);
    const rawItems = unwrapInventoryResponse(response?.data);
    return rawItems
      .map((item) => normalizeInventoryItem(item, productIndex))
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

const buildInventoryPayload = ({ productId, product, quantity, vendor }) => {
  const payload = {};

  if (productId) {
    payload.productId = productId;
  }

  if (product) {
    payload.product = product;
  }

  if (quantity !== undefined) {
    payload.quantity = quantity;
  }

  if (vendor !== undefined) {
    payload.vendor = vendor;
  }

  return payload;
};

export async function createInventoryRecord({ productId, product, quantity, vendor }) {
  try {
    const response = await api.post(
      CREATE_INVENTORY_ENDPOINT,
      buildInventoryPayload({ productId, product, quantity, vendor })
    );

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

export async function updateInventoryRecord(id, { productId, product, quantity, vendor }) {
  if (!id) {
    throw new Error("El identificador del inventario es obligatorio.");
  }

  try {
    const response = await api.put(
      UPDATE_INVENTORY_ENDPOINT(id),
      buildInventoryPayload({ productId, product, quantity, vendor })
    );

    const updatedItem =
      response?.data?.data ?? response?.data?.item ?? response?.data ?? null;

    return normalizeInventoryItem(updatedItem);
  } catch (error) {
    console.error("Error updating inventory record:", error);
    const err = new Error(
      error?.friendlyMessage ||
        error?.message ||
        "No se pudo actualizar el registro de inventario."
    );
    err.cause = error;
    throw err;
  }
}

export async function deleteInventoryRecord(id) {
  if (!id) {
    throw new Error("El identificador del inventario es obligatorio.");
  }

  try {
    await api.delete(DELETE_INVENTORY_ENDPOINT(id));
  } catch (error) {
    console.error("Error deleting inventory record:", error);
    const err = new Error(
      error?.friendlyMessage ||
        error?.message ||
        "No se pudo eliminar el registro de inventario."
    );
    err.cause = error;
    throw err;
  }
}
