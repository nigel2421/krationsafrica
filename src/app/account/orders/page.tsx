
"use client";

import React from "react";
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy } from "firebase/firestore";
import { Loader2, Package, Calendar, MapPin, Receipt, ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
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

    const itemsHtml = order.items?.map((item: string) => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">${item}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">Verified</td>
      </tr>
    `).join('') || '';

    const date = order.orderedAt?.seconds 
      ? new Date(order.orderedAt.seconds * 1000).toLocaleDateString('en-KE', { dateStyle: 'long' }) 
      : 'Recent Order';

    printWindow.document.write(`
      <html>
        <head>
          <title>Receipt - ${order.id}</title>
          <style>
            body { font-family: 'Inter', sans-serif; padding: 40px; color: #424266; }
            .header { text-align: center; border-bottom: 4px solid #3AC8F3; padding-bottom: 20px; margin-bottom: 30px; }
            .logo { font-size: 24px; font-weight: 900; letter-spacing: -1px; }
            .accent { color: #3AC8F3; }
            .details { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 40px; font-size: 14px; }
            .table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
            .table th { background: #f4f4f5; text-align: left; padding: 12px; font-size: 12px; text-transform: uppercase; }
            .totals { float: right; width: 300px; }
            .totals div { display: flex; justify-content: space-between; padding: 8px 0; font-size: 14px; }
            .grand-total { font-weight: 900; font-size: 18px; border-top: 2px solid #eee; margin-top: 10px; padding-top: 10px; }
            .footer { margin-top: 100px; text-align: center; font-size: 10px; color: #888; text-transform: uppercase; letter-spacing: 2px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">KREATIONS <span class="accent">254</span></div>
            <p style="margin: 5px 0; font-size: 12px; font-weight: 700;">OFFICIAL PURCHASE RECEIPT</p>
          </div>
          
          <div class="details">
            <div>
              <p><strong>ORDER ID:</strong> ${order.id}</p>
              <p><strong>DATE:</strong> ${date}</p>
              <p><strong>STATUS:</strong> ${order.orderStatus}</p>
            </div>
            <div>
              <p><strong>CUSTOMER:</strong> ${order.customerName}</p>
              <p><strong>PHONE:</strong> ${order.customerPhoneNumber}</p>
              <p><strong>LOCATION:</strong> ${order.deliveryLocation} (${order.deliveryRegion || 'Nairobi'})</p>
            </div>
          </div>

          <table class="table">
            <thead>
              <tr>
                <th>Item Description</th>
                <th style="text-align: right;">Status</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>

          <div class="totals">
            <div>
              <span>Subtotal</span>
              <span>KES ${order.subtotal?.toLocaleString() || order.totalAmount?.toLocaleString()}</span>
            </div>
            <div>
              <span>Delivery Fee</span>
              <span>KES ${order.deliveryFee?.toLocaleString() || '0'}</span>
            </div>
            <div class="grand-total">
              <span>Total Paid</span>
              <span class="accent">KES ${order.totalAmount?.toLocaleString()}</span>
            </div>
          </div>

          <div style="clear: both;"></div>

          <div class="footer">
            <p>IT WILL ALWAYS LOOK GOOD ON YOU</p>
            <p>Payment to: +254 712 345 678</p>
          </div>
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
                        <span className="font-bold text-lg">Order {order.id}</span>
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
                            <li key={idx} className="flex justify-between items-center text-sm font-medium bg-muted/20 p-2 rounded">
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <Separator />
                      <div className="space-y-1">
                        <div className="flex justify-between items-center text-xs text-muted-foreground font-bold uppercase">
                          <span>Subtotal</span>
                          <span>KES {order.subtotal?.toLocaleString() || order.totalAmount?.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs text-muted-foreground font-bold uppercase">
                          <span>Delivery ({order.deliveryRegion || 'Standard'})</span>
                          <span>KES {order.deliveryFee?.toLocaleString() || '0'}</span>
                        </div>
                        <div className="flex justify-between items-center pt-2">
                          <span className="font-bold">Grand Total</span>
                          <span className="text-xl font-black text-secondary">KES {order.totalAmount?.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="bg-muted/20 p-4 rounded-lg space-y-3">
                        <div className="flex items-start gap-2 text-sm">
                          <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                          <div>
                            <p className="font-bold">Delivery Location</p>
                            <p className="text-muted-foreground text-xs">{order.deliveryLocation}</p>
                            <p className="text-[10px] font-black uppercase text-secondary mt-1">{order.deliveryRegion}</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" className="flex-1 font-bold gap-2 border-2" onClick={() => handlePrintReceipt(order)}>
                          <Receipt className="h-4 w-4" />
                          Download Receipt
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
