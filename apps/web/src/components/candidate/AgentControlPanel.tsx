'use client';

import React, { useEffect, useState } from 'react';
import { 
  Bot, 
  Settings, 
  Zap, 
  ZapOff, 
  MessageSquare, 
  Target, 
  Bell, 
  Loader2,
  CheckCircle2,
  Info,
  RefreshCw,
  ShieldCheck
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getAgentPreferences, updateAgentPreferences, runAgentCycle } from '@/lib/api';

export function AgentControlPanel() {
  const [prefs, setPrefs] = useState<any>(null);
  const [syncing, setSyncing] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getAgentPreferences();
        const data = await res.json();
        setPrefs(data);
      } catch (err) {
        console.error('Failed to load preferences', err);
      }
    };
    load();
  }, []);

  const update = async (patch: any) => {
    const newPrefs = { ...prefs, ...patch };
    setPrefs(newPrefs);
    setSyncing(true);
    setSuccess(false);
    try {
      await updateAgentPreferences(patch);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
    } catch (err) {
      console.error('Update failed', err);
    } finally {
      setSyncing(false);
    }
  };

  if (!prefs) {
    return (
      <div className="p-8 bg-white rounded-[32px] border border-slate-200 animate-pulse">
        <div className="h-8 w-1/2 bg-slate-100 rounded-lg mb-6" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 bg-slate-50 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden sticky top-8">
      <div className="p-7">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <Settings className="w-5 h-5 text-indigo-600" />
              Agent Controls
            </h3>
            <p className="text-xs text-slate-500 mt-1 font-medium italic">Tuning your career autopilot</p>
          </div>
          <div className="h-8 w-8 flex items-center justify-center">
            {syncing ? (
              <Loader2 className="w-4 h-4 text-indigo-600 animate-spin" />
            ) : success ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            ) : (
              <div className="w-2 h-2 rounded-full bg-slate-200" />
            )}
          </div>
        </div>

        <div className="space-y-8">
          {/* Autopilot Toggle */}
          <div className="flex items-start justify-between gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 transition-all hover:border-indigo-100">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <Zap className={cn("w-4 h-4", prefs.autopilot_enabled ? "text-indigo-600 fill-indigo-600" : "text-slate-400")} />
                <p className="text-sm font-black text-slate-900 uppercase tracking-widest">Autopilot</p>
              </div>
              <p className="text-xs text-slate-500 mt-1">Allow agent to draft and send intros automatically for {'>'}{prefs.target_match_score || 75}% matches.</p>
            </div>
            <button 
              onClick={() => update({ autopilot_enabled: !prefs.autopilot_enabled })}
              className={cn(
                "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
                prefs.autopilot_enabled ? "bg-indigo-600" : "bg-slate-200"
              )}
            >
              <span className={cn(
                "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                prefs.autopilot_enabled ? "translate-x-5" : "translate-x-0"
              )} />
            </button>
          </div>

          <button
            onClick={async () => {
              setSyncing(true);
              try {
                await runAgentCycle();
                setSuccess(true);
                setTimeout(() => setSuccess(false), 2000);
              } catch (err) {
                console.error('Scan failed', err);
              } finally {
                setSyncing(false);
              }
            }}
            disabled={syncing}
            className="w-full flex items-center justify-center gap-2 py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition shadow-lg shadow-indigo-600/20 disabled:opacity-50"
          >
            {syncing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            Scan for Opportunities
          </button>

          {/* Intro Style */}
          <div className="space-y-4 text-slate-500">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              <p className="text-xs font-black uppercase tracking-widest">Drafting Style</p>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {['subtle', 'balanced', 'aggressive'].map((style) => (
                <button
                  key={style}
                  onClick={() => update({ intro_style: style })}
                  className={cn(
                    "px-1 py-3 text-[10px] font-black uppercase tracking-tighter border-2 rounded-xl transition-all",
                    prefs.intro_style === style 
                      ? "bg-slate-900 border-slate-900 text-white" 
                      : "bg-white border-slate-100 text-slate-400 hover:border-slate-200 hover:text-slate-600"
                  )}
                >
                  {style}
                </button>
              ))}
            </div>
            <div className="flex items-start gap-2 px-2">
              <Info className="w-3 h-3 mt-0.5 shrink-0" />
              <p className="text-[10px] italic">
                {prefs.intro_style === 'subtle' && "Focuses on humble discovery and specific technical questions."}
                {prefs.intro_style === 'balanced' && "Mixes strong proof with genuine curiosity about role impact."}
                {prefs.intro_style === 'aggressive' && "Leading with top 1% Pulse signals and clear 'why me' claims."}
              </p>
            </div>
          </div>

          {/* Threshold */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-slate-400" />
                <p className="text-xs font-black uppercase tracking-widest text-slate-400">Match Threshold</p>
              </div>
              <p className="text-xs font-black text-indigo-600">{prefs.target_match_score || 75}%</p>
            </div>
            <input 
              type="range" 
              min="50" 
              max="95" 
              step="5"
              value={prefs.target_match_score || 75}
              onChange={(e) => update({ target_match_score: parseInt(e.target.value) })}
              className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
            <div className="flex justify-between px-1 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
              <span>50%</span>
              <span>Match</span>
              <span>95%</span>
            </div>
          </div>

          {/* Notifications */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-50">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-slate-400" />
              <p className="text-xs font-black uppercase tracking-widest text-slate-400">Notifications</p>
            </div>
            <button 
              onClick={() => update({ notifications_enabled: !prefs.notifications_enabled })}
              className={cn(
                "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
                prefs.notifications_enabled ? "bg-indigo-600" : "bg-slate-200"
              )}
            >
              <span className={cn(
                "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                prefs.notifications_enabled ? "translate-x-5" : "translate-x-0"
              )} />
            </button>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="p-6 bg-slate-50 border-t border-slate-100">
        <div className="flex gap-3">
          <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
          <p className="text-[10px] font-medium text-slate-500 leading-relaxed">
            Your agent only shares verified Pulse signals. Direct contact info is only unlocked after a recruiter accepts your matched intro.
          </p>
        </div>
      </div>
    </div>
  );
}
