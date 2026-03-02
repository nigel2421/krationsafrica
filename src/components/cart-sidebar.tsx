
"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Trash2, Minus, Plus, ShoppingCart, MessageCircle, Loader2 } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useUser, useFirestore } from "@/firebase";
import { collection, doc, serverTimestamp, setDoc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";

export function CartSidebar() {
  const { cart, removeFromCart, updateQuantity, totalPrice, clearCart } = useCart();
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const [checkoutStep, setCheckoutStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [details, setDetails] = useState({
    name: "",
    phone: "",
    location: "",
    notes: "",
  });

  const handleWhatsAppCheckout = async () => {
    setIsSubmitting(true);
    try {
      const storeNumber = "254724211100"; // Replace with real number
      const itemsList = cart
        .map((item) => `• ${item.name} (x${item.quantity}) - KES ${(item.price * item.quantity).toLocaleString()}`)
        .join("\n");
      
      const orderData = {
        customerName: details.name,
        customerPhoneNumber: details.phone,
        deliveryLocation: details.location,
        specialNotes: details.notes,
        items: cart.map(i => `${i.name} (x${i.quantity})`),
        totalAmount: totalPrice,
        orderStatus: "Pending",
        orderedAt: serverTimestamp(),
        userId: user?.uid || "anonymous",
      };

      // Save to global orders for admin
      if (db) {
        const globalOrderRef = doc(collection(db, "orders"));
        await setDoc(globalOrderRef, { ...orderData, id: globalOrderRef.id });
        
        // Save to user orders if logged in
        if (user) {
          const userOrderRef = doc(collection(db, "userProfiles", user.uid, "orders"), globalOrderRef.id);
          await setDoc(userOrderRef, { ...orderData, id: globalOrderRef.id });
        }
      }

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
      toast({ title: "Order Placed!", description: "WhatsApp is opening for confirmation." });
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-8 text-center">
        <div className="mb-4 rounded-full bg-muted p-6">
          <ShoppingCart className="h-12 w-12 text-muted-foreground" />
        </div>
        <h2 className="text-xl font-black uppercase tracking-tighter">Cart is empty</h2>
        <p className="mt-2 text-muted-foreground font-medium">Ready to find your next pair?</p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <ScrollArea className="flex-1 p-6">
        {checkoutStep === 1 ? (
          <div className="space-y-6">
            {cart.map((item) => (
              <div key={item.id} className="flex gap-4 group">
                <div className="relative h-20 w-20 overflow-hidden rounded-lg bg-muted border-2 group-hover:border-secondary transition-colors">
                  <Image src={item.imageUrl} alt={item.name} fill className="object-cover" />
                </div>
                <div className="flex flex-1 flex-col justify-between py-1">
                  <div>
                    <h3 className="font-black text-xs uppercase tracking-tight leading-none mb-1">{item.name}</h3>
                    <p className="text-sm font-black text-secondary">KES {item.price.toLocaleString()}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 border-2 rounded-md p-1">
                      <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="p-1 hover:text-secondary"><Minus className="h-3 w-3" /></button>
                      <span className="text-xs font-black w-4 text-center">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-1 hover:text-secondary"><Plus className="h-3 w-3" /></button>
                    </div>
                    <button onClick={() => removeFromCart(item.id)} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            <h3 className="font-black text-lg uppercase tracking-tight">Delivery Details</h3>
            <div className="grid gap-2">
              <Label>Full Name</Label>
              <Input placeholder="John Doe" value={details.name} onChange={(e) => setDetails({ ...details, name: e.target.value })} />
            </div>
            <div className="grid gap-2">
              <Label>Phone Number</Label>
              <Input placeholder="0712 345 678" value={details.phone} onChange={(e) => setDetails({ ...details, phone: e.target.value })} />
            </div>
            <div className="grid gap-2">
              <Label>Location</Label>
              <Input placeholder="Building, Estate, City" value={details.location} onChange={(e) => setDetails({ ...details, location: e.target.value })} />
            </div>
            <div className="grid gap-2">
              <Label>Notes (Optional)</Label>
              <Textarea placeholder="e.g. Door bell is broken" value={details.notes} onChange={(e) => setDetails({ ...details, notes: e.target.value })} />
            </div>
            <Button variant="ghost" onClick={() => setCheckoutStep(1)} className="w-full font-bold">Back to Cart</Button>
          </div>
        )}
      </ScrollArea>

      <div className="p-6 bg-muted/30 border-t-2">
        <div className="flex items-center justify-between mb-4">
          <span className="text-muted-foreground font-black uppercase text-[10px]">Total Price</span>
          <span className="text-2xl font-black text-primary">KES {totalPrice.toLocaleString()}</span>
        </div>
        {checkoutStep === 1 ? (
          <Button onClick={() => setCheckoutStep(2)} className="w-full h-14 text-lg font-black uppercase tracking-widest bg-primary hover:bg-primary/90">
            Checkout
          </Button>
        ) : (
          <Button 
            onClick={handleWhatsAppCheckout} 
            disabled={!details.name || !details.phone || !details.location || isSubmitting}
            className="w-full h-14 text-lg font-black uppercase tracking-widest bg-[#25D366] hover:bg-[#128C7E] text-white border-none"
          >
            {isSubmitting ? <Loader2 className="h-6 w-6 animate-spin" /> : <><MessageCircle className="mr-2 h-6 w-6" /> WhatsApp Order</>}
          </Button>
        )}
      </div>
    </div>
  );
}
