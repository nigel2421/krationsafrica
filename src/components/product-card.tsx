
"use client";

import Image from "next/image";
import { ShoppingCart, Check, Star, Heart } from "lucide-react";
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

  const handleAddToCart = () => {
    // Add to cart with the effective (offer) price
    addToCart({ ...product, price: effectivePrice });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const toggleWishlist = () => {
    if (inWishlist) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  };

  return (
    <div className="group relative flex flex-col overflow-hidden bg-card transition-all hover:shadow-2xl border-2 hover:border-secondary">
      <div className="aspect-[3/4] relative overflow-hidden bg-muted">
        <Image
          src={product.imageUrl}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
          className="object-cover transition-transform duration-700 group-hover:scale-110"
        />
        
        {/* Badges */}
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          {hasOffer && (
            <div className="bg-secondary text-primary font-black px-4 py-1.5 uppercase text-[10px] tracking-tighter flex items-center gap-1 shadow-lg">
              <Star className="h-3 w-3 fill-primary" /> SALE
            </div>
          )}
          {isOutOfStock && (
            <Badge variant="destructive" className="font-black px-4 py-1.5 uppercase text-[10px] tracking-tighter">OUT OF STOCK</Badge>
          )}
          {!isOutOfStock && isFewLeft && (
            <Badge className="bg-orange-500 text-white border-none font-black px-4 py-1.5 uppercase text-[10px] tracking-tighter">FEW LEFT</Badge>
          )}
          <Badge variant="outline" className="bg-white/90 dark:bg-black/80 backdrop-blur-sm border-none shadow-sm font-black text-[10px] uppercase px-3 py-1.5 w-fit">
            {product.category}
          </Badge>
        </div>

        {/* Wishlist Button */}
        <Button 
          variant="ghost" 
          size="icon" 
          className={cn(
            "absolute top-4 right-4 rounded-full bg-white/50 backdrop-blur-md shadow-md hover:bg-white transition-all",
            inWishlist && "text-destructive"
          )}
          onClick={toggleWishlist}
        >
          <Heart className={cn("h-5 w-5", inWishlist && "fill-current")} />
        </Button>

        {/* Rating Overlay */}
        <div className="absolute bottom-4 left-4 flex items-center gap-1 bg-black/60 backdrop-blur-md px-2 py-1 rounded text-white text-[10px] font-black">
          <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
          4.8
        </div>
      </div>

      <div className="flex flex-1 flex-col p-6">
        <div className="mb-2">
          <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{product.brand || 'Premium'}</span>
          <h3 className="font-black text-xl text-primary leading-tight mt-1 line-clamp-1 uppercase tracking-tighter">{product.name}</h3>
        </div>
        
        <div className="mt-auto flex items-center justify-between gap-4 pt-4 border-t border-muted">
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-muted-foreground uppercase">
              {hasOffer ? "Offer Price" : "Price"}
            </span>
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
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className={cn(
              "h-12 w-12 rounded-full transition-all shrink-0 border-2",
              added ? "bg-green-500 border-green-500 hover:bg-green-600" : "bg-primary border-primary hover:bg-primary/90"
            )}
          >
            {added ? (
              <Check className="h-6 w-6 text-white" />
            ) : (
              <ShoppingCart className="h-6 w-6 text-white" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
