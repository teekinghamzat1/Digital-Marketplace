"use client";

import { useState } from "react";
import { Plus, User, Mail, ShieldAlert } from "lucide-react";

export function AdminManager({ initialAdmins }: { initialAdmins: any[] }) {
  const [admins, setAdmins] = useState(initialAdmins);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/admin/admins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create admin");

      setAdmins([data.admin, ...admins]);
      setIsModalOpen(false);
      setFormData({ username: '', email: '', password: '' });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <div></div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold transition-all shadow-lg shadow-primary/20"
        >
          <Plus size={18} />
          Add Administrator
        </button>
      </div>

      <div className="bg-surface-elevated border border-border-default rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 border-b border-border-default">
                <th className="py-4 px-6 text-[10px] uppercase tracking-widest text-text-muted font-bold">Admin</th>
                <th className="py-4 px-6 text-[10px] uppercase tracking-widest text-text-muted font-bold">Email</th>
                <th className="py-4 px-6 text-[10px] uppercase tracking-widest text-text-muted font-bold">Date Added</th>
              </tr>
            </thead>
            <tbody>
              {admins.map((admin: any) => (
                <tr key={admin.id} className="border-b border-border-default/50 hover:bg-white/5 transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        <ShieldAlert size={18} />
                      </div>
                      <div>
                        <p className="font-bold text-foreground">{admin.username}</p>
                        <p className="text-xs text-text-muted">ID: {admin.id.substring(0, 8)}...</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2 text-text-secondary">
                      <Mail size={14} />
                      {admin.email}
                    </div>
                  </td>
                  <td className="py-4 px-6 text-text-secondary text-sm">
                    {new Date(admin.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
              {admins.length === 0 && (
                <tr>
                  <td colSpan={3} className="py-8 text-center text-text-muted">
                    No administrators found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-surface-elevated w-full max-w-md rounded-3xl border border-border-default overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-border-default flex justify-between items-center bg-white/5">
              <h2 className="font-bold text-lg text-foreground font-syne">Add New Administrator</h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-text-muted hover:text-foreground transition-colors"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && (
                <div className="p-3 rounded-xl bg-danger/10 border border-danger/20 text-danger text-sm font-medium">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Username</label>
                <input 
                  type="text" 
                  required
                  value={formData.username}
                  onChange={e => setFormData({...formData, username: e.target.value})}
                  className="w-full bg-background border border-border-default rounded-xl px-4 py-3 text-sm focus:border-primary outline-none transition-all text-foreground"
                  placeholder="e.g. superadmin"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Email Address</label>
                <input 
                  type="email" 
                  required
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  className="w-full bg-background border border-border-default rounded-xl px-4 py-3 text-sm focus:border-primary outline-none transition-all text-foreground"
                  placeholder="admin@example.com"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Password</label>
                <input 
                  type="password" 
                  required
                  value={formData.password}
                  onChange={e => setFormData({...formData, password: e.target.value})}
                  className="w-full bg-background border border-border-default rounded-xl px-4 py-3 text-sm focus:border-primary outline-none transition-all text-foreground"
                  placeholder="Enter secure password"
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-3 border border-border-default text-text-secondary hover:text-foreground hover:bg-white/5 rounded-xl font-bold transition-all text-sm"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-all text-sm disabled:opacity-50"
                >
                  {isSubmitting ? 'Adding...' : 'Create Admin'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
