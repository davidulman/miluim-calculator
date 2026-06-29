import type { NextConfig } from "next";

/**
 * Static export for GitHub Pages (project site at /miluim-calculator).
 * - output: 'export'   → emits a fully static site into out/
 * - basePath/assetPrefix are applied only in production builds so that
 *   local `next dev` keeps serving from the root (http://localhost:3001).
 */
const repo = "miluim-calculator";
const isProd = process.env.NODE_ENV === "production";

const nextConfig: NextConfig = {
  output: "export",
  basePath: isProd ? `/${repo}` : "",
  assetPrefix: isProd ? `/${repo}/` : "",
  images: { unoptimized: true },
  trailingSlash: true,
};

export default nextConfig;
