const express = require("express");
const bcrypt = require("bcryptjs");
const prisma = require("../config/prisma");
const { requireAdmin } = require("../middleware/auth");

const router = express.Router();

// Master admin only, end to end — sub-admins can't manage other sub-admins.
router.use(requireAdmin);

// GET /api/staff — list all sub-admin accounts
router.get("/", async (_req, res) => {
  const staff = await prisma.user.findMany({
    where: { role: "SUB_ADMIN" },
    select: { id: true, name: true, email: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  });
  res.json(staff);
});

// POST /api/staff — create a new sub-admin (name, email, password set directly by the
// master admin — no invite email, per the simpler approach).
router.post("/", async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: "Name, email and password are required" });
  if (password.length < 8) return res.status(400).json({ error: "Password must be at least 8 characters" });

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return res.status(409).json({ error: "A user with this email already exists" });

  const hashed = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { name, email, password: hashed, role: "SUB_ADMIN" },
  });
  res.status(201).json({ id: user.id, name: user.name, email: user.email, createdAt: user.createdAt });
});

// DELETE /api/staff/:id — revoke sub-admin access (demotes back to CUSTOMER rather than
// deleting the account outright, since they may have orders/addresses tied to it)
router.delete("/:id", async (req, res) => {
  const target = await prisma.user.findUnique({ where: { id: req.params.id } });
  if (!target || target.role !== "SUB_ADMIN") return res.status(404).json({ error: "Sub-admin not found" });

  await prisma.user.update({
    where: { id: req.params.id },
    data: { role: "CUSTOMER", password: null },
  });
  res.json({ ok: true });
});

module.exports = router;
