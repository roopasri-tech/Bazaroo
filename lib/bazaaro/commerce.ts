import type { CartLine, InventoryEvent, Order, Product } from "./types";

export function validateCartInventory(cart: readonly CartLine[], products: readonly Product[]): string | undefined {
  if (!cart.length) return "Your basket is empty.";
  const invalid = cart.some((line) => {
    const product = products.find((item) => item.id === line.productId);
    return !product
      || product.status !== "active"
      || !Number.isInteger(line.quantity)
      || line.quantity < 1
      || product.stock < line.quantity;
  });
  return invalid
    ? "Stock or listing availability changed while you were browsing. Review or remove the affected basket items, then try again."
    : undefined;
}

export function returnDeclinedOrderInventory(
  products: readonly Product[],
  inventoryEvents: readonly InventoryEvent[],
  order: Order,
  createdAt = new Date().toISOString(),
): { products: Product[]; inventoryEvents: InventoryEvent[] } {
  if (!order.stockDeducted || order.status === "Declined" || order.status === "Completed") {
    return { products: [...products], inventoryEvents: [...inventoryEvents] };
  }

  const productById = new Map(products.map((product) => [product.id, product]));
  const restoreItems = order.items.filter((line) =>
    productById.has(line.productId) && Number.isInteger(line.quantity) && line.quantity > 0,
  );
  const restoredById = new Map<string, number>();
  for (const line of restoreItems) {
    restoredById.set(line.productId, (restoredById.get(line.productId) ?? 0) + line.quantity);
  }
  const events: InventoryEvent[] = restoreItems.map((line) => ({
    id: `restock-${order.id}-${line.productId}`,
    productId: line.productId,
    productName: productById.get(line.productId)?.name ?? line.name,
    delta: line.quantity,
    reason: `Order ${order.id} declined · stock returned`,
    createdAt,
  }));

  return {
    products: products.map((product) => ({
      ...product,
      stock: product.stock + (restoredById.get(product.id) ?? 0),
    })),
    inventoryEvents: [...events, ...inventoryEvents],
  };
}
