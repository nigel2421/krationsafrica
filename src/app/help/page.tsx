
"use client";

import React from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MessageCircle } from "lucide-react";
import Link from "next/link";

export default function HelpCenter() {
  const faqs = [
    {
      question: "How do I place an order?",
      answer: "Browse our collection, add your favorite items to the cart, and proceed to checkout. You'll be asked for delivery details, and then you can send the pre-filled message to us via WhatsApp to confirm your order."
    },
    {
      question: "What are your delivery options?",
      answer: "We offer express delivery across Kenya. Within Nairobi, we typically deliver within 24 hours. Nationwide delivery takes 24-48 hours depending on your specific location."
    },
    {
      question: "Can I pay on delivery?",
      answer: "We accept various payment methods including M-Pesa. Specific payment terms for your order will be discussed during the WhatsApp confirmation process."
    },
    {
      question: "How do I know my shoe size?",
      answer: "We use standard EU shoe sizing. If you're unsure, we recommend measuring your foot in centimeters and referring to our size guide or asking us directly via WhatsApp for assistance."
    }
  ];

  return (
    <div className="min-h-screen bg-background py-20">
      <div className="container mx-auto px-4 max-w-3xl">
        <Button asChild variant="ghost" className="mb-8 font-bold gap-2">
          <Link href="/"><ArrowLeft className="h-4 w-4" /> Back to Home</Link>
        </Button>
        
        <h1 className="text-5xl font-black text-primary uppercase tracking-tighter mb-4">Help Center</h1>
        <p className="text-muted-foreground text-lg mb-12 font-medium">Find answers to common questions about shopping with Kreations Kicks.</p>

        <Accordion type="single" collapsible className="w-full space-y-4">
          {faqs.map((faq, i) => (
            <AccordionItem key={i} value={`item-${i}`} className="border-2 rounded-xl px-6 bg-card shadow-sm">
              <AccordionTrigger className="text-left font-black uppercase text-sm hover:no-underline py-6 text-foreground">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground pb-6 font-medium leading-relaxed">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <div className="mt-16 p-8 bg-secondary/10 rounded-2xl border-2 border-secondary/20 text-center">
          <h3 className="text-xl font-black uppercase mb-2 text-foreground">Still have questions?</h3>
          <p className="text-muted-foreground mb-6 font-medium">Our team is available to help you personally via WhatsApp.</p>
          <Button asChild className="bg-[#25D366] hover:bg-[#128C7E] text-white font-black uppercase px-8 h-12">
            <a href="https://wa.me/254719112025" target="_blank" rel="noopener noreferrer">
              <MessageCircle className="mr-2 h-5 w-5" /> Chat with us
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}
