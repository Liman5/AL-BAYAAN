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

const gradesData = [
  { id: 1, name: 'Devoir 1', class: '3ème A', average: 14.5, min: 8, max: 19 },
  { id: 2, name: 'Devoir 2', class: '3ème A', average: 13.8, min: 7, max: 18 },
  { id: 3, name: 'Interro', class: '2nde B', average: 12.3, min: 6, max: 17 },
  { id: 4, name: 'Contrôle', class: '1ère C', average: 15.2, min: 9, max: 20 },
];

export default function GradesPage() {
  const router = useRouter();
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
          <h2 className="text-3xl font-bold text-slate-900">Gestion des Notes</h2>
          <p className="mt-2 text-slate-600">Visualisez et gérez les notes de vos élèves</p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card className="p-6">
            <p className="text-sm text-slate-600">Total élèves évalués</p>
            <p className="mt-2 text-3xl font-bold text-blue-600">74</p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-slate-600">Moyenne générale</p>
            <p className="mt-2 text-3xl font-bold text-green-600">14.2/20</p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-slate-600">Meilleure note</p>
            <p className="mt-2 text-3xl font-bold text-purple-600">20</p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-slate-600">Note la plus basse</p>
            <p className="mt-2 text-3xl font-bold text-orange-600">6</p>
          </Card>
        </div>

        <div className="grid gap-6">
          {gradesData.map((grade) => (
            <Card key={grade.id} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">{grade.name}</h3>
                  <p className="text-sm text-slate-600">Classe {grade.class}</p>
                </div>
                <button className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700">
                  ✏️ Modifier
                </button>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-lg bg-slate-50 p-4">
                  <p className="text-sm text-slate-600">Moyenne</p>
                  <p className="mt-2 text-2xl font-bold text-blue-600">{grade.average}</p>
                </div>
                <div className="rounded-lg bg-slate-50 p-4">
                  <p className="text-sm text-slate-600">Minimum</p>
                  <p className="mt-2 text-2xl font-bold text-orange-600">{grade.min}</p>
                </div>
                <div className="rounded-lg bg-slate-50 p-4">
                  <p className="text-sm text-slate-600">Maximum</p>
                  <p className="mt-2 text-2xl font-bold text-green-600">{grade.max}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
