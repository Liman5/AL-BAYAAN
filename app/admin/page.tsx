'use client';

import React, { useState, useMemo } from 'react';
import {
  Users,
  BookOpen,
  BarChart3,
  FileText,
  Plus,
  Download,
  Printer,
  Trash2,
  Edit2,
} from 'lucide-react';
import { AdminHeader, AdminSidebar, AdminSearchBar, StatCard } from '@/components/admin/admin-layout';
import { StudentList, StudentForm } from '@/components/admin/student-management';
import { TeacherList, TeacherForm } from '@/components/admin/teacher-management';
import { ClassList, ClassDetail } from '@/components/admin/class-management';
import { GradeReport, GradeReportsList } from '@/components/admin/grade-reports';
import { mockClasses, mockStudents, mockTeachers, mockGradeReports } from '@/lib/mockAdminData';
import { Student, Teacher, Class, StudentGradeReport } from '@/types/admin';

type AdminPage =
  | 'dashboard'
  | 'students'
  | 'teachers'
  | 'classes'
  | 'reports'
  | 'grades';

export default function AdminDashboard() {
  const [currentPage, setCurrentPage] = useState<AdminPage>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [classFilter, setClassFilter] = useState<string>('');
  const [termFilter, setTermFilter] = useState<string>('');

  // Modal states
  const [showStudentForm, setShowStudentForm] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | undefined>();
  const [showTeacherForm, setShowTeacherForm] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | undefined>();
  const [selectedReport, setSelectedReport] = useState<StudentGradeReport | undefined>();
  const [selectedClass, setSelectedClass] = useState<Class | undefined>();

  // Local data management
  const [students, setStudents] = useState(mockStudents);
  const [teachers, setTeachers] = useState(mockTeachers);
  const [classes] = useState(mockClasses);
  const [reports] = useState(mockGradeReports);

  // Calculate statistics
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

  // Handlers for students
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

  // Handlers for teachers
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

  // Navigation items
  const navItems = [
    {
      id: 'dashboard' as AdminPage,
      label: 'Tableau de Bord',
      icon: <BarChart3 size={20} />,
    },
    {
      id: 'students' as AdminPage,
      label: 'Élèves',
      icon: <Users size={20} />,
      badge: stats.activeStudents,
    },
    {
      id: 'teachers' as AdminPage,
      label: 'Enseignants',
      icon: <BookOpen size={20} />,
      badge: stats.activeTeachers,
    },
    {
      id: 'classes' as AdminPage,
      label: 'Classes',
      icon: <Users size={20} />,
      badge: stats.totalClasses,
    },
    {
      id: 'reports' as AdminPage,
      label: 'Rapports de Notes',
      icon: <FileText size={20} />,
      badge: reports.length,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <AdminHeader
        title={
          currentPage === 'dashboard'
            ? 'Tableau de Bord'
            : currentPage === 'students'
              ? 'Gestion des Élèves'
              : currentPage === 'teachers'
                ? 'Gestion des Enseignants'
                : currentPage === 'classes'
                  ? 'Gestion des Classes'
                  : 'Rapports de Notes'
        }
        onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        isMenuOpen={isSidebarOpen}
      />

      <div className="flex flex-1 overflow-hidden mt-16 lg:mt-0">
        {/* Sidebar */}
        <div className={`hidden lg:flex flex-col w-72 bg-gray-900 text-white overflow-y-auto`}>
          <AdminSidebar
            items={navItems as any}
            activeItem={currentPage}
            onItemClick={(itemId) => {
              setCurrentPage(itemId as AdminPage);
              setIsSidebarOpen(false);
            }}
            isOpen={true}
          />
        </div>

        {/* Mobile Sidebar Overlay */}
        {isSidebarOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 lg:hidden z-40" onClick={() => setIsSidebarOpen(false)} />
        )}
        <div className={`fixed left-0 top-16 h-screen w-64 bg-gray-900 text-white overflow-y-auto transform transition-transform duration-300 lg:hidden z-40 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <AdminSidebar
            items={navItems as any}
            activeItem={currentPage}
            onItemClick={(itemId) => {
              setCurrentPage(itemId as AdminPage);
              setIsSidebarOpen(false);
            }}
            isOpen={true}
          />
        </div>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto w-full">
          <div className="p-4 sm:p-6 lg:p-8 w-full max-w-7xl mx-auto">
            {currentPage === 'dashboard' && (
              <div className="space-y-6 lg:space-y-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">
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

                {/* Quick Actions */}
                <div className="bg-white rounded-lg p-4 lg:p-6 border border-gray-200 shadow-sm">
                  <h3 className="text-lg lg:text-xl font-bold text-gray-900 mb-4">Actions Rapides</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
                    <button
                      onClick={() => {
                        setCurrentPage('students');
                        handleAddStudent();
                      }}
                      className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors text-sm lg:text-base"
                    >
                      <Plus size={20} />
                      <span>Ajouter Élève</span>
                    </button>
                    <button
                      onClick={() => {
                        setCurrentPage('teachers');
                        handleAddTeacher();
                      }}
                      className="flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors text-sm lg:text-base"
                    >
                      <Plus size={20} />
                      <span>Ajouter Enseignant</span>
                    </button>
                    <button
                      onClick={() => setCurrentPage('classes')}
                      className="flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors text-sm lg:text-base"
                    >
                      <BookOpen size={20} />
                      <span>Voir Classes</span>
                    </button>
                    <button
                      onClick={() => setCurrentPage('reports')}
                      className="flex items-center justify-center gap-2 px-4 py-3 bg-orange-600 text-white font-medium rounded-lg hover:bg-orange-700 transition-colors text-sm lg:text-base"
                    >
                      <FileText size={20} />
                      <span>Rapports</span>
                    </button>
                  </div>
                </div>

                {/* Recent Activities */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                  <div className="bg-white rounded-lg p-4 lg:p-6 border border-gray-200 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Élèves Récents</h3>
                    <div className="space-y-3">
                      {students.slice(0, 5).map((student) => (
                        <div
                          key={student.id}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg text-sm"
                        >
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

                  <div className="bg-white rounded-lg p-4 lg:p-6 border border-gray-200 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Enseignants Actifs</h3>
                    <div className="space-y-3">
                      {teachers.slice(0, 5).map((teacher) => (
                        <div
                          key={teacher.id}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg text-sm"
                        >
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
            )}

            {/* Students Page */}
            {currentPage === 'students' && (
              <div className="space-y-4 lg:space-y-6">
                <div className="flex flex-col gap-4 items-start lg:items-center lg:justify-between lg:flex-row">
                  <div className="flex-1 w-full lg:w-auto">
                    <AdminSearchBar
                      placeholder="Rechercher élève..."
                      value={searchQuery}
                      onSearch={setSearchQuery}
                    />
                  </div>
                  <button
                    onClick={handleAddStudent}
                    className="w-full lg:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors text-sm lg:text-base"
                  >
                    <Plus size={20} />
                    Ajouter Élève
                  </button>
                </div>

                <div className="flex gap-2 flex-wrap overflow-x-auto">
                  <select
                    value={classFilter}
                    onChange={(e) => setClassFilter(e.target.value)}
                    className="px-3 lg:px-4 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm lg:text-base"
                  >
                    <option value="">Toutes les classes</option>
                    {classes.map((cls) => (
                      <option key={cls.id} value={cls.id}>
                        {cls.name}
                      </option>
                    ))}
                  </select>
                </div>

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

            {/* Teachers Page */}
            {currentPage === 'teachers' && (
              <div className="space-y-4 lg:space-y-6">
                <div className="flex flex-col gap-4 items-start lg:items-center lg:justify-between lg:flex-row">
                  <div className="flex-1 w-full lg:w-auto">
                    <AdminSearchBar
                      placeholder="Rechercher enseignant..."
                      value={searchQuery}
                      onSearch={setSearchQuery}
                    />
                  </div>
                  <button
                    onClick={handleAddTeacher}
                    className="w-full lg:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors text-sm lg:text-base"
                  >
                    <Plus size={20} />
                    Ajouter Enseignant
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

            {/* Classes Page */}
            {currentPage === 'classes' && (
              <div className="space-y-6">
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
                    <div className="flex items-center justify-between">
                      <h3 className="text-2xl font-bold text-gray-900">Gestion des Classes</h3>
                      <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors">
                        <Plus size={20} />
                        Ajouter Classe
                      </button>
                    </div>
                    <ClassList
                      classes={classes}
                      onClick={(cls) => setSelectedClass(cls)}
                    />
                  </>
                )}
              </div>
            )}

            {/* Reports Page */}
            {currentPage === 'reports' && (
              <div className="space-y-4 lg:space-y-6">
                <div className="flex flex-col gap-4 items-start lg:items-center lg:justify-between lg:flex-row">
                  <div className="flex-1 w-full lg:w-auto">
                    <AdminSearchBar
                      placeholder="Rechercher élève..."
                      value={searchQuery}
                      onSearch={setSearchQuery}
                    />
                  </div>
                </div>

                <div className="flex gap-2 flex-wrap overflow-x-auto">
                  <select
                    value={classFilter}
                    onChange={(e) => setClassFilter(e.target.value)}
                    className="px-3 lg:px-4 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm lg:text-base"
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
                    className="px-3 lg:px-4 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm lg:text-base"
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
                      className="text-gray-600 hover:text-gray-900 font-medium text-sm lg:text-base"
                    >
                      ← Retour à la liste
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
    </div>
  );
}
