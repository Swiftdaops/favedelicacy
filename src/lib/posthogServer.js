"use server";

/**
 * Minimal server-side PostHog capture helper.
 * Sends events to the PostHog /capture endpoint using the server API key.
 */
export async function captureExceptionServer(error, additional = {}) {
  try {
    const key = process.env.POSTHOG_API_KEY;
    const host = process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://app.posthog.com";
    if (!key) return;

    const payload = {
      api_key: key,
      event: "exception",
      properties: {
        message: error?.message || String(error),
        stack: error?.stack || null,
        ...additional,
      },
    };

    await fetch(`${host.replace(/\/+$/, "")}/capture/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch (e) {
    // don't throw from error reporting
    try {
      console.error("PostHog server capture failed", e);
    } catch (ignore) {}
  }
}
