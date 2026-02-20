"use client";

import { useEffect } from "react";
import posthog from "posthog-js";

export default function ErrorClient({ error }) {
  useEffect(() => {
    try {
      if (posthog && typeof posthog.captureException === "function") {
        posthog.captureException({ message: error?.message || String(error), stack: error?.stack });
      }
    } catch (e) {
      // ignore
    }
  }, [error]);

  return null;
}
