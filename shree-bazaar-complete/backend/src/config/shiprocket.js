const axios = require("axios");

const BASE_URL = "https://apiv2.shiprocket.in/v1/external";

// Best-effort fallback for addresses saved before the dedicated `pincode` field existed —
// pulls a 6-digit number out of the free-text city field. Prefer address.pincode directly
// wherever possible; this is only here for backwards compatibility with older addresses.
function extractPincode(address) {
  return address.pincode || (address.city.match(/\d{6}/) || [""])[0];
}

// Shiprocket tokens are valid for ~10 days. Cache in memory and refresh on expiry
// rather than logging in on every request.
let cachedToken = null;
let tokenExpiresAt = 0;

async function getToken() {
  if (cachedToken && Date.now() < tokenExpiresAt) return cachedToken;

  const { data } = await axios.post(`${BASE_URL}/auth/login`, {
    email: process.env.SHIPROCKET_EMAIL,
    password: process.env.SHIPROCKET_PASSWORD,
  });

  cachedToken = data.token;
  tokenExpiresAt = Date.now() + 9 * 24 * 60 * 60 * 1000; // refresh a day early
  return cachedToken;
}

// Creates ONE Shiprocket shipment from a single pickup location, for a subset of an
// order's items. Multi-location orders call this once per distinct pickup location
// (see groupItemsByPickupLocation + the caller in orders.routes.js) — Shiprocket
// requires one shipment = one origin address, so an order spanning two warehouses can
// never be a single API call.
//
// `shipmentSuffix` keeps the order_id we send Shiprocket unique when the same internal
// order produces more than one shipment (Shiprocket order_ids must be unique per account).
//
// Returns { shiprocketOrderId, shipmentId } on success. Throws on failure — callers
// should catch this so a Shiprocket outage never blocks the order itself from saving.
// Sums real per-item package weight (variant override, falling back to the product's
// weight) instead of a flat guess — used both for shipment creation and rate quoting.
// Each item needs `product` included, and `variant` included when it has a variantId.
function calculateWeightKg(items) {
  const total = items.reduce((sum, item) => {
    const unitWeight = item.variant?.weightKg ?? item.product?.weightKg ?? 0.3;
    return sum + unitWeight * item.quantity;
  }, 0);
  return Math.max(0.3, Math.round(total * 100) / 100); // Shiprocket wants kg, 2dp is plenty
}

async function createShiprocketShipment({ orderId, createdAt, addressSnapshot, items, pickupLocation, customerEmail, shipmentSuffix }) {
  const token = await getToken();
  const address = addressSnapshot;

  const orderItems = items.map((item) => ({
    name: item.name,
    sku: item.productId,
    units: item.quantity,
    selling_price: item.price,
  }));
  const subTotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  // Shiprocket requires billing_customer_name (first name) and billing_last_name as
  // separate fields — sending the full name only in billing_customer_name causes a
  // "billing_last_name: validation.present" error since the field is then missing
  // entirely, not just empty.
  const nameParts = (address.name || "").trim().split(/\s+/).filter(Boolean);
  const firstName = nameParts[0] || "Customer";
  const lastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : firstName;

  const payload = {
    order_id: shipmentSuffix ? `${orderId}-${shipmentSuffix}` : orderId,
    order_date: new Date(createdAt).toISOString().slice(0, 19).replace("T", " "),
    pickup_location: pickupLocation,
    billing_customer_name: firstName,
    billing_last_name: lastName,
    billing_address: address.line,
    billing_city: address.city,
    billing_pincode: extractPincode(address),
    billing_state: address.city,
    billing_country: "India",
    billing_phone: address.phone,
    billing_email: customerEmail || process.env.SHIPROCKET_FALLBACK_EMAIL || "orders@shreebazaar.com",
    shipping_is_billing: true,
    order_items: orderItems,
    payment_method: "Prepaid", // Cash on Delivery isn't offered — client requirement
    sub_total: subTotal,
    length: 15,
    breadth: 12,
    height: 8,
    weight: calculateWeightKg(items),
  };

  const { data } = await axios.post(`${BASE_URL}/orders/create/adhoc`, payload, {
    headers: { Authorization: `Bearer ${token}` },
  });

  return {
    shiprocketOrderId: String(data.order_id ?? ""),
    shipmentId: String(data.shipment_id ?? ""),
  };
}

// Groups an order's items by pickup location, defaulting to `fallbackLocation` for any
// item whose product doesn't have its own pickupLocation set. Returns a Map of
// pickupLocation -> items[], so the caller can create one shipment per group.
function groupItemsByPickupLocation(items, fallbackLocation) {
  const groups = new Map();
  for (const item of items) {
    const location = item.product?.pickupLocation || fallbackLocation;
    if (!groups.has(location)) groups.set(location, []);
    groups.get(location).push(item);
  }
  return groups;
}

// Polls live tracking status for a shipment — used by the admin "track" action.
async function trackShipment(shipmentId) {
  const token = await getToken();
  const { data } = await axios.get(`${BASE_URL}/courier/track/shipment/${shipmentId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
}

// Live rate lookup — GET /courier/serviceability, Shiprocket's endpoint for "what will
// this shipment cost and which couriers can deliver it". Called at checkout once the
// customer has picked a delivery address, per pickup-location group in their cart.
// Returns { available, rate, courierName } — available: false means Shiprocket has no
// courier that can service this pincode pair at all (rare, but happens for very remote
// delivery pincodes) — callers should treat that as "can't quote a live rate" and fall
// back to a flat default rather than blocking checkout entirely.
async function checkServiceability({ pickupPincode, deliveryPincode, weightKg, codFlag = 0 }) {
  const token = await getToken();
  const { data } = await axios.get(`${BASE_URL}/courier/serviceability/`, {
    headers: { Authorization: `Bearer ${token}` },
    params: {
      pickup_postcode: pickupPincode,
      delivery_postcode: deliveryPincode,
      weight: weightKg,
      cod: codFlag,
    },
  });

  const couriers = data?.data?.available_courier_companies ?? [];
  if (couriers.length === 0) return { available: false, rate: null, courierName: null };

  // Cheapest available courier — Shiprocket doesn't guarantee the array is rate-sorted,
  // so sort explicitly rather than trusting array order.
  const cheapest = [...couriers].sort((a, b) => a.rate - b.rate)[0];
  return { available: true, rate: Math.ceil(cheapest.rate), courierName: cheapest.courier_name };
}

// Cancels a shipment on Shiprocket's side too — not just in our own DB. Shiprocket's
// cancel endpoint takes an array of THEIR order IDs (the shiprocketOrderId returned when
// the shipment was created), not our own order id. Safe to call even if Shiprocket never
// successfully created a shipment for this order in the first place (nothing to cancel
// there) — callers should skip calling this in that case rather than erroring.
async function cancelShipment(shiprocketOrderId) {
  const token = await getToken();
  await axios.post(
    `${BASE_URL}/orders/cancel`,
    { ids: [shiprocketOrderId] },
    { headers: { Authorization: `Bearer ${token}` } }
  );
}

module.exports = { createShiprocketShipment, groupItemsByPickupLocation, trackShipment, checkServiceability, calculateWeightKg, extractPincode, cancelShipment };