"use client";

import { useState, useEffect, use } from "react";
import { Navbar } from "@/components/navbar";
import Link from "next/link";
import { CheckCircle2, ArrowLeft, Eye, Copy, Check } from "lucide-react";

export default function OrderSuccessPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [revealing, setRevealing] = useState<Record<string, boolean>>({});
  const [copied, setCopied] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!id) return;
    fetch(`/api/orders/${id}`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        if (data.error) setError(data.error);
        else setOrder(data);
        setLoading(false);
      });
  }, [id]);

  const handleReveal = async (itemId: string) => {
    setRevealing({ ...revealing, [itemId]: true });
    try {
      const res = await fetch(`/api/orders/${id}/reveal/${itemId}`, { 
        method: "POST",
        credentials: "include" 
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error);
      
      // Update local state
      const updatedItems = order.orderItems.map((item: any) => 
        item.productItemId === itemId ? { ...item, isRevealed: true, credentialText: data.credentialText } : item
      );
      setOrder({ ...order, orderItems: updatedItems });
    } catch (err: any) {
      alert("Failed to reveal: " + err.message);
    } finally {
      setRevealing({ ...revealing, [itemId]: false });
    }
  };

  const handleCopy = (text: string, itemId: string) => {
    navigator.clipboard.writeText(text);
    setCopied({ ...copied, [itemId]: true });
    setTimeout(() => setCopied({ ...copied, [itemId]: false }), 2000);
  };

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center">Loading...</div>;
  if (error || !order) return <div className="min-h-screen bg-background flex items-center justify-center text-error">{error || "Order not found"}</div>;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="flex flex-col items-center text-center mb-12">
          <div className="w-20 h-20 bg-success/10 text-success rounded-full flex items-center justify-center mb-6">
            <CheckCircle2 size={40} />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold font-[family-name:var(--font-syne)] text-foreground mb-4">
            Purchase Successful
          </h1>
          <p className="text-text-secondary text-lg max-w-xl">
            Your payment was successful and your digital accounts have been securely assigned to your vault.
          </p>
        </div>

        <div className="vault-card p-6 md:p-8 mb-8">
          <h2 className="text-xl font-bold text-foreground mb-6 font-[family-name:var(--font-syne)] border-b border-border-default pb-4">Order Summary</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
            <div>
              <p className="text-sm text-text-muted font-bold uppercase tracking-wider mb-1">Order ID</p>
              <p className="font-mono text-sm text-foreground">{order.id.split('-')[0]}</p>
            </div>
            <div>
              <p className="text-sm text-text-muted font-bold uppercase tracking-wider mb-1">Product</p>
              <p className="font-medium text-foreground">{order.product.name}</p>
            </div>
            <div>
              <p className="text-sm text-text-muted font-bold uppercase tracking-wider mb-1">Quantity</p>
              <p className="font-medium text-foreground">{order.quantity}</p>
            </div>
            <div>
              <p className="text-sm text-text-muted font-bold uppercase tracking-wider mb-1">Total Paid</p>
              <p className="font-black text-primary">₦{Number(order.totalAmount).toLocaleString()}</p>
            </div>
          </div>

          <h3 className="text-lg font-bold text-foreground mb-4 font-[family-name:var(--font-syne)]">Your Credentials</h3>
          <p className="text-sm text-text-secondary mb-6">Click "Reveal" to decrypt and view your purchased accounts. Keep this information secure.</p>
          
          <div className="space-y-4">
            {order.orderItems.map((item: any, index: number) => (
              <div key={item.id} className="bg-surface-elevated border border-border-default rounded-xl p-4 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                <div className="flex items-center gap-4 flex-1 w-full">
                  <div className="w-8 h-8 rounded bg-background border border-border-default flex items-center justify-center font-bold text-text-muted">
                    {index + 1}
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <p className={`font-mono text-sm md:text-base break-all ${!item.isRevealed ? 'text-text-muted blur-sm select-none' : 'text-foreground'}`}>
                      {item.credentialText}
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-2 w-full md:w-auto mt-4 md:mt-0">
                  {!item.isRevealed ? (
                    <button 
                      onClick={() => handleReveal(item.productItemId)}
                      disabled={revealing[item.productItemId]}
                      className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-lg font-bold transition-colors disabled:opacity-50"
                    >
                      <Eye size={18} /> {revealing[item.productItemId] ? "Revealing..." : "Reveal"}
                    </button>
                  ) : (
                    <button 
                      onClick={() => handleCopy(item.credentialText, item.id)}
                      className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-surface hover:bg-border-default border border-border-default text-foreground px-4 py-2 rounded-lg font-bold transition-colors"
                    >
                      {copied[item.id] ? <Check size={18} className="text-success" /> : <Copy size={18} />}
                      {copied[item.id] ? "Copied!" : "Copy"}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-center gap-4">
          <Link href="/dashboard" className="px-6 py-3 rounded-xl bg-surface-elevated hover:bg-border-default text-foreground font-bold transition-colors">
            Go to Dashboard
          </Link>
          <Link href="/shop" className="px-6 py-3 rounded-xl bg-primary hover:bg-primary-hover text-white font-bold transition-colors">
            Continue Shopping
          </Link>
        </div>
      </main>
    </div>
  );
}
