
"use client";

import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useUser, useFirestore, useAuth } from "@/firebase";
import { 
  LayoutDashboard, 
  Package, 
  ShoppingBag, 
  Layers, 
  LogOut, 
  Loader2, 
  ShieldCheck,
  Menu,
  X,
  Users,
  Wifi,
  WifiOff,
  Search,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { signOut } from "firebase/auth";
import { onSnapshotsInSync } from "firebase/firestore";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const db = useFirestore();
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isOnline, setIsOnline] = useState(true);

  const isLoginPage = pathname === "/admin/login";

  useEffect(() => {
    // Only redirect if we are NOT on the login page and not loading
    if (!isUserLoading && !user && !isLoginPage) {
      router.push("/admin/login");
    }
  }, [user, isUserLoading, router, isLoginPage]);

  useEffect(() => {
    if (!db) return;
    const unsubscribe = onSnapshotsInSync(db, () => {
      setIsOnline(true);
    });
    
    const handleOffline = () => setIsOnline(false);
    const handleOnline = () => setIsOnline(true);
    
    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);
    
    return () => {
      unsubscribe();
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, [db]);

  const navItems = [
    { label: "Overview", href: "/admin/dashboard", icon: LayoutDashboard },
    { label: "Inventory", href: "/admin/products", icon: Package },
    { label: "Orders", href: "/admin/orders", icon: ShoppingBag },
    { label: "Categories", href: "/admin/categories", icon: Layers },
    { label: "Customers", href: "/admin/customers", icon: Users },
  ];

  // If loading, show the spinner
  if (isUserLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-secondary mx-auto" />
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Authenticating Session...</p>
        </div>
      </div>
    );
  }

  // If not logged in and not on login page, we are redirecting, so show nothing
  if (!user && !isLoginPage) return null;

  // If we are on the login page, just render the login content without the admin shell
  if (isLoginPage) return <>{children}</>;

  return (
    <div className="flex min-h-screen bg-muted/10">
      {/* Sidebar Desktop */}
      <aside className={cn(
        "hidden lg:flex flex-col bg-primary text-white sticky top-0 h-screen shadow-2xl z-30 transition-all duration-300",
        isSidebarCollapsed ? "w-24" : "w-72"
      )}>
        <div className="p-6 h-24 flex items-center justify-between border-b border-white/5">
          {!isSidebarCollapsed && (
            <div className="flex items-center gap-3">
              <div className="bg-secondary p-2 rounded-xl">
                <ShieldCheck className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-black uppercase tracking-tighter leading-none">Admin CMS</h1>
                <p className="text-[8px] font-black uppercase tracking-[0.2em] text-secondary mt-1">Kreations 254</p>
              </div>
            </div>
          )}
          {isSidebarCollapsed && (
            <ShieldCheck className="h-8 w-8 text-secondary mx-auto" />
          )}
        </div>
        
        <nav className="flex-1 p-4 space-y-1 mt-4">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Button
                key={item.href}
                variant="ghost"
                asChild
                className={cn(
                  "w-full justify-start font-black uppercase text-[11px] tracking-widest h-14 gap-4 transition-all rounded-xl",
                  isActive 
                    ? "bg-white/10 text-secondary border-l-4 border-secondary pl-6" 
                    : "text-white/60 hover:bg-white/5 hover:text-white pl-6"
                )}
              >
                <Link href={item.href}>
                  <item.icon className={cn("h-5 w-5 shrink-0", isActive ? "text-secondary" : "text-white/40")} />
                  {!isSidebarCollapsed && item.label}
                </Link>
              </Button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/5 space-y-4">
          {!isSidebarCollapsed && (
            <div className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl border border-white/5",
              isOnline ? "bg-green-500/10 text-green-400" : "bg-destructive/10 text-destructive"
            )}>
              {isOnline ? <Wifi className="h-4 w-4" /> : <WifiOff className="h-4 w-4" />}
              <span className="text-[10px] font-black uppercase tracking-widest">
                {isOnline ? "Sync Active" : "Offline"}
              </span>
            </div>
          )}
          <Button 
            variant="ghost" 
            className="w-full justify-start text-white/40 hover:text-white hover:bg-white/5 h-12 gap-4 rounded-xl font-black uppercase text-[10px] tracking-widest"
            onClick={() => signOut(auth)}
          >
            <LogOut className="h-5 w-5 shrink-0" />
            {!isSidebarCollapsed && "Logout Account"}
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="w-full h-10 text-white/20 hover:text-white"
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          >
            {isSidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>
      </aside>

      {/* Mobile Top Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white dark:bg-black border-b z-40 flex items-center justify-between px-6">
        <div className="flex items-center gap-2">
           <ShieldCheck className="h-6 w-6 text-secondary" />
           <span className="font-black text-sm uppercase tracking-tighter text-foreground">Admin Panel</span>
        </div>
        <Button variant="ghost" size="icon" className="rounded-xl bg-muted/30 text-foreground" onClick={() => setIsMobileNavOpen(true)}>
          <Menu className="h-6 w-6" />
        </Button>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 pt-16 lg:pt-0">
        <header className="hidden lg:flex h-24 bg-white dark:bg-black border-b items-center px-10 justify-between shrink-0 sticky top-0 z-20 shadow-sm">
          <div className="flex items-center gap-6">
             <div className="relative w-64">
               <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
               <input className="w-full bg-muted/30 dark:bg-muted/10 h-10 rounded-xl pl-10 text-xs font-bold uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-secondary/50 border-none text-foreground" placeholder="Quick Search..." />
             </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-right">
              <p className="text-[11px] font-black uppercase tracking-widest text-foreground">{user?.displayName || "Authorized Admin"}</p>
              <p className="text-[9px] text-muted-foreground font-mono font-bold">{user?.email}</p>
            </div>
            <div className="h-12 w-12 rounded-2xl bg-muted border-2 border-muted overflow-hidden shadow-lg transform rotate-3">
               <img src={user?.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${user?.email}`} alt="Avatar" className="w-full h-full object-cover" />
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-x-hidden p-6 lg:p-10">
          <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
            {children}
          </div>
        </div>
      </main>

      {/* Mobile Nav Overlay (Collapsible/Extendable) */}
      {isMobileNavOpen && (
        <div className="fixed inset-0 z-50 bg-primary/98 flex flex-col p-8 lg:hidden animate-in slide-in-from-left-full duration-300">
          <div className="flex justify-between items-center mb-10">
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-8 w-8 text-secondary" />
              <span className="text-white text-2xl font-black tracking-tighter uppercase">Menu</span>
            </div>
            <Button size="icon" variant="ghost" className="text-white rounded-full h-12 w-12 bg-white/5" onClick={() => setIsMobileNavOpen(false)}>
              <X className="h-8 w-8" />
            </Button>
          </div>
          <div className="flex-1 space-y-2">
            {navItems.map((item) => (
              <Button
                key={item.href}
                variant="ghost"
                asChild
                className={cn(
                  "w-full justify-start text-xl font-black uppercase tracking-tighter h-16 rounded-2xl px-6",
                  pathname.startsWith(item.href) ? "bg-secondary text-primary" : "text-white/70 hover:bg-white/5 hover:text-white"
                )}
                onClick={() => setIsMobileNavOpen(false)}
              >
                <Link href={item.href}>
                  <item.icon className="h-6 w-6 mr-4" />
                  {item.label}
                </Link>
              </Button>
            ))}
          </div>
          <div className="pt-8 border-t border-white/10 space-y-4">
             <div className="flex items-center justify-between text-white/40 px-4">
                <span className="text-[10px] font-black uppercase tracking-widest truncate max-w-[200px]">Logged in as {user?.email}</span>
             </div>
             <Button variant="outline" className="w-full text-white border-white/20 h-16 rounded-2xl text-xl font-black uppercase tracking-tighter bg-white/5 hover:bg-destructive hover:border-destructive transition-colors" onClick={() => signOut(auth)}>
               SIGN OUT
             </Button>
          </div>
        </div>
      )}
    </div>
  );
}
