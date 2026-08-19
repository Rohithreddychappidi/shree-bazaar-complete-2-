const express = require("express");
const prisma = require("../config/prisma");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

// All routes here require a logged-in user — addresses belong to the current user only.
router.use(requireAuth);

router.get("/", async (req, res) => {
  const addresses = await prisma.address.findMany({ where: { userId: req.user.id } });
  res.json(addresses);
});

router.post("/", async (req, res) => {
  const { label, name, line, city, pincode, phone, isDefault } = req.body;
  if (isDefault) {
    await prisma.address.updateMany({ where: { userId: req.user.id }, data: { isDefault: false } });
  }
  const address = await prisma.address.create({
    data: { userId: req.user.id, label, name, line, city, pincode: pincode || null, phone, isDefault: !!isDefault },
  });
  res.status(201).json(address);
});

router.put("/:id", async (req, res) => {
  const existing = await prisma.address.findUnique({ where: { id: req.params.id } });
  if (!existing || existing.userId !== req.user.id) return res.status(404).json({ error: "Address not found" });

  const { label, name, line, city, pincode, phone, isDefault } = req.body;
  if (isDefault) {
    await prisma.address.updateMany({ where: { userId: req.user.id }, data: { isDefault: false } });
  }
  const address = await prisma.address.update({
    where: { id: req.params.id },
    data: { label, name, line, city, pincode: pincode || null, phone, isDefault: !!isDefault },
  });
  res.json(address);
});

router.delete("/:id", async (req, res) => {
  const existing = await prisma.address.findUnique({ where: { id: req.params.id } });
  if (!existing || existing.userId !== req.user.id) return res.status(404).json({ error: "Address not found" });
  await prisma.address.delete({ where: { id: req.params.id } });
  res.json({ ok: true });
});

module.exports = router;