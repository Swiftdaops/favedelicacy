const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://example.com").replace(/\/+$/, "");

/**
 * Next.js Metadata Route — Sitemap
 * https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap
 *
 * @returns {import('next').MetadataRoute.Sitemap}
 */
export default function sitemap() {
  const lastModified = new Date();

  // Public pages only (exclude /admin and /admin/login from indexing)
  const publicPaths = ["/", "/about", "/contact", "/menu", "/drinks"];

  return publicPaths.map((path) => ({
    url: `${SITE_URL}${path === "/" ? "" : path}`,
    lastModified,
    changeFrequency: "weekly",
    priority: path === "/" ? 1 : 0.7,
  }));
}
