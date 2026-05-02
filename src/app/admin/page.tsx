"use client";

import { useState, useEffect } from "react";
import { Users, ShoppingBag, DollarSign, Package, AlertCircle, ArrowUpRight, TrendingUp, History } from "lucide-react";
import Link from "next/link";

export default function AdminOverview() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/stats", { credentials: 'include' })
      .then(res => res.json())
      .then(resData => {
        setData(resData);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="animate-pulse space-y-8">
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {[...Array(4)].map((_, i) => <div key={i} className="h-32 bg-surface-elevated rounded-xl"></div>)}
    </div>
    <div className="h-96 bg-surface-elevated rounded-xl"></div>
  </div>;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-[family-name:var(--font-syne)] text-foreground">
          Dashboard Overview
        </h1>
        <p className="text-text-secondary mt-1">Marketplace performance and sales tracking.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="vault-card p-6 border-border-default">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <DollarSign size={20} />
            </div>
            <h2 className="text-sm font-bold text-text-secondary uppercase tracking-wider">Total Revenue</h2>
          </div>
          <p className="text-3xl font-black text-foreground">₦{Number(data.totalRevenue).toLocaleString()}</p>
          <p className="text-xs text-success font-bold mt-2">Lifetime Sales</p>
        </div>

        <div className="vault-card p-6 border-border-default">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-10 h-10 rounded-lg bg-success/10 text-success flex items-center justify-center">
              <ShoppingBag size={20} />
            </div>
            <h2 className="text-sm font-bold text-text-secondary uppercase tracking-wider">Transactions</h2>
          </div>
          <p className="text-3xl font-black text-foreground">{data.totalTransactions}</p>
          <p className="text-xs text-text-muted mt-2">Successful purchases</p>
        </div>

        <div className="vault-card p-6 border-border-default">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center">
              <Users size={20} />
            </div>
            <h2 className="text-sm font-bold text-text-secondary uppercase tracking-wider">Total Users</h2>
          </div>
          <p className="text-3xl font-black text-foreground">{data.totalUsers}</p>
          <p className="text-xs text-text-muted mt-2">Registered accounts</p>
        </div>

        <div className="vault-card p-6 border-border-default">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-10 h-10 rounded-lg bg-warning/10 text-warning flex items-center justify-center">
              <Package size={20} />
            </div>
            <h2 className="text-sm font-bold text-text-secondary uppercase tracking-wider">Products</h2>
          </div>
          <p className="text-3xl font-black text-foreground">{data.activeProducts}</p>
          <p className="text-xs text-text-muted mt-2">Active listings</p>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="vault-card p-6 border-border-default">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <History className="text-primary" size={24} />
            <h2 className="text-xl font-bold text-foreground font-[family-name:var(--font-syne)]">Recent Transactions</h2>
          </div>
          <Link href="/admin/transactions" className="text-sm font-bold text-primary hover:underline">View All</Link>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-surface-elevated border-b border-border-default">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-text-muted uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-xs font-bold text-text-muted uppercase tracking-wider">User</th>
                <th className="px-6 py-4 text-xs font-bold text-text-muted uppercase tracking-wider">Product</th>
                <th className="px-6 py-4 text-xs font-bold text-text-muted uppercase tracking-wider">Tier</th>
                <th className="px-6 py-4 text-xs font-bold text-text-muted uppercase tracking-wider">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-default">
              {data.transactions.map((tx: any) => (
                <tr key={tx.id} className="hover:bg-surface-elevated/50">
                  <td className="px-6 py-4 text-sm text-text-secondary">
                    {new Date(tx.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-foreground">{tx.user.email}</td>
                  <td className="px-6 py-4 text-sm text-text-secondary">{tx.product.name}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-primary/10 text-primary text-xs font-bold rounded">
                      {tx.pricingTier.label} ({tx.pricingTier.quantity} Units)
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-black text-foreground">₦{Number(tx.amount).toLocaleString()}</td>
                </tr>
              ))}
              {data.transactions.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-text-muted italic">No transactions yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="vault-card p-6 bg-gradient-to-br from-primary/10 to-transparent border-primary/20">
          <h3 className="text-xl font-bold text-foreground mb-4">Quick Management</h3>
          <div className="grid grid-cols-2 gap-4">
            <Link href="/admin/products" className="bg-surface-elevated p-4 rounded-xl border border-border-default hover:border-primary/50 transition-colors">
              <Package size={20} className="mb-2 text-primary" />
              <p className="font-bold text-sm">Products & Tiers</p>
            </Link>
            <Link href="/admin/categories" className="bg-surface-elevated p-4 rounded-xl border border-border-default hover:border-primary/50 transition-colors">
              <ShoppingBag size={20} className="mb-2 text-warning" />
              <p className="font-bold text-sm">Categories</p>
            </Link>
            <Link href="/admin/users" className="bg-surface-elevated p-4 rounded-xl border border-border-default hover:border-primary/50 transition-colors">
              <Users size={20} className="mb-2 text-blue-400" />
              <p className="font-bold text-sm">Users</p>
            </Link>
            <Link href="/admin/settings" className="bg-surface-elevated p-4 rounded-xl border border-border-default hover:border-primary/50 transition-colors">
              <AlertCircle size={20} className="mb-2 text-error" />
              <p className="font-bold text-sm">Settings</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
