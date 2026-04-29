"use client";

import { useState, useEffect } from "react";
import { Settings, Save, Globe, Shield } from "lucide-react";
import Swal from "sweetalert2";

export default function AdminSettings() {
  const [settings, setSettings] = useState<any>({
    site_name: "Sumon Mondal Logs Marketplace",
    contact_email: "",
    paystack_public_key: "",
    announcement_text: ""
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    didOpen: (toast) => {
      toast.addEventListener('mouseenter', Swal.stopTimer)
      toast.addEventListener('mouseleave', Swal.resumeTimer)
    }
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    const res = await fetch("/api/admin/settings", { credentials: 'include' });
    const data = await res.json();
    if (Object.keys(data).length > 0) {
      setSettings(prev => ({ ...prev, ...data }));
    }
    setLoading(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings)
      });

      if (res.ok) {
        Toast.fire({
          icon: 'success',
          title: 'Settings saved successfully'
        });
      } else {
        const data = await res.json();
        throw new Error(data.error || "Failed to save settings");
      }
    } catch (err: any) {
      Toast.fire({
        icon: 'error',
        title: err.message || 'An error occurred'
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="animate-pulse space-y-6"><div className="h-64 bg-surface-elevated rounded-xl"></div></div>;

  return (
    <div className="max-w-3xl">
      <h1 className="text-3xl font-bold font-[family-name:var(--font-syne)] text-foreground mb-8">
        Site Settings
      </h1>

      <form onSubmit={handleSave} className="space-y-6">
        <div className="vault-card p-8">
          <h2 className="text-xl font-bold font-[family-name:var(--font-syne)] text-foreground mb-6 flex items-center gap-2">
            <Globe size={20} className="text-primary" /> General Configuration
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-foreground mb-1.5">Marketplace Name</label>
              <input 
                type="text" 
                value={settings.site_name}
                onChange={(e) => setSettings({...settings, site_name: e.target.value})}
                className="w-full bg-surface-elevated border border-border-default rounded-xl px-4 py-2.5 text-foreground"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-foreground mb-1.5">Support Email</label>
              <input 
                type="email" 
                value={settings.contact_email}
                onChange={(e) => setSettings({...settings, contact_email: e.target.value})}
                className="w-full bg-surface-elevated border border-border-default rounded-xl px-4 py-2.5 text-foreground"
                placeholder="support@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-foreground mb-1.5">Header Announcement</label>
              <textarea 
                value={settings.announcement_text}
                onChange={(e) => setSettings({...settings, announcement_text: e.target.value})}
                className="w-full bg-surface-elevated border border-border-default rounded-xl px-4 py-2.5 text-foreground h-20"
                placeholder="Welcome to our new platform!"
              />
            </div>
          </div>
        </div>

        <div className="vault-card p-8">
          <h2 className="text-xl font-bold font-[family-name:var(--font-syne)] text-foreground mb-6 flex items-center gap-2">
            <Shield size={20} className="text-primary" /> Payments (Paystack)
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-foreground mb-1.5">Public Key</label>
              <input 
                type="text" 
                value={settings.paystack_public_key}
                onChange={(e) => setSettings({...settings, paystack_public_key: e.target.value})}
                className="w-full bg-surface-elevated border border-border-default rounded-xl px-4 py-2.5 text-foreground font-mono text-sm"
                placeholder="pk_test_..."
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end sticky bottom-8 bg-surface-elevated/80 backdrop-blur p-4 rounded-2xl border border-border-default shadow-xl">
          <button 
            type="submit" 
            disabled={saving}
            className="bg-primary hover:bg-primary-hover text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50"
          >
            {saving ? "Saving..." : <><Save size={20} /> Save Settings</>}
          </button>
        </div>
      </form>
    </div>
  );
}
