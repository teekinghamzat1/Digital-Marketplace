// @ts-nocheck
"use client";

import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, Package, Layers, Settings2, MinusCircle, AlertTriangle, List, Search, Check, X } from "lucide-react";
import Swal from "sweetalert2";

export default function AdminProducts() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [tierModalOpen, setTierModalOpen] = useState(false);
  const [inventoryModalOpen, setInventoryModalOpen] = useState(false);
  const [manageInventoryModalOpen, setManageInventoryModalOpen] = useState(false);
  const [inventoryItems, setInventoryItems] = useState<any[]>([]);
  const [inventoryText, setInventoryText] = useState("");
  const [editingItem, setEditingItem] = useState<any>(null);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [activeProduct, setActiveProduct] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [formData, setFormData] = useState({ 
    name: "", 
    categoryId: "", 
    info: "", 
    isActive: true 
  });
  const [tierFormData, setTierFormData] = useState({
    id: "",
    label: "",
    quantity: "",
    price: ""
  });

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/products", { credentials: 'include' });
      const data = await res.json();
      if (Array.isArray(data)) {
        setProducts(data);
      } else {
        setProducts([]);
      }
    } catch (err) {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/admin/categories", { credentials: 'include' });
      const data = await res.json();
      if (Array.isArray(data)) {
        setCategories(data);
      }
    } catch (err) {}
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editingProduct ? `/api/admin/products/${editingProduct.id}` : "/api/admin/products";
    const method = editingProduct ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(formData)
    });

    if (res.ok) {
      setModalOpen(false);
      setEditingProduct(null);
      fetchProducts();
    } else {
      const data = await res.json();
      alert(data.error);
    }
  };

  const handleTierSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = tierFormData.id ? "PUT" : "POST";
    const res = await fetch("/api/admin/tiers", {
      method,
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        ...tierFormData,
        productId: activeProduct.id
      })
    });

    if (res.ok) {
      setTierFormData({ id: "", label: "", quantity: "", price: "" });
      // Refresh current product's tiers
      const prodRes = await fetch("/api/admin/products", { credentials: 'include' });
      const prodData = await prodRes.json();
      setProducts(prodData);
      const updatedProduct = prodData.find((p: any) => p.id === activeProduct.id);
      setActiveProduct(updatedProduct);
      Swal.fire("Success", "Tier saved successfully", "success");
    } else {
      const data = await res.json();
      Swal.fire("Error", data.error, "error");
    }
  };

  const deleteTier = async (tierId: string) => {
    if (!confirm("Are you sure?")) return;
    const res = await fetch(`/api/admin/tiers?id=${tierId}`, {
      method: "DELETE",
      credentials: "include"
    });
    if (res.ok) {
      const prodRes = await fetch("/api/admin/products", { credentials: 'include' });
      const prodData = await prodRes.json();
      setProducts(prodData);
      const updatedProduct = prodData.find((p: any) => p.id === activeProduct.id);
      setActiveProduct(updatedProduct);
    }
  };

  const handleEdit = (prod: any) => {
    setEditingProduct(prod);
    setFormData({
      name: prod.name,
      categoryId: prod.categoryId,
      info: prod.info || "",
      isActive: prod.isActive
    });
    setModalOpen(true);
  };

  const handleInventorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/admin/inventory-upload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        productId: activeProduct.id,
        bulk_data: inventoryText
      })
    });

    const data = await res.json();
    if (res.ok) {
      setInventoryText("");
      setInventoryModalOpen(false);
      Swal.fire("Success", `Successfully uploaded ${data.count} items`, "success");
      fetchProducts();
    } else {
      Swal.fire("Error", data.error || "Failed to upload", "error");
    }
  };

  const fetchInventoryItems = async (prodId: string) => {
    try {
      const res = await fetch(`/api/admin/products/${prodId}/inventory`, { credentials: "include" });
      const data = await res.json();
      setInventoryItems(data.items || []);
    } catch (err) {
      console.error(err);
    }
  };

  const updateInventoryItem = async (itemId: string, updates: any) => {
    try {
      const res = await fetch(`/api/admin/products/${activeProduct.id}/inventory`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId, ...updates }),
        credentials: "include"
      });
      if (res.ok) {
        fetchInventoryItems(activeProduct.id);
        fetchProducts();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const deleteInventoryItem = async (itemId: string) => {
    if (!confirm("Are you sure you want to delete this specific item?")) return;
    try {
      const res = await fetch(`/api/admin/products/${activeProduct.id}/inventory?itemId=${itemId}`, {
        method: "DELETE",
        credentials: "include"
      });
      if (res.ok) {
        fetchInventoryItems(activeProduct.id);
        fetchProducts();
        Swal.fire({ title: "Deleted", icon: "success", toast: true, position: "top-end", timer: 2000, showConfirmButton: false });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRemoveInventory = async (prod: any) => {
    const stock = prod._count?.items || 0;
    if (stock === 0) {
      Swal.fire("Error", "No unsold stock to remove", "error");
      return;
    }

    const { value: amount } = await Swal.fire({
      title: 'Remove Stock',
      text: `Enter amount to remove (max: ${stock})`,
      input: 'number',
      inputAttributes: { min: "1", max: stock.toString() },
      showCancelButton: true,
      confirmButtonText: 'Remove',
      confirmButtonColor: 'var(--error)'
    });

    if (amount) {
      const res = await fetch(`/api/admin/inventory-delete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: prod.id, amount: parseInt(amount) })
      });
      const data = await res.json();
      if (res.ok) {
        Swal.fire("Success", `Removed ${data.count} items`, "success");
        fetchProducts();
      } else {
        Swal.fire("Error", data.error || "Failed to remove stock", "error");
      }
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold font-[family-name:var(--font-syne)] text-foreground">Products & Pricing</h1>
        <button 
          onClick={() => { 
            setEditingProduct(null); 
            setFormData({ name: "", categoryId: categories[0]?.id || "", info: "", isActive: true }); 
            setModalOpen(true); 
          }}
          className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-lg font-bold transition-colors"
        >
          <Plus size={20} /> Add Product
        </button>
      </div>

      {loading ? (
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => <div key={i} className="h-16 bg-surface-elevated rounded-lg"></div>)}
        </div>
      ) : (
        <div className="bg-surface border border-border-default rounded-xl overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-surface-elevated border-b border-border-default">
              <tr className="text-text-muted text-xs uppercase tracking-widest font-bold">
                <th className="px-6 py-4">Product</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4" colSpan={2}>SKU Inventory / Pricing</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-default">
              {products.map(prod => {
                const unsoldStock = prod._count?.items || 0;
                
                return (
                  <tr key={prod.id} className="hover:bg-surface-elevated/50">
                    <td className="px-6 py-6 align-top">
                      <div className="font-black text-lg text-foreground font-[family-name:var(--font-syne)]">{prod.name}</div>
                      <div className="text-xs text-text-muted mt-1 uppercase tracking-widest font-bold">ID: {prod.id.split('-')[0]}</div>
                    </td>
                    <td className="px-6 py-6 align-top">
                      <span className="px-2 py-1 bg-surface-elevated border border-border-default rounded text-xs font-bold text-text-secondary">
                        {prod.category.name}
                      </span>
                    </td>
                    <td className="px-6 py-6" colSpan={2}>
                      <div className="space-y-3">
                        {prod.tiers.sort((a,b) => a.quantity - b.quantity).map((t: any) => {
                          const isAvailable = unsoldStock >= t.quantity;
                          const canFulfillCount = Math.floor(unsoldStock / t.quantity);
                          
                          let statusColor = "text-success bg-success/10 border-success/20";
                          let statusText = "In Stock";
                          
                          if (canFulfillCount === 0) {
                            statusColor = "text-error bg-error/10 border-error/20";
                            statusText = "Out of Stock";
                          } else if (canFulfillCount < 5) {
                            statusColor = "text-warning bg-warning/10 border-warning/20";
                            statusText = "Low Stock";
                          }

                          return (
                            <div key={t.id} className="flex items-center justify-between p-3 bg-surface-elevated/30 rounded-xl border border-border-default group/tier">
                              <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-lg bg-surface flex items-center justify-center font-black text-primary border border-border-default">
                                  {t.quantity}
                                </div>
                                <div>
                                  <div className="text-sm font-bold text-foreground">{t.label}</div>
                                  <div className="text-[10px] text-text-muted font-bold">₦{Number(t.price).toLocaleString()}</div>
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-4">
                                <div className="text-right mr-4">
                                  <div className="text-xs font-black text-foreground">{canFulfillCount} Packs</div>
                                  <div className="text-[10px] text-text-secondary uppercase font-bold tracking-tighter">Available</div>
                                </div>
                                <span className={`px-2 py-1 rounded text-[10px] font-black uppercase border ${statusColor}`}>
                                  {statusText}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                        {prod.tiers.length === 0 && (
                          <div className="flex items-center gap-2 text-error text-sm font-bold p-3 bg-error/5 rounded-xl border border-error/10">
                            <AlertTriangle size={16} /> No pricing tiers configured
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-6 align-top">
                      <span className={`px-2 py-1 rounded text-[10px] font-black uppercase ${prod.isActive ? 'bg-success text-white' : 'bg-surface-elevated text-text-muted border border-border-default'}`}>
                        {prod.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-6 text-right space-x-1 align-top">
                      <div className="flex flex-col gap-1 items-end">
                        <div className="flex gap-1">
                          <button 
                            onClick={() => { setActiveProduct(prod); setInventoryModalOpen(true); setInventoryText(""); }}
                            className="bg-surface hover:bg-primary/10 text-text-secondary hover:text-primary transition-all p-2 rounded-lg border border-border-default" 
                            title="Upload Stock"
                          >
                            <Package size={18} />
                          </button>
                          <button 
                            onClick={() => { setActiveProduct(prod); fetchInventoryItems(prod.id); setManageInventoryModalOpen(true); }}
                            className="bg-surface hover:bg-primary/10 text-text-secondary hover:text-primary transition-all p-2 rounded-lg border border-border-default" 
                            title="Manage Individual Stock"
                          >
                            <List size={18} />
                          </button>
                        </div>
                        <div className="flex gap-1">
                          <button 
                            onClick={() => { setActiveProduct(prod); setTierModalOpen(true); }}
                            className="bg-surface hover:bg-primary/10 text-text-secondary hover:text-primary transition-all p-2 rounded-lg border border-border-default" 
                            title="Pricing Tiers"
                          >
                            <Layers size={18} />
                          </button>
                          <button 
                            onClick={() => handleEdit(prod)} 
                            className="bg-surface hover:bg-primary/10 text-text-secondary hover:text-primary transition-all p-2 rounded-lg border border-border-default"
                            title="Edit Basic Info"
                          >
                            <Pencil size={18} />
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Product Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="vault-card w-full max-w-xl p-8">
            <h2 className="text-2xl font-bold mb-6 font-[family-name:var(--font-syne)]">{editingProduct ? "Edit Product" : "Add Product"}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-1.5">Product Name</label>
                <input 
                  type="text" 
                  value={formData.name} 
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-surface-elevated border border-border-default rounded-lg px-4 py-2 text-foreground" 
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-1.5">Category</label>
                <select 
                  value={formData.categoryId} 
                  onChange={(e) => setFormData({...formData, categoryId: e.target.value})}
                  className="w-full bg-surface-elevated border border-border-default rounded-lg px-4 py-2 text-foreground"
                  required
                >
                  <option value="">Select Category</option>
                  {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold mb-1.5">Description</label>
                <textarea 
                  value={formData.info} 
                  onChange={(e) => setFormData({...formData, info: e.target.value})}
                  className="w-full bg-surface-elevated border border-border-default rounded-lg px-4 py-2 text-foreground h-24"
                />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" checked={formData.isActive} onChange={(e) => setFormData({...formData, isActive: e.target.checked})} id="pActive" />
                <label htmlFor="pActive" className="text-sm font-bold">Active</label>
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setModalOpen(false)} className="flex-1 px-4 py-2 rounded-lg border border-border-default font-bold">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-2 rounded-lg bg-primary text-white font-bold">Save Product</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tiers Modal */}
      {tierModalOpen && activeProduct && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="vault-card w-full max-w-2xl p-8 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold font-[family-name:var(--font-syne)]">Manage Tiers: {activeProduct.name}</h2>
              <button onClick={() => setTierModalOpen(false)} className="text-text-muted hover:text-foreground">Close</button>
            </div>

            <form onSubmit={handleTierSubmit} className="bg-surface-elevated p-4 rounded-xl mb-8 space-y-4">
              <h3 className="font-bold text-sm uppercase tracking-widest text-primary">{tierFormData.id ? "Edit Tier" : "Add New Tier"}</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input 
                  placeholder="Label (e.g. 1, 5, 50)" 
                  value={tierFormData.label} 
                  onChange={(e) => setTierFormData({...tierFormData, label: e.target.value})}
                  className="bg-surface border border-border-default rounded-lg px-3 py-2 text-sm" 
                  required
                />
                <input 
                  type="number" 
                  placeholder="Quantity" 
                  value={tierFormData.quantity} 
                  onChange={(e) => setTierFormData({...tierFormData, quantity: e.target.value})}
                  className="bg-surface border border-border-default rounded-lg px-3 py-2 text-sm" 
                  required
                />
                <input 
                  type="number" 
                  placeholder="Total Price (₦)" 
                  value={tierFormData.price} 
                  onChange={(e) => setTierFormData({...tierFormData, price: e.target.value})}
                  className="bg-surface border border-border-default rounded-lg px-3 py-2 text-sm" 
                  required
                />
              </div>
              <div className="flex gap-2">
                <button type="submit" className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-bold">
                  {tierFormData.id ? "Update Tier" : "Add Tier"}
                </button>
                {tierFormData.id && (
                  <button type="button" onClick={() => setTierFormData({id:"", label:"", quantity:"", price:""})} className="bg-surface border border-border-default px-4 py-2 rounded-lg text-sm font-bold">
                    Cancel Edit
                  </button>
                )}
              </div>
            </form>

            <div className="space-y-2">
              <h3 className="font-bold text-sm uppercase tracking-widest text-text-muted mb-4">Current Tiers</h3>
              {activeProduct.tiers.map((tier: any) => (
                <div key={tier.id} className="flex items-center justify-between p-4 bg-surface border border-border-default rounded-xl">
                  <div>
                    <span className="font-bold text-foreground mr-4">Tier {tier.label}</span>
                    <span className="text-text-secondary text-sm">{tier.quantity} Units @ ₦{Number(tier.price).toLocaleString()}</span>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setTierFormData({ id: tier.id, label: tier.label, quantity: tier.quantity.toString(), price: tier.price.toString() })}
                      className="text-primary hover:bg-primary/10 p-2 rounded-lg transition-colors"
                    >
                      <Pencil size={16} />
                    </button>
                    <button 
                      onClick={() => deleteTier(tier.id)}
                      className="text-error hover:bg-error/10 p-2 rounded-lg transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
              {activeProduct.tiers.length === 0 && <p className="text-center text-text-muted italic py-8">No tiers added for this product.</p>}
            </div>
          </div>
        </div>
      )}
      {/* Inventory Modal */}
      {inventoryModalOpen && activeProduct && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="vault-card w-full max-w-xl p-8">
            <h2 className="text-2xl font-bold mb-2 font-[family-name:var(--font-syne)]">Upload Inventory</h2>
            <p className="text-text-secondary text-sm mb-6">Uploading to: <strong className="text-foreground">{activeProduct.name}</strong></p>
            
            <form onSubmit={handleInventorySubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-1.5 text-text-muted">
                  Paste Credentials (One per line)
                </label>
                <textarea 
                  value={inventoryText} 
                  onChange={(e) => setInventoryText(e.target.value)}
                  placeholder="email:password&#10;username:password"
                  className="w-full bg-surface-elevated border border-border-default rounded-lg px-4 py-3 text-foreground font-mono text-sm h-64 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                  required
                />
              </div>
              
              <div className="flex gap-4 pt-4">
                <button 
                  type="button" 
                  onClick={() => setInventoryModalOpen(false)} 
                  className="flex-1 px-4 py-3 rounded-xl border border-border-default font-bold hover:bg-surface-elevated transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="flex-1 px-4 py-3 rounded-xl bg-primary hover:bg-primary-hover text-white font-bold transition-transform hover:scale-105"
                >
                  Upload Items
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {manageInventoryModalOpen && activeProduct && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="vault-card w-full max-w-4xl p-8 max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold font-[family-name:var(--font-syne)]">Inventory Manager</h2>
                <p className="text-text-secondary text-sm">Product: <span className="text-primary font-bold">{activeProduct.name}</span></p>
              </div>
              <button onClick={() => setManageInventoryModalOpen(false)} className="text-text-muted hover:text-foreground">
                <X size={24} />
              </button>
            </div>

            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
              <input 
                type="text" 
                placeholder="Search credentials..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-surface-elevated border border-border-default rounded-xl pl-10 pr-4 py-2 text-sm outline-none focus:border-primary transition-all"
              />
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
              {inventoryItems
                .filter(item => item.credentialText.toLowerCase().includes(searchQuery.toLowerCase()))
                .map((item) => (
                <div key={item.id} className="bg-surface border border-border-default rounded-xl p-4 flex items-center justify-between gap-4 group">
                  <div className="flex-1 min-w-0">
                    {editingItem === item.id ? (
                      <div className="flex gap-2">
                        <input 
                          autoFocus
                          className="flex-1 bg-surface-elevated border border-primary rounded px-2 py-1 text-sm font-mono"
                          defaultValue={item.credentialText}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              updateInventoryItem(item.id, { credentialText: e.currentTarget.value });
                              setEditingItem(null);
                            }
                            if (e.key === 'Escape') setEditingItem(null);
                          }}
                          onBlur={(e) => {
                            updateInventoryItem(item.id, { credentialText: e.target.value });
                            setEditingItem(null);
                          }}
                        />
                      </div>
                    ) : (
                      <div 
                        onDoubleClick={() => setEditingItem(item.id)}
                        className="text-sm font-mono text-foreground truncate cursor-pointer hover:text-primary transition-colors"
                        title="Double-click to edit"
                      >
                        {item.credentialText}
                      </div>
                    )}
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-[10px] text-text-muted uppercase font-bold tracking-widest">
                        Added {new Date(item.createdAt).toLocaleDateString()}
                      </span>
                      <span className={`text-[10px] font-black uppercase px-1.5 rounded ${item.isSold ? 'bg-error/10 text-error' : 'bg-success/10 text-success'}`}>
                        {item.isSold ? 'Sold' : 'In Stock'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => updateInventoryItem(item.id, { isSold: !item.isSold })}
                      className={`p-2 rounded-lg transition-all ${item.isSold ? 'text-success hover:bg-success/10' : 'text-warning hover:bg-warning/10'}`}
                      title={item.isSold ? "Mark as In Stock" : "Mark as Sold"}
                    >
                      {item.isSold ? <Check size={18} /> : <MinusCircle size={18} />}
                    </button>
                    <button 
                      onClick={() => setEditingItem(item.id)}
                      className="p-2 text-text-muted hover:text-primary hover:bg-primary/10 rounded-lg transition-all"
                    >
                      <Pencil size={18} />
                    </button>
                    <button 
                      onClick={() => deleteInventoryItem(item.id)}
                      className="p-2 text-text-muted hover:text-error hover:bg-error/10 rounded-lg transition-all"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
              {inventoryItems.length === 0 && (
                <div className="text-center py-12 text-text-muted italic">
                  No inventory items found for this product.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
