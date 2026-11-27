'use client';

import { useMemo, type ReactNode } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Clock3,
  GraduationCap,
  Plus,
  TrendingUp,
  UserPlus,
  Users,
} from 'lucide-react';
import type { Class, Teacher } from '@/types/admin';
import type { AdminPage } from './admin-sidebar';

interface AdminDashboardProps {
  stats: {
    totalStudents: number;
    activeStudents: number;
    totalTeachers: number;
    activeTeachers: number;
    totalClasses: number;
    totalSubjects: number;
  };
  teachers: Teacher[];
  classes: Class[];
  rawStudents: any[];
  onNavigate: (page: AdminPage) => void;
  onAddStudent: () => void;
  onAddTeacher: () => void;
}

const MONTH_LABELS = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];

const STATUS_STYLES: Record<string, string> = {
  active: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  pending: 'border-amber-200 bg-amber-50 text-amber-700',
  inactive: 'border-slate-200 bg-slate-50 text-slate-600',
  suspended: 'border-rose-200 bg-rose-50 text-rose-700',
  graduated: 'border-sky-200 bg-sky-50 text-sky-700',
  transferred: 'border-violet-200 bg-violet-50 text-violet-700',
};

const STATUS_LABELS: Record<string, string> = {
  active: 'Actif',
  pending: 'En attente',
  inactive: 'Inactif',
  suspended: 'Suspendu',
  graduated: 'Diplômé',
  transferred: 'Transféré',
};

const LEVEL_LABELS: Record<string, string> = {
  preschool: 'Maternelle',
  primary: 'Primaire',
  middle_school: 'Collège',
  high_school: 'Lycée',
};

function formatNumber(value: number) {
  return new Intl.NumberFormat('fr-FR').format(Number.isFinite(value) ? value : 0);
}

function formatShortDate(value: any) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
}

function relationObject(relation: any) {
  return Array.isArray(relation) ? relation[0] : relation;
}

function fullName(person: any) {
  const user = relationObject(person?.users);
  return `${user?.first_name || person?.firstName || ''} ${
    user?.last_name || person?.lastName || ''
  }`.trim();
}

function studentClass(student: any) {
  const enrollments = Array.isArray(student?.student_enrollments) ? student.student_enrollments : [];
  const classes = relationObject(enrollments[0]?.classes);
  return classes?.name || student?.class_name || student?.className || 'Non affecté';
}

function studentLevel(student: any) {
  const enrollments = Array.isArray(student?.student_enrollments) ? student.student_enrollments : [];
  const classes = relationObject(enrollments[0]?.classes);
  const level = classes?.level || student?.level || '';
  return LEVEL_LABELS[level] || 'Non affecté';
}

function initials(name: string) {
  return (
    name
      .split(' ')
      .filter(Boolean)
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || 'EL'
  );
}

function KpiCard({
  label,
  value,
  hint,
  icon,
  accent,
}: {
  label: string;
  value: string | number;
  hint: string;
  icon: ReactNode;
  accent: string;
}) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg">
      <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${accent}`} />
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">{value}</p>
          <p className="mt-1 text-xs text-slate-500">{hint}</p>
        </div>
        <div className={`rounded-xl bg-gradient-to-br ${accent} p-3 text-white shadow-md`}>{icon}</div>
      </div>
    </div>
  );
}

function SectionCard({
  title,
  subtitle,
  icon,
  action,
  children,
  className = '',
}: {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`rounded-2xl border border-slate-200 bg-white p-5 shadow-sm ${className}`}>
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          {icon && <div className="mt-0.5 rounded-xl bg-emerald-50 p-2 text-emerald-700">{icon}</div>}
          <div>
            <h2 className="text-sm font-bold text-slate-900 sm:text-base">{title}</h2>
            {subtitle && <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p>}
          </div>
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

function EmptyChart({ message, action }: { message: string; action?: ReactNode }) {
  return (
    <div className="flex h-64 flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-slate-200 bg-slate-50/70 px-6 text-center">
      <div className="rounded-full bg-white p-3 text-slate-400 shadow-sm">
        <TrendingUp size={22} />
      </div>
      <p className="max-w-xs text-sm text-slate-500">{message}</p>
      {action}
    </div>
  );
}

export default function AdminDashboard({
  stats,
  teachers,
  classes,
  rawStudents,
  onNavigate,
  onAddStudent,
  onAddTeacher,
}: AdminDashboardProps) {
  const pendingStudents = useMemo(
    () => rawStudents.filter((student) => student?.status === 'pending'),
    [rawStudents]
  );
  const pendingTeachers = useMemo(
    () => teachers.filter((teacher) => teacher.status === 'pending'),
    [teachers]
  );
  const pendingTotal = pendingStudents.length + pendingTeachers.length;
  const activeRate = stats.totalStudents
    ? Math.round((stats.activeStudents / stats.totalStudents) * 100)
    : 0;

  const classChartData = useMemo(() => {
    const counts = new Map<string, number>();

    rawStudents.forEach((student) => {
      const name = studentClass(student);
      counts.set(name, (counts.get(name) || 0) + 1);
    });

    classes.forEach((cls) => {
      if (!counts.has(cls.name)) {
        counts.set(cls.name, cls.totalStudents || 0);
      }
    });

    return Array.from(counts.entries())
      .map(([name, eleves]) => ({ name, eleves }))
      .sort((a, b) => b.eleves - a.eleves)
      .slice(0, 8);
  }, [rawStudents, classes]);

  const genderData = useMemo(() => {
    let girls = 0;
    let boys = 0;
    let other = 0;

    rawStudents.forEach((student) => {
      const user = relationObject(student?.users);
      const gender = String(student?.gender || user?.gender || '').toUpperCase();
      if (gender === 'F') girls += 1;
      else if (gender === 'M') boys += 1;
      else other += 1;
    });

    return [
      { name: 'Filles', value: girls, color: '#f59e0b' },
      { name: 'Garçons', value: boys, color: '#10b981' },
      { name: 'Non renseigné', value: other, color: '#94a3b8' },
    ].filter((item) => item.value > 0);
  }, [rawStudents]);

  const monthlyData = useMemo(() => {
    const now = new Date();
    const buckets = Array.from({ length: 6 }, (_, index) => {
      const date = new Date(now.getFullYear(), now.getMonth() - (5 - index), 1);
      return {
        key: `${date.getFullYear()}-${date.getMonth()}`,
        label: MONTH_LABELS[date.getMonth()],
        inscriptions: 0,
      };
    });
    const bucketIndex = new Map(buckets.map((bucket, index) => [bucket.key, index]));

    rawStudents.forEach((student) => {
      const date = new Date(student?.registration_date || student?.created_at);
      if (Number.isNaN(date.getTime())) return;
      const index = bucketIndex.get(`${date.getFullYear()}-${date.getMonth()}`);
      if (index !== undefined) buckets[index].inscriptions += 1;
    });

    return buckets;
  }, [rawStudents]);

  const cycleData = useMemo(() => {
    const counts = new Map<string, number>([
      ['Maternelle', 0],
      ['Primaire', 0],
      ['Collège', 0],
      ['Non affecté', 0],
    ]);

    rawStudents.forEach((student) => {
      const level = studentLevel(student);
      counts.set(level, (counts.get(level) || 0) + 1);
    });

    return Array.from(counts.entries()).map(([name, eleves]) => ({ name, eleves }));
  }, [rawStudents]);

  const teacherStatusData = useMemo(() => {
    const labels: Record<string, string> = {
      active: 'Actifs',
      pending: 'En attente',
      on_leave: 'En congé',
      inactive: 'Inactifs',
      suspended: 'Suspendus',
    };
    const colors: Record<string, string> = {
      active: '#10b981',
      pending: '#f59e0b',
      on_leave: '#38bdf8',
      inactive: '#94a3b8',
      suspended: '#f43f5e',
    };
    const counts = new Map<string, number>();

    teachers.forEach((teacher) => {
      counts.set(teacher.status, (counts.get(teacher.status) || 0) + 1);
    });

    return Array.from(counts.entries()).map(([status, value]) => ({
      name: labels[status] || status,
      value,
      color: colors[status] || '#64748b',
    }));
  }, [teachers]);

  const recentStudents = useMemo(
    () =>
      [...rawStudents]
        .sort((a, b) => {
          const dateA = new Date(a?.registration_date || a?.created_at || 0).getTime();
          const dateB = new Date(b?.registration_date || b?.created_at || 0).getTime();
          return dateB - dateA;
        })
        .slice(0, 6),
    [rawStudents]
  );

  const hasStudents = stats.totalStudents > 0;
  const hasTeachers = stats.totalTeachers > 0;


  return (
    <div className="space-y-6">
      {/* Bandeau de bienvenue */}
      <div className="relative overflow-hidden rounded-3xl border border-emerald-900/20 bg-gradient-to-br from-emerald-950 via-emerald-900 to-slate-950 p-6 text-white shadow-xl shadow-emerald-950/20 sm:p-8">
        <div className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-amber-400/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 left-1/3 h-56 w-56 rounded-full bg-emerald-400/15 blur-3xl" />
        <div className="relative flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-amber-200">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-300" />
              Vue d’ensemble
            </div>
            <h1 className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl">
              Bonjour, Administrateur
            </h1>
            <p className="mt-2 max-w-xl text-sm text-emerald-100/80 sm:text-base">
              Voici la situation réelle de <strong className="text-white">AL-BAYAAN</strong> :
              effectifs, classes, enseignants et demandes à traiter.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-200/70">
                Taux d’élèves actifs
              </p>
              <p className="mt-1 text-2xl font-bold text-white">{activeRate}%</p>
            </div>
            <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-200/70">
                À traiter
              </p>
              <p className="mt-1 text-2xl font-bold text-amber-300">{pendingTotal}</p>
            </div>
          </div>
        </div>
      </div>

      {/* KPI */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Élèves inscrits"
          value={formatNumber(stats.totalStudents)}
          hint={`${formatNumber(stats.activeStudents)} actifs · ${formatNumber(
            Math.max(stats.totalStudents - stats.activeStudents, 0)
          )} inactifs`}
          icon={<Users size={22} />}
          accent="from-emerald-500 to-teal-600"
        />
        <KpiCard
          label="Enseignants"
          value={formatNumber(stats.totalTeachers)}
          hint={`${formatNumber(stats.activeTeachers)} actifs`}
          icon={<GraduationCap size={22} />}
          accent="from-sky-500 to-indigo-600"
        />
        <KpiCard
          label="Classes"
          value={formatNumber(stats.totalClasses)}
          hint={`${formatNumber(stats.totalSubjects)} matière(s) enseignée(s)`}
          icon={<BookOpen size={22} />}
          accent="from-violet-500 to-fuchsia-600"
        />
        <KpiCard
          label="Demandes en attente"
          value={formatNumber(pendingTotal)}
          hint={`${pendingStudents.length} élève(s) · ${pendingTeachers.length} enseignant(s)`}
          icon={<Clock3 size={22} />}
          accent="from-amber-400 to-orange-500"
        />
      </div>




      {/* Répartition par cycle */}
      <div className="grid gap-3 sm:grid-cols-3">
        {cycleData
          .filter((item) => item.name !== 'Non affecté' || item.eleves > 0)
          .map((item, index) => {
            const palette = ['#10b981', '#38bdf8', '#8b5cf6', '#94a3b8'];
            const color = palette[index % palette.length];
            const percent = stats.totalStudents
              ? Math.round((item.eleves / stats.totalStudents) * 100)
              : 0;

            return (
              <div
                key={item.name}
                className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    {item.name}
                  </p>
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
                </div>
                <div className="mt-2 flex items-end justify-between gap-2">
                  <p className="text-2xl font-bold text-slate-900">{formatNumber(item.eleves)}</p>
                  <p className="text-xs font-semibold text-slate-400">{percent}%</p>
                </div>
                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${Math.min(percent, 100)}%`, backgroundColor: color }}
                  />
                </div>
              </div>
            );
          })}
      </div>


      {/* Graphiques principaux */}
      <div className="grid gap-4 xl:grid-cols-3">
        <SectionCard
          className="xl:col-span-2"
          title="Élèves par classe"
          subtitle="Effectifs réels enregistrés dans la base"
          icon={<BookOpen size={18} />}
          action={
            <button
              type="button"
              onClick={() => onNavigate('classes')}
              className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-emerald-700 transition-colors hover:bg-emerald-50"
            >
              Voir les classes <ArrowRight size={14} />
            </button>
          }
        >
          {classChartData.length === 0 ? (
            <EmptyChart
              message="Aucune classe enregistrée pour le moment. Créez une classe pour voir les effectifs."
              action={
                <button
                  type="button"
                  onClick={() => onNavigate('classes')}
                  className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-700"
                >
                  Créer une classe
                </button>
              }
            />
          ) : (
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={classChartData} margin={{ top: 10, right: 8, left: -18, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    axisLine={false}
                    tickLine={false}
                    interval={0}
                    angle={classChartData.length > 5 ? -18 : 0}
                    textAnchor={classChartData.length > 5 ? 'end' : 'middle'}
                    height={classChartData.length > 5 ? 55 : 30}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    cursor={{ fill: '#f1f5f9' }}
                    contentStyle={{
                      borderRadius: 12,
                      border: '1px solid #e2e8f0',
                      boxShadow: '0 10px 25px rgba(15,23,42,0.08)',
                      fontSize: 12,
                    }}
                    formatter={(value) => [`${Number(value)} élève(s)`, 'Effectif']}
                  />
                  <Bar dataKey="eleves" name="Élèves" fill="#10b981" radius={[8, 8, 0, 0]} maxBarSize={48} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </SectionCard>

        <SectionCard
          title="Filles / Garçons"
          subtitle="Répartition par sexe"
          icon={<Users size={18} />}
        >
          {genderData.length === 0 ? (
            <EmptyChart message="Le sexe des élèves apparaîtra ici dès les premières inscriptions." />
          ) : (
            <>
              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={genderData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={3}
                      strokeWidth={2}
                    >
                      {genderData.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        borderRadius: 12,
                        border: '1px solid #e2e8f0',
                        fontSize: 12,
                      }}
                      formatter={(value) => [`${Number(value)} élève(s)`, 'Effectif']}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2">
                {genderData.map((item) => (
                  <div key={item.name} className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 text-slate-600">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                      {item.name}
                    </span>
                    <span className="font-semibold text-slate-900">{formatNumber(item.value)}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </SectionCard>
      </div>

      {/* Évolution et enseignants */}
      <div className="grid gap-4 xl:grid-cols-3">
        <SectionCard
          className="xl:col-span-2"
          title="Inscriptions des 6 derniers mois"
          subtitle="Nouveaux élèves enregistrés par mois"
          icon={<TrendingUp size={18} />}
        >
          {!hasStudents ? (
            <EmptyChart
              message="Les inscriptions apparaîtront ici dès que vous ajouterez vos premiers élèves."
              action={
                <button
                  type="button"
                  onClick={onAddStudent}
                  className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-700"
                >
                  <Plus size={14} /> Ajouter un élève
                </button>
              }
            />
          ) : (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyData} margin={{ top: 10, right: 8, left: -18, bottom: 0 }}>
                  <defs>
                    <linearGradient id="inscriptionsGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 12,
                      border: '1px solid #e2e8f0',
                      boxShadow: '0 10px 25px rgba(15,23,42,0.08)',
                      fontSize: 12,
                    }}
                    formatter={(value) => [`${Number(value)} inscription(s)`, 'Nouveaux élèves']}
                  />
                  <Area
                    type="monotone"
                    dataKey="inscriptions"
                    name="Inscriptions"
                    stroke="#10b981"
                    strokeWidth={2.5}
                    fill="url(#inscriptionsGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </SectionCard>

        <SectionCard
          title="Statut des enseignants"
          subtitle="Répartition de l’équipe pédagogique"
          icon={<GraduationCap size={18} />}
          action={
            <button
              type="button"
              onClick={() => onNavigate('teachers')}
              className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-emerald-700 transition-colors hover:bg-emerald-50"
            >
              Gérer <ArrowRight size={14} />
            </button>
          }
        >
          {!hasTeachers || teacherStatusData.length === 0 ? (
            <EmptyChart message="Les statuts des enseignants apparaîtront ici après les premières inscriptions." />
          ) : (
            <>
              <div className="h-44 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={teacherStatusData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={45}
                      outerRadius={70}
                      paddingAngle={3}
                      strokeWidth={2}
                    >
                      {teacherStatusData.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        borderRadius: 12,
                        border: '1px solid #e2e8f0',
                        fontSize: 12,
                      }}
                      formatter={(value) => [`${Number(value)} enseignant(s)`, 'Effectif']}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2">
                {teacherStatusData.map((item) => (
                  <div key={item.name} className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 text-slate-600">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                      {item.name}
                    </span>
                    <span className="font-semibold text-slate-900">{formatNumber(item.value)}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </SectionCard>
      </div>


      {/* Derniers inscrits et actions */}
      <div className="grid gap-4 xl:grid-cols-3">
        <SectionCard
          className="xl:col-span-2"
          title="Derniers élèves inscrits"
          subtitle="Les inscriptions les plus récentes"
          icon={<UserPlus size={18} />}
          action={
            <button
              type="button"
              onClick={() => onNavigate('students')}
              className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-emerald-700 transition-colors hover:bg-emerald-50"
            >
              Tous les élèves <ArrowRight size={14} />
            </button>
          }
        >
          {recentStudents.length === 0 ? (
            <EmptyChart
              message="Aucun élève inscrit pour l’instant. Commencez par ajouter un élève."
              action={
                <button
                  type="button"
                  onClick={onAddStudent}
                  className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-700"
                >
                  <Plus size={14} /> Ajouter un élève
                </button>
              }
            />
          ) : (
            <div className="-mx-2 overflow-x-auto">
              <table className="w-full min-w-[620px] text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-[11px] uppercase tracking-wide text-slate-400">
                    <th className="px-2 pb-3 font-semibold">Élève</th>
                    <th className="px-2 pb-3 font-semibold">Classe</th>
                    <th className="px-2 pb-3 font-semibold">Statut</th>
                    <th className="px-2 pb-3 text-right font-semibold">Inscription</th>
                  </tr>
                </thead>
                <tbody>
                  {recentStudents.map((student) => {
                    const name = fullName(student) || 'Élève sans nom';
                    const status = String(student?.status || 'inactive');
                    return (
                      <tr key={student.id} className="border-b border-slate-50 last:border-0">
                        <td className="px-2 py-3">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-xs font-bold text-emerald-700">
                              {initials(name)}
                            </div>
                            <div className="min-w-0">
                              <p className="truncate font-semibold text-slate-800">{name}</p>
                              <p className="text-xs text-slate-400">{student.matricule || 'Matricule —'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-2 py-3 text-slate-600">{studentClass(student)}</td>
                        <td className="px-2 py-3">
                          <span
                            className={`inline-flex rounded-full border px-2 py-0.5 text-[11px] font-semibold ${
                              STATUS_STYLES[status] || STATUS_STYLES.inactive
                            }`}
                          >
                            {STATUS_LABELS[status] || status}
                          </span>
                        </td>
                        <td className="px-2 py-3 text-right text-xs text-slate-500">
                          {formatShortDate(student.registration_date || student.created_at)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </SectionCard>


        <div className="space-y-4">
          <SectionCard
            title="À traiter"
            subtitle="Demandes en attente d’approbation"
            icon={<Clock3 size={18} />}
            action={
              pendingTotal > 0 ? (
                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-700">
                  {pendingTotal}
                </span>
              ) : undefined
            }
          >
            {pendingTotal === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-emerald-200 bg-emerald-50/60 px-4 py-6 text-center">
                <CheckCircle2 size={24} className="text-emerald-600" />
                <p className="text-sm font-semibold text-emerald-800">Tout est à jour</p>
                <p className="text-xs text-emerald-700/70">Aucune demande en attente.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {pendingTeachers.slice(0, 2).map((teacher) => (
                  <button
                    key={teacher.id}
                    type="button"
                    onClick={() => onNavigate('teachers')}
                    className="flex w-full items-center gap-3 rounded-xl border border-amber-100 bg-amber-50/60 px-3 py-2.5 text-left transition-colors hover:bg-amber-50"
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 text-amber-700">
                      <GraduationCap size={15} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold text-slate-800">
                        {teacher.firstName} {teacher.lastName}
                      </span>
                      <span className="block text-[11px] text-slate-500">Enseignant · en attente</span>
                    </span>
                    <ArrowRight size={14} className="text-amber-600" />
                  </button>
                ))}
                {pendingStudents.slice(0, 2).map((student) => (
                  <button
                    key={student.id}
                    type="button"
                    onClick={() => onNavigate('students')}
                    className="flex w-full items-center gap-3 rounded-xl border border-sky-100 bg-sky-50/60 px-3 py-2.5 text-left transition-colors hover:bg-sky-50"
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-sky-100 text-sky-700">
                      <UserPlus size={15} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold text-slate-800">
                        {fullName(student) || student.matricule || 'Élève'}
                      </span>
                      <span className="block text-[11px] text-slate-500">Élève · en attente</span>
                    </span>
                    <ArrowRight size={14} className="text-sky-600" />
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => onNavigate(pendingTeachers.length > 0 ? 'teachers' : 'students')}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-50"
                >
                  Voir toutes les demandes
                </button>
              </div>
            )}
          </SectionCard>

          <SectionCard title="Actions rapides" icon={<Plus size={18} />}>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={onAddStudent}
                className="flex flex-col items-start gap-2 rounded-xl border border-emerald-100 bg-emerald-50/60 p-3 text-left transition-colors hover:bg-emerald-50"
              >
                <UserPlus size={18} className="text-emerald-700" />
                <span className="text-xs font-semibold text-emerald-900">Ajouter un élève</span>
              </button>
              <button
                type="button"
                onClick={onAddTeacher}
                className="flex flex-col items-start gap-2 rounded-xl border border-sky-100 bg-sky-50/60 p-3 text-left transition-colors hover:bg-sky-50"
              >
                <GraduationCap size={18} className="text-sky-700" />
                <span className="text-xs font-semibold text-sky-900">Ajouter un enseignant</span>
              </button>
              <button
                type="button"
                onClick={() => onNavigate('classes')}
                className="flex flex-col items-start gap-2 rounded-xl border border-violet-100 bg-violet-50/60 p-3 text-left transition-colors hover:bg-violet-50"
              >
                <BookOpen size={18} className="text-violet-700" />
                <span className="text-xs font-semibold text-violet-900">Créer une classe</span>
              </button>
              <button
                type="button"
                onClick={() => onNavigate('academic-years')}
                className="flex flex-col items-start gap-2 rounded-xl border border-amber-100 bg-amber-50/60 p-3 text-left transition-colors hover:bg-amber-50"
              >
                <CalendarDays size={18} className="text-amber-700" />
                <span className="text-xs font-semibold text-amber-900">Années scolaires</span>
              </button>
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}

