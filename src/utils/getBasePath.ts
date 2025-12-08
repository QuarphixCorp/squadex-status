export function getBasePath(): string {
  if (typeof window === "undefined") {
    return "";
  }

  const meta = document.querySelector('meta[name="basePath"]');
  if (meta) {
    return meta.getAttribute("content") || "";
  }

  return "";
}

export function getPublicUrl(path: string): string {
  const basePath = getBasePath();
  return basePath + path;
}
