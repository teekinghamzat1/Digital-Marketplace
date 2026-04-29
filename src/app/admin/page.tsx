"use client";

import { useState, useEffect } from "react";
import { Users, ShoppingBag, DollarSign, Package } from "lucide-react";

export default function AdminOverview() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/stats", { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        setStats(data);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="animate-pulse flex flex-wrap gap-6"><div className="vault-card h-32 w-full md:w-[calc(50%-12px)] lg:w-[calc(25%-18px)]"></div><div className="vault-card h-32 w-full md:w-[calc(50%-12px)] lg:w-[calc(25%-18px)]"></div></div>;

  return (
    <div>
      <h1 className="text-3xl font-bold font-[family-name:var(--font-syne)] text-foreground mb-8">
        Dashboard Overview
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="vault-card p-6 border-border-default">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <DollarSign size={20} />
            </div>
            <h2 className="text-sm font-bold text-text-secondary uppercase tracking-wider">Total Revenue</h2>
          </div>
          <p className="text-3xl font-black text-foreground">₦{Number(stats?.totalRevenue || 0).toLocaleString()}</p>
        </div>

        <div className="vault-card p-6 border-border-default">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-10 h-10 rounded-lg bg-success/10 text-success flex items-center justify-center">
              <ShoppingBag size={20} />
            </div>
            <h2 className="text-sm font-bold text-text-secondary uppercase tracking-wider">Total Orders</h2>
          </div>
          <p className="text-3xl font-black text-foreground">{stats?.totalOrders || 0}</p>
        </div>

        <div className="vault-card p-6 border-border-default">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-10 h-10 rounded-lg bg-foreground text-background flex items-center justify-center">
              <Users size={20} />
            </div>
            <h2 className="text-sm font-bold text-text-secondary uppercase tracking-wider">Registered Users</h2>
          </div>
          <p className="text-3xl font-black text-foreground">{stats?.totalUsers || 0}</p>
        </div>

        <div className="vault-card p-6 border-border-default">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-10 h-10 rounded-lg bg-warning/10 text-warning flex items-center justify-center">
              <Package size={20} />
            </div>
            <h2 className="text-sm font-bold text-text-secondary uppercase tracking-wider">Available Stock</h2>
          </div>
          <p className="text-3xl font-black text-foreground">{stats?.availableItems || 0}</p>
        </div>
      </div>
    </div>
  );
}
