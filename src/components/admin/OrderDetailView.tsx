"use client";

import { useState, useEffect } from "react";
import { 
  X, ShoppingBag, User as UserIcon, Package as PackageIcon, 
  Calendar, CreditCard, ShieldCheck, Copy, CheckCircle2,
  AlertCircle, Loader2, Key
} from "lucide-react";
import { format } from "date-fns";

interface OrderDetailProps {
  orderId: string;
  onClose: () => void;
}

export function OrderDetailView({ orderId, onClose }: OrderDetailProps) {
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`);
      const data = await res.json();
      setOrder(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[300] flex items-center justify-center">
      <Loader2 className="animate-spin text-primary" size={48} />
    </div>
  );

  if (!order) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-md z-[300] flex items-center justify-center p-4 animate-in fade-in">
      <div className="w-full max-w-2xl bg-background border border-border-default rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-8 border-b border-border-default flex items-center justify-between bg-surface-elevated/20">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
              <ShoppingBag size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-foreground">Order Details</h3>
              <p className="text-[10px] font-bold text-text-muted uppercase tracking-[0.2em]">Transaction Reference: #{order.id.slice(0, 8)}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-full hover:bg-surface-elevated flex items-center justify-center text-text-muted hover:text-foreground transition-all"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
          {/* Summary Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="vault-card p-5 border-border-default bg-surface-elevated/10">
                <div className="flex items-center gap-3 mb-4">
                  <UserIcon size={16} className="text-primary" />
                  <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Customer Info</span>
                </div>
                <p className="text-sm font-bold text-foreground">{order.user.username}</p>
                <p className="text-xs text-text-secondary">{order.user.email}</p>
             </div>
             <div className="vault-card p-5 border-border-default bg-surface-elevated/10">
                <div className="flex items-center gap-3 mb-4">
                  <Calendar size={16} className="text-primary" />
                  <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Order Timeline</span>
                </div>
                <p className="text-sm font-bold text-foreground">{format(new Date(order.createdAt), 'MMMM d, yyyy')}</p>
                <p className="text-xs text-text-secondary">{format(new Date(order.createdAt), 'HH:mm:ss (UTC)')}</p>
             </div>
          </div>

          {/* Product Info */}
          <div className="bg-surface-elevated/30 rounded-3xl border border-border-default p-6">
             <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                   <PackageIcon size={20} className="text-primary" />
                   <h4 className="text-lg font-bold text-foreground">{order.product.name}</h4>
                </div>
                <span className={`status-badge ${
                  order.status === 'completed' ? 'bg-success/15 text-success' : 'bg-warning/15 text-warning'
                }`}>
                  {order.status}
                </span>
             </div>
             
             <div className="flex items-center justify-between py-4 border-t border-border-default">
                <p className="text-sm text-text-secondary font-bold">Total Paid</p>
                <p className="text-xl font-black text-foreground">₦{Number(order.totalAmount).toLocaleString()}</p>
             </div>
          </div>

          {/* Sold Credentials */}
          <div className="space-y-4">
             <div className="flex items-center justify-between px-2">
                <h4 className="text-[10px] font-bold text-text-muted uppercase tracking-[0.2em] flex items-center gap-2">
                   <Key size={14} className="text-primary" />
                   Delivered Assets ({order.items?.length || 0})
                </h4>
             </div>
             
             <div className="space-y-3">
                {order.items?.map((item: any, idx: number) => (
                  <div key={item.id} className="group bg-background border border-border-default rounded-2xl p-4 flex items-center justify-between hover:border-primary transition-all shadow-sm">
                     <div className="min-w-0">
                        <p className="text-[10px] font-bold text-text-muted uppercase mb-1">Asset #{idx + 1}</p>
                        <p className="text-sm font-mono text-foreground font-bold truncate pr-4">{item.credentialText}</p>
                     </div>
                     <button 
                      onClick={() => copyToClipboard(item.credentialText)}
                      className="p-2.5 bg-surface-elevated text-text-muted hover:text-primary rounded-xl transition-all"
                     >
                       <Copy size={18} />
                     </button>
                  </div>
                ))}
                {(!order.items || order.items.length === 0) && (
                  <div className="text-center py-10 border border-dashed border-border-default rounded-2xl">
                     <AlertCircle size={32} className="mx-auto mb-2 opacity-10 text-foreground" />
                     <p className="text-xs text-text-muted font-bold uppercase tracking-widest">No assets attached to this order.</p>
                  </div>
                )}
             </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-8 border-t border-border-default bg-surface-elevated/10 flex justify-end">
           <button 
            onClick={onClose}
            className="px-8 py-3 bg-foreground text-background rounded-2xl font-black text-sm hover:opacity-90 transition-all active:scale-95"
           >
             Close View
           </button>
        </div>
      </div>

      {/* Copy Toast */}
      {copied && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-foreground text-background px-6 py-3 rounded-2xl font-bold text-sm shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom-8">
           <CheckCircle2 size={18} className="text-success" />
           Copied to clipboard
        </div>
      )}
    </div>
  );
}
