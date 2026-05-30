'use client';

import { useState, useMemo } from 'react';
import { AcademicLevel, Term, AssessmentType, GradeEntry } from '@/types/grades';
import { getGradingConfig } from '@/lib/gradingConfigs';
import { getMockGrades } from '@/lib/mockGradesData';
import AcademicLevelSelector from './academic-level-selector';
import TermTabs from './term-tabs';
import CollapsibleTermSection from './collapsible-term-section';

const assessmentTypes: { type: AssessmentType; label: string; icon: string }[] = [
  { type: 'class_assignments', label: 'Class Assignments', icon: '📋' },
  { type: 'homework', label: 'Homework', icon: '📚' },
  { type: 'continuous_assessment', label: 'Continuous Assessment', icon: '📝' },
  { type: 'final_exam', label: 'Final Exam / Composition', icon: '📊' },
];

const termLabels = {
  first: '📍 First Term',
  second: '📍 Second Term',
  third: '📍 Third Term',
};

export default function GradesModule() {
  const [academicLevel, setAcademicLevel] = useState<AcademicLevel>('primary');
  const [selectedTerm, setSelectedTerm] = useState<Term>('first');
  const [selectedAssessmentType, setSelectedAssessmentType] = useState<AssessmentType | null>(
    'class_assignments'
  );
  const [expandedTerms, setExpandedTerms] = useState<Set<Term>>(new Set(['first']));

  // State for editable grades - separate storage for each term
  const [termGrades, setTermGrades] = useState<Record<Term, GradeEntry[]>>(() => {
    const initial: Record<Term, GradeEntry[]> = {
      first: [],
      second: [],
      third: [],
    };
    (['first', 'second', 'third'] as Term[]).forEach((term) => {
      initial[term] = getMockGrades(academicLevel, term);
    });
    return initial;
  });

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
      newTermGrades[term] = getMockGrades(level, term);
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">📊 Grades & Assessments</h1>
          <p className="text-gray-600">
            Manage and track student grades across different terms and assessments
          </p>
        </div>

        {/* Academic Level Selector */}
        <AcademicLevelSelector
          academicLevel={academicLevel}
          onLevelChange={handleLevelChange}
        />

        {/* School & Subject Info */}
        <div className="mb-6 bg-white rounded-lg shadow-sm p-4 border-l-4 border-blue-600">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-gray-600 font-semibold">SCHOOL</p>
              <p className="text-lg font-bold text-gray-900">{gradingConfig.schoolName}</p>
            </div>
            <div>
              <p className="text-xs text-gray-600 font-semibold">CLASS</p>
              <p className="text-lg font-bold text-gray-900">{gradingConfig.className}</p>
            </div>
            <div>
              <p className="text-xs text-gray-600 font-semibold">SUBJECT</p>
              <p className="text-lg font-bold text-gray-900">{gradingConfig.subject}</p>
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
        <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-900">
            <strong>💡 Tip:</strong> Click on any cell to edit scores. Averages and remarks are
            calculated automatically. Your changes are saved locally. For Primary School and Middle
            School, coefficients adjust based on the academic level selected above.
          </p>
        </div>
      </div>
    </div>
  );
}
