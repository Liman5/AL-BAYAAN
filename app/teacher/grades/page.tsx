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
  ]
};

const navItems = [
  { label: 'Accueil', icon: '🏠', href: '/teacher/dashboard' },
  { label: 'Élèves', icon: '👥', href: '/teacher/students' },
  { label: 'Exercices', icon: '📝', href: '/teacher/exercises' },
  { label: 'Notes', icon: '📊', href: '/teacher/grades' },
  { label: 'Plan', icon: '📅', href: '/teacher/planning' }
];

const gradesData = [
  {
    assessment: 'Contrôle 1 - Algèbre',
    subject: 'Mathématiques',
    average: 14.5,
    min: 8,
    max: 20,
    evaluated: 85
  },
  {
    assessment: 'Dissertation - Littérature',
    subject: 'Français',
    average: 13.8,
    min: 10,
    max: 19,
    evaluated: 78
  },
  {
    assessment: 'Quiz - Vocabulaire',
    subject: 'Anglais',
    average: 15.2,
    min: 11,
    max: 20,
    evaluated: 92
  },
  {
    assessment: 'Projet - Sciences',
    subject: 'Sciences',
    average: 16.1,
    min: 13,
    max: 20,
    evaluated: 88
  }
];

const stats = [
  { label: 'Élèves évalués', value: '74', icon: '👥' },
  { label: 'Moyenne générale', value: '14.9/20', icon: '📊' },
  { label: 'Meilleure note', value: '20', icon: '⭐' },
  { label: 'Plus basse note', value: '8', icon: '📉' }
];

export default function GradesPage() {
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
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-slate-900">Mes Notes</h2>
          <p className="mt-2 text-slate-600">Suivi et analyse des évaluations</p>
        </div>

        <div className="mb-8 grid gap-4 grid-cols-1 sm:grid-cols-2">
          {stats.map((stat, idx) => (
            <Card key={idx} className="text-center">
              <p className="text-3xl mb-2">{stat.icon}</p>
              <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
              <p className="mt-2 text-sm text-slate-600">{stat.label}</p>
            </Card>
          ))}
        </div>

        <div className="space-y-4">
          {gradesData.map((grade, idx) => (
            <Card key={idx} className="p-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h3 className="font-semibold text-slate-900">{grade.assessment}</h3>
                  <p className="text-sm text-slate-600 mt-1">{grade.subject}</p>
                </div>
                <div className="grid grid-cols-3 gap-2 md:text-right">
                  <div>
                    <p className="text-xs text-slate-500">Moyenne</p>
                    <p className="text-lg font-bold text-blue-600">{grade.average}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Min/Max</p>
                    <p className="text-sm text-slate-900">{grade.min}/{grade.max}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Évalués</p>
                    <p className="text-sm text-slate-900">{grade.evaluated}</p>
                  </div>
                </div>
              </div>
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
