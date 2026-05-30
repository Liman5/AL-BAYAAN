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
        return 'bg-green-100 text-green-800';
      case 'Very Good':
      case 'Très Bon':
        return 'bg-blue-100 text-blue-800';
      case 'Good':
      case 'Bon':
        return 'bg-cyan-100 text-cyan-800';
      case 'Fair':
      case 'Passable':
        return 'bg-yellow-100 text-yellow-800';
      case 'Pass':
      case 'Acceptable':
        return 'bg-orange-100 text-orange-800';
      case 'Fail':
      case 'Insuffisant':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Statistics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg">
          <div className="text-xs text-blue-600 font-semibold mb-1">Moyenne</div>
          <div className="text-2xl font-bold text-blue-900">{stats.average.toFixed(2)}</div>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg">
          <div className="text-xs text-green-600 font-semibold mb-1">Maximum</div>
          <div className="text-2xl font-bold text-green-900">{stats.max.toFixed(2)}</div>
        </div>
        <div className="bg-gradient-to-br from-red-50 to-red-100 p-4 rounded-lg">
          <div className="text-xs text-red-600 font-semibold mb-1">Minimum</div>
          <div className="text-2xl font-bold text-red-900">{stats.min.toFixed(2)}</div>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg">
          <div className="text-xs text-purple-600 font-semibold mb-1">Évalués</div>
          <div className="text-2xl font-bold text-purple-900">
            {stats.evaluated}/{grades.length}
          </div>
        </div>
      </div>

      {/* Responsive Table Container */}
      <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
        <table className="w-full">
          {/* Table Header */}
          <thead>
            <tr className="bg-gray-100 border-b border-gray-200">
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 sticky left-0 bg-gray-100 z-10 whitespace-nowrap">
                Élève
              </th>
              <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900">
                Dev. Classe
              </th>
              <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900">
                Dev. Maison
              </th>
              <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900">
                Éval. Continue
              </th>
              <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900">
                Exam Final
              </th>
              <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900">
                Moyenne
              </th>
              <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900">
                Appréciation
              </th>
              <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900">
                Signature
              </th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody>
            {grades.map((grade, index) => (
              <tr
                key={grade.studentId}
                className={`border-b border-gray-200 transition-colors ${
                  index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                } hover:bg-blue-50`}
              >
                {/* Student Name */}
                <td className="px-4 py-3 text-sm font-medium text-gray-900 sticky left-0 z-10 bg-inherit whitespace-nowrap">
                  {grade.studentName}
                </td>

                {/* Class Assignments - Editable */}
                <td className="px-4 py-3 text-center">
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
                    className="w-16 px-2 py-1 border border-gray-300 rounded text-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="-"
                  />
                </td>

                {/* Homework - Editable */}
                <td className="px-4 py-3 text-center">
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
                    className="w-16 px-2 py-1 border border-gray-300 rounded text-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="-"
                  />
                </td>

                {/* Continuous Assessment - Editable */}
                <td className="px-4 py-3 text-center">
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
                    className="w-16 px-2 py-1 border border-gray-300 rounded text-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="-"
                  />
                </td>

                {/* Final Exam - Editable */}
                <td className="px-4 py-3 text-center">
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
                    className="w-16 px-2 py-1 border border-gray-300 rounded text-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="-"
                  />
                </td>

                {/* Average - Calculated */}
                <td className="px-4 py-3 text-center">
                  <div className="text-sm font-semibold text-gray-900">
                    {grade.average ? grade.average.toFixed(2) : '-'}
                  </div>
                </td>

                {/* Remark - Auto-generated */}
                <td className="px-4 py-3 text-center">
                  {grade.remark && (
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getRemarkColor(
                        grade.remark
                      )}`}
                    >
                      {grade.remark}
                    </span>
                  )}
                </td>

                {/* Signature - Editable */}
                <td className="px-4 py-3 text-center">
                  <input
                    type="text"
                    value={grade.teacherSignature ?? ''}
                    onChange={(e) =>
                      updateGrade(grade.studentId, 'teacherSignature', e.target.value)
                    }
                    className="w-20 px-2 py-1 border border-gray-300 rounded text-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Sign"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Summary */}
      <div className="text-xs text-gray-600 p-4 bg-gray-50 rounded-lg">
        <p className="mb-2">
          <strong>Configuration de Notation:</strong> Dev. Classe (20%) | Dev. Maison (15%) |
          Éval. Continue (25%) | Exam Final (40%)
        </p>
        <p>
          <strong>Seuils:</strong> Excellent (18-20) | Très Bon (16-17) | Bon (14-15) |
          Passable (12-13) | Acceptable (10-11) | Insuffisant (&lt;10)
        </p>
      </div>
    </div>
  );
}
