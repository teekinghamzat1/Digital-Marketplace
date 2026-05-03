"use client";

import React from 'react';
import { Home, ShoppingBag, ShoppingCart, Wallet, User } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';

export function MobileFooterNav() {
  const pathname = usePathname();
  const router = useRouter();

  // Dynamic menu config matching actual available pages
  const navItems = [
    { id: 'dashboard', icon: Home, filled: true, label: 'Home', href: '/dashboard', match: (p: string) => p === '/dashboard' || p === '/' },
    { id: 'shop', icon: ShoppingBag, filled: false, strokeWidth: 2, label: 'Shop', href: '/shop', match: (p: string) => p.startsWith('/shop') },
    { id: 'orders', icon: ShoppingCart, filled: false, strokeWidth: 2.5, label: 'Orders', href: '/dashboard/orders', match: (p: string) => p.startsWith('/dashboard/orders') },
    { id: 'wallet', icon: Wallet, filled: false, strokeWidth: 2.5, label: 'Wallet', href: '/dashboard/wallet', match: (p: string) => p.startsWith('/dashboard/wallet') },
    { id: 'profile', icon: User, filled: true, label: 'Profile', href: '/profile', match: (p: string) => p.startsWith('/profile') },
  ];

  // Derive active tab from current route purely, avoiding local state flickering
  const activeTab = navItems.find(item => item.match(pathname))?.id || '';

  // Hide on auth pages
  if (pathname === '/login' || pathname === '/register') return null;

  const handleTabClick = (href: string) => {
    router.push(href);
  };

  return (
    <nav className="fixed bottom-0 left-0 w-full bg-[#FFFFFF] border-t border-[#EEEEEE] h-16 flex items-center px-2 z-[100] md:hidden">
      {navItems.map((item) => {
        const isActive = activeTab === item.id;
        const Icon = item.icon;
        
        return (
          <button
            key={item.id}
            onClick={() => handleTabClick(item.href)}
            className="relative flex-1 flex justify-center items-center h-full outline-none select-none tap-highlight-transparent"
          >
            {isActive ? (
              <div className="absolute bottom-0 w-16 h-24 bg-[var(--primary,#FF6B00)] rounded-t-[32px] flex flex-col items-center pt-[10px] transition-all duration-200 ease-out">
                {/* Left Fillet */}
                <div 
                  className="absolute bottom-16 -left-5 w-5 h-5 pointer-events-none"
                  style={{ background: 'radial-gradient(circle at 0 0, transparent 20px, var(--primary, #FF6B00) 20.5px)' }}
                />
                {/* Right Fillet */}
                <div 
                  className="absolute bottom-16 -right-5 w-5 h-5 pointer-events-none"
                  style={{ background: 'radial-gradient(circle at 100% 0, transparent 20px, var(--primary, #FF6B00) 20.5px)' }}
                />
                
                <Icon 
                  className="text-[#FFFFFF] w-6 h-6 z-10" 
                  fill={item.filled ? "currentColor" : "none"}
                  strokeWidth={item.strokeWidth || 2}
                />
                <span className="text-[#FFFFFF] text-[11px] font-medium z-10 mt-2 tracking-wide">
                  {item.label}
                </span>
              </div>
            ) : (
              <Icon 
                className="text-text-secondary w-6 h-6 transition-colors duration-200" 
                fill={item.filled ? "currentColor" : "none"}
                strokeWidth={item.strokeWidth || 2}
              />
            )}
          </button>
        );
      })}
    </nav>
  );
}
