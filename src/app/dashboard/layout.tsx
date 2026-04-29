"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, ShoppingBag, Wallet, Settings, LogOut, Menu, X } from "lucide-react";
import { Navbar } from "@/components/navbar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isSidebarOpen, setSidebarOpen] = useState(false);

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
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <div className="flex-1 flex max-w-7xl mx-auto w-full">
        {/* Mobile Sidebar Overlay */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside className={`
          fixed lg:static inset-y-0 left-0 z-50 w-64 bg-surface border-r border-border-default transform transition-transform duration-300 lg:transform-none
          ${isSidebarOpen ? "translate-x-0 pt-20 lg:pt-0" : "-translate-x-full lg:translate-x-0"}
        `}>
          <div className="flex flex-col h-full p-4">
            <div className="flex items-center justify-between lg:hidden mb-6 px-2">
              <span className="font-bold font-[family-name:var(--font-syne)] text-foreground">Menu</span>
              <button onClick={() => setSidebarOpen(false)} className="text-text-muted hover:text-foreground">
                <X size={20} />
              </button>
            </div>

            <nav className="flex-1 space-y-1 lg:mt-8">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
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

            <button 
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-error hover:bg-error/10 transition-colors mt-auto"
            >
              <LogOut size={20} />
              Logout
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 w-full max-w-full overflow-hidden">
          <div className="lg:hidden p-4 border-b border-border-default flex items-center bg-surface sticky top-16 z-30">
            <button 
              onClick={() => setSidebarOpen(true)}
              className="flex items-center gap-2 text-text-secondary hover:text-foreground font-medium"
            >
              <Menu size={20} /> Dashboard Menu
            </button>
          </div>
          <div className="p-4 md:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
