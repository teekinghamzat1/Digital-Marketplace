"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Package } from "lucide-react";

export default function PurchaseHistory() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/orders", { credentials: 'include' })
      .then(res => {
        if (res.status === 401) { window.location.href = "/login"; return null; }
        return res.json();
      })
      .then(data => {
        setOrders(Array.isArray(data) ? data : []);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="animate-pulse space-y-4"><div className="h-16 bg-surface-elevated rounded-xl"></div><div className="h-16 bg-surface-elevated rounded-xl"></div></div>;

  return (
    <div>
      <h1 className="text-3xl font-bold font-[family-name:var(--font-syne)] text-foreground mb-8">
        Purchase History
      </h1>

      {orders.length === 0 ? (
        <div className="vault-card p-12 flex flex-col items-center text-center">
          <div className="w-20 h-20 bg-surface-elevated text-text-muted rounded-full flex items-center justify-center mb-4">
            <Package size={40} />
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2">No purchases yet</h2>
          <p className="text-text-secondary mb-6 max-w-md">You haven't bought any accounts. Visit the shop to browse our premium verified accounts.</p>
          <Link href="/shop" className="bg-primary hover:bg-primary-hover text-white px-8 py-3 rounded-xl font-bold transition-colors">
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <div key={order.id} className="vault-card p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-primary/50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
                  <Package size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-foreground text-lg">{order.product.name}</h3>
                  <p className="text-sm text-text-secondary">
                    <span className="font-mono">{order.id.split('-')[0]}</span> • {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-end border-t border-border-default sm:border-t-0 pt-4 sm:pt-0">
                <div className="text-left sm:text-right">
                  <p className="text-sm text-text-secondary font-medium">Quantity: {order.quantity}</p>
                  <p className="font-black text-foreground">₦{Number(order.totalAmount).toLocaleString()}</p>
                </div>
                <Link 
                  href={`/orders/${order.id}/success`} 
                  className="bg-surface-elevated hover:bg-border-default border border-border-default text-foreground px-4 py-2 rounded-lg font-bold text-sm transition-colors whitespace-nowrap"
                >
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
