
"use client";

import React from "react";
import Image from "next/image";
import { Trash2, ShoppingCart, HeartOff } from "lucide-react";
import { useWishlist } from "@/hooks/use-wishlist";
import { useCart } from "@/hooks/use-cart";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";

export function WishlistSidebar() {
  const { wishlist, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { toast } = useToast();

  const handleMoveToCart = (item: any) => {
    addToCart(item);
    removeFromWishlist(item.id);
    toast({
      title: "Moved to Cart",
      description: `${item.name} is ready for checkout.`,
    });
  };

  if (wishlist.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-8 text-center">
        <div className="mb-4 rounded-full bg-muted p-6">
          <HeartOff className="h-12 w-12 text-muted-foreground" />
        </div>
        <h2 className="text-xl font-black uppercase tracking-tighter">Wishlist is empty</h2>
        <p className="mt-2 text-muted-foreground font-medium">Save the pairs you love for later.</p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <ScrollArea className="flex-1 p-6">
        <div className="space-y-6">
          {wishlist.map((item) => (
            <div key={item.id} className="flex gap-4 group">
              <div className="relative h-20 w-20 overflow-hidden rounded-lg bg-muted border-2 group-hover:border-secondary transition-colors">
                <Image src={item.imageUrl} alt={item.name} fill className="object-cover" />
              </div>
              <div className="flex flex-1 flex-col justify-between py-1">
                <div>
                  <h3 className="font-black text-xs uppercase tracking-tight leading-none mb-1">{item.name}</h3>
                  <p className="text-sm font-black text-secondary">KES {item.price.toLocaleString()}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    size="sm" 
                    className="h-8 font-black uppercase text-[10px] flex-1 bg-primary"
                    onClick={() => handleMoveToCart(item)}
                  >
                    <ShoppingCart className="mr-1 h-3 w-3" /> Move to Cart
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={() => removeFromWishlist(item.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
      <div className="p-6 bg-muted/30 border-t-2 text-center">
        <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">
          {wishlist.length} Items saved for later
        </p>
      </div>
    </div>
  );
}
