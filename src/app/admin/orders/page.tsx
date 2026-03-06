
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
  Activity
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Link from "next/link";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function AdminOrders() {
  const db = useFirestore();
  const [searchTerm, setSearchTerm] = useState("");
  const [view, setView] = useState<"active" | "past">("active");

  const ordersQuery = useMemoFirebase(() => query(collection(db, "orders"), orderBy("orderedAt", "desc")), [db]);
  const { data: orders, isLoading } = useCollection(ordersQuery);

  const filteredOrders = orders?.filter(o => {
    const matchesSearch = o.customerName.toLowerCase().includes(searchTerm.toLowerCase()) || o.id.toLowerCase().includes(searchTerm.toLowerCase());
    const isActive = o.orderStatus !== "Delivered" && o.orderStatus !== "Cancelled";
    
    if (view === "active") return matchesSearch && isActive;
    return matchesSearch && !isActive;
  });

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-black uppercase tracking-tighter">Order Desk</h1>
        <p className="text-muted-foreground text-xs font-bold uppercase tracking-widest">Fulfill and track customer requests</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search by name or ID..." 
            className="pl-10 h-10 border-2" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Tabs value={view} onValueChange={(v: any) => setView(v)} className="w-full md:w-auto">
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
      <div className="hidden md:block bg-white border-2 rounded-xl overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="text-[10px] uppercase font-black">Order ID</TableHead>
              <TableHead className="text-[10px] uppercase font-black">Customer</TableHead>
              <TableHead className="text-[10px] uppercase font-black">Details</TableHead>
              <TableHead className="text-[10px] uppercase font-black">Total</TableHead>
              <TableHead className="text-[10px] uppercase font-black">Status</TableHead>
              <TableHead className="text-right text-[10px] uppercase font-black">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={6} className="h-32 text-center text-[10px] font-black uppercase">Syncing Orders...</TableCell></TableRow>
            ) : filteredOrders?.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-black text-xs uppercase text-primary">{order.id}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-full bg-secondary/10 flex items-center justify-center text-secondary font-black text-[10px]">
                      {order.customerName.charAt(0)}
                    </div>
                    <span className="font-bold text-sm leading-none">{order.customerName}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-[10px] text-muted-foreground font-bold uppercase">{order.deliveryRegion}</span>
                </TableCell>
                <TableCell className="font-black text-xs">KES {order.totalAmount?.toLocaleString()}</TableCell>
                <TableCell>
                   <Badge className="text-[8px] uppercase font-black px-2">{order.orderStatus}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button size="sm" variant="outline" asChild className="font-black text-[10px] uppercase border-2 h-8">
                    <Link href={`/admin/orders/${order.id}`}>Manage</Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {isLoading ? (
          <div className="flex justify-center py-10"><Loader2 className="h-8 w-8 animate-spin text-secondary" /></div>
        ) : filteredOrders?.map((order) => (
          <Link key={order.id} href={`/admin/orders/${order.id}`} className="block">
            <div className="bg-white border-2 rounded-xl p-4 shadow-sm active:scale-[0.98] transition-all">
              <div className="flex justify-between items-start mb-3">
                <div className="space-y-1">
                  <Badge variant="outline" className="text-[8px] font-black uppercase border-secondary text-secondary">
                    {order.id}
                  </Badge>
                  <h3 className="font-black text-sm uppercase leading-tight">{order.customerName}</h3>
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
                  <p className="text-lg font-black text-primary leading-none">KES {order.totalAmount?.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </Link>
        ))}
        {!filteredOrders?.length && !isLoading && (
          <div className="text-center py-20 bg-muted/20 border-2 border-dashed rounded-xl">
            <p className="text-[10px] font-black uppercase text-muted-foreground">No matching orders found</p>
          </div>
        )}
      </div>
    </div>
  );
}
