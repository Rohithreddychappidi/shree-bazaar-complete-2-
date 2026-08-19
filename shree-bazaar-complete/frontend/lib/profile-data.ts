// Everything else that used to live here (recentOrders, addresses) now comes from the
// real backend — see lib/use-orders.ts and lib/use-addresses.ts. Saved payment methods
// stay static demo data deliberately: Razorpay doesn't expose a simple "save a card" API
// without their separate tokenization/vault product, so this is UI only for now.
export const savedCards = [
  { brand: "Visa", last4: "4242", expiry: "08/28" },
  { brand: "Mastercard", last4: "5588", expiry: "02/27" },
];
