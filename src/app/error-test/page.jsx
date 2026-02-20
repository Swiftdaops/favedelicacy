"use client";

import Link from "next/link";

export default function ErrorTestPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="max-w-xl text-center">
        <h1 className="text-2xl font-bold mb-4">Error boundary test</h1>
        <p className="mb-6 text-stone-700">Use the link below to visit a page that intentionally throws an error during render.</p>
        <Link href="/error-test/fail" className="px-4 py-2 bg-red-600 text-white rounded-lg">Go to failing page</Link>
      </div>
    </div>
  );
}
