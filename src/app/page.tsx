"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Zap, ShieldCheck, Truck, ShoppingBag, Star, Mail, Instagram, ChevronDown, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { ProductCard } from "@/components/product-card";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy, limit } from "firebase/firestore";

const BRANDS = ["Nike", "Adidas", "Puma", "Reebok", "Timberland", "Vans", "Converse", "Jordan"];

export default function Home() {
  const db = useFirestore();
  const heroImage = PlaceHolderImages.find(i => i.id === 'hero-shoe')?.imageUrl || "";

  // Dynamic Categories from Firestore
  const categoriesQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, "categories"), orderBy("name", "asc"));
  }, [db]);

  // Featured Products
  const productsQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, "products"), orderBy("createdAt", "desc"), limit(8));
  }, [db]);

  const { data: categories, isLoading: categoriesLoading } = useCollection(categoriesQuery);
  const { data: featuredProducts, isLoading: productsLoading } = useCollection(productsQuery);

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[90vh] w-full flex items-center overflow-hidden bg-black">
        <div className="absolute inset-0 z-0">
          <Image
            src={heroImage}
            alt="Hero Kicks"
            fill
            className="object-cover opacity-60 grayscale hover:grayscale-0 transition-all duration-1000"
            priority
            sizes="100vw"
          />
        </div>
        <div className="container mx-auto px-4 relative z-10 text-center">
          <div className="max-w-5xl mx-auto">
             <div className="flex flex-col items-center mb-12 animate-in fade-in zoom-in duration-700">
               <span className="text-secondary font-black tracking-[0.5em] text-sm uppercase mb-4">KREATIONS 254</span>
               <h1 className="text-7xl md:text-9xl font-black text-white tracking-tighter leading-[0.8] mb-8 uppercase">
                 ALWAYS LOOK <span className="text-secondary">GOOD</span> ON YOU.
               </h1>
               <div className="h-1 w-24 bg-secondary mt-4" />
             </div>
            <p className="text-lg md:text-xl text-white/70 font-medium mb-12 max-w-2xl mx-auto uppercase tracking-widest leading-relaxed">
              Step into the boldest collection in Nairobi. Authentic. Exclusive. Yours.
            </p>
            <div className="flex flex-wrap justify-center gap-6">
              <Button asChild size="lg" className="h-16 px-12 text-xl font-black uppercase bg-secondary text-secondary-foreground hover:bg-white rounded-none border-b-4 border-secondary/50">
                <Link href="/shop">
                  Explore Now
                  <ArrowRight className="ml-3 h-6 w-6" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-white/50 animate-bounce">
          <ChevronDown className="h-8 w-8" />
        </div>
      </section>

      {/* Trust Badges - Using hardcoded dark background to ensure visibility of white text */}
      <section className="py-16 bg-[#2A2A40] text-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { icon: Truck, title: "EXPRESS DELIVERY", desc: "Across Kenya within 24-48 hours." },
              { icon: ShieldCheck, title: "AUTHENTIC QUALITY", desc: "Every pair inspected for perfection." },
              { icon: Zap, title: "WHATSAPP ORDERS", desc: "Seamless checkout & instant updates." }
            ].map((badge, i) => (
              <div key={i} className="flex flex-col items-center text-center gap-4">
                <div className="bg-secondary/10 p-4 rounded-full border border-secondary/20">
                  <badge.icon className="h-8 w-8 text-secondary" />
                </div>
                <h3 className="font-black tracking-widest uppercase text-xs">{badge.title}</h3>
                <p className="text-[10px] text-white/60 font-black uppercase tracking-wider">{badge.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Brands Slider Section */}
      <section className="py-12 bg-background border-y-2 border-muted overflow-hidden">
        <div className="container mx-auto px-4 mb-8 text-center">
          <h3 className="text-sm md:text-2xl font-black uppercase tracking-[0.3em] text-foreground">Authentic Brands We Stock</h3>
        </div>
        <div className="flex w-full overflow-hidden">
          <div className="flex animate-marquee whitespace-nowrap items-center">
            {BRANDS.concat(BRANDS).map((brand, i) => (
              <span key={i} className="text-4xl md:text-6xl font-black text-muted-foreground/20 uppercase tracking-tighter mx-10 md:mx-20 hover:text-secondary transition-colors cursor-default">
                {brand}
              </span>
            ))}
          </div>
          <div className="flex animate-marquee whitespace-nowrap items-center" aria-hidden="true">
            {BRANDS.concat(BRANDS).map((brand, i) => (
              <span key={i} className="text-4xl md:text-6xl font-black text-muted-foreground/20 uppercase tracking-tighter mx-10 md:mx-20 hover:text-secondary transition-colors cursor-default">
                {brand}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section id="categories" className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="mb-16 flex flex-col items-center text-center">
            <h2 className="text-5xl font-black text-primary dark:text-foreground tracking-tighter uppercase mb-4">The Collections</h2>
            <p className="text-muted-foreground font-black uppercase text-xs tracking-[0.3em]">IT WILL ALWAYS LOOK GOOD ON YOU</p>
          </div>
          
          {categoriesLoading ? (
            <div className="flex justify-center py-20"><Loader2 className="h-12 w-12 animate-spin text-secondary" /></div>
          ) : categories && categories.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {categories.map((cat) => (
                <Link key={cat.slug} href={`/shop?category=${cat.slug}`} className="group relative h-[500px] overflow-hidden rounded-xl border-4 border-transparent hover:border-secondary transition-all">
                  <Image
                    src={cat.imageUrl || ""}
                    alt={cat.name}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                    className="object-cover transition-transform duration-1000 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 p-8 w-full">
                    <h3 className="text-4xl font-black text-white mb-2 uppercase tracking-tighter">{cat.name}</h3>
                    <p className="text-secondary font-black flex items-center gap-2 group-hover:translate-x-2 transition-transform uppercase text-xs tracking-widest">
                      DISCOVER NOW <ArrowRight className="h-4 w-4" />
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-muted/10 rounded-3xl border-2 border-dashed">
              <p className="text-muted-foreground font-bold">Categories are being prepared.</p>
            </div>
          )}
        </div>
      </section>

      {/* Featured Products */}
      <section id="featured" className="py-24 bg-muted/20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div className="max-w-xl">
              <h2 className="text-5xl font-black text-primary dark:text-foreground tracking-tighter uppercase mb-2">New Arrivals</h2>
              <p className="text-muted-foreground font-black uppercase text-[10px] tracking-widest">Handpicked for the culture.</p>
            </div>
            <Button asChild variant="link" className="text-secondary font-black text-xl p-0 hover:no-underline hover:opacity-80">
              <Link href="/shop">
                FULL CATALOG <ArrowRight className="ml-2 h-6 w-6" />
              </Link>
            </Button>
          </div>
          
          {productsLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {[1, 2, 3, 4].map(i => <div key={i} className="aspect-[3/4] bg-muted animate-pulse rounded-xl" />)}
            </div>
          ) : featuredProducts?.length ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-background border rounded-3xl">
              <p className="text-muted-foreground font-bold">No products in inventory yet.</p>
            </div>
          )}
        </div>
      </section>

      {/* Why Shop Section */}
      <section className="py-24 bg-black text-white">
        <div className="container mx-auto px-4 text-center">
           <div className="mb-20">
             <h2 className="text-6xl md:text-8xl font-black uppercase tracking-tighter mb-4">WHY <span className="text-secondary">US?</span></h2>
             <p className="text-secondary font-black uppercase tracking-[0.5em] text-sm">IT WILL ALWAYS LOOK GOOD ON YOU</p>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
             {[
               { icon: Star, title: "CURATED SELECTION", text: "We don't sell everything. We only sell the best." },
               { icon: ShieldCheck, title: "GUARANTEED AUTHENTIC", text: "Every stitch verified by our experts." },
               { icon: Truck, title: "NAIROBI FAST", text: "Same day delivery within the city limits." }
             ].map((item, i) => (
               <div key={i} className="space-y-6 flex flex-col items-center">
                 <div className="h-20 w-20 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                   <item.icon className="h-10 w-10 text-secondary" />
                 </div>
                 <h4 className="font-black text-2xl uppercase tracking-tight">{item.title}</h4>
                 <p className="text-white/50 font-medium leading-relaxed max-w-xs">{item.text}</p>
               </div>
             ))}
           </div>
        </div>
      </section>

      {/* Newsletter - Using dark text on sky blue for high contrast */}
      <section className="py-24 bg-secondary">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-2xl mx-auto">
            <Mail className="h-12 w-12 mx-auto mb-6 text-[#2A2A40]" />
            <h2 className="text-5xl font-black text-[#2A2A40] tracking-tighter uppercase mb-4">THE INNER CIRCLE</h2>
            <p className="text-[#2A2A40]/70 font-black mb-10 text-sm uppercase tracking-[0.2em]">GET DROP ALERTS & EXCLUSIVE ACCESS.</p>
            <div className="flex gap-2 p-2 bg-white rounded-none shadow-2xl">
              <Input placeholder="EMAIL ADDRESS" className="bg-transparent border-none text-[#2A2A40] font-black placeholder:text-[#2A2A40]/40 focus-visible:ring-0 rounded-none" />
              <Button size="lg" className="rounded-none bg-[#2A2A40] text-white hover:bg-black px-10 font-black uppercase">Join</Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary dark:bg-black pt-24 pb-12 text-white">
        <div className="container mx-auto px-4 text-center md:text-left">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-16 mb-20">
            <div className="col-span-1 md:col-span-2 space-y-8">
              <Link href="/" className="text-4xl font-black tracking-tighter inline-block">
                KREATIONS <span className="text-secondary">254</span>
              </Link>
              <p className="text-white/50 max-w-sm leading-relaxed font-black uppercase text-[10px] tracking-[0.2em]">
                NAIROBI'S PREMIER FOOTWEAR DESTINATION. IT WILL ALWAYS LOOK GOOD ON YOU.
              </p>
              <div className="flex justify-center md:justify-start gap-4">
                <Button size="icon" variant="outline" className="border-white/10 hover:bg-secondary hover:text-primary hover:border-secondary rounded-xl" asChild>
                  <a href="https://instagram.com/kreations.254" target="_blank"><Instagram className="h-5 w-5" /></a>
                </Button>
                <Button size="icon" variant="outline" className="border-white/10 hover:bg-secondary hover:text-primary hover:border-secondary rounded-xl" asChild>
                  <a href="https://wa.me/254719112025" target="_blank"><Zap className="h-5 w-5" /></a>
                </Button>
              </div>
            </div>
            <div>
              <h4 className="font-black text-xl mb-8 uppercase tracking-widest text-secondary">Service</h4>
              <ul className="space-y-4 text-white/50 font-black text-[10px] uppercase tracking-widest">
                <li><Link href="/help" className="hover:text-white">Help Center</Link></li>
                <li><Link href="/delivery" className="hover:text-white">Delivery</Link></li>
                <li><Link href="/returns" className="hover:text-white">Returns</Link></li>
                <li><Link href="/contact" className="hover:text-white">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-black text-xl mb-8 uppercase tracking-widest text-secondary">Catalog</h4>
              <ul className="space-y-4 text-white/50 font-black text-[10px] uppercase tracking-widest">
                <li><Link href="/shop?category=sneakers" className="hover:text-white">Sneakers</Link></li>
                <li><Link href="/shop?category=boots" className="hover:text-white">Boots</Link></li>
                <li><Link href="/shop?category=casual" className="hover:text-white">Casual</Link></li>
                <li><Link href="/shop?category=official" className="hover:text-white">Official</Link></li>
              </ul>
            </div>
          </div>
          <Separator className="bg-white/5 mb-10" />
          <div className="flex flex-col md:flex-row justify-between items-center text-[10px] text-white/30 font-black uppercase tracking-[0.2em] gap-6">
            <p>© 2026 KREATIONS KICKS 254. BUILT FOR THE CULTURE.</p>
            <div className="flex gap-10">
              <Link href="/privacy" className="hover:text-white">Privacy</Link>
              <Link href="/terms" className="hover:text-white">Terms</Link>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
