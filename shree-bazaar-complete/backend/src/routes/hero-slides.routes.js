const express = require("express");
const prisma = require("../config/prisma");
const { requireAdmin } = require("../middleware/auth");

const router = express.Router();

// GET /api/hero-slides — public, used by the homepage banner
router.get("/", async (_req, res) => {
  const slides = await prisma.heroSlide.findMany({ orderBy: { sortOrder: "asc" } });
  res.json(slides);
});

// POST /api/hero-slides — admin only
router.post("/", requireAdmin, async (req, res) => {
  const { eyebrow, title, text, image, ctaLabel, ctaHref, sortOrder } = req.body;
  if (!title || !image) return res.status(400).json({ error: "title and image are required" });
  const slide = await prisma.heroSlide.create({
    data: { eyebrow: eyebrow ?? "", title, text: text ?? "", image, ctaLabel: ctaLabel ?? "Shop Now", ctaHref: ctaHref ?? "/products", sortOrder: sortOrder ?? 0 },
  });
  res.status(201).json(slide);
});

// PUT /api/hero-slides/:id — admin only
router.put("/:id", requireAdmin, async (req, res) => {
  const { eyebrow, title, text, image, ctaLabel, ctaHref, sortOrder } = req.body;
  try {
    const slide = await prisma.heroSlide.update({
      where: { id: req.params.id },
      data: { eyebrow, title, text, image, ctaLabel, ctaHref, sortOrder },
    });
    res.json(slide);
  } catch {
    res.status(404).json({ error: "Slide not found" });
  }
});

// DELETE /api/hero-slides/:id — admin only
router.delete("/:id", requireAdmin, async (req, res) => {
  try {
    await prisma.heroSlide.delete({ where: { id: req.params.id } });
    res.json({ ok: true });
  } catch {
    res.status(404).json({ error: "Slide not found" });
  }
});

module.exports = router;
