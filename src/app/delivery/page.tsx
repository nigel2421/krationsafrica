
"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Truck, MapPin, Clock, ShieldCheck } from "lucide-react";
import Link from "next/link";

export default function DeliveryInfo() {
  const regions = [
    { name: "Nairobi & Environs", time: "Within 24 Hours", price: "KES 300 - 500" },
    { name: "Major Towns (Mombasa, Kisumu, Nakuru)", time: "24-48 Hours", price: "KES 500 - 700" },
    { name: "Upcountry Locations", time: "48-72 Hours", price: "KES 700+" }
  ];

  return (
    <div className="min-h-screen bg-background py-20">
      <div className="container mx-auto px-4 max-w-4xl">
        <Button asChild variant="ghost" className="mb-8 font-bold gap-2">
          <Link href="/"><ArrowLeft className="h-4 w-4" /> Back to Home</Link>
        </Button>
        
        <div className="flex flex-col md:flex-row gap-12 items-start">
          <div className="flex-1 space-y-8">
            <h1 className="text-5xl font-black text-primary uppercase tracking-tighter">Delivery Info</h1>
            <p className="text-muted-foreground text-lg font-medium leading-relaxed">
              We understand that when you find the perfect pair, you want them fast. Kreations Kicks provides swift and secure delivery across Kenya.
            </p>

            <div className="grid gap-6">
              {regions.map((region, i) => (
                <div key={i} className="p-6 bg-white border-2 rounded-xl flex items-center justify-between shadow-sm">
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
                <p className="text-sm font-bold">Real-time tracking available via WhatsApp.</p>
              </div>
              <div className="flex gap-4">
                <ShieldCheck className="h-6 w-6 text-secondary shrink-0" />
                <p className="text-sm font-bold">All packages are sanitized and handled with care.</p>
              </div>
              <div className="flex gap-4">
                <MapPin className="h-6 w-6 text-secondary shrink-0" />
                <p className="text-sm font-bold">Pick-up points available in Nairobi CBD.</p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
