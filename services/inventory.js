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

  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return null;

    const direct = Number(trimmed);
    if (Number.isFinite(direct)) return direct;

    const numericMatch = trimmed.match(/-?\d+(?:[\.,]\d+)?/);
    if (numericMatch) {
      let normalized = numericMatch[0];
      const hasComma = normalized.includes(",");
      const hasDot = normalized.includes(".");

      if (hasComma && hasDot) {
        normalized = normalized.replace(/,/g, "");
      } else if (hasComma) {
        normalized = normalized.replace(/,/g, ".");
      }

      const parsed = Number(normalized);
      return Number.isFinite(parsed) ? parsed : null;
    }

    return null;
  }

  const number = Number(value);
  return Number.isFinite(number) ? number : null;
};

const unwrapStrapiEntity = (value) => {
  if (!value) return null;

  if (typeof value !== "object") {
    const key = `${value ?? ""}`.trim();
    const normalized = key.length > 0 ? key : null;

    return {
      id: normalized,
      documentId: normalized,
      value,
    };
  }

  if (Array.isArray(value)) {
    for (const entry of value) {
      const unwrapped = unwrapStrapiEntity(entry);
      if (unwrapped) return unwrapped;
    }
    return null;
  }

  if (value?.data) {
    return unwrapStrapiEntity(value.data);
  }

  if (value?.attributes) {
    const attributes = value.attributes ?? {};
    return {
      ...attributes,
      id:
        value.id ??
        attributes.id ??
        attributes.documentId ??
        attributes.document_id ??
        null,
      documentId:
        attributes.documentId ??
        attributes.document_id ??
        value.documentId ??
        value.document_id ??
        null,
    };
  }

  return {
    ...value,
    id: value.id ?? value.documentId ?? value.document_id ?? null,
    documentId: value.documentId ?? value.document_id ?? value.id ?? null,
  };
};

const normalizeProductReference = (product) => {
  if (!product) return null;

  const unwrapped = unwrapStrapiEntity(product);
  if (!unwrapped) return null;

  const { value: _rawValue, ...rest } = unwrapped;

  return {
    ...rest,
    id:
      rest.id ??
      rest.documentId ??
      rest.document_id ??
      rest.productId ??
      rest.product_id ??
      null,
    documentId:
      rest.documentId ??
      rest.document_id ??
      rest.id ??
      null,
    code:
      rest.code ??
      rest.sku ??
      rest.productCode ??
      rest.product_code ??
      null,
    vendorCode:
      rest.vendorCode ??
      rest.vendor_code ??
      rest.vendor ??
      null,
    name:
      rest.name ??
      rest.productName ??
      rest.title ??
      rest.label ??
      null,
  };
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
    const normalized = normalizeProductReference(product);
    if (!normalized) return;

    const idKey = toKey(normalized?.id ?? normalized?.documentId);
    if (idKey) {
      lookup.set(`id:${idKey}`, normalized);
    }

    const documentKey = toKey(normalized?.documentId);
    if (documentKey) {
      lookup.set(`id:${documentKey}`, normalized);
    }

    const codeKey = toCodeKey(normalized?.code);
    if (codeKey) {
      lookup.set(`code:${codeKey}`, normalized);
    }

    const vendorKey = toCodeKey(normalized?.vendorCode);
    if (vendorKey) {
      lookup.set(`code:${vendorKey}`, normalized);
    }
  });

  return lookup;
};

const findMatchingProduct = (item, lookup) => {
  if (!lookup || lookup.size === 0 || !item) return null;

  const rawProduct = normalizeProductReference(item.product) ?? {};

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
  if (!item || typeof item !== "object") return null;

  const matchedProduct = findMatchingProduct(item, productLookup);
  const rawProduct = normalizeProductReference(item.product) ?? {};
  const product = {
    ...(matchedProduct ?? {}),
    ...rawProduct,
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

  const quantityCandidates = [
    item.quantity,
    item.stock,
    item.available,
    item.inventory,
    item.total,
    item.amount,
    rawProduct?.quantity,
    rawProduct?.stock,
    rawProduct?.available,
  ];

  let stock = null;
  for (const candidate of quantityCandidates) {
    const parsed = parseNumber(candidate);
    if (parsed !== null) {
      stock = parsed;
      break;
    }
  }

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
    stock,
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
