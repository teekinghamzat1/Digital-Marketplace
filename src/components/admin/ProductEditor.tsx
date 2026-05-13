"use client";

import { useState, useEffect } from "react";
import { 
  X, Save, Plus, Trash2, Database, Layers, 
  Tag, Info, AlertCircle, Loader2, CheckCircle2,
  ChevronRight, Package, DollarSign, Edit3,
  ShoppingBag, ShieldAlert
} from "lucide-react";

interface ProductEditorProps {
  productId?: string | null;
  onClose: () => void;
  onSave: () => void;
}

export function ProductEditor({ productId, onClose, onSave }: ProductEditorProps) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"details" | "tiers" | "inventory">("details");
  const [inventoryTab, setInventoryTab] = useState<"unsold" | "sold">("unsold");

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    categoryId: "",
    info: "",
    isActive: true,
  });

  const [tiers, setTiers] = useState<any[]>([]);
  const [stockInput, setStockInput] = useState("");
  const [items, setItems] = useState<any[]>([]);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  useEffect(() => {
    fetchCategories();
    if (productId) {
      fetchProductDetails();
    }
  }, [productId]);

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/admin/categories");
      const data = await res.json();
      setCategories(data);
    } catch (err) {
      console.error("Failed to fetch categories");
    }
  };

  const fetchProductDetails = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/products`);
      const allProducts = await res.json();
      const product = allProducts.find((p: any) => p.id === productId);
      
      if (product) {
        setFormData({
          name: product.name,
          categoryId: product.categoryId,
          info: product.info || "",
          isActive: product.isActive,
        });
        setTiers(product.tiers || []);
        fetchInventory();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchInventory = async () => {
    if (!productId) return;
    try {
      const res = await fetch(`/api/admin/products/${productId}/items`);
      const data = await res.json();
      setItems(data);
    } catch (err) {
      console.error("Failed to fetch inventory");
    }
  };

  const handleSaveDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const url = productId ? `/api/admin/products/${productId}` : `/api/admin/products`;
      const method = productId ? "PUT" : "POST";
      
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      
      if (res.ok) {
        if (!productId) {
           window.location.reload(); 
        } else {
           onSave();
        }
      }
    } catch (err) {
      alert("Error saving product details");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveTiers = async () => {
    if (!productId) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/products/${productId}/tiers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tiers }),
      });
      if (res.ok) alert("Tiers updated successfully");
    } catch (err) {
      alert("Error saving tiers");
    } finally {
      setSaving(false);
    }
  };

  const handleAddStock = async () => {
    if (!productId || !stockInput.trim()) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/products/${productId}/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: stockInput }),
      });
      if (res.ok) {
        setStockInput("");
        fetchInventory();
        alert("Stock added successfully");
      }
    } catch (err) {
      alert("Error adding stock");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteItem = async (itemId: string, isSold: boolean) => {
    if (isSold && !confirm("This item has been sold. Deleting it will remove the record from the customer's order. Are you sure?")) return;
    if (!isSold && !confirm("Are you sure you want to delete this unsold item?")) return;

    try {
      const res = await fetch(`/api/admin/products/${productId}/items/${itemId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setItems(prev => prev.filter(item => item.id !== itemId));
      } else {
        const data = await res.json();
        alert(data.error || "Failed to delete item");
      }
    } catch (err) {
      alert("Error deleting item");
    }
  };

  const handleEditItem = async (itemId: string) => {
    if (!editValue.trim()) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/products/${productId}/items/${itemId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credentialText: editValue })
      });
      if (res.ok) {
        setItems(prev => prev.map(item => item.id === itemId ? { ...item, credentialText: editValue } : item));
        setEditingItemId(null);
        setEditValue("");
      } else {
        const data = await res.json();
        alert(data.error || "Failed to update item");
      }
    } catch (err) {
      alert("Error updating item");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[200] flex items-center justify-center">
      <Loader2 className="animate-spin text-primary" size={48} />
    </div>
  );

  const unsoldItems = items.filter(item => !item.isSold);
  const soldItems = items.filter(item => item.isSold);
  const displayItems = inventoryTab === "unsold" ? unsoldItems : soldItems;

  return (
    <div className="fixed inset-0 bg-background/90 backdrop-blur-md z-[200] flex justify-end transition-all animate-in fade-in overflow-hidden">
      {/* Container with overflow-hidden to prevent body scroll when sidebar is open */}
      <div className="w-full max-w-2xl bg-background border-l border-border-default h-full flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-right-full duration-300">
        {/* Header */}
        <div className="p-6 border-b border-border-default flex items-center justify-between bg-surface-elevated/20 shrink-0">
          <div className="min-w-0">
            <h2 className="text-xl md:text-2xl font-bold font-syne text-foreground tracking-tight truncate">
              {productId ? "Edit Product" : "Add New Product"}
            </h2>
            <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest mt-1 truncate">
              {productId ? `ID: ${productId.slice(0, 8)}` : "Configure your digital asset"}
            </p>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-full hover:bg-surface-elevated flex items-center justify-center text-text-muted hover:text-foreground transition-all shrink-0"
          >
            <X size={24} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border-default px-6 shrink-0 overflow-x-auto no-scrollbar">
          <button 
            onClick={() => setActiveTab("details")}
            className={`px-4 py-4 text-[10px] font-black uppercase tracking-[0.2em] transition-all relative whitespace-nowrap ${
              activeTab === "details" ? "text-primary" : "text-text-muted hover:text-foreground"
            }`}
          >
            Basic Info
            {activeTab === "details" && <div className="absolute bottom-0 left-4 right-4 h-0.5 bg-primary rounded-full" />}
          </button>
          {productId && (
            <>
              <button 
                onClick={() => setActiveTab("tiers")}
                className={`px-4 py-4 text-[10px] font-black uppercase tracking-[0.2em] transition-all relative whitespace-nowrap ${
                  activeTab === "tiers" ? "text-primary" : "text-text-muted hover:text-foreground"
                }`}
              >
                Pricing Tiers
                {activeTab === "tiers" && <div className="absolute bottom-0 left-4 right-4 h-0.5 bg-primary rounded-full" />}
              </button>
              <button 
                onClick={() => setActiveTab("inventory")}
                className={`px-4 py-4 text-[10px] font-black uppercase tracking-[0.2em] transition-all relative whitespace-nowrap ${
                  activeTab === "inventory" ? "text-primary" : "text-text-muted hover:text-foreground"
                }`}
              >
                Inventory
                {activeTab === "inventory" && <div className="absolute bottom-0 left-4 right-4 h-0.5 bg-primary rounded-full" />}
              </button>
            </>
          )}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar pb-24 md:pb-8">
          {activeTab === "details" && (
            <form onSubmit={handleSaveDetails} className="space-y-6 animate-in slide-in-from-right-4 duration-300">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest px-1">Product Name</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="e.g. Netflix Premium - 1 Month" 
                  className="w-full bg-surface-elevated border border-border-default rounded-xl px-4 py-3.5 text-sm font-bold focus:border-primary outline-none transition-all text-foreground shadow-sm"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest px-1">Category</label>
                <div className="relative">
                  <select 
                    value={formData.categoryId}
                    onChange={(e) => setFormData({...formData, categoryId: e.target.value})}
                    className="w-full bg-surface-elevated border border-border-default rounded-xl px-4 py-3.5 text-sm font-bold focus:border-primary outline-none transition-all text-foreground appearance-none cursor-pointer"
                    required
                  >
                    <option value="">Select a category</option>
                    {categories.map((c: any) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                  <ChevronRight size={18} className="absolute right-4 top-1/2 -translate-y-1/2 rotate-90 text-text-muted pointer-events-none" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest px-1">Product Description</label>
                <textarea 
                  value={formData.info}
                  onChange={(e) => setFormData({...formData, info: e.target.value})}
                  placeholder="Enter details about the product..." 
                  className="w-full bg-surface-elevated border border-border-default rounded-xl px-4 py-3.5 text-sm font-bold focus:border-primary outline-none transition-all h-32 resize-none text-foreground"
                ></textarea>
              </div>

              <div className="flex items-center gap-4 p-4 bg-surface-elevated rounded-2xl border border-border-default">
                 <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center text-success">
                   <CheckCircle2 size={20} />
                 </div>
                 <div className="flex-1">
                    <p className="text-sm font-bold text-foreground">Active Status</p>
                    <p className="text-[10px] text-text-muted font-bold uppercase tracking-wider">Visible to customers</p>
                 </div>
                 <button 
                  type="button"
                  onClick={() => setFormData({...formData, isActive: !formData.isActive})}
                  className={`w-14 h-8 rounded-full relative p-1 transition-all ${formData.isActive ? 'bg-primary' : 'bg-text-muted'}`}
                 >
                    <div className={`absolute w-6 h-6 bg-white rounded-full transition-all ${formData.isActive ? 'right-1' : 'left-1'}`} />
                 </button>
              </div>

              <div className="pt-6">
                <button 
                  type="submit" 
                  disabled={saving}
                  className="w-full py-4 bg-foreground text-background rounded-2xl font-black text-sm shadow-xl hover:opacity-90 transition-all flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50"
                >
                  {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                  {productId ? "Update Basic Information" : "Create Product & Continue"}
                </button>
              </div>
            </form>
          )}

          {activeTab === "tiers" && (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Defined Tiers ({tiers.length})</h3>
                <button 
                  onClick={() => setTiers([...tiers, { label: "New Tier", quantity: 1, price: 1000 }])}
                  className="p-2 bg-primary/10 text-primary rounded-lg border border-primary/20 hover:bg-primary/20 transition-all"
                >
                  <Plus size={18} />
                </button>
              </div>

              <div className="space-y-3">
                {tiers.map((tier, idx) => (
                  <div key={idx} className="vault-card p-4 space-y-4 border-border-default">
                    <div className="flex items-center justify-between">
                       <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Tier #{idx + 1}</span>
                       <button 
                        onClick={() => setTiers(tiers.filter((_, i) => i !== idx))}
                        className="text-danger hover:text-danger-hover transition-colors"
                       >
                         <Trash2 size={16} />
                       </button>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-text-muted uppercase">Label</label>
                        <input 
                          type="text" 
                          value={tier.label}
                          onChange={(e) => {
                            const newTiers = [...tiers];
                            newTiers[idx].label = e.target.value;
                            setTiers(newTiers);
                          }}
                          className="w-full bg-surface-elevated border border-border-default rounded-lg px-3 py-2 text-sm font-bold text-foreground outline-none focus:border-primary"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-text-muted uppercase">Price (₦)</label>
                        <input 
                          type="number" 
                          value={tier.price}
                          onChange={(e) => {
                            const newTiers = [...tiers];
                            newTiers[idx].price = e.target.value;
                            setTiers(newTiers);
                          }}
                          className="w-full bg-surface-elevated border border-border-default rounded-lg px-3 py-2 text-sm font-bold text-foreground outline-none focus:border-primary"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <button 
                onClick={handleSaveTiers}
                disabled={saving}
                className="w-full py-4 bg-primary text-white rounded-2xl font-black text-sm shadow-xl shadow-primary/20 hover:bg-primary-hover transition-all flex items-center justify-center gap-2 mt-8 disabled:opacity-50"
              >
                {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                Save Pricing Tiers
              </button>
            </div>
          )}

          {activeTab === "inventory" && (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
               <div className="bg-primary/5 border border-primary/10 rounded-2xl p-5">
                  <div className="flex items-center gap-3 mb-4">
                     <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-sm">
                        <Database size={20} />
                     </div>
                     <h3 className="text-base font-bold text-foreground">Import Fresh Stock</h3>
                  </div>
                  <textarea 
                    value={stockInput}
                    onChange={(e) => setStockInput(e.target.value)}
                    placeholder="example1:pass123&#10;example2:pass456" 
                    className="w-full bg-background border border-border-default rounded-xl px-4 py-4 text-sm font-mono focus:border-primary outline-none transition-all h-32 resize-none text-foreground shadow-inner"
                  ></textarea>
                  <button 
                    onClick={handleAddStock}
                    disabled={saving || !stockInput.trim()}
                    className="w-full mt-4 py-3 bg-foreground text-background rounded-xl font-bold text-sm hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {saving ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                    Add {stockInput.split('\n').filter(l => l.trim()).length} Items
                  </button>
               </div>

               <div>
                  <div className="flex items-center justify-between mb-4 px-2">
                    <h3 className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Item Management</h3>
                    <div className="flex items-center gap-1 bg-surface-elevated p-1 rounded-lg border border-border-default">
                        <button 
                          onClick={() => setInventoryTab("unsold")}
                          className={`px-3 py-1.5 text-[10px] font-bold rounded-md transition-all ${inventoryTab === "unsold" ? 'bg-background text-primary shadow-sm' : 'text-text-muted hover:text-foreground'}`}
                        >
                          Unsold ({unsoldItems.length})
                        </button>
                        <button 
                          onClick={() => setInventoryTab("sold")}
                          className={`px-3 py-1.5 text-[10px] font-bold rounded-md transition-all ${inventoryTab === "sold" ? 'bg-background text-primary shadow-sm' : 'text-text-muted hover:text-foreground'}`}
                        >
                          Sold ({soldItems.length})
                        </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {displayItems.slice(0, 50).map((item, idx) => (
                      <div key={item.id} className="flex flex-col p-3 bg-surface-elevated/50 border border-border-default rounded-xl group transition-all hover:border-primary/30">
                         <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3 min-w-0">
                              <span className="text-[10px] font-bold text-text-muted">#{idx + 1}</span>
                              {editingItemId === item.id ? (
                                <input 
                                  type="text"
                                  value={editValue}
                                  onChange={(e) => setEditValue(e.target.value)}
                                  className="text-xs font-mono bg-background border border-primary rounded px-2 py-1 outline-none w-full max-w-[200px]"
                                  autoFocus
                                />
                              ) : (
                                <p className="text-xs font-mono text-foreground truncate">{item.credentialText}</p>
                              )}
                            </div>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all shrink-0">
                               {editingItemId === item.id ? (
                                 <>
                                   <button 
                                    onClick={() => handleEditItem(item.id)}
                                    className="p-1.5 text-success hover:bg-success/10 rounded-md"
                                   >
                                      <Save size={14} />
                                   </button>
                                   <button 
                                    onClick={() => { setEditingItemId(null); setEditValue(""); }}
                                    className="p-1.5 text-text-muted hover:bg-surface-elevated rounded-md"
                                   >
                                      <X size={14} />
                                   </button>
                                 </>
                               ) : (
                                 <>
                                   <button 
                                    onClick={() => { setEditingItemId(item.id); setEditValue(item.credentialText); }}
                                    className="p-1.5 text-text-muted hover:text-primary hover:bg-primary/10 rounded-md"
                                   >
                                      <Edit3 size={14} />
                                   </button>
                                   <button 
                                    onClick={() => handleDeleteItem(item.id, item.isSold)}
                                    className="p-1.5 text-text-muted hover:text-danger hover:bg-danger/10 rounded-md"
                                   >
                                      <Trash2 size={14} />
                                   </button>
                                 </>
                               )}
                            </div>
                         </div>
                         {item.isSold && item.soldAt && (
                           <div className="mt-2 flex items-center gap-2 text-[9px] text-text-muted font-bold uppercase tracking-widest bg-background/50 px-2 py-1 rounded-md w-fit">
                              <ShoppingBag size={10} className="text-primary" />
                              Sold {new Date(item.soldAt).toLocaleDateString()}
                           </div>
                         )}
                      </div>
                    ))}
                    {displayItems.length > 50 && (
                      <p className="text-center text-[10px] font-bold text-text-muted py-4 uppercase tracking-widest">Showing first 50 items</p>
                    )}
                    {displayItems.length === 0 && (
                       <div className="text-center py-12 border border-dashed border-border-default rounded-2xl">
                          <Package size={40} className="mx-auto mb-3 opacity-10 text-foreground" />
                          <p className="text-xs text-text-muted font-bold uppercase tracking-widest">No {inventoryTab} items found</p>
                       </div>
                    )}
                  </div>
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
