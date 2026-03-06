
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
  ShieldCheck,
  ChevronRight
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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

  // Queries
  const productsQuery = useMemoFirebase(() => query(collection(db, "products")), [db]);
  const recentOrdersQuery = useMemoFirebase(() => query(collection(db, "orders"), orderBy("orderedAt", "desc"), limit(5)), [db]);
  const allOrdersQuery = useMemoFirebase(() => query(collection(db, "orders")), [db]);
  const categoriesQuery = useMemoFirebase(() => query(collection(db, "categories")), [db]);

  const { data: products, isLoading: productsLoading, error: productsError } = useCollection(productsQuery);
  const { data: recentOrders, isLoading: ordersLoading } = useCollection(recentOrdersQuery);
  const { data: allOrders } = useCollection(allOrdersQuery);
  const { data: categories } = useCollection(categoriesQuery);

  // Derived Stats
  const totalRevenue = allOrders?.reduce((acc, order) => acc + (order.totalAmount || 0), 0) || 0;
  const pendingOrders = allOrders?.filter(o => o.orderStatus !== "Delivered" && o.orderStatus !== "Cancelled").length || 0;

  const stats = [
    { label: "Total Revenue", value: `KES ${totalRevenue.toLocaleString()}`, icon: DollarSign, color: "text-green-500", href: "/admin/orders" },
    { label: "Active Orders", value: pendingOrders.toString(), icon: ShoppingBag, color: "text-secondary", href: "/admin/orders" },
    { label: "Inventory", value: products?.length.toString() || "0", icon: Package, color: "text-primary", href: "/admin/products" },
    { label: "Categories", value: categories?.length.toString() || "0", icon: Layers, color: "text-purple-500", href: "/admin/categories" },
  ];

  if (productsLoading || ordersLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-secondary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-black tracking-tighter uppercase leading-none">Business Overview</h1>
        <p className="text-muted-foreground text-xs font-bold uppercase tracking-widest">Real-time performance metrics</p>
      </div>

      {productsError && (
        <Alert variant="destructive" className="border-2">
          <AlertCircle className="h-5 w-5" />
          <AlertTitle className="font-black uppercase text-xs">Connection Error</AlertTitle>
          <AlertDescription className="text-xs">
            Database access restricted. Please check your internet or disable Ad-Blockers.
          </AlertDescription>
        </Alert>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <Link key={i} href={stat.href}>
            <Card className="border-2 border-muted/50 hover:border-secondary/50 transition-all h-full active:scale-95">
              <CardHeader className="flex flex-row items-center justify-between pb-2 p-4">
                <CardTitle className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  {stat.label}
                </CardTitle>
                <stat.icon className={cn("h-4 w-4", stat.color)} />
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="text-xl md:text-2xl font-black tracking-tighter">{stat.value}</div>
                <div className="flex items-center gap-1 mt-1 text-[8px] font-black uppercase text-muted-foreground">
                  Manage <ChevronRight className="h-2 w-2" />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Chart */}
        <Card className="lg:col-span-2 border-2 hidden md:block">
          <CardHeader className="p-4">
            <CardTitle className="text-sm font-black uppercase tracking-tight">Revenue Trends</CardTitle>
          </CardHeader>
          <CardContent className="h-[250px] p-2">
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
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 700 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 700 }} />
                <Tooltip />
                <Area type="monotone" dataKey="revenue" stroke="#3AC8F3" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Recent Orders List */}
        <Card className="border-2">
          <CardHeader className="flex flex-row items-center justify-between p-4">
            <div>
              <CardTitle className="text-sm font-black uppercase tracking-tight">Recent Sales</CardTitle>
            </div>
            <Button variant="outline" size="sm" asChild className="h-7 text-[8px] font-black uppercase">
              <Link href="/admin/orders">View All</Link>
            </Button>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="space-y-4">
              {recentOrders?.map((order) => (
                <Link key={order.id} href={`/admin/orders/${order.id}`} className="flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-secondary/10 flex items-center justify-center group-hover:bg-secondary group-hover:text-white transition-colors">
                      <ShoppingBag className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-[11px] font-black uppercase leading-none mb-1">{order.customerName}</p>
                      <p className="text-[9px] text-muted-foreground font-mono">#{order.id.slice(-4).toUpperCase()}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[11px] font-black text-primary">KES {order.totalAmount?.toLocaleString()}</p>
                    <Badge variant="secondary" className="text-[7px] h-3 px-1 uppercase font-black">{order.orderStatus}</Badge>
                  </div>
                </Link>
              ))}
              {!recentOrders?.length && <p className="text-center text-muted-foreground text-[10px] py-10 font-bold uppercase">No recent activity</p>}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
