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
  const [selectedTier, setSelectedTier] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [purchaseLoading, setPurchaseLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/products/${id}`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        if (data.error) setError(data.error);
        else {
          setProduct(data);
          if (data.tiers && data.tiers.length > 0) {
            setSelectedTier(data.tiers[0]);
          }
        }
        setLoading(false);
      });
  }, [id]);

  const handlePurchase = async () => {
    if (!selectedTier) return;
    setPurchaseLoading(true);
    setError("");
    try {
      const res = await fetch("/api/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ productId: id, tierId: selectedTier.id })
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Purchase failed");
      } else {
        router.push("/dashboard");
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

// @ts-nocheck
  const totalPrice = product && selectedTier ? Number(selectedTier.price) : 0;

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
                ₦{totalPrice.toLocaleString()}
              </span>
              <span className="text-text-muted">/ selection</span>
            </div>

            <div className="prose prose-invert max-w-none text-text-secondary mb-8 leading-relaxed whitespace-pre-wrap">
              {product.info}
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

          <div className="vault-card p-8 h-fit sticky top-24">
            <h3 className="text-xl font-bold text-foreground mb-6 font-[family-name:var(--font-syne)]">Select Purchase Tier</h3>
            
            <div className="space-y-3 mb-8">
              {product.tiers?.map((tier: any) => (
                <button
                  key={tier.id}
                  onClick={() => setSelectedTier(tier)}
                  className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                    selectedTier?.id === tier.id
                      ? "border-primary bg-primary/5 shadow-md"
                      : "border-border-default bg-surface hover:border-text-muted"
                  }`}
                >
                  <div className="text-left">
                    <div className={`font-bold ${selectedTier?.id === tier.id ? 'text-primary' : 'text-foreground'}`}>
                      {tier.label} {tier.quantity > 1 ? 'Units' : 'Unit'}
                    </div>
                  </div>
                  <div className="text-xl font-black text-foreground">₦{Number(tier.price).toLocaleString()}</div>
                </button>
              ))}
            </div>

            <button
              onClick={handlePurchase}
              disabled={!selectedTier || purchaseLoading}
              className="w-full py-4 rounded-xl font-bold text-lg bg-primary hover:bg-primary-hover text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {purchaseLoading ? "Processing..." : "Buy Now"}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
