
"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Trash2, Minus, Plus, ShoppingCart, MessageCircle, Loader2, MapPin, ChevronRight, ChevronLeft } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useUser, useFirestore } from "@/firebase";
import { collection, doc, serverTimestamp, setDoc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const DELIVERY_ZONES = [
  { id: "zone1", label: "Zone 1 (CBD & Close)", description: "CBD, Upperhill, Ngara, Pangani", fee: 200 },
  { id: "zone2", label: "Zone 2 (Suburbs)", description: "Westlands, Kilimani, Lavington, South B/C", fee: 300 },
  { id: "zone3", label: "Zone 3 (Mid-Range)", description: "Langata, Kasarani, Roysambu, Embakasi", fee: 350 },
  { id: "zone4", label: "Zone 4 (Outskirts)", description: "Karen, Runda, Syokimau, Kitengela, Rongai", fee: 500 },
];

export function CartSidebar() {
  const { cart, removeFromCart, updateQuantity, totalPrice, clearCart } = useCart();
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const [checkoutStep, setCheckoutStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedZone, setSelectedZone] = useState<string>("");
  const [details, setDetails] = useState({
    name: "",
    phone: "",
    location: "",
    notes: "",
  });

  const deliveryFee = DELIVERY_ZONES.find(z => z.id === selectedZone)?.fee || 0;
  const grandTotal = totalPrice + deliveryFee;

  const generateOrderId = () => {
    const now = new Date();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    const random = Math.floor(1000 + Math.random() * 9000);
    return `ORD-${month}${day}-${random}`;
  };

  const handleWhatsAppCheckout = async () => {
    setIsSubmitting(true);
    try {
      const storeNumber = "254719112025";
      const orderId = generateOrderId();
      const zoneLabel = DELIVERY_ZONES.find(z => z.id === selectedZone)?.label || "N/A";
      
      const itemsList = cart
        .map((item) => `• ${item.name} (x${item.quantity}) - KES ${(item.price * item.quantity).toLocaleString()}`)
        .join("\n");
      
      const orderData = {
        id: orderId,
        customerName: details.name,
        customerPhoneNumber: details.phone,
        deliveryLocation: details.location,
        deliveryRegion: zoneLabel,
        deliveryFee: deliveryFee,
        specialNotes: details.notes,
        items: cart.map(i => `${i.name} (x${i.quantity})`),
        subtotal: totalPrice,
        totalAmount: grandTotal,
        orderStatus: "Pending",
        orderedAt: serverTimestamp(),
        userId: user?.uid || "anonymous",
      };

      if (db) {
        const globalOrderRef = doc(db, "orders", orderId);
        await setDoc(globalOrderRef, orderData);
        
        if (user) {
          const userOrderRef = doc(db, "userProfiles", user.uid, "orders", orderId);
          await setDoc(userOrderRef, orderData);
        }
      }

      const message = `*New Order from Kreations Kicks*\n\n` +
        `*Order ID:* ${orderId}\n\n` +
        `*Customer Details:*\n` +
        `Name: ${details.name}\n` +
        `Phone: ${details.phone}\n` +
        `Location: ${details.location}\n` +
        `Region: ${zoneLabel}\n` +
        `${details.notes ? `Notes: ${details.notes}\n` : ""}\n` +
        `*Order Summary:*\n` +
        `${itemsList}\n\n` +
        `*Subtotal:* KES ${totalPrice.toLocaleString()}\n` +
        `*Delivery Fee:* KES ${deliveryFee.toLocaleString()}\n` +
        `*Grand Total: KES ${grandTotal.toLocaleString()}*\n\n` +
        `⚠️ *IMPORTANT PAYMENT DISCLAIMER*\n` +
        `To secure your order and begin processing, kindly make your payment to *+254 719 112025*.\n\n` +
        `*Note:* Orders are only dispatched once payment is confirmed. After payment, simply reply here with your M-Pesa confirmation code or a screenshot. 👇`;

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
        {checkoutStep === 1 && (
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
        )}

        {checkoutStep === 2 && (
          <div className="space-y-6">
            <h3 className="font-black text-lg uppercase tracking-tight">Delivery Region</h3>
            <p className="text-xs text-muted-foreground font-medium">Select your delivery zone to calculate charges.</p>
            <RadioGroup value={selectedZone} onValueChange={setSelectedZone} className="space-y-3">
              {DELIVERY_ZONES.map((zone) => (
                <Label
                  key={zone.id}
                  className={`flex items-center justify-between p-4 border-2 rounded-xl cursor-pointer transition-all ${
                    selectedZone === zone.id ? "border-secondary bg-secondary/5" : "hover:border-muted-foreground/30"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <RadioGroupItem value={zone.id} id={zone.id} />
                    <div className="space-y-1">
                      <p className="font-black text-xs uppercase">{zone.label}</p>
                      <p className="text-[10px] text-muted-foreground leading-none">{zone.description}</p>
                    </div>
                  </div>
                  <span className="font-black text-sm">KES {zone.fee}</span>
                </Label>
              ))}
            </RadioGroup>
          </div>
        )}

        {checkoutStep === 3 && (
          <div className="space-y-4">
            <h3 className="font-black text-lg uppercase tracking-tight">Personal Details</h3>
            <div className="grid gap-2">
              <Label className="text-xs font-bold uppercase">Full Name</Label>
              <Input placeholder="e.g. Jane Doe" className="border-2 h-11" value={details.name} onChange={(e) => setDetails({ ...details, name: e.target.value })} />
            </div>
            <div className="grid gap-2">
              <Label className="text-xs font-bold uppercase">Phone Number</Label>
              <Input placeholder="e.g. 0719 000 000" className="border-2 h-11" value={details.phone} onChange={(e) => setDetails({ ...details, phone: e.target.value })} />
            </div>
            <div className="grid gap-2">
              <Label className="text-xs font-bold uppercase">Detailed Location</Label>
              <Input placeholder="Estate, Apartment, Door No." className="border-2 h-11" value={details.location} onChange={(e) => setDetails({ ...details, location: e.target.value })} />
            </div>
            <div className="grid gap-2">
              <Label className="text-xs font-bold uppercase">Special Instructions</Label>
              <Textarea placeholder="Any delivery notes..." className="border-2" value={details.notes} onChange={(e) => setDetails({ ...details, notes: e.target.value })} />
            </div>
          </div>
        )}
      </ScrollArea>

      <div className="p-6 bg-muted/30 border-t-2">
        <div className="space-y-2 mb-6">
          <div className="flex items-center justify-between text-xs font-bold uppercase text-muted-foreground">
            <span>Subtotal</span>
            <span>KES {totalPrice.toLocaleString()}</span>
          </div>
          {deliveryFee > 0 && (
            <div className="flex items-center justify-between text-xs font-bold uppercase text-muted-foreground">
              <span>Delivery Fee</span>
              <span>KES {deliveryFee.toLocaleString()}</span>
            </div>
          )}
          <div className="flex items-center justify-between pt-2 border-t-2">
            <span className="text-muted-foreground font-black uppercase text-[10px]">Grand Total</span>
            <span className="text-2xl font-black text-primary">KES {grandTotal.toLocaleString()}</span>
          </div>
        </div>

        <div className="flex gap-2">
          {checkoutStep > 1 && (
            <Button variant="outline" size="icon" className="h-14 w-14 shrink-0 border-2" onClick={() => setCheckoutStep(prev => prev - 1)}>
              <ChevronLeft className="h-6 w-6" />
            </Button>
          )}
          
          {checkoutStep < 3 ? (
            <Button 
              onClick={() => setCheckoutStep(prev => prev + 1)} 
              disabled={checkoutStep === 2 && !selectedZone}
              className="flex-1 h-14 text-lg font-black uppercase tracking-widest bg-primary hover:bg-primary/90"
            >
              Next <ChevronRight className="ml-2 h-5 w-5" />
            </Button>
          ) : (
            <Button 
              onClick={handleWhatsAppCheckout} 
              disabled={!details.name || !details.phone || !details.location || isSubmitting}
              className="flex-1 h-14 text-lg font-black uppercase tracking-widest bg-[#25D366] hover:bg-[#128C7E] text-white border-none"
            >
              {isSubmitting ? <Loader2 className="h-6 w-6 animate-spin" /> : <><MessageCircle className="mr-2 h-6 w-6" /> Complete Order</>}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
