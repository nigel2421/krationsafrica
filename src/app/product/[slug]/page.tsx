
"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, where, limit } from "firebase/firestore";
import { 
  ShoppingCart, 
  Heart, 
  Star, 
  ArrowLeft, 
  ShieldCheck, 
  Truck, 
  Zap, 
  Check,
  MessageCircle,
  Loader2,
  PackageCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/hooks/use-cart";
import { useWishlist } from "@/hooks/use-wishlist";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

export default function ProductDetailPage() {
  const { slug } = useParams();
  const db = useFirestore();
  const { addToCart } = useCart();
  const { addToWishlist, isInWishlist, removeFromWishlist } = useWishlist();
  const { toast } = useToast();
  
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [isAdded, setIsAdded] = useState(false);

  const productQuery = useMemoFirebase(() => {
    if (!db || !slug) return null;
    return query(collection(db, "products"), where("slug", "==", slug), limit(1));
  }, [db, slug]);

  const { data: products, isLoading } = useCollection(productQuery);
  const product = products?.[0];

  const handleAddToCart = () => {
    if (!product) return;
    if (product.availableSizes?.length > 0 && !selectedSize) {
      toast({
        title: "Select a Size",
        description: "Please pick your EU shoe size before adding to cart.",
        variant: "destructive",
      });
      return;
    }

    const price = product.onOffer ? product.offerPrice : product.price;
    addToCart({ ...product, price }, selectedSize);
    setIsAdded(true);
    toast({
      title: "Success",
      description: `${product.name} (${selectedSize || 'Standard'}) added to your collection.`,
    });
    setTimeout(() => setIsAdded(false), 2000);
  };

  const handleWhatsAppDirect = () => {
    if (!product) return;
    if (product.availableSizes?.length > 0 && !selectedSize) {
      toast({ title: "Select a Size", variant: "destructive" });
      return;
    }
    const price = product.onOffer ? product.offerPrice : product.price;
    const message = `Hi Kreations 254, I'm interested in the *${product.name}* ${selectedSize ? `(Size: ${selectedSize})` : ''}.\n\n*Price:* KES ${price?.toLocaleString()}\n\nIs this available?`;
    window.open(`https://wa.me/254719112025?text=${encodeURIComponent(message)}`, "_blank");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-secondary" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <h2 className="text-4xl font-black uppercase tracking-tighter mb-4">Pair Not Found</h2>
        <Button asChild variant="outline">
          <Link href="/shop">Back to Catalog</Link>
        </Button>
      </div>
    );
  }

  const inWishlist = isInWishlist(product.id);
  const hasOffer = product.onOffer && product.offerPrice && product.offerPrice < product.price;

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="container mx-auto px-4 py-8">
        <Button asChild variant="ghost" className="mb-8 font-black uppercase text-[10px] tracking-widest gap-2">
          <Link href="/shop"><ArrowLeft className="h-4 w-4" /> Return to Catalog</Link>
        </Button>

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20">
          {/* Image Section */}
          <div className="space-y-4">
            <div className="relative aspect-square overflow-hidden border-4 border-muted bg-muted group">
              <Image 
                src={product.imageUrl} 
                alt={product.name} 
                fill 
                className="object-cover transition-transform duration-1000 group-hover:scale-105"
                priority
              />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10 opacity-20 select-none">
                <div className="text-primary font-black text-6xl whitespace-nowrap -rotate-45 scale-150 uppercase tracking-[0.5em]">
                  KREATIONS 254
                </div>
              </div>
              <div className="absolute bottom-6 left-6 flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1.5 text-white font-black text-xs uppercase tracking-widest">
                <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" /> 4.8 Rating
              </div>
            </div>
          </div>

          {/* Details Section */}
          <div className="space-y-8">
            <div className="space-y-2">
              <div className="flex items-center gap-4">
                <span className="text-xs font-black uppercase tracking-[0.3em] text-muted-foreground">{product.brand}</span>
                {hasOffer && <Badge className="bg-secondary text-primary font-black uppercase text-[10px]">On Sale</Badge>}
              </div>
              <h1 className="text-5xl md:text-6xl font-black uppercase tracking-tighter leading-none text-primary dark:text-foreground">
                {product.name}
              </h1>
            </div>

            <div className="flex items-end gap-6">
              <div className="flex flex-col">
                {hasOffer && (
                  <span className="text-lg text-muted-foreground line-through font-bold mb-1">
                    KES {product.price.toLocaleString()}
                  </span>
                )}
                <span className="text-4xl font-black text-secondary tracking-tighter">
                  KES {(hasOffer ? product.offerPrice : product.price).toLocaleString()}
                </span>
              </div>
              <Badge variant="outline" className="mb-1 border-2 font-black uppercase text-[10px] tracking-widest h-8 px-4">
                {product.stockStatus}
              </Badge>
            </div>

            <Separator className="bg-muted-foreground/10" />

            {/* Size Selector */}
            {product.availableSizes?.length > 0 && (
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <h3 className="font-black uppercase text-xs tracking-widest">Select EU Size</h3>
                  <span className="text-[10px] font-bold text-muted-foreground uppercase">Standard Fit</span>
                </div>
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                  {product.availableSizes.map((size: string) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={cn(
                        "h-12 border-2 font-black text-sm transition-all uppercase",
                        selectedSize === size 
                          ? "bg-primary text-white border-primary scale-105" 
                          : "bg-white hover:border-secondary border-muted text-muted-foreground"
                      )}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Description */}
            <div className="space-y-4">
              <h3 className="font-black uppercase text-xs tracking-widest">About this pair</h3>
              <p className="text-muted-foreground font-medium leading-relaxed">
                {product.description || "No description available for this premium footwear selection."}
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <Button 
                onClick={handleAddToCart}
                disabled={product.stockStatus === "Out of Stock" || isAdded}
                className={cn(
                  "h-16 text-lg font-black uppercase tracking-widest rounded-none border-b-4 transition-all",
                  isAdded ? "bg-green-500 border-green-700" : "bg-primary hover:bg-black border-primary/50"
                )}
              >
                {isAdded ? <Check className="mr-2 h-6 w-6" /> : <ShoppingCart className="mr-2 h-6 w-6" />}
                {isAdded ? "Added" : "Add to Cart"}
              </Button>
              <Button 
                variant="outline" 
                onClick={toggleWishlist}
                className={cn(
                  "h-16 text-lg font-black uppercase tracking-widest rounded-none border-2",
                  inWishlist ? "border-destructive text-destructive" : "border-muted"
                )}
              >
                <Heart className={cn("mr-2 h-6 w-6", inWishlist && "fill-current")} />
                {inWishlist ? "Saved" : "Wishlist"}
              </Button>
            </div>

            <Button 
              onClick={handleWhatsAppDirect}
              className="w-full h-16 bg-[#25D366] hover:bg-[#128C7E] text-white text-lg font-black uppercase tracking-widest rounded-none border-b-4 border-green-900"
            >
              <MessageCircle className="mr-3 h-6 w-6" /> Order on WhatsApp
            </Button>

            {/* Trust Section */}
            <div className="grid grid-cols-3 gap-4 pt-8">
              {[
                { icon: ShieldCheck, label: "Verified Quality" },
                { icon: Truck, label: "Express Delivery" },
                { icon: Zap, label: "Secure Payment" }
              ].map((item, i) => (
                <div key={i} className="flex flex-col items-center gap-2 text-center">
                  <div className="h-10 w-10 bg-muted/50 rounded-full flex items-center justify-center">
                    <item.icon className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <span className="text-[9px] font-black uppercase tracking-tighter text-muted-foreground">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
