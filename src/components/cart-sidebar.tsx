
"use client";

import React, { useState } from "react";
import Image from "next/image";
import { 
  Trash2, 
  Minus, 
  Plus, 
  ShoppingCart, 
  MessageCircle, 
  Loader2, 
  MapPin, 
  ChevronRight, 
  ChevronLeft,
  Store,
  Truck,
  ShieldAlert,
  MapPinned
} from "lucide-react";
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
import { Separator } from "@/components/ui/separator";

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
  const [deliveryMethod, setDeliveryMethod] = useState<"delivery" | "pickup">("delivery");
  const [selectedZone, setSelectedZone] = useState<string>("");
  
  const [details, setDetails] = useState({
    name: "",
    phone: "",
    location: "",
    notes: "",
  });

  const deliveryFee = deliveryMethod === "delivery" ? (DELIVERY_ZONES.find(z => z.id === selectedZone)?.fee || 0) : 0;
  const grandTotal = totalPrice + deliveryFee;

  const normalizePhone = (phone: string) => {
    let cleaned = phone.trim().replace(/\s+/g, '');
    if (cleaned.startsWith('0')) {
      return '+254' + cleaned.substring(1);
    }
    if (cleaned.startsWith('254')) {
      return '+' + cleaned;
    }
    if (cleaned.startsWith('+254')) {
      return cleaned;
    }
    return '+254' + cleaned;
  };

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
      const storeNumber = "254712345678";
      const orderId = generateOrderId();
      const zoneLabel = deliveryMethod === "delivery" 
        ? (DELIVERY_ZONES.find(z => z.id === selectedZone)?.label || "Delivery") 
        : "Store Pick-up (Royal Palms Mall)";
      
      const normalizedCustomerPhone = normalizePhone(details.phone);
      
      const itemsList = cart
        .map((item) => `• ${item.name} (x${item.quantity}) - KES ${(item.price * item.quantity).toLocaleString()}`)
        .join("\n");
      
      const orderData = {
        id: orderId,
        customerName: details.name,
        customerPhoneNumber: normalizedCustomerPhone,
        deliveryLocation: deliveryMethod === "delivery" ? details.location : "Royal Palms Mall, Shop BF01",
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
        `Phone: ${normalizedCustomerPhone}\n` +
        `Method: ${deliveryMethod === "delivery" ? "Delivery" : "Pick-up"}\n` +
        `${deliveryMethod === "delivery" ? `Location: ${details.location}\nRegion: ${zoneLabel}\n` : "Location: Royal Palms Mall, Shop BF01, Ronald Ngala St\n"}` +
        `${details.notes ? `Notes: ${details.notes}\n` : ""}\n` +
        `*Order Summary:*\n` +
        `${itemsList}\n\n` +
        `*Subtotal:* KES ${totalPrice.toLocaleString()}\n` +
        `*Delivery:* KES ${deliveryFee.toLocaleString()}\n` +
        `*Grand Total: KES ${grandTotal.toLocaleString()}*\n\n` +
        `⚠️ *IMPORTANT PAYMENT DISCLAIMER*\n` +
        `To secure your order and begin processing, kindly make your payment to *+254 712 345 678*.\n\n` +
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
      <div className="flex h-full flex-col items-center justify-center p-8 text-center bg-background">
        <div className="mb-4 rounded-full bg-muted p-6">
          <ShoppingCart className="h-12 w-12 text-muted-foreground" />
        </div>
        <h2 className="text-xl font-black uppercase tracking-tighter text-foreground">Cart is empty</h2>
        <p className="mt-2 text-muted-foreground font-medium">Ready to find your next pair?</p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col bg-background text-foreground overflow-hidden">
      <ScrollArea className="flex-1 p-4 md:p-6 pb-32">
        {checkoutStep === 1 && (
          <div className="space-y-6">
            <h3 className="font-black text-lg uppercase tracking-tight text-foreground">Review Items</h3>
            {cart.map((item) => (
              <div key={item.id} className="flex gap-4 group">
                <div className="relative h-20 w-20 overflow-hidden rounded-lg bg-muted border-2 group-hover:border-secondary transition-colors">
                  <Image src={item.imageUrl} alt={item.name} fill className="object-cover" />
                </div>
                <div className="flex flex-1 flex-col justify-between py-1">
                  <div>
                    <h3 className="font-black text-[11px] uppercase tracking-tight leading-none mb-1 text-foreground">{item.name}</h3>
                    <p className="text-sm font-black text-secondary">KES {item.price.toLocaleString()}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 border-2 rounded-md p-1 border-muted">
                      <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="p-1 hover:text-secondary text-foreground"><Minus className="h-3 w-3" /></button>
                      <span className="text-xs font-black w-4 text-center text-foreground">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-1 hover:text-secondary text-foreground"><Plus className="h-3 w-3" /></button>
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
            <h3 className="font-black text-lg uppercase tracking-tight text-foreground">How do you want it?</h3>
            <RadioGroup value={deliveryMethod} onValueChange={(v: any) => setDeliveryMethod(v)} className="grid grid-cols-2 gap-4">
              <Label className={`flex flex-col items-center justify-center p-4 border-2 rounded-xl cursor-pointer transition-all gap-2 text-center ${deliveryMethod === "delivery" ? "border-secondary bg-secondary/5" : "hover:border-muted-foreground/30 border-muted"}`}>
                <RadioGroupItem value="delivery" className="sr-only" />
                <Truck className={`h-6 w-6 ${deliveryMethod === "delivery" ? "text-secondary" : "text-muted-foreground"}`} />
                <span className="font-black text-[10px] uppercase">Express Delivery</span>
              </Label>
              <Label className={`flex flex-col items-center justify-center p-4 border-2 rounded-xl cursor-pointer transition-all gap-2 text-center ${deliveryMethod === "pickup" ? "border-secondary bg-secondary/5" : "hover:border-muted-foreground/30 border-muted"}`}>
                <RadioGroupItem value="pickup" className="sr-only" />
                <Store className={`h-6 w-6 ${deliveryMethod === "pickup" ? "text-secondary" : "text-muted-foreground"}`} />
                <span className="font-black text-[10px] uppercase">Shop Pick-up</span>
              </Label>
            </RadioGroup>

            {deliveryMethod === "delivery" ? (
              <div className="space-y-4">
                <h4 className="text-xs font-black uppercase text-muted-foreground tracking-widest">Select Region</h4>
                <RadioGroup value={selectedZone} onValueChange={setSelectedZone} className="space-y-3">
                  {DELIVERY_ZONES.map((zone) => (
                    <Label
                      key={zone.id}
                      htmlFor={zone.id}
                      className={`flex items-center justify-between p-4 border-2 rounded-xl cursor-pointer transition-all ${
                        selectedZone === zone.id ? "border-secondary bg-secondary/5" : "hover:border-muted-foreground/30 border-muted"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <RadioGroupItem value={zone.id} id={zone.id} />
                        <div className="space-y-1">
                          <p className="font-black text-[10px] uppercase text-foreground">{zone.label}</p>
                          <p className="text-[9px] text-muted-foreground leading-none">{zone.description}</p>
                        </div>
                      </div>
                      <span className="font-black text-xs text-secondary">KES {zone.fee}</span>
                    </Label>
                  ))}
                </RadioGroup>
              </div>
            ) : (
              <div className="p-6 bg-muted/20 border-2 border-dashed rounded-xl space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-secondary shrink-0" />
                  <div>
                    <p className="font-black text-xs uppercase text-foreground">Royal Palms Mall, Shop BF01</p>
                    <p className="text-[10px] text-muted-foreground mt-1">Ronald Ngala Street, Nairobi CBD. Open Mon-Sat, 9 AM - 7 PM.</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="w-full font-bold text-[10px] uppercase border-secondary text-secondary" asChild>
                  <a href="https://www.google.com/maps/search/?api=1&query=Royal+Palms+Mall+Ronald+Ngala+Street+Nairobi+Shop+BF01" target="_blank"><MapPinned className="mr-2 h-3 w-3" /> View on Google Maps</a>
                </Button>
              </div>
            )}
          </div>
        )}

        {checkoutStep === 3 && (
          <div className="space-y-6">
            <h3 className="font-black text-lg uppercase tracking-tight text-foreground">Your Details</h3>
            <div className="grid gap-4">
              <div className="space-y-1.5">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Full Name</Label>
                <Input placeholder="e.g. John Doe" className="border-2 h-12 bg-background text-foreground" value={details.name} onChange={(e) => setDetails({ ...details, name: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Active WhatsApp Number</Label>
                <Input placeholder="0712345678" className="border-2 h-12 bg-background text-foreground" value={details.phone} onChange={(e) => setDetails({ ...details, phone: e.target.value })} />
              </div>
              {deliveryMethod === "delivery" && (
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Exact Delivery Location</Label>
                  <Input placeholder="Estate, Apt Name, Floor/Door No." className="border-2 h-12 bg-background text-foreground" value={details.location} onChange={(e) => setDetails({ ...details, location: e.target.value })} />
                </div>
              )}
              <div className="space-y-1.5">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Special Request / Notes</Label>
                <Textarea placeholder="Any specific instructions?" className="border-2 bg-background text-foreground" value={details.notes} onChange={(e) => setDetails({ ...details, notes: e.target.value })} />
              </div>
            </div>
          </div>
        )}

        {checkoutStep === 4 && (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="text-center space-y-4">
              <div className="bg-secondary/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto border-2 border-secondary/20">
                <ShieldAlert className="h-10 w-10 text-secondary" />
              </div>
              <h3 className="font-black text-2xl uppercase tracking-tighter text-foreground">Almost Ready!</h3>
              <p className="text-muted-foreground text-sm font-medium">Please review our payment policy to finalize your purchase.</p>
            </div>

            <div className="bg-[#2A2A40] text-white p-6 rounded-2xl space-y-6 shadow-xl border-t-4 border-secondary">
              <div className="space-y-2">
                <h4 className="text-secondary font-black text-xs uppercase tracking-[0.2em]">Important Disclaimer</h4>
                <p className="text-sm font-bold leading-relaxed">
                  To secure your pair and start processing, payment must be made to:
                </p>
                <div className="bg-white/10 p-4 rounded-lg flex items-center justify-between">
                  <span className="font-black text-lg">+254 712 345 678</span>
                  <span className="text-[10px] font-black uppercase bg-secondary text-primary px-2 py-1 rounded">M-PESA</span>
                </div>
              </div>

              <Separator className="bg-white/10" />

              <ul className="space-y-3 text-xs font-medium text-white/80">
                <li className="flex items-start gap-2">
                  <div className="h-4 w-4 rounded-full bg-secondary text-primary flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5">1</div>
                  <span>Orders are only dispatched once payment is confirmed.</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="h-4 w-4 rounded-full bg-secondary text-primary flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5">2</div>
                  <span>Reply with your M-Pesa code or screenshot on WhatsApp.</span>
                </li>
              </ul>
            </div>

            <div className="text-center space-y-2 pb-10">
              <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">IT WILL ALWAYS LOOK GOOD ON YOU</p>
            </div>
          </div>
        )}
      </ScrollArea>

      <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 bg-background border-t-2 border-muted z-10">
        <div className="space-y-2 mb-4">
          <div className="flex items-center justify-between text-[10px] font-black uppercase text-muted-foreground tracking-widest">
            <span>Subtotal</span>
            <span>KES {totalPrice.toLocaleString()}</span>
          </div>
          {deliveryMethod === "delivery" && deliveryFee > 0 && (
            <div className="flex items-center justify-between text-[10px] font-black uppercase text-muted-foreground tracking-widest">
              <span>Delivery Fee</span>
              <span>KES {deliveryFee.toLocaleString()}</span>
            </div>
          )}
          <div className="flex items-center justify-between pt-2 border-t-2 border-muted">
            <span className="text-muted-foreground font-black uppercase text-[10px] tracking-widest">Total Payable</span>
            <span className="text-2xl font-black text-primary dark:text-secondary">KES {grandTotal.toLocaleString()}</span>
          </div>
        </div>

        <div className="flex gap-2">
          {checkoutStep > 1 && (
            <Button variant="outline" size="icon" className="h-14 w-14 shrink-0 border-2" onClick={() => setCheckoutStep(prev => prev - 1)}>
              <ChevronLeft className="h-6 w-6 text-foreground" />
            </Button>
          )}
          
          {checkoutStep < 4 ? (
            <Button 
              onClick={() => setCheckoutStep(prev => prev + 1)} 
              disabled={(checkoutStep === 2 && deliveryMethod === "delivery" && !selectedZone) || (checkoutStep === 3 && (!details.name || !details.phone || (deliveryMethod === "delivery" && !details.location)))}
              className="flex-1 h-14 text-lg font-black uppercase tracking-widest bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              Continue <ChevronRight className="ml-2 h-5 w-5" />
            </Button>
          ) : (
            <Button 
              onClick={handleWhatsAppCheckout} 
              disabled={isSubmitting}
              className="flex-1 h-14 text-lg font-black uppercase tracking-widest bg-[#25D366] hover:bg-[#128C7E] text-white border-none shadow-lg"
            >
              {isSubmitting ? <Loader2 className="h-6 w-6 animate-spin" /> : <><MessageCircle className="mr-2 h-6 w-6" /> Open WhatsApp</>}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
