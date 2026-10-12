import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import { INITIAL_ORDERS, OWNER_SHOP, PRODUCTS, SHOP_PROFILE } from "./fixtures";
import { returnDeclinedOrderInventory, validateCartInventory } from "./commerce";
import { normalizeIndianPhone } from "./utils";
import type {
  CartLine,
  CheckoutDetails,
  CustomerProfile,
  InventoryEvent,
  Language,
  Order,
  OrderStatus,
  PlaceOrderResult,
  Product,
  ShopProfile,
  Storefront,
} from "./types";

type Snapshot = {
  products: Product[];
  favouriteIds: string[];
  cart: CartLine[];
  orders: Order[];
  shopProfile: ShopProfile;
  customerProfile: CustomerProfile;
  storefront: Storefront;
  inventoryEvents: InventoryEvent[];
  language: Language;
  visits: number;
  productInterest: number;
};

const STORAGE_KEY = "bazaaro.snapshot.v1";
const INITIAL: Snapshot = {
  products: PRODUCTS,
  favouriteIds: ["p-scarf", "p-cups"],
  cart: [],
  orders: INITIAL_ORDERS,
  shopProfile: SHOP_PROFILE,
  customerProfile: { name: "", phone: "" },
  storefront: OWNER_SHOP,
  inventoryEvents: [
    {
      id: "stock-seed-1",
      productId: "p-diya",
      productName: "The little brass diya",
      delta: -1,
      reason: "Sample · order packed",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    },
    {
      id: "stock-seed-2",
      productId: "p-tote",
      productName: "Market morning tote",
      delta: 6,
      reason: "Sample · new batch added",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    },
  ],
  language: "en",
  visits: 218,
  productInterest: 84,
};

export type NewProduct = Pick<
  Product,
  "name" | "description" | "category" | "price" | "stock" | "lowStockAt" | "imageKey" | "unit" | "variant"
>;

type AppState = Snapshot & {
  ready: boolean;
  cartCount: number;
  cartTotal: number;
  toggleFavourite: (productId: string) => void;
  addToCart: (productId: string, quantity?: number) => boolean;
  setCartQuantity: (productId: string, quantity: number) => void;
  placeOrder: (details: CheckoutDetails) => PlaceOrderResult;
  adjustStock: (productId: string, delta: number, reason?: string) => void;
  toggleProductStatus: (productId: string) => void;
  addProduct: (product: NewProduct) => void;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  updateShop: (profile: ShopProfile) => void;
  trackStoreVisit: (shopSlug: string) => void;
  trackProductInterest: (productId: string) => void;
  setLanguage: (language: Language) => void;
  resetDemo: () => void;
};

const Context = createContext<AppState | null>(null);

export function BazaaroProvider({ children }: { children: React.ReactNode }) {
  const [snapshot, setSnapshot] = useState<Snapshot>(INITIAL);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let mounted = true;
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (!raw || !mounted) return;
        const saved = JSON.parse(raw) as Partial<Snapshot>;
        setSnapshot((current) => ({
          ...current,
          ...saved,
          shopProfile: { ...current.shopProfile, ...saved.shopProfile },
          customerProfile: { ...current.customerProfile, ...saved.customerProfile },
          storefront: { ...current.storefront, ...saved.storefront },
        }));
      })
      .catch(() => undefined)
      .finally(() => {
        if (mounted) setReady(true);
      });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!ready) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot)).catch(() => undefined);
  }, [ready, snapshot]);

  const toggleFavourite = useCallback((productId: string) => {
    setSnapshot((current) => ({
      ...current,
      favouriteIds: current.favouriteIds.includes(productId)
        ? current.favouriteIds.filter((id) => id !== productId)
        : [...current.favouriteIds, productId],
    }));
  }, []);

  const addToCart = useCallback((productId: string, quantity = 1) => {
    const product = snapshot.products.find((item) => item.id === productId);
    const existing = snapshot.cart.find((line) => line.productId === productId)?.quantity ?? 0;
    if (!product || product.status !== "active" || product.stock <= existing || !Number.isInteger(quantity) || quantity < 1) return false;
    const nextQuantity = Math.min(product.stock, existing + quantity);
    setSnapshot({
      ...snapshot,
      cart: snapshot.cart.some((line) => line.productId === productId)
        ? snapshot.cart.map((line) => (line.productId === productId ? { ...line, quantity: nextQuantity } : line))
        : [...snapshot.cart, { productId, quantity: nextQuantity }],
    });
    return true;
  }, [snapshot]);

  const setCartQuantity = useCallback((productId: string, quantity: number) => {
    const existing = snapshot.cart.find((line) => line.productId === productId);
    if (!existing || !Number.isInteger(quantity)) return;
    if (quantity <= 0) {
      setSnapshot({ ...snapshot, cart: snapshot.cart.filter((line) => line.productId !== productId) });
      return;
    }
    if (quantity > existing.quantity) {
      const product = snapshot.products.find((item) => item.id === productId);
      if (!product || product.status !== "active" || quantity > product.stock) return;
    }
    setSnapshot({
      ...snapshot,
      cart: snapshot.cart.map((line) => (line.productId === productId ? { ...line, quantity } : line)),
    });
  }, [snapshot]);

  const placeOrder = useCallback((details: CheckoutDetails): PlaceOrderResult => {
    const current = snapshot;
    const validationMessage = validateCartInventory(current.cart, current.products);
    if (validationMessage) return { ok: false, message: validationMessage };

    const active = current.cart.map((line) => ({
      line,
      product: current.products.find((item) => item.id === line.productId)!,
    }));
    const grouped = new Map<string, typeof active>();
    active.forEach((item) => grouped.set(item.product.shopSlug, [...(grouped.get(item.product.shopSlug) ?? []), item]));
    const createdAt = new Date().toISOString();
    const orderPrefix = `BAZ-${Date.now().toString().slice(-6)}`;
    const created = [...grouped.entries()].map(([shopSlug, entries], index) => {
      const items = entries.map(({ line, product }) => ({
        productId: product.id,
        name: product.name,
        quantity: line.quantity,
        price: product.price,
        imageKey: product.imageKey,
      }));
      const order: Order = {
        id: `${orderPrefix}-${index + 1}`,
        createdAt,
        customerName: details.customerName.trim(),
        phone: normalizeIndianPhone(details.phone),
        shopSlug,
        items,
        total: items.reduce((sum, item) => sum + item.price * item.quantity, 0),
        fulfilment: details.fulfilment,
        address: details.address.trim(),
        pinCode: details.pinCode.trim(),
        status: "New",
        stockDeducted: true,
        note: details.note?.trim(),
      };
      const events = entries.map(({ line, product }) => ({
        id: `${order.id}-${product.id}`,
        productId: product.id,
        productName: product.name,
        delta: -line.quantity,
        reason: `Order ${order.id}`,
        createdAt,
      }));
      return { order, events };
    });

    const total = created.reduce((sum, entry) => sum + entry.order.total, 0);
    setSnapshot({
      ...current,
      customerProfile: { name: details.customerName.trim(), phone: normalizeIndianPhone(details.phone) },
      orders: [...created.map((entry) => entry.order), ...current.orders],
      cart: [],
      products: current.products.map((product) => {
        const line = active.find((item) => item.product.id === product.id)?.line;
        return line ? { ...product, stock: product.stock - line.quantity } : product;
      }),
      inventoryEvents: [...created.flatMap((entry) => entry.events), ...current.inventoryEvents],
    });
    return { ok: true, orderIds: created.map((entry) => entry.order.id), total };
  }, [snapshot]);

  const adjustStock = useCallback((productId: string, delta: number, reason = "Manual stock adjustment") => {
    setSnapshot((current) => {
      const product = current.products.find((item) => item.id === productId);
      if (!product || delta === 0) return current;
      const appliedDelta = Math.max(-product.stock, Math.trunc(delta));
      if (!appliedDelta) return current;
      return {
        ...current,
        products: current.products.map((item) =>
          item.id === productId ? { ...item, stock: Math.max(0, item.stock + appliedDelta) } : item,
        ),
        inventoryEvents: [
          {
            id: `move-${Date.now()}`,
            productId,
            productName: product.name,
            delta: appliedDelta,
            reason,
            createdAt: new Date().toISOString(),
          },
          ...current.inventoryEvents,
        ],
      };
    });
  }, []);

  const toggleProductStatus = useCallback((productId: string) => {
    setSnapshot((current) => ({
      ...current,
      products: current.products.map((product) =>
        product.id === productId
          ? { ...product, status: product.status === "active" ? "hidden" : "active" }
          : product,
      ),
    }));
  }, []);

  const addProduct = useCallback((product: NewProduct) => {
    setSnapshot((current) => ({
      ...current,
      products: [
        {
          ...product,
          id: `p-${Date.now()}`,
          shopSlug: current.storefront.slug,
          status: "active",
          interest: 0,
        },
        ...current.products,
      ],
    }));
  }, []);

  const updateOrderStatus = useCallback((orderId: string, status: OrderStatus) => {
    const current = snapshot;
    const order = current.orders.find((item) => item.id === orderId);
    if (!order || order.status === "Declined" || order.status === "Completed") return;
    const restocked = status === "Declined"
      ? returnDeclinedOrderInventory(current.products, current.inventoryEvents, order)
      : { products: current.products, inventoryEvents: current.inventoryEvents };
    setSnapshot({
      ...current,
      orders: current.orders.map((item) => (item.id === orderId
        ? { ...item, status, ...(status === "Declined" ? { stockDeducted: false } : {}) }
        : item)),
      products: restocked.products,
      inventoryEvents: restocked.inventoryEvents,
    });
  }, [snapshot]);

  const updateShop = useCallback((profile: ShopProfile) => {
    setSnapshot((current) => ({
      ...current,
      shopProfile: profile,
      storefront: {
        ...current.storefront,
        name: profile.businessName,
        ownerName: profile.ownerName,
        category: profile.category,
        description: profile.description,
        logoImageKey: profile.logoImageKey,
        imageKey: profile.coverImageKey,
        id: current.storefront.id,
        city: profile.city,
        state: profile.state,
        pinCode: profile.pinCode,
        phone: profile.phone,
        whatsapp: profile.whatsapp,
        hours: profile.openingHours,
        policy: profile.policy,
      },
    }));
  }, []);

  const trackStoreVisit = useCallback((shopSlug: string) => {
    setSnapshot((current) => shopSlug === current.storefront.slug
      ? { ...current, visits: current.visits + 1 }
      : current);
  }, []);

  const trackProductInterest = useCallback((productId: string) => {
    setSnapshot((current) => ({
      ...current,
      productInterest: current.productInterest + 1,
      products: current.products.map((product) =>
        product.id === productId ? { ...product, interest: product.interest + 1 } : product,
      ),
    }));
  }, []);

  const setLanguage = useCallback((language: Language) => {
    setSnapshot((current) => ({ ...current, language }));
  }, []);

  const resetDemo = useCallback(() => {
    setSnapshot(INITIAL);
    AsyncStorage.removeItem(STORAGE_KEY).catch(() => undefined);
  }, []);

  const cartCount = snapshot.cart.reduce((sum, line) => sum + line.quantity, 0);
  const cartTotal = snapshot.cart.reduce((sum, line) => {
    const product = snapshot.products.find((item) => item.id === line.productId);
    return sum + (product?.price ?? 0) * line.quantity;
  }, 0);

  const value = useMemo<AppState>(
    () => ({
      ...snapshot,
      ready,
      cartCount,
      cartTotal,
      toggleFavourite,
      addToCart,
      setCartQuantity,
      placeOrder,
      adjustStock,
      toggleProductStatus,
      addProduct,
      updateOrderStatus,
      updateShop,
      trackStoreVisit,
      trackProductInterest,
      setLanguage,
      resetDemo,
    }),
    [
      snapshot,
      ready,
      cartCount,
      cartTotal,
      toggleFavourite,
      addToCart,
      setCartQuantity,
      placeOrder,
      adjustStock,
      toggleProductStatus,
      addProduct,
      updateOrderStatus,
      updateShop,
      trackStoreVisit,
      trackProductInterest,
      setLanguage,
      resetDemo,
    ],
  );

  return <Context.Provider value={value}>{children}</Context.Provider>;
}

export function useBazaaro() {
  const value = useContext(Context);
  if (!value) throw new Error("useBazaaro must be used inside BazaaroProvider");
  return value;
}
