'use client';

import React, { useEffect, useState } from 'react';
import { 
  Bot, 
  Briefcase, 
  CheckCircle2, 
  ChevronRight, 
  Cpu, 
  FileText, 
  Flame, 
  Github, 
  Info, 
  MessageSquare, 
  Radar, 
  Sparkles, 
  TrendingUp, 
  X,
  Zap,
  Layout,
  Clock,
  ArrowUpRight,
  ShieldCheck,
  TrendingDown,
  LineChart,
  Network,
  DollarSign
} from 'lucide-react';
import { cn, formatRelativeTime } from '@/lib/utils';
import { getAgentFeed, actOnFeedItem } from '@/lib/api';

interface AgentFeedProps {
  className?: string;
}

export function AgentFeed({ className }: AgentFeedProps) {
  const [feed, setFeed] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'unread' | 'all'>('unread');

  const loadFeed = async () => {
    setLoading(true);
    try {
      const res = await getAgentFeed(filter);
      const data = await res.json();
      setFeed(data.feed || []);
    } catch (err) {
      console.error('Failed to load feed', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFeed();
  }, [filter]);

  const handleAction = async (id: string, action: 'read' | 'archive' | 'actioned') => {
    try {
      await actOnFeedItem(id, action);
      setFeed((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      console.error('Action failed', err);
    }
  };

  if (loading && feed.length === 0) {
    return (
      <div className="flex flex-col gap-4 animate-pulse">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-40 bg-slate-100 rounded-[32px] border border-slate-200" />
        ))}
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      <div className="flex items-center justify-between px-2">
        <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
          <Bot className="w-6 h-6 text-indigo-600" />
          Agent Feed
        </h2>
        <div className="flex bg-slate-100 p-1 rounded-2xl">
          <button 
            onClick={() => setFilter('unread')}
            className={cn(
              "px-4 py-1.5 text-xs font-black rounded-xl transition",
              filter === 'unread' ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
            )}
          >
            Unread
          </button>
          <button 
            onClick={() => setFilter('all')}
            className={cn(
              "px-4 py-1.5 text-xs font-black rounded-xl transition",
              filter === 'all' ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
            )}
          >
            All
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {feed.map((item) => (
          <FeedCard key={item.id} item={item} onAction={handleAction} />
        ))}
        {feed.length === 0 && !loading && (
          <div className="py-20 text-center rounded-[32px] border-2 border-dashed border-slate-200">
            <Bot className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 font-medium">Your agent is observing the market...</p>
          </div>
        )}
      </div>
    </div>
  );
}

function FeedCard({ item, onAction }: { item: any, onAction: (id: string, action: any) => void }) {
  const type = item.type;
  const data = item.data || {};

  const getIcon = () => {
    switch (type) {
      case 'match_found': return <Radar className="w-5 h-5 text-indigo-600" />;
      case 'intro_drafted': return <MessageSquare className="w-5 h-5 text-emerald-600" />;
      case 'intel_report': return <Cpu className="w-5 h-5 text-amber-600" />;
      case 'github_milestone': return <Github className="w-5 h-5 text-slate-900" />;
      case 'interview_invited': return <Briefcase className="w-5 h-5 text-indigo-600" />;
      case 'interview_prep_ready': return <Sparkles className="w-5 h-5 text-violet-600" />;
      case 'profile_optimized': return <TrendingUp className="w-5 h-5 text-blue-600" />;
      case 'daily_pulse': return <Flame className="w-5 h-5 text-orange-600" />;
      case 'action_required': return <Info className="w-5 h-5 text-rose-600" />;
      case 'network_ping': return <Network className="w-5 h-5 text-cyan-600" />;
      case 'salary_negotiation': return <DollarSign className="w-5 h-5 text-green-600" />;
      case 'career_pivot': return <Layout className="w-5 h-5 text-purple-600" />;
      default: return <Bot className="w-5 h-5 text-slate-600" />;
    }
  };

  const getBg = () => {
    switch (type) {
      case 'match_found': return "bg-indigo-50/50";
      case 'intro_drafted': return "bg-emerald-50/50";
      case 'intel_report': return "bg-amber-50/50";
      case 'action_required': return "bg-rose-50/50";
      default: return "bg-white";
    }
  };

  return (
    <div className={cn(
      "group relative overflow-hidden rounded-[32px] border border-slate-200 transition-all hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-500/5",
      getBg()
    )}>
      <div className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/50">
              {getIcon()}
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                {type.replace('_', ' ')} • {formatRelativeTime(item.created_at)}
              </p>
              <h3 className="text-lg font-black text-slate-900 mt-0.5">{item.title}</h3>
            </div>
          </div>
          <button 
            onClick={() => onAction(item.id, 'archive')}
            className="p-2 text-slate-300 hover:text-slate-600 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-4">
          <p className="text-slate-600 text-sm leading-relaxed">{item.description}</p>
        </div>

        {/* Dynamic Card Content Rendering */}
        <div className="mt-5">
           {type === 'match_found' && (
             <div className="flex items-center justify-between p-4 bg-white rounded-[24px] border border-slate-100 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-black text-indigo-600">{data.match_score || 0}%</p>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Match</p>
                  </div>
                  <div>
                    <p className="text-sm font-black text-slate-900">{data.role_title}</p>
                    <p className="text-xs text-slate-500">{data.company_name} • {data.location}</p>
                  </div>
                </div>
                <button 
                  onClick={() => onAction(item.id, 'actioned')}
                  className="px-5 py-2.5 bg-slate-900 text-white text-xs font-black rounded-2xl hover:bg-slate-800 transition flex items-center gap-2"
                >
                  Evaluate
                  <ChevronRight className="w-4 h-4" />
                </button>
             </div>
           )}

           {type === 'intro_drafted' && (
             <div className="space-y-4">
                <div className="p-4 bg-slate-50 rounded-[24px] border border-slate-100 text-sm text-slate-700 italic relative">
                  <span className="absolute -top-3 left-6 px-3 py-1 bg-white border border-slate-100 rounded-full text-[10px] font-black uppercase tracking-widest text-emerald-600 shadow-sm">
                    AI Draft
                  </span>
                  "{data.draft_text}"
                </div>
                <div className="flex items-center gap-2">
                   <button 
                     onClick={() => onAction(item.id, 'actioned')}
                     className="px-6 py-3 bg-emerald-600 text-white text-xs font-black rounded-2xl hover:bg-emerald-700 transition"
                   >
                     Approve & Send
                   </button>
                   <button className="px-6 py-3 bg-white border border-slate-200 text-slate-600 text-xs font-black rounded-2xl hover:bg-slate-50 transition">
                     Edit Draft
                   </button>
                </div>
             </div>
           )}

           {type === 'intel_report' && (
             <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-white rounded-2xl border border-slate-100">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Market Fit</p>
                  <p className="text-sm font-black text-slate-900 mt-1">{data.market_fit || 'High'}</p>
                </div>
                <div className="p-3 bg-white rounded-2xl border border-slate-100">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Salary Trend</p>
                  <p className="text-sm font-black text-slate-900 mt-1">{data.salary_trend || 'Rising'}</p>
                </div>
             </div>
           )}

           {type === 'github_milestone' && (
             <div className="flex items-center gap-4 p-4 bg-slate-900 rounded-[24px]">
                <Github className="w-8 h-8 text-white" />
                <div className="flex-1">
                  <p className="text-xs font-black text-slate-400">{data.milestone_label}</p>
                  <div className="h-2 bg-slate-800 rounded-full mt-2 overflow-hidden">
                    <div className="h-full bg-indigo-500" style={{ width: `${data.progress || 100}%` }} />
                  </div>
                </div>
                <p className="text-xl font-black text-white">{data.value || ''}</p>
             </div>
           )}

           {/* Generic Catch-all for simple cards */}
           {!['match_found', 'intro_drafted', 'intel_report', 'github_milestone'].includes(type) && (
              <div className="flex items-center justify-end gap-3">
                 <button 
                  onClick={() => onAction(item.id, 'read')}
                  className="text-xs font-black text-slate-400 hover:text-slate-900 transition"
                >
                  Mark as Read
                </button>
                <button 
                  onClick={() => onAction(item.id, 'actioned')}
                  className="px-5 py-2.5 bg-slate-100 text-slate-900 text-xs font-black rounded-2xl hover:bg-slate-200 transition"
                >
                  View Details
                </button>
              </div>
           )}
        </div>
      </div>
    </div>
  );
}
