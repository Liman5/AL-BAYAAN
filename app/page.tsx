import Image from 'next/image';
import Link from 'next/link';

const logoUrl = 'https://www.image2url.com/r2/default/images/1779783874231-dae3f087-5437-4ef2-98c9-67a961155f8f.jpg';

export default function HomePage() {
  return (
    <main className="relative overflow-hidden bg-gradient-to-b from-[#f4f7f3] via-white to-[#f4f7f3] px-6 py-8 text-slate-900 sm:px-10">
      {/* Background Gradients */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,_rgba(71,122,86,0.16),_transparent_32%),radial-gradient(circle_at_bottom_right,_rgba(211,160,58,0.14),_transparent_30%)]" />
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-200/20 rounded-full blur-3xl -z-10 animate-pulse" />
      <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-amber-200/20 rounded-full blur-3xl -z-10 animate-pulse" />

      <div className="mx-auto flex max-w-7xl flex-col gap-12">
        {/* Header */}
        <header className="flex flex-col items-start justify-between gap-6 rounded-[2rem] border border-white/70 bg-white/80 p-6 shadow-2xl shadow-slate-900/5 backdrop-blur-xl hover:shadow-emerald-900/10 transition-all duration-500 sm:flex-row sm:items-center animate-fade-in">
          <div className="flex items-center gap-4">
            <div className="relative h-16 w-16 overflow-hidden rounded-3xl border border-white/80 bg-white shadow-lg shadow-slate-900/10 hover:scale-110 transition-transform duration-300">
              <Image src={logoUrl} alt="AL-BAYAAN logo" fill className="object-cover" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-emerald-900/90 font-semibold">AL-BAYAAN</p>
              <p className="text-sm text-slate-600">Plateforme Éducative | المنصة التعليمية | Educational Platform</p>
            </div>
          </div>

          <nav className="flex flex-wrap items-center gap-3">
            <Link href="/auth/login" className="rounded-full border border-emerald-900/20 bg-white px-5 py-2 text-sm font-semibold text-emerald-900 transition hover:bg-emerald-50 hover:border-emerald-900/40 transform hover:scale-105 duration-300">
              Connexion
            </Link>
            <Link href="/auth/register" className="rounded-full bg-emerald-900 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-emerald-900/10 transition hover:bg-emerald-800 transform hover:scale-105 duration-300">
              Inscription
            </Link>
          </nav>
        </header>

        {/* Hero Section */}
        <section className="relative overflow-hidden rounded-[2.25rem] border border-white/70 bg-white/80 p-10 shadow-2xl shadow-slate-900/10 backdrop-blur-xl">
          <div className="pointer-events-none absolute -left-16 top-10 h-52 w-52 rounded-full bg-emerald-200/60 blur-3xl animate-pulse" />
          <div className="pointer-events-none absolute -right-24 bottom-6 h-72 w-72 rounded-full bg-amber-200/40 blur-3xl animate-pulse" />

          <div className="grid gap-10 lg:grid-cols-[1.3fr_0.9fr] lg:items-center">
            <div className="space-y-6 animate-fade-in">
              <p className="text-sm font-semibold uppercase tracking-[0.35em] text-emerald-900/80">Bienvenue</p>
              <h1 className="max-w-3xl text-5xl font-bold tracking-tight text-slate-950 sm:text-6xl bg-gradient-to-r from-emerald-900 via-emerald-700 to-amber-600 bg-clip-text text-transparent">
                AL-BAYAAN — مدرسة البيان الإسلامية
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-slate-600 sm:text-xl">
                Une école islamique d'excellence, combinant <span className="font-semibold text-emerald-900">l'éducation traditionnelle avec l'innovation technologique</span>. Nous formons des générations de citoyens responsables, bilingues et compétents en informatique.
              </p>

              <div className="flex flex-wrap gap-4 pt-4">
                <Link href="/auth/register" className="inline-flex rounded-full bg-gradient-to-r from-emerald-900 to-emerald-800 px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-900/30 transition hover:shadow-emerald-900/50 transform hover:scale-105 duration-300">
                  S'inscrire Maintenant
                </Link>
                <Link href="/auth/login" className="inline-flex rounded-full border-2 border-emerald-900/30 bg-white px-8 py-3 text-sm font-semibold text-emerald-900 transition hover:bg-emerald-50 transform hover:scale-105 duration-300">
                  Se connecter
                </Link>
              </div>
            </div>

            {/* Hero Images */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
              <div className="group glass-card rounded-[1.75rem] border border-white/70 bg-white/70 p-5 shadow-xl shadow-slate-900/5 backdrop-blur-xl hover:shadow-emerald-900/20 transition-all duration-500 transform hover:scale-105">
                <div className="mb-4 h-44 overflow-hidden rounded-3xl bg-slate-100">
                  <Image
                    src="https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=800&q=80"
                    alt="Classe moderne"
                    width={600}
                    height={400}
                    className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
                <h3 className="text-lg font-semibold text-slate-900">Cadre Moderne & Respectueux</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">Des espaces pédagogiques bien aménagés, équipés de technologie moderne pour l'apprentissage.</p>
              </div>
              <div className="group glass-card rounded-[1.75rem] border border-white/70 bg-white/70 p-5 shadow-xl shadow-slate-900/5 backdrop-blur-xl hover:shadow-emerald-900/20 transition-all duration-500 transform hover:scale-105">
                <div className="mb-4 h-44 overflow-hidden rounded-3xl bg-slate-100">
                  <Image
                    src="https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=800&q=80"
                    alt="Éducation"
                    width={600}
                    height={400}
                    className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
                <h3 className="text-lg font-semibold text-slate-900">Excellence Académique</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">Un accompagnement personnalisé pour chaque élève, dans un environnement inclusif et bienveillant.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="grid gap-8 md:grid-cols-3 animate-fade-in">
          {/* Informatique */}
          <div className="group rounded-[2rem] border border-white/70 bg-white/80 p-8 shadow-xl shadow-slate-900/5 backdrop-blur-xl hover:shadow-emerald-900/20 transition-all duration-500 transform hover:scale-105">
            <div className="mb-6 inline-flex rounded-2xl bg-gradient-to-br from-emerald-100 to-emerald-50 p-4">
              <svg className="h-8 w-8 text-emerald-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-3">Informatique & Technologie</h3>
            <p className="text-slate-600 leading-6 mb-4">
              Nos cours d'informatique préparent les élèves aux technologies du 21e siècle. Du codage à la cybersécurité, en passant par le développement web, nous offrons une formation complète et actualisée.
            </p>
            <p className="text-sm text-emerald-900 font-semibold">Programmation • Web Design • IT Essentials</p>
          </div>

          {/* Multilingue */}
          <div className="group rounded-[2rem] border border-white/70 bg-white/80 p-8 shadow-xl shadow-slate-900/5 backdrop-blur-xl hover:shadow-emerald-900/20 transition-all duration-500 transform hover:scale-105">
            <div className="mb-6 inline-flex rounded-2xl bg-gradient-to-br from-amber-100 to-amber-50 p-4">
              <svg className="h-8 w-8 text-amber-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-3">Trilingue Excellence</h3>
            <p className="text-slate-600 leading-6 mb-4">
              L'enseignement en français, arabe et anglais prépare nos élèves à une carrière internationale. Nos professeurs qualifiés assurent une maîtrise complète de chaque langue.
            </p>
            <p className="text-sm text-amber-900 font-semibold">Français • Arabe • English</p>
          </div>

          {/* Valeurs Islamiques */}
          <div className="group rounded-[2rem] border border-white/70 bg-white/80 p-8 shadow-xl shadow-slate-900/5 backdrop-blur-xl hover:shadow-emerald-900/20 transition-all duration-500 transform hover:scale-105">
            <div className="mb-6 inline-flex rounded-2xl bg-gradient-to-br from-blue-100 to-blue-50 p-4">
              <svg className="h-8 w-8 text-blue-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-3">Valeurs Éthiques & Islamiques</h3>
            <p className="text-slate-600 leading-6 mb-4">
              L'intégrité, le respect, la responsabilité et les valeurs islamiques sont au cœur de notre approche pédagogique. Nous formons des citoyens conscients et respectueux.
            </p>
            <p className="text-sm text-blue-900 font-semibold">Intégrité • Respect • Leadership</p>
          </div>
        </section>

        {/* Stats Section */}
        <section className="rounded-[2.25rem] border border-white/70 bg-gradient-to-r from-emerald-900/90 to-emerald-800/90 p-12 shadow-2xl shadow-emerald-900/20 backdrop-blur-xl text-white">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Chiffres Clés</h2>
            <p className="text-emerald-100 text-lg">Notre impact dans l'éducation</p>
          </div>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div className="text-center transform hover:scale-110 transition-transform duration-300">
              <div className="text-4xl font-bold text-amber-300 mb-2">500+</div>
              <p className="text-emerald-100">Élèves Inscrits</p>
            </div>
            <div className="text-center transform hover:scale-110 transition-transform duration-300">
              <div className="text-4xl font-bold text-amber-300 mb-2">50+</div>
              <p className="text-emerald-100">Professeurs Qualifiés</p>
            </div>
            <div className="text-center transform hover:scale-110 transition-transform duration-300">
              <div className="text-4xl font-bold text-amber-300 mb-2">15+</div>
              <p className="text-emerald-100">Ans d'Expérience</p>
            </div>
            <div className="text-center transform hover:scale-110 transition-transform duration-300">
              <div className="text-4xl font-bold text-amber-300 mb-2">98%</div>
              <p className="text-emerald-100">Taux de Réussite</p>
            </div>
          </div>
        </section>

        {/* Multilingual Section */}
        <section className="grid gap-8 lg:grid-cols-3 animate-fade-in">
          {/* French */}
          <div className="rounded-[2rem] border border-white/70 bg-white/80 p-8 shadow-xl backdrop-blur-xl hover:shadow-emerald-900/20 transition-all duration-500">
            <h3 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
              <span className="text-2xl">🇫🇷</span> Français
            </h3>
            <p className="text-slate-600 leading-7">
              AL-BAYAAN offre un environnement d'apprentissage complet où chaque élève peut s'épanouir académiquement et spirituellement. Nos programmes combinent excellence académique, valeurs islamiques et préparation à l'ère numérique.
            </p>
          </div>

          {/* English */}
          <div className="rounded-[2rem] border border-white/70 bg-white/80 p-8 shadow-xl backdrop-blur-xl hover:shadow-emerald-900/20 transition-all duration-500">
            <h3 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
              <span className="text-2xl">🇬🇧</span> English
            </h3>
            <p className="text-slate-600 leading-7">
              AL-BAYAAN School provides a comprehensive learning environment where every student can flourish academically and spiritually. Our programs combine academic excellence, Islamic values, and digital-age preparation for a competitive world.
            </p>
          </div>

          {/* Arabic */}
          <div className="rounded-[2rem] border border-white/70 bg-white/80 p-8 shadow-xl backdrop-blur-xl hover:shadow-emerald-900/20 transition-all duration-500">
            <h3 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
              <span className="text-2xl">🇸🇦</span> العربية
            </h3>
            <p className="text-slate-600 leading-7 text-right">
              توفر مدرسة البيان بيئة تعليمية شاملة يمكن لكل طالب أن ينمو فيها أكاديميًا وروحيًا. تجمع برامجنا بين التميز الأكاديمي والقيم الإسلامية والاستعداد لعصر رقمي متنافس.
            </p>
          </div>
        </section>

        {/* CTA Section */}
        <section className="rounded-[2.25rem] border border-white/70 bg-white/80 p-12 shadow-2xl shadow-slate-900/10 backdrop-blur-xl text-center">
          <h2 className="text-4xl font-bold text-slate-900 mb-4">Prêt à Rejoindre AL-BAYAAN?</h2>
          <p className="text-slate-600 text-lg mb-8 max-w-2xl mx-auto">
            Créez votre compte dès aujourd'hui en tant qu'enseignant, parent ou administrateur et accédez à notre plateforme complète de gestion scolaire.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/auth/register" className="inline-flex rounded-full bg-gradient-to-r from-emerald-900 to-emerald-800 px-10 py-4 text-base font-semibold text-white shadow-lg shadow-emerald-900/30 transition hover:shadow-emerald-900/50 transform hover:scale-105 duration-300">
              Créer un Compte
            </Link>
            <Link href="/auth/login" className="inline-flex rounded-full border-2 border-emerald-900/30 bg-white px-10 py-4 text-base font-semibold text-emerald-900 transition hover:bg-emerald-50 transform hover:scale-105 duration-300">
              Connexion Enseignant
            </Link>
          </div>
        </section>

        {/* Footer */}
        <footer className="text-center py-8 text-slate-600 border-t border-slate-200">
          <p className="mb-2">© 2026 AL-BAYAAN - Plateforme Éducative Islamique</p>
          <p className="text-sm">Bienvenue à l'école de demain | مرحبا بك في مدرسة الغد | Welcome to School of Tomorrow</p>
        </footer>
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fadeIn 0.8s ease-out;
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 0.5;
          }
          50% {
            opacity: 0.3;
          }
        }

        .animate-pulse {
          animation: pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>
    </main>
  );
}
