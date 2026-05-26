'use client';

import { useEffect, useState } from 'react';
import { approveStudentRequest, getAdminSummary, getPendingStudentRegistrations } from '@/lib/localAuth';
import type { StudentProfile } from '@/types';

export default function AdminDashboardPage() {
  const [pending, setPending] = useState<StudentProfile[]>([]);
  const [summary, setSummary] = useState({ totalStudents: 0, totalPending: 0, totalTeachers: 0, totalParents: 0 });
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  function refresh() {
    setPending(getPendingStudentRegistrations());
    setSummary(getAdminSummary());
  }

  useEffect(() => {
    refresh();
  }, []);

  function handleApprove(requestId: string) {
    const result = approveStudentRequest(requestId, 'student123');
    if (result.success) {
      setActionMessage(`Étudiant approuvé avec succès. Mot de passe initial : student123`);
      refresh();
    } else {
      setActionMessage(result.message ?? 'Impossible d’approuver la demande.');
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-4">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Étudiants actifs</p>
          <p className="mt-4 text-4xl font-semibold text-slate-900">{summary.totalStudents}</p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm uppercase tracking-[0.3em] text-slate-500">En attente</p>
          <p className="mt-4 text-4xl font-semibold text-slate-900">{summary.totalPending}</p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Enseignants</p>
          <p className="mt-4 text-4xl font-semibold text-slate-900">{summary.totalTeachers}</p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Parents</p>
          <p className="mt-4 text-4xl font-semibold text-slate-900">{summary.totalParents}</p>
        </div>
      </div>

      {actionMessage ? (
        <div className="rounded-3xl border border-emerald-100 bg-emerald-50 p-5 text-emerald-900 shadow-sm">
          {actionMessage}
        </div>
      ) : null}

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-slate-900">Demandes d'inscription des élèves</h2>
          <p className="text-sm text-slate-500">Approuvez les comptes étudiants avant leur activation.</p>
        </div>
        <div className="mt-6 space-y-4">
          {pending.length === 0 ? (
            <p className="text-sm text-slate-600">Aucune demande en attente pour le moment.</p>
          ) : (
            pending.map((student) => (
              <div key={student.request_id} className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-lg font-semibold text-slate-900">{student.full_name}</p>
                    <p className="text-sm text-slate-600">Classe: {student.class_name} · Année: {student.academic_year}</p>
                    <p className="text-sm text-slate-600">Parent: {student.parent_name} · {student.parent_email}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleApprove(student.request_id)}
                    className="rounded-full bg-emerald-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800"
                  >
                    Approuver
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
