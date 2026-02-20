"use client";

import { useEffect } from "react";
import posthog from "posthog-js";
import { PostHogProvider as PHProvider } from "posthog-js/react";
import { initPostHog } from "@/lib/posthogClient";

export default function PostHogProvider({ children }) {
  useEffect(() => {
    try {
      initPostHog();
    } catch (e) {
      // ignore init errors in client
      console.error("PostHog init failed", e);
    }
  }, []);

  return <PHProvider client={posthog}>{children}</PHProvider>;
}
