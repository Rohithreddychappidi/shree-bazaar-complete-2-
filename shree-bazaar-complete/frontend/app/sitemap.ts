import { MetadataRoute } from "next";

const SITE_URL = "https://shophemu.in";
const API_URL = process.env.NEXT_PUBLIC_API_URL;

type Product = { slug: string; updatedAt?: string };
type Category = { slug: string };
type BlogPost = { slug: string; updatedAt?: string };

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/products`, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/blog`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${SITE_URL}/about`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/shipping-policy`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/returns-policy`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/privacy-policy`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/terms`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/help`, changeFrequency: "monthly", priority: 0.4 },
  ];

  // Best-effort — if the API is briefly unreachable during a build, fall back to just
  // the static routes above rather than failing the whole sitemap/build.
  try {
    const [products, categories, posts]: [Product[], Category[], BlogPost[]] = await Promise.all([
      fetch(`${API_URL}/api/products`).then((r) => r.json()),
      fetch(`${API_URL}/api/categories`).then((r) => r.json()),
      fetch(`${API_URL}/api/blog`).then((r) => r.json()),
    ]);

    const productRoutes: MetadataRoute.Sitemap = products.map((p) => ({
      url: `${SITE_URL}/products/${p.slug}`,
      lastModified: p.updatedAt,
      changeFrequency: "weekly",
      priority: 0.7,
    }));

    const categoryRoutes: MetadataRoute.Sitemap = categories.map((c) => ({
      url: `${SITE_URL}/products?category=${c.slug}`,
      changeFrequency: "weekly",
      priority: 0.6,
    }));

    const blogRoutes: MetadataRoute.Sitemap = posts.map((p) => ({
      url: `${SITE_URL}/blog/${p.slug}`,
      lastModified: p.updatedAt,
      changeFrequency: "monthly",
      priority: 0.6,
    }));

    return [...staticRoutes, ...productRoutes, ...categoryRoutes, ...blogRoutes];
  } catch {
    return staticRoutes;
  }
}
