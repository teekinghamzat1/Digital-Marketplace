import prisma from "@/lib/prisma";
import { 
  Tag, Plus, Grap, Trash2, Edit3, 
  ChevronRight, LayoutGrid, List,
  ArrowUp, ArrowDown, Settings2,
  CheckCircle2, AlertCircle
} from "lucide-react";
import { format } from "date-fns";

async function getCategories() {
  return await prisma.category.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      _count: {
        select: { products: true }
      }
    }
  });
}

export default async function CategoriesManagement() {
  const categories = await getCategories();

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20 md:pb-0">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-syne text-white tracking-tight">Categories</h1>
          <p className="text-text-secondary mt-1">Organize your products into accessible groups.</p>
        </div>
        <button className="flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/20 hover:bg-primary-hover transition-all w-full md:w-auto">
          <Plus size={20} />
          Create Category
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        {/* Category List */}
        <div className="xl:col-span-7 space-y-4">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Active Categories ({categories.length})</h2>
            <div className="flex items-center gap-2">
               <button className="p-2 bg-surface-raised rounded-lg text-primary border border-white/5"><List size={14} /></button>
               <button className="p-2 text-text-muted hover:text-white"><LayoutGrid size={14} /></button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {categories.map((cat) => (
              <div key={cat.id} className="vault-card p-4 md:p-5 flex items-center gap-4 group cursor-default">
                {/* Drag Handle (Desktop) / Move arrows (Mobile) */}
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
                   <button className="p-3 md:p-2 text-text-muted hover:text-primary hover:bg-primary/10 rounded-xl transition-all">
                     <Edit3 size={18} />
                   </button>
                   <button className="p-3 md:p-2 text-text-muted hover:text-danger hover:bg-danger/10 rounded-xl transition-all">
                     <Trash2 size={18} />
                   </button>
                   <button className="md:hidden p-3 text-text-muted">
                     <ChevronRight size={18} />
                   </button>
                </div>
              </div>
            ))}

            {categories.length === 0 && (
              <div className="vault-card p-12 text-center border-dashed border-white/10">
                <Tag size={48} className="mx-auto mb-4 opacity-10" />
                <p className="text-text-muted font-medium">No categories created yet.</p>
              </div>
            )}
          </div>
        </div>

        {/* Category Edit Form (Right Side / Secondary Panel) */}
        <div className="xl:col-span-5">
           <div className="vault-card p-8 sticky top-8">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <Settings2 size={20} />
                </div>
                <h2 className="text-xl font-bold font-syne text-white tracking-tight">Configure Category</h2>
              </div>

              <form className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-text-muted uppercase tracking-widest px-1">Category Name</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Premium Accounts" 
                    className="w-full bg-surface-elevated border border-white/5 rounded-xl px-4 py-4 text-sm font-medium focus:border-primary outline-none transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-text-muted uppercase tracking-widest px-1">Internal Description</label>
                  <textarea 
                    placeholder="What kind of products go here?" 
                    className="w-full bg-surface-elevated border border-white/5 rounded-xl px-4 py-4 text-sm font-medium focus:border-primary outline-none transition-all h-24 resize-none"
                  ></textarea>
                </div>

                <div className="p-4 bg-white/2 rounded-2xl border border-white/5 flex items-center justify-between">
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
                  <button type="button" className="flex-1 py-4 text-sm font-bold text-text-muted hover:text-white transition-colors">
                    Discard
                  </button>
                  <button type="submit" className="flex-1 py-4 bg-primary text-white rounded-2xl font-bold text-sm shadow-lg shadow-primary/20 hover:bg-primary-hover transition-all active:scale-95">
                    Save Changes
                  </button>
                </div>
              </form>

              <div className="mt-8 p-4 bg-warning/5 border border-warning/10 rounded-xl flex gap-3">
                 <AlertCircle size={18} className="text-warning shrink-0 mt-0.5" />
                 <p className="text-[11px] text-text-secondary leading-relaxed">
                   Deleting a category will NOT delete the products inside it. They will become "Uncategorized" and hidden from the shop frontend.
                 </p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
