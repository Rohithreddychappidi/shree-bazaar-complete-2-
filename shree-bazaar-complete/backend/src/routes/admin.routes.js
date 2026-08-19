const express = require("express");
const prisma = require("../config/prisma");
const { createShiprocketShipment, groupItemsByPickupLocation, trackShipment } = require("../config/shiprocket");
const { requireAdmin } = require("../middleware/auth");

const router = express.Router();

router.use(requireAdmin);

// GET /api/admin/orders — every order from every customer, with its shipments (one
// order can have more than one if its items ship from different pickup locations).
router.get("/orders", async (_req, res) => {
  const orders = await prisma.order.findMany({
    include: { items: true, shipments: true, user: { select: { id: true, name: true, email: true, phone: true } } },
    orderBy: { createdAt: "desc" },
  });
  res.json(orders);
});

// POST /api/admin/orders/:id/shiprocket/retry — re-attempt Shiprocket shipment creation
// for every pickup-location group on this order that doesn't have a working shipment yet
// (e.g. Shiprocket was down at checkout time, or credentials weren't configured yet).
router.post("/orders/:id/shiprocket/retry", async (req, res) => {
  const order = await prisma.order.findUnique({
    where: { id: req.params.id },
    include: { items: { include: { product: true, variant: true } }, shipments: true, user: true },
  });
  if (!order) return res.status(404).json({ error: "Order not found" });

  const settings = await prisma.storeSettings.findUnique({ where: { id: "default" } });
  const fallbackLocation = settings?.defaultPickupLocation || "Primary";
  const groups = groupItemsByPickupLocation(order.items, fallbackLocation);
  const locations = [...groups.keys()];

  const failures = [];
  for (const [pickupLocation, groupItems] of groups) {
    const existingShipment = order.shipments.find((s) => s.pickupLocation === pickupLocation && s.shiprocketOrderId);
    if (existingShipment) continue; // already has a working shipment for this location

    try {
      const { shiprocketOrderId, shipmentId } = await createShiprocketShipment({
        orderId: order.id,
        createdAt: order.createdAt,
        addressSnapshot: order.addressSnapshot,
        items: groupItems,
        pickupLocation,
        customerEmail: order.user.email,
        shipmentSuffix: locations.length > 1 ? pickupLocation.replace(/\s+/g, "").slice(0, 12) : null,
      });
      const failedShipment = order.shipments.find((s) => s.pickupLocation === pickupLocation);
      if (failedShipment) {
        await prisma.shipment.update({ where: { id: failedShipment.id }, data: { shiprocketOrderId, trackingId: shipmentId, status: "Shipped" } });
      } else {
        await prisma.shipment.create({ data: { orderId: order.id, pickupLocation, shiprocketOrderId, trackingId: shipmentId, status: "Shipped" } });
      }
    } catch (err) {
      failures.push(pickupLocation);
      console.error(`Shiprocket retry failed (pickup: ${pickupLocation}):`, err.response?.data ?? err.message);
    }
  }

  const updated = await prisma.order.findUnique({ where: { id: order.id }, include: { items: true, shipments: true } });
  if (updated.shipments.some((s) => s.shiprocketOrderId)) {
    await prisma.order.update({ where: { id: order.id }, data: { status: "Shipped" } });
  }

  if (failures.length > 0) {
    return res.status(502).json({ error: `Failed for: ${failures.join(", ")}`, order: updated });
  }
  res.json(updated);
});

// GET /api/admin/orders/:id/track — live status pull from Shiprocket for every shipment
// on one order.
router.get("/orders/:id/track", async (req, res) => {
  const order = await prisma.order.findUnique({ where: { id: req.params.id }, include: { shipments: true } });
  if (!order) return res.status(404).json({ error: "Order not found" });

  const trackable = order.shipments.filter((s) => s.trackingId);
  if (trackable.length === 0) return res.status(400).json({ error: "No Shiprocket shipment on this order yet" });

  try {
    const results = await Promise.all(
      trackable.map(async (s) => ({ pickupLocation: s.pickupLocation, tracking: await trackShipment(s.trackingId) }))
    );
    res.json(results);
  } catch (err) {
    res.status(502).json({ error: "Shiprocket tracking request failed", detail: err.response?.data?.message ?? err.message });
  }
});

module.exports = router;