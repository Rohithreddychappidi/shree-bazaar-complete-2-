import { Category, Product, Service, TeamMember } from "./types";

/**
 * ⚠️ Placeholder / seed data.
 * This module is only used to SEED the admin data store the first time the app
 * loads in a browser (see lib/admin-data-context.tsx). After that, everything
 * the admin adds/edits/deletes lives in localStorage so the storefront reflects
 * changes immediately — the same shape the future backend API will return.
 */

export const categories: Category[] = [
  { slug: "food", name: "Food", subcategories: ["Powders", "Pickles", "Kaaram", "Sweets & Snacks"], icon: "UtensilsCrossed", image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?q=80&w=600&auto=format&fit=crop" },
  { slug: "women", name: "Women", subcategories: ["Watches", "Chudidhar", "Sarees", "Jewellery", "Beauty", "Western Wear"], icon: "Shirt", image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=600&auto=format&fit=crop" },
  { slug: "pooja-items", name: "Pooja Items", subcategories: ["Essentials for daily worship"], icon: "Flame", image: "https://images.unsplash.com/photo-1604608672516-f1b9be0a9d0b?q=80&w=600&auto=format&fit=crop" },
  { slug: "home-kitchen", name: "Home & Kitchen", subcategories: ["Everyday household needs"], icon: "Home", image: "https://images.unsplash.com/photo-1583391733956-6c78276477e2?q=80&w=600&auto=format&fit=crop" },
  { slug: "gift-items", name: "Gift Items", subcategories: ["For every occasion"], icon: "Gift", image: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=600&auto=format&fit=crop" },
  { slug: "combos", name: "Combos", subcategories: ["Curated value bundles"], icon: "Package", image: "https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?q=80&w=600&auto=format&fit=crop" },
  { slug: "special", name: "Special", subcategories: ["Festive & limited edition"], icon: "Star", image: "https://images.unsplash.com/photo-1573225342350-16731dd9bf3d?q=80&w=600&auto=format&fit=crop" },
  { slug: "kids", name: "Kids", subcategories: ["Toys, wear & essentials"], icon: "Baby", image: "https://images.unsplash.com/photo-1596460107916-430662021049?q=80&w=600&auto=format&fit=crop" },
  { slug: "beauty", name: "Beauty", subcategories: ["Skin, hair & wellness"], icon: "Sparkles", image: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?q=80&w=600&auto=format&fit=crop" },
  { slug: "decor", name: "Decor", subcategories: ["Lamps, wall art & more"], icon: "Lamp", image: "https://images.unsplash.com/photo-1615397349754-cfa2066a298e?q=80&w=600&auto=format&fit=crop" },
];

const img = (seed: number) =>
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

const gallery = (seed: number) => [img(seed), img((seed + 1) % 8), img((seed + 2) % 8)];

const colorOptions = [
  { name: "Maroon", hex: "#7C2D3A" },
  { name: "Purple", hex: "#6D28D9" },
  { name: "Mustard", hex: "#D4A017" },
  { name: "Emerald", hex: "#0F7A5A" },
];

const sizes = ["S", "M", "L", "XL"];

function sizeColorVariants(basePrice: number, baseOldPrice: number): Product["variants"] {
  const variants: Product["variants"] = [];
  sizes.forEach((size) => {
    colorOptions.slice(0, 3).forEach((color) => {
      variants.push({
        id: `${size}-${color.name}`,
        size,
        color,
        price: basePrice,
        oldPrice: baseOldPrice,
        stock: 12,
      });
    });
  });
  return variants;
}

function weightVariants(pricePer100g: number, oldPricePer100g: number): Product["variants"] {
  const weights = [
    { label: "100g", multiplier: 1 },
    { label: "250g", multiplier: 2.3 },
    { label: "500g", multiplier: 4.2 },
    { label: "1kg", multiplier: 7.8 },
  ];
  return weights.map((w) => ({
    id: w.label,
    weightLabel: w.label,
    price: Math.round(pricePer100g * w.multiplier),
    oldPrice: Math.round(oldPricePer100g * w.multiplier),
    stock: 30,
  }));
}

export const products: Product[] = [
  {
    id: "1", slug: "handmade-mango-pickle", name: "Handmade Mango Pickle", brand: "Shree Bazaar",
    categorySlug: "food", price: 249, oldPrice: 349, rating: 4.6, ratingCount: 128,
    image: img(0), images: gallery(0), tag: "new",
    description: "Traditional home-style mango pickle, made in small batches with cold-pressed oil and no preservatives.",
    variantType: "weight", variants: weightVariants(50, 70),
  },
  {
    id: "2", slug: "banarasi-silk-saree", name: "Banarasi Silk Saree", brand: "Kalamandir",
    categorySlug: "women", price: 2499, oldPrice: 3999, rating: 4.8, ratingCount: 342,
    image: img(1), images: gallery(1), tag: "new",
    description: "Handwoven Banarasi silk saree with a zari border, ideal for weddings and festive occasions.",
    variantType: "size-color", variants: sizeColorVariants(2499, 3999),
  },
  {
    id: "3", slug: "brass-diya-set", name: "Brass Diya Set (Pack of 5)", brand: "PoojaGhar",
    categorySlug: "pooja-items", price: 399, oldPrice: 599, rating: 4.7, ratingCount: 96,
    image: img(2), images: gallery(2), tag: "new",
    description: "Set of 5 handcrafted brass diyas for daily pooja and festive decoration.",
    variantType: "none",
  },
  {
    id: "4", slug: "karam-podi", name: "Homemade Karam Podi", brand: "Shree Bazaar",
    categorySlug: "food", price: 179, oldPrice: 229, rating: 4.5, ratingCount: 210,
    image: img(3), images: gallery(3), tag: "new",
    description: "Spicy South Indian gunpowder made with roasted lentils and red chillies — pairs perfectly with idli and dosa.",
    variantType: "weight", variants: weightVariants(36, 46),
  },
  {
    id: "5", slug: "cotton-chudidhar-set", name: "Cotton Chudidhar Set", brand: "Anokhi",
    categorySlug: "women", price: 899, oldPrice: 1299, rating: 4.4, ratingCount: 88,
    image: img(4), images: gallery(4), tag: "trending",
    description: "Breathable cotton chudidhar set with dupatta, printed in traditional block patterns.",
    variantType: "size-color", variants: sizeColorVariants(899, 1299),
  },
  {
    id: "6", slug: "festive-gift-hamper", name: "Festive Gift Hamper", brand: "Shree Bazaar",
    categorySlug: "gift-items", price: 799, oldPrice: 1099, rating: 4.9, ratingCount: 61,
    image: img(5), images: gallery(5), tag: "trending",
    description: "A curated hamper of sweets, dry fruits and a decorative diya — ready to gift.",
    variantType: "none",
  },
  {
    id: "7", slug: "kids-ethnic-set", name: "Kids Ethnic Wear Set", brand: "Little Ones",
    categorySlug: "kids", price: 649, oldPrice: 899, rating: 4.3, ratingCount: 54,
    image: img(6), images: gallery(6), tag: "trending",
    description: "Comfortable ethnic wear set for kids, perfect for festivals and family functions.",
    variantType: "size-color", variants: sizeColorVariants(649, 899),
  },
  {
    id: "8", slug: "herbal-face-pack", name: "Herbal Face Pack", brand: "Glow",
    categorySlug: "beauty", price: 299, oldPrice: 399, rating: 4.2, ratingCount: 133,
    image: img(7), images: gallery(7), tag: "featured",
    description: "Natural multani-mitti based face pack for a clear, refreshed glow.",
    variantType: "weight", variants: weightVariants(60, 80),
  },
  {
    id: "9", slug: "temple-wall-lamp", name: "Temple Style Wall Lamp", brand: "Shree Bazaar",
    categorySlug: "decor", price: 1199, oldPrice: 1599, rating: 4.6, ratingCount: 41,
    image: img(2), images: gallery(2), tag: "featured",
    description: "Antique-finish wall lamp inspired by South Indian temple architecture.",
    variantType: "none",
  },
  {
    id: "10", slug: "sweet-combo-box", name: "Traditional Sweets Combo Box", brand: "Shree Bazaar",
    categorySlug: "combos", price: 549, oldPrice: 699, rating: 4.7, ratingCount: 175,
    image: img(0), images: gallery(0), tag: "featured",
    description: "A festive assortment of traditional sweets, freshly made and packed for gifting.",
    variantType: "weight", variants: weightVariants(110, 140),
  },
  {
    id: "11", slug: "kumkum-turmeric-set", name: "Kumkum & Turmeric Set", brand: "PoojaGhar",
    categorySlug: "pooja-items", price: 129, oldPrice: 179, rating: 4.5, ratingCount: 72,
    image: img(2), images: gallery(2), tag: "featured",
    description: "Pure kumkum and turmeric powder set for daily pooja rituals.",
    variantType: "none",
  },
  {
    id: "12", slug: "designer-watch", name: "Designer Analog Watch", brand: "Kalamandir",
    categorySlug: "women", price: 1599, oldPrice: 2199, rating: 4.4, ratingCount: 59,
    image: img(1), images: gallery(1), tag: "special",
    description: "Elegant analog watch with a stainless steel strap, suited for both casual and formal wear.",
    variantType: "none",
  },
];

export const services: Service[] = [
  { title: "Fast Delivery", description: "Pan-India shipping with real-time tracking on every order.", icon: "Truck" },
  { title: "Secure Payments", description: "Razorpay-powered checkout with full payment protection.", icon: "ShieldCheck" },
  { title: "Customer Support", description: "Responsive help across chat, call and email.", icon: "Headset" },
  { title: "Easy Returns", description: "Hassle-free returns and exchanges within 7 days.", icon: "RotateCcw" },
  { title: "Quality Assurance", description: "Every product checked before it leaves our warehouse.", icon: "BadgeCheck" },
  { title: "Installation Services", description: "On-request setup help for select home & decor items.", icon: "Wrench" },
];

export const team: TeamMember[] = [
  { name: "Ananya Rao", role: "Founder & CEO", image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=400&auto=format&fit=crop" },
  { name: "Karthik Iyer", role: "Head of Operations", image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=400&auto=format&fit=crop" },
  { name: "Divya Menon", role: "Category Manager", image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=400&auto=format&fit=crop" },
];
