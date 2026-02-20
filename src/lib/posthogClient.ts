"use client";

import posthog from "posthog-js";

export function initPostHog() {
  if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) return posthog;
  if ((posthog as any)?._initialized) return posthog;
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
    // defaults can be used for release/version tagging
    defaults: "2026-01-30",
  });
  // mark initialized to avoid double init
  try {
    (posthog as any)._initialized = true;
  } catch (e) {}
  return posthog;
}

export default posthog;
