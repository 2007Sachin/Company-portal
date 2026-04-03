import Link from 'next/link';

export default function ForgotPasswordPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center px-6">
      <section className="w-full max-w-md rounded-xl border border-slate-700/50 bg-slate-900/60 p-6 space-y-4">
        <h1 className="text-2xl font-bold font-display">Reset password</h1>
        <p className="text-slate-400">
          Password reset is not wired in demo mode yet. Use your existing login path or create a new demo account.
        </p>
        <div className="flex gap-3 pt-2">
          <Link
            href="/auth/login"
            className="inline-flex items-center justify-center rounded-lg bg-pulse-600 px-4 py-2 text-sm font-medium text-white hover:bg-pulse-500 transition-colors"
          >
            Back to login
          </Link>
          <Link
            href="/auth/signup"
            className="inline-flex items-center justify-center rounded-lg border border-slate-600 px-4 py-2 text-sm font-medium text-slate-200 hover:bg-slate-800 transition-colors"
          >
            Create account
          </Link>
        </div>
      </section>
    </main>
  );
}
