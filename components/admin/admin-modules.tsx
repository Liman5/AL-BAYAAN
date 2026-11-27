'use client';

import { ReactNode } from 'react';
import { Users, BookOpen, GraduationCap, FileText, ArrowRight, LayoutDashboard, Wallet, ArrowUpCircle, Images, CalendarRange, QrCode, Smartphone } from 'lucide-react';

export interface AdminModuleItem {
  id: string;
  label: string;
  description: string;
  icon: ReactNode;
  badge?: number;
  gradient: string;
  iconBg: string;
  iconColor: string;
}

interface AdminModulesGridProps {
  items: AdminModuleItem[];
  onModuleClick: (moduleId: string) => void;
}

const defaultItems = (badges: Record<string, number | undefined>): AdminModuleItem[] => [
  {
    id: 'dashboard',
    label: 'Tableau de Bord',
    description: 'Vue d\'ensemble et statistiques de la plateforme',
    icon: <LayoutDashboard size={32} />,
    badge: badges.dashboard,
    gradient: 'from-emerald-500 to-teal-600',
    iconBg: 'bg-emerald-50',
    iconColor: 'text-emerald-600',
  },
  {
    id: 'students',
    label: 'Élèves',
    description: 'Gérer les inscriptions et profils des élèves',
    icon: <Users size={32} />,
    badge: badges.students,
    gradient: 'from-blue-500 to-indigo-600',
    iconBg: 'bg-blue-50',
    iconColor: 'text-blue-600',
  },
  {
    id: 'teachers',
    label: 'Enseignants',
    description: 'Gérer les comptes et matières des enseignants',
    icon: <BookOpen size={32} />,
    badge: badges.teachers,
    gradient: 'from-amber-400 to-orange-500',
    iconBg: 'bg-amber-50',
    iconColor: 'text-amber-600',
  },
  {
    id: 'classes',
    label: 'Classes',
    description: 'Organiser les classes et les affectations',
    icon: <GraduationCap size={32} />,
    badge: badges.classes,
    gradient: 'from-purple-500 to-fuchsia-600',
    iconBg: 'bg-purple-50',
    iconColor: 'text-purple-600',
  },
  {
    id: 'reports',
    label: 'Rapports',
    description: 'Consulter les rapports et résultats par classe',
    icon: <FileText size={32} />,
    badge: badges.reports,
    gradient: 'from-rose-500 to-red-600',
    iconBg: 'bg-rose-50',
    iconColor: 'text-rose-600',
  },
  {
    id: 'payments',
    label: 'Paiements',
    description: 'Gérer les paiements élèves et rémunérations enseignants',
    icon: <Wallet size={32} />,
    badge: badges.payments,
    gradient: 'from-teal-500 to-cyan-600',
    iconBg: 'bg-teal-50',
    iconColor: 'text-teal-600',
  },
  {
    id: 'passages',
    label: "Passages d'Années",
    description: 'Migrer les élèves admis vers la classe suivante',
    icon: <ArrowUpCircle size={32} />,
    badge: badges.passages,
    gradient: 'from-indigo-500 to-blue-600',
    iconBg: 'bg-indigo-50',
    iconColor: 'text-indigo-600',
  },
  {
    id: 'images',
    label: 'Images du site',
    description: 'Changer les photos de la page d’accueil et leur emplacement',
    icon: <Images size={32} />,
    badge: badges.images,
    gradient: 'from-sky-500 to-indigo-600',
    iconBg: 'bg-sky-50',
    iconColor: 'text-sky-600',
  },
  {
    id: 'academic-years',
    label: 'Années scolaires',
    description: 'Créer et activer les années scolaires de l’établissement',
    icon: <CalendarRange size={32} />,
    badge: badges['academic-years'],
    gradient: 'from-cyan-500 to-blue-600',
    iconBg: 'bg-cyan-50',
    iconColor: 'text-cyan-600',
  },
  {
    id: 'badges',
    label: 'Badges QR',
    description: 'Générer, révoquer et imprimer les badges QR des élèves',
    icon: <QrCode size={32} />,
    badge: badges.badges,
    gradient: 'from-emerald-500 to-green-600',
    iconBg: 'bg-emerald-50',
    iconColor: 'text-emerald-600',
  },
  {
    id: 'terminals',
    label: 'Terminaux scanners',
    description: 'Autoriser les appareils de présence et suivre les scans',
    icon: <Smartphone size={32} />,
    badge: badges.terminals,
    gradient: 'from-slate-600 to-slate-800',
    iconBg: 'bg-slate-100',
    iconColor: 'text-slate-700',
  },
];

export default function AdminModulesGrid({ items, onModuleClick }: AdminModulesGridProps) {
  return (
    <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 xl:grid-cols-3">
      {items.map((module) => (
        <button
          key={module.id}
          onClick={() => onModuleClick(module.id)}
          className="group relative flex flex-col items-start overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 text-left shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:border-transparent"
        >
          {/* Background gradient blob */}
          <div className={`absolute right-0 top-0 h-32 w-32 translate-x-10 -translate-y-10 rounded-full bg-gradient-to-br ${module.gradient} opacity-10 transition-all duration-500 group-hover:scale-150 group-hover:opacity-20`} />

          {/* Top accent bar */}
          <div className={`absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r ${module.gradient} opacity-70`} />

          {/* Icon */}
          <div className={`relative mb-5 flex h-16 w-16 items-center justify-center rounded-2xl ${module.iconBg} ${module.iconColor} shadow-sm transition-transform duration-300 group-hover:scale-110`}>
            {module.icon}
          </div>

          {/* Badge */}
          {module.badge !== undefined && module.badge > 0 && (
            <span className={`absolute right-5 top-5 inline-flex items-center rounded-full bg-gradient-to-r ${module.gradient} px-3 py-1 text-xs font-bold text-white shadow-md`}>
              {module.badge}
            </span>
          )}

          {/* Label & description */}
          <h3 className="relative text-xl font-bold text-slate-900">{module.label}</h3>
          <p className="relative mt-2 text-sm leading-relaxed text-slate-500">{module.description}</p>

          {/* Footer */}
          <div className="relative mt-5 flex items-center gap-2 text-sm font-semibold text-emerald-700 transition-all duration-300 group-hover:gap-3">
            Accéder au module
            <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
          </div>
        </button>
      ))}
    </div>
  );
}

export { defaultItems };