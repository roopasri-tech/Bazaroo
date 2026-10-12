import type { Order, OrderStatus } from "./types";

export function formatINR(amount: number) {
  return `₹${Math.round(amount).toLocaleString("en-IN")}`;
}

export function waLink(phone: string, text: string) {
  const normalized = normalizeIndianPhone(phone);
  const digits = /^[6-9]\d{9}$/.test(normalized) ? `91${normalized}` : phone.replace(/\D/g, "");
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
}

export function normalizeIndianPhone(phone: string) {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 14 && digits.startsWith("0091")) return digits.slice(4);
  return digits.length === 12 && digits.startsWith("91") ? digits.slice(2) : digits;
}

export function countRepeatCustomers(orders: readonly Pick<Order, "phone" | "customerName">[]) {
  const orderCounts = new Map<string, number>();
  for (const order of orders) {
    const phone = normalizeIndianPhone(order.phone);
    const identity = /^[6-9]\d{9}$/.test(phone)
      ? `phone:${phone}`
      : `name:${order.customerName.trim().toLocaleLowerCase()}`;
    orderCounts.set(identity, (orderCounts.get(identity) ?? 0) + 1);
  }
  return [...orderCounts.values()].filter((count) => count > 1).length;
}

export function orderTone(status: OrderStatus): "clay" | "green" | "yellow" | "red" | "paper" {
  if (status === "Completed" || status === "Ready") return "green";
  if (status === "Declined") return "red";
  if (status === "New" || status === "Accepted") return "yellow";
  return "clay";
}

export function nextOrderStatus(status: OrderStatus): OrderStatus {
  if (status === "New") return "Accepted";
  if (status === "Accepted") return "Preparing";
  if (status === "Preparing") return "Ready";
  if (status === "Ready") return "Completed";
  return status;
}

export function timeAgo(iso: string) {
  const mins = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 60_000));
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}
