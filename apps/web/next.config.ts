import type { NextConfig } from "next";

const wordpressHost = process.env.WORDPRESS_URL
  ? new URL(process.env.WORDPRESS_URL).hostname
  : "localhost";

const nextConfig: NextConfig = {
  output: "standalone",
  poweredByHeader: false,
  transpilePackages: ["@jt/shared"],
  images: {
    // Local Docker WordPress media (dev only SSRF exception)
    dangerouslyAllowLocalIP: true,
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      // Always allow the configured CMS host (also passed as Docker build ARG).
      { protocol: "https", hostname: wordpressHost, pathname: "/wp-content/uploads/**" },
      { protocol: "http", hostname: wordpressHost, pathname: "/wp-content/uploads/**" },
      // Railway public domains — WORDPRESS_URL may be missing at image-build time.
      { protocol: "https", hostname: "*.up.railway.app", pathname: "/wp-content/uploads/**" },
      { protocol: "https", hostname: "**.up.railway.app", pathname: "/wp-content/uploads/**" },
      { protocol: "http", hostname: "localhost", port: "8080", pathname: "/wp-content/uploads/**" },
      { protocol: "http", hostname: "127.0.0.1", port: "8080", pathname: "/wp-content/uploads/**" },
      { protocol: "https", hostname: "jerseyterminal.com", pathname: "/wp-content/uploads/**" },
      { protocol: "https", hostname: "www.jerseyterminal.com", pathname: "/wp-content/uploads/**" },
      { protocol: "https", hostname: "**.woocommerce.com" },
      { protocol: "https", hostname: "**.wp.com" },
    ],
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
