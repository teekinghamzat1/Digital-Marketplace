"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Wallet, CreditCard, ArrowDownLeft, ArrowUpRight } from "lucide-react";

function WalletContent() {
  const searchParams = useSearchParams();
  const [data, setData] = useState<any>({ balance: 0, transactions: [] });
  const [loading, setLoading] = useState(true);
  const [amount, setAmount] = useState("");
  const [fundLoading, setFundLoading] = useState(false);
  
  // Initialize with URL params if present
  const [error, setError] = useState(searchParams.get("error") || "");
  const [success, setSuccess] = useState(searchParams.get("success") || "");

  // Clear query params from URL without refreshing
  useEffect(() => {
    if (searchParams.has("success") || searchParams.has("error")) {
      const url = new URL(window.location.href);
      url.searchParams.delete("success");
      url.searchParams.delete("error");
      window.history.replaceState({}, '', url.toString());
    }
  }, [searchParams]);

  useEffect(() => {
    fetch("/api/wallet", { credentials: 'include' })
      .then(res => {
        if (res.status === 401) { window.location.href = "/login"; return null; }
        return res.json();
      })
      .then(resData => {
        if (resData) {
          setData({
            balance: resData.balance || 0,
            transactions: Array.isArray(resData.transactions) ? resData.transactions : []
          });
        }
        setLoading(false);
      });
  }, []);

  const handleFund = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setFundLoading(true);

    try {
      const res = await fetch("/api/wallet/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ amount: parseFloat(amount) })
      });

      const result = await res.json();

      if (!res.ok) throw new Error(result.error);

      if (result.authorization_url) {
        window.location.href = result.authorization_url;
      } else {
        throw new Error("No authorization URL returned");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setFundLoading(false);
    }
  };

  if (loading) return <div className="animate-pulse space-y-4"><div className="h-48 bg-surface-elevated rounded-xl"></div><div className="h-64 bg-surface-elevated rounded-xl"></div></div>;

  return (
    <div>
      <h1 className="text-3xl font-bold font-[family-name:var(--font-syne)] text-foreground mb-8">
        Wallet & Funding
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        <div className="vault-card p-8 bg-gradient-to-br from-surface to-surface-elevated border-primary/20 flex flex-col justify-center">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center">
              <Wallet size={24} />
            </div>
            <h2 className="text-lg font-bold text-text-secondary">Available Balance</h2>
          </div>
          <p className="text-5xl md:text-6xl font-black text-foreground font-[family-name:var(--font-syne)]">
            ₦{Number(data.balance).toLocaleString()}
          </p>
        </div>

        <div className="vault-card p-8">
          <h2 className="text-xl font-bold font-[family-name:var(--font-syne)] text-foreground mb-6 flex items-center gap-2">
            <CreditCard size={20} className="text-primary" /> Fund Wallet
          </h2>

          {error && <div className="bg-error/10 text-error px-4 py-3 rounded-lg mb-4 text-sm font-medium">{error}</div>}
          {success && <div className="bg-success/10 text-success px-4 py-3 rounded-lg mb-4 text-sm font-medium">{success}</div>}

          <form onSubmit={handleFund}>
            <div className="mb-4">
              <label className="block text-sm font-bold text-foreground mb-1.5">Amount (₦)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted font-bold">₦</span>
                <input
                  type="number"
                  min="100"
                  step="1"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-surface-elevated border border-border-default rounded-xl pl-10 pr-4 py-3 text-foreground focus:outline-none focus:border-primary transition-colors font-bold text-lg"
                  placeholder="5000"
                  required
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={fundLoading || !amount}
              className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-3.5 rounded-xl transition-colors disabled:opacity-50"
            >
              {fundLoading ? "Processing..." : "Pay with Paystack"}
            </button>
          </form>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold font-[family-name:var(--font-syne)] text-foreground mb-6">Transaction History</h2>
        
        {data.transactions.length === 0 ? (
          <div className="bg-surface-elevated rounded-xl p-8 text-center border border-border-default">
            <p className="text-text-muted">No transactions found.</p>
          </div>
        ) : (
          <div className="bg-surface border border-border-default rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-surface-elevated border-b border-border-default">
                  <tr>
                    <th className="px-6 py-4 text-xs font-bold text-text-muted uppercase tracking-wider">Type</th>
                    <th className="px-6 py-4 text-xs font-bold text-text-muted uppercase tracking-wider">Reference</th>
                    <th className="px-6 py-4 text-xs font-bold text-text-muted uppercase tracking-wider">Description</th>
                    <th className="px-6 py-4 text-xs font-bold text-text-muted uppercase tracking-wider">Date</th>
                    <th className="px-6 py-4 text-xs font-bold text-text-muted uppercase tracking-wider text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-default">
                  {data.transactions.map((tx: any) => (
                    <tr key={tx.id} className="hover:bg-surface-elevated/50 transition-colors">
                      <td className="px-6 py-4">
                        {tx.type === "credit" ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-success/10 text-success text-xs font-bold">
                            <ArrowDownLeft size={14} /> Credit
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-error/10 text-error text-xs font-bold">
                            <ArrowUpRight size={14} /> Debit
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm font-mono text-text-secondary">{tx.reference}</td>
                      <td className="px-6 py-4 text-sm text-foreground">{tx.description}</td>
                      <td className="px-6 py-4 text-sm text-text-secondary">{new Date(tx.createdAt).toLocaleString()}</td>
                      <td className={`px-6 py-4 text-sm font-black text-right ${tx.type === "credit" ? "text-success" : "text-foreground"}`}>
                        {tx.type === "credit" ? "+" : "-"}₦{Number(tx.amount).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function WalletPage() {
  return (
    <Suspense fallback={<div className="animate-pulse space-y-4"><div className="h-48 bg-surface-elevated rounded-xl"></div></div>}>
      <WalletContent />
    </Suspense>
  );
}
