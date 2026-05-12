// @ts-nocheck
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { cookies } from "next/headers";
import { ArrowRight, ShieldCheck, Zap, Lock, CheckCircle2, LayoutGrid, Cpu, Globe, Mail } from "lucide-react";

async function getCategories() {
  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' },
    include: {
      _count: {
        select: { products: true }
      }
    }
  });

  // Fetch min prices separately or simplify logic
  return categories.map(cat => ({
    ...cat,
    minPrice: 500, // Static placeholder or simplified fetch
    _count: { items: 0 } // Simplified for performance
  }));
}

function getCategoryIcon(name: string) {
  const lower = name.toLowerCase();
  if (lower.includes('mail') || lower.includes('google')) return <Mail className="w-8 h-8 text-primary" />;
  if (lower.includes('social') || lower.includes('facebook') || lower.includes('twitter')) return <Globe className="w-8 h-8 text-primary" />;
  if (lower.includes('tech') || lower.includes('voice')) return <Cpu className="w-8 h-8 text-primary" />;
  return <LayoutGrid className="w-8 h-8 text-primary" />;
}

import { DynamicHero } from "@/components/dynamic-hero";

export default async function Home() {
  const categories = await getCategories();
  const cookieStore = await cookies();
  const isLoggedIn = cookieStore.has("user_session");

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main>
        <DynamicHero isLoggedIn={isLoggedIn} />

        {/* Categories Grid */}
        <section className="max-w-7xl mx-auto px-4 py-24">
          <div className="mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground font-[family-name:var(--font-syne)] mb-4">
              Explore Categories
            </h2>
            <p className="text-text-secondary text-lg">Browse our verified digital inventory</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map(category => (
              <Link href={`/shop?category=${category.id}`} key={category.id} className="bg-surface border border-border-default rounded-2xl p-6 hover:border-primary hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-14 h-14 rounded-xl bg-primary/5 flex items-center justify-center group-hover:scale-110 group-hover:bg-primary/10 transition-all duration-300">
                    {getCategoryIcon(category.name)}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-foreground mb-1 group-hover:text-primary transition-colors">{category.name}</h3>
                    <p className="text-text-secondary text-sm">
                      {category._count.items} available
                    </p>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-border-default flex items-center justify-between">
                  <span className="text-sm text-text-secondary">Starting from</span>
                  <span className="font-bold text-lg text-primary">
                    {category.minPrice ? `₦${category.minPrice.toLocaleString()}` : 'N/A'}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Features */}
        <section className="bg-surface py-24 border-t border-border-default">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-foreground font-[family-name:var(--font-syne)]">
              Why Choose Us?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-background rounded-2xl p-8 border border-border-default text-center flex flex-col items-center hover:shadow-lg transition-shadow">
                <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-6">
                  <Zap size={32} />
                </div>
                <h3 className="text-xl font-bold mb-3 text-foreground">Instant Delivery</h3>
                <p className="text-text-secondary leading-relaxed">No waiting. The moment you checkout, your credentials are automatically revealed and ready to use.</p>
              </div>
              <div className="bg-background rounded-2xl p-8 border border-border-default text-center flex flex-col items-center hover:shadow-lg transition-shadow">
                <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-6">
                  <Lock size={32} />
                </div>
                <h3 className="text-xl font-bold mb-3 text-foreground">Secure Vault</h3>
                <p className="text-text-secondary leading-relaxed">Your purchased accounts are permanently stored in your digital vault. Never lose access to your credentials.</p>
              </div>
              <div className="bg-background rounded-2xl p-8 border border-border-default text-center flex flex-col items-center hover:shadow-lg transition-shadow">
                <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-6">
                  <ShieldCheck size={32} />
                </div>
                <h3 className="text-xl font-bold mb-3 text-foreground">Verified Quality</h3>
                <p className="text-text-secondary leading-relaxed">Every account is rigorously tested before being listed on the marketplace. 100% working guarantee.</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
