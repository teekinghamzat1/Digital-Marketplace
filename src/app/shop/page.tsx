"use client";

import { useState, useEffect, Suspense } from "react";
import { Navbar } from "@/components/navbar";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Search } from "lucide-react";

function ShopContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category");

  const [categories, setCategories] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | null>(initialCategory);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/categories", { credentials: 'include' })
      .then(res => res.json())
      .then(data => setCategories(data));
  }, []);

  useEffect(() => {
    setLoading(true);
    let url = "/api/products?";
    if (activeCategory) url += `category_id=${activeCategory}&`;
    if (searchQuery) url += `search=${encodeURIComponent(searchQuery)}&`;

    fetch(url, { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        setProducts(data);
        setLoading(false);
      });
  }, [activeCategory, searchQuery]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-bold font-[family-name:var(--font-syne)] text-foreground">Marketplace</h1>
            <p className="text-text-secondary mt-2">Browse our premium selection of verified digital accounts.</p>
          </div>
          
          <div className="w-full md:w-96 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={20} />
            <input 
              type="text" 
              placeholder="Search products..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-surface-elevated border border-border-default rounded-xl pl-12 pr-4 py-3 text-foreground focus:outline-none focus:border-primary transition-colors"
            />
          </div>
        </div>

        {/* Categories Tabs */}
        <div className="flex overflow-x-auto pb-4 mb-8 gap-3 no-scrollbar">
          <button 
            onClick={() => setActiveCategory(null)}
            className={`whitespace-nowrap px-6 py-2.5 rounded-full font-bold transition-all ${!activeCategory ? 'bg-primary text-white' : 'bg-surface-elevated text-text-secondary hover:text-foreground'}`}
          >
            All Products
          </button>
          {categories.map(cat => (
            <button 
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`whitespace-nowrap px-6 py-2.5 rounded-full font-bold transition-all ${activeCategory === cat.id ? 'bg-primary text-white' : 'bg-surface-elevated text-text-secondary hover:text-foreground'}`}
            >
              {cat.icon} {cat.name}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="vault-card p-6 h-64 animate-pulse bg-surface-elevated" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-24 bg-surface rounded-2xl border border-dashed border-border-default">
            <p className="text-text-muted font-bold text-lg">No products found matching your criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map(product => (
              <div key={product.id} className="vault-card flex flex-col p-6 group hover:border-primary/50">
                <div className="flex justify-between items-start mb-4">
                  <span className="text-xs font-bold px-3 py-1 rounded bg-surface-elevated text-text-secondary uppercase tracking-wider">
                    {product.categoryName}
                  </span>
                  {product.stockCount > 0 ? (
                    <span className="text-xs font-bold px-3 py-1 rounded bg-success/10 text-success">
                      {product.stockCount} Available
                    </span>
                  ) : (
                    <span className="text-xs font-bold px-3 py-1 rounded bg-error/10 text-error">
                      Out of Stock
                    </span>
                  )}
                </div>
                
                <h3 className="text-xl font-bold text-foreground mb-2">{product.name}</h3>
                <p className="text-text-secondary text-sm mb-6 flex-1 line-clamp-2">{product.shortDescription}</p>
                
                <div className="flex items-center justify-between mt-auto">
                  <p className="text-2xl font-black text-foreground">
                    ₦{Number(product.price).toLocaleString()}
                  </p>
                  <Link 
                    href={`/shop/product/${product.id}`}
                    className={`px-5 py-2.5 rounded-lg font-bold transition-colors ${
                      product.stockCount > 0 
                        ? 'bg-primary hover:bg-primary-hover text-white' 
                        : 'bg-surface-elevated text-text-muted cursor-not-allowed pointer-events-none'
                    }`}
                  >
                    Buy Now
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center">Loading...</div>}>
      <ShopContent />
    </Suspense>
  );
}
