'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Card from '@/components/ui/card';

const teacherData = {
  name: 'Mme Hana Mansour',
  school: 'AL-BAYAAN',
};

const navItems = [
  { label: 'Accueil', icon: '🏠', href: '/teacher/dashboard' },
  { label: 'Élèves', icon: '👥', href: '/teacher/students' },
  { label: 'Exercices', icon: '📝', href: '/teacher/exercises' },
  { label: 'Notes', icon: '📊', href: '/teacher/grades' },
  { label: 'Plan', icon: '📅', href: '/teacher/planning' }
];

const planningData = [
  { id: 1, day: 'Lundi', date: '27 mai', class: '3ème A', subject: 'Mathématiques', time: '10:00 - 11:00', room: 'Salle 101' },
  { id: 2, day: 'Lundi', date: '27 mai', class: '2nde B', subject: 'Physique', time: '14:00 - 15:00', room: 'Labo' },
  { id: 3, day: 'Mardi', date: '28 mai', class: '1ère C', subject: 'Chimie', time: '09:00 - 10:00', room: 'Labo' },
  { id: 4, day: 'Mercredi', date: '29 mai', class: '3ème A', subject: 'Mathématiques', time: '10:00 - 11:00', room: 'Salle 101' },
  { id: 5, day: 'Jeudi', date: '30 mai', class: '2nde B', subject: 'Physique', time: '14:00 - 15:00', room: 'Labo' },
  { id: 6, day: 'Vendredi', date: '31 mai', class: '1ère C', subject: 'Chimie', time: '09:00 - 10:00', room: 'Salle 102' },
];

export default function PlanningPage() {
  const router = useRouter();
  const [showProfile, setShowProfile] = useState(false);

  const groupedByDay: { [key: string]: typeof planningData } = planningData.reduce((acc, item) => {
    const day = item.day;
    if (!acc[day]) acc[day] = [];
    acc[day].push(item);
    return acc;
  }, {} as { [key: string]: typeof planningData });

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
                onClick={() => setShowProfile(!showProfile)}
                className="flex items-center gap-2 rounded-lg px-3 py-2 transition-colors hover:bg-slate-100"
              >
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-sm font-bold">
                  HM
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
          <h2 className="text-3xl font-bold text-slate-900">Emploi du Temps</h2>
          <p className="mt-2 text-slate-600">Votre planning de cours pour la semaine</p>
        </div>

        <div className="mb-6">
          <button className="rounded-lg bg-blue-600 px-6 py-2 font-medium text-white transition-colors hover:bg-blue-700">
            + Ajouter un cours
          </button>
        </div>

        <div className="space-y-8">
          {Object.entries(groupedByDay).map(([day, courses]) => (
            <div key={day}>
              <h3 className="mb-4 text-xl font-semibold text-slate-900">
                {day}
              </h3>
              <div className="grid gap-4">
                {courses.map((course) => (
                  <Card key={course.id} className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-800">
                            {course.time}
                          </span>
                          <span className="text-sm font-medium text-slate-600">Salle {course.room}</span>
                        </div>
                        <h4 className="text-lg font-semibold text-slate-900">{course.subject}</h4>
                        <p className="mt-1 text-sm text-slate-600">{course.class}</p>
                      </div>
                      <div className="flex gap-2">
                        <button className="rounded-lg bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-200">
                          ✏️
                        </button>
                        <button className="rounded-lg bg-red-100 px-3 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-200">
                          🗑️
                        </button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
