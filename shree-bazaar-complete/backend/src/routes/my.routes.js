const express = require("express");
const prisma = require("../config/prisma");
const { requireStaff } = require("../middleware/auth");

const router = express.Router();

// Every route here just needs ADMIN or SUB_ADMIN — unlike admin.routes.js (which is
// store-wide, master-admin-only), this is scoped to whoever is logged in.
router.use(requireStaff);

// GET /api/my/orders — every order that contains at least one product the logged-in
// staff member personally added (via createdById on Product). Returns the FULL order
// (all items, full address, total) even if the order also contains other staff members'
// products too — not just the line items this person owns. If a client ever wants
// line-item-level redaction for mixed-vendor orders, that's a bigger follow-up change.
router.get("/orders", async (req, res) => {
  const myProducts = await prisma.product.findMany({
    where: { createdById: req.user.id },
    select: { id: true },
  });
  const myProductIds = myProducts.map((p) => p.id);

  if (myProductIds.length === 0) return res.json([]);

  const orders = await prisma.order.findMany({
    where: { items: { some: { productId: { in: myProductIds } } } },
    include: {
      items: true,
      shipments: true,
      user: { select: { id: true, name: true, email: true, phone: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  res.json(orders);
});

module.exports = router;
