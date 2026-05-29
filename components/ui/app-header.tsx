'use client';

import Image from 'next/image';
import { useState } from 'react';

interface AppHeaderProps {
  showNotifications?: boolean;
  notifications?: Array<{ id: number; message: string; time: string }>;
  onNotificationClick?: () => void;
}

export default function AppHeader({
  showNotifications = false,
  notifications = [],
  onNotificationClick
}: AppHeaderProps) {
  const [localShowNotifications, setLocalShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const isShowingNotifications = showNotifications || localShowNotifications;

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white shadow-sm">
      <div className="mx-auto flex items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        {/* Logo et école */}
        <div className="flex items-center gap-3">
          <div className="relative h-12 w-12 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <Image
              src="https://www.image2url.com/r2/default/images/1779783874231-dae3f087-5437-4ef2-98c9-67a961155f8f.jpg"
              alt="AL-BAYAAN logo"
              fill
              className="object-cover"
              priority
            />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900">AL-BAYAAN</h1>
            <p className="hidden sm:block text-xs text-slate-500">Plateforme pédagogique</p>
          </div>
        </div>

        {/* Notifications et Profile */}
        <div className="flex items-center gap-4">
          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => {
                const newState = !isShowingNotifications;
                setLocalShowNotifications(newState);
                onNotificationClick?.();
              }}
              className="relative rounded-lg p-2 text-slate-600 transition-colors hover:bg-slate-100"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {notifications && notifications.length > 0 && (
                <span className="absolute top-1 right-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                  {notifications.length}
                </span>
              )}
            </button>

            {isShowingNotifications && notifications && notifications.length > 0 && (
              <div className="absolute right-0 mt-2 w-80 rounded-lg border border-slate-200 bg-white shadow-lg z-50">
                <div className="border-b border-slate-200 px-4 py-3">
                  <h3 className="font-semibold text-slate-900">Notifications</h3>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.map((notif) => (
                    <div key={notif.id} className="border-b border-slate-100 px-4 py-3 transition-colors hover:bg-slate-50">
                      <p className="text-sm text-slate-900">{notif.message}</p>
                      <p className="mt-1 text-xs text-slate-500">{notif.time}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Profile */}
          <div className="relative">
            <button
              onClick={() => setShowProfile(!showProfile)}
              className="flex items-center gap-2 rounded-lg px-3 py-2 transition-colors hover:bg-slate-100"
            >
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white text-sm font-bold">
                HM
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-medium text-slate-900">Hana M.</p>
                <p className="text-xs text-slate-500">Enseignante</p>
              </div>
            </button>

            {showProfile && (
              <div className="absolute right-0 mt-2 w-48 rounded-lg border border-slate-200 bg-white shadow-lg z-50">
                <div className="border-b border-slate-200 px-4 py-3">
                  <p className="text-sm font-semibold text-slate-900">Mme Hana Mansour</p>
                  <p className="text-xs text-slate-500">Enseignante • AL-BAYAAN</p>
                </div>
                <div className="space-y-1 px-2 py-2">
                  <button className="w-full rounded px-3 py-2 text-left text-sm text-slate-700 transition-colors hover:bg-slate-100">
                    👤 Mon profil
                  </button>
                  <button className="w-full rounded px-3 py-2 text-left text-sm text-slate-700 transition-colors hover:bg-slate-100">
                    ⚙️ Paramètres
                  </button>
                </div>
                <div className="border-t border-slate-200 px-2 py-2">
                  <button className="w-full rounded px-3 py-2 text-left text-sm text-red-600 transition-colors hover:bg-red-50">
                    🚪 Déconnexion
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
