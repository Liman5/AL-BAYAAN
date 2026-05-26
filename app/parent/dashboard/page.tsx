'use client';

import { useEffect, useState } from 'react';
import { getAuthUserIdFromCookie } from '@/lib/authClient';
import { getParentDashboardData } from '@/lib/localAuth';

export default function ParentDashboardPage() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const userId = getAuthUserIdFromCookie();
    if (!userId) return;
    setData(getParentDashboardData(userId));
  }, []);

  if (!data) {
    return <div>Chargement des données du parent...</div>;
  }

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-900">Bienvenue, {data.parent.first_name}</h2>
        <p className="mt-3 text-slate-600">Suivez vos enfants et consultez leurs performances.</p>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900">Enfants suivis</h3>
        {data.children.length ? (
          <ul className="mt-4 space-y-3">
            {data.children.map((child: any) => (
              <li key={child.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="font-semibold text-slate-900">{child.first_name} {child.last_name}</p>
                <p className="mt-1 text-sm text-slate-600">Classe: {child.assigned_class || 'Non affectée'}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-slate-600">Aucun enfant enregistré pour le moment.</p>
        )}
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900">Annonces parents</h3>
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
          <p className="mt-3 text-slate-600">Aucune annonce pour le moment.</p>
        )}
      </section>
    </div>
  );
}
