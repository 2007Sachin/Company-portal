'use client';

import React, { useEffect, useState } from 'react';
import { Header } from '@pulse/ui';
import { Activity, ServerCrash, CheckCircle2 } from 'lucide-react';

interface ServiceHealth {
  name: string;
  endpoint: string;
  status: 'online' | 'offline' | 'checking';
  lastChecked: Date | null;
}

const INITIAL_SERVICES: ServiceHealth[] = [
  { name: 'Auth Service', endpoint: '/api/auth/health', status: 'checking', lastChecked: null },
  { name: 'Candidate Service', endpoint: '/api/candidates/health', status: 'checking', lastChecked: null },
  { name: 'Pipeline Service', endpoint: '/api/pipeline/health', status: 'checking', lastChecked: null },
  { name: 'JD Parser Service', endpoint: '/api/jd/health', status: 'checking', lastChecked: null },
];

export default function AdminHealthDashboard() {
  const [services, setServices] = useState<ServiceHealth[]>(INITIAL_SERVICES);

  const checkHealth = async () => {
    const updatedServices = await Promise.all(
      INITIAL_SERVICES.map(async (service) => {
        try {
          // Time out after 3 seconds
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 3000);
          
          const res = await fetch(service.endpoint, { signal: controller.signal });
          clearTimeout(timeoutId);

          return {
            ...service,
            status: res.ok ? 'online' : 'offline',
            lastChecked: new Date(),
          } as ServiceHealth;
        } catch (error) {
          return {
            ...service,
            status: 'offline',
            lastChecked: new Date(),
          } as ServiceHealth;
        }
      })
    );
    setServices(updatedServices);
  };

  useEffect(() => {
    checkHealth();
    const interval = setInterval(checkHealth, 10000); // 10 seconds auto-refresh
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Header title="System Health" backTo="/recruiter/search" />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 pt-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <Activity className="w-8 h-8 text-indigo-600" />
            Infrastructure Status
          </h1>
          <p className="text-slate-500 mt-1">Live automated ping checks against edge NGINX API gateways</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
          {services.map((svc) => (
            <div key={svc.name} className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-slate-900">{svc.name}</h3>
                <p className="text-xs text-slate-400 mt-1 font-mono">{svc.endpoint}</p>
                {svc.lastChecked && (
                  <p className="text-[10px] text-slate-300 mt-2">
                    Checked: {svc.lastChecked.toLocaleTimeString()}
                  </p>
                )}
              </div>
              <div className="flex items-center">
                {svc.status === 'checking' && (
                  <span className="flex items-center gap-2 text-sm text-yellow-600 bg-yellow-50 px-3 py-1 rounded-full">
                    Checking...
                  </span>
                )}
                {svc.status === 'online' && (
                  <span className="flex items-center gap-2 text-sm font-medium text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full">
                    <CheckCircle2 className="w-4 h-4" /> Online
                  </span>
                )}
                {svc.status === 'offline' && (
                  <span className="flex items-center gap-2 text-sm font-medium text-red-700 bg-red-50 px-3 py-1.5 rounded-full animate-pulse">
                    <ServerCrash className="w-4 h-4" /> Offline
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
