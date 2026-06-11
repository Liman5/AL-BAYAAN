'use client';

import { ReactNode, useState } from 'react';
import { ResponsiveSidebar } from '@/components/ui/responsive-sidebar';
import { AdminHeaderComponent } from '@/components/admin/admin-header';
import { Users, BookOpen, BarChart3, FileText } from 'lucide-react';

export default function AdminLayout({ children }: { children: ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const navItems = [
    {
      id: 'dashboard',
      label: 'Tableau de Bord',
      icon: <BarChart3 size={20} />,
    },
    {
      id: 'students',
      label: 'Élèves',
      icon: <Users size={20} />,
    },
    {
      id: 'teachers',
      label: 'Enseignants',
      icon: <BookOpen size={20} />,
    },
    {
      id: 'classes',
      label: 'Classes',
      icon: <Users size={20} />,
    },
    {
      id: 'reports',
      label: 'Rapports de Notes',
      icon: <FileText size={20} />,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeaderComponent
        title="Espace Administrateur"
        subtitle="Contrôle central et gestion des comptes"
      />
      <div className="flex flex-1 relative">
        {/* Le layout n'a pas de sidebar ici, elle sera gérée au niveau de la page admin*/}
        <main className="w-full flex-1 md:ml-0">{children}</main>
      </div>
    </div>
  );
}
