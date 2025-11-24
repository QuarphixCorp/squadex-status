/** @type {import('next').NextConfig} */

const production = process.env.NODE_ENV === "production";

const nextConfig = {
  assetPrefix: production ? "/" : "",
  reactStrictMode: true,
  swcMinify: true,
  // Disable the Image Optimization API so `next export` works without errors.
  images: { unoptimized: true },
};

module.exports = nextConfig;
