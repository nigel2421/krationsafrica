"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingBag, Menu, Heart, Sun, Moon, LayoutDashboard, Search } from "lucide-react";
import { SearchBar } from "@/components/search-bar";
import { useCart } from "@/hooks/use-cart";
import { useWishlist } from "@/hooks/use-wishlist";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetHeader, SheetDescription } from "@/components/ui/sheet";
import { CartSidebar } from "@/components/cart-sidebar";
import { WishlistSidebar } from "@/components/wishlist-sidebar";
import { useState, useEffect } from "react";
import { useUser } from "@/firebase";

export function Navbar() {
  // CRITICAL: Call all hooks at the top level to follow Rules of Hooks
  const { totalItems } = useCart();
  const { totalWishlistItems } = useWishlist();
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const { user } = useUser();
  const pathname = usePathname();

  useEffect(() => {
    // Only run on client
    if (typeof window !== 'undefined') {
      if (document.documentElement.classList.contains("dark")) {
        setTheme("dark");
      }
    }
  }, []);

  // Hide Navbar completely on admin routes - Called AFTER all hooks
  if (pathname.startsWith("/admin")) return null;

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

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "All Kicks", href: "/shop" },
    { label: "Collections", href: "/#categories" },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-8 flex-1">
          <Link href="/" className="text-2xl font-black tracking-tighter text-primary dark:text-foreground shrink-0">
            KREATIONS <span className="text-secondary">254</span>
          </Link>
          <div className="hidden md:flex gap-6 text-[10px] font-black uppercase tracking-[0.2em] items-center">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} className="transition-colors hover:text-secondary whitespace-nowrap">
                {link.label}
              </Link>
            ))}
          </div>
          <div className="hidden lg:flex flex-1 justify-center max-w-md mx-auto">
            <SearchBar />
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
                <SheetDescription className="font-medium text-xs">
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
                <SheetDescription className="font-medium text-xs">
                  Review your selection before WhatsApp checkout.
                </SheetDescription>
              </SheetHeader>
              <div className="flex-1 overflow-hidden">
                <CartSidebar />
              </div>
            </SheetContent>
          </Sheet>

          {user && (
            <Link href="/admin/dashboard" className="hidden md:block">
              <Button variant="ghost" size="icon">
                <LayoutDashboard className="h-5 w-5" />
              </Button>
            </Link>
          )}

          {/* Mobile Menu (Hamburger) */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] p-0 flex flex-col">
              <SheetHeader className="px-6 py-10 border-b text-left">
                <SheetTitle className="text-2xl font-black tracking-tighter uppercase text-primary dark:text-foreground">
                  KREATIONS <span className="text-secondary">254</span>
                </SheetTitle>
                <SheetDescription className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  Always Look Good On You
                </SheetDescription>
              </SheetHeader>
              <div className="px-6 py-4 border-b">
                <SearchBar className="max-w-none" />
              </div>
              <div className="flex-1 px-6 py-8 space-y-2 overflow-y-auto">
                {navLinks.map((link) => (
                  <Link 
                    key={link.href} 
                    href={link.href} 
                    className="block text-xl font-black uppercase tracking-tighter py-4 border-b border-muted/50 hover:text-secondary transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
                {user && (
                  <Link 
                    href="/admin/dashboard" 
                    className="flex items-center gap-3 text-xl font-black uppercase tracking-tighter py-4 border-b border-muted/50 text-secondary"
                  >
                    <LayoutDashboard className="h-6 w-6" /> Admin Console
                  </Link>
                )}
                <div className="pt-8 space-y-4">
                  <Link href="/help" className="block text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground hover:text-primary transition-colors">Help Center</Link>
                  <Link href="/contact" className="block text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground hover:text-primary transition-colors">Contact Support</Link>
                </div>
              </div>
              <div className="p-6 border-t bg-muted/20">
                <p className="text-[8px] font-black uppercase tracking-[0.4em] text-center text-muted-foreground/60">
                  NAIROBI KENYA • EST. 2026
                </p>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}