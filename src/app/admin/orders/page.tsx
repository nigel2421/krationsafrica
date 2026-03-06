
"use client";

import React, { useState } from "react";
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy, updateDoc, doc } from "firebase/firestore";
import { 
  MapPin, 
  Phone, 
  Calendar, 
  MoreVertical, 
  Truck, 
  CheckCircle2, 
  Clock, 
  XCircle,
  Search,
  Receipt,
  User
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function AdminOrders() {
  const db = useFirestore();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");

  const ordersQuery = useMemoFirebase(() => query(collection(db, "orders"), orderBy("orderedAt", "desc")), [db]);
  const { data: orders, isLoading } = useCollection(ordersQuery);

  const filteredOrders = orders?.filter(o => 
    o.customerName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    o.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const updateStatus = async (orderId: string, status: string) => {
    try {
      await updateDoc(doc(db, "orders", orderId), { orderStatus: status });
      toast({ title: "Order Updated", description: `Status changed to ${status}` });
    } catch (e: any) {
      toast({ title: "Update Failed", variant: "destructive" });
    }
  };

  const getStatusIcon = (status: string) => {
    switch(status) {
      case "Pending": return <Clock className="h-3 w-3" />;
      case "Processing": return <Clock className="h-3 w-3" />;
      case "Shipped": return <Truck className="h-3 w-3" />;
      case "Delivered": return <CheckCircle2 className="h-3 w-3" />;
      case "Cancelled": return <XCircle className="h-3 w-3" />;
      default: return <Clock className="h-3 w-3" />;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black uppercase tracking-tighter">Order Management</h1>
        <p className="text-muted-foreground font-medium">Track payments and fulfill customer requests across Kenya.</p>
      </div>

      <div className="bg-white rounded-xl border-2 p-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search by name or Order ID (ORD-...)" 
            className="pl-10 h-10 border-2" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white border-2 rounded-xl overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead>Order #</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Region & Location</TableHead>
              <TableHead>Items</TableHead>
              <TableHead>Financials</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={7} className="h-32 text-center text-xs font-bold uppercase">Loading business activity...</TableCell></TableRow>
            ) : filteredOrders?.map((order) => (
              <TableRow key={order.id}>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-black text-xs uppercase tracking-tight text-primary">{order.id}</span>
                    <span className="text-[9px] text-muted-foreground flex items-center gap-1 font-bold">
                      <Calendar className="h-2 w-2" />
                      {order.orderedAt?.seconds ? new Date(order.orderedAt.seconds * 1000).toLocaleDateString() : 'Recent'}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                   <div className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-full bg-secondary/10 flex items-center justify-center">
                      <User className="h-3 w-3 text-secondary" />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-bold text-sm leading-none">{order.customerName}</span>
                      <span className="text-[10px] text-muted-foreground font-medium">{order.customerPhoneNumber}</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <Badge variant="outline" className="text-[8px] h-4 uppercase font-black w-fit border-secondary mb-1">
                      {order.deliveryRegion || "Nairobi"}
                    </Badge>
                    <span className="text-[10px] text-muted-foreground truncate max-w-[150px]">{order.deliveryLocation}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1 max-w-[200px]">
                    {order.items?.map((item: string, i: number) => (
                      <span key={i} className="text-[9px] font-black uppercase bg-muted px-1.5 py-0.5 rounded leading-none">{item}</span>
                    ))}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-black text-primary text-xs">KES {order.totalAmount?.toLocaleString()}</span>
                    <span className="text-[8px] text-muted-foreground font-bold">Fee: KES {order.deliveryFee || 0}</span>
                  </div>
                </TableCell>
                <TableCell>
                   <Badge className="flex items-center gap-1 h-5 text-[9px] uppercase font-black w-fit">
                     {getStatusIcon(order.orderStatus)}
                     {order.orderStatus}
                   </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="border hover:bg-muted"><MoreVertical className="h-4 w-4" /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuLabel className="text-[10px] uppercase font-black">Update Fulfillment</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => updateStatus(order.id, "Processing")} className="text-xs font-bold">Mark Processing</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => updateStatus(order.id, "Shipped")} className="text-xs font-bold">Mark Shipped</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => updateStatus(order.id, "Delivered")} className="text-xs font-bold text-green-600">Mark Delivered</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => updateStatus(order.id, "Cancelled")} className="text-xs font-bold text-destructive">Cancel Order</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
            {!filteredOrders?.length && !isLoading && (
              <TableRow><TableCell colSpan={7} className="h-40 text-center text-muted-foreground font-bold">No orders found.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
