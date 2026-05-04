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
      products: {
        where: { isActive: true },
        include: {
          tiers: {
            select: { price: true }
          },
          _count: {
            select: { items: { where: { isSold: false } } }
          }
        }
      }
    }
  });

  return categories.map(cat => {
    let minPrice = Infinity;
    let itemsCount = 0;
    
    cat.products.forEach((p: any) => {
      itemsCount += p._count.items;
      p.tiers.forEach((t: any) => {
        const price = Number(t.price);
        if (price < minPrice) minPrice = price;
      });
    });

    return {
      ...cat,
      minPrice: minPrice === Infinity ? null : minPrice,
      _count: { items: itemsCount }
    };
  });
}

function getCategoryIcon(name: string) {
  const lower = name.toLowerCase();
  if (lower.includes('mail') || lower.includes('google')) return <Mail className="w-8 h-8 text-primary" />;
  if (lower.includes('social') || lower.includes('facebook') || lower.includes('twitter')) return <Globe className="w-8 h-8 text-primary" />;
  if (lower.includes('tech') || lower.includes('voice')) return <Cpu className="w-8 h-8 text-primary" />;
  return <LayoutGrid className="w-8 h-8 text-primary" />;
}

export default async function Home() {
  const categories = await getCategories();
  const cookieStore = await cookies();
  const isLoggedIn = cookieStore.has("user_session");

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main>
        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-4 pt-24 pb-16 flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
          <div className="flex-1 text-center lg:text-left">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight tracking-tight text-foreground font-[family-name:var(--font-syne)]">
              Buy Verified Accounts. <br className="hidden lg:block"/>
              <span className="text-primary">Get Them Instantly.</span>
            </h1>
            <p className="text-lg md:text-xl text-text-secondary mb-10 max-w-xl mx-auto lg:mx-0">
              No delays. No guesswork. Choose a package, pay with your wallet, and receive instantly.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link href="/shop" className="bg-primary hover:bg-primary-hover text-white px-8 py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-primary/25">
                Browse Products
              </Link>
              {isLoggedIn ? (
                <Link href="/dashboard" className="border-2 border-border-default hover:border-primary/50 text-foreground px-8 py-4 rounded-xl font-bold text-lg flex items-center justify-center transition-all hover:scale-[1.02] active:scale-[0.98]">
                  Go to Dashboard
                </Link>
              ) : (
                <Link href="/register" className="border-2 border-border-default hover:border-primary/50 text-foreground px-8 py-4 rounded-xl font-bold text-lg flex items-center justify-center transition-all hover:scale-[1.02] active:scale-[0.98]">
                  Get Started
                </Link>
              )}
            </div>
            
            <div className="mt-12 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-6 text-sm font-medium text-text-secondary">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-success" />
                <span>Instant delivery</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-success" />
                <span>Wallet payments</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-success" />
                <span>Automated system</span>
              </div>
            </div>
          </div>

          <div className="flex-1 w-full max-w-md lg:max-w-full relative perspective-1000">
            {/* Visual Product Preview Card */}
            <div className="bg-surface border border-border-default rounded-2xl p-6 shadow-2xl shadow-black/5 dark:shadow-white/5 transform lg:rotate-y-[-5deg] lg:rotate-x-[5deg] transition-transform hover:rotate-0 duration-500">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                  <Cpu className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-foreground">TextPlus Accounts</h3>
                  <p className="text-sm text-text-muted">Microsoft Login</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="border border-border-default rounded-xl p-4 flex justify-between items-center bg-background cursor-default">
                  <span className="font-bold">1 Account</span>
                  <span className="font-bold text-primary">₦1,800</span>
                </div>
                <div className="border border-border-default rounded-xl p-4 flex justify-between items-center bg-background cursor-default relative overflow-hidden">
                  <div className="flex items-center gap-2">
                    <span className="font-bold">5 Accounts</span>
                    <span className="text-xs bg-error/10 text-error px-2 py-0.5 rounded-full font-bold">🔥 Save ₦2,500</span>
                  </div>
                  <span className="font-bold text-primary">₦7,500</span>
                </div>
                <div className="border-2 border-primary rounded-xl p-4 flex justify-between items-center bg-primary/5 cursor-default">
                  <div className="flex items-center gap-2">
                    <span className="font-bold">10 Accounts</span>
                    <span className="text-xs bg-warning/20 text-warning px-2 py-0.5 rounded-full font-bold">⭐ Best Value</span>
                  </div>
                  <span className="font-bold text-primary">₦12,000</span>
                </div>
                <div className="border border-border-default rounded-xl p-4 flex justify-between items-center bg-background cursor-default">
                  <span className="font-bold">50 Accounts</span>
                  <span className="font-bold text-primary">₦50,000</span>
                </div>
              </div>
            </div>
            
            {/* Decorative background blur */}
            <div className="absolute -inset-4 bg-primary/20 blur-3xl -z-10 rounded-full opacity-50"></div>
          </div>
        </section>

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
