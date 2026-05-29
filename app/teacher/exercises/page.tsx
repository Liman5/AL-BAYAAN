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
    { id: 1, message: 'Sara a remis son devoir', time: 'Il y a 2h' },
    { id: 2, message: '5 absences en 3ème A', time: 'Il y a 4h' },
  ]
};

const navItems = [
  { label: 'Accueil', icon: '🏠', href: '/teacher/dashboard' },
  { label: 'Élèves', icon: '👥', href: '/teacher/students' },
  { label: 'Exercices', icon: '📝', href: '/teacher/exercises' },
  { label: 'Notes', icon: '📊', href: '/teacher/grades' },
  { label: 'Plan', icon: '📅', href: '/teacher/planning' }
];

const exercisesData = [
  { id: 1, title: 'Devoir Math - Algèbre', class: '3ème A', dueDate: '2024-02-15', submitted: 18, total: 22 },
  { id: 2, title: 'Français - Dissertations', class: '2nde B', dueDate: '2024-02-10', submitted: 15, total: 19 },
  { id: 3, title: 'Anglais - Vocabulaire', class: '1ère C', dueDate: '2024-02-20', submitted: 21, total: 25 },
];

export default function ExercisesPage() {
  const router = useRouter();
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      <AppHeader
        showNotifications={showNotifications}
        notifications={teacherData.notifications}
        onNotificationClick={() => setShowNotifications(!showNotifications)}
      />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-3xl font-bold text-slate-900">Mes Exercices</h2>
            <p className="mt-2 text-slate-600">Créer et suivre les devoirs</p>
          </div>
          <button className="rounded-lg bg-blue-600 px-6 py-2 font-medium text-white transition-colors hover:bg-blue-700">
            + Nouvel Exercice
          </button>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {exercisesData.map((exercise) => (
            <Card key={exercise.id} className="flex flex-col gap-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">{exercise.title}</h3>
                <p className="mt-1 text-sm text-slate-600">{exercise.class}</p>
                <p className="mt-2 text-xs text-slate-500">Échéance: {exercise.dueDate}</p>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-600">Remis</span>
                  <span className="font-semibold text-slate-900">{exercise.submitted}/{exercise.total}</span>
                </div>
                <div className="h-2 rounded-full bg-slate-200 overflow-hidden">
                  <div
                    className="h-full bg-blue-600 transition-all"
                    style={{ width: `${(exercise.submitted / exercise.total) * 100}%` }}
                  />
                </div>
              </div>

              <button className="mt-4 rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-200">
                ✏️ Modifier
              </button>
            </Card>
          ))}
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
