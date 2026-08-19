import type { NextConfig } from "next";

// Trust whatever backend URL is configured (NEXT_PUBLIC_API_URL) as an image source too,
// since uploaded product photos are served from there (e.g. http://localhost:4000/uploads/...
// in dev, or https://api.yourdomain.com/uploads/... once deployed).
const apiUrl = process.env.NEXT_PUBLIC_API_URL;
const apiRemotePattern = apiUrl
  ? (() => {
      const url = new URL(apiUrl);
      return [
        {
          protocol: url.protocol.replace(":", "") as "http" | "https",
          hostname: url.hostname,
          port: url.port || undefined,
        },
      ];
    })()
  : [];

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
    protocol: "https",
    hostname: "lh3.googleusercontent.com",
  },
      ...apiRemotePattern,
    ],
  },
};

export default nextConfig;
