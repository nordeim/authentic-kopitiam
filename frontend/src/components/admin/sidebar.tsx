'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { LayoutDashboard, ShoppingBag, Box, Settings, LogOut } from 'lucide-react';

const ADMIN_NAV_ITEMS = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { label: 'Orders', href: '/orders', icon: ShoppingBag }, // Will be /admin/orders
  { label: 'Inventory', href: '/inventory', icon: Box }, // Will be /admin/inventory
  { label: 'Settings', href: '/settings', icon: Settings }, // Will be /admin/settings
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-espresso-dark text-cream-white flex flex-col border-r-4 border-double border-sunrise-amber h-screen fixed left-0 top-0 overflow-y-auto z-50">
      <div className="p-6 border-b border-white/10">
        <div className="flex flex-col gap-1">
          <span className="font-display text-2xl font-bold text-sunrise-amber tracking-wide">MANAGER&apos;S</span>
          <span className="font-display text-xl font-bold text-cream-white tracking-widest">OFFICE</span>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {ADMIN_NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
          const href = item.href === '/admin' ? '/admin' : `/admin${item.href}`;
          
          return (
            <Link
              key={item.href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group font-mono text-sm tracking-wide",
                isActive 
                  ? "bg-sunrise-amber text-espresso-dark font-bold shadow-md" 
                  : "text-cream-white/80 hover:bg-white/10 hover:text-cream-white"
              )}
            >
              <item.icon className={cn("w-5 h-5", isActive ? "text-espresso-dark" : "text-sunrise-amber")} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/10">
        <button className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-cream-white/80 hover:bg-coral-pop/20 hover:text-coral-pop transition-all duration-200 font-mono text-sm tracking-wide">
          <LogOut className="w-5 h-5" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}