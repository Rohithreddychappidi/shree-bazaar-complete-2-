const express = require("express");
const prisma = require("../config/prisma");
const { requireAdmin } = require("../middleware/auth");

const router = express.Router();

// GET /api/settings — public. The storefront (footer, checkout, order pages) needs the
// cancellation policy, contact details, and social links, not just the admin panel.
router.get("/", async (_req, res) => {
  const settings = await prisma.storeSettings.upsert({
    where: { id: "default" },
    update: {},
    create: { id: "default" }, // uses the schema defaults on first read
  });
  res.json(settings);
});

// PUT /api/settings — admin only
router.put("/", requireAdmin, async (req, res) => {
  const {
    storeName,
    freeShippingThreshold,
    cancellationPolicy,
    cancellationWindowHours,
    contactPhone,
    contactEmail,
    contactAddress,
    socialInstagram,
    socialFacebook,
    socialLinkedin,
    announcementText,
    announcementEnabled,
    defaultPickupLocation,
    defaultPickupPincode,
  } = req.body;

  const data = {
    storeName,
    freeShippingThreshold,
    cancellationPolicy,
    cancellationWindowHours,
    contactPhone,
    contactEmail,
    contactAddress,
    socialInstagram,
    socialFacebook,
    socialLinkedin,
    announcementText,
    announcementEnabled,
    defaultPickupLocation,
    defaultPickupPincode: defaultPickupPincode || null,
  };

  const settings = await prisma.storeSettings.upsert({
    where: { id: "default" },
    update: data,
    create: { id: "default", ...data },
  });
  res.json(settings);
});

module.exports = router;