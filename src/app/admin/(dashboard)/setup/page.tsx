"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ShieldAlert } from "lucide-react";

export default function AdminSetupPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    fetch("/api/admin/setup/status", { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        if (data.setupCompleted) {
          router.push("/admin/login");
        } else {
          setChecking(false);
        }
      });
  }, [router]);

  const handleSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/admin/setup", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

      router.push("/admin/login?setup=success");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (checking) return <div className="min-h-screen bg-background flex items-center justify-center">Checking setup status...</div>;

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="vault-card w-full max-w-md p-8 border-primary/50">
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4">
            <ShieldAlert size={32} />
          </div>
          <h1 className="text-2xl font-bold font-[family-name:var(--font-syne)] text-foreground">Initial Admin Setup</h1>
          <p className="text-text-secondary mt-2 text-sm">Create the master administrator account. This can only be done once.</p>
        </div>

        {error && <div className="bg-error/10 text-error px-4 py-3 rounded-lg mb-6 text-sm font-medium">{error}</div>}

        <form onSubmit={handleSetup} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-foreground mb-1.5">Admin Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-surface-elevated border border-border-default rounded-lg px-4 py-2.5 text-foreground focus:outline-none focus:border-primary transition-colors"
              required
            />
          </div>
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
            <label className="block text-sm font-bold text-foreground mb-1.5">Master Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-surface-elevated border border-border-default rounded-lg px-4 py-2.5 text-foreground focus:outline-none focus:border-primary transition-colors"
              required
              minLength={8}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-3 rounded-lg transition-colors mt-6 disabled:opacity-50"
          >
            {loading ? "Creating..." : "Complete Setup"}
          </button>
        </form>
      </div>
    </div>
  );
}
