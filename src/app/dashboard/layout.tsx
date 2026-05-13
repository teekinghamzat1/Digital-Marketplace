"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, ShoppingBag, Wallet, Settings, LogOut, Moon, Sun } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  const navItems = [
    { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
    { name: "Purchase History", href: "/dashboard/orders", icon: ShoppingBag },
    { name: "Wallet & Funding", href: "/dashboard/wallet", icon: Wallet },
    { name: "Account Settings", href: "/dashboard/settings", icon: Settings },
  ];

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { 
      method: "POST",
      credentials: "include" 
    });
    router.push("/login");
    router.refresh();
  };

  return (
    <>
      
      <div className="flex-1 flex max-w-7xl mx-auto w-full">
        {/* Desktop Sidebar (Always visible on large screens) */}
        <aside className="hidden lg:block w-64 bg-surface border-r border-border-default">
          <div className="flex flex-col h-full p-4">
            <nav className="flex-1 space-y-1 mt-8">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${
                      isActive 
                        ? 'bg-primary/10 text-primary' 
                        : 'text-text-secondary hover:bg-surface-elevated hover:text-foreground'
                    }`}
                  >
                    <Icon size={20} />
                    {item.name}
                  </Link>
                );
              })}
            </nav>

            <div className="mt-auto space-y-2">
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all hover:bg-surface-elevated text-text-secondary hover:text-foreground border border-transparent hover:border-border-default"
              >
                {theme === 'dark' ? <Sun size={20} className="text-primary" /> : <Moon size={20} className="text-primary" />}
                {theme === 'dark' ? 'Switch to Light' : 'Switch to Dark'}
              </button>
              <button 
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-error hover:bg-error/10 transition-colors"
              >
                <LogOut size={20} />
                Logout
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 w-full max-w-full overflow-hidden">
          <div className="p-4 md:p-8">
            {children}
          </div>
        </main>
      </div>
    </>
  );
}
