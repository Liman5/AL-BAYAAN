'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { X } from 'lucide-react';
import { useSiteImages } from '@/components/providers/site-images-provider';

export interface SidebarItem {
  label: string;
  href: string;
  icon: ReactNode;
  badge?: number;
}

interface SidebarProps {
  items: SidebarItem[];
  title: string;
  subtitle?: string;
  roleLabel?: string;
  userName?: string;
  isOpen?: boolean;
  onClose?: () => void;
  showLogout?: boolean;
}

export default function Sidebar({
  items,
  title,
  subtitle,
  roleLabel = 'Membre',
  userName = 'Utilisateur',
  isOpen = false,
  onClose,
  showLogout = true,
}: SidebarProps) {
  const pathname = usePathname();
  const { images } = useSiteImages();

  const isActive = (href: string) => {
    if (href === '#' ) return false;
    return pathname === href || pathname.startsWith(href + '/');
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-gradient-to-b from-emerald-950 via-emerald-900 to-emerald-950 text-white shadow-2xl transition-transform duration-300 lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="relative h-11 w-11 overflow-hidden rounded-2xl ring-2 ring-white/20 shadow-lg">
              <Image src={images.logo} alt="Logo AL-BAYAAN" fill className="object-cover" />
            </div>
            <div>
              <p className="font-bold text-lg leading-tight">{title}</p>
              {subtitle && <p className="text-xs text-emerald-200/80 mt-0.5">{subtitle}</p>}
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-emerald-100 hover:bg-white/10 transition-colors lg:hidden"
          >
            <X size={20} />
          </button>
        </div>

        {/* Nav items */}
        <nav className="flex-1 space-y-1.5 overflow-y-auto px-4 py-6">
          {items.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.label + item.href}
                href={item.href}
                onClick={onClose}
                className={`group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
                  active
                    ? 'bg-gradient-to-r from-amber-400/90 to-amber-500/90 text-emerald-950 shadow-lg shadow-amber-500/20'
                    : 'text-emerald-100/90 hover:bg-white/10 hover:text-white'
                }`}
              >
                <span className={`flex-shrink-0 transition-transform group-hover:scale-110 ${active ? 'text-emerald-950' : 'text-amber-300/80'}`}>
                  {item.icon}
                </span>
                <span className="flex-1">{item.label}</span>
                {item.badge !== undefined && (
                  <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                    active ? 'bg-emerald-900 text-amber-300' : 'bg-amber-400/20 text-amber-300'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User / Footer */}
        <div className="border-t border-white/10 px-4 py-4">
          <div className="flex items-center gap-3 rounded-2xl bg-white/5 px-4 py-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-amber-300 to-amber-500 text-sm font-bold text-emerald-950">
              {userName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="truncate text-sm font-semibold">{userName}</p>
              <p className="text-xs text-emerald-200/70">{roleLabel}</p>
            </div>
          </div>
          {showLogout && (
            <Link
              href="/auth/login"
              className="mt-3 flex items-center justify-center gap-2 rounded-2xl bg-white/5 px-4 py-2.5 text-sm font-medium text-emerald-100/80 transition-colors hover:bg-red-500/20 hover:text-red-200"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Déconnexion
            </Link>
          )}
        </div>
      </aside>
    </>
  );
}