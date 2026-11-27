'use client';

import React, { useState, useEffect } from 'react';
import { User, BookOpen, FileText, Calendar, TrendingUp, AlertCircle, CheckCircle2, XCircle, Clock, Wallet, ArrowLeft, CreditCard, Loader2 } from 'lucide-react';
import { getCurrentAcademicYear } from '@/lib/schoolData';

interface StudentDossierProps {
  student: {
    id: string;
    firstName: string;
    lastName: string;
    matricule: string;
    className: string;
    classId?: string;
    academicYear?: string;
    status?: string;
    email?: string;
    phone?: string;
    parentName?: string;
    parentPhone?: string;
    parentEmail?: string;
    registrationDate?: Date | string;
    dateOfBirth?: Date | string;
    address?: string;
  };
  onBack?: () => void;
}

type Tab = 'info' | 'grades' | 'homework' | 'attendance' | 'payments';

const tabConfigs: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'info', label: 'Informations', icon: <User size={18} /> },
  { id: 'grades', label: 'Notes', icon: <TrendingUp size={18} /> },
  { id: 'homework', label: 'Devoirs', icon: <FileText size={18} /> },
  { id: 'attendance', label: 'Présence', icon: <Calendar size={18} /> },
  { id: 'payments', label: 'Paiements', icon: <Wallet size={18} /> },
];

const statusLabels: Record<string, { label: string; color: string }> = {
  present: { label: 'Présent', color: 'bg-emerald-100 text-emerald-700' },
  absent: { label: 'Absent', color: 'bg-red-100 text-red-700' },
  late: { label: 'Retard', color: 'bg-amber-100 text-amber-700' },
  excused: { label: 'Excusé', color: 'bg-blue-100 text-blue-700' },
};

// Helper : transforme les enregistrements DB en summary de présence
function summarizeAttendance(records: any[]) {
  const arr = records || [];
  return {
    present: arr.filter((r) => r.status === 'present').length,
    late: arr.filter((r) => r.status === 'late').length,
    absent: arr.filter((r) => r.status === 'absent').length,
    excused: arr.filter((r) => r.status === 'excused').length,
    total: arr.length,
    records: arr.map((r) => ({
      id: r.id,
      date: r.date,
      status: r.status,
      teacherName: r.teacher_id || 'Enseignant',
      comment: r.comment || '',
    })),
  };
}

export default function StudentDossier({ student, onBack }: StudentDossierProps) {
  const [activeTab, setActiveTab] = useState<Tab>('info');
  const academicYear = student.academicYear || getCurrentAcademicYear();
  const [db, setDb] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(
          `/api/admin/student-detail?studentId=${encodeURIComponent(student.id)}${student.classId ? `&classId=${encodeURIComponent(student.classId)}` : ''}`,
          { cache: 'no-store' }
        );
        const result = await res.json();
        if (result.success && result.data) setDb(result.data);
      } catch (e) {
        console.error('Erreur chargement dossier:', e);
      } finally {
        setLoading(false);
      }
    })();
  }, [student.id, student.classId]);

  // Données transformées depuis la BASE
  const grades = (db?.grades || []).map((g: any) => ({
    id: g.id,
    subject: g.subject || 'Matière',
    grade: g.grade ?? 0,
    coefficient: g.coefficient || 1,
    date: g.grade_date || new Date().toISOString(),
    teacherName: g.teacher_id || 'Enseignant',
    assignmentType: g.grade_type || 'note',
  }));
  const attendance = summarizeAttendance(db?.attendance || []);
  const homeworks = (db?.homeworks || []).map((h: any) => ({
    id: h.id,
    title: h.title,
    subject: h.subject || '',
    className: student.className,
    description: h.description || '',
    teacherName: h.teacher_id || 'Enseignant',
    publishedDate: h.published_date || h.created_at || new Date().toISOString(),
    dueDate: h.due_date || new Date().toISOString(),
  }));
  const paymentDb = db?.payment;
  const payment = paymentDb
    ? {
        id: paymentDb.id,
        totalAmount: paymentDb.total_amount || 0,
        paidAmount: paymentDb.paid_amount || 0,
        status: paymentDb.status || 'unpaid',
        transactions: (db?.transactions || []).map((t: any) => ({
          id: t.id,
          date: t.date,
          amount: t.amount,
          reference: t.reference,
          method: t.method,
        })),
      }
    : null;

  // Moyenne
  const gradeVals = grades.map((g: any) => g.grade);
  const avg = gradeVals.length > 0
    ? Math.round((gradeVals.reduce((a: number, b: number) => a + b, 0) / gradeVals.length) * 10) / 10
    : null;

  const gradesBySubject: Record<string, any[]> = {};
  grades.forEach((grade: any) => {
    if (!gradesBySubject[grade.subject]) gradesBySubject[grade.subject] = [];
    gradesBySubject[grade.subject].push(grade);
  });

  // ✅ Données réelles depuis la base (chargées par /api/admin/student-detail)
  const studentDb = db?.student;
  const userDb = studentDb?.users;
  const studentInfo = {
    firstName: userDb?.first_name || student.firstName,
    lastName: userDb?.last_name || student.lastName,
    email: userDb?.email || student.email || '—',
    phone: userDb?.phone || student.phone || '—',
  };

  // ✅ Parent réel depuis la base (chargé par /api/admin/student-detail)
  const parentDb = studentDb?.parents;
  const parentInfo = {
    name: parentDb?.full_name || student.parentName || '—',
    phone: parentDb?.phone || student.parentPhone || '—',
    email: parentDb?.email || student.parentEmail || '—',
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 size={32} className="animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-4">
          {onBack && (
            <button onClick={onBack} className="inline-flex items-center gap-2 rounded-xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-200">
              <ArrowLeft size={16} />
              Retour
            </button>
          )}
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-lg font-bold text-white shadow-lg">
            {studentInfo.firstName[0]}{studentInfo.lastName[0]}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">{studentInfo.firstName} {studentInfo.lastName}</h2>
            <p className="text-sm text-slate-500">{student.matricule} · {student.className} · {academicYear}</p>
          </div>
        </div>
        <span className={`inline-flex w-fit items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold ${student.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
          <span className={`h-2 w-2 rounded-full ${student.status === 'active' ? 'bg-emerald-500' : 'bg-slate-400'}`} />
          {student.status === 'active' ? 'Actif' : 'Inactif'}
        </span>
      </div>

      {/* Summary */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-600"><TrendingUp size={16} className="text-emerald-600" /> Moyenne générale</div>
          <p className="text-3xl font-bold text-slate-900">{avg !== null ? `${avg}/20` : '—'}</p>
          <p className="mt-1 text-xs text-slate-500">{grades.length} notes enregistrées</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-600"><FileText size={16} className="text-blue-600" /> Devoirs</div>
          <p className="text-3xl font-bold text-slate-900">{homeworks.length}</p>
          <p className="mt-1 text-xs text-slate-500">devoirs donnés</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-600"><Calendar size={16} className="text-amber-600" /> Présence</div>
          <p className="text-3xl font-bold text-slate-900">{attendance.total}</p>
          <p className="mt-1 text-xs text-slate-500">{attendance.absent + attendance.late + attendance.excused} absences/retards</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-600"><Wallet size={16} className="text-purple-600" /> Paiement</div>
          <p className="text-3xl font-bold text-slate-900">{payment ? `${Math.round((payment.paidAmount / payment.totalAmount) * 100)}%` : '—'}</p>
          <p className="mt-1 text-xs text-slate-500">{payment ? `${payment.paidAmount}/${payment.totalAmount} DA` : 'Non configuré'}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-4">
        {tabConfigs.map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${activeTab === tab.id ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'}`}>
            {tab.icon}{tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="space-y-6">
        {activeTab === 'info' && (
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-900"><User size={18} className="text-emerald-600" /> Informations personnelles</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between border-b border-slate-100 pb-2"><span className="text-slate-500">Matricule</span><span className="font-semibold text-slate-900">{student.matricule}</span></div>
                <div className="flex justify-between border-b border-slate-100 pb-2"><span className="text-slate-500">Classe</span><span className="font-semibold text-slate-900">{student.className}</span></div>
                <div className="flex justify-between border-b border-slate-100 pb-2"><span className="text-slate-500">Année scolaire</span><span className="font-semibold text-slate-900">{academicYear}</span></div>
                <div className="flex justify-between border-b border-slate-100 pb-2"><span className="text-slate-500">Email</span><span className="font-semibold text-slate-900">{studentInfo.email}</span></div>
                <div className="flex justify-between border-b border-slate-100 pb-2"><span className="text-slate-500">Téléphone</span><span className="font-semibold text-slate-900">{studentInfo.phone}</span></div>
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-900"><BookOpen size={18} className="text-blue-600" /> Parent / Tuteur</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between border-b border-slate-100 pb-2"><span className="text-slate-500">Nom du parent</span><span className="font-semibold text-slate-900">{parentInfo.name}</span></div>
                <div className="flex justify-between border-b border-slate-100 pb-2"><span className="text-slate-500">Téléphone</span><span className="font-semibold text-slate-900">{parentInfo.phone}</span></div>
                <div className="flex justify-between border-b border-slate-100 pb-2"><span className="text-slate-500">Email</span><span className="font-semibold text-slate-900">{parentInfo.email}</span></div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'grades' && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="mb-6 flex items-center gap-2 text-lg font-bold text-slate-900"><TrendingUp size={18} className="text-emerald-600" /> Notes et évaluations</h3>
            {grades.length === 0 ? (
              <p className="py-8 text-center text-sm text-slate-500">Aucune note enregistrée.</p>
            ) : (
              Object.entries(gradesBySubject).map(([subject, subjectGrades]) => (
                <div key={subject} className="mb-4 rounded-2xl border border-slate-100 bg-slate-50/50 p-5">
                  <div className="mb-3 flex items-center justify-between">
                    <h4 className="font-bold text-slate-900">{subject}</h4>
                    <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">
                      Moyenne : {Math.round((subjectGrades.reduce((a: number, g: any) => a + g.grade, 0) / Math.max(1, subjectGrades.length)) * 10) / 10}/20
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {subjectGrades.map((g: any) => (
                      <span key={g.id} className={`inline-flex rounded-md px-2 py-1 text-xs font-bold ${g.grade >= 10 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                        {g.grade}/20 ×{g.coefficient}
                      </span>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'homework' && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="mb-6 flex items-center gap-2 text-lg font-bold text-slate-900"><FileText size={18} className="text-blue-600" /> Devoirs donnés</h3>
            {homeworks.length === 0 ? (
              <p className="py-8 text-center text-sm text-slate-500">Aucun devoir pour cette classe.</p>
            ) : (
              <div className="space-y-3">
                {homeworks.map((h: any) => (
                  <div key={h.id} className="flex items-start justify-between rounded-2xl border border-slate-100 bg-slate-50/50 p-5">
                    <div>
                      <p className="font-semibold text-slate-900">{h.title}</p>
                      <p className="mt-1 text-sm text-slate-600">{h.subject} · {h.className}</p>
                      {h.description && <p className="mt-1 text-sm text-slate-500">{h.description}</p>}
                      {h.submissions && h.submissions.length > 0 && (
                        <p className="mt-2 text-xs text-emerald-600">✓ Soumis par l'élève</p>
                      )}
                    </div>
                    <span className="ml-3 inline-flex shrink-0 items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1.5 text-xs font-semibold text-amber-700">
                      <Clock size={12} />{new Date(h.dueDate).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'attendance' && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="mb-6 flex items-center gap-2 text-lg font-bold text-slate-900"><Calendar size={18} className="text-amber-600" /> Présence — {academicYear}</h3>
            <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div className="rounded-2xl bg-emerald-50 p-4 text-center"><p className="flex items-center justify-center gap-1 text-2xl font-bold text-emerald-700"><CheckCircle2 size={18} />{attendance.present}</p><p className="text-xs font-medium text-emerald-800">Présents</p></div>
              <div className="rounded-2xl bg-amber-50 p-4 text-center"><p className="flex items-center justify-center gap-1 text-2xl font-bold text-amber-700"><Clock size={18} />{attendance.late}</p><p className="text-xs font-medium text-amber-800">Retards</p></div>
              <div className="rounded-2xl bg-red-50 p-4 text-center"><p className="flex items-center justify-center gap-1 text-2xl font-bold text-red-700"><XCircle size={18} />{attendance.absent}</p><p className="text-xs font-medium text-red-800">Absences</p></div>
              <div className="rounded-2xl bg-blue-50 p-4 text-center"><p className="flex items-center justify-center gap-1 text-2xl font-bold text-blue-700"><AlertCircle size={18} />{attendance.excused}</p><p className="text-xs font-medium text-blue-800">Excusés</p></div>
            </div>
            {attendance.records.length > 0 ? (
              <div className="space-y-2">
                {attendance.records.sort((a: any, b: any) => b.date.localeCompare(a.date)).map((r: any) => {
                  const s = statusLabels[r.status] || statusLabels.present;
                  return (
                    <div key={r.id} className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/40 px-4 py-2 text-sm">
                      <span className="font-medium text-slate-700">{new Date(r.date).toLocaleDateString('fr-FR')}</span>
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${s.color}`}>{s.label}</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="py-8 text-center text-sm text-slate-500">Aucun enregistrement de présence.</p>
            )}
          </div>
        )}

        {activeTab === 'payments' && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="mb-6 flex items-center gap-2 text-lg font-bold text-slate-900"><Wallet size={18} className="text-purple-600" /> Paiements — {academicYear}</h3>
            {payment ? (
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="rounded-2xl bg-slate-50 p-5"><p className="text-sm text-slate-600">Total à payer</p><p className="text-2xl font-bold text-slate-900">{payment.totalAmount.toLocaleString()} DA</p></div>
                  <div className="rounded-2xl bg-emerald-50 p-5"><p className="text-sm text-emerald-700">Déjà payé</p><p className="text-2xl font-bold text-emerald-700">{payment.paidAmount.toLocaleString()} DA</p></div>
                  <div className="rounded-2xl bg-red-50 p-5"><p className="text-sm text-red-700">Reste</p><p className="text-2xl font-bold text-red-700">{(payment.totalAmount - payment.paidAmount).toLocaleString()} DA</p></div>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                  <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400" style={{ width: `${Math.min(100, (payment.paidAmount / payment.totalAmount) * 100)}%` }} />
                </div>
                {payment.transactions.length > 0 && (
                  <div className="space-y-2">
                    {payment.transactions.map((t: any) => (
                      <div key={t.id} className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/40 px-4 py-2 text-sm">
                        <div><p className="font-medium text-slate-900">+{t.amount} DA</p><p className="text-xs capitalize text-slate-500">{t.method} · {t.reference}</p></div>
                        <span className="text-xs text-slate-500">{new Date(t.date).toLocaleDateString('fr-FR')}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center py-10 text-center">
                <CreditCard size={28} className="mb-2 text-slate-300" />
                <p className="text-sm text-slate-500">Aucun dossier de paiement.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}