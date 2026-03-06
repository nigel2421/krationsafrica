
"use client";

import React, { useState } from "react";
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy } from "firebase/firestore";
import { 
  Users, 
  Search, 
  Mail, 
  Calendar, 
  User as UserIcon,
  Loader2,
  Phone,
  ChevronLeft,
  ChevronRight,
  Download,
  PartyPopper,
  Filter
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

const ITEMS_PER_PAGE = 15;

export default function AdminCustomers() {
  const db = useFirestore();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState("mailing-list");

  // Registered Shoppers (User Accounts)
  const customersQuery = useMemoFirebase(() => query(collection(db, "userProfiles"), orderBy("email", "asc")), [db]);
  const { data: customers, isLoading: isCustomersLoading } = useCollection(customersQuery);

  // Mailing List (Newsletter Subscriptions)
  const subscribersQuery = useMemoFirebase(() => query(collection(db, "newsletterSubscriptions"), orderBy("subscribedAt", "desc")), [db]);
  const { data: subscribers, isLoading: isSubscribersLoading } = useCollection(subscribersQuery);

  const filteredData = activeTab === "accounts" 
    ? (customers?.filter(c => c.name?.toLowerCase().includes(searchTerm.toLowerCase()) || c.email?.toLowerCase().includes(searchTerm.toLowerCase())) || [])
    : (subscribers?.filter(s => s.email?.toLowerCase().includes(searchTerm.toLowerCase()) || s.name?.toLowerCase().includes(searchTerm.toLowerCase()) || s.phone?.includes(searchTerm)) || []);

  // Pagination Logic
  const totalPages = Math.max(1, Math.ceil(filteredData.length / ITEMS_PER_PAGE));
  const paginatedData = filteredData.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const exportMailingListCsv = () => {
    if (!subscribers || subscribers.length === 0) {
      toast({ title: "No data to export", variant: "destructive" });
      return;
    }

    const headers = ["Email", "Name", "Phone", "Source", "Subscribed At"];
    const rows = subscribers.map(s => [
      s.email,
      s.name || "N/A",
      s.phone || "N/A",
      s.source || "direct",
      s.subscribedAt?.seconds ? new Date(s.subscribedAt.seconds * 1000).toISOString() : "Recent"
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(r => r.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `kreations_254_mailing_list_${new Date().toLocaleDateString()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({ title: "CSV Export Successful", description: `Exported ${subscribers.length} contacts.` });
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-black uppercase tracking-tighter">Community</h1>
          <p className="text-muted-foreground text-xs font-bold uppercase tracking-widest">Relationships, Accounts & Outreach</p>
        </div>
        <Button onClick={exportMailingListCsv} disabled={!subscribers?.length} className="h-12 px-6 font-black uppercase tracking-widest bg-secondary text-primary">
          <Download className="mr-2 h-4 w-4" /> Export Mailing List (CSV)
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v); setCurrentPage(1); }} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2 h-12 border-2 bg-muted/20 mb-6">
          <TabsTrigger value="mailing-list" className="font-black text-[10px] uppercase gap-2 data-[state=active]:bg-primary data-[state=active]:text-white">
            <Mail className="h-3 w-3" /> Mailing List ({subscribers?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="accounts" className="font-black text-[10px] uppercase gap-2 data-[state=active]:bg-primary data-[state=active]:text-white">
            <Users className="h-3 w-3" /> User Accounts ({customers?.length || 0})
          </TabsTrigger>
        </TabsList>

        <div className="relative mb-6">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder={activeTab === "accounts" ? "Search by name or email..." : "Search by name, email or phone..."} 
            className="pl-10 h-10 border-2" 
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
          />
        </div>

        <TabsContent value="accounts" className="mt-0">
          <div className="hidden md:block bg-white border-2 rounded-xl overflow-hidden shadow-sm">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="text-[10px] uppercase font-black">Shopper</TableHead>
                  <TableHead className="text-[10px] uppercase font-black">Email</TableHead>
                  <TableHead className="text-[10px] uppercase font-black">Role</TableHead>
                  <TableHead className="text-[10px] uppercase font-black">Joined</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isCustomersLoading ? (
                  <TableRow><TableCell colSpan={4} className="h-32 text-center text-[10px] font-black uppercase">Loading Shoppers...</TableCell></TableRow>
                ) : paginatedData.length > 0 ? (paginatedData as any[]).map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${customer.email}`} />
                          <AvatarFallback><UserIcon className="h-4 w-4" /></AvatarFallback>
                        </Avatar>
                        <span className="font-bold text-sm">{customer.name || "Guest"}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs font-medium text-muted-foreground">{customer.email}</TableCell>
                    <TableCell>
                       <Badge variant={customer.role === "admin" ? "default" : "secondary"} className="text-[9px] uppercase font-black px-2 h-5">
                         {customer.role}
                       </Badge>
                    </TableCell>
                    <TableCell className="text-[10px] text-muted-foreground uppercase font-bold">
                      {customer.createdAt?.seconds ? new Date(customer.createdAt.seconds * 1000).toLocaleDateString() : "Recent"}
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow><TableCell colSpan={4} className="h-32 text-center text-[10px] font-black uppercase text-muted-foreground">No accounts found</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="mailing-list" className="mt-0">
          <div className="bg-white border-2 rounded-xl overflow-hidden shadow-sm">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="text-[10px] uppercase font-black">Contact</TableHead>
                  <TableHead className="text-[10px] uppercase font-black">Phone</TableHead>
                  <TableHead className="text-[10px] uppercase font-black">Source</TableHead>
                  <TableHead className="text-[10px] uppercase font-black">Added</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isSubscribersLoading ? (
                  <TableRow><TableCell colSpan={4} className="h-32 text-center text-[10px] font-black uppercase">Syncing mailing list...</TableCell></TableRow>
                ) : paginatedData.length > 0 ? (paginatedData as any[]).map((sub) => (
                  <TableRow key={sub.id}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-black text-xs uppercase tracking-tight">{sub.name || "Subscriber"}</span>
                        <span className="text-[10px] font-medium text-muted-foreground">{sub.email}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Phone className="h-3 w-3 text-secondary" />
                        <span className="text-xs font-mono font-bold">{sub.phone || "---"}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                       <Badge variant="outline" className="text-[8px] uppercase font-black h-5 border-secondary/50 text-secondary">
                         {sub.source || "direct"}
                       </Badge>
                    </TableCell>
                    <TableCell className="text-[10px] text-muted-foreground uppercase font-bold">
                      {sub.subscribedAt?.seconds ? new Date(sub.subscribedAt.seconds * 1000).toLocaleDateString() : "Recent"}
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow><TableCell colSpan={4} className="h-32 text-center text-[10px] font-black uppercase text-muted-foreground">The mailing list is empty.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>

      {/* Pagination Controls */}
      {filteredData.length > ITEMS_PER_PAGE && (
        <div className="flex items-center justify-between pt-4 border-t-2">
          <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">
            Showing {Math.min(filteredData.length, ITEMS_PER_PAGE * (currentPage - 1) + 1)} - {Math.min(filteredData.length, ITEMS_PER_PAGE * currentPage)} of {filteredData.length}
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
