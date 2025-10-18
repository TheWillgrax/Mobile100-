import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

const CART_STORAGE_KEY = "cart:v1";

const parseUnitPrice = (value) => {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0;
  }

  if (!value) return 0;

  const normalized = String(value)
    .replace(/[^0-9.,-]/g, "")
    .replace(/,/g, ".");

  const parsed = parseFloat(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
};

export const formatCurrency = (value) => {
  const amount = Number.isFinite(value) ? value : 0;
  try {
    return new Intl.NumberFormat("es-GT", {
      style: "currency",
      currency: "GTQ",
      minimumFractionDigits: 2,
    }).format(amount);
  } catch (_error) {
    return `Q${amount.toFixed(2)}`;
  }
};

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(CART_STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            setItems(parsed);
          }
        }
      } catch (error) {
        console.log("Failed to load cart", error);
      } finally {
        setHydrated(true);
      }
    })();
  }, []);

  const persist = useCallback((updater) => {
    setItems((prev) => {
      const next = updater(prev);
      AsyncStorage.setItem(CART_STORAGE_KEY, JSON.stringify(next)).catch((error) =>
        console.log("Failed to persist cart", error)
      );
      return next;
    });
  }, []);

  const addItem = useCallback(
    (product, quantity = 1) => {
      if (!product?.id) return;

      const unitPrice = parseUnitPrice(
        product.price ?? product.cookTime ?? product.unitPrice ?? product.amount
      );
      const priceLabel =
        product.priceLabel ?? product.price ?? product.cookTime ?? formatCurrency(unitPrice);
      const normalizedQuantity = Math.max(1, Number(quantity) || 1);

      persist((prev) => {
        const existing = prev.find((item) => item.id === product.id);
        if (existing) {
          return prev.map((item) =>
            item.id === product.id
              ? { ...item, quantity: item.quantity + normalizedQuantity }
              : item
          );
        }

        return [
          ...prev,
          {
            id: product.id,
            title: product.title,
            image: product.image ?? null,
            quantity: normalizedQuantity,
            unitPrice,
            priceLabel,
          },
        ];
      });
    },
    [persist]
  );

  const updateItemQuantity = useCallback(
    (id, quantity) => {
      const normalized = Math.max(1, Number(quantity) || 1);
      persist((prev) =>
        prev.map((item) => (item.id === id ? { ...item, quantity: normalized } : item))
      );
    },
    [persist]
  );

  const removeItem = useCallback(
    (id) => {
      persist((prev) => prev.filter((item) => item.id !== id));
    },
    [persist]
  );

  const clearCart = useCallback(() => {
    setItems([]);
    AsyncStorage.removeItem(CART_STORAGE_KEY).catch((error) =>
      console.log("Failed to clear cart", error)
    );
  }, []);

  const total = useMemo(
    () => items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0),
    [items]
  );

  const totalFormatted = useMemo(() => formatCurrency(total), [total]);
  const itemCount = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items]
  );

  const value = useMemo(
    () => ({
      items,
      loading: !hydrated,
      addItem,
      updateItemQuantity,
      removeItem,
      clearCart,
      total,
      totalFormatted,
      itemCount,
      parseUnitPrice,
      formatCurrency,
    }),
    [items, hydrated, addItem, updateItemQuantity, removeItem, clearCart, total, totalFormatted, itemCount]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
