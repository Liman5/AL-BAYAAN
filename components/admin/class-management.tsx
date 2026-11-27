'use client';

import React, { useState } from 'react';
import { Class, Teacher, Student } from '@/types/admin';
import {
  Edit2,
  Trash2,
  Users,
  BookOpen,
  ArrowLeft,
  UserPlus,
  UserMinus,
  GraduationCap,
  Search,
  X,
  Plus,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

const LEVEL_LABELS: Record<string, string> = {
  preschool: 'Maternelle',
  primary: 'Primaire',
  middle_school: 'Collège',
  high_school: 'Lycée',
};

// ============================================================
// Liste des Classes (cartes cliquables)
// ============================================================
interface ClassListProps {
  classes: Class[];
  onEdit?: (classItem: Class) => void;
  onDelete?: (classId: string) => void;
  onClick?: (classItem: Class) => void;
}

export const ClassList: React.FC<ClassListProps> = ({
  classes,
  onEdit,
  onDelete,
  onClick,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {classes.map((classItem) => {
        // Compter les élèves depuis les vraies inscriptions
        const enrollments = classItem.student_enrollments || [];
        const activeEnrollments = enrollments.filter(
          (e: any) => e.status !== 'inactive' && e.status !== 'transferred'
        );
        const studentCount = activeEnrollments.length || classItem.totalStudents || 0;
        // Enseignants assignés
        const teacherCount = (classItem.class_assignments || []).length;

        return (
          <div
            key={classItem.id}
            className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => onClick?.(classItem)}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900">{classItem.name}</h3>
                <p className="text-sm text-gray-600 capitalize">
                  {LEVEL_LABELS[classItem.level] || classItem.level}
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <BookOpen className="text-blue-600" size={24} />
              </div>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 flex items-center gap-2">
                  <Users size={16} />
                  Élèves
                </span>
                <span className="font-bold text-gray-900">{studentCount}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 flex items-center gap-2">
                  <GraduationCap size={16} />
                  Enseignants
                </span>
                <span className="font-bold text-gray-900">{teacherCount}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Année Scolaire</span>
                <span className="font-bold text-gray-900">{classItem.academicYear}</span>
              </div>
            </div>

            <div className="flex gap-2 pt-4 border-t border-gray-200">
              {onEdit && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(classItem);
                  }}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-amber-600 hover:bg-amber-50 rounded-lg font-medium transition-colors"
                >
                  <Edit2 size={18} />
                  Modifier
                </button>
              )}
              {onDelete && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(classItem.id);
                  }}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg font-medium transition-colors"
                >
                  <Trash2 size={18} />
                  Supprimer
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ============================================================
// Détail d'une Classe — Assignation enseignants + liste élèves
// ============================================================
interface ClassDetailProps {
  classItem: Class;
  studentCount?: number;
  teacherCount?: number;
  onBack?: () => void;
  teachers?: Teacher[];
  students?: Student[];
  allStudents?: any[];
  allTeachers?: any[];
  onRefresh?: () => void;
}

export const ClassDetail: React.FC<ClassDetailProps> = ({
  classItem,
  studentCount = 0,
  teacherCount = 0,
  onBack,
  teachers = [],
  students = [],
  allStudents = [],
  allTeachers = [],
  onRefresh,
}) => {
  const [activeTab, setActiveTab] = useState<'students' | 'teachers'>('students');
  const [showAssignTeacher, setShowAssignTeacher] = useState(false);
  const [showAssignStudent, setShowAssignStudent] = useState(false);
  const [selectedTeacherId, setSelectedTeacherId] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [searchStudent, setSearchStudent] = useState('');
  const [searchTeacher, setSearchTeacher] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Données de la classe depuis Supabase
  const assignInfos = classItem.class_assignments || [];
  const enrollmentsInfo = classItem.student_enrollments || [];

  const availableTeachers = allTeachers.length > 0 ? allTeachers : teachers;

  const isTeacherAssigned = (teacherId: string) =>
    assignInfos.some((a: any) => a.teacher_id === teacherId);

  const handleAssignTeacher = async () => {
    if (!selectedTeacherId || !selectedSubject) {
      setMessage({ type: 'error', text: 'Veuillez sélectionner un enseignant et une matière.' });
      return;
    }
    setIsLoading(true);
    setMessage(null);
    try {
      const { assignTeacherToClass } = await import('@/services/db.service');
      const result = await assignTeacherToClass({
        teacherId: selectedTeacherId,
        classId: classItem.id,
        subject: selectedSubject,
        academicYearId: classItem.academic_year_id,
      });
      if (result.success) {
        setMessage({ type: 'success', text: 'Enseignant assigné avec succès !' });
        setShowAssignTeacher(false);
        setSelectedTeacherId('');
        setSelectedSubject('');
        onRefresh?.();
      } else {
        setMessage({ type: 'error', text: result.message || "Erreur lors de l'assignation." });
      }
    } catch (e: any) {
      setMessage({ type: 'error', text: e?.message || 'Erreur inattendue.' });
    }
    setIsLoading(false);
  };

  const handleRemoveTeacher = async (assignmentId: string) => {
    if (!confirm('Retirer cet enseignant de la classe ?')) return;
    setIsLoading(true);
    setMessage(null);
    try {
      const { removeTeacherFromClass } = await import('@/services/db.service');
      const result = await removeTeacherFromClass(assignmentId);
      if (result.success) {
        setMessage({ type: 'success', text: 'Enseignant retiré de la classe.' });
        onRefresh?.();
      } else {
        setMessage({ type: 'error', text: result.message || 'Erreur lors du retrait.' });
      }
    } catch (e: any) {
      setMessage({ type: 'error', text: e?.message || 'Erreur inattendue.' });
    }
    setIsLoading(false);
  };

  const handleAssignStudent = async () => {
    if (!selectedStudentId) {
      setMessage({ type: 'error', text: 'Veuillez sélectionner un élève.' });
      return;
    }
    setIsLoading(true);
    setMessage(null);
    try {
      const { assignStudentToClass } = await import('@/services/db.service');
      const result = await assignStudentToClass({
        studentId: selectedStudentId,
        classId: classItem.id,
        academicYearId: classItem.academic_year_id,
      });
      if (result.success) {
        setMessage({ type: 'success', text: 'Élève inscrit dans la classe avec succès !' });
        setShowAssignStudent(false);
        setSelectedStudentId('');
        onRefresh?.();
      } else {
        setMessage({ type: 'error', text: result.message || "Erreur lors de l'inscription." });
      }
    } catch (e: any) {
      setMessage({ type: 'error', text: e?.message || 'Erreur inattendue.' });
    }
    setIsLoading(false);
  };

  const handleRemoveStudent = async (enrollmentId: string) => {
    if (!confirm('Retirer cet élève de la classe ?')) return;
    setIsLoading(true);
    setMessage(null);
    try {
      const { removeStudentFromClass } = await import('@/services/db.service');
      const result = await removeStudentFromClass(enrollmentId);
      if (result.success) {
        setMessage({ type: 'success', text: 'Élève retiré de la classe.' });
        onRefresh?.();
      } else {
        setMessage({ type: 'error', text: result.message || 'Erreur lors du retrait.' });
      }
    } catch (e: any) {
      setMessage({ type: 'error', text: e?.message || 'Erreur inattendue.' });
    }
    setIsLoading(false);
  };

  // Élèves de la classe depuis les vraies inscriptions
  const classStudents = enrollmentsInfo
    .map((enr: any) => {
      const student = enr.students;
      if (!student) return null;
      return {
        id: student.id,
        enrollmentId: enr.id,
        matricule: student.matricule || '',
        firstName: student.users?.first_name || '',
        lastName: student.users?.last_name || '',
        email: student.users?.email || '',
        phone: student.users?.phone || '',
        status: enr.status || student.status || 'active',
      };
    })
    .filter(Boolean);

  // Enseignants de la classe depuis les vraies assignations
  const classTeachers = assignInfos
    .map((ass: any) => {
      const teacher = ass.teacher_profiles;
      if (!teacher) return null;
      return {
        id: teacher.id,
        assignmentId: ass.id,
        matricule: teacher.matricule || '',
        firstName: teacher.users?.first_name || '',
        lastName: teacher.users?.last_name || '',
        email: teacher.users?.email || '',
        subject: ass.subject || '',
        status: teacher.status || 'active',
      };
    })
    .filter(Boolean);

  // Élèves non encore dans cette classe (pour assignation)
  const studentsNotInClass =
    allStudents.length > 0
      ? allStudents.filter((s: any) => {
          const isInClass = enrollmentsInfo.some(
            (e: any) => e.student_id === s.id && e.status !== 'inactive' && e.status !== 'transferred'
          );
          return !isInClass;
        })
      : students.filter((s) => s.classId !== classItem.id);

  // Recherche élève pour assignation
  const filteredStudentsToAdd = studentsNotInClass.filter((s: any) => {
    const fullName = `${s.firstName || s.users?.first_name || ''} ${s.lastName || s.users?.last_name || ''}`.toLowerCase();
    const mat = (s.matricule || '').toLowerCase();
    return (
      fullName.includes(searchStudent.toLowerCase()) ||
      mat.includes(searchStudent.toLowerCase())
    );
  });

  // Recherche enseignant pour assignation
  const filteredTeachers = availableTeachers.filter((t: any) => {
    if (isTeacherAssigned(t.id)) return false;
    const fullName = `${t.firstName || t.users?.first_name || ''} ${t.lastName || t.users?.last_name || ''}`.toLowerCase();
    return fullName.includes(searchTeacher.toLowerCase());
  });

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 sm:p-8 shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        {onBack && (
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium"
          >
            <ArrowLeft size={18} />
            Retour
          </button>
        )}
        <div className="flex items-center gap-3">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">{classItem.name}</h2>
          <span className="inline-block px-4 py-1 bg-blue-100 text-blue-700 rounded-full font-semibold text-sm">
            {LEVEL_LABELS[classItem.level] || classItem.level}
          </span>
        </div>
        <div className="text-right text-sm text-gray-500">
          <p>Année: {classItem.academicYear}</p>
          {classItem.room_number && <p>Salle: {classItem.room_number}</p>}
        </div>
      </div>

      {/* Message */}
      {message && (
        <div
          className={`mb-4 p-4 rounded-lg flex items-center gap-3 ${
            message.type === 'success'
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {message.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
          <span className="flex-1">{message.text}</span>
          <button onClick={() => setMessage(null)} className="text-gray-400 hover:text-gray-600">
            <X size={18} />
          </button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <p className="text-xs font-semibold text-gray-600 uppercase">Élèves</p>
          <p className="text-3xl font-bold text-blue-600 mt-1">{classStudents.length || studentCount}</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <p className="text-xs font-semibold text-gray-600 uppercase">Enseignants</p>
          <p className="text-3xl font-bold text-green-600 mt-1">{classTeachers.length || teacherCount}</p>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
          <p className="text-xs font-semibold text-gray-600 uppercase">Matières</p>
          <p className="text-3xl font-bold text-purple-600 mt-1">
            {new Set(classTeachers.map((t: any) => t.subject)).size}
          </p>
        </div>
        <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
          <p className="text-xs font-semibold text-gray-600 uppercase">Année Scolaire</p>
          <p className="text-sm font-bold text-orange-600 mt-1">{classItem.academicYear}</p>
        </div>
      </div>

      {/* Onglets */}
      <div className="flex gap-2 mb-6 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('students')}
          className={`px-4 py-2 font-medium text-sm rounded-t-lg transition-colors ${
            activeTab === 'students' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <div className="flex items-center gap-2">
            <Users size={16} />
            Élèves ({classStudents.length || studentCount})
          </div>
        </button>
        <button
          onClick={() => setActiveTab('teachers')}
          className={`px-4 py-2 font-medium text-sm rounded-t-lg transition-colors ${
            activeTab === 'teachers' ? 'bg-green-600 text-white' : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <div className="flex items-center gap-2">
            <GraduationCap size={16} />
            Enseignants ({classTeachers.length || teacherCount})
          </div>
        </button>
      </div>

      {/* Onglet Élèves */}
      {activeTab === 'students' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Rechercher un élève..."
                value={searchStudent}
                onChange={(e) => setSearchStudent(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
            <button
              onClick={() => setShowAssignStudent(!showAssignStudent)}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors text-sm"
            >
              <UserPlus size={18} />
              Assigner un Élève
            </button>
          </div>

          {/* Formulaire assignation élève */}
          {showAssignStudent && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
              <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                <UserPlus size={18} className="text-blue-600" />
                Inscrire un élève dans {classItem.name}
              </h4>
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="">Sélectionner un élève...</option>
                {filteredStudentsToAdd.map((s: any) => (
                  <option key={s.id} value={s.id}>
                    {s.matricule} — {s.firstName || s.users?.first_name || ''} {s.lastName || s.users?.last_name || ''}
                  </option>
                ))}
              </select>
              <div className="flex gap-2">
                <button
                  onClick={handleAssignStudent}
                  disabled={isLoading}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors text-sm disabled:opacity-50"
                >
                  <Plus size={18} />
                  {isLoading ? 'Inscription...' : 'Inscrire'}
                </button>
                <button
                  onClick={() => setShowAssignStudent(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition-colors text-sm"
                >
                  Annuler
                </button>
              </div>
            </div>
          )}

          {/* Liste des élèves de la classe */}
          {classStudents.length > 0 ? (
            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-600 text-left">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Matricule</th>
                    <th className="px-4 py-3 font-semibold">Nom & Prénom</th>
                    <th className="px-4 py-3 font-semibold">Email</th>
                    <th className="px-4 py-3 font-semibold">Statut</th>
                    <th className="px-4 py-3 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {classStudents
                    .filter((s: any) => {
                      const fullName = `${s.firstName} ${s.lastName}`.toLowerCase();
                      return (
                        fullName.includes(searchStudent.toLowerCase()) ||
                        s.matricule.toLowerCase().includes(searchStudent.toLowerCase())
                      );
                    })
                    .map((s: any) => (
                      <tr key={s.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-mono text-xs">{s.matricule}</td>
                        <td className="px-4 py-3 font-medium text-gray-900">{s.firstName} {s.lastName}</td>
                        <td className="px-4 py-3 text-gray-500">{s.email}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              s.status === 'active'
                                ? 'bg-green-100 text-green-800'
                                : s.status === 'pending'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-gray-100 text-gray-600'
                            }`}
                          >
                            {s.status === 'active'
                              ? 'Actif'
                              : s.status === 'pending'
                                ? 'En attente'
                                : s.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => handleRemoveStudent(s.enrollmentId)}
                            disabled={isLoading}
                            className="inline-flex items-center gap-1 px-2 py-1 text-red-600 hover:bg-red-50 rounded-lg font-medium transition-colors text-xs disabled:opacity-50"
                          >
                            <UserMinus size={14} />
                            Retirer
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
              {classStudents.filter((s: any) => {
                const fullName = `${s.firstName} ${s.lastName}`.toLowerCase();
                return (
                  fullName.includes(searchStudent.toLowerCase()) ||
                  s.matricule.toLowerCase().includes(searchStudent.toLowerCase())
                );
              }).length === 0 && (
                <p className="text-center py-6 text-gray-500 text-sm">
                  Aucun élève trouvé avec ce critère de recherche.
                </p>
              )}
            </div>
          ) : (
            <div className="text-center py-10 bg-gray-50 rounded-lg border border-gray-200">
              <Users className="mx-auto text-gray-400 mb-2" size={40} />
              <p className="text-gray-600 font-medium">Aucun élève dans cette classe</p>
              <p className="text-gray-400 text-sm mt-1">
                Cliquez sur « Assigner un Élève » pour inscrire un élève dans {classItem.name}.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Onglet Enseignants */}
      {activeTab === 'teachers' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Rechercher un enseignant..."
                value={searchTeacher}
                onChange={(e) => setSearchTeacher(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
            <button
              onClick={() => setShowAssignTeacher(!showAssignTeacher)}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors text-sm"
            >
              <UserPlus size={18} />
              Assigner un Enseignant
            </button>
          </div>

          {/* Formulaire assignation enseignant */}
          {showAssignTeacher && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-3">
              <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                <GraduationCap size={18} className="text-green-600" />
                Assigner un enseignant à {classItem.name}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <select
                  value={selectedTeacherId}
                  onChange={(e) => setSelectedTeacherId(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                >
                  <option value="">Sélectionner un enseignant...</option>
                  {filteredTeachers.map((t: any) => (
                    <option key={t.id} value={t.id}>
                      {t.firstName || t.users?.first_name || ''} {t.lastName || t.users?.last_name || ''}
                      {t.subjects?.length > 0 ? ` (${t.subjects.join(', ')})` : ''}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="Matière enseignée (ex: Mathématiques)"
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleAssignTeacher}
                  disabled={isLoading}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors text-sm disabled:opacity-50"
                >
                  <Plus size={18} />
                  {isLoading ? 'Assignation...' : "Assigner l'enseignant"}
                </button>
                <button
                  onClick={() => setShowAssignTeacher(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition-colors text-sm"
                >
                  Annuler
                </button>
              </div>
            </div>
          )}

          {/* Liste des enseignants de la classe */}
          {classTeachers.length > 0 ? (
            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-600 text-left">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Matricule</th>
                    <th className="px-4 py-3 font-semibold">Nom & Prénom</th>
                    <th className="px-4 py-3 font-semibold">Matière</th>
                    <th className="px-4 py-3 font-semibold">Statut</th>
                    <th className="px-4 py-3 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {classTeachers
                    .filter((t: any) => {
                      const fullName = `${t.firstName} ${t.lastName}`.toLowerCase();
                      return (
                        fullName.includes(searchTeacher.toLowerCase()) ||
                        (t.subject || '').toLowerCase().includes(searchTeacher.toLowerCase())
                      );
                    })
                    .map((t: any) => (
                      <tr key={t.assignmentId} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-mono text-xs">{t.matricule}</td>
                        <td className="px-4 py-3 font-medium text-gray-900">{t.firstName} {t.lastName}</td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center px-2 py-1 rounded-full bg-purple-100 text-purple-800 text-xs font-medium">
                            {t.subject}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              t.status === 'active'
                                ? 'bg-green-100 text-green-800'
                                : t.status === 'pending'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-gray-100 text-gray-600'
                            }`}
                          >
                            {t.status === 'active'
                              ? 'Actif'
                              : t.status === 'pending'
                                ? 'En attente'
                                : t.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => handleRemoveTeacher(t.assignmentId)}
                            disabled={isLoading}
                            className="inline-flex items-center gap-1 px-2 py-1 text-red-600 hover:bg-red-50 rounded-lg font-medium transition-colors text-xs disabled:opacity-50"
                          >
                            <UserMinus size={14} />
                            Retirer
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
              {classTeachers.filter((t: any) => {
                const fullName = `${t.firstName} ${t.lastName}`.toLowerCase();
                return (
                  fullName.includes(searchTeacher.toLowerCase()) ||
                  (t.subject || '').toLowerCase().includes(searchTeacher.toLowerCase())
                );
              }).length === 0 && (
                <p className="text-center py-6 text-gray-500 text-sm">
                  Aucun enseignant trouvé avec ce critère de recherche.
                </p>
              )}
            </div>
          ) : (
            <div className="text-center py-10 bg-gray-50 rounded-lg border border-gray-200">
              <GraduationCap className="mx-auto text-gray-400 mb-2" size={40} />
              <p className="text-gray-600 font-medium">Aucun enseignant assigné à cette classe</p>
              <p className="text-gray-400 text-sm mt-1">
                Cliquez sur « Assigner un Enseignant » pour assigner un enseignant à {classItem.name}.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
