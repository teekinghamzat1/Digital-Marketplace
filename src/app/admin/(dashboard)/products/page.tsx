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
      tiers: { select: { id: true } },
      _count: {
        select: {
          items: {
            where: { isSold: false }
          }
        }
      }
    }
  });
}

export default async function ProductsInventory() {
  const products = await getProducts();

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20 md:pb-0">
      {/* Product List (Client Component handles its own header/actions) */}
      <ProductManager initialProducts={products as any} />
    </div>
  );
}
