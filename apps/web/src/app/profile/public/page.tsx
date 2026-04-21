'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Copy, ExternalLink, Loader2 } from 'lucide-react';
import { Header } from '@pulse/ui';
import { getCandidateMe } from '@/lib/api';

export default function PublicProfilePreviewPage() {
  const [candidate, setCandidate] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const response = await getCandidateMe();
        if (response.ok) {
          setCandidate(await response.json());
        }
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Header title="Public Profile" backTo="/candidate/dashboard" />
        <div className="flex h-[70vh] items-center justify-center">
          <Loader2 className="h-9 w-9 animate-spin text-indigo-600" />
        </div>
      </div>
    );
  }

  const username = candidate?.username || 'your-username';
  const publicUrl = `/p/${username}`;

  return (
    <div className="min-h-screen bg-slate-50">
      <Header title="Public Profile" backTo="/candidate/dashboard" />

      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm">
          <p className="text-xs font-black uppercase tracking-[0.24em] text-indigo-600">Shareable profile link</p>
          <h1 className="mt-2 text-3xl font-black text-slate-900">Your public Pulse profile</h1>
          <p className="mt-3 text-sm text-slate-600">
            Recruiters can use this page to see your Pulse Score, proof of work, case studies, and video pitch highlights without waiting for a cold outreach thread to go anywhere.
          </p>

          <div className="mt-6 rounded-3xl border border-slate-100 bg-slate-50 p-5">
            <p className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">Public URL</p>
            <p className="mt-2 break-all text-lg font-black text-slate-900">{publicUrl}</p>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link href={publicUrl} className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-black text-white transition hover:bg-slate-800">
              Preview profile
              <ExternalLink className="h-4 w-4" />
            </Link>
            <button
              onClick={() => navigator.clipboard.writeText(window.location.origin + publicUrl)}
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-900 transition hover:border-indigo-200 hover:bg-indigo-50"
            >
              Copy link
              <Copy className="h-4 w-4" />
            </button>
          </div>

          {!candidate?.username && (
            <p className="mt-5 text-sm text-amber-600">
              Your username is not set yet, so this preview uses a placeholder. Once username support is finalized in onboarding/settings, this link will become stable.
            </p>
          )}
        </section>
      </main>
    </div>
  );
}
