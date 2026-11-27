'use client';

import { ReactNode, useState } from 'react';
import Sidebar, { SidebarItem } from './sidebar';
import TopNavbar from './top-navbar';
import AppHeader from './app-header';

interface AppShellProps {
  children: ReactNode;
  navItems: SidebarItem[];
  title: string;
  subtitle?: string;
  userName?: string;
  userRole?: string;
  notifications?: Array<{ id: number; message: string; time: string }>;
  headerTitle?: string;
  variant?: 'sidebar' | 'topbar';
}

export default function AppShell({
  children,
  navItems,
  title,
  subtitle,
  userName = 'Utilisateur',
  userRole = 'Membre',
  notifications = [],
  headerTitle,
  variant = 'sidebar',
}: AppShellProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  // Topbar variant: horizontal navbar instead of sidebar
  if (variant === 'topbar') {
    return (
      <div className="min-h-screen bg-slate-50">
        <TopNavbar
          items={navItems}
          title={title}
          subtitle={subtitle}
          userName={userName}
          userRole={userRole}
          notifications={notifications}
        />

        <main className="min-h-screen bg-[radial-gradient(circle_at_top_right,_rgba(16,185,129,0.07),_transparent_35%),radial-gradient(circle_at_bottom_left,_rgba(245,158,11,0.05),_transparent_30%),#f8fafc]">
          <div className="mx-auto max-w-7xl px-4 pt-8 pb-28 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    );
  }

  // Sidebar variant (default)
  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar - hidden on mobile, toggled */}
      <div className="hidden lg:block">
        <Sidebar
          items={navItems}
          title={title}
          subtitle={subtitle}
          userName={userName}
          roleLabel={userRole}
        />
      </div>

      {/* Mobile sidebar overlay + drawer */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <Sidebar
            items={navItems}
            title={title}
            subtitle={subtitle}
            userName={userName}
            roleLabel={userRole}
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
          />
        </div>
      )}

      {/* Main content */}
      <div className="flex min-w-0 flex-1 flex-col">
        <AppHeader
          showNotifications={showNotifications}
          notifications={notifications}
          onNotificationClick={() => setShowNotifications(!showNotifications)}
          title={headerTitle || title}
          userName={userName}
          userRole={userRole}
          onMenuClick={() => setIsSidebarOpen(true)}
        />

        <main className="flex-1 bg-[radial-gradient(circle_at_top_right,_rgba(16,185,129,0.07),_transparent_35%),radial-gradient(circle_at_bottom_left,_rgba(245,158,11,0.05),_transparent_30%),#f8fafc]">
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
