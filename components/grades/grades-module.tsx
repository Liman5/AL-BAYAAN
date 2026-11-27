'use client';

import { useState, useMemo, useEffect } from 'react';
import { AcademicLevel, Term, AssessmentType, GradeEntry } from '@/types/grades';
import { getGradingConfig } from '@/lib/gradingConfigs';
import { getMockGrades } from '@/lib/mockGradesData';
import AcademicLevelSelector from './academic-level-selector';
import TermTabs from './term-tabs';
import CollapsibleTermSection from './collapsible-term-section';
import { Info, School } from 'lucide-react';
import { HAS_SUPABASE } from '@/lib/env';
import { getAuthUserIdFromCookie } from '@/lib/authClient';
import { fetchTeacherClasses, fetchTeacherGrades } from '@/services/db.service';

const assessmentTypes: { type: AssessmentType; label: string; icon: string }[] = [
  { type: 'class_assignments', label: 'Devoirs en Classe', icon: '📋' },
  { type: 'homework', label: 'Devoirs à la Maison', icon: '📚' },
  { type: 'continuous_assessment', label: 'Évaluation Continue', icon: '📝' },
  { type: 'final_exam', label: 'Examen Final / Composition', icon: '📊' },
];

const termLabels = {
  first: '📍 1er Trimestre',
  second: '📍 2e Trimestre',
  third: '📍 3e Trimestre',
};

// Maps Supabase grade_type → GradeEntry assessment field
type GradeField = 'classAssignments' | 'homework' | 'continuousAssessment' | 'finalExam';

const gradeTypeToField: Record<string, { field: GradeField; fallback: GradeField }> = {
  devoir: { field: 'classAssignments', fallback: 'homework' },
  interrogation: { field: 'continuousAssessment', fallback: 'classAssignments' },
  examen: { field: 'finalExam', fallback: 'classAssignments' },
};

export default function GradesModule() {
  const [academicLevel, setAcademicLevel] = useState<AcademicLevel>('primary');
  const [selectedTerm, setSelectedTerm] = useState<Term>('first');
  const [selectedAssessmentType, setSelectedAssessmentType] = useState<AssessmentType | null>(
    'class_assignments'
  );
  const [expandedTerms, setExpandedTerms] = useState<Set<Term>>(new Set(['first']));
  const [dbGrades, setDbGrades] = useState<any[]>([]);
  const [dbTeacherName, setDbTeacherName] = useState<string>('');
  const [loadedFromDb, setLoadedFromDb] = useState(false);

  // Charger les notes réelles depuis Supabase
  useEffect(() => {
    async function loadFromDb() {
      if (!HAS_SUPABASE) return;
      const uid = getAuthUserIdFromCookie();
      if (!uid) return;

      try {
        const result = await fetchTeacherClasses(null, uid);
        if (result.teacher) {
          const grades = await fetchTeacherGrades(result.teacher.id);
          setDbGrades(grades || []);
          setDbTeacherName(
            `${result.teacher.users?.first_name || ''} ${result.teacher.users?.last_name || ''}`.trim()
          );
          setLoadedFromDb(true);
        }
      } catch (e) {
        console.error('Erreur chargement notes:', e);
      }
    }
    loadFromDb();
  }, []);

  // Convertir les notes Supabase vers GradeEntry
  const convertDbGradesToEntries = (dbGradesData: any[]): GradeEntry[] => {
    const byStudent = new Map<string, GradeEntry>();

    dbGradesData.forEach((g: any) => {
      const studentId = g.student_id;
      const studentName = g.students?.users
        ? `${g.students.users.first_name || ''} ${g.students.users.last_name || ''}`.trim()
        : g.students?.matricule || studentId;

      if (!byStudent.has(studentId)) {
        byStudent.set(studentId, {
          studentId,
          studentName,
          classAssignments: null,
          homework: null,
          continuousAssessment: null,
          finalExam: null,
        });
      }

      const entry = byStudent.get(studentId)!;
      const mapping = gradeTypeToField[g.grade_type] || gradeTypeToField.devoir;
      // Utiliser la moyenne pondérée de toutes les notes du même type
      const existing = entry[mapping.field];
      const newGrade = g.grade || 0;
      if (existing === null) {
        entry[mapping.field] = Math.min(20, Math.max(0, newGrade));
      } else {
        entry[mapping.field] = Math.min(20, Math.max(0, (existing + newGrade) / 2));
      }
    });

    return Array.from(byStudent.values());
  };

  // State for editable grades - separate storage for each term
  const [termGrades, setTermGrades] = useState<Record<Term, GradeEntry[]>>(() => {
    const initial: Record<Term, GradeEntry[]> = {
      first: [],
      second: [],
      third: [],
    };
    (['first', 'second', 'third'] as Term[]).forEach((term) => {
      initial[term] = getMockGrades('primary', term);
    });
    return initial;
  });

  // Charger les notes Supabase dans le state quand disponibles
  useEffect(() => {
    if (loadedFromDb && dbGrades.length > 0) {
      const realEntries = convertDbGradesToEntries(dbGrades);
      if (realEntries.length > 0) {
        const newTermGrades: Record<Term, GradeEntry[]> = {
          first: realEntries,
          second: realEntries,
          third: realEntries,
        };
        setTermGrades(newTermGrades);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadedFromDb]);

  const gradingConfig = useMemo(
    () => getGradingConfig(academicLevel),
    [academicLevel]
  );

  // When academic level changes, reload all grades
  const handleLevelChange = (level: AcademicLevel) => {
    setAcademicLevel(level);
    const newTermGrades: Record<Term, GradeEntry[]> = {
      first: [],
      second: [],
      third: [],
    };
    (['first', 'second', 'third'] as Term[]).forEach((term) => {
      // Utiliser les données réelles si disponibles, sinon mock
      if (loadedFromDb && dbGrades.length > 0) {
        const realEntries = convertDbGradesToEntries(dbGrades);
        newTermGrades[term] = realEntries;
      } else {
        newTermGrades[term] = getMockGrades(level, term);
      }
    });
    setTermGrades(newTermGrades);
  };

  const handleTermChange = (term: Term) => {
    setSelectedTerm(term);
    // Auto-expand the newly selected term
    setExpandedTerms((prev) => new Set([term]));
    setSelectedAssessmentType('class_assignments');
  };

  const toggleTermExpanded = (term: Term) => {
    setExpandedTerms((prev) => {
      const next = new Set(prev);
      if (next.has(term)) {
        next.delete(term);
      } else {
        next.add(term);
      }
      return next;
    });
  };

  const handleGradesChange = (grades: GradeEntry[]) => {
    setTermGrades((prev) => ({
      ...prev,
      [selectedTerm]: grades,
    }));
  };

  return (
    <div className="min-h-screen bg-transparent">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-600 text-2xl shadow-lg shadow-emerald-600/20">
              📊
            </div>
            <div>
              <h1 className="text-2xl sm:text-4xl font-bold text-slate-900">Notes et Évaluations</h1>
              <p className="mt-1 text-slate-600">
                Gérez et suivez les notes des élèves selon les trimestres et les évaluations
              </p>
            </div>
          </div>
        </div>

        {/* Academic Level Selector */}
        <AcademicLevelSelector
          academicLevel={academicLevel}
          onLevelChange={handleLevelChange}
        />

        {/* School & Subject Info */}
        <div className="mb-6 overflow-hidden rounded-2xl border border-emerald-100 bg-white shadow-sm">
          <div className="border-b border-emerald-50 bg-gradient-to-r from-emerald-50 to-teal-50 px-6 py-3">
            <div className="flex items-center gap-2">
              <School size={16} className="text-emerald-600" />
              <p className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                Informations de la classe
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-6">
            <div>
              <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">ÉCOLE</p>
              <p className="mt-1 text-lg font-bold text-slate-900">{gradingConfig.schoolName}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">CLASSE</p>
              <p className="mt-1 text-lg font-bold text-slate-900">{gradingConfig.className}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">MATIÈRE</p>
              <p className="mt-1 text-lg font-bold text-slate-900">{gradingConfig.subject}</p>
            </div>
          </div>
        </div>

        {/* Term Tabs */}
        <TermTabs selectedTerm={selectedTerm} onTermChange={handleTermChange} />

        {/* Collapsible Term Sections */}
        <div className="space-y-4">
          {(['first', 'second', 'third'] as Term[]).map((term) => (
            <CollapsibleTermSection
              key={term}
              termLabel={termLabels[term]}
              assessmentTypes={assessmentTypes}
              selectedAssessmentType={selectedAssessmentType}
              onAssessmentTypeSelect={setSelectedAssessmentType}
              grades={termGrades[term]}
              onGradesChange={handleGradesChange}
              gradingConfig={gradingConfig}
              isExpanded={expandedTerms.has(term)}
              onToggleExpand={() => toggleTermExpanded(term)}
            />
          ))}
        </div>

        {/* Footer Info */}
        <div className="mt-8 flex items-start gap-3 rounded-2xl border border-blue-100 bg-blue-50/50 p-5 text-sm text-blue-900">
          <Info size={18} className="mt-0.5 shrink-0 text-blue-500" />
          <p>
            <strong>💡 Conseil:</strong> Cliquez sur n'importe quelle cellule pour modifier les notes. Les moyennes et les appréciations
            sont calculées automatiquement.
            {loadedFromDb && dbGrades.length > 0
              ? ' Les notes affichées proviennent de la base de données Supabase.'
              : ' Vos modifications sont enregistrées localement.'}
            {' '}Pour l'École Primaire et le Collège, les coefficients s'ajustent selon le niveau académique sélectionné ci-dessus.
          </p>
        </div>
      </div>
    </div>
  );
}