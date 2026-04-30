"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Package, Users, Settings, LogOut, Menu, X, Tags, AlertCircle } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  // Don't show sidebar on login/setup pages
  if (pathname.includes("/admin/login") || pathname.includes("/admin/setup")) {
    return <>{children}</>;
  }

  const navItems = [
    { name: "Overview", href: "/admin", icon: LayoutDashboard },
    { name: "Categories", href: "/admin/categories", icon: Tags },
    { name: "Products & Inventory", href: "/admin/products", icon: Package },
    { name: "Users & Wallets", href: "/admin/users", icon: Users },
    { name: "Tickets & Disputes", href: "/admin/tickets", icon: AlertCircle },
    { name: "Site Settings", href: "/admin/settings", icon: Settings },
  ];

  const handleLogout = async () => {
    await fetch("/api/admin/auth/logout", { 
      method: "POST",
      credentials: "include" 
    });
    router.push("/admin/login");
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <nav className="w-full border-b border-border-default bg-surface/50 backdrop-blur-md sticky top-0 z-50">
        <div className="px-4 h-16 flex items-center justify-between">
          <Link href="/admin" className="text-xl font-bold font-[family-name:var(--font-syne)] text-foreground flex items-center gap-2">
            <span className="w-8 h-8 rounded bg-foreground text-background flex items-center justify-center text-sm">SM</span>
            Admin Portal
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/" target="_blank" className="text-sm font-medium text-text-secondary hover:text-foreground">
              View Site ↗
            </Link>
          </div>
        </div>
      </nav>
      
      <div className="flex-1 flex w-full">
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
          ${isSidebarOpen ? "translate-x-0 pt-16 lg:pt-0" : "-translate-x-full lg:translate-x-0"}
        `}>
          <div className="flex flex-col h-full p-4">
            <div className="flex items-center justify-between lg:hidden mb-6 px-2">
              <span className="font-bold font-[family-name:var(--font-syne)] text-foreground">Admin Menu</span>
              <button onClick={() => setSidebarOpen(false)} className="text-text-muted hover:text-foreground">
                <X size={20} />
              </button>
            </div>

            <nav className="flex-1 space-y-1 lg:mt-4">
              {navItems.map((item) => {
                const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== "/admin");
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${
                      isActive 
                        ? 'bg-foreground text-background' 
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
        <main className="flex-1 w-full max-w-full overflow-hidden bg-background">
          <div className="lg:hidden p-4 border-b border-border-default flex items-center bg-surface sticky top-16 z-30">
            <button 
              onClick={() => setSidebarOpen(true)}
              className="flex items-center gap-2 text-text-secondary hover:text-foreground font-medium"
            >
              <Menu size={20} /> Open Menu
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
