import { ReactNode } from 'react';

export default function TeacherLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.14),_transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(168,85,247,0.08),_transparent_35%),#f8fafc]">
        {children}
      </main>
    </div>
  );
}
