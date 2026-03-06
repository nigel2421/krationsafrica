
"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useFirestore, useDoc } from "@/firebase";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { 
  ArrowLeft, 
  Printer, 
  Phone, 
  MapPin, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  Truck, 
  XCircle,
  CreditCard,
  MessageCircle,
  Package,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function OrderDetailsPage() {
  const { orderId } = useParams();
  const router = useRouter();
  const db = useFirestore();
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);

  const orderRef = orderId ? doc(db, "orders", orderId as string) : null;
  const { data: order, isLoading } = useDoc(orderRef);

  const updateStatus = async (status: string) => {
    if (!orderRef) return;
    setIsUpdating(true);
    try {
      await updateDoc(orderRef, { orderStatus: status, updatedAt: serverTimestamp() });
      toast({ title: "Order Updated", description: `Status changed to ${status}` });
    } catch (e: any) {
      toast({ title: "Update Failed", variant: "destructive" });
    } finally {
      setIsUpdating(false);
    }
  };

  const handlePrint = () => {
    if (!order) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    // Use the existing receipt printing logic from user's account page but adapted for admin
    const date = order.orderedAt?.seconds 
      ? new Date(order.orderedAt.seconds * 1000).toLocaleDateString('en-KE', { dateStyle: 'long' }) 
      : 'Recent Order';

    const itemsHtml = order.items?.map((item: string) => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee; font-size: 14px;">${item}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right; font-weight: bold;">Authentic</td>
      </tr>
    `).join('') || '';

    printWindow.document.write(`
      <html>
        <head><title>Receipt - ${order.id}</title></head>
        <body style="font-family: sans-serif; padding: 40px; color: #333;">
          <h1 style="text-align: center; border-bottom: 4px solid #3AC8F3; padding-bottom: 10px;">KREATIONS 254</h1>
          <p style="text-align: center; font-weight: bold;">OFFICIAL RECEIPT</p>
          <div style="margin-top: 40px; display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
            <div><p>Order ID: ${order.id}</p><p>Date: ${date}</p></div>
            <div><p>Customer: ${order.customerName}</p><p>Phone: ${order.customerPhoneNumber}</p></div>
          </div>
          <table style="width: 100%; border-collapse: collapse; margin-top: 40px;">
            <thead><tr style="background: #f4f4f4;"><th style="padding: 10px; text-align: left;">Item</th><th style="padding: 10px; text-align: right;">Status</th></tr></thead>
            <tbody>${itemsHtml}</tbody>
          </table>
          <div style="margin-top: 40px; text-align: right;">
            <p>Subtotal: KES ${order.subtotal?.toLocaleString()}</p>
            <p>Delivery: KES ${order.deliveryFee?.toLocaleString()}</p>
            <h2 style="color: #3AC8F3;">Total: KES ${order.totalAmount?.toLocaleString()}</h2>
          </div>
          <p style="text-align: center; margin-top: 100px; font-size: 12px; color: #888;">IT WILL ALWAYS LOOK GOOD ON YOU</p>
          <script>window.print();</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  if (isLoading) return <div className="flex h-[60vh] items-center justify-center"><Loader2 className="animate-spin h-10 w-10 text-secondary" /></div>;
  if (!order) return <div className="text-center py-20 font-black uppercase">Order Not Found</div>;

  return (
    <div className="space-y-6 pb-20 max-w-2xl mx-auto">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => router.back()} className="font-bold gap-2">
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handlePrint} className="font-black text-[10px] uppercase border-2 gap-2">
            <Printer className="h-3 w-3" /> Print Receipt
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-end">
          <div className="space-y-1">
            <Badge className="text-[10px] font-black uppercase tracking-widest">{order.id}</Badge>
            <h1 className="text-3xl font-black uppercase tracking-tighter">{order.customerName}</h1>
          </div>
          <Badge variant="secondary" className="px-4 py-1 text-xs font-black uppercase">{order.orderStatus}</Badge>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Card className="border-2 p-4 bg-muted/20">
            <p className="text-[9px] font-black uppercase text-muted-foreground mb-1">Payment Status</p>
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-secondary" />
              <span className="font-black text-xs uppercase">{order.orderStatus === "Pending" ? "Awaiting Payment" : "Paid / Confirmed"}</span>
            </div>
          </Card>
          <Card className="border-2 p-4 bg-muted/20">
            <p className="text-[9px] font-black uppercase text-muted-foreground mb-1">Method</p>
            <div className="flex items-center gap-2">
              <Truck className="h-4 w-4 text-primary" />
              <span className="font-black text-xs uppercase">{order.deliveryRegion}</span>
            </div>
          </Card>
        </div>

        <Card className="border-2 overflow-hidden">
          <CardHeader className="bg-muted/50 p-4 border-b">
            <CardTitle className="text-xs font-black uppercase tracking-widest">Customer Information</CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            <div className="flex items-start gap-3">
              <Phone className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-[10px] font-black uppercase text-muted-foreground">Phone Number</p>
                <p className="font-bold text-sm">{order.customerPhoneNumber}</p>
                <Button variant="link" size="sm" asChild className="p-0 h-auto text-secondary text-[10px] font-black uppercase">
                  <a href={`https://wa.me/${order.customerPhoneNumber}`} target="_blank">Chat on WhatsApp</a>
                </Button>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-[10px] font-black uppercase text-muted-foreground">Delivery Address</p>
                <p className="font-bold text-sm">{order.deliveryLocation || "Store Pick-up (Nairobi CBD)"}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2">
          <CardHeader className="bg-muted/50 p-4 border-b">
            <CardTitle className="text-xs font-black uppercase tracking-widest">Order Summary</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-3">
              {order.items?.map((item: string, i: number) => (
                <div key={i} className="flex justify-between text-sm items-center py-2 border-b last:border-0">
                  <span className="font-black uppercase text-[11px]">{item}</span>
                  <Package className="h-3 w-3 text-muted-foreground" />
                </div>
              ))}
            </div>
            <div className="mt-6 space-y-2">
              <div className="flex justify-between text-xs font-bold uppercase text-muted-foreground">
                <span>Subtotal</span>
                <span>KES {order.subtotal?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-xs font-bold uppercase text-muted-foreground">
                <span>Delivery</span>
                <span>KES {order.deliveryFee?.toLocaleString()}</span>
              </div>
              <Separator />
              <div className="flex justify-between items-center pt-2">
                <span className="font-black uppercase text-sm">Grand Total</span>
                <span className="text-2xl font-black text-secondary">KES {order.totalAmount?.toLocaleString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-3">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-center text-muted-foreground">Action Center</p>
          <div className="grid grid-cols-2 gap-3">
            <Button 
              className="bg-green-600 hover:bg-green-700 font-black uppercase text-[10px] h-12"
              onClick={() => updateStatus("Processing")}
              disabled={isUpdating}
            >
              <CheckCircle2 className="mr-2 h-4 w-4" /> Mark Paid
            </Button>
            <Button 
              className="bg-primary font-black uppercase text-[10px] h-12"
              onClick={() => updateStatus("Shipped")}
              disabled={isUpdating}
            >
              <Truck className="mr-2 h-4 w-4" /> Dispatch Order
            </Button>
            <Button 
              variant="outline"
              className="border-2 border-secondary text-secondary font-black uppercase text-[10px] h-12"
              onClick={() => updateStatus("Delivered")}
              disabled={isUpdating}
            >
              <CheckCircle2 className="mr-2 h-4 w-4" /> Complete Order
            </Button>
            <Button 
              variant="destructive"
              className="font-black uppercase text-[10px] h-12"
              onClick={() => {if(confirm("Cancel this order?")) updateStatus("Cancelled")}}
              disabled={isUpdating}
            >
              <XCircle className="mr-2 h-4 w-4" /> Cancel Order
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
