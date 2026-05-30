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
    <div className="mb-6 border-b border-gray-200">
      <div className="flex gap-2">
        {terms.map((term) => (
          <button
            key={term.value}
            onClick={() => onTermChange(term.value)}
            className={`px-4 py-3 font-medium transition-all border-b-2 ${
              selectedTerm === term.value
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <span className="mr-2">{term.icon}</span>
            {term.label}
          </button>
        ))}
      </div>
    </div>
  );
}
