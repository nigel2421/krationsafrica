"use client";

import React, { useState, useEffect } from "react";
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
  MapPinned,
  CreditCard,
  Building2,
  UserCheck,
  Copy,
  CheckCircle2,
  Info,
  Mail,
  Globe
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
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const DELIVERY_REGIONS = [
  { 
    country: "Kenya", 
    zones: [
      { id: "ke-nbi", label: "Nairobi & Environs", description: "CBD, Westlands, Kilimani, Langata", fee: 300 },
      { id: "ke-major", label: "Kenya Major Towns", description: "Mombasa, Kisumu, Nakuru, Eldoret", fee: 600 },
      { id: "ke-up", label: "Kenya Upcountry", description: "All other towns in Kenya", fee: 800 },
    ]
  },
  { 
    country: "Uganda", 
    zones: [
      { id: "ug-kla", label: "Kampala Hub", description: "Central Kampala & Entebbe", fee: 1500 },
      { id: "ug-up", label: "Uganda Regional", description: "Jinja, Mbarara, Gulu", fee: 2000 },
    ]
  },
  { 
    country: "Tanzania", 
    zones: [
      { id: "tz-dar", label: "Dar es Salaam", description: "City Center & Suburbs", fee: 1800 },
      { id: "tz-ar", label: "Arusha / Moshi", description: "Northern Hubs", fee: 1500 },
    ]
  },
  { 
    country: "South Sudan", 
    zones: [
      { id: "ss-juba", label: "Juba Hub", description: "Juba City Delivery", fee: 3500 },
    ]
  },
  { 
    country: "Rwanda", 
    zones: [
      { id: "rw-kgl", label: "Kigali Hub", description: "Kigali Metropolitan", fee: 2000 },
    ]
  },
  { 
    country: "DR Congo", 
    zones: [
      { id: "cd-east", label: "Eastern DRC", description: "Goma, Bukavu, Beni", fee: 3000 },
      { id: "cd-kin", label: "Kinshasa", description: "Main City Hub", fee: 5000 },
    ]
  },
  { 
    country: "Burundi", 
    zones: [
      { id: "bi-bjm", label: "Bujumbura", description: "City Center Delivery", fee: 2500 },
    ]
  }
];

export function CartSidebar() {
  const { cart, removeFromCart, updateQuantity, totalPrice, clearCart } = useCart();
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  
  const [checkoutStep, setCheckoutStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [deliveryMethod, setDeliveryMethod] = useState<"delivery" | "pickup">("delivery");
  const [selectedCountry, setSelectedCountry] = useState<string>("Kenya");
  const [selectedZone, setSelectedZone] = useState<string>("");
  
  const [details, setDetails] = useState({
    name: "",
    email: "",
    phone: "",
    location: "",
    notes: "",
  });

  useEffect(() => {
    const saved = localStorage.getItem("kicks_customer_details");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setDetails(prev => ({
          ...prev,
          name: parsed.name || "",
          email: parsed.email || "",
          phone: parsed.phone || "",
          location: parsed.location || ""
        }));
      } catch (e) {
        console.error("Failed to parse saved customer details", e);
      }
    }
  }, []);

  // Reset zone when country changes
  useEffect(() => {
    setSelectedZone("");
  }, [selectedCountry]);

  const currentZones = DELIVERY_REGIONS.find(r => r.country === selectedCountry)?.zones || [];
  const activeZone = currentZones.find(z => z.id === selectedZone);
  const deliveryFee = deliveryMethod === "delivery" ? (activeZone?.fee || 0) : 0;
  const grandTotal = totalPrice + deliveryFee;

  const copyToClipboard = (text: string, label: string) => {
    if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(text);
      toast({ title: "Copied!", description: `${label} copied to clipboard.` });
    }
  };

  const normalizePhone = (phone: string) => {
    let cleaned = phone.trim().replace(/\s+/g, '').replace(/-/g, '');
    if (cleaned.startsWith('+')) return cleaned;
    if (cleaned.startsWith('254') || cleaned.startsWith('256') || cleaned.startsWith('255')) return '+' + cleaned;
    if (cleaned.startsWith('0')) return '+254' + cleaned.substring(1);
    if (/^\d+$/.test(cleaned)) return '+254' + cleaned;
    return cleaned;
  };

  const generateOrderId = () => {
    const now = new Date();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    const random = Math.floor(1000 + Math.random() * 9000);
    return `K254-${month}${day}-${random}`;
  };

  const handleWhatsAppCheckout = async () => {
    if (!acceptedTerms) {
      toast({ title: "Action Required", description: "Please accept the terms to continue.", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    try {
      localStorage.setItem("kicks_customer_details", JSON.stringify({
        name: details.name,
        email: details.email,
        phone: details.phone,
        location: details.location
      }));

      const storeNumber = "254719112025";
      const orderId = generateOrderId();
      const zoneLabel = deliveryMethod === "delivery" 
        ? `${selectedCountry}: ${activeZone?.label || "Regional"}`
        : "Store Pick-up (Royal Palms Mall, Nairobi)";
      
      const normalizedCustomerPhone = normalizePhone(details.phone);
      
      const itemsList = cart
        .map((item) => `• ${item.name} ${item.size ? `(Size: ${item.size})` : ''} (x${item.quantity}) - KES ${(item.price * item.quantity).toLocaleString()}`)
        .join("\n");
      
      const orderData = {
        id: orderId,
        customerName: details.name,
        customerEmail: details.email.toLowerCase().trim(),
        customerPhoneNumber: normalizedCustomerPhone,
        deliveryLocation: deliveryMethod === "delivery" ? details.location : "Royal Palms Mall, Shop BF01, Nairobi",
        deliveryRegion: zoneLabel,
        deliveryFee: deliveryFee,
        specialNotes: details.notes,
        items: cart.map(i => `${i.name} ${i.size ? `(EU ${i.size})` : ''} (x${i.quantity})`),
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

        if (details.email) {
          const subscriptionRef = doc(db, "newsletterSubscriptions", details.email.toLowerCase().trim());
          await setDoc(subscriptionRef, {
            email: details.email.toLowerCase().trim(),
            name: details.name,
            phone: normalizedCustomerPhone,
            source: 'checkout',
            subscribedAt: serverTimestamp(),
          }, { merge: true });
        }
      }

      const message = `*NEW ORDER - KREATIONS 254*\n\n` +
        `*Order ID:* ${orderId}\n\n` +
        `*Customer:* ${details.name}\n` +
        `*Phone:* ${normalizedCustomerPhone}\n` +
        `*Method:* ${deliveryMethod === "delivery" ? "Regional Delivery" : "Pick-up"}\n` +
        `${deliveryMethod === "delivery" ? `*Location:* ${details.location}\n*Region:* ${zoneLabel}\n` : "*Location:* Royal Palms Mall, Shop BF01, Nairobi CBD\n"}` +
        `${details.notes ? `*Notes:* ${details.notes}\n` : ""}\n` +
        `*Items Ordered:*\n` +
        `${itemsList}\n\n` +
        `*Total Amount:* KES ${grandTotal.toLocaleString()}\n\n` +
        `⚠️ *PAYMENT INSTRUCTIONS*\n` +
        `To secure your order, please pay to:\n` +
        `*LIPA NA FAMILY (M-Pesa Paybill)*\n` +
        `*Business Number:* 222111\n` +
        `*Account Number:* 172754\n` +
        `*Name:* VINCENT KITONGA\n\n` +
        `Please share the confirmation code or screenshot below once paid. IT WILL ALWAYS LOOK GOOD ON YOU!`;

      const encodedMessage = encodeURIComponent(message);
      setIsSuccess(true);
      setTimeout(() => {
        window.open(`https://wa.me/${storeNumber}?text=${encodedMessage}`, "_blank");
        clearCart();
        setCheckoutStep(1);
        setIsSuccess(false);
        setAcceptedTerms(false);
      }, 2000);
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const OrderSummary = () => (
    <div className="pt-8 pb-4 space-y-3">
      <Separator className="bg-muted-foreground/10" />
      <div className="flex items-center justify-between text-[10px] font-black uppercase text-muted-foreground tracking-widest">
        <span>Subtotal</span>
        <span>KES {totalPrice.toLocaleString()}</span>
      </div>
      {deliveryMethod === "delivery" && deliveryFee > 0 && (
        <div className="flex items-center justify-between text-[10px] font-black uppercase text-muted-foreground tracking-widest">
          <span>{selectedCountry} Delivery Fee</span>
          <span>KES {deliveryFee.toLocaleString()}</span>
        </div>
      )}
      <div className="flex items-center justify-between pt-2">
        <span className="text-muted-foreground font-black uppercase text-[10px] tracking-widest">Grand Total</span>
        <span className="text-2xl font-black text-primary dark:text-secondary">KES {grandTotal.toLocaleString()}</span>
      </div>
    </div>
  );

  const NavigationButtons = () => (
    <div className="flex gap-2 mt-8 pb-10">
      {checkoutStep > 1 && !isSubmitting && (
        <Button variant="outline" size="icon" className="h-14 w-14 shrink-0 border-2" onClick={() => setCheckoutStep(prev => prev - 1)}>
          <ChevronLeft className="h-6 w-6" />
        </Button>
      )}
      
      {checkoutStep < 4 ? (
        <Button 
          onClick={() => setCheckoutStep(prev => prev + 1)} 
          disabled={cart.length === 0 || (checkoutStep === 2 && deliveryMethod === "delivery" && !selectedZone) || (checkoutStep === 3 && (!details.name || !details.email || !details.phone || (deliveryMethod === "delivery" && !details.location)))}
          className="flex-1 h-14 text-lg font-black uppercase tracking-widest bg-primary"
        >
          Continue <ChevronRight className="ml-2 h-5 w-5" />
        </Button>
      ) : (
        <Button 
          onClick={handleWhatsAppCheckout} 
          disabled={isSubmitting || !acceptedTerms}
          className={`flex-1 h-14 text-lg font-black uppercase tracking-widest text-white border-none shadow-lg transition-all ${
            acceptedTerms ? "bg-[#25D366] hover:bg-[#128C7E] scale-100 active:scale-95" : "bg-muted/50 text-muted-foreground cursor-not-allowed"
          }`}
        >
          {isSubmitting ? <Loader2 className="h-6 w-6 animate-spin" /> : <><MessageCircle className="mr-2 h-6 w-6" /> Open WhatsApp</>}
        </Button>
      )}
    </div>
  );

  if (isSuccess) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-8 text-center space-y-6 animate-in fade-in zoom-in duration-500">
        <div className="bg-green-500/10 p-6 rounded-full border-4 border-green-500">
          <CheckCircle2 className="h-16 w-16 text-green-500" />
        </div>
        <div className="space-y-2">
          <h2 className="text-3xl font-black uppercase tracking-tighter">Order Placed Successfully!</h2>
          <p className="text-muted-foreground font-bold uppercase text-[10px] tracking-widest">Redirecting to WhatsApp...</p>
        </div>
        <p className="text-sm font-medium leading-relaxed">
          Your order has been captured. Please share your payment reference in the chat thread that opens next.
        </p>
        <Loader2 className="h-6 w-6 animate-spin text-secondary" />
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col bg-background text-foreground overflow-hidden">
      <ScrollArea className="flex-1">
        <div className="p-4 md:p-6 pb-24">
          {checkoutStep === 1 && (
            <div className="space-y-6">
              <h3 className="font-black text-lg uppercase tracking-tight">Review Items</h3>
              {cart.length === 0 ? (
                <div className="py-20 text-center">
                  <ShoppingCart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="font-black uppercase text-xs text-muted-foreground">Your cart is empty</p>
                </div>
              ) : (
                <>
                  <div className="space-y-4">
                    {cart.map((item) => (
                      <div key={`${item.id}-${item.size}`} className="flex gap-4 group">
                        <div className="relative h-20 w-20 overflow-hidden rounded-lg bg-muted border-2 group-hover:border-secondary transition-colors shrink-0">
                          <Image src={item.imageUrl} alt={item.name} fill className="object-cover" />
                        </div>
                        <div className="flex flex-1 flex-col justify-between py-1">
                          <div>
                            <div className="flex justify-between items-start">
                              <h3 className="font-black text-[11px] uppercase tracking-tight leading-none mb-1">{item.name}</h3>
                              {item.size && <Badge variant="secondary" className="text-[8px] font-black uppercase px-1.5 h-4">EU {item.size}</Badge>}
                            </div>
                            <p className="text-sm font-black text-secondary">KES {item.price.toLocaleString()}</p>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 border-2 rounded-md p-1 border-muted">
                              <button onClick={() => updateQuantity(item.id, item.quantity - 1, item.size)} className="p-1 hover:text-secondary"><Minus className="h-3 w-3" /></button>
                              <span className="text-xs font-black w-4 text-center">{item.quantity}</span>
                              <button onClick={() => updateQuantity(item.id, item.quantity + 1, item.size)} className="p-1 hover:text-secondary"><Plus className="h-3 w-3" /></button>
                            </div>
                            <button onClick={() => removeFromCart(item.id, item.size)} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <OrderSummary />
                  <NavigationButtons />
                </>
              )}
            </div>
          )}

          {checkoutStep === 2 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="font-black text-lg uppercase tracking-tight">Shipping Route</h3>
                <Globe className="h-5 w-5 text-secondary animate-pulse" />
              </div>
              <RadioGroup value={deliveryMethod} onValueChange={(v: any) => setDeliveryMethod(v)} className="grid grid-cols-2 gap-4">
                <Label className={`flex flex-col items-center justify-center p-4 border-2 rounded-xl cursor-pointer transition-all gap-2 text-center ${deliveryMethod === "delivery" ? "border-secondary bg-secondary/5" : "hover:border-muted-foreground/30 border-muted"}`}>
                  <RadioGroupItem value="delivery" className="sr-only" />
                  <Truck className={`h-6 w-6 ${deliveryMethod === "delivery" ? "text-secondary" : "text-muted-foreground"}`} />
                  <span className="font-black text-[10px] uppercase">Regional Delivery</span>
                </Label>
                <Label className={`flex flex-col items-center justify-center p-4 border-2 rounded-xl cursor-pointer transition-all gap-2 text-center ${deliveryMethod === "pickup" ? "border-secondary bg-secondary/5" : "hover:border-muted-foreground/30 border-muted"}`}>
                  <RadioGroupItem value="pickup" className="sr-only" />
                  <Store className={`h-6 w-6 ${deliveryMethod === "pickup" ? "text-secondary" : "text-muted-foreground"}`} />
                  <span className="font-black text-[10px] uppercase">Nairobi Pick-up</span>
                </Label>
              </RadioGroup>

              {deliveryMethod === "delivery" ? (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Select Destination Country</Label>
                    <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                      <SelectTrigger className="border-2 h-12">
                        <SelectValue placeholder="Country" />
                      </SelectTrigger>
                      <SelectContent>
                        {DELIVERY_REGIONS.map(r => (
                          <SelectItem key={r.country} value={r.country}>{r.country}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Select Regional Hub</h4>
                    <RadioGroup value={selectedZone} onValueChange={setSelectedZone} className="space-y-3">
                      {currentZones.map((zone) => (
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
                              <p className="font-black text-[10px] uppercase">{zone.label}</p>
                              <p className="text-[9px] text-muted-foreground leading-none">{zone.description}</p>
                            </div>
                          </div>
                          <span className="font-black text-xs text-secondary">KES {zone.fee.toLocaleString()}</span>
                        </Label>
                      ))}
                    </RadioGroup>
                  </div>
                </div>
              ) : (
                <div className="p-6 bg-muted/20 border-2 border-dashed rounded-xl space-y-4">
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-secondary shrink-0" />
                    <div>
                      <p className="font-black text-xs uppercase">Royal Palms Mall, Shop BF01</p>
                      <p className="text-[10px] text-muted-foreground mt-1">Ronald Ngala Street, Nairobi CBD. Open Mon-Sat, 9 AM - 7 PM.</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="w-full font-bold text-[10px] uppercase border-secondary text-secondary" asChild>
                    <a href="https://www.google.com/maps/search/?api=1&query=Royal+Palms+Mall+Ronald+Ngala+Street+Nairobi+Shop+BF01" target="_blank"><MapPinned className="mr-2 h-3 w-3" /> View on Maps</a>
                  </Button>
                </div>
              )}
              <OrderSummary />
              <NavigationButtons />
            </div>
          )}

          {checkoutStep === 3 && (
            <div className="space-y-6">
              <h3 className="font-black text-lg uppercase tracking-tight">Your Details</h3>
              <div className="grid gap-4">
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Full Name</Label>
                  <Input placeholder="John Doe" className="border-2 h-12 bg-background focus:ring-secondary" value={details.name} onChange={(e) => setDetails({ ...details, name: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                    <Input type="email" placeholder="john@example.com" className="pl-10 border-2 h-12 bg-background focus:ring-secondary" value={details.email} onChange={(e) => setDetails({ ...details, email: e.target.value })} />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Active WhatsApp Number</Label>
                  <Input placeholder="07XXXXXXXX" className="border-2 h-12 bg-background focus:ring-secondary" value={details.phone} onChange={(e) => setDetails({ ...details, phone: e.target.value })} />
                </div>
                {deliveryMethod === "delivery" && (
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Physical Delivery Address</Label>
                    <Input placeholder="City, Street, Apartment/House No." className="border-2 h-12 bg-background focus:ring-secondary" value={details.location} onChange={(e) => setDetails({ ...details, location: e.target.value })} />
                  </div>
                )}
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Additional Notes</Label>
                  <Textarea placeholder="Any specific instructions for our regional carriers?" className="border-2 bg-background focus:ring-secondary" value={details.notes} onChange={(e) => setDetails({ ...details, notes: e.target.value })} />
                </div>
              </div>
              <OrderSummary />
              <NavigationButtons />
            </div>
          )}

          {checkoutStep === 4 && (
            <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
              <div className="text-center space-y-4">
                <div className="bg-secondary/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto border-2 border-secondary/20">
                  <ShieldAlert className="h-10 w-10 text-secondary" />
                </div>
                <h3 className="font-black text-2xl uppercase tracking-tighter leading-none">Final Step</h3>
                <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest">Secure your regional order via M-Pesa.</p>
              </div>

              <div className="bg-[#1E40AF] text-white p-1 rounded-3xl overflow-hidden shadow-2xl">
                <div className="bg-[#2563EB] p-8 space-y-8">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-6 w-6 text-secondary" />
                      <span className="font-black text-sm uppercase tracking-widest">LIPA NA FAMILY</span>
                    </div>
                    <div className="bg-white/20 px-3 py-1 rounded-full text-[10px] font-black uppercase">M-PESA</div>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    <div className="bg-white/10 p-6 rounded-2xl relative group">
                      <p className="text-[10px] font-black text-white/50 uppercase tracking-widest mb-2">Business No (Paybill)</p>
                      <div className="flex items-center justify-between">
                        <p className="text-3xl font-black tracking-tight">222 111</p>
                        <Button size="icon" variant="ghost" className="text-white hover:bg-white/20" onClick={() => copyToClipboard("222111", "Paybill Number")}>
                          <Copy className="h-5 w-5" />
                        </Button>
                      </div>
                    </div>
                    <div className="bg-white/10 p-6 rounded-2xl relative group">
                      <p className="text-[10px] font-black text-white/50 uppercase tracking-widest mb-2">Account No</p>
                      <div className="flex items-center justify-between">
                        <p className="text-3xl font-black tracking-tight">172 754</p>
                        <Button size="icon" variant="ghost" className="text-white hover:bg-white/20" onClick={() => copyToClipboard("172754", "Account Number")}>
                          <Copy className="h-5 w-5" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/10 p-4 rounded-2xl flex items-center gap-4">
                    <UserCheck className="h-6 w-6 text-secondary" />
                    <div className="space-y-0.5">
                      <p className="text-[9px] font-black text-white/50 uppercase tracking-widest">Business Name</p>
                      <p className="text-sm font-black uppercase">VINCENT KITONGA</p>
                    </div>
                  </div>
                </div>
                <div className="p-4 text-center bg-primary/20 backdrop-blur-sm">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-secondary">East Africa Logistics Group</p>
                </div>
              </div>

              <div className="bg-card border-2 rounded-2xl p-6 space-y-6 shadow-sm">
                <div className="space-y-2">
                  <h4 className="font-black text-xs uppercase tracking-widest flex items-center gap-2">
                    <Info className="h-4 w-4 text-secondary" /> Next Steps
                  </h4>
                  <p className="text-[11px] font-medium leading-relaxed text-muted-foreground">
                    1. Copy the payment details above and pay via M-Pesa.<br/>
                    2. Accept the terms below to enable the WhatsApp button.<br/>
                    3. Share your <strong>Payment Confirmation</strong> message in the WhatsApp chat to initiate regional shipping.
                  </p>
                </div>
                
                <div 
                  className={`flex items-start space-x-3 p-4 rounded-xl border-2 transition-all cursor-pointer ${acceptedTerms ? "border-secondary bg-secondary/5" : "border-muted bg-muted/10 hover:border-muted-foreground/30"}`}
                  onClick={() => setAcceptedTerms(!acceptedTerms)}
                >
                  <div className="pt-0.5">
                    <Checkbox 
                      id="terms" 
                      checked={acceptedTerms} 
                      onCheckedChange={(v) => setAcceptedTerms(!!v)}
                      className="h-5 w-5 rounded-full border-2"
                    />
                  </div>
                  <Label htmlFor="terms" className="text-[11px] font-black leading-tight cursor-pointer uppercase tracking-tight select-none">
                    I AGREE TO SHARE MY PAYMENT CONFIRMATION VIA WHATSAPP TO FINALIZE THE ORDER.
                  </Label>
                </div>
              </div>
              <OrderSummary />
              <NavigationButtons />
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}