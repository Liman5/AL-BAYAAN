'use client';

import { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, AlertCircle, Plus, Trash2, CheckCircle2, BookOpen } from 'lucide-react';
import { getAuthUserIdFromCookie } from '@/lib/authClient';
import { fetchStudentData } from '@/services/db.service';

const daysOrder = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

export default function StudentSchedulePage() {
  const [schedules, setSchedules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const [form, setForm] = useState({
    day_of_week: 'Lundi',
    start_time: '08:00',
    end_time: '09:00',
    subject: '',
    room_number: '',
  });
  const [data, setData] = useState<any>(null);

  // Charger l'emploi du temps de l'élève
  useEffect(() => {
    const uid = getAuthUserIdFromCookie();
    if (!uid) { setLoading(false); return; }
    (async () => {
      const dbData = await fetchStudentData(uid);
      setData(dbData);
      const res = await fetch(`/api/student/schedule?userId=${encodeURIComponent(uid)}`, { cache: 'no-store' });
      const result = await res.json();
      if (result.success) setSchedules(result.data || []);
      setLoading(false);
    })();
  }, []);

  const className = data?.className || '';

  // Grouper par jour
  const grouped: Record<string, any[]> = {};
  schedules.forEach((s: any) => {
    const day = s.day_of_week || 'Lundi';
    if (!grouped[day]) grouped[day] = [];
    grouped[day].push(s);
  });

  async function handleAdd() {
    setMsg(null);
    if (!form.day_of_week || !form.start_time || !form.end_time || !form.subject) {
      setMsg({ type: 'err', text: 'Veuillez remplir jour, horaires et matière.' });
      return;
    }
    const uid = getAuthUserIdFromCookie();
    if (!uid) {
      setMsg({ type: 'err', text: 'Session expirée.' });
      return;
    }
    try {
      const res = await fetch('/api/student/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: uid, ...form }),
      });
      const result = await res.json();
      if (result.success) {
        setMsg({ type: 'ok', text: '✅ Cours ajouté à votre emploi du temps !' });
        setShowForm(false);
        setForm({ day_of_week: 'Lundi', start_time: '08:00', end_time: '09:00', subject: '', room_number: '' });
        // Recharger
        const reload = await fetch(`/api/student/schedule?userId=${encodeURIComponent(uid)}`, { cache: 'no-store' });
        const reloadResult = await reload.json();
        if (reloadResult.success) setSchedules(reloadResult.data || []);
      } else {
        setMsg({ type: 'err', text: result.message || 'Erreur.' });
      }
    } catch (e: any) {
      setMsg({ type: 'err', text: e?.message || 'Erreur réseau.' });
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Supprimer ce cours ?')) return;
    const res = await fetch(`/api/student/schedule?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
    const result = await res.json();
    if (result.success) {
      setSchedules(schedules.filter((s: any) => s.id !== id));
      setMsg({ type: 'ok', text: 'Cours supprimé.' });
    } else {
      setMsg({ type: 'err', text: result.message || 'Erreur.' });
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Mon Emploi du temps</h1>
          <p className="mt-2 text-slate-600">
            {className ? `Classe ${className} —` : ''} Définissez votre propre emploi du temps
          </p>
        </div>
        <button
          onClick={() => { setShowForm(!showForm); setMsg(null); }}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-700 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-600/20 transition-all hover:shadow-xl hover:translate-y-[-1px]"
        >
          <Plus size={18} />
          Ajouter un cours
        </button>
      </div>

      {msg && (
        <div className={`mt-4 p-4 rounded-xl border flex items-center gap-3 text-sm ${
          msg.type === 'ok' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          {msg.type === 'ok' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          {msg.text}
        </div>
      )}

      {/* Formulaire d'ajout */}
      {showForm && (
        <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50/40 p-5">
          <h3 className="mb-4 font-bold text-slate-900">Ajouter un cours à votre emploi du temps</h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Jour</label>
              <select
                value={form.day_of_week}
                onChange={(e) => setForm({ ...form, day_of_week: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              >
                {daysOrder.map((d) => <option key={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Matière</label>
              <input
                type="text"
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                placeholder="Mathématiques"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Début</label>
              <input
                type="time"
                value={form.start_time}
                onChange={(e) => setForm({ ...form, start_time: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Fin</label>
              <input
                type="time"
                value={form.end_time}
                onChange={(e) => setForm({ ...form, end_time: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Salle (optionnel)</label>
              <input
                type="text"
                value={form.room_number}
                onChange={(e) => setForm({ ...form, room_number: e.target.value })}
                placeholder="301"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              />
            </div>
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <button
              onClick={() => setShowForm(false)}
              className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl text-sm font-medium"
            >
              Annuler
            </button>
            <button
              onClick={handleAdd}
              className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700"
            >
              Ajouter
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="mt-16 text-center text-slate-500">Chargement...</div>
      ) : schedules.length === 0 ? (
        <div className="mt-16 flex flex-col items-center rounded-3xl border border-slate-200 bg-white p-10 text-center">
          <AlertCircle size={40} className="mb-3 text-slate-300" />
          <p className="font-semibold text-slate-700">Votre emploi du temps est vide</p>
          <p className="mt-1 text-sm text-slate-500">Ajoutez vos cours avec le bouton « Ajouter un cours ».</p>
        </div>
      ) : (
        <div className="mt-8 space-y-6">
          {daysOrder.map((day) => {
            const daySchedules = grouped[day] || [];
            if (daySchedules.length === 0) return null;
            return (
              <div key={day} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h3 className="mb-4 font-bold text-slate-800">{day}</h3>
                <div className="space-y-3">
                  {daySchedules.map((s: any) => (
                    <div key={s.id} className="flex items-start justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50/50 p-3">
                      <div className="flex-1">
                        <p className="font-semibold text-slate-900 flex items-center gap-2">
                          <BookOpen size={14} className="text-emerald-600" />
                          {s.subject}
                        </p>
                        <div className="mt-1 flex flex-wrap gap-4 text-sm text-slate-500">
                          <span className="flex items-center gap-1.5">
                            <Clock size={12} />
                            {s.start_time} - {s.end_time}
                          </span>
                          {s.room_number && (
                            <span className="flex items-center gap-1.5">
                              <MapPin size={12} />
                              Salle {s.room_number}
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => handleDelete(s.id)}
                        className="rounded-lg bg-slate-100 p-2 text-slate-500 hover:bg-red-50 hover:text-red-600"
                        title="Supprimer"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}