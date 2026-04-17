'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@pulse/ui';
import { copilotMockInterview, getCandidateMe } from '@/lib/api';
import { CheckCircle2, ChevronRight, PlayCircle, Loader2, Target, Code2, AlertCircle } from 'lucide-react';

export default function MockInterviewPrep() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [candidate, setCandidate] = useState<any>(null);

  const [questions, setQuestions] = useState<any[]>([]);
  const [curIndex, setCurIndex] = useState(0);
  
  // States
  const [generating, setGenerating] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);

  // Setup
  const [difficulty, setDifficulty] = useState<'easy'|'medium'|'hard'>('medium');

  useEffect(() => {
    async function init() {
      try {
        const req = await getCandidateMe();
        if (req.ok) {
           setCandidate(await req.json());
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  const startSession = async () => {
    if (!candidate) return;
    setGenerating(true);
    try {
      const res = await copilotMockInterview({
        skills: candidate.skills || [],
        difficulty: difficulty
      });
      if (res.ok) {
        const d = await res.json();
        setQuestions(d.questions || []);
        setCurIndex(0);
        setShowAnswer(false);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
     return <div className="min-h-screen bg-slate-900 flex justify-center items-center"><Loader2 className="w-8 h-8 text-indigo-500 animate-spin" /></div>
  }

  // Configuration View
  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-300 font-sans flex flex-col">
        <Header title="Prep Mode" backTo="/candidate/copilot" />
        <main className="flex-1 flex items-center justify-center p-6">
          <div className="bg-slate-800 border border-slate-700 p-8 rounded-3xl max-w-lg w-full text-center shadow-2xl">
            <div className="w-16 h-16 bg-indigo-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
               <Code2 className="w-8 h-8 text-indigo-400" />
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight mb-2">Mock Interview</h1>
            <p className="text-slate-400 mb-8">We will test your foundational knowledge relative to your stack ({candidate?.skills?.slice(0,3).join(", ")}).</p>
            
            <div className="flex bg-slate-900 p-1.5 rounded-xl border border-slate-700 mb-8">
               {['easy', 'medium', 'hard'].map(level => (
                 <button 
                   key={level}
                   onClick={() => setDifficulty(level as any)}
                   className={`flex-1 py-2.5 text-sm font-bold uppercase tracking-wider rounded-lg transition-all ${difficulty === level ? 'bg-indigo-600 text-white shadow' : 'text-slate-500 hover:text-slate-300'}`}
                 >
                   {level}
                 </button>
               ))}
            </div>

            <button 
              onClick={startSession}
              disabled={generating}
              className="w-full py-4 bg-white text-slate-900 hover:bg-slate-100 font-bold rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 transition-colors shadow-lg"
            >
              {generating ? <Loader2 className="w-5 h-5 animate-spin" /> : <PlayCircle className="w-5 h-5" />}
              {generating ? 'Generating...' : 'Start Session'}
            </button>
          </div>
        </main>
      </div>
    );
  }

  // Active Runner View
  const done = curIndex >= questions.length;

  if (done) {
     return (
        <div className="min-h-screen bg-slate-900 text-slate-300 font-sans flex flex-col">
          <Header title="Prep Mode" backTo="/candidate/copilot" />
          <main className="flex-1 flex items-center justify-center p-6">
            <div className="text-center animate-in zoom-in-95 duration-500">
               <CheckCircle2 className="w-20 h-20 text-emerald-500 mx-auto mb-6" />
               <h1 className="text-4xl font-black text-white mb-4">Session Complete!</h1>
               <p className="text-slate-400 max-w-md mx-auto mb-8">Great job practicing. You tackled {questions.length} questions on {difficulty} mode.</p>
               <button onClick={() => router.push('/candidate/copilot')} className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-colors">
                  Return to Hub
               </button>
            </div>
          </main>
        </div>
     );
  }

  const q = questions[curIndex];

  return (
    <div className="min-h-screen bg-slate-900 text-slate-300 font-sans flex flex-col">
      <Header title="Prep Mode" backTo="/candidate/copilot" />
      
      {/* Progress Bar */}
      <div className="h-1 bg-slate-800 w-full">
         <div className="h-full bg-indigo-500 transition-all duration-500" style={{ width: `${(curIndex / questions.length) * 100}%` }}></div>
      </div>

      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-8 flex flex-col justify-center">
        
        <div className="mb-6 flex justify-between items-end">
           <span className="text-indigo-400 font-bold uppercase tracking-widest text-sm">{q.category}</span>
           <span className="text-slate-500 font-bold">{curIndex + 1} / {questions.length}</span>
        </div>

        <h2 className="text-3xl sm:text-4xl font-semibold text-white leading-tight mb-12">
          {q.question}
        </h2>

        {/* Transitioning Content Area */}
        <div className={`transition-all duration-500 overflow-hidden ${showAnswer ? 'max-h-[800px] opacity-100 translate-y-0' : 'max-h-0 opacity-0 translate-y-4'}`}>
          <div className="bg-emerald-900/20 border border-emerald-500/30 p-6 sm:p-8 rounded-2xl mb-12">
             <h3 className="flex items-center gap-2 text-emerald-400 font-bold mb-4 uppercase tracking-widest text-xs">
               <Target className="w-4 h-4" /> Ideal Answer Points
             </h3>
             <ul className="space-y-3">
               {q.ideal_answer_points.map((pt: string, idx: number) => (
                 <li key={idx} className="flex gap-3 text-emerald-100">
                   <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                   <span>{pt}</span>
                 </li>
               ))}
             </ul>
          </div>
        </div>

      </main>
      
      {/* Footer Controls */}
      <div className="bg-slate-900 border-t border-slate-800 p-4 sm:p-6 sticky bottom-0 z-10 w-full shadow-[0_-20px_30px_rgba(15,23,42,1)]">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <button 
             onClick={() => router.push('/candidate/copilot')}
             className="px-6 py-3 text-slate-400 hover:text-white font-semibold transition-colors"
          >
             Exit
          </button>
          
          {!showAnswer ? (
             <button 
               onClick={() => setShowAnswer(true)}
               className="px-8 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/20 transition-all flex items-center gap-2"
             >
                I've answered orally
             </button>
          ) : (
             <button 
               onClick={() => { setCurIndex(curIndex + 1); setShowAnswer(false); }}
               className="px-8 py-3.5 bg-white hover:bg-slate-100 text-slate-900 font-bold rounded-xl shadow-lg transition-all flex items-center gap-2"
             >
                Next Question <ChevronRight className="w-4 h-4" />
             </button>
          )}
        </div>
      </div>
    </div>
  );
}
