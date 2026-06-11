'use client';

import React, { useState, useMemo } from 'react';
import {
  Users,
  BookOpen,
  BarChart3,
  FileText,
  Plus,
} from 'lucide-react';
import { ResponsiveSidebar } from '@/components/ui/responsive-sidebar';
import { AdminSearchBar, StatCard } from '@/components/admin/admin-layout';
import { StudentList, StudentForm } from '@/components/admin/student-management';
import { TeacherList, TeacherForm } from '@/components/admin/teacher-management';
import { ClassList, ClassDetail } from '@/components/admin/class-management';
import { GradeReport, GradeReportsList } from '@/components/admin/grade-reports';
import { mockClasses, mockStudents, mockTeachers, mockGradeReports } from '@/lib/mockAdminData';
import { Student, Teacher, Class, StudentGradeReport } from '@/types/admin';

type AdminPage = 'dashboard' | 'students' | 'teachers' | 'classes' | 'reports';

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
        trend={{ value: 12, isPositive: true }}
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
          <span className="hidden sm:inline">Ajouter Élève</span>
          <span className="sm:hidden">Élève</span>
        </button>
        <button
          onClick={() => {
            onViewPage('teachers');
            onAddTeacher();
          }}
          className="flex items-center justify-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 sm:py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors text-xs sm:text-sm lg:text-base"
        >
          <Plus size={16} className="sm:w-5 sm:h-5" />
          <span className="hidden sm:inline">Ajouter Enseignant</span>
          <span className="sm:hidden">Enseignant</span>
        </button>
        <button
          onClick={() => onViewPage('classes')}
          className="flex items-center justify-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 sm:py-3 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors text-xs sm:text-sm lg:text-base"
        >
          <BookOpen size={16} className="sm:w-5 sm:h-5" />
          <span className="hidden sm:inline">Classes</span>
          <span className="sm:hidden">Classes</span>
        </button>
        <button
          onClick={() => onViewPage('reports')}
          className="flex items-center justify-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 sm:py-3 bg-orange-600 text-white font-medium rounded-lg hover:bg-orange-700 transition-colors text-xs sm:text-sm lg:text-base"
        >
          <FileText size={16} className="sm:w-5 sm:h-5" />
          <span className="hidden sm:inline">Rapports</span>
          <span className="sm:hidden">Rapports</span>
        </button>
      </div>
    </div>

    {/* Activités Récentes */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
      <div className="bg-white rounded-lg p-4 sm:p-6 border border-gray-200 shadow-sm">
        <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-4">Élèves Récents</h3>
        <div className="space-y-2 sm:space-y-3">
          {students.slice(0, 5).map((student) => (
            <div key={student.id} className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 rounded-lg text-xs sm:text-sm">
              <div>
                <p className="font-semibold text-gray-900">
                  {student.firstName} {student.lastName}
                </p>
                <p className="text-xs text-gray-600">{student.className}</p>
              </div>
              <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-bold">
                Actif
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg p-4 sm:p-6 border border-gray-200 shadow-sm">
        <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-4">Enseignants Actifs</h3>
        <div className="space-y-2 sm:space-y-3">
          {teachers.slice(0, 5).map((teacher) => (
            <div key={teacher.id} className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 rounded-lg text-xs sm:text-sm">
              <div>
                <p className="font-semibold text-gray-900">
                  {teacher.firstName} {teacher.lastName}
                </p>
                <p className="text-xs text-gray-600">{teacher.subjects.join(', ')}</p>
              </div>
              <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-bold">
                Actif
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

export default function AdminDashboard() {
  const [currentPage, setCurrentPage] = useState<AdminPage>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
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

  // Données locales
  const [students, setStudents] = useState(mockStudents);
  const [teachers, setTeachers] = useState(mockTeachers);
  const [classes] = useState(mockClasses);
  const [reports] = useState(mockGradeReports);

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

  const handleSubmitStudent = (student: Student) => {
    if (selectedStudent) {
      setStudents(students.map((s) => (s.id === student.id ? student : s)));
    } else {
      setStudents([...students, { ...student, id: `student-${Date.now()}` }]);
    }
    setShowStudentForm(false);
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

  // Items de navigation
  const navItems = [
    {
      id: 'dashboard',
      label: 'Tableau de Bord',
      icon: <BarChart3 size={20} />,
    },
    {
      id: 'students',
      label: 'Élèves',
      icon: <Users size={20} />,
      badge: stats.activeStudents,
    },
    {
      id: 'teachers',
      label: 'Enseignants',
      icon: <BookOpen size={20} />,
      badge: stats.activeTeachers,
    },
    {
      id: 'classes',
      label: 'Classes',
      icon: <Users size={20} />,
      badge: stats.totalClasses,
    },
    {
      id: 'reports',
      label: 'Rapports',
      icon: <FileText size={20} />,
      badge: reports.length,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 md:flex">
      {/* Sidebar Responsive */}
      <ResponsiveSidebar
        items={navItems}
        activeItem={currentPage}
        onItemClick={(id) => setCurrentPage(id as AdminPage)}
        isOpen={isSidebarOpen}
        onToggle={setIsSidebarOpen}
        title="Admin Panel"
      />

      {/* Main Content */}
      <main className="flex-1 md:ml-0">
        <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-7xl mx-auto w-full">
          {/* Page Dashboard */}
          {currentPage === 'dashboard' && (
            <DashboardContent
              stats={stats}
              students={students}
              teachers={teachers}
              reports={reports}
              onAddStudent={handleAddStudent}
              onAddTeacher={handleAddTeacher}
              onViewPage={setCurrentPage}
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

              {showStudentForm ? (
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
                  onBack={() => setSelectedClass(undefined)}
                />
              ) : (
                <>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <h3 className="text-lg sm:text-2xl font-bold text-gray-900">Gestion des Classes</h3>
                    <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors text-sm whitespace-nowrap">
                      <Plus size={20} />
                      <span className="hidden sm:inline">Ajouter Classe</span>
                    </button>
                  </div>
                  <ClassList classes={classes} onClick={(cls) => setSelectedClass(cls)} />
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
        </div>
      </main>
    </div>
  );
}
