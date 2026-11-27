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
    { value: 'primary', label: 'École Primaire (5e)', icon: '📚' },
    { value: 'middle_school', label: 'Collège (3e)', icon: '🎓' },
  ];

  return (
    <div className="mb-8">
      <p className="mb-3 text-sm font-semibold text-slate-700">Sélectionner le Niveau Académique</p>
      <div className="flex flex-wrap gap-3">
        {levels.map((level) => (
          <button
            key={level.value}
            onClick={() => onLevelChange(level.value)}
            className={`rounded-2xl px-5 py-3 text-sm font-semibold transition-all duration-300 ${
              academicLevel === level.value
                ? 'bg-gradient-to-r from-emerald-700 to-emerald-600 text-white shadow-lg shadow-emerald-700/20 scale-[1.02]'
                : 'border border-slate-200 bg-white text-slate-600 hover:border-emerald-300 hover:text-emerald-700 hover:shadow-md'
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