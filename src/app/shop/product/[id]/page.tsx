"use client";

import { useState, useEffect, use } from "react";
import { Navbar } from "@/components/navbar";
import { useRouter } from "next/navigation";
import { ArrowLeft, ShieldCheck, Zap } from "lucide-react";
import Link from "next/link";

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [product, setProduct] = useState<any>(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [purchaseLoading, setPurchaseLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/products/${id}`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        if (data.error) setError(data.error);
        else setProduct(data);
        setLoading(false);
      });
  }, [id]);

  const handlePurchase = async () => {
    setPurchaseLoading(true);
    setError("");
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ product_id: id, quantity })
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 401) {
          router.push("/login");
          return;
        }
        if (res.status === 402) {
          setError(data.error); // Show shortfall error
        } else {
          throw new Error(data.error || "Purchase failed");
        }
      } else {
        router.push(`/orders/${data.id}/success`);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setPurchaseLoading(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center text-primary">Loading...</div>;
  }

  if (error && !product) {
    return <div className="min-h-screen bg-background flex items-center justify-center text-error font-bold">{error}</div>;
  }

  const totalPrice = product ? Number(product.price) * quantity : 0;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="max-w-5xl mx-auto px-4 py-12">
        <Link href="/shop" className="inline-flex items-center gap-2 text-text-secondary hover:text-primary mb-8 font-medium transition-colors">
          <ArrowLeft size={20} /> Back to Shop
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Info */}
          <div>
            <div className="inline-block px-3 py-1 rounded bg-primary-light text-primary text-xs font-bold uppercase tracking-wider mb-4">
              {product.categoryName}
            </div>
            <h1 className="text-4xl font-bold font-[family-name:var(--font-syne)] text-foreground mb-4">
              {product.name}
            </h1>
            
            <div className="flex items-center gap-4 mb-8">
              <span className="text-3xl font-black text-foreground">
                ₦{Number(product.price).toLocaleString()}
              </span>
              <span className="text-text-muted">/ unit</span>
            </div>

            <div className="prose prose-invert max-w-none text-text-secondary mb-8 leading-relaxed whitespace-pre-wrap">
              {product.fullDescription || product.shortDescription}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-surface-elevated p-4 rounded-xl flex items-center gap-3">
                <div className="bg-success/10 text-success p-2 rounded-lg"><Zap size={20} /></div>
                <div className="text-sm font-bold text-foreground">Instant Delivery</div>
              </div>
              <div className="bg-surface-elevated p-4 rounded-xl flex items-center gap-3">
                <div className="bg-primary/10 text-primary p-2 rounded-lg"><ShieldCheck size={20} /></div>
                <div className="text-sm font-bold text-foreground">100% Verified</div>
              </div>
            </div>
          </div>

          {/* Checkout Card */}
          <div className="vault-card p-8 h-fit sticky top-24">
            <h3 className="text-xl font-bold text-foreground mb-6 font-[family-name:var(--font-syne)]">Order Summary</h3>
            
            <div className="flex items-center justify-between mb-6 pb-6 border-b border-border-default">
              <span className="text-text-secondary font-medium">Availability</span>
              {product.stockCount > 0 ? (
                <span className="text-success font-bold bg-success/10 px-3 py-1 rounded">{product.stockCount} in stock</span>
              ) : (
                <span className="text-error font-bold bg-error/10 px-3 py-1 rounded">Out of stock</span>
              )}
            </div>

            <div className="mb-8">
              <label className="block text-sm font-bold text-foreground mb-3">Quantity</label>
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-12 h-12 rounded-xl bg-surface-elevated text-foreground font-bold hover:bg-border-default transition-colors flex items-center justify-center text-xl"
                >-</button>
                <div className="w-20 h-12 rounded-xl bg-background border border-border-default flex items-center justify-center font-bold text-xl text-foreground">
                  {quantity}
                </div>
                <button 
                  onClick={() => setQuantity(Math.min(product.stockCount, quantity + 1))}
                  className="w-12 h-12 rounded-xl bg-surface-elevated text-foreground font-bold hover:bg-border-default transition-colors flex items-center justify-center text-xl"
                >+</button>
              </div>
            </div>

            <div className="flex justify-between items-center mb-8 bg-surface-elevated p-4 rounded-xl">
              <span className="text-text-secondary font-medium">Total</span>
              <span className="text-2xl font-black text-foreground">₦{totalPrice.toLocaleString()}</span>
            </div>

            {error && (
              <div className="bg-error/10 text-error px-4 py-3 rounded-lg mb-6 text-sm font-medium flex flex-col gap-2">
                {error}
                {error.includes("Insufficient balance") && (
                  <Link href="/dashboard" className="bg-error text-white text-center py-2 rounded-lg font-bold mt-1">
                    Fund Wallet
                  </Link>
                )}
              </div>
            )}

            <button
              onClick={handlePurchase}
              disabled={product.stockCount === 0 || purchaseLoading}
              className={`w-full py-4 rounded-xl font-bold text-lg transition-colors ${
                product.stockCount === 0
                  ? 'bg-surface-elevated text-text-muted cursor-not-allowed'
                  : 'bg-primary hover:bg-primary-hover text-white'
              }`}
            >
              {purchaseLoading ? "Processing..." : product.stockCount === 0 ? "Out of Stock" : "Buy Now"}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
