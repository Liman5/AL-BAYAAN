'use client';

import { useState, useEffect } from 'react';
import { FileText, Calendar, Clock, AlertCircle, CheckCircle2, Upload, Send, Paperclip } from 'lucide-react';
import { getAuthUserIdFromCookie } from '@/lib/authClient';
import { fetchStudentData } from '@/services/db.service';

export default function StudentAssignmentsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  // État de soumission pour chaque devoir
  const [formState, setFormState] = useState<Record<string, { content: string; attachmentUrl: string }>>({});

  useEffect(() => {
    const uid = getAuthUserIdFromCookie();
    if (!uid) { setLoading(false); return; }
    (async () => {
      const dbData = await fetchStudentData(uid);
      setData(dbData);
      setLoading(false);
    })();
  }, []);

  const homeworks = data?.homeworks || [];
  const submissions = data?.submissions || [];

  // Trouver la soumission de l'élève pour un devoir
  const getSubmissionFor = (hwId: string) =>
    submissions.find((s: any) => s.homework_id === hwId);

  async function handleSubmit(hwId: string) {
    setMsg(null);
    const form = formState[hwId] || { content: '', attachmentUrl: '' };
    if (!form.content && !form.attachmentUrl) {
      setMsg({ type: 'err', text: 'Veuillez saisir une réponse ou joindre une photo.' });
      return;
    }
    setSubmitting(hwId);
    try {
      const uid = getAuthUserIdFromCookie();
      if (!uid) {
        setMsg({ type: 'err', text: 'Session expirée. Reconnectez-vous.' });
        setSubmitting(null);
        return;
      }
      const res = await fetch('/api/student/homework', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: uid,
          homeworkId: hwId,
          content: form.content || undefined,
          attachmentUrl: form.attachmentUrl || undefined,
        }),
      });
      const result = await res.json();
      if (result.success) {
        setMsg({ type: 'ok', text: '✅ Devoir envoyé à votre enseignant !' });
        // Recharger
        const dbData = await fetchStudentData(uid);
        if (dbData) setData(dbData);
      } else {
        setMsg({ type: 'err', text: result.message || 'Erreur lors de l\'envoi.' });
      }
    } catch (e: any) {
      setMsg({ type: 'err', text: e?.message || 'Erreur réseau.' });
    }
    setSubmitting(null);
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Mes Devoirs</h1>
      <p className="mt-2 text-slate-600">Devoirs de votre classe — répondez et envoyez à votre enseignant</p>

      {msg && (
        <div className={`mt-4 p-4 rounded-xl border flex items-center gap-3 text-sm ${
          msg.type === 'ok' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          {msg.type === 'ok' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          {msg.text}
        </div>
      )}

      {loading ? (
        <div className="mt-16 text-center text-slate-500">Chargement...</div>
      ) : homeworks.length === 0 ? (
        <div className="mt-16 flex flex-col items-center rounded-3xl border border-slate-200 bg-white p-10 text-center">
          <CheckCircle2 size={40} className="mb-3 text-slate-300" />
          <p className="font-semibold text-slate-700">Aucun devoir pour le moment</p>
          <p className="mt-1 text-sm text-slate-500">Les devoirs de vos enseignants apparaîtront ici.</p>
        </div>
      ) : (
        <div className="mt-8 space-y-5">
          {homeworks.map((hw: any) => {
            const sub = getSubmissionFor(hw.id);
            const form = formState[hw.id] || { content: '', attachmentUrl: '' };
            return (
              <div key={hw.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="font-bold text-slate-900">{hw.title}</h3>
                    {hw.description && <p className="mt-1 text-sm text-slate-600">{hw.description}</p>}
                    <div className="mt-2 flex flex-wrap gap-4 text-sm text-slate-500">
                      <span className="flex items-center gap-1.5">
                        <FileText size={14} className="text-slate-400" />
                        {hw.subject || 'Matière'}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Calendar size={14} className="text-slate-400" />
                        Échéance : {hw.due_date ? new Date(hw.due_date).toLocaleDateString('fr-FR') : 'Sans date'}
                      </span>
                    </div>
                  </div>
                  {sub ? (
                    <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                      <CheckCircle2 size={12} />
                      {sub.status === 'graded' ? `Noté : ${sub.grade}/20` : sub.status === 'returned' ? 'Retourné' : 'Envoyé ✓'}
                    </span>
                  ) : (
                    <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                      <Clock size={12} />
                      À rendre
                    </span>
                  )}
                </div>

                {/* Formulaire de réponse */}
                <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50/60 p-3">
                  <textarea
                    value={form.content}
                    onChange={(e) => setFormState((prev) => ({ ...prev, [hw.id]: { ...form, content: e.target.value } }))}
                    placeholder="Votre réponse..."
                    rows={2}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                  />
                  <div className="mt-2 flex items-center gap-2">
                    <input
                      type="text"
                      value={form.attachmentUrl}
                      onChange={(e) => setFormState((prev) => ({ ...prev, [hw.id]: { ...form, attachmentUrl: e.target.value } }))}
                      placeholder="URL de la photo (ou collez un lien)"
                      className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                    />
                    <button
                      onClick={() => handleSubmit(hw.id)}
                      disabled={submitting === hw.id || !!sub}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 disabled:opacity-50"
                    >
                      {submitting === hw.id ? <Upload size={16} className="animate-spin" /> : <Send size={16} />}
                      {sub ? 'Déjà envoyé' : 'Envoyer'}
                    </button>
                  </div>
                  {sub?.attachment_url && (
                    <p className="mt-2 flex items-center gap-1 text-xs text-slate-500">
                      <Paperclip size={12} />
                      Pièce jointe envoyée : {sub.attachment_url}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}