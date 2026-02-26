
"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Trash2, Minus, Plus, ShoppingCart, MessageCircle } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

export function CartSidebar() {
  const { cart, removeFromCart, updateQuantity, totalPrice, totalItems, clearCart } = useCart();
  const [checkoutStep, setCheckoutStep] = useState(1);
  const [details, setDetails] = useState({
    name: "",
    phone: "",
    location: "",
    notes: "",
  });

  const handleWhatsAppCheckout = () => {
    const storeNumber = "254700000000"; // Replace with real number
    const itemsList = cart
      .map((item) => `• ${item.name} (x${item.quantity}) - KES ${(item.price * item.quantity).toLocaleString()}`)
      .join("\n");
    
    const message = `*New Order from Kreations Kicks*\n\n` +
      `*Customer Details:*\n` +
      `Name: ${details.name}\n` +
      `Phone: ${details.phone}\n` +
      `Location: ${details.location}\n` +
      `${details.notes ? `Notes: ${details.notes}\n` : ""}\n` +
      `*Order Summary:*\n` +
      `${itemsList}\n\n` +
      `*Total Amount: KES ${totalPrice.toLocaleString()}*`;

    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${storeNumber}?text=${encodedMessage}`, "_blank");
    clearCart();
  };

  if (cart.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-8 text-center">
        <div className="mb-4 rounded-full bg-muted p-6">
          <ShoppingCart className="h-12 w-12 text-muted-foreground" />
        </div>
        <h2 className="text-xl font-bold">Your cart is empty</h2>
        <p className="mt-2 text-muted-foreground">Looks like you haven't added anything yet.</p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="p-6">
        <h2 className="text-2xl font-bold">Your Shopping Cart</h2>
        <p className="text-sm text-muted-foreground">
          {totalItems} {totalItems === 1 ? "item" : "items"} in your cart
        </p>
      </div>

      <Separator />

      <ScrollArea className="flex-1 p-6">
        {checkoutStep === 1 ? (
          <div className="space-y-6">
            {cart.map((item) => (
              <div key={item.id} className="flex gap-4">
                <div className="relative h-20 w-20 overflow-hidden rounded-lg bg-muted">
                  <Image
                    src={item.imageUrl}
                    alt={item.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex flex-1 flex-col justify-between py-1">
                  <div>
                    <h3 className="font-semibold text-sm leading-none mb-1">{item.name}</h3>
                    <p className="text-sm font-bold text-secondary">KES {item.price.toLocaleString()}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 border rounded-md p-1">
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="p-1 hover:text-secondary transition-colors"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="text-xs font-medium w-4 text-center">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="p-1 hover:text-secondary transition-colors"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                    <button 
                      onClick={() => removeFromCart(item.id)}
                      className="text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            <h3 className="font-bold text-lg">Delivery Details</h3>
            <div className="grid gap-2">
              <Label htmlFor="name">Full Name</Label>
              <Input 
                id="name" 
                placeholder="John Doe" 
                value={details.name}
                onChange={(e) => setDetails({ ...details, name: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input 
                id="phone" 
                placeholder="0712 345 678" 
                value={details.phone}
                onChange={(e) => setDetails({ ...details, phone: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="location">Delivery Location</Label>
              <Input 
                id="location" 
                placeholder="Building, Estate, City" 
                value={details.location}
                onChange={(e) => setDetails({ ...details, location: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="notes">Special Notes (Optional)</Label>
              <Textarea 
                id="notes" 
                placeholder="e.g. Leave with security" 
                value={details.notes}
                onChange={(e) => setDetails({ ...details, notes: e.target.value })}
              />
            </div>
            <Button variant="ghost" onClick={() => setCheckoutStep(1)} className="w-full">
              Go back to cart
            </Button>
          </div>
        )}
      </ScrollArea>

      <div className="p-6 bg-muted/50">
        <div className="flex items-center justify-between mb-4">
          <span className="text-muted-foreground">Total</span>
          <span className="text-2xl font-bold">KES {totalPrice.toLocaleString()}</span>
        </div>
        {checkoutStep === 1 ? (
          <Button onClick={() => setCheckoutStep(2)} className="w-full h-12 text-lg font-bold">
            Proceed to Checkout
          </Button>
        ) : (
          <Button 
            onClick={handleWhatsAppCheckout} 
            disabled={!details.name || !details.phone || !details.location}
            className="w-full h-12 text-lg font-bold bg-[#25D366] hover:bg-[#128C7E] text-white border-none"
          >
            <MessageCircle className="mr-2 h-5 w-5" />
            Order on WhatsApp
          </Button>
        )}
      </div>
    </div>
  );
}
