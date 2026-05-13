import prisma from "@/lib/prisma";
import { 
  Package, Search, Filter, Plus, MoreVertical,
  ChevronRight, ArrowRight, AlertCircle, 
  CheckCircle2, Box, Info, Tag
} from "lucide-react";

async function getProducts() {
  return await prisma.product.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      category: true,
      tiers: {
        include: {
          _count: {
            select: { sales: true } // just for some context
          }
        }
      },
      items: {
        where: { isSold: false },
        select: { id: true }
      }
    }
  });
}

export default async function ProductsInventory() {
  const products = await getProducts();

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-28 md:pb-0">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-syne text-white tracking-tight">Products & Inventory</h1>
          <p className="text-text-secondary mt-1">Manage digital goods listings and stock levels.</p>
        </div>
        <button className="flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/20 hover:bg-primary-hover transition-all w-full md:w-auto">
          <Plus size={20} />
          New Product
        </button>
      </div>

      {/* Toolbar */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        <div className="md:col-span-8 relative group">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors">
            <Search size={20} />
          </div>
          <input 
            type="text" 
            placeholder="Search products by name or category..." 
            className="w-full bg-surface border border-white/5 rounded-2xl pl-12 pr-4 py-4 text-sm focus:border-primary outline-none transition-all"
          />
        </div>
        <div className="md:col-span-4">
          <button className="w-full h-full flex items-center justify-center gap-2 px-4 py-4 bg-surface-elevated text-text-muted hover:text-white rounded-2xl font-bold text-sm border border-white/5 transition-all">
            <Filter size={18} />
            Filter Status
          </button>
        </div>
      </div>

      {/* Product Groups Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-6">
        {products.map((product) => {
          const totalUnsold = product.items.length;
          
          return (
            <div key={product.id} className="vault-card flex flex-col group overflow-hidden">
              <div className="p-6 border-b border-white/5 bg-white/2">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2 mb-1">
                     <Tag size={12} className="text-primary" />
                     <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">{product.category.name}</span>
                  </div>
                  <button className="p-1.5 text-text-muted hover:text-white"><MoreVertical size={16} /></button>
                </div>
                <h3 className="text-lg font-bold text-white mb-4 line-clamp-1">{product.name}</h3>
                <div className="flex items-center gap-4">
                  <div className={`status-badge ${product.isActive ? 'bg-success/15 text-success' : 'bg-danger/15 text-danger'}`}>
                    {product.isActive ? 'Active' : 'Inactive'}
                  </div>
                  <div className="flex items-center gap-1.5 text-text-muted">
                    <Box size={14} />
                    <span className="text-xs font-bold">{totalUnsold} Available Items</span>
                  </div>
                </div>
              </div>

              {/* Tiers / Inventory List */}
              <div className="flex-1 p-6 space-y-4">
                <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mb-2">Pricing Tiers & Stock</p>
                {product.tiers.length === 0 && (
                   <p className="text-xs text-text-muted italic">No pricing tiers defined for this product.</p>
                )}
                {product.tiers.map((tier) => {
                  // In a real app, we'd check stock per tier if that's how it's modeled
                  // Here we'll just show the tier and total unsold as a placeholder or logic check
                  const stockStatus = totalUnsold === 0 ? 'Out' : totalUnsold < 5 ? 'Low' : 'In Stock';
                  
                  return (
                    <div key={tier.id} className="flex items-center justify-between p-3 rounded-xl bg-surface-raised border border-white/5 hover:border-primary/20 transition-all">
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-foreground">{tier.label}</p>
                        <p className="text-xs text-primary font-bold">₦{Number(tier.price).toLocaleString()}</p>
                      </div>
                      <div className="flex items-center gap-3">
                         <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                           stockStatus === 'Out' ? 'bg-danger/15 text-danger' : 
                           stockStatus === 'Low' ? 'bg-warning/15 text-warning' : 'bg-success/15 text-success'
                         }`}>
                           {stockStatus === 'Out' ? 'Out of Stock' : `${stockStatus === 'Low' ? 'Low: ' : ''}${totalUnsold} in Stock`}
                         </span>
                         <ChevronRight size={14} className="text-text-muted" />
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="p-6 mt-auto bg-white/2 flex items-center gap-3">
                 <button className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-primary/10 text-primary hover:bg-primary/20 rounded-xl font-bold text-xs transition-all border border-primary/20">
                    <Plus size={14} />
                    Add Stock
                 </button>
                 <button className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-white/5 text-white hover:bg-white/10 rounded-xl font-bold text-xs transition-all border border-white/5">
                    <Edit3 size={14} className="opacity-70" />
                    Edit Product
                 </button>
              </div>
            </div>
          );
        })}
      </div>

      {products.length === 0 && (
        <div className="p-24 text-center">
          <Package size={80} className="mx-auto mb-6 opacity-10" />
          <h2 className="text-2xl font-bold text-white mb-2">No Products Found</h2>
          <p className="text-text-secondary max-w-sm mx-auto mb-8">Ready to start selling? Create your first digital product listing to begin.</p>
          <button className="px-8 py-4 bg-primary text-white rounded-2xl font-bold shadow-xl shadow-primary/20 hover:bg-primary-hover transition-all">
             Initialize Marketplace
          </button>
        </div>
      )}

      {/* Floating Add Button for Mobile */}
      <button className="md:hidden fixed bottom-8 right-8 w-16 h-16 bg-primary text-white rounded-full shadow-2xl shadow-primary/40 flex items-center justify-center z-50 animate-bounce">
        <Plus size={28} />
      </button>
    </div>
  );
}

// Just a tiny mock to avoid build error if Edit3 was missed in import
const Edit3 = ({ size, className }: { size: number, className: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
  </svg>
);
