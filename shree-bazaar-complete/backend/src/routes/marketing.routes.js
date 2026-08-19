const express = require("express");
const prisma = require("../config/prisma");
const { sendTemplateMessage, isConfigured } = require("../config/whatsapp");
const { requireAdmin } = require("../middleware/auth");

const router = express.Router();

router.use(requireAdmin);

// GET /api/marketing/customers — everyone who opted in to marketing messages and has a
// WhatsApp number on file. This is the actual send list for a broadcast.
router.get("/customers", async (_req, res) => {
  const customers = await prisma.user.findMany({
    where: { marketingConsent: true, whatsappNumber: { not: null }, role: "CUSTOMER" },
    select: { id: true, name: true, email: true, whatsappNumber: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  });
  res.json({ customers, whatsappConfigured: isConfigured() });
});

// POST /api/marketing/broadcast — sends an approved WhatsApp template to every opted-in
// customer (or a specific subset by id, for testing on yourself first before a real
// blast). `bodyParams` are the template's {{1}}, {{2}}... values, same for every
// recipient — this is a broadcast tool, not per-customer personalization.
router.post("/broadcast", async (req, res) => {
  const { templateName, bodyParams = [], customerIds } = req.body;
  if (!templateName) return res.status(400).json({ error: "templateName is required" });
  if (!isConfigured()) {
    return res.status(400).json({ error: "WhatsApp isn't configured yet — see backend/README.md for the required setup before this can send anything." });
  }

  const where = customerIds?.length
    ? { id: { in: customerIds } }
    : { marketingConsent: true, whatsappNumber: { not: null }, role: "CUSTOMER" };
  const recipients = await prisma.user.findMany({ where, select: { id: true, name: true, whatsappNumber: true } });

  const results = await Promise.all(
    recipients.map(async (r) => ({
      userId: r.id,
      name: r.name,
      ...(await sendTemplateMessage(r.whatsappNumber, templateName, bodyParams)),
    }))
  );

  const sent = results.filter((r) => r.sent).length;
  res.json({ sent, failed: results.length - sent, results });
});

module.exports = router;
