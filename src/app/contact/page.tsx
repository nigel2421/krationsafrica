
"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Mail, Phone, MapPin, Instagram, MessageCircle } from "lucide-react";
import Link from "next/link";

export default function ContactUs() {
  return (
    <div className="min-h-screen bg-background py-20">
      <div className="container mx-auto px-4 max-w-5xl">
        <Button asChild variant="ghost" className="mb-8 font-bold gap-2">
          <Link href="/"><ArrowLeft className="h-4 w-4" /> Back to Home</Link>
        </Button>
        
        <div className="grid lg:grid-cols-2 gap-20">
          <div className="space-y-8">
            <h1 className="text-6xl font-black text-primary uppercase tracking-tighter">Get In Touch</h1>
            <p className="text-muted-foreground text-xl font-medium leading-relaxed">
              Have a question about a specific pair? Need help with an order? We're here to help you step up your game.
            </p>

            <div className="space-y-6">
              <div className="flex gap-4 items-center p-4 border-2 rounded-xl bg-white">
                <div className="bg-secondary/10 p-3 rounded-lg">
                  <Phone className="h-6 w-6 text-secondary" />
                </div>
                <div>
                  <p className="text-xs font-black text-muted-foreground uppercase tracking-widest">Call / WhatsApp</p>
                  <p className="font-black text-black">+254 719 112025</p>
                </div>
              </div>
              <div className="flex gap-4 items-center p-4 border-2 rounded-xl bg-white">
                <div className="bg-secondary/10 p-3 rounded-lg">
                  <Mail className="h-6 w-6 text-secondary" />
                </div>
                <div>
                  <p className="text-xs font-black text-muted-foreground uppercase tracking-widest">Email Us</p>
                  <p className="font-black text-black">hello@kreations254.com</p>
                </div>
              </div>
              <div className="flex gap-4 items-center p-4 border-2 rounded-xl bg-white">
                <div className="bg-secondary/10 p-3 rounded-lg">
                  <Instagram className="h-6 w-6 text-secondary" />
                </div>
                <div>
                  <p className="text-xs font-black text-muted-foreground uppercase tracking-widest">Follow Us</p>
                  <p className="font-black text-black">@kreations.254</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-primary text-white p-10 rounded-3xl space-y-8 relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 p-10 opacity-10">
              <MessageCircle className="h-40 w-40" />
            </div>
            <h2 className="text-3xl font-black uppercase tracking-tight">Direct Ordering</h2>
            <p className="text-white/70 font-medium leading-relaxed">
              The fastest way to get your kicks is through our automated WhatsApp checkout. Simply add items to your cart and hit the WhatsApp button!
            </p>
            <div className="space-y-4">
              <h3 className="font-black uppercase text-sm text-secondary tracking-widest">Store Hours</h3>
              <div className="space-y-2 text-sm font-bold">
                <div className="flex justify-between">
                  <span>Monday - Friday</span>
                  <span>9:00 AM - 7:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span>Saturday</span>
                  <span>10:00 AM - 6:00 PM</span>
                </div>
                <div className="flex justify-between text-white/50">
                  <span>Sunday</span>
                  <span>Closed (Online Only)</span>
                </div>
              </div>
            </div>
            <Button asChild className="w-full h-14 bg-secondary text-primary font-black uppercase text-lg hover:bg-white transition-colors">
              <a href="https://wa.me/254719112025" target="_blank" rel="noopener noreferrer">
                Message Support Now
              </a>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
