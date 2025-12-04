/** @type {import('next').NextConfig} */
// Using custom domain, so basePath should always be empty
var basePath = "";

module.exports = {
  basePath: basePath,
  assetPrefix: undefined,
  reactStrictMode: true,
  swcMinify: true,
  // Removed images.unoptimized because we replaced next/image with standard <img> for static export.
  trailingSlash: true,
  output: "export",
  distDir: "out",
};
