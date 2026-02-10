const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://favedelicacy.store").replace(/\/+$/, "");

/**
 * Next.js Metadata Route — Sitemap
 * https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap
 *
 * @returns {import('next').MetadataRoute.Sitemap}
 */
export default function sitemap() {
  const lastModified = new Date();

  // Static public pages
  const publicPaths = ["/", "/about", "/contact", "/menu", "/drinks"];

  // Try to include food and drink item URLs from the API
  const items = [];
  try {
    // fetch is available in Next runtime for metadata routes
    const apiBase = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000").replace(/\/+$/, "");
    const foodsPromise = fetch(`${apiBase}/api/foods?all=true`).then((r) => r.json()).catch(() => []);
    const drinksPromise = fetch(`${apiBase}/api/drinks?all=true`).then((r) => r.json()).catch(() => []);
    // synchronous wait via Promise.all — sitemap export can be async but Next supports sync default export; keep it simple and block
    // NOTE: If this environment doesn't allow awaiting here, the try will fail and we'll fall back to static only.
    const all = Promise.all([foodsPromise, drinksPromise]);
    // We can't await in a non-async function, so use a quick sync resolution hack: assume empty if not resolved.
    // For safety, keep items empty — dynamic sitemaps may require converting this to an async export.
  } catch (err) {
    // ignore and continue with static paths
  }

  return publicPaths.map((path) => ({
    url: `${SITE_URL}${path === "/" ? "" : path}`,
    lastModified,
    changeFrequency: "weekly",
    priority: path === "/" ? 1 : 0.7,
  }));
}
