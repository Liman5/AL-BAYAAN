'use client';

import { useState, useEffect } from 'react';
import Card from '@/components/ui/card';
import AppShell from '@/components/ui/app-shell';
import HomeworkGradesModule from '@/components/teacher/homework-grades-module';
import { ClassSelector } from '@/components/teacher/class-selector';
import AcademicYearSelector from '@/components/ui/academic-year-selector';
import { Home, Users, FileText, BarChart3, Calendar, Plus, Clock, Users2, CheckCircle2, MoreHorizontal, PenSquare, NotebookPen } from 'lucide-react';
import { getCurrentAcademicYear } from '@/lib/schoolData';
import { getAuthUserIdFromCookie } from '@/lib/authClient';
import { fetchTeacherClasses, fetchTeacherHomeworks } from '@/services/db.service';
import { getTeacherRoleLabel } from '@/lib/teacher';

const navItems = [
  { label: 'Accueil', href: '/teacher/dashboard', icon: <Home size={20} /> },
  { label: 'Élèves', href: '/teacher/students', icon: <Users size={20} /> },
  { label: 'Exercices', href: '/teacher/exercises', icon: <FileText size={20} /> },
  { label: 'Notes', href: '/teacher/grades', icon: <BarChart3 size={20} /> },
  { label: 'Plan', href: '/teacher/planning', icon: <Calendar size={20} /> }
];

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
}

function getRemiseColor(submitted: number, total: number) {
  const ratio = total > 0 ? submitted / total : 0;
  if (ratio >= 0.8) return { bar: 'bg-gradient-to-r from-emerald-500 to-teal-400', text: 'text-emerald-600' };
  if (ratio >= 0.5) return { bar: 'bg-gradient-to-r from-amber-400 to-orange-400', text: 'text-amber-600' };
  return { bar: 'bg-gradient-to-r from-red-400 to-rose-400', text: 'text-red-500' };
}

export default function ExercisesPage() {
  // Données réelles Supabase UNIQUEMENT
  const [dbData, setDbData] = useState<{
    teacher: any;
    classes: any[];
    students: any[];
    notifications?: Array<{ id: number; message: string; time: string }>;
    submissions?: any[];
  } | null>(null);
  const [dbHomeworks, setDbHomeworks] = useState<any[]>([]);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const academicYear = getCurrentAcademicYear();
  const userId = typeof window !== 'undefined' ? getAuthUserIdFromCookie() : null;

  const teacherName = dbData?.teacher?.users
    ? `${dbData.teacher.users.first_name || ''} ${dbData.teacher.users.last_name || ''}`.trim()
    : '';
  const teacherId = dbData?.teacher?.id || userId || '';
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
          const homeworks = await fetchTeacherHomeworks(result.teacher.id);
          setDbHomeworks(homeworks || []);
        }
      } catch (e) {
        console.error('Erreur chargement exercices:', e);
      } finally {
        setIsLoading(false);
      }
    }
    loadFromDb();
  }, []);

  const dbStudents = dbData?.students ?? [];
  const dbClasses = dbData?.classes ?? [];

  // Filtrer par classe
  const filteredHomeworks = selectedClassId
    ? dbHomeworks.filter((hw: any) => hw.class_id === selectedClassId)
    : dbHomeworks;

  const filteredStudents = selectedClassId
    ? dbStudents.filter((s: any) => s.classId === selectedClassId)
    : dbStudents;

  // Contexte Supabase pour le module devoirs/notes
  const dbTeacherId = dbData?.teacher?.id || undefined;
  const dbAcademicYearId = academicYear ? `ay-${academicYear}` : undefined;

  // Élèves réels pour le module devoirs/notes
  const studentsForModule = filteredStudents.map((s: any) => ({
    id: s.id,
    name: `${s.users?.first_name || ''} ${s.users?.last_name || ''}`.trim() || s.matricule,
    matricule: s.matricule || '',
  }));

  // Classe active
  const activeClass = dbClasses.length > 0
    ? (selectedClassId
        ? dbClasses.find((c: any) => c.id === selectedClassId) || dbClasses[0]
        : dbClasses[0])
    : null;

  // Matières de l'enseignant depuis son profil
  const dbSubjects = Array.isArray(dbData?.teacher?.subjects) && dbData.teacher.subjects.length > 0
    ? dbData.teacher.subjects
    : ['Mathématiques', 'Physique', 'Chimie', 'Français', 'Anglais'];

  // Exercices réels depuis Supabase
  const dbSubmissions = dbData?.submissions ?? [];
  const displayExercises = filteredHomeworks.map((hw: any) => {
    const total = filteredStudents.length || dbStudents.length || 0;
    return {
      id: hw.id,
      title: hw.title,
      class: hw.classes?.name || 'Classe',
      dueDate: hw.due_date,
      submitted: dbSubmissions.filter(
        (submission: any) => submission.homework_id === hw.id && submission.status !== 'returned'
      ).length,
      total,
      classId: hw.class_id,
    };
  });

  // Statistiques dynamiques
  const totalAllStudents = dbStudents.length;
  const stats = [
    { label: 'Exercices actifs', value: displayExercises.length, icon: <FileText size={18} />, color: 'bg-emerald-50 text-emerald-700' },
    { label: 'Classes', value: dbClasses.length, icon: <Users2 size={18} />, color: 'bg-blue-50 text-blue-700' },
    { label: 'Élèves', value: totalAllStudents, icon: <CheckCircle2 size={18} />, color: 'bg-amber-50 text-amber-700' },
  ];

  return (
    <AppShell
      navItems={navItems}
      title="Espace Enseignant"
      subtitle="AL-BAYAAN"
      userName={teacherName}
      userRole={teacherRoleLabel}
      notifications={dbData?.notifications || []}
      headerTitle="Mes Exercices"
      variant="topbar"
    >
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Mes Exercices</h2>
            <p className="mt-2 text-slate-600">
              {dbClasses.length > 0
                ? `${dbClasses.length} classe(s) — ${displayExercises.length} exercice(s)`
                : isLoading ? 'Chargement...' : 'Aucune classe assignée'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {dbClasses.length > 1 && (
              <ClassSelector
                classes={dbClasses.map((c: any) => ({
                  id: c.id,
                  name: c.name,
                  students: dbStudents.filter((s: any) => s.classId === c.id).length,
                }))}
                selectedClassId={selectedClassId}
                onSelectClass={setSelectedClassId}
                label="Filtrer"
              />
            )}
            <button
              disabled={!activeClass}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-700 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-600/20 transition-all hover:shadow-xl hover:shadow-emerald-600/30 hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-lg"
            >
              <Plus size={18} />
              Nouvel Exercice
            </button>
            <AcademicYearSelector />
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-3">
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

        {/* Module Devoirs & Notes interconnecté */}
        {activeClass ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="mb-6 flex items-center gap-2 text-lg font-bold text-slate-900">
              <NotebookPen size={18} className="text-emerald-600" />
              Créer des devoirs et attribuer des notes — {activeClass.name} — {academicYear}
            </h3>
            <HomeworkGradesModule
              classId={activeClass.id}
              className={activeClass.name}
              teacherId={teacherId}
              teacherName={teacherName}
              subjects={dbSubjects}
              students={studentsForModule}
              dbTeacherId={dbTeacherId}
              dbAcademicYearId={dbAcademicYearId}
            />
          </div>
        ) : (
          <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
            <p className="text-slate-500 font-medium">
              {isLoading ? 'Chargement des classes...' : 'Aucune classe assignée. Contactez l\'administration.'}
            </p>
          </div>
        )}

        {/* Exercises grid */}
        {displayExercises.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {displayExercises.map((exercise: any) => {
              const remiseColors = getRemiseColor(exercise.submitted || 0, exercise.total || 0);
              const progress = exercise.total > 0 ? Math.round((exercise.submitted / exercise.total) * 100) : 0;

              return (
                <Card
                  key={exercise.id}
                  className="group relative flex flex-col gap-5 overflow-hidden border-slate-200 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-emerald-200"
                >
                  {/* Top accent line */}
                  <div className={`absolute inset-x-0 top-0 h-1 ${remiseColors.bar}`} />

                  {/* Actions */}
                  <div className="absolute right-4 top-4 flex gap-1.5 opacity-0 transition-opacity group-hover:opacity-100">
                    <button className="rounded-lg bg-slate-100 p-2 text-slate-600 transition-colors hover:bg-slate-200" title="Modifier">
                      <PenSquare size={16} />
                    </button>
                    <button className="rounded-lg bg-slate-100 p-2 text-slate-600 transition-colors hover:bg-slate-200" title="Plus">
                      <MoreHorizontal size={16} />
                    </button>
                  </div>

                  {/* Title */}
                  <div className="pt-2">
                    <div className="mb-3 flex items-center gap-2">
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                        {exercise.class}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 leading-snug">{exercise.title}</h3>
                  </div>

                  {/* Meta info */}
                  <div className="flex flex-wrap gap-4 text-sm text-slate-500">
                    <span className="flex items-center gap-1.5">
                      <Clock size={14} className="text-slate-400" />
                      {formatDate(exercise.dueDate)}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Users2 size={14} className="text-slate-400" />
                      {exercise.total} élèves
                    </span>
                  </div>

                  {/* Progress */}
                  <div>
                    <div className="mb-2 flex items-center justify-between text-sm">
                      <span className="text-slate-600">Remis</span>
                      <span className={`font-semibold ${remiseColors.text}`}>
                        {exercise.submitted}/{exercise.total} ({progress}%)
                      </span>
                    </div>
                    <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className={`h-full rounded-full ${remiseColors.bar} transition-all duration-500`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Footer action */}
                  <button className="mt-auto flex items-center justify-center gap-2 rounded-2xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition-all hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700">
                    <PenSquare size={16} className="text-slate-400 group-hover:text-emerald-600" />
                    Modifier
                  </button>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-100">
              <FileText size={32} className="text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900">
              {isLoading ? 'Chargement des exercices...' : 'Aucun exercice trouvé'}
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              {selectedClassId
                ? 'Cette classe ne contient pas encore d\'exercices.'
                : 'Créez votre premier exercice pour vos élèves.'}
            </p>
          </div>
        )}
      </div>
    </AppShell>
  );
}