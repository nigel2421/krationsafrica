
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Zap, ShieldCheck, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { ProductCard } from "@/components/product-card";
import { PlaceHolderImages } from "@/lib/placeholder-images";

const CATEGORIES = [
  { name: "Sneakers", slug: "sneakers", image: PlaceHolderImages.find(i => i.id === 'sneakers-cat')?.imageUrl },
  { name: "Boots", slug: "boots", image: PlaceHolderImages.find(i => i.id === 'boots-cat')?.imageUrl },
  { name: "Casual", slug: "casual", image: PlaceHolderImages.find(i => i.id === 'casual-cat')?.imageUrl },
  { name: "Official", slug: "official", image: PlaceHolderImages.find(i => i.id === 'official-cat')?.imageUrl },
];

const FEATURED_PRODUCTS = [
  { id: "1", name: "Nike Air Max Pulse", price: 12500, category: "Sneakers", stockStatus: "In Stock", imageUrl: PlaceHolderImages.find(i => i.id === 'product-1')?.imageUrl || "" },
  { id: "2", name: "Timberland Pro Boot", price: 18900, category: "Boots", stockStatus: "Few Left", imageUrl: PlaceHolderImages.find(i => i.id === 'product-2')?.imageUrl || "" },
  { id: "3", name: "Classic Chelsea Boot", price: 9500, category: "Official", stockStatus: "In Stock", imageUrl: "https://picsum.photos/seed/shoe3/600/600" },
  { id: "4", name: "Streetwear Slip-ons", price: 5400, category: "Casual", stockStatus: "Out of Stock", imageUrl: "https://picsum.photos/seed/shoe4/600/600" },
];

export default function Home() {
  const heroImage = PlaceHolderImages.find(i => i.id === 'hero-shoe')?.imageUrl || "";

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[80vh] w-full flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src={heroImage}
            alt="Hero Kicks"
            fill
            className="object-cover brightness-50"
            priority
            data-ai-hint="modern sneaker hero"
          />
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-2xl text-white">
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-none mb-6">
              STEP INTO <span className="text-secondary">THE FUTURE.</span>
            </h1>
            <p className="text-xl md:text-2xl text-white/80 font-medium mb-8">
              Premium collection of high-performance and luxury footwear curated for those who dare to stand out.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button size="lg" className="h-14 px-8 text-lg font-bold bg-secondary text-secondary-foreground hover:bg-secondary/90">
                Shop New Arrivals
                <ArrowRight className="ml-2 h-6 w-6" />
              </Button>
              <Button size="lg" variant="outline" className="h-14 px-8 text-lg font-bold border-white text-white hover:bg-white hover:text-black">
                Our Collections
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="py-12 bg-primary text-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex items-center gap-4">
              <div className="bg-secondary/20 p-3 rounded-full">
                <Truck className="h-8 w-8 text-secondary" />
              </div>
              <div>
                <h3 className="font-bold">Fast Delivery</h3>
                <p className="text-sm text-white/60">Across Kenya within 24-48 hours.</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="bg-secondary/20 p-3 rounded-full">
                <ShieldCheck className="h-8 w-8 text-secondary" />
              </div>
              <div>
                <h3 className="font-bold">Authentic Quality</h3>
                <p className="text-sm text-white/60">Every pair inspected for perfection.</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="bg-secondary/20 p-3 rounded-full">
                <Zap className="h-8 w-8 text-secondary" />
              </div>
              <div>
                <h3 className="font-bold">WhatsApp Orders</h3>
                <p className="text-sm text-white/60">Instant communication & updates.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section id="categories" className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="mb-12">
            <h2 className="text-4xl font-black text-primary mb-2">SHOP BY CATEGORY</h2>
            <div className="h-1.5 w-24 bg-secondary rounded-full"></div>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {CATEGORIES.map((cat) => (
              <Link key={cat.slug} href={`/shop?category=${cat.slug}`} className="group relative h-[400px] overflow-hidden rounded-2xl">
                <Image
                  src={cat.image || ""}
                  alt={cat.name}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 p-8">
                  <h3 className="text-3xl font-black text-white mb-2">{cat.name}</h3>
                  <p className="text-secondary font-bold flex items-center">
                    Explore Now <ArrowRight className="ml-1 h-4 w-4" />
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section id="featured" className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <h2 className="text-4xl font-black text-primary mb-2">TRENDING NOW</h2>
              <p className="text-muted-foreground font-medium">Our most popular styles this week.</p>
            </div>
            <Button variant="link" className="text-secondary font-bold text-lg p-0">
              View All Collection
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {FEATURED_PRODUCTS.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary pt-24 pb-12 text-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-1 md:col-span-2">
              <Link href="/" className="text-3xl font-black tracking-tighter mb-6 inline-block">
                KREATIONS <span className="text-secondary">254</span>
              </Link>
              <p className="text-white/60 max-w-sm mb-8 leading-relaxed">
                Nairobi's premier shoe destination. We specialize in bringing the rarest and most exclusive footwear directly to your doorstep with personalized service.
              </p>
              <div className="flex gap-4">
                <Button size="icon" variant="ghost" className="hover:text-secondary"><Zap /></Button>
                <Button size="icon" variant="ghost" className="hover:text-secondary"><Zap /></Button>
                <Button size="icon" variant="ghost" className="hover:text-secondary"><Zap /></Button>
              </div>
            </div>
            <div>
              <h4 className="font-bold text-lg mb-6 uppercase tracking-widest">Support</h4>
              <ul className="space-y-4 text-white/60 font-medium">
                <li><Link href="/help" className="hover:text-secondary transition-colors">Help Center</Link></li>
                <li><Link href="/delivery" className="hover:text-secondary transition-colors">Delivery Info</Link></li>
                <li><Link href="/returns" className="hover:text-secondary transition-colors">Returns & Refunds</Link></li>
                <li><Link href="/contact" className="hover:text-secondary transition-colors">Contact Us</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-lg mb-6 uppercase tracking-widest">Newsletter</h4>
              <p className="text-sm text-white/60 mb-4">Get early access to exclusive drops.</p>
              <div className="flex gap-2">
                <Input placeholder="Your email" className="bg-white/10 border-white/20 text-white" />
                <Button className="bg-secondary text-secondary-foreground hover:bg-secondary/80">Join</Button>
              </div>
            </div>
          </div>
          <Separator className="bg-white/10 mb-8" />
          <div className="flex flex-col md:flex-row justify-between items-center text-sm text-white/40 font-medium gap-4">
            <p>© 2024 Kreations Kicks 254. All rights reserved.</p>
            <div className="flex gap-8">
              <Link href="/privacy" className="hover:text-white">Privacy Policy</Link>
              <Link href="/terms" className="hover:text-white">Terms of Service</Link>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
