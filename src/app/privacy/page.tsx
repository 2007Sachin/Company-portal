import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-white text-slate-800">
      <div className="max-w-3xl mx-auto px-6 py-12 space-y-8">
        <header className="space-y-2">
          <p className="text-xs uppercase tracking-wider text-pulse-600 font-medium">Pulse Policy</p>
          <h1 className="text-3xl font-semibold">Privacy Policy</h1>
          <p className="text-slate-500">
            This demo portal explains how profile data is handled in the candidate app experience.
          </p>
        </header>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-slate-800">What we store</h2>
          <p className="text-slate-600 leading-relaxed">
            Pulse stores profile fields, integration metadata, and scoring snapshots to render your public and
            recruiter-facing views. In this demo environment, data is mock-backed.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-slate-800">Control and consent</h2>
          <p className="text-slate-600 leading-relaxed">
            Privacy settings let candidates control profile visibility, contact preferences, and activity exposure.
            Consent controls are configurable from onboarding and profile settings flows.
          </p>
        </section>

        <footer className="pt-4 border-t border-slate-200">
          <Link href="/" className="text-pulse-600 hover:text-pulse-700 transition-colors text-sm font-medium">
            Back to home
          </Link>
        </footer>
      </div>
    </main>
  );
}
