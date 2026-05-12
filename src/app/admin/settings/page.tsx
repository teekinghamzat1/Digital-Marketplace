"use client";

import { useState, useEffect, useRef } from "react";
import {
  Settings, Save, Globe, Palette, Phone, Share2, 
  Image as ImageIcon, X, Eye, Check, Loader2
} from "lucide-react";

// ─── Tiny inline color picker swatch ────────────────────────────────────────
function ColorSwatch({
  label, value, onChange
}: { label: string; value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="flex flex-col gap-2" ref={ref}>
      <label className="text-[11px] font-bold text-text-muted uppercase tracking-widest">{label}</label>
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="flex items-center gap-3 p-3 bg-surface-elevated border border-border-default hover:border-primary/50 rounded-xl transition-all w-full group"
        >
          <div
            className="w-8 h-8 rounded-lg shadow-inner border border-white/20 transition-transform group-hover:scale-110 shrink-0"
            style={{ backgroundColor: value }}
          />
          <span className="font-mono text-sm text-foreground flex-1 text-left">{value}</span>
          <Eye size={14} className="text-text-muted" />
        </button>

        {open && (
          <div className="absolute top-full mt-2 left-0 z-50 bg-surface border border-border-default rounded-2xl shadow-2xl p-4 w-64 animate-in fade-in zoom-in-95 duration-200">
            <input
              type="color"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className="w-full h-36 rounded-xl cursor-pointer border-none bg-transparent"
              style={{ padding: 0 }}
            />
            <div className="mt-3 flex items-center gap-2">
              <div className="w-6 h-6 rounded-md border border-border-default" style={{ backgroundColor: value }} />
              <span className="font-mono text-sm text-foreground flex-1">{value}</span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="p-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
              >
                <Check size={14} />
              </button>
            </div>
            {/* Quick preset swatches */}
            <div className="mt-3 grid grid-cols-8 gap-1.5">
              {["#f97316","#ef4444","#8b5cf6","#3b82f6","#10b981","#f59e0b","#ec4899","#0ea5e9",
                "#1f2937","#111827","#ffffff","#f9fafb","#6366f1","#14b8a6","#84cc16","#fb923c"].map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => onChange(c)}
                  className="w-6 h-6 rounded-md border border-white/10 hover:scale-110 transition-transform"
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Live Theme Preview Strip ─────────────────────────────────────────────────
function ThemePreview({ colors }: { colors: Record<string, string> }) {
  return (
    <div
      className="rounded-2xl overflow-hidden border border-border-default shadow-inner"
      style={{ backgroundColor: colors.backgroundColor || "#fff" }}
    >
      {/* Fake nav bar */}
      <div
        className="px-4 py-3 flex items-center justify-between"
        style={{ backgroundColor: colors.primaryColor, color: "#fff" }}
      >
        <span className="font-bold text-sm">Site Preview</span>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-white/30" />
          <div className="w-12 h-4 rounded-md bg-white/30" />
        </div>
      </div>
      {/* Fake content */}
      <div className="p-4 space-y-3">
        <h3 className="font-bold text-lg" style={{ color: colors.textColor || "#111" }}>
          Welcome to the Marketplace
        </h3>
        <p className="text-sm opacity-60" style={{ color: colors.textColor || "#111" }}>
          This is a live preview of your brand colors.
        </p>
        <div className="flex gap-2 flex-wrap">
          <button
            className="px-4 py-2 rounded-xl text-sm font-bold text-white shadow"
            style={{ backgroundColor: colors.primaryColor }}
          >
            Primary Button
          </button>
          <button
            className="px-4 py-2 rounded-xl text-sm font-bold text-white shadow"
            style={{ backgroundColor: colors.secondaryColor }}
          >
            Secondary
          </button>
          <span
            className="px-3 py-2 rounded-xl text-xs font-bold"
            style={{ backgroundColor: colors.accentColor + "22", color: colors.accentColor }}
          >
            Badge
          </span>
        </div>
        {/* Fake card */}
        <div className="p-3 rounded-xl border" style={{ borderColor: colors.primaryColor + "30", backgroundColor: colors.primaryColor + "08" }}>
          <p className="text-xs font-bold" style={{ color: colors.primaryColor }}>Card Component</p>
          <p className="text-xs mt-1 opacity-60" style={{ color: colors.textColor || "#111" }}>
            How a highlighted card looks.
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Field helpers ────────────────────────────────────────────────────────────
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">{label}</label>
      {children}
    </div>
  );
}

const inputCls = "w-full bg-surface-elevated border border-border-default rounded-xl px-4 py-3 text-foreground focus:border-primary outline-none transition-all";

// ─── Main Component ────────────────────────────────────────────────────────────
export default function AdminSettings() {
  const [settings, setSettings] = useState<any>({
    siteName: "", siteDescription: "", siteLogo: "", favicon: "",
    primaryColor: "#f97316", secondaryColor: "#fb923c",
    accentColor: "#f59e0b", backgroundColor: "#ffffff", textColor: "#111827",
    email: "", whatsapp: "", telegram: "", footerContact: "", address: "",
    copyrightText: "",
    socialLinks: { facebook: "", twitter: "", instagram: "", linkedin: "" },
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  const showToast = (type: "success" | "error", msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    fetch("/api/admin/settings", { credentials: "include" })
      .then(r => r.json())
      .then(data => {
        if (data.socialLinks && typeof data.socialLinks === "string") {
          try { data.socialLinks = JSON.parse(data.socialLinks); } catch { data.socialLinks = {}; }
        }
        // Map legacy footerCopyright → copyrightText
        if (!data.copyrightText && data.footerCopyright) data.copyrightText = data.footerCopyright;
        setSettings((prev: any) => ({ ...prev, ...data, socialLinks: { ...prev.socialLinks, ...(data.socialLinks || {}) } }));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const set = (key: string, value: any) => setSettings((p: any) => ({ ...p, [key]: value }));
  const setSocial = (k: string, v: string) => setSettings((p: any) => ({ ...p, socialLinks: { ...p.socialLinks, [k]: v } }));

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      // Sync legacy key
      const payload = { ...settings, footerCopyright: settings.copyrightText };
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        showToast("success", "Website settings updated successfully!");
      } else {
        const d = await res.json();
        showToast("error", d.error || "Save failed");
      }
    } catch (err: any) {
      showToast("error", err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { showToast("error", "Max file size is 2MB"); return; }
    const reader = new FileReader();
    reader.onloadend = () => set("siteLogo", reader.result as string);
    reader.readAsDataURL(file);
  };

  if (loading) return (
    <div className="space-y-6 animate-pulse">
      {[...Array(4)].map((_, i) => <div key={i} className="h-48 bg-surface-elevated rounded-2xl" />)}
    </div>
  );

  const themeColors = {
    primaryColor: settings.primaryColor,
    secondaryColor: settings.secondaryColor,
    accentColor: settings.accentColor,
    backgroundColor: settings.backgroundColor,
    textColor: settings.textColor,
  };

  return (
    <div className="max-w-5xl space-y-8 pb-28 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold font-syne text-foreground tracking-tight">Website Management</h1>
        <p className="text-text-secondary mt-1 text-lg">Control your platform's global appearance and data.</p>
      </div>

      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-[200] flex items-center gap-3 px-5 py-4 rounded-2xl shadow-2xl font-bold text-white text-sm animate-in slide-in-from-top-4 duration-300 ${
          toast.type === "success" ? "bg-success" : "bg-error"
        }`}>
          {toast.type === "success" ? <Check size={18} /> : <X size={18} />}
          {toast.msg}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-8">

        {/* ── 1. Identity & Branding ── */}
        <section className="vault-card p-8 space-y-6">
          <h2 className="text-xl font-bold font-syne text-foreground flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary"><Globe size={20} /></div>
            Identity & Branding
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Field label="Site Name">
              <input value={settings.siteName} onChange={e => set("siteName", e.target.value)} className={inputCls} placeholder="Digital Marketplace" />
            </Field>
            <Field label="Support Email">
              <input type="email" value={settings.email} onChange={e => set("email", e.target.value)} className={inputCls} placeholder="support@marketplace.com" />
            </Field>
          </div>
          <Field label="Site Description">
            <textarea value={settings.siteDescription} onChange={e => set("siteDescription", e.target.value)} className={`${inputCls} h-20 resize-none`} placeholder="The most trusted digital marketplace..." />
          </Field>
          {/* Logo */}
          <div>
            <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-3">Site Logo</label>
            <div className="flex items-start gap-4">
              <div className="w-20 h-20 rounded-xl border border-border-default bg-surface-elevated flex items-center justify-center overflow-hidden shrink-0">
                {settings.siteLogo
                  ? <img src={settings.siteLogo} alt="Logo" className="w-full h-full object-contain" />
                  : <ImageIcon size={24} className="text-text-muted" />}
              </div>
              <div className="flex flex-col gap-2 flex-1">
                <label className="cursor-pointer inline-flex items-center gap-2 bg-primary/10 hover:bg-primary/20 text-primary text-sm font-bold px-4 py-2 rounded-xl transition-all w-fit">
                  <ImageIcon size={16} /> Upload Logo
                  <input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} />
                </label>
                <input
                  type="text"
                  value={settings.siteLogo}
                  onChange={e => set("siteLogo", e.target.value)}
                  className={`${inputCls} text-sm`}
                  placeholder="Or paste an image URL"
                />
                {settings.siteLogo && (
                  <button type="button" onClick={() => set("siteLogo", "")}
                    className="inline-flex items-center gap-2 text-error text-xs font-bold hover:underline w-fit"
                  >
                    <X size={12} /> Remove Logo (show site name instead)
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ── 2. Theme Editor ── */}
        <section className="vault-card p-8 space-y-6">
          <h2 className="text-xl font-bold font-syne text-foreground flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary"><Palette size={20} /></div>
            Visual Theme Editor
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <ColorSwatch label="Primary Color" value={settings.primaryColor} onChange={v => set("primaryColor", v)} />
            <ColorSwatch label="Secondary Color" value={settings.secondaryColor} onChange={v => set("secondaryColor", v)} />
            <ColorSwatch label="Accent Color" value={settings.accentColor} onChange={v => set("accentColor", v)} />
            <ColorSwatch label="Background Color" value={settings.backgroundColor} onChange={v => set("backgroundColor", v)} />
            <ColorSwatch label="Text Color" value={settings.textColor} onChange={v => set("textColor", v)} />
          </div>
          {/* Live Preview */}
          <div>
            <p className="text-xs font-bold text-text-muted uppercase tracking-widest mb-3">Live Preview</p>
            <ThemePreview colors={themeColors} />
          </div>
        </section>

        {/* ── 3. Contact & Footer ── */}
        <section className="vault-card p-8 space-y-6">
          <h2 className="text-xl font-bold font-syne text-foreground flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary"><Phone size={20} /></div>
            Contact & Footer
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="WhatsApp Number">
              <input value={settings.whatsapp} onChange={e => set("whatsapp", e.target.value)} className={inputCls} placeholder="+2348012345678" />
            </Field>
            <Field label="Telegram Link">
              <input value={settings.telegram} onChange={e => set("telegram", e.target.value)} className={inputCls} placeholder="https://t.me/yourchannel" />
            </Field>
          </div>
          <Field label="Address">
            <textarea value={settings.address} onChange={e => set("address", e.target.value)} className={`${inputCls} h-20 resize-none`} placeholder="Lagos, Nigeria" />
          </Field>
          <Field label="Footer Contact Info">
            <textarea value={settings.footerContact} onChange={e => set("footerContact", e.target.value)} className={`${inputCls} h-20 resize-none`} placeholder="Business hours, additional notes..." />
          </Field>
          <Field label="Copyright Text">
            <input value={settings.copyrightText} onChange={e => set("copyrightText", e.target.value)} className={inputCls} placeholder={`© ${new Date().getFullYear()} Digital Marketplace. All rights reserved.`} />
          </Field>
        </section>

        {/* ── 4. Social Links ── */}
        <section className="vault-card p-8 space-y-6">
          <h2 className="text-xl font-bold font-syne text-foreground flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary"><Share2 size={20} /></div>
            Social Links
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {["facebook", "twitter", "instagram", "linkedin"].map(p => (
              <Field key={p} label={p.charAt(0).toUpperCase() + p.slice(1)}>
                <input
                  value={settings.socialLinks[p] || ""}
                  onChange={e => setSocial(p, e.target.value)}
                  className={inputCls}
                  placeholder={`https://${p}.com/yourpage`}
                />
              </Field>
            ))}
          </div>
        </section>

        {/* ── Floating Save Button ── */}
        <div className="fixed bottom-8 right-8 z-50">
          <button
            type="submit"
            disabled={saving}
            className="bg-primary hover:bg-primary-hover text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-3 transition-all active:scale-95 disabled:opacity-50 shadow-2xl shadow-primary/40 border border-white/20"
          >
            {saving
              ? <><Loader2 size={20} className="animate-spin" /> Saving...</>
              : <><Save size={20} /> Update Settings</>
            }
          </button>
        </div>
      </form>
    </div>
  );
}
