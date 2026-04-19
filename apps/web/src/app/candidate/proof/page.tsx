'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Github, 
  FileText, 
  Mic, 
  Award, 
  Video, 
  ChevronRight, 
  Star, 
  Plus, 
  Trash2, 
  Share2, 
  Play, 
  RefreshCcw, 
  Sparkles, 
  Check, 
  X,
  Loader2,
  Clock,
  ExternalLink,
  Target,
} from 'lucide-react';
import { Header } from '@pulse/ui';
import { 
  getMyGithubRepos, 
  updateGithubRepo, 
  copilotGenerateReadme,
  getMyCaseStudies,
  createCaseStudy,
  deleteCaseStudy,
  copilotStructureCaseStudy,
  getUploadUrl,
  getMyMockInterviews,
  generateInterviewShareToken,
  getMySkillAssessments,
  copilotStartAssessment,
  copilotGradeAssessment,
  submitSkillAssessment,
  getMyVideoPitch,
  upsertVideoPitch,
  copilotTranscribeVideo,
  getCandidateMe
} from '@/lib/api';

// ── Types ──────────────────────────────────────────────────

type TabType = 'github' | 'cases' | 'interviews' | 'skills' | 'video';

// ── Components ─────────────────────────────────────────────

export default function ProofBuilderPage() {
  const [activeTab, setActiveTab] = useState<TabType>('github');
  const [candidateScore, setCandidateScore] = useState<number>(0);

  useEffect(() => {
    const fetchScore = async () => {
      const res = await getCandidateMe();
      if (res.ok) {
        const data = await res.json();
        setCandidateScore(data.pulse_score);
      }
    };
    fetchScore();
  }, [activeTab]); // Refresh score when switching tabs (which might have updated it)

  const tabs = [
    { id: 'github', label: 'GitHub Showcase', icon: Github },
    { id: 'cases', label: 'Case Studies', icon: FileText },
    { id: 'interviews', label: 'Mock Interviews', icon: Mic },
    { id: 'skills', label: 'Skill Assessments', icon: Award },
    { id: 'video', label: 'Video Pitch', icon: Video },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Header title="Proof Builder" backTo="/candidate/dashboard" />
      
      <main className="flex-1 flex flex-col md:flex-row max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 gap-8">
        {/* Sidebar Navigation */}
        <aside className="w-full md:w-64 flex-shrink-0">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-4 sticky top-24">
            <div className="mb-6 px-4 py-3 bg-indigo-50 rounded-2xl border border-indigo-100 text-center">
              <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Pulse Score</p>
              <p className="text-3xl font-black text-indigo-600">{candidateScore}<span className="text-indigo-300 text-sm">/150</span></p>
            </div>
            
            <nav className="space-y-1">
              {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as TabType)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                      isActive 
                        ? 'bg-slate-900 text-white shadow-lg shadow-slate-200' 
                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                    {isActive && <ChevronRight className="ml-auto w-3 h-3 opacity-50" />}
                  </button>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* Main Content Area */}
        <section className="flex-1 min-w-0 pb-20">
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {activeTab === 'github' && <GithubTab />}
            {activeTab === 'cases' && <CaseStudiesTab />}
            {activeTab === 'interviews' && <InterviewsTab />}
            {activeTab === 'skills' && <AssessmentsTab />}
            {activeTab === 'video' && <VideoPitchTab />}
          </div>
        </section>
      </main>
    </div>
  );
}

// ── Tab 1: GitHub Showcase ──────────────────────────────────

function GithubTab() {
  const [repos, setRepos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [readmePreview, setReadmePreview] = useState<{ id: string, markdown: string } | null>(null);
  const [generating, setGenerating] = useState<string | null>(null);

  const fetchRepos = async () => {
    setLoading(true);
    const res = await getMyGithubRepos();
    if (res.ok) setRepos(await res.json());
    setLoading(false);
  };

  useEffect(() => { fetchRepos(); }, []);

  const toggleFeatured = async (id: string, current: boolean) => {
    await updateGithubRepo(id, { is_featured: !current });
    setRepos(prev => prev.map(r => r.id === id ? { ...r, is_featured: !current } : r));
  };

  const handleGenerateReadme = async (id: string, url: string) => {
    setGenerating(id);
    const res = await copilotGenerateReadme(url);
    if (res.ok) {
      const data = await res.json();
      setReadmePreview({ id, markdown: data.markdown });
    }
    setGenerating(null);
  };

  const acceptReadme = async () => {
    if (!readmePreview) return;
    await updateGithubRepo(readmePreview.id, { ai_generated_readme: readmePreview.markdown });
    setRepos(prev => prev.map(r => r.id === readmePreview.id ? { ...r, ai_generated_readme: readmePreview.markdown } : r));
    setReadmePreview(null);
  };

  if (loading) return <LoaderWidget />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-slate-900">GitHub Showcase</h2>
          <p className="text-slate-500 text-sm">Feature your best work and enhance them with AI-generated READMEs.</p>
        </div>
        <button onClick={fetchRepos} className="p-2 text-slate-400 hover:text-slate-900 transition-colors">
          <RefreshCcw className="w-5 h-5" />
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {repos.map(repo => (
          <div key={repo.id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-indigo-200 transition-colors">
            <div className="space-y-4 flex-1">
              <div className="flex items-center gap-2">
                <Github className="w-5 h-5 text-slate-900" />
                <h3 className="text-lg font-black text-slate-900">{repo.repo_name}</h3>
                {repo.is_featured && (
                  <span className="flex items-center gap-1 px-2 py-0.5 bg-indigo-600 text-white rounded-full text-[10px] font-black uppercase tracking-tighter">
                    <Star className="w-2.5 h-2.5 fill-current" /> Featured
                  </span>
                )}
              </div>
              
              <div className="flex flex-wrap gap-2">
                {repo.inferred_skills?.map((s: string) => (
                  <span key={s} className="px-2.5 py-1 bg-slate-50 border border-slate-100 rounded-lg text-xs font-bold text-slate-500">{s}</span>
                ))}
              </div>

              <div className="flex items-center gap-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <span className="flex items-center gap-1.5"><Star className="w-3 h-3" /> {repo.stars} Stars</span>
                <span className="flex items-center gap-1.5"><RefreshCcw className="w-3 h-3" /> {repo.commit_count_30d || 0} Commits (30d)</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 flex-shrink-0">
              <button
                onClick={() => toggleFeatured(repo.id, repo.is_featured)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all ${
                  repo.is_featured 
                    ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' 
                    : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-100'
                }`}
              >
                {repo.is_featured ? 'Unfeature' : 'Feature Repo'}
              </button>
              
              <button
                disabled={generating === repo.id}
                onClick={() => handleGenerateReadme(repo.id, repo.repo_url)}
                className="flex items-center gap-2 px-4 py-2 border-2 border-slate-100 text-slate-600 rounded-xl text-xs font-black hover:border-indigo-500 hover:text-indigo-600 transition-all disabled:opacity-50"
              >
                {generating === repo.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                {repo.ai_generated_readme ? 'Update README' : 'AI README'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* README Preview Modal */}
      {readmePreview && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">Generated README</h3>
                  <p className="text-slate-400 text-xs font-bold">Preview your AI-enhanced project documentation</p>
                </div>
              </div>
              <button onClick={() => setReadmePreview(null)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-8 bg-slate-50">
              <div className="prose prose-slate prose-sm max-w-none bg-white p-8 rounded-2xl border border-slate-200 whitespace-pre-wrap font-mono text-xs text-slate-600 leading-relaxed">
                {readmePreview.markdown}
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 flex justify-end gap-3">
              <button 
                onClick={() => { navigator.clipboard.writeText(readmePreview.markdown); }}
                className="px-6 py-2.5 text-xs font-black text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors"
              >
                Copy Content
              </button>
              <button 
                onClick={acceptReadme}
                className="px-6 py-2.5 text-xs font-black text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-colors"
              >
                Accept & Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Tab 2: Case Studies ────────────────────────────────────

function CaseStudiesTab() {
  const [studies, setStudies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', skills: [] as string[] });
  const [uploading, setUploading] = useState(false);
  const [structuring, setStructuring] = useState(false);

  const fetchStudies = async () => {
    setLoading(true);
    const res = await getMyCaseStudies();
    if (res.ok) setStudies(await res.json());
    setLoading(false);
  };

  useEffect(() => { fetchStudies(); }, []);

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this case study?')) {
      await deleteCaseStudy(id);
      setStudies(prev => prev.filter(s => s.id !== id));
    }
  };

  const handleCreate = async () => {
    if (!form.title) return;
    setUploading(true);
    // Note: In real app, we'd handle file upload to storage here. 
    // Mocking the creation with base data as requested.
    const res = await createCaseStudy(form);
    if (res.ok) {
      await fetchStudies();
      setShowAddModal(false);
      setForm({ title: '', description: '', skills: [] });
    }
    setUploading(false);
  };

  if (loading) return <LoaderWidget />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-slate-900">Case Studies</h2>
          <p className="text-slate-500 text-sm">Document your technical journey and professional achievements.</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl text-sm font-black hover:bg-slate-800 transition-all shadow-lg shadow-slate-200"
        >
          <Plus className="w-5 h-5" />
          Add Case Study
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {studies.length === 0 && (
          <div className="sm:col-span-2 py-20 text-center space-y-4 bg-white rounded-3xl border border-dashed border-slate-200">
            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto text-slate-300">
              <FileText className="w-8 h-8" />
            </div>
            <p className="text-slate-400 font-bold text-sm italic">No case studies added yet.</p>
          </div>
        )}
        {studies.map(study => (
          <div key={study.id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col gap-6 hover:shadow-md transition-all group">
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <h3 className="text-lg font-black text-slate-900 leading-tight">{study.title}</h3>
                <button onClick={() => handleDelete(study.id)} className="p-2 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <p className="text-slate-500 text-sm line-clamp-3 leading-relaxed">{study.description}</p>
            </div>

            <div className="flex flex-wrap gap-2">
              {study.skills?.map((s: string) => (
                <span key={s} className="px-2 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-black uppercase tracking-wider">{s}</span>
              ))}
            </div>

            <div className="mt-auto pt-4 border-t border-slate-50 flex items-center justify-between">
              {study.file_url ? (
                 <a href={study.file_url} className="text-xs font-black text-slate-400 hover:text-indigo-600 flex items-center gap-1">
                   <ExternalLink className="w-3 h-3" /> View Document
                 </a>
              ) : <div />}
              <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{new Date(study.created_at).toLocaleDateString()}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 space-y-6 animate-in fade-in zoom-in-95">
            <h3 className="text-xl font-black text-slate-900">New Case Study</h3>
            
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Title</label>
                <input 
                  type="text"
                  placeholder="e.g. Scaling Auth with Redis"
                  value={form.title}
                  onChange={e => setForm({...form, title: e.target.value})}
                  className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-indigo-500/20 outline-none font-medium"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Description</label>
                <textarea 
                  rows={4}
                  placeholder="What problem did you solve?"
                  value={form.description}
                  onChange={e => setForm({...form, description: e.target.value})}
                  className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-indigo-500/20 outline-none font-medium text-sm"
                />
              </div>

              <div className="p-6 border-4 border-dashed border-slate-100 rounded-3xl text-center space-y-2">
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">File Upload (PDF/DOC)</p>
                <p className="text-[10px] text-slate-300">Max size: 10MB</p>
                <button className="text-xs font-black text-indigo-600 hover:text-indigo-700">Choose File</button>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button onClick={() => setShowAddModal(false)} className="flex-1 py-3 text-sm font-black text-slate-500 bg-slate-100 rounded-2xl hover:bg-slate-200">Cancel</button>
              <button 
                onClick={handleCreate}
                disabled={uploading || !form.title}
                className="flex-1 py-3 text-sm font-black text-white bg-slate-900 rounded-2xl hover:bg-slate-800 shadow-lg shadow-slate-200"
              >
                {uploading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Sace Case Study'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Shared Widgets ──────────────────────────────────────────

function LoaderWidget() {
  return (
    <div className="py-20 flex flex-col items-center justify-center space-y-4">
      <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
      <p className="text-slate-400 text-sm font-bold animate-pulse">Fetching verification data...</p>
    </div>
  );
}

// ── Tab 3: Mock Interview Library ─────────────────────────

function InterviewsTab() {
  const [interviews, setInterviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchInterviews = async () => {
    setLoading(true);
    const res = await getMyMockInterviews();
    if (res.ok) setInterviews(await res.json());
    setLoading(false);
  };

  useEffect(() => { fetchInterviews(); }, []);

  const toggleShare = async (id: string, current: string | null) => {
    if (current) {
      setInterviews(prev => prev.map(i => i.id === id ? { ...i, shareable_token: null } : i));
      return;
    }
    const res = await generateInterviewShareToken(id);
    if (res.ok) {
      const data = await res.json();
      setInterviews(prev => prev.map(i => i.id === id ? { ...i, shareable_token: data.shareable_token } : i));
    }
  };

  if (loading) return <LoaderWidget />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-slate-900">Interview Library</h2>
          <p className="text-slate-500 text-sm">Review your performance and share your best interviews with recruiters.</p>
        </div>
        <a 
          href="/candidate/prep"
          className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl text-sm font-black hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
        >
          <Mic className="w-5 h-5" />
          Start New Prep
        </a>
      </div>

      <div className="space-y-4">
        {interviews.length === 0 && (
          <div className="py-20 text-center space-y-4 bg-white rounded-3xl border border-dashed border-slate-200">
             <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto text-slate-300">
               <Mic className="w-8 h-8" />
             </div>
             <p className="text-slate-400 font-bold text-sm italic">No interviews recorded yet.</p>
          </div>
        )}
        {interviews.map(i => (
          <div key={i.id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              <div className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center font-black ${
                (i.overall_score || 0) >= 80 ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-600'
              }`}>
                <span className="text-xs opacity-50 uppercase tracking-tighter">Score</span>
                <span className="text-lg">{i.overall_score || '--'}</span>
              </div>
              
              <div className="space-y-1">
                <h3 className="font-black text-slate-900">{i.role_title}</h3>
                <div className="flex items-center gap-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <span className={`px-2 py-0.5 rounded-md ${
                    i.difficulty === 'hard' ? 'bg-red-50 text-red-500' : i.difficulty === 'medium' ? 'bg-amber-50 text-amber-500' : 'bg-blue-50 text-blue-500'
                  }`}>{i.difficulty}</span>
                  <span>{new Date(i.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button className="text-xs font-black text-slate-400 hover:text-slate-900 transition-colors">View Transcript</button>
              
              <div className="h-8 w-px bg-slate-100 hidden md:block" />

              <div className="flex items-center gap-3">
                <div className="flex flex-col items-end">
                   <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Share with recruiters</span>
                   {i.shareable_token && <span className="text-[9px] font-mono text-emerald-500">Token: {i.shareable_token}</span>}
                </div>
                <button 
                  onClick={() => toggleShare(i.id, i.shareable_token)}
                  className={`w-12 h-6 rounded-full relative transition-all ${
                    i.shareable_token ? 'bg-emerald-500' : 'bg-slate-200'
                  }`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${
                    i.shareable_token ? 'left-7' : 'left-1'
                  }`} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Tab 4: Skill Assessments ───────────────────────────────

function AssessmentsTab() {
  const [assessments, setAssessments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeAssessment, setActiveAssessment] = useState<{ skill: string, questions: any[] } | null>(null);
  const [userSkills, setUserSkills] = useState<string[]>([]);
  const [showSkillSelect, setShowSkillSelect] = useState(false);

  const fetchAssessments = async () => {
    setLoading(true);
    const res = await getMySkillAssessments();
    if (res.ok) setAssessments(await res.json());

    const meRes = await getCandidateMe();
    if (meRes.ok) {
       const user = await meRes.json();
       setUserSkills(user.skills || []);
    }
    setLoading(false);
  };

  useEffect(() => { fetchAssessments(); }, []);

  const startAssessment = async (skill: string) => {
    setShowSkillSelect(false);
    setLoading(true);
    const res = await copilotStartAssessment(skill);
    if (res.ok) {
      const data = await res.json();
      setActiveAssessment({ skill, questions: data.questions });
    }
    setLoading(false);
  };

  if (activeAssessment) {
    return (
      <AssessmentRunner 
        skill={activeAssessment.skill} 
        questions={activeAssessment.questions} 
        onComplete={() => { setActiveAssessment(null); fetchAssessments(); }} 
      />
    );
  }

  if (loading) return <LoaderWidget />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-slate-900">Skill Assessments</h2>
          <p className="text-slate-500 text-sm">Pass AI-proctored evaluations to earn verified badges.</p>
        </div>
        <button 
          onClick={() => setShowSkillSelect(true)}
          className="flex items-center gap-2 px-6 py-3 bg-amber-500 text-white rounded-2xl text-sm font-black hover:bg-amber-600 transition-all shadow-lg shadow-amber-100"
        >
          <Award className="w-5 h-5" />
          Take Assessment
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {assessments.length === 0 && (
           <div className="sm:col-span-3 py-20 text-center space-y-4 bg-white rounded-3xl border border-dashed border-slate-200">
              <Award className="w-12 h-12 text-slate-200 mx-auto" />
              <p className="text-slate-400 font-bold text-sm">No assessments passed yet.</p>
           </div>
        )}
        {assessments.map(a => (
          <div key={a.id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm border-b-4 border-b-emerald-400 space-y-4">
            <div className="flex items-center justify-between">
               <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
                 <Check className="w-5 h-5 text-emerald-600" />
               </div>
               <div className="text-right">
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Verified Score</p>
                 <p className="text-xl font-black text-slate-900">{a.score}%</p>
               </div>
            </div>
            <h3 className="text-lg font-black text-slate-900">{a.skill}</h3>
            <div className="flex items-center justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest">
              <span>{new Date(a.created_at).toLocaleDateString()}</span>
              <span>10 Questions</span>
            </div>
          </div>
        ))}
      </div>

      {showSkillSelect && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
           <div className="bg-white rounded-3xl p-8 w-full max-w-sm space-y-6">
              <div className="space-y-1">
                <h3 className="text-xl font-black text-slate-900">Select Skill</h3>
                <p className="text-slate-500 text-sm">Which skill do you want to verify?</p>
              </div>
              <div className="flex flex-wrap gap-2">
                 {userSkills.map(s => (
                   <button 
                    key={s} 
                    onClick={() => startAssessment(s)}
                    className="px-4 py-2 bg-slate-50 border-2 border-slate-100 rounded-xl text-sm font-bold text-slate-700 hover:border-indigo-500 transition-all"
                   >
                     {s}
                   </button>
                 ))}
              </div>
              <button onClick={() => setShowSkillSelect(false)} className="w-full py-3 bg-slate-100 rounded-xl text-sm font-black text-slate-500">Cancel</button>
           </div>
        </div>
      )}
    </div>
  );
}

/**
 * The Timed Assessment UI
 */
function AssessmentRunner({ skill, questions, onComplete }: { skill: string, questions: any[], onComplete: () => void }) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState(30);
  const [grading, setGrading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const question = questions[currentIdx];

  useEffect(() => {
    if (result) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handleNext(); // Auto-next if time runs out
          return 30;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [currentIdx, result]);

  const handleNext = async (selectedOption?: string) => {
    if (selectedOption) {
      setAnswers(prev => ({ ...prev, [question.id]: selectedOption }));
    }

    if (currentIdx < questions.length - 1) {
      setCurrentIdx(currentIdx + 1);
      setTimeLeft(30);
    } else {
      // Final submission
      setGrading(true);
      const res = await copilotGradeAssessment(skill, answers);
      if (res.ok) {
        const gradeRes = await res.json();
        setResult(gradeRes);
        // Save to DB
        await submitSkillAssessment({
          skill,
          score: gradeRes.score,
          verified_by_ai: true,
          transcript: gradeRes.transcript
        });
      }
      setGrading(false);
    }
  };

  if (result) {
    return (
      <div className="max-w-md mx-auto bg-white rounded-3xl p-10 border border-slate-200 text-center space-y-6 shadow-xl">
        <div className={`w-20 h-20 rounded-full mx-auto flex items-center justify-center text-3xl ${
          result.score >= 70 ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'
        }`}>
          <Award className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <h3 className="text-2xl font-black text-slate-900">{result.score >= 70 ? 'Assessment Passed!' : 'Needs More Prep'}</h3>
          <p className="text-slate-500 text-sm">{result.feedback}</p>
        </div>
        <div className="p-4 bg-slate-50 rounded-2xl">
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Final Score</p>
           <p className="text-4xl font-black text-slate-900">{result.score}%</p>
        </div>
        <button onClick={onComplete} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black shadow-lg shadow-slate-200 transition-all active:scale-95">Back to Dashboard</button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Question {currentIdx + 1} of {questions.length}</span>
          <h2 className="text-xl font-black text-slate-900">{skill} Assessment</h2>
        </div>
        <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 font-mono font-black ${
          timeLeft <= 10 ? 'border-red-100 bg-red-50 text-red-500 animate-pulse' : 'border-slate-100 bg-white text-slate-600'
        }`}>
          <Clock className="w-4 h-4" />
          00:{timeLeft.toString().padStart(2, '0')}
        </div>
      </div>

      <div className="bg-white p-10 rounded-3xl border border-slate-200 shadow-xl space-y-8">
        <p className="text-lg font-bold text-slate-900 leading-relaxed">{question.question}</p>
        
        <div className="grid grid-cols-1 gap-4">
          {question.options.map((opt: string) => (
            <button 
              key={opt}
              onClick={() => handleNext(opt)}
              className="w-full text-left p-4 rounded-2xl border-2 border-slate-100 text-slate-600 font-bold hover:border-indigo-500 hover:bg-slate-50 transition-all flex items-center justify-between group"
            >
              {opt}
              <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all" />
            </button>
          ))}
        </div>
      </div>

      {grading && (
        <div className="fixed inset-0 z-[100] bg-slate-900/80 backdrop-blur-md flex items-center justify-center px-4">
           <div className="text-center space-y-4">
             <Loader2 className="w-12 h-12 text-white animate-spin mx-auto" />
             <p className="text-white font-black text-xl tracking-tight">AI is evaluating your responses...</p>
           </div>
        </div>
      )}
    </div>
  );
}
// ── Tab 5: Video Pitch ─────────────────────────────────────

function VideoPitchTab() {
  const [pitch, setPitch] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [recording, setRecording] = useState(false);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
  const [uploading, setUploading] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const fetchPitch = async () => {
    setLoading(true);
    const res = await getMyVideoPitch();
    if (res.ok) setPitch(await res.json());
    setLoading(false);
  };

  useEffect(() => { fetchPitch(); }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setMediaStream(stream);
      if (videoRef.current) videoRef.current.srcObject = stream;
      
      const recorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) setRecordedChunks(prev => [...prev, e.data]);
      };
      recorder.start();
      setMediaRecorder(recorder);
      setRecording(true);
      setRecordedChunks([]);
    } catch (err) {
      console.error('Media access error', err);
    }
  };

  const stopRecording = () => {
    mediaRecorder?.stop();
    mediaStream?.getTracks().forEach(track => track.stop());
    setRecording(false);
  };

  const handleUpload = async () => {
    if (recordedChunks.length === 0) return;
    setUploading(true);
    try {
      const blob = new Blob(recordedChunks, { type: 'video/webm' });
      const fileName = `proof_pitch_${Date.now()}.webm`;
      
      const signRes = await getUploadUrl('video-pitches', fileName, 'video/webm');
      if (!signRes.ok) throw new Error('Sign failed');
      const { signedUrl, path } = await signRes.json();

      await fetch(signedUrl, {
        method: 'PUT',
        body: blob,
        headers: { 'Content-Type': 'video/webm' }
      });

      await upsertVideoPitch({ video_url: path });
      await fetchPitch();
    } catch (err) {
      console.error('Video upload failed', err);
    } finally {
      setUploading(false);
    }
  };

  const handleTranscribe = async () => {
    if (!pitch?.video_url) return;
    setTranscribing(true);
    const res = await copilotTranscribeVideo(pitch.video_url);
    if (res.ok) {
       // Mock update since real Whisper is out of scope
       await upsertVideoPitch({ video_url: pitch.video_url, transcript: "This is a mocked transcript for your pitch." });
       await fetchPitch();
    }
    setTranscribing(false);
  };

  if (loading) return <LoaderWidget />;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-slate-900">Video Pitch</h2>
          <p className="text-slate-500 text-sm">A 60-second video elevator pitch for recruiters.</p>
        </div>
        {!recording && (
          <button 
            onClick={startRecording}
            className="flex items-center gap-2 px-6 py-3 bg-rose-500 text-white rounded-2xl text-sm font-black hover:bg-rose-600 transition-all shadow-lg shadow-rose-100"
          >
            <Video className="w-5 h-5" />
            {pitch ? 'Re-record Pitch' : 'Record Pitch'}
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Player */}
        <div className="lg:col-span-2 space-y-6">
          <div className="aspect-video bg-slate-900 rounded-3xl overflow-hidden border-4 border-white shadow-2xl relative group">
            {pitch?.video_url ? (
              <video 
                src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/video-pitches/${pitch.video_url}`}
                controls
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 space-y-4">
                 <Video className="w-12 h-12 opacity-20" />
                 <p className="font-bold text-sm italic">No video pitch recorded yet.</p>
              </div>
            )}
          </div>

          {pitch && (
             <div className="bg-white p-8 rounded-3xl border border-slate-200 space-y-4">
                <div className="flex items-center justify-between">
                   <div className="flex items-center gap-2">
                     <FileText className="w-4 h-4 text-indigo-500" />
                     <span className="text-sm font-black text-slate-900">Transcription</span>
                   </div>
                   {!pitch.transcript && (
                     <button 
                      onClick={handleTranscribe}
                      disabled={transcribing}
                      className="text-xs font-black text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                     >
                       {transcribing ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                       Generate Transcript
                     </button>
                   )}
                </div>
                {pitch.transcript ? (
                  <p className="text-sm text-slate-500 leading-relaxed italic">&ldquo;{pitch.transcript}&rdquo;</p>
                ) : (
                  <p className="text-sm text-slate-300 italic">No transcript generated yet.</p>
                )}
             </div>
          )}
        </div>

        {/* Tips / Score Card */}
        <div className="space-y-6">
           <div className="bg-indigo-900 text-white p-6 rounded-3xl shadow-xl space-y-4 relative overflow-hidden">
              <div className="relative z-10 flex items-center gap-3">
                 <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
                    <Award className="w-5 h-5" />
                 </div>
                 <span className="font-black">Impact</span>
              </div>
              <p className="text-xs text-indigo-200 leading-relaxed font-medium relative z-10">
                A verified video pitch with transcription adds **+20 points** to your Pulse Score and increases recruiter engagement by **3.5x**.
              </p>
              <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-white/5 rounded-full blur-3xl" />
           </div>

           <div className="bg-white p-6 rounded-3xl border border-slate-200 space-y-4">
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Pitch Tips</h4>
              <ul className="space-y-3">
                {[
                  'State your current role and years of exp',
                  'Highlight your most impactful project',
                  'Mention what technologies you love',
                  'Keep it professional but show personality'
                ].map((tip, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-xs font-bold text-slate-600">
                    <div className="w-5 h-5 bg-slate-50 rounded flex-shrink-0 flex items-center justify-center text-[10px] text-slate-400 font-black">{idx+1}</div>
                    {tip}
                  </li>
                ))}
              </ul>
           </div>
        </div>
      </div>

      {/* Recorder Modal */}
      {recording && (
        <div className="fixed inset-0 z-50 bg-slate-900/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-white/10 rounded-3xl max-w-lg w-full p-6 space-y-6 text-center shadow-2xl">
            <div className="aspect-video bg-black rounded-2xl overflow-hidden relative border border-white/5">
              <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
              <div className="absolute top-4 right-4 flex items-center gap-2 px-3 py-1 bg-red-600 text-white text-[10px] font-black rounded-full animate-pulse">
                <div className="w-2 h-2 bg-white rounded-full" />
                REC
              </div>
            </div>
            
            <div className="flex items-center justify-center gap-4">
              {!mediaRecorder || mediaRecorder.state === 'inactive' ? (
                <div className="flex gap-4">
                   <button onClick={startRecording} className="px-8 py-3 bg-white text-slate-900 rounded-xl font-black active:scale-95 transition-all">Start Over</button>
                   <button 
                    onClick={handleUpload} 
                    disabled={uploading}
                    className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-black flex items-center gap-2 active:scale-95 transition-all"
                   >
                     {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                     Use This
                   </button>
                </div>
              ) : (
                <button 
                  onClick={stopRecording}
                  className="px-12 py-4 bg-red-600 rounded-2xl text-white font-black flex items-center gap-3 animate-pulse active:scale-95 transition-all"
                >
                  <div className="w-3 h-3 bg-white rounded-sm" />
                  Stop Recording
                </button>
              )}
            </div>
            
            <button onClick={() => { stopRecording(); setRecording(false); }} className="text-xs font-bold text-white/40 hover:text-white transition-colors">Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}
