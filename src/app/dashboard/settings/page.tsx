"use client";

import { useState, useEffect } from "react";
import { User } from "lucide-react";

export default function SettingsPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me", { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        setUser(data);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="animate-pulse space-y-4"><div className="h-64 bg-surface-elevated rounded-xl"></div></div>;

  return (
    <div className="max-w-2xl">
      <h1 className="text-3xl font-bold font-[family-name:var(--font-syne)] text-foreground mb-8">
        Account Settings
      </h1>

      <div className="vault-card p-8">
        <div className="flex items-center gap-6 mb-8 pb-8 border-b border-border-default">
          <div className="w-20 h-20 rounded-full bg-primary/10 text-primary flex items-center justify-center">
            <User size={40} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">{user?.username}</h2>
            <p className="text-text-secondary">Member since {new Date(user?.createdAt).toLocaleDateString()}</p>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-foreground mb-1.5">Email Address</label>
            <input
              type="email"
              value={user?.email}
              disabled
              className="w-full bg-surface border border-border-default rounded-xl px-4 py-3 text-text-muted cursor-not-allowed"
            />
            <p className="text-xs text-text-secondary mt-2">Email address cannot be changed. Contact support if needed.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
