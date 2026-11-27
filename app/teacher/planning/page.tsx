'use client';

import { useState, useEffect } from 'react';
import Card from '@/components/ui/card';
import AppShell from '@/components/ui/app-shell';
import { ClassSelector } from '@/components/teacher/class-selector';
import AcademicYearSelector from '@/components/ui/academic-year-selector';
import { Home, Users, FileText, BarChart3, Calendar, Plus, Clock, MapPin, PenSquare, Trash2, ChevronLeft, ChevronRight, BookOpen } from 'lucide-react';
import { getAuthUserIdFromCookie } from '@/lib/authClient';
import { fetchTeacherSchedules, fetchTeacherClasses, saveTeacherSchedule } from '@/services/db.service';
import { getTeacherRoleLabel } from '@/lib/teacher';

const navItems = [
  { label: 'Accueil', href: '/teacher/dashboard', icon: <Home size={20} /> },
  { label: 'Élèves', href: '/teacher/students', icon: <Users size={20} /> },
  { label: 'Exercices', href: '/teacher/exercises', icon: <FileText size={20} /> },
  { label: 'Notes', href: '/teacher/grades', icon: <BarChart3 size={20} /> },
  { label: 'Plan', href: '/teacher/planning', icon: <Calendar size={20} /> }
];

const daysOrder = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

const dayColors: Record<string, { badge: string; dot: string; bg: string }> = {
  Lundi: { badge: 'bg-blue-50 text-blue-700', dot: 'bg-blue-500', bg: 'from-blue-50 to-white' },
  Mardi: { badge: 'bg-amber-50 text-amber-700', dot: 'bg-amber-500', bg: 'from-amber-50 to-white' },
  Mercredi: { badge: 'bg-emerald-50 text-emerald-700', dot: 'bg-emerald-500', bg: 'from-emerald-50 to-white' },
  Jeudi: { badge: 'bg-purple-50 text-purple-700', dot: 'bg-purple-500', bg: 'from-purple-50 to-white' },
  Vendredi: { badge: 'bg-rose-50 text-rose-700', dot: 'bg-rose-500', bg: 'from-rose-50 to-white' },
  Samedi: { badge: 'bg-teal-50 text-teal-700', dot: 'bg-teal-500', bg: 'from-teal-50 to-white' },
};

export default function PlanningPage() {
  const [dbSchedules, setDbSchedules] = useState<any[]>([]);
  const [dbClasses, setDbClasses] = useState<any[]>([]);
  const [dbTeacher, setDbTeacher] = useState<any>(null);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [loading, setLoading] = useState(true);
  // Formulaire d'ajout cours
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    day_of_week: 'Lundi',
    start_time: '08:00',
    end_time: '09:00',
    room_number: '',
    class_id: '',
    subject: '',
  });
  const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const teacherRoleLabel = getTeacherRoleLabel(dbTeacher?.gender);

  useEffect(() => {
    async function loadFromDb() {
      const uid = getAuthUserIdFromCookie();
      if (!uid) {
        setLoading(false);
        return;
      }
      try {
        const result = await fetchTeacherClasses(null, uid);
        if (result.teacher) {
          setDbTeacher(result.teacher);
          setDbClasses(result.classes || []);
          const schedules = await fetchTeacherSchedules(result.teacher.id);
          setDbSchedules(schedules || []);
        }
      } catch (e) {
        console.error('Erreur chargement planning:', e);
      } finally {
        setLoading(false);
      }
    }
    loadFromDb();
  }, []);

  const teacherName = dbTeacher?.users
    ? `${dbTeacher.users.first_name || ''} ${dbTeacher.users.last_name || ''}`.trim()
    : '';

  // Filtrer par classe
  const filteredSchedules = selectedClassId
    ? dbSchedules.filter((s: any) => s.class_id === selectedClassId)
    : dbSchedules;

  // Grouper par jour
  const groupedByDay: { [key: string]: any[] } = {};
  filteredSchedules.forEach((s: any) => {
    const day = s.day_of_week || 'Lundi';
    if (!groupedByDay[day]) groupedByDay[day] = [];
    groupedByDay[day].push(s);
  });

  // Soumettre un nouveau cours
  async function handleSubmit() {
    setMsg(null);
    if (!formData.day_of_week || !formData.start_time || !formData.end_time || !formData.class_id || !formData.subject) {
      setMsg({ type: 'err', text: 'Veuillez remplir tous les champs obligatoires.' });
      return;
    }
    setSaving(true);
    try {
      const result = await saveTeacherSchedule({
        day_of_week: formData.day_of_week,
        start_time: formData.start_time,
        end_time: formData.end_time,
        room_number: formData.room_number || undefined,
        class_id: formData.class_id,
        teacher_id: dbTeacher?.id || '',
        subject: formData.subject,
      });
      if (result.success) {
        setMsg({ type: 'ok', text: '✅ Cours ajouté au planning !' });
        setShowForm(false);
        setFormData({ day_of_week: 'Lundi', start_time: '08:00', end_time: '09:00', room_number: '', class_id: '', subject: '' });
        // Recharger
        if (dbTeacher?.id) {
          const schedules = await fetchTeacherSchedules(dbTeacher.id);
          setDbSchedules(schedules || []);
        }
      } else {
        setMsg({ type: 'err', text: result.error || 'Erreur lors de l\'ajout.' });
      }
    } catch (e: any) {
      setMsg({ type: 'err', text: e?.message || 'Erreur réseau.' });
    }
    setSaving(false);
  }

  return (
    <AppShell
      navItems={navItems}
      title="Espace Enseignant"
      subtitle="AL-BAYAAN"
      userName={teacherName || 'Enseignant'}
      userRole={teacherRoleLabel}
      notifications={[]}
      headerTitle="Mon Planning"
      variant="topbar"
    >
      <div className="space-y-8">
        {/* Message */}
        {msg && (
          <div className={`p-4 rounded-xl border flex items-center gap-3 text-sm ${
            msg.type === 'ok' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'
          }`}>
            {msg.text}
          </div>
        )}

        {/* Formulaire ajout cours */}
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setShowForm(false)}>
            <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-xl font-bold text-slate-900 mb-4">Ajouter un cours au planning</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Jour</label>
                    <select
                      value={formData.day_of_week}
                      onChange={(e) => setFormData({ ...formData, day_of_week: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                    >
                      {daysOrder.map((d) => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Classe</label>
                    <select
                      value={formData.class_id}
                      onChange={(e) => setFormData({ ...formData, class_id: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                    >
                      <option value="">Sélectionner...</option>
                      {dbClasses.map((c: any) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Début</label>
                    <input
                      type="time"
                      value={formData.start_time}
                      onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Fin</label>
                    <input
                      type="time"
                      value={formData.end_time}
                      onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Salle</label>
                    <input
                      type="text"
                      value={formData.room_number}
                      onChange={(e) => setFormData({ ...formData, room_number: e.target.value })}
                      placeholder="301"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Matière</label>
                  <input
                    type="text"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="Mathématiques"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    onClick={() => setShowForm(false)}
                    className="px-5 py-2.5 border border-slate-300 text-slate-700 rounded-xl text-sm font-medium hover:bg-slate-50"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={saving}
                    className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 disabled:opacity-50"
                  >
                    {saving ? 'Enregistrement...' : 'Ajouter le cours'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Mon Planning</h2>
            <p className="mt-2 text-slate-600">
              {dbSchedules.length > 0
                ? `${dbSchedules.length} cours planifiés`
                : loading ? 'Chargement...' : 'Aucun cours planifié'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {dbClasses.length > 1 && (
              <ClassSelector
                classes={dbClasses.map((c: any) => ({ id: c.id, name: c.name }))}
                selectedClassId={selectedClassId}
                onSelectClass={setSelectedClassId}
                label="Filtrer"
              />
            )}
            <button
              onClick={() => { setShowForm(true); setMsg(null); }}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-700 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-600/20 transition-all hover:shadow-xl hover:shadow-emerald-600/30 hover:-translate-y-0.5"
            >
              <Plus size={18} />
              Ajouter un cours
            </button>
            <AcademicYearSelector compact />
          </div>
        </div>

        {/* Semaine */}
        <Card className="flex items-center justify-between border-slate-200 py-4 shadow-sm">
          <button className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50">
            <ChevronLeft size={16} />
            Semaine précédente
          </button>
          <div className="text-center">
            <p className="font-semibold text-slate-900">Cette semaine</p>
            <p className="text-xs text-slate-500">{filteredSchedules.length} cours planifiés</p>
          </div>
          <button className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50">
            Semaine suivante
            <ChevronRight size={16} />
          </button>
        </Card>

        {/* Schedule by day */}
        {loading ? (
          <div className="text-center py-16 text-slate-500">Chargement du planning...</div>
        ) : filteredSchedules.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-100">
              <Calendar size={32} className="text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900">Aucun cours planifié</h3>
            <p className="mt-1 text-sm text-slate-500">
              {selectedClassId
                ? 'Cette classe n\'a pas encore de cours planifiés.'
                : 'Vos cours planifiés apparaîtront ici.'}
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {daysOrder.map(day => {
              const daySessions = groupedByDay[day] || [];
              if (daySessions.length === 0) return null;
              const colors = dayColors[day] || dayColors.Lundi;

              return (
                <div key={day}>
                  <div className="mb-4 flex items-center gap-3">
                    <span className={`inline-flex items-center gap-2 rounded-full ${colors.badge} px-4 py-1.5 text-sm font-bold`}>
                      <span className={`h-2 w-2 rounded-full ${colors.dot}`} />
                      {day}
                    </span>
                    <span className="text-sm text-slate-500">{daySessions.length} cours</span>
                  </div>

                  <div className="space-y-3">
                    {daySessions.map((session: any) => (
                      <Card
                        key={session.id}
                        className={`border-l-4 border-l-emerald-500 border-slate-200 transition-all hover:shadow-md p-5`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3">
                              <h4 className="font-bold text-slate-900">{session.subject || 'Cours'}</h4>
                              <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                                {session.classes?.name || 'Classe'}
                              </span>
                            </div>
                            <div className="mt-3 flex flex-wrap gap-4 text-sm text-slate-500">
                              <span className="flex items-center gap-1.5">
                                <Clock size={14} className="text-slate-400" />
                                {session.start_time || '--:--'} - {session.end_time || '--:--'}
                              </span>
                              {session.room_number && (
                                <span className="flex items-center gap-1.5">
                                  <MapPin size={14} className="text-slate-400" />
                                  Salle {session.room_number}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-1.5">
                            <button className="rounded-lg bg-slate-100 p-2 text-slate-600 transition-colors hover:bg-slate-200" title="Modifier">
                              <PenSquare size={16} />
                            </button>
                            <button className="rounded-lg bg-slate-100 p-2 text-slate-600 transition-colors hover:bg-red-50 hover:text-red-600" title="Supprimer">
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AppShell>
  );
}