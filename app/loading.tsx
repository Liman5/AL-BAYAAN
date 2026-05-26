export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-700">
      <div className="animate-pulse rounded-2xl border border-slate-200 bg-white px-8 py-6 shadow-sm">
        <div className="h-4 w-48 rounded-full bg-slate-200" />
        <div className="mt-4 h-4 w-32 rounded-full bg-slate-200" />
      </div>
    </div>
  );
}
