import { ReactNode } from 'react';

interface SidebarProps {
  children: ReactNode;
}

export default function Sidebar({ children }: SidebarProps) {
  return (
    <aside className="hidden min-h-screen w-72 border-r border-slate-200 bg-white px-5 py-8 lg:block">
      {children}
    </aside>
  );
}
