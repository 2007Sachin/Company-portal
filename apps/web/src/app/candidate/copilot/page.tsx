'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Sparkles, 
  Target, 
  Video, 
  Eye, 
  CheckCircle2, 
  AlertCircle, 
  ChevronRight, 
  ChevronDown, 
  Zap,
  Bot
} from 'lucide-react';
import { Header } from '@pulse/ui';
import { 
  getCandidateMe, 
  getCandidateMatches, 
  copilotOptimizeProfile, 
  copilotScoreCoach, 
  copilotMockInterview,
  updateCandidateMe
} from '@/lib/api';

type Tab = 'optimizer' | 'coach' | 'mock' | 'radar';

export default function CopilotHubPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>('optimizer');
  const [candidate, setCandidate] = useState<any>(null);

  // States
  const [loading, setLoading] = useState(true);

  // Optimizer limits
  const [optimizerData, setOptimizerData] = useState<any>(null);
  const [optimizerLoading, setOptimizerLoading] = useState(false);

  // Coach limits
  const [coachData, setCoachData] = useState<any>(null);
  const [coachLoading, setCoachLoading] = useState(false);

  // Mock Interview limits
  const [mockDifficulty, setMockDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [mockData, setMockData] = useState<any[]>([]);
  const [mockLoading, setMockLoading] = useState(false);
  const [expandedQ, setExpandedQ] = useState<number | null>(null);

  // Radar limits
  const [matches, setMatches] = useState<any[]>([]);

  useEffect(() => {
    async function loadInitialData() {
      try {
        const [meRes, matchesRes] = await Promise.all([
          getCandidateMe(),
          getCandidateMatches()
        ]);
        if (meRes.ok) {
          const cand = await meRes.json();
          setCandidate(cand);
        }
        if (matchesRes.ok) {
          const m = await matchesRes.json();
          setMatches(m.matches || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadInitialData();
  }, []);

  // ── Handlers ──────────────────────────────────────────────

  const handleRunOptimizer = async () => {
    if (!candidate) return;
    setOptimizerLoading(true);
    try {
      const res = await copilotOptimizeProfile({
        headline: candidate.headline || '',
        skills: candidate.skills || [],
        experience_years: candidate.experience_years || 0,
        github_verified: candidate.github_verified || false,
        leetcode_verified: candidate.leetcode_verified || false,
        has_video_pitch: candidate.has_video_pitch || false
      });
      if (res.ok) {
        setOptimizerData(await res.json());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setOptimizerLoading(false);
    }
  };

  const loadCoach = async () => {
    if (!candidate || coachData) return;
    setCoachLoading(true);
    try {
      const res = await copilotScoreCoach(candidate);
      if (res.ok) setCoachData(await res.json());
    } catch (e) { console.error(e); }
    finally { setCoachLoading(false); }
  };

  // Auto-load score coach when tab mounts
  useEffect(() => {
    if (activeTab === 'coach' && candidate && !coachData) {
      loadCoach();
    }
  }, [activeTab, candidate]);

  const handleAcceptOptimization = async () => {
    if (!optimizerData) return;
    // We apply added and removed skills
    let newSkills = [...(candidate.skills || [])];
    optimizerData.suggested_skills_to_add.forEach((s: string) => {
      if (!newSkills.includes(s)) newSkills.push(s);
    });
    optimizerData.suggested_skills_to_remove.forEach((s: string) => {
      newSkills = newSkills.filter(es => es !== s);
    });

    try {
      await updateCandidateMe({
        headline: optimizerData.suggested_headline,
        skills: newSkills
      });
      // Mock local state update
      setCandidate({
        ...candidate,
        headline: optimizerData.suggested_headline,
        skills: newSkills
      });
      setOptimizerData(null); // Clear suggestion
    } catch (e) {
      console.error(e);
    }
  };

  const handleGenerateQuestions = async () => {
    if (!candidate) return;
    setMockLoading(true);
    try {
      const res = await copilotMockInterview({
        skills: candidate.skills || [],
        difficulty: mockDifficulty
      });
      if (res.ok) {
        const d = await res.json();
        setMockData(d.questions || []);
      }
    } catch (e) { console.error(e); }
    finally { setMockLoading(false); }
  };

  // ── Render ────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Header title="AI Copilot" backTo="/candidate/dashboard" />
        <div className="flex items-center justify-center h-[60vh]">
          <div className="animate-spin w-8 h-8 rounded-full border-4 border-indigo-600 border-t-transparent"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col">
      <Header title="AI Copilot Hub" backTo="/candidate/dashboard" />
      
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col md:flex-row gap-8">
        
        {/* Sidebar */}
        <aside className="w-full md:w-64 flex-shrink-0 space-y-2">
          <button 
            onClick={() => setActiveTab('optimizer')}
            className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 transition-colors ${activeTab === 'optimizer' ? 'bg-indigo-600 text-white shadow-md' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-indigo-200'}`}
          >
            <Sparkles className="w-5 h-5" />
            <span className="font-semibold text-sm">Profile Optimizer</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('coach')}
            className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 transition-colors ${activeTab === 'coach' ? 'bg-indigo-600 text-white shadow-md' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-indigo-200'}`}
          >
            <Target className="w-5 h-5" />
            <span className="font-semibold text-sm">Score Coach</span>
          </button>

          <button 
            onClick={() => setActiveTab('mock')}
            className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 transition-colors ${activeTab === 'mock' ? 'bg-indigo-600 text-white shadow-md' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-indigo-200'}`}
          >
            <Bot className="w-5 h-5" />
            <span className="font-semibold text-sm">Mock Interview</span>
          </button>

          <button 
            onClick={() => setActiveTab('radar')}
            className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 transition-colors ${activeTab === 'radar' ? 'bg-indigo-600 text-white shadow-md' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-indigo-200'}`}
          >
            <Eye className="w-5 h-5" />
            <span className="font-semibold text-sm">Opportunity Radar</span>
          </button>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 min-w-0">
          
          {/* 1. Profile Optimizer */}
          {activeTab === 'optimizer' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 animate-in fade-in duration-300">
              <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                Profile Optimizer
              </h2>
              <p className="text-slate-500 mt-2 mb-8">Let Copilot analyze your profile and suggest high-impact improvements to help you stand out to technical recruiters.</p>
              
              {!optimizerData ? (
                <div className="flex flex-col items-center justify-center p-10 bg-slate-50 border border-slate-200 border-dashed rounded-xl">
                  <Sparkles className="w-10 h-10 text-indigo-400 mb-4" />
                  <p className="text-slate-600 font-medium mb-6 text-center">Ready to optimize your profile?</p>
                  <button 
                    onClick={handleRunOptimizer}
                    disabled={optimizerLoading}
                    className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-sm transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    {optimizerLoading ? <span className="animate-spin w-4 h-4 rounded-full border-2 border-white border-t-transparent"></span> : null}
                    {optimizerLoading ? 'Analyzing...' : 'Run Optimizer'}
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl">
                    <p className="text-sm font-semibold text-blue-900 flex items-center gap-2">
                      <Zap className="w-4 h-4 text-blue-600" /> Copilot's Reasoning
                    </p>
                    <p className="text-sm text-blue-800 mt-2">{optimizerData.reasoning}</p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Current */}
                    <div className="p-5 border border-slate-200 rounded-xl bg-slate-50">
                      <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Current</h3>
                      <div className="space-y-4">
                        <div>
                          <p className="text-xs text-slate-500 mb-1">Headline</p>
                          <p className="text-sm font-medium text-slate-800">{candidate.headline || "Not set"}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 mb-1">Skills</p>
                          <div className="flex flex-wrap gap-1.5">
                            {candidate.skills?.map((s: string) => <span key={s} className="px-2 py-0.5 border border-slate-300 rounded text-xs text-slate-600 bg-white">{s}</span>)}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Suggested */}
                    <div className="p-5 border border-indigo-200 rounded-xl bg-indigo-50/30">
                      <h3 className="text-xs font-bold uppercase tracking-widest text-indigo-500 mb-4 flex items-center gap-2">Suggested <Sparkles className="w-3.5 h-3.5" /></h3>
                      <div className="space-y-4">
                        <div>
                          <p className="text-xs text-slate-500 mb-1">Headline</p>
                          <p className="text-sm font-bold text-slate-900">{optimizerData.suggested_headline}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 mb-1">Skills Changes</p>
                          <div className="flex flex-wrap gap-1.5">
                            {optimizerData.suggested_skills_to_add.map((s: string) => <span key={`add-${s}`} className="px-2 py-0.5 border border-emerald-300 bg-emerald-50 text-emerald-700 rounded text-xs font-semibold">+ {s}</span>)}
                            {optimizerData.suggested_skills_to_remove.map((s: string) => <span key={`rm-${s}`} className="px-2 py-0.5 border border-red-300 bg-red-50 text-red-700 rounded text-xs line-through opacity-75">{s}</span>)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                    <button onClick={() => setOptimizerData(null)} className="px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl">Reject</button>
                    <button onClick={handleAcceptOptimization} className="px-5 py-2.5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm">Accept Changes</button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 2. Score Coach */}
          {activeTab === 'coach' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 animate-in fade-in duration-300">
              <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                Score Coach
              </h2>
              <p className="text-slate-500 mt-2 mb-8">Personalized action plan to hit your highest possible Pulse Score.</p>
              
              {coachLoading ? (
                 <div className="h-64 flex items-center justify-center text-indigo-600">
                    <span className="animate-spin w-8 h-8 rounded-full border-4 border-current border-t-transparent"></span>
                 </div>
              ) : coachData ? (
                <div className="space-y-8">
                  {/* Score Targets */}
                  <div className="flex items-center gap-8 p-6 bg-slate-50 border border-slate-200 rounded-2xl">
                    <div className="text-center">
                      <p className="text-sm font-semibold text-slate-500 uppercase tracking-widest">Current</p>
                      <p className="text-4xl font-black text-slate-900">{coachData.current_score}</p>
                    </div>
                    <div className="flex-1 flex items-center">
                      <div className="w-full h-2 bg-slate-200 rounded-full relative overflow-hidden">
                        <div className="absolute left-0 top-0 bottom-0 bg-indigo-500" style={{ width: `${(coachData.current_score / coachData.target_score) * 100}%` }}></div>
                      </div>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-semibold text-indigo-500 uppercase tracking-widest">Target</p>
                      <p className="text-4xl font-black text-indigo-600">{coachData.target_score}</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-bold text-slate-900 uppercase">Action Plan</h3>
                    {coachData.actions.length === 0 ? (
                      <p className="text-emerald-600 font-bold bg-emerald-50 border border-emerald-200 p-4 rounded-xl flex items-center gap-2"><CheckCircle2 className="w-5 h-5"/> You're maxed out! Perfect score.</p>
                    ) : coachData.actions.map((act: any, idx: number) => (
                      <div key={idx} className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border border-slate-200 rounded-xl hover:border-indigo-300 transition-colors">
                        <div>
                          <p className="font-bold text-slate-900">{act.action}</p>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-xs font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-700">{act.difficulty}</span>
                            <span className="text-sm font-medium text-emerald-600">Impact: {act.impact}</span>
                          </div>
                        </div>
                        <Link href="/candidate/onboarding" className="px-5 py-2 whitespace-nowrap bg-indigo-50 text-indigo-700 font-bold text-sm rounded-xl hover:bg-indigo-100 transition-colors">
                          Do it now
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          )}

          {/* 3. Mock Interview */}
          {activeTab === 'mock' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 animate-in fade-in duration-300">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">Mock Interview Setup</h2>
                  <p className="text-slate-500 mt-1">Generate AI technical questions tailored perfectly to your skills.</p>
                </div>
                <Link href="/candidate/prep" className="px-4 py-2 border border-slate-200 font-bold text-sm text-slate-700 hover:bg-slate-50 rounded-xl flex items-center gap-2 shrink-0">
                  Full Screen Experience <ChevronRight className="w-4 h-4"/>
                </Link>
              </div>

              {mockData.length === 0 ? (
                 <div className="p-6 bg-slate-50 border border-slate-200 rounded-xl space-y-5">
                   <div className="space-y-2">
                     <label className="text-sm font-semibold text-slate-700">Select Difficulty</label>
                     <div className="flex gap-2">
                       {['easy', 'medium', 'hard'].map(level => (
                         <button 
                            key={level}
                            onClick={() => setMockDifficulty(level as any)}
                            className={`flex-1 py-3 text-sm font-bold uppercase tracking-wider rounded-xl border transition-all ${mockDifficulty === level ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'}`}
                         >
                           {level}
                         </button>
                       ))}
                     </div>
                   </div>
                   <button 
                     onClick={handleGenerateQuestions}
                     disabled={mockLoading}
                     className="w-full py-4 rounded-xl font-bold bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                   >
                     {mockLoading && <span className="animate-spin w-5 h-5 rounded-full border-2 border-white border-t-transparent"></span>}
                     {mockLoading ? 'Generating your interview...' : 'Generate Questions'}
                   </button>
                 </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between px-2 mb-4">
                    <h3 className="font-bold text-slate-900">Your practice questions</h3>
                    <button onClick={() => setMockData([])} className="text-sm font-semibold text-indigo-600 hover:text-indigo-800">Reset</button>
                  </div>
                  {mockData.map((q: any, i: number) => (
                    <div key={i} className="border border-slate-200 rounded-xl overflow-hidden bg-white">
                      <button 
                        onClick={() => setExpandedQ(expandedQ === i ? null : i)}
                        className="w-full p-4 flex items-center justify-between bg-slate-50 hover:bg-slate-100 transition-colors text-left"
                      >
                        <div className="pr-4">
                          <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-1 block">{q.category}</span>
                          <span className="text-sm font-semibold text-slate-900">{q.question}</span>
                        </div>
                        <ChevronDown className={`w-5 h-5 text-slate-400 transform transition-transform shrink-0 ${expandedQ === i ? 'rotate-180' : ''}`} />
                      </button>
                      
                      {expandedQ === i && (
                        <div className="p-5 border-t border-slate-100 space-y-4 bg-white animate-in slide-in-from-top-2 duration-200">
                          <div>
                            <p className="text-xs font-bold uppercase text-slate-400 mb-2">Hints</p>
                            <ul className="list-disc pl-5 text-sm text-slate-600 space-y-1">
                              {q.hints.map((h: string, hi: number) => <li key={hi}>{h}</li>)}
                            </ul>
                          </div>
                          <div>
                            <p className="text-xs font-bold uppercase text-slate-400 mb-2">Ideal Answer Points</p>
                            <ul className="list-disc pl-5 text-sm text-emerald-700 bg-emerald-50 rounded-lg p-3 space-y-1 border border-emerald-100">
                              {q.ideal_answer_points.map((ap: string, api: number) => <li key={api}>{ap}</li>)}
                            </ul>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 4. Opportunity Radar */}
          {activeTab === 'radar' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 animate-in fade-in duration-300">
              <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2 mb-8">
                Opportunity Radar
              </h2>
              
              {matches.length === 0 ? (
                <div className="text-center py-12 bg-slate-50 border border-slate-200 border-dashed rounded-xl">
                  <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Eye className="w-6 h-6 text-slate-400" />
                  </div>
                  <p className="text-slate-600 font-medium">No matches yet. Come back later as recruiters post new tech roles.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-6">
                  {matches.map((m) => (
                    <div key={m.id} className="border border-slate-200 rounded-2xl p-6 hover:shadow-md transition-all">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-bold text-slate-900">Senior Developer Role</h3>
                          <p className="text-slate-500 text-sm">Fintech Company • San Francisco / Remote</p>
                        </div>
                        <span className="px-3 py-1.5 bg-green-100 text-green-700 rounded-full font-bold text-sm whitespace-nowrap">
                          {m.match_score}% Match
                        </span>
                      </div>
                      
                      <div className="bg-slate-50 rounded-xl p-4 mt-4 space-y-4 border border-slate-100">
                        <div>
                          <p className="text-xs font-bold uppercase text-slate-400 mb-2">Skills You Match</p>
                          <div className="flex flex-wrap gap-1.5">
                            {m.matched_skills.map((s: string) => (
                               <span key={`m-${s}`} className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-semibold text-xs border border-emerald-200">{s}</span>
                            ))}
                          </div>
                        </div>
                        
                        {m.missing_skills?.length > 0 && (
                          <div>
                            <p className="text-xs font-bold uppercase text-slate-400 mb-2">Skills Missing</p>
                            <div className="flex flex-wrap gap-1.5">
                              {m.missing_skills.map((s: string) => (
                                 <span key={`miss-${s}`} className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded font-semibold text-xs border border-slate-200">{s}</span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
