import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Activity, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface HeaderProps {
  title: string;
  backTo?: string;
}

export function Header({ title, backTo }: HeaderProps) {
  const router = useRouter();

  return (
    <header className="h-16 flex items-center justify-between sticky top-0 z-50 bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2 pr-6 border-r border-gray-200">
          <div className="w-8 h-8 rounded-lg bg-gray-900 flex items-center justify-center">
            <Activity className="w-4 h-4 text-white" strokeWidth={2.5} />
          </div>
          <span className="text-xl font-bold text-gray-900 tracking-tight">Pulse.</span>
        </div>
        
        {backTo && (
          <button 
            onClick={() => router.push(backTo)}
            className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {title}
          </button>
        )}
        {!backTo && (
          <span className="text-sm font-medium text-gray-500">
            {title}
          </span>
        )}
      </div>

      <div className="flex items-center gap-6">
        <Link 
          href="/recruiter/dashboard" 
          className="flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors bg-indigo-50 px-4 h-9 rounded-xl"
        >
          Pipeline
        </Link>
        <div className="flex items-center gap-4 pl-4 border-l border-gray-200">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-semibold shadow-sm cursor-pointer hover:opacity-90 transition-opacity">
            R
          </div>
          <Link href="/auth/login" className="text-gray-400 hover:text-red-500 transition-colors" title="Log out">
            <LogOut className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </header>
  );
}
