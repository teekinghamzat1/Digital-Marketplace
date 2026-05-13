"use client";

import { 
  ShoppingBag, Search, Filter, Download, 
  ChevronRight, MoreVertical, Eye, Calendar,
  User as UserIcon, Package as PackageIcon, ExternalLink
} from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";

import { 
  ShoppingBag, Search, Filter, Download, 
  ChevronRight, MoreVertical, Eye, Calendar,
  User as UserIcon, Package as PackageIcon, ExternalLink
} from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";
import { OrderDetailView } from "./OrderDetailView";

interface Order {
  id: string;
  totalAmount: any;
  status: string;
  createdAt: Date;
  quantity?: number;
  user: { username: string; email: string };
  product: { name: string };
}

export function OrderList({ initialOrders }: { initialOrders: Order[] }) {
  const [orders, setOrders] = useState(initialOrders);
  const [filter, setFilter] = useState("All Orders");
  const [viewingOrderId, setViewingOrderId] = useState<string | null>(null);

  const filteredOrders = orders.filter(order => {
    if (filter === "All Orders") return true;
    return order.status.toLowerCase() === filter.toLowerCase();
  });

  return (
    <>
      <div className="space-y-6">
        {/* Status Filter Tabs (Mobile Scroll) */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2">
          {['All Orders', 'Pending', 'Completed', 'Failed', 'Refunded'].map((tab, idx) => (
            <button 
              key={idx}
              onClick={() => setFilter(tab)}
              className={`px-6 py-2.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                filter === tab 
                  ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                  : 'bg-surface-elevated text-text-muted hover:text-foreground border border-border-default'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="vault-card overflow-hidden border-border-default">
          {/* Desktop Table View */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-elevated/50 text-[10px] font-bold text-text-muted uppercase tracking-[0.2em]">
                  <th className="px-6 py-5">Order ID</th>
                  <th className="px-6 py-5">Customer</th>
                  <th className="px-6 py-5">Product</th>
                  <th className="px-6 py-5">Amount</th>
                  <th className="px-6 py-5">Status</th>
                  <th className="px-6 py-5">Date</th>
                  <th className="px-6 py-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-default">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="group hover:bg-surface-elevated/30 transition-all">
                    <td className="px-6 py-5">
                      <div className="font-mono text-xs text-primary font-bold">#{order.id.slice(0, 8)}</div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-surface-elevated border border-border-default flex items-center justify-center text-[10px] font-bold text-primary uppercase">
                          {order.user.username.slice(0, 2)}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-foreground truncate">{order.user.username}</p>
                          <p className="text-[10px] text-text-muted truncate">{order.user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2">
                        <PackageIcon size={14} className="text-text-muted" />
                        <span className="text-sm text-text-secondary">{order.product.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-sm font-bold text-foreground">₦{Number(order.totalAmount).toLocaleString()}</span>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`status-badge inline-block ${
                        order.status === 'completed' ? 'bg-success/15 text-success' : 
                        order.status === 'pending' ? 'bg-warning/15 text-warning' : 'bg-danger/15 text-danger'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2 text-text-muted">
                        <Calendar size={12} />
                        <span className="text-[11px] font-bold">{format(new Date(order.createdAt), 'MMM d, yyyy')}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <button 
                        onClick={() => setViewingOrderId(order.id)}
                        className="p-2 hover:bg-primary/10 text-text-muted hover:text-primary rounded-lg transition-colors"
                      >
                        <Eye size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card List View */}
          <div className="lg:hidden divide-y divide-border-default">
            {filteredOrders.map((order) => (
              <div key={order.id} className="p-5 active:bg-surface-elevated transition-colors">
                <div className="flex items-center justify-between mb-4">
                  <div className="font-mono text-xs text-primary font-bold">#{order.id.slice(0, 8)}</div>
                  <span className={`status-badge ${
                    order.status === 'completed' ? 'bg-success/15 text-success' : 
                    order.status === 'pending' ? 'bg-warning/15 text-warning' : 'bg-danger/15 text-danger'
                  }`}>
                    {order.status}
                  </span>
                </div>
                <div className="space-y-3 mb-5">
                   <div className="flex items-center gap-3">
                     <PackageIcon size={16} className="text-text-muted" />
                     <div>
                        <p className="text-sm font-bold text-foreground">{order.product.name}</p>
                        <p className="text-xs text-text-muted">{order.quantity || 1} Account(s)</p>
                     </div>
                   </div>
                   <div className="flex items-center gap-3">
                     <UserIcon size={16} className="text-text-muted" />
                     <p className="text-sm text-text-secondary">{order.user.username}</p>
                   </div>
                </div>
                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-2 text-text-muted">
                    <Calendar size={14} />
                    <span className="text-[11px] font-bold">{format(new Date(order.createdAt), 'MMM d, yyyy')}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold text-foreground mr-2">₦{Number(order.totalAmount).toLocaleString()}</span>
                    <button 
                      className="p-2.5 bg-background border border-border-default rounded-xl text-primary shadow-sm hover:border-primary transition-all"
                      onClick={() => setViewingOrderId(order.id)}
                    >
                      <ExternalLink size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredOrders.length === 0 && (
            <div className="p-16 text-center text-text-muted">
              <ShoppingBag size={64} className="mx-auto mb-6 opacity-10" />
              <h3 className="text-lg font-bold text-foreground mb-2">No Orders Found</h3>
              <p className="text-sm max-w-xs mx-auto">Wait for customers to start purchasing your digital products.</p>
            </div>
          )}
        </div>
      </div>

      )}
    </>
  );
}
