import prisma from "@/lib/prisma";
import { 
  Plus, Search, Filter, ArrowUpDown, 
} from "lucide-react";
import { ProductManager } from "@/components/admin/ProductManager";

async function getProducts() {
  return await prisma.product.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      category: { select: { name: true } },
      tiers: { select: { id: true } }
    }
  });
}

export default async function ProductsInventory() {
  const products = await getProducts();

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20 md:pb-0">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold font-syne text-foreground tracking-tight">Products & Inventory</h1>
          <p className="text-text-secondary mt-1">Manage your digital assets and pricing tiers.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/20 hover:bg-primary-hover transition-all w-full md:w-auto">
            <Plus size={20} />
            Add Product
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-surface-elevated/50 p-2 rounded-2xl border border-border-default">
         <div className="relative w-full md:w-96 group">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors" />
            <input 
              type="text" 
              placeholder="Search products..." 
              className="w-full bg-background border border-border-default rounded-xl pl-11 pr-4 py-3 text-sm focus:border-primary outline-none transition-all text-foreground"
            />
         </div>
         <div className="flex items-center gap-2 w-full md:w-auto">
            <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-border-default hover:bg-background text-text-secondary font-bold text-xs transition-all">
               <Filter size={14} />
               Filter
            </button>
            <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-border-default hover:bg-background text-text-secondary font-bold text-xs transition-all">
               <ArrowUpDown size={14} />
               Sort
            </button>
         </div>
      </div>

      {/* Product List (Client Component) */}
      <ProductManager initialProducts={products as any} />
    </div>
  );
}
