'use client';

import { Term } from '@/types/grades';

interface TermTabsProps {
  selectedTerm: Term;
  onTermChange: (term: Term) => void;
}

export default function TermTabs({ selectedTerm, onTermChange }: TermTabsProps) {
  const terms: { value: Term; label: string; icon: string }[] = [
    { value: 'first', label: '1er Trimestre', icon: '📍' },
    { value: 'second', label: '2e Trimestre', icon: '📍' },
    { value: 'third', label: '3e Trimestre', icon: '📍' },
  ];

  return (
    <div className="mb-8 flex flex-wrap gap-2 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-sm">
      {terms.map((term) => (
        <button
          key={term.value}
          onClick={() => onTermChange(term.value)}
          className={`flex-1 rounded-xl px-5 py-3 text-sm font-semibold transition-all duration-300 ${
            selectedTerm === term.value
              ? 'bg-gradient-to-r from-emerald-700 to-emerald-600 text-white shadow-md shadow-emerald-700/20'
              : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
          }`}
        >
          <span className="mr-2">{term.icon}</span>
          {term.label}
        </button>
      ))}
    </div>
  );
}