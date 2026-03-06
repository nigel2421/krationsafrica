
"use client";

import React, { useState } from "react";
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy } from "firebase/firestore";
import { 
  Users, 
  Search, 
  Mail, 
  Calendar, 
  Shield, 
  User as UserIcon,
  Loader2,
  Phone,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

const ITEMS_PER_PAGE = 15;

export default function AdminCustomers() {
  const db = useFirestore();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const customersQuery = useMemoFirebase(() => query(collection(db, "userProfiles"), orderBy("email", "asc")), [db]);
  const { data: customers, isLoading } = useCollection(customersQuery);

  const filteredCustomers = customers?.filter(c => 
    c.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.email?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  // Pagination Logic
  const totalPages = Math.max(1, Math.ceil(filteredCustomers.length / ITEMS_PER_PAGE));
  const paginatedCustomers = filteredCustomers.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-black uppercase tracking-tighter">Shoppers</h1>
        <p className="text-muted-foreground text-xs font-bold uppercase tracking-widest">Customer relationships & management</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="Search by name or email..." 
          className="pl-10 h-10 border-2" 
          value={searchTerm}
          onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
        />
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block bg-white border-2 rounded-xl overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="text-[10px] uppercase font-black">Customer</TableHead>
              <TableHead className="text-[10px] uppercase font-black">Email</TableHead>
              <TableHead className="text-[10px] uppercase font-black">Role</TableHead>
              <TableHead className="text-[10px] uppercase font-black">Joined</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={4} className="h-32 text-center text-[10px] font-black uppercase">Loading Shoppers...</TableCell></TableRow>
            ) : paginatedCustomers.length > 0 ? paginatedCustomers.map((customer) => (
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
              <TableRow><TableCell colSpan={4} className="h-32 text-center text-[10px] font-black uppercase text-muted-foreground">No customers found</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {isLoading ? (
          <div className="flex justify-center py-10"><Loader2 className="h-8 w-8 animate-spin text-secondary" /></div>
        ) : paginatedCustomers.map((customer) => (
          <div key={customer.id} className="bg-white border-2 rounded-xl p-4 shadow-sm flex items-center gap-4">
            <Avatar className="h-12 w-12 border-2">
              <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${customer.email}`} />
              <AvatarFallback><UserIcon className="h-6 w-6" /></AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start mb-0.5">
                <h3 className="font-black text-sm uppercase truncate">{customer.name || "Guest User"}</h3>
                <Badge className="text-[7px] uppercase font-black h-4 px-1">{customer.role}</Badge>
              </div>
              <p className="text-[10px] text-muted-foreground font-medium truncate mb-2">{customer.email}</p>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1 text-[8px] font-black uppercase text-muted-foreground">
                  <Calendar className="h-2.5 w-2.5" /> Joined {customer.createdAt?.seconds ? new Date(customer.createdAt.seconds * 1000).toLocaleDateString() : "Now"}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination Controls */}
      {filteredCustomers.length > ITEMS_PER_PAGE && (
        <div className="flex items-center justify-between pt-4 border-t-2">
          <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">
            Showing {Math.min(filteredCustomers.length, ITEMS_PER_PAGE * (currentPage - 1) + 1)} - {Math.min(filteredCustomers.length, ITEMS_PER_PAGE * currentPage)} of {filteredCustomers.length}
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
