"use client";

import { useState } from "react";
import { 
  X, Wallet, ArrowUpRight, Save, 
  History, ShieldAlert, Loader2,
  CheckCircle2, AlertCircle
} from "lucide-react";

interface WalletManagerProps {
  user: any;
  onClose: () => void;
  onUpdate: () => void;
}

export function WalletManager({ user, onClose, onUpdate }: WalletManagerProps) {
  const [amount, setAmount] = useState("");
  const [action, setAction] = useState<"add" | "set">("add");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleUpdate = async () => {
    if (!amount || isNaN(Number(amount))) return;
    
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${user.id}/wallet`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, action }),
      });
      
      if (res.ok) {
        setSuccess(true);
        setTimeout(() => {
          onUpdate();
          onClose();
        }, 1500);
      } else {
        alert("Failed to update wallet");
      }
    } catch (err) {
      alert("Error updating wallet");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-md z-[250] flex items-center justify-center p-4 animate-in fade-in">
      <div className="w-full max-w-md bg-background border border-border-default rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="p-6 border-b border-border-default flex items-center justify-between bg-surface-elevated/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <Wallet size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground">Wallet Manager</h3>
              <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">{user.username}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-text-muted hover:text-foreground transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 space-y-8">
          {success ? (
            <div className="py-8 text-center space-y-4 animate-in fade-in slide-in-from-bottom-4">
               <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center text-success mx-auto">
                 <CheckCircle2 size={48} />
               </div>
               <h4 className="text-xl font-bold text-foreground">Balance Updated!</h4>
               <p className="text-sm text-text-muted">The user's wallet has been successfully adjusted.</p>
            </div>
          ) : (
            <>
              <div className="bg-surface-elevated/50 p-6 rounded-2xl border border-border-default text-center">
                 <p className="text-[10px] font-bold text-text-muted uppercase tracking-[0.2em] mb-1">Current Balance</p>
                 <h2 className="text-3xl font-black text-foreground">₦{Number(user.walletBalance).toLocaleString()}</h2>
              </div>

              <div className="space-y-4">
                 <div className="flex p-1 bg-surface-elevated rounded-xl border border-border-default">
                    <button 
                      onClick={() => setAction("add")}
                      className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${action === "add" ? "bg-background text-primary shadow-sm" : "text-text-muted hover:text-foreground"}`}
                    >
                      Add Funds
                    </button>
                    <button 
                      onClick={() => setAction("set")}
                      className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${action === "set" ? "bg-background text-primary shadow-sm" : "text-text-muted hover:text-foreground"}`}
                    >
                      Set Balance
                    </button>
                 </div>

                 <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted font-bold">₦</div>
                    <input 
                      type="number" 
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full bg-surface-elevated border border-border-default rounded-xl pl-10 pr-4 py-4 text-xl font-black focus:border-primary outline-none transition-all text-foreground"
                    />
                 </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-warning/5 border border-warning/20 rounded-2xl">
                 <ShieldAlert size={18} className="text-warning shrink-0 mt-0.5" />
                 <p className="text-[10px] text-warning-hover font-bold leading-relaxed uppercase tracking-tight">
                   This action is irreversible and will be logged in the system audit trail. Please verify the amount before proceeding.
                 </p>
              </div>

              <button 
                onClick={handleUpdate}
                disabled={loading || !amount}
                className="w-full py-4 bg-primary text-white rounded-2xl font-black text-sm shadow-xl shadow-primary/20 hover:bg-primary-hover transition-all flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50"
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                Confirm Adjustment
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
