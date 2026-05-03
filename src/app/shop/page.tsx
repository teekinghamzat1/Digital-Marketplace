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

  const handleBuyNow = async (productId: string, product: any) => {
    const tierId = selectedTiers[productId];
    if (!tierId) return;

    if (!isLoggedIn) {
      router.push("/login");
      return;
    }

    const selectedTierInfo = product.tiers.find((t: any) => t.id === tierId);

    const result = await Swal.fire({
      title: "Confirm Purchase",
      text: `Are you sure you want to buy ${selectedTierInfo.quantity}x ${product.name} for ₦${Number(selectedTierInfo.price).toLocaleString()}?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, Buy Now",
      cancelButtonText: "Cancel",
      confirmButtonColor: "var(--primary)",
      background: "var(--surface)",
      color: "var(--foreground)",
      customClass: {
        popup: 'rounded-2xl',
        confirmButton: 'rounded-xl font-bold',
        cancelButton: 'rounded-xl font-bold'
      }
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
            title: "✅ Order delivered successfully",
            html: `
              <div class="text-left mt-4 p-4 bg-surface rounded-xl border border-border-default space-y-2">
                <p><strong class="text-text-secondary">Product:</strong> <span class="text-foreground font-bold">${product.name}</span></p>
                <p><strong class="text-text-secondary">Package:</strong> <span class="text-foreground font-bold">${selectedTierInfo.quantity} Account(s)</span></p>
                <p><strong class="text-text-secondary">Amount Paid:</strong> <span class="text-primary font-bold">₦${Number(selectedTierInfo.price).toLocaleString()}</span></p>
              </div>
            `,
            icon: "success",
            confirmButtonColor: "var(--primary)",
            confirmButtonText: "View in Dashboard",
            background: "var(--background)",
            color: "var(--foreground)",
            customClass: {
              popup: 'rounded-2xl border border-border-default shadow-2xl',
              confirmButton: 'rounded-xl font-bold px-8 py-3 w-full mt-4',
              title: 'font-syne text-2xl font-bold text-foreground',
              htmlContainer: 'm-0 p-0',
              icon: 'border-0 bg-success/10 text-success'
            }
          }).then(() => {
            router.push("/dashboard");
          });
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

  const calculateSavings = (tiers: any[], tier: any) => {
    // Find base unit price (usually quantity = 1, or the smallest quantity)
    if (tiers.length <= 1) return null;
    
    const sortedTiers = [...tiers].sort((a, b) => a.quantity - b.quantity);
    const baseTier = sortedTiers[0];
    const baseUnitPrice = Number(baseTier.price) / baseTier.quantity;
    
    if (tier.quantity === baseTier.quantity) return null;
    
    const expectedPrice = baseUnitPrice * tier.quantity;
    const actualPrice = Number(tier.price);
    
    if (expectedPrice > actualPrice) {
      return expectedPrice - actualPrice;
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-background pb-20">
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
                    <div key={j} className="h-80 bg-surface-elevated rounded-2xl" />
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
                    {category.products.map((product: any) => {
                      const stockCount = product._count?.items || 0;
                      const isOutOfStock = stockCount === 0;

                      return (
                        <div key={product.id} className="bg-surface border border-border-default rounded-2xl p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col">
                          <div className="mb-4">
                            <h3 className="text-xl font-bold text-foreground mb-1">{product.name}</h3>
                            {product.info && (
                              <p className="text-text-secondary text-sm line-clamp-2">{product.info}</p>
                            )}
                          </div>
                          
                          {stockCount > 0 && stockCount <= 10 && (
                            <div className="mb-4 inline-block bg-warning/10 text-warning px-3 py-1 rounded-full text-xs font-bold">
                              Only {stockCount} left in stock
                            </div>
                          )}

                          <div className="space-y-2 mb-8 flex-1 mt-2">
                            {product.tiers.sort((a:any, b:any) => a.quantity - b.quantity).map((tier: any) => {
                              const savings = calculateSavings(product.tiers, tier);
                              const isLargestTier = product.tiers.length > 2 && tier === product.tiers.sort((a:any, b:any) => a.quantity - b.quantity)[product.tiers.length - 1];
                              const isAvailable = stockCount >= tier.quantity;
                              const notEnoughStock = stockCount > 0 && stockCount < tier.quantity;
                              const isSelected = selectedTiers[product.id] === tier.id;

                              return (
                                <button
                                  key={tier.id}
                                  disabled={!isAvailable}
                                  onClick={() => handleTierSelect(product.id, tier.id)}
                                  className={`w-full p-3 rounded-xl border-2 flex items-center justify-between transition-all duration-200 ${
                                    isOutOfStock || notEnoughStock
                                      ? "opacity-50 cursor-not-allowed bg-surface border-border-default" 
                                      : isSelected
                                        ? "border-primary bg-primary/5 shadow-sm"
                                        : "border-border-default bg-background hover:border-primary/50"
                                  }`}
                                >
                                  <div className="flex items-center gap-2">
                                    <span className={`font-bold ${isSelected ? 'text-primary' : 'text-foreground'}`}>
                                      {tier.quantity} {tier.quantity === 1 ? '' : ''}
                                    </span>
                                    <span className={`text-text-muted`}>→</span>
                                    <span className={`font-bold ${isSelected ? 'text-primary' : 'text-foreground'}`}>
                                      ₦{Number(tier.price).toLocaleString()}
                                    </span>
                                  </div>
                                  
                                  <div className="flex items-center gap-2">
                                    {isOutOfStock ? (
                                      <span className="text-xs text-error font-bold">Out of stock</span>
                                    ) : notEnoughStock ? (
                                      <span className="text-xs text-error font-bold">Not enough stock</span>
                                    ) : (
                                      <>
                                        {savings && savings > 0 && !isLargestTier && (
                                          <span className="text-[10px] sm:text-xs bg-error/10 text-error px-2 py-0.5 rounded-full font-bold whitespace-nowrap">
                                            🔥 Save ₦{savings.toLocaleString()}
                                          </span>
                                        )}
                                        {isLargestTier && (
                                          <span className="text-[10px] sm:text-xs bg-warning/20 text-warning px-2 py-0.5 rounded-full font-bold whitespace-nowrap">
                                            ⭐ Best Value
                                          </span>
                                        )}
                                      </>
                                    )}
                                  </div>
                                </button>
                              )
                            })}
                          </div>

                          <button
                            onClick={() => handleBuyNow(product.id, product)}
                            disabled={!selectedTiers[product.id] || buying === product.id || isOutOfStock}
                            className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                              selectedTiers[product.id] && !isOutOfStock && !buying
                                ? "bg-primary hover:bg-primary-hover text-white shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98]"
                                : "bg-surface-elevated text-text-muted cursor-not-allowed border border-border-default"
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
                      )
                    })}
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
