/** @type {import('next').NextConfig} */

const production = process.env.NODE_ENV === "production";
// Detect GitHub Pages environment: GITHUB_ACTIONS set and repository name available
const isPages = !!process.env.GITHUB_ACTIONS;
const repoName = process.env.GITHUB_REPOSITORY?.split("/")[1] || "";
// For project pages the site is served under /<repoName>/, so we need matching basePath & assetPrefix
const basePath = isPages && repoName ? `/${repoName}` : "";

/**
 * Next.js configuration tuned for static export on GitHub Pages:
 * - basePath + assetPrefix ensure chunk/script/css paths resolve under the project subdirectory.
 * - images.unoptimized disables the Image Optimization API (required for next export).
 * - output: 'export' integrates static HTML export into the build step (no separate next export needed).
 * - trailingSlash ensures directory index.html files work reliably on Pages.
 */
const nextConfig = {
  basePath,
  assetPrefix: basePath || "/",
  reactStrictMode: true,
  swcMinify: true,
  images: { unoptimized: true },
  output: "export",
  trailingSlash: true,
};

module.exports = nextConfig;
