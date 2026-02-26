
"use client";

import Image from "next/image";
import { ShoppingCart, Check, Star } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
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
    imageUrl: string;
    stockStatus: string;
    category: string;
    gender?: string;
  };
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);
  const isOutOfStock = product.stockStatus === "Out of Stock";
  const isFewLeft = product.stockStatus === "Few Left";

  const handleAddToCart = () => {
    addToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="group relative flex flex-col overflow-hidden bg-card transition-all hover:shadow-2xl">
      <div className="aspect-[3/4] relative overflow-hidden bg-muted">
        <Image
          src={product.imageUrl}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-110"
          data-ai-hint="product shoe"
        />
        
        {/* Badges */}
        <div className="absolute top-4 left-4 flex flex-col gap-2">
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
            <span className="text-[10px] font-black text-muted-foreground uppercase">Price</span>
            <span className="text-2xl font-black text-secondary tracking-tighter leading-none">
              KES {product.price.toLocaleString()}
            </span>
          </div>
          
          <Button
            size="icon"
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className={cn(
              "h-12 w-12 rounded-full transition-all shrink-0",
              added ? "bg-green-500 hover:bg-green-600" : "bg-primary hover:bg-primary/90"
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
