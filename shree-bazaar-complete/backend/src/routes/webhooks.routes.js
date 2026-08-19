const express = require("express");
const crypto = require("crypto");
const prisma = require("../config/prisma");
const { notifyOrderStatusUpdate } = require("../config/whatsapp");

const router = express.Router();

// POST /api/webhooks/razorpay — optional but recommended alongside the client-side
// signature check in POST /api/orders. Webhooks are the more reliable source of truth
// for payment status (they fire even if the customer closes the tab right after paying,
// before the frontend's own verification call gets a chance to run). Configure this URL
// in the Razorpay Dashboard → Settings → Webhooks, subscribed to "payment.captured".
router.post("/razorpay", (req, res) => {
  const signature = req.headers["x-razorpay-signature"];
  const expected = crypto
    .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET || "")
    .update(req.rawBody || "")
    .digest("hex");

  if (!process.env.RAZORPAY_WEBHOOK_SECRET || signature !== expected) {
    return res.status(400).json({ error: "Invalid webhook signature" });
  }

  const event = req.body;
  if (event.event === "payment.captured") {
    const paymentId = event.payload?.payment?.entity?.id;
    console.log(`Razorpay webhook: payment ${paymentId} captured.`);
    // The order itself is already saved by POST /api/orders at this point in the normal
    // flow. This is here as a safety net — e.g. to reconcile/alert if a payment was
    // captured but no matching order exists in Postgres (customer closed the tab early).
  }

  res.json({ ok: true });
});

// POST /api/webhooks/shiprocket — Shiprocket calls this when a shipment's status
// changes (picked up, in transit, delivered, etc). Configure the URL in the Shiprocket
// dashboard under Settings → API → Webhooks. Matches against the Shipment that shipment
// belongs to (an order can have more than one, for multi-location orders), then rolls
// the parent Order's status up from whichever shipment is least advanced.
router.post("/shiprocket", async (req, res) => {
  const { order_id: shiprocketOrderId, current_status: status, awb } = req.body;
  if (!shiprocketOrderId) return res.status(400).json({ error: "Missing order_id" });

  try {
    const shipment = await prisma.shipment.findFirst({ where: { shiprocketOrderId: String(shiprocketOrderId) } });
    if (!shipment) return res.json({ ok: true }); // not one of ours (or already deleted) — ignore quietly

    await prisma.shipment.update({
      where: { id: shipment.id },
      data: { status: status ?? undefined, trackingId: awb ?? shipment.trackingId },
    });

    const order = await prisma.order.findUnique({
      where: { id: shipment.orderId },
      include: { shipments: true, user: true },
    });
    if (order && status) {
      await prisma.order.update({ where: { id: order.id }, data: { status } });
      const phone = order.user.whatsappNumber || order.user.phone;
      if (phone) await notifyOrderStatusUpdate(order, phone, status, awb);
    }

    res.json({ ok: true });
  } catch (err) {
    console.error("Failed to apply Shiprocket webhook update:", err);
    res.status(500).json({ error: "Failed to update order" });
  }
});

module.exports = router;
