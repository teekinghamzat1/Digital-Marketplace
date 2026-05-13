import prisma from "@/lib/prisma";
import { Plus } from "lucide-react";
import { CategoryManager } from "@/components/admin/CategoryManager";

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
          <h1 className="text-3xl font-bold font-syne text-foreground tracking-tight">Categories</h1>
          <p className="text-text-secondary mt-1">Organize your products into accessible groups.</p>
        </div>
        <button className="flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/20 hover:bg-primary-hover transition-all w-full md:w-auto">
          <Plus size={20} />
          Create Category
        </button>
      </div>

      {/* Main Content (Client Component) */}
      <CategoryManager initialCategories={categories} />
    </div>
  );
}
