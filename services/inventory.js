// services/inventory.js
import { api } from "./api";
import { fetchProducts } from "./products";

const INVENTORY_ENDPOINT = "/bulkloadinventory/all";
const CREATE_INVENTORY_ENDPOINT = "/bulkloadinventory/createOne";
const INVENTORY_BASE_ENDPOINT = "/bulkloadinventory";
const UPDATE_INVENTORY_ENDPOINT = (id) => `${INVENTORY_BASE_ENDPOINT}/update/${id}`;

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

const toKey = (value) => {
  if (value === null || value === undefined) return null;
  const key = `${value}`.trim();
  return key.length > 0 ? key : null;
};

const toCodeKey = (value) => {
  const key = toKey(value);
  return key ? key.toLowerCase() : null;
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

const buildProductLookup = (products = []) => {
  const lookup = new Map();

  products.forEach((product) => {
    const idKey = toKey(product?.id ?? product?.documentId);
    if (idKey) {
      lookup.set(`id:${idKey}`, product);
    }

    const documentKey = toKey(product?.documentId);
    if (documentKey) {
      lookup.set(`id:${documentKey}`, product);
    }

    const codeKey = toCodeKey(product?.code);
    if (codeKey) {
      lookup.set(`code:${codeKey}`, product);
    }

    const vendorKey = toCodeKey(product?.vendorCode);
    if (vendorKey) {
      lookup.set(`code:${vendorKey}`, product);
    }
  });

  return lookup;
};

const findMatchingProduct = (item, lookup) => {
  if (!lookup || lookup.size === 0 || !item) return null;

  const rawProduct = item.product ?? {};

  const candidateIds = [
    rawProduct?.id,
    rawProduct?.documentId,
    rawProduct?.productId,
    item.productId,
    item.product_id,
    typeof item.product === "string" || typeof item.product === "number"
      ? item.product
      : null,
  ];

  for (const value of candidateIds) {
    const key = toKey(value);
    if (key && lookup.has(`id:${key}`)) {
      return lookup.get(`id:${key}`);
    }
  }

  const candidateCodes = [
    rawProduct?.code,
    rawProduct?.sku,
    rawProduct?.productCode,
    rawProduct?.product_code,
    item.sku,
    item.code,
    item.productCode,
    item.product_code,
  ];

  for (const value of candidateCodes) {
    const key = toCodeKey(value);
    if (key && lookup.has(`code:${key}`)) {
      return lookup.get(`code:${key}`);
    }
  }

  return null;
};

const normalizeInventoryItem = (item, productLookup) => {
  if (!item) return null;

  const matchedProduct = findMatchingProduct(item, productLookup);
  const product = {
    ...(matchedProduct ?? {}),
    ...(item.product ?? {}),
  };
  const productId =
    product.id ??
    product.documentId ??
    matchedProduct?.id ??
    matchedProduct?.documentId ??
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
    resolveMediaUrl(matchedProduct?.image) ??
    resolveMediaUrl(matchedProduct?.images) ??
    null;

  const status = item.stock_status ?? item.status ?? null;

  return {
    id:
      item.id ??
      product.id ??
      item.documentId ??
      product.documentId ??
      `${product.code ?? product.name ?? Math.random()}`,
    name:
      product.name ??
      matchedProduct?.name ??
      item.name ??
      "Producto sin nombre",
    sku:
      product.code ??
      product.vendorCode ??
      item.sku ??
      product.documentId ??
      matchedProduct?.code ??
      matchedProduct?.vendorCode ??
      null,
    stock: parseNumber(
      item.quantity ??
        item.stock ??
        item.available ??
        item.inventory ??
        item.total ??
        item.amount
    ),
    price,
    description:
      product.description ?? matchedProduct?.description ?? item.description ?? null,
    brand: product.vendorCode ?? matchedProduct?.vendorCode ?? null,
    type: product.type ?? matchedProduct?.type ?? null,
    vendor: item.vendor ?? product.vendor ?? matchedProduct?.vendor ?? null,
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
    const response = await api.get(INVENTORY_ENDPOINT);
    let products = [];

    try {
      products = await fetchProducts();
    } catch (productError) {
      console.warn("No se pudieron obtener los productos para el inventario", productError);
      products = [];
    }

    const productLookup = buildProductLookup(products);

    const rawItems = unwrapInventoryResponse(response?.data);
    return rawItems
      .map((item) => normalizeInventoryItem(item, productLookup))
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

const sanitizeAction = (action) => {
  const normalized = `${action ?? ""}`.toLowerCase();
  return normalized === "remove" ? "remove" : "add";
};

const ensurePositiveQuantity = (quantity) => {
  const parsedQuantity = Number(quantity);
  if (!Number.isFinite(parsedQuantity) || parsedQuantity <= 0) {
    throw new Error("Ingresa una cantidad válida para actualizar el inventario.");
  }
  return parsedQuantity;
};

export async function updateInventoryRecord(id, { quantity, action }) {
  if (!id) {
    throw new Error("El identificador del inventario es obligatorio.");
  }

  try {
    const response = await api.patch(UPDATE_INVENTORY_ENDPOINT(id), {
      quantity: ensurePositiveQuantity(quantity),
      action: sanitizeAction(action),
    });

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

export async function deleteInventoryRecord(id, quantity) {
  if (!id) {
    throw new Error("El identificador del inventario es obligatorio.");
  }

  try {
    const fallbackQuantity = Number(quantity);
    const sanitizedQuantity =
      Number.isFinite(fallbackQuantity) && fallbackQuantity > 0 ? fallbackQuantity : 1;

    const response = await api.patch(UPDATE_INVENTORY_ENDPOINT(id), {
      quantity: ensurePositiveQuantity(sanitizedQuantity),
      action: "remove",
    });

    const updatedItem =
      response?.data?.data ?? response?.data?.item ?? response?.data ?? null;

    return normalizeInventoryItem(updatedItem);
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
