import Link from 'next/link';

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-white text-slate-800">
      <div className="max-w-3xl mx-auto px-6 py-12 space-y-8">
        <header className="space-y-2">
          <p className="text-xs uppercase tracking-wider text-pulse-600 font-medium">Pulse Policy</p>
          <h1 className="text-3xl font-semibold">Terms of Service</h1>
          <p className="text-slate-500">
            These terms define usage expectations for the Pulse candidate portal.
          </p>
        </header>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-slate-800">Platform use</h2>
          <p className="text-slate-600 leading-relaxed">
            Users may create profiles, connect supported integrations, and share public profile views for recruiting
            use cases. Misuse, impersonation, and data abuse are not permitted.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-slate-800">Service scope</h2>
          <p className="text-slate-600 leading-relaxed">
            This environment is a demo-first implementation. Feature availability, uptime, and data freshness may vary
            while integrations remain in mock mode.
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
