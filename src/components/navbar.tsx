"use client";

import Link from "next/link";
import { useTheme } from "next-themes";
import { Moon, Sun, LogIn, UserPlus, Menu, X, LayoutDashboard, ShoppingBag, Wallet, Settings, LogOut, Phone, Shield, FileText, Send, User } from "lucide-react";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export function Navbar() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

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
      .catch(() => { });
  }, []);

  // Close menu when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  const dashboardLinks = [
    { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
    { name: "Purchase History", href: "/dashboard/orders", icon: ShoppingBag },
    { name: "Wallet & Funding", href: "/dashboard/wallet", icon: Wallet },
    { name: "Account Settings", href: "/dashboard/settings", icon: Settings },
  ];

  const navLinks = [
    { name: "Shop", href: "/shop", icon: ShoppingBag },
    { name: "Contact Us", href: "/contact", icon: Phone },
    { name: "Privacy Policy", href: "/privacy-policy", icon: Shield },
    { name: "Terms & Conditions", href: "/terms-and-conditions", icon: FileText },
  ];

  return (
    <>
      <nav className="w-full border-b border-border-default bg-surface/80 backdrop-blur-md sticky top-0 z-[100] transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold font-syne text-primary flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white">
              <ShoppingBag size={18} />
            </div>
            <span>Sumon Mondal Logs</span>
          </Link>

          {/* Desktop View */}
          <div className="hidden lg:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors ${pathname === link.href ? 'text-primary' : 'text-text-secondary hover:text-primary'
                  }`}
              >
                {link.name}
              </Link>
            ))}

            <div className="flex items-center gap-3 ml-4">
              {user ? (
                <div className="flex items-center gap-4">
                  <div className="flex items-center px-3 py-1.5 bg-surface-elevated rounded-full border border-border-default">
                    <span className="text-sm font-medium text-text-secondary mr-1.5">Balance:</span>
                    <span className="text-sm font-bold text-foreground">₦{Number(user.walletBalance).toLocaleString()}</span>
                  </div>
                  <Link href="/dashboard" className="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-lg shadow-primary/20">
                    Dashboard
                  </Link>
                </div>
              ) : (
                <>
                  <Link href="/login" className="flex items-center gap-2 text-text-secondary hover:text-primary font-medium transition-colors">
                    <LogIn size={18} />
                    <span>Login</span>
                  </Link>
                  <Link href="/register" className="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-lg font-medium transition-colors">
                    <UserPlus size={18} />
                    <span>Register</span>
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

          {/* Mobile View Toggle */}
          <div className="flex lg:hidden items-center gap-3">
            {mounted && (
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="p-2 text-text-secondary hover:text-primary transition-colors bg-surface-elevated rounded-full"
              >
                {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
              </button>
            )}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2.5 bg-primary text-white rounded-xl shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
            >
              {isOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Modern Side Drawer Menu */}
      <div 
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-[110] transition-opacity duration-300 lg:hidden ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsOpen(false)}
      />

      <aside 
        className={`fixed top-0 right-0 h-full w-[85%] max-w-sm bg-background border-l border-border-default z-[120] shadow-2xl transition-transform duration-500 ease-out lg:hidden ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Menu Header */}
          <div className="p-6 border-b border-border-default flex items-center justify-between bg-surface-elevated/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/20">
                <ShoppingBag size={20} />
              </div>
              <span className="font-bold font-syne text-lg text-foreground">Menu</span>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="p-2 hover:bg-surface-elevated rounded-full transition-colors text-text-secondary"
            >
              <X size={24} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            <div className="p-6 space-y-8">
              {/* Profile/Auth Section */}
              <div className="space-y-4">
                {user ? (
                  <div className="p-4 bg-primary/5 border border-primary/10 rounded-2xl">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white">
                        <User size={24} />
                      </div>
                      <div>
                        <p className="font-bold text-foreground">{user.username || 'Logged In'}</p>
                        <p className="text-xs text-text-secondary truncate max-w-[150px]">{user.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-white/50 dark:bg-black/20 rounded-xl">
                      <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">Balance</span>
                      <span className="text-lg font-bold text-primary">₦{Number(user.walletBalance).toLocaleString()}</span>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    <Link 
                      href="/login" 
                      className="flex items-center justify-center gap-2 p-4 bg-surface-elevated hover:bg-surface border border-border-default rounded-2xl font-bold transition-colors"
                    >
                      <LogIn size={18} className="text-primary" />
                      Login
                    </Link>
                    <Link 
                      href="/register" 
                      className="flex items-center justify-center gap-2 p-4 bg-primary hover:bg-primary-hover text-white rounded-2xl font-bold transition-all shadow-lg shadow-primary/20"
                    >
                      <UserPlus size={18} />
                      Join
                    </Link>
                  </div>
                )}
              </div>

              {/* Navigation Links */}
              <div className="space-y-6">
                <div>
                  <p className="text-[11px] font-bold text-text-muted uppercase tracking-[0.2em] mb-4 px-2">Marketplace</p>
                  <div className="space-y-2">
                    {navLinks.map((link) => (
                      <Link 
                        key={link.href} 
                        href={link.href} 
                        className={`flex items-center gap-4 p-4 rounded-2xl transition-all ${
                          pathname === link.href 
                            ? 'bg-primary/10 text-primary border border-primary/20' 
                            : 'text-foreground hover:bg-surface-elevated'
                        }`}
                      >
                        <link.icon size={20} className={pathname === link.href ? 'text-primary' : 'text-text-secondary'} />
                        <span className="font-bold">{link.name}</span>
                      </Link>
                    ))}
                  </div>
                </div>

                {user && (
                  <div>
                    <p className="text-[11px] font-bold text-text-muted uppercase tracking-[0.2em] mb-4 px-2">Account Dashboard</p>
                    <div className="space-y-2">
                      {dashboardLinks.map((link) => (
                        <Link 
                          key={link.href} 
                          href={link.href} 
                          className={`flex items-center gap-4 p-4 rounded-2xl transition-all ${
                            pathname === link.href 
                              ? 'bg-primary/10 text-primary border border-primary/20' 
                              : 'text-foreground hover:bg-surface-elevated'
                          }`}
                        >
                          <link.icon size={20} className={pathname === link.href ? 'text-primary' : 'text-text-secondary'} />
                          <span className="font-bold">{link.name}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Social & Support Footer */}
          <div className="p-6 border-t border-border-default bg-surface-elevated/30">
            <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-4 text-center">Contact & Support</p>
            <div className="flex items-center justify-center gap-4 mb-6">
              <a href="https://t.me/smlogsmarket" target="_blank" className="w-12 h-12 bg-background border border-border-default rounded-xl flex items-center justify-center text-text-secondary hover:text-primary transition-all shadow-sm">
                <Send size={20} />
              </a>
              <a href="https://wa.me/8801313839290" target="_blank" className="w-12 h-12 bg-background border border-border-default rounded-xl flex items-center justify-center text-text-secondary hover:text-primary transition-all shadow-sm">
                <Phone size={20} />
              </a>
              <a href="mailto:support@sumonmondal.com" className="w-12 h-12 bg-background border border-border-default rounded-xl flex items-center justify-center text-text-secondary hover:text-primary transition-all shadow-sm">
                <Shield size={20} />
              </a>
            </div>
            {user && (
              <button 
                onClick={() => fetch("/api/auth/logout", { method: "POST" }).then(() => window.location.href = "/login")}
                className="w-full flex items-center justify-center gap-3 p-4 bg-error/5 text-error rounded-2xl font-bold hover:bg-error/10 transition-colors"
              >
                <LogOut size={18} />
                Sign Out
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
