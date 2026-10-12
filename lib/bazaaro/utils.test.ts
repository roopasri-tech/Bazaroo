import { describe, expect, it } from "vitest";

import { countRepeatCustomers, formatINR, nextOrderStatus, normalizeIndianPhone, orderTone, waLink } from "./utils";

describe("India-ready marketplace helpers", () => {
  it("formats integer rupee amounts with Indian digit grouping", () => {
    expect(formatINR(1250)).toBe("₹1,250");
  });

  it("normalizes a country-prefixed 10-digit Indian contact", () => {
    expect(normalizeIndianPhone("+91 98765 43210")).toBe("9876543210");
    expect(normalizeIndianPhone("98765-43210")).toBe("9876543210");
  });

  it("creates an encoded WhatsApp handoff without inventing a recipient", () => {
    expect(waLink("+91 98765 43210", "Hello, maker!")).toBe(
      "https://wa.me/919876543210?text=Hello%2C%20maker!",
    );
    expect(waLink("98765 43210", "Hello, maker!")).toBe(
      "https://wa.me/919876543210?text=Hello%2C%20maker!",
    );
  });

  it("counts the same repeat customer once across 10-digit and +91 phone formats", () => {
    expect(countRepeatCustomers([
      { phone: "9876543210", customerName: "Anu" },
      { phone: "+91 98765 43210", customerName: "Anu Sharma" },
      { phone: "9123456789", customerName: "Bala" },
    ])).toBe(1);
  });
});

describe("seller order flow", () => {
  it("advances a direct order through each fulfilment milestone", () => {
    expect(nextOrderStatus("New")).toBe("Accepted");
    expect(nextOrderStatus("Accepted")).toBe("Preparing");
    expect(nextOrderStatus("Preparing")).toBe("Ready");
    expect(nextOrderStatus("Ready")).toBe("Completed");
  });

  it("keeps completed and declined orders terminal", () => {
    expect(nextOrderStatus("Completed")).toBe("Completed");
    expect(nextOrderStatus("Declined")).toBe("Declined");
  });

  it("gives order states clear visual meanings", () => {
    expect(orderTone("New")).toBe("yellow");
    expect(orderTone("Ready")).toBe("green");
    expect(orderTone("Declined")).toBe("red");
  });
});
