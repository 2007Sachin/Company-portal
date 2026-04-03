import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="max-w-3xl mx-auto px-6 py-12 space-y-8">
        <header className="space-y-2">
          <p className="text-xs uppercase tracking-wider text-pulse-300">Pulse Policy</p>
          <h1 className="text-3xl font-bold font-display">Privacy Policy</h1>
          <p className="text-slate-400">
            This demo portal explains how profile data is handled in the candidate app experience.
          </p>
        </header>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">What We Store</h2>
          <p className="text-slate-400">
            Pulse stores profile fields, integration metadata, and scoring snapshots to render your public and
            recruiter-facing views. In this demo environment, data is mock-backed.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">Control and Consent</h2>
          <p className="text-slate-400">
            Privacy settings let candidates control profile visibility, contact preferences, and activity exposure.
            Consent controls are configurable from onboarding and profile settings flows.
          </p>
        </section>

        <footer className="pt-4 border-t border-slate-800">
          <Link href="/" className="text-pulse-300 hover:text-pulse-200 transition-colors">
            Back to home
          </Link>
        </footer>
      </div>
    </main>
  );
}
