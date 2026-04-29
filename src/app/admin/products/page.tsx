"use client";

import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, Package, Upload } from "lucide-react";

export default function AdminProducts() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [inventoryModalOpen, setInventoryModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [inventoryProduct, setInventoryProduct] = useState<any>(null);
  const [bulkData, setBulkData] = useState("");
  const [formData, setFormData] = useState({ 
    name: "", 
    categoryId: "", 
    price: "", 
    shortDescription: "", 
    fullDescription: "", 
    isActive: true 
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

  const handleInventorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bulkData.trim()) return;

    const res = await fetch(`/api/admin/inventory-upload`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ productId: inventoryProduct.id, bulk_data: bulkData })
    });

    if (res.ok) {
      setInventoryModalOpen(false);
      setBulkData("");
      fetchProducts();
    } else {
      const data = await res.json();
      alert(data.error);
    }
  };

  const handleEdit = (prod: any) => {
    setEditingProduct(prod);
    setFormData({
      name: prod.name,
      categoryId: prod.categoryId,
      price: prod.price.toString(),
      shortDescription: prod.shortDescription || "",
      fullDescription: prod.fullDescription || "",
      isActive: prod.isActive
    });
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    const res = await fetch(`/api/admin/products/${id}`, { 
      method: "DELETE",
      credentials: "include" 
    });
    if (res.ok) {
      fetchProducts();
    } else {
      const data = await res.json();
      alert(data.error);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold font-[family-name:var(--font-syne)] text-foreground">Products</h1>
        <button 
          onClick={() => { 
            setEditingProduct(null); 
            setFormData({ name: "", categoryId: categories[0]?.id || "", price: "", shortDescription: "", fullDescription: "", isActive: true }); 
            setModalOpen(true); 
          }}
          className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-lg font-bold transition-colors"
        >
          <Plus size={20} /> Add Product
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
                <th className="px-6 py-4 text-xs font-bold text-text-muted uppercase tracking-wider">Product</th>
                <th className="px-6 py-4 text-xs font-bold text-text-muted uppercase tracking-wider">Category</th>
                <th className="px-6 py-4 text-xs font-bold text-text-muted uppercase tracking-wider">Price</th>
                <th className="px-6 py-4 text-xs font-bold text-text-muted uppercase tracking-wider">Stock</th>
                <th className="px-6 py-4 text-xs font-bold text-text-muted uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-text-muted uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-default">
              {Array.isArray(products) && products.map(prod => (
                <tr key={prod.id} className="hover:bg-surface-elevated/50">
                  <td className="px-6 py-4">
                    <div className="font-bold text-foreground">{prod.name}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-text-secondary">{prod.category.name}</td>
                  <td className="px-6 py-4 text-sm font-bold text-foreground">₦{Number(prod.price).toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <span className={`font-bold ${prod._count.items > 0 ? 'text-success' : 'text-error'}`}>
                      {prod._count.items} In Stock
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${prod.isActive ? 'bg-success/10 text-success' : 'bg-error/10 text-error'}`}>
                      {prod.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button 
                      onClick={() => { setInventoryProduct(prod); setInventoryModalOpen(true); }}
                      className="text-text-secondary hover:text-primary transition-colors" 
                      title="Add Inventory"
                    >
                      <Upload size={18} />
                    </button>
                    <button onClick={() => handleEdit(prod)} className="text-text-secondary hover:text-primary transition-colors"><Pencil size={18} /></button>
                    <button onClick={() => handleDelete(prod.id)} className="text-text-secondary hover:text-error transition-colors"><Trash2 size={18} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Product */}
      {modalOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="vault-card w-full max-w-2xl p-8 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6 font-[family-name:var(--font-syne)]">{editingProduct ? "Edit Product" : "Add Product"}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold mb-1.5">Price (₦)</label>
                <input 
                  type="number" 
                  value={formData.price} 
                  onChange={(e) => setFormData({...formData, price: e.target.value})}
                  className="w-full bg-surface-elevated border border-border-default rounded-lg px-4 py-2 text-foreground font-bold" 
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-1.5">Short Description</label>
                <input 
                  type="text" 
                  value={formData.shortDescription} 
                  onChange={(e) => setFormData({...formData, shortDescription: e.target.value})}
                  className="w-full bg-surface-elevated border border-border-default rounded-lg px-4 py-2 text-foreground" 
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-1.5">Full Description</label>
                <textarea 
                  value={formData.fullDescription} 
                  onChange={(e) => setFormData({...formData, fullDescription: e.target.value})}
                  className="w-full bg-surface-elevated border border-border-default rounded-lg px-4 py-2 text-foreground h-32"
                />
              </div>
              <div className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  checked={formData.isActive} 
                  onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                  id="prodActive"
                />
                <label htmlFor="prodActive" className="text-sm font-bold">Active</label>
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setModalOpen(false)} className="flex-1 px-4 py-2 rounded-lg border border-border-default font-bold">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-2 rounded-lg bg-primary text-white font-bold">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Inventory */}
      {inventoryModalOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="vault-card w-full max-w-xl p-8">
            <h2 className="text-2xl font-bold mb-2 font-[family-name:var(--font-syne)]">Bulk Add Inventory</h2>
            <p className="text-text-secondary text-sm mb-6">Enter each account/credential on a new line. Each line will create one product item.</p>
            <form onSubmit={handleInventorySubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-1.5">Product: {inventoryProduct?.name}</label>
                <textarea 
                  value={bulkData} 
                  onChange={(e) => setBulkData(e.target.value)}
                  className="w-full bg-surface-elevated border border-border-default rounded-lg px-4 py-2 text-foreground h-64 font-mono text-sm"
                  placeholder="user:pass:extra&#10;user2:pass2:extra2"
                  required
                />
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setInventoryModalOpen(false)} className="flex-1 px-4 py-2 rounded-lg border border-border-default font-bold">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-2 rounded-lg bg-primary text-white font-bold">Add Items</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
