'use client';

import { useEffect, useState } from 'react';
import { getAuthUserIdFromCookie } from '@/lib/authClient';
import { getStudentDashboardData } from '@/lib/localAuth';

export default function StudentDashboardPage() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const userId = getAuthUserIdFromCookie();
    if (!userId) return;
    setData(getStudentDashboardData(userId));
  }, []);

  if (!data) {
    return <div>Chargement des données de l’élève...</div>;
  }

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-900">Bienvenue, {data.student.first_name}</h2>
        <p className="mt-3 text-slate-600">Statut: {data.student.status}</p>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900">Classe</h3>
          <p className="mt-3 text-slate-600">{data.student.assigned_class || 'Non affectée'}</p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900">Identifiant étudiant</h3>
          <p className="mt-3 text-slate-600">{data.student.student_id || 'En attente'}</p>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900">Annonces</h3>
        {data.announcements.length ? (
          <ul className="mt-4 space-y-4">
            {data.announcements.map((item: any) => (
              <li key={item.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="font-semibold text-slate-900">{item.title}</p>
                <p className="mt-1 text-sm text-slate-600">{item.message}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-slate-600">Aucune annonce pour l’instant.</p>
        )}
      </section>
    </div>
  );
}
