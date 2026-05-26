import Image from 'next/image';
import Link from 'next/link';

const logoUrl = 'https://www.image2url.com/r2/default/images/1779783874231-dae3f087-5437-4ef2-98c9-67a961155f8f.jpg';

export default function HomePage() {
  return (
    <main className="relative overflow-hidden bg-[#f4f7f3] px-6 py-8 text-slate-900 sm:px-10">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,_rgba(71,122,86,0.16),_transparent_32%),radial-gradient(circle_at_bottom_right,_rgba(211,160,58,0.14),_transparent_30%)]" />
      <div className="mx-auto flex max-w-7xl flex-col gap-10">
        <header className="flex flex-col items-start justify-between gap-6 rounded-[2rem] border border-white/70 bg-white/80 p-6 shadow-2xl shadow-slate-900/5 backdrop-blur-xl sm:flex-row sm:items-center">
          <div className="flex items-center gap-4">
            <div className="relative h-16 w-16 overflow-hidden rounded-3xl border border-white/80 bg-white shadow-lg shadow-slate-900/10">
              <Image src={logoUrl} alt="AL-BAYAAN logo" fill className="object-cover" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-emerald-900/90">Institut AL-BAYAAN</p>
              <p className="text-sm text-slate-600">Islamic Basic School | المدرسة البيان الإسلامية</p>
            </div>
          </div>

          <nav className="flex flex-wrap items-center gap-3">
            <Link href="/auth/login" className="rounded-full border border-emerald-900/20 bg-white px-5 py-2 text-sm font-semibold text-emerald-900 transition hover:bg-emerald-50">
              Connexion
            </Link>
            <Link href="/auth/register" className="rounded-full bg-emerald-900 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-emerald-900/10 transition hover:bg-emerald-800">
              Inscription
            </Link>
          </nav>
        </header>

        <section className="relative overflow-hidden rounded-[2.25rem] border border-white/70 bg-white/80 p-10 shadow-2xl shadow-slate-900/10 backdrop-blur-xl">
          <div className="pointer-events-none absolute -left-16 top-10 h-52 w-52 rounded-full bg-emerald-200/60 blur-3xl" />
          <div className="pointer-events-none absolute -right-24 bottom-6 h-72 w-72 rounded-full bg-amber-200/40 blur-3xl" />

          <div className="grid gap-10 lg:grid-cols-[1.3fr_0.9fr] lg:items-center">
            <div className="space-y-6">
              <p className="text-sm font-semibold uppercase tracking-[0.35em] text-emerald-900/80">Présentation</p>
              <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
                AL-BAYAAN Institute — مدرسة البيان الإسلامية
              </h1>
              <p className="max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
                Une école islamique bilingue consacrée à l'excellence académique, aux valeurs éthiques et à l'éducation complète. <span className="font-semibold text-emerald-900">Bienvenue dans un environnement moderne, chaleureux et professionnel.</span>
              </p>
              <p className="max-w-2xl text-base leading-8 text-slate-600">
                التسجيل محليًا متاح الآن. أنشئ حسابًا كأستاذ أو ولي أمر للبدء في بوابة AL-BAYAAN الخاصة بك.
              </p>

              <div className="flex flex-wrap gap-4">
                <Link href="/auth/register" className="inline-flex rounded-full bg-emerald-900 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-900/10 transition hover:bg-emerald-800">
                  S'inscrire
                </Link>
                <Link href="/auth/login" className="inline-flex rounded-full border border-emerald-900/20 bg-white px-6 py-3 text-sm font-semibold text-emerald-900 transition hover:bg-emerald-50">
                  Se connecter
                </Link>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
              <div className="glass-card rounded-[1.75rem] border border-white/70 bg-white/70 p-5 shadow-xl shadow-slate-900/5 backdrop-blur-xl">
                <div className="mb-4 h-44 overflow-hidden rounded-3xl bg-slate-100">
                  <Image
                    src="https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=800&q=80"
                    alt="Classe d'école"
                    width={600}
                    height={400}
                    className="h-full w-full object-cover"
                  />
                </div>
                <h3 className="text-lg font-semibold text-slate-900">Un cadre moderne et respectueux</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">Des espaces pédagogiques bien aménagés avec une approche islamique et bilingue.</p>
              </div>
              <div className="glass-card rounded-[1.75rem] border border-white/70 bg-white/70 p-5 shadow-xl shadow-slate-900/5 backdrop-blur-xl">
                <div className="mb-4 h-44 overflow-hidden rounded-3xl bg-slate-100">
                  <Image
                    src="https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=800&q=80"
                    alt="Éducation et communauté"
                    width={600}
                    height={400}
                    className="h-full w-full object-cover"
                  />
                </div>
                <h3 className="text-lg font-semibold text-slate-900">Engagement pour la réussite</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">Un accompagnement personnalisé pour chaque élève, parent et enseignant.</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
