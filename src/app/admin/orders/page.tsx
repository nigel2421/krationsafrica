
"use client";

import React, { useState } from "react";
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy } from "firebase/firestore";
import { 
  Calendar, 
  Search,
  User,
  ShoppingBag,
  ChevronRight,
  Filter,
  History,
  Activity,
  Loader2,
  ChevronLeft
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Link from "next/link";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const ITEMS_PER_PAGE = 10;

export default function AdminOrders() {
  const db = useFirestore();
  const [searchTerm, setSearchTerm] = useState("");
  const [view, setView] = useState<"active" | "past">("active");
  const [currentPage, setCurrentPage] = useState(1);

  const ordersQuery = useMemoFirebase(() => query(collection(db, "orders"), orderBy("orderedAt", "desc")), [db]);
  const { data: orders, isLoading } = useCollection(ordersQuery);

  const filteredOrders = orders?.filter(o => {
    const customerName = o.customerName || "";
    const orderId = o.id || "";
    const matchesSearch = customerName.toLowerCase().includes(searchTerm.toLowerCase()) || orderId.toLowerCase().includes(searchTerm.toLowerCase());
    const isActive = o.orderStatus !== "Delivered" && o.orderStatus !== "Cancelled";
    
    if (view === "active") return matchesSearch && isActive;
    return matchesSearch && !isActive;
  }) || [];

  // Pagination Logic
  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / ITEMS_PER_PAGE));
  const paginatedOrders = filteredOrders.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-black uppercase tracking-tighter text-primary dark:text-foreground">Order Desk</h1>
        <p className="text-muted-foreground text-xs font-bold uppercase tracking-widest">Fulfill and track customer requests</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search by name or ID..." 
            className="pl-10 h-10 border-2 bg-background text-foreground" 
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
          />
        </div>
        <Tabs value={view} onValueChange={(v: any) => { setView(v); setCurrentPage(1); }} className="w-full md:w-auto">
          <TabsList className="grid w-full grid-cols-2 h-10 border-2 bg-muted/20">
            <TabsTrigger value="active" className="font-black text-[10px] uppercase gap-2">
              <Activity className="h-3 w-3" /> Active
            </TabsTrigger>
            <TabsTrigger value="past" className="font-black text-[10px] uppercase gap-2">
              <History className="h-3 w-3" /> Archive
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block bg-card border-2 rounded-xl overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="text-[10px] uppercase font-black text-muted-foreground">Order ID</TableHead>
              <TableHead className="text-[10px] uppercase font-black text-muted-foreground">Customer</TableHead>
              <TableHead className="text-[10px] uppercase font-black text-muted-foreground">Details</TableHead>
              <TableHead className="text-[10px] uppercase font-black text-muted-foreground">Total</TableHead>
              <TableHead className="text-[10px] uppercase font-black text-muted-foreground">Status</TableHead>
              <TableHead className="text-right text-[10px] uppercase font-black text-muted-foreground">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={6} className="h-32 text-center text-[10px] font-black uppercase text-foreground"><Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-secondary" /> Syncing Orders...</TableCell></TableRow>
            ) : paginatedOrders.length > 0 ? paginatedOrders.map((order) => (
              <TableRow key={order.id} className="hover:bg-muted/10 transition-colors">
                <TableCell className="font-black text-xs uppercase text-primary dark:text-secondary">{order.id}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-full bg-secondary/10 flex items-center justify-center text-secondary font-black text-[10px]">
                      {order.customerName?.charAt(0) || "U"}
                    </div>
                    <span className="font-bold text-sm leading-none text-foreground">{order.customerName}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-[10px] text-muted-foreground font-bold uppercase">{order.deliveryRegion}</span>
                </TableCell>
                <TableCell className="font-black text-xs text-foreground">KES {order.totalAmount?.toLocaleString()}</TableCell>
                <TableCell>
                   <Badge className="text-[8px] uppercase font-black px-2">{order.orderStatus}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button size="sm" variant="outline" asChild className="font-black text-[10px] uppercase border-2 h-8 text-foreground hover:bg-secondary hover:text-primary">
                    <Link href={`/admin/orders/${order.id}`}>Manage</Link>
                  </Button>
                </TableCell>
              </TableRow>
            )) : (
              <TableRow><TableCell colSpan={6} className="h-32 text-center text-[10px] font-black uppercase text-muted-foreground">No matching orders found</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {isLoading ? (
          <div className="flex justify-center py-10"><Loader2 className="h-8 w-8 animate-spin text-secondary" /></div>
        ) : paginatedOrders.map((order) => (
          <Link key={order.id} href={`/admin/orders/${order.id}`} className="block">
            <div className="bg-card border-2 rounded-xl p-4 shadow-sm active:scale-[0.98] transition-all hover:border-secondary">
              <div className="flex justify-between items-start mb-3">
                <div className="space-y-1">
                  <Badge variant="outline" className="text-[8px] font-black uppercase border-secondary text-secondary">
                    {order.id}
                  </Badge>
                  <h3 className="font-black text-sm uppercase leading-tight text-foreground">{order.customerName}</h3>
                </div>
                <Badge className="text-[8px] font-black uppercase">{order.orderStatus}</Badge>
              </div>
              <div className="flex justify-between items-end">
                <div className="space-y-1">
                  <div className="flex items-center gap-1 text-[9px] text-muted-foreground font-bold uppercase">
                    <ShoppingBag className="h-3 w-3" /> {order.items?.length} Items
                  </div>
                  <div className="flex items-center gap-1 text-[9px] text-muted-foreground font-bold uppercase">
                    <Calendar className="h-3 w-3" /> {order.orderedAt?.seconds ? new Date(order.orderedAt.seconds * 1000).toLocaleDateString() : "Now"}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground font-black uppercase leading-none mb-1">Total Amount</p>
                  <p className="text-lg font-black text-primary dark:text-secondary leading-none">KES {order.totalAmount?.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Pagination Controls */}
      {filteredOrders.length > ITEMS_PER_PAGE && (
        <div className="flex items-center justify-between pt-4 border-t-2">
          <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">
            Showing {Math.min(filteredOrders.length, ITEMS_PER_PAGE * (currentPage - 1) + 1)} - {Math.min(filteredOrders.length, ITEMS_PER_PAGE * currentPage)} of {filteredOrders.length}
          </p>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="h-8 w-8 p-0 border-2"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-1 px-4 bg-muted/20 rounded-lg border-2">
              <span className="text-[10px] font-black uppercase">{currentPage}</span>
              <span className="text-[10px] font-bold text-muted-foreground">/</span>
              <span className="text-[10px] font-black text-muted-foreground">{totalPages}</span>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="h-8 w-8 p-0 border-2"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
