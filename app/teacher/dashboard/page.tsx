'use client';

import Card from '@/components/ui/card';
import AppShell from '@/components/ui/app-shell';
import AcademicYearSelector from '@/components/ui/academic-year-selector';
import { ClassSelector } from '@/components/teacher/class-selector';
import { Home, Users, FileText, BarChart3, Calendar, Plus, CheckCircle2, TrendingUp, BookOpen } from 'lucide-react';
import { getAuthUserIdFromCookie } from '@/lib/authClient';
import { fetchTeacherDashboardSummary, computeStudentAverage, computeAttendanceSummary } from '@/services/db.service';
import { getTeacherRoleLabel } from '@/lib/teacher';
import { useEffect, useState } from 'react';

const navItems = [
  { label: 'Accueil', href: '/teacher/dashboard', icon: <Home size={20} /> },
  { label: 'Élèves', href: '/teacher/students', icon: <Users size={20} /> },
  { label: 'Exercices', href: '/teacher/exercises', icon: <FileText size={20} /> },
  { label: 'Notes', href: '/teacher/grades', icon: <BarChart3 size={20} /> },
  { label: 'Plan', href: '/teacher/planning', icon: <Calendar size={20} /> }
];

export default function TeacherDashboardPage() {
  // Données réelles Supabase UNIQUEMENT
  const [dbData, setDbData] = useState<any>(null);
  const [loadedFromDb, setLoadedFromDb] = useState(false);
  const [selectedClassId, setSelectedClassId] = useState('');

  useEffect(() => {
    async function loadFromDb() {
      const userId = getAuthUserIdFromCookie();
      if (!userId) return;

      try {
        const result = await fetchTeacherDashboardSummary(userId);
        if (result) {
          setDbData(result);
          setLoadedFromDb(true);
        }
      } catch (e) {
        console.error('Erreur chargement tableau de bord:', e);
      }
    }
    loadFromDb();
  }, []);

  // ---------- Données AFFICHÉES = données réelles de la DB ----------
  const dbClasses = dbData?.classes ?? [];
  const dbAssignments = dbData?.assignments ?? [];

  // Filtrer par classe sélectionnée si une classe est choisie
  const dbStudents = (dbData?.students ?? []).filter(
    (s: any) => !selectedClassId || s.classId === selectedClassId
  );
  const dbHomeworks = (dbData?.homeworks ?? []).filter(
    (hw: any) => !selectedClassId || hw.class_id === selectedClassId
  );
  const dbGrades = (dbData?.grades ?? []).filter(
    (g: any) => !selectedClassId || g.class_id === selectedClassId
  );
  const dbAttendance = (dbData?.attendance ?? []).filter(
    (a: any) => !selectedClassId || a.class_id === selectedClassId
  );

  // Classes réelles (id persistent du DB)
  const displayClasses = dbClasses.map((c: any) => ({
    id: c.id,                     // ← le vrai id DB
    name: c.name,
    subject: dbAssignments.find((a: any) => a.class_id === c.id)?.subject || 'Titulaire',
    students: (dbData?.students ?? []).filter((s: any) => s.classId === c.id).length,
    nextClass: '',
  }));

  // Nom enseignant réel
  const displayName = loadedFromDb && dbData?.teacher
    ? `${dbData.teacher.users?.first_name || ''} ${dbData.teacher.users?.last_name || ''}`.trim()
    : '';
  const teacherRoleLabel = getTeacherRoleLabel(dbData?.teacher?.gender);

  // Moyenne générale réelle
  const allAverages = dbStudents.map((s: any) => {
    const grades = dbGrades.filter((g: any) => g.student_id === s.id);
    return computeStudentAverage(grades);
  }).filter((a: number | null): a is number => a !== null);
  const avgGrade = allAverages.length > 0
    ? Math.round((allAverages.reduce((acc: number, a: number) => acc + a, 0) / allAverages.length) * 10) / 10
    : null;

  // Taux de présence réel
  const attendanceSummary = computeAttendanceSummary(dbAttendance);
  const attendanceRate = attendanceSummary.total > 0
    ? Math.round((attendanceSummary.present / attendanceSummary.total) * 100)
    : null;

  // Stats réelles (0 si aucune donnée)
  const displayStats = [
    { label: 'Total Élèves', value: dbStudents.length, icon: <Users size={24} />, gradient: 'from-emerald-500 to-teal-600', bg: 'bg-emerald-50' },
    { label: 'Classes', value: dbClasses.length, icon: <Calendar size={24} />, gradient: 'from-amber-400 to-orange-500', bg: 'bg-amber-50' },
    { label: 'Moyenne générale', value: avgGrade !== null ? `${avgGrade}/20` : '—', icon: <TrendingUp size={24} />, gradient: 'from-blue-500 to-indigo-600', bg: 'bg-blue-50' },
    { label: 'Taux de présence', value: attendanceRate !== null ? `${attendanceRate}%` : '—', icon: <CheckCircle2 size={24} />, gradient: 'from-purple-500 to-fuchsia-600', bg: 'bg-purple-50' },
  ];

  // Activité récente des élèves (vraies données)
  const recentStudents = dbStudents.slice(0, 4).map((s: any) => {
    const grades = dbGrades.filter((g: any) => g.student_id === s.id);
    const avg = computeStudentAverage(grades);
    return {
      name: `${s.users?.first_name || ''} ${s.users?.last_name || ''}`.trim() || s.matricule || 'Inconnu',
      class: s.className || '',
      lastGrade: avg ?? 0,
      status: avg === null ? 'Pas de note' : avg >= 15 ? 'Excellent' : avg >= 13 ? 'Bien' : avg >= 10 ? 'Passable' : 'À améliorer',
    };
  });

  // Tâches = devoirs réels à venir
  const upcomingTasks = dbHomeworks.slice(0, 4).map((hw: any) => ({
    title: hw.title || 'Devoir',
    class: hw.classes?.name || '',
    dueDate: hw.due_date ? new Date(hw.due_date).toLocaleDateString('fr-FR') : '',
    priority: hw.due_date && new Date(hw.due_date) < new Date() ? 'Haute' : 'Moyenne',
  }));

  // Performance par matière (réelle)
  const subjectList = dbAssignments
    .map((a: any) => a.subject)
    .filter((v: string, i: number, arr: string[]) => arr.indexOf(v) === i)
    .slice(0, 3)
    .map((subject: string) => {
      const classIds = dbAssignments.filter((a: any) => a.subject === subject).map((a: any) => a.class_id);
      const subjectGrades = dbGrades.filter((g: any) => classIds.includes(g.class_id) && g.subject === subject);
      const subjectAverages = dbStudents
        .map((s: any) => computeStudentAverage(subjectGrades.filter((g: any) => g.student_id === s.id)))
        .filter((a: number | null): a is number => a !== null);
      const subjectAvg = subjectAverages.length > 0
        ? Math.round((subjectAverages.reduce((acc: number, a: number) => acc + a, 0) / subjectAverages.length) * 10) / 10
        : null;
      return {
        name: subject,
        students: classIds.reduce((acc: number, cid: string) => acc + (dbData?.students ?? []).filter((s: any) => s.classId === cid).length, 0),
        average: subjectAvg ?? 0,
        trend: '',
      };
    });

  return (
    <AppShell
      navItems={navItems}
      title="Espace Enseignant"
      subtitle="AL-BAYAAN"
      userName={displayName || 'Enseignant'}
      userRole={teacherRoleLabel}
      notifications={dbData?.notifications || []}
      headerTitle="Tableau de Bord"
      variant="topbar"
    >
      <div className="space-y-8">
        {/* Header avec sélecteur année scolaire + sélecteur classe */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
              Bienvenue, <span className="bg-gradient-to-r from-emerald-700 to-emerald-500 bg-clip-text text-transparent">{displayName || 'Enseignant'}</span>
            </h2>
            <p className="mt-2 text-slate-600">
              {dbClasses.length > 0
                ? `${dbClasses.length} classe(s) — ${dbStudents.length} élève(s)`
                : loadedFromDb ? 'Aucune classe assignée pour le moment' : 'Chargement...'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {loadedFromDb && dbClasses.length > 1 && (
              <ClassSelector
                classes={dbClasses.map((c: any) => ({
                  id: c.id,
                  name: c.name,
                  subject: dbAssignments.find((a: any) => a.class_id === c.id)?.subject,
                  students: (dbData?.students ?? []).filter((s: any) => s.classId === c.id).length,
                }))}
                selectedClassId={selectedClassId}
                onSelectClass={setSelectedClassId}
                label="Filtrer"
              />
            )}
            <AcademicYearSelector compact />
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
          {displayStats.map((stat) => (
            <div
              key={stat.label}
              className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
            >
              <div className={`absolute right-0 top-0 h-24 w-24 translate-x-8 -translate-y-8 rounded-full bg-gradient-to-br ${stat.gradient} opacity-10 transition-transform duration-500 group-hover:scale-150`} />
              <div className="relative flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">{stat.label}</p>
                  <p className="mt-2 text-3xl font-bold text-slate-900">{stat.value}</p>
                </div>
                <div className={`rounded-2xl ${stat.bg} p-3 text-slate-700 shadow-sm`}>
                  {stat.icon}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Main content 2 columns */}
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Left column - 2/3 */}
          <div className="space-y-8 lg:col-span-2">
            {/* Classes réelles */}
            <Card className="border-slate-200 shadow-sm">
              <div className="mb-5 flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900">Mes Classes</h3>
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                  {displayClasses.length} classes actives
                </span>
              </div>
              {displayClasses.length > 0 ? (
                <div className="space-y-3">
                  {displayClasses.map((classe: any) => (
                    <div
                      key={classe.id}
                      className="group flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50/50 p-4 transition-all duration-300 hover:border-emerald-200 hover:bg-white hover:shadow-md cursor-pointer"
                    >
                      <div className="flex flex-1 items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-50 text-emerald-700 font-bold">
                          {classe.name.split(' ')[0]}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-slate-900">{classe.name}</h4>
                          <p className="text-sm text-slate-600">{classe.subject}</p>
                        </div>
                      </div>
                      <div className="hidden sm:block text-center px-4">
                        <p className="text-2xl font-bold text-emerald-700">{classe.students}</p>
                        <p className="text-xs text-slate-500">élèves</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-slate-500">Prochain cours</p>
                        <p className="text-sm font-medium text-slate-900">À planifier</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <BookOpen className="mx-auto text-slate-300 mb-3" size={40} />
                  <p className="text-slate-500 font-medium">Aucune classe assignée</p>
                  <p className="text-sm text-slate-400 mt-1">Contactez l'administration pour vous assigner des classes.</p>
                </div>
              )}
            </Card>

            {/* Recent students */}
            <Card className="border-slate-200 shadow-sm">
              <div className="mb-5 flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900">Activité récente des élèves</h3>
                <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                  {recentStudents.length} élèves
                </span>
              </div>
              {recentStudents.length > 0 ? (
                <div className="overflow-x-auto -mx-2">
                  <table className="min-w-full divide-y divide-slate-100">
                    <thead>
                      <tr className="bg-slate-50">
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 rounded-l-xl">Nom</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Classe</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Dernière note</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 rounded-r-xl">Statut</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 bg-white">
                      {recentStudents.map((student: any, index: number) => (
                        <tr key={index} className="transition-colors hover:bg-slate-50/70">
                          <td className="whitespace-nowrap px-4 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-slate-500 to-slate-700 text-xs font-bold text-white">
                                {student.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
                              </div>
                              <span className="text-sm font-semibold text-slate-900">{student.name}</span>
                            </div>
                          </td>
                          <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-600">{student.class}</td>
                          <td className="whitespace-nowrap px-4 py-4 text-sm">
                            <span className="font-bold text-emerald-700">{student.lastGrade}/20</span>
                          </td>
                          <td className="whitespace-nowrap px-4 py-4">
                            <span
                              className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                                student.status === 'Excellent' ? 'bg-emerald-100 text-emerald-800'
                                : student.status === 'Bien' ? 'bg-blue-100 text-blue-800'
                                : student.status === 'Passable' ? 'bg-amber-100 text-amber-800'
                                : student.status === 'À améliorer' ? 'bg-red-100 text-red-800'
                                : 'bg-slate-100 text-slate-600'
                              }`}
                            >
                              {student.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-center py-8 text-slate-400 text-sm">Aucun élève dans vos classes.</p>
              )}
            </Card>

            {/* Subject performance */}
            <Card className="border-slate-200 shadow-sm">
              <div className="mb-5 flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900">Performance par matière</h3>
              </div>
              {subjectList.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-3">
                  {subjectList.map((subject: any) => (
                    <div key={subject.name} className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4 transition-all hover:border-emerald-200 hover:bg-white hover:shadow-md">
                      <p className="text-sm font-semibold text-slate-900">{subject.name}</p>
                      <div className="mt-3 flex items-end justify-between">
                        <div>
                          <p className="text-2xl font-bold text-slate-900">{subject.average}<span className="text-sm text-slate-500">/20</span></p>
                          <p className="mt-1 text-xs text-slate-500">{subject.students} élèves</p>
                        </div>
                        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                          {subject.average > 0 ? 'En ligne' : 'Pas de note'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center py-8 text-slate-400 text-sm">Aucune matière assignée pour le moment.</p>
              )}
            </Card>
          </div>

          {/* Right column - 1/3 */}
          <div className="space-y-8">
            {/* Tasks */}
            <Card className="border-slate-200 shadow-sm">
              <div className="mb-5 flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900">Devoirs à venir</h3>
                <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-600">
                  {upcomingTasks.length} devoir(s)
                </span>
              </div>
              {upcomingTasks.length > 0 ? (
                <div className="space-y-3">
                  {upcomingTasks.map((task: any, index: number) => (
                    <div key={index} className="flex items-start justify-between rounded-2xl border border-slate-100 p-3.5 transition-all hover:border-amber-200 hover:bg-amber-50/30 hover:shadow-sm">
                      <div className="flex flex-1 items-start gap-3">
                        <div className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${task.priority === 'Haute' ? 'bg-red-500' : 'bg-amber-500'}`} />
                        <div className="flex-1">
                          <h4 className="font-medium text-slate-900">{task.title}</h4>
                          <p className="mt-1 text-sm text-slate-500">{task.class} — {task.dueDate || 'Sans date'}</p>
                        </div>
                      </div>
                      <span className={`ml-2 inline-flex rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap ${task.priority === 'Haute' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                        {task.priority}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center py-8 text-slate-400 text-sm">Aucun devoir à venir.</p>
              )}
            </Card>

            {/* Quick actions */}
            <Card className="border-slate-200 shadow-sm">
              <h3 className="mb-5 text-lg font-bold text-slate-900">Actions rapides</h3>
              <div className="space-y-2.5">
                <a href="/teacher/exercises" className="group flex w-full items-center gap-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-700 px-4 py-3 text-left font-medium text-white shadow-md shadow-emerald-600/20 transition-all hover:shadow-lg hover:shadow-emerald-600/30 hover:-translate-y-0.5">
                  <FileText size={18} className="transition-transform group-hover:scale-110" />
                  Créer un nouveau devoir
                </a>
                <a href="/teacher/students" className="group flex w-full items-center gap-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-3 text-left font-medium text-white shadow-md shadow-amber-500/20 transition-all hover:shadow-lg hover:shadow-amber-500/30 hover:-translate-y-0.5">
                  <CheckCircle2 size={18} className="transition-transform group-hover:scale-110" />
                  Prendre les présences
                </a>
                <a href="/teacher/grades" className="group flex w-full items-center gap-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3 text-left font-medium text-white shadow-md shadow-blue-600/20 transition-all hover:shadow-lg hover:shadow-blue-600/30 hover:-translate-y-0.5">
                  <BarChart3 size={18} className="transition-transform group-hover:scale-110" />
                  Saisir des notes
                </a>
              </div>
            </Card>

            {/* Class average mini chart */}
            <Card className="border-slate-200 shadow-sm">
              <h3 className="mb-5 text-lg font-bold text-slate-900">Moyennes par classe</h3>
              {displayClasses.length > 0 ? (
                <div className="space-y-4">
                  {displayClasses.map((classe: any) => {
                    const classStudents = (dbData?.students ?? []).filter((s: any) => s.classId === classe.id);
                    const classAverages = classStudents
                      .map((s: any) => computeStudentAverage(dbGrades.filter((g: any) => g.student_id === s.id)))
                      .filter((a: number | null): a is number => a !== null);
                    const classAvg = classAverages.length > 0
                      ? Math.round((classAverages.reduce((acc: number, a: number) => acc + a, 0) / classAverages.length) * 10) / 10
                      : null;
                    const rounded = classAvg ?? 0;
                    const pct = Math.min(100, Math.max(5, rounded * 5));
                    return (
                      <div key={classe.id}>
                        <div className="mb-1.5 flex items-center justify-between text-sm">
                          <span className="font-medium text-slate-700">{classe.name}</span>
                          <span className="font-semibold text-emerald-700">{classAvg !== null ? `${rounded}/20` : '—'}</span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                          <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-center py-8 text-slate-400 text-sm">Aucune classe pour le moment.</p>
              )}
            </Card>
          </div>
        </div>
      </div>
    </AppShell>
  );
}