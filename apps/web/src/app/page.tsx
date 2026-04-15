'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Navigation */}
      <nav className="border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-200">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
              </svg>
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">Pulse</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/auth/login">
              <button className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors">
                Sign in
              </button>
            </Link>
            <Link href="/auth/signup">
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-100 px-6">
                Get started
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative pt-20 pb-24 overflow-hidden bg-white">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none overflow-hidden">
             <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-50/50 rounded-full blur-[120px]" />
             <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyan-50/50 rounded-full blur-[120px]" />
          </div>
          
          <div className="max-w-7xl mx-auto px-6 relative z-10">
            <div className="max-w-4xl mx-auto text-center space-y-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-xs font-bold text-blue-600 uppercase tracking-widest">
                Activity-as-Pedigree
              </div>
              
              <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 leading-[1.1] tracking-tight text-balance">
                Your code speaks. <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">
                  Let recruiters listen.
                </span>
              </h1>
              
              <p className="text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed text-balance">
                Pulse transforms your live activity on GitHub, LeetCode, and Medium into a verifiable score. 
                Stop competing with resumes—start leading with proof.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
                <Link href="/auth/signup">
                  <Button size="lg" className="h-14 px-10 text-lg bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-200 group">
                    Build your Pulse Profile
                    <svg className="ml-2 group-hover:translate-x-1 transition-transform" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14m-7-7 7 7-7 7" />
                    </svg>
                  </Button>
                </Link>
                <button className="h-14 px-8 text-lg font-semibold text-slate-600 hover:text-blue-600 transition-colors">
                  Explore Sample Profiles
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Pulse Score Preview Mockup */}
        <section className="bg-white pb-24">
           <div className="max-w-5xl mx-auto px-6">
              <div className="bg-slate-900 rounded-[32px] p-8 md:p-12 shadow-2xl relative overflow-hidden group">
                 <div className="absolute top-0 right-0 p-8">
                    <div className="w-16 h-16 rounded-full border-4 border-blue-500/30 border-t-blue-500 animate-spin-slow" />
                 </div>
                 <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center">
                    <div className="space-y-6">
                       <div className="flex items-center gap-4">
                          <div className="w-16 h-16 rounded-2xl bg-blue-500 flex items-center justify-center text-3xl font-bold text-white shadow-lg">84</div>
                          <div>
                             <h3 className="text-2xl font-bold text-white">Rahul S.</h3>
                             <p className="text-blue-300">Fullstack Engineer • Tier-3 Excellence</p>
                          </div>
                       </div>
                       <div className="space-y-4">
                          <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                             <div className="h-full bg-blue-500 w-[84%] rounded-full" />
                          </div>
                          <div className="flex justify-between text-sm text-slate-400">
                             <span>Consistency: 92%</span>
                             <span>Impact: 78%</span>
                             <span>Breadth: 85%</span>
                          </div>
                       </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                       <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700">
                          <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">GitHub</p>
                          <p className="text-xl font-bold text-white">420+ Commits</p>
                       </div>
                       <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700">
                          <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">LeetCode</p>
                          <p className="text-xl font-bold text-white">Top 5% Rank</p>
                       </div>
                    </div>
                 </div>
              </div>
           </div>
        </section>

        {/* Candidate POV: Stop Claiming, Start Proving */}
        <section className="py-24 bg-slate-50">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div className="space-y-6 order-2 lg:order-1">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm font-bold">
                  FOR CANDIDATES
                </div>
                <h2 className="text-4xl font-bold text-slate-900 leading-tight">
                  Escape the "Resume Stagnation" Trap.
                </h2>
                <p className="text-lg text-slate-600 leading-relaxed">
                  In a market flooded with identical resumes, Pulse gives you an unfair advantage. 
                  Don't just mention "Python" or "React"—show the 1,200 commits and 300 solved problems that back it up.
                </p>
                <ul className="space-y-4 pt-4">
                  {[
                    { title: "Real-time Pedigree", desc: "Your background isn't just your college name anymore; it's your daily output." },
                    { title: "Verifiable Credibility", desc: "Every point in your Pulse Score is backed by public source data recruiters trust." },
                    { title: "Anti-Bias Discovery", desc: "Get prioritized by companies based on how you code, not wait for them to notice your PDF." }
                  ].map((item) => (
                    <li key={item.title} className="flex gap-4 p-4 bg-white rounded-2xl border border-slate-200">
                      <div className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center flex-shrink-0 mt-1">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M20 6 9 17l-5-5" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">{item.title}</p>
                        <p className="text-sm text-slate-500">{item.desc}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-blue-600 rounded-[40px] aspect-square relative overflow-hidden shadow-2xl order-1 lg:order-2">
                 <div className="absolute inset-0 flex items-center justify-center text-center p-12 text-white">
                    <div className="space-y-4">
                       <span className="text-6xl">🚀</span>
                       <h3 className="text-3xl font-bold">Stop claiming. <br />Start proving.</h3>
                       <p className="text-blue-100 opacity-80 uppercase tracking-widest text-sm font-bold">The new standard for tech talent</p>
                    </div>
                 </div>
              </div>
            </div>
          </div>
        </section>

        {/* HR POV: Smarter Screening */}
        <section className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
               <div className="bg-slate-900 rounded-[40px] aspect-square relative overflow-hidden shadow-2xl">
                 <div className="absolute inset-0 flex items-center justify-center text-center p-12 text-white">
                    <div className="space-y-4">
                       <span className="text-6xl">🔍</span>
                       <h3 className="text-3xl font-bold">Signal over Noise.</h3>
                       <p className="text-slate-400 uppercase tracking-widest text-sm font-bold">Built for high-signal recruitment</p>
                    </div>
                 </div>
              </div>
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-100 text-cyan-700 text-sm font-bold">
                  FOR HR & RECRUITERS
                </div>
                <h2 className="text-4xl font-bold text-slate-900 leading-tight">
                  Stop Drowning in <br />Identical Resumes.
                </h2>
                <p className="text-lg text-slate-600 leading-relaxed">
                  Screening candidates shouldn't be a guessing game. Pulse provides a data-rich layer 
                  on top of candidates that guarantees technical competence before the first call.
                </p>
                <div className="grid grid-cols-2 gap-4 pt-4">
                   <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 text-center">
                      <p className="text-4xl font-extrabold text-blue-600">40%</p>
                      <p className="text-sm font-bold text-slate-500 mt-1">Lower Time-to-Hire</p>
                   </div>
                   <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 text-center">
                      <p className="text-4xl font-extrabold text-blue-600">60%</p>
                      <p className="text-sm font-bold text-slate-500 mt-1">Interview Pass Rate</p>
                   </div>
                </div>
                <ul className="space-y-4 pt-4">
                  {[
                    { title: "Verified Skillsets", desc: "No more exaggerated LinkedIn profiles. Pulse scores are tied to live, verifiable code activity." },
                    { title: "Better Candidate Funnel", desc: "Invite only those whose activity metrics match your engineering bar." },
                    { title: "Real-time Pipelines", desc: "Get alerted when top developers in your ecosystem spike in activity." }
                  ].map((item) => (
                    <li key={item.title} className="flex gap-4">
                      <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0 mt-1">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M20 6 9 17l-5-5" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">{item.title}</p>
                        <p className="text-sm text-slate-500">{item.desc}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-24 bg-slate-900 overflow-hidden relative">
          <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[100px]" />
          <div className="max-w-4xl mx-auto px-6 text-center relative z-10 space-y-8">
            <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
              Ready to redefine your technical pedigree?
            </h2>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
              Join thousands of developers and recruiters using Pulse to build the future of meritocratic hiring.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link href="/auth/signup">
                <Button size="lg" className="h-14 px-10 text-lg bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-500/20">
                  Get Started for Free
                </Button>
              </Link>
              <Link href="/auth/login" className="text-white font-bold h-14 px-8 flex items-center hover:text-blue-400 transition-colors">
                Sign In to existing account
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-12 px-6">
        <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-12">
           <div className="space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                  </svg>
                </div>
                <span className="text-lg font-bold text-slate-900">Pulse</span>
              </div>
              <p className="text-sm text-slate-500 leading-relaxed">
                Empowering developers with activity-as-pedigree. Built for the meritocratic future of hiring.
              </p>
           </div>
           <div>
              <p className="font-bold text-slate-900 mb-4">Product</p>
              <ul className="space-y-2 text-sm text-slate-500">
                 <li><Link href="/" className="hover:text-blue-600">Pulse Score</Link></li>
                 <li><Link href="/" className="hover:text-blue-600">Integrations</Link></li>
                 <li><Link href="/" className="hover:text-blue-600">Public Profiles</Link></li>
              </ul>
           </div>
           <div>
              <p className="font-bold text-slate-900 mb-4">Support</p>
              <ul className="space-y-2 text-sm text-slate-500">
                 <li><Link href="/terms" className="hover:text-blue-600">Terms of Service</Link></li>
                 <li><Link href="/privacy" className="hover:text-blue-600">Privacy Policy</Link></li>
                 <li><Link href="/" className="hover:text-blue-600">Contact</Link></li>
              </ul>
           </div>
           <div>
              <p className="font-bold text-slate-900 mb-4">Connect</p>
              <div className="flex gap-4">
                 {['twitter', 'github', 'linkedin'].map(social => (
                    <div key={social} className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center hover:bg-blue-50 hover:text-blue-600 transition-colors cursor-pointer">
                       <span className="sr-only">{social}</span>
                       <div className="w-5 h-5 bg-current opacity-20" />
                    </div>
                 ))}
              </div>
           </div>
        </div>
        <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-slate-100 text-center text-xs text-slate-400">
           &copy; {new Date().getFullYear()} Pulse. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
