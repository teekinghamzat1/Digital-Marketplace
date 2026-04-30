"use client";

import { useState, useEffect } from "react";
import { Users, ShoppingBag, DollarSign, Package, AlertCircle, ArrowUpRight, TrendingUp } from "lucide-react";
import Link from "next/link";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, Cell, PieChart, Pie
} from 'recharts';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function AdminOverview() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/analytics", { credentials: 'include' })
      .then(res => res.json())
      .then(resData => {
        setData(resData);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="animate-pulse space-y-8"><div className="h-32 bg-surface-elevated rounded-xl"></div><div className="h-64 bg-surface-elevated rounded-xl"></div></div>;

  const { stats, salesByCategory, revenueOverTime } = data;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-[family-name:var(--font-syne)] text-foreground">
          Dashboard Overview
        </h1>
        <p className="text-text-secondary mt-1">Real-time performance metrics and analytics.</p>
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
          <p className="text-3xl font-black text-foreground">₦{Number(stats.totalRevenue).toLocaleString()}</p>
          <div className="mt-2 flex items-center gap-1 text-xs text-success font-bold">
            <ArrowUpRight size={14} /> Total Lifetime
          </div>
        </div>

        <div className="vault-card p-6 border-border-default">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-10 h-10 rounded-lg bg-success/10 text-success flex items-center justify-center">
              <ShoppingBag size={20} />
            </div>
            <h2 className="text-sm font-bold text-text-secondary uppercase tracking-wider">Orders</h2>
          </div>
          <p className="text-3xl font-black text-foreground">{stats.totalOrders}</p>
          <p className="text-xs text-text-muted mt-2">All-time purchases</p>
        </div>

        <div className="vault-card p-6 border-border-default">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center">
              <Users size={20} />
            </div>
            <h2 className="text-sm font-bold text-text-secondary uppercase tracking-wider">Total Users</h2>
          </div>
          <p className="text-3xl font-black text-foreground">{stats.totalUsers}</p>
          <p className="text-xs text-text-muted mt-2">Registered accounts</p>
        </div>

        <div className="vault-card p-6 border-border-default">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-10 h-10 rounded-lg bg-warning/10 text-warning flex items-center justify-center">
              <TrendingUp size={20} />
            </div>
            <h2 className="text-sm font-bold text-text-secondary uppercase tracking-wider">Wallet Liability</h2>
          </div>
          <p className="text-3xl font-black text-foreground">₦{Number(stats.totalWalletFunds).toLocaleString()}</p>
          <p className="text-xs text-text-muted mt-2">Held by users</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 vault-card p-6">
          <h3 className="text-lg font-bold text-foreground mb-6 font-[family-name:var(--font-syne)]">Revenue (Last 7 Days)</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueOverTime}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" />
                <XAxis dataKey="date" stroke="#666" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#666" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₦${value}`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '8px' }}
                  itemStyle={{ color: '#10b981', fontWeight: 'bold' }}
                />
                <Line type="monotone" dataKey="value" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#10b981' }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sales by Category */}
        <div className="vault-card p-6">
          <h3 className="text-lg font-bold text-foreground mb-6 font-[family-name:var(--font-syne)]">Category Breakdown</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={salesByCategory}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {salesByCategory.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '8px' }}
                  formatter={(value) => `₦${Number(value).toLocaleString()}`}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 space-y-2">
            {salesByCategory.slice(0, 4).map((cat: any, index: number) => (
              <div key={cat.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                  <span className="text-text-secondary">{cat.name}</span>
                </div>
                <span className="text-foreground font-bold">₦{Number(cat.value).toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="vault-card p-6 flex flex-col items-center justify-center text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center">
            <AlertCircle size={32} />
          </div>
          <h3 className="text-xl font-bold text-foreground">Need to handle disputes?</h3>
          <p className="text-text-secondary max-w-sm">Review user complaints and process manual refunds in the Tickets section.</p>
          <Link href="/admin/tickets" className="bg-foreground text-background px-8 py-3 rounded-xl font-bold transition-transform hover:scale-105">
            View All Tickets
          </Link>
        </div>

        <div className="vault-card p-6 bg-gradient-to-br from-primary/10 to-transparent border-primary/20">
          <h3 className="text-xl font-bold text-foreground mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-4">
            <Link href="/admin/products" className="bg-surface-elevated p-4 rounded-xl border border-border-default hover:border-primary/50 transition-colors">
              <Package size={20} className="mb-2 text-primary" />
              <p className="font-bold text-sm">Add Logs</p>
            </Link>
            <Link href="/admin/users" className="bg-surface-elevated p-4 rounded-xl border border-border-default hover:border-primary/50 transition-colors">
              <DollarSign size={20} className="mb-2 text-success" />
              <p className="font-bold text-sm">Fund User</p>
            </Link>
            <Link href="/admin/settings" className="bg-surface-elevated p-4 rounded-xl border border-border-default hover:border-primary/50 transition-colors">
              <Users size={20} className="mb-2 text-blue-400" />
              <p className="font-bold text-sm">Settings</p>
            </Link>
            <Link href="/admin/categories" className="bg-surface-elevated p-4 rounded-xl border border-border-default hover:border-primary/50 transition-colors">
              <ShoppingBag size={20} className="mb-2 text-warning" />
              <p className="font-bold text-sm">Categories</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
