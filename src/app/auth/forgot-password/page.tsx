import Link from 'next/link';

export default function ForgotPasswordPage() {
  return (
    <main className="min-h-screen bg-[#f8fafc] text-slate-800 flex items-center justify-center px-6">
      <section className="w-full max-w-md rounded-card border border-slate-200 bg-white p-6 space-y-4">
        <h1 className="text-2xl font-bold">Reset password</h1>
        <p className="text-slate-500">
          Password reset is not available in demo mode yet. Sign in with your existing account or create a new one.
        </p>
        <div className="flex gap-3 pt-2">
          <Link
            href="/auth/login"
            className="inline-flex items-center justify-center rounded-input bg-pulse-600 px-4 py-2 text-sm font-medium text-white hover:bg-pulse-700 transition-colors"
          >
            Back to sign in
          </Link>
          <Link
            href="/auth/signup"
            className="inline-flex items-center justify-center rounded-input border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Create account
          </Link>
        </div>
      </section>
    </main>
  );
}
