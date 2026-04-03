import Link from 'next/link';

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="max-w-3xl mx-auto px-6 py-12 space-y-8">
        <header className="space-y-2">
          <p className="text-xs uppercase tracking-wider text-pulse-300">Pulse Policy</p>
          <h1 className="text-3xl font-bold font-display">Terms of Service</h1>
          <p className="text-slate-400">
            These terms define usage expectations for the Pulse candidate demo portal.
          </p>
        </header>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">Platform Use</h2>
          <p className="text-slate-400">
            Users may create profiles, connect supported integrations, and share public profile views for recruiting
            use cases. Misuse, impersonation, and data abuse are not permitted.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">Service Scope</h2>
          <p className="text-slate-400">
            This environment is a demo-first implementation. Feature availability, uptime, and data freshness may vary
            while integrations remain in mock mode.
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
