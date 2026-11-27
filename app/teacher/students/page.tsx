'use client';

import { useState, useEffect } from 'react';
import Card from '@/components/ui/card';
import AppShell from '@/components/ui/app-shell';
import AttendanceModule from '@/components/teacher/attendance-module';
import { ClassSelector } from '@/components/teacher/class-selector';
import AcademicYearSelector from '@/components/ui/academic-year-selector';
import { Home, Users, FileText, BarChart3, Calendar, Search, Mail, Filter, GraduationCap, UserCheck, ClipboardCheck, Phone } from 'lucide-react';
import { getCurrentAcademicYear } from '@/lib/schoolData';
import { getAuthUserIdFromCookie } from '@/lib/authClient';
import { fetchTeacherClasses } from '@/services/db.service';
import { getTeacherRoleLabel } from '@/lib/teacher';

const navItems = [
  { label: 'Accueil', href: '/teacher/dashboard', icon: <Home size={20} /> },
  { label: 'Élèves', href: '/teacher/students', icon: <Users size={20} /> },
  { label: 'Exercices', href: '/teacher/exercises', icon: <FileText size={20} /> },
  { label: 'Notes', href: '/teacher/grades', icon: <BarChart3 size={20} /> },
  { label: 'Plan', href: '/teacher/planning', icon: <Calendar size={20} /> }
];

const initialStudentsData: any[] = [];

function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
}

export default function StudentsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAttendance, setShowAttendance] = useState(false);
  const [selectedClassId, setSelectedClassId] = useState('');

  // Données réelles Supabase UNIQUEMENT
  const [dbData, setDbData] = useState<{
    teacher: any;
    classes: any[];
    students: any[];
    notifications?: Array<{ id: number; message: string; time: string }>;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const academicYear = getCurrentAcademicYear();
  const userId = typeof window !== 'undefined' ? getAuthUserIdFromCookie() : null;
  const teacherName = dbData?.teacher?.users
    ? `${dbData.teacher.users.first_name || ''} ${dbData.teacher.users.last_name || ''}`.trim()
    : 'Enseignant';
  const teacherId = dbData?.teacher?.id || userId || '';
  const teacherRoleLabel = getTeacherRoleLabel(dbData?.teacher?.gender);

  // Charger les vraies données depuis Supabase
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
        }
      } catch (e) {
        console.error('Erreur chargement données enseignants:', e);
      } finally {
        setIsLoading(false);
      }
    }
    loadFromDb();
  }, []);

  // Élèves et classes depuis la DB (aucun mock)
  const dbClasses = dbData?.classes ?? [];
  const allDbStudents = dbData?.students ?? [];

  // Filtrer les élèves par classe sélectionnée
  const dbStudents = selectedClassId
    ? allDbStudents.filter((s: any) => s.classId === selectedClassId)
    : allDbStudents;

  const displayStudents = (dbStudents as any[]).map((s: any) => ({
    id: s.id,
    name: `${s.users?.first_name || ''} ${s.users?.last_name || ''}`.trim() || s.matricule || 'Inconnu',
    matricule: s.matricule || '',
    email: s.users?.email || '',
    classId: s.classId || '',
    className: s.className || '',
  }));

  // Classe active pour le module d'appel
  const displayClass = dbClasses.length > 0
    ? (selectedClassId
        ? dbClasses.find((c: any) => c.id === selectedClassId) || dbClasses[0]
        : dbClasses[0])
    : null;

  const filteredStudents = displayStudents.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.matricule.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Convertir les élèves pour le module d'appel
  const attendanceStudents = displayStudents.map((s: any) => ({
    id: s.id,
    name: s.name,
    matricule: s.matricule,
  }));

  // Statistiques (vraies données uniquement)
  const displayStats = [
    { label: 'Total élèves', value: displayStudents.length, icon: <Users size={20} />, color: 'bg-emerald-50 text-emerald-700' },
    { label: 'Actifs', value: displayStudents.length, icon: <GraduationCap size={20} />, color: 'bg-blue-50 text-blue-700' },
    { label: 'Classes', value: dbClasses.length, icon: <Filter size={20} />, color: 'bg-amber-50 text-amber-700' },
  ];

  return (
    <AppShell
      navItems={navItems}
      title="Espace Enseignant"
      subtitle="AL-BAYAAN"
      userName={teacherName}
      userRole={teacherRoleLabel}
      notifications={dbData?.notifications || []}
      headerTitle="Mes Élèves"
      variant="topbar"
    >
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Mes Élèves</h2>
            <p className="mt-2 text-slate-600">
              {dbClasses.length > 0
                ? `${dbClasses.length} classe(s) — ${displayStudents.length} élève(s)`
                : 'Chargement des données...'}
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
            <button
              onClick={() => setShowAttendance(!showAttendance)}
              disabled={!displayClass || isLoading}
              className={`inline-flex items-center justify-center gap-2 rounded-2xl px-6 py-3 text-sm font-semibold shadow-lg transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0 ${
                showAttendance
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-amber-500/20'
                  : 'bg-gradient-to-r from-emerald-600 to-emerald-700 text-white shadow-emerald-600/20'
              }`}
            >
              <ClipboardCheck size={18} />
              {showAttendance ? 'Voir la liste' : 'Faire l\'appel'}
            </button>
            <AcademicYearSelector />
          </div>
        </div>

        {/* Module Appel / Présence */}
        {showAttendance && displayClass ? (
          <Card className="border-slate-200 p-6 shadow-sm">
            <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-900">
              <UserCheck size={18} className="text-emerald-600" />
              Appel / Présence — {displayClass.name} — {academicYear}
            </h3>
            <AttendanceModule
              classId={displayClass.id}
              className={displayClass.name}
              teacherId={teacherId}
              teacherName={teacherName}
              academicYear={academicYear}
              students={attendanceStudents}
            />
          </Card>
        ) : null}

        {/* Stats cards */}
        <div className="grid gap-4 sm:grid-cols-3">
          {displayStats.map((stat) => (
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

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input
            type="text"
            placeholder="Rechercher un élève par nom ou matricule..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-white py-3.5 pl-12 pr-4 text-sm shadow-sm outline-none transition-all focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
          />
        </div>

        {/* Students table */}
        <Card className="overflow-hidden border-slate-200 p-0 shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Nom</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Matricule</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Classe</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 bg-white">
                {filteredStudents.map((student: any) => (
                  <tr key={student.id} className="group transition-colors hover:bg-emerald-50/40">
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-xs font-bold text-white shadow-sm">
                          {getInitials(student.name)}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">{student.name}</p>
                          {student.email && (
                            <p className="flex items-center gap-1 text-xs text-slate-500">
                              <Mail size={12} />
                              {student.email}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-mono text-slate-600">
                      {student.matricule || '-'}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-600">
                      {student.className || '-'}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm">
                      <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold bg-emerald-100 text-emerald-700">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        Actif
                      </span>
                    </td>
                  </tr>
                ))}
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
                  : 'Aucun élève trouvé pour cette recherche.'}
              </p>
            </div>
          )}

          {isLoading && (
            <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-100">
                <Users size={32} className="text-slate-400 animate-pulse" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">Chargement des élèves...</h3>
            </div>
          )}
        </Card>

        {/* Footer info */}
        <div className="flex items-center gap-3 rounded-2xl border border-blue-100 bg-blue-50/50 px-5 py-4 text-sm text-blue-900">
          <Phone size={16} className="shrink-0 text-blue-500" />
          <p>
            <strong>Astuce :</strong> Choisissez une classe avec le sélecteur pour voir uniquement les élèves de cette classe.
          </p>
        </div>
      </div>
    </AppShell>
  );
}