// @ts-nocheck
import { Navbar } from "@/components/navbar";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { cookies } from "next/headers";
import { ArrowRight, ShieldCheck, Zap, Lock } from "lucide-react";

async function getStats() {
  const [totalAccounts, totalBuyers] = await Promise.all([
    prisma.productItem.count({ where: { isSold: true } }),
    prisma.user.count()
  ]);
  return { totalAccounts, totalBuyers };
}

async function getCategories() {
  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' },
    include: {
      products: {
        where: { isActive: true },
        include: {
          _count: {
            select: { items: { where: { isSold: false } } }
          }
        }
      }
    }
  });

  return categories.map(cat => ({
    ...cat,
    _count: {
      items: cat.products.reduce((sum: number, p: any) => sum + p._count.items, 0)
    }
  }));
}

export default async function Home() {
  const stats = await getStats();
  const categories = await getCategories();
  const cookieStore = await cookies();
  const isLoggedIn = cookieStore.has("user_session");

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main>
        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-4 pt-24 pb-16 flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-light text-primary text-sm font-bold mb-6">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            Premium Digital Accounts
          </div>
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight max-w-4xl tracking-tight text-foreground font-[family-name:var(--font-syne)]">
            Instant Access to <span className="text-primary">Verified</span> Accounts
          </h1>
          <p className="text-lg md:text-xl text-text-secondary max-w-2xl mb-10">
            The most reliable marketplace for TextPlus, Google Voice, and Talkatone accounts. Instant delivery, automated funding, and 100% guarantee.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <Link href="/shop" className="bg-primary hover:bg-primary-hover text-white px-8 py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-transform hover:scale-105">
              Browse Products <ArrowRight size={20} />
            </Link>
            {isLoggedIn ? (
              <Link href="/dashboard" className="bg-surface-elevated hover:bg-border-default text-foreground px-8 py-4 rounded-xl font-bold text-lg flex items-center justify-center transition-colors">
                Go to Dashboard
              </Link>
            ) : (
              <Link href="/register" className="bg-surface-elevated hover:bg-border-default text-foreground px-8 py-4 rounded-xl font-bold text-lg flex items-center justify-center transition-colors">
                Get Started
              </Link>
            )}
          </div>
        </section>

        {/* Stats Bar */}
        <section className="border-y border-border-default bg-surface/30">
          <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col sm:flex-row items-center justify-around gap-8">
            <div className="text-center">
              <p className="text-4xl font-black text-foreground font-[family-name:var(--font-syne)]">{stats.totalAccounts.toLocaleString()}+</p>
              <p className="text-text-muted font-bold tracking-widest uppercase text-sm mt-1">Accounts Sold</p>
            </div>
            <div className="hidden sm:block w-px h-12 bg-border-default" />
            <div className="text-center">
              <p className="text-4xl font-black text-foreground font-[family-name:var(--font-syne)]">{stats.totalBuyers.toLocaleString()}+</p>
              <p className="text-text-muted font-bold tracking-widest uppercase text-sm mt-1">Active Buyers</p>
            </div>
            <div className="hidden sm:block w-px h-12 bg-border-default" />
            <div className="text-center">
              <p className="text-4xl font-black text-foreground font-[family-name:var(--font-syne)]">100%</p>
              <p className="text-text-muted font-bold tracking-widest uppercase text-sm mt-1">Instant Delivery</p>
            </div>
          </div>
        </section>

        {/* Categories Grid */}
        <section className="max-w-7xl mx-auto px-4 py-24">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-foreground font-[family-name:var(--font-syne)]">
            Explore Categories
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map(category => (
              <Link href={`/shop?category=${category.id}`} key={category.id} className="vault-card p-6 flex items-start gap-4 hover:border-primary/50 group">
                <div className="w-16 h-16 rounded-2xl bg-primary-light flex items-center justify-center text-3xl group-hover:scale-110 transition-transform font-bold">
                  {category.name.charAt(0)}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-foreground mb-1">{category.name}</h3>
                  <div className="text-xs font-bold text-primary bg-primary/10 inline-block px-2 py-1 rounded">
                    {category._count.items} Available
                  </div>
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
              <div className="text-center flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-6">
                  <Zap size={32} />
                </div>
                <h3 className="text-xl font-bold mb-3 text-foreground">Instant Delivery</h3>
                <p className="text-text-secondary leading-relaxed">No waiting. The moment you checkout, your credentials are automatically revealed and ready to use.</p>
              </div>
              <div className="text-center flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-6">
                  <Lock size={32} />
                </div>
                <h3 className="text-xl font-bold mb-3 text-foreground">Secure Vault</h3>
                <p className="text-text-secondary leading-relaxed">Your purchased accounts are permanently stored in your digital vault. Never lose access to your credentials.</p>
              </div>
              <div className="text-center flex flex-col items-center">
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

      <footer className="border-t border-border-default bg-background py-12 text-center text-text-muted">
        <p>© {new Date().getFullYear()} Sumon Mondal Logs Marketplace. All rights reserved.</p>
      </footer>
    </div>
  );
}
