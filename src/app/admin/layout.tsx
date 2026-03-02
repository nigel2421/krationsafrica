
"use client";

import React, { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useUser } from "@/firebase";
import { 
  LayoutDashboard, 
  Package, 
  ShoppingBag, 
  Layers, 
  LogOut, 
  Loader2, 
  ShieldCheck,
  Menu,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useAuth } from "@/firebase";
import { signOut } from "firebase/auth";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileNavOpen, setIsMobileNavOpen] = React.useState(false);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push("/admin/login");
    }
  }, [user, isUserLoading, router]);

  const navItems = [
    { label: "Overview", href: "/admin/dashboard", icon: LayoutDashboard },
    { label: "Inventory", href: "/admin/products", icon: Package },
    { label: "Orders", href: "/admin/orders", icon: ShoppingBag },
    { label: "Categories", href: "/admin/categories", icon: Layers },
  ];

  if (isUserLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-secondary" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex min-h-screen bg-muted/20">
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex w-64 flex-col bg-primary text-white sticky top-0 h-screen">
        <div className="p-6 h-20 flex items-center gap-2 border-b border-white/10">
          <ShieldCheck className="h-8 w-8 text-secondary" />
          <h1 className="text-xl font-black uppercase tracking-tighter">Admin CMS</h1>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 mt-4">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Button
                key={item.href}
                variant="ghost"
                asChild
                className={cn(
                  "w-full justify-start font-bold uppercase text-xs tracking-widest h-12 gap-3 transition-all",
                  isActive ? "bg-white/10 text-secondary border-r-4 border-secondary" : "text-white/70 hover:bg-white/5 hover:text-white"
                )}
              >
                <Link href={item.href}>
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </Link>
              </Button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10">
          <Button 
            variant="ghost" 
            className="w-full justify-start text-white/50 hover:text-white gap-3"
            onClick={() => signOut(auth)}
          >
            <LogOut className="h-5 w-5" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Mobile Nav Toggle */}
      <div className="md:hidden fixed top-4 right-4 z-50">
        <Button size="icon" className="rounded-full shadow-xl" onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}>
          {isMobileNavOpen ? <X /> : <Menu />}
        </Button>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-20 bg-white border-b flex items-center px-8 justify-between shrink-0">
          <div className="flex items-center gap-2">
             <h2 className="text-sm font-black uppercase tracking-widest text-muted-foreground">
               {navItems.find(i => i.href === pathname)?.label || "Admin Console"}
             </h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-black uppercase">{user.displayName || "Admin User"}</p>
              <p className="text-[10px] text-muted-foreground font-mono">{user.email}</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-muted border overflow-hidden">
               <img src={user.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${user.email}`} alt="Avatar" className="w-full h-full object-cover" />
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-4 md:p-8">
          {children}
        </div>
      </main>

      {/* Mobile Nav Overlay */}
      {isMobileNavOpen && (
        <div className="fixed inset-0 z-40 bg-primary/95 flex flex-col p-10 md:hidden animate-in fade-in zoom-in-95">
          <div className="flex-1 space-y-6 mt-12">
            {navItems.map((item) => (
              <Link 
                key={item.href} 
                href={item.href} 
                onClick={() => setIsMobileNavOpen(false)}
                className="flex items-center gap-4 text-white text-2xl font-black uppercase tracking-tighter hover:text-secondary"
              >
                <item.icon className="h-8 w-8" />
                {item.label}
              </Link>
            ))}
          </div>
          <Button variant="outline" className="text-white border-white mt-auto h-16 text-xl font-bold" onClick={() => signOut(auth)}>
             LOGOUT
          </Button>
        </div>
      )}
    </div>
  );
}
