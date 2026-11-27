'use client';

import React from 'react';
import { BookOpen, ChevronDown } from 'lucide-react';

interface ClassSelectorProps {
  classes: Array<{ id: string; name: string; subject?: string; students?: number }>;
  selectedClassId: string;
  onSelectClass: (classId: string) => void;
  label?: string;
}

export const ClassSelector: React.FC<ClassSelectorProps> = ({
  classes,
  selectedClassId,
  onSelectClass,
  label = 'Classe',
}) => {
  const selectedClass = classes.find((c) => c.id === selectedClassId);

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2">
        <div className="rounded-xl bg-blue-50 p-2.5">
          <BookOpen size={18} className="text-blue-600" />
        </div>
        <span className="text-sm font-medium text-slate-600 hidden sm:block">{label}:</span>
      </div>
      <div className="relative">
        <select
          value={selectedClassId}
          onChange={(e) => onSelectClass(e.target.value)}
          className="appearance-none rounded-xl border border-slate-200 bg-white py-2.5 pl-4 pr-10 text-sm font-semibold text-slate-900 shadow-sm outline-none transition-all focus:border-blue-400 focus:ring-4 focus:ring-blue-100 cursor-pointer"
        >
          <option value="">Toutes mes classes</option>
          {classes.map((cls) => (
            <option key={cls.id} value={cls.id}>
              {cls.name}
              {cls.subject ? ` — ${cls.subject}` : ''}
              {typeof cls.students === 'number' ? ` (${cls.students} élèves)` : ''}
            </option>
          ))}
        </select>
        <ChevronDown
          size={16}
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
        />
      </div>
      {selectedClass && (
        <span className="hidden lg:inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
          {selectedClass.name}
        </span>
      )}
    </div>
  );
};