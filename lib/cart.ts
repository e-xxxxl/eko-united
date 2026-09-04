"use client";

import { useEffect, useState } from "react";

// Client-side cart only — a convenience for the shopper, not a source of
// truth. The price shown here is for display; POST /api/checkout always
// re-reads the real price/availability from the database and ignores
// whatever this cart says, so nothing here needs to be trusted.
export type CartItemType = "shop" | "ticket";

export type CartItem = {
  refType: "Product" | "TicketType";
  ref: string;
  name: string;
  price: number;
  quantity: number;
  size?: string;
  imageUrl?: string;
  matchLabel?: string; // ticket items only, e.g. "vs Ikorodu City — 12 Sep"
};

export type Cart = { type: CartItemType | null; items: CartItem[] };

const STORAGE_KEY = "eko_cart";
const EVENT_NAME = "eko-cart-updated";
const EMPTY_CART: Cart = { type: null, items: [] };

function readCart(): Cart {
  if (typeof window === "undefined") return EMPTY_CART;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY_CART;
    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.items)) return EMPTY_CART;
    return parsed;
  } catch {
    return EMPTY_CART;
  }
}

function writeCart(cart: Cart) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
  } catch {
    // localStorage unavailable (private mode, quota) — cart just won't persist
  }
  window.dispatchEvent(new Event(EVENT_NAME));
}

function sameLine(a: CartItem, b: { ref: string; size?: string }) {
  return a.ref === b.ref && (a.size || "") === (b.size || "");
}

// Adding an item of a different type than what's currently in the cart
// starts a fresh cart — a shop order and a ticket order can't be mixed into
// one checkout call (see routes/checkout.js), and mixing them in one cart
// silently would be more confusing than just starting over.
export function addToCart(type: CartItemType, item: CartItem) {
  const current = readCart();
  const items = current.type && current.type !== type ? [] : [...current.items];
  const existing = items.find((i) => sameLine(i, item));
  if (existing) {
    existing.quantity += item.quantity;
  } else {
    items.push(item);
  }
  writeCart({ type, items });
}

export function updateQuantity(ref: string, size: string | undefined, quantity: number) {
  const current = readCart();
  const items = current.items
    .map((i) => (sameLine(i, { ref, size }) ? { ...i, quantity } : i))
    .filter((i) => i.quantity > 0);
  writeCart({ type: items.length > 0 ? current.type : null, items });
}

export function removeFromCart(ref: string, size?: string) {
  updateQuantity(ref, size, 0);
}

export function clearCart() {
  writeCart(EMPTY_CART);
}

export function cartTotal(cart: Cart): number {
  return cart.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
}

export function cartCount(cart: Cart): number {
  return cart.items.reduce((sum, i) => sum + i.quantity, 0);
}

// SSR-safe: starts empty (matches server render), then syncs from
// localStorage on mount and whenever any tab/component changes the cart.
export function useCart(): Cart {
  const [cart, setCart] = useState<Cart>(EMPTY_CART);

  useEffect(() => {
    setCart(readCart());
    const handler = () => setCart(readCart());
    window.addEventListener(EVENT_NAME, handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener(EVENT_NAME, handler);
      window.removeEventListener("storage", handler);
    };
  }, []);

  return cart;
}
