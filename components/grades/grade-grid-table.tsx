'use client';

import { useCallback, useMemo } from 'react';
import { GradeEntry, GradingConfig, AssessmentType } from '@/types/grades';
import { calculateAverage, getTeacherRemark } from '@/lib/gradingConfigs';

interface GradeGridTableProps {
  grades: GradeEntry[];
  onGradesChange: (grades: GradeEntry[]) => void;
  gradingConfig: GradingConfig;
  assessmentType: AssessmentType;
}

export default function GradeGridTable({
  grades,
  onGradesChange,
  gradingConfig,
  assessmentType,
}: GradeGridTableProps) {
  const updateGrade = useCallback(
    (studentId: string, field: keyof GradeEntry, value: any) => {
      const updatedGrades = grades.map((grade) => {
        if (grade.studentId === studentId) {
          const updated = { ...grade, [field]: value };
          // Recalculate average when any score changes
          if (
            field === 'classAssignments' ||
            field === 'homework' ||
            field === 'continuousAssessment' ||
            field === 'finalExam'
          ) {
            const average = calculateAverage(
              updated.classAssignments,
              updated.homework,
              updated.continuousAssessment,
              updated.finalExam,
              gradingConfig
            );
            updated.average = average ?? undefined;
            if (average !== null) {
              updated.remark = getTeacherRemark(average, gradingConfig);
            }
          }
          return updated;
        }
        return grade;
      });
      onGradesChange(updatedGrades);
    },
    [grades, onGradesChange, gradingConfig]
  );

  const stats = useMemo(() => {
    const scores = grades
      .filter((g) => g.average !== null && g.average !== undefined)
      .map((g) => g.average as number);

    if (scores.length === 0) {
      return { average: 0, min: 0, max: 0, evaluated: 0 };
    }

    return {
      average: Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 100) / 100,
      min: Math.min(...scores),
      max: Math.max(...scores),
      evaluated: scores.length,
    };
  }, [grades]);

  const getRemarkColor = (remark?: string) => {
    switch (remark) {
      case 'Excellent':
        return 'bg-emerald-100 text-emerald-800';
      case 'Very Good':
      case 'Très Bon':
        return 'bg-blue-100 text-blue-800';
      case 'Good':
      case 'Bon':
        return 'bg-cyan-100 text-cyan-800';
      case 'Fair':
      case 'Passable':
        return 'bg-amber-100 text-amber-800';
      case 'Pass':
      case 'Acceptable':
        return 'bg-orange-100 text-orange-800';
      case 'Fail':
      case 'Insuffisant':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  // Stats config for better visuals
  const statConfigs = [
    { label: 'Moyenne', value: stats.average.toFixed(2), icon: '📊', bg: 'from-emerald-50 to-emerald-100', text: 'text-emerald-800' },
    { label: 'Maximum', value: stats.max.toFixed(2), icon: '⬆️', bg: 'from-green-50 to-green-100', text: 'text-green-800' },
    { label: 'Minimum', value: stats.min.toFixed(2), icon: '⬇️', bg: 'from-red-50 to-red-100', text: 'text-red-800' },
    { label: 'Évalués', value: `${stats.evaluated}/${grades.length}`, icon: '📋', bg: 'from-purple-50 to-purple-100', text: 'text-purple-800' },
  ];

  return (
    <div className="space-y-6">
      {/* Statistics */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {statConfigs.map((stat) => (
          <div key={stat.label} className={`rounded-2xl bg-gradient-to-br ${stat.bg} p-4 shadow-sm`}>
            <div className={`flex items-center gap-1.5 text-xs font-semibold ${stat.text} mb-1`}>
              <span>{stat.icon}</span>
              {stat.label}
            </div>
            <div className={`text-2xl font-bold ${stat.text}`}>{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Responsive Table Container */}
      <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-sm">
        <table className="w-full">
          {/* Table Header */}
          <thead>
            <tr className="bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-slate-200">
              <th className="px-4 py-3.5 text-left text-sm font-bold text-slate-800 sticky left-0 bg-emerald-50 z-10 whitespace-nowrap">
                Élève
              </th>
              <th className="px-4 py-3.5 text-center text-sm font-bold text-slate-800">
                Dev. Classe
              </th>
              <th className="px-4 py-3.5 text-center text-sm font-bold text-slate-800">
                Dev. Maison
              </th>
              <th className="px-4 py-3.5 text-center text-sm font-bold text-slate-800">
                Éval. Continue
              </th>
              <th className="px-4 py-3.5 text-center text-sm font-bold text-slate-800">
                Exam Final
              </th>
              <th className="px-4 py-3.5 text-center text-sm font-bold text-slate-800">
                Moyenne
              </th>
              <th className="px-4 py-3.5 text-center text-sm font-bold text-slate-800">
                Appréciation
              </th>
              <th className="px-4 py-3.5 text-center text-sm font-bold text-slate-800">
                Signature
              </th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody>
            {grades.map((grade, index) => (
              <tr
                key={grade.studentId}
                className={`border-b border-slate-100 transition-colors ${
                  index % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'
                } hover:bg-emerald-50/40`}
              >
                {/* Student Name */}
                <td className="px-4 py-3.5 text-sm font-medium text-slate-900 sticky left-0 bg-inherit whitespace-nowrap">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-xs font-bold text-white">
                      {grade.studentName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </div>
                    {grade.studentName}
                  </div>
                </td>

                {/* Class Assignments - Editable */}
                <td className="px-4 py-3.5 text-center">
                  <input
                    type="number"
                    min="0"
                    max={gradingConfig.maxScore}
                    step="0.01"
                    value={grade.classAssignments ?? ''}
                    onChange={(e) =>
                      updateGrade(
                        grade.studentId,
                        'classAssignments',
                        e.target.value === '' ? null : parseFloat(e.target.value)
                      )
                    }
                    className="w-16 rounded-xl border border-slate-200 px-2 py-1.5 text-center text-sm transition-all focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100 hover:border-slate-300"
                    placeholder="-"
                  />
                </td>

                {/* Homework - Editable */}
                <td className="px-4 py-3.5 text-center">
                  <input
                    type="number"
                    min="0"
                    max={gradingConfig.maxScore}
                    step="0.01"
                    value={grade.homework ?? ''}
                    onChange={(e) =>
                      updateGrade(
                        grade.studentId,
                        'homework',
                        e.target.value === '' ? null : parseFloat(e.target.value)
                      )
                    }
                    className="w-16 rounded-xl border border-slate-200 px-2 py-1.5 text-center text-sm transition-all focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100 hover:border-slate-300"
                    placeholder="-"
                  />
                </td>

                {/* Continuous Assessment - Editable */}
                <td className="px-4 py-3.5 text-center">
                  <input
                    type="number"
                    min="0"
                    max={gradingConfig.maxScore}
                    step="0.01"
                    value={grade.continuousAssessment ?? ''}
                    onChange={(e) =>
                      updateGrade(
                        grade.studentId,
                        'continuousAssessment',
                        e.target.value === '' ? null : parseFloat(e.target.value)
                      )
                    }
                    className="w-16 rounded-xl border border-slate-200 px-2 py-1.5 text-center text-sm transition-all focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100 hover:border-slate-300"
                    placeholder="-"
                  />
                </td>

                {/* Final Exam - Editable */}
                <td className="px-4 py-3.5 text-center">
                  <input
                    type="number"
                    min="0"
                    max={gradingConfig.maxScore}
                    step="0.01"
                    value={grade.finalExam ?? ''}
                    onChange={(e) =>
                      updateGrade(
                        grade.studentId,
                        'finalExam',
                        e.target.value === '' ? null : parseFloat(e.target.value)
                      )
                    }
                    className="w-16 rounded-xl border border-slate-200 px-2 py-1.5 text-center text-sm transition-all focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100 hover:border-slate-300"
                    placeholder="-"
                  />
                </td>

                {/* Average - Calculated */}
                <td className="px-4 py-3.5 text-center">
                  <div className="font-bold text-emerald-700">
                    {grade.average ? grade.average.toFixed(2) : '-'}
                  </div>
                </td>

                {/* Remark - Auto-generated */}
                <td className="px-4 py-3.5 text-center">
                  {grade.remark && (
                    <span
                      className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${getRemarkColor(
                        grade.remark
                      )}`}
                    >
                      {grade.remark}
                    </span>
                  )}
                </td>

                {/* Signature - Editable */}
                <td className="px-4 py-3.5 text-center">
                  <input
                    type="text"
                    value={grade.teacherSignature ?? ''}
                    onChange={(e) =>
                      updateGrade(grade.studentId, 'teacherSignature', e.target.value)
                    }
                    className="w-20 rounded-xl border border-slate-200 px-2 py-1.5 text-center text-sm transition-all focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100 hover:border-slate-300"
                    placeholder="Sign"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Summary */}
      <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-5 text-sm text-slate-700">
        <p className="mb-2">
          <strong className="text-emerald-800">Configuration de Notation:</strong>{' '}
          Dev. Classe (20%) | Dev. Maison (15%) |
          Éval. Continue (25%) | Exam Final (40%)
        </p>
        <p className="text-slate-600">
          <strong className="text-emerald-800">Seuils:</strong> Excellent (18-20) | Très Bon (16-17) | Bon (14-15) |
          Passable (12-13) | Acceptable (10-11) | Insuffisant {'<' + '10'}
        </p>
      </div>
    </div>
  );
}