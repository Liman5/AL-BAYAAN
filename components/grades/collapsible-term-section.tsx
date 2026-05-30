'use client';

import { useState } from 'react';
import { AssessmentType, GradeEntry, GradingConfig } from '@/types/grades';
import GradeGridTable from './grade-grid-table';

interface CollapsibleTermSectionProps {
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
    <div className="mb-4 border border-gray-200 rounded-lg overflow-hidden bg-white">
      {/* Header */}
      <button
        onClick={onToggleExpand}
        className="w-full px-6 py-4 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-lg">{isExpanded ? '▼' : '▶'}</span>
          <span className="font-semibold text-gray-900">{termLabel}</span>
        </div>
        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
          {grades.length} students
        </span>
      </button>

      {/* Content */}
      {isExpanded && (
        <div className="border-t border-gray-200 p-6">
          {/* Assessment Type Selector */}
          <div className="mb-6">
            <p className="text-sm font-medium text-gray-700 mb-3">Sélectionner le Type d'Évaluation</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {assessmentTypes.map((assessment) => (
                <button
                  key={assessment.type}
                  onClick={() => onAssessmentTypeSelect(assessment.type)}
                  className={`p-4 rounded-lg border-2 transition-all text-center ${
                    selectedAssessmentType === assessment.type
                      ? 'border-blue-600 bg-blue-50 text-blue-900'
                      : 'border-gray-200 bg-gray-50 text-gray-700 hover:border-blue-300'
                  }`}
                >
                  <div className="text-2xl mb-2">{assessment.icon}</div>
                  <div className="font-medium text-sm">{assessment.label}</div>
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
