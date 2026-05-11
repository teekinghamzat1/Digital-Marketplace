"use client";

import { useState, useEffect } from "react";
import { Settings, Save, Globe, Shield, Mail, Image as ImageIcon, Palette, Phone, Send, Info, Share2 } from "lucide-react";
import Swal from "sweetalert2";

export default function AdminSettings() {
  const [settings, setSettings] = useState<any>({
    siteName: "",
    siteLogo: "",
    favicon: "",
    primaryColor: "#f97316",
    secondaryColor: "#fb923c",
    footerContact: "",
    email: "",
    whatsapp: "",
    telegram: "",
    socialLinks: { facebook: "", twitter: "", instagram: "", linkedin: "" },
    footerCopyright: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/settings", { credentials: 'include' });
      const data = await res.json();
      
      // Parse social links if they come as string
      if (data.socialLinks && typeof data.socialLinks === 'string') {
        try {
          data.socialLinks = JSON.parse(data.socialLinks);
        } catch (e) {
          data.socialLinks = { facebook: "", twitter: "", instagram: "", linkedin: "" };
        }
      }

      setSettings((prev: any) => ({ 
        ...prev, 
        ...data,
        socialLinks: { ...prev.socialLinks, ...(data.socialLinks || {}) }
      }));
    } catch (err) {
      console.error("Failed to fetch settings:", err);
    } finally {
      setLoading(false);
    }
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
        Swal.fire({
          icon: 'success',
          title: 'Settings Saved',
          text: 'Global website settings have been updated.',
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 3000
        });
      } else {
        const data = await res.json();
        throw new Error(data.error || "Failed to save settings");
      }
    } catch (err: any) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err.message || 'An error occurred'
      });
    } finally {
      setSaving(false);
    }
  };

  const updateSocialLink = (platform: string, value: string) => {
    setSettings({
      ...settings,
      socialLinks: { ...settings.socialLinks, [platform]: value }
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, key: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      Swal.fire({
        icon: 'error',
        title: 'File Too Large',
        text: 'Maximum file size is 2MB'
      });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setSettings((prev: any) => ({ ...prev, [key]: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  if (loading) return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 w-48 bg-surface-elevated rounded"></div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="h-64 bg-surface-elevated rounded-2xl"></div>
        <div className="h-64 bg-surface-elevated rounded-2xl"></div>
      </div>
    </div>
  );

  return (
    <div className="max-w-5xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold font-syne text-foreground tracking-tight">Website Management</h1>
          <p className="text-text-secondary mt-1 text-lg">Control your platform's global appearance and data.</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Branding Section */}
        <div className="vault-card p-8 space-y-6">
          <h2 className="text-xl font-bold font-syne text-foreground flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <Globe size={20} />
            </div>
            Identity & Branding
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Site Name</label>
              <input 
                type="text" 
                value={settings.siteName}
                onChange={(e) => setSettings({...settings, siteName: e.target.value})}
                className="w-full bg-surface-elevated border border-border-default rounded-xl px-4 py-3 text-foreground focus:border-primary outline-none transition-all"
                placeholder="Digital Marketplace"
              />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-4">
                <label className="block text-xs font-bold text-text-muted uppercase tracking-wider">Site Logo</label>
                <div className="flex flex-col gap-3">
                  {settings.siteLogo && (
                    <div className="relative w-20 h-20 rounded-xl overflow-hidden border border-border-default bg-surface-elevated">
                      <img src={settings.siteLogo} alt="Logo Preview" className="w-full h-full object-contain" />
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <label className="cursor-pointer bg-primary/10 hover:bg-primary/20 text-primary text-xs font-bold px-4 py-2 rounded-lg transition-all">
                      Upload Logo
                      <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'siteLogo')} />
                    </label>
                    <input 
                      type="text" 
                      value={settings.siteLogo}
                      onChange={(e) => setSettings({...settings, siteLogo: e.target.value})}
                      className="flex-1 bg-surface-elevated border border-border-default rounded-lg px-3 py-2 text-xs text-foreground focus:border-primary outline-none transition-all"
                      placeholder="Or enter URL"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <label className="block text-xs font-bold text-text-muted uppercase tracking-wider">Favicon</label>
                <div className="flex flex-col gap-3">
                  {settings.favicon && (
                    <div className="relative w-10 h-10 rounded-lg overflow-hidden border border-border-default bg-surface-elevated">
                      <img src={settings.favicon} alt="Favicon Preview" className="w-full h-full object-contain" />
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <label className="cursor-pointer bg-surface-elevated hover:bg-surface-elevated/80 text-foreground text-xs font-bold px-4 py-2 rounded-lg transition-all border border-border-default">
                      Upload Icon
                      <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'favicon')} />
                    </label>
                    <input 
                      type="text" 
                      value={settings.favicon}
                      onChange={(e) => setSettings({...settings, favicon: e.target.value})}
                      className="flex-1 bg-surface-elevated border border-border-default rounded-lg px-3 py-2 text-xs text-foreground focus:border-primary outline-none transition-all"
                      placeholder="Or enter URL"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Theme Section */}
        <div className="vault-card p-8 space-y-6">
          <h2 className="text-xl font-bold font-syne text-foreground flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <Palette size={20} />
            </div>
            Visual Style
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Primary Color</label>
              <div className="flex gap-3">
                <input 
                  type="color" 
                  value={settings.primaryColor}
                  onChange={(e) => setSettings({...settings, primaryColor: e.target.value})}
                  className="w-12 h-12 rounded-xl bg-transparent border-none cursor-pointer p-0"
                />
                <input 
                  type="text" 
                  value={settings.primaryColor}
                  onChange={(e) => setSettings({...settings, primaryColor: e.target.value})}
                  className="flex-1 bg-surface-elevated border border-border-default rounded-xl px-4 py-3 text-foreground font-mono text-sm"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Secondary Color</label>
              <div className="flex gap-3">
                <input 
                  type="color" 
                  value={settings.secondaryColor}
                  onChange={(e) => setSettings({...settings, secondaryColor: e.target.value})}
                  className="w-12 h-12 rounded-xl bg-transparent border-none cursor-pointer p-0"
                />
                <input 
                  type="text" 
                  value={settings.secondaryColor}
                  onChange={(e) => setSettings({...settings, secondaryColor: e.target.value})}
                  className="flex-1 bg-surface-elevated border border-border-default rounded-xl px-4 py-3 text-foreground font-mono text-sm"
                />
              </div>
            </div>
          </div>
          <p className="text-xs text-text-secondary bg-surface-elevated p-3 rounded-lg flex items-start gap-2">
            <Info size={14} className="mt-0.5 text-primary shrink-0" />
            Theme colors will update site-wide. Ensure colors have good contrast.
          </p>
        </div>

        {/* Contact Details */}
        <div className="vault-card p-8 space-y-6">
          <h2 className="text-xl font-bold font-syne text-foreground flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <Phone size={20} />
            </div>
            Contact & Channels
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Support Email</label>
              <input 
                type="email" 
                value={settings.email}
                onChange={(e) => setSettings({...settings, email: e.target.value})}
                className="w-full bg-surface-elevated border border-border-default rounded-xl px-4 py-3 text-foreground focus:border-primary outline-none transition-all"
                placeholder="support@sumondigital.com"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">WhatsApp Number</label>
                <input 
                  type="text" 
                  value={settings.whatsapp}
                  onChange={(e) => setSettings({...settings, whatsapp: e.target.value})}
                  className="w-full bg-surface-elevated border border-border-default rounded-xl px-4 py-3 text-foreground focus:border-primary outline-none transition-all"
                  placeholder="+880..."
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Telegram Link</label>
                <input 
                  type="text" 
                  value={settings.telegram}
                  onChange={(e) => setSettings({...settings, telegram: e.target.value})}
                  className="w-full bg-surface-elevated border border-border-default rounded-xl px-4 py-3 text-foreground focus:border-primary outline-none transition-all"
                  placeholder="https://t.me/..."
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Footer Contact Info</label>
              <textarea 
                value={settings.footerContact}
                onChange={(e) => setSettings({...settings, footerContact: e.target.value})}
                className="w-full bg-surface-elevated border border-border-default rounded-xl px-4 py-3 text-foreground focus:border-primary outline-none transition-all h-24 resize-none"
                placeholder="Business Address, Support Hours, etc."
              />
            </div>
          </div>
        </div>

        {/* Social & Legal Section */}
        <div className="vault-card p-8 space-y-6">
          <h2 className="text-xl font-bold font-syne text-foreground flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <Share2 size={20} />
            </div>
            Social & Copyright
          </h2>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1">Facebook</label>
                <input 
                  type="text" 
                  value={settings.socialLinks.facebook}
                  onChange={(e) => updateSocialLink('facebook', e.target.value)}
                  className="w-full bg-surface-elevated border border-border-default rounded-lg px-3 py-2 text-sm text-foreground outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1">Twitter (X)</label>
                <input 
                  type="text" 
                  value={settings.socialLinks.twitter}
                  onChange={(e) => updateSocialLink('twitter', e.target.value)}
                  className="w-full bg-surface-elevated border border-border-default rounded-lg px-3 py-2 text-sm text-foreground outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1">Instagram</label>
                <input 
                  type="text" 
                  value={settings.socialLinks.instagram}
                  onChange={(e) => updateSocialLink('instagram', e.target.value)}
                  className="w-full bg-surface-elevated border border-border-default rounded-lg px-3 py-2 text-sm text-foreground outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1">LinkedIn</label>
                <input 
                  type="text" 
                  value={settings.socialLinks.linkedin}
                  onChange={(e) => updateSocialLink('linkedin', e.target.value)}
                  className="w-full bg-surface-elevated border border-border-default rounded-lg px-3 py-2 text-sm text-foreground outline-none"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Footer Copyright Text</label>
              <input 
                type="text" 
                value={settings.footerCopyright}
                onChange={(e) => setSettings({...settings, footerCopyright: e.target.value})}
                className="w-full bg-surface-elevated border border-border-default rounded-xl px-4 py-3 text-foreground focus:border-primary outline-none transition-all"
                placeholder="© 2026 Sumon Digital. All rights reserved."
              />
            </div>
          </div>
        </div>

        {/* Floating Action Bar */}
        <div className="md:col-span-2 flex items-center justify-end fixed bottom-8 right-8 z-[50]">
          <button 
            type="submit" 
            disabled={saving}
            className="bg-primary hover:bg-primary-hover text-white px-10 py-4 rounded-2xl font-bold flex items-center gap-3 transition-all active:scale-95 disabled:opacity-50 shadow-2xl shadow-primary/40 border border-white/20"
          >
            {saving ? (
              <span className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Saving...
              </span>
            ) : (
              <><Save size={22} /> Update Website Settings</>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
