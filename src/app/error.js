"use client";

import ErrorClient from "@/components/ErrorClient";

export default function Error({ error, reset }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <ErrorClient error={{ message: error?.message, stack: error?.stack }} />
      <div className="max-w-xl text-center">
        <h1 className="text-2xl font-bold mb-4">Something went wrong</h1>
        <p className="mb-6 text-stone-700">An unexpected error occurred. The team has been notified.</p>
        <div className="flex justify-center gap-3">
          <button onClick={() => reset()} className="px-4 py-2 rounded bg-stone-900 text-white">Try again</button>
        </div>
      </div>
    </div>
  );
}
