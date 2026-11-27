'use client';

import { useState, useEffect } from 'react';
import { BookOpen, Clock, MapPin, AlertCircle } from 'lucide-react';
import { getAuthUserIdFromCookie } from '@/lib/authClient';
import { fetchStudentData } from '@/services/db.service';

export default function StudentCoursesPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const uid = getAuthUserIdFromCookie();
    if (!uid) { setLoading(false); return; }
    (async () => {
      const dbData = await fetchStudentData(uid);
      setData(dbData);
      setLoading(false);
    })();
  }, []);

  const className = data?.className || '';
  const classId = data?.classId || '';

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Mes Cours</h1>
      <p className="mt-2 text-slate-600">Les cours de votre classe : {className || '—'}</p>

      {loading ? (
        <div className="mt-16 text-center text-slate-500">Chargement...</div>
      ) : !className ? (
        <div className="mt-16 flex flex-col items-center rounded-3xl border border-slate-200 bg-white p-10 text-center">
          <AlertCircle size={40} className="mb-3 text-slate-300" />
          <p className="font-semibold text-slate-700">Vous n'êtes pas encore inscrit dans une classe.</p>
          <p className="mt-1 text-sm text-slate-500">Votre classe sera affichée ici après inscription.</p>
        </div>
      ) : (
        <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <BookOpen size={20} className="text-emerald-600" />
            Classe {className}
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Les matières et horaires dépendent des enseignants assignés à votre classe par l'administration.
          </p>
          <div className="mt-4 grid gap-3">
            {data?.homeworks?.slice(0, 3).map((hw: any, i: number) => (
              <div key={i} className="rounded-xl border border-slate-100 p-3 text-sm">
                <span className="font-semibold text-slate-800">{hw.title}</span>
                <p className="text-xs text-slate-500 mt-1">
                  <Clock size={12} className="inline mr-1" />
                  {hw.due_date ? new Date(hw.due_date).toLocaleDateString('fr-FR') : 'Sans date'}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}