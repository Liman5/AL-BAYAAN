import Link from 'next/link';
import { ArrowLeft, Clock, Mail, MapPin, Phone } from 'lucide-react';

const CONTACT = {
  phone: '+213 555 000 000',
  phoneHref: '+213555000000',
  email: 'contact@albayan.edu',
  address: 'Adresse de l’école',
  hours: 'Lundi – Vendredi · 07h30 – 16h30',
};

export default function ContactPage() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-16">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-800 transition hover:text-emerald-950"
      >
        <ArrowLeft size={16} /> Retour à l’accueil
      </Link>

      <section className="mt-8 rounded-3xl border border-emerald-900/10 bg-white p-10 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-amber-700">Contact</p>
        <h1 className="mt-3 text-4xl font-black text-emerald-950">Contactez AL-BAYAAN</h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
          Pour toute question sur les inscriptions, les programmes ou la vie scolaire, notre
          secrétariat vous répond du lundi au vendredi.
        </p>

        <ul className="mt-8 grid gap-4 sm:grid-cols-2">
          <li>
            <a
              href={`tel:${CONTACT.phoneHref}`}
              className="flex items-start gap-3 rounded-2xl border border-emerald-900/10 p-4 transition hover:border-amber-400/50 hover:bg-emerald-50/40"
            >
              <Phone size={19} className="mt-0.5 shrink-0 text-emerald-700" />
              <span>
                <span className="block text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
                  Téléphone
                </span>
                <span className="mt-1 block text-sm font-semibold text-slate-700">{CONTACT.phone}</span>
              </span>
            </a>
          </li>
          <li>
            <a
              href={`mailto:${CONTACT.email}`}
              className="flex items-start gap-3 rounded-2xl border border-emerald-900/10 p-4 transition hover:border-amber-400/50 hover:bg-emerald-50/40"
            >
              <Mail size={19} className="mt-0.5 shrink-0 text-emerald-700" />
              <span>
                <span className="block text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
                  E-mail
                </span>
                <span className="mt-1 block break-words text-sm font-semibold text-slate-700">
                  {CONTACT.email}
                </span>
              </span>
            </a>
          </li>
          <li className="flex items-start gap-3 rounded-2xl border border-emerald-900/10 p-4">
            <MapPin size={19} className="mt-0.5 shrink-0 text-emerald-700" />
            <span>
              <span className="block text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
                Adresse
              </span>
              <span className="mt-1 block text-sm font-semibold text-slate-700">{CONTACT.address}</span>
            </span>
          </li>
          <li className="flex items-start gap-3 rounded-2xl border border-emerald-900/10 p-4">
            <Clock size={19} className="mt-0.5 shrink-0 text-emerald-700" />
            <span>
              <span className="block text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
                Horaires
              </span>
              <span className="mt-1 block text-sm font-semibold text-slate-700">{CONTACT.hours}</span>
            </span>
          </li>
        </ul>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/auth/register"
            className="rounded-full bg-emerald-900 px-6 py-3 text-sm font-bold text-white transition hover:bg-emerald-800"
          >
            Préinscription en ligne
          </Link>
          <Link
            href="/#contact"
            className="rounded-full border border-emerald-900/20 px-6 py-3 text-sm font-bold text-emerald-900 transition hover:bg-emerald-50"
          >
            Formulaire de contact
          </Link>
        </div>
      </section>
    </main>
  );
}
