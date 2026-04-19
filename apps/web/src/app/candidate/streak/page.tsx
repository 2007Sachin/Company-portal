'use client';

import React, { useEffect, useState } from 'react';
import {
    Flame,
    Award,
    Calendar,
    Zap,
    Trophy,
    CheckCircle2,
    XCircle
} from 'lucide-react';
import { Header } from '@pulse/ui';
import { getCandidateStreak, getCandidateChallenges } from '@/lib/api';
import { format, subDays, isSameDay, startOfToday } from 'date-fns';

export default function StreakCalendarPage() {
    const [loading, setLoading] = useState(true);
    const [streak, setStreak] = useState<any>(null);
    const [history, setHistory] = useState<any[]>([]);

    useEffect(() => {
        async function loadStreakData() {
            try {
                const [sRes, hRes] = await Promise.all([
                    getCandidateStreak(),
                    getCandidateChallenges()
                ]);

                if (sRes.ok) setStreak(await sRes.json());
                if (hRes.ok) setHistory(await hRes.json());
            } catch (err) {
                console.error('Error fetching streak data', err);
            } finally {
                setLoading(false);
            }
        }
        loadStreakData();
    }, []);

    if (loading) {
        return <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
            <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        </div>;
    }

    const currentStreak = streak?.current_streak || 0;
    const longestStreak = streak?.longest_streak || 0;

    // Generate last 90 days for the heatmap
    const today = startOfToday();
    const days = Array.from({ length: 90 }, (_, i) => subDays(today, 89 - i));

    const getStatusForDay = (day: Date) => {
        const entry = history.find(h => h.completed_at && isSameDay(new Date(h.created_at), day));
        return entry ? 'completed' : 'missed';
    };

    const milestones = [
        { label: '7 Day Starter', days: 7, icon: <Zap className="w-5 h-5" /> },
        { label: '30 Day Warrior', days: 30, icon: <Award className="w-5 h-5" /> },
        { label: '100 Day Legend', days: 100, icon: <Trophy className="w-5 h-5" /> }
    ];

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col font-sans">
            <Header title="My Growth Streak" backTo="/candidate/dashboard" />

            <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-8">

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col items-center text-center">
                        <div className="w-12 h-12 bg-orange-50 dark:bg-orange-900/20 rounded-2xl flex items-center justify-center mb-4">
                            <Flame className="w-7 h-7 text-orange-500 fill-current" />
                        </div>
                        <span className="text-3xl font-black text-slate-900 dark:text-white">{currentStreak}</span>
                        <span className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">Current Streak</span>
                    </div>

                    <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col items-center text-center">
                        <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl flex items-center justify-center mb-4">
                            <Trophy className="w-7 h-7 text-indigo-600" />
                        </div>
                        <span className="text-3xl font-black text-slate-900 dark:text-white">{longestStreak}</span>
                        <span className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">Longest Streak</span>
                    </div>

                    <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col items-center text-center">
                        <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl flex items-center justify-center mb-4">
                            <Calendar className="w-7 h-7 text-emerald-600" />
                        </div>
                        <span className="text-3xl font-black text-slate-900 dark:text-white">{history.filter(h => h.completed_at).length}</span>
                        <span className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">Total Days</span>
                    </div>
                </div>

                {/* Heatmap Section */}
                <section className="bg-white dark:bg-slate-800 p-8 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm mb-10">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Activity Heatmap (Last 90 Days)</h3>
                    
                    <div className="flex flex-wrap gap-2">
                        {days.map((day, idx) => {
                            const status = getStatusForDay(day);
                            const isToday = isSameDay(day, today);
                            return (
                                <div 
                                    key={idx} 
                                    title={format(day, 'MMM d, yyyy')}
                                    className={`w-6 h-6 rounded-sm transition-all cursor-help ${
                                        status === 'completed' 
                                            ? 'bg-emerald-500 scale-105 shadow-sm shadow-emerald-200' 
                                            : 'bg-slate-100 dark:bg-slate-700 hover:bg-slate-200'
                                    } ${isToday ? 'ring-2 ring-indigo-500 ring-offset-2' : ''}`}
                                />
                            );
                        })}
                    </div>
                    
                    <div className="mt-6 flex items-center gap-4 text-sm font-medium text-slate-400">
                        <div className="flex items-center gap-1.5">
                            <div className="w-3 h-3 bg-slate-100 dark:bg-slate-700 rounded-sm" /> Missed
                        </div>
                        <div className="flex items-center gap-1.5">
                            <div className="w-3 h-3 bg-emerald-500 rounded-sm" /> Completed
                        </div>
                    </div>
                </section>

                {/* Milestone Badges */}
                <section className="bg-white dark:bg-slate-800 p-8 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Milestone Badges</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        {milestones.map((m, idx) => {
                            const earned = longestStreak >= m.days;
                            return (
                                <div key={idx} className={`p-6 rounded-2xl border-2 flex flex-col items-center text-center transition-all ${
                                    earned 
                                        ? 'bg-indigo-50 dark:bg-indigo-900/10 border-indigo-200 dark:border-indigo-800 scale-100 opacity-100' 
                                        : 'bg-slate-50 dark:bg-slate-900/50 border-dashed border-slate-200 dark:border-slate-800 opacity-50 grayscale'
                                }`}>
                                    <div className={`w-12 h-12 rounded-full mb-4 flex items-center justify-center ${earned ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-200 text-slate-400'}`}>
                                        {m.icon}
                                    </div>
                                    <span className="font-bold text-slate-900 dark:text-white">{m.label}</span>
                                    <span className="text-xs font-medium text-slate-500 mt-1">{earned ? 'Earned!' : `Locked (${m.days} days)`}</span>
                                </div>
                            );
                        })}
                    </div>
                </section>

                {/* Streak Reset Message */}
                {currentStreak === 0 && longestStreak > 0 && (
                    <div className="mt-10 p-6 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/30 rounded-2xl flex items-center gap-4 text-amber-700 dark:text-amber-400 animate-in slide-in-from-bottom-4 duration-700">
                        <XCircle className="w-6 h-6 flex-shrink-0" />
                        <div>
                            <p className="font-bold">Strength starts with a single step.</p>
                            <p className="text-sm">Your {longestStreak}-day streak ended, but you're just one challenge away from starting a new legend. Ready for today?</p>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
