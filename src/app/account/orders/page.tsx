"use client";

import React from "react";
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy } from "firebase/firestore";
import { Loader2, Package, Calendar, MapPin, Receipt, ExternalLink, Download } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export default function CustomerOrders() {
  const { user, isUserLoading } = useUser();
  const db = useFirestore();

  const ordersQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(collection(db, "userProfiles", user.uid, "orders"), orderBy("orderedAt", "desc"));
  }, [db, user]);

  const { data: orders, isLoading: isOrdersLoading } = useCollection(ordersQuery);

  const handlePrintReceipt = (order: any) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const itemsHtml = order.items?.map((item: string) => `<li>${item}</li>`).join('') || '';
    const date = order.orderedAt?.seconds ? new Date(order.orderedAt.seconds * 1000).toLocaleDateString() : 'N/A';

    printWindow.document.write(`
      <html>
        <head>
          <title>Receipt - Order ${order.id}</title>
          <style>
            body { font-family: sans-serif; padding: 40px; }
            .header { text-align: center; margin-bottom: 40px; }
            .details { margin-bottom: 20px; }
            .items { width: 100%; border-collapse: collapse; margin-top: 20px; }
            .items th, .items td { border: 1px solid #ddd; padding: 12px; text-align: left; }
            .total { text-align: right; font-size: 1.5em; font-weight: bold; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>KREATION 254</h1>
            <p>Official Purchase Receipt</p>
          </div>
          <div class="details">
            <p><strong>Order ID:</strong> ${order.id}</p>
            <p><strong>Date:</strong> ${date}</p>
            <p><strong>Customer:</strong> ${order.customerName}</p>
            <p><strong>Phone:</strong> ${order.customerPhoneNumber}</p>
            <p><strong>Location:</strong> ${order.deliveryLocation}</p>
          </div>
          <h3>Items:</h3>
          <ul>${itemsHtml}</ul>
          <div class="total">Total: KES ${order.totalAmount?.toLocaleString()}</div>
          <script>window.print();</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  if (isUserLoading || isOrdersLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-secondary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center p-8">
          <h2 className="text-2xl font-bold mb-4">Please log in</h2>
          <p className="text-muted-foreground mb-6">You need to be logged in to view your order history.</p>
          <Button asChild className="w-full">
            <a href="/admin/login">Go to Login</a>
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/10 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-10">
          <h1 className="text-4xl font-black text-primary tracking-tight mb-2">MY ORDERS</h1>
          <p className="text-muted-foreground">Track and review your past purchases from Kreation 254.</p>
        </div>

        {orders && orders.length > 0 ? (
          <div className="space-y-6">
            {orders.map((order) => (
              <Card key={order.id} className="overflow-hidden border-2 hover:border-secondary/50 transition-colors">
                <CardHeader className="bg-muted/30 pb-4">
                  <div className="flex flex-wrap justify-between items-start gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Package className="h-5 w-5 text-secondary" />
                        <span className="font-bold text-lg">Order #{order.id.slice(-6).toUpperCase()}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        {order.orderedAt?.seconds ? new Date(order.orderedAt.seconds * 1000).toLocaleDateString() : 'Recent'}
                      </div>
                    </div>
                    <Badge className="px-4 py-1 text-sm font-bold capitalize">
                      {order.orderStatus}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-bold text-xs uppercase text-muted-foreground tracking-wider mb-2">Items Ordered</h4>
                        <ul className="space-y-2">
                          {order.items?.map((item: string, idx: number) => (
                            <li key={idx} className="flex justify-between items-center text-sm font-medium">
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <Separator />
                      <div className="flex justify-between items-center">
                        <span className="font-bold">Total Amount</span>
                        <span className="text-xl font-black text-secondary">KES {order.totalAmount?.toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="bg-muted/20 p-4 rounded-lg space-y-3">
                        <div className="flex items-start gap-2 text-sm">
                          <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                          <div>
                            <p className="font-bold">Delivery Location</p>
                            <p className="text-muted-foreground">{order.deliveryLocation}</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" className="flex-1 font-bold gap-2" onClick={() => handlePrintReceipt(order)}>
                          <Receipt className="h-4 w-4" />
                          Print Receipt
                        </Button>
                        <Button variant="ghost" size="icon" className="text-muted-foreground" asChild>
                           <a href={`/shop`} target="_blank"><ExternalLink className="h-4 w-4" /></a>
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-20 text-center space-y-4">
            <div className="bg-muted/50 w-20 h-20 rounded-full flex items-center justify-center mx-auto">
              <Package className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-bold">No orders found</h3>
            <p className="text-muted-foreground">You haven't placed any orders yet. Start shopping to see them here!</p>
            <Button asChild className="bg-secondary text-secondary-foreground hover:bg-secondary/90">
              <a href="/#categories">Browse Catalog</a>
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
}
