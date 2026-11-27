'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, CheckCircle2, Clock, XCircle, AlertCircle, Save, UserCheck, UserX } from 'lucide-react';
import {
  AttendanceStatus,
  getAttendanceForClass,
  saveAttendanceForClass,
} from '@/lib/schoolData';
import { HAS_SUPABASE } from '@/lib/env';
import {
  fetchTeacherClasses,
  fetchAttendanceForClass,
  upsertAttendanceRecords,
} from '@/services/db.service';

interface AttendanceModuleProps {
  classId: string;
  className: string;
  teacherId: string;
  teacherName: string;
  academicYear: string;
  students: Array<{ id: string; name: string; matricule?: string }>;
}

const statusConfigs: Record<AttendanceStatus, { label: string; color: string; activeColor: string; icon: React.ReactNode }> = {
  present: {
    label: 'Présent',
    color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    activeColor: 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/20',
    icon: <CheckCircle2 size={16} />,
  },
  absent: {
    label: 'Absent',
    color: 'bg-red-50 text-red-700 border-red-200',
    activeColor: 'bg-red-600 text-white border-red-600 shadow-md shadow-red-600/20',
    icon: <XCircle size={16} />,
  },
  late: {
    label: 'En retard',
    color: 'bg-amber-50 text-amber-700 border-amber-200',
    activeColor: 'bg-amber-500 text-white border-amber-500 shadow-md shadow-amber-500/20',
    icon: <Clock size={16} />,
  },
  excused: {
    label: 'Excusé',
    color: 'bg-blue-50 text-blue-700 border-blue-200',
    activeColor: 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-600/20',
    icon: <AlertCircle size={16} />,
  },
};

const statusOrder: AttendanceStatus[] = ['present', 'absent', 'late', 'excused'];

export default function AttendanceModule({
  classId,
  className,
  teacherId,
  teacherName,
  academicYear,
  students,
}: AttendanceModuleProps) {
  const today = new Date().toISOString().split('T')[0];
  const [date, setDate] = useState(today);
  const [entries, setEntries] = useState<Record<string, AttendanceStatus>>(() => {
    const saved = getAttendanceForClass(classId, today);
    const initial: Record<string, AttendanceStatus> = {};
    students.forEach((student) => {
      const record = saved.find((r) => r.studentId === student.id);
      initial[student.id] = record ? record.status : 'present';
    });
    return initial;
  });
  const [comments, setComments] = useState<Record<string, string>>(() => {
    const saved = getAttendanceForClass(classId, today);
    const initial: Record<string, string> = {};
    saved.forEach((record) => {
      initial[record.studentId] = record.comment || '';
    });
    return initial;
  });
  const [saved, setSaved] = useState(false);
  const [dbState, setDbState] = useState<{
    ready: boolean;
    teacherProfileId: string | null;
    academicYearId: string | null;
  }>({ ready: false, teacherProfileId: null, academicYearId: null });

  // Résoudre le profil enseignant + academic_year_id pour Supabase
  useEffect(() => {
    async function resolveDbContext() {
      if (!HAS_SUPABASE) {
        setDbState({ ready: true, teacherProfileId: null, academicYearId: null });
        return;
      }
      try {
        const result = await fetchTeacherClasses(null, teacherId);
        const teacherProfileId = result.teacher?.id || null;
        // academicYear ressemble à "2025-2026" → id DB "ay-2025-2026"
        let academicYearId: string | null = null;
        if (result.classes && result.classes.length > 0) {
          const match = result.classes[0]?.academic_years;
          if (match) academicYearId = match.id;
        }
        if (!academicYearId) academicYearId = `ay-${academicYear}`;
        setDbState({ ready: true, teacherProfileId, academicYearId });
      } catch {
        setDbState({ ready: true, teacherProfileId: null, academicYearId: null });
      }
    }
    resolveDbContext();
  }, [teacherId, academicYear]);

  // Charger les présences depuis Supabase quand disponible
  useEffect(() => {
    async function loadFromDb() {
      if (!dbState.ready || !dbState.teacherProfileId || !HAS_SUPABASE) return;
      try {
        const records = await fetchAttendanceForClass(classId, date);
        if (records && records.length > 0) {
          const newEntries: Record<string, AttendanceStatus> = {};
          const newComments: Record<string, string> = {};
          students.forEach((student) => {
            const record = records.find((r: any) => r.student_id === student.id);
            newEntries[student.id] = record ? record.status : (entries[student.id] || 'present');
            newComments[student.id] = record?.comment || '';
          });
          setEntries(newEntries);
          setComments(newComments);
        }
      } catch {
        // Silencieux : on garde le localStorage
      }
    }
    loadFromDb();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dbState.ready, date, classId]);

  function handleDateChange(newDate: string) {
    setDate(newDate);
    const savedRecords = getAttendanceForClass(classId, newDate);
    const newEntries: Record<string, AttendanceStatus> = {};
    const newComments: Record<string, string> = {};
    students.forEach((student) => {
      const record = savedRecords.find((r) => r.studentId === student.id);
      newEntries[student.id] = record ? record.status : 'present';
      newComments[student.id] = record?.comment || '';
    });
    setEntries(newEntries);
    setComments(newComments);
    setSaved(false);
  }

  function handleStatusChange(studentId: string, status: AttendanceStatus) {
    setEntries((prev) => ({ ...prev, [studentId]: status }));
    setSaved(false);
  }

  async function handleSave() {
    const payload = students.map((student) => ({
      studentId: student.id,
      studentName: student.name,
      status: entries[student.id] || 'present',
      comment: comments[student.id] || undefined,
    }));

    // 1. Essayer Supabase si configuré + profil résolu
    if (HAS_SUPABASE && dbState.teacherProfileId && dbState.academicYearId) {
      try {
        const result = await upsertAttendanceRecords(
          payload.map((entry) => ({
            student_id: entry.studentId,
            class_id: classId,
            teacher_id: dbState.teacherProfileId!,
            academic_year_id: dbState.academicYearId!,
            date,
            status: entry.status,
            comment: entry.comment,
          }))
        );
        if (result.success) {
          setSaved(true);
          return;
        }
        // Sinon fallback localStorage
      } catch {
        // Fallback localStorage
      }
    }

    // 2. Fallback localStorage (mode démo / sans Supabase)
    saveAttendanceForClass(
      classId,
      className,
      date,
      teacherId,
      teacherName,
      academicYear,
      payload
    );
    setSaved(true);
  }

  const presentCount = Object.values(entries).filter((s) => s === 'present').length;
  const absentCount = Object.values(entries).filter((s) => s === 'absent').length;
  const lateCount = Object.values(entries).filter((s) => s === 'late').length;
  const excusedCount = Object.values(entries).filter((s) => s === 'excused').length;

  return (
    <div className="space-y-6">
      {/* Header : date + compteurs */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Calendar size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="date"
              value={date}
              onChange={(e) => handleDateChange(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm shadow-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
            />
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700">
            <UserCheck size={14} className="text-emerald-600" />
            {presentCount} présent{presentCount > 1 ? 's' : ''}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700">
            <UserX size={14} className="text-red-600" />
            {absentCount} absent{absentCount > 1 ? 's' : ''}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700">
            <Clock size={14} className="text-amber-600" />
            {lateCount} retard{lateCount > 1 ? 's' : ''}
          </span>
        </div>

        <button
          onClick={handleSave}
          className={`inline-flex items-center justify-center gap-2 rounded-2xl px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl ${
            saved
              ? 'bg-emerald-600 shadow-emerald-600/20'
              : 'bg-gradient-to-r from-emerald-600 to-emerald-700 shadow-emerald-600/20 hover:shadow-emerald-600/30'
          }`}
        >
          <Save size={18} />
          {saved ? 'Appel enregistré ✓' : 'Enregistrer l\'appel'}
        </button>
      </div>

      {/* Tableau des élèves */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Élève</th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Matricule</th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Présence</th>
                <th className="hidden md:table-cell px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Commentaire</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {students.map((student) => (
                <tr key={student.id} className="transition-colors hover:bg-emerald-50/30">
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-xs font-bold text-white">
                        {student.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                      </div>
                      <span className="font-semibold text-slate-900">{student.name}</span>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-600">
                    {student.matricule || '-'}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="flex flex-wrap gap-1.5">
                      {statusOrder.map((status) => {
                        const config = statusConfigs[status];
                        const active = entries[student.id] === status;
                        return (
                          <button
                            key={status}
                            onClick={() => handleStatusChange(student.id, status)}
                            className={`inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-semibold transition-all ${
                              active ? config.activeColor : `${config.color} hover:opacity-80`
                            }`}
                          >
                            {config.icon}
                            {config.label}
                          </button>
                        );
                      })}
                    </div>
                  </td>
                  <td className="hidden md:table-cell px-6 py-4">
                    <input
                      type="text"
                      value={comments[student.id] || ''}
                      onChange={(e) => {
                        setComments((prev) => ({ ...prev, [student.id]: e.target.value }));
                        setSaved(false);
                      }}
                      placeholder="Commentaire..."
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}