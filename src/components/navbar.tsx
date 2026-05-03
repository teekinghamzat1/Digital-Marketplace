"use client";

import Link from "next/link";
import { useTheme } from "next-themes";
import { Moon, Sun, LogIn, UserPlus } from "lucide-react";
import { useEffect, useState } from "react";

export function Navbar() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    setMounted(true);
    fetch("/api/auth/me", { method: "GET", credentials: "include" })
      .then(res => {
        if (res.ok) return res.json();
        return null;
      })
      .then(data => {
        if (data && data.id) setUser(data);
      })
      .catch(() => {});
  }, []);

  return (
    <nav className="w-full border-b border-border-default bg-surface/50 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold font-[family-name:var(--font-syne)] text-primary">
          Sumon Mondal Logs
        </Link>

        <div className="flex items-center gap-6">
          <Link href="/shop" className="text-text-secondary hover:text-primary transition-colors font-medium">
            Shop
          </Link>

          <div className="flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-4">
                <div className="hidden md:flex items-center px-3 py-1.5 bg-surface-elevated rounded-full border border-border-default">
                  <span className="text-sm font-medium text-text-secondary mr-1.5">Balance:</span>
                  <span className="text-sm font-bold text-foreground">₦{Number(user.walletBalance).toLocaleString()}</span>
                </div>
                <Link href="/dashboard" className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-lg shadow-primary/20">
                  <span className="hidden sm:inline">Dashboard</span>
                </Link>
              </div>
            ) : (
              <>
                <Link href="/login" className="flex items-center gap-2 text-text-secondary hover:text-primary font-medium transition-colors">
                  <LogIn size={18} />
                  <span className="hidden sm:inline">Login</span>
                </Link>
                <Link href="/register" className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-lg font-medium transition-colors">
                  <UserPlus size={18} />
                  <span className="hidden sm:inline">Register</span>
                </Link>
              </>
            )}
          </div>

          {mounted && (
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2 text-text-secondary hover:text-primary transition-colors bg-surface-elevated rounded-full"
            >
              {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
