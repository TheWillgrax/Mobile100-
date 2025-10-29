// services/inventory.js
import { api } from "./api";

const SERVICE_TOKEN =
  "b29b84da47aa04c04863c9ec9657880de85929c9f95ac1619893a195ae8e038c3a7fcbcf6eb90da30c2f3453bef68c50e8d1149f3cdb9a8f09382e5d6e883294f22a79f0e911802dba7f060f16f1848834e6fde808b10438ef2b591c389a83e299368b769d06dd381e4970bda1f4b5f5c038f9a2274e0ab3c14b82c928b833b4";

const INVENTORY_ENDPOINT = "/vendor-admon/inventory/getAllInventory";

const getStrapiBaseURL = () => {
  const baseURL = api.defaults?.baseURL ?? "";
  if (!baseURL) return "";
  return baseURL.replace(/\/?api\/?$/, "");
};

const toAbsoluteUrl = (url) => {
  if (!url) return null;
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

const normalizeInventoryItem = (item) => {
  if (!item) return null;

  const attributes = item.attributes ?? item;
  const productData = attributes?.product?.data?.attributes ?? attributes?.product ?? {};
  const variantData = attributes?.productVariant?.data?.attributes ?? attributes?.productVariant ?? {};

  const baseData = { ...attributes, ...productData, ...variantData };

  const imageCandidate =
    productData?.images?.data?.[0]?.attributes?.url ??
    productData?.image?.data?.attributes?.url ??
    productData?.image?.url ??
    productData?.image ??
    attributes?.image?.data?.attributes?.url ??
    attributes?.image?.url ??
    attributes?.image ??
    variantData?.image?.data?.attributes?.url ??
    variantData?.image?.url ??
    variantData?.image ??
    baseData?.featuredImage?.data?.attributes?.url ??
    baseData?.featuredImage?.url ??
    baseData?.featuredImage ??
    null;

  const price =
    parseNumber(attributes?.price) ??
    parseNumber(productData?.price) ??
    parseNumber(variantData?.price) ??
    null;

  return {
    id:
      item.id ??
      attributes?.id ??
      productData?.id ??
      variantData?.id ??
      `${baseData?.sku ?? baseData?.name ?? Math.random()}`,
    name:
      productData?.name ??
      variantData?.name ??
      attributes?.name ??
      baseData?.title ??
      "Producto sin nombre",
    sku: baseData?.sku ?? attributes?.sku ?? productData?.sku ?? variantData?.sku ?? null,
    stock:
      parseNumber(attributes?.stock) ??
      parseNumber(attributes?.quantity) ??
      parseNumber(attributes?.availableStock) ??
      parseNumber(productData?.stock) ??
      parseNumber(productData?.quantity) ??
      parseNumber(variantData?.stock) ??
      parseNumber(variantData?.quantity) ??
      null,
    price,
    description:
      productData?.description ??
      variantData?.description ??
      attributes?.description ??
      null,
    brand: productData?.brand ?? variantData?.brand ?? attributes?.brand ?? null,
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
    const response = await api.get(INVENTORY_ENDPOINT, {
      headers: {
        Authorization: `Bearer ${SERVICE_TOKEN}`,
      },
    });

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

