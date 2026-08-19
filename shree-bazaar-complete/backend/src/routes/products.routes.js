const express = require("express");
const prisma = require("../config/prisma");
const { requireStaff } = require("../middleware/auth");

const router = express.Router();

const slugify = (s) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

// A product counts as "out of stock" if variantType is "none" and stock <= 0, or if it
// has variants and every single one is at stock <= 0.
function isOutOfStock(product) {
  if (product.variantType === "none") return product.stock !== null && product.stock <= 0;
  if (!product.variants || product.variants.length === 0) return false;
  return product.variants.every((v) => v.stock <= 0);
}

// GET /api/products?category=slug&search=text&tag=clearance — public, used by the storefront.
// Out-of-stock products stay visible (with an "Out of Stock" label on the frontend) for
// 24h from when they ran out, then get hidden from this listing automatically — unless
// the request is from a staff member (admin/sub-admin), who always sees everything so
// they can restock or edit hidden products.
router.get("/", async (req, res) => {
  const { category, search, tag } = req.query;
  const where = {};
  const and = [];
  if (category) where.category = { slug: category };
  if (tag) where.tag = tag;
  if (search) {
    and.push({
      OR: [
        { name: { contains: search, mode: "insensitive" } },
        { brand: { contains: search, mode: "insensitive" } },
      ],
    });
  }

  const isStaff = req.user?.role === "ADMIN" || req.user?.role === "SUB_ADMIN";
  if (!isStaff) {
    // NOTE: outOfStockSince is nullable, and in SQL `NOT (NULL <= x)` evaluates to
    // NULL (not true) — a plain `where.NOT` filter here would silently drop every
    // product that has never gone out of stock. Explicitly allow null.
    const hideThreshold = new Date(Date.now() - 24 * 60 * 60 * 1000);
    and.push({
      OR: [{ outOfStockSince: null }, { outOfStockSince: { gt: hideThreshold } }],
    });
  }
  if (and.length) where.AND = and;

  const products = await prisma.product.findMany({
    where,
    include: { category: true, variants: true },
    orderBy: { createdAt: "desc" },
  });
  res.json(products);
});

// GET /api/products/:slug — public, product detail page. Always accessible directly
// (even once hidden from listings) so a bookmarked/shared link never just 404s — the
// frontend shows an Out of Stock state instead.
router.get("/:slug", async (req, res) => {
  const product = await prisma.product.findUnique({
    where: { slug: req.params.slug },
    include: { category: true, variants: true },
  });
  if (!product) return res.status(404).json({ error: "Product not found" });
  res.json(product);
});

// POST /api/products — admin only
router.post("/", requireStaff, async (req, res) => {
  const { name, brand, description, price, oldPrice, tag, categorySlug, images = [], variantType = "none", variants = [], sizeChart, stock, pickupLocation, weightKg } = req.body;

  const category = await prisma.category.findUnique({ where: { slug: categorySlug } });
  if (!category) return res.status(400).json({ error: "Invalid category" });

  const parsedStock = variantType === "none" && stock !== undefined && stock !== "" ? Number(stock) : null;

  try {
    const product = await prisma.product.create({
      data: {
        slug: slugify(name),
        name,
        brand,
        description,
        price,
        oldPrice,
        tag: tag || null,
        image: images[0] ?? "",
        images,
        variantType,
        sizeChart: sizeChart ?? undefined,
        stock: parsedStock,
        weightKg: weightKg !== undefined && weightKg !== "" ? Math.max(0.05, Number(weightKg)) : 0.3,
        outOfStockSince: parsedStock !== null && parsedStock <= 0 ? new Date() : null,
        pickupLocation: pickupLocation || null,
        createdById: req.user.id,
        categoryId: category.id,
        variants: {
          create: variants.map((v) => ({
            size: v.size ?? null,
            colorName: v.color?.name ?? null,
            colorHex: v.color?.hex ?? null,
            weightLabel: v.weightLabel ?? null,
            price: v.price,
            oldPrice: v.oldPrice,
            stock: v.stock ?? 0,
            weightKg: v.weightKg !== undefined && v.weightKg !== "" ? Math.max(0.05, Number(v.weightKg)) : null,
          })),
        },
      },
      include: { variants: true },
    });
    res.status(201).json(product);
  } catch (err) {
    if (err.code === "P2002") return res.status(409).json({ error: "A product with this name already exists" });
    res.status(500).json({ error: "Failed to create product" });
  }
});

// PUT /api/products/:id — admin only (replaces variants wholesale for simplicity)
router.put("/:id", requireStaff, async (req, res) => {
  const { name, brand, description, price, oldPrice, tag, categorySlug, images, variantType, variants, sizeChart, stock, pickupLocation, weightKg } = req.body;

  const data = { name, brand, description, price, oldPrice, tag: tag || null };
  if (sizeChart !== undefined) data.sizeChart = sizeChart;
  if (pickupLocation !== undefined) data.pickupLocation = pickupLocation || null;
  if (weightKg !== undefined && weightKg !== "") data.weightKg = Math.max(0.05, Number(weightKg));
  if (images) {
    data.images = images;
    data.image = images[0] ?? "";
  }
  if (categorySlug) {
    const category = await prisma.category.findUnique({ where: { slug: categorySlug } });
    if (!category) return res.status(400).json({ error: "Invalid category" });
    data.categoryId = category.id;
  }
  if (variantType) data.variantType = variantType;

  if (variantType === "none" && stock !== undefined) {
    const parsedStock = stock === "" ? null : Number(stock);
    const existing = await prisma.product.findUnique({ where: { id: req.params.id } });
    data.stock = parsedStock;
    const wasOut = existing?.outOfStockSince != null;
    const isOut = parsedStock !== null && parsedStock <= 0;
    if (isOut && !wasOut) data.outOfStockSince = new Date();
    if (!isOut) data.outOfStockSince = null;
  }

  try {
    if (variants) {
      await prisma.productVariant.deleteMany({ where: { productId: req.params.id } });
      data.variants = {
        create: variants.map((v) => ({
          size: v.size ?? null,
          colorName: v.color?.name ?? null,
          colorHex: v.color?.hex ?? null,
          weightLabel: v.weightLabel ?? null,
          price: v.price,
          oldPrice: v.oldPrice,
          stock: v.stock ?? 0,
          weightKg: v.weightKg !== undefined && v.weightKg !== "" ? Math.max(0.05, Number(v.weightKg)) : null,
        })),
      };
      // Recompute out-of-stock state from the new variant set.
      const allOut = variants.length > 0 && variants.every((v) => (v.stock ?? 0) <= 0);
      const existing = await prisma.product.findUnique({ where: { id: req.params.id } });
      const wasOut = existing?.outOfStockSince != null;
      if (allOut && !wasOut) data.outOfStockSince = new Date();
      if (!allOut) data.outOfStockSince = null;
    }
    const product = await prisma.product.update({
      where: { id: req.params.id },
      data,
      include: { variants: true },
    });
    res.json(product);
  } catch {
    res.status(404).json({ error: "Product not found" });
  }
});

// DELETE /api/products/:id — admin only
router.delete("/:id", requireStaff, async (req, res) => {
  try {
    await prisma.product.delete({ where: { id: req.params.id } });
    res.json({ ok: true });
  } catch {
    res.status(404).json({ error: "Product not found" });
  }
});

module.exports = router;