const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://favedelicacy.store").replace(/\/+$/, "");

/**
 * Next.js Metadata Route — Robots
 * https://nextjs.org/docs/app/api-reference/file-conventions/metadata/robots
 *
 * @returns {import('next').MetadataRoute.Robots}
 */
export default function robots() {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",

        // Block all admin pages (including /admin/login) from crawlers
        disallow: ["/admin", "/admin/", "/admin/*"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
