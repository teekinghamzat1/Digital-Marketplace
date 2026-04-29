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

  if (loading) return <div className="animate-pulse flex gap-6"><div className="vault-card h-48 flex-1"></div><div className="vault-card h-48 flex-1"></div></div>;

  return (
    <div>
      <h1 className="text-3xl font-bold font-[family-name:var(--font-syne)] text-foreground mb-8">
        Welcome, {user?.username}
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        <div className="vault-card p-6 bg-gradient-to-br from-surface to-surface-elevated border-primary/20">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center">
              <Wallet size={24} />
            </div>
            <h2 className="text-lg font-bold text-text-secondary">Wallet Balance</h2>
          </div>
          <p className="text-4xl font-black text-foreground font-[family-name:var(--font-syne)] mb-6">
            ₦{Number(user?.walletBalance).toLocaleString()}
          </p>
          <Link href="/dashboard/wallet" className="inline-flex items-center gap-2 text-primary hover:text-primary-hover font-bold transition-colors">
            Fund Wallet <ArrowRight size={16} />
          </Link>
        </div>

        <div className="vault-card p-6 flex flex-col justify-center items-center text-center">
          <div className="w-16 h-16 rounded-full bg-surface-elevated text-text-muted flex items-center justify-center mb-4">
            <ShoppingBag size={32} />
          </div>
          <h2 className="text-lg font-bold text-foreground mb-2">Need more accounts?</h2>
          <p className="text-text-secondary text-sm mb-4">Browse our marketplace for premium verified accounts.</p>
          <Link href="/shop" className="bg-primary hover:bg-primary-hover text-white px-6 py-2 rounded-lg font-bold transition-colors">
            Go to Shop
          </Link>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold font-[family-name:var(--font-syne)] text-foreground">Recent Orders</h2>
          <Link href="/dashboard/orders" className="text-primary hover:underline font-bold text-sm">
            View All
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="bg-surface-elevated rounded-xl p-8 text-center border border-border-default">
            <p className="text-text-muted">You haven't made any purchases yet.</p>
          </div>
        ) : (
          <div className="bg-surface border border-border-default rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-surface-elevated border-b border-border-default">
                  <tr>
                    <th className="px-6 py-4 text-xs font-bold text-text-muted uppercase tracking-wider">Order ID</th>
                    <th className="px-6 py-4 text-xs font-bold text-text-muted uppercase tracking-wider">Product</th>
                    <th className="px-6 py-4 text-xs font-bold text-text-muted uppercase tracking-wider">Date</th>
                    <th className="px-6 py-4 text-xs font-bold text-text-muted uppercase tracking-wider">Total</th>
                    <th className="px-6 py-4 text-xs font-bold text-text-muted uppercase tracking-wider text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-default">
                  {recentOrders.map(order => (
                    <tr key={order.id} className="hover:bg-surface-elevated/50 transition-colors">
                      <td className="px-6 py-4 text-sm font-mono text-text-secondary">{order.id.split('-')[0]}</td>
                      <td className="px-6 py-4 text-sm font-medium text-foreground">{order.product.name}</td>
                      <td className="px-6 py-4 text-sm text-text-secondary">{new Date(order.createdAt).toLocaleDateString()}</td>
                      <td className="px-6 py-4 text-sm font-bold text-foreground">₦{Number(order.totalAmount).toLocaleString()}</td>
                      <td className="px-6 py-4 text-right">
                        <Link href={`/orders/${order.id}/success`} className="text-primary hover:text-primary-hover font-bold text-sm">
                          View Credentials
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
