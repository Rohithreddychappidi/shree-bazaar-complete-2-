import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/checkout", "/profile", "/login"],
    },
    sitemap: "https://shophemu.in/sitemap.xml",
  };
}
