// @ts-nocheck
"use client";

import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, Package, Layers, Settings2 } from "lucide-react";
import Swal from "sweetalert2";

export default function AdminProducts() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [tierModalOpen, setTierModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [activeProduct, setActiveProduct] = useState<any>(null);
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
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-text-muted uppercase tracking-wider">Product</th>
                <th className="px-6 py-4 text-xs font-bold text-text-muted uppercase tracking-wider">Category</th>
                <th className="px-6 py-4 text-xs font-bold text-text-muted uppercase tracking-wider">Tiers</th>
                <th className="px-6 py-4 text-xs font-bold text-text-muted uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-text-muted uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-default">
              {products.map(prod => (
                <tr key={prod.id} className="hover:bg-surface-elevated/50">
                  <td className="px-6 py-4">
                    <div className="font-bold text-foreground">{prod.name}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-text-secondary">{prod.category.name}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {prod.tiers.map((t: any) => (
                        <span key={t.id} className="text-[10px] px-1.5 py-0.5 bg-surface-elevated rounded border border-border-default text-text-muted">
                          {t.label} (₦{Number(t.price).toLocaleString()})
                        </span>
                      ))}
                      {prod.tiers.length === 0 && <span className="text-xs text-error italic">No tiers</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${prod.isActive ? 'bg-success/10 text-success' : 'bg-error/10 text-error'}`}>
                      {prod.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button 
                      onClick={() => { setActiveProduct(prod); setTierModalOpen(true); }}
                      className="text-text-secondary hover:text-primary transition-colors p-2" 
                      title="Manage Tiers"
                    >
                      <Layers size={18} />
                    </button>
                    <button onClick={() => handleEdit(prod)} className="text-text-secondary hover:text-primary transition-colors p-2"><Pencil size={18} /></button>
                  </td>
                </tr>
              ))}
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
    </div>
  );
}
