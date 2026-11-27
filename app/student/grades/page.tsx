'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, AlertCircle, CheckCircle2 } from 'lucide-react';
import { getAuthUserIdFromCookie } from '@/lib/authClient';
import { fetchStudentData, computeStudentAverage } from '@/services/db.service';

export default function StudentGradesPage() {
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

  const grades = data?.grades || [];
  const avg = computeStudentAverage(grades);

  function getBadge(g: number | null) {
    if (g === null) return 'bg-slate-100 text-slate-600';
    if (g >= 15) return 'bg-emerald-100 text-emerald-800';
    if (g >= 13) return 'bg-blue-100 text-blue-800';
    if (g >= 10) return 'bg-amber-100 text-amber-800';
    return 'bg-red-100 text-red-800';
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Mes Notes</h1>
      <p className="mt-2 text-slate-600">Vos notes et moyennes</p>

      {loading ? (
        <div className="mt-16 text-center text-slate-500">Chargement...</div>
      ) : (
        <>
          {avg !== null && (
            <div className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-emerald-50 px-5 py-3">
              <TrendingUp size={18} className="text-emerald-600" />
              <span className="text-sm font-semibold text-emerald-800">Moyenne générale : {avg}/20</span>
            </div>
          )}

          {grades.length === 0 ? (
            <div className="mt-16 flex flex-col items-center rounded-3xl border border-slate-200 bg-white p-10 text-center">
              <CheckCircle2 size={40} className="mb-3 text-slate-300" />
              <p className="font-semibold text-slate-700">Aucune note pour le moment</p>
              <p className="mt-1 text-sm text-slate-500">Vos notes apparaîtront ici.</p>
            </div>
          ) : (
            <div className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-100">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-slate-500">Matière</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-slate-500">Note</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-slate-500">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-slate-500">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-slate-500">Coeff.</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {grades.map((g: any, i: number) => (
                      <tr key={i} className="hover:bg-slate-50/60">
                        <td className="px-6 py-3 text-sm font-medium text-slate-900">{g.subject || '—'}</td>
                        <td className="px-6 py-3">
                          <span className={`inline-flex rounded-md px-2 py-0.5 text-xs font-bold ${getBadge(g.grade)}`}>
                            {g.grade}/20
                          </span>
                        </td>
                        <td className="px-6 py-3 text-sm text-slate-600">{g.grade_type || '—'}</td>
                        <td className="px-6 py-3 text-sm text-slate-600">
                          {g.grade_date ? new Date(g.grade_date).toLocaleDateString('fr-FR') : '—'}
                        </td>
                        <td className="px-6 py-3 text-sm text-slate-600">{g.coefficient || 1}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}