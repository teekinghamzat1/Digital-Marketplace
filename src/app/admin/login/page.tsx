"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ShieldCheck } from "lucide-react";

function AdminLoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

      window.location.href = "/admin";
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="vault-card w-full max-w-md p-8 border-primary/50 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent" />
      
      <div className="flex flex-col items-center mb-8">
        <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4">
          <ShieldCheck size={32} />
        </div>
        <h1 className="text-2xl font-bold font-[family-name:var(--font-syne)] text-foreground">Admin Portal</h1>
        <p className="text-text-secondary mt-1 text-sm tracking-widest uppercase">Restricted Access</p>
      </div>

      {searchParams.get("setup") === "success" && (
        <div className="bg-success/10 text-success px-4 py-3 rounded-lg mb-6 text-sm font-medium text-center">
          Setup completed successfully. Please log in.
        </div>
      )}

      {error && <div className="bg-error/10 text-error px-4 py-3 rounded-lg mb-6 text-sm font-medium">{error}</div>}

      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="block text-sm font-bold text-foreground mb-1.5">Admin Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-surface-elevated border border-border-default rounded-lg px-4 py-2.5 text-foreground focus:outline-none focus:border-primary transition-colors"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-bold text-foreground mb-1.5">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-surface-elevated border border-border-default rounded-lg px-4 py-2.5 text-foreground focus:outline-none focus:border-primary transition-colors"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-foreground hover:bg-text-secondary text-background font-bold py-3 rounded-lg transition-colors mt-6 disabled:opacity-50"
        >
          {loading ? "Authenticating..." : "Login to Dashboard"}
        </button>
      </form>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Suspense fallback={<div className="animate-pulse w-full max-w-md h-96 bg-surface-elevated rounded-2xl" />}>
        <AdminLoginContent />
      </Suspense>
    </div>
  );
}
