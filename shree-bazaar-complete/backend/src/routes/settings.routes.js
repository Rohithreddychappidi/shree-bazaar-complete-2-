const express = require("express");
const prisma = require("../config/prisma");
const { requireAdmin } = require("../middleware/auth");

const router = express.Router();

// GET /api/settings — public. The storefront (footer, checkout, order pages) needs the
// cancellation policy, contact details, and social links, not just the admin panel.
router.get("/", async (_req, res) => {
  let settings;
  try {
    settings = await prisma.storeSettings.upsert({
      where: { id: "default" },
      update: {},
      create: { id: "default" }, // uses the schema defaults on first read
    });
  } catch (err) {
    // Race condition: two requests can both see "no row yet" and both attempt to
    // create it — Postgres lets only one succeed, the other hits a unique constraint
    // conflict (P2002) here rather than a real error. The row exists now regardless
    // of which request created it, so just fetch it instead of crashing the request.
    if (err.code === "P2002") {
      settings = await prisma.storeSettings.findUnique({ where: { id: "default" } });
    } else {
      throw err;
    }
  }
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