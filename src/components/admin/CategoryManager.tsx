"use client";

import { useState } from "react";
import { 
  Tag, Plus, GripVertical, Trash2, Edit3, 
  ChevronRight, LayoutGrid, List,
  ArrowUp, ArrowDown, Settings2,
  CheckCircle2, AlertCircle, Loader2
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
  const [editCategory, setEditCategory] = useState<Category | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this category? Products will remain but will be uncategorized.")) return;
    
    setLoading(id);
    try {
      const res = await fetch(`/api/admin/categories/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setCategories(prev => prev.filter(c => c.id !== id));
      } else {
        alert("Failed to delete category");
      }
    } catch (err) {
      alert("Error deleting category");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
      {/* Category List */}
      <div className="xl:col-span-7 space-y-4">
        <div className="flex items-center justify-between px-2">
          <h2 className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Active Categories ({categories.length})</h2>
          <div className="flex items-center gap-2">
             <button className="p-2 bg-surface-elevated rounded-lg text-primary border border-border-default"><List size={14} /></button>
             <button className="p-2 text-text-muted hover:text-foreground"><LayoutGrid size={14} /></button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {categories.map((cat) => (
            <div key={cat.id} className="vault-card p-4 md:p-5 flex items-center gap-4 group cursor-default">
              <div className="hidden md:flex flex-col text-text-muted opacity-30 group-hover:opacity-100 transition-opacity">
                <ArrowUp size={14} className="hover:text-primary cursor-pointer" />
                <ArrowDown size={14} className="hover:text-primary cursor-pointer" />
              </div>

              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-300">
                <Tag size={20} />
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="text-base font-bold text-foreground mb-0.5">{cat.name}</h3>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-md uppercase tracking-wider">
                    {cat._count.products} Products
                  </span>
                  <span className="text-[10px] text-text-muted font-bold">
                    ID: {cat.id.slice(0, 5)}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1">
                 <button 
                  onClick={() => setEditCategory(cat)}
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

      {/* Category Edit Form */}
      <div className="xl:col-span-5">
         <div className="vault-card p-8 sticky top-24">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <Settings2 size={20} />
              </div>
              <h2 className="text-xl font-bold font-syne text-foreground tracking-tight">
                {editCategory ? "Edit Category" : "Create Category"}
              </h2>
            </div>

            <form className="space-y-6" onSubmit={(e) => {
              e.preventDefault();
              alert("Save functionality coming soon!");
            }}>
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-text-muted uppercase tracking-widest px-1">Category Name</label>
                <input 
                  type="text" 
                  defaultValue={editCategory?.name || ""}
                  placeholder="e.g. Premium Accounts" 
                  className="w-full bg-surface-elevated border border-border-default rounded-xl px-4 py-4 text-sm font-medium focus:border-primary outline-none transition-all text-foreground"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold text-text-muted uppercase tracking-widest px-1">Internal Description</label>
                <textarea 
                  placeholder="What kind of products go here?" 
                  className="w-full bg-surface-elevated border border-border-default rounded-xl px-4 py-4 text-sm font-medium focus:border-primary outline-none transition-all h-24 resize-none text-foreground"
                ></textarea>
              </div>

              <div className="p-4 bg-surface-elevated/50 rounded-2xl border border-border-default flex items-center justify-between">
                 <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-success/20 flex items-center justify-center text-success">
                      <CheckCircle2 size={16} />
                    </div>
                    <span className="text-sm font-bold text-foreground">Visible on Site</span>
                 </div>
                 <div className="w-12 h-6 bg-primary rounded-full relative p-1 cursor-pointer">
                    <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm" />
                 </div>
              </div>

              <div className="pt-4 flex items-center gap-4">
                <button 
                  type="button" 
                  onClick={() => setEditCategory(null)}
                  className="flex-1 py-4 text-sm font-bold text-text-muted hover:text-foreground transition-colors"
                >
                  {editCategory ? "Cancel" : "Discard"}
                </button>
                <button type="submit" className="flex-1 py-4 bg-primary text-white rounded-2xl font-bold text-sm shadow-lg shadow-primary/20 hover:bg-primary-hover transition-all active:scale-95">
                  {editCategory ? "Update Category" : "Save Category"}
                </button>
              </div>
            </form>

            <div className="mt-8 p-4 bg-warning/5 border border-warning/10 rounded-xl flex gap-3">
               <AlertCircle size={18} className="text-warning shrink-0 mt-0.5" />
               <p className="text-[11px] text-text-secondary leading-relaxed">
                 {editCategory 
                   ? "You are currently editing an existing category. Click cancel to create a new one."
                   : "Deleting a category will NOT delete the products inside it. They will become 'Uncategorized'."
                 }
               </p>
            </div>
         </div>
      </div>
    </div>
  );
}
