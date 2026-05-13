"use client";

import { useState } from "react";
import { 
  Package, Plus, Trash2, Edit3, 
  ChevronRight, LayoutGrid, List,
  ArrowUp, ArrowDown, Settings2,
  CheckCircle2, AlertCircle, Loader2,
  ExternalLink, Layers, Database
} from "lucide-react";
import { format } from "date-fns";
import { ProductEditor } from "./ProductEditor";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: { name: string; id: string };
  tiers: any[];
  createdAt: Date;
}

export function ProductManager({ initialProducts }: { initialProducts: Product[] }) {
  const [products, setProducts] = useState(initialProducts);
  const [loading, setLoading] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null | undefined>(undefined);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product? All associated tiers and stock will be lost.")) return;
    
    setLoading(id);
    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setProducts(prev => prev.filter(p => p.id !== id));
      } else {
        const data = await res.json();
        alert(data.error || "Failed to delete product");
      }
    } catch (err) {
      alert("Error deleting product");
    } finally {
      setLoading(null);
    }
  };

  return (
    <>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 px-1">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold font-syne text-foreground tracking-tight">Products & Inventory</h1>
          <p className="text-sm text-text-secondary mt-1">Manage your digital assets and pricing tiers.</p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <button 
            onClick={() => setEditingId(null)}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/20 hover:bg-primary-hover transition-all w-full md:w-auto"
          >
            <Plus size={20} />
            Add Product
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 overflow-hidden">
        {products.map((product) => (
          <div key={product.id} className="vault-card p-4 md:p-6 flex flex-col md:flex-row items-start md:items-center gap-4 group overflow-hidden max-w-full">
            <div className="w-12 h-12 md:w-14 md:h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary shrink-0 group-hover:rotate-6 transition-transform">
              <Package size={24} className="md:size-[28px]" />
            </div>

            <div className="flex-1 min-w-0 w-full">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-base md:text-lg font-bold text-foreground truncate pr-2">{product.name}</h3>
                <span className="text-[9px] md:text-[10px] font-bold px-2 py-0.5 rounded-full bg-success/15 text-success border border-success/20 shrink-0">
                  Active
                </span>
              </div>
              
              <div className="flex flex-wrap items-center gap-y-2 gap-x-4">
                <div className="flex items-center gap-1.5 text-text-secondary text-xs md:text-sm">
                  <Layers size={14} className="text-text-muted shrink-0" />
                  <span className="truncate">{product.category?.name || "Uncategorized"}</span>
                </div>
                <div className="flex items-center gap-1.5 text-text-secondary text-xs md:text-sm">
                  <Database size={14} className="text-text-muted shrink-0" />
                  <span>{product.tiers?.length || 0} Pricing Tiers</span>
                </div>
                <div className="flex items-center gap-1.5 text-text-secondary text-xs md:text-sm">
                  <ExternalLink size={14} className="text-text-muted shrink-0" />
                  <span>{format(new Date(product.createdAt), 'MMM d, yyyy')}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto pt-4 md:pt-0 border-t md:border-t-0 border-border-default md:ml-4 shrink-0">
               <button 
                className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-border-default hover:bg-surface-elevated text-foreground text-sm font-bold transition-all active:scale-95"
                onClick={() => setEditingId(product.id)}
               >
                 <Edit3 size={16} />
                 <span>Edit</span>
               </button>
               <button 
                disabled={loading === product.id}
                onClick={() => handleDelete(product.id)}
                className="w-12 h-11 md:w-11 md:h-11 flex items-center justify-center rounded-xl bg-danger/10 text-danger hover:bg-danger/20 transition-all disabled:opacity-50 active:scale-95"
               >
                 {loading === product.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={18} />}
               </button>
            </div>
          </div>
        ))}

        {products.length === 0 && (
          <div className="vault-card p-16 text-center border-dashed border-border-default">
            <Package size={56} className="mx-auto mb-4 opacity-10 text-foreground" />
            <h3 className="text-lg font-bold text-foreground mb-1">Your inventory is empty</h3>
            <p className="text-sm text-text-muted">Start by adding your first digital product.</p>
          </div>
        )}
      </div>

      {editingId !== undefined && (
        <ProductEditor 
          productId={editingId} 
          onClose={() => setEditingId(undefined)} 
          onSave={() => {
            setEditingId(undefined);
            window.location.reload();
          }} 
        />
      )}
    </>
  );
}
