export default function AdminDashboardPage() {
  return (
    <div className="grid gap-6 xl:grid-cols-3">
      <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <h3 className="text-xl font-semibold text-slate-900">Admin Overview</h3>
        <p className="mt-3 text-slate-600">Manage students, teachers, classes, and academic years from a unified control center.</p>
      </section>
      <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <h3 className="text-xl font-semibold text-slate-900">Pending Approvals</h3>
        <p className="mt-3 text-slate-600">Review registrations and approve school requests.</p>
      </section>
    </div>
  );
}
