
"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, RefreshCcw, CheckCircle2, AlertTriangle } from "lucide-react";
import Link from "next/link";

export default function ReturnsRefunds() {
  return (
    <div className="min-h-screen bg-background py-20">
      <div className="container mx-auto px-4 max-w-3xl">
        <Button asChild variant="ghost" className="mb-8 font-bold gap-2">
          <Link href="/"><ArrowLeft className="h-4 w-4" /> Back to Home</Link>
        </Button>
        
        <h1 className="text-5xl font-black text-primary uppercase tracking-tighter mb-8">Returns & Refunds</h1>
        
        <div className="space-y-12">
          <section className="space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <RefreshCcw className="h-8 w-8 text-secondary" />
              <h2 className="text-2xl font-black uppercase tracking-tight">Return Policy</h2>
            </div>
            <p className="text-muted-foreground font-medium leading-relaxed">
              We want you to be completely satisfied with your purchase. If the shoes don't fit or aren't what you expected, you can initiate a return within <strong>48 hours</strong> of delivery.
            </p>
          </section>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="p-8 border-2 rounded-2xl space-y-4 bg-white shadow-sm">
              <h3 className="font-black uppercase text-sm flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" /> Eligible Returns
              </h3>
              <ul className="text-sm text-muted-foreground space-y-3 font-medium">
                <li>• Shoes in original, unworn condition.</li>
                <li>• Original packaging must be intact.</li>
                <li>• All tags must still be attached.</li>
                <li>• Proof of purchase required.</li>
              </ul>
            </div>
            <div className="p-8 border-2 rounded-2xl space-y-4 bg-white shadow-sm">
              <h3 className="font-black uppercase text-sm flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-secondary" /> Non-Returnable
              </h3>
              <ul className="text-sm text-muted-foreground space-y-3 font-medium">
                <li>• Items worn outside.</li>
                <li>• Shoes with visible scuffs or dirt.</li>
                <li>• Sale/Clearance items.</li>
                <li>• Returns requested after 48 hours.</li>
              </ul>
            </div>
          </div>

          <section className="bg-muted/30 p-8 rounded-2xl border-2 border-dashed">
            <h2 className="text-xl font-black uppercase mb-4">Refund Process</h2>
            <p className="text-sm text-muted-foreground font-medium leading-relaxed">
              Once we receive and inspect your return, we will notify you of the approval or rejection of your refund. Approved refunds are processed via M-Pesa or Bank Transfer within 3-5 business days. Please note that original delivery fees are non-refundable.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
