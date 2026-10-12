import { describe, expect, it } from "vitest";

import { returnDeclinedOrderInventory, validateCartInventory } from "./commerce";
import type { Order, Product } from "./types";

const product: Product = {
  id: "p-test",
  shopSlug: "test-shop",
  name: "Test bowl",
  description: "A test fixture.",
  category: "Pottery",
  price: 500,
  stock: 2,
  lowStockAt: 1,
  imageKey: "cups",
  unit: "piece",
  status: "active",
  interest: 0,
};

const order: Order = {
  id: "BAZ-RESTOCK-1",
  createdAt: "2026-10-12T00:00:00.000Z",
  customerName: "Kavya",
  phone: "9876543210",
  shopSlug: "test-shop",
  items: [{ productId: product.id, name: product.name, quantity: 2, price: 500, imageKey: "cups" }],
  total: 1000,
  fulfilment: "pickup",
  address: "",
  pinCode: "302004",
  status: "New",
  stockDeducted: true,
};

describe("local commerce consistency", () => {
  it("allows a valid in-stock basket and blocks empty, hidden, depleted or oversized lines", () => {
    expect(validateCartInventory([{ productId: product.id, quantity: 2 }], [product])).toBeUndefined();
    expect(validateCartInventory([], [product])).toContain("empty");
    expect(validateCartInventory([{ productId: "missing", quantity: 1 }], [product])).toContain("changed");
    expect(validateCartInventory([{ productId: product.id, quantity: 3 }], [product])).toContain("changed");
    expect(validateCartInventory([{ productId: product.id, quantity: 1 }], [{ ...product, status: "hidden" }])).toContain("changed");
  });

  it("returns reserved units to stock and adds a positive movement when an order is declined", () => {
    const result = returnDeclinedOrderInventory(
      [{ ...product, stock: 0 }],
      [],
      order,
      "2026-10-12T01:00:00.000Z",
    );
    expect(result.products[0].stock).toBe(2);
    expect(result.inventoryEvents).toEqual([{
      id: `restock-${order.id}-${product.id}`,
      productId: product.id,
      productName: product.name,
      delta: 2,
      reason: `Order ${order.id} declined · stock returned`,
      createdAt: "2026-10-12T01:00:00.000Z",
    }]);
  });

  it("does not restore legacy sample orders that never reserved stock", () => {
    const result = returnDeclinedOrderInventory([product], [], { ...order, stockDeducted: undefined });
    expect(result.products[0].stock).toBe(product.stock);
    expect(result.inventoryEvents).toEqual([]);
  });
});
