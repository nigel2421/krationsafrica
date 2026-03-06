
"use client";

import Link from "next/link";
import { ShoppingBag, Menu, Heart, Sun, Moon, LayoutDashboard } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { useWishlist } from "@/hooks/use-wishlist";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetHeader, SheetDescription } from "@/components/ui/sheet";
import { CartSidebar } from "@/components/cart-sidebar";
import { WishlistSidebar } from "@/components/wishlist-sidebar";
import { useState, useEffect } from "react";
import { useUser } from "@/firebase";

export function Navbar() {
  const { totalItems } = useCart();
  const { totalWishlistItems } = useWishlist();
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const { user } = useUser();

  useEffect(() => {
    if (document.documentElement.classList.contains("dark")) {
      setTheme("dark");
    }
  }, []);

  const toggleTheme = () => {
    if (theme === "light") {
      document.documentElement.classList.add("dark");
      localStorage.theme = "dark";
      setTheme("dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.theme = "light";
      setTheme("light");
    }
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-8">
          <Link href="/" className="text-2xl font-black tracking-tighter text-primary">
            KREATIONS <span className="text-secondary">254</span>
          </Link>
          <div className="hidden md:flex gap-6 text-[10px] font-black uppercase tracking-[0.2em]">
            <Link href="/" className="transition-colors hover:text-secondary">Home</Link>
            <Link href="/shop" className="transition-colors hover:text-secondary">All Kicks</Link>
            <Link href="/#categories" className="transition-colors hover:text-secondary">Categories</Link>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={toggleTheme}>
            {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
          </Button>

          {/* Wishlist Trigger */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Heart className="h-5 w-5" />
                {totalWishlistItems > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[8px] font-black text-white shadow-sm">
                    {totalWishlistItems}
                  </span>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent className="w-full sm:max-w-md p-0 flex flex-col">
              <SheetHeader className="px-6 py-4 border-b">
                <SheetTitle className="font-black uppercase tracking-tighter text-2xl">Your Wishlist</SheetTitle>
                <SheetDescription className="font-medium">
                  Pairs that look good on you. Move them to cart when ready.
                </SheetDescription>
              </SheetHeader>
              <div className="flex-1 overflow-hidden">
                <WishlistSidebar />
              </div>
            </SheetContent>
          </Sheet>
          
          {/* Cart Trigger */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="relative border-2">
                <ShoppingBag className="h-5 w-5" />
                {totalItems > 0 && (
                  <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-secondary text-[10px] font-black text-secondary-foreground shadow-sm">
                    {totalItems}
                  </span>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent className="w-full sm:max-w-md p-0 flex flex-col">
              <SheetHeader className="px-6 py-4 border-b">
                <SheetTitle className="font-black uppercase tracking-tighter text-2xl">Shopping Cart</SheetTitle>
                <SheetDescription className="font-medium">
                  Review your selection before WhatsApp checkout.
                </SheetDescription>
              </SheetHeader>
              <div className="flex-1 overflow-hidden">
                <CartSidebar />
              </div>
            </SheetContent>
          </Sheet>

          {user && (
            <Link href="/admin/dashboard">
              <Button variant="ghost" size="icon">
                <LayoutDashboard className="h-5 w-5" />
              </Button>
            </Link>
          )}

          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </nav>
  );
}
