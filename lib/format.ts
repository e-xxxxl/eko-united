// Shared currency formatting — every price on the site is Naira, whole or
// decimal, and should read the same way everywhere (shop, tickets, cart,
// admin forms) rather than each place hand-rolling "₦" + toLocaleString().
export function formatNaira(amount: number): string {
  return `₦${amount.toLocaleString("en-NG")}`;
}

// A price, or "Free" for zero (free tickets and fully discounted orders).
export function formatPrice(amount: number): string {
  return amount === 0 ? "Free" : formatNaira(amount);
}

// "12345678" reads and types better as "1234 5678". Older six-character
// codes are left as they are.
export function formatTicketCode(code: string): string {
  return /^\d{8}$/.test(code) ? `${code.slice(0, 4)} ${code.slice(4)}` : code;
}
