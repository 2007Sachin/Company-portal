'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, ExternalLink, Loader2, PlayCircle } from 'lucide-react';
import { getCandidatePublicProfile } from '@/lib/api';

export default function PublicCandidateProfilePage() {
  const params = useParams<{ username: string }>();
  const username = params?.username;
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!username) return;
      setLoading(true);
      try {
        const response = await getCandidatePublicProfile(username);
        if (response.ok) {
          setData(await response.json());
        }
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [username]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <Loader2 className="h-9 w-9 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="w-full max-w-lg rounded-[32px] border border-slate-200 bg-white p-8 text-center shadow-sm">
          <p className="text-xs font-black uppercase tracking-[0.24em] text-slate-400">Pulse public profile</p>
          <h1 className="mt-2 text-2xl font-black text-slate-900">This profile is not available</h1>
          <p className="mt-3 text-sm text-slate-600">The candidate may have hidden their profile or the link may be incorrect.</p>
          <Link href="/" className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-black text-white transition hover:bg-slate-800">
            <ArrowLeft className="h-4 w-4" />
            Back to Pulse
          </Link>
        </div>
      </div>
    );
  }

  const profile = data.profile;
  const score = data.pulse_score;

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-black text-slate-500 hover:text-slate-700">
            <ArrowLeft className="h-4 w-4" />
            Back to Pulse
          </Link>
          <Link href="/auth/login" className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-black text-white transition hover:bg-slate-800">
            Sign in
          </Link>
        </div>

        <section className="rounded-[36px] border border-slate-200 bg-white p-8 shadow-sm">
          <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.24em] text-indigo-600">Pulse public profile</p>
              <h1 className="mt-3 text-4xl font-black tracking-tight text-slate-900">{profile.full_name || profile.username}</h1>
              <p className="mt-2 text-lg font-bold text-slate-600">{profile.headline || 'Early-career builder'}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {(profile.target_roles || []).map((role: string) => (
                  <span key={role} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-600">
                    {role}
                  </span>
                ))}
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <ProfileMeta label="Location" value={profile.city || 'Undisclosed'} />
                <ProfileMeta label="College" value={profile.college_name || 'Undisclosed'} />
                <ProfileMeta label="Graduation" value={profile.graduation_year ? String(profile.graduation_year) : 'Undisclosed'} />
                <ProfileMeta label="Top skills" value={(profile.skills || []).slice(0, 4).join(', ') || 'Not shared'} />
              </div>
            </div>

            <div className="rounded-[32px] border border-slate-100 bg-slate-50 p-6">
              <p className="text-xs font-black uppercase tracking-[0.24em] text-slate-400">Pulse score</p>
              <div className="mt-4 flex items-end gap-3">
                <p className="text-6xl font-black text-indigo-600">{score.score}</p>
                <p className="pb-2 text-sm font-black uppercase tracking-[0.24em] text-slate-400">{score.tier}</p>
              </div>
              <div className="mt-6 space-y-3">
                {score.breakdown.map((item: any) => (
                  <div key={item.key}>
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-black text-slate-900">{item.label}</span>
                      <span className="font-black text-slate-500">{item.score}/{item.max}</span>
                    </div>
                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200">
                      <div className="h-full rounded-full bg-indigo-600" style={{ width: `${(item.score / item.max) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-[1fr_1fr]">
          <div className="rounded-[32px] border border-slate-200 bg-white p-7 shadow-sm">
            <h2 className="text-2xl font-black text-slate-900">Featured proof of work</h2>
            <div className="mt-5 space-y-4">
              {(data.featured_repos || []).slice(0, 6).map((repo: any) => (
                <div key={repo.id || repo.repo_url} className="rounded-3xl border border-slate-100 bg-slate-50 p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-lg font-black text-slate-900">{repo.repo_name}</p>
                      <p className="mt-2 text-sm text-slate-600">{repo.ai_generated_readme || 'Repository synced from GitHub as part of the candidate credibility profile.'}</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {(repo.inferred_skills || []).slice(0, 4).map((skill: string) => (
                          <span key={skill} className="rounded-full bg-white px-3 py-1 text-xs font-black text-slate-500">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                    {repo.repo_url && (
                      <a href={repo.repo_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-black text-slate-900 transition hover:border-indigo-200">
                        Open
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-[32px] border border-slate-200 bg-white p-7 shadow-sm">
              <h2 className="text-2xl font-black text-slate-900">Case studies</h2>
              <div className="mt-5 space-y-4">
                {(data.case_studies || []).slice(0, 4).map((study: any) => (
                  <div key={study.id} className="rounded-3xl border border-slate-100 bg-slate-50 p-5">
                    <p className="text-lg font-black text-slate-900">{study.title}</p>
                    <p className="mt-2 text-sm text-slate-600">{study.description || 'Candidate-supplied project summary.'}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {(study.tags || []).map((tag: string) => (
                        <span key={tag} className="rounded-full bg-white px-3 py-1 text-xs font-black text-slate-500">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[32px] border border-slate-200 bg-white p-7 shadow-sm">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-black text-slate-900">Video pitch</h2>
                  <p className="mt-2 text-sm text-slate-600">A quick look at how this candidate presents their work and motivation.</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-3 text-indigo-600">
                  <PlayCircle className="h-6 w-6" />
                </div>
              </div>
              <div className="mt-5 rounded-3xl border border-slate-100 bg-slate-50 p-5">
                <p className="text-sm text-slate-600">
                  {data.video_pitch?.transcript || 'No transcript shared publicly yet.'}
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

function ProfileMeta({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
      <p className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">{label}</p>
      <p className="mt-2 text-sm font-black text-slate-900">{value}</p>
    </div>
  );
}
