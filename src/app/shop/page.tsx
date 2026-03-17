
"use client";

import React, { useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy, where, limit } from "firebase/firestore";
import { ProductCard } from "@/components/product-card";
import { Loader2, SlidersHorizontal, ShoppingBag, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";

const CATEGORIES = ["Sneakers", "Boots", "Casual", "Official"];

function ShopContent() {
  const searchParams = useSearchParams();
  const db = useFirestore();
  
  const categoryFilter = searchParams.get("category");
  const genderFilter = searchParams.get("gender");
  const searchFilter = searchParams.get("search");

  const productsQuery = useMemoFirebase(() => {
    if (!db) return null;
    
    let q = query(collection(db, "products"), orderBy("createdAt", "desc"));
    
    if (searchFilter) {
      // Basic Firestore search logic: prefix match
      const searchStr = searchFilter.charAt(0).toUpperCase() + searchFilter.slice(1);
      q = query(
        collection(db, "products"), 
        where("name", ">=", searchStr),
        where("name", "<=", searchStr + "\uf8ff"),
        limit(50)
      );
    } else if (categoryFilter) {
      const capitalized = categoryFilter.charAt(0).toUpperCase() + categoryFilter.slice(1);
      q = query(collection(db, "products"), where("category", "==", capitalized), orderBy("createdAt", "desc"));
    }
    
    return q;
  }, [db, categoryFilter, searchFilter]);

  const { data: products, isLoading } = useCollection(productsQuery);

  const filteredProducts = useMemo(() => {
    if (!products) return null;
    if (genderFilter) {
      return products.filter(p => p.gender === genderFilter);
    }
    return products;
  }, [products, genderFilter]);

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-primary py-16 mb-12">
        <div className="container mx-auto px-4">
          <Button asChild variant="link" className="text-primary-foreground/50 p-0 mb-4 hover:text-secondary h-auto">
            <Link href="/"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Home</Link>
          </Button>
          <h1 className="text-6xl font-black text-primary-foreground uppercase tracking-tighter mb-4">
            {searchFilter ? `Search: ${searchFilter}` : (categoryFilter || "All Collection")}
          </h1>
          <div className="flex gap-2">
            <Badge variant="secondary" className="px-4 py-1 font-bold uppercase tracking-widest bg-secondary text-secondary-foreground">
              {filteredProducts?.length || 0} {searchFilter ? 'Matches' : 'Styles'} Found
            </Badge>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Filters Sidebar */}
          <aside className="w-full lg:w-64 space-y-10">
            <div>
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-6 flex items-center gap-2">
                <SlidersHorizontal className="h-3 w-3" /> Filter by Category
              </h3>
              <div className="flex flex-wrap lg:flex-col gap-1">
                <Button 
                  asChild 
                  variant={!categoryFilter ? "secondary" : "ghost"} 
                  className="justify-start font-black text-sm uppercase h-11"
                >
                  <Link href="/shop">All Styles</Link>
                </Button>
                {CATEGORIES.map(cat => (
                  <Button 
                    key={cat}
                    asChild 
                    variant={categoryFilter?.toLowerCase() === cat.toLowerCase() ? "secondary" : "ghost"} 
                    className="justify-start font-black text-sm uppercase h-11"
                  >
                    <Link href={`/shop?category=${cat.toLowerCase()}`}>{cat}</Link>
                  </Button>
                ))}
              </div>
            </div>

            <Separator className="bg-muted/50" />

            <div>
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-6">Gender / Department</h3>
              <div className="flex flex-wrap lg:flex-col gap-1">
                {["Men", "Women", "Unisex", "Kids"].map(gender => (
                  <Button 
                    key={gender}
                    asChild 
                    variant={genderFilter === gender ? "secondary" : "ghost"} 
                    className="justify-start font-black text-sm uppercase h-11"
                  >
                    <Link href={`/shop?${categoryFilter ? `category=${categoryFilter}&` : ''}gender=${gender}`}>{gender}</Link>
                  </Button>
                ))}
              </div>
            </div>
          </aside>

          {/* Product Grid */}
          <div className="flex-1">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} className="aspect-[3/4] bg-muted animate-pulse rounded-2xl" />
                ))}
              </div>
            ) : filteredProducts?.length === 0 ? (
              <div className="text-center py-32 bg-muted/10 border-2 border-dashed rounded-3xl">
                <div className="bg-muted w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <ShoppingBag className="h-10 w-10 text-muted-foreground" />
                </div>
                <h3 className="text-2xl font-black uppercase tracking-tighter mb-2">No items found</h3>
                <p className="text-muted-foreground font-medium mb-8 max-w-xs mx-auto">We couldn't find any products matching your current filters.</p>
                <Button asChild variant="outline" className="font-bold border-2 h-12 px-8">
                  <Link href="/shop">Clear All Filters</Link>
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {filteredProducts?.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-secondary" />
      </div>
    }>
      <ShopContent />
    </Suspense>
  );
}
