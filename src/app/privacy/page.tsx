
"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Lock, Shield, EyeOff } from "lucide-react";
import Link from "next/link";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-background py-20">
      <div className="container mx-auto px-4 max-w-3xl">
        <Button asChild variant="ghost" className="mb-8 font-bold gap-2">
          <Link href="/"><ArrowLeft className="h-4 w-4" /> Back to Home</Link>
        </Button>
        
        <h1 className="text-5xl font-black text-primary uppercase tracking-tighter mb-12">Privacy Policy</h1>
        
        <div className="space-y-12 font-medium text-muted-foreground">
          <div className="grid gap-6 md:grid-cols-3">
            <div className="p-6 border-2 rounded-2xl text-center space-y-4">
              <Lock className="h-8 w-8 mx-auto text-secondary" />
              <p className="text-xs font-black uppercase">Secure Data</p>
            </div>
            <div className="p-6 border-2 rounded-2xl text-center space-y-4">
              <Shield className="h-8 w-8 mx-auto text-secondary" />
              <p className="text-xs font-black uppercase">Encrypted Payments</p>
            </div>
            <div className="p-6 border-2 rounded-2xl text-center space-y-4">
              <EyeOff className="h-8 w-8 mx-auto text-secondary" />
              <p className="text-xs font-black uppercase">No Data Sharing</p>
            </div>
          </div>

          <section className="space-y-4">
            <h2 className="text-xl font-black text-primary uppercase">Information We Collect</h2>
            <p>We collect information you provide directly to us when placing an order, including your name, phone number, and delivery address. This information is primarily used to process your order and facilitate delivery via our WhatsApp channel.</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-black text-primary uppercase">How We Use Your Data</h2>
            <p>Your data is used strictly for order fulfillment and support. We do not sell, rent, or trade your personal information with third parties for marketing purposes.</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-black text-primary uppercase">Cookies</h2>
            <p>Our website uses small cookies to remember your shopping cart items and your theme preference (Dark/Light mode) to provide a better browsing experience.</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-black text-primary uppercase">Contact Us</h2>
            <p>If you have any questions regarding your privacy, please reach out to us at privacy@kreations254.com.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
