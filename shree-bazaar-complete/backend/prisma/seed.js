require("dotenv").config();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const img = (seed) =>
  [
    "https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=700&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?q=80&w=700&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?q=80&w=700&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1615397349754-cfa2066a298e?q=80&w=700&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1573225342350-16731dd9bf3d?q=80&w=700&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?q=80&w=700&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1583391733956-6c78276477e2?q=80&w=700&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1601050690597-df0568f70950?q=80&w=700&auto=format&fit=crop",
  ][seed % 8];
const gallery = (seed) => [img(seed), img((seed + 1) % 8), img((seed + 2) % 8)];

const colorOptions = [
  { name: "Maroon", hex: "#7C2D3A" },
  { name: "Purple", hex: "#6D28D9" },
  { name: "Mustard", hex: "#D4A017" },
];
const sizes = ["S", "M", "L", "XL"];

function sizeColorVariants(price, oldPrice) {
  const variants = [];
  sizes.forEach((size) => {
    colorOptions.forEach((color) => {
      variants.push({ size, colorName: color.name, colorHex: color.hex, price, oldPrice, stock: 12 });
    });
  });
  return variants;
}

function weightVariants(pricePer100g, oldPricePer100g) {
  const weights = [
    { label: "100g", m: 1 },
    { label: "250g", m: 2.3 },
    { label: "500g", m: 4.2 },
    { label: "1kg", m: 7.8 },
  ];
  return weights.map((w) => ({
    weightLabel: w.label,
    price: Math.round(pricePer100g * w.m),
    oldPrice: Math.round(oldPricePer100g * w.m),
    stock: 30,
  }));
}

const categories = [
  { slug: "food", name: "Food", subcategories: ["Powders", "Pickles", "Kaaram", "Sweets & Snacks"], icon: "UtensilsCrossed", image: img(7) },
  { slug: "women", name: "Women", subcategories: ["Watches", "Chudidhar", "Sarees", "Jewellery", "Beauty", "Western Wear"], icon: "Shirt", image: img(0) },
  { slug: "pooja-items", name: "Pooja Items", subcategories: ["Essentials for daily worship"], icon: "Flame", image: img(2) },
  { slug: "home-kitchen", name: "Home & Kitchen", subcategories: ["Everyday household needs"], icon: "Home", image: img(6) },
  { slug: "gift-items", name: "Gift Items", subcategories: ["For every occasion"], icon: "Gift", image: img(5) },
  { slug: "combos", name: "Combos", subcategories: ["Curated value bundles"], icon: "Package", image: img(5) },
  { slug: "special", name: "Special", subcategories: ["Festive & limited edition"], icon: "Star", image: img(4) },
  { slug: "kids", name: "Kids", subcategories: ["Toys, wear & essentials"], icon: "Baby", image: img(6) },
  { slug: "beauty", name: "Beauty", subcategories: ["Skin, hair & wellness"], icon: "Sparkles", image: img(1) },
  { slug: "decor", name: "Decor", subcategories: ["Lamps, wall art & more"], icon: "Lamp", image: img(3) },
];

const products = [
  { slug: "handmade-mango-pickle", name: "Handmade Mango Pickle", brand: "Shop Hemu", categorySlug: "food", price: 249, oldPrice: 349, image: img(0), images: gallery(0), tag: "new", description: "Traditional home-style mango pickle, made in small batches with cold-pressed oil and no preservatives.", variantType: "weight", variants: weightVariants(50, 70) },
  { slug: "banarasi-silk-saree", name: "Banarasi Silk Saree", brand: "Kalamandir", categorySlug: "women", price: 2499, oldPrice: 3999, image: img(1), images: gallery(1), tag: "new", description: "Handwoven Banarasi silk saree with a zari border, ideal for weddings and festive occasions.", variantType: "size_color", variants: sizeColorVariants(2499, 3999) },
  { slug: "brass-diya-set", name: "Brass Diya Set (Pack of 5)", brand: "PoojaGhar", categorySlug: "pooja-items", price: 399, oldPrice: 599, image: img(2), images: gallery(2), tag: "new", description: "Set of 5 handcrafted brass diyas for daily pooja and festive decoration.", variantType: "none", variants: [] },
  { slug: "karam-podi", name: "Homemade Karam Podi", brand: "Shop Hemu", categorySlug: "food", price: 179, oldPrice: 229, image: img(3), images: gallery(3), tag: "new", description: "Spicy South Indian gunpowder made with roasted lentils and red chillies.", variantType: "weight", variants: weightVariants(36, 46) },
  { slug: "cotton-chudidhar-set", name: "Cotton Chudidhar Set", brand: "Anokhi", categorySlug: "women", price: 899, oldPrice: 1299, image: img(4), images: gallery(4), tag: "trending", description: "Breathable cotton chudidhar set with dupatta, printed in traditional block patterns.", variantType: "size_color", variants: sizeColorVariants(899, 1299) },
  { slug: "festive-gift-hamper", name: "Festive Gift Hamper", brand: "Shop Hemu", categorySlug: "gift-items", price: 799, oldPrice: 1099, image: img(5), images: gallery(5), tag: "trending", description: "A curated hamper of sweets, dry fruits and a decorative diya — ready to gift.", variantType: "none", variants: [] },
  { slug: "kids-ethnic-set", name: "Kids Ethnic Wear Set", brand: "Little Ones", categorySlug: "kids", price: 649, oldPrice: 899, image: img(6), images: gallery(6), tag: "trending", description: "Comfortable ethnic wear set for kids, perfect for festivals and family functions.", variantType: "size_color", variants: sizeColorVariants(649, 899) },
  { slug: "herbal-face-pack", name: "Herbal Face Pack", brand: "Glow", categorySlug: "beauty", price: 299, oldPrice: 399, image: img(7), images: gallery(7), tag: "featured", description: "Natural multani-mitti based face pack for a clear, refreshed glow.", variantType: "weight", variants: weightVariants(60, 80) },
  { slug: "temple-wall-lamp", name: "Temple Style Wall Lamp", brand: "Shop Hemu", categorySlug: "decor", price: 1199, oldPrice: 1599, image: img(2), images: gallery(2), tag: "featured", description: "Antique-finish wall lamp inspired by South Indian temple architecture.", variantType: "none", variants: [] },
  { slug: "sweet-combo-box", name: "Traditional Sweets Combo Box", brand: "Shop Hemu", categorySlug: "combos", price: 549, oldPrice: 699, image: img(0), images: gallery(0), tag: "featured", description: "A festive assortment of traditional sweets, freshly made and packed for gifting.", variantType: "weight", variants: weightVariants(110, 140) },
  { slug: "kumkum-turmeric-set", name: "Kumkum & Turmeric Set", brand: "PoojaGhar", categorySlug: "pooja-items", price: 129, oldPrice: 179, image: img(2), images: gallery(2), tag: "featured", description: "Pure kumkum and turmeric powder set for daily pooja rituals.", variantType: "none", variants: [] },
  { slug: "designer-watch", name: "Designer Analog Watch", brand: "Kalamandir", categorySlug: "women", price: 1599, oldPrice: 2199, image: img(1), images: gallery(1), tag: "special", description: "Elegant analog watch with a stainless steel strap, suited for both casual and formal wear.", variantType: "none", variants: [] },
];

async function main() {
  console.log("Seeding store settings...");
  const contactInfo = {
    contactPhone: "+91 81436 60814",
    contactAddress: "Laxmi Nivas Apartment, Shalivahana Nagar, Krishna Nagar, Yousufguda, Hyderabad, Telangana 500073",
    socialInstagram: "https://www.instagram.com/traditionaltouch1?igsh=MWMxcDdqNnk3OWVoZg==",
    // contactEmail, socialFacebook, socialLinkedin intentionally left unset — not
    // provided yet. Add them anytime from /admin/settings once you have them.
  };
  await prisma.storeSettings.upsert({
    where: { id: "default" },
    update: contactInfo,
    create: { id: "default", ...contactInfo },
  });

  console.log("Seeding categories...");
  const categoryIdBySlug = {};
  for (const c of categories) {
    const created = await prisma.category.upsert({
      where: { slug: c.slug },
      update: { name: c.name, subcategories: c.subcategories, icon: c.icon, image: c.image },
      create: c,
    });
    categoryIdBySlug[c.slug] = created.id;
  }

  console.log("Seeding products...");
  for (const p of products) {
    const { categorySlug, variants, ...rest } = p;
    const existing = await prisma.product.findUnique({ where: { slug: p.slug } });
    if (existing) {
      await prisma.productVariant.deleteMany({ where: { productId: existing.id } });
      await prisma.product.update({
        where: { slug: p.slug },
        data: { ...rest, categoryId: categoryIdBySlug[categorySlug], variants: { create: variants } },
      });
    } else {
      await prisma.product.create({
        data: { ...rest, categoryId: categoryIdBySlug[categorySlug], variants: { create: variants } },
      });
    }
  }


  const adminEmail = process.env.SEED_ADMIN_EMAIL;
  if (adminEmail) {
    const existing = await prisma.user.findUnique({ where: { email: adminEmail } });
    if (existing) {
      await prisma.user.update({ where: { email: adminEmail }, data: { role: "ADMIN" } });
      console.log(`Promoted ${adminEmail} to ADMIN.`);
    } else {
      console.log(`SEED_ADMIN_EMAIL is set to ${adminEmail}, but no user with that email exists yet — sign in with Google once first, then rerun this seed script.`);
    }
  }

  console.log("Seeding hero slides...");
  const heroSlides = [
    { eyebrow: "New Season", title: "Festive Sarees & Ethnic Wear", text: "Handpicked collections for every celebration.", image: img(1), ctaLabel: "Shop Women", ctaHref: "/products?category=women", sortOrder: 0 },
    { eyebrow: "From Our Kitchen", title: "Homemade Pickles & Powders", text: "Authentic taste, made the traditional way.", image: img(7), ctaLabel: "Shop Food", ctaHref: "/products?category=food", sortOrder: 1 },
    { eyebrow: "This Week", title: "Pooja Essentials, Delivered", text: "Everything you need for daily worship, at your door.", image: img(2), ctaLabel: "Shop Pooja Items", ctaHref: "/products?category=pooja-items", sortOrder: 2 },
  ];
  const existingSlideCount = await prisma.heroSlide.count();
  if (existingSlideCount === 0) {
    for (const slide of heroSlides) {
      await prisma.heroSlide.create({ data: slide });
    }
  } else {
    console.log(`Skipped — ${existingSlideCount} hero slide(s) already exist (probably edited in the admin panel). Manage them at /admin/hero-slides instead.`);
  }

  console.log(`Done — ${categories.length} categories, ${products.length} products.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
