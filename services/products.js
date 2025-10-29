// services/products.js
import { api } from "./api";

const PRODUCT_LIST_ENDPOINTS = [
  "/products/all",
  "/products/getAll",
  "/products/getProducts",
];
const PRODUCT_LEGACY_ENDPOINT = "/products";
const PRODUCT_CREATE_ENDPOINTS = [
  "/products/createProduct",
  PRODUCT_LEGACY_ENDPOINT,
];
const PRODUCT_UPDATE_ENDPOINTS = (id) => [
  `/products/updateProduct/${id}`,
  `/products/${id}`,
];
const PRODUCT_UPDATE_QUERY_ENDPOINT = "/products/updateProduct";
const PRODUCT_DELETE_ENDPOINTS = (id) => [
  `/products/deleteProduct/${id}`,
  `/products/${id}`,
];
const PRODUCT_DELETE_QUERY_ENDPOINT = "/products/deleteProduct";

const shouldFallbackRequest = (error) => {
  const status = error?.response?.status;
  if (!status) return false;
  if (status === 404 || status === 405) return true;
  if (status >= 500 && status < 600) return true;
  return false;
};

const executeWithFallback = async (attempts) => {
  let lastError = null;

  for (const attempt of attempts) {
    try {
      return await attempt();
    } catch (error) {
      lastError = error;
      if (!shouldFallbackRequest(error)) {
        throw error;
      }
    }
  }

  if (lastError) {
    throw lastError;
  }

  return null;
};

const parseNumber = (value) => {
  if (value === null || value === undefined) return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
};

const unwrapProductsResponse = (payload) => {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.results)) return payload.results;
  if (Array.isArray(payload?.products)) return payload.products;
  if (Array.isArray(payload?.data?.products)) return payload.data.products;
  if (payload?.data?.data && Array.isArray(payload.data.data)) return payload.data.data;
  return [];
};

const sanitizeProductPayload = (product = {}) => {
  const sanitized = { ...product };

  ["name", "code", "description", "vendorCode", "type"].forEach((key) => {
    if (sanitized[key] === undefined) return;
    if (typeof sanitized[key] === "string") {
      const trimmed = sanitized[key].trim();
      if (trimmed) {
        sanitized[key] = trimmed;
      } else {
        delete sanitized[key];
      }
    }
  });

  ["salePrice", "wholesalePrice", "retailPrice"].forEach((key) => {
    if (!(key in sanitized)) return;

    const value = sanitized[key];

    if (value === undefined || value === "") {
      delete sanitized[key];
      return;
    }

    if (value === null) {
      sanitized[key] = null;
      return;
    }

    if (typeof value === "string") {
      const parsed = Number(value);
      sanitized[key] = Number.isFinite(parsed) ? parsed : null;
      return;
    }

    if (!Number.isFinite(value)) {
      delete sanitized[key];
    }
  });

  Object.keys(sanitized).forEach((key) => {
    if (sanitized[key] === undefined) {
      delete sanitized[key];
    }
  });

  return sanitized;
};

const wrapAsStrapiPayload = (payload) => ({ data: payload });

const normalizeProduct = (entry) => {
  if (!entry) return null;

  const data = entry.attributes ?? entry;

  const id = entry.id ?? data.id ?? data.documentId ?? null;
  const code =
    data.code ??
    data.sku ??
    data.productCode ??
    data.product_code ??
    data.productId ??
    null;

  return {
    id,
    documentId: data.documentId ?? null,
    name: data.name ?? data.productName ?? data.title ?? "Producto sin nombre",
    code,
    description: data.description ?? null,
    vendorCode: data.vendorCode ?? data.vendor_code ?? data.vendor ?? null,
    salePrice: parseNumber(data.salePrice ?? data.sale_price ?? data.sale_price_amount),
    wholesalePrice: parseNumber(
      data.wholesalePrice ?? data.wholesale_price ?? data.wholesale_price_amount
    ),
    retailPrice: parseNumber(
      data.retailPrice ?? data.retail_price ?? data.retail_price_amount
    ),
    type: data.type ?? data.category ?? null,
  };
};

export async function fetchProducts() {
  try {
    const attempts = PRODUCT_LIST_ENDPOINTS.filter(Boolean).map((endpoint) => () =>
      api.get(endpoint)
    );

    attempts.push(() => api.get(PRODUCT_LEGACY_ENDPOINT, { params: { populate: "*" } }));

    const response = await executeWithFallback(attempts);

    const rawItems = unwrapProductsResponse(response?.data);
    return rawItems
      .map((item) => normalizeProduct(item))
      .filter((item) => item !== null);
  } catch (error) {
    console.error("Error fetching products:", error);
    const err = new Error(
      error?.friendlyMessage || error?.message || "No se pudieron cargar los productos."
    );
    err.cause = error;
    throw err;
  }
}

export async function createProduct(product) {
  try {
    const sanitizedPayload = sanitizeProductPayload(product);
    const [modernEndpoint, legacyEndpoint] = PRODUCT_CREATE_ENDPOINTS;

    const response = await executeWithFallback([
      () => api.post(modernEndpoint, sanitizedPayload),
      () => api.post(legacyEndpoint, wrapAsStrapiPayload(sanitizedPayload)),
    ]);
    const createdItem =
      response?.data?.data ?? response?.data?.item ?? response?.data ?? null;
    return normalizeProduct(createdItem);
  } catch (error) {
    console.error("Error creating product:", error);
    const err = new Error(
      error?.friendlyMessage || error?.message || "No se pudo crear el producto."
    );
    err.cause = error;
    throw err;
  }
}

export async function updateProduct(id, product) {
  if (!id) {
    throw new Error("El identificador del producto es obligatorio.");
  }

  try {
    const sanitizedPayload = sanitizeProductPayload(product);
    const [modernEndpoint, legacyEndpoint] = PRODUCT_UPDATE_ENDPOINTS(id);

    const response = await executeWithFallback([
      () => api.put(modernEndpoint, sanitizedPayload),
      () => api.put(PRODUCT_UPDATE_QUERY_ENDPOINT, sanitizedPayload, { params: { id } }),
      () => api.put(legacyEndpoint, wrapAsStrapiPayload(sanitizedPayload)),
    ]);
    const updatedItem =
      response?.data?.data ?? response?.data?.item ?? response?.data ?? null;
    return normalizeProduct(updatedItem);
  } catch (error) {
    console.error("Error updating product:", error);
    const err = new Error(
      error?.friendlyMessage || error?.message || "No se pudo actualizar el producto."
    );
    err.cause = error;
    throw err;
  }
}

export async function deleteProduct(id) {
  if (!id) {
    throw new Error("El identificador del producto es obligatorio.");
  }

  try {
    const [modernEndpoint, legacyEndpoint] = PRODUCT_DELETE_ENDPOINTS(id);

    await executeWithFallback([
      () => api.delete(modernEndpoint),
      () => api.delete(PRODUCT_DELETE_QUERY_ENDPOINT, { params: { id } }),
      () => api.delete(legacyEndpoint),
    ]);
  } catch (error) {
    console.error("Error deleting product:", error);
    const err = new Error(
      error?.friendlyMessage || error?.message || "No se pudo eliminar el producto."
    );
    err.cause = error;
    throw err;
  }
}
