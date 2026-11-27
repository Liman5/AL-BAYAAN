'use client';

import React, { useState, useEffect } from 'react';
import { Users, GraduationCap, Award, AlertTriangle, ArrowRight, RefreshCw, CheckCircle2 } from 'lucide-react';

// ============================================================
// Passage d'Années — Migration des élèves vers classe suivante
// ============================================================

export default function PassageAnneeModule() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const [selectedYear, setSelectedYear] = useState('');
  const [destByClass, setDestByClass] = useState<Record<string, string>>({});

  useEffect(() => {
    load();
  }, [selectedYear]);

  async function load() {
    setLoading(true);
    setMsg(null);
    try {
      const res = await fetch(`/api/admin/progression?yearId=${selectedYear}`, { cache: 'no-store' });
      const result = await res.json();
      if (result.success) {
        setData(result.data);
        if (!selectedYear && result.data?.activeYearId) setSelectedYear(result.data.activeYearId);
      } else {
        setMsg({ type: 'err', text: result.message });
      }
    } catch {
      setMsg({ type: 'err', text: 'Erreur réseau.' });
    }
    setLoading(false);
  }

  // Grouper les élèves par classe
  const classesMap = new Map<string, any[]>();
  (data?.enrollments || []).forEach((enr: any) => {
    const cid = enr.class_id;
    if (!classesMap.has(cid)) classesMap.set(cid, []);
    classesMap.get(cid)!.push(enr);
  });

  const progresses = data?.progress || [];
  const getProgress = (studentId: string) =>
    progresses.find((p: any) => p.student_id === studentId);

  const nextYearClasses = data?.nextYearClasses || [];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <GraduationCap size={22} className="text-blue-600" />
          Passage d'Années — Migration des Élèves
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          Les élèves <strong>admis</strong> passent automatiquement à la classe suivante pour la prochaine année scolaire,
          en conservant leur matricule. Chaque année est archivée avec toutes ses données (notes, présences, devoirs).
        </p>
      </div>

      {msg && (
        <div className={`p-4 rounded-xl border flex items-center gap-3 text-sm ${
          msg.type === 'ok' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          {msg.type === 'ok' ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
          {msg.text}
        </div>
      )}

      {/* Année */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
        <label className="block text-sm font-semibold text-slate-700 mb-2">Année scolaire actuelle</label>
        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(e.target.value)}
          className="w-full sm:w-72 px-4 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {(data?.years || []).map((y: any) => (
            <option key={y.id} value={y.id}>{y.name}</option>
          ))}
        </select>
        {data?.nextYearId && (
          <p className="mt-2 text-sm text-slate-500">
            Migration vers l'année: <strong className="text-blue-600">{data.years.find((y: any) => y.id === data.nextYearId)?.name}</strong>
          </p>
        )}
      </div>

      {loading ? (
        <div className="text-center py-16 text-slate-500">Chargement...</div>
      ) : (
        <div className="space-y-6">
          {Array.from(classesMap.entries()).map(([classId, students]) => {
            const classItem = students[0]?.classes;
            const admis = students.filter((s: any) => getProgress(s.student_id)?.status === 'admis');
            const ajournes = students.filter((s: any) => getProgress(s.student_id)?.status === 'ajourne');
            const withoutStatus = students.filter((s: any) => !getProgress(s.student_id));

            return (
              <div key={classId} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-blue-100 p-2.5 text-blue-700">
                      <Users size={20} />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900">{classItem?.name || 'Classe'}</h3>
                      <p className="text-xs text-slate-500">
                        {students.length} élèves — {admis.length} admis — {ajournes.length} ajournés
                      </p>
                    </div>
                  </div>

                  {/* Migration */}
                  <div className="flex items-center gap-2">
                    <select
                      value={destByClass[classId] || ''}
                      onChange={(e) => setDestByClass((prev) => ({ ...prev, [classId]: e.target.value }))}
                      className="px-3 py-2 border border-slate-300 rounded-lg text-sm"
                    >
                      <option value="">Sélectionner classe suivante...</option>
                      {nextYearClasses.map((c: any) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                    <button
                      onClick={async () => {
                        if (!data.nextYearId) return alert('Aucune année suivante trouvée.');
                        if (!destByClass[classId]) return alert('Choisissez la classe de destination.');
                        setMsg(null);
                        const res = await fetch('/api/admin/progression', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            classId,
                            currentYearId: selectedYear,
                            nextYearId: data.nextYearId,
                            nextClassId: destByClass[classId],
                            statusFilter: 'admis',
                          }),
                        });
                        const result = await res.json();
                        if (result.success) {
                          setMsg({ type: 'ok', text: `✅ ${result.data.migrated} élève(s) migré(s) vers la classe suivante.` });
                          load();
                        } else {
                          setMsg({ type: 'err', text: result.message });
                        }
                      }}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors"
                    >
                      <ArrowRight size={16} />
                      Migrer les admis
                    </button>
                  </div>
                </div>

                {/* Tableau élèves */}
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 text-slate-500 text-left text-xs uppercase">
                      <tr>
                        <th className="px-5 py-3">Nom</th>
                        <th className="px-5 py-3">Matricule</th>
                        <th className="px-5 py-3">Statut passage</th>
                        <th className="px-5 py-3">Redoublements</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {students.map((enr: any) => {
                        const st = enr.students;
                        const prog = getProgress(st.id);
                        const name = `${st.users?.first_name || ''} ${st.users?.last_name || ''}`.trim() || st.matricule;
                        const status = prog?.status || 'pending';
                        return (
                          <tr key={enr.id} className="hover:bg-slate-50/50">
                            <td className="px-5 py-3 font-medium text-slate-900">{name}</td>
                            <td className="px-5 py-3 font-mono text-xs">{st.matricule}</td>
                            <td className="px-5 py-3">
                              <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
                                status === 'admis' ? 'bg-green-100 text-green-800'
                                : status === 'ajourne' ? 'bg-red-100 text-red-800'
                                : status === 'pending' ? 'bg-amber-100 text-amber-800'
                                : 'bg-slate-100 text-slate-700'
                              }`}>
                                {status === 'admis' ? <CheckCircle2 size={12} /> : status === 'ajourne' ? <AlertTriangle size={12} /> : <RefreshCw size={12} />}
                                {status === 'admis' ? 'Admis' : status === 'ajourne' ? 'Ajourné' : status === 'pending' ? 'À décider' : 'Refusé'}
                              </span>
                            </td>
                            <td className="px-5 py-3">
                              <span className={`text-xs font-bold ${(prog?.repeat_count || 0) > 0 ? 'text-red-600' : 'text-slate-400'}`}>
                                {(prog?.repeat_count || 0)} fois
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}

          {classesMap.size === 0 && (
            <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
              <Award className="mx-auto text-slate-300 mb-3" size={48} />
              <p className="text-slate-500">Aucun élève inscrit pour cette année scolaire.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}