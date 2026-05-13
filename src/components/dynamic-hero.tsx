"use client";

import { useState } from "react";
import { CheckCircle2, Cpu, Zap, Star, Flame, TrendingUp, Sparkles, ArrowRight } from "lucide-react";
import Link from "next/link";

interface Tier {
  id: string;
  name: string;
  price: number;
  badgeText?: string;
  highlightType?: string;
  savingsText?: string;
}

export function DynamicHero({ isLoggedIn }: { isLoggedIn: boolean }) {
  const [activeTierId, setActiveTierId] = useState<string>("tier-best-value");

  // Mock tiers for hero visual (ideally these would come from the DB, but for the hero visual they can be representative)
  const heroTiers = [
    { 
      id: "tier-hot-deal", 
      name: "1 Account", 
      price: 1800, 
      badgeText: "HOT DEAL", 
      highlightType: "hottest",
      savingsText: "Save 5%" 
    },
    { 
      id: "tier-popular", 
      name: "5 Accounts", 
      price: 7500, 
      badgeText: "MOST POPULAR", 
      highlightType: "most_purchased",
      savingsText: "Save ₦2,500" 
    },
    { 
      id: "tier-best-value", 
      name: "10 Accounts", 
      price: 12000, 
      badgeText: "BEST VALUE", 
      highlightType: "best_value",
      savingsText: "Save 15%" 
    },
    { 
      id: "tier-recommended", 
      name: "50 Accounts", 
      price: 50000, 
      badgeText: "RECOMMENDED", 
      highlightType: "recommended",
      savingsText: "Pro Choice" 
    },
  ];

  const getHighlightIcon = (type?: string) => {
    switch (type) {
      case "hottest": return <Flame size={12} />;
      case "most_purchased": return <TrendingUp size={12} />;
      case "best_value": return <Star size={12} />;
      case "recommended": return <Sparkles size={12} />;
      default: return <Zap size={12} />;
    }
  };

  const getHighlightColor = (type?: string) => {
    switch (type) {
      case "hottest": return "bg-error/10 text-error border-error/20";
      case "most_purchased": return "bg-primary/10 text-primary border-primary/20";
      case "best_value": return "bg-warning/10 text-warning border-warning/20";
      case "recommended": return "bg-success/10 text-success border-success/20";
      default: return "bg-surface-elevated text-text-secondary border-border-default";
    }
  };

  return (
    <section className="max-w-7xl mx-auto px-4 pt-24 pb-24 flex flex-col lg:flex-row items-center gap-12 lg:gap-20 overflow-hidden">
      <div className="flex-1 text-center lg:text-left animate-in fade-in slide-in-from-left-8 duration-700">
        <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full font-bold text-sm mb-6">
          <Zap size={16} />
          <span>Automated Account Delivery System</span>
        </div>
        <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight tracking-tight text-foreground font-syne">
          Premium Verified Accounts <br className="hidden lg:block"/>
          <span className="text-primary relative inline-block">
            Instantly Delivered
            <div className="absolute -bottom-2 left-0 w-full h-1 bg-primary/30 rounded-full"></div>
          </span>
        </h1>
        <p className="text-lg md:text-xl text-text-secondary mb-10 max-w-xl mx-auto lg:mx-0">
          The ultimate marketplace for verified accounts. Choose from our tiered pricing plans tailored for your needs.
        </p>

        {/* Interactive Highlights */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10">
          {heroTiers.map((tier) => (
            <button
              key={tier.id}
              onMouseEnter={() => setActiveTierId(tier.id)}
              className={`p-3 rounded-xl border transition-all flex flex-col items-center gap-2 ${
                activeTierId === tier.id 
                  ? "bg-primary text-white border-primary shadow-lg shadow-primary/20 scale-105" 
                  : "bg-surface-elevated text-text-secondary border-border-default hover:border-primary/50"
              }`}
            >
              {getHighlightIcon(tier.highlightType)}
              <span className="text-[10px] font-bold uppercase tracking-widest">{tier.badgeText}</span>
            </button>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
          <Link href="/shop" className="bg-primary hover:bg-primary-hover text-white px-8 py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-primary/25">
            Browse Products <ArrowRight size={20} />
          </Link>
          {isLoggedIn ? (
            <Link href="/dashboard" className="border-2 border-border-default hover:border-primary/50 text-foreground px-8 py-4 rounded-xl font-bold text-lg flex items-center justify-center transition-all hover:scale-[1.02] active:scale-[0.98]">
              Go to Dashboard
            </Link>
          ) : (
            <Link href="/register" className="border-2 border-border-default hover:border-primary/50 text-foreground px-8 py-4 rounded-xl font-bold text-lg flex items-center justify-center transition-all hover:scale-[1.02] active:scale-[0.98]">
              Create Account
            </Link>
          )}
        </div>
      </div>

      {/* Dynamic Tier Card Visual */}
      <div className="flex-1 w-full max-w-md lg:max-w-lg relative animate-in fade-in slide-in-from-right-8 duration-700 delay-200">
        <div className="vault-card p-8 shadow-2xl relative z-10 overflow-hidden">
          <div className="flex items-center gap-5 mb-8">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
              <Cpu size={32} />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-foreground">Verified Package</h3>
              <p className="text-text-muted flex items-center gap-2">
                <ShieldCheck size={14} className="text-success" />
                <span>Instant Auto-Delivery</span>
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {heroTiers.map((tier) => (
              <div
                key={tier.id}
                onMouseEnter={() => setActiveTierId(tier.id)}
                className={`group relative border rounded-2xl p-5 flex justify-between items-center transition-all duration-300 cursor-pointer ${
                  activeTierId === tier.id 
                    ? "border-primary bg-primary/5 shadow-xl shadow-primary/10 scale-[1.02] z-20" 
                    : "border-border-default bg-background hover:border-primary/30 z-10 opacity-70 hover:opacity-100"
                }`}
              >
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className={`font-bold text-lg ${activeTierId === tier.id ? "text-primary" : "text-foreground"}`}>
                      {tier.name}
                    </span>
                    {tier.badgeText && (
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-tighter flex items-center gap-1 border ${
                        activeTierId === tier.id 
                          ? "bg-primary text-white border-primary" 
                          : getHighlightColor(tier.highlightType)
                      }`}>
                        {getHighlightIcon(tier.highlightType)}
                        {tier.badgeText}
                      </span>
                    )}
                  </div>
                  {tier.savingsText && (
                    <span className="text-xs text-success font-bold mt-1">
                      {tier.savingsText}
                    </span>
                  )}
                </div>
                <div className="text-right">
                  <div className={`text-2xl font-black ${activeTierId === tier.id ? "text-primary" : "text-foreground"}`}>
                    ₦{tier.price.toLocaleString()}
                  </div>
                  <div className="text-[10px] text-text-muted font-bold uppercase">Pay via Wallet</div>
                </div>

                {/* Animated Ring for Active Tier */}
                {activeTierId === tier.id && (
                  <div className="absolute -inset-[1px] border-2 border-primary rounded-2xl animate-pulse-slow pointer-events-none"></div>
                )}
              </div>
            ))}
          </div>

          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-secondary/10 rounded-full -ml-16 -mb-16 blur-3xl"></div>
        </div>

        {/* Background blobs */}
        <div className="absolute -top-10 -right-10 w-64 h-64 bg-primary/10 rounded-full blur-[100px] -z-10 animate-pulse-slow"></div>
        <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-secondary/10 rounded-full blur-[100px] -z-10 animate-pulse-slow delay-1000"></div>
      </div>
    </section>
  );
}

function ShieldCheck({ size, className }: { size?: number, className?: string }) {
  return (
    <svg 
      width={size || 24} 
      height={size || 24} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}
