
"use client";

import React from "react";
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy, limit } from "firebase/firestore";
import { 
  TrendingUp, 
  ShoppingBag, 
  Package, 
  Users, 
  ArrowUpRight, 
  ArrowDownRight,
  Clock,
  Loader2,
  DollarSign
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from "recharts";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function AdminDashboardOverview() {
  const db = useFirestore();

  // Queries
  const productsQuery = useMemoFirebase(() => query(collection(db, "products")), [db]);
  const ordersQuery = useMemoFirebase(() => query(collection(db, "orders"), orderBy("orderedAt", "desc"), limit(5)), [db]);
  const allOrdersQuery = useMemoFirebase(() => query(collection(db, "orders")), [db]);

  const { data: products, isLoading: productsLoading } = useCollection(productsQuery);
  const { data: recentOrders, isLoading: ordersLoading } = useCollection(ordersQuery);
  const { data: allOrders } = useCollection(allOrdersQuery);

  // Derived Stats
  const totalRevenue = allOrders?.reduce((acc, order) => acc + (order.totalAmount || 0), 0) || 0;
  const pendingOrders = allOrders?.filter(o => o.orderStatus === "Pending").length || 0;
  const stockAlerts = products?.filter(p => p.stockStatus === "Few Left" || p.stockStatus === "Out of Stock").length || 0;

  // Dummy Chart Data (Would be real in a more complex setup)
  const chartData = [
    { name: "Mon", revenue: 45000 },
    { name: "Tue", revenue: 52000 },
    { name: "Wed", revenue: 48000 },
    { name: "Thu", revenue: 61000 },
    { name: "Fri", revenue: 55000 },
    { name: "Sat", revenue: 67000 },
    { name: "Sun", revenue: 72000 },
  ];

  const stats = [
    { label: "Total Revenue", value: `KES ${totalRevenue.toLocaleString()}`, icon: DollarSign, trend: "+12.5%", trendUp: true, color: "text-green-500" },
    { label: "Orders to Fulfill", value: pendingOrders.toString(), icon: ShoppingBag, trend: "Pending", trendUp: false, color: "text-secondary" },
    { label: "Total Inventory", value: products?.length.toString() || "0", icon: Package, trend: "Products", trendUp: true, color: "text-primary" },
    { label: "Low Stock Alert", value: stockAlerts.toString(), icon: Clock, trend: "Restock needed", trendUp: false, color: "text-destructive" },
  ];

  if (productsLoading || ordersLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-secondary" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-4xl font-black tracking-tighter uppercase mb-2">Business Overview</h1>
        <p className="text-muted-foreground font-medium">Real-time performance metrics for Kreation 254.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <Card key={i} className="border-2 border-muted/50 hover:border-secondary/50 transition-all shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                {stat.label}
              </CardTitle>
              <stat.icon className={cn("h-5 w-5", stat.color)} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black tracking-tighter">{stat.value}</div>
              <div className="flex items-center gap-1 mt-1">
                <span className={cn("text-[10px] font-black uppercase", stat.trendUp ? "text-green-500" : "text-secondary")}>
                  {stat.trend}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sales Chart */}
        <Card className="lg:col-span-2 border-2 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-black uppercase tracking-tight">Revenue Trends</CardTitle>
            <CardDescription>Daily sales performance for the current week.</CardDescription>
          </CardHeader>
          <CardContent className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3AC8F3" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3AC8F3" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700 }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} 
                  itemStyle={{ fontWeight: 800, color: '#424266' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#3AC8F3" strokeWidth={4} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Recent Orders Table */}
        <Card className="border-2 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg font-black uppercase tracking-tight">Recent Sales</CardTitle>
              <CardDescription>Last 5 orders placed.</CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild className="h-8 text-[10px] font-black uppercase">
              <Link href="/admin/orders">View All</Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {recentOrders?.map((order) => (
                <div key={order.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-secondary/10 flex items-center justify-center">
                      <ShoppingBag className="h-5 w-5 text-secondary" />
                    </div>
                    <div>
                      <p className="text-sm font-black uppercase tracking-tight leading-none mb-1">{order.customerName}</p>
                      <p className="text-[10px] text-muted-foreground font-mono">{order.id.slice(-6).toUpperCase()}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-primary">KES {order.totalAmount?.toLocaleString()}</p>
                    <Badge variant="secondary" className="text-[8px] h-4 px-1 uppercase font-bold">{order.orderStatus}</Badge>
                  </div>
                </div>
              ))}
              {!recentOrders?.length && <p className="text-center text-muted-foreground text-xs py-10 font-bold">No recent orders.</p>}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
