"use client";

import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, LayoutGrid } from "lucide-react";

export default function AdminCategories() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [formData, setFormData] = useState({ name: "", icon: "📂", description: "", isActive: true, sortOrder: 0 });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/categories", { credentials: 'include' });
      const data = await res.json();
      if (Array.isArray(data)) {
        setCategories(data);
      } else {
        setCategories([]);
      }
    } catch (err) {
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editingCategory ? `/api/admin/categories/${editingCategory.id}` : "/api/admin/categories";
    const method = editingCategory ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(formData)
    });

    if (res.ok) {
      setModalOpen(false);
      setEditingCategory(null);
      setFormData({ name: "", icon: "📂", description: "", isActive: true, sortOrder: 0 });
      fetchCategories();
    } else {
      const data = await res.json();
      alert(data.error);
    }
  };

  const handleEdit = (cat: any) => {
    setEditingCategory(cat);
    setFormData({
      name: cat.name,
      icon: cat.icon || "📂",
      description: cat.description || "",
      isActive: cat.isActive,
      sortOrder: cat.sortOrder
    });
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this category?")) return;
    const res = await fetch(`/api/admin/categories/${id}`, { 
      method: "DELETE",
      credentials: "include" 
    });
    if (res.ok) {
      fetchCategories();
    } else {
      const data = await res.json();
      alert(data.error);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold font-[family-name:var(--font-syne)] text-foreground">Categories</h1>
        <button 
          onClick={() => { setEditingCategory(null); setFormData({ name: "", icon: "📂", description: "", isActive: true, sortOrder: 0 }); setModalOpen(true); }}
          className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-lg font-bold transition-colors"
        >
          <Plus size={20} /> Add Category
        </button>
      </div>

      {loading ? (
        <div className="animate-pulse space-y-4">
          <div className="h-12 bg-surface-elevated rounded-lg"></div>
          <div className="h-12 bg-surface-elevated rounded-lg"></div>
        </div>
      ) : (
        <div className="bg-surface border border-border-default rounded-xl overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-surface-elevated border-b border-border-default">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-text-muted uppercase tracking-wider">Icon</th>
                <th className="px-6 py-4 text-xs font-bold text-text-muted uppercase tracking-wider">Name</th>
                <th className="px-6 py-4 text-xs font-bold text-text-muted uppercase tracking-wider">Order</th>
                <th className="px-6 py-4 text-xs font-bold text-text-muted uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-text-muted uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-default">
              {Array.isArray(categories) && categories.map(cat => (
                <tr key={cat.id} className="hover:bg-surface-elevated/50">
                  <td className="px-6 py-4 text-2xl">{cat.icon}</td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-foreground">{cat.name}</div>
                    <div className="text-xs text-text-muted">{cat._count.products} Products</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-text-secondary">{cat.sortOrder}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${cat.isActive ? 'bg-success/10 text-success' : 'bg-error/10 text-error'}`}>
                      {cat.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button onClick={() => handleEdit(cat)} className="text-text-secondary hover:text-primary transition-colors"><Pencil size={18} /></button>
                    <button onClick={() => handleDelete(cat.id)} className="text-text-secondary hover:text-error transition-colors"><Trash2 size={18} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="vault-card w-full max-w-md p-8">
            <h2 className="text-2xl font-bold mb-6 font-[family-name:var(--font-syne)]">{editingCategory ? "Edit Category" : "Add Category"}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-1.5">Category Name</label>
                <input 
                  type="text" 
                  value={formData.name} 
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-surface-elevated border border-border-default rounded-lg px-4 py-2 text-foreground" 
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold mb-1.5">Icon (Emoji)</label>
                  <input 
                    type="text" 
                    value={formData.icon} 
                    onChange={(e) => setFormData({...formData, icon: e.target.value})}
                    className="w-full bg-surface-elevated border border-border-default rounded-lg px-4 py-2 text-foreground" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1.5">Sort Order</label>
                  <input 
                    type="number" 
                    value={formData.sortOrder} 
                    onChange={(e) => setFormData({...formData, sortOrder: parseInt(e.target.value)})}
                    className="w-full bg-surface-elevated border border-border-default rounded-lg px-4 py-2 text-foreground" 
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold mb-1.5">Description</label>
                <textarea 
                  value={formData.description} 
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full bg-surface-elevated border border-border-default rounded-lg px-4 py-2 text-foreground h-20"
                />
              </div>
              <div className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  checked={formData.isActive} 
                  onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                  id="isActive"
                />
                <label htmlFor="isActive" className="text-sm font-bold">Active</label>
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setModalOpen(false)} className="flex-1 px-4 py-2 rounded-lg border border-border-default font-bold">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-2 rounded-lg bg-primary text-white font-bold">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
