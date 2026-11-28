'use client';

import Image from 'next/image';
import {
  ArrowUpRight,
  BadgeCheck,
  BookOpen,
  CalendarDays,
  CreditCard,
  FileText,
  GraduationCap,
  Image as ImageIcon,
  LayoutDashboard,
  LogOut,
  QrCode,
  School,
  Smartphone,
  Users,
  X,
  type LucideIcon,
} from 'lucide-react';
import { useSiteImages } from '@/components/providers/site-images-provider';
import { clearAuthCookies } from '@/lib/authClient';

export type AdminPage =
  | 'dashboard'
  | 'students'
  | 'teachers'
  | 'classes'
  | 'reports'
  | 'payments'
  | 'passages'
  | 'images'
  | 'academic-years'
  | 'badges'
  | 'badges-staff'
  | 'terminals';

interface NavItem {
  id: AdminPage;
  label: string;
  icon: LucideIcon;
  badgeKey?: 'students' | 'teachers' | 'classes';
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    label: 'Pilotage',
    items: [
      { id: 'dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
      { id: 'reports', label: 'Rapports & bulletins', icon: FileText },
    ],
  },
  {
    label: 'Scolarité',
    items: [
      { id: 'students', label: 'Élèves', icon: Users, badgeKey: 'students' },
      { id: 'teachers', label: 'Enseignants', icon: GraduationCap, badgeKey: 'teachers' },
      { id: 'classes', label: 'Classes', icon: BookOpen, badgeKey: 'classes' },
      { id: 'passages', label: 'Passage d’année', icon: ArrowUpRight },
    ],
  },
  {
    label: 'Présence & badges',
    items: [
      { id: 'badges', label: 'Badges QR', icon: QrCode },
      { id: 'badges-staff', label: 'Badges personnel', icon: BadgeCheck },
      { id: 'terminals', label: 'Terminaux scanners', icon: Smartphone },
    ],
  },
  {
    label: 'Administration',
    items: [
      { id: 'payments', label: 'Paiements', icon: CreditCard },
      { id: 'academic-years', label: 'Années scolaires', icon: CalendarDays },
      { id: 'images', label: 'Images du site', icon: ImageIcon },
    ],
  },
];

interface AdminSidebarProps {
  currentPage: AdminPage;
  onNavigate: (page: AdminPage) => void;
  isOpen?: boolean;
  onClose?: () => void;
  badges?: Partial<Record<'students' | 'teachers' | 'classes', number>>;
  userName?: string;
  userEmail?: string;
}

export default function AdminSidebar({
  currentPage,
  onNavigate,
  isOpen = false,
  onClose,
  badges = {},
  userName = 'Administrateur',
  userEmail = 'admin@albayan.edu',
}: AdminSidebarProps) {
  const { images } = useSiteImages();

  const handleNavigate = (page: AdminPage) => {
    onNavigate(page);
    onClose?.();
  };

  const handleLogout = () => {
    clearAuthCookies();
    window.location.href = '/auth/login';
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 shrink-0 flex-col overflow-hidden bg-gradient-to-b from-emerald-950 via-emerald-900 to-slate-950 text-white shadow-2xl transition-transform duration-300 lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-amber-400/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-16 h-56 w-56 rounded-full bg-emerald-400/10 blur-3xl" />


        {/* Marque */}
        <div className="relative flex items-center justify-between border-b border-white/10 px-5 py-5">
          <div className="flex items-center gap-3">
            <div className="relative h-12 w-12 overflow-hidden rounded-2xl bg-white/10 ring-2 ring-amber-300/40 shadow-lg">
              <Image
                src={images.logo}
                alt="Logo AL-BAYAAN"
                fill
                sizes="48px"
                className="object-cover"
              />
            </div>
            <div className="min-w-0">
              <p className="truncate text-base font-bold leading-tight tracking-tight">AL-BAYAAN</p>
              <p className="mt-0.5 text-[11px] font-medium uppercase tracking-[0.18em] text-emerald-200/70">
                Administration
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-emerald-100 transition-colors hover:bg-white/10 lg:hidden"
            aria-label="Fermer le menu"
          >
            <X size={20} />
          </button>
        </div>

        {/* Établissement */}
        <div className="relative mx-4 mt-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
          <div className="flex items-center gap-2 text-amber-300">
            <School size={16} />
            <span className="text-[11px] font-bold uppercase tracking-[0.16em]">Établissement</span>
          </div>
          <p className="mt-1.5 text-sm font-semibold text-white">Institut islamique AL-BAYAAN</p>
          <p className="text-xs text-emerald-200/70">Adresse de l’école</p>
        </div>

        <nav className="relative flex-1 overflow-y-auto px-4 py-5">
          {NAV_GROUPS.map((group) => (
            <div key={group.label} className="mb-5 last:mb-0">
              <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-200/50">
                {group.label}
              </p>
              <div className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const active = currentPage === item.id;
                  const badge = item.badgeKey ? badges[item.badgeKey] : undefined;

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleNavigate(item.id)}
                      aria-current={active ? 'page' : undefined}
                      className={`group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-all duration-200 ${
                        active
                          ? 'bg-gradient-to-r from-amber-300 to-amber-400 text-emerald-950 shadow-lg shadow-amber-500/20'
                          : 'text-emerald-100/85 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      <Icon
                        size={18}
                        className={`shrink-0 transition-transform group-hover:scale-110 ${
                          active ? 'text-emerald-950' : 'text-amber-300/80'
                        }`}
                      />
                      <span className="flex-1 truncate">{item.label}</span>
                      {badge !== undefined && badge > 0 && (
                        <span
                          className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${
                            active
                              ? 'bg-emerald-900 text-amber-300'
                              : 'bg-amber-400/20 text-amber-300'
                          }`}
                        >
                          {badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Utilisateur */}
        <div className="relative border-t border-white/10 px-4 py-4">
          <div className="flex items-center gap-3 rounded-2xl bg-white/5 px-3 py-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-300 to-amber-500 text-sm font-bold text-emerald-950">
              {userName
                .split(' ')
                .map((part) => part[0])
                .join('')
                .slice(0, 2)
                .toUpperCase() || 'AD'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{userName}</p>
              <p className="truncate text-[11px] text-emerald-200/65">{userEmail}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl bg-white/5 px-4 py-2.5 text-sm font-medium text-emerald-100/80 transition-colors hover:bg-red-500/20 hover:text-red-200"
          >
            <LogOut size={16} />
            Déconnexion
          </button>
        </div>
      </aside>
    </>
  );
}

