import { ReactNode } from 'react';
import Link from 'next/link';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-100">
      <aside className="fixed left-0 top-0 z-20 h-full w-72 border-r border-slate-200 bg-white px-5 py-8 shadow-sm lg:static lg:h-auto lg:w-80">
        <div className="space-y-6">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-700">School SaaS</p>
            <p className="mt-1 text-sm text-slate-500">Admin & portal workspace</p>
          </div>
          <nav className="space-y-2 text-sm text-slate-700">
            <Link href="/dashboard/admin" className="block rounded-2xl px-4 py-3 hover:bg-slate-50">Admin Dashboard</Link>
            <Link href="/dashboard/teacher" className="block rounded-2xl px-4 py-3 hover:bg-slate-50">Teacher Dashboard</Link>
            <Link href="/dashboard/student" className="block rounded-2xl px-4 py-3 hover:bg-slate-50">Student Dashboard</Link>
            <Link href="/dashboard/parent" className="block rounded-2xl px-4 py-3 hover:bg-slate-50">Parent Dashboard</Link>
          </nav>
        </div>
      </aside>

      <div className="ml-0 min-h-screen lg:ml-72">
        <header className="border-b border-slate-200 bg-white px-6 py-5 shadow-sm">
          <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Dashboard</p>
              <h1 className="text-2xl font-semibold text-slate-900">Overview</h1>
            </div>
          </div>
        </header>
        <main className="px-6 py-8">{children}</main>
      </div>
    </div>
  );
}
