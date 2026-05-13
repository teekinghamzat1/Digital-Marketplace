"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  LayoutDashboard, ShoppingBag, Tag, Package, 
  Users, MessageSquareWarning, Settings2, LogOut,
  Menu, X, ChevronRight, User
} from "lucide-react";
import { SiteSettings } from "@/lib/settings-client";

interface AdminSidebarProps {
  settings?: SiteSettings;
  adminName?: string;
}

export function AdminSidebar({ settings, adminName = "Admin" }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);

  // Close sidebar on mobile when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  const navItems = [
    { label: "MAIN NAVIGATION", type: "label" },
    { name: "Overview", href: "/admin", icon: LayoutDashboard },
    { name: "Order Management", href: "/admin/orders", icon: ShoppingBag },
    { name: "Categories", href: "/admin/categories", icon: Tag },
    { name: "Products & Inventory", href: "/admin/products", icon: Package },
    { name: "Users & Wallets", href: "/admin/users", icon: Users },
    { name: "Tickets & Disputes", href: "/admin/tickets", icon: MessageSquareWarning, badge: 3 },
    { label: "CONFIGURATION", type: "label" },
    { name: "Site Settings", href: "/admin/settings", icon: Settings2 },
  ];

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  const NavLink = ({ item }: { item: any }) => {
    if (item.type === "label") {
      return (
        <p className="text-[10px] font-bold text-text-muted uppercase tracking-[0.2em] px-6 mt-8 mb-4">
          {item.label}
        </p>
      );
    }

    const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
    const Icon = item.icon;

    return (
      <Link
        href={item.href}
        className={`flex items-center gap-3 px-5 py-3.5 mx-3 rounded-xl font-medium transition-all duration-200 group relative ${
          isActive 
            ? 'bg-primary/10 text-primary' 
            : 'text-text-secondary hover:bg-white/5 hover:text-foreground'
        }`}
      >
        {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full" />}
        <Icon size={20} className={isActive ? 'text-primary' : 'text-text-muted group-hover:text-primary transition-colors'} />
        <span className="flex-1">{item.name}</span>
        {item.badge && (
          <span className="bg-danger text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
            {item.badge}
          </span>
        )}
      </Link>
    );
  };

  return (
    <>
      {/* Mobile Header Bar */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-surface border-b border-white/10 flex items-center justify-between px-4 z-[100]">
        <Link href="/admin" className="text-xl font-bold font-syne text-primary truncate max-w-[200px]">
          {settings?.siteName || "Admin Dashboard"}
        </Link>
        <button 
          onClick={() => setIsOpen(true)}
          className="w-10 h-10 flex items-center justify-center bg-primary/10 text-primary rounded-xl"
        >
          <Menu size={24} />
        </button>
      </header>

      {/* Mobile Drawer Overlay */}
      <div 
        className={`lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-[110] transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsOpen(false)}
      />

      {/* Sidebar Drawer */}
      <aside 
        className={`fixed top-0 left-0 h-full bg-surface border-r border-white/10 z-[120] transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } ${isExpanded ? 'w-[280px]' : 'lg:w-[80px]'}`}
      >
        <div className="flex flex-col h-full overflow-hidden">
          {/* Logo Section */}
          <div className="h-20 flex items-center justify-between px-6 border-b border-white/5 shrink-0">
            <Link href="/admin" className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white shrink-0">
                <LayoutDashboard size={18} />
              </div>
              {isExpanded && (
                <span className="font-bold text-lg text-foreground font-syne tracking-tight truncate max-w-[160px]">
                  {settings?.siteName || "Admin Panel"}
                </span>
              )}
            </Link>
            <button 
              onClick={() => setIsOpen(false)} 
              className="lg:hidden text-text-muted hover:text-white"
            >
              <X size={20} />
            </button>
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 overflow-y-auto py-6 custom-scrollbar">
            {navItems.map((item, idx) => (
              <NavLink key={idx} item={item} />
            ))}
          </nav>

          {/* Bottom Profile Section */}
          <div className="p-4 mt-auto border-t border-white/5 bg-white/2">
            <div className={`flex items-center gap-3 p-3 rounded-2xl bg-surface-raised border border-white/5 ${!isExpanded && 'lg:justify-center'}`}>
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary shrink-0">
                <User size={20} />
              </div>
              {isExpanded && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-foreground truncate">{adminName}</p>
                  <p className="text-[10px] text-text-muted uppercase font-bold tracking-widest">Administrator</p>
                </div>
              )}
            </div>
            {isExpanded && (
              <button 
                onClick={handleLogout}
                className="w-full mt-3 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold text-sm text-danger bg-danger/10 hover:bg-danger/20 transition-all"
              >
                <LogOut size={18} />
                Logout Session
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
