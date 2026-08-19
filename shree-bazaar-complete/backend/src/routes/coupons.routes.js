const express = require("express");
const prisma = require("../config/prisma");
const { requireStaff } = require("../middleware/auth");

const router = express.Router();

// POST /api/coupons/validate — public (works logged-out for the general checks, but the
// "already used" check only applies if the person is logged in — attachUser populates
// req.user from the cookie if present, without requiring it). Checks a code against
// active/date-window/usage/per-user rules and, if a productId is given, whether the
// coupon applies to that product. Used by both the product page (preview) and checkout.
router.post("/validate", async (req, res) => {
  const { code, productId } = req.body;
  if (!code) return res.status(400).json({ error: "Coupon code is required" });

  const coupon = await prisma.coupon.findUnique({ where: { code: code.trim().toUpperCase() } });
  if (!coupon || !coupon.active) {
    return res.status(404).json({ error: "Invalid coupon code" });
  }

  const now = new Date();
  if (now < coupon.startsAt) {
    return res.status(400).json({ error: `This coupon isn't active yet — starts ${coupon.startsAt.toLocaleDateString()}` });
  }
  if (now > coupon.endsAt) {
    return res.status(400).json({ error: "This coupon has expired" });
  }
  if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses) {
    return res.status(400).json({ error: "This coupon has reached its usage limit" });
  }
  if (coupon.productId && coupon.productId !== productId) {
    return res.status(400).json({ error: "This coupon doesn't apply to this product" });
  }
  if (req.user) {
    const alreadyUsed = await prisma.couponRedemption.findUnique({
      where: { couponId_userId: { couponId: coupon.id, userId: req.user.id } },
    });
    if (alreadyUsed) return res.status(400).json({ error: "You've already used this coupon" });
  }

  res.json({
    code: coupon.code,
    discountType: coupon.discountType,
    discountValue: coupon.discountValue,
    productId: coupon.productId,
  });
});

// GET /api/coupons — staff (admin or sub-admin)
router.get("/", requireStaff, async (_req, res) => {
  const coupons = await prisma.coupon.findMany({
    include: { product: { select: { id: true, name: true, slug: true } } },
    orderBy: { createdAt: "desc" },
  });
  res.json(coupons);
});

// POST /api/coupons — staff
router.post("/", requireStaff, async (req, res) => {
  const { code, discountType, discountValue, productId, startsAt, endsAt, maxUses, active } = req.body;
  if (!code || !discountType || !discountValue || !startsAt || !endsAt) {
    return res.status(400).json({ error: "code, discountType, discountValue, startsAt and endsAt are required" });
  }
  try {
    const coupon = await prisma.coupon.create({
      data: {
        code: code.trim().toUpperCase(),
        discountType,
        discountValue: Number(discountValue),
        productId: productId || null,
        startsAt: new Date(startsAt),
        endsAt: new Date(endsAt),
        maxUses: maxUses ? Number(maxUses) : null,
        active: active ?? true,
      },
    });
    res.status(201).json(coupon);
  } catch (err) {
    if (err.code === "P2002") return res.status(409).json({ error: "A coupon with this code already exists" });
    res.status(500).json({ error: "Failed to create coupon" });
  }
});

// PUT /api/coupons/:id — staff
router.put("/:id", requireStaff, async (req, res) => {
  const { code, discountType, discountValue, productId, startsAt, endsAt, maxUses, active } = req.body;
  try {
    const coupon = await prisma.coupon.update({
      where: { id: req.params.id },
      data: {
        code: code ? code.trim().toUpperCase() : undefined,
        discountType,
        discountValue: discountValue !== undefined ? Number(discountValue) : undefined,
        productId: productId === "" ? null : productId,
        startsAt: startsAt ? new Date(startsAt) : undefined,
        endsAt: endsAt ? new Date(endsAt) : undefined,
        maxUses: maxUses === "" ? null : maxUses ? Number(maxUses) : undefined,
        active,
      },
    });
    res.json(coupon);
  } catch {
    res.status(404).json({ error: "Coupon not found" });
  }
});

// DELETE /api/coupons/:id — staff
router.delete("/:id", requireStaff, async (req, res) => {
  try {
    await prisma.coupon.delete({ where: { id: req.params.id } });
    res.json({ ok: true });
  } catch {
    res.status(404).json({ error: "Coupon not found" });
  }
});

module.exports = router;
