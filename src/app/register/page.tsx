"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { UserPlus } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ username, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Registration failed");
      }

      router.push("/login");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
      <div className="vault-card w-full max-w-md p-8">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4">
            <UserPlus size={24} />
          </div>
          <h1 className="text-2xl font-bold font-[family-name:var(--font-syne)] text-foreground">Create Account</h1>
          <p className="text-text-secondary mt-1 text-sm">Join the premium digital marketplace</p>
        </div>

        {error && (
          <div className="bg-error/10 text-error px-4 py-3 rounded-lg mb-6 text-sm font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-foreground mb-1.5">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-surface-elevated border border-border-default rounded-lg px-4 py-2.5 text-foreground focus:outline-none focus:border-primary transition-colors"
              placeholder="coolbuyer99"
              required
              minLength={3}
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-foreground mb-1.5">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-surface-elevated border border-border-default rounded-lg px-4 py-2.5 text-foreground focus:outline-none focus:border-primary transition-colors"
              placeholder="you@example.com"
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
              placeholder="••••••••"
              required
              minLength={8}
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-foreground mb-1.5">Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full bg-surface-elevated border border-border-default rounded-lg px-4 py-2.5 text-foreground focus:outline-none focus:border-primary transition-colors"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-3 rounded-lg transition-colors mt-4 disabled:opacity-50"
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <p className="text-center mt-6 text-sm text-text-secondary">
          Already have an account?{" "}
          <Link href="/login" className="text-primary hover:underline font-bold">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
