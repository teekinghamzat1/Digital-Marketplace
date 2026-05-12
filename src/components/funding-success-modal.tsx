"use client";

import { useState, useEffect } from "react";
import { Check, Wallet, X, ArrowUpRight, Coins, LayoutDashboard } from "lucide-react";
import confetti from "canvas-confetti";
import Link from "next/link";

interface FundingSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  newBalance: number;
}

export function FundingSuccessModal({ isOpen, onClose, amount, newBalance }: FundingSuccessModalProps) {
  useEffect(() => {
    if (isOpen) {
      // Trigger Confetti
      const duration = 2 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 200 };

      const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

      const interval: any = setInterval(function() {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
      }, 250);

      return () => clearInterval(interval);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="relative w-full max-w-md bg-[#0F0F19EB] border border-white/10 rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-500 ease-out backdrop-blur-xl">
        
        {/* Shimmer Accent Line */}
        <div className="absolute top-0 left-0 w-full h-[2px] overflow-hidden">
          <div className="w-full h-full bg-gradient-to-r from-transparent via-[#FF8C00] to-[#00C896] animate-shimmer" />
        </div>

        {/* Close Icon */}
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 text-white/40 hover:text-white transition-colors rounded-full hover:bg-white/5"
        >
          <X size={20} />
        </button>

        <div className="p-8 flex flex-col items-center">
          
          {/* Animated Wallet Icon */}
          <div className="relative w-20 h-20 mb-6">
             <div className="absolute inset-0 bg-[#00C896]/20 rounded-2xl blur-xl animate-pulse" />
             <div className="relative w-full h-full bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center text-[#00C896] animate-in zoom-in duration-500">
                <Wallet size={32} />
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-[#00C896] rounded-lg flex items-center justify-center text-white shadow-lg animate-bounce">
                  <Check size={18} strokeWidth={3} />
                </div>
             </div>
          </div>

          <h2 className="text-2xl font-bold font-syne text-white mb-2 text-center">
            Wallet Funded Successfully
          </h2>
          <p className="text-white/40 text-sm mb-8 text-center font-medium">Your deposit has been verified and credited.</p>

          {/* Funding Summary Card */}
          <div className="w-full space-y-3 mb-8">
            <div className="p-4 bg-white/[0.03] border border-white/5 rounded-2xl flex items-center justify-between">
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-success/10 text-success flex items-center justify-center">
                    <ArrowUpRight size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">Amount Added</p>
                    <p className="text-lg font-black text-white">+₦{amount.toLocaleString()}</p>
                  </div>
               </div>
            </div>

            <div className="p-4 bg-white/[0.03] border border-white/5 rounded-2xl flex items-center justify-between">
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                    <Coins size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">New Balance</p>
                    <p className="text-lg font-black text-primary">₦{newBalance.toLocaleString()}</p>
                  </div>
               </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="w-full space-y-3">
            <Link 
              href="/shop"
              className="w-full flex items-center justify-center gap-3 py-4 bg-[#FF8C00] hover:bg-[#E67E00] text-white rounded-xl font-bold transition-all shadow-[0_0_20px_rgba(255,140,0,0.3)]"
            >
              Start Shopping
            </Link>
            
            <button 
              onClick={onClose}
              className="w-full py-4 text-white/40 hover:text-white font-bold text-sm transition-colors"
            >
              Continue to Dashboard
            </button>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite linear;
        }
      `}</style>
    </div>
  );
}
