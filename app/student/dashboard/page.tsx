'use client';

import { useEffect, useState } from 'react';
import { getAuthUserIdFromCookie } from '@/lib/authClient';
import {
  LayoutDashboard, BookOpen, FileText, Users, Calendar, TrendingUp,
  GraduationCap, Bell, AlertCircle, Clock, Wallet
} from 'lucide-react';
import { fetchStudentData, computeStudentAverage, computeAttendanceSummary } from '@/services/db.service';

const navItems = [
  { label: 'Tableau de bord', href: '/student/dashboard', icon: <LayoutDashboard size={20} /> },
  { label: 'Mes cours', href: '/student/courses', icon: <BookOpen size={20} /> },
  { label: 'Mes devoirs', href: '/student/assignments', icon: <FileText size={20} /> },
  { label: 'Mes notes', href: '/student/grades', icon: <TrendingUp size={20} /> },
  { label: 'Emploi du temps', href: '/student/schedule', icon: <Calendar size={20} /> },
];

export default function StudentDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loaded, setLoaded] = useState(false);
  const [debug, setDebug] = useState<any>(null);
  const [showDebug, setShowDebug] = useState(false);

  useEffect(() => {
    const userId = getAuthUserIdFromCookie();
    if (!userId) {
      setData({ student: {}, dbData: {}, announcements: [] });
      setLoaded(true);
      return;
    }
    const currentUserId = userId as string;

    (async () => {
      try {
        const dbData = await fetchStudentData(currentUserId);
        if (dbData?.student) {
          setData({
            student: {
              first_name: dbData.student.users?.first_name || '',
              last_name: dbData.student.users?.last_name || '',
              student_id: dbData.student.matricule || '',
              assigned_class: dbData.className || '',
              status: dbData.student.status || 'active',
            },
            announcements: dbData.announcements || [],
            dbData,
          });
        } else {
          setData({ student: {}, dbData: dbData || {}, announcements: [] });
        }
      } catch (e) {
        console.error('Erreur chargement élève:', e);
        setData({ student: {}, dbData: {}, announcements: [] });
      } finally {
        setLoaded(true);
      }
    })();
  }, []);

  if (!loaded) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-emerald-200 border-t-emerald-600" />
          <p className="text-sm text-slate-500">Chargement des données de l'élève...</p>
        </div>
      </div>
    );
  }

  if (!data?.student || !data.student.student_id) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16">
        <div className="rounded-3xl border border-amber-200 bg-amber-50 p-8 text-center">
          <AlertCircle size={40} className="mx-auto mb-3 text-amber-600" />
          <h2 className="text-lg font-bold text-amber-900">Profil élève introuvable</h2>
          <p className="mt-2 text-sm text-amber-700">
            Votre compte n'est pas relié à un profil élève dans la base.{' '}
            {!data?.dbData?.classId && 'Vous n\'avez pas encore de classe assignée.'}{' '}
            Contactez l'administration.
          </p>
        </div>
      </div>
    );
  }

  const student = data.student;
  const firstName = student.first_name || 'Élève';

  // ✅ DONNÉES RÉELLES depuis la base (via /api/student/data)
  const homeworks = data.dbData?.homeworks || [];
  const grades = data.dbData?.grades || [];
  const payment = data.dbData?.payment || null;
  const transactions = data.dbData?.transactions || [];

  // Calculer la moyenne réelle
  const avg = computeStudentAverage(grades);

  // Résumé des présences réel
  const attendance = computeAttendanceSummary(data.dbData?.attendance || []);

  // Détails paiement
  const totalAmount = payment?.total_amount || 0;
  const paidAmount = payment?.paid_amount || 0;
  const remaining = Math.max(0, totalAmount - paidAmount);
  const payPercent = totalAmount > 0 ? Math.round((paidAmount / totalAmount) * 100) : 0;

  const studentStats = [
    { label: 'Classe', value: student.assigned_class || 'Non affectée', icon: <GraduationCap size={20} />, color: 'bg-emerald-50 text-emerald-700' },
    { label: 'Identifiant', value: student.student_id || 'En attente', icon: <Users size={20} />, color: 'bg-blue-50 text-blue-700' },
    { label: 'Moyenne', value: avg !== null ? `${avg}/20` : '—', icon: <TrendingUp size={20} />, color: 'bg-purple-50 text-purple-700' },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-8 sm:px-6">
      {/* Welcome */}
      <div className="relative overflow-hidden rounded-3xl border border-emerald-900/10 bg-gradient-to-br from-emerald-800 via-emerald-700 to-teal-600 p-8 text-white shadow-xl shadow-emerald-900/20">
        <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-amber-400/20 blur-2xl" />
        <div className="absolute -bottom-16 -left-8 h-56 w-56 rounded-full bg-teal-300/10 blur-2xl" />
        <div className="relative">
          <h2 className="text-2xl font-bold sm:text-3xl">
            Bienvenue, {firstName} 👋
          </h2>
          <p className="mt-3 max-w-lg text-emerald-100">
            Suivez vos notes, vos devoirs, votre présence et vos annonces scolaires.
          </p>
          <p className="mt-2 text-sm text-emerald-200/70">Matricule : {student.student_id}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        {studentStats.map((stat) => (
          <div key={stat.label} className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
            <div className={`rounded-2xl ${stat.color} p-3`}>
              {stat.icon}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm text-slate-600">{stat.label}</p>
              <p className="truncate text-lg font-bold text-slate-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Devoirs & Notes & Présence */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Devoirs */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-lg font-bold text-slate-900">
              <FileText size={18} className="text-emerald-600" />
              Devoirs
            </h3>
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
              {homeworks.length} devoirs
            </span>
          </div>
          {homeworks.length > 0 ? (
            <div className="space-y-2.5">
              {homeworks.slice(0, 4).map((hw: any) => (
                <div key={hw.id} className="flex items-start justify-between rounded-xl border border-slate-100 bg-slate-50/50 p-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-900">{hw.title}</p>
                    <p className="text-xs text-slate-500">{hw.subject}</p>
                  </div>
                  <span className="ml-2 inline-flex shrink-0 items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
                    <Clock size={10} />
                    {hw.due_date ? new Date(hw.due_date).toLocaleDateString('fr-FR') : '—'}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="py-6 text-center text-sm text-slate-500">Aucun devoir pour le moment.</p>
          )}
        </div>

        {/* Notes */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-lg font-bold text-slate-900">
              <TrendingUp size={18} className="text-blue-600" />
              Notes
            </h3>
            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
              {avg !== null ? `${avg}/20` : '—'}
            </span>
          </div>
          {grades.length > 0 ? (
            <div className="space-y-2.5">
              {grades.slice(0, 5).map((grade: any) => (
                <div key={grade.id} className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/50 p-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{grade.subject}</p>
                    <p className="text-xs capitalize text-slate-500">{grade.grade_type}</p>
                  </div>
                  <span className={`text-lg font-bold ${grade.grade >= 10 ? 'text-emerald-600' : 'text-red-600'}`}>
                    {grade.grade}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="py-6 text-center text-sm text-slate-500">Aucune note pour le moment.</p>
          )}
        </div>

        {/* Présence */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-lg font-bold text-slate-900">
              <Calendar size={18} className="text-amber-600" />
              Présence
            </h3>
            <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
              {attendance.total} appels
            </span>
          </div>
          {/* Bouton Audit (diagnostic) */}
          <button
            onClick={async () => {
              const uid = getAuthUserIdFromCookie();
              if (!uid) return;
              const res = await fetch('/api/student/debug', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: uid }),
              });
              const result = await res.json();
              setDebug(result.debug);
              setShowDebug(!showDebug);
            }}
            className="mb-3 text-left text-xs text-slate-400 hover:text-blue-600 underline"
          >
            🛠️ Audit présence (diagnostic)
          </button>
          {showDebug && debug && (
            <pre className="mb-4 max-h-48 overflow-auto rounded-lg bg-slate-900 p-3 text-[10px] text-green-300">
              {JSON.stringify(debug, null, 2)}
            </pre>
          )}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="rounded-xl bg-emerald-50 p-3 text-center">
              <p className="text-xl font-bold text-emerald-700">{attendance.present}</p>
              <p className="text-xs font-medium text-emerald-800">Présents</p>
            </div>
            <div className="rounded-xl bg-amber-50 p-3 text-center">
              <p className="text-xl font-bold text-amber-700">{attendance.late}</p>
              <p className="text-xs font-medium text-amber-800">Retards</p>
            </div>
            <div className="rounded-xl bg-red-50 p-3 text-center">
              <p className="text-xl font-bold text-red-700">{attendance.absent}</p>
              <p className="text-xs font-medium text-red-800">Absences</p>
            </div>
            <div className="rounded-xl bg-blue-50 p-3 text-center">
              <p className="text-xl font-bold text-blue-700">{attendance.excused}</p>
              <p className="text-xs font-medium text-blue-800">Excusés</p>
            </div>
          </div>
          {(data.dbData?.attendance?.length || 0) === 0 && (
            <p className="mt-3 rounded-lg bg-slate-50 p-2.5 text-center text-xs text-slate-500">
              Aucun appel enregistré pour vous{data.dbData?.classId ? ' dans votre classe' : ''}.<br/>
              L'enseignant doit faire l'appel pour que votre présence apparaisse ici.
            </p>
          )}
          {payment && (
            <div className="mt-3 flex items-center justify-between rounded-xl border border-purple-100 bg-purple-50/50 p-3">
              <span className="flex items-center gap-1.5 text-xs font-semibold text-purple-700">
                <Wallet size={14} />
                Paiement
              </span>
              <span className={`text-xs font-bold ${payment.status === 'paid' ? 'text-emerald-600' : payment.status === 'partial' ? 'text-amber-600' : 'text-red-600'}`}>
                {payment.total_amount > 0 ? `${Math.round((payment.paid_amount / payment.total_amount) * 100)}%` : '—'}
              </span>
            </div>
          )}

          {/* Détail des présences jour par jour */}
          {data.dbData?.attendance?.length > 0 && (
            <div className="mt-4">
              <div className="max-h-64 overflow-y-auto space-y-1.5">
                {data.dbData.attendance.map((rec: any) => (
                  <div key={rec.id} className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50/40 px-3 py-2 text-xs">
                    <span className="font-medium text-slate-700">
                      {rec.date ? new Date(rec.date).toLocaleDateString('fr-FR') : '—'}
                    </span>
                    <span className={`inline-flex rounded-full px-2 py-0.5 font-semibold ${
                      rec.status === 'present' ? 'bg-emerald-100 text-emerald-700'
                      : rec.status === 'late' ? 'bg-amber-100 text-amber-700'
                      : rec.status === 'excused' ? 'bg-blue-100 text-blue-700'
                      : 'bg-red-100 text-red-700'
                    }`}>
                      {rec.status === 'present' ? 'Présent' : rec.status === 'late' ? 'Retard' : rec.status === 'excused' ? 'Excusé' : 'Absent'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Détail des paiements */}
      {payment && (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-lg font-bold text-slate-900">
              <Wallet size={20} className="text-purple-600" />
              Mes Paiements
            </h3>
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
              payment.status === 'paid' ? 'bg-emerald-100 text-emerald-700'
              : payment.status === 'partial' ? 'bg-amber-100 text-amber-700'
              : 'bg-red-100 text-red-700'
            }`}>
              {payment.status === 'paid' ? 'Payé ✓' : payment.status === 'partial' ? 'Partiel' : 'Impayé'}
            </span>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl bg-slate-50 p-4 text-center">
              <p className="text-xs text-slate-500">Montant total</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">{totalAmount} DA</p>
            </div>
            <div className="rounded-xl bg-emerald-50 p-4 text-center">
              <p className="text-xs text-emerald-600">Déjà payé</p>
              <p className="mt-1 text-2xl font-bold text-emerald-700">{paidAmount} DA</p>
            </div>
            <div className="rounded-xl bg-red-50 p-4 text-center">
              <p className="text-xs text-red-500">Reste à payer</p>
              <p className="mt-1 text-2xl font-bold text-red-700">{remaining} DA</p>
            </div>
          </div>

          <div className="mt-4">
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="text-slate-600">Progression des paiements</span>
              <span className="font-bold text-slate-900">{payPercent}%</span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400"
                style={{ width: `${Math.min(100, payPercent)}%` }}
              />
            </div>
          </div>

          {transactions.length > 0 && (
            <div className="mt-6">
              <h4 className="mb-3 text-sm font-semibold text-slate-700">Historique des paiements</h4>
              <div className="space-y-2">
                {transactions.map((tx: any) => (
                  <div key={tx.id} className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/50 p-3 text-sm">
                    <div>
                      <p className="font-medium text-slate-900">+{tx.amount} DA</p>
                      <p className="text-xs capitalize text-slate-500">{tx.method} · {tx.reference || '—'}</p>
                    </div>
                    <span className="text-xs text-slate-500">
                      {tx.date ? new Date(tx.date).toLocaleDateString('fr-FR') : '—'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Announcements */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="mb-6 flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-lg font-bold text-slate-900">
            <Bell size={20} className="text-emerald-600" />
            Annonces
          </h3>
          <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
            {data.announcements.length} annonces
          </span>
        </div>

        {data.announcements.length ? (
          <div className="grid gap-4">
            {data.announcements.map((item: any) => (
              <div
                key={item.id}
                className="flex items-start gap-4 rounded-2xl border border-slate-100 bg-slate-50/50 p-5 transition-all hover:border-emerald-200 hover:bg-white hover:shadow-sm"
              >
                <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
                  <Bell size={18} />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-slate-900">{item.title}</p>
                  <p className="mt-1 text-sm leading-6 text-slate-600">{item.message}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 py-12 text-center">
            <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
              <AlertCircle size={24} className="text-slate-400" />
            </div>
            <p className="font-medium text-slate-700">Aucune annonce pour l'instant</p>
            <p className="mt-1 text-sm text-slate-500">
              Les nouvelles annonces de vos professeurs apparaîtront ici.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}