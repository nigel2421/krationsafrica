"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Truck, MapPin, Clock, ShieldCheck, Globe } from "lucide-react";
import Link from "next/link";

export default function DeliveryInfo() {
  const regions = [
    { name: "Nairobi & Environs (KE)", time: "Within 24 Hours", price: "KES 300" },
    { name: "Major Towns (Kenya)", time: "24-48 Hours", price: "KES 600 - 800" },
    { name: "Uganda (Kampala Hub)", time: "2-3 Business Days", price: "KES 1,500" },
    { name: "Tanzania (Dar/Arusha)", time: "3-4 Business Days", price: "KES 1,500 - 1,800" },
    { name: "Rwanda (Kigali Hub)", time: "3-5 Business Days", price: "KES 2,000" },
    { name: "South Sudan (Juba Hub)", time: "4-6 Business Days", price: "KES 3,500" },
    { name: "DR Congo (Eastern Hubs)", time: "5-7 Business Days", price: "KES 3,000" },
    { name: "Burundi (Bujumbura)", time: "4-6 Business Days", price: "KES 2,500" }
  ];

  return (
    <div className="min-h-screen bg-background py-20">
      <div className="container mx-auto px-4 max-w-4xl">
        <Button asChild variant="ghost" className="mb-8 font-bold gap-2">
          <Link href="/"><ArrowLeft className="h-4 w-4" /> Back to Home</Link>
        </Button>
        
        <div className="flex flex-col md:flex-row gap-12 items-start">
          <div className="flex-1 space-y-8">
            <div className="flex items-center gap-4">
              <h1 className="text-5xl font-black text-primary uppercase tracking-tighter">Regional Delivery</h1>
              <Globe className="h-10 w-10 text-secondary animate-pulse" />
            </div>
            <p className="text-muted-foreground text-lg font-medium leading-relaxed">
              Kreations Kicks is now East Africa's premier footwear destination. We've optimized our logistics to deliver your favorite pairs across 7 countries with speed and security.
            </p>

            <div className="grid gap-4">
              {regions.map((region, i) => (
                <div key={i} className="p-6 bg-white border-2 rounded-xl flex items-center justify-between shadow-sm hover:border-secondary transition-colors">
                  <div>
                    <h3 className="font-black uppercase text-sm mb-1">{region.name}</h3>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" /> {region.time}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-black text-secondary">{region.price}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <aside className="w-full md:w-80 space-y-6">
            <div className="bg-primary text-white p-8 rounded-2xl space-y-6">
              <div className="flex gap-4">
                <Truck className="h-6 w-6 text-secondary shrink-0" />
                <p className="text-sm font-bold">Real-time tracking for all East African routes via WhatsApp.</p>
              </div>
              <div className="flex gap-4">
                <ShieldCheck className="h-6 w-6 text-secondary shrink-0" />
                <p className="text-sm font-bold">Secure cross-border logistics handled by expert partners.</p>
              </div>
              <div className="flex items-start gap-4">
                <MapPin className="h-6 w-6 text-secondary shrink-0 mt-1" />
                <div>
                   <p className="text-sm font-bold">HQ & Nairobi Store:</p>
                   <p className="text-[10px] font-medium text-white/70">Royal Palms Mall, Shop BF01, Ronald Ngala Street, Nairobi CBD, Kenya.</p>
                </div>
              </div>
            </div>
            <div className="p-6 bg-secondary/10 border-2 border-secondary/20 rounded-xl text-center">
              <p className="text-[10px] font-black uppercase text-secondary mb-2">East African Promise</p>
              <p className="text-xs font-bold leading-relaxed">"It will always look good on you, from Kampala to Kinshasa."</p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}