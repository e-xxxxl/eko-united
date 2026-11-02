"use client";

import { useEffect } from "react";
import { clearCart } from "@/lib/cart";

// The cart is only emptied once the order is confirmed (paid, or free). If the
// buyer closes the payment window or comes back from it, the cart is still
// there to try again.
export default function ClearCart() {
  useEffect(() => {
    clearCart();
  }, []);
  return null;
}
