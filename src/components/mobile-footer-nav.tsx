"use client";

import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { 
  Home, ShoppingBag, ShoppingCart, 
  Wallet, User, LayoutGrid, Zap 
} from 'lucide-react';
import { useUser } from '@/context/UserContext';

export function MobileFooterNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading } = useUser();

  const navItems = [
    { id: 'dashboard', icon: Home, label: 'Home', href: '/dashboard', match: (p: string) => p === '/dashboard' },
    { id: 'shop', icon: ShoppingBag, label: 'Shop', href: '/shop', match: (p: string) => p.startsWith('/shop') },
    { id: 'orders', icon: ShoppingCart, label: 'Orders', href: '/dashboard/orders', match: (p: string) => p.startsWith('/dashboard/orders') },
    { id: 'wallet', icon: Wallet, label: 'Wallet', href: '/dashboard/wallet', match: (p: string) => p.startsWith('/dashboard/wallet') },
    { id: 'profile', icon: User, label: 'Account', href: '/profile', match: (p: string) => p.startsWith('/profile') },
  ];

  const activeTab = navItems.find(item => item.match(pathname))?.id || '';

  // Hide for non-authenticated users OR on auth pages OR admin pages OR homepage
  if (loading || !user || pathname === '/' || pathname === '/login' || pathname === '/register' || pathname.startsWith('/admin')) return null;

  return (
    <div className="fixed bottom-6 left-0 w-full px-6 z-[100] md:hidden pointer-events-none">
      <nav className="max-w-md mx-auto bg-surface/80 backdrop-blur-xl border border-border-default h-16 rounded-3xl flex items-center justify-around px-2 shadow-[0_20px_50px_rgba(0,0,0,0.15)] pointer-events-auto">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;
          
          return (
            <button
              key={item.id}
              onClick={() => router.push(item.href)}
              className="relative flex flex-col items-center justify-center flex-1 h-full transition-all duration-300"
            >
              <div className={`relative flex flex-col items-center transition-all duration-300 ${isActive ? '-translate-y-1' : ''}`}>
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-500 ${
                  isActive 
                    ? 'bg-primary text-white shadow-[0_10px_20px_-5px_rgba(255,107,0,0.5)] rotate-0' 
                    : 'text-text-muted rotate-0'
                }`}>
                  <Icon size={isActive ? 22 : 20} strokeWidth={isActive ? 2.5 : 2} />
                  
                  {/* Active Indicator Glow */}
                  {isActive && (
                    <div className="absolute inset-0 bg-primary/20 rounded-2xl blur-lg animate-pulse" />
                  )}
                </div>
                
                <span className={`text-[9px] font-black uppercase tracking-[0.1em] mt-1.5 transition-all duration-300 ${
                  isActive ? 'text-primary scale-110' : 'text-text-muted opacity-0 translate-y-2'
                }`}>
                  {item.label}
                </span>

                {/* Dot indicator for active */}
                {isActive && (
                    <div className="absolute -bottom-3 w-1 h-1 bg-primary rounded-full" />
                )}
              </div>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
