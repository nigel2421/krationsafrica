"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 text-center bg-background text-foreground">
      <div className="space-y-6 max-w-md">
        <h2 className="text-7xl md:text-9xl font-black uppercase tracking-tighter leading-none text-primary dark:text-foreground">
          404
        </h2>
        <div className="space-y-2">
          <p className="text-xl font-black uppercase tracking-tight">PAGE NOT FOUND</p>
          <p className="text-muted-foreground font-medium">
            It seems this pair is out of stock or never existed in our collection.
          </p>
        </div>
        <Button asChild className="w-full h-16 text-lg font-black uppercase tracking-widest bg-secondary text-secondary-foreground hover:bg-primary hover:text-white transition-all rounded-none border-b-4 border-secondary/50">
          <Link href="/">
            <ArrowLeft className="mr-3 h-6 w-6" /> Back to Shop
          </Link>
        </Button>
      </div>
      <div className="mt-20 opacity-10 select-none">
        <p className="text-[10px] font-black uppercase tracking-[0.5em]">IT WILL ALWAYS LOOK GOOD ON YOU</p>
      </div>
    </div>
  );
}