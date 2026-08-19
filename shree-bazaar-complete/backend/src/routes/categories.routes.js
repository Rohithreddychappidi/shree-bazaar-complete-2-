const express = require("express");
const prisma = require("../config/prisma");
const { requireStaff } = require("../middleware/auth");

const router = express.Router();

const slugify = (s) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

// GET /api/categories — public, used by the storefront
router.get("/", async (_req, res) => {
  const categories = await prisma.category.findMany({ orderBy: { createdAt: "asc" } });
  res.json(categories);
});

// POST /api/categories — admin only
router.post("/", requireStaff, async (req, res) => {
  const { name, subcategories = [], icon, image } = req.body;
  if (!name) return res.status(400).json({ error: "name is required" });
  try {
    const category = await prisma.category.create({
      data: { slug: slugify(name), name, subcategories, icon, image },
    });
    res.status(201).json(category);
  } catch (err) {
    if (err.code === "P2002") return res.status(409).json({ error: "A category with this name already exists" });
    res.status(500).json({ error: "Failed to create category" });
  }
});

// PUT /api/categories/:slug — admin only
router.put("/:slug", requireStaff, async (req, res) => {
  const { name, subcategories, icon, image } = req.body;
  try {
    const category = await prisma.category.update({
      where: { slug: req.params.slug },
      data: { name, subcategories, icon, image },
    });
    res.json(category);
  } catch {
    res.status(404).json({ error: "Category not found" });
  }
});

// DELETE /api/categories/:slug — admin only; blocked if products still reference it
router.delete("/:slug", requireStaff, async (req, res) => {
  const category = await prisma.category.findUnique({ where: { slug: req.params.slug } });
  if (!category) return res.status(404).json({ error: "Category not found" });

  const productCount = await prisma.product.count({ where: { categoryId: category.id } });
  if (productCount > 0) {
    return res.status(409).json({ error: `${productCount} product(s) still use this category. Reassign or delete them first.` });
  }

  await prisma.category.delete({ where: { slug: req.params.slug } });
  res.json({ ok: true });
});

module.exports = router;
