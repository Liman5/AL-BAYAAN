'use client';

import { useEffect, useState } from 'react';
import { getAuthUserIdFromCookie } from '@/lib/authClient';
import { fetchParentData } from '@/services/db.service';
import AppShell from '@/components/ui/app-shell';
import { LayoutDashboard, Users, BookOpen, TrendingUp, MessageSquare, Bell, AlertCircle, GraduationCap, Calendar, Clock } from 'lucide-react';

const navItems = [
  { label: 'Tableau de bord', href: '/parent/dashboard', icon: <LayoutDashboard size={20} /> },
  { label: 'Mes enfants', href: '/parent/children', icon: <Users size={20} /> },
  { label: 'Notes', href: '/parent/grades', icon: <TrendingUp size={20} /> },
  { label: 'Messages', href: '/parent/messages', icon: <MessageSquare size={20} /> },
];

export default function ParentDashboardPage() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const userId = getAuthUserIdFromCookie();
    if (!userId) return;
    const currentUserId = userId as string;

    async function load() {
      const dbData = await fetchParentData(currentUserId);
      if (dbData) {
        setData(dbData);
      }
    }
    load();
  }, []);

  if (!data) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-emerald-200 border-t-emerald-600" />
          <p className="text-sm text-slate-500">Chargement des données du parent...</p>
        </div>
      </div>
    );
  }

  const parent = data.parent;
  const parentName = parent.full_name || 'Parent';

  return (
    <AppShell
      navItems={navItems}
      title="Espace Parent"
      subtitle="AL-BAYAAN"
      userName={parentName}
      userRole="Parent"
      headerTitle="Tableau de bord"
    >
      <div className="space-y-8">
        {/* Welcome */}
        <div className="relative overflow-hidden rounded-3xl border border-amber-900/10 bg-gradient-to-br from-amber-500 via-amber-600 to-orange-600 p-8 text-white shadow-xl shadow-amber-900/20">
          <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-white/20 blur-2xl" />
          <div className="absolute -bottom-16 -left-8 h-56 w-56 rounded-full bg-orange-300/20 blur-2xl" />
          <div className="relative">
            <h2 className="text-2xl font-bold sm:text-3xl">
              Bienvenue, {parentName} 👋
            </h2>
            <p className="mt-3 max-w-lg text-amber-100">
              Suivez la scolarité de vos enfants et consultez leurs performances.
            </p>
          </div>
        </div>

        {/* Children overview */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-lg font-bold text-slate-900">
              <Users size={20} className="text-amber-600" />
              Enfants suivis
            </h3>
            <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
              {data.children.length} {data.children.length > 1 ? 'enfants' : 'enfant'}
            </span>
          </div>

          {/* Formulaire ajouter un enfant (toujours visible) */}
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              const matricule = (e.currentTarget.elements.namedItem('matricule') as HTMLInputElement).value.trim();
              if (!matricule) return;
              const res = await fetch('/api/parent/link-child', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ parentId: parent.id, matricule }),
              });
              const result = await res.json();
              if (result.success) {
                alert(result.message || 'Enfant associé avec succès !');
                window.location.reload();
              } else {
                alert(result.message || "Erreur lors de l'association.");
              }
            }}
            className="mb-6 flex w-full max-w-md items-center gap-2"
          >
            <input
              name="matricule"
              type="text"
              placeholder="Associer un enfant — matricule (ex: ALB-2026-0001)"
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
            />
            <button
              type="submit"
              className="shrink-0 rounded-xl bg-gradient-to-r from-amber-600 to-orange-500 px-4 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:shadow-lg"
            >
              Associer
            </button>
          </form>

          {data.children.length ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {data.children.map((child: any) => (
                <div
                  key={child.id}
                  className="flex items-start gap-4 rounded-2xl border border-slate-100 bg-slate-50/50 p-5 transition-all hover:border-amber-200 hover:bg-white hover:shadow-md"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-white">
                    <GraduationCap size={22} />
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-slate-900">{child.first_name} {child.last_name}</p>
                    <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-600">
                      <BookOpen size={14} className="text-slate-400" />
                      Classe : {child.assigned_class || 'Non affectée'}
                    </p>
                    <span className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      Actif
                    </span>
                    {child.lastScan && (
                      <p className="mt-2 flex flex-wrap items-center gap-1.5 text-xs font-medium text-slate-600">
                        <Clock size={12} className="text-emerald-600" />
                        Dernier pointage :{' '}
                        {new Date(child.lastScan.scanned_at).toLocaleDateString('fr-FR')} à{' '}
                        {new Date(child.lastScan.scanned_at).toLocaleTimeString('fr-FR', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                        <span
                          className={
                            child.lastScan.status === 'late'
                              ? 'font-bold text-amber-700'
                              : 'font-bold text-emerald-700'
                          }
                        >
                          {child.lastScan.status === 'late' ? 'En retard' : 'Présent'}
                        </span>
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 py-12 text-center">
              <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
                <AlertCircle size={24} className="text-slate-400" />
              </div>
              <p className="font-medium text-slate-700">Aucun enfant enregistré pour le moment</p>
              <p className="mt-1 text-sm text-slate-500">
                Saisissez le matricule de votre enfant ci-dessus pour le suivre.
              </p>
            </div>
          )}
        </div>

        {/* Parent announcements */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-lg font-bold text-slate-900">
              <Bell size={20} className="text-amber-600" />
              Annonces parents
            </h3>
            <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
              {data.announcements.length} annonces
            </span>
          </div>

          {data.announcements.length ? (
            <div className="grid gap-4">
              {data.announcements.map((item: any) => (
                <div
                  key={item.id}
                  className="flex items-start gap-4 rounded-2xl border border-slate-100 bg-slate-50/50 p-5 transition-all hover:border-amber-200 hover:bg-white hover:shadow-sm"
                >
                  <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 text-white">
                    <Bell size={18} />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-900">{item.title}</p>
                    <p className="mt-1 text-sm leading-6 text-slate-600">{item.message}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 py-12 text-center">
              <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
                <Calendar size={24} className="text-slate-400" />
              </div>
              <p className="font-medium text-slate-700">Aucune annonce pour le moment</p>
              <p className="mt-1 text-sm text-slate-500">
                Les annonces de l'école apparaîtront ici.
              </p>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}