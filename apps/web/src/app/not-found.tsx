import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-4">
      <div className="text-center space-y-6 max-w-md">
        <div className="w-16 h-16 rounded-2xl bg-slate-900 flex items-center justify-center mx-auto">
          <span className="text-white font-bold text-2xl">P.</span>
        </div>
        <div className="space-y-2">
          <h1 className="text-6xl font-extrabold text-slate-900">404</h1>
          <p className="text-xl font-semibold text-slate-700">Page not found</p>
          <p className="text-slate-500">The page you're looking for doesn't exist or has been moved.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <Link
            href="/"
            className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors"
          >
            Go home
          </Link>
          <Link
            href="/auth/login"
            className="inline-flex items-center justify-center px-6 py-3 rounded-xl border border-slate-200 text-slate-700 font-semibold hover:bg-slate-100 transition-colors"
          >
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
