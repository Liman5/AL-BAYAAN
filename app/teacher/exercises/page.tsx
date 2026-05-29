'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Card from '@/components/ui/card';

const teacherData = {
  name: 'Mme Hana Mansour',
  school: 'AL-BAYAAN',
  notifications: [
    { id: 1, message: 'Sara a remis son devoir', time: 'Il y a 2h' }
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
  { id: 1, title: 'Exercices algèbre', class: '3ème A', dueDate: '30 mai', submitted: 18, total: 28 },
  { id: 2, title: 'TP Chimie organique', class: '1ère C', dueDate: '28 mai', submitted: 15, total: 22 },
  { id: 3, title: 'Révision physique', class: '2nde B', dueDate: '01 juin', submitted: 12, total: 24 },
];

export default function ExercisesPage() {
  const router = useRouter();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white shadow-sm">
        <div className="mx-auto flex items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-lg font-bold text-white">
              📚
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900">{teacherData.school}</h1>
              <p className="text-xs text-slate-500">Plateforme pédagogique</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative rounded-lg p-2 text-slate-600 transition-colors hover:bg-slate-100"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </button>
            </div>

            <div className="relative">
              <button
                onClick={() => setShowProfile(!showProfile)}
                className="flex items-center gap-2 rounded-lg px-3 py-2 transition-colors hover:bg-slate-100"
              >
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-sm font-bold">
                  HM
                </div>
                <div className="hidden sm:block">
                  <p className="text-sm font-medium text-slate-900">Hana M.</p>
                  <p className="text-xs text-slate-500">Enseignante</p>
                </div>
              </button>
            </div>
          </div>
        </div>

        <nav className="border-t border-slate-200 bg-white">
          <div className="mx-auto flex gap-1 overflow-x-auto px-4 py-2 sm:px-6 lg:px-8">
            {navItems.map((item) => (
              <button
                key={item.href}
                onClick={() => router.push(item.href)}
                className="flex items-center gap-2 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100"
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </nav>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-slate-900">Exercices</h2>
          <p className="mt-2 text-slate-600">Gérez les exercices et devoirs de vos classes</p>
        </div>

        <div className="mb-6">
          <button className="rounded-lg bg-blue-600 px-6 py-2 font-medium text-white transition-colors hover:bg-blue-700">
            + Créer un exercice
          </button>
        </div>

        <div className="grid gap-6">
          {exercisesData.map((exercise) => (
            <Card key={exercise.id} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-slate-900">{exercise.title}</h3>
                  <p className="mt-1 text-sm text-slate-600">Classe {exercise.class}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-slate-600">À rendre le</p>
                  <p className="text-lg font-bold text-slate-900">{exercise.dueDate}</p>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-600">Remis par les élèves</span>
                    <span className="text-sm font-semibold text-slate-900">{exercise.submitted}/{exercise.total}</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-200">
                    <div
                      className="h-full rounded-full bg-green-500"
                      style={{ width: `${(exercise.submitted / exercise.total) * 100}%` }}
                    />
                  </div>
                </div>
                <button className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-200">
                  ✏️ Modifier
                </button>
              </div>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
