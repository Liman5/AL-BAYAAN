'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Card from '@/components/ui/card';

const teacherData = {
  name: 'Mme Hana Mansour',
  school: 'AL-BAYAAN',
  classes: [
    { id: 1, name: '3ème A', subject: 'Mathématiques', students: 28, nextClass: 'Aujourd\'hui 10:00' },
    { id: 2, name: '2nde B', subject: 'Physique', students: 24, nextClass: 'Aujourd\'hui 14:00' },
    { id: 3, name: '1ère C', subject: 'Chimie', students: 22, nextClass: 'Demain 09:00' }
  ],
  recentStudents: [
    { name: 'Sara Ben Ali', class: '3ème A', lastGrade: 15.5, status: 'Excellent' },
    { name: 'Youssef Haddad', class: '2nde B', lastGrade: 13.2, status: 'Bien' },
    { name: 'Lina Mansour', class: '1ère C', lastGrade: 16.8, status: 'Excellent' },
    { name: 'Adam Khelil', class: '3ème A', lastGrade: 12.5, status: 'Passable' }
  ],
  upcomingTasks: [
    { title: 'Correction devoirs 3ème A', dueDate: 'Aujourd\'hui', priority: 'Haute' },
    { title: 'Préparer contrôle physique', dueDate: 'Demain', priority: 'Moyenne' },
    { title: 'Rencontre parent Sara', dueDate: '02 juin', priority: 'Normale' }
  ],
  stats: {
    totalStudents: 74,
    classesThisWeek: 12,
    averageGrade: 14.2,
    attendanceRate: '95%'
  },
  notifications: [
    { id: 1, message: 'Sara a remis son devoir', time: 'Il y a 2h' },
    { id: 2, message: '5 absences en 3ème A', time: 'Il y a 4h' },
    { id: 3, message: 'Réunion parents demain', time: 'Il y a 1j' }
  ]
};

const navItems = [
  { label: 'Accueil', icon: '🏠', href: '/teacher/dashboard' },
  { label: 'Élèves', icon: '👥', href: '/teacher/students' },
  { label: 'Exercices', icon: '📝', href: '/teacher/exercises' },
  { label: 'Notes', icon: '📊', href: '/teacher/grades' },
  { label: 'Plan', icon: '📅', href: '/teacher/planning' }
];

export default function TeacherDashboardPage() {
  const router = useRouter();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      {/* Header simplifié */}
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white shadow-sm">
        <div className="mx-auto flex items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          {/* Logo et école */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-lg font-bold text-white">
              📚
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900">{teacherData.school}</h1>
              <p className="hidden sm:block text-xs text-slate-500">Plateforme pédagogique</p>
            </div>
          </div>

          {/* Notifications et Profile */}
          <div className="flex items-center gap-4">
            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative rounded-lg p-2 text-slate-600 transition-colors hover:bg-slate-100"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {teacherData.notifications.length > 0 && (
                  <span className="absolute top-1 right-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                    {teacherData.notifications.length}
                  </span>
                )}
              </button>

              {/* Dropdown Notifications */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 rounded-lg border border-slate-200 bg-white shadow-lg">
                  <div className="border-b border-slate-200 px-4 py-3">
                    <h3 className="font-semibold text-slate-900">Notifications</h3>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {teacherData.notifications.map((notif) => (
                      <div key={notif.id} className="border-b border-slate-100 px-4 py-3 transition-colors hover:bg-slate-50">
                        <p className="text-sm text-slate-900">{notif.message}</p>
                        <p className="mt-1 text-xs text-slate-500">{notif.time}</p>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-slate-200 px-4 py-2">
                    <button className="text-sm text-blue-600 transition-colors hover:text-blue-700">
                      Voir tout
                    </button>
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
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-sm font-bold">
                  HM
                </div>
                <div className="hidden sm:block">
                  <p className="text-sm font-medium text-slate-900">Hana M.</p>
                  <p className="text-xs text-slate-500">Enseignante</p>
                </div>
              </button>

              {/* Dropdown Profile */}
              {showProfile && (
                <div className="absolute right-0 mt-2 w-48 rounded-lg border border-slate-200 bg-white shadow-lg">
                  <div className="border-b border-slate-200 px-4 py-3">
                    <p className="text-sm font-semibold text-slate-900">{teacherData.name}</p>
                    <p className="text-xs text-slate-500">Enseignante • {teacherData.school}</p>
                  </div>
                  <div className="space-y-1 px-2 py-2">
                    <button className="w-full rounded px-3 py-2 text-left text-sm text-slate-700 transition-colors hover:bg-slate-100">
                      👤 Mon profil
                    </button>
                    <button className="w-full rounded px-3 py-2 text-left text-sm text-slate-700 transition-colors hover:bg-slate-100">
                      ⚙️ Paramètres
                    </button>
                    <button className="w-full rounded px-3 py-2 text-left text-sm text-slate-700 transition-colors hover:bg-slate-100">
                      🔔 Préférences
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

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* En-tête */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-slate-900">
            Bienvenue, {teacherData.name}
          </h2>
          <p className="mt-2 text-slate-600">
            Voici un aperçu de vos activités d'enseignement
          </p>
        </div>

        {/* Statistiques rapides */}
        <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total Élèves</p>
                <p className="mt-2 text-3xl font-bold text-blue-600">
                  {teacherData.stats.totalStudents}
                </p>
              </div>
              <div className="rounded-full bg-blue-100 p-3">
                <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
            </div>
          </Card>

          <Card className="bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Classes cette semaine</p>
                <p className="mt-2 text-3xl font-bold text-green-600">
                  {teacherData.stats.classesThisWeek}
                </p>
              </div>
              <div className="rounded-full bg-green-100 p-3">
                <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </Card>

          <Card className="bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Moyenne générale</p>
                <p className="mt-2 text-3xl font-bold text-purple-600">
                  {teacherData.stats.averageGrade}/20
                </p>
              </div>
              <div className="rounded-full bg-purple-100 p-3">
                <svg className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
          </Card>

          <Card className="bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Taux de présence</p>
                <p className="mt-2 text-3xl font-bold text-orange-600">
                  {teacherData.stats.attendanceRate}
                </p>
              </div>
              <div className="rounded-full bg-orange-100 p-3">
                <svg className="h-6 w-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </Card>
        </div>

        {/* Contenu principal en 2 colonnes */}
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Colonne gauche - 2/3 */}
          <div className="space-y-8 lg:col-span-2">
            {/* Mes classes */}
            <Card className="bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-xl font-semibold text-slate-900">Mes Classes</h2>
              <div className="space-y-4">
                {teacherData.classes.map((classe) => (
                  <div
                    key={classe.id}
                    className="flex items-center justify-between rounded-lg border border-slate-200 p-4 transition-all hover:border-blue-300 hover:shadow-md cursor-pointer"
                  >
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-900">{classe.name}</h3>
                      <p className="text-sm text-slate-600">{classe.subject}</p>
                    </div>
                    <div className="text-center px-4">
                      <p className="text-2xl font-bold text-blue-600">{classe.students}</p>
                      <p className="text-xs text-slate-500">élèves</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-slate-900">Prochain cours</p>
                      <p className="text-sm text-slate-600">{classe.nextClass}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Élèves récents */}
            <Card className="bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-xl font-semibold text-slate-900">Activité récente des élèves</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead>
                    <tr className="bg-slate-50">
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-600">
                        Nom
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-600">
                        Classe
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-600">
                        Dernière note
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-600">
                        Statut
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {teacherData.recentStudents.map((student, index) => (
                      <tr key={index} className="hover:bg-slate-50">
                        <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-slate-900">
                          {student.name}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-600">
                          {student.class}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-sm">
                          <span className="font-semibold text-blue-600">{student.lastGrade}/20</span>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-sm">
                          <span
                            className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                              student.status === 'Excellent'
                                ? 'bg-green-100 text-green-800'
                                : student.status === 'Bien'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}
                          >
                            {student.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>

          {/* Colonne droite - 1/3 */}
          <div className="space-y-8">
            {/* Tâches à venir */}
            <Card className="bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-xl font-semibold text-slate-900">Tâches à venir</h2>
              <div className="space-y-3">
                {teacherData.upcomingTasks.map((task, index) => (
                  <div
                    key={index}
                    className="rounded-lg border border-slate-200 p-3 transition-all hover:border-blue-300 hover:shadow-sm"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-slate-900">{task.title}</h4>
                        <p className="mt-1 text-sm text-slate-600">{task.dueDate}</p>
                      </div>
                      <span
                        className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold whitespace-nowrap ml-2 ${
                          task.priority === 'Haute'
                            ? 'bg-red-100 text-red-800'
                            : task.priority === 'Moyenne'
                            ? 'bg-orange-100 text-orange-800'
                            : 'bg-slate-100 text-slate-800'
                        }`}
                      >
                        {task.priority}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Actions rapides */}
            <Card className="bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-xl font-semibold text-slate-900">Actions rapides</h2>
              <div className="space-y-2">
                <button className="w-full rounded-lg bg-blue-600 px-4 py-3 text-left font-medium text-white transition-colors hover:bg-blue-700">
                  📝 Créer un nouveau devoir
                </button>
                <button className="w-full rounded-lg bg-green-600 px-4 py-3 text-left font-medium text-white transition-colors hover:bg-green-700">
                  ✅ Prendre les présences
                </button>
                <button className="w-full rounded-lg bg-purple-600 px-4 py-3 text-left font-medium text-white transition-colors hover:bg-purple-700">
                  📊 Saisir des notes
                </button>
                <button className="w-full rounded-lg bg-orange-600 px-4 py-3 text-left font-medium text-white transition-colors hover:bg-orange-700">
                  📄 Générer un rapport
                </button>
              </div>
            </Card>
          </div>
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
