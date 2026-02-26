
"use client";

import Image from "next/image";
import { Plus, Check } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    price: number;
    imageUrl: string;
    stockStatus: string;
    category: string;
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
    <div className="group relative flex flex-col overflow-hidden rounded-xl border bg-card transition-all hover:shadow-xl hover:translate-y-[-4px]">
      <div className="aspect-square relative overflow-hidden bg-muted">
        <Image
          src={product.imageUrl}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-110"
          data-ai-hint="product shoe"
        />
        {isOutOfStock && (
          <div className="absolute inset-0 bg-background/60 backdrop-blur-[2px] flex items-center justify-center">
            <Badge variant="destructive" className="text-sm font-bold px-4 py-1">OUT OF STOCK</Badge>
          </div>
        )}
        {!isOutOfStock && isFewLeft && (
          <Badge className="absolute top-3 left-3 bg-orange-500 text-white border-none">FEW LEFT</Badge>
        )}
        <Badge variant="outline" className="absolute top-3 right-3 bg-white/80 backdrop-blur-sm border-none shadow-sm capitalize">
          {product.category}
        </Badge>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-bold text-lg text-primary line-clamp-1">{product.name}</h3>
        <p className="mt-1 text-2xl font-black text-secondary">
          KES {product.price.toLocaleString()}
        </p>
        
        <div className="mt-6">
          <Button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className={cn(
              "w-full h-11 transition-all font-bold",
              added ? "bg-green-500 hover:bg-green-600" : "bg-primary hover:bg-primary/90"
            )}
          >
            {added ? (
              <>
                <Check className="mr-2 h-5 w-5" />
                Added
              </>
            ) : (
              <>
                <Plus className="mr-2 h-5 w-5" />
                Add to Cart
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
