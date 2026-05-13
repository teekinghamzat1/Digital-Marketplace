"use client";

import { useState } from "react";
import { 
  Tag, Plus, Trash2, Edit3, 
  LayoutGrid, List,
  ArrowUp, ArrowDown, Settings2,
  CheckCircle2, AlertCircle, Loader2, X
} from "lucide-react";

interface Category {
  id: string;
  name: string;
  _count: {
    products: number;
  };
}

export function CategoryManager({ initialCategories }: { initialCategories: Category[] }) {
  const [categories, setCategories] = useState(initialCategories);
  const [loading, setLoading] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [editCategory, setEditCategory] = useState<Category | null>(null);
  const [newName, setNewName] = useState("");

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this category?")) return;
    
    setLoading(id);
    try {
      const res = await fetch(`/api/admin/categories/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setCategories(prev => prev.filter(c => c.id !== id));
      } else {
        const data = await res.json();
        alert(data.error || "Failed to delete category");
      }
    } catch (err) {
      alert("Error deleting category");
    } finally {
      setLoading(null);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    setSaving(true);
    try {
      const url = editCategory ? `/api/admin/categories/${editCategory.id}` : "/api/admin/categories";
      const method = editCategory ? "PUT" : "POST";
      
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName }),
      });

      if (res.ok) {
        window.location.reload(); // Refresh to get updated list and counts
      } else {
        const data = await res.json();
        alert(data.error || "Failed to save category");
      }
    } catch (err) {
      alert("Error saving category");
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (cat: Category) => {
    setEditCategory(cat);
    setNewName(cat.name);
  };

  const cancelEdit = () => {
    setEditCategory(null);
    setNewName("");
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
      {/* Category List */}
      <div className="xl:col-span-7 space-y-4">
        <div className="flex items-center justify-between px-2">
          <h2 className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Active Categories ({categories.length})</h2>
          <div className="flex items-center gap-2">
             <button className="p-2 bg-surface-elevated rounded-lg text-primary border border-border-default"><List size={14} /></button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {categories.map((cat) => (
            <div key={cat.id} className="vault-card p-4 md:p-5 flex items-center gap-4 group cursor-default border-border-default">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-300">
                <Tag size={20} />
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="text-base font-bold text-foreground mb-0.5">{cat.name}</h3>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-md uppercase tracking-wider">
                    {cat._count.products} Products
                  </span>
                  <span className="text-[10px] text-text-muted font-bold uppercase tracking-tight">
                    ID: {cat.id.slice(0, 5)}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1">
                 <button 
                  onClick={() => startEdit(cat)}
                  className="p-3 md:p-2 text-text-muted hover:text-primary hover:bg-primary/10 rounded-xl transition-all"
                >
                   <Edit3 size={18} />
                 </button>
                 <button 
                  onClick={() => handleDelete(cat.id)}
                  disabled={loading === cat.id}
                  className="p-3 md:p-2 text-text-muted hover:text-danger hover:bg-danger/10 rounded-xl transition-all disabled:opacity-50"
                >
                   {loading === cat.id ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
                 </button>
              </div>
            </div>
          ))}

          {categories.length === 0 && (
            <div className="vault-card p-12 text-center border-dashed border-border-default">
              <Tag size={48} className="mx-auto mb-4 opacity-10 text-foreground" />
              <p className="text-text-muted font-medium">No categories created yet.</p>
            </div>
          )}
        </div>
      </div>

      {/* Category Form */}
      <div className="xl:col-span-5">
         <div className="vault-card p-8 sticky top-24 border-border-default">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <Settings2 size={20} />
                </div>
                <h2 className="text-xl font-bold font-syne text-foreground tracking-tight">
                  {editCategory ? "Edit Category" : "Create Category"}
                </h2>
              </div>
              {editCategory && (
                <button onClick={cancelEdit} className="text-text-muted hover:text-foreground transition-colors">
                  <X size={20} />
                </button>
              )}
            </div>

            <form className="space-y-6" onSubmit={handleSave}>
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-text-muted uppercase tracking-widest px-1">Category Name</label>
                <input 
                  type="text" 
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Premium Accounts" 
                  className="w-full bg-surface-elevated border border-border-default rounded-xl px-4 py-4 text-sm font-bold focus:border-primary outline-none transition-all text-foreground shadow-sm"
                  required
                />
              </div>

              <div className="pt-4 flex items-center gap-4">
                {editCategory && (
                  <button 
                    type="button" 
                    onClick={cancelEdit}
                    className="flex-1 py-4 text-sm font-bold text-text-muted hover:text-foreground transition-colors"
                  >
                    Cancel
                  </button>
                )}
                <button 
                  type="submit" 
                  disabled={saving || !newName.trim()}
                  className="flex-1 py-4 bg-primary text-white rounded-2xl font-black text-sm shadow-xl shadow-primary/20 hover:bg-primary-hover transition-all active:scale-95 disabled:opacity-50"
                >
                  {saving ? <Loader2 size={18} className="animate-spin" /> : (editCategory ? "Update Category" : "Save Category")}
                </button>
              </div>
            </form>

            <div className="mt-8 p-4 bg-warning/5 border border-warning/20 rounded-xl flex gap-3">
               <AlertCircle size={18} className="text-warning shrink-0 mt-0.5" />
               <p className="text-[11px] text-text-secondary leading-relaxed uppercase font-bold tracking-tight">
                 {editCategory 
                   ? "You are currently editing an existing category. Update the name above."
                   : "Deleting a category will fail if it has products. Move products first."
                 }
               </p>
            </div>
         </div>
      </div>
    </div>
  );
}
