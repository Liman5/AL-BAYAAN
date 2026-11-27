'use client';

import React, { useState, useEffect } from 'react';
import { FileText, Plus, Save, X, TrendingUp, CheckCircle2, Clock } from 'lucide-react';
import {
  createHomework, addStudentGrade, getHomeworksForClass, getGradesForClass,
  getCurrentAcademicYear, Homework
} from '@/lib/schoolData';
import { HAS_SUPABASE } from '@/lib/env';
import { saveTeacherHomework, saveStudentGrades } from '@/services/db.service';

interface HomeworkGradesModuleProps {
  classId: string;
  className: string;
  teacherId: string;
  teacherName: string;
  subjects: string[];
  students: Array<{ id: string; name: string; matricule?: string }>;
  // Contexte Supabase optionnel
  dbTeacherId?: string;
  dbAcademicYearId?: string;
}

export default function HomeworkGradesModule({
  classId, className, teacherId, teacherName, subjects, students,
  dbTeacherId, dbAcademicYearId,
}: HomeworkGradesModuleProps) {
  const [activeTab, setActiveTab] = useState<'homework' | 'grades'>('homework');
  const academicYear = getCurrentAcademicYear();

  // Devoirs
  const [showHomeworkForm, setShowHomeworkForm] = useState(false);
  const [hwForm, setHwForm] = useState({ title: '', description: '', subject: subjects[0] || '', dueDate: '' });
  const [homeworks, setHomeworks] = useState<Homework[]>(() => getHomeworksForClass(classId, academicYear));

  // Notes
  const [gradeForm, setGradeForm] = useState({
    subject: subjects[0] || '',
    assignmentType: 'devoir' as 'devoir' | 'interrogation' | 'examen',
    coefficient: 1,
    date: new Date().toISOString().split('T')[0],
  });
  const [gradesByStudent, setGradesByStudent] = useState<Record<string, string>>({});
  const [grades, setGrades] = useState(() => getGradesForClass(classId, academicYear));

  // Charger les devoirs/notes Supabase quand disponible
  const canUseDb = HAS_SUPABASE && dbTeacherId && dbAcademicYearId;

  useEffect(() => {
    async function loadFromDb() {
      if (!canUseDb) return;
      try {
        const { fetchTeacherHomeworks, fetchTeacherGrades } = await import('@/services/db.service');
        const [dbHomeworks, dbGrades] = await Promise.all([
          fetchTeacherHomeworks(dbTeacherId!),
          fetchTeacherGrades(dbTeacherId!),
        ]);

        // Map homeworks → format local
        const mappedHomeworks: Homework[] = (dbHomeworks || [])
          .filter((hw: any) => hw.class_id === classId)
          .map((hw: any) => ({
            id: hw.id,
            title: hw.title,
            description: hw.description || '',
            subject: hw.subject,
            className: hw.classes?.name || className,
            classId: hw.class_id,
            teacherId: hw.teacher_id,
            teacherName: teacherName,
            publishedDate: hw.published_date || hw.created_at,
            dueDate: hw.due_date,
            academicYear,
            createdAt: hw.created_at,
          }));
        if (mappedHomeworks.length > 0) setHomeworks(mappedHomeworks);

        // Map grades → format local
        const mappedGrades = (dbGrades || [])
          .filter((g: any) => g.class_id === classId)
          .map((g: any) => ({
            id: g.id,
            studentId: g.student_id,
            studentName: g.students?.users
              ? `${g.students.users.first_name || ''} ${g.students.users.last_name || ''}`.trim()
              : g.students?.matricule || '',
            matricule: g.students?.matricule || '',
            classId: g.class_id,
            className: g.classes?.name || className,
            teacherId: g.teacher_id,
            teacherName: teacherName,
            subject: g.subject,
            assignmentType: (g.grade_type === 'interrogation' ? 'interrogation' : g.grade_type === 'examen' ? 'examen' : 'devoir') as 'devoir' | 'interrogation' | 'examen',
            grade: g.grade,
            coefficient: g.coefficient || 1,
            date: g.grade_date,
            academicYear,
            createdAt: g.created_at,
          }));
        if (mappedGrades.length > 0) setGrades(mappedGrades as any);
      } catch {
        // Silencieux
      }
    }
    loadFromDb();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canUseDb, classId]);

  async function handleCreateHomework(e: React.FormEvent) {
    e.preventDefault();
    if (!hwForm.title || !hwForm.dueDate) return;

    // 1. Essayer Supabase
    if (canUseDb) {
      try {
        const result = await saveTeacherHomework({
          title: hwForm.title,
          description: hwForm.description,
          subject: hwForm.subject,
          class_id: classId,
          teacher_id: dbTeacherId!,
          academic_year_id: dbAcademicYearId!,
          due_date: hwForm.dueDate,
        });
        if (result.success) {
          // Recharger depuis Supabase
          const { fetchTeacherHomeworks } = await import('@/services/db.service');
          const dbHomeworks = await fetchTeacherHomeworks(dbTeacherId!);
          const mapped = (dbHomeworks || [])
            .filter((hw: any) => hw.class_id === classId)
            .map((hw: any) => ({
              id: hw.id,
              title: hw.title,
              description: hw.description || '',
              subject: hw.subject,
              className: hw.classes?.name || className,
              classId: hw.class_id,
              teacherId: hw.teacher_id,
              teacherName: teacherName,
              publishedDate: hw.published_date || hw.created_at,
              dueDate: hw.due_date,
              academicYear,
              createdAt: hw.created_at,
            }));
          setHomeworks(mapped);
          setShowHomeworkForm(false);
          setHwForm({ title: '', description: '', subject: subjects[0] || '', dueDate: '' });
          return;
        }
      } catch {
        // Fallback localStorage
      }
    }

    // 2. Fallback localStorage
    createHomework({
      title: hwForm.title,
      description: hwForm.description,
      subject: hwForm.subject,
      className,
      classId,
      teacherId,
      teacherName,
      publishedDate: new Date().toISOString(),
      dueDate: hwForm.dueDate,
      academicYear,
    });
    setHomeworks(getHomeworksForClass(classId, academicYear));
    setShowHomeworkForm(false);
    setHwForm({ title: '', description: '', subject: subjects[0] || '', dueDate: '' });
  }

  async function handleSaveGrades() {
    const entries = Object.entries(gradesByStudent)
      .map(([studentId, gradeStr]) => {
        const grade = parseFloat(gradeStr);
        if (isNaN(grade) || grade < 0 || grade > 20) return null;
        const student = students.find((s) => s.id === studentId);
        if (!student) return null;
        return {
          student,
          grade,
        };
      })
      .filter((e): e is { student: { id: string; name: string; matricule?: string }; grade: number } => e !== null);

    if (entries.length === 0) return;

    // 1. Essayer Supabase
    if (canUseDb) {
      try {
        const result = await saveStudentGrades(
          entries.map(({ student, grade }) => ({
            grade,
            coefficient: gradeForm.coefficient,
            grade_type: gradeForm.assignmentType,
            grade_date: gradeForm.date + 'T00:00:00',
            student_id: student.id,
            class_id: classId,
            teacher_id: dbTeacherId!,
            subject: gradeForm.subject,
            academic_year_id: dbAcademicYearId!,
          }))
        );
        if (result.success) {
          // Recharger depuis Supabase
          const { fetchTeacherGrades } = await import('@/services/db.service');
          const dbGrades = await fetchTeacherGrades(dbTeacherId!);
          const mapped = (dbGrades || [])
            .filter((g: any) => g.class_id === classId)
            .map((g: any) => ({
              id: g.id,
              studentId: g.student_id,
              studentName: g.students?.users
                ? `${g.students.users.first_name || ''} ${g.students.users.last_name || ''}`.trim()
                : g.students?.matricule || '',
              matricule: g.students?.matricule || '',
              classId: g.class_id,
              className: g.classes?.name || className,
              teacherId: g.teacher_id,
              teacherName: teacherName,
              subject: g.subject,
              assignmentType: (g.grade_type === 'interrogation' ? 'interrogation' : g.grade_type === 'examen' ? 'examen' : 'devoir') as 'devoir' | 'interrogation' | 'examen',
              grade: g.grade,
              coefficient: g.coefficient || 1,
              date: g.grade_date,
              academicYear,
              createdAt: g.created_at,
            }));
          setGrades(mapped as any);
          setGradesByStudent({});
          return;
        }
      } catch {
        // Fallback localStorage
      }
    }

    // 2. Fallback localStorage
    entries.forEach(({ student, grade }) => {
      addStudentGrade({
        studentId: student.id,
        studentName: student.name,
        matricule: student.matricule || '',
        classId,
        className,
        teacherId,
        teacherName,
        subject: gradeForm.subject,
        assignmentType: gradeForm.assignmentType,
        grade,
        coefficient: gradeForm.coefficient,
        date: gradeForm.date,
        academicYear,
      });
    });
    setGrades(getGradesForClass(classId, academicYear));
    setGradesByStudent({});
  }

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setActiveTab('homework')}
          className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${
            activeTab === 'homework'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <FileText size={16} />
          Devoirs
        </button>
        <button
          onClick={() => setActiveTab('grades')}
          className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${
            activeTab === 'grades'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <TrendingUp size={16} />
          Attribution des notes
        </button>
      </div>

      {/* CRÉER UN DEVOIR */}
      {activeTab === 'homework' && (
        <div className="space-y-6">
          <div className="flex justify-end">
            <button
              onClick={() => setShowHomeworkForm(!showHomeworkForm)}
              className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-700 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-emerald-600/20 transition-all hover:shadow-lg hover:-translate-y-0.5"
            >
              {showHomeworkForm ? <X size={16} /> : <Plus size={16} />}
              {showHomeworkForm ? 'Annuler' : 'Nouveau devoir'}
            </button>
          </div>

          {showHomeworkForm && (
            <form onSubmit={handleCreateHomework} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900">Créer un devoir</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">Titre</label>
                  <input
                    type="text"
                    value={hwForm.title}
                    onChange={(e) => setHwForm({ ...hwForm, title: e.target.value })}
                    placeholder="Ex: Devoir sur les fractions"
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                    required
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">Matière</label>
                  <select
                    value={hwForm.subject}
                    onChange={(e) => setHwForm({ ...hwForm, subject: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                  >
                    {subjects.map((subject) => (
                      <option key={subject} value={subject}>{subject}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">Date limite</label>
                  <input
                    type="date"
                    value={hwForm.dueDate}
                    onChange={(e) => setHwForm({ ...hwForm, dueDate: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                    required
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">Classe</label>
                  <input
                    type="text"
                    value={className}
                    disabled
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-500"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Description</label>
                <textarea
                  value={hwForm.description}
                  onChange={(e) => setHwForm({ ...hwForm, description: e.target.value })}
                  placeholder="Décrivez le devoir..."
                  rows={3}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                />
              </div>
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-700"
              >
                <Save size={16} />
                Publier le devoir
              </button>
            </form>
          )}

          {/* Liste des devoirs */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-900">
              <FileText size={18} className="text-emerald-600" />
              Devoirs de {className} — {academicYear}
            </h3>
            {homeworks.length === 0 ? (
              <p className="text-center py-8 text-sm text-slate-500">Aucun devoir pour cette classe.</p>
            ) : (
              <div className="space-y-3">
                {homeworks.map((hw) => (
                  <div key={hw.id} className="flex items-start justify-between rounded-2xl border border-slate-100 bg-slate-50/50 p-4">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
                        <FileText size={16} />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">{hw.title}</p>
                        <p className="text-xs text-slate-500">{hw.subject} · {hw.className}</p>
                        {hw.description && <p className="mt-1 text-sm text-slate-600">{hw.description}</p>}
                      </div>
                    </div>
                    <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                      <Clock size={12} />
                      {new Date(hw.dueDate).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* SAISIE DES NOTES */}
      {activeTab === 'grades' && (
        <div className="space-y-6">
          {/* Formulaire note */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-900">
              <TrendingUp size={18} className="text-emerald-600" />
              Attribuer des notes — {className}
            </h3>

            <div className="mb-4 grid gap-4 sm:grid-cols-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Matière</label>
                <select
                  value={gradeForm.subject}
                  onChange={(e) => setGradeForm({ ...gradeForm, subject: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                >
                  {subjects.map((subject) => (
                    <option key={subject} value={subject}>{subject}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Type</label>
                <select
                  value={gradeForm.assignmentType}
                  onChange={(e) => setGradeForm({ ...gradeForm, assignmentType: e.target.value as any })}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                >
                  <option value="devoir">Devoir</option>
                  <option value="interrogation">Interrogation</option>
                  <option value="examen">Examen</option>
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Coefficient</label>
                <input
                  type="number"
                  min={1}
                  max={5}
                  value={gradeForm.coefficient}
                  onChange={(e) => setGradeForm({ ...gradeForm, coefficient: parseInt(e.target.value) || 1 })}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Date</label>
                <input
                  type="date"
                  value={gradeForm.date}
                  onChange={(e) => setGradeForm({ ...gradeForm, date: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                />
              </div>
            </div>

            {/* Tableau de saisie */}
            <div className="overflow-hidden rounded-2xl border border-slate-100">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-100">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Élève</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Matricule</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Note /20</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 bg-white">
                    {students.map((student) => (
                      <tr key={student.id}>
                        <td className="whitespace-nowrap px-6 py-3 text-sm font-semibold text-slate-900">{student.name}</td>
                        <td className="whitespace-nowrap px-6 py-3 text-sm text-slate-600">{student.matricule || '-'}</td>
                        <td className="whitespace-nowrap px-6 py-3">
                          <input
                            type="number"
                            min={0}
                            max={20}
                            step={0.25}
                            value={gradesByStudent[student.id] ?? ''}
                            onChange={(e) => setGradesByStudent({ ...gradesByStudent, [student.id]: e.target.value })}
                            placeholder="—"
                            className="w-24 rounded-lg border border-slate-200 px-3 py-2 text-center text-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <button
              onClick={handleSaveGrades}
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-700"
            >
              <Save size={16} />
              Enregistrer les notes
            </button>
          </div>

          {/* Notes existantes */}
          {grades.length > 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-900">
                <CheckCircle2 size={18} className="text-emerald-600" />
                Notes enregistrées
              </h3>
              <div className="overflow-hidden rounded-2xl border border-slate-100">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-100">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">Élève</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">Matière</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">Type</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">Note</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 bg-white">
                      {grades.map((grade) => (
                        <tr key={grade.id}>
                          <td className="px-4 py-3 text-sm font-semibold text-slate-900">{grade.studentName}</td>
                          <td className="px-4 py-3 text-sm text-slate-600">{grade.subject}</td>
                          <td className="px-4 py-3 text-sm capitalize text-slate-600">{grade.assignmentType}</td>
                          <td className="px-4 py-3 text-sm font-bold text-emerald-600">{grade.grade}/20</td>
                          <td className="px-4 py-3 text-sm text-slate-600">{new Date(grade.date).toLocaleDateString('fr-FR')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}