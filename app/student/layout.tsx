'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ReactNode, useState, useEffect } from 'react';
import { LayoutDashboard, BookOpen, FileText, TrendingUp, Calendar } from 'lucide-react';
import AppHeader from '@/components/ui/app-header';
import { getAuthUserIdFromCookie } from '@/lib/authClient';
import { fetchStudentData } from '@/services/db.service';

const navItems = [
  { label: 'Tableau de bord', href: '/student/dashboard', icon: LayoutDashboard },
  { label: 'Mes cours', href: '/student/courses', icon: BookOpen },
  { label: 'Mes devoirs', href: '/student/assignments', icon: FileText },
  { label: 'Mes notes', href: '/student/grades', icon: TrendingUp },
  { label: 'Emploi du temps', href: '/student/schedule', icon: Calendar },
];

export default function StudentLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [userName, setUserName] = useState('Élève');
  const [notifications, setNotifications] = useState<Array<{ id: number; message: string; time: string }>>([]);

  // Charger le nom de l'élève
  useEffect(() => {
    const uid = getAuthUserIdFromCookie();
    if (uid) {
      (async () => {
        const data = await fetchStudentData(uid);
        if (data?.student?.users) {
          const name = `${data.student.users.first_name || ''} ${data.student.users.last_name || ''}`.trim();
          if (name) setUserName(name);
        }
        // Notifications = annonces de la classe
        if (data?.announcements && data.announcements.length > 0) {
          setNotifications(data.announcements.slice(0, 5).map((a: any, i: number) => ({
            id: i,
            message: a.message || a.title || 'Nouvelle annonce',
            time: a.created_at ? new Date(a.created_at).toLocaleDateString('fr-FR') : '',
          })));
        }
      })();
    }
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      {/* App Header en haut : notifications + nom + profil + déconnexion */}
      <AppHeader
        userName={userName}
        userRole="Élève"
        notifications={notifications}
        title="Espace Élève"
        onNotificationClick={() => {}}
      />

      <main className="min-h-screen">{children}</main>

      {/* Barre de navigation horizontale EN BAS (sans bouton quitter) */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200 bg-white shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-2 py-2 sm:px-4">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-1 rounded-xl px-3 py-2 text-[10px] font-semibold transition-all sm:px-5 sm:text-xs ${
                  isActive
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                }`}
              >
                <Icon size={20} />
                <span className="hidden sm:block">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}