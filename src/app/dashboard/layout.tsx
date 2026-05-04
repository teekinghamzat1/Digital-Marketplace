"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, ShoppingBag, Wallet, Settings, LogOut } from "lucide-react";
import { Navbar } from "@/components/navbar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

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
          <div className="p-4 md:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
