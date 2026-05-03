// @ts-nocheck
"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { Search, ShoppingCart, CheckCircle2, AlertCircle } from "lucide-react";
import Swal from "sweetalert2";

function ShopContent() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTiers, setSelectedTiers] = useState<Record<string, string>>({}); // productId -> tierId
  const [buying, setBuying] = useState<string | null>(null); // productId
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchMarketplace();
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const res = await fetch("/api/auth/me");
      setIsLoggedIn(res.ok);
    } catch (e) {
      setIsLoggedIn(false);
    }
  };

  const fetchMarketplace = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/marketplace");
      const data = await res.json();
      setCategories(data);
    } catch (error) {
      console.error("Failed to fetch marketplace:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleTierSelect = (productId: string, tierId: string) => {
    setSelectedTiers((prev) => ({ ...prev, [productId]: tierId }));
  };

  const handleBuyNow = async (productId: string) => {
    const tierId = selectedTiers[productId];
    if (!tierId) return;

    if (!isLoggedIn) {
      router.push("/login");
      return;
    }

    const result = await Swal.fire({
      title: "Confirm Purchase",
      text: "Are you sure you want to buy this product?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, Buy Now",
      cancelButtonText: "Cancel",
      confirmButtonColor: "var(--primary)",
      background: "var(--surface)",
      color: "var(--foreground)",
    });

    if (result.isConfirmed) {
      setBuying(productId);
      try {
        const res = await fetch("/api/purchase", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId, tierId }),
        });

        const data = await res.json();

        if (res.ok) {
          Swal.fire({
            title: "Success!",
            text: "Your purchase was successful. Check your dashboard for delivery.",
            icon: "success",
            confirmButtonColor: "var(--primary)",
            background: "var(--surface)",
            color: "var(--foreground)",
          });
          // Refresh balance by reloading or state update (here we just reload for simplicity)
          window.location.reload();
        } else {
          Swal.fire({
            title: "Purchase Failed",
            text: data.error || "Something went wrong",
            icon: "error",
            confirmButtonColor: "var(--primary)",
            background: "var(--surface)",
            color: "var(--foreground)",
          });
        }
      } catch (error) {
        Swal.fire("Error", "Failed to connect to server", "error");
      } finally {
        setBuying(null);
      }
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 py-12">
        <div className="mb-12">
          <h1 className="text-4xl font-bold font-[family-name:var(--font-syne)] text-foreground">Marketplace</h1>
          <p className="text-text-secondary mt-2">Premium digital accounts with instant delivery.</p>
        </div>

        {loading ? (
          <div className="space-y-12">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-8 w-48 bg-surface-elevated rounded mb-6" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(3)].map((_, j) => (
                    <div key={j} className="h-64 bg-surface-elevated rounded-2xl" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-16">
            {categories.map((category) => (
              category.products.length > 0 && (
                <div key={category.id}>
                  <div className="flex items-center gap-3 mb-8">
                    <div className="h-8 w-1.5 bg-primary rounded-full" />
                    <h2 className="text-2xl font-bold text-foreground font-[family-name:var(--font-syne)] tracking-tight">
                      {category.name}
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {category.products.map((product: any) => (
                      <div key={product.id} className="vault-card flex flex-col p-8 group border-border-default hover:border-primary/40 transition-all duration-300">
                        <div className="flex justify-between items-start mb-6">
                          <div>
                            <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">{product.name}</h3>
                            {product._count?.items < 10 && product._count?.items > 0 && (
                              <p className="text-xs text-warning font-bold mt-1 flex items-center gap-1">
                                <AlertCircle size={12} /> Only {product._count.items} left in stock!
                              </p>
                            )}
                          </div>
                        </div>
                        
                        {product.info && (
                          <p className="text-text-secondary text-sm mb-6 line-clamp-2">{product.info}</p>
                        )}

                        <div className="space-y-3 mb-8">
                          <p className="text-xs font-bold text-text-muted uppercase tracking-widest mb-4">Select Tier</p>
                          <div className="grid grid-cols-2 gap-3">
                            {product.tiers.map((tier: any) => {
                              const isAvailable = product._count?.items >= tier.quantity;
                              return (
                              <button
                                key={tier.id}
                                disabled={!isAvailable}
                                onClick={() => handleTierSelect(product.id, tier.id)}
                                className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all ${
                                  !isAvailable ? "opacity-50 cursor-not-allowed bg-surface border-border-default" :
                                  selectedTiers[product.id] === tier.id
                                    ? "border-primary bg-primary/5 shadow-md shadow-primary/10"
                                    : "border-border-default bg-surface hover:border-text-muted"
                                }`}
                              >
                                <span className={`text-sm font-bold ${!isAvailable ? 'text-text-muted' : selectedTiers[product.id] === tier.id ? 'text-primary' : 'text-text-secondary'}`}>
                                  {tier.label} {tier.quantity > 1 ? 'Units' : 'Unit'}
                                </span>
                                <span className={`text-xs font-black ${!isAvailable ? 'text-text-muted' : selectedTiers[product.id] === tier.id ? 'text-primary' : 'text-foreground'}`}>
                                  {isAvailable ? `₦${Number(tier.price).toLocaleString()}` : "Out of Stock"}
                                </span>
                              </button>
                            )})}
                          </div>
                        </div>

                        <button
                          onClick={() => handleBuyNow(product.id)}
                          disabled={!selectedTiers[product.id] || buying === product.id}
                          className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                            selectedTiers[product.id]
                              ? "bg-primary hover:bg-primary-hover text-white shadow-lg shadow-primary/20 scale-[1.02]"
                              : "bg-surface-elevated text-text-muted cursor-not-allowed"
                          }`}
                        >
                          {buying === product.id ? (
                            <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <>
                              <ShoppingCart size={18} />
                              Buy Now
                            </>
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center">Loading...</div>}>
      <ShopContent />
    </Suspense>
  );
}
