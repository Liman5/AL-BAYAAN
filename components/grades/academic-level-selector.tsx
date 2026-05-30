'use client';

import { AcademicLevel } from '@/types/grades';

interface AcademicLevelSelectorProps {
  academicLevel: AcademicLevel;
  onLevelChange: (level: AcademicLevel) => void;
}

export default function AcademicLevelSelector({
  academicLevel,
  onLevelChange,
}: AcademicLevelSelectorProps) {
  const levels: { value: AcademicLevel; label: string; icon: string }[] = [
    { value: 'primary', label: 'Primary School (5e)', icon: '📚' },
    { value: 'middle_school', label: 'Middle School (3e)', icon: '🎓' },
  ];

  return (
    <div className="mb-6">
      <p className="text-sm font-medium text-gray-700 mb-3">Select Academic Level</p>
      <div className="flex gap-3">
        {levels.map((level) => (
          <button
            key={level.value}
            onClick={() => onLevelChange(level.value)}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              academicLevel === level.value
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            <span className="mr-2">{level.icon}</span>
            {level.label}
          </button>
        ))}
      </div>
    </div>
  );
}
