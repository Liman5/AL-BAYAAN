'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Card from '@/components/ui/card';
import AppHeader from '@/components/ui/app-header';

const teacherData = {
  name: 'Mme Hana Mansour',
  school: 'AL-BAYAAN',
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

const studentsData = [
  { id: 1, name: 'Sara Ben Ali', class: '3ème A', email: 'sara@example.com', status: 'Actif', average: 15.5 },
  { id: 2, name: 'Youssef Haddad', class: '2nde B', email: 'youssef@example.com', status: 'Actif', average: 13.2 },
  { id: 3, name: 'Lina Mansour', class: '1ère C', email: 'lina@example.com', status: 'Actif', average: 16.8 },
  { id: 4, name: 'Adam Khelil', class: '3ème A', email: 'adam@example.com', status: 'Inactif', average: 12.5 },
  { id: 5, name: 'Amina Zahra', class: '2nde B', email: 'amina@example.com', status: 'Actif', average: 14.3 },
];

export default function StudentsPage() {
  const router = useRouter();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredStudents = studentsData.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.class.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      <AppHeader
        showNotifications={showNotifications}
        notifications={teacherData.notifications}
        onNotificationClick={() => setShowNotifications(!showNotifications)}
      />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-slate-900">Mes Élèves</h2>
          <p className="mt-2 text-slate-600">Gestion et suivi de vos élèves</p>
        </div>

        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            placeholder="Rechercher un élève..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 rounded-lg border border-slate-200 px-4 py-2 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
          <button className="rounded-lg bg-blue-600 px-6 py-2 font-medium text-white transition-colors hover:bg-blue-700 whitespace-nowrap">
            + Ajouter élève
          </button>
        </div>

        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-600">Nom</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-600">Classe</th>
                  <th className="hidden md:table-cell px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-600">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-600">Moyenne</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-600">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-slate-50">
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-slate-900">{student.name}</td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-600">{student.class}</td>
                    <td className="hidden md:table-cell whitespace-nowrap px-6 py-4 text-sm text-slate-600">{student.email}</td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm">
                      <span className="font-semibold text-blue-600">{student.average}/20</span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm">
                      <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                        student.status === 'Actif' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {student.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
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
