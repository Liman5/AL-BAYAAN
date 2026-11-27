'use client';

import { useState, useEffect } from 'react';
import Card from '@/components/ui/card';
import AppShell from '@/components/ui/app-shell';
import { ClassSelector } from '@/components/teacher/class-selector';
import { Home, Users, FileText, BarChart3, Calendar, Download, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { getAuthUserIdFromCookie } from '@/lib/authClient';
import { fetchTeacherClasses, fetchTeacherGrades, fetchTeacherHomeworks } from '@/services/db.service';
import { getTeacherRoleLabel } from '@/lib/teacher';

const navItems = [
  { label: 'Accueil', href: '/teacher/dashboard', icon: <Home size={20} /> },
  { label: 'Élèves', href: '/teacher/students', icon: <Users size={20} /> },
  { label: 'Exercices', href: '/teacher/exercises', icon: <FileText size={20} /> },
  { label: 'Notes', href: '/teacher/grades', icon: <BarChart3 size={20} /> },
  { label: 'Plan', href: '/teacher/planning', icon: <Calendar size={20} /> }
];

function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
}

function formatGrade(g: number | null | undefined) {
  if (g === null || g === undefined) return '—';
  return `${g}/20`;
}

function getGradeBadgeClass(g: number | null | undefined) {
  if (g === null || g === undefined) return 'bg-slate-100 text-slate-600';
  if (g >= 15) return 'bg-emerald-100 text-emerald-800';
  if (g >= 13) return 'bg-blue-100 text-blue-800';
  if (g >= 10) return 'bg-amber-100 text-amber-800';
  return 'bg-red-100 text-red-800';
}

export default function GradesPage() {
  // Données réelles Supabase UNIQUEMENT
  const [dbData, setDbData] = useState<{
    teacher: any;
    classes: any[];
    students: any[];
    notifications?: Array<{ id: number; message: string; time: string }>;
  } | null>(null);
  const [dbGrades, setDbGrades] = useState<any[]>([]);
  const [dbHomeworks, setDbHomeworks] = useState<any[]>([]);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const userId = typeof window !== 'undefined' ? getAuthUserIdFromCookie() : null;

  const teacherName = dbData?.teacher?.users
    ? `${dbData.teacher.users.first_name || ''} ${dbData.teacher.users.last_name || ''}`.trim()
    : '';
  const teacherRoleLabel = getTeacherRoleLabel(dbData?.teacher?.gender);

  useEffect(() => {
    async function loadFromDb() {
      const uid = getAuthUserIdFromCookie();
      if (!uid) {
        setIsLoading(false);
        return;
      }

      try {
        const result = await fetchTeacherClasses(null, uid);
        if (result.teacher) {
          setDbData(result);
          const [grades, homeworks] = await Promise.all([
            fetchTeacherGrades(result.teacher.id),
            fetchTeacherHomeworks(result.teacher.id),
          ]);
          setDbGrades(grades || []);
          setDbHomeworks(homeworks || []);
        }
      } catch (e) {
        console.error('Erreur chargement notes:', e);
      } finally {
        setIsLoading(false);
      }
    }
    loadFromDb();
  }, []);

  const dbClasses = dbData?.classes ?? [];
  const allDbStudents = dbData?.students ?? [];

  // Filtrer par classe
  const filteredStudents = selectedClassId
    ? allDbStudents.filter((s: any) => s.classId === selectedClassId)
    : allDbStudents;
  const filteredGrades = selectedClassId
    ? dbGrades.filter((g: any) => g.class_id === selectedClassId)
    : dbGrades;
  const filteredHomeworks = selectedClassId
    ? dbHomeworks.filter((hw: any) => hw.class_id === selectedClassId)
    : dbHomeworks;

  // Calculer les moyennes par élève
  const studentGradesMap = new Map<string, any[]>();
  filteredGrades.forEach((g: any) => {
    if (!studentGradesMap.has(g.student_id)) {
      studentGradesMap.set(g.student_id, []);
    }
    studentGradesMap.get(g.student_id)!.push(g);
  });

  const computeAvg = (grades: any[]) => {
    if (!grades || grades.length === 0) return null;
    const totalW = grades.reduce((acc: number, g: any) => acc + (g.grade || 0) * (g.coefficient || 1), 0);
    const totalC = grades.reduce((acc: number, g: any) => acc + (g.coefficient || 1), 0);
    return totalC > 0 ? Math.round((totalW / totalC) * 10) / 10 : null;
  };

  // Statistiques globales
  const allAverages = filteredStudents.map((s: any) => computeAvg(studentGradesMap.get(s.id) || []));
  const nonNullAverages = allAverages.filter((a: number | null): a is number => a !== null);
  const classAvg = nonNullAverages.length > 0
    ? Math.round((nonNullAverages.reduce((acc: number, a: number) => acc + a, 0) / nonNullAverages.length) * 10) / 10
    : null;

  const totalGrades = filteredGrades.length;
  const trend = classAvg !== null && classAvg >= 13 ? 'up' : classAvg !== null ? 'down' : 'flat';

  const stats = [
    { label: 'Élèves', value: filteredStudents.length, icon: <Users size={20} />, color: 'bg-emerald-50 text-emerald-700' },
    { label: 'Notes saisies', value: totalGrades, icon: <BarChart3 size={20} />, color: 'bg-blue-50 text-blue-700' },
    { label: 'Moyenne classe', value: classAvg !== null ? `${classAvg}/20` : '—', icon: trend === 'up' ? <TrendingUp size={20} /> : trend === 'down' ? <TrendingDown size={20} /> : <Minus size={20} />, color: 'bg-amber-50 text-amber-700' },
    { label: 'Devoirs', value: filteredHomeworks.length, icon: <FileText size={20} />, color: 'bg-purple-50 text-purple-700' },
  ];

  return (
    <AppShell
      navItems={navItems}
      title="Espace Enseignant"
      subtitle="AL-BAYAAN"
      userName={teacherName}
      userRole={teacherRoleLabel}
      notifications={dbData?.notifications || []}
      headerTitle="Notes et Évaluations"
      variant="topbar"
    >
      <div className="space-y-6">
        {/* Header actions */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Gestion des Notes</h2>
            <p className="mt-2 text-slate-600">
              {dbClasses.length > 0
                ? `${dbClasses.length} classe(s) — ${filteredStudents.length} élève(s) — ${totalGrades} note(s)`
                : isLoading ? 'Chargement...' : 'Aucune classe assignée'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {dbClasses.length > 1 && (
              <ClassSelector
                classes={dbClasses.map((c: any) => ({
                  id: c.id,
                  name: c.name,
                  students: allDbStudents.filter((s: any) => s.classId === c.id).length,
                }))}
                selectedClassId={selectedClassId}
                onSelectClass={setSelectedClassId}
                label="Classe"
              />
            )}
            <button className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-700 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-600/20 transition-all hover:shadow-xl hover:shadow-emerald-600/30 hover:-translate-y-0.5">
              <Download size={18} />
              Exporter
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:shadow-md">
              <div className={`rounded-2xl ${stat.color} p-3`}>
                {stat.icon}
              </div>
              <div>
                <p className="text-sm text-slate-600">{stat.label}</p>
                <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Tableau des notes par élève */}
        <Card className="overflow-hidden border-slate-200 p-0 shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Élève</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Matricule</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Classe</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Notes</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Moyenne</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 bg-white">
                {filteredStudents.map((s: any) => {
                  const grades = studentGradesMap.get(s.id) || [];
                  const avg = computeAvg(grades);
                  const name = `${s.users?.first_name || ''} ${s.users?.last_name || ''}`.trim() || s.matricule || 'Inconnu';
                  return (
                    <tr key={s.id} className="group transition-colors hover:bg-emerald-50/40">
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-xs font-bold text-white shadow-sm">
                            {getInitials(name)}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900">{name}</p>
                          </div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-mono text-slate-600">
                        {s.matricule || '-'}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-600">
                        {s.className || '-'}
                      </td>
                      <td className="px-6 py-4">
                        {grades.length > 0 ? (
                          <div className="flex flex-wrap gap-1.5">
                            {grades.slice(0, 5).map((g: any, i: number) => (
                              <span key={i} className={`inline-flex rounded-md px-2 py-0.5 text-xs font-semibold ${getGradeBadgeClass(g.grade)}`}>
                                {g.grade}/20
                              </span>
                            ))}
                            {grades.length > 5 && (
                              <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">
                                +{grades.length - 5}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400">Aucune note</span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm">
                        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${getGradeBadgeClass(avg)}`}>
                          {formatGrade(avg)}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredStudents.length === 0 && !isLoading && (
            <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-100">
                <Users size={32} className="text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">Aucun élève trouvé</h3>
              <p className="mt-1 text-sm text-slate-500">
                {selectedClassId
                  ? 'Cette classe ne contient pas encore d\'élèves.'
                  : 'Aucun élève assigné à vos classes.'}
              </p>
            </div>
          )}

          {isLoading && (
            <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-100">
                <BarChart3 size={32} className="text-slate-400 animate-pulse" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">Chargement des notes...</h3>
            </div>
          )}
        </Card>

        {/* Détail des notes récentes */}
        {filteredGrades.length > 0 && (
          <Card className="border-slate-200 p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-bold text-slate-900">Notes récentes</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-100">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Élève</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Matière</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Note</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Type</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Coefficient</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 bg-white">
                  {filteredGrades.slice(0, 15).map((g: any) => {
                    const studentName = g.students?.users
                      ? `${g.students.users.first_name || ''} ${g.students.users.last_name || ''}`.trim()
                      : g.students?.matricule || 'Élève';
                    return (
                      <tr key={g.id} className="hover:bg-slate-50/70">
                        <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-slate-900">{studentName}</td>
                        <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-600">{g.subject || '-'}</td>
                        <td className="whitespace-nowrap px-4 py-3 text-sm">
                          <span className={`inline-flex rounded-md px-2 py-0.5 text-xs font-bold ${getGradeBadgeClass(g.grade)}`}>
                            {g.grade}/20
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-600">{g.grade_type || '-'}</td>
                        <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-600">
                          {g.grade_date ? new Date(g.grade_date).toLocaleDateString('fr-FR') : '-'}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-600">{g.coefficient || 1}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>
    </AppShell>
  );
}