'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  Zap, 
  User, 
  Sparkles,
  LogOut
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { logout } from '@/lib/auth';

export function CandidateNav() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/auth/login');
  };

  const links = [
    { 
      label: 'Home', 
      href: '/candidate/home', 
      icon: Home,
      description: 'Discovery Wall'
    },
    { 
      label: 'Apply', 
      href: '/candidate/apply', 
      icon: Sparkles,
      description: 'Agentic Hub',
      highlight: true
    },
    { 
      label: 'Profile', 
      href: '/candidate/profile', 
      icon: User,
      description: 'Identity & Proof'
    },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-md border-b border-white/5 shadow-2xl">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/candidate/home" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground shadow-[0_0_20px_rgba(16,185,129,0.3)] group-hover:scale-110 transition-transform">
              <Zap className="w-5 h-5 fill-current" />
            </div>
            <div>
              <p className="text-sm font-black text-foreground leading-none tracking-tight">PULSE</p>
              <p className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] mt-1.5 glow-text">Agentic V2</p>
            </div>
          </Link>

          <div className="h-4 w-px bg-white/10 mx-6 hidden md:block" />

          <div className="hidden md:flex items-center gap-1 p-1 bg-secondary/50 rounded-2xl border border-white/5">
            {links.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "px-6 py-2 rounded-xl transition-all flex items-center gap-3 group",
                    isActive 
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" 
                      : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                  )}
                >
                  <Icon className={cn("w-4 h-4", isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-primary")} />
                  <p className="text-[10px] font-black uppercase tracking-[0.15em] leading-none">{link.label}</p>
                </Link>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-4">
           <div className="hidden sm:flex flex-col items-end mr-2">
              <p className="text-[8px] font-black text-muted-foreground uppercase tracking-[0.2em] leading-none">Agent Status</p>
              <div className="flex items-center gap-2 mt-1.5">
                 <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                 </span>
                 <p className="text-[10px] font-bold text-primary uppercase tracking-widest">Active</p>
              </div>
           </div>
           <button 
             onClick={handleLogout}
             className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
             title="Logout"
           >
              <LogOut className="w-5 h-5" />
           </button>
        </div>
      </div>
    </nav>
  );
}
