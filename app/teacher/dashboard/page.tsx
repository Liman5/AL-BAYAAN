'use client';

import { useMemo, useState } from 'react';

const classes = [
  { id: 'chem-1', name: '3ème A', subject: 'Mathématiques', students: 28, attendance: '95%' },
  { id: 'chem-2', name: '2nde B', subject: 'Physique', students: 24, attendance: '93%' },
  { id: 'chem-3', name: '1ère C', subject: 'Chimie', students: 22, attendance: '97%' },
];

const modules = [
  'Classes',
  'Students',
  'Grades',
  'Attendance',
  'Homework',
  'Exams',
  'Documents',
  'Reports',
];

const stats = {
  students: 74,
  classes: 3,
  average: '14.8',
  attendance: '94%',
};

const students = [
  { name: 'Sara Ben Ali', class: '3ème A', average: 15.2, status: 'Active' },
  { name: 'Youssef Haddad', class: '2nde B', average: 13.9, status: 'Active' },
  { name: 'Lina Mansour', class: '1ère C', average: 16.3, status: 'Active' },
  { name: 'Adam Khelil', class: '3ème A', average: 12.7, status: 'Active' },
];

const homework = [
  { title: 'Exercices algèbre', due: 'Demain', status: 'Open', klass: '3ème A' },
  { title: 'TP Chimie organique', due: '28 mai', status: 'Draft', klass: '1ère C' },
  { title: 'Révision physique', due: '30 mai', status: 'Published', klass: '2nde B' },
];

const exams = [
  { title: 'Contrôle maths', date: '03 juin', klass: '3ème A' },
  { title: 'Bilan chimie', date: '10 juin', klass: '1ère C' },
];

const documents = [
  { name: 'Plan de cours semaine 22', type: 'PDF', updated: 'Aujourd’hui' },
  { name: 'Barème contrôle', type: 'PDF', updated: 'Hier' },
];

function IconBell() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 text-slate-200" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 8-3 8h18s-3-1-3-8" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}

function IconDropdown() {
  return (
    <svg viewBox="0 0 20 20" className="h-4 w-4 text-slate-300" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 8l4 4 4-4" />
    </svg>
  );
}

export default function TeacherDashboardPage() {
  const [selectedClassId, setSelectedClassId] = useState('chem-1');
  const [activeModule, setActiveModule] = useState('Classes');

  const activeClass = useMemo(() => classes.find((item) => item.id === selectedClassId) ?? classes[0], [selectedClassId]);

  const sectionContent = useMemo(() => {
    switch (activeModule) {
      case 'Students':
        return (
          <div className="space-y-4">
            <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
              <div className="rounded-3xl bg-white/90 p-6 backdrop-blur-xl border border-slate-200/80 shadow-lg">
                <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Classe active</p>
                <h3 className="mt-3 text-2xl font-semibold text-slate-950">{activeClass.name}</h3>
                <p className="mt-2 text-slate-600">{activeClass.subject}</p>
              </div>
              <div className="rounded-3xl bg-white/90 p-6 backdrop-blur-xl border border-slate-200/80 shadow-lg">
                <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Élèves</p>
                <p className="mt-3 text-4xl font-semibold text-slate-950">{activeClass.students}</p>
                <p className="mt-2 text-slate-600">Taux de présence {activeClass.attendance}</p>
              </div>
            </div>
            <div className="overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white/90 shadow-lg backdrop-blur-xl">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-100 text-left text-xs uppercase tracking-[0.24em] text-slate-500">
                  <tr>
                    <th className="px-4 py-4">Élève</th>
                    <th className="px-4 py-4">Classe</th>
                    <th className="px-4 py-4">Moyenne</th>
                    <th className="px-4 py-4">Statut</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-sm text-slate-700">
                  {students.map((student) => (
                    <tr key={student.name} className="hover:bg-slate-50 transition-colors duration-200">
                      <td className="px-4 py-4">{student.name}</td>
                      <td className="px-4 py-4">{student.class}</td>
                      <td className="px-4 py-4">{student.average}</td>
                      <td className="px-4 py-4">{student.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      case 'Grades':
        return (
          <div className="space-y-6">
            <div className="grid gap-4 grid-cols-1 xl:grid-cols-3">
              {['Devoir 1', 'Devoir 2', 'Interro'].map((item) => (
                <div key={item} className="rounded-3xl bg-white/90 p-6 backdrop-blur-xl border border-slate-200/80 shadow-lg">
                  <p className="text-sm uppercase tracking-[0.3em] text-slate-500">{item}</p>
                  <p className="mt-4 text-3xl font-semibold text-slate-950">{(12 + Math.random() * 6).toFixed(1)}</p>
                  <p className="mt-2 text-slate-600">Moyenne de la classe</p>
                </div>
              ))}
            </div>
            <div className="rounded-[2rem] border border-slate-200/80 bg-white/90 p-6 shadow-lg backdrop-blur-xl">
              <h3 className="text-lg font-semibold text-slate-950">Aperçu des notes</h3>
              <p className="mt-3 text-slate-600">Modifier les notes et visualiser les tendances rapidement.</p>
            </div>
          </div>
        );
      case 'Attendance':
        return (
          <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
            {['Présence', 'Retards', 'Absences'].map((item, index) => (
              <div key={item} className="rounded-3xl bg-white/90 p-6 backdrop-blur-xl border border-slate-200/80 shadow-lg">
                <p className="text-sm uppercase tracking-[0.3em] text-slate-500">{item}</p>
                <p className="mt-4 text-4xl font-semibold text-slate-950">{index === 0 ? '94%' : index === 1 ? '3%' : '4%'}</p>
                <p className="mt-2 text-slate-600">Dernière semaine</p>
              </div>
            ))}
          </div>
        );
      case 'Classes':
        return (
          <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
            {classes.map((item) => (
              <div key={item.id} className="rounded-3xl border border-slate-200/80 bg-white/90 p-6 shadow-lg backdrop-blur-xl transition hover:-translate-y-1">
                <p className="text-sm uppercase tracking-[0.3em] text-slate-500">{item.subject}</p>
                <h3 className="mt-3 text-2xl font-semibold text-slate-950">{item.name}</h3>
                <p className="mt-3 text-slate-600">{item.students} élèves</p>
                <p className="mt-2 text-slate-600">Présence moyenne {item.attendance}</p>
              </div>
            ))}
          </div>
        );
      case 'Homework':
        return (
          <div className="space-y-4">
            {homework.map((item) => (
              <div key={item.title} className="rounded-3xl border border-slate-200/80 bg-white/90 p-5 shadow-lg backdrop-blur-xl transition hover:-translate-y-1 hover:border-slate-300/30">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h4 className="text-lg font-semibold text-slate-950">{item.title}</h4>
                    <p className="mt-2 text-slate-600">Classe {item.klass}</p>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-slate-600">
                    <span className="rounded-full border border-slate-200/80 bg-slate-50 px-3 py-1">{item.status}</span>
                    <span>{item.due}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        );
      case 'Exams':
        return (
          <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
            {exams.map((exam) => (
              <div key={exam.title} className="rounded-3xl border border-slate-200/80 bg-white/90 p-6 shadow-lg backdrop-blur-xl">
                <p className="text-sm uppercase tracking-[0.3em] text-slate-500">{exam.title}</p>
                <p className="mt-3 text-2xl font-semibold text-slate-950">{exam.date}</p>
                <p className="mt-2 text-slate-600">Classe {exam.klass}</p>
              </div>
            ))}
          </div>
        );
      case 'Documents':
        return (
          <div className="grid gap-4 sm:grid-cols-2">
            {documents.map((doc) => (
              <div key={doc.name} className="rounded-3xl border border-slate-200/80 bg-white/90 p-6 shadow-lg backdrop-blur-xl">
                <p className="text-sm uppercase tracking-[0.3em] text-slate-500">{doc.type}</p>
                <h4 className="mt-3 text-lg font-semibold text-slate-950">{doc.name}</h4>
                <p className="mt-2 text-slate-600">Mis à jour {doc.updated}</p>
              </div>
            ))}
          </div>
        );
      case 'Reports':
        return (
          <div className="grid gap-5 grid-cols-1 lg:grid-cols-2">
            <div className="rounded-3xl border border-slate-200/80 bg-white/90 p-6 shadow-lg backdrop-blur-xl">
              <h4 className="text-lg font-semibold text-slate-950">Rapport de la classe</h4>
              <p className="mt-3 text-slate-600">Exportez les résultats, générez des bilans trimestriels et partagez-les avec les parents.</p>
            </div>
            <div className="rounded-3xl border border-slate-200/80 bg-white/90 p-6 shadow-lg backdrop-blur-xl">
              <h4 className="text-lg font-semibold text-slate-950">Performance générale</h4>
              <p className="mt-3 text-slate-600">Synthèse rapide des tendances et du comportement de la classe.</p>
            </div>
          </div>
        );
      default:
        return (
          <div className="rounded-3xl border border-slate-200/80 bg-white/90 p-6 shadow-lg backdrop-blur-xl">
            <p className="text-slate-700">Sélectionnez un module pour afficher son contenu.</p>
          </div>
        );
    }
  }, [activeModule, activeClass]);

  return (
    <div className="min-h-screen">
      <div className="fixed inset-x-0 top-0 z-40 border-b border-slate-200/70 bg-white/80 backdrop-blur-xl shadow-sm">
        <div className="mx-auto flex flex-col gap-3 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
              <div className="rounded-3xl border border-slate-200/70 bg-white/80 px-4 py-3 shadow-sm backdrop-blur-xl">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">École</p>
                <p className="mt-1 font-semibold text-slate-900">AL-BAYAAN</p>
              </div>
              <div className="rounded-3xl border border-slate-200/70 bg-white/80 px-4 py-3 shadow-sm backdrop-blur-xl">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Enseignant</p>
                <p className="mt-1 text-base font-semibold text-slate-900">Mme Hana</p>
              </div>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-3">
              <div className="flex flex-col gap-2 rounded-3xl border border-slate-200/70 bg-white/90 px-4 py-3 shadow-sm backdrop-blur-xl sm:flex-row sm:items-center">
                <span className="text-sm text-slate-500">Classe active</span>
                <div className="min-w-[11rem]">
                  <select value={selectedClassId} onChange={(event) => setSelectedClassId(event.target.value)} className="w-full bg-transparent text-sm text-slate-900 outline-none">
                    {classes.map((item) => (
                      <option key={item.id} value={item.id} className="bg-white text-slate-900">{item.name} — {item.subject}</option>
                    ))}
                  </select>
                </div>
                <IconDropdown />
              </div>
              <div className="flex items-center gap-3">
                <button className="rounded-3xl border border-slate-200/70 bg-white/90 px-4 py-3 text-slate-700 transition hover:bg-slate-50">
                  <IconBell />
                </button>
                <div className="rounded-3xl border border-slate-200/70 bg-white/90 px-4 py-3 shadow-sm backdrop-blur-xl">
                  <p className="text-sm text-slate-500">Profil</p>
                  <p className="text-sm font-semibold text-slate-900">H. Mansour</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 pb-16 pt-32 sm:px-6 lg:px-8">
        <div className="space-y-8">
          <section className="rounded-[2rem] border border-slate-200/80 bg-white/80 p-6 shadow-2xl shadow-slate-200/40 backdrop-blur-xl">
            <div className="grid gap-6 grid-cols-1 lg:grid-cols-[1.8fr_1fr] lg:items-end">
              <div className="space-y-4">
                <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Bonjour, professeur</p>
                <h1 className="text-4xl font-semibold text-slate-950">Tableau de bord enseignant</h1>
                <p className="max-w-2xl text-slate-600">Accédez rapidement aux classes, élèves et activités pédagogiques. Tout est organisé pour un flux de travail clair et rapide.</p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-3xl border border-slate-200/80 bg-white/90 p-5 shadow-lg backdrop-blur-xl">
                  <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Élèves</p>
                  <p className="mt-4 text-3xl font-semibold text-slate-950">{stats.students}</p>
                </div>
                <div className="rounded-3xl border border-slate-200/80 bg-white/90 p-5 shadow-lg backdrop-blur-xl">
                  <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Classes</p>
                  <p className="mt-4 text-3xl font-semibold text-slate-950">{stats.classes}</p>
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-[2rem] border border-slate-200/80 bg-white/80 p-6 shadow-2xl shadow-slate-200/40 backdrop-blur-xl">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {[
                { label: 'Moyenne', value: stats.average },
                { label: 'Présence', value: stats.attendance },
                { label: 'Actions', value: '12 tâches' },
                { label: 'Messages', value: '5 nouveaux' },
              ].map((item) => (
                <div key={item.label} className="rounded-3xl border border-slate-200/80 bg-white/90 p-5 shadow-lg backdrop-blur-xl">
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-500">{item.label}</p>
                  <p className="mt-4 text-3xl font-semibold text-slate-950">{item.value}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white/80 shadow-2xl shadow-slate-200/40 backdrop-blur-xl">
            <div className="overflow-x-auto border-b border-slate-200/80 bg-slate-50/80 px-4 py-3">
              <div className="flex min-w-full flex-wrap gap-3 text-sm font-medium text-slate-600 md:min-w-[720px]">
                {modules.map((module) => (
                  <button
                    key={module}
                    type="button"
                    onClick={() => setActiveModule(module)}
                    className={`whitespace-nowrap rounded-3xl px-4 py-2 transition ${activeModule === module ? 'bg-slate-900/10 text-slate-950 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
                  >
                    {module}
                  </button>
                ))}
              </div>
            </div>
            <div className="p-6">{sectionContent}</div>
          </section>
        </div>
      </div>
    </div>
  );
}
