export type Language = "en" | "hi";
export type ImageKey =
  | "market"
  | "scarf"
  | "diya"
  | "spices"
  | "cups"
  | "tote"
  | "pickle";
export type Fulfilment = "delivery" | "pickup";
export type OrderStatus = "New" | "Accepted" | "Preparing" | "Ready" | "Completed" | "Declined";
export type SellerSection = "overview" | "inventory" | "orders" | "insights";

export type Product = {
  id: string;
  shopSlug: string;
  name: string;
  description: string;
  category: string;
  price: number;
  stock: number;
  lowStockAt: number;
  imageKey: ImageKey;
  unit: string;
  variant?: string;
  status: "active" | "hidden";
  interest: number;
};

export type Storefront = {
  id: string;
  slug: string;
  name: string;
  ownerName: string;
  category: string;
  description: string;
  city: string;
  state: string;
  pinCode: string;
  distance: string;
  rating: number;
  reviewCount: number;
  logoImageKey: ImageKey;
  /** Hero/cover photo displayed above this shop's product catalogue. */
  imageKey: ImageKey;
  whatsapp: string;
  phone: string;
  hours: string;
  policy: string;
};

export type CartLine = { productId: string; quantity: number };
export type OrderLine = {
  productId: string;
  name: string;
  quantity: number;
  price: number;
  imageKey: ImageKey;
};
export type Order = {
  id: string;
  createdAt: string;
  customerName: string;
  phone: string;
  shopSlug: string;
  items: OrderLine[];
  total: number;
  fulfilment: Fulfilment;
  address: string;
  pinCode: string;
  status: OrderStatus;
  note?: string;
  /** True only when the local checkout deducted this order's items from inventory. */
  stockDeducted?: boolean;
};

export type ShopProfile = {
  businessName: string;
  ownerName: string;
  category: string;
  description: string;
  phone: string;
  whatsapp: string;
  city: string;
  state: string;
  pinCode: string;
  logoImageKey: ImageKey;
  coverImageKey: ImageKey;
  openingHours: string;
  policy: string;
};

export type CustomerProfile = { name: string; phone: string };

export type InventoryEvent = {
  id: string;
  productId: string;
  productName: string;
  delta: number;
  reason: string;
  createdAt: string;
};
export type CheckoutDetails = {
  customerName: string;
  phone: string;
  fulfilment: Fulfilment;
  address: string;
  pinCode: string;
  note?: string;
};

export type PlaceOrderResult =
  | { ok: true; orderIds: string[]; total: number }
  | { ok: false; message: string };
