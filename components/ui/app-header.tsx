'use client';

import Image from 'next/image';
import { useState, useEffect, useRef } from 'react';
import { Bell, Menu, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signOut } from '@/services/auth.service';
import { clearAuthCookies } from '@/lib/authClient';
import { useSiteImages } from '@/components/providers/site-images-provider';

interface AppHeaderProps {
  showNotifications?: boolean;
  notifications?: Array<{ id: number; message: string; time: string }>;
  onNotificationClick?: () => void;
  title?: string;
  userName?: string;
  userRole?: string;
  onMenuClick?: () => void;
}

export default function AppHeader({
  showNotifications = false,
  notifications = [],
  onNotificationClick,
  title = 'AL-BAYAAN',
  userName = 'Utilisateur',
  userRole = 'Membre',
  onMenuClick,
}: AppHeaderProps) {
  const [localShowNotifications, setLocalShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { images } = useSiteImages();

  const isShowingNotifications = showNotifications || localShowNotifications;

  // Close dropdowns on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setLocalShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setShowProfile(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Déconnexion propre : signOut + clear cookies + redirect login
  async function handleLogout() {
    try {
      await signOut();
    } finally {
      clearAuthCookies();
      router.push('/auth/login');
    }
  }

  const initials = userName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="sticky top-0 z-40 border-b border-emerald-900/10 bg-white/90 backdrop-blur-xl shadow-sm">
      <div className="mx-auto flex items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        {/* Menu button (mobile) */}
        {onMenuClick && (
          <button
            onClick={onMenuClick}
            className="rounded-xl border border-slate-200 p-2 text-slate-600 transition-colors hover:bg-slate-100 lg:hidden"
            aria-label="Ouvrir le menu"
          >
            <Menu size={20} />
          </button>
        )}

        {/* Logo and title */}
        <div className="flex items-center gap-3">
          <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-2xl border border-emerald-900/10 bg-white shadow-md">
            <Image
              src={images.logo}
              alt="Logo AL-BAYAAN"
              fill
              className="object-cover"
              priority
            />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-emerald-950">{title}</h1>
            <p className="hidden sm:block text-xs text-slate-500">Plateforme pédagogique</p>
          </div>
        </div>

        {/* Notifications & Profile */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Notifications */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => {
                const newState = !isShowingNotifications;
                setLocalShowNotifications(newState);
                onNotificationClick?.();
              }}
              className={`relative rounded-xl p-2.5 transition-all ${
                isShowingNotifications
                  ? 'bg-amber-50 text-amber-700'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
              aria-label="Notifications"
            >
              <Bell size={20} />
              {notifications && notifications.length > 0 && (
                <span className="absolute -top-1 -right-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-rose-500 text-[10px] font-bold text-white shadow-md">
                  {notifications.length}
                </span>
              )}
            </button>

            {isShowingNotifications && notifications && (
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
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-600 transition-colors hover:bg-red-50"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Déconnexion
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}