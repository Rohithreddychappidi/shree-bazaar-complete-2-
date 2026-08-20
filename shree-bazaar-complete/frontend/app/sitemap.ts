import { MetadataRoute } from "next";

const SITE_URL = "https://shophemu.in";
const API_URL = process.env.NEXT_PUBLIC_API_URL;

type Product = { slug: string; updatedAt?: string };
type Category = { slug: string };

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/products`, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/about`, changeFrequency: "monthly", priority: 0.5 },
  ];

  // Best-effort — if the API is briefly unreachable during a build, fall back to just
  // the static routes above rather than failing the whole sitemap/build.
  try {
    const [products, categories]: [Product[], Category[]] = await Promise.all([
      fetch(`${API_URL}/api/products`).then((r) => r.json()),
      fetch(`${API_URL}/api/categories`).then((r) => r.json()),
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

    return [...staticRoutes, ...productRoutes, ...categoryRoutes];
  } catch {
    return staticRoutes;
  }
}
