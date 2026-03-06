"use client";

import React from "react";
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy, limit } from "firebase/firestore";
import { 
  ShoppingBag, 
  Package, 
  Loader2,
  DollarSign,
  Layers,
  AlertCircle,
  ChevronRight,
  TrendingUp,
  Activity
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from "recharts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function AdminDashboardOverview() {
  const db = useFirestore();

  const productsQuery = useMemoFirebase(() => query(collection(db, "products")), [db]);
  const recentOrdersQuery = useMemoFirebase(() => query(collection(db, "orders"), orderBy("orderedAt", "desc"), limit(5)), [db]);
  const allOrdersQuery = useMemoFirebase(() => query(collection(db, "orders")), [db]);
  const categoriesQuery = useMemoFirebase(() => query(collection(db, "categories")), [db]);

  const { data: products, isLoading: productsLoading, error: productsError } = useCollection(productsQuery);
  const { data: recentOrders, isLoading: ordersLoading } = useCollection(recentOrdersQuery);
  const { data: allOrders } = useCollection(allOrdersQuery);
  const { data: categories } = useCollection(categoriesQuery);

  const totalRevenue = allOrders?.reduce((acc, order) => acc + (order.totalAmount || 0), 0) || 0;
  const pendingOrders = allOrders?.filter(o => o.orderStatus !== "Delivered" && o.orderStatus !== "Cancelled").length || 0;

  const stats = [
    { label: "Total Revenue", value: `KES ${totalRevenue.toLocaleString()}`, icon: DollarSign, color: "text-green-500", href: "/admin/orders" },
    { label: "Active Orders", value: pendingOrders.toString(), icon: ShoppingBag, color: "text-secondary", href: "/admin/orders" },
    { label: "Inventory", value: products?.length.toString() || "0", icon: Package, color: "text-blue-500", href: "/admin/products" },
    { label: "Collections", value: categories?.length.toString() || "0", icon: Layers, color: "text-orange-500", href: "/admin/categories" },
  ];

  if (productsLoading || ordersLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-10 w-10 animate-spin text-secondary mx-auto" />
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Fetching business data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase leading-none">Console</h1>
          <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-[0.4em] mt-2">IT WILL ALWAYS LOOK GOOD ON YOU</p>
        </div>
        <div className="flex items-center gap-2 bg-secondary/10 px-4 py-2 rounded-full border border-secondary/20">
           <Activity className="h-4 w-4 text-secondary" />
           <span className="text-[10px] font-black uppercase text-secondary tracking-widest">Market Live</span>
        </div>
      </div>

      {productsError && (
        <Alert variant="destructive" className="border-2 rounded-2xl bg-destructive/5">
          <AlertCircle className="h-5 w-5" />
          <AlertTitle className="font-black uppercase text-xs">Connection Warning</AlertTitle>
          <AlertDescription className="text-xs font-medium">
            We're having trouble reaching the database. If your internet is active, please **disable your Ad-Blocker** for this site.
          </AlertDescription>
        </Alert>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {stats.map((stat, i) => (
          <Link key={i} href={stat.href}>
            <Card className="border-2 border-muted/50 hover:border-secondary transition-all h-full shadow-sm hover:shadow-xl active:scale-[0.98] rounded-2xl group overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-20 transition-opacity">
                <stat.icon className="h-20 w-20" />
              </div>
              <CardHeader className="flex flex-row items-center justify-between pb-2 p-6">
                <CardTitle className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">
                  {stat.label}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 pt-0">
                <div className="text-2xl md:text-3xl font-black tracking-tighter">{stat.value}</div>
                <div className="flex items-center gap-1 mt-2 text-[8px] font-black uppercase text-secondary">
                  Manage Now <ChevronRight className="h-2 w-2" />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sales Chart */}
        <Card className="lg:col-span-2 border-2 rounded-2xl shadow-sm overflow-hidden bg-white">
          <CardHeader className="p-8 border-b bg-muted/5 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-500" /> Revenue Trends
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="h-[300px] p-6">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={[
                { name: "Mon", revenue: totalRevenue * 0.1 },
                { name: "Tue", revenue: totalRevenue * 0.15 },
                { name: "Wed", revenue: totalRevenue * 0.12 },
                { name: "Thu", revenue: totalRevenue * 0.18 },
                { name: "Fri", revenue: totalRevenue * 0.2 },
                { name: "Sat", revenue: totalRevenue * 0.12 },
                { name: "Sun", revenue: totalRevenue * 0.13 },
              ]}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3AC8F3" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3AC8F3" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: '#888' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: '#888' }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontWeight: 900, fontSize: '10px' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#3AC8F3" strokeWidth={4} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Recent Orders List */}
        <Card className="border-2 rounded-2xl shadow-sm overflow-hidden bg-white">
          <CardHeader className="flex flex-row items-center justify-between p-8 border-b bg-muted/5">
            <CardTitle className="text-sm font-black uppercase tracking-widest">Recent Activity</CardTitle>
            <Button variant="outline" size="sm" asChild className="h-8 text-[9px] font-black uppercase tracking-widest rounded-full border-2">
              <Link href="/admin/orders">All Activity</Link>
            </Button>
          </CardHeader>
          <CardContent className="p-8">
            <div className="space-y-6">
              {recentOrders?.map((order) => (
                <Link key={order.id} href={`/admin/orders/${order.id}`} className="flex items-center justify-between group p-2 hover:bg-muted/30 rounded-xl transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-xl bg-secondary/10 flex items-center justify-center group-hover:bg-secondary group-hover:text-white transition-all transform group-hover:rotate-6">
                      <ShoppingBag className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-[12px] font-black uppercase leading-none mb-1">{order.customerName}</p>
                      <p className="text-[10px] text-muted-foreground font-mono font-bold tracking-tight">#{order.id.slice(-6).toUpperCase()}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[12px] font-black text-primary leading-none mb-1">KES {order.totalAmount?.toLocaleString()}</p>
                    <Badge variant="secondary" className="text-[7px] h-4 px-2 uppercase font-black tracking-widest bg-muted/50">{order.orderStatus}</Badge>
                  </div>
                </Link>
              ))}
              {!recentOrders?.length && (
                <div className="text-center py-10 space-y-4">
                  <div className="h-12 w-12 bg-muted rounded-full mx-auto flex items-center justify-center">
                    <ShoppingBag className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground text-[10px] font-black uppercase tracking-widest">No recent transactions</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
