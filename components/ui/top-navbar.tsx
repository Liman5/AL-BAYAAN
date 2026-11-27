'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Bell, ChevronDown } from 'lucide-react';
import { SidebarItem } from './sidebar';
import { useSiteImages } from '@/components/providers/site-images-provider';

interface TopNavbarProps {
  items: SidebarItem[];
  title: string;
  subtitle?: string;
  userName?: string;
  userRole?: string;
  notifications?: Array<{ id: number; message: string; time: string }>;
}

export default function TopNavbar({
  items,
  title,
  subtitle,
  userName = 'Utilisateur',
  userRole = 'Membre',
  notifications = [],
}: TopNavbarProps) {
  const pathname = usePathname();
  const { images } = useSiteImages();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setShowProfile(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isActive = (href: string) => {
    if (href === '#') return false;
    return pathname === href || pathname.startsWith(href + '/');
  };

  const initials = userName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <>
      {/* Header top */}
      <header className="sticky top-0 z-40 border-b border-emerald-900/10 bg-white/95 backdrop-blur-xl shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between gap-4">
            {/* Logo & Title */}
            <div className="flex items-center gap-3">
              <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-xl border border-emerald-900/10 bg-white shadow-md">
                <Image
                  src={images.logo}
                  alt="Logo AL-BAYAAN"
                  fill
                  className="object-cover"
                  priority
                />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-base font-bold tracking-tight text-emerald-950 leading-tight">{title}</h1>
                {subtitle && <p className="text-[11px] text-slate-500 leading-tight">{subtitle}</p>}
              </div>
            </div>

            {/* Notifications & Profile */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Notifications */}
              <div className="relative" ref={notifRef}>
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className={`relative rounded-xl p-2.5 transition-all ${
                    showNotifications
                      ? 'bg-amber-50 text-amber-700'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                  aria-label="Notifications"
                >
                  <Bell size={20} />
                  {notifications.length > 0 && (
                    <span className="absolute -top-1 -right-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-rose-500 text-[10px] font-bold text-white shadow-md">
                      {notifications.length}
                    </span>
                  )}
                </button>

                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl z-50">
                    <div className="border-b border-slate-100 bg-gradient-to-r from-emerald-50 to-amber-50 px-4 py-3">
                      <h3 className="font-semibold text-emerald-950">Notifications</h3>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.length === 0 && (
                        <p className="px-4 py-8 text-center text-sm text-slate-500">
                          Aucune notification pour le moment.
                        </p>
                      )}
                      {notifications.map((notif) => (
                        <div
                          key={notif.id}
                          className="flex items-start gap-3 border-b border-slate-50 px-4 py-3 transition-colors hover:bg-slate-50"
                        >
                          <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-amber-400" />
                          <div>
                            <p className="text-sm text-slate-900">{notif.message}</p>
                            <p className="mt-1 text-xs text-slate-500">{notif.time}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Profile */}
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setShowProfile(!showProfile)}
                  className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white py-1.5 pl-1.5 pr-2.5 transition-colors hover:bg-slate-50 sm:gap-3 sm:pr-3"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-700 text-sm font-bold text-white shadow-sm">
                    {initials}
                  </div>
                  <div className="hidden text-left md:block">
                    <p className="text-sm font-semibold leading-tight text-slate-900">{userName}</p>
                    <p className="text-xs leading-tight text-slate-500">{userRole}</p>
                  </div>
                  <ChevronDown size={16} className={`text-slate-400 transition-transform ${showProfile ? 'rotate-180' : ''}`} />
                </button>

                {showProfile && (
                  <div className="absolute right-0 mt-2 w-56 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl z-50">
                    <div className="border-b border-slate-100 bg-gradient-to-r from-emerald-50 to-amber-50 px-4 py-3">
                      <p className="text-sm font-semibold text-emerald-950">{userName}</p>
                      <p className="text-xs text-slate-500">{userRole} • AL-BAYAAN</p>
                    </div>
                    <div className="space-y-1 px-2 py-2">
                      <Link
                        href="#"
                        onClick={() => setShowProfile(false)}
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-700 transition-colors hover:bg-slate-100"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        Mon profil
                      </Link>
                      <Link
                        href="#"
                        onClick={() => setShowProfile(false)}
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-700 transition-colors hover:bg-slate-100"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Paramètres
                      </Link>
                    </div>
                    <div className="border-t border-slate-100 px-2 py-2">
                      <Link
                        href="/auth/login"
                        onClick={() => setShowProfile(false)}
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-600 transition-colors hover:bg-red-50"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Déconnexion
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Bottom navigation bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-emerald-900/10 bg-white/95 backdrop-blur-xl shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        <div className="mx-auto max-w-7xl px-2 sm:px-4">
          <div className="flex items-stretch justify-around gap-1 py-2">
            {items.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.label + item.href}
                  href={item.href}
                  className={`flex flex-1 flex-col items-center gap-1 rounded-xl px-2 py-2.5 text-xs font-medium transition-all duration-200 ${
                    active
                      ? 'bg-gradient-to-r from-emerald-600 to-emerald-700 text-white shadow-md shadow-emerald-600/20'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-emerald-900'
                  }`}
                >
                  <span className={`shrink-0 transition-transform ${active ? 'text-white scale-110' : 'text-emerald-600'}`}>
                    {item.icon}
                  </span>
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      </nav>
    </>
  );
}