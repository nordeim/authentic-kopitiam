'use client';

import { Bell, User } from 'lucide-react';

export function AdminHeader() {
  return (
    <header className="h-16 bg-vintage-paper border-b-2 border-mocha-medium flex items-center justify-between px-8 sticky top-0 z-40 ml-64">
      <div className="flex items-center gap-2">
        <span className="font-mono text-mocha-medium text-sm">/</span>
        <span className="font-mono text-espresso-dark font-bold tracking-tight">DASHBOARD</span>
      </div>

      <div className="flex items-center gap-6">
        <button className="relative text-mocha-medium hover:text-espresso-dark transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-0 right-0 w-2 h-2 bg-coral-pop rounded-full"></span>
        </button>
        
        <div className="flex items-center gap-3 pl-6 border-l border-mocha-medium/20">
          <div className="text-right hidden md:block">
            <p className="text-sm font-bold text-espresso-dark leading-none">Admin User</p>
            <p className="text-xs font-mono text-mocha-medium mt-1">Manager</p>
          </div>
          <div className="w-8 h-8 bg-espresso-dark rounded-full flex items-center justify-center text-cream-white">
            <User className="w-4 h-4" />
          </div>
        </div>
      </div>
    </header>
  );
}
