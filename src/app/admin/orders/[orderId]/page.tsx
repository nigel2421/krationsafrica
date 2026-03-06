
"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useUser, useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { doc, updateDoc, serverTimestamp, arrayUnion } from "firebase/firestore";
import { 
  ArrowLeft, 
  Printer, 
  Phone, 
  MapPin, 
  CheckCircle2, 
  Truck, 
  XCircle,
  CreditCard,
  Package,
  Loader2,
  MessageCircle,
  History,
  Clock,
  CircleDot
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function OrderDetailsPage() {
  const { orderId } = useParams();
  const router = useRouter();
  const db = useFirestore();
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);
  const [timelineOpen, setTimelineOpen] = useState(false);

  const orderRef = useMemoFirebase(() => {
    if (!db || !orderId) return null;
    return doc(db, "orders", orderId as string);
  }, [db, orderId]);

  const { data: order, isLoading } = useDoc(orderRef);

  const updateStatus = async (status: string) => {
    if (!orderRef) return;
    setIsUpdating(true);
    try {
      await updateDoc(orderRef, { 
        orderStatus: status, 
        updatedAt: serverTimestamp(),
        statusHistory: arrayUnion({
          status,
          timestamp: new Date(),
          note: `Status updated to ${status} via Admin Console`
        })
      });
      toast({ title: "Order Updated", description: `Status changed to ${status}` });
    } catch (e: any) {
      toast({ title: "Update Failed", variant: "destructive" });
    } finally {
      setIsUpdating(false);
    }
  };

  const generateWhatsAppLink = () => {
    if (!order) return "#";
    const status = order.orderStatus || "Pending";
    const cleanPhone = order.customerPhoneNumber.replace(/\D/g, '');
    const message = `Hi ${order.customerName},\n\nThis is Kreations 254. We are updating you on your order *#${order.id}*.\n\n*Current Status:* ${status.toUpperCase()}\n\nThank you for choosing us! IT WILL ALWAYS LOOK GOOD ON YOU.`;
    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
  };

  const handlePrint = () => {
    if (!order) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const date = order.orderedAt?.seconds 
      ? new Date(order.orderedAt.seconds * 1000).toLocaleDateString('en-KE', { dateStyle: 'long' }) 
      : 'Recent Order';

    const itemsHtml = order.items?.map((item: string) => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #eee; font-size: 14px; font-weight: 600;">${item}</td>
        <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right; font-weight: 800; color: #3AC8F3;">VERIFIED</td>
      </tr>
    `).join('') || '';

    printWindow.document.write(`
      <html>
        <head>
          <title>Order Receipt - ${order.id}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap');
            body { font-family: 'Inter', sans-serif; padding: 40px; color: #424266; line-height: 1.5; }
            .header { text-align: center; margin-bottom: 50px; border-bottom: 8px solid #3AC8F3; padding-bottom: 20px; }
            .brand { font-size: 32px; font-weight: 900; letter-spacing: -2px; }
            .accent { color: #3AC8F3; }
            .info { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 40px; }
            .table { width: 100%; border-collapse: collapse; margin-bottom: 40px; }
            .table th { text-align: left; background: #f8f9fa; padding: 12px; font-size: 10px; text-transform: uppercase; letter-spacing: 2px; }
            .totals { float: right; width: 300px; }
            .total-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
            .grand-total { font-size: 24px; font-weight: 900; color: #3AC8F3; border: none; }
            .footer { margin-top: 100px; text-align: center; border-top: 1px solid #eee; padding-top: 30px; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="brand">KREATIONS <span class="accent">254</span></div>
            <p style="text-transform: uppercase; font-weight: 700; letter-spacing: 2px; font-size: 10px; margin-top: 5px;">Official Purchase Statement</p>
          </div>
          <div class="info">
            <div>
              <p><strong>ORDER ID:</strong> ${order.id}</p>
              <p><strong>DATE:</strong> ${date}</p>
              <p><strong>STATUS:</strong> ${order.orderStatus}</p>
            </div>
            <div>
              <p><strong>CUSTOMER:</strong> ${order.customerName}</p>
              <p><strong>PHONE:</strong> ${order.customerPhoneNumber}</p>
              <p><strong>LOCATION:</strong> ${order.deliveryLocation}</p>
            </div>
          </div>
          <table class="table">
            <thead><tr><th>Item Description</th><th style="text-align: right;">Quality Check</th></tr></thead>
            <tbody>${itemsHtml}</tbody>
          </table>
          <div class="totals">
            <div class="total-row"><span>Subtotal</span><span>KES ${order.subtotal?.toLocaleString() || (order.totalAmount - (order.deliveryFee || 0)).toLocaleString()}</span></div>
            <div class="total-row"><span>Delivery</span><span>KES ${order.deliveryFee?.toLocaleString() || '0'}</span></div>
            <div class="total-row grand-total"><span>Total Paid</span><span>KES ${order.totalAmount?.toLocaleString()}</span></div>
          </div>
          <div style="clear: both;"></div>
          <div class="footer">
            <p style="font-weight: 900; letter-spacing: 5px;">IT WILL ALWAYS LOOK GOOD ON YOU</p>
            <p>Customer Support: +254 719 112025</p>
          </div>
          <script>window.print();</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  if (isLoading) return (
    <div className="flex flex-col h-[60vh] items-center justify-center space-y-4">
      <Loader2 className="animate-spin h-12 w-12 text-secondary" />
      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Opening Order File...</p>
    </div>
  );

  if (!order) return <div className="text-center py-20 font-black uppercase text-destructive tracking-widest">Order Entry Not Found</div>;

  const history = order.statusHistory || [];

  return (
    <div className="space-y-8 pb-32 max-w-4xl mx-auto">
      {isUpdating && (
        <div className="fixed inset-0 z-[100] bg-primary/20 backdrop-blur-sm flex items-center justify-center">
           <div className="bg-card p-6 rounded-2xl shadow-2xl flex items-center gap-4 border-2 border-secondary/20">
              <Loader2 className="h-6 w-6 animate-spin text-secondary" />
              <span className="font-black uppercase text-[10px] tracking-widest text-foreground">Updating Database...</span>
           </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex gap-2 w-full sm:w-auto">
          <Button variant="ghost" size="sm" onClick={() => router.back()} className="font-black uppercase text-[10px] tracking-widest gap-2 bg-card text-foreground shadow-sm h-10 px-6 rounded-xl border border-muted">
            <ArrowLeft className="h-4 w-4" /> Back to Desk
          </Button>
          <Button variant="outline" size="sm" onClick={() => setTimelineOpen(true)} className="font-black uppercase text-[10px] tracking-widest gap-2 bg-secondary/10 text-secondary border-secondary/20 h-10 px-6 rounded-xl">
            <History className="h-4 w-4" /> View Timeline
          </Button>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button variant="outline" className="flex-1 sm:flex-none font-black text-[10px] uppercase border-2 h-10 px-6 rounded-xl gap-2 bg-card text-foreground" onClick={handlePrint}>
            <Printer className="h-4 w-4" /> Print Receipt
          </Button>
          <Button className="flex-1 sm:flex-none bg-secondary text-primary hover:bg-white hover:text-primary border-2 border-secondary font-black text-[10px] uppercase h-10 px-6 rounded-xl gap-2 shadow-lg" asChild>
            <a href={generateWhatsAppLink()} target="_blank">
              <MessageCircle className="h-4 w-4" /> WhatsApp
            </a>
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Card className="border-2 rounded-2xl overflow-hidden shadow-sm bg-card">
            <CardHeader className="bg-muted/30 p-8 border-b flex flex-row items-center justify-between">
              <div>
                <Badge className="text-[9px] font-black uppercase tracking-widest mb-2 px-3 py-1 bg-primary text-white">{order.id}</Badge>
                <h1 className="text-3xl font-black uppercase tracking-tighter leading-none text-foreground">{order.customerName}</h1>
              </div>
              <Badge variant="secondary" className="px-5 py-2 text-xs font-black uppercase tracking-widest bg-secondary text-primary rounded-xl">
                {order.orderStatus}
              </Badge>
            </CardHeader>
            <CardContent className="p-8">
              <div className="space-y-8">
                 <div>
                    <p className="text-[10px] font-black uppercase text-muted-foreground tracking-[0.2em] mb-4">Ordered Items</p>
                    <div className="space-y-3">
                      {order.items?.map((item: string, i: number) => (
                        <div key={i} className="flex items-center justify-between p-4 bg-muted/20 rounded-xl border-2 border-transparent hover:border-secondary transition-all group">
                          <div className="flex items-center gap-4">
                            <div className="h-10 w-10 bg-card rounded-lg flex items-center justify-center border shadow-sm group-hover:rotate-3 transition-transform">
                              <Package className="h-5 w-5 text-secondary" />
                            </div>
                            <span className="font-black uppercase text-xs tracking-tight text-foreground">{item}</span>
                          </div>
                          <CheckCircle2 className="h-4 w-4 text-secondary" />
                        </div>
                      ))}
                    </div>
                 </div>

                 <Separator className="bg-muted/50" />

                 <div className="grid sm:grid-cols-2 gap-8">
                    <div className="space-y-4">
                       <p className="text-[10px] font-black uppercase text-muted-foreground tracking-[0.2em]">Contact Details</p>
                       <div className="flex items-center gap-4">
                          <div className="h-10 w-10 bg-primary/5 rounded-xl flex items-center justify-center text-primary">
                             <Phone className="h-5 w-5" />
                          </div>
                          <div>
                             <p className="text-[9px] font-black uppercase text-muted-foreground">Mobile Phone</p>
                             <p className="font-bold text-sm tracking-tight text-foreground">{order.customerPhoneNumber}</p>
                          </div>
                       </div>
                       <div className="flex items-center gap-4">
                          <div className="h-10 w-10 bg-primary/5 rounded-xl flex items-center justify-center text-primary">
                             <MapPin className="h-5 w-5" />
                          </div>
                          <div>
                             <p className="text-[9px] font-black uppercase text-muted-foreground">Destination</p>
                             <p className="font-bold text-sm tracking-tight leading-tight text-foreground">{order.deliveryLocation || "Store Pick-up"}</p>
                          </div>
                       </div>
                    </div>
                    <div className="space-y-4">
                       <p className="text-[10px] font-black uppercase text-muted-foreground tracking-[0.2em]">Billing Summary</p>
                       <div className="space-y-2">
                          <div className="flex justify-between text-xs font-bold uppercase text-muted-foreground">
                             <span>Subtotal</span>
                             <span className="text-foreground">KES {order.subtotal?.toLocaleString() || (order.totalAmount - (order.deliveryFee || 0)).toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between text-xs font-bold uppercase text-muted-foreground">
                             <span>Delivery</span>
                             <span className="text-foreground">KES {order.deliveryFee?.toLocaleString() || '0'}</span>
                          </div>
                          <Separator className="my-2" />
                          <div className="flex justify-between items-center">
                             <span className="font-black text-xs uppercase tracking-widest text-foreground">Total</span>
                             <span className="text-2xl font-black text-secondary tracking-tighter leading-none">KES {order.totalAmount?.toLocaleString()}</span>
                          </div>
                       </div>
                    </div>
                 </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <aside className="space-y-8">
           <Card className="border-2 rounded-2xl overflow-hidden shadow-sm bg-primary text-white">
              <CardHeader className="p-6 border-b border-white/10 bg-white/5">
                 <CardTitle className="text-xs font-black uppercase tracking-widest text-secondary flex items-center gap-2">
                   <CreditCard className="h-4 w-4" /> Action Center
                 </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                 {order.orderStatus === "Pending" && (
                   <Button 
                     className="w-full bg-green-500 hover:bg-green-600 text-white font-black uppercase text-[10px] tracking-widest h-14 rounded-xl shadow-lg shadow-green-500/20 gap-3"
                     onClick={() => updateStatus("Processing")}
                     disabled={isUpdating}
                   >
                     <CheckCircle2 className="h-5 w-5" /> Confirm Payment
                   </Button>
                 )}

                 {(order.orderStatus === "Pending" || order.orderStatus === "Processing") && (
                   <Button 
                     className="w-full bg-secondary text-primary hover:bg-white font-black uppercase text-[10px] tracking-widest h-14 rounded-xl shadow-lg shadow-secondary/20 gap-3"
                     onClick={() => updateStatus("Shipped")}
                     disabled={isUpdating}
                   >
                     <Truck className="h-5 w-5" /> Dispatch Kicks
                   </Button>
                 )}

                 {(order.orderStatus === "Pending" || order.orderStatus === "Processing" || order.orderStatus === "Shipped") && (
                   <Button 
                     variant="outline"
                     className="w-full border-2 border-white/30 text-white hover:bg-white/10 font-black uppercase text-[10px] tracking-widest h-14 rounded-xl gap-3 bg-transparent"
                     onClick={() => updateStatus("Delivered")}
                     disabled={isUpdating}
                   >
                     <CheckCircle2 className="h-5 w-5" /> Mark Delivered
                   </Button>
                 )}

                 <Separator className="bg-white/10 my-4" />
                 
                 {(order.orderStatus !== "Delivered" && order.orderStatus !== "Cancelled") && (
                   <Button 
                     variant="ghost"
                     className="w-full text-white/50 hover:text-white hover:bg-destructive font-black uppercase text-[10px] tracking-widest h-14 rounded-xl gap-3"
                     onClick={() => {if(confirm("Confirm Cancellation?")) updateStatus("Cancelled")}}
                     disabled={isUpdating}
                   >
                     <XCircle className="h-5 w-5" /> Void Order
                   </Button>
                 )}

                 {(order.orderStatus === "Delivered" || order.orderStatus === "Cancelled") && (
                   <div className="text-center py-4 space-y-2">
                     <p className="text-[10px] font-black uppercase tracking-widest text-secondary">Workflow Complete</p>
                     <p className="text-[9px] font-bold text-white/40">No further actions required for this order.</p>
                   </div>
                 )}
              </CardContent>
           </Card>

           <div className="p-8 bg-muted/20 border-2 border-dashed rounded-3xl text-center space-y-3">
              <p className="text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground">Status Awareness</p>
              <p className="text-[10px] font-bold text-muted-foreground leading-relaxed">
                Actions are progressive. Completing a step will narrow down the available next steps to keep your focus on fulfillment.
              </p>
           </div>
        </aside>
      </div>

      {/* Timeline Dialog */}
      <Dialog open={timelineOpen} onOpenChange={setTimelineOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-black uppercase tracking-tight">Order Lifecycle</DialogTitle>
            <DialogDescription className="font-bold text-[10px] uppercase text-muted-foreground">Tracking ID: {order.id}</DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh] pr-4">
            <div className="space-y-8 py-4 relative">
              {/* Vertical Line */}
              <div className="absolute left-2.5 top-6 bottom-6 w-0.5 bg-muted" />

              {/* Initial Event: Order Placed */}
              <div className="relative pl-10">
                <div className="absolute left-0 top-1 h-5 w-5 rounded-full bg-secondary border-4 border-white shadow-sm flex items-center justify-center z-10" />
                <div className="space-y-1">
                  <p className="font-black text-sm uppercase">Order Placed</p>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {order.orderedAt?.seconds ? new Date(order.orderedAt.seconds * 1000).toLocaleString('en-KE') : 'Initial Entry'}
                  </p>
                  <p className="text-xs text-muted-foreground font-medium">Customer initiated the order through the digital storefront.</p>
                </div>
              </div>

              {/* Historical Updates */}
              {history.map((entry: any, idx: number) => {
                const date = entry.timestamp?.seconds 
                  ? new Date(entry.timestamp.seconds * 1000).toLocaleString('en-KE')
                  : new Date(entry.timestamp).toLocaleString('en-KE');

                return (
                  <div key={idx} className="relative pl-10 animate-in fade-in slide-in-from-left-2 duration-300">
                    <div className="absolute left-0 top-1 h-5 w-5 rounded-full bg-primary border-4 border-white shadow-sm flex items-center justify-center z-10" />
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="font-black text-sm uppercase">{entry.status}</p>
                        <Badge variant="secondary" className="text-[8px] h-4 uppercase font-black">Admin Update</Badge>
                      </div>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {date}
                      </p>
                      <p className="text-xs text-muted-foreground font-medium">{entry.note}</p>
                    </div>
                  </div>
                );
              })}

              {/* Current Status Highlight if not covered by history yet */}
              {history.length === 0 && order.orderStatus !== "Pending" && (
                <div className="relative pl-10 italic">
                  <div className="absolute left-0 top-1 h-5 w-5 rounded-full bg-primary border-4 border-white shadow-sm z-10" />
                  <p className="text-[10px] font-bold text-muted-foreground uppercase">Syncing current status details...</p>
                </div>
              )}
            </div>
          </ScrollArea>
          <div className="pt-4 border-t-2">
             <div className="bg-secondary/5 p-4 rounded-xl border border-secondary/20 flex items-center gap-3">
                <CircleDot className="h-5 w-5 text-secondary animate-pulse" />
                <div>
                   <p className="text-[10px] font-black uppercase text-secondary">Active Lifecycle</p>
                   <p className="text-[11px] font-bold text-foreground uppercase tracking-tight">Current State: {order.orderStatus}</p>
                </div>
             </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
