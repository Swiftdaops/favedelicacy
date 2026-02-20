"use client";

export default function FailPage() {
  // Intentionally throw during render to trigger the app error boundary
  throw new Error("Intentional test error from /error-test/fail");
  return null;
}
