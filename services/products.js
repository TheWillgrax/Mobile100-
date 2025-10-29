// services/products.js
import { api } from "./api";

const PRODUCTS_ENDPOINT = "/products";

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
  if (payload?.data?.data && Array.isArray(payload.data.data)) return payload.data.data;
  return [];
};

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
    const response = await api.get(PRODUCTS_ENDPOINT, {
      params: {
        populate: "*",
      },
    });

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

const buildProductPayload = (product) => {
  const sanitized = { ...product };

  ["salePrice", "wholesalePrice", "retailPrice"].forEach((key) => {
    if (sanitized[key] === "" || sanitized[key] === null || sanitized[key] === undefined) {
      sanitized[key] = null;
      return;
    }

    if (typeof sanitized[key] === "string") {
      const parsed = Number(sanitized[key]);
      sanitized[key] = Number.isFinite(parsed) ? parsed : null;
      return;
    }

    if (Number.isNaN(sanitized[key])) {
      sanitized[key] = null;
    }
  });

  return { data: sanitized };
};

export async function createProduct(product) {
  try {
    const response = await api.post(PRODUCTS_ENDPOINT, buildProductPayload(product));
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
    const response = await api.put(
      `${PRODUCTS_ENDPOINT}/${id}`,
      buildProductPayload(product)
    );
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
    await api.delete(`${PRODUCTS_ENDPOINT}/${id}`);
  } catch (error) {
    console.error("Error deleting product:", error);
    const err = new Error(
      error?.friendlyMessage || error?.message || "No se pudo eliminar el producto."
    );
    err.cause = error;
    throw err;
  }
}
