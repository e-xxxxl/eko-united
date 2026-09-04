// Shared currency formatting — every price on the site is Naira, whole or
// decimal, and should read the same way everywhere (shop, tickets, cart,
// admin forms) rather than each place hand-rolling "₦" + toLocaleString().
export function formatNaira(amount: number): string {
  return `₦${amount.toLocaleString("en-NG")}`;
}
