"use client";

import { useTheme } from "next-themes";
import { Sun, Moon, Bell, Search, Settings } from "lucide-react";
import { useEffect, useState } from "react";

export function AdminHeader({ adminName }: { adminName?: string }) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return (
    <header className="fixed top-0 right-0 left-0 lg:left-[280px] h-16 bg-background/80 backdrop-blur-md border-b border-border-default z-[50] transition-all duration-300">
      <div className="h-full px-4 md:px-8 flex items-center justify-between">
        {/* Search Bar - Desktop */}
        <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-surface-elevated rounded-xl border border-border-default w-full max-w-md group focus-within:border-primary transition-all">
          <Search size={18} className="text-text-muted group-focus-within:text-primary" />
          <input 
            type="text" 
            placeholder="Search everything..." 
            className="bg-transparent border-none outline-none text-sm w-full text-foreground"
          />
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-2 md:gap-4 ml-auto">
          {/* Theme Toggle */}
          <button 
            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
            className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-surface-elevated text-text-secondary hover:text-primary transition-all border border-transparent hover:border-border-default"
            title="Toggle Theme"
          >
            {resolvedTheme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          {/* Notifications */}
          <button className="relative w-10 h-10 flex items-center justify-center rounded-xl hover:bg-surface-elevated text-text-secondary hover:text-primary transition-all border border-transparent hover:border-border-default">
            <Bell size={20} />
            <span className="absolute top-2 right-2 w-2 h-2 bg-danger rounded-full border-2 border-background" />
          </button>

          {/* Settings */}
          <button className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-surface-elevated text-text-secondary hover:text-primary transition-all border border-transparent hover:border-border-default md:hidden">
            <Settings size={20} />
          </button>

          {/* Divider */}
          <div className="w-px h-6 bg-border-default mx-1 hidden md:block" />

          {/* Welcome Text */}
          <div className="hidden sm:block">
            <p className="text-xs text-text-muted font-bold uppercase tracking-widest">Welcome back</p>
            <p className="text-sm font-bold text-foreground">{adminName || "Administrator"}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
