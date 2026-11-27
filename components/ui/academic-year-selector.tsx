'use client';

import { useEffect, useState } from 'react';
import { CalendarDays, ChevronDown } from 'lucide-react';
import { getAcademicYears, getCurrentAcademicYear, setCurrentAcademicYear } from '@/lib/schoolData';

interface YearOption {
  id: string;
  name: string;
}

export default function AcademicYearSelector({
  compact = false,
  canActivate = false,
}: {
  compact?: boolean;
  canActivate?: boolean;
}) {
  const [yearOptions, setYearOptions] = useState<YearOption[]>([]);
  const [currentYear, setCurrentYear] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        const response = await fetch('/api/admin/academic-years', { cache: 'no-store' });
        const data = await response.json();

        if (
          alive &&
          response.ok &&
          data.success &&
          Array.isArray(data.years) &&
          data.years.length > 0
        ) {
          const options: YearOption[] = data.years.map((year: { id: string; name: string }) => ({
            id: year.id,
            name: year.name,
          }));
          setYearOptions(options);

          const local = getCurrentAcademicYear();
          const valid = options.some((option) => option.name === local)
            ? local
            : data.activeYear?.name || options[0].name;

          setCurrentYear(valid);
          if (valid !== local) setCurrentAcademicYear(valid);
          return;
        }
      } catch {
        // Fallback localStorage ci-dessous
      }

      if (alive) {
        const fallback = getAcademicYears().map((name) => ({ id: name, name }));
        setYearOptions(fallback);
        setCurrentYear(getCurrentAcademicYear());
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  async function handleChange(name: string) {
    if (!name || name === currentYear) return;

    const option = yearOptions.find((item) => item.name === name);

    if (canActivate && option) {
      setSaving(true);
      try {
        const response = await fetch('/api/admin/academic-years', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: option.id }),
        });
        const data = await response.json();
        if (!response.ok || !data.success) {
          throw new Error(data.message || 'Activation impossible.');
        }
      } catch (error) {
        alert(error instanceof Error ? error.message : 'Activation impossible.');
        setSaving(false);
        return;
      }
      setSaving(false);
    }

    setCurrentAcademicYear(name);
    setCurrentYear(name);
    window.location.reload();
  }

  if (yearOptions.length === 0) return null;

  return (
    <div
      className={`relative inline-flex items-center ${
        compact ? '' : 'rounded-2xl border border-slate-200 bg-white shadow-sm'
      }`}
    >
      {!compact && (
        <span className="pointer-events-none absolute left-3 flex items-center text-slate-400">
          <CalendarDays size={16} />
        </span>
      )}
      <select
        value={currentYear}
        onChange={(event) => {
          void handleChange(event.target.value);
        }}
        disabled={saving}
        className={`appearance-none cursor-pointer font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-100 disabled:cursor-wait disabled:opacity-60 ${
          compact
            ? 'rounded-lg border border-slate-200 bg-white py-1.5 pl-2.5 pr-8 text-sm'
            : 'rounded-2xl border-0 bg-transparent py-2.5 pl-10 pr-10 text-sm'
        }`}
        aria-label="Année scolaire"
      >
        {yearOptions.map((option) => (
          <option key={option.id} value={option.name}>
            {option.name}
          </option>
        ))}
      </select>
      <span className="pointer-events-none absolute right-3 flex items-center text-slate-400">
        <ChevronDown size={14} />
      </span>
    </div>
  );
}
