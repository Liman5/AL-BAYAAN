'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Card from '@/components/ui/card';
import AppHeader from '@/components/ui/app-header';
import AppHeader from '@/components/ui/app-header';

const teacherData = {
  name: 'Mme Hana Mansour',
  school: 'AL-BAYAAN',
  notifications: [
    { id: 1, message: 'Absence détectée', time: 'Il y a 1h' },
    { id: 2, message: 'Classe confirmée', time: 'Il y a 3h' }
  ]
};

const navItems = [
  { label: 'Accueil', icon: '🏠', href: '/teacher/dashboard' },
  { label: 'Élèves', icon: '👥', href: '/teacher/students' },
  { label: 'Exercices', icon: '📝', href: '/teacher/exercises' },
  { label: 'Notes', icon: '📊', href: '/teacher/grades' },
  { label: 'Plan', icon: '📅', href: '/teacher/planning' }
];

const planningData = [
  { day: 'Lundi', time: '08:00-09:00', room: '301', class: '3ème A', subject: 'Mathématiques' },
  { day: 'Lundi', time: '09:15-10:15', room: '301', class: '2nde B', subject: 'Algèbre' },
  { day: 'Mardi', time: '10:30-11:30', room: '302', class: '1ère C', subject: 'Géométrie' },
  { day: 'Mercredi', time: '14:00-15:00', room: '301', class: '3ème A', subject: 'Exercices' },
  { day: 'Jeudi', time: '08:00-09:00', room: '303', class: '2nde B', subject: 'Contrôle' },
  { day: 'Vendredi', time: '11:00-12:00', room: '301', class: '1ère C', subject: 'Révisions' }
];

export default function PlanningPage() {
  const router = useRouter();
  const [showNotifications, setShowNotifications] = useState(false);

  const groupedByDay: { [key: string]: typeof planningData } = planningData.reduce(
    (acc, item) => {
      const day = item.day;
      if (!acc[day]) acc[day] = [];
      acc[day].push(item);
      return acc;
    },
    {} as { [key: string]: typeof planningData }
  );

  const daysOrder = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'];

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      <AppHeader
        showNotifications={showNotifications}
        notifications={teacherData.notifications}
        onNotificationClick={() => setShowNotifications(!showNotifications)}
      />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-slate-900">Mon Planning</h2>
          <p className="mt-2 text-slate-600">Emploi du temps de la semaine</p>
        </div>

        <div className="space-y-6">
          {daysOrder.map(day => {
            const daySessions = groupedByDay[day] || [];
            if (daySessions.length === 0) return null;

            return (
              <div key={day}>
                <h3 className="mb-3 text-lg font-semibold text-slate-900">{day}</h3>
                <div className="space-y-3">
                  {daySessions.map((session, idx) => (
                    <Card key={idx} className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex-1">
                        <p className="font-semibold text-slate-900">{session.subject}</p>
                        <p className="mt-1 text-sm text-slate-600">
                          {session.time} • Salle {session.room}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">{session.class}</p>
                      </div>
                      <div className="flex gap-2">
                        <button className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-200">
                          ✏️ Modifier
                        </button>
                        <button className="rounded-lg bg-red-100 px-4 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-200">
                          🗑️ Supprimer
                        </button>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* Navigation Bar en bas - Mobile Friendly */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200 bg-white shadow-lg">
        <div className="mx-auto grid grid-cols-5 gap-1 px-2 py-2 sm:px-4">
          {navItems.map((item) => (
            <button
              key={item.href}
              onClick={() => router.push(item.href)}
              className="flex flex-col items-center gap-1 rounded-lg px-2 py-3 text-xs sm:text-sm font-medium text-slate-600 transition-all hover:bg-slate-100 hover:text-slate-900"
            >
              <span className="text-xl sm:text-2xl">{item.icon}</span>
              <span className="hidden sm:inline">{item.label}</span>
              <span className="sm:hidden text-xs">{item.label.split(' ')[0]}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}
