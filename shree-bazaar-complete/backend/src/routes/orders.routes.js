const express = require("express");
const crypto = require("crypto");
const prisma = require("../config/prisma");
const razorpay = require("../config/razorpay");
const { createShiprocketShipment, groupItemsByPickupLocation, checkServiceability, calculateWeightKg, extractPincode, cancelShipment } = require("../config/shiprocket");
const { notifyOrderPlaced, notifyOrderCancelled } = require("../config/whatsapp");
const { requireAuth, requireAdmin } = require("../middleware/auth");

const router = express.Router();

const FLAT_SHIPPING_FALLBACK = 79; // used when a live Shiprocket rate can't be obtained
                                     // (missing pincode, API error, or no serviceable courier)

// Computes the real delivery fee for a cart: free above the store's threshold, otherwise
// a live Shiprocket rate per pickup-location group (falling back to a flat rate per group
// if a live quote isn't available for that group). Shared by the pre-payment quote
// endpoint below AND actual order creation, so the customer is never charged something
// different from what they were quoted for reasons other than genuinely live rates
// changing between the two calls.
async function computeShipping({ items, address, subtotal }) {
  const settings = await prisma.storeSettings.findUnique({ where: { id: "default" } });
  const freeThreshold = settings?.freeShippingThreshold ?? 999;
  if (subtotal >= freeThreshold) return 0;

  const pickupPincode = settings?.defaultPickupPincode;
  const deliveryPincode = extractPincode(address);
  if (!pickupPincode || !deliveryPincode) return FLAT_SHIPPING_FALLBACK; // can't call Shiprocket without both

  // Never trust product weight/pickup-location from the client — reload fresh.
  const productIds = [...new Set(items.map((i) => i.productId))];
  const variantIds = [...new Set(items.map((i) => i.variantId).filter(Boolean))];
  const [products, variants] = await Promise.all([
    prisma.product.findMany({ where: { id: { in: productIds } } }),
    variantIds.length ? prisma.productVariant.findMany({ where: { id: { in: variantIds } } }) : [],
  ]);
  const productMap = new Map(products.map((p) => [p.id, p]));
  const variantMap = new Map(variants.map((v) => [v.id, v]));
  const enrichedItems = items.map((i) => ({
    ...i,
    product: productMap.get(i.productId),
    variant: i.variantId ? variantMap.get(i.variantId) : null,
  }));

  const fallbackLocation = settings?.defaultPickupLocation || "Primary";
  const groups = groupItemsByPickupLocation(enrichedItems, fallbackLocation);

  let total = 0;
  for (const [, groupItems] of groups) {
    const weightKg = calculateWeightKg(groupItems);
    try {
      const result = await checkServiceability({ pickupPincode, deliveryPincode, weightKg });
      total += result.available ? result.rate : FLAT_SHIPPING_FALLBACK;
    } catch (err) {
      console.error("Shiprocket rate check failed:", err.response?.data ?? err.message);
      total += FLAT_SHIPPING_FALLBACK;
    }
  }
  return total;
}

router.use(requireAuth);

// GET /api/orders — the logged-in user's own order history
router.get("/", async (req, res) => {
  const orders = await prisma.order.findMany({
    where: { userId: req.user.id },
    include: { items: true, shipments: true },
    orderBy: { createdAt: "desc" },
  });
  res.json(orders);
});

// POST /api/orders/shipping-rate — live delivery fee estimate for the cart + a selected
// address, called by the frontend once the customer picks an address at checkout (before
// payment). This is only a quote for display — POST / below always recalculates the real
// fee server-side at order-creation time rather than trusting whatever this returned.
router.post("/shipping-rate", async (req, res) => {
  const { items, addressId } = req.body;
  if (!items?.length) return res.status(400).json({ error: "No items" });

  const address = await prisma.address.findUnique({ where: { id: addressId } });
  if (!address || address.userId !== req.user.id) return res.status(400).json({ error: "Invalid address" });

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const shipping = await computeShipping({ items, address, subtotal });
  res.json({ shipping });
});

// POST /api/orders/razorpay/create — Step 1 of the Razorpay flow.
router.post("/razorpay/create", async (req, res) => {
  const { amount } = req.body; // amount in rupees
  if (!amount || amount <= 0) return res.status(400).json({ error: "Invalid amount" });

  try {
    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(amount * 100), // paise
      currency: "INR",
      receipt: `rcpt_${Date.now()}`,
    });
    res.json({ orderId: razorpayOrder.id, amount: razorpayOrder.amount, currency: razorpayOrder.currency });
  } catch (err) {
    console.error("Razorpay order creation failed:", err.error ?? err.message ?? err);
    res.status(500).json({ error: "Failed to create Razorpay order", detail: err.error?.description ?? err.message });
  }
});

// POST /api/orders — Step 2. Called after Razorpay's checkout modal succeeds.
router.post("/", async (req, res) => {
  const {
    items, // [{ productId, variantId?, name, variantLabel?, price, quantity }]
    addressId,
    paymentMethod,
    couponCode,
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
  } = req.body;

  if (!items?.length) return res.status(400).json({ error: "No items in order" });
  if (paymentMethod !== "razorpay") {
    return res.status(400).json({ error: "Only online payment via Razorpay is supported — Cash on Delivery is not available." });
  }

  const address = await prisma.address.findUnique({ where: { id: addressId } });
  if (!address || address.userId !== req.user.id) return res.status(400).json({ error: "Invalid address" });

  // Verify the payment actually came from Razorpay and wasn't tampered with, using
  // HMAC SHA256 with the Key Secret — this is the step a frontend alone can never
  // safely perform, since the secret must never leave the server.
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");

  if (expectedSignature !== razorpay_signature) {
    return res.status(400).json({ error: "Payment signature verification failed" });
  }

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  // Re-validate the coupon server-side rather than trusting whatever discount amount
  // the frontend sends. Every coupon is also limited to one redemption per user —
  // checked here so it can never be bypassed even if the frontend's own check was
  // skipped or stale.
  let discountAmount = 0;
  let appliedCouponCode = null;
  let coupon = null;
  if (couponCode) {
    coupon = await prisma.coupon.findUnique({ where: { code: couponCode.trim().toUpperCase() } });
    const now = new Date();
    const couponValid =
      coupon &&
      coupon.active &&
      now >= coupon.startsAt &&
      now <= coupon.endsAt &&
      (coupon.maxUses === null || coupon.usedCount < coupon.maxUses) &&
      (!coupon.productId || items.some((i) => i.productId === coupon.productId));

    if (!couponValid) {
      return res.status(400).json({ error: "Coupon is no longer valid — remove it and try again." });
    }

    const alreadyUsed = await prisma.couponRedemption.findUnique({
      where: { couponId_userId: { couponId: coupon.id, userId: req.user.id } },
    });
    if (alreadyUsed) {
      return res.status(400).json({ error: "You've already used this coupon — remove it and try again." });
    }

    // Product-specific coupons only discount that product's line(s); store-wide
    // coupons discount the whole subtotal.
    const discountBase = coupon.productId
      ? items.filter((i) => i.productId === coupon.productId).reduce((sum, i) => sum + i.price * i.quantity, 0)
      : subtotal;

    discountAmount =
      coupon.discountType === "PERCENT"
        ? Math.round((discountBase * coupon.discountValue) / 100)
        : Math.min(coupon.discountValue, discountBase);
    appliedCouponCode = coupon.code;
  }

  const shipping = await computeShipping({ items, address, subtotal: Math.max(0, subtotal - discountAmount) });
  const total = Math.max(0, subtotal - discountAmount) + shipping;

  // --- Stock check + atomic decrement ---
  // Uses updateMany with a `stock: { gte: quantity }` condition so this is safe under
  // concurrency: if two people race for the last unit, only one update's WHERE clause
  // matches and the other gets count: 0, which we treat as "not enough stock" rather
  // than trusting a separate read-then-write (which a 1000-orders-at-once spike could
  // easily oversell with).
  for (const item of items) {
    if (item.variantId) {
      const result = await prisma.productVariant.updateMany({
        where: { id: item.variantId, stock: { gte: item.quantity } },
        data: { stock: { decrement: item.quantity } },
      });
      if (result.count === 0) {
        return res.status(409).json({ error: `"${item.name}"${item.variantLabel ? ` (${item.variantLabel})` : ""} just went out of stock — remove it from your cart and try again.` });
      }
    } else {
      const product = await prisma.product.findUnique({ where: { id: item.productId } });
      if (product && product.stock !== null) {
        const result = await prisma.product.updateMany({
          where: { id: item.productId, stock: { gte: item.quantity } },
          data: { stock: { decrement: item.quantity } },
        });
        if (result.count === 0) {
          return res.status(409).json({ error: `"${item.name}" just went out of stock — remove it from your cart and try again.` });
        }
      }
    }
  }

  // Mark anything that just hit zero as out-of-stock-since-now (for the 24h auto-hide
  // rule), for both variant products and simple ones.
  for (const item of items) {
    if (item.variantId) {
      const variant = await prisma.productVariant.findUnique({ where: { id: item.variantId }, include: { product: { include: { variants: true } } } });
      if (variant && variant.product.variants.every((v) => v.stock <= 0) && !variant.product.outOfStockSince) {
        await prisma.product.update({ where: { id: variant.product.id }, data: { outOfStockSince: new Date() } });
      }
    } else {
      const product = await prisma.product.findUnique({ where: { id: item.productId } });
      if (product && product.stock !== null && product.stock <= 0 && !product.outOfStockSince) {
        await prisma.product.update({ where: { id: product.id }, data: { outOfStockSince: new Date() } });
      }
    }
  }

  const order = await prisma.order.create({
    data: {
      userId: req.user.id,
      subtotal,
      shipping,
      discountAmount,
      couponCode: appliedCouponCode,
      total,
      paymentMethod,
      razorpayOrderId: razorpay_order_id ?? null,
      razorpayPaymentId: razorpay_payment_id ?? null,
      addressSnapshot: address,
      items: {
        create: items.map((i) => ({
          productId: i.productId,
          variantId: i.variantId ?? null,
          name: i.name,
          variantLabel: i.variantLabel ?? null,
          price: i.price,
          quantity: i.quantity,
        })),
      },
    },
    include: { items: { include: { product: true, variant: true } } },
  });

  if (coupon) {
    await prisma.coupon.update({ where: { id: coupon.id }, data: { usedCount: { increment: 1 } } });
    await prisma.couponRedemption.create({ data: { couponId: coupon.id, userId: req.user.id, orderId: order.id } });
  }

  const notifyPhone = req.user.whatsappNumber || req.user.phone;
  if (notifyPhone) notifyOrderPlaced(order, notifyPhone).catch(() => {}); // fire-and-forget, never blocks checkout

  // Create the Shiprocket shipment(s) now that payment is confirmed. An order can split
  // into multiple shipments if its items come from different pickup locations — see
  // groupItemsByPickupLocation. A Shiprocket outage should never prevent the order
  // itself from being saved — it stays in Postgres with status "Placed" either way, and
  // the admin panel's retry button can re-attempt any shipment that failed.
  const settings = await prisma.storeSettings.findUnique({ where: { id: "default" } });
  const fallbackLocation = settings?.defaultPickupLocation || "Primary";
  const groups = groupItemsByPickupLocation(order.items, fallbackLocation);
  const locations = [...groups.keys()];

  let anyShipped = false;
  for (const [pickupLocation, groupItems] of groups) {
    try {
      const { shiprocketOrderId, shipmentId } = await createShiprocketShipment({
        orderId: order.id,
        createdAt: order.createdAt,
        addressSnapshot: address,
        items: groupItems,
        pickupLocation,
        customerEmail: req.user.email,
        shipmentSuffix: locations.length > 1 ? pickupLocation.replace(/\s+/g, "").slice(0, 12) : null,
      });
      await prisma.shipment.create({
        data: { orderId: order.id, pickupLocation, shiprocketOrderId, trackingId: shipmentId, status: "Shipped" },
      });
      anyShipped = true;
    } catch (err) {
      console.error(`Shiprocket shipment creation failed (pickup: ${pickupLocation}):`, err.response?.data ?? err.message);
      await prisma.shipment.create({ data: { orderId: order.id, pickupLocation, status: "Placed" } });
    }
  }

  const finalOrder = await prisma.order.update({
    where: { id: order.id },
    data: anyShipped ? { status: "Shipped" } : {},
    include: { items: true, shipments: true },
  });

  res.status(201).json(finalOrder);
});

// GET /api/orders/:id — single order detail with its items and shipments. Used by the
// order detail page to show status and the cancel action/countdown.
router.get("/:id", async (req, res) => {
  const order = await prisma.order.findUnique({
    where: { id: req.params.id },
    include: { items: { include: { product: true } }, shipments: true },
  });
  if (!order || order.userId !== req.user.id) return res.status(404).json({ error: "Order not found" });
  res.json(order);
});

// POST /api/orders/:id/cancel — customer cancels their own order. Allowed only within
// StoreSettings.cancellationWindowHours of the order being placed. Restocks every item.
router.post("/:id/cancel", async (req, res) => {
  const { reason } = req.body;
  const order = await prisma.order.findUnique({ where: { id: req.params.id }, include: { items: true, shipments: true } });
  if (!order || order.userId !== req.user.id) return res.status(404).json({ error: "Order not found" });

  if (order.status === "Cancelled") {
    return res.status(400).json({ error: "This order is already cancelled." });
  }
  if (order.status === "Delivered") {
    return res.status(400).json({ error: "This order has already been delivered and can no longer be cancelled." });
  }

  const settings = await prisma.storeSettings.findUnique({ where: { id: "default" } });
  const windowHours = settings?.cancellationWindowHours ?? 8;
  const hoursSinceOrder = (Date.now() - new Date(order.createdAt).getTime()) / (1000 * 60 * 60);
  if (hoursSinceOrder > windowHours) {
    return res.status(400).json({ error: `The ${windowHours}-hour cancellation window has passed for this order.` });
  }

  // Give the stock back.
  for (const item of order.items) {
    if (item.variantId) {
      await prisma.productVariant.update({ where: { id: item.variantId }, data: { stock: { increment: item.quantity } } });
      const variant = await prisma.productVariant.findUnique({ where: { id: item.variantId }, include: { product: { include: { variants: true } } } });
      if (variant && variant.product.variants.some((v) => v.stock > 0) && variant.product.outOfStockSince) {
        await prisma.product.update({ where: { id: variant.product.id }, data: { outOfStockSince: null } });
      }
    } else {
      const product = await prisma.product.findUnique({ where: { id: item.productId } });
      if (product && product.stock !== null) {
        await prisma.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity }, outOfStockSince: null },
        });
      }
    }
  }

  const updated = await prisma.order.update({
    where: { id: order.id },
    data: { status: "Cancelled", cancelledAt: new Date(), cancellationReason: reason ?? null },
  });

  // Cancel on Shiprocket's side too, for every shipment that was actually created there.
  // Never let a Shiprocket failure block the customer's cancellation — it already went
  // through in our own DB above; this is best-effort and logged for admin follow-up.
  for (const shipment of order.shipments) {
    if (!shipment.shiprocketOrderId) continue;
    try {
      await cancelShipment(shipment.shiprocketOrderId);
      await prisma.shipment.update({ where: { id: shipment.id }, data: { status: "Cancelled" } });
    } catch (err) {
      console.error(`Failed to cancel Shiprocket shipment ${shipment.shiprocketOrderId}:`, err.response?.data ?? err.message);
    }
  }

  const notifyPhone = req.user.whatsappNumber || req.user.phone;
  if (notifyPhone) notifyOrderCancelled(order, notifyPhone).catch(() => {});

  res.json(updated);
});

router.patch("/:id/status", requireAdmin, async (req, res) => {
  const { status, trackingId, shiprocketOrderId } = req.body;
  try {
    const order = await prisma.order.update({
      where: { id: req.params.id },
      data: { status, trackingId, shiprocketOrderId },
    });
    res.json(order);
  } catch {
    res.status(404).json({ error: "Order not found" });
  }
});

module.exports = router;