'use client';

import { useEffect, useState } from 'react';
import { getAuthUserIdFromCookie } from '@/lib/authClient';
import { getTeacherDashboardData } from '@/lib/localAuth';

export default function TeacherDashboardPage() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const userId = getAuthUserIdFromCookie();
    if (!userId) return;
    setData(getTeacherDashboardData(userId));
  }, []);

  if (!data) {
    return <div>Chargement des données de l’enseignant...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-2">
        <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">Bienvenue, {data.teacher.first_name}</h2>
          <p className="mt-3 text-slate-600">Consultez vos classes assignées et suivez les élèves de votre promotion.</p>
        </section>
        <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Classes assignées</p>
          <p className="mt-4 text-4xl font-semibold text-slate-900">{data.classes.length}</p>
          <p className="mt-2 text-slate-600">Classes: {data.classes.map((cls: any) => cls.name).join(', ') || 'Aucune'}</p>
        </section>
      </div>

      <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <h3 className="text-xl font-semibold text-slate-900">Liste des élèves</h3>
        {data.studentCount ? (
          <p className="mt-3 text-slate-600">{data.studentCount} élèves dans vos classes assignées.</p>
        ) : (
          <p className="mt-3 text-slate-600">Aucun élève trouvé pour le moment.</p>
        )}
      </section>
    </div>
  );
}
