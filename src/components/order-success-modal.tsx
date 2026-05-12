"use client";

import { useState, useEffect, useRef } from "react";
import { 
  Check, 
  Copy, 
  Eye, 
  EyeOff, 
  Lock, 
  Unlock, 
  Tag, 
  Package as PackageIcon, 
  Coins, 
  X,
  LayoutDashboard,
  ExternalLink,
  ClipboardCheck,
  Loader2
} from "lucide-react";
import confetti from "canvas-confetti";
import Link from "next/link";

interface OrderSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderData: {
    orderId: string;
    productName: string;
    quantity: number;
    amount: number;
  } | null;
}

export function OrderSuccessModal({ isOpen, onClose, orderData }: OrderSuccessModalProps) {
  const [revealed, setRevealed] = useState(false);
  const [revealing, setRevealing] = useState(false);
  const [credentials, setCredentials] = useState<any[]>([]);
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setMounted(true);
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

      return () => {
        clearInterval(interval);
        setRevealed(false);
        setCredentials([]);
        setCopied(false);
      };
    } else {
      setMounted(false);
    }
  }, [isOpen]);

  const handleReveal = async () => {
    if (!orderData) return;
    setRevealing(true);
    try {
      // We fetch all items for this order to reveal them
      const res = await fetch(`/api/orders/${orderData.orderId}`, { credentials: 'include' });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error);

      // Call reveal API for each item
      const revealPromises = data.orderItems.map((item: any) => 
        fetch(`/api/orders/${orderData.orderId}/reveal/${item.productItemId}`, { 
          method: "POST", 
          credentials: "include" 
        }).then(r => r.json())
      );

      const revealedData = await Promise.all(revealPromises);
      setCredentials(revealedData.map(d => d.credentialText));
      setRevealed(true);
    } catch (err) {
      console.error("Failed to reveal credentials:", err);
    } finally {
      setRevealing(false);
    }
  };

  const handleCopy = () => {
    const textToCopy = credentials.join("\n");
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen || !orderData) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="relative w-full max-w-lg bg-[#0F0F19EB] border border-white/10 rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-500 ease-out backdrop-blur-xl">
        
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
          
          {/* Animated Success Ring */}
          <div className="relative w-24 h-24 mb-6">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="48"
                cy="48"
                r="40"
                fill="none"
                stroke="rgba(255, 140, 0, 0.1)"
                strokeWidth="6"
              />
              <circle
                cx="48"
                cy="48"
                r="40"
                fill="none"
                stroke="#FF8C00"
                strokeWidth="6"
                strokeDasharray="251.2"
                strokeDashoffset="251.2"
                className="animate-svg-draw"
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center text-[#FF8C00] animate-in zoom-in fade-in delay-500 duration-500 fill-mode-both">
              <Check size={40} strokeWidth={4} />
            </div>
            {/* Pulsing Glow */}
            <div className="absolute inset-0 bg-[#FF8C00]/20 rounded-full blur-xl animate-pulse" />
          </div>

          <h2 className="text-2xl font-bold font-syne text-white mb-2 text-center drop-shadow-[0_0_8px_rgba(255,140,0,0.4)]">
            Order Delivered Successfully
          </h2>
          <p className="text-white/40 text-sm mb-8 text-center font-medium">Your digital goods are ready for pickup</p>

          {/* Order Summary Card */}
          <div className="w-full bg-white/[0.03] border border-white/5 rounded-2xl p-5 mb-8 space-y-4">
            <div className="flex items-center justify-between group">
              <div className="flex items-center gap-3 text-white/50 text-sm font-bold uppercase tracking-widest">
                <Tag size={16} className="text-[#FF8C00]" /> Product
              </div>
              <span className="text-white font-bold text-sm">{orderData.productName}</span>
            </div>
            <div className="flex items-center justify-between group">
              <div className="flex items-center gap-3 text-white/50 text-sm font-bold uppercase tracking-widest">
                <PackageIcon size={16} className="text-[#FF8C00]" /> Package
              </div>
              <span className="text-white font-bold text-sm">{orderData.quantity} Account(s)</span>
            </div>
            <div className="flex items-center justify-between group">
              <div className="flex items-center gap-3 text-white/50 text-sm font-bold uppercase tracking-widest">
                <Coins size={16} className="text-[#FF8C00]" /> Amount Paid
              </div>
              <span className="text-[#FF8C00] font-black text-lg">₦{orderData.amount.toLocaleString()}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="w-full space-y-3">
            {!revealed ? (
              <button 
                onClick={handleReveal}
                disabled={revealing}
                className="w-full flex items-center justify-center gap-3 py-4 bg-white/5 border border-white/10 hover:border-[#FF8C00]/50 hover:bg-[#FF8C00]/5 text-white rounded-xl font-bold transition-all duration-300 group shadow-lg"
              >
                {revealing ? (
                  <Loader2 size={20} className="animate-spin text-[#FF8C00]" />
                ) : (
                  <>
                    <Lock size={20} className="text-[#FF8C00] group-hover:scale-110 transition-transform" /> 
                    Reveal Credentials
                  </>
                )}
              </button>
            ) : (
              <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-300">
                <div className="bg-black/40 border border-white/5 rounded-xl p-4 font-mono text-sm text-[#FF8C00] break-all max-h-32 overflow-y-auto custom-scrollbar">
                  {credentials.map((cred, i) => (
                    <div key={i} className="mb-2 last:mb-0 pb-2 last:pb-0 border-b last:border-0 border-white/5">
                      {cred}
                    </div>
                  ))}
                </div>
                <button 
                  onClick={handleCopy}
                  className="w-full flex items-center justify-center gap-3 py-4 bg-[#FF8C00] hover:bg-[#E67E00] text-white rounded-xl font-bold transition-all shadow-[0_0_20px_rgba(255,140,0,0.3)]"
                >
                  {copied ? (
                    <>
                      <ClipboardCheck size={20} className="animate-in zoom-in" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy size={20} />
                      Copy Credentials
                    </>
                  )}
                </button>
              </div>
            )}
            
            <div className="flex justify-center pt-2">
              <Link 
                href={`/orders/${orderData.orderId}/success`}
                className="text-white/30 hover:text-white text-xs font-bold uppercase tracking-widest flex items-center gap-2 transition-colors"
              >
                View full receipt in dashboard <ExternalLink size={12} />
              </Link>
            </div>
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
        @keyframes svg-draw {
          to { stroke-dashoffset: 0; }
        }
        .animate-svg-draw {
          animation: svg-draw 0.8s ease-out forwards;
          animation-delay: 0.2s;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.02);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
}
