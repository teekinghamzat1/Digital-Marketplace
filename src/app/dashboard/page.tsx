"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Wallet, ShoppingBag, ArrowRight } from "lucide-react";

export default function DashboardOverview() {
  const [user, setUser] = useState<any>(null);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/auth/me", { method: "GET", credentials: "include" }).then(res => {
        if (res.status === 401) { window.location.href = "/login"; return null; }
        return res.json();
      }),
      fetch("/api/orders?limit=3", { method: "GET", credentials: "include" }).then(res => res.json())
    ]).then(([userData, ordersData]) => {
      if (userData) setUser(userData);
      setRecentOrders(Array.isArray(ordersData) ? ordersData : []);
      setLoading(false);
    });
  }, []);

  if (loading) return (
    <div className="animate-pulse flex flex-col gap-6">
      <div className="h-16 w-3/4 bg-surface-elevated rounded-lg" />
      <div className="h-48 w-full bg-surface-elevated rounded-2xl" />
      <div className="h-24 w-full bg-surface-elevated rounded-2xl" />
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      {/* 2. Greeting Block */}
      <div>
        <h1 className="text-3xl font-bold font-[family-name:var(--font-syne)] text-foreground tracking-tight">
          Welcome back, {user?.username}
        </h1>
        <p className="text-text-secondary mt-1">Here's what's happening with your account</p>
      </div>

      {/* Main Top Area: Wallet (Left) & CTA (Right on desktop) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* 3. WALLET CARD (PRIMARY FOCUS) */}
        <div className="lg:col-span-2 bg-surface border border-border-default rounded-2xl p-6 md:p-8 shadow-lg shadow-black/5 flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-10 -mt-10 transition-transform group-hover:scale-150 duration-700" />
          
          <div className="flex items-center gap-3 mb-6 relative z-10">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <Wallet size={20} />
            </div>
            <h2 className="text-sm font-bold text-text-secondary uppercase tracking-wider">Wallet Balance</h2>
          </div>
          
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
            <p className="text-4xl md:text-5xl font-black text-foreground tracking-tight">
              ₦{Number(user?.walletBalance).toLocaleString()}
            </p>
            <Link 
              href="/dashboard/wallet" 
              className="bg-primary hover:bg-primary-hover active:scale-95 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-md shadow-primary/20 flex items-center justify-center gap-2 w-full sm:w-auto"
            >
              Fund Wallet <ArrowRight size={18} />
            </Link>
          </div>
        </div>

        {/* Desktop CTA (Secondary card) */}
        <div className="hidden lg:flex bg-surface-elevated border border-border-default rounded-2xl p-6 flex-col justify-center items-center text-center transition-all hover:border-primary/30">
          <div className="w-14 h-14 rounded-full bg-surface text-text-secondary flex items-center justify-center mb-4">
            <ShoppingBag size={24} />
          </div>
          <h2 className="text-lg font-bold text-foreground mb-1">Need accounts?</h2>
          <p className="text-text-secondary text-sm mb-6">Browse premium verified digital goods.</p>
          <Link href="/shop" className="text-primary hover:text-primary-hover font-bold transition-colors text-sm border-b-2 border-primary/20 hover:border-primary pb-0.5">
            Go to Shop →
          </Link>
        </div>
      </div>

      {/* 4. QUICK ACTIONS (MOBILE ORIENTED) */}
      <div className="lg:hidden">
        <h3 className="text-sm font-bold text-text-muted uppercase tracking-wider mb-4">Quick Actions</h3>
        <div className="flex overflow-x-auto gap-4 pb-4 snap-x hide-scrollbar -mx-4 px-4">
          <Link href="/shop" className="snap-start flex-none w-36 bg-surface border border-border-default rounded-2xl p-4 flex flex-col items-center justify-center gap-3 hover:border-primary/50 transition-colors active:scale-95">
            <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center">
              <ShoppingBag size={20} />
            </div>
            <span className="text-sm font-bold text-foreground">Browse Shop</span>
          </Link>
          
          <Link href="/dashboard/wallet" className="snap-start flex-none w-36 bg-surface border border-border-default rounded-2xl p-4 flex flex-col items-center justify-center gap-3 hover:border-primary/50 transition-colors active:scale-95">
            <div className="w-12 h-12 rounded-full bg-success/10 text-success flex items-center justify-center">
              <Wallet size={20} />
            </div>
            <span className="text-sm font-bold text-foreground">Fund Wallet</span>
          </Link>

          <Link href="/dashboard/orders" className="snap-start flex-none w-36 bg-surface border border-border-default rounded-2xl p-4 flex flex-col items-center justify-center gap-3 hover:border-primary/50 transition-colors active:scale-95">
            <div className="w-12 h-12 rounded-full bg-surface-elevated text-text-secondary flex items-center justify-center">
              <ArrowRight size={20} />
            </div>
            <span className="text-sm font-bold text-foreground">View Orders</span>
          </Link>
        </div>
      </div>

      {/* 5. RECENT ORDERS */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold font-[family-name:var(--font-syne)] text-foreground">Recent Orders</h2>
          <Link href="/dashboard/orders" className="text-primary hover:text-primary-hover font-bold text-sm bg-primary/5 px-3 py-1.5 rounded-lg transition-colors">
            View All
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="bg-surface border border-border-default rounded-2xl p-8 md:p-12 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-surface-elevated rounded-full flex items-center justify-center text-text-muted mb-4">
              <ShoppingBag size={24} />
            </div>
            <h3 className="text-lg font-bold text-foreground mb-2">No purchases yet</h3>
            <p className="text-text-secondary text-sm mb-6 max-w-sm">When you buy digital products from the marketplace, they will securely appear here.</p>
            <Link href="/shop" className="bg-foreground text-background hover:bg-foreground/90 px-6 py-3 rounded-xl font-bold transition-all active:scale-95">
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {recentOrders.map(order => (
              <Link 
                href={`/orders/${order.id}/success`} 
                key={order.id} 
                className="bg-surface border border-border-default hover:border-primary/30 rounded-2xl p-4 md:p-5 flex items-center justify-between transition-all hover:shadow-md hover:-translate-y-0.5 group"
              >
                <div className="flex items-center gap-4">
                  <div className="hidden sm:flex w-12 h-12 bg-surface-elevated rounded-xl items-center justify-center text-text-secondary group-hover:text-primary transition-colors">
                    <ShoppingBag size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground text-base md:text-lg leading-tight mb-1">{order.product.name}</h3>
                    <div className="flex items-center gap-2 text-xs md:text-sm text-text-secondary">
                      <span className="font-medium">{order.quantity} Units</span>
                      <span className="w-1 h-1 rounded-full bg-border-default" />
                      <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="font-bold text-foreground">₦{Number(order.totalAmount).toLocaleString()}</span>
                  <span className="text-[10px] md:text-xs font-bold text-success bg-success/10 px-2 py-0.5 rounded-full">Delivered</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
