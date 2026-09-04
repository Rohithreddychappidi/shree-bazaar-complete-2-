const express = require("express");
const prisma = require("../config/prisma");
const { requireStaff } = require("../middleware/auth");

const router = express.Router();

const slugify = (s) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

// GET /api/blog — public. Only published posts, newest first. Used by the storefront
// blog listing page.
router.get("/", async (_req, res) => {
  const posts = await prisma.blogPost.findMany({
    where: { published: true },
    orderBy: { publishedAt: "desc" },
    select: {
      id: true,
      slug: true,
      title: true,
      excerpt: true,
      coverImage: true,
      publishedAt: true,
      author: { select: { name: true } },
    },
  });
  res.json(posts);
});

// GET /api/blog/admin — staff only. Every post including unpublished drafts, for the
// admin panel's list view. Placed before /:slug so "admin" doesn't get matched as a slug.
router.get("/admin", requireStaff, async (req, res) => {
  const isSubAdmin = req.user.role === "SUB_ADMIN";
  const posts = await prisma.blogPost.findMany({
    where: isSubAdmin ? { authorId: req.user.id } : undefined,
    orderBy: { createdAt: "desc" },
    include: { author: { select: { name: true } } },
  });
  res.json(posts);
});

// GET /api/blog/admin/:id — staff only. Single post by ID (not slug) for the edit form,
// since the slug may be actively changing as the admin edits the title.
router.get("/admin/:id", requireStaff, async (req, res) => {
  const post = await prisma.blogPost.findUnique({ where: { id: req.params.id } });
  if (!post) return res.status(404).json({ error: "Post not found" });
  if (req.user.role === "SUB_ADMIN" && post.authorId !== req.user.id) {
    return res.status(403).json({ error: "You can only edit posts you wrote yourself" });
  }
  res.json(post);
});

// GET /api/blog/:slug — public, single published post. Drafts 404 for non-staff, so an
// unpublished post's URL can't be guessed/visited before it's actually released.
router.get("/:slug", async (req, res) => {
  const post = await prisma.blogPost.findUnique({
    where: { slug: req.params.slug },
    include: { author: { select: { name: true } } },
  });
  if (!post) return res.status(404).json({ error: "Post not found" });
  if (!post.published && !(req.user && (req.user.role === "ADMIN" || req.user.role === "SUB_ADMIN"))) {
    return res.status(404).json({ error: "Post not found" });
  }
  res.json(post);
});

// POST /api/blog — staff only.
router.post("/", requireStaff, async (req, res) => {
  const { title, excerpt, content, coverImage, metaTitle, metaDescription, published } = req.body;
  if (!title || !content) return res.status(400).json({ error: "Title and content are required" });

  try {
    const post = await prisma.blogPost.create({
      data: {
        slug: slugify(title),
        title,
        excerpt: excerpt || "",
        content,
        coverImage: coverImage || null,
        metaTitle: metaTitle || null,
        metaDescription: metaDescription || null,
        published: !!published,
        publishedAt: published ? new Date() : null,
        authorId: req.user.id,
      },
    });
    res.status(201).json(post);
  } catch (err) {
    if (err.code === "P2002") return res.status(409).json({ error: "A post with this title already exists" });
    res.status(500).json({ error: "Failed to create post" });
  }
});

// PUT /api/blog/:id — staff only. Sub-admins can only edit their own posts.
router.put("/:id", requireStaff, async (req, res) => {
  const existing = await prisma.blogPost.findUnique({ where: { id: req.params.id } });
  if (!existing) return res.status(404).json({ error: "Post not found" });
  if (req.user.role === "SUB_ADMIN" && existing.authorId !== req.user.id) {
    return res.status(403).json({ error: "You can only edit posts you wrote yourself" });
  }

  const { title, excerpt, content, coverImage, metaTitle, metaDescription, published } = req.body;
  const data = { title, excerpt, content, coverImage: coverImage || null, metaTitle: metaTitle || null, metaDescription: metaDescription || null };

  // Publishing for the first time stamps publishedAt; un-publishing clears it so it
  // drops out of the listing without losing its content.
  if (published !== undefined) {
    data.published = !!published;
    if (published && !existing.publishedAt) data.publishedAt = new Date();
    if (!published) data.publishedAt = null;
  }

  try {
    const post = await prisma.blogPost.update({ where: { id: req.params.id }, data });
    res.json(post);
  } catch {
    res.status(404).json({ error: "Post not found" });
  }
});

// DELETE /api/blog/:id — staff only. Sub-admins can only delete their own posts.
router.delete("/:id", requireStaff, async (req, res) => {
  const existing = await prisma.blogPost.findUnique({ where: { id: req.params.id } });
  if (!existing) return res.status(404).json({ error: "Post not found" });
  if (req.user.role === "SUB_ADMIN" && existing.authorId !== req.user.id) {
    return res.status(403).json({ error: "You can only delete posts you wrote yourself" });
  }
  await prisma.blogPost.delete({ where: { id: req.params.id } });
  res.json({ ok: true });
});

module.exports = router;
