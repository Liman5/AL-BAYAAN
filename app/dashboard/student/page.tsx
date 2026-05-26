export default function StudentDashboardPage() {
  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <h3 className="text-xl font-semibold text-slate-900">Student Portal</h3>
        <p className="mt-3 text-slate-600">View grades, attendance, timetable, and downloadable reports.</p>
      </section>
    </div>
  );
}
