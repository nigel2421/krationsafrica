
"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-background py-20">
      <div className="container mx-auto px-4 max-w-3xl">
        <Button asChild variant="ghost" className="mb-8 font-bold gap-2">
          <Link href="/"><ArrowLeft className="h-4 w-4" /> Back to Home</Link>
        </Button>
        
        <h1 className="text-5xl font-black text-primary uppercase tracking-tighter mb-12">Terms of Service</h1>
        
        <div className="prose prose-slate max-w-none space-y-8 font-medium text-muted-foreground">
          <section className="space-y-4">
            <h2 className="text-xl font-black text-primary uppercase">1. Acceptance of Terms</h2>
            <p>By accessing and using the Kreations Kicks website, you agree to comply with and be bound by these Terms of Service. If you do not agree to these terms, please refrain from using our services.</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-black text-primary uppercase">2. Order Confirmation</h2>
            <p>Orders placed on our website are finalized through WhatsApp. An order is only considered "confirmed" once our team has verified stock availability and discussed delivery details with you directly via our official WhatsApp channel.</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-black text-primary uppercase">3. Pricing and Payment</h2>
            <p>All prices listed on the website are in Kenyan Shillings (KES). While we strive for accuracy, we reserve the right to correct pricing errors. Payment is handled securely through discussed channels, typically M-Pesa.</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-black text-primary uppercase">4. Intellectual Property</h2>
            <p>The content, design, and logo of Kreations Kicks are our intellectual property. Brand names and logos of the footwear we sell belong to their respective trademark holders.</p>
          </section>

          <p className="text-xs pt-12 italic border-t">Last Updated: March 2024</p>
        </div>
      </div>
    </div>
  );
}
