
"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Zap, ShieldCheck, Truck, ShoppingBag, Star, Mail, Instagram, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { ProductCard } from "@/components/product-card";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy, limit } from "firebase/firestore";

const CATEGORIES = [
  { name: "Sneakers", slug: "sneakers", image: PlaceHolderImages.find(i => i.id === 'sneakers-cat')?.imageUrl },
  { name: "Boots", slug: "boots", image: PlaceHolderImages.find(i => i.id === 'boots-cat')?.imageUrl },
  { name: "Casual", slug: "casual", image: PlaceHolderImages.find(i => i.id === 'casual-cat')?.imageUrl },
  { name: "Official", slug: "official", image: PlaceHolderImages.find(i => i.id === 'official-cat')?.imageUrl },
];

const BRANDS = ["Nike", "Adidas", "Puma", "Reebok", "Timberland", "Vans", "Converse", "Jordan"];

export default function Home() {
  const db = useFirestore();
  const heroImage = PlaceHolderImages.find(i => i.id === 'hero-shoe')?.imageUrl || "";

  const productsQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, "products"), orderBy("createdAt", "desc"), limit(8));
  }, [db]);

  const { data: featuredProducts, isLoading } = useCollection(productsQuery);

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[90vh] w-full flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src={heroImage}
            alt="Hero Kicks"
            fill
            className="object-cover brightness-[0.4]"
            priority
            sizes="100vw"
            data-ai-hint="luxury sneakers"
          />
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl">
            <h1 className="text-6xl md:text-9xl font-black text-white tracking-tighter leading-[0.9] mb-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
              STEP INTO <span className="text-secondary">THE FUTURE.</span>
            </h1>
            <p className="text-xl md:text-2xl text-white/70 font-medium mb-10 max-w-2xl">
              Nairobi's premier destination for high-performance footwear and exclusive luxury sneakers. Curated for the bold.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button asChild size="lg" className="h-16 px-10 text-xl font-black uppercase bg-secondary text-secondary-foreground hover:bg-secondary/90 rounded-none">
                <Link href="/shop">
                  Explore Shop
                  <ShoppingBag className="ml-3 h-6 w-6" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-16 px-10 text-xl font-black uppercase border-white text-white hover:bg-white hover:text-black rounded-none">
                <Link href="/shop?filter=new">New Arrivals</Link>
              </Button>
            </div>
          </div>
        </div>
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-white/50 animate-bounce">
          <ChevronDown className="h-8 w-8" />
        </div>
      </section>

      {/* Trust Badges */}
      <section className="py-16 bg-primary text-white">
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
                <h3 className="font-black tracking-widest uppercase">{badge.title}</h3>
                <p className="text-sm text-white/60 font-medium">{badge.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section id="categories" className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="mb-16 flex flex-col items-center text-center">
            <h2 className="text-5xl font-black text-primary tracking-tighter uppercase mb-4">Shop Categories</h2>
            <div className="h-2 w-32 bg-secondary rounded-full" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {CATEGORIES.map((cat) => (
              <Link key={cat.slug} href={`/shop?category=${cat.slug}`} className="group relative h-[500px] overflow-hidden">
                <Image
                  src={cat.image || ""}
                  alt={cat.name}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                  className="object-cover transition-transform duration-1000 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 p-8 w-full">
                  <h3 className="text-4xl font-black text-white mb-2 uppercase">{cat.name}</h3>
                  <p className="text-secondary font-black flex items-center gap-2 group-hover:translate-x-2 transition-transform">
                    DISCOVER NOW <ArrowRight className="h-5 w-5" />
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section id="featured" className="py-24 bg-muted/20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div className="max-w-xl">
              <h2 className="text-5xl font-black text-primary tracking-tighter uppercase mb-2">New Arrivals</h2>
              <p className="text-muted-foreground font-bold text-lg">Fresh styles from the world's leading footwear innovators.</p>
            </div>
            <Button asChild variant="link" className="text-secondary font-black text-xl p-0 hover:no-underline hover:opacity-80">
              <Link href="/shop">
                VIEW ALL COLLECTION <ArrowRight className="ml-2 h-6 w-6" />
              </Link>
            </Button>
          </div>
          
          {isLoading ? (
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

      {/* Brand Showcase */}
      <section className="py-24 border-y">
        <div className="container mx-auto px-4">
          <h2 className="text-center text-sm font-black tracking-[0.3em] uppercase text-muted-foreground mb-16">Authentic Brands We Stock</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-12 items-center opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
            {BRANDS.map(brand => (
              <div key={brand} className="text-center font-black text-2xl hover:text-secondary cursor-default select-none">
                {brand}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Shop Section */}
      <section className="py-24 bg-primary text-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div className="relative h-[600px] rounded-3xl overflow-hidden border-8 border-white/5">
               <Image 
                src="https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=2012&auto=format&fit=crop" 
                alt="Quality Craftsmanship" 
                fill 
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover" 
              />
            </div>
            <div className="space-y-10">
              <h2 className="text-5xl md:text-6xl font-black leading-none uppercase tracking-tighter">Why Choose <span className="text-secondary">Kreations 254?</span></h2>
              <div className="grid gap-8">
                {[
                  { icon: Star, title: "PREMIUM SELECTION", text: "We handpick only the most exclusive and high-quality footwear." },
                  { icon: ShieldCheck, title: "SECURE SHOPPING", text: "Authenticated products with detailed inspections before shipping." },
                  { icon: Truck, title: "SPEEDY LOGISTICS", text: "Efficient nationwide shipping with real-time tracking via WhatsApp." }
                ].map((item, i) => (
                  <div key={i} className="flex gap-6">
                    <div className="bg-white/10 p-4 h-fit rounded-2xl">
                      <item.icon className="h-8 w-8 text-secondary" />
                    </div>
                    <div>
                      <h4 className="font-black text-xl mb-2">{item.title}</h4>
                      <p className="text-white/60 font-medium leading-relaxed">{item.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-24 bg-secondary">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-2xl mx-auto">
            <Mail className="h-12 w-12 mx-auto mb-6 text-primary" />
            <h2 className="text-5xl font-black text-primary tracking-tighter uppercase mb-4">Join The Club</h2>
            <p className="text-primary/70 font-bold mb-10 text-lg uppercase tracking-wider">Get 15% off your first order & exclusive drops access.</p>
            <div className="flex gap-2 p-2 bg-white rounded-full shadow-2xl">
              <Input placeholder="Enter your email" className="bg-transparent border-none text-primary font-bold placeholder:text-primary/40 focus-visible:ring-0" />
              <Button size="lg" className="rounded-full bg-primary text-white hover:bg-primary/90 px-10 font-black uppercase">Subscribe</Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary pt-24 pb-12 text-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-16 mb-20">
            <div className="col-span-1 md:col-span-2 space-y-8">
              <Link href="/" className="text-4xl font-black tracking-tighter inline-block">
                KREATIONS <span className="text-secondary">254</span>
              </Link>
              <p className="text-white/50 max-w-sm leading-relaxed font-medium">
                Nairobi's premier shoe destination. We specialize in bringing the rarest and most exclusive footwear directly to your doorstep with personalized service.
              </p>
              <div className="flex gap-4">
                {[Instagram, Zap, ShoppingBag].map((Icon, i) => (
                  <Button key={i} size="icon" variant="outline" className="border-white/10 hover:bg-secondary hover:text-primary hover:border-secondary rounded-xl">
                    <Icon className="h-5 w-5" />
                  </Button>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-black text-xl mb-8 uppercase tracking-widest text-secondary">Support</h4>
              <ul className="space-y-4 text-white/50 font-bold text-sm uppercase tracking-widest">
                <li><Link href="/help" className="hover:text-white transition-colors">Help Center</Link></li>
                <li><Link href="/delivery" className="hover:text-white transition-colors">Delivery Info</Link></li>
                <li><Link href="/returns" className="hover:text-white transition-colors">Returns & Refunds</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-black text-xl mb-8 uppercase tracking-widest text-secondary">Collections</h4>
              <ul className="space-y-4 text-white/50 font-bold text-sm uppercase tracking-widest">
                <li><Link href="/shop?category=sneakers" className="hover:text-white transition-colors">Sneakers</Link></li>
                <li><Link href="/shop?category=boots" className="hover:text-white transition-colors">Boots</Link></li>
                <li><Link href="/shop?category=official" className="hover:text-white transition-colors">Official Wear</Link></li>
                <li><Link href="/shop?category=kids" className="hover:text-white transition-colors">Kids Edition</Link></li>
              </ul>
            </div>
          </div>
          <Separator className="bg-white/5 mb-10" />
          <div className="flex flex-col md:flex-row justify-between items-center text-[10px] text-white/30 font-black uppercase tracking-[0.2em] gap-6">
            <p>© 2024 Kreations Kicks 254. Built for the culture.</p>
            <div className="flex gap-10">
              <Link href="/privacy" className="hover:text-white">Privacy Policy</Link>
              <Link href="/terms" className="hover:text-white">Terms of Service</Link>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
