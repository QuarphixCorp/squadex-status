/** @type {import('next').NextConfig} */
var repoName = "";
if (process.env.GITHUB_ACTIONS && process.env.GITHUB_REPOSITORY) {
  var parts = process.env.GITHUB_REPOSITORY.split("/");
  if (parts.length > 1) repoName = parts[1];
}
var basePath = repoName ? "/" + repoName : "";

module.exports = {
  basePath: basePath,
  assetPrefix: basePath || "/",
  reactStrictMode: true,
  swcMinify: true,
  // Removed images.unoptimized because we replaced next/image with standard <img> for static export.
  trailingSlash: true,
};
