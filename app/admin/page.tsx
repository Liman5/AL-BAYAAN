'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Users,
  BookOpen,
  FileText,
  Plus,
  Menu,
} from 'lucide-react';
import AdminSidebar, { type AdminPage } from '@/components/admin/admin-sidebar';
import AdminDashboardView from '@/components/admin/admin-dashboard';
import { AdminSearchBar, StatCard } from '@/components/admin/admin-layout';
import { StudentList, StudentForm } from '@/components/admin/student-management';
import { TeacherList, TeacherForm } from '@/components/admin/teacher-management';
import { ClassList, ClassDetail } from '@/components/admin/class-management';
import PassageAnneeModule from '@/components/admin/passage-annee';
import ClassForm, { type ClassFormValues } from '@/components/admin/class-form';
import { GradeReport, GradeReportsList } from '@/components/admin/grade-reports';
import StudentDossier from '@/components/admin/student-dossier';
import PaymentsModule from '@/components/admin/payments-module';
import SiteImagesManager from '@/components/admin/site-images-manager';
import AcademicYearsManager from '@/components/admin/academic-years-manager';
import BadgesModule from '@/components/admin/badges-module';
import StaffBadgesModule from '@/components/admin/staff-badges-module';
import TerminalsModule from '@/components/admin/terminals-module';
import ScannerSettingsPanel from '@/components/admin/scanner-settings-panel';
import AcademicYearSelector from '@/components/ui/academic-year-selector';
import { getCurrentAcademicYear } from '@/lib/schoolData';
import { fetchAdminStudents, fetchAdminTeachers, fetchAdminClasses } from '@/services/db.service';
import { Student, Teacher, Class, StudentGradeReport } from '@/types/admin';

// Composant Dashboard
const DashboardContent = ({
  stats,
  students,
  teachers,
  reports,
  onAddStudent,
  onAddTeacher,
  onViewPage,
}: {
  stats: any;
  students: Student[];
  teachers: Teacher[];
  reports: StudentGradeReport[];
  onAddStudent: () => void;
  onAddTeacher: () => void;
  onViewPage: (page: AdminPage) => void;
}) => (
  <div className="space-y-4 sm:space-y-6">
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
      <StatCard
        label="Élèves Totaux"
        value={stats.totalStudents}
        icon={<Users size={32} />}
        color="blue"
      />
      <StatCard
        label="Enseignants Actifs"
        value={stats.activeTeachers}
        icon={<BookOpen size={32} />}
        color="green"
      />
      <StatCard
        label="Classes"
        value={stats.totalClasses}
        icon={<Users size={32} />}
        color="purple"
      />
      <StatCard
        label="Matières"
        value={stats.totalSubjects}
        icon={<FileText size={32} />}
        color="yellow"
      />
      <StatCard
        label="Élèves Actifs"
        value={stats.activeStudents}
        icon={<Users size={32} />}
        color="green"
      />
      <StatCard
        label="Rapports Générés"
        value={reports.length}
        icon={<FileText size={32} />}
        color="blue"
      />
    </div>

    {/* Actions Rapides */}
    <div className="bg-white rounded-lg p-4 sm:p-6 border border-gray-200 shadow-sm">
      <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">Actions Rapides</h3>
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
        <button
          onClick={() => {
            onViewPage('students');
            onAddStudent();
          }}
          className="flex items-center justify-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 sm:py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors text-xs sm:text-sm lg:text-base"
        >
          <Plus size={16} className="sm:w-5 sm:h-5" />
          Ajouter Élève
        </button>
        <button
          onClick={() => {
            onViewPage('teachers');
            onAddTeacher();
          }}
          className="flex items-center justify-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 sm:py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors text-xs sm:text-sm lg:text-base"
        >
          <Plus size={16} className="sm:w-5 sm:h-5" />
          Ajouter Enseignant
        </button>
        <button
          onClick={() => onViewPage('classes')}
          className="flex items-center justify-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 sm:py-3 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors text-xs sm:text-sm lg:text-base"
        >
          <BookOpen size={16} className="sm:w-5 sm:h-5" />
          Classes
        </button>
        <button
          onClick={() => onViewPage('reports')}
          className="flex items-center justify-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 sm:py-3 bg-orange-600 text-white font-medium rounded-lg hover:bg-orange-700 transition-colors text-xs sm:text-sm lg:text-base"
        >
          <FileText size={16} className="sm:w-5 sm:h-5" />
          Rapports
        </button>
      </div>
    </div>
  </div>
);

export default function AdminDashboard() {
  // Lire le paramètre ?page= de l'URL pour ouvrir directement le bon module
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState<AdminPage>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigateToPage = (page: AdminPage) => {
    setCurrentPage(page);
    setSidebarOpen(false);
    const target = page === 'dashboard' ? '/admin' : `/admin?page=${page}`;
    router.replace(target, { scroll: false });
  };

  // Lire l'URL sans useSearchParams : la page reste prérendue avec son contenu.
  useEffect(() => {
    const applyPageFromUrl = () => {
      const requestedPage = new URLSearchParams(window.location.search).get(
        'page'
      ) as AdminPage | null;

      if (
        requestedPage &&
        [
          'dashboard',
          'students',
          'teachers',
          'classes',
          'reports',
          'payments',
          'passages',
          'images',
          'academic-years',
        ].includes(requestedPage)
      ) {
        setCurrentPage(requestedPage);
      } else {
        setCurrentPage('dashboard');
      }
    };

    applyPageFromUrl();
    window.addEventListener('popstate', applyPageFromUrl);
    return () => window.removeEventListener('popstate', applyPageFromUrl);
  }, []);
  const [searchQuery, setSearchQuery] = useState('');
  const [classFilter, setClassFilter] = useState<string>('');
  const [termFilter, setTermFilter] = useState<string>('');

  // States pour les formulaires
  const [showStudentForm, setShowStudentForm] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | undefined>();
  const [showTeacherForm, setShowTeacherForm] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | undefined>();
  const [selectedReport, setSelectedReport] = useState<StudentGradeReport | undefined>();
  const [selectedClass, setSelectedClass] = useState<Class | undefined>();
  const [dossierStudent, setDossierStudent] = useState<Student | null>(null);
  const [showClassForm, setShowClassForm] = useState(false);
  const [classSaving, setClassSaving] = useState(false);
  const [classMessage, setClassMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Données chargées depuis Supabase uniquement (aucun mock)
  const [students, setStudents] = useState<Student[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [reports] = useState<StudentGradeReport[]>([]);
  // Données brutes de la DB (avec relations) pour le module Classes
  const [rawStudents, setRawStudents] = useState<any[]>([]);
  const [rawTeachers, setRawTeachers] = useState<any[]>([]);
  const [rawClasses, setRawClasses] = useState<any[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);

  // Charger les enseignants depuis la base (fonction réutilisable)
  async function loadTeachersFromDb() {
    const dbTeachers = await fetchAdminTeachers();
    if (dbTeachers.length > 0) {
      setTeachers(
        dbTeachers.map((t: any) => {
          // 1. Si le compte utilisateur est suspendu → statut "suspended"
          // 2. Sinon si le profil est en attente → statut "pending"
          // 3. Sinon → statut du profil (active / on_leave / inactive)
          let status: Teacher['status'] = 'inactive';
          if (t.users?.status === 'suspended') status = 'suspended';
          else if (t.status === 'pending') status = 'pending';
          else if (t.status === 'active') status = 'active';
          else if (t.status === 'on_leave') status = 'on_leave';
          else status = 'inactive';

          return {
            id: t.id,
            firstName: t.users?.first_name || '',
            lastName: t.users?.last_name || '',
            email: t.users?.email || '',
            phone: t.users?.phone || '',
            subjects: Array.isArray(t.subjects) ? t.subjects : [],
            classAssignments: [],
            status,
            hireDate: new Date(t.hire_date),
            specializations: Array.isArray(t.specializations) ? t.specializations : [],
          };
        })
      );
    }
  }

  // Charger les données Supabase au montage
  useEffect(() => {
    async function loadFromDb() {

      // Élèves depuis la base
      const dbStudents = await fetchAdminStudents();
      setRawStudents(dbStudents);
      if (dbStudents.length > 0) {
        setStudents(
          dbStudents.map((s: any) => {
            const enrollment = s.student_enrollments?.[0];
            return {
              id: s.id,
              firstName: s.users?.first_name || '',
              lastName: s.users?.last_name || '',
              email: s.users?.email || '',
              phone: s.users?.phone || '',
              matricule: s.matricule || '',
              classId: enrollment?.class_id || '',
              className: enrollment?.classes?.name || '',
              status: (['active', 'transferred', 'graduated', 'inactive', 'pending'].includes(
                s.status
              )
                ? s.status
                : 'inactive') as Student['status'],
              dateOfBirth: s.date_of_birth ? new Date(s.date_of_birth) : undefined,
              registrationDate: new Date(s.registration_date),
              address: s.address || '',
              parentName: s.parents?.full_name || '',
              parentPhone: s.parents?.phone || '',
              parentEmail: s.parents?.email || '',
            };
          })
        );
      }

      // Enseignants depuis la base
      const dbTeachers = await fetchAdminTeachers();
      setRawTeachers(dbTeachers);
      if (dbTeachers.length > 0) {
        setTeachers(
          dbTeachers.map((t: any) => {
            let status: Teacher['status'] = 'inactive';
            if (t.users?.status === 'suspended') status = 'suspended';
            else if (t.status === 'pending') status = 'pending';
            else if (t.status === 'active') status = 'active';
            else if (t.status === 'on_leave') status = 'on_leave';
            else status = 'inactive';

            return {
              id: t.id,
              firstName: t.users?.first_name || '',
              lastName: t.users?.last_name || '',
              email: t.users?.email || '',
              phone: t.users?.phone || '',
              subjects: Array.isArray(t.subjects) ? t.subjects : [],
              classAssignments: [],
              status,
              hireDate: new Date(t.hire_date),
              specializations: Array.isArray(t.specializations) ? t.specializations : [],
            };
          })
        );
      }

      // Classes depuis la base
      const dbClasses = await fetchAdminClasses();
      setRawClasses(dbClasses);
      if (dbClasses.length > 0) {
        setClasses(
          dbClasses.map((c: any) => ({
            id: c.id,
            name: c.name,
            level: c.level,
            academicYear: c.academic_years?.name || '',
            academic_year_id: c.academic_year_id,
            room_number: c.room_number,
            description: c.description,
            classTeacherId: c.class_teacher_id || undefined,
            totalStudents: c.student_enrollments?.length || 0,
            createdAt: new Date(c.created_at || Date.now()),
            updatedAt: new Date(c.updated_at || Date.now()),
            class_assignments: c.class_assignments || [],
            student_enrollments: c.student_enrollments || [],
            teacher_profiles: c.teacher_profiles,
          }))
        );
      }
    }

    loadFromDb();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey]);

  // ⚠️ Recharger les enseignants à chaque ouverture du module Enseignants,
  // pour afficher les nouveaux inscrits (même ceux créés après le montage).
  useEffect(() => {
    if (currentPage === 'teachers') {
      loadTeachersFromDb().catch((e) => console.error('Erreur rechargement enseignants:', e));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  // Synchroniser la classe sélectionnée avec les données actualisées
  useEffect(() => {
    if (selectedClass) {
      const updated = classes.find((c) => c.id === selectedClass.id);
      if (updated) {
        setSelectedClass(updated);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classes]);

  // Calcul des statistiques
  const stats = useMemo(
    () => ({
      totalStudents: students.length,
      totalTeachers: teachers.length,
      totalClasses: classes.length,
      totalSubjects: new Set(teachers.flatMap((t) => t.subjects)).size,
      activeStudents: students.filter((s) => s.status === 'active').length,
      activeTeachers: teachers.filter((t) => t.status === 'active').length,
    }),
    [students, teachers, classes]
  );

  // Handlers pour les élèves
  const handleAddStudent = () => {
    setSelectedStudent(undefined);
    setShowStudentForm(true);
  };

  const handleEditStudent = (student: Student) => {
    setSelectedStudent(student);
    setShowStudentForm(true);
  };

  const handleSubmitStudent = async (student: Student) => {
    try {
      const { createStudent, updateStudent } = await import('@/services/db.service');

      if (selectedStudent?.id) {
        // Mode édition : appeler l'API PATCH
        const result = await updateStudent(selectedStudent.id, {
          firstName: student.firstName,
          lastName: student.lastName,
          email: student.email || '',
          phone: student.phone || '',
          classId: student.classId || '',
          parentName: student.parentName || '',
          parentPhone: student.parentPhone || '',
          parentEmail: student.parentEmail || '',
          dateOfBirth: student.dateOfBirth ? student.dateOfBirth.toISOString().split('T')[0] : undefined,
          address: student.address || '',
          status: student.status,
        });

        if (result.success) {
          // Mettre à jour localement + rafraîchir
          setStudents(students.map((s) => (s.id === selectedStudent.id ? { ...student, id: selectedStudent.id } : s)));
          setRefreshKey((k) => k + 1);
          setShowStudentForm(false);
          alert(`✅ Informations de l'élève ${student.firstName} ${student.lastName} modifiées avec succès !`);
        } else {
          alert(result.message || "Erreur lors de la modification de l'élève.");
        }
      } else {
        // Mode ajout : l'API génère le matricule automatiquement
        const result = await createStudent({
          firstName: student.firstName,
          lastName: student.lastName,
          email: student.email || undefined,
          phone: student.phone || undefined,
          classId: student.classId || undefined,
          parentName: student.parentName || undefined,
          parentPhone: student.parentPhone || undefined,
          parentEmail: student.parentEmail || undefined,
          address: student.address || undefined,
          status: student.status || 'active',
        });

        if (result.success) {
          const matricule = result.data?.matricule || '';
          // Ajouter à la liste locale avec le matricule généré
          setStudents([
            ...students,
            {
              ...student,
              id: result.data?.id || `student-${Date.now()}`,
              matricule,
            },
          ]);
          setRefreshKey((k) => k + 1);
          setShowStudentForm(false);
          alert(`Élève créé avec succès ! Matricule : ${matricule}`);
        } else {
          alert(result.message || "Erreur lors de l'ajout de l'élève.");
        }
      }
    } catch (e: any) {
      alert(e?.message || 'Erreur inattendue.');
    }
  };

  const handleDeleteStudent = (studentId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet élève?')) {
      setStudents(students.filter((s) => s.id !== studentId));
    }
  };

  // Handlers pour les enseignants
  const handleAddTeacher = () => {
    setSelectedTeacher(undefined);
    setShowTeacherForm(true);
  };

  const handleEditTeacher = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setShowTeacherForm(true);
  };

  const handleSubmitTeacher = (teacher: Teacher) => {
    if (selectedTeacher) {
      setTeachers(teachers.map((t) => (t.id === teacher.id ? teacher : t)));
    } else {
      setTeachers([
        ...teachers,
        {
          ...teacher,
          id: `teacher-${Date.now()}`,
          hireDate: new Date(),
          classAssignments: [],
        },
      ]);
    }
    setShowTeacherForm(false);
  };

  const handleDeleteTeacher = (teacherId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet enseignant?')) {
      setTeachers(teachers.filter((t) => t.id !== teacherId));
    }
  };

  const handleApproveTeacher = async (teacher: Teacher) => {
    if (!confirm(`Approuver l'enseignant ${teacher.firstName} ${teacher.lastName}?`)) return;
    try {
      const res = await fetch('/api/auth/approve-teacher', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teacherId: teacher.id }),
      });
      const result = await res.json();
      if (result.success) {
        // Mettre à jour localement le statut
        setTeachers(teachers.map((t) => (t.id === teacher.id ? { ...t, status: 'active' } : t)));
      } else {
        alert(result.message || 'Erreur lors de l\'approbation.');
      }
    } catch {
      alert('Impossible de contacter le serveur.');
    }
  };

  const handleSuspendTeacher = async (teacher: Teacher) => {
    if (!confirm(`Suspendre l'enseignant ${teacher.firstName} ${teacher.lastName}?`)) return;
    try {
      const res = await fetch('/api/auth/suspend-teacher', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teacherId: teacher.id }),
      });
      const result = await res.json();
      if (result.success) {
        // Mettre à jour localement le statut
        setTeachers(teachers.map((t) => (t.id === teacher.id ? { ...t, status: 'suspended' } : t)));
      } else {
        alert(result.message || 'Erreur lors de la suspension.');
      }
    } catch {
      alert('Impossible de contacter le serveur.');
    }
  };

  // Création d'une classe
  const handleSubmitClass = async (values: ClassFormValues) => {
    setClassSaving(true);
    setClassMessage(null);

    try {
      const response = await fetch('/api/admin/classes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Création de la classe impossible.');
      }

      setShowClassForm(false);
      setClassMessage({
        type: 'success',
        text: `Classe ${result.data?.name || values.name} créée${
          result.data?.academic_years?.name ? ` pour l’année ${result.data.academic_years.name}` : ''
        }.`,
      });
      setRefreshKey((key) => key + 1);
    } catch (error) {
      setClassMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Création de la classe impossible.',
      });
    } finally {
      setClassSaving(false);
    }
  };

  const pageTitles: Record<AdminPage, string> = {
    dashboard: 'Tableau de bord',
    students: 'Élèves',
    teachers: 'Enseignants',
    classes: 'Classes',
    reports: 'Rapports',
    payments: 'Paiements',
    passages: 'Passages d\'années',
    images: 'Images du site',
    'academic-years': 'Années scolaires',
    badges: 'Badges QR & présence',
    'badges-staff': 'Badges du personnel',
    terminals: 'Terminaux & paramètres scanner',
  };

  // Conversions pour les modules
  const studentNames = students.map((s) => ({
    id: s.id,
    name: `${s.firstName} ${s.lastName}`,
    matricule: s.matricule,
    className: s.className,
  }));
  const teacherNames = teachers.map((t) => ({
    id: t.id,
    name: `${t.firstName} ${t.lastName}`,
  }));

  return (
    <div className="flex min-h-screen bg-slate-100">
      <AdminSidebar
        currentPage={currentPage}
        onNavigate={navigateToPage}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        badges={{
          students: stats.activeStudents,
          teachers: stats.activeTeachers,
          classes: stats.totalClasses,
        }}
        userName="Administrateur"
        userEmail="admin@albayan.edu"
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <main className="flex-1">
          <div className="mx-auto w-full max-w-[1500px] px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
            {/* Header */}
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setSidebarOpen(true)}
                  className="rounded-xl border border-slate-200 bg-white p-2.5 text-slate-600 shadow-sm transition-colors hover:bg-slate-50 lg:hidden"
                  aria-label="Ouvrir le menu"
                >
                  <Menu size={20} />
                </button>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-700/70">
                    Espace administration
                  </p>
                  <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">
                    {pageTitles[currentPage]}
                  </h1>
                </div>
              </div>
              <AcademicYearSelector canActivate />
            </div>

            {/* Page Dashboard */}
            {currentPage === 'dashboard' && (
              <AdminDashboardView
                stats={stats}
                teachers={teachers}
                classes={classes}
                rawStudents={rawStudents}
                onNavigate={navigateToPage}
                onAddStudent={handleAddStudent}
                onAddTeacher={handleAddTeacher}
              />
            )}

          {/* Page Élèves */}
          {currentPage === 'students' && (
            <div className="space-y-4 sm:space-y-6">
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center justify-between">
                <div className="flex-1">
                  <AdminSearchBar
                    placeholder="Rechercher élève..."
                    value={searchQuery}
                    onSearch={setSearchQuery}
                  />
                </div>
                <button
                  onClick={handleAddStudent}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors text-sm whitespace-nowrap"
                >
                  <Plus size={20} />
                  <span className="hidden sm:inline">Ajouter Élève</span>
                </button>
              </div>

              <select
                value={classFilter}
                onChange={(e) => setClassFilter(e.target.value)}
                className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="">Toutes les classes</option>
                {classes.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name}
                  </option>
                ))}
              </select>

              {dossierStudent ? (
                <StudentDossier
                  student={{
                    id: dossierStudent.id,
                    firstName: dossierStudent.firstName,
                    lastName: dossierStudent.lastName,
                    matricule: dossierStudent.matricule,
                    className: dossierStudent.className,
                    classId: dossierStudent.classId,
                    status: dossierStudent.status,
                    email: dossierStudent.email,
                    phone: dossierStudent.phone,
                    parentName: dossierStudent.parentName,
                    parentPhone: dossierStudent.parentPhone,
                    parentEmail: dossierStudent.parentEmail,
                    registrationDate: dossierStudent.registrationDate,
                    dateOfBirth: dossierStudent.dateOfBirth,
                    address: dossierStudent.address,
                    academicYear: getCurrentAcademicYear(),
                  }}
                  onBack={() => setDossierStudent(null)}
                />
              ) : showStudentForm ? (
                <StudentForm
                  student={selectedStudent}
                  onSubmit={handleSubmitStudent}
                  onCancel={() => setShowStudentForm(false)}
                  availableClasses={classes.map((c) => ({ id: c.id, name: c.name }))}
                />
              ) : (
                <StudentList
                  students={students}
                  onEdit={handleEditStudent}
                  onDelete={handleDeleteStudent}
                  onView={(student) => setDossierStudent(student)}
                  classFilter={classFilter}
                  searchQuery={searchQuery}
                />
              )}
            </div>
          )}

          {/* Page Enseignants */}
          {currentPage === 'teachers' && (
            <div className="space-y-4 sm:space-y-6">
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center justify-between">
                <div className="flex-1">
                  <AdminSearchBar
                    placeholder="Rechercher enseignant..."
                    value={searchQuery}
                    onSearch={setSearchQuery}
                  />
                </div>
                <button
                  onClick={handleAddTeacher}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors text-sm whitespace-nowrap"
                >
                  <Plus size={20} />
                  <span className="hidden sm:inline">Ajouter Enseignant</span>
                </button>
              </div>

              {showTeacherForm ? (
                <TeacherForm
                  teacher={selectedTeacher}
                  onSubmit={handleSubmitTeacher}
                  onCancel={() => setShowTeacherForm(false)}
                />
              ) : (
                <TeacherList
                  teachers={teachers}
                  onEdit={handleEditTeacher}
                  onDelete={handleDeleteTeacher}
                  onApprove={handleApproveTeacher}
                  onSuspend={handleSuspendTeacher}
                  searchQuery={searchQuery}
                />
              )}
            </div>
          )}

          {/* Page Classes */}
          {currentPage === 'classes' && (
            <div className="space-y-4 sm:space-y-6">
              {selectedClass ? (
                <ClassDetail
                  classItem={selectedClass}
                  studentCount={students.filter((s) => s.classId === selectedClass.id).length}
                  teacherCount={teachers.filter((t) =>
                    t.classAssignments.some((ca) => ca.classId === selectedClass.id)
                  ).length}
                  onBack={() => {
                    setSelectedClass(undefined);
                    setRefreshKey((k) => k + 1);
                  }}
                  allStudents={rawStudents}
                  allTeachers={rawTeachers}
                  onRefresh={() => setRefreshKey((k) => k + 1)}
                />
              ) : (
                <>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <h3 className="text-lg sm:text-2xl font-bold text-gray-900">Gestion des Classes</h3>
                    <button
                      type="button"
                      onClick={() => {
                        setShowClassForm((previous) => !previous);
                        setClassMessage(null);
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors text-sm whitespace-nowrap"
                    >
                      <Plus size={20} />
                      <span className="hidden sm:inline">
                        {showClassForm ? 'Fermer' : 'Ajouter Classe'}
                      </span>
                    </button>
                  </div>

                  {classMessage && (
                    <div
                      className={`rounded-xl border px-4 py-3 text-sm ${
                        classMessage.type === 'success'
                          ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                          : 'border-rose-200 bg-rose-50 text-rose-800'
                      }`}
                    >
                      {classMessage.text}
                    </div>
                  )}

                  {showClassForm && (
                    <ClassForm
                      saving={classSaving}
                      onCancel={() => setShowClassForm(false)}
                      onSubmit={handleSubmitClass}
                    />
                  )}

                  {classes.length === 0 && !showClassForm ? (
                    <div className="rounded-2xl border border-dashed border-slate-300 bg-white/60 px-6 py-12 text-center">
                      <p className="text-sm font-semibold text-slate-700">Aucune classe pour le moment</p>
                      <p className="mt-1 text-xs text-slate-500">
                        Cliquez sur « Ajouter Classe » pour créer la première classe de l’année.
                      </p>
                    </div>
                  ) : (
                    <ClassList classes={classes} onClick={(cls) => setSelectedClass(cls)} />
                  )}
                </>
              )}
            </div>
          )}

          {/* Page Rapports */}
          {currentPage === 'reports' && (
            <div className="space-y-4 sm:space-y-6">
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <div className="flex-1">
                  <AdminSearchBar
                    placeholder="Rechercher élève..."
                    value={searchQuery}
                    onSearch={setSearchQuery}
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                <select
                  value={classFilter}
                  onChange={(e) => setClassFilter(e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value="">Toutes les classes</option>
                  {classes.map((cls) => (
                    <option key={cls.id} value={cls.id}>
                      {cls.name}
                    </option>
                  ))}
                </select>

                <select
                  value={termFilter}
                  onChange={(e) => setTermFilter(e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value="">Tous les trimestres</option>
                  <option value="first">1er Trimestre</option>
                  <option value="second">2e Trimestre</option>
                  <option value="third">3e Trimestre</option>
                  <option value="final">Résultats Finaux</option>
                </select>
              </div>

              {selectedReport ? (
                <div className="space-y-4">
                  <button
                    onClick={() => setSelectedReport(undefined)}
                    className="text-gray-600 hover:text-gray-900 font-medium text-sm"
                  >
                    ← Retour
                  </button>
                  <GradeReport
                    report={selectedReport}
                    onPrint={() => window.print()}
                    onDownload={() => alert('Téléchargement PDF - Fonctionnalité à implémenter')}
                  />
                </div>
              ) : (
                <GradeReportsList
                  reports={reports}
                  onViewReport={setSelectedReport}
                  searchQuery={searchQuery}
                  classFilter={classFilter}
                  termFilter={termFilter as any}
                />
              )}
            </div>
          )}

          {/* Page Passages d'Années */}
          {currentPage === 'passages' && (
            <PassageAnneeModule />
          )}

          {/* Page Paiements */}
          {currentPage === 'payments' && (
            <PaymentsModule
              studentNames={studentNames}
              teacherNames={teacherNames}
            />
          )}

          {/* Page Images du site */}
          {currentPage === 'images' && <SiteImagesManager />}

          {/* Page Années scolaires */}
          {currentPage === 'academic-years' && <AcademicYearsManager />}

          {/* Page Badges QR & présence */}
          {currentPage === 'badges' && <BadgesModule />}

          {/* Page Badges du personnel (enseignants + administration) */}
          {currentPage === 'badges-staff' && <StaffBadgesModule />}

          {/* Page Terminaux scanners + paramètres */}
          {currentPage === 'terminals' && (
            <div className="space-y-4 sm:space-y-6">
              <TerminalsModule />
              <ScannerSettingsPanel />
            </div>
          )}
          </div>
        </main>
      </div>
    </div>
  );
}