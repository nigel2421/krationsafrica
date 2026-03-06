
"use client";

import Image from "next/image";
import Link from "next/link";
import { ShoppingCart, Check, Star, Heart, ArrowRight } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { useWishlist } from "@/hooks/use-wishlist";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    brand?: string;
    price: number;
    onOffer?: boolean;
    offerPrice?: number;
    imageUrl: string;
    stockStatus: string;
    category: string;
    gender?: string;
    slug: string;
  };
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const [added, setAdded] = useState(false);
  
  const isOutOfStock = product.stockStatus === "Out of Stock";
  const isFewLeft = product.stockStatus === "Few Left";
  const inWishlist = isInWishlist(product.id);
  const hasOffer = product.onOffer && product.offerPrice && product.offerPrice < product.price;
  const effectivePrice = hasOffer ? product.offerPrice! : product.price;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({ ...product, price: effectivePrice });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const toggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (inWishlist) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  };

  return (
    <div className="group relative flex flex-col overflow-hidden bg-card transition-all hover:shadow-2xl border-2 hover:border-secondary">
      <Link href={`/product/${product.slug}`} className="block relative">
        <div className="aspect-[3/4] relative overflow-hidden bg-muted">
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
          
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10 opacity-15 select-none overflow-hidden">
            <div className="text-primary font-black text-4xl whitespace-nowrap -rotate-45 scale-150 uppercase tracking-[0.5em]">
              KREATIONS 254
            </div>
          </div>

          <div className="absolute top-4 left-4 flex flex-col gap-2 z-20">
            {hasOffer && (
              <div className="bg-secondary text-primary font-black px-4 py-1.5 uppercase text-[10px] tracking-tighter flex items-center gap-1 shadow-lg">
                <Star className="h-3 w-3 fill-primary" /> SALE
              </div>
            )}
            {isOutOfStock && (
              <Badge variant="destructive" className="font-black px-4 py-1.5 uppercase text-[10px] tracking-tighter">OUT OF STOCK</Badge>
            )}
            <Badge variant="outline" className="bg-white/90 dark:bg-black/80 backdrop-blur-sm border-none shadow-sm font-black text-[10px] uppercase px-3 py-1.5 w-fit">
              {product.category}
            </Badge>
          </div>

          <div className="absolute top-4 right-4 z-20">
            <Button 
              variant="ghost" 
              size="icon" 
              className={cn(
                "rounded-full bg-white/50 backdrop-blur-md shadow-md hover:bg-white transition-all",
                inWishlist && "text-destructive"
              )}
              onClick={toggleWishlist}
            >
              <Heart className={cn("h-5 w-5", inWishlist && "fill-current")} />
            </Button>
          </div>

          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <div className="bg-white text-primary font-black px-6 py-3 rounded-none uppercase text-xs tracking-widest flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-transform">
              View Details <ArrowRight className="h-4 w-4" />
            </div>
          </div>
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-6">
        <Link href={`/product/${product.slug}`} className="block group/link">
          <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{product.brand || 'Premium'}</span>
          <h3 className="font-black text-xl text-primary leading-tight mt-1 line-clamp-1 uppercase tracking-tighter group-hover/link:text-secondary transition-colors">{product.name}</h3>
        </Link>
        
        <div className="mt-auto flex items-center justify-between gap-4 pt-4 border-t border-muted">
          <div className="flex flex-col">
            <div className="flex flex-col leading-none">
              {hasOffer && (
                <span className="text-xs text-muted-foreground line-through font-bold mb-1">
                  KES {product.price.toLocaleString()}
                </span>
              )}
              <span className="text-2xl font-black text-secondary tracking-tighter">
                KES {effectivePrice.toLocaleString()}
              </span>
            </div>
          </div>
          
          <Button
            size="icon"
            onClick={handleQuickAdd}
            disabled={isOutOfStock}
            className={cn(
              "h-12 w-12 rounded-full transition-all shrink-0 border-2",
              added ? "bg-green-500 border-green-500 hover:bg-green-600" : "bg-primary border-primary hover:bg-primary/90"
            )}
          >
            {added ? <Check className="h-6 w-6 text-white" /> : <ShoppingCart className="h-6 w-6 text-white" />}
          </Button>
        </div>
      </div>
    </div>
  );
}
