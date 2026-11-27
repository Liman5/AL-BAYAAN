'use client';

import { useState, HTMLAttributes } from 'react';
import { AssessmentType, GradeEntry, GradingConfig } from '@/types/grades';
import GradeGridTable from './grade-grid-table';
import { ChevronDown, GraduationCap } from 'lucide-react';

interface CollapsibleTermSectionProps extends HTMLAttributes<HTMLDivElement> {
  termLabel: string;
  assessmentTypes: { type: AssessmentType; label: string; icon: string }[];
  selectedAssessmentType: AssessmentType | null;
  onAssessmentTypeSelect: (type: AssessmentType) => void;
  grades: GradeEntry[];
  onGradesChange: (grades: GradeEntry[]) => void;
  gradingConfig: GradingConfig;
  isExpanded: boolean;
  onToggleExpand: () => void;
}

export default function CollapsibleTermSection({
  termLabel,
  assessmentTypes,
  selectedAssessmentType,
  onAssessmentTypeSelect,
  grades,
  onGradesChange,
  gradingConfig,
  isExpanded,
  onToggleExpand,
}: CollapsibleTermSectionProps) {
  return (
    <div className="mb-5 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:shadow-md">
      {/* Header */}
      <button
        onClick={onToggleExpand}
        className="flex w-full items-center justify-between bg-gradient-to-r from-slate-50 to-white px-6 py-4 transition-colors hover:from-emerald-50 hover:to-white"
      >
        <div className="flex items-center gap-3">
          <span className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
            <ChevronDown size={20} className="text-slate-400" />
          </span>
          <span className="font-semibold text-slate-900">{termLabel}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
            <GraduationCap size={13} />
            {grades.length} élèves
          </span>
          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
            isExpanded ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
          }`}>
            {isExpanded ? 'Ouvert' : 'Fermé'}
          </span>
        </div>
      </button>

      {/* Content */}
      {isExpanded && (
        <div className="border-t border-slate-100 p-6">
          {/* Assessment Type Selector */}
          <div className="mb-6">
            <p className="mb-3 text-sm font-semibold text-slate-700">Sélectionner le Type d'Évaluation</p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {assessmentTypes.map((assessment) => (
                <button
                  key={assessment.type}
                  onClick={() => onAssessmentTypeSelect(assessment.type)}
                  className={`rounded-2xl border-2 p-4 text-center transition-all duration-300 ${
                    selectedAssessmentType === assessment.type
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-900 shadow-md shadow-emerald-500/10'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-emerald-300 hover:bg-emerald-50/30'
                  }`}
                >
                  <div className="mb-2 text-2xl">{assessment.icon}</div>
                  <div className="text-sm font-semibold">{assessment.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Grade Grid */}
          {selectedAssessmentType && (
            <GradeGridTable
              grades={grades}
              onGradesChange={onGradesChange}
              gradingConfig={gradingConfig}
              assessmentType={selectedAssessmentType}
            />
          )}
        </div>
      )}
    </div>
  );
}