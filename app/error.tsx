'use client';

import { useEffect } from 'react';

export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
      <div className="rounded-3xl border border-rose-200 bg-white p-10 text-center shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">Something went wrong</h1>
        <p className="mt-4 text-slate-600">Please refresh or return to the homepage.</p>
        <button className="mt-6 rounded-full bg-brand-700 px-5 py-2 text-sm font-semibold text-white" onClick={() => reset()}>
          Retry
        </button>
      </div>
    </main>
  );
}
